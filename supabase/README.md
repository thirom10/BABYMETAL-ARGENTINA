# Supabase — puesta en marcha

El sitio funciona **sin** Supabase (datos de demostración en memoria, sin login). Si en `.env.local` /
Vercel están `VITE_PUBLIC_SUPABASE_URL` y `VITE_PUBLIC_SUPABASE_ANON_KEY`, pasa a usar datos reales y
compartidos, con login de Google para publicar.

## 1. Base de datos (SQL Editor, en orden)

1. `migrations/0001_init.sql` → Run.
2. `migrations/0002_accounts_socials_openers.sql` → Run (cuentas reales, tope de 3, red social, teloneros).
3. `migrations/0003_real_data_only.sql` → Run (**borra los setlists de ejemplo**, quita sus columnas y suma las
   canciones Algorism y BxMxC al catálogo).

Todos son idempotentes. En una base nueva no hay datos de ejemplo: la comunidad arranca vacía y sólo muestra
setlists publicados por personas reales.

## 2. Authentication

### 2.1 Sesiones anónimas (likes y votos)
Authentication → Sign In / Providers → **Allow anonymous sign-ins** activado.
Dar like o votar no pide cuenta: usa una sesión anónima invisible (1 por persona).

### 2.2 Login con Google (publicar)

**En Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com)):
1. Crear (o elegir) un proyecto.
2. *APIs y servicios → Pantalla de consentimiento de OAuth*: tipo **Externo**, nombre de la app
   (p. ej. "BABYMETAL ARGENTINA"), email de soporte y de contacto. Alcances: los básicos (`email`, `profile`, `openid`).
3. *Credenciales → Crear credenciales → ID de cliente de OAuth → Aplicación web*.
   - **URI de redireccionamiento autorizados:** la *Callback URL* que muestra Supabase en
     Authentication → Sign In / Providers → Google. Tiene esta forma: `https://<project-id>.supabase.co/auth/v1/callback`.
4. Copiar el **Client ID** y el **Client secret**.
5. En la pantalla de consentimiento, **Publicar la app** (pasar de "Pruebas" a "En producción").
   Si queda en "Pruebas", sólo pueden entrar los usuarios de prueba que agregues a mano.

**En Supabase:**
1. Authentication → Sign In / Providers → **Google** → activar → pegar *Client ID* y *Client secret* → Save.
   (El *secret* se guarda **sólo** acá: nunca en el repo, en `.env` ni en Vercel.)
2. Authentication → **URL Configuration**:
   - **Site URL:** la URL de Vercel (p. ej. `https://tu-sitio.vercel.app`).
   - **Redirect URLs:** agregar `https://tu-sitio.vercel.app/**` y `http://localhost:5173/**`.

### 2.3 Variables de entorno
- `VITE_PUBLIC_SUPABASE_URL` = `https://<project-id>.supabase.co`
- `VITE_PUBLIC_SUPABASE_ANON_KEY` = clave **anon / publishable** (nunca la `service_role` / `secret`)
- `VITE_PUBLIC_SITE_URL` = URL pública del sitio

## 3. Reglas del producto (implementadas en el servidor)

- **Publicar exige cuenta real de Google.** Las sesiones anónimas sólo sirven para likes y votos.
- **Máximo 3 setlists por cuenta.** Se puede borrar uno propio para liberar un lugar.
- Cada setlist lleva: nombre (1–48), nickname (1–24), 5–25 canciones sin repetir, hasta **5 teloneros**
  (1–30 caracteres c/u) y, opcionalmente, **red social + usuario** (Instagram, TikTok, X, YouTube, Facebook, Twitch).
- El **email de Google nunca se expone**: sólo se publica el nickname y la red que la persona elija.
- Nickname y red se recuerdan en la tabla `profiles` para precargarlos la próxima vez.

## 4. Cómo está protegido

- Las 7 tablas tienen **RLS activado y ninguna policy**: con la clave pública no se puede leer ni escribir
  nada directamente en ellas.
- El navegador sólo puede llamar a funciones `SECURITY DEFINER` (con `search_path` vacío):

  | Función | Quién | Qué hace |
  |---|---|---|
  | `list_setlists()` | anon y autenticados | Setlists visibles + contadores + tus likes/votos |
  | `people_ranking()` | anon y autenticados | Ranking y posición promedio por canción |
  | `publish_setlist(...)` | sólo cuenta real | Valida y publica (tope de 3) |
  | `my_account()` | autenticados | Nickname, red y cuántos setlists usaste |
  | `delete_setlist(id)` | autenticados | Borra un setlist **propio** |
  | `toggle_reaction(id, kind)` | con sesión | Like / voto (1 por usuario) |
  | `register_copy(id)` | con sesión | Cuenta "usar de base" (1 por usuario) |

- El usuario de la red social se valida (`^[A-Za-z0-9._-]{1,30}$`) en la base **y** en el navegador antes de
  armar el link, que se abre con `rel="noopener noreferrer nofollow ugc"`.
- Moderación: `update public.setlists set hidden = true where id = '...';` oculta un setlist sin borrarlo
  (SQL Editor o Table Editor: sólo vos tenés acceso).

## 5. Mantenimiento

- **Agregar una canción**: en `src/data/songs.ts` **y** en la tabla `songs` (migración nueva con un `insert`).
- **Cambiar el tope de 3**: está en `publish_setlist` y `my_account` (migración nueva) y en
  `MAX_SETLISTS_PER_ACCOUNT` de `src/services/setlistRepository.ts` (sólo para el modo demo).
- **Probar la configuración**: `npm run smoke:supabase` (no publica nada visible; deja un usuario anónimo de prueba).
- **Sin datos inventados**: los contadores (likes, votos, copias) son filas reales; no hay columnas de "base" ni ejemplos.
- **Más protección contra abuso**: CAPTCHA en Auth → Attack Protection (Cloudflare Turnstile).

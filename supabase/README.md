# Supabase — puesta en marcha

El sitio funciona **sin** Supabase (datos de demostración en memoria). Si en `.env.local` están
`VITE_PUBLIC_SUPABASE_URL` y `VITE_PUBLIC_SUPABASE_ANON_KEY`, pasa a usar datos reales y compartidos.

## 1. Configuración en el panel de Supabase (una sola vez)

1. **Authentication → Sign In / Providers → Anonymous sign-ins → activar.**
   Cada visitante recibe una sesión anónima invisible (sólo al publicar, dar like o votar), lo que permite
   un like / voto por persona sin registro.
2. **SQL Editor → New query**, pegar el contenido de `migrations/0001_init.sql` y tocar **Run**.
3. Pegar y ejecutar `seed.sql` (opcional: crea 6 setlists de ejemplo marcados como `EJEMPLO`).
4. Variables en `.env.local` (ver `.env.example`):
   - `VITE_PUBLIC_SUPABASE_URL` = `https://<project-id>.supabase.co`
   - `VITE_PUBLIC_SUPABASE_ANON_KEY` = clave **anon / publishable**
   Nunca uses la `service_role` / `secret`.
5. En el hosting (Vercel) cargar las mismas dos variables en *Project Settings → Environment Variables*.

## 2. Cómo está protegido

- Las 6 tablas tienen **RLS activado y ninguna policy**: con la clave pública no se puede leer ni escribir
  nada directamente en ellas.
- El navegador sólo puede llamar a 5 funciones (`SECURITY DEFINER`, `search_path` vacío):

  | Función | Quién | Qué hace |
  |---|---|---|
  | `list_setlists()` | anon y autenticados | Setlists visibles + contadores + tus likes/votos |
  | `people_ranking()` | anon y autenticados | Ranking y posición promedio por canción |
  | `publish_setlist(name, author, song_ids)` | sólo con sesión | Valida y publica |
  | `toggle_reaction(setlist_id, kind)` | sólo con sesión | Like / voto (1 por usuario) |
  | `register_copy(setlist_id)` | sólo con sesión | Cuenta "usar de base" (1 por usuario) |

- Validaciones en el servidor: nombre 1–48, nickname 1–24, 5–25 canciones, sin repetidas, ids existentes en
  `songs`, sin caracteres de control. Límites: **5 publicaciones por hora y 25 en total por usuario**.
- Moderación: `update public.setlists set hidden = true where id = '...';` oculta un setlist sin borrarlo.
  (Se hace desde el SQL Editor o Table Editor: sólo vos tenés acceso.)

## 3. Mantenimiento

- **Agregar una canción**: agregarla en `src/data/songs.ts` **y** en la tabla `songs` (nueva migración
  `0002_...sql` con un `insert`). Sin eso el servidor rechaza los setlists que la incluyan.
- **Quitar los ejemplos**: `delete from public.setlists where is_demo;`
- **Más protección contra spam**: ver los límites en `publish_setlist`; si hace falta, sumar CAPTCHA
  (Auth → Attack Protection → Cloudflare Turnstile).
- **Regenerar los SQL** si cambia la lista de canciones: los `insert` de `songs` salen de `src/data/songs.ts`.

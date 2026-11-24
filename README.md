# BABYMETAL ARGENTINA — THE COUNTDOWN

Experiencia web creada **por fans** para el concierto de BABYMETAL en Buenos Aires:
**01 de diciembre de 2026 · Movistar Arena · 21:00 hs**.

> **Fan project independiente.** Este sitio no es oficial y no tiene afiliación con BABYMETAL,
> Amuse Inc., Movistar Arena ni ninguna productora. Todos los setlists, votos y rankings son
> **datos de demostración**.

## Qué incluye (etapa 1 — sólo frontend)

| Sección | Qué hace |
|---|---|
| **Countdown** | Hero cinematográfico + cuenta regresiva en vivo a las 21:00 (UTC-3). |
| **Kitsune Radio** | Reproduce videos oficiales de BABYMETAL con la YouTube IFrame Player API (modo privacidad mejorada, se carga recién al dar play). Mini reproductor desplegable con swipe en mobile, panel flotante en desktop. Playlist en `src/data/radio.ts`; ajuste de reproducción minimizada en `src/config/radio.ts`. |
| **El setlist de la gente** | Dos vistas: **Setlist promedio** (primera) y **Ranking**, con dos fuentes reales: los setlists publicados por fans en el sitio y los últimos shows de la gira 2026 (datos de [setlist.fm](https://www.setlist.fm/setlists/babymetal-5bd19f80.html), en `src/data/tourShows.ts`). |
| **Crear mi setlist** | Nickname, nombre, búsqueda, filtros por categoría, agregar / quitar / reordenar (botones + drag & drop en desktop), marcas de apertura (BABYMETAL DEATH) y cierre (ROAD OF RESISTANCE), aviso discreto si se cambian. Mobile: pestañas `CANCIONES` / `MI SETLIST` y barra inferior fija. |
| **Publicación** | Vista previa tipo póster → confirmar → notificación → aparece primero en la comunidad. |
| **Comunidad** | Sólo setlists reales de fans: likes, votos, ver completo, **compartir** (imagen de la card + link para armar el propio), usar de base, borrar los propios. |
| **Wildcard tracks** | Canciones sorpresa deseadas (no confirmadas) con "yo también" y atajo para sumarlas al setlist. |

El estado de la interfaz es local (React `useReducer` + Context). Los datos de la comunidad vienen de `setlistRepository`:

- **Con Supabase configurado** (variables `VITE_PUBLIC_SUPABASE_*`): datos reales y compartidos. **Publicar requiere cuenta de Google** (máx. 3 setlists por cuenta, con nickname, red social opcional y teloneros); likes y votos usan una sesión anónima. Guía en [`supabase/README.md`](supabase/README.md).
- **Sin configurar**: datos de demostración en memoria (nada persiste).

## Requisitos

- Node.js 24 (ver `.nvmrc`)
- npm 11+

## Uso

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build de producción en dist/
npm run preview    # sirve dist/ localmente
```

## Estructura

```
├── index.html               # metadatos, fuentes, preload del hero
├── public/
│   ├── favicon.svg
│   └── images/              # WebP optimizados (generados, versionados)
├── scripts/
│   ├── image-sources.json   # slug → archivo original en Wikimedia Commons + tamaños
│   └── optimize-images.mjs  # assets-src/*.jpg → public/images/*.webp
├── src/
│   ├── App.tsx              # composición de secciones
│   ├── main.tsx
│   ├── components/          # un componente + su CSS por archivo
│   ├── config/
│   │   ├── env.ts           # ÚNICO punto de lectura de variables públicas
│   │   └── event.ts         # fecha, venue, secciones, ids de apertura/cierre
│   ├── data/                # datos mock: canciones, comunidad, radio, ranking, créditos
│   ├── hooks/               # countdown, media query, sección activa
│   ├── lib/format.ts        # utilidades de formato / saneo de texto
│   ├── services/
│   │   └── setlistRepository.ts  # frontera de datos (hoy mock, mañana Supabase)
│   ├── state/               # store global (setlists, toasts) y estado de la radio
│   └── styles/base.css      # tokens de diseño, reset, botones, chips
├── .env.example             # plantilla de variables (sin valores reales)
├── AGENTS.md                # guía para continuar el desarrollo con Codex
├── CREDITS.md               # créditos y licencias de las fotos
└── SECURITY.md
```

## Variables de entorno

Copiá la plantilla y completala **sólo localmente**:

```bash
cp .env.example .env.local
```

- Vite expone al navegador **únicamente** las variables con prefijo `VITE_PUBLIC_` (`envPrefix` en `vite.config.ts`).
  Todo lo que lleve ese prefijo es público.
- Los secretos (por ejemplo `SUPABASE_SERVICE_ROLE_KEY`) **nunca** llevan ese prefijo ni se usan en el frontend:
  van en el entorno protegido correspondiente (Edge Functions, panel del hosting, secretos de CI).
- `.env`, `.env.local` y cualquier `.env.*` (excepto `.env.example`) están en `.gitignore`.

Hoy el sitio funciona sin ninguna variable configurada.

## Imágenes

Las fotos son de [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Babymetal) con licencias
CC BY / CC BY-SA. Los créditos son obligatorios y se muestran en el footer ("Créditos de fotografías") y en
[`CREDITS.md`](CREDITS.md). Si agregás o cambiás una foto, actualizá `scripts/image-sources.json`,
`src/data/images.ts` y `src/data/credits.ts`.

Para regenerar los WebP: descargá los originales a `assets-src/<slug>.jpg` (carpeta ignorada por git) y corré
`npm run images`.

## Despliegue en Vercel

1. En [vercel.com](https://vercel.com) -> **Add New -> Project** -> importar `thirom10/BABYMETAL-ARGENTINA`.
2. Framework: **Vite** (se detecta solo). `vercel.json` ya define build, carpeta de salida, cabeceras y caché.
3. **Environment Variables** (Production y Preview):
   - `VITE_PUBLIC_SUPABASE_URL` = `https://<project-id>.supabase.co`
   - `VITE_PUBLIC_SUPABASE_ANON_KEY` = clave anon / publishable (nunca la `secret` / `service_role`)
4. **Deploy**. Con la URL que asigne Vercel, agregar `VITE_PUBLIC_SITE_URL` y volver a desplegar
   (Vite incrusta las variables al compilar: cambiarlas requiere un nuevo deploy).
5. Cada push a `main` publica solo; las ramas y PRs generan URLs de vista previa.

### Cabeceras de seguridad (`vercel.json`)

Activas: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS.
La **Content-Security-Policy está en modo `Report-Only`**: no bloquea nada, sólo avisa en la consola del navegador.
Cuando el sitio esté publicado, abrirlo con las DevTools (F12 -> Console), usar la radio, publicar y dar like:
si no aparece ningún mensaje `[Report Only] Refused to ...`, cambiar la clave a `Content-Security-Policy` para que se aplique.

## Supabase

Integración lista. Pasos de puesta en marcha, modelo de seguridad y mantenimiento: [`supabase/README.md`](supabase/README.md).

Pendiente a futuro: login opcional (magic link / Google), CAPTCHA, panel de moderación.

## Licencia del contenido

Código: a definir por el autor del repositorio. Fotos: según la licencia de cada archivo (ver `CREDITS.md`).
BABYMETAL y los nombres de canciones pertenecen a sus respectivos titulares.

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
| **The People's Setlist** | Ranking de canciones más elegidas (votos, %, barras) + "setlist promedio" ordenado por la posición promedio que eligen los fans. Se recalcula al publicar. |
| **Crear mi setlist** | Nickname, nombre, búsqueda, filtros por categoría, agregar / quitar / reordenar (botones + drag & drop en desktop), marcas de apertura (BABYMETAL DEATH) y cierre (ROAD OF RESISTANCE), aviso discreto si se cambian. Mobile: pestañas `CANCIONES` / `MI SETLIST` y barra inferior fija. |
| **Publicación** | Vista previa tipo póster → confirmar → notificación → aparece primero en la comunidad. |
| **Comunidad** | Sólo setlists de fans: likes, votos, ver completo, "usar de base", orden por populares / recientes / votados. |
| **Wildcard tracks** | Canciones sorpresa deseadas (no confirmadas) con "yo también" y atajo para sumarlas al setlist. |

Todo el estado es local (React `useReducer` + Context). No hay backend, cuentas ni persistencia.

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

## Próximos pasos (etapa 2, con Codex + Supabase)

Ver [`AGENTS.md`](AGENTS.md). Resumen:

1. Implementar `SetlistRepository` con Supabase (tabla `setlists`, `likes`, `votes`) con **RLS activado**.
2. Reemplazar `setlistRepository` en `src/services/setlistRepository.ts`; la UI no necesita cambios grandes.
3. Calcular "The People's Setlist" en el backend (vista o función) en lugar de `src/data/peoples.ts`.
4. Autenticación opcional (magic link / OAuth) para likes y votos únicos.

## Licencia del contenido

Código: a definir por el autor del repositorio. Fotos: según la licencia de cada archivo (ver `CREDITS.md`).
BABYMETAL y los nombres de canciones pertenecen a sus respectivos titulares.

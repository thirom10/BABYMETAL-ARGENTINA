# AGENTS.md — guía para agentes (Codex, Claude, etc.)

Proyecto: **BABYMETAL ARGENTINA — THE COUNTDOWN**. Sitio de fans (no oficial) para el show del
01/12/2026 en Movistar Arena. Repositorio **público**.

## Stack

- Vite 8 + React 19 + TypeScript (strict). Sin framework de UI: CSS plano por componente.
- Estado: `useReducer` + Context (`src/state/store.tsx`, `src/state/radio.tsx`).
- Sin backend en la etapa 1. Todo dato es mock (`src/data/*`).

## Comandos

```bash
npm install
npm run dev
npm run build      # incluye `tsc -b`; debe pasar sin errores antes de commitear
```

## Reglas de seguridad (obligatorias)

1. Nunca commitear `.env` reales ni credenciales. Sólo `.env.example` con valores vacíos.
2. Variables del navegador: sólo con prefijo `VITE_PUBLIC_` y leídas desde `src/config/env.ts`.
   Nada de `import.meta.env` disperso en componentes.
3. Nunca usar `service_role` ni secretos en el frontend. Operaciones privilegiadas → Edge Functions.
4. Supabase: RLS activado en **todas** las tablas antes de exponer la anon key.
5. No usar `dangerouslySetInnerHTML` con contenido de usuarios. Sanear texto con `cleanText` (`src/lib/format.ts`).
6. No inventar credenciales de ejemplo con formato realista.

## Convenciones

- Mobile-first. Breakpoint principal de escritorio: `min-width: 960px` (`DESKTOP_QUERY`).
- Tokens de diseño en `src/styles/base.css` (`--c-*`, `--f-*`). Paleta: `#09090D`, `#E32636`, `#74111E`.
- Un componente = `Componente.tsx` + `Componente.css` en `src/components/`.
- `base.css` se importa antes que `App` en `main.tsx` para que los estilos de componentes ganen.
- Textos de UI en español rioplatense. Mantener visibles los avisos "FAN PROJECT" y "datos de demostración".
- Apertura/cierre habituales: `OPENER_ID` / `CLOSER_ID` en `src/config/event.ts`. Nunca bloquear al usuario
  por cambiarlos; sólo mostrar un aviso discreto.
- No inventar títulos de canciones. La biblioteca está en `src/data/songs.ts` (categorías = curaduría de fans).
- Fotos: sólo con licencia libre y crédito en `src/data/credits.ts` + `CREDITS.md`.

## Supabase (integrado)

- Esquema y funciones: `supabase/migrations/0001_init.sql`; ejemplos: `supabase/seed.sql`; guía: `supabase/README.md`.
- Las tablas tienen RLS **sin policies**; el navegador sólo llama funciones `SECURITY DEFINER` (ver README de supabase).
  Cualquier cambio nuevo: nueva migración numerada, RLS activado, `revoke` + `grant execute` explícitos.
- La UI sólo habla con `setlistRepository` (`src/services/setlistRepository.ts`), asíncrono, con implementación
  mock (sin env) y Supabase (con env). Errores normalizados en `src/services/errors.ts`.
- Sesión anónima perezosa (`ensureSession` en `src/lib/supabase.ts`): sólo al escribir, nunca al navegar.
- Si agregás canciones, hay que agregarlas también a la tabla `songs` (migración nueva).

## Checklist de QA antes de terminar una tarea

- `npm run build` sin errores.
- Revisar 320 px, 375 px, 430 px, 768 px y 1440 px: sin scroll horizontal, nada tapado por la radio.
- Probar el creador en mobile (pestañas, barra inferior, reordenar, publicar).

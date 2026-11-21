# Seguridad

Este repositorio es público.

## Reportar un problema

Si encontrás una credencial expuesta o una vulnerabilidad, **no abras un issue público**.
Usá la opción *Report a vulnerability* (GitHub Security Advisories) del repositorio o contactá
de forma privada al mantenedor.

## Prácticas del proyecto

- Ningún secreto vive en el código ni en el historial de git. `.env*` está ignorado (salvo `.env.example`).
- Sólo las variables `VITE_PUBLIC_*` llegan al navegador; se consideran públicas.
- Claves privilegiadas (p. ej. `service_role` de Supabase) sólo en entornos protegidos del servidor.
- Si alguna vez se commitea un secreto por error: **revocarlo/rotarlo de inmediato** en el proveedor;
  borrarlo del historial no alcanza porque el repo ya pudo haber sido clonado.

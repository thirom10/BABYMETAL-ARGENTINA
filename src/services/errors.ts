/**
 * Errors raised by the data layer. `code` is stable and UI-friendly; the
 * Supabase functions raise these same codes as the exception message
 * (see supabase/migrations/0001_init.sql).
 */
export type RepositoryErrorCode =
  | 'NOT_AUTHENTICATED'
  | 'LOGIN_REQUIRED'
  | 'AUTH_FAILED'
  | 'INVALID_OPENERS'
  | 'INVALID_SOCIAL'
  | 'INVALID_NAME'
  | 'INVALID_AUTHOR'
  | 'INVALID_SONGS'
  | 'UNKNOWN_SONG'
  | 'RATE_LIMIT'
  | 'LIMIT_TOTAL'
  | 'NOT_FOUND'
  | 'NETWORK'
  | 'UNKNOWN';

export class RepositoryError extends Error {
  readonly code: RepositoryErrorCode;
  constructor(code: RepositoryErrorCode, detail?: string) {
    super(detail ?? code);
    this.name = 'RepositoryError';
    this.code = code;
  }
}

const KNOWN: RepositoryErrorCode[] = [
  'NOT_AUTHENTICATED',
  'LOGIN_REQUIRED',
  'INVALID_OPENERS',
  'INVALID_SOCIAL',
  'INVALID_NAME',
  'INVALID_AUTHOR',
  'INVALID_SONGS',
  'UNKNOWN_SONG',
  'RATE_LIMIT',
  'LIMIT_TOTAL',
  'NOT_FOUND',
];

/** Converts a Supabase/PostgREST error (or anything thrown) into a RepositoryError. */
export function toRepositoryError(e: unknown): RepositoryError {
  if (e instanceof RepositoryError) return e;
  const message = typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e);
  const hit = KNOWN.find((c) => message.includes(c));
  if (hit) return new RepositoryError(hit, message);
  if (/failed to fetch|network|load failed/i.test(message)) return new RepositoryError('NETWORK', message);
  return new RepositoryError('UNKNOWN', message);
}

const MESSAGES: Record<RepositoryErrorCode, string> = {
  NOT_AUTHENTICATED: 'No pudimos identificarte. Recargá la página e intentá de nuevo.',
  LOGIN_REQUIRED: 'Para publicar necesitás iniciar sesión con Google.',
  AUTH_FAILED: 'No pudimos iniciar tu sesión. Probá de nuevo en un rato.',
  INVALID_OPENERS: 'Los teloneros no son válidos (hasta 5, de máximo 30 caracteres cada uno).',
  INVALID_SOCIAL: 'La red social no es válida: elegí la red y escribí tu usuario (letras, números, punto, guion).',
  INVALID_NAME: 'El nombre del setlist no es válido (1 a 48 caracteres).',
  INVALID_AUTHOR: 'El nickname no es válido (1 a 24 caracteres).',
  INVALID_SONGS: 'Un setlist necesita entre 5 y 25 canciones sin repetir.',
  UNKNOWN_SONG: 'Hay una canción que no existe en la biblioteca.',
  RATE_LIMIT: 'Publicaste muchos setlists seguidos. Esperá un rato y probá de nuevo.',
  LIMIT_TOTAL: 'Llegaste al máximo de 3 setlists por cuenta. Borrá uno tuyo para publicar otro.',
  NOT_FOUND: 'Ese setlist ya no está disponible.',
  NETWORK: 'No hay conexión con el servidor. Revisá tu internet.',
  UNKNOWN: 'Algo salió mal. Probá de nuevo en un momento.',
};

export function friendlyError(e: unknown): string {
  return MESSAGES[toRepositoryError(e).code];
}

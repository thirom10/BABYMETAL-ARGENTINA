/**
 * Kitsune Radio settings.
 *
 * YouTube's Required Minimum Functionality asks for a visible player of at
 * least 200x200 px and forbids audio-only playback with a hidden player:
 * https://developers.google.com/youtube/terms/required-minimum-functionality
 *
 * The expanded radio (mobile sheet / desktop panel) always shows the video at
 * that size. When minimized, the video stays visible but small.
 *
 * - 'small': keep playing with the small visible video (default).
 * - 'pause': pause automatically when the radio is minimized (strict mode).
 */
export const MINIMIZED_PLAYBACK: 'small' | 'pause' = 'small';

/** YouTube privacy-enhanced host (no cookies until the visitor plays). */
export const YOUTUBE_HOST = 'https://www.youtube-nocookie.com';

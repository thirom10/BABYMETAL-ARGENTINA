const PATHS = {
  play: 'M8 5.5v13l11-6.5z',
  pause: 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z',
  prev: 'M6 6h2v12H6zm3.5 6L18 18V6z',
  next: 'M16 6h2v12h-2zM6 18l8.5-6L6 6z',
  plus: 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z',
  check: 'M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6L20.1 8.4 18.7 7z',
  close: 'M18.3 7.1 16.9 5.7 12 10.6 7.1 5.7 5.7 7.1l4.9 4.9-4.9 4.9 1.4 1.4 4.9-4.9 4.9 4.9 1.4-1.4-4.9-4.9z',
  up: 'M12 7.5 5.5 14l1.4 1.4L12 10.3l5.1 5.1 1.4-1.4z',
  down: 'M12 16.5 18.5 10l-1.4-1.4L12 13.7 6.9 8.6 5.5 10z',
  trash: 'M9 3h6l1 2h4v2H4V5h4zm-3 6h12l-1 12H7z',
  heart: 'M12 20.5 10.6 19C5.6 14.6 2.5 11.8 2.5 8.3 2.5 5.6 4.6 3.5 7.3 3.5c1.5 0 3 .7 4 1.9a5.3 5.3 0 0 1 4-1.9c2.7 0 4.8 2.1 4.8 4.8 0 3.5-3.1 6.3-8.1 10.8z',
  vote: 'M12 4 4 13h5v7h6v-7h5z',
  copy: 'M8 3h11v13h-2V5H8zM5 7h10v14H5z',
  eye: 'M12 5C6.5 5 2.7 9.4 1.5 12c1.2 2.6 5 7 10.5 7s9.3-4.4 10.5-7C21.3 9.4 17.5 5 12 5m0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8',
  search: 'M10 3a7 7 0 0 1 5.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1 1 10 3m0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10',
  menu: 'M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z',
  volume: 'M4 9v6h4l5 5V4L8 9zm12.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4',
  mute: 'M4 9v6h4l5 5V4L8 9zm12.6 3 2.7-2.7-1.4-1.4-2.7 2.7-2.7-2.7-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4z',
  list: 'M3 5h13v2H3zm0 6h13v2H3zm0 6h9v2H3zm15-5v5.3A2.5 2.5 0 1 0 20 20v-6h2v-2z',
  grip: 'M8 5h3v3H8zm5 0h3v3h-3zM8 10.5h3v3H8zm5 0h3v3h-3zM8 16h3v3H8zm5 0h3v3h-3z',
  reset: 'M12 4a8 8 0 1 1-7.7 10h2.1A6 6 0 1 0 12 6v3L7.5 5 12 1z',
  chevronUp: 'M12 8l-7 7 1.4 1.4L12 10.8l5.6 5.6L19 15z',
  chevronDown: 'M12 16l7-7-1.4-1.4L12 13.2 6.4 7.6 5 9z',
  spark: 'M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}

/**
 * Opening act for the Buenos Aires show.
 * Channel and videos verified on youtube.com on 2026-11-25. Songs are her three most-viewed
 * ORIGINAL official videos on her channel (covers excluded); view counts change, so none are shown.
 */
export interface OpeningSong {
  title: string;
  videoId: string;
}

export const OPENING_ACT = {
  name: 'Daniela Milagros',
  tagline: 'Artista pop rock argentina',
  channelUrl: 'https://www.youtube.com/@danielamilagros',
  channelHandle: '@danielamilagros',
  songs: [
    { title: 'Mi Verdad', videoId: '6Ti7HLLPKVA' },
    { title: 'Solitaria', videoId: 'cM8nn0ORP0E' },
    { title: 'Oyes', videoId: 'DhnRLV1tjy8' },
  ] as OpeningSong[],
} as const;

export const openingSongUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;

import { useCallback, useEffect, useRef, useState } from 'react';
import { renderSetlistCard, shareMessage, siteLink, type ShareCardData } from '../lib/shareCard';

export type ShareResult = 'shared' | 'cancelled' | 'fallback';

interface Prepared {
  status: 'preparing' | 'ready' | 'error';
  file?: File;
  previewUrl?: string;
}

function fileNameFor(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `setlist-${slug || 'babymetal'}.png`;
}

/**
 * Prepares the share image as soon as it is mounted (so the share button can call
 * navigator.share right inside the tap — browsers require a fresh user gesture)
 * and exposes the ways of sharing it.
 *
 * `key` identifies the setlist: the image is rebuilt when it changes.
 */
export function useShareCard(data: ShareCardData, key: string) {
  const [prep, setPrep] = useState<Prepared>({ status: 'preparing' });
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    let alive = true;
    let url: string | undefined;
    setPrep({ status: 'preparing' });
    renderSetlistCard(dataRef.current)
      .then((blob) => {
        if (!alive) return;
        url = URL.createObjectURL(blob);
        setPrep({ status: 'ready', previewUrl: url, file: new File([blob], fileNameFor(dataRef.current.name), { type: 'image/png' }) });
      })
      .catch((e) => {
        console.warn('[share] no se pudo generar la imagen:', e);
        if (alive) setPrep({ status: 'error' });
      });
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [key]);

  /** Opens the system share sheet with the image + text. 'fallback' = not supported here. */
  const share = useCallback(async (): Promise<ShareResult> => {
    const file = prep.file;
    if (file && typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
      try {
        // The link goes inside `text`: many apps drop `url` when a file is attached.
        await navigator.share({ files: [file], title: dataRef.current.name, text: shareMessage(dataRef.current.name) });
        return 'shared';
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled';
        return 'fallback';
      }
    }
    return 'fallback';
  }, [prep.file]);

  const download = useCallback(() => {
    if (!prep.file || !prep.previewUrl) return;
    const a = document.createElement('a');
    a.href = prep.previewUrl;
    a.download = prep.file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [prep.file, prep.previewUrl]);

  const copyLink = useCallback(async (): Promise<boolean> => {
    const text = siteLink();
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
      } catch {
        return false;
      }
    }
  }, []);

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage(data.name))}`;

  return { status: prep.status, previewUrl: prep.previewUrl, share, download, copyLink, whatsappUrl };
}

export type ShareCard = ReturnType<typeof useShareCard>;

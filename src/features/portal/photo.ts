import { safeUrl } from './model';

// A Drive sharing page is HTML. Use its public image thumbnail instead.
export function photoSource(value: string): string {
  const safe = safeUrl(value);
  if (!safe) return '';
  const url = new URL(safe);
  if (url.hostname !== 'drive.google.com') return safe;
  const id = url.pathname.match(/^\/file\/d\/([a-zA-Z0-9_-]+)(?:\/|$)/)?.[1] ||
    (/^\/(?:open|uc|thumbnail)\/?$/.test(url.pathname) ? url.searchParams.get('id') : '');
  if (!id || !/^[a-zA-Z0-9_-]{10,}$/.test(id)) return '';
  const image = new URL('https://drive.google.com/thumbnail');
  image.searchParams.set('id', id);
  image.searchParams.set('sz', 'w1200');
  const resourceKey = url.searchParams.get('resourcekey');
  if (resourceKey) image.searchParams.set('resourcekey', resourceKey);
  return image.href;
}

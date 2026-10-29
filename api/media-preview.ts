import type { IncomingMessage, ServerResponse } from 'node:http';

function sharedPhotoUrl(value: string): URL {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.port) throw new Error('Invalid URL');
  const allowed = (url.hostname === 'photos.app.goo.gl' && /^\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname)) ||
    (url.hostname === 'photos.google.com' && /^\/share\/[a-zA-Z0-9_-]+(?:\/|$)/.test(url.pathname));
  if (!allowed) throw new Error('Use a public Google Photos sharing link');
  return url;
}

function decodeAttribute(value: string): string {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); res.statusCode = 405; res.end(JSON.stringify({ error: 'Method not allowed' })); return; }
  const value = new URL(req.url || '/', 'https://local.invalid').searchParams.get('url') || '';
  let target: URL;
  try { if (value.length > 2000) throw new Error(); target = sharedPhotoUrl(value); }
  catch { res.statusCode = 400; res.end(JSON.stringify({ error: 'Gunakan tautan berbagi Google Foto yang valid.' })); return; }
  try {
    const signal = AbortSignal.timeout(8000);
    let response: Response | undefined;
    // Revalidate every redirect so the endpoint cannot fetch arbitrary hosts.
    for (let hop = 0; hop < 5; hop++) {
      response = await fetch(target, { redirect: 'manual', signal, headers: { Accept: 'text/html' } });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get('location');
      await response.body?.cancel();
      if (!location) throw new Error('Missing redirect');
      target = sharedPhotoUrl(new URL(location, target).href);
      response = undefined;
    }
    if (!response?.ok || !response.headers.get('content-type')?.includes('text/html') || !response.body) throw new Error('Not public');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let html = ''; let bytes = 0;
    try {
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        bytes += chunk.byteLength;
        if (bytes > 3 * 1024 * 1024) throw new Error('Page too large');
        html += decoder.decode(chunk, { stream: true });
        if (/<\/head>/i.test(html)) break;
      }
    } finally { await reader.cancel(); }
    let imageUrl = '';
    for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
      const attrs = Object.fromEntries(Array.from(tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g), m => [m[1].toLowerCase(), decodeAttribute(m[3])]));
      if (attrs.property !== 'og:image' && attrs.name !== 'og:image') continue;
      const image = new URL(attrs.content || '');
      if (image.protocol === 'https:' && !image.username && !image.password && !image.port && /^lh\d+\.googleusercontent\.com$/.test(image.hostname)) imageUrl = image.href;
    }
    if (!imageUrl) throw new Error('No public photo preview');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
    res.end(JSON.stringify({ imageUrl }));
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    res.statusCode = 422;
    res.end(JSON.stringify({ error: 'Pratinjau Google Foto belum tersedia. Pastikan berbagi link aktif.' }));
  }
}

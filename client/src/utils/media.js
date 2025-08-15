// src/utils/media.js
export function toYouTubeEmbed(raw) {
  if (!raw) return null;
  try {
    const u = new URL(raw.trim());

    const host = u.hostname.replace(/^www\./, '');
    const params = u.searchParams;
    const getStartSeconds = (t) => {
      if (!t) return null;
      if (/^\d+$/.test(t)) return t;               // "90"
      const m = /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/.exec(t); // "1m30s", "2h"
      if (!m) return null;
      const h = parseInt(m[1] || '0', 10);
      const mnt = parseInt(m[2] || '0', 10);
      const s = parseInt(m[3] || '0', 10);
      return String(h * 3600 + mnt * 60 + s);
    };

    // Playlist
    if (host.endsWith('youtube.com') && (u.pathname === '/playlist' || params.get('list'))) {
      const list = params.get('list');
      if (list) return `https://www.youtube.com/embed/videoseries?list=${list}&modestbranding=1&rel=0`;
    }

    // Video ID extraction
    let id = null;
    if (host === 'youtu.be') {
      id = u.pathname.slice(1);
    } else if (host.endsWith('youtube.com')) {
      if (u.pathname === '/watch') id = params.get('v');
      else if (u.pathname.startsWith('/shorts/')) id = u.pathname.split('/')[2];
      else if (u.pathname.startsWith('/live/')) id = u.pathname.split('/')[2];
      else if (u.pathname.startsWith('/embed/')) return raw; // already embed
    }

    if (!id) return null;

    const qs = new URLSearchParams();
    qs.set('modestbranding', '1');
    qs.set('rel', '0');
    const start = getStartSeconds(params.get('t') || params.get('start'));
    if (start) qs.set('start', start);

    return `https://www.youtube.com/embed/${id}?${qs.toString()}`;
  } catch {
    return null;
  }
}
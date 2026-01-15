// Simple helper to convert a normal YouTube URL into an embed URL.
// Examples:
// - https://www.youtube.com/watch?v=dQw4w9WgXcQ -> https://www.youtube.com/embed/dQw4w9WgXcQ
// - https://youtu.be/dQw4w9WgXcQ -> https://www.youtube.com/embed/dQw4w9WgXcQ
// - https://www.youtube.com/embed/dQw4w9WgXcQ -> unchanged
export function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    let id = '';
    if (u.hostname === 'youtu.be') {
      id = u.pathname.replace(/^\//, '');
    } else if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) id = v;
      else if (u.pathname.startsWith('/embed/')) {
        id = u.pathname.replace('/embed/', '');
      }
    }
    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch {
    return url;
  }
}

// Variant that prefers privacy-enhanced domain
export function toNoCookieEmbed(url: string, origin?: string): string {
  try {
    const u = new URL(url);
    let id = '';
    if (u.hostname === 'youtu.be') {
      id = u.pathname.replace(/^\//, '');
    } else if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) id = v;
      else if (u.pathname.startsWith('/embed/')) {
        id = u.pathname.replace('/embed/', '');
      }
    }
    const base = id ? `https://www.youtube-nocookie.com/embed/${id}` : url;
    const qp = origin ? `?origin=${origin}&cc_load_policy=1&rel=0&modestbranding=1` : `?cc_load_policy=1&rel=0&modestbranding=1`;
    return id ? `${base}${qp}` : url;
  } catch {
    return url;
  }
}

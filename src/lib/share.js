// A shared list lives entirely inside the link (the part after #), so no server is needed.
// Format before encoding:  1 \n <list name> \n m550w,t1396d,...   (m=movie t=show, w/p/d = status)
export const MAX_SHARE_ITEMS = 150;
const STATUS_CODE = { want: 'w', watching: 'p', watched: 'd' };
const CODE_STATUS = { w: 'want', p: 'watching', d: 'watched' };

const toB64Url = (str) => {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromB64Url = (s) => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

export function encodeShare({ name, items }) {
  const clean = String(name || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 40);
  const entries = items
    .slice(0, MAX_SHARE_ITEMS)
    .map((i) => `${i.type === 'tv' ? 't' : 'm'}${i.id}${STATUS_CODE[i.status] || 'w'}`)
    .join(',');
  return toB64Url(`1\n${clean}\n${entries}`);
}

export function decodeShare(hash) {
  try {
    const m = /(?:^#?|&)d=([A-Za-z0-9_-]+)/.exec(hash || '');
    if (!m) return null;
    const [version, name = '', entries = ''] = fromB64Url(m[1]).split('\n');
    if (version !== '1') return null;
    const items = [];
    const seen = new Set();
    entries.split(',').forEach((token) => {
      const e = /^([mt])(\d{1,9})([wpd])$/.exec(token);
      if (!e) return;
      const type = e[1] === 't' ? 'tv' : 'movie';
      const key = `${type}-${e[2]}`;
      if (seen.has(key) || items.length >= 300) return;
      seen.add(key);
      items.push({ key, type, id: Number(e[2]), status: CODE_STATUS[e[3]] });
    });
    if (!items.length) return null;
    return { name: name.slice(0, 40), items };
  } catch (e) {
    return null;
  }
}

export function buildShareUrl(payload) {
  return `${window.location.origin}/share#d=${encodeShare(payload)}`;
}

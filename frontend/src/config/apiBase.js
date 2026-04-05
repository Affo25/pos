/**
 * Backend base URL for API calls. Set REACT_APP_API_URL in frontend/.env and on Vercel.
 * Must be your Node API host (e.g. Railway *.up.railway.app), not the React app’s *.vercel.app URL.
 * Use the origin only (no `/api`); if you include `/api`, it is stripped so paths are not `/api/api/...`.
 *
 * If this resolves to a relative URL (e.g. `/api`), axios hits the CRA dev server and you get
 * HTML "Cannot POST /api/users/login" instead of your Railway API.
 */
const DEFAULT_ORIGIN = 'http://localhost:5000';

function normalizeApiOrigin(raw) {
  let s = String(raw ?? '')
    .trim()
    .replace(/\/+$/, '');

  if (/\/api$/i.test(s)) {
    s = s.replace(/\/api$/i, '');
  }

  if (!s) {
    return DEFAULT_ORIGIN;
  }

  // Relative paths like "/api" or "api" would make API_BASE relative → requests go to :3000, not Railway
  if (s.startsWith('/')) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(
        '[apiBase] REACT_APP_API_URL must be a full URL (https://your-api.up.railway.app). Using',
        DEFAULT_ORIGIN,
      );
    }
    return DEFAULT_ORIGIN;
  }

  if (!/^https?:\/\//i.test(s)) {
    if (/^localhost(:\d+)?$/i.test(s) || /^\d+\.\d+\.\d+\.\d+(:\d+)?$/i.test(s)) {
      s = `http://${s}`;
    } else {
      s = `https://${s}`;
    }
  }

  // Railway (and most hosts) serve HTTPS. POST + http:// often hits a 301/302 redirect; the follow-up
  // request can become GET, so /api/users/login returns 404 (only POST is registered). Force https off localhost.
  try {
    const u = new URL(s);
    const local =
      u.hostname === 'localhost' ||
      u.hostname === '127.0.0.1' ||
      /^192\.168\.\d+\.\d+$/.test(u.hostname) ||
      /^10\.\d+\.\d+\.\d+$/.test(u.hostname);
    if (!local && u.protocol === 'http:') {
      u.protocol = 'https:';
      s = u.origin;
    }
  } catch {
    /* keep s */
  }

  return s;
}

export const API_ORIGIN = normalizeApiOrigin(process.env.REACT_APP_API_URL);
export const API_BASE = `${API_ORIGIN}/api`;

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.info('[Aid+] API origin:', API_ORIGIN, '→ requests like', `${API_BASE}/users/login`);
}

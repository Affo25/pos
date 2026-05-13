/**
 * Backend base URL for API calls. Set REACT_APP_API_URL in frontend/.env and on Vercel.
 * Must be your Node API host (e.g. Railway *.up.railway.app), not the React app’s *.vercel.app URL.
 * Use the origin only (no `/api`); if you include `/api`, it is stripped so paths are not `/api/api/...`.
 *
 * Development (frontend → API):
 * - `localhost` / `127.0.0.1:5000` here means where your **Express API** runs on your machine, not MongoDB.
 * - MongoDB Atlas is configured only in the **backend** `.env` (`MONGO_URI` / `MONGODB_URI` / `DATABASE_URL`).
 * - Default in dev: **direct** calls to `http://localhost:5000/api` (no proxy). Backend CORS must allow your
 *   dev origin (`origin: true` in this project). Set `REACT_APP_API_URL` to your API if it is not on :5000.
 * - Optional: `REACT_APP_API_URL=proxy` uses relative `/api` and CRACO `devServer.proxy` (see customize-cra-config.js).
 *
 * Production: REACT_APP_API_URL must be your real API origin. If it points at the React host, responses
 * will be HTML (index.html) and JSON parsing will fail with "Unexpected token '<'".
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

/** Relative `/api` + devServer proxy — opt-in only (`REACT_APP_API_URL=proxy`). Default is direct API URL (CORS). */
function useDevRelativeApi() {
  if (process.env.NODE_ENV !== 'development') return false;
  const raw = process.env.REACT_APP_API_URL;
  return String(raw ?? '').trim().toLowerCase() === 'proxy';
}

function resolveApiEndpoints() {
  if (useDevRelativeApi()) {
    return { API_ORIGIN: '', API_BASE: '/api' };
  }
  const origin = normalizeApiOrigin(process.env.REACT_APP_API_URL);
  return { API_ORIGIN: origin, API_BASE: `${origin}/api` };
}

const _ep = resolveApiEndpoints();
export const API_ORIGIN = _ep.API_ORIGIN;
export const API_BASE = _ep.API_BASE;

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.info(
    '[Aid+] API:',
    API_BASE === '/api'
      ? 'relative /api (CRACO devServer.proxy → backend)'
      : `${API_BASE} (origin ${API_ORIGIN})`,
  );
}

/**
 * Parse fetch Response as JSON; if the body is HTML (wrong host / SPA fallback), throw a clear error.
 */
export async function responseJson(res) {
  const text = await res.text();
  const t = text.trim();
  if (!t) return {};
  if (t.startsWith('<')) {
    const hint =
      process.env.NODE_ENV === 'development'
        ? ' Default dev API is http://127.0.0.1:5000 (direct, CORS). Start the backend locally, or set REACT_APP_API_URL to your deployed API (e.g. https://xxx.up.railway.app). If you prefer a dev proxy, set REACT_APP_API_URL=proxy and restart npm start.'
        : ' Set REACT_APP_API_URL on your host to your Node API only (e.g. https://xxx.up.railway.app), not your React site URL. Rebuild the frontend after changing env.';
    throw new Error(`Received HTML instead of JSON (HTTP ${res.status}).${hint}`);
  }
  try {
    return JSON.parse(t);
  } catch (e) {
    throw new Error((t.slice(0, 280) || e.message).trim());
  }
}

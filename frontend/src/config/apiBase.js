/**
 * Backend base URL for API calls. Set REACT_APP_API_URL in frontend/.env
 * Example: https://pos-backend-production-xxxx.up.railway.app (no trailing slash)
 */
const raw = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export const API_ORIGIN = raw.replace(/\/$/, '');
export const API_BASE = `${API_ORIGIN}/api`;

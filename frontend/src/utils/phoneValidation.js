/** International phone: +923247890891 */
export const PHONE_E164_REGEX = /^\+[1-9]\d{7,14}$/;

/** Pakistan mobile: +92 + 10 digits (3XX XXXXXXX) */
export const PK_PHONE_E164_REGEX = /^\+923\d{9}$/;

export const PK_PHONE_DEFAULT_NATIONAL = '3247890891';
export const PK_PHONE_DEFAULT_E164 = `+92${PK_PHONE_DEFAULT_NATIONAL}`;

/** National digits only (no +92), for inputs with a fixed +92 prefix. */
export function toPkNationalPart(value) {
  const n = normalizePhone(value);
  if (!n) return '';
  if (n.startsWith('+92')) return n.slice(3);
  if (n.startsWith('92') && n.length > 2) return n.slice(2);
  return String(value || '').replace(/\D/g, '').slice(0, 10);
}

export function fromPkNationalDigits(digits) {
  const d = String(digits || '').replace(/\D/g, '').slice(0, 10);
  if (!d) return '';
  return `+92${d}`;
}

export function normalizePhone(value) {
  if (value == null || value === '') return '';
  let s = String(value).trim().replace(/[\s\-().]/g, '');
  if (!s) return '';
  if (!s.startsWith('+')) {
    s = s.startsWith('00') ? `+${s.slice(2)}` : `+${s}`;
  }
  return s;
}

export function isValidPhone(value) {
  const normalized = normalizePhone(value);
  if (!normalized) return true;
  return PHONE_E164_REGEX.test(normalized);
}

export const phoneFormRules = [
  {
    validator: (_, value) => {
      if (!value || !String(value).trim()) return Promise.resolve();
      const n = normalizePhone(value);
      if (!PHONE_E164_REGEX.test(n)) {
        return Promise.reject(new Error('Use international format, e.g. +923247890891'));
      }
      return Promise.resolve();
    },
  },
];

export const pkPhoneFormRules = [
  {
    validator: (_, value) => {
      if (!value || !String(value).trim()) return Promise.resolve();
      const n = normalizePhone(value);
      if (!PK_PHONE_E164_REGEX.test(n)) {
        return Promise.reject(new Error('Enter 10 digits after +92, e.g. 3247890891'));
      }
      return Promise.resolve();
    },
  },
];

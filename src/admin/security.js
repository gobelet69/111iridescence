const CSRF_COOKIE = 'iri_admin_csrf';
const ADMIN_PATH = '/admin';

export function issueCsrfToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function buildCsrfCookie(token) {
  return `${CSRF_COOKIE}=${token}; Path=${ADMIN_PATH}; HttpOnly; Secure; SameSite=Strict`;
}

export function readCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  for (const part of cookie.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=') || null;
  }
  return null;
}

export function readCsrfToken(request) {
  return readCookie(request, CSRF_COOKIE);
}

function constantTimeEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string' || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export function verifyAdminMutation(request, body) {
  const origin = request.headers.get('Origin');
  if (origin !== new URL(request.url).origin) return false;
  const cookieToken = readCsrfToken(request);
  const headerToken = request.headers.get('X-Iridescence-CSRF');
  if (!constantTimeEqual(cookieToken, headerToken)) return false;
  return typeof body?.baseSha === 'string' && /^[a-f0-9]{40}$/i.test(body.baseSha);
}

export function noStoreResponse(body, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('Cache-Control', 'no-store');
  return new Response(body, { ...init, headers });
}

function getCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  for (const part of cookie.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=') || null;
  }
  return null;
}

export const SESSION_COOKIE_NAME = '__Secure-iri_session';

export async function getAuthIdentity(request, env) {
  const sessionId = getCookie(request, SESSION_COOKIE_NAME);
  if (!sessionId) return null;

  const session = await env.AUTH_DB.prepare(
    'SELECT id, username, role FROM sessions WHERE id = ? AND expires > ?',
  )
    .bind(sessionId, Date.now())
    .first();
  if (!session) return null;

  const user = await env.AUTH_DB.prepare('SELECT username, role FROM users WHERE username = ?')
    .bind(session.username)
    .first();
  if (!user) return null;

  if (session.role !== user.role) {
    await env.AUTH_DB.prepare('UPDATE sessions SET role = ? WHERE id = ?')
      .bind(user.role, session.id)
      .run();
  }

  return {
    sessionId: session.id,
    username: user.username,
    role: user.role || 'viewer',
  };
}

export function isPrivilegedRole(role) {
  const normalized = `${role || ''}`.toLowerCase();
  return normalized === 'admin' || normalized === 'owner';
}

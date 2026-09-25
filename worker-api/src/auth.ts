export interface AccessEnv {
  PAYMENTS_DB?: D1Database;
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  OWNER_EMAILS?: string;
}

export interface StaffIdentity {
  email: string;
  name: string;
  role: 'owner' | 'staff';
}

interface AccessPayload {
  aud?: string | string[];
  email?: string;
  name?: string;
  iss?: string;
  exp?: number;
  nbf?: number;
}

interface JwkSet {
  keys?: AccessJwk[];
}

type AccessJwk = JsonWebKey & { kid?: string };

const keyCache = new Map<string, { expiresAt: number; keys: AccessJwk[] }>();

const decodeBase64Url = (value: string): Uint8Array => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const decoded = atob(padded);
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
};

const decodeJson = <T>(value: string): T =>
  JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as T;

const normalizedTeamDomain = (value: string) => {
  const trimmed = value.trim().replace(/\/$/, '');
  return trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`;
};

async function accessKeys(teamDomain: string): Promise<AccessJwk[]> {
  const cached = keyCache.get(teamDomain);
  if (cached && cached.expiresAt > Date.now()) return cached.keys;
  const response = await fetch(`${teamDomain}/cdn-cgi/access/certs`, { signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error('Access signing keys are unavailable.');
  const body = (await response.json()) as JwkSet;
  const keys = body.keys ?? [];
  keyCache.set(teamDomain, { expiresAt: Date.now() + 60 * 60 * 1000, keys });
  return keys;
}

async function verifyAccessJwt(token: string, teamDomain: string, audience: string): Promise<AccessPayload> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid Access token.');
  const header = decodeJson<{ alg?: string; kid?: string }>(parts[0]);
  if (header.alg !== 'RS256' || !header.kid) throw new Error('Unsupported Access token.');
  const keys = await accessKeys(teamDomain);
  const jwk = keys.find((candidate) => candidate.kid === header.kid);
  if (!jwk) {
    keyCache.delete(teamDomain);
    const refreshed = await accessKeys(teamDomain);
    const retry = refreshed.find((candidate) => candidate.kid === header.kid);
    if (!retry) throw new Error('Access signing key not found.');
    return verifyWithKey(parts, retry, teamDomain, audience);
  }
  return verifyWithKey(parts, jwk, teamDomain, audience);
}

async function verifyWithKey(parts: string[], jwk: JsonWebKey, teamDomain: string, audience: string): Promise<AccessPayload> {
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const verified = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    decodeBase64Url(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
  );
  if (!verified) throw new Error('Access signature verification failed.');
  const payload = decodeJson<AccessPayload>(parts[1]);
  const audiences = Array.isArray(payload.aud) ? payload.aud : payload.aud ? [payload.aud] : [];
  const now = Math.floor(Date.now() / 1000);
  if (payload.iss !== teamDomain || !audiences.includes(audience)) throw new Error('Access token scope is invalid.');
  if (!payload.exp || payload.exp <= now || (payload.nbf && payload.nbf > now + 30)) throw new Error('Access token has expired.');
  if (!payload.email) throw new Error('Access identity has no email.');
  return payload;
}

export async function requireStaff(request: Request, env: AccessEnv): Promise<StaffIdentity> {
  if (!env.PAYMENTS_DB) throw new Error('Reservation database is not configured.');
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) throw new Error('Staff authentication is not configured.');
  const token = request.headers.get('Cf-Access-Jwt-Assertion')?.trim() ?? '';
  if (!token) throw new Error('Staff sign-in is required.');
  const teamDomain = normalizedTeamDomain(env.ACCESS_TEAM_DOMAIN);
  const payload = await verifyAccessJwt(token, teamDomain, env.ACCESS_AUD.trim());
  const email = payload.email!.trim().toLowerCase();
  const owners = (env.OWNER_EMAILS ?? '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
  const member = await env.PAYMENTS_DB.prepare(
    'SELECT email, display_name, role, active FROM staff_members WHERE email = ?',
  ).bind(email).first<{ email: string; display_name: string | null; role: 'owner' | 'staff'; active: number }>();
  if (member && member.active) return { email, name: member.display_name || payload.name || email, role: member.role };
  if (owners.includes(email)) return { email, name: payload.name || email, role: 'owner' };
  throw new Error('This account is not an active staff member.');
}

export const staffErrorStatus = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'Staff access denied.';
  if (message.includes('not configured')) return 503;
  if (message.includes('not an active')) return 403;
  return 401;
};

import { StaffIdentity } from './auth';

type Json = (body: unknown, status: number) => Response;

export interface MediaEnv {
  PAYMENTS_DB?: D1Database;
  MEDIA_BUCKET?: R2Bucket;
}

interface MediaAssetRow {
  id: string;
  object_key: string;
  original_name: string;
  title: string;
  alt_text: string;
  category: string;
  mime_type: string;
  byte_size: number;
  width: number | null;
  height: number | null;
  checksum_sha256: string;
  status: 'draft' | 'published' | 'archived';
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const CATEGORY_VALUES = new Set([
  'diving', 'snorkeling', 'fishing', 'boating', 'mainland', 'dining',
  'nature', 'courses', 'transfers', 'general',
]);
const STATUS_VALUES = new Set(['draft', 'published', 'archived']);

const text = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const integer = (value: unknown, min: number, max: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : null;
};
const nowIso = () => new Date().toISOString();

const database = (env: MediaEnv) => {
  if (!env.PAYMENTS_DB) throw new Error('Media database is not configured.');
  return env.PAYMENTS_DB;
};

const bucket = (env: MediaEnv) => {
  if (!env.MEDIA_BUCKET) throw new Error('Media storage is not configured.');
  return env.MEDIA_BUCKET;
};

const slugify = (value: string) => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 72) || 'action-divers-photo';

const sha256Hex = async (buffer: ArrayBuffer) => {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', buffer));
  return [...digest].map((value) => value.toString(16).padStart(2, '0')).join('');
};

const detectedImage = async (file: File): Promise<{ mime: string; extension: string } | null> => {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: 'image/jpeg', extension: 'jpg' };
  }
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) {
    return { mime: 'image/png', extension: 'png' };
  }
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') {
    return { mime: 'image/webp', extension: 'webp' };
  }
  return null;
};

const mediaDatabaseError = (error: unknown) => {
  const message = error instanceof Error ? error.message : '';
  return message.includes('no such table') ? 'Media storage needs its database migration.' : 'Media storage is unavailable.';
};

const eventStatement = (
  db: D1Database,
  assetId: string,
  actor: string,
  eventType: string,
  before: unknown,
  after: unknown,
  timestamp: string,
) => db.prepare(`INSERT INTO media_asset_events
  (asset_id, actor, event_type, before_json, after_json, created_at)
  VALUES (?, ?, ?, ?, ?, ?)`)
  .bind(assetId, actor, eventType, before ? JSON.stringify(before) : null, after ? JSON.stringify(after) : null, timestamp);

async function listMedia(request: Request, env: MediaEnv, json: Json) {
  const db = database(env);
  const url = new URL(request.url);
  const query = text(url.searchParams.get('q'), 100);
  const category = text(url.searchParams.get('category'), 40);
  const status = text(url.searchParams.get('status'), 20);
  const cursor = text(url.searchParams.get('cursor'), 180);
  const conditions = ['deleted_at IS NULL'];
  const values: unknown[] = [];
  if (query) {
    conditions.push('(title LIKE ? OR alt_text LIKE ? OR original_name LIKE ?)');
    const like = `%${query}%`;
    values.push(like, like, like);
  }
  if (category && CATEGORY_VALUES.has(category)) { conditions.push('category = ?'); values.push(category); }
  if (status && STATUS_VALUES.has(status)) { conditions.push('status = ?'); values.push(status); }
  const cursorParts = cursor.split('|');
  if (cursorParts.length === 2 && cursorParts[0] && cursorParts[1]) {
    conditions.push('(created_at < ? OR (created_at = ? AND id < ?))');
    values.push(cursorParts[0], cursorParts[0], cursorParts[1]);
  }
  const rows = await db.prepare(`SELECT * FROM media_assets
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at DESC, id DESC LIMIT 25`)
    .bind(...values).all<MediaAssetRow>();
  const page = rows.results.slice(0, 24);
  const last = page[page.length - 1];
  return json({
    ok: true,
    media: page,
    nextCursor: rows.results.length > 24 && last ? `${last.created_at}|${last.id}` : null,
  }, 200);
}

async function uploadMedia(request: Request, env: MediaEnv, staff: StaffIdentity, json: Json) {
  const declaredLength = Number(request.headers.get('Content-Length') ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_IMAGE_BYTES + 64 * 1024) {
    return json({ ok: false, error: 'Images must be 10 MB or smaller.' }, 413);
  }
  let form: FormData;
  try { form = await request.formData(); } catch { return json({ ok: false, error: 'Upload form is invalid.' }, 400); }
  const candidate = form.get('file');
  if (!(candidate instanceof File)) return json({ ok: false, error: 'Choose an image to upload.' }, 422);
  if (candidate.size < 1 || candidate.size > MAX_IMAGE_BYTES) return json({ ok: false, error: 'Images must be 10 MB or smaller.' }, 413);
  const detected = await detectedImage(candidate);
  if (!detected) return json({ ok: false, error: 'Upload a genuine JPEG, PNG, or WebP image.' }, 422);
  const title = text(form.get('title'), 120);
  const altText = text(form.get('altText'), 240);
  const category = text(form.get('category'), 40).toLowerCase();
  if (!title || !altText || !CATEGORY_VALUES.has(category)) {
    return json({ ok: false, error: 'Title, descriptive alt text, and a valid category are required.' }, 422);
  }
  const width = integer(form.get('width'), 1, 30_000);
  const height = integer(form.get('height'), 1, 30_000);
  const contents = await candidate.arrayBuffer();
  const checksum = await sha256Hex(contents);
  const db = database(env);
  const duplicate = await db.prepare('SELECT id, title FROM media_assets WHERE checksum_sha256 = ? AND deleted_at IS NULL')
    .bind(checksum).first<{ id: string; title: string }>();
  if (duplicate) return json({ ok: false, error: `This image is already stored as “${duplicate.title}”.`, duplicateId: duplicate.id }, 409);

  const id = crypto.randomUUID();
  const timestamp = nowIso();
  const date = new Date(timestamp);
  const key = `media/${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${slugify(title)}-${id.slice(0, 8)}.${detected.extension}`;
  const storage = bucket(env);
  await storage.put(key, contents, {
    httpMetadata: {
      contentType: detected.mime,
      cacheControl: 'public, max-age=31536000, immutable',
      contentDisposition: 'inline',
    },
    customMetadata: { assetId: id },
  });
  const asset = {
    id, object_key: key, original_name: text(candidate.name, 200) || `upload.${detected.extension}`,
    title, alt_text: altText, category, mime_type: detected.mime, byte_size: candidate.size,
    width, height, checksum_sha256: checksum, status: 'draft' as const,
    created_by: staff.email, updated_by: staff.email, created_at: timestamp, updated_at: timestamp, deleted_at: null,
  };
  try {
    await db.batch([
      db.prepare(`INSERT INTO media_assets
        (id, object_key, original_name, title, alt_text, category, mime_type, byte_size, width, height,
         checksum_sha256, status, created_by, updated_by, created_at, updated_at, deleted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`)
        .bind(id, key, asset.original_name, title, altText, category, detected.mime, candidate.size, width, height, checksum, 'draft', staff.email, staff.email, timestamp, timestamp),
      eventStatement(db, id, staff.email, 'media_uploaded', null, asset, timestamp),
    ]);
  } catch (error) {
    await storage.delete(key).catch(() => undefined);
    throw error;
  }
  return json({ ok: true, asset }, 201);
}

async function updateMedia(request: Request, env: MediaEnv, staff: StaffIdentity, assetId: string, json: Json) {
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return json({ ok: false, error: 'Invalid request.' }, 400); }
  const db = database(env);
  const current = await db.prepare('SELECT * FROM media_assets WHERE id = ?').bind(assetId).first<MediaAssetRow>();
  if (!current) return json({ ok: false, error: 'Media asset not found.' }, 404);
  const title = text(body.title, 120);
  const altText = text(body.altText, 240);
  const category = text(body.category, 40).toLowerCase();
  const status = text(body.status, 20);
  if (!title || !altText || !CATEGORY_VALUES.has(category) || !STATUS_VALUES.has(status)) {
    return json({ ok: false, error: 'Title, alt text, category, and status are required.' }, 422);
  }
  const timestamp = nowIso();
  const next = { ...current, title, alt_text: altText, category, status, updated_by: staff.email, updated_at: timestamp, deleted_at: status === 'archived' ? current.deleted_at ?? timestamp : null };
  await db.batch([
    db.prepare(`UPDATE media_assets SET title = ?, alt_text = ?, category = ?, status = ?, updated_by = ?, updated_at = ?, deleted_at = ? WHERE id = ?`)
      .bind(title, altText, category, status, staff.email, timestamp, next.deleted_at, assetId),
    eventStatement(db, assetId, staff.email, 'media_updated', current, next, timestamp),
  ]);
  return json({ ok: true, asset: next }, 200);
}

async function archiveMedia(env: MediaEnv, staff: StaffIdentity, assetId: string, json: Json) {
  const db = database(env);
  const current = await db.prepare('SELECT * FROM media_assets WHERE id = ? AND deleted_at IS NULL').bind(assetId).first<MediaAssetRow>();
  if (!current) return json({ ok: false, error: 'Media asset not found.' }, 404);
  const timestamp = nowIso();
  const next = { ...current, status: 'archived', updated_by: staff.email, updated_at: timestamp, deleted_at: timestamp };
  await db.batch([
    db.prepare("UPDATE media_assets SET status = 'archived', updated_by = ?, updated_at = ?, deleted_at = ? WHERE id = ?")
      .bind(staff.email, timestamp, timestamp, assetId),
    eventStatement(db, assetId, staff.email, 'media_archived', current, next, timestamp),
  ]);
  return json({ ok: true }, 200);
}

async function mediaContent(request: Request, env: MediaEnv, assetId: string, json: Json) {
  const row = await database(env).prepare('SELECT object_key FROM media_assets WHERE id = ? AND deleted_at IS NULL')
    .bind(assetId).first<{ object_key: string }>();
  if (!row) return json({ ok: false, error: 'Media asset not found.' }, 404);
  const object = await bucket(env).get(row.object_key);
  if (!object) return json({ ok: false, error: 'Stored media object is missing.' }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('ETag', object.httpEtag);
  headers.set('Cache-Control', 'private, max-age=300');
  const origin = request.headers.get('Origin');
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Vary', 'Origin');
  }
  return new Response(object.body, { headers });
}

export async function handleAdminMedia(
  request: Request,
  env: MediaEnv,
  staff: StaffIdentity,
  json: Json,
  assetId?: string,
  action?: string,
): Promise<Response> {
  try {
    if (request.method === 'GET' && !assetId) return listMedia(request, env, json);
    if (request.method === 'POST' && !assetId) return uploadMedia(request, env, staff, json);
    if (request.method === 'GET' && assetId && action === 'content') return mediaContent(request, env, assetId, json);
    if (request.method === 'PATCH' && assetId && !action) return updateMedia(request, env, staff, assetId, json);
    if (request.method === 'DELETE' && assetId && !action) return archiveMedia(env, staff, assetId, json);
    return json({ ok: false, error: 'Method not allowed.' }, 405);
  } catch (error) {
    console.error('Media operation failed', error);
    const message = error instanceof Error && error.message.includes('not configured') ? error.message : mediaDatabaseError(error);
    return json({ ok: false, error: message }, 503);
  }
}

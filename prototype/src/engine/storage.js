// Where the case is kept (decided 2 October 2026, B02; built the same day, and
// reworked the same day after review). Two backends behind one small interface: the
// browser's local storage, and the private area of the signed-in person's claude.ai
// account, reached through the artifact's database. The engine and the views see one
// store (store.js) and never which backend holds the case.
//
// The artifact's capabilities are reached only through window.claude.use(name),
// which resolves later, never during the script's first run, and to null when the
// capability is not there. window.claude is absent when the prototype runs locally
// through index.html. Every read and write of local storage is wrapped in try/catch:
// it can throw or come back empty, and the page renders without it.

const KEY = 'systems-process.case.v1';

// ---------------------------------------------------------------------------
// The browser
//
// Two kinds of slot. The browser-only slot (KEY) holds the case of whoever uses the
// page here without an account: locally, signed out, or outside the organisation. A
// signed-in person's copy sits in a slot of that person's own, named by the account
// id, so that on a shared computer nobody sees, and nothing writes over, another
// person's copy: the page never opens a person's slot before the account has said
// who is here. Beside each own slot a small record says what the copy is: base, the
// stamp of the account's case the copy descends from (null when the copy has never
// been read from or written to the account), and pending, true while the copy holds
// a change the account has not confirmed.

const ownKey = (id) => `${KEY}.user.${id}`;
const syncKey = (id) => `${ownKey(id)}.sync`;
const get = (k) => { try { const raw = window.localStorage.getItem(k); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } };
const put = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
const drop = (k) => { try { window.localStorage.removeItem(k); } catch (e) { /* no storage, or nothing there */ } };

export const browser = {
  // The browser-only slot, or the own slot of the person whose account id is given.
  read(id = null) { return get(id ? ownKey(id) : KEY); },
  // True when the copy was written.
  write(s, id = null) { return put(id ? ownKey(id) : KEY, s); },
  remove(id = null) { drop(id ? ownKey(id) : KEY); if (id) drop(syncKey(id)); },
  readSync(id) {
    const r = get(syncKey(id));
    return r && typeof r === 'object' ? { base: r.base || null, pending: !!r.pending } : { base: null, pending: false };
  },
  writeSync(id, r) { return put(syncKey(id), { base: r.base || null, pending: !!r.pending }); },
};

// ---------------------------------------------------------------------------
// The account: the artifact's database, under data/users/<id>/

// A document may hold 256 KiB serialised. The case is written as text in parts
// that stay under this, with the envelope's few bytes on top, so a photograph of
// the first drawing, or any large field, never pushes one document over the limit.
const PART_BYTES = 192 * 1024;
// A string this long or longer (a photograph as a data URL, wherever it sits: a
// value, a pending revision, or the log) goes into documents of its own, so that a
// keystroke elsewhere in the case does not rewrite it.
const BLOB_MIN = 8 * 1024;
// A torn read (a document the head names is missing, because a newer head has been
// written meanwhile) is read again after this pause, up to READ_ATTEMPTS times.
const TORN_WAIT = 1500;
const READ_ATTEMPTS = 4;

// Slices text so that each slice, serialised as a JSON string in UTF-8, stays under
// PART_BYTES. A surrogate pair is never split.
function slices(text) {
  const out = [];
  let start = 0;
  let bytes = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    let n;
    if (c < 0x20) n = 6;
    else if (c < 0x80) n = c === 0x22 || c === 0x5c ? 2 : 1;
    else if (c < 0x800) n = 2;
    else if (c >= 0xd800 && c <= 0xdbff) n = 4;
    else if (c >= 0xdc00 && c <= 0xdfff) n = 0;
    else n = 3;
    if (bytes + n > PART_BYTES && i > start) { out.push(text.slice(start, i)); start = i; bytes = 0; }
    bytes += n;
  }
  out.push(text.slice(start));
  return out;
}

// Pulls every long string out of the case, leaving a marker in its place.
function extract(x, blobs) {
  if (typeof x === 'string') {
    if (x.length < BLOB_MIN) return x;
    blobs.push(x);
    return { $blob: blobs.length - 1 };
  }
  if (Array.isArray(x)) return x.map((v) => extract(v, blobs));
  if (x && typeof x === 'object') {
    const o = {};
    for (const k of Object.keys(x)) o[k] = extract(x[k], blobs);
    return o;
  }
  return x;
}

function restore(x, blobs) {
  if (Array.isArray(x)) return x.map((v) => restore(v, blobs));
  if (x && typeof x === 'object') {
    const keys = Object.keys(x);
    if (keys.length === 1 && keys[0] === '$blob' && typeof x.$blob === 'number') return blobs[x.$blob];
    const o = {};
    for (const k of keys) o[k] = restore(x[k], blobs);
    return o;
  }
  return x;
}

const stamp = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// The layout under data/users/<id>/ (each a four-segment document path):
//   case                       the head: { version, stamp, updated, parts, blobs }
//   case-part-<stamp>-<k>      the case as JSON text, long strings taken out, in slices
//   case-blob-<stamp>-<i>-<k>  the i-th long string, in slices
// Every part and blob document is { text }, and once written is never written again.
// The head names the documents the case is made of: parts, a list of names, and
// blobs, a list of lists of names. A write puts the new documents first and the head
// last, then deletes the documents the new head no longer names, so a write that is
// cut short leaves the previous head with every document the previous head names.
// A reader with a head therefore finds every document the head names, and a missing
// document means a newer head has been written meanwhile (a torn read): the reader
// reads the head again. A document whose text has not changed keeps its name and is
// not written again, so a keystroke never rewrites a photograph.
export function databaseBackend(db, id) {
  const base = `data/users/${id}`;
  const ref = (name) => db.doc(`${base}/${name}`);
  let written = {}; // name -> text: the documents the account's head names, as last read or written here
  const own = new Set(); // stamps this page wrote
  let lastJson = null;
  let lastStamp = null;

  const namesOf = (head) => [...(Array.isArray(head.parts) ? head.parts : []), ...(Array.isArray(head.blobs) ? head.blobs : []).flat()];

  // The case a head describes, with the head's stamp, or null when a document the
  // head names is missing.
  async function assemble(head) {
    const list = namesOf(head);
    const snaps = await Promise.all(list.map((n) => ref(n).get()));
    const docs = {};
    for (let i = 0; i < list.length; i++) {
      const d = snaps[i] && snaps[i].exists ? snaps[i].data() : null;
      if (!d || typeof d.text !== 'string') return null;
      docs[list[i]] = d.text;
    }
    let body;
    try { body = JSON.parse((head.parts || []).map((n) => docs[n]).join('')); } catch (e) { body = null; }
    if (!body) return null;
    const blobs = (head.blobs || []).map((ns) => ns.map((n) => docs[n]).join(''));
    written = docs;
    const c = restore(body, blobs);
    lastJson = JSON.stringify(c);
    lastStamp = head.stamp || null;
    return { stamp: lastStamp, case: c };
  }

  const api = {
    id,
    // The case held in the account, as { stamp, case }, or null when the area is
    // empty. Rejects with { code: 'torn' } when the documents could not be read whole
    // after READ_ATTEMPTS attempts.
    async read() {
      for (let attempt = 1; ; attempt++) {
        const snap = await ref('case').get();
        if (!snap.exists) return null;
        const got = await assemble(snap.data() || {});
        if (got) return got;
        if (attempt >= READ_ATTEMPTS) throw { code: 'torn', message: 'a document the head names is missing' };
        await wait(TORN_WAIT);
      }
    },
    // Writes the case, only when it changed, and resolves to the stamp of the head
    // that describes the case now. One write at a time per document.
    async write(s) {
      const json = JSON.stringify(s);
      if (json === lastJson) return lastStamp;
      const st = stamp();
      const blobs = [];
      const body = extract(s, blobs);
      const have = new Map(Object.entries(written).map(([n, t]) => [t, n]));
      const docs = {};
      const name = (text, fresh) => { const n = have.get(text) || fresh; docs[n] = text; return n; };
      const parts = slices(JSON.stringify(body)).map((t, k) => name(t, `case-part-${st}-${k}`));
      const blobNames = blobs.map((b, i) => slices(b).map((t, k) => name(t, `case-blob-${st}-${i}-${k}`)));
      for (const [n, text] of Object.entries(docs)) {
        if (n in written) continue;
        await ref(n).set({ text });
      }
      own.add(st);
      await ref('case').set({ version: 1, stamp: st, updated: new Date().toISOString(), parts, blobs: blobNames });
      const stale = Object.keys(written).filter((n) => !(n in docs));
      written = docs;
      lastJson = json;
      lastStamp = st;
      for (const n of stale) { try { await ref(n).delete(); } catch (e) { /* a document the head no longer names */ } }
      return st;
    },
    // A change made elsewhere (another device, another tab), as { stamp, case }. The
    // head is subscribed once; this page's own writes are known by their stamps and
    // not read back.
    subscribe(onChange, onError) {
      return ref('case').onSnapshot((snap) => {
        if (!snap.exists) return;
        const head = snap.data();
        if (!head || own.has(head.stamp) || head.stamp === lastStamp) return;
        if (snap.metadata && snap.metadata.hasPendingWrites) return;
        api.read().then((got) => { if (got && !own.has(got.stamp)) onChange(got); }).catch((e) => { if (onError) onError(e); });
      }, (e) => { if (onError) onError(e); });
    },
  };
  return api;
}

// Errors after which this view cannot keep the case in the account: the area is not
// writable for this person (a member with view-only access), the grant is gone, or
// the capability is not usable. Anything else is a passing condition.
export function cannotWriteHere(e) {
  const code = e && e.code;
  return ['invalid_argument', 'revoked', 'not_granted', 'capability_disabled', 'capability_removed', 'transform_error'].includes(code);
}

// The artifact's capabilities, or null when they are not there: locally, or when
// the host does not serve or grant them.
export async function capability(name) {
  const claude = window.claude;
  if (!claude || typeof claude.use !== 'function') return null;
  try { return (await claude.use(name)) || null; } catch (e) { return null; }
}

export const inArtifact = () => !!(window.claude && typeof window.claude.use === 'function');

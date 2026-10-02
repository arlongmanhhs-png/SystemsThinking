// Where the participant is: the case view, a step (and an exercise in it), the
// read-through of Phase A, or the glossary. Kept in the address so the browser's
// back button works.

import { html, createContext, useContext, useEffect, useState, useCallback } from '../html.js';
import { screenTarget } from '../definitions/index.js';

const Ctx = createContext(null);

function parse(hash) {
  const h = (hash || '').replace(/^#\/?/, '');
  const [path, query] = h.split('?');
  const parts = path.split('/').filter(Boolean);
  const q = Object.fromEntries(new URLSearchParams(query || ''));
  if (parts[0] === 'step' && parts[1]) {
    return { view: 'step', step: Number(parts[1]), exercise: parts[2] === 'ex' ? Number(parts[3]) : null, passage: q.passage || null, fields: q.fields ? q.fields.split(',') : null };
  }
  if (parts[0] === 'read') return { view: 'read' };
  if (parts[0] === 'glossary') return { view: 'glossary' };
  return { view: 'case' };
}

function format(r) {
  if (r.view === 'step') {
    const q = new URLSearchParams();
    if (r.passage) q.set('passage', r.passage);
    if (r.fields && r.fields.length) q.set('fields', r.fields.join(','));
    const qs = q.toString();
    return `#/step/${r.step}${r.exercise ? `/ex/${r.exercise}` : ''}${qs ? `?${qs}` : ''}`;
  }
  if (r.view === 'read') return '#/read';
  if (r.view === 'glossary') return '#/glossary';
  return '#/';
}

export function RouterProvider({ children }) {
  const [route, setRoute] = useState(() => parse(window.location.hash));
  const [seq, setSeq] = useState(0);

  useEffect(() => {
    const on = () => { setRoute(parse(window.location.hash)); setSeq((n) => n + 1); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const go = useCallback((r) => {
    const h = format(r);
    if (h === window.location.hash) { setRoute(parse(h)); setSeq((n) => n + 1); } else window.location.hash = h;
  }, []);

  const goPage = useCallback((pageId) => {
    const t = screenTarget(pageId);
    if (!t) return;
    if (t.view) go({ view: t.view });
    else go({ view: 'step', step: t.step, exercise: t.passage ? null : t.exercise, passage: t.passage || null });
  }, [go]);

  return html`<${Ctx.Provider} value=${{ route, go, goPage, seq }}>${children}</${Ctx.Provider}>`;
}

export function useRouter() {
  return useContext(Ctx);
}

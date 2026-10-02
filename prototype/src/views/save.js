// Offering a file: the button that builds one and hands it over, and the notices a
// save can end in. Saving notices, under the controls rule in CLAUDE.md: what failed
// and what to do next, and nothing more. In the artifact the file goes through the
// artifact's own save prompt; locally through the browser's download (files.js).

import { html, useState } from '../html.js';
import { saveFile } from '../engine/files.js';
import { Prov } from './text.js';

export const FILE_NOTICES = {
  notcase: 'That file is not a saved case.',
  declined: 'The file was not saved.',
  unavailable: 'Saving a file is not available in this view.',
  failed: 'The file could not be saved. Try again in a moment.',
};

// `build` returns, or resolves to, { filename, text, type }. The children are the
// button's words.
export function SaveButton({ build, children, className = 'es-btn es-btn--quiet es-btn--sm' }) {
  const [notice, setNotice] = useState(null); // a key of FILE_NOTICES
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setNotice(null);
    setBusy(true);
    let result = 'failed';
    try {
      const f = await build();
      result = await saveFile(f.filename, f.text, f.type);
    } catch (e) {
      result = 'failed';
    }
    setBusy(false);
    if (result !== 'saved') setNotice(result);
  };
  return html`<span class="savefile">
    <button class=${className} disabled=${busy} onClick=${save}>${children}</button>
    ${notice && html`<span class="es-notice foot__error foot__notice savefile__notice" role="status"><${Prov}>${FILE_NOTICES[notice]}</${Prov}>
      <button class="es-btn es-btn--quiet es-btn--sm" onClick=${() => setNotice(null)}><${Prov}>Close the notice</${Prov}></button></span>`}
  </span>`;
}

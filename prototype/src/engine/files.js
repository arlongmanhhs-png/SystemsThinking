// Saving a file: "Save the case to a file", and the read-through at the end of
// Phase A. In the artifact a file reaches the viewer only through the downloads
// capability, which asks the viewer to confirm each save; a download link or a
// script-started download is inert there. Locally, the browser's own download.
// Resolves to one of: saved, declined, unavailable, failed. Never throws.

import { capability, inArtifact } from './storage.js';

// The capability's codes that mean saving is not possible in this view, now or on a
// retry: the view cannot run it, or the file's kind is not allowed here.
const UNAVAILABLE = new Set(['unavailable', 'not_granted', 'capability_disabled', 'capability_removed', 'rejected_extension', 'extension_not_enabled']);

export async function saveFile(filename, text, type = 'application/json') {
  if (inArtifact()) {
    const downloads = await capability('downloads');
    if (!downloads) return 'unavailable';
    try {
      await downloads.save({ filename, data: text });
      return 'saved';
    } catch (e) {
      const code = e && e.code;
      return code === 'declined' ? 'declined' : UNAVAILABLE.has(code) ? 'unavailable' : 'failed';
    }
  }
  try {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    return 'saved';
  } catch (e) {
    return 'failed';
  }
}

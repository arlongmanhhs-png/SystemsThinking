import { html } from './html.js';
import { CaseProvider } from './engine/store.js';
import { RouterProvider } from './views/router.js';
import { App } from './views/App.js';

const root = window.ReactDOM.createRoot(document.getElementById('root'));
root.render(html`<${CaseProvider}><${RouterProvider}><${App} /></${RouterProvider}></${CaseProvider}>`);

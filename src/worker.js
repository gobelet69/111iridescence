import { renderIndex } from './templates/index.js';
import { renderConverter } from './templates/converter.js';
import { renderPDFTools } from './templates/pdf.js';
import { getCSS } from './styles/main.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Common headers for SharedArrayBuffer support
    const headers = {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    };

    // --- 1. ROOT PATH (App Hub) ---
    if (url.pathname === "/") {
      return new Response(renderIndex(), {
        headers: { 
          "Content-Type": "text/html; charset=utf-8",
          ...headers
        },
      });
    }

    // --- 2. CSS STYLESHEET ---
    if (url.pathname === "/style.css") {
      return new Response(getCSS(), {
        headers: { "Content-Type": "text/css" },
      });
    }

    // --- 3. CONVERTER APP ---
    if (url.pathname === "/converter") {
      return new Response(renderConverter(), {
        headers: { 
          "Content-Type": "text/html; charset=utf-8",
          ...headers
        },
      });
    }

    // --- 4. PDF TOOLS APP ---
    if (url.pathname === "/pdf") {
      return new Response(renderPDFTools(), {
        headers: { 
          "Content-Type": "text/html; charset=utf-8",
          ...headers
        },
      });
    }

    // --- 404 NOT FOUND ---
    return new Response("404 - Page Not Found", { status: 404 });
  }
};
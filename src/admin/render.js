import { FAVICON } from './favicon.js';

export function renderAdminShell() {
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Administration · 111iridescence</title>
  <link rel="icon" href="${FAVICON}">
  <link rel="preload" href="/fonts/0xProtoNerdFont-Regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/0xProtoNerdFont-Bold.woff2" as="font" type="font/woff2" crossorigin>
  <style>
    @font-face{font-family:"0xProto NF";src:url("/fonts/0xProtoNerdFont-Regular.woff2") format("woff2");font-weight:400;font-display:swap}
    @font-face{font-family:"0xProto NF";src:url("/fonts/0xProtoNerdFont-Bold.woff2") format("woff2");font-weight:700;font-display:swap}
    :root{--paper:#f3eff4;--surface:#faf8fa;--ink:#21182b;--muted:#746a78;--line:#d6cdd8;--presence:#58d49a;--blue:#6272b5;--danger:#a33c4e}
    *{box-sizing:border-box}html,body{max-width:100%;overflow-x:hidden}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,system-ui,sans-serif;line-height:1.55;-webkit-font-smoothing:antialiased}button,input,textarea,select{font:inherit}button{cursor:pointer}button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:2px solid var(--blue);outline-offset:2px}[hidden]{display:none!important}fieldset{min-width:0;border:0}a{color:var(--blue)}
    .admin-shell{width:min(calc(100% - 2rem),76rem);max-width:100%;min-width:0;margin:auto;overflow-x:hidden;padding:2rem 0 6rem}.admin-head{display:flex;position:static;height:auto;align-items:flex-end;justify-content:space-between;gap:1rem;padding:2rem 0;border-bottom:1px solid var(--line);background:transparent}
    h1,h2,h3,.admin-tab,.type{font-family:"0xProto NF",ui-monospace,monospace}.type{margin:0 0 .35rem;color:var(--muted)}.admin-head h1{margin:0;font-size:clamp(2rem,7vw,4rem);line-height:1}#admin-status{margin:0;padding:.45rem .7rem;border-left:3px solid var(--line);color:var(--muted);font-size:.85rem}#admin-status[data-kind=working]{border-color:var(--blue);color:var(--blue)}#admin-status[data-kind=error]{border-color:var(--danger);color:var(--danger)}#admin-status[data-kind=success]{border-color:var(--presence);color:#287852}
    .admin-tabs{display:flex;gap:.5rem;padding:1rem 0;position:sticky;top:0;z-index:3;background:color-mix(in srgb,var(--paper) 92%,transparent);backdrop-filter:blur(12px)}.admin-tab{padding:.65rem 1rem;border:1px solid var(--line);border-radius:.35rem;background:var(--surface)}.admin-tab[aria-selected=true]{border-color:var(--ink);background:var(--ink);color:white}
    .admin-panel{padding-top:2rem}.panel-intro{display:grid;grid-template-columns:minmax(10rem,.6fr) minmax(0,1.4fr);gap:2rem;margin-bottom:2rem}.panel-intro h2,.panel-intro p{margin:0}.panel-intro p{color:var(--muted)}
    form,.card{padding:1.25rem;border:1px solid var(--line);border-radius:.4rem;background:var(--surface)}.form-grid,.section-editor{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}label{display:grid;gap:.35rem;color:var(--muted);font-size:.82rem}input,textarea,select{width:100%;padding:.7rem;border:1px solid var(--line);border-radius:.3rem;background:white;color:var(--ink)}textarea{resize:vertical}.wide{grid-column:1/-1}
    .section-editor{margin-top:1rem;padding:1rem;border:1px solid var(--line);border-radius:.35rem}.row-actions,.toolbar{display:flex;flex-wrap:wrap;gap:.5rem}.row-actions button,.toolbar button,.primary{padding:.6rem .85rem;border:1px solid var(--line);border-radius:.3rem;background:white;color:var(--ink)}.primary,.toolbar .primary{border-color:var(--ink);background:var(--ink);color:white}.danger{color:var(--danger)!important}
    .blog-layout{display:grid;grid-template-columns:minmax(13rem,.45fr) minmax(0,1.55fr);gap:1rem}.post-sidebar{display:grid;align-content:start;gap:.5rem}.post-list{display:grid;gap:.4rem}.post-list-item{display:grid;padding:.75rem;text-align:left;border:1px solid var(--line);border-radius:.3rem;background:white}.post-list-item span{color:var(--muted);font-size:.72rem}.editor-split{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.markdown-preview{min-height:20rem;padding:1rem;overflow:auto;border:1px solid var(--line);border-radius:.3rem;background:white}.image-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(8rem,1fr));gap:.5rem}.image-item{display:grid;gap:.4rem;padding:.5rem;border:1px solid var(--line)}.image-item img{width:100%;aspect-ratio:16/9;object-fit:cover}
    .project-tools{display:flex;gap:1rem;align-items:end;margin-bottom:1rem}.project-tools label{flex:1}.project-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto auto;gap:1rem;align-items:center;padding:1rem 0;border-top:1px solid var(--line)}.project-row>div:first-child{display:grid}.project-row span{color:var(--muted);font-size:.78rem}.project-flags{display:flex;gap:.3rem}.pin-order{display:grid;gap:.4rem;padding:0;list-style:none}.pin-order li{display:flex;min-width:0;justify-content:space-between;padding:.6rem;border:1px solid var(--line);background:white;overflow-wrap:anywhere}.pin-order button{margin-left:.3rem}
    @media(max-width:48rem){.admin-head,.panel-intro{display:grid}.panel-intro{grid-template-columns:1fr;gap:.5rem}.form-grid,.section-editor,.blog-layout,.editor-split{grid-template-columns:1fr}.project-tools{display:grid;align-items:stretch}.project-tools button{width:100%;white-space:normal}.project-row{grid-template-columns:1fr 1fr;min-width:0}.project-row>div:first-child{grid-column:1/-1;min-width:0;overflow-wrap:anywhere}.admin-tabs{overflow-x:auto}.wide{grid-column:auto}}
  </style>
</head>
<body><main class="admin-shell">
  <header class="admin-head"><div><p class="type">111iridescence.</p><h1>Administration</h1></div><p id="admin-status" aria-live="polite">Chargement…</p></header>
  <nav class="admin-tabs" role="tablist" aria-label="Sections d’administration">
    <button class="admin-tab" role="tab" aria-selected="true" data-tab="about">À propos</button>
    <button class="admin-tab" role="tab" aria-selected="false" data-tab="blog">Blog</button>
    <button class="admin-tab" role="tab" aria-selected="false" data-tab="projects">Projets</button>
  </nav>
  <section class="admin-panel" data-panel="about"><div class="panel-intro"><h2>À propos</h2><p>Le texte public, sans modifier la structure du site.</p></div>
    <form id="about-form"><div class="form-grid">
      <label>Sur-titre<input name="about-eyebrow" required></label><label>Titre<input name="about-title" required></label>
      <label class="wide">Description SEO<textarea name="about-description" rows="2" required></textarea></label><label class="wide">Introduction<textarea name="about-intro" rows="4" required></textarea></label>
      <label>Libellé du lien<input name="contact-label" required></label><label>Texte du lien<input name="contact-text" required></label><label class="wide">Adresse du lien<input name="contact-href" type="url" required></label>
    </div><div id="about-sections"></div><div class="toolbar"><button type="button" id="add-section">Ajouter une section</button><button class="primary" type="submit">Enregistrer À propos</button></div></form>
  </section>
  <section class="admin-panel" data-panel="blog" hidden><div class="panel-intro"><h2>Blog</h2><p>Articles Markdown, brouillons et images propres à chaque article.</p></div>
    <div class="blog-layout"><aside class="post-sidebar card"><button class="primary" id="new-post" type="button">Nouvel article</button><div id="post-list" class="post-list"></div></aside>
      <form id="post-form" hidden><div id="post-editor"><div class="form-grid">
        <label>Format<select name="post-format"><option value="article">Article</option><option value="note">Note</option></select></label><label>Brouillon<input name="post-draft" type="checkbox"></label>
        <label class="wide">Titre<input name="post-title" required></label><label class="wide">Description<textarea name="post-description" required></textarea></label>
        <label>Slug<input name="post-slug" pattern="[a-z0-9-]+" required></label><label>Thème<select name="post-theme"><option value="developpement">Développement</option><option value="securite">Sécurité</option><option value="systemes">Systèmes</option><option value="projets">Projets</option></select></label>
        <label>Tags, séparés par des virgules<input name="post-tags" required></label><label>Publication ISO<input name="post-publishedAt" required></label><label>Série<input name="post-series"></label><label>Image sociale<input name="post-socialImage"></label>
      </div><div class="editor-split wide"><label>Markdown<textarea data-markdown-editor name="post-body" rows="24" required></textarea></label><div><p class="type">Aperçu</p><div id="markdown-preview" class="markdown-preview"></div></div></div>
      <div class="wide"><label>Ajouter une image<input id="post-image" type="file" accept="image/jpeg,image/png,image/webp"></label><div id="image-list" class="image-list"></div></div>
      <div class="toolbar"><button class="primary" type="submit">Enregistrer l’article</button><button id="duplicate-post" type="button">Dupliquer</button><button id="delete-post" class="danger" type="button">Supprimer</button></div></div></form>
    </div>
  </section>
  <section class="admin-panel" data-panel="projects" hidden><div class="panel-intro"><h2>Projets</h2><p>Visibilité et ordre public, indépendamment des topics GitHub.</p></div>
    <form id="project-form"><div class="project-tools"><label>Rechercher<input id="project-search" data-project-search type="search"></label><strong id="pin-count" title="n/6">0/6</strong><button id="github-sync" type="button">Actualiser GitHub maintenant</button></div>
      <h3>Ordre des épinglés</h3><ol id="pin-order" class="pin-order"></ol><div id="project-list"></div><button class="primary" type="submit">Enregistrer les projets</button></form>
  </section>
</main><script src="/admin/client.js" defer></script></body></html>`;
}

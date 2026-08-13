(() => {
  const state = {
    data: null,
    selectedPost: null,
    deletedImages: [],
    activeTab: 'about',
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const status = $('#admin-status');

  function setStatus(message, kind = 'idle') {
    status.textContent = message;
    status.dataset.kind = kind;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character]);
  }

  function markdownPreview(value) {
    const escaped = escapeHtml(value);
    return escaped.split(/\n{2,}/).map((block) => {
      if (/^###\s/.test(block)) return `<h3>${block.slice(4)}</h3>`;
      if (/^##\s/.test(block)) return `<h2>${block.slice(3)}</h2>`;
      if (/^#\s/.test(block)) return `<h1>${block.slice(2)}</h1>`;
      if (/^&gt;\s/.test(block)) return `<blockquote>${block.replace(/^&gt;\s?/, '')}</blockquote>`;
      if (/^```/.test(block)) return `<pre><code>${block.replace(/^```[^\n]*\n?|\n?```$/g, '')}</code></pre>`;
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    }).join('');
  }

  async function api(path, options = {}) {
    const headers = new Headers(options.headers);
    if (options.body) {
      headers.set('Content-Type', 'application/json');
      headers.set('X-Iridescence-CSRF', state.data.csrfToken);
    }
    const response = await fetch(`/admin/api${path}`, {
      ...options,
      headers,
      credentials: 'same-origin',
    });
    const payload = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    if (!response.ok) {
      const error = new Error(payload.error || `HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  function mutationBody(extra = {}) {
    return JSON.stringify({ baseSha: state.data.headSha, ...extra });
  }

  async function followPublication(sha) {
    setStatus('Validation et publication en cours…', 'working');
    const deadline = Date.now() + 10 * 60_000;
    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 5_000));
      const publication = await api(`/publications/${sha}`);
      if (publication.status === 'success') {
        setStatus('Publié.', 'success');
        return;
      }
      if (['failure', 'cancelled'].includes(publication.status)) {
        setStatus(`Publication ${publication.status}. Consultez GitHub Actions.`, 'error');
        if (publication.htmlUrl) status.innerHTML += ` <a href="${escapeHtml(publication.htmlUrl)}">Voir l’exécution</a>`;
        return;
      }
    }
    setStatus('Publication toujours en cours. Vérifiez GitHub Actions.', 'error');
  }

  async function save(path, method, extra) {
    setStatus('Enregistrement en cours…', 'working');
    try {
      const result = await api(path, { method, body: mutationBody(extra) });
      if (result.sha) {
        state.data.headSha = result.sha;
        setStatus('Commit créé.', 'success');
        void followPublication(result.sha);
      } else setStatus('Synchronisation lancée.', 'success');
      return result;
    } catch (error) {
      setStatus(error.status === 409 ? 'Le dépôt a changé. Rechargez avant de réessayer.' : error.message, 'error');
      throw error;
    }
  }

  function sectionEditor(section = { id: '', title: '', body: '' }) {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'section-editor';
    fieldset.innerHTML = `
      <label>Identifiant<input name="section-id" pattern="[a-z0-9-]+" required></label>
      <label>Titre<input name="section-title" required></label>
      <label class="wide">Texte<textarea name="section-body" rows="4" required></textarea></label>
      <div class="row-actions wide">
        <button type="button" data-move="up">Monter</button><button type="button" data-move="down">Descendre</button>
        <button type="button" class="danger" data-remove>Supprimer</button>
      </div>`;
    $('[name="section-id"]', fieldset).value = section.id;
    $('[name="section-title"]', fieldset).value = section.title;
    $('[name="section-body"]', fieldset).value = section.body;
    $('[data-remove]', fieldset).onclick = () => fieldset.remove();
    $('[data-move="up"]', fieldset).onclick = () => fieldset.previousElementSibling?.before(fieldset);
    $('[data-move="down"]', fieldset).onclick = () => fieldset.nextElementSibling?.after(fieldset);
    return fieldset;
  }

  function renderAbout() {
    const about = state.data.about;
    for (const key of ['eyebrow', 'title', 'description', 'intro']) $(`[name="about-${key}"]`).value = about[key];
    $('[name="contact-label"]').value = about.contact.label;
    $('[name="contact-text"]').value = about.contact.text;
    $('[name="contact-href"]').value = about.contact.href;
    const sections = $('#about-sections');
    sections.replaceChildren(...about.sections.map(sectionEditor));
  }

  function readAbout() {
    return {
      eyebrow: $('[name="about-eyebrow"]').value.trim(),
      title: $('[name="about-title"]').value.trim(),
      description: $('[name="about-description"]').value.trim(),
      intro: $('[name="about-intro"]').value.trim(),
      sections: $$('.section-editor').map((section) => ({
        id: $('[name="section-id"]', section).value.trim(),
        title: $('[name="section-title"]', section).value.trim(),
        body: $('[name="section-body"]', section).value.trim(),
      })),
      contact: {
        label: $('[name="contact-label"]').value.trim(),
        text: $('[name="contact-text"]').value.trim(),
        href: $('[name="contact-href"]').value.trim(),
      },
    };
  }

  function emptyPost() {
    const local = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 19);
    return {
      format: 'article', title: '', description: '', slug: '', theme: 'developpement', tags: ['tech', 'notes'],
      publishedAt: `${local}+02:00`, draft: true, body: '', images: [],
    };
  }

  function renderPostList() {
    const list = $('#post-list');
    list.replaceChildren(...state.data.posts.map((post) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'post-list-item';
      button.dataset.slug = post.slug;
      button.innerHTML = `<strong>${escapeHtml(post.title)}</strong><span>${post.draft ? 'Brouillon' : 'Publié'} · ${escapeHtml(post.format)}</span>`;
      button.onclick = () => selectPost(post.slug);
      return button;
    }));
  }

  function selectPost(slug, draft) {
    state.selectedPost = slug;
    state.deletedImages = [];
    const post = draft || state.data.posts.find((item) => item.slug === slug) || emptyPost();
    for (const key of ['format', 'title', 'description', 'slug', 'theme', 'publishedAt', 'series', 'socialImage']) {
      $(`[name="post-${key}"]`).value = post[key] || '';
    }
    $('[name="post-tags"]').value = post.tags.join(', ');
    $('[name="post-draft"]').checked = post.draft;
    $('[name="post-body"]').value = post.body;
    $('#markdown-preview').innerHTML = markdownPreview(post.body);
    renderImages(post.images || []);
    $('#post-form').hidden = false;
    $('#post-editor').hidden = false;
  }

  function renderImages(images) {
    const list = $('#image-list');
    list.replaceChildren(...images.map((image) => {
      const item = document.createElement('div');
      item.className = 'image-item';
      item.dataset.name = image.name;
      item.dataset.content = image.contentBase64;
      item.innerHTML = `<img alt="" src="data:image/webp;base64,${image.contentBase64}"><span>${escapeHtml(image.name)}</span><button type="button">Supprimer</button>`;
      $('button', item).onclick = () => {
        state.deletedImages.push(image.name);
        item.remove();
      };
      return item;
    }));
  }

  async function fileToWebP(file) {
    if (file.size > 8 * 1024 * 1024) throw new Error('Image supérieure à 8 Mio.');
    const bitmap = await createImageBitmap(file);
    const width = Math.min(2000, bitmap.width);
    const height = Math.round(bitmap.height * width / bitmap.width);
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.82));
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    const base = file.name.replace(/\.[^.]+$/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'image';
    return { name: `${base}.webp`, contentBase64: btoa(binary) };
  }

  function readPost() {
    return {
      format: $('[name="post-format"]').value,
      title: $('[name="post-title"]').value.trim(),
      description: $('[name="post-description"]').value.trim(),
      slug: $('[name="post-slug"]').value.trim(),
      theme: $('[name="post-theme"]').value,
      tags: $('[name="post-tags"]').value.split(',').map((tag) => tag.trim()).filter(Boolean),
      publishedAt: $('[name="post-publishedAt"]').value.trim(),
      draft: $('[name="post-draft"]').checked,
      series: $('[name="post-series"]').value.trim() || undefined,
      socialImage: $('[name="post-socialImage"]').value.trim() || undefined,
      body: $('[name="post-body"]').value,
    };
  }

  function currentImages() {
    return $$('.image-item').map((item) => ({ name: item.dataset.name, contentBase64: item.dataset.content }));
  }

  function renderProjects() {
    const query = $('#project-search').value.trim().toLowerCase();
    const pinned = new Set(state.data.projectSettings.pinned);
    const rows = state.data.repositories
      .filter((repository) => !query || `${repository.repo} ${repository.description || ''}`.toLowerCase().includes(query))
      .map((repository) => {
        const row = document.createElement('div');
        row.className = 'project-row';
        row.dataset.repo = repository.repo;
        const explicit = state.data.projectSettings.repositories[repository.repo];
        const visible = explicit?.visible ?? !repository.fork;
        row.innerHTML = `
          <div><strong>${escapeHtml(repository.name)}</strong><span>${escapeHtml(repository.description || '—')}</span></div>
          <div class="project-flags">${repository.fork ? '<span>fork</span>' : ''}${repository.archived ? '<span>archive</span>' : ''}</div>
          <label><input type="checkbox" data-visible ${visible ? 'checked' : ''}> Visible</label>
          <label><input type="checkbox" data-pinned ${pinned.has(repository.repo) ? 'checked' : ''}> Épinglé</label>`;
        $('[data-visible]', row).onchange = (event) => {
          if (!event.target.checked && pinned.has(repository.repo) && !confirm('Masquer ce dépôt le désépinglera. Continuer ?')) {
            event.target.checked = true; return;
          }
          state.data.projectSettings.repositories[repository.repo] = { visible: event.target.checked };
          if (!event.target.checked) state.data.projectSettings.pinned = state.data.projectSettings.pinned.filter((repo) => repo !== repository.repo);
          renderProjects();
        };
        $('[data-pinned]', row).onchange = (event) => {
          if (event.target.checked) {
            if (state.data.projectSettings.pinned.length >= 6) { event.target.checked = false; setStatus('Six dépôts maximum.', 'error'); return; }
            state.data.projectSettings.pinned.push(repository.repo);
            state.data.projectSettings.repositories[repository.repo] = { visible: true };
          } else state.data.projectSettings.pinned = state.data.projectSettings.pinned.filter((repo) => repo !== repository.repo);
          renderProjects();
        };
        return row;
      });
    $('#project-list').replaceChildren(...rows);
    $('#pin-count').textContent = `${state.data.projectSettings.pinned.length}/6`;
    const order = $('#pin-order');
    order.replaceChildren(...state.data.projectSettings.pinned.map((repo, index) => {
      const item = document.createElement('li');
      item.textContent = repo;
      const actions = document.createElement('span');
      for (const [label, delta] of [['↑', -1], ['↓', 1]]) {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
        button.onclick = () => {
          const target = index + delta;
          if (target < 0 || target >= state.data.projectSettings.pinned.length) return;
          [state.data.projectSettings.pinned[index], state.data.projectSettings.pinned[target]] = [state.data.projectSettings.pinned[target], state.data.projectSettings.pinned[index]];
          renderProjects();
        };
        actions.append(button);
      }
      item.append(actions); return item;
    }));
  }

  function bind() {
    $$('.admin-tab').forEach((tab) => tab.onclick = () => {
      state.activeTab = tab.dataset.tab;
      $$('.admin-tab').forEach((item) => item.setAttribute('aria-selected', String(item === tab)));
      $$('.admin-panel').forEach((panel) => panel.hidden = panel.dataset.panel !== state.activeTab);
    });
    $('#add-section').onclick = () => $('#about-sections').append(sectionEditor());
    $('#about-form').onsubmit = async (event) => { event.preventDefault(); await save('/about', 'PUT', { about: readAbout() }); };
    $('#new-post').onclick = () => selectPost(null, emptyPost());
    $('#duplicate-post').onclick = () => {
      const duplicate = readPost(); duplicate.slug = `${duplicate.slug}-copie`; duplicate.title = `${duplicate.title} — copie`; duplicate.draft = true;
      selectPost(null, { ...duplicate, images: currentImages() });
    };
    $('#post-list').addEventListener('click', (event) => event.target.closest('[data-slug]')?.focus());
    $('[name="post-body"]').oninput = (event) => $('#markdown-preview').innerHTML = markdownPreview(event.target.value);
    $('#post-image').onchange = async (event) => {
      try {
        const image = await fileToWebP(event.target.files[0]);
        const alt = prompt('Texte alternatif de l’image :');
        if (alt === null) return;
        renderImages([...currentImages(), image]);
        const editor = $('[name="post-body"]');
        editor.value += `${editor.value.endsWith('\n') || !editor.value ? '' : '\n\n'}![${alt}](./images/${image.name})`;
        editor.dispatchEvent(new Event('input'));
      } catch (error) { setStatus(error.message, 'error'); }
      event.target.value = '';
    };
    $('#post-form').onsubmit = async (event) => {
      event.preventDefault();
      const post = readPost();
      const existing = state.selectedPost ? state.data.posts.find((item) => item.slug === state.selectedPost) : null;
      const path = existing ? `/posts/${existing.slug}` : '/posts';
      const method = existing ? 'PUT' : 'POST';
      await save(path, method, { post, images: currentImages(), deletedImages: state.deletedImages });
    };
    $('#delete-post').onclick = async () => {
      if (!state.selectedPost || !confirm('Supprimer cet article et ses images ?')) return;
      await save(`/posts/${state.selectedPost}`, 'DELETE', {});
    };
    $('#project-search').oninput = renderProjects;
    $('#project-form').onsubmit = async (event) => { event.preventDefault(); await save('/projects', 'PUT', { projectSettings: state.data.projectSettings }); };
    $('#github-sync').onclick = () => save('/github/sync', 'POST', {});
  }

  async function start() {
    bind();
    try {
      state.data = await api('/bootstrap');
      renderAbout(); renderPostList(); renderProjects();
      setStatus('Aucune modification.', 'idle');
      document.body.dataset.ready = 'true';
    } catch (error) {
      setStatus(error.message, 'error');
    }
  }

  void start();
})();

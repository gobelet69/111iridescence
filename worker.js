// ── ROLE HELPERS (shared style with other apps) ────────────────────────────────
function normalizeRole(r) { if (r === 'admin') return 'owner'; if (r === 'guest+') return 'member'; if (r === 'guest') return 'viewer'; return r || 'viewer'; }
function isOwner(u) { return normalizeRole(u?.role) === 'owner'; }
const ROLE_META = {
  owner: { label: 'Owner', color: '#f43f5e', bg: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.3)', icon: '🔑' },
  member: { label: 'Member', color: '#A855F7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)', icon: '📁' },
  viewer: { label: 'Viewer', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', icon: '👁' }
};
const ROLE_PERMS = {
  owner: ['Upload any file type', 'Delete any file', 'Share files', 'Manage users & roles', 'Access admin panel'],
  member: ['Upload any file type', 'Delete own files', 'Share files'],
  viewer: ['Upload PDF files only', 'Delete own files']
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── CSS ──────────────────────────────────────────────────────────────────
    if (url.pathname === '/style.css') {
      return new Response(renderCSS(), { headers: { 'Content-Type': 'text/css' } });
    }

    // ── ROOT ─────────────────────────────────────────────────────────────────
    if (url.pathname === '/') {
      let user = null;
      const cookie = request.headers.get('Cookie') || '';
      const sessId = cookie.split(';').find(c => c.trim().startsWith('sess='))?.split('=')[1];
      if (sessId && env.AUTH_DB) {
        try {
          const sess = await env.AUTH_DB.prepare('SELECT * FROM sessions WHERE id=? AND expires>?').bind(sessId, Date.now()).first();
          if (sess) {
            user = sess;
            const du = await env.AUTH_DB.prepare('SELECT role FROM users WHERE username=?').bind(sess.username).first();
            user.role = du?.role || 'viewer';
          }
        } catch (e) { }
      }
      return new Response(renderIndex(user), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    return new Response('404 - Page Not Found', { status: 404 });
  }
};

// ── HEADER ────────────────────────────────────────────────────────────────────
function renderHeader(user) {
  const id = 'hubUW';
  let rightSide;
  if (user) {
    const role = normalizeRole(user.role), rm = ROLE_META[role] || ROLE_META.viewer, perms = ROLE_PERMS[role] || [];
    const all = ['Upload any file type', 'Delete any file', 'Share files', 'Manage users & roles', 'Access admin panel'];
    rightSide = `<div class="user-wrap" id="${id}">
      <button class="user-btn" onclick="document.getElementById('${id}').classList.toggle('open')">
        ${user.username}<svg class="caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="dd">
        <div class="dd-hdr">
          <div class="dd-name">${user.username}</div>
          <span class="role-badge" style="background:${rm.bg};color:${rm.color};border:1px solid ${rm.border}">${rm.icon} ${rm.label}</span>
          <ul class="perm-list">${all.map(p => { const h = perms.includes(p); return `<li class="${h ? 'ok' : ''}"><span class="pcheck ${h ? 'y' : 'n'}">${h ? '✓' : '✕'}</span>${p}</li>`; }).join('')}</ul>
        </div>
        <a href="/auth/account" class="ddl"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg>Account Preferences</a>
        ${isOwner(user) ? `<a href="/auth/admin" class="ddl"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>Admin Panel</a>` : ''}
        <div class="dd-sep"></div>
        <a href="/auth/logout" class="ddl out"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Sign Out</a>
      </div>
    </div>
    <script>document.addEventListener('click',e=>{const w=document.getElementById('${id}');if(w&&!w.contains(e.target))w.classList.remove('open')});<\/script>`;
  } else {
    rightSide = `<a href="/auth/login" style="display:inline-flex;align-items:center;gap:7px;font-size:.84rem;font-weight:600;padding:8px 16px;border-radius:8px;background:linear-gradient(135deg,#A855F7,#EC4899);color:#fff;text-decoration:none;border:none;box-shadow:0 2px 8px rgba(168,85,247,.3);transition:box-shadow .15s">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
      Sign In
    </a>`;
  }

  return `<a href="/" style="text-decoration:none;display:flex;align-items:center;gap:10px;flex-shrink:0">
    <span style="width:36px;height:36px;background:linear-gradient(135deg,#A855F7,#EC4899);border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.9em;color:#fff;flex-shrink:0;box-shadow:0 2px 8px rgba(168,85,247,.3)">111</span>
    <div style="display:flex;flex-direction:column;line-height:1.25">
      <span style="font-weight:700;font-size:1.1em;color:#fff;letter-spacing:-.02em">111<span style="color:#A855F7;text-shadow:0 0 20px rgba(168,85,247,.5)">iridescence</span></span>
      <span style="font-size:.72em;color:#94a3b8;font-weight:500;letter-spacing:.03em">Hub</span>
    </div>
  </a>
  <div style="display:flex;gap:8px;align-items:center;flex-shrink:0">${rightSide}</div>`;
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
function renderIndex(user) {
  const FAVICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23A855F7'/%3E%3Cstop offset='1' stop-color='%23EC4899'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='32' height='32' rx='8' fill='url(%23g)'/%3E%3Ctext x='16' y='21' font-family='Arial,sans-serif' font-weight='900' font-size='12' fill='white' text-anchor='middle'%3E111%3C/text%3E%3C/svg%3E`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>111iridescence</title>
  <link rel="icon" type="image/svg+xml" href="${FAVICON}">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <header>${renderHeader(user)}</header>
  <main>
    <div class="hub-inner">
      <div class="hub-hero">
        <h2>App Hub</h2>
        <p>Access all your tools, vaults, and projects from one secure location.</p>
      </div>

      <section>
        <div class="section-title"><span>✨</span><h3>Iridescent Cloud</h3></div>
        <div class="card-grid">
          <a href="/vault" class="tool-card">
            <div class="tool-icon" style="background:rgba(100,116,139,.12)">🔒</div>
            <div><h4>Vault</h4><p>Secure personal storage and data archive.</p></div>
          </a>
          <a href="/habits" class="tool-card">
            <div class="tool-icon" style="background:rgba(249,115,22,.1)">📈</div>
            <div><h4>Habits Tracker</h4><p>Daily routines, goals, and progress monitoring.</p></div>
          </a>
          <a href="/todo" class="tool-card">
            <div class="tool-icon" style="background:rgba(59,130,246,.1)">✅</div>
            <div><h4>Todo List</h4><p>Task management and productivity tracking.</p></div>
          </a>
          <a href="/courses" class="tool-card">
            <div class="tool-icon" style="background:rgba(16,185,129,.1)">🎓</div>
            <div><h4>Courses</h4><p>University course shortcuts, organized by quarter.</p></div>
          </a>
          <a href="/editor" class="tool-card">
            <div class="tool-icon" style="background:rgba(99,102,241,.1)">📝</div>
            <div><h4>Editor</h4><p>Collaborative Markdown, LaTeX & Mermaid editor with live preview.</p></div>
          </a>
        </div>
      </section>

      <hr class="divider">

      <section>
        <div class="section-title"><span>🛠️</span><h3>Tools</h3></div>
        <div class="card-grid">
          <a href="/pdf" class="tool-card">
            <div class="tool-icon" style="background:rgba(99,102,241,.1)">📚</div>
            <div><h4>111 PDF Tools</h4><p>Secure, client-side PDF editing and merging suite.</p></div>
          </a>
          <a href="/converter" class="tool-card">
            <div class="tool-icon" style="background:rgba(16,185,129,.1)">🔄</div>
            <div><h4>111 Converter</h4><p>Fast universal file conversion utility.</p></div>
          </a>
        </div>
      </section>
    </div>
  </main>
</body>
</html>`;
}

// ── CSS ───────────────────────────────────────────────────────────────────────
function renderCSS() {
  return `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@400;500&display=swap');
:root{
  --bg:#0F1115;--surface:#1A1D24;--surface-hover:#20242C;--surface-soft:#151820;
  --text:#F1F5F9;--text-secondary:#94A3B8;--text-muted:#64748B;--border:#262A33;
  --accent:#A855F7;--accent-pink:#EC4899;
  --accent-soft:rgba(168,85,247,0.10);--accent-glow:rgba(168,85,247,0.20);
  --danger:#F43F5E;--danger-soft:rgba(244,63,94,0.12);
  --good:#10B981;--good-soft:rgba(16,185,129,0.12);
  --radius-sm:6px;--radius:8px;--radius-md:10px;--radius-lg:12px;--radius-xl:16px;
  --transition:150ms ease-out;
  --shadow-sm:0 1px 3px rgba(0,0,0,0.25);--shadow:0 4px 16px rgba(0,0,0,0.30);--shadow-lg:0 16px 48px rgba(0,0,0,0.40);
  --gradient:linear-gradient(135deg,#A855F7,#EC4899);
  --gradient-subtle:linear-gradient(135deg,rgba(168,85,247,0.15),rgba(236,72,153,0.10));
  --font:"DM Sans",ui-sans-serif,system-ui,-apple-system,sans-serif;
  --font-mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  /* legacy aliases */
  --card:var(--surface);--card2:var(--surface-soft);--txt:var(--text);
  --muted:var(--text-secondary);--dim:var(--text-muted);
  --p:var(--accent);--ph:var(--accent-pink);
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);background:var(--bg);color:var(--text);min-height:100vh;line-height:1.5;font-size:14px;-webkit-font-smoothing:antialiased}
a{color:var(--accent);text-decoration:none;transition:color var(--transition)}
a:hover{color:var(--accent-pink)}
::selection{background:rgba(168,85,247,0.30)}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
/* HEADER */
header{display:flex;justify-content:space-between;align-items:center;height:64px;padding:0 24px;background:var(--surface);border-bottom:1px solid var(--border);box-shadow:var(--shadow-sm);position:sticky;top:0;z-index:50;backdrop-filter:blur(8px)}
/* USER DROPDOWN */
.user-wrap{position:relative}
.user-btn{display:flex;align-items:center;gap:8px;color:var(--text);font-size:0.84rem;font-weight:500;padding:6px 12px 6px 10px;border-radius:var(--radius);background:transparent;border:1px solid var(--border);cursor:pointer;transition:all var(--transition);font-family:inherit}
.user-btn:hover{background:var(--surface-hover)}
.caret{color:var(--text-muted);transition:transform var(--transition);margin-left:2px}
.user-wrap.open .caret{transform:rotate(180deg)}
.dd{display:none;position:absolute;right:0;top:calc(100% + 8px);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);min-width:240px;box-shadow:var(--shadow-lg);z-index:999;overflow:hidden}
.user-wrap.open .dd{display:block;animation:dd 150ms ease-out}
@keyframes dd{from{opacity:0;transform:translateY(-4px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.dd-hdr{padding:14px 16px 12px;border-bottom:1px solid var(--border)}
.dd-name{font-weight:700;font-size:0.92rem;margin-bottom:7px}
.role-badge{display:inline-flex;align-items:center;gap:5px;font-size:0.68rem;font-weight:700;padding:3px 10px;border-radius:999px;letter-spacing:0.04em;margin-bottom:9px;text-transform:uppercase}
.perm-list{list-style:none}
.perm-list li{font-size:0.76rem;color:var(--text-secondary);padding:2px 0;display:flex;align-items:center;gap:6px}
.perm-list li.ok{color:var(--text)}
.pcheck{width:14px;height:14px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;font-size:9px;font-weight:700}
.pcheck.y{background:var(--good-soft);color:var(--good)} .pcheck.n{background:var(--surface-soft);color:var(--text-muted)}
.ddl{display:flex;align-items:center;gap:10px;padding:10px 16px;color:var(--text);text-decoration:none;font-size:0.86rem;font-weight:500;transition:background var(--transition)}
.ddl:hover{background:var(--accent-soft);color:var(--text)}
.dd-sep{height:1px;background:var(--border);margin:4px 0}
.ddl.out{color:var(--danger)!important} .ddl.out:hover{background:var(--danger-soft)!important}
/* MAIN */
main{padding:40px 24px 80px;max-width:1020px;margin:0 auto}
.hub-inner{display:flex;flex-direction:column;gap:36px}
.hub-hero h2{font-size:2.2rem;font-weight:800;letter-spacing:-.03em;margin-bottom:8px;background:var(--gradient);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.hub-hero p{font-size:0.95rem;color:var(--text-secondary);max-width:520px;font-weight:500}
.section-title{display:flex;align-items:center;gap:8px;margin-bottom:16px}
.section-title span{font-size:1.3em}
.section-title h3{font-size:1rem;font-weight:700;color:var(--text);letter-spacing:-0.01em}
.divider{border:none;border-top:1px solid var(--border)}
/* TOOL CARDS */
.card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.tool-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px;display:flex;flex-direction:column;gap:12px;text-decoration:none;color:var(--text);transition:all var(--transition);cursor:pointer;box-shadow:var(--shadow-sm);position:relative;overflow:hidden}
.tool-card::before{content:"";position:absolute;inset:0;background:var(--gradient-subtle);opacity:0;transition:opacity var(--transition);pointer-events:none}
.tool-card:hover{border-color:var(--accent);transform:translateY(-3px);box-shadow:0 12px 30px -8px rgba(0,0,0,.5),0 0 0 1px rgba(168,85,247,.3);background:var(--surface-hover)}
.tool-card:hover::before{opacity:1}
.tool-card>*{position:relative;z-index:1}
.tool-icon{width:48px;height:48px;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;font-size:1.6em;transition:transform var(--transition)}
.tool-card:hover .tool-icon{transform:scale(1.08)}
.tool-card h4{font-weight:700;font-size:0.95rem;color:var(--text);margin-bottom:4px;transition:color var(--transition);letter-spacing:-0.01em}
.tool-card:hover h4{color:var(--accent)}
.tool-card p{font-size:0.8rem;color:var(--text-secondary);line-height:1.5}
/* ANIMATION */
main{animation:fadeIn 400ms ease-out}
@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`;
}

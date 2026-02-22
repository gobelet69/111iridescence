// ── ROLE HELPERS (shared style with other apps) ────────────────────────────────
function normalizeRole(r) { if (r === 'admin') return 'owner'; if (r === 'guest+') return 'member'; if (r === 'guest') return 'viewer'; return r || 'viewer'; }
function isOwner(u) { return normalizeRole(u?.role) === 'owner'; }
const ROLE_META = {
    owner: { label: 'Owner', color: '#f43f5e', bg: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.3)', icon: '🔑' },
    member: { label: 'Member', color: '#6366f1', bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)', icon: '📁' },
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
        ${isOwner(user) ? `<a href="/vault/admin" class="ddl"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>Admin Panel</a>` : ''}
        <div class="dd-sep"></div>
        <a href="/auth/logout" class="ddl out"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Sign Out</a>
      </div>
    </div>
    <script>document.addEventListener('click',e=>{const w=document.getElementById('${id}');if(w&&!w.contains(e.target))w.classList.remove('open')});<\/script>`;
    } else {
        rightSide = `<a href="/auth/login" style="display:inline-flex;align-items:center;gap:7px;font-size:.88em;font-weight:600;padding:8px 16px;border-radius:9px;background:var(--p);color:#fff;text-decoration:none;border:none;transition:background .2s" onmouseover="this.style.background='var(--ph)'" onmouseout="this.style.background='var(--p)'">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
      Sign In
    </a>`;
    }

    return `<a href="/" style="text-decoration:none;display:flex;align-items:center;gap:10px;flex-shrink:0">
    <span style="width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#f43f5e);border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.9em;color:#fff;flex-shrink:0;box-shadow:0 0 18px rgba(99,102,241,.5)">111</span>
    <div style="display:flex;flex-direction:column;line-height:1.25">
      <span style="font-weight:700;font-size:1.1em;color:#fff;letter-spacing:-.02em">111<span style="color:#6366f1;text-shadow:0 0 20px rgba(99,102,241,.6)">iridescence</span></span>
      <span style="font-size:.72em;color:#94a3b8;font-weight:500;letter-spacing:.03em">Hub</span>
    </div>
  </a>
  <div style="display:flex;gap:8px;align-items:center;flex-shrink:0">${rightSide}</div>`;
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
function renderIndex(user) {
    const FAVICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%236366f1'/%3E%3Cstop offset='1' stop-color='%23f43f5e'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='32' height='32' rx='8' fill='url(%23g)'/%3E%3Ctext x='16' y='21' font-family='Arial,sans-serif' font-weight='900' font-size='12' fill='white' text-anchor='middle'%3E111%3C/text%3E%3C/svg%3E`;

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
    return `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
:root{--bg:#0f1117;--card:#161b22;--card2:#1c2130;--txt:#f8fafc;--muted:#94a3b8;--dim:#475569;--p:#6366f1;--ph:#4f46e5;--border:rgba(255,255,255,0.07);--ring:rgba(99,102,241,0.4)}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--txt);min-height:100vh;line-height:1.5}
a{color:var(--p);text-decoration:none} a:hover{color:#818cf8}
/* HEADER */
header{display:flex;justify-content:space-between;align-items:center;height:64px;padding:0 24px;background:var(--card);border-bottom:1px solid var(--border);box-shadow:0 4px 20px rgba(0,0,0,0.25);position:sticky;top:0;z-index:50}
/* USER DROPDOWN */
.user-wrap{position:relative}
.user-btn{display:flex;align-items:center;gap:8px;color:var(--txt);font-size:0.9em;font-weight:500;padding:8px 13px;border-radius:9px;background:rgba(255,255,255,0.05);border:1px solid var(--border);cursor:pointer;transition:background .2s;font-family:inherit}
.user-btn:hover{background:rgba(255,255,255,0.09)}
.caret{opacity:.5;transition:transform .2s;margin-left:2px}
.user-wrap.open .caret{transform:rotate(180deg)}
.dd{display:none;position:absolute;right:0;top:calc(100% + 10px);background:#151c28;border:1px solid var(--border);border-radius:14px;min-width:240px;box-shadow:0 20px 56px rgba(0,0,0,.6);z-index:999;overflow:hidden}
.user-wrap.open .dd{display:block;animation:dd .15s ease-out}
@keyframes dd{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
.dd-hdr{padding:15px 17px 13px;border-bottom:1px solid var(--border)}
.dd-name{font-weight:700;font-size:.98em;margin-bottom:7px}
.role-badge{display:inline-flex;align-items:center;gap:5px;font-size:.72em;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:.03em;margin-bottom:9px}
.perm-list{list-style:none}
.perm-list li{font-size:.77em;color:var(--muted);padding:2px 0;display:flex;align-items:center;gap:6px}
.perm-list li.ok{color:#cbd5e1}
.pcheck{width:14px;height:14px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;font-size:9px;font-weight:700}
.pcheck.y{background:rgba(16,185,129,.2);color:#10b981} .pcheck.n{background:rgba(148,163,184,.1);color:var(--dim)}
.ddl{display:flex;align-items:center;gap:10px;padding:11px 17px;color:var(--txt);text-decoration:none;font-size:.9em;font-weight:500;transition:background .15s}
.ddl:hover{background:rgba(255,255,255,.05);color:var(--txt)}
.dd-sep{height:1px;background:var(--border);margin:4px 0}
.ddl.out{color:#f43f5e!important} .ddl.out:hover{background:rgba(244,63,94,.08)!important}
/* MAIN */
main{padding:40px 24px 80px;max-width:1020px;margin:0 auto}
.hub-inner{display:flex;flex-direction:column;gap:36px}
.hub-hero h2{font-size:2.4em;font-weight:800;color:#fff;letter-spacing:-.03em;margin-bottom:8px}
.hub-hero p{font-size:1.05em;color:var(--muted);max-width:520px}
.section-title{display:flex;align-items:center;gap:8px;margin-bottom:18px}
.section-title span{font-size:1.4em}
.section-title h3{font-size:1.1em;font-weight:700;color:#f8fafc}
.divider{border:none;border-top:1px solid var(--border)}
/* TOOL CARDS */
.card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
.tool-card{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:22px;display:flex;flex-direction:column;gap:14px;text-decoration:none;color:var(--txt);transition:all .2s cubic-bezier(.4,0,.2,1);cursor:pointer}
.tool-card:hover{background:var(--card2);border-color:rgba(99,102,241,.4);transform:translateY(-4px);box-shadow:0 12px 30px -8px rgba(0,0,0,.5),0 0 0 1px rgba(99,102,241,.3)}
.tool-icon{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.7em;transition:transform .2s}
.tool-card:hover .tool-icon{transform:scale(1.1)}
.tool-card h4{font-weight:700;font-size:1em;color:#f8fafc;margin-bottom:5px;transition:color .2s}
.tool-card:hover h4{color:#818cf8}
.tool-card p{font-size:.83em;color:var(--muted);line-height:1.5}
/* ANIMATION */
main{animation:fadeIn .4s ease-out}
@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`;
}
export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // --- 1. ROOT PATH (App Hub) ---
        if (url.pathname === "/") {
            return new Response(renderIndex(), {
                headers: { "Content-Type": "text/html; charset=utf-8" },
            });
        }

        // --- 2. CSS STYLESHEET ---
        if (url.pathname === "/style.css") {
            return new Response(renderCSS(), {
                headers: { "Content-Type": "text/css" },
            });
        }

        // --- 404 NOT FOUND ---
        return new Response("404 - Page Not Found", { status: 404 });
    }
};

// --- HTML TEMPLATES ---

function renderIndex() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>111iridescence | App Hub</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="/style.css">
    <script>
        tailwind.config = {
            theme: { 
                extend: { 
                    colors: { 
                        iri: '#6366f1', 
                        iriDark: '#4f46e5', 
                        accent: '#f43f5e',
                        bgMain: '#0f1117',
                        cardBg: '#161b22',
                        cardHover: '#1c2128',
                        borderMuted: 'rgba(255,255,255,0.08)'
                    },
                    fontFamily: { sans: ['Inter', 'sans-serif'] }
                } 
            }
        }
    </script>
</head>
<body class="h-screen flex flex-col overflow-hidden text-slate-200 font-sans bg-bgMain">
    <header class="bg-cardBg border-b border-borderMuted h-16 flex items-center px-6 justify-between flex-shrink-0 z-20 shadow-sm">
        <div class="flex items-center gap-3 select-none">
            <div class="w-8 h-8 bg-gradient-to-br from-iri to-accent rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(99,102,241,0.5)]">111</div>
            <h1 class="font-bold text-xl tracking-tight text-white">111<span class="text-iri">iridescence</span></h1>
        </div>
        <a href="/auth/login" class="flex items-center gap-2 text-sm font-semibold text-white bg-iri hover:bg-iriDark px-4 py-2 rounded-xl border border-iri/30 shadow-[0_0_12px_rgba(99,102,241,0.3)] transition-all hover:shadow-[0_0_18px_rgba(99,102,241,0.45)] hover:-translate-y-px">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
            Sign In
        </a>
    </header>
    <main class="flex-1 overflow-y-auto p-6 md:p-10 fade-in">
        <div class="max-w-7xl mx-auto space-y-12 pb-20">
            <div>
                <h2 class="text-4xl font-extrabold mb-2 text-white tracking-tight">App Hub</h2>
                <p class="text-lg text-slate-400 max-w-2xl">Access all your tools, vaults, and projects from one secure location.</p>
            </div>
            <section>
                <div class="flex items-center gap-2 mb-6"><span class="text-2xl drop-shadow-md pb-1">✨</span><h3 class="text-xl font-bold text-slate-100">Iridescent Cloud</h3></div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <a href="/vault" class="tool-card bg-cardBg p-6 rounded-2xl border border-borderMuted text-left flex flex-col items-start gap-4 no-underline group hover:bg-cardHover">
                        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-slate-500/10 text-slate-300 transition-transform group-hover:scale-110 shadow-inner">🔒</div>
                        <div><h4 class="font-bold text-lg text-slate-100 group-hover:text-iri transition-colors">Vault</h4><p class="text-sm text-slate-400 mt-1 leading-relaxed">Secure personal storage and data archive.</p></div>
                    </a>
                    <a href="/habits" class="tool-card bg-cardBg p-6 rounded-2xl border border-borderMuted text-left flex flex-col items-start gap-4 no-underline group hover:bg-cardHover">
                        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-orange-500/10 text-orange-400 transition-transform group-hover:scale-110 shadow-inner">📈</div>
                        <div><h4 class="font-bold text-lg text-slate-100 group-hover:text-iri transition-colors">Habits Tracker</h4><p class="text-sm text-slate-400 mt-1 leading-relaxed">Daily routines, goals, and progress monitoring.</p></div>
                    </a>
                    <a href="/todo" class="tool-card bg-cardBg p-6 rounded-2xl border border-borderMuted text-left flex flex-col items-start gap-4 no-underline group hover:bg-cardHover">
                        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-blue-500/10 text-blue-400 transition-transform group-hover:scale-110 shadow-inner">✅</div>
                        <div><h4 class="font-bold text-lg text-slate-100 group-hover:text-iri transition-colors">Todo List</h4><p class="text-sm text-slate-400 mt-1 leading-relaxed">Task management and productivity tracking.</p></div>
                    </a>
                </div>
            </section>
            <hr class="border-borderMuted">
            <section>
                <div class="flex items-center gap-2 mb-6"><span class="text-2xl drop-shadow-md pb-1">🛠️</span><h3 class="text-xl font-bold text-slate-100">Tools</h3></div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <a href="/pdf" class="tool-card bg-cardBg p-6 rounded-2xl border border-borderMuted text-left flex flex-col items-start gap-4 no-underline group hover:bg-cardHover">
                        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-indigo-500/10 text-indigo-400 transition-transform group-hover:scale-110 shadow-inner">📚</div>
                        <div><h4 class="font-bold text-lg text-slate-100 group-hover:text-iri transition-colors">111 PDF Tools</h4><p class="text-sm text-slate-400 mt-1 leading-relaxed">Secure, client-side PDF editing and merging suite.</p></div>
                    </a>
                    <a href="/converter" class="tool-card bg-cardBg p-6 rounded-2xl border border-borderMuted text-left flex flex-col items-start gap-4 no-underline group hover:bg-cardHover">
                        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-emerald-500/10 text-emerald-400 transition-transform group-hover:scale-110 shadow-inner">🔄</div>
                        <div><h4 class="font-bold text-lg text-slate-100 group-hover:text-iri transition-colors">111 Converter</h4><p class="text-sm text-slate-400 mt-1 leading-relaxed">Fast universal file conversion utility.</p></div>
                    </a>
                </div>
            </section>
        </div>
    </main>
</body>
</html>`;
}

function renderCSS() {
    return `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
/* Animations */
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { 
    from { opacity: 0; transform: translateY(15px); } 
    to { opacity: 1; transform: translateY(0); } 
}
/* Card Interactive Styling */
.tool-card {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
}
.tool-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.4);
    border-color: transparent;
}`;
}
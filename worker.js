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
                    colors: { iri: '#6366f1', iriDark: '#4338ca', accent: '#f43f5e' },
                    fontFamily: { sans: ['Inter', 'sans-serif'] }
                } 
            }
        }
    </script>
</head>
<body class="h-screen flex flex-col overflow-hidden text-slate-800 font-sans bg-slate-50">
    <header class="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between flex-shrink-0 z-20">
        <div class="flex items-center gap-3 select-none">
            <div class="w-8 h-8 bg-gradient-to-br from-iri to-accent rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">111</div>
            <h1 class="font-bold text-xl tracking-tight">111<span class="text-iri">iridescence</span></h1>
        </div>
        <div class="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ALL SYSTEMS OPERATIONAL
        </div>
    </header>
    <main class="flex-1 overflow-y-auto p-6 md:p-10 fade-in">
        <div class="max-w-7xl mx-auto space-y-12 pb-20">
            <div>
                <h2 class="text-4xl font-extrabold mb-2 text-slate-900 tracking-tight">App Hub</h2>
                <p class="text-lg text-slate-500 max-w-2xl">Access all your tools, vaults, and projects from one secure location.</p>
            </div>
            <section>
                <div class="flex items-center gap-2 mb-6"><span class="text-2xl">🛠️</span><h3 class="text-xl font-bold text-slate-800">Tools</h3></div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <a href="/pdf" class="tool-card bg-white p-6 rounded-2xl border border-slate-200 text-left flex flex-col items-start gap-4 no-underline group">
                        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110">📚</div>
                        <div><h4 class="font-bold text-lg text-slate-800">111 PDF Tools</h4><p class="text-sm text-slate-500 mt-1 leading-relaxed">Secure, client-side PDF editing and merging suite.</p></div>
                    </a>
                    <a href="/converter" class="tool-card bg-white p-6 rounded-2xl border border-slate-200 text-left flex flex-col items-start gap-4 no-underline group">
                        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">🔄</div>
                        <div><h4 class="font-bold text-lg text-slate-800">111 Converter</h4><p class="text-sm text-slate-500 mt-1 leading-relaxed">Fast universal file conversion utility.</p></div>
                    </a>
                </div>
            </section>
            <hr class="border-slate-200">
            <section>
                <div class="flex items-center gap-2 mb-6"><span class="text-2xl">✨</span><h3 class="text-xl font-bold text-slate-800">Other Webapps</h3></div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <a href="/vault" class="tool-card bg-white p-6 rounded-2xl border border-slate-200 text-left flex flex-col items-start gap-4 no-underline group">
                        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-slate-100 text-slate-600 transition-transform group-hover:scale-110">🔒</div>
                        <div><h4 class="font-bold text-lg text-slate-800">Vault</h4><p class="text-sm text-slate-500 mt-1 leading-relaxed">Secure personal storage and data archive.</p></div>
                    </a>
                    <a href="/habits" class="tool-card bg-white p-6 rounded-2xl border border-slate-200 text-left flex flex-col items-start gap-4 no-underline group">
                        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-orange-50 text-orange-600 transition-transform group-hover:scale-110">📈</div>
                        <div><h4 class="font-bold text-lg text-slate-800">Habits Tracker</h4><p class="text-sm text-slate-500 mt-1 leading-relaxed">Daily routines, goals, and progress monitoring.</p></div>
                    </a>
                    <a href="/todo" class="tool-card bg-white p-6 rounded-2xl border border-slate-200 text-left flex flex-col items-start gap-4 no-underline group">
                        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110">✅</div>
                        <div><h4 class="font-bold text-lg text-slate-800">Todo List</h4><p class="text-sm text-slate-500 mt-1 leading-relaxed">Task management and productivity tracking.</p></div>
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
    box-shadow: 0 12px 20px -8px rgba(99, 102, 241, 0.25);
    border-color: #6366f1; /* 111iridescence Indigo */
}`;
}
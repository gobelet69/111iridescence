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

    // --- 3. CONVERTER APP ---
    if (url.pathname === "/converter") {
      return new Response(renderConverter(), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // --- 4. PDF TOOLS APP ---
    if (url.pathname === "/pdf") {
      return new Response(renderPDFTools(), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
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
}
/* Converter Styles */
.drag-over {
    background-color: #e0e7ff !important;
    border: 2px dashed #6366f1;
}
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.progress-bar { transition: width 0.2s linear; }
/* PDF Tools Styles */
.sortable-ghost {
    opacity: 0.4;
    background: #e0e7ff;
    border: 2px dashed #6366f1;
}
.sortable-drag {
    cursor: grabbing;
    opacity: 1;
    background: white;
    transform: scale(1.05) rotate(2deg);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    z-index: 100;
}
.drag-handle {
    cursor: grab;
    touch-action: none;
}
.drag-handle:active { cursor: grabbing; }
.thumb-area {
    transition: all 0.15s ease;
    border: 3px solid transparent;
}
.thumb-area.selected {
    border-color: #6366f1;
    background-color: #e0e7ff;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
    transform: scale(0.95);
}
.thumb-area.selected::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 2rem;
    color: #6366f1;
    font-weight: bold;
    z-index: 20;
    background: rgba(255, 255, 255, 0.9);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.loader {
    border: 3px solid rgba(255,255,255,0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
}`;
}

function renderConverter() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>111iridescence | Universal Converter</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="/style.css">

    <script>
        tailwind.config = {
            theme: { 
                extend: { 
                    colors: { 
                        iri: '#6366f1', 
                        iriDark: '#4338ca', 
                        accent: '#f43f5e',
                    },
                    fontFamily: { sans: ['Inter', 'sans-serif'] }
                } 
            }
        }
    </script>

    <script src="https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js"></script>
</head>
<body class="h-screen flex flex-col overflow-hidden text-slate-800 font-sans bg-slate-50">

    <header class="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between flex-shrink-0 z-20">
        <div class="flex items-center gap-3 cursor-pointer select-none" onclick="window.location.href='/'">
            <div class="w-8 h-8 bg-gradient-to-br from-iri to-accent rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">111</div>
            <h1 class="font-bold text-xl tracking-tight">111<span class="text-iri">converter</span></h1>
        </div>
        <div id="engine-status" class="flex items-center gap-2 text-xs font-semibold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
            <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            Loading Engine...
        </div>
    </header>

    <main class="flex-1 overflow-hidden relative flex flex-col">
        
        <div class="bg-white border-b border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between shadow-sm z-10 gap-4">
            <div class="text-sm text-slate-500 font-medium">
                Supports: <span class="text-slate-800">Video, Audio, Images</span>
            </div>

            <div class="flex items-center gap-3">
                <button onclick="document.getElementById('folder-upload').click()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm border border-slate-200">
                    📂 Add Folder
                </button>
                <button onclick="document.getElementById('file-upload').click()" class="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md">
                    + Add Files
                </button>
                
                <button id="convert-all-btn" onclick="convertAll()" class="bg-iri hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-all opacity-50 cursor-not-allowed" disabled>
                    Convert All
                </button>
            </div>
        </div>

        <div id="drop-zone" class="flex-1 overflow-y-auto p-4 md:p-8 relative bg-slate-50">
            
            <div id="empty-state" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-100 transition-opacity">
                <div class="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-5xl mb-6 text-iri shadow-inner">♻️</div>
                <h3 class="text-2xl font-bold text-slate-700 mb-2">Universal Converter</h3>
                <p class="text-slate-500 text-center max-w-md">Drag & Drop files or folders here.<br>Convert MP4, AVI, MOV, MP3, WAV, PNG, JPG, WEBP and more.</p>
            </div>

            <div id="file-list" class="grid grid-cols-1 gap-4 max-w-5xl mx-auto pb-20 hidden">
                </div>
        </div>

        <input type="file" id="file-upload" class="hidden" multiple>
        <input type="file" id="folder-upload" class="hidden" multiple webkitdirectory directory>
    </main>

    <script>
${getConverterJS()}
    </script>

</body>
</html>`;
}

function getConverterJS() {
  return \`// --- CONFIGURATION ---
const { createFFmpeg, fetchFile } = FFmpeg;
let ffmpeg = null;

// Conversion Map: What can be converted to what?
const FORMATS = {
    video: ['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv', 'gif', 'mp3'], // Video can become audio
    audio: ['mp3', 'wav', 'aac', 'ogg', 'm4a', 'flac'],
    image: ['jpg', 'png', 'webp', 'bmp', 'tiff', 'ico', 'gif']
};

// MIME Type Sniffer
const getType = (file) => {
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('image/')) return 'image';
    // Fallback based on extension
    const ext = file.name.split('.').pop().toLowerCase();
    if (['mkv','avi','mov'].includes(ext)) return 'video';
    return 'unknown';
};

// State
let files = []; // { id, file, type, targetFormat, status, progress }

// --- DOM ---
const dom = {
    dropZone: document.getElementById('drop-zone'),
    fileList: document.getElementById('file-list'),
    empty: document.getElementById('empty-state'),
    status: document.getElementById('engine-status'),
    convertBtn: document.getElementById('convert-all-btn')
};

// --- INITIALIZE ENGINE ---
async function initFFmpeg() {
    try {
        ffmpeg = createFFmpeg({ log: true });
        await ffmpeg.load();
        
        dom.status.className = "flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200";
        dom.status.innerHTML = \\\`<span class="w-2 h-2 rounded-full bg-emerald-500"></span> Engine Ready\\\`;
        console.log("FFmpeg Loaded");
    } catch (e) {
        console.error(e);
        dom.status.innerHTML = "Engine Error (Check Headers)";
    }
}
initFFmpeg();

// --- DRAG & DROP & INPUTS ---
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dom.dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

dom.dropZone.addEventListener('dragenter', () => dom.dropZone.classList.add('drag-over'));
dom.dropZone.addEventListener('dragleave', () => dom.dropZone.classList.remove('drag-over'));
dom.dropZone.addEventListener('drop', (e) => {
    dom.dropZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
});

document.getElementById('file-upload').addEventListener('change', (e) => handleFiles(e.target.files));
document.getElementById('folder-upload').addEventListener('change', (e) => handleFiles(e.target.files));

// --- FILE HANDLING ---
function handleFiles(fileList) {
    if (!fileList.length) return;
    
    dom.empty.style.display = 'none';
    dom.fileList.classList.remove('hidden');
    dom.convertBtn.disabled = false;
    dom.convertBtn.classList.remove('opacity-50', 'cursor-not-allowed');

    Array.from(fileList).forEach(file => {
        const type = getType(file);
        if (type === 'unknown') return; // Skip unsupported

        const id = Math.random().toString(36).substr(2, 9);
        const ext = file.name.split('.').pop().toLowerCase();
        
        // Default targets
        let defaultTarget = 'mp4';
        if (type === 'audio') defaultTarget = 'mp3';
        if (type === 'image') defaultTarget = 'png';

        // Add to state
        files.push({ id, file, type, targetFormat: defaultTarget, status: 'idle' });
        
        // Render Card
        renderFileCard(id, file, type, defaultTarget);
    });
}

function renderFileCard(id, file, type, defaultTarget) {
    const div = document.createElement('div');
    div.id = \\\`card-\\\${id}\\\`;
    div.className = "bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4 fade-in";
    
    const icon = type === 'video' ? '🎬' : type === 'audio' ? '🎵' : '🖼️';
    const options = FORMATS[type].map(fmt => 
        \\\`<option value="\\\${fmt}" \\\${fmt === defaultTarget ? 'selected' : ''}> to \\\${fmt.toUpperCase()}</option>\\\`
    ).join('');

    div.innerHTML = \\\`
        <div class="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">\\\${icon}</div>
        
        <div class="flex-1 min-w-0 w-full text-center md:text-left">
            <h4 class="font-bold text-slate-700 truncate">\\\${file.name}</h4>
            <p class="text-xs text-slate-500">\\\${(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto justify-center">
            <span class="text-slate-400 text-sm">Convert to:</span>
            <select onchange="updateTarget('\\\${id}', this.value)" class="bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-iri focus:border-iri block p-2">
                \\\${options}
            </select>
        </div>

        <div id="action-\\\${id}" class="flex-shrink-0 w-full md:w-32">
             <div class="w-full bg-slate-200 rounded-full h-2.5 hidden" id="progress-container-\\\${id}">
                <div class="bg-iri h-2.5 rounded-full progress-bar" style="width: 0%" id="progress-\\\${id}"></div>
            </div>
            <div id="status-text-\\\${id}" class="text-xs text-center text-slate-500 mt-1">Ready</div>
        </div>

        <button onclick="removeFile('\\\${id}')" class="text-slate-400 hover:text-red-500 px-2">&times;</button>
    \\\`;
    
    dom.fileList.appendChild(div);
}

// --- LOGIC ---
function updateTarget(id, val) {
    const f = files.find(x => x.id === id);
    if(f) f.targetFormat = val;
}

function removeFile(id) {
    files = files.filter(f => f.id !== id);
    document.getElementById(\\\`card-\\\${id}\\\`).remove();
    if(files.length === 0) {
        dom.empty.style.display = 'flex';
        dom.fileList.classList.add('hidden');
        dom.convertBtn.disabled = true;
        dom.convertBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

async function convertAll() {
    if (!ffmpeg) return alert("Engine loading... please wait.");
    
    dom.convertBtn.disabled = true;
    dom.convertBtn.innerText = "Converting...";

    for (const f of files) {
        if (f.status === 'done') continue;
        await processFile(f);
    }

    dom.convertBtn.disabled = false;
    dom.convertBtn.innerText = "Convert All";
}

async function processFile(fObj) {
    const card = document.getElementById(\\\`card-\\\${fObj.id}\\\`);
    const progBar = document.getElementById(\\\`progress-\\\${fObj.id}\\\`);
    const progCont = document.getElementById(\\\`progress-container-\\\${fObj.id}\\\`);
    const statusTxt = document.getElementById(\\\`status-text-\\\${fObj.id}\\\`);
    const actionArea = document.getElementById(\\\`action-\\\${fObj.id}\\\`);

    progCont.classList.remove('hidden');
    statusTxt.innerText = "Processing...";
    fObj.status = 'processing';

    try {
        const { file, id, targetFormat } = fObj;
        const inputName = \\\`input_\\\${id}.\\\${file.name.split('.').pop()}\\\`;
        const outputName = \\\`output_\\\${id}.\\\${targetFormat}\\\`;

        // 1. Write File to Memory
        ffmpeg.FS('writeFile', inputName, await fetchFile(file));

        // 2. Run Command
        // Setup Progress Logger
        ffmpeg.setProgress(({ ratio }) => {
            progBar.style.width = \\\`\\\${ratio * 100}%\\\`;
            statusTxt.innerText = \\\`\\\${(ratio * 100).toFixed(0)}%\\\`;
        });

        // Basic FFmpeg command structure
        // -i input -strict -2 output
        await ffmpeg.run('-i', inputName, outputName);

        // 3. Read Result
        const data = ffmpeg.FS('readFile', outputName);

        // 4. Create Download Link
        const blob = new Blob([data.buffer], { type: \\\`\\\${fObj.type}/\\\${targetFormat}\\\` });
        const url = URL.createObjectURL(blob);

        // UI Update: Success
        actionArea.innerHTML = \\\`
            <a href="\\\${url}" download="\\\${file.name.split('.')[0]}.\\\${targetFormat}" class="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 px-4 rounded shadow block text-center">
                Download
            </a>
        \\\`;
        fObj.status = 'done';

        // Cleanup Memory
        ffmpeg.FS('unlink', inputName);
        ffmpeg.FS('unlink', outputName);

    } catch (err) {
        console.error(err);
        statusTxt.innerText = "Error";
        statusTxt.classList.add('text-red-500');
    }
}\`;
}

function renderPDFTools() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>111iridescence | PDF Tools</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="/style.css">

    <script>
        tailwind.config = {
            theme: { 
                extend: { 
                    colors: { 
                        iri: '#6366f1', 
                        iriDark: '#4338ca', 
                        accent: '#f43f5e',
                        selected: '#e0e7ff' 
                    },
                    fontFamily: { sans: ['Inter', 'sans-serif'] }
                } 
            }
        }
    </script>

    <script src="https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js"></script>
</head>
<body class="h-screen flex flex-col overflow-hidden text-slate-800 font-sans bg-slate-50">

    <header class="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between flex-shrink-0 z-20">
        <div class="flex items-center gap-3 cursor-pointer select-none" onclick="window.location.href='/'">
            <div class="w-8 h-8 bg-gradient-to-br from-iri to-accent rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">111</div>
            <h1 class="font-bold text-xl tracking-tight">111<span class="text-iri">iridescence</span></h1>
        </div>
        <div class="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            CLIENT-SIDE ONLY
        </div>
    </header>

    <main class="flex-1 overflow-hidden relative">
        
        <div id="view-dashboard" class="h-full overflow-y-auto p-6 md:p-10 fade-in">
            <div class="max-w-7xl mx-auto">
                <div class="mb-12">
                    <h2 class="text-3xl font-bold mb-2 text-slate-900">PDF Tools</h2>
                    <p class="text-slate-500">Secure processing in your browser.</p>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="tool-grid">
                    </div>
            </div>
        </div>

        <div id="view-workspace" class="hidden h-full flex flex-col bg-slate-50">
            <div class="bg-white border-b border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between shadow-sm z-10 gap-4">
                <div class="flex items-center gap-4 w-full md:w-auto">
                    <button onclick="goHome()" class="text-slate-500 hover:text-slate-800 font-medium px-2 py-1 hover:bg-slate-100 rounded">← Back</button>
                    <div class="h-6 w-px bg-slate-200 hidden md:block"></div>
                    <h2 id="tool-name" class="font-bold text-lg text-slate-800">Tool Name</h2>
                </div>
                
                <div id="tool-settings" class="flex-1 flex flex-wrap items-center justify-center md:justify-end gap-3"></div>

                <div class="flex items-center gap-2 w-full md:w-auto justify-end">
                    <button onclick="document.getElementById('file-upload').click()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm border border-slate-200">
                        + Add Files
                    </button>
                    <button id="btn-process" onclick="processFiles()" class="bg-iri hover:bg-iriDark text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-all flex items-center gap-2">
                        Download PDF
                    </button>
                </div>
            </div>

            <div id="canvas-area" class="flex-1 overflow-y-auto p-4 md:p-8 relative">
                <div id="empty-state" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-60">
                    <div class="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-4xl mb-4 text-slate-400">📂</div>
                    <h3 class="text-xl font-bold text-slate-400">Drop files here</h3>
                </div>
                <div id="grid-container" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6 max-w-7xl mx-auto pb-20"></div>
            </div>
            <input type="file" id="file-upload" class="hidden" multiple>
        </div>

    </main>

    <div id="toast" class="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-4 rounded-lg shadow-2xl transform translate-y-32 opacity-0 transition-all duration-300 z-50 flex items-center gap-4">
        <div class="loader"></div>
        <span id="toast-msg" class="font-medium">Processing...</span>
    </div>

    <script>
${getPDFToolsJS()}
    </script>

</body>
</html>`;
}

function getPDFToolsJS() {
  return \`// --- INIT WORKER ---
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// --- CONFIGURATION ---
const TOOLS = [
    { id: 'merge', icon: '📚', color: 'bg-indigo-50 text-indigo-600', title: "Merge PDF", desc: "Combine multiple files & reorder pages." },
    { id: 'organize', icon: '✂️', color: 'bg-rose-50 text-rose-500', title: "Split & Edit", desc: "Rotate, delete, or extract specific pages.", type: 'pages' },
    { id: 'img2pdf', icon: '🖼️', color: 'bg-emerald-50 text-emerald-600', title: "Image to PDF", desc: "Convert JPG/PNG to PDF documents.", accept: "image/*" },
    { id: 'watermark', icon: '💧', color: 'bg-blue-50 text-blue-500', title: "Watermark", desc: "Add text overlay to pages.", inputs: [
        { id: 'wm-text', type: 'text', placeholder: 'Watermark Text', width: 'w-48' },
        { id: 'wm-color', type: 'select', options: ['Red', 'Grey', 'Blue'], width: 'w-24' }
    ]},
    { id: 'numbers', icon: '🔢', color: 'bg-slate-50 text-slate-600', title: "Page Numbers", desc: "Add pagination to footer." },
    { id: 'protect', icon: '🔒', color: 'bg-orange-50 text-orange-600', title: "Protect", desc: "Encrypt with password.", inputs: [
        { id: 'pass-set', type: 'password', placeholder: 'Set Password', width: 'w-40' }
    ]},
    { id: 'unlock', icon: '🔓', color: 'bg-teal-50 text-teal-600', title: "Unlock", desc: "Remove PDF password.", inputs: [
        { id: 'pass-unlock', type: 'password', placeholder: 'Original Password', width: 'w-40' }
    ]},
    { id: 'metadata', icon: '🏷️', color: 'bg-purple-50 text-purple-600', title: "Metadata", desc: "Edit Title & Author.", inputs: [
        { id: 'meta-title', type: 'text', placeholder: 'New Title', width: 'w-40' },
        { id: 'meta-author', type: 'text', placeholder: 'New Author', width: 'w-40' }
    ]},
    { id: 'flatten', icon: '🔨', color: 'bg-gray-50 text-gray-600', title: "Flatten", desc: "Make forms un-editable." }
];

// --- APP STATE ---
const app = {
    activeTool: null,
    files: [],
    sortable: null
};

const dom = {
    dash: document.getElementById('view-dashboard'),
    grid: document.getElementById('tool-grid'),
    work: document.getElementById('view-workspace'),
    workGrid: document.getElementById('grid-container'),
    settings: document.getElementById('tool-settings'),
    title: document.getElementById('tool-name'),
    empty: document.getElementById('empty-state'),
    input: document.getElementById('file-upload'),
    toast: document.getElementById('toast'),
    toastMsg: document.getElementById('toast-msg')
};

// --- INITIALIZATION ---
function initDashboard() {
    dom.grid.innerHTML = '';
    TOOLS.forEach(t => {
        const div = document.createElement('button');
        div.className = 'tool-card bg-white p-6 rounded-2xl border border-slate-200 text-left flex flex-col items-start gap-4';
        div.onclick = () => launchTool(t.id);
        div.innerHTML = \\\`
            <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl \\\${t.color}">
                \\\${t.icon}
            </div>
            <div>
                <h4 class="font-bold text-lg text-slate-800">\\\${t.title}</h4>
                <p class="text-sm text-slate-500 mt-1 leading-relaxed">\\\${t.desc}</p>
            </div>
        \\\`;
        dom.grid.appendChild(div);
    });
}
initDashboard();

// --- NAVIGATION ---
function launchTool(toolId) {
    app.activeTool = toolId;
    const conf = TOOLS.find(t => t.id === toolId);
    
    dom.dash.classList.add('hidden');
    dom.work.classList.remove('hidden');
    dom.title.innerText = conf.title;
    dom.input.accept = conf.accept || ".pdf";
    dom.input.value = '';
    
    renderSettings(conf.inputs || []);
    initSortable();
}

function goHome() {
    dom.work.classList.add('hidden');
    dom.dash.classList.remove('hidden');
    resetWorkspace();
}

function renderSettings(inputs) {
    dom.settings.innerHTML = '';
    
    if (app.activeTool === 'organize') {
        const grp = document.createElement('div');
        grp.className = 'flex gap-2 bg-slate-100 p-1.5 rounded-lg';
        grp.innerHTML = \\\`
            <button onclick="rotateSelected(90)" class="px-3 py-1.5 bg-white rounded shadow-sm text-sm font-semibold hover:text-iri">↻ 90°</button>
            <button onclick="deleteSelected()" class="px-3 py-1.5 bg-white rounded shadow-sm text-sm font-semibold hover:text-red-600 text-red-500">🗑 Delete</button>
        \\\`;
        dom.settings.appendChild(grp);
    }

    inputs.forEach(inp => {
        if (inp.type === 'select') {
            const sel = document.createElement('select');
            sel.id = inp.id;
            sel.className = \\\`p-2 rounded-lg border border-slate-300 text-sm focus:border-iri focus:ring-1 focus:ring-iri outline-none \\\${inp.width}\\\`;
            inp.options.forEach(o => {
                const opt = document.createElement('option');
                opt.value = o;
                opt.innerText = o;
                sel.appendChild(opt);
            });
            dom.settings.appendChild(sel);
        } else {
            const i = document.createElement('input');
            i.id = inp.id;
            i.type = inp.type;
            i.placeholder = inp.placeholder;
            i.className = \\\`p-2 rounded-lg border border-slate-300 text-sm focus:border-iri focus:ring-1 focus:ring-iri outline-none \\\${inp.width}\\\`;
            dom.settings.appendChild(i);
        }
    });
}

// --- FILE LOGIC ---
dom.input.addEventListener('change', async (e) => {
    if (!e.target.files.length) return;
    showToast("Processing files...", true);
    dom.empty.classList.add('hidden');
    
    for (const file of e.target.files) {
        await addFileToGrid(file);
    }
    hideToast();
});

async function addFileToGrid(file) {
    const id = Math.random().toString(36).substr(2, 9);
    const isPdf = file.type === 'application/pdf';
    const conf = TOOLS.find(t => t.id === app.activeTool);

    // MODE A: Page Editor (Render all pages)
    if (conf.type === 'pages' && isPdf) {
        const buff = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(buff).promise;
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const div = createCard(id, true);
            div.dataset.fileId = id;
            div.dataset.pageIdx = i - 1;
            div.dataset.rotation = 0;
            
            await renderThumbnail(pdf, i, div.querySelector('.thumb-area'));
            
            const num = document.createElement('span');
            num.className = 'absolute bottom-2 right-2 bg-slate-900/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded';
            num.innerText = i;
            div.querySelector('.thumb-area').appendChild(num);

            // Selection Logic
            div.onclick = (e) => {
                if (!e.target.closest('.drag-handle')) {
                    div.querySelector('.thumb-area').classList.toggle('selected');
                }
            };
            dom.workGrid.appendChild(div);
        }
        app.files.push({ id, file, buffer: buff });
    } 
    // MODE B: File Cards
    else {
        const div = createCard(id, false);
        div.dataset.fileId = id;
        
        const thumbArea = div.querySelector('.thumb-area');
        if (isPdf) {
            const buff = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(buff).promise;
            await renderThumbnail(pdf, 1, thumbArea);
        } else {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.className = 'w-full h-full object-contain';
            thumbArea.appendChild(img);
        }
        
        const name = document.createElement('div');
        name.className = 'p-3 text-xs font-semibold text-slate-700 truncate bg-white border-t border-slate-100';
        name.innerText = file.name;
        div.appendChild(name);

        dom.workGrid.appendChild(div);
        app.files.push({ id, file });
    }
}

function createCard(id, isPage) {
    const div = document.createElement('div');
    div.className = 'group relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-all select-none';
    
    // Drag Handle
    const handle = document.createElement('div');
    handle.className = 'drag-handle absolute top-2 left-2 bg-white p-1.5 rounded shadow-sm border border-slate-100 cursor-grab z-10 text-slate-400 hover:text-iri transition-colors';
    handle.innerHTML = \\\`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>\\\`;
    div.appendChild(handle);

    // Delete Button
    const del = document.createElement('button');
    del.className = 'absolute top-2 right-2 bg-white text-slate-400 hover:text-red-500 w-7 h-7 rounded shadow-sm border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10';
    del.innerHTML = '&times;';
    del.onclick = (e) => { e.stopPropagation(); div.remove(); };
    div.appendChild(del);

    // Thumbnail
    const thumb = document.createElement('div');
    thumb.className = \\\`thumb-area w-full \\\${isPage ? 'h-56' : 'h-40'} bg-slate-50 relative overflow-hidden flex items-center justify-center\\\`;
    div.appendChild(thumb);

    return div;
}

async function renderThumbnail(pdf, pageNum, container) {
    try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.6 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.className = 'w-full h-full object-contain';
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        container.appendChild(canvas);
    } catch (e) {
        container.innerText = "Preview N/A";
    }
}

// --- DRAG & DROP ---
function initSortable() {
    if (app.sortable) app.sortable.destroy();
    app.sortable = new Sortable(dom.workGrid, {
        animation: 200,
        handle: '.drag-handle',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onStart: () => document.body.style.cursor = 'grabbing',
        onEnd: () => document.body.style.cursor = 'default'
    });
}

// --- ACTIONS ---
function rotateSelected(deg) {
    document.querySelectorAll('.thumb-area.selected').forEach(el => {
        const card = el.closest('div[data-rotation]');
        let r = parseInt(card.dataset.rotation) || 0;
        r = (r + deg) % 360;
        card.dataset.rotation = r;
        el.querySelector('canvas').style.transform = \\\`rotate(\\\${r}deg)\\\`;
    });
}

function deleteSelected() {
    document.querySelectorAll('.thumb-area.selected').forEach(el => {
        el.closest('.group').remove();
    });
}

function resetWorkspace() {
    app.files = [];
    app.activeTool = null;
    dom.workGrid.innerHTML = '';
    dom.empty.classList.remove('hidden');
}

// --- PROCESSING ENGINE ---
async function processFiles() {
    if (dom.workGrid.children.length === 0) return alert("Please add files first.");
    showToast("Generating PDF...", true);
    
    const { PDFDocument, rgb, degrees, StandardFonts } = PDFLib;

    try {
        const newPdf = await PDFDocument.create();
        const cards = Array.from(dom.workGrid.children);
        const conf = TOOLS.find(t => t.id === app.activeTool);

        // A. PAGE BASED (Organize)
        if (conf.type === 'pages') {
            const pdfCache = {};
            for (const f of app.files) pdfCache[f.id] = await PDFDocument.load(f.buffer);

            for (const card of cards) {
                const fid = card.dataset.fileId;
                const pIdx = parseInt(card.dataset.pageIdx);
                const rot = parseInt(card.dataset.rotation);
                
                const [page] = await newPdf.copyPages(pdfCache[fid], [pIdx]);
                if (rot !== 0) page.setRotation(degrees(page.getRotation().angle + rot));
                newPdf.addPage(page);
            }
        } 
        // B. FILE BASED (Merge/Utils)
        else {
            for (const card of cards) {
                const fObj = app.files.find(f => f.id === card.dataset.fileId);
                
                if (fObj.file.type.includes('image')) {
                    const imgBuff = await fObj.file.arrayBuffer();
                    let img = fObj.file.type.includes('png') ? await newPdf.embedPng(imgBuff) : await newPdf.embedJpg(imgBuff);
                    const p = newPdf.addPage([img.width, img.height]);
                    p.drawImage(img, {x:0, y:0, width: img.width, height: img.height});
                } else {
                    const srcBuff = await fObj.file.arrayBuffer();
                    let srcPdf;
                    
                    if (app.activeTool === 'unlock') {
                        const pass = document.getElementById('pass-unlock').value;
                        try { srcPdf = await PDFDocument.load(srcBuff, { password: pass }); }
                        catch { throw new Error("Incorrect Password"); }
                    } else {
                        srcPdf = await PDFDocument.load(srcBuff);
                    }
                    
                    const pgs = await newPdf.copyPages(srcPdf, srcPdf.getPageIndices());
                    pgs.forEach(p => newPdf.addPage(p));
                }
            }
        }

        // --- MODIFIERS ---
        const pages = newPdf.getPages();

        if (app.activeTool === 'watermark') {
            const text = document.getElementById('wm-text').value || 'DRAFT';
            const colorName = document.getElementById('wm-color').value;
            const col = colorName === 'Red' ? [1,0,0] : colorName === 'Blue' ? [0,0,1] : [0.5,0.5,0.5];
            const font = await newPdf.embedFont(StandardFonts.HelveticaBold);
            
            pages.forEach(p => {
                const {width, height} = p.getSize();
                p.drawText(text, {
                    x: width/2 - (text.length*15), y: height/2,
                    size: 60, font: font, color: rgb(...col),
                    opacity: 0.3, rotate: degrees(45)
                });
            });
        }

        if (app.activeTool === 'numbers') {
            const font = await newPdf.embedFont(StandardFonts.Courier);
            pages.forEach((p, i) => {
                p.drawText(\\\`\\\${i+1} / \\\${pages.length}\\\`, {
                    x: p.getWidth() - 100, y: 20, size: 10, font: font, color: rgb(0,0,0)
                });
            });
        }

        if (app.activeTool === 'metadata') {
            const t = document.getElementById('meta-title').value;
            const a = document.getElementById('meta-author').value;
            if(t) newPdf.setTitle(t);
            if(a) newPdf.setAuthor(a);
        }

        if (app.activeTool === 'flatten') newPdf.getForm().flatten();
        if (app.activeTool === 'protect') {
            const pw = document.getElementById('pass-set').value;
            if (pw) newPdf.encrypt({ userPassword: pw, ownerPassword: pw });
        }

        // DOWNLOAD
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = \\\`111iridescence_\\\${app.activeTool}.pdf\\\`;
        link.click();

        showToast("Success! Downloading...", false);
        setTimeout(hideToast, 2000);

    } catch (err) {
        console.error(err);
        alert(err.message);
        hideToast();
    }
}

function showToast(msg, loading) {
    dom.toastMsg.innerText = msg;
    dom.toast.classList.remove('translate-y-32', 'opacity-0');
    dom.toast.querySelector('.loader').style.display = loading ? 'block' : 'none';
}

function hideToast() {
    dom.toast.classList.add('translate-y-32', 'opacity-0');
}\`;
}
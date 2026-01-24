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

// --- HTML TEMPLATES ---

function renderIndex() {
  return '<!DOCTYPE html>' +
'<html lang="en">' +
'<head>' +
'    <meta charset="UTF-8">' +
'    <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
'    <title>111iridescence | App Hub</title>' +
'    <script src="https://cdn.tailwindcss.com"></script>' +
'    <link rel="stylesheet" href="/style.css">' +
'    <script>' +
'        tailwind.config = {' +
'            theme: { ' +
'                extend: { ' +
'                    colors: { iri: "#6366f1", iriDark: "#4338ca", accent: "#f43f5e" },' +
'                    fontFamily: { sans: ["Inter", "sans-serif"] }' +
'                } ' +
'            }' +
'        }' +
'    </script>' +
'</head>' +
'<body class="h-screen flex flex-col overflow-hidden text-slate-800 font-sans bg-slate-50">' +
'    <header class="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between flex-shrink-0 z-20">' +
'        <div class="flex items-center gap-3 select-none">' +
'            <div class="w-8 h-8 bg-gradient-to-br from-iri to-accent rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">111</div>' +
'            <h1 class="font-bold text-xl tracking-tight">111<span class="text-iri">iridescence</span></h1>' +
'        </div>' +
'        <div class="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">' +
'            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>' +
'            ALL SYSTEMS OPERATIONAL' +
'        </div>' +
'    </header>' +
'    <main class="flex-1 overflow-y-auto p-6 md:p-10 fade-in">' +
'        <div class="max-w-7xl mx-auto space-y-12 pb-20">' +
'            <div>' +
'                <h2 class="text-4xl font-extrabold mb-2 text-slate-900 tracking-tight">App Hub</h2>' +
'                <p class="text-lg text-slate-500 max-w-2xl">Access all your tools, vaults, and projects from one secure location.</p>' +
'            </div>' +
'            <section>' +
'                <div class="flex items-center gap-2 mb-6"><span class="text-2xl">🛠️</span><h3 class="text-xl font-bold text-slate-800">Tools</h3></div>' +
'                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">' +
'                    <a href="/pdf" class="tool-card bg-white p-6 rounded-2xl border border-slate-200 text-left flex flex-col items-start gap-4 no-underline group">' +
'                        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110">📚</div>' +
'                        <div><h4 class="font-bold text-lg text-slate-800">111 PDF Tools</h4><p class="text-sm text-slate-500 mt-1 leading-relaxed">Secure, client-side PDF editing and merging suite.</p></div>' +
'                    </a>' +
'                    <a href="/converter" class="tool-card bg-white p-6 rounded-2xl border border-slate-200 text-left flex flex-col items-start gap-4 no-underline group">' +
'                        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">🔄</div>' +
'                        <div><h4 class="font-bold text-lg text-slate-800">111 Converter</h4><p class="text-sm text-slate-500 mt-1 leading-relaxed">Fast universal file conversion utility.</p></div>' +
'                    </a>' +
'                </div>' +
'            </section>' +
'            <hr class="border-slate-200">' +
'            <section>' +
'                <div class="flex items-center gap-2 mb-6"><span class="text-2xl">✨</span><h3 class="text-xl font-bold text-slate-800">Other Webapps</h3></div>' +
'                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">' +
'                    <a href="/vault" class="tool-card bg-white p-6 rounded-2xl border border-slate-200 text-left flex flex-col items-start gap-4 no-underline group">' +
'                        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-slate-100 text-slate-600 transition-transform group-hover:scale-110">🔒</div>' +
'                        <div><h4 class="font-bold text-lg text-slate-800">Vault</h4><p class="text-sm text-slate-500 mt-1 leading-relaxed">Secure personal storage and data archive.</p></div>' +
'                    </a>' +
'                    <a href="/habits" class="tool-card bg-white p-6 rounded-2xl border border-slate-200 text-left flex flex-col items-start gap-4 no-underline group">' +
'                        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-orange-50 text-orange-600 transition-transform group-hover:scale-110">📈</div>' +
'                        <div><h4 class="font-bold text-lg text-slate-800">Habits Tracker</h4><p class="text-sm text-slate-500 mt-1 leading-relaxed">Daily routines, goals, and progress monitoring.</p></div>' +
'                    </a>' +
'                </div>' +
'            </section>' +
'        </div>' +
'    </main>' +
'</body>' +
'</html>';
}

function renderConverter() {
  const converterJS = getConverterJS();
  return '<!DOCTYPE html>' +
'<html lang="en">' +
'<head>' +
'    <meta charset="UTF-8">' +
'    <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
'    <title>111iridescence | Universal Converter</title>' +
'    <script src="https://cdn.tailwindcss.com"></script>' +
'    <link rel="stylesheet" href="/style.css">' +
'    <script>' +
'        tailwind.config = {' +
'            theme: { ' +
'                extend: { ' +
'                    colors: { ' +
'                        iri: "#6366f1", ' +
'                        iriDark: "#4338ca", ' +
'                        accent: "#f43f5e",' +
'                    },' +
'                    fontFamily: { sans: ["Inter", "sans-serif"] }' +
'                } ' +
'            }' +
'        }' +
'    </script>' +
'    <script src="https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js"></script>' +
'    <script src="https://unpkg.com/mammoth@1.6.0/mammoth.browser.min.js"></script>' +
'    <script src="https://unpkg.com/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js"></script>' +
'</head>' +
'<body class="h-screen flex flex-col overflow-hidden text-slate-800 font-sans bg-slate-50">' +
'    <header class="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between flex-shrink-0 z-20">' +
'        <div class="flex items-center gap-3 cursor-pointer select-none" onclick="window.location.href=' + "'/'" + '">' +
'            <div class="w-8 h-8 bg-gradient-to-br from-iri to-accent rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">111</div>' +
'            <h1 class="font-bold text-xl tracking-tight">111<span class="text-iri">converter</span></h1>' +
'        </div>' +
'        <div id="engine-status" class="flex items-center gap-2 text-xs font-semibold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">' +
'            <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>' +
'            Loading Engine...' +
'        </div>' +
'    </header>' +
'    <main class="flex-1 overflow-hidden relative flex flex-col">' +
'        <div class="bg-white border-b border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between shadow-sm z-10 gap-4">' +
'            <div class="text-sm text-slate-500 font-medium">' +
'                Supports: <span class="text-slate-800">Video, Audio, Images, Documents</span>' +
'            </div>' +
'            <div class="flex items-center gap-3">' +
'                <button onclick="document.getElementById(' + "'folder-upload'" + ').click()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm border border-slate-200">' +
'                    📂 Add Folder' +
'                </button>' +
'                <button onclick="document.getElementById(' + "'file-upload'" + ').click()" class="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md">' +
'                    + Add Files' +
'                </button>' +
'                <button id="convert-all-btn" onclick="convertAll()" class="bg-iri hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-all opacity-50 cursor-not-allowed" disabled>' +
'                    Convert All' +
'                </button>' +
'            </div>' +
'        </div>' +
'        <div id="drop-zone" class="flex-1 overflow-y-auto p-4 md:p-8 relative bg-slate-50">' +
'            <div id="empty-state" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-100 transition-opacity">' +
'                <div class="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-5xl mb-6 text-iri shadow-inner">♻️</div>' +
'                <h3 class="text-2xl font-bold text-slate-700 mb-2">Universal Converter</h3>' +
'                <p class="text-slate-500 text-center max-w-md">Drag & Drop files or folders here.<br>Convert MP4, AVI, MOV, MP3, WAV, PNG, JPG, WEBP, DOCX and more.</p>' +
'            </div>' +
'            <div id="file-list" class="grid grid-cols-1 gap-4 max-w-5xl mx-auto pb-20 hidden">' +
'                </div>' +
'        </div>' +
'        <input type="file" id="file-upload" class="hidden" multiple>' +
'        <input type="file" id="folder-upload" class="hidden" multiple webkitdirectory directory>' +
'    </main>' +
'    <script>' + converterJS + '</script>' +
'</body>' +
'</html>';
}

function renderPDFTools() {
  const pdfJS = getPDFToolsJS();
  return '<!DOCTYPE html>' +
'<html lang="en">' +
'<head>' +
'    <meta charset="UTF-8">' +
'    <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
'    <title>111iridescence | PDF Tools</title>' +
'    <script src="https://cdn.tailwindcss.com"></script>' +
'    <link rel="stylesheet" href="/style.css">' +
'    <script>' +
'        tailwind.config = {' +
'            theme: { ' +
'                extend: { ' +
'                    colors: { ' +
'                        iri: "#6366f1", ' +
'                        iriDark: "#4338ca", ' +
'                        accent: "#f43f5e",' +
'                        selected: "#e0e7ff" ' +
'                    },' +
'                    fontFamily: { sans: ["Inter", "sans-serif"] }' +
'                } ' +
'            }' +
'        }' +
'    </script>' +
'    <script src="https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js"></script>' +
'    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>' +
'    <script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js"></script>' +
'</head>' +
'<body class="h-screen flex flex-col overflow-hidden text-slate-800 font-sans bg-slate-50">' +
'    <header class="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between flex-shrink-0 z-20">' +
'        <div class="flex items-center gap-3 cursor-pointer select-none" onclick="window.location.href=' + "'/'" + '">' +
'            <div class="w-8 h-8 bg-gradient-to-br from-iri to-accent rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">111</div>' +
'            <h1 class="font-bold text-xl tracking-tight">111<span class="text-iri">iridescence</span></h1>' +
'        </div>' +
'        <div class="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">' +
'            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>' +
'            CLIENT-SIDE ONLY' +
'        </div>' +
'    </header>' +
'    <main class="flex-1 overflow-hidden relative">' +
'        <div id="view-dashboard" class="h-full overflow-y-auto p-6 md:p-10 fade-in">' +
'            <div class="max-w-7xl mx-auto">' +
'                <div class="mb-12">' +
'                    <h2 class="text-3xl font-bold mb-2 text-slate-900">PDF Tools</h2>' +
'                    <p class="text-slate-500">Secure processing in your browser.</p>' +
'                </div>' +
'                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="tool-grid">' +
'                    </div>' +
'            </div>' +
'        </div>' +
'        <div id="view-workspace" class="hidden h-full flex flex-col bg-slate-50">' +
'            <div class="bg-white border-b border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between shadow-sm z-10 gap-4">' +
'                <div class="flex items-center gap-4 w-full md:w-auto">' +
'                    <button onclick="goHome()" class="text-slate-500 hover:text-slate-800 font-medium px-2 py-1 hover:bg-slate-100 rounded">← Back</button>' +
'                    <div class="h-6 w-px bg-slate-200 hidden md:block"></div>' +
'                    <h2 id="tool-name" class="font-bold text-lg text-slate-800">Tool Name</h2>' +
'                </div>' +
'                <div id="tool-settings" class="flex-1 flex flex-wrap items-center justify-center md:justify-end gap-3"></div>' +
'                <div class="flex items-center gap-2 w-full md:w-auto justify-end">' +
'                    <button onclick="document.getElementById(' + "'file-upload'" + ').click()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm border border-slate-200">' +
'                        + Add Files' +
'                    </button>' +
'                    <button id="btn-process" onclick="processFiles()" class="bg-iri hover:bg-iriDark text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-all flex items-center gap-2">' +
'                        Download PDF' +
'                    </button>' +
'                </div>' +
'            </div>' +
'            <div id="canvas-area" class="flex-1 overflow-y-auto p-4 md:p-8 relative">' +
'                <div id="empty-state" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-60">' +
'                    <div class="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-4xl mb-4 text-slate-400">📂</div>' +
'                    <h3 class="text-xl font-bold text-slate-400">Drop files here</h3>' +
'                </div>' +
'                <div id="grid-container" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6 max-w-7xl mx-auto pb-20"></div>' +
'            </div>' +
'            <input type="file" id="file-upload" class="hidden" multiple>' +
'        </div>' +
'    </main>' +
'    <div id="toast" class="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-4 rounded-lg shadow-2xl transform translate-y-32 opacity-0 transition-all duration-300 z-50 flex items-center gap-4">' +
'        <div class="loader"></div>' +
'        <span id="toast-msg" class="font-medium">Processing...</span>' +
'    </div>' +
'    <script>' + pdfJS + '</script>' +
'</body>' +
'</html>';
}

function getConverterJS() {
  return 'const { createFFmpeg, fetchFile } = FFmpeg;\n' +
'let ffmpeg = null;\n' +
'const FORMATS = {\n' +
'    video: ["mp4", "webm", "avi", "mov", "mkv", "flv", "gif", "mp3"],\n' +
'    audio: ["mp3", "wav", "aac", "ogg", "m4a", "flac"],\n' +
'    image: ["jpg", "png", "webp", "bmp", "tiff", "ico", "gif"],\n' +
'    document: ["pdf"]\n' +
'};\n' +
'const getType = (file) => {\n' +
'    if (file.type.startsWith("video/")) return "video";\n' +
'    if (file.type.startsWith("audio/")) return "audio";\n' +
'    if (file.type.startsWith("image/")) return "image";\n' +
'    const ext = file.name.split(".").pop().toLowerCase();\n' +
'    if (["mkv","avi","mov"].includes(ext)) return "video";\n' +
'    if (["docx","doc"].includes(ext)) return "document";\n' +
'    return "unknown";\n' +
'};\n' +
'let files = [];\n' +
'const dom = {\n' +
'    dropZone: document.getElementById("drop-zone"),\n' +
'    fileList: document.getElementById("file-list"),\n' +
'    empty: document.getElementById("empty-state"),\n' +
'    status: document.getElementById("engine-status"),\n' +
'    convertBtn: document.getElementById("convert-all-btn")\n' +
'};\n' +
'async function initFFmpeg() {\n' +
'    try {\n' +
'        if (typeof SharedArrayBuffer === "undefined") {\n' +
'            dom.status.className = "flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200";\n' +
'            dom.status.innerHTML = \'<span class="w-2 h-2 rounded-full bg-blue-500"></span> Limited Mode (No Video/Audio)\';\n' +
'            console.log("SharedArrayBuffer not available - FFmpeg disabled");\n' +
'            return;\n' +
'        }\n' +
'        ffmpeg = createFFmpeg({ \n' +
'            log: true,\n' +
'            corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js"\n' +
'        });\n' +
'        await ffmpeg.load();\n' +
'        dom.status.className = "flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200";\n' +
'        dom.status.innerHTML = \'<span class="w-2 h-2 rounded-full bg-emerald-500"></span> Engine Ready\';\n' +
'        console.log("FFmpeg Loaded");\n' +
'    } catch (e) {\n' +
'        console.error(e);\n' +
'        dom.status.className = "flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200";\n' +
'        dom.status.innerHTML = \'<span class="w-2 h-2 rounded-full bg-blue-500"></span> Limited Mode (Images/Docs Only)\';\n' +
'    }\n' +
'}\n' +
'initFFmpeg();\n' +
'["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {\n' +
'    dom.dropZone.addEventListener(eventName, preventDefaults, false);\n' +
'});\n' +
'function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }\n' +
'dom.dropZone.addEventListener("dragenter", () => dom.dropZone.classList.add("drag-over"));\n' +
'dom.dropZone.addEventListener("dragleave", () => dom.dropZone.classList.remove("drag-over"));\n' +
'dom.dropZone.addEventListener("drop", (e) => {\n' +
'    dom.dropZone.classList.remove("drag-over");\n' +
'    handleFiles(e.dataTransfer.files);\n' +
'});\n' +
'document.getElementById("file-upload").addEventListener("change", (e) => handleFiles(e.target.files));\n' +
'document.getElementById("folder-upload").addEventListener("change", (e) => handleFiles(e.target.files));\n' +
'function handleFiles(fileList) {\n' +
'    if (!fileList.length) return;\n' +
'    dom.empty.style.display = "none";\n' +
'    dom.fileList.classList.remove("hidden");\n' +
'    dom.convertBtn.disabled = false;\n' +
'    dom.convertBtn.classList.remove("opacity-50", "cursor-not-allowed");\n' +
'    Array.from(fileList).forEach(file => {\n' +
'        const type = getType(file);\n' +
'        if (type === "unknown") return;\n' +
'        const id = Math.random().toString(36).substr(2, 9);\n' +
'        let defaultTarget = "mp4";\n' +
'        if (type === "audio") defaultTarget = "mp3";\n' +
'        if (type === "image") defaultTarget = "png";\n' +
'        if (type === "document") defaultTarget = "pdf";\n' +
'        files.push({ id, file, type, targetFormat: defaultTarget, status: "idle" });\n' +
'        renderFileCard(id, file, type, defaultTarget);\n' +
'    });\n' +
'}\n' +
'function renderFileCard(id, file, type, defaultTarget) {\n' +
'    const div = document.createElement("div");\n' +
'    div.id = "card-" + id;\n' +
'    div.className = "bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4 fade-in";\n' +
'    const icon = type === "video" ? "🎬" : type === "audio" ? "🎵" : type === "document" ? "📄" : "🖼️";\n' +
'    const options = FORMATS[type].map(fmt => "<option value=\\"" + fmt + "\\"" + (fmt === defaultTarget ? " selected" : "") + ">to " + fmt.toUpperCase() + "</option>").join("");\n' +
'    div.innerHTML = "<div class=\\"w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0\\">" + icon + "</div>" +\n' +
'        "<div class=\\"flex-1 min-w-0 w-full text-center md:text-left\\"><h4 class=\\"font-bold text-slate-700 truncate\\">" + file.name + "</h4><p class=\\"text-xs text-slate-500\\">" + (file.size / 1024 / 1024).toFixed(2) + " MB</p></div>" +\n' +
'        "<div class=\\"flex items-center gap-3 w-full md:w-auto justify-center\\"><span class=\\"text-slate-400 text-sm\\">Convert to:</span><select onchange=\\"updateTarget(\'" + id + "\', this.value)\\" class=\\"bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-iri focus:border-iri block p-2\\">" + options + "</select></div>" +\n' +
'        "<div id=\\"action-" + id + "\\" class=\\"flex-shrink-0 w-full md:w-32\\"><div class=\\"w-full bg-slate-200 rounded-full h-2.5 hidden\\" id=\\"progress-container-" + id + "\\"><div class=\\"bg-iri h-2.5 rounded-full progress-bar\\" style=\\"width: 0%\\" id=\\"progress-" + id + "\\"></div></div><div id=\\"status-text-" + id + "\\" class=\\"text-xs text-center text-slate-500 mt-1\\">Ready</div></div>" +\n' +
'        "<button onclick=\\"removeFile(\'" + id + "\')\\" class=\\"text-slate-400 hover:text-red-500 px-2\\">&times;</button>";\n' +
'    dom.fileList.appendChild(div);\n' +
'}\n' +
'function updateTarget(id, val) {\n' +
'    const f = files.find(x => x.id === id);\n' +
'    if(f) f.targetFormat = val;\n' +
'}\n' +
'function removeFile(id) {\n' +
'    files = files.filter(f => f.id !== id);\n' +
'    document.getElementById("card-" + id).remove();\n' +
'    if(files.length === 0) {\n' +
'        dom.empty.style.display = "flex";\n' +
'        dom.fileList.classList.add("hidden");\n' +
'        dom.convertBtn.disabled = true;\n' +
'        dom.convertBtn.classList.add("opacity-50", "cursor-not-allowed");\n' +
'    }\n' +
'}\n' +
'async function convertAll() {\n' +
'    const needsFFmpeg = files.some(f => f.type === "video" || f.type === "audio");\n' +
'    if (needsFFmpeg && !ffmpeg) {\n' +
'        alert("Video/Audio conversion requires FFmpeg engine. Only image and document conversion available in limited mode.");\n' +
'        return;\n' +
'    }\n' +
'    dom.convertBtn.disabled = true;\n' +
'    dom.convertBtn.innerText = "Converting...";\n' +
'    for (const f of files) {\n' +
'        if (f.status === "done") continue;\n' +
'        await processFile(f);\n' +
'    }\n' +
'    dom.convertBtn.disabled = false;\n' +
'    dom.convertBtn.innerText = "Convert All";\n' +
'}\n' +
'async function processFile(fObj) {\n' +
'    const progBar = document.getElementById("progress-" + fObj.id);\n' +
'    const progCont = document.getElementById("progress-container-" + fObj.id);\n' +
'    const statusTxt = document.getElementById("status-text-" + fObj.id);\n' +
'    const actionArea = document.getElementById("action-" + fObj.id);\n' +
'    progCont.classList.remove("hidden");\n' +
'    statusTxt.innerText = "Processing...";\n' +
'    fObj.status = "processing";\n' +
'    try {\n' +
'        const { file, id, targetFormat, type } = fObj;\n' +
'        \n' +
'        if (type === "document") {\n' +
'            await processDocumentFile(fObj, progBar, statusTxt, actionArea);\n' +
'        } else if (type === "image") {\n' +
'            await processImageFile(fObj, progBar, statusTxt, actionArea);\n' +
'        } else {\n' +
'            // Video/Audio processing with FFmpeg\n' +
'            const inputName = "input_" + id + "." + file.name.split(".").pop();\n' +
'            const outputName = "output_" + id + "." + targetFormat;\n' +
'            ffmpeg.FS("writeFile", inputName, await fetchFile(file));\n' +
'            ffmpeg.setProgress(({ ratio }) => {\n' +
'                progBar.style.width = (ratio * 100) + "%";\n' +
'                statusTxt.innerText = (ratio * 100).toFixed(0) + "%";\n' +
'            });\n' +
'            await ffmpeg.run("-i", inputName, outputName);\n' +
'            const data = ffmpeg.FS("readFile", outputName);\n' +
'            const blob = new Blob([data.buffer], { type: type + "/" + targetFormat });\n' +
'            const url = URL.createObjectURL(blob);\n' +
'            actionArea.innerHTML = "<a href=\\"" + url + "\\" download=\\"" + file.name.split(".")[0] + "." + targetFormat + "\\" class=\\"bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 px-4 rounded shadow block text-center\\">Download</a>";\n' +
'            ffmpeg.FS("unlink", inputName);\n' +
'            ffmpeg.FS("unlink", outputName);\n' +
'        }\n' +
'        fObj.status = "done";\n' +
'    } catch (err) {\n' +
'        console.error(err);\n' +
'        statusTxt.innerText = "Error";\n' +
'        statusTxt.classList.add("text-red-500");\n' +
'    }\n' +
'}\n' +
'async function processDocumentFile(fObj, progBar, statusTxt, actionArea) {\n' +
'    const { file, targetFormat } = fObj;\n' +
'    \n' +
'    if (targetFormat === "pdf") {\n' +
'        statusTxt.innerText = "Reading document...";\n' +
'        progBar.style.width = "25%";\n' +
'        \n' +
'        const arrayBuffer = await file.arrayBuffer();\n' +
'        \n' +
'        statusTxt.innerText = "Converting to HTML...";\n' +
'        progBar.style.width = "50%";\n' +
'        \n' +
'        const result = await mammoth.convertToHtml({arrayBuffer: arrayBuffer});\n' +
'        const html = result.value;\n' +
'        \n' +
'        statusTxt.innerText = "Generating PDF...";\n' +
'        progBar.style.width = "75%";\n' +
'        \n' +
'        const element = document.createElement("div");\n' +
'        element.innerHTML = html;\n' +
'        element.style.padding = "20px";\n' +
'        element.style.fontFamily = "Arial, sans-serif";\n' +
'        element.style.fontSize = "12px";\n' +
'        element.style.lineHeight = "1.5";\n' +
'        \n' +
'        const opt = {\n' +
'            margin: 1,\n' +
'            filename: file.name.split(".")[0] + ".pdf",\n' +
'            image: { type: "jpeg", quality: 0.98 },\n' +
'            html2canvas: { scale: 2 },\n' +
'            jsPDF: { unit: "in", format: "letter", orientation: "portrait" }\n' +
'        };\n' +
'        \n' +
'        const pdfBlob = await html2pdf().set(opt).from(element).output("blob");\n' +
'        \n' +
'        progBar.style.width = "100%";\n' +
'        statusTxt.innerText = "Complete";\n' +
'        \n' +
'        const url = URL.createObjectURL(pdfBlob);\n' +
'        actionArea.innerHTML = "<a href=\\"" + url + "\\" download=\\"" + file.name.split(".")[0] + ".pdf\\" class=\\"bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 px-4 rounded shadow block text-center\\">Download</a>";\n' +
'    }\n' +
'}\n' +
'async function processImageFile(fObj, progBar, statusTxt, actionArea) {\n' +
'    const { file, targetFormat } = fObj;\n' +
'    \n' +
'    statusTxt.innerText = "Processing image...";\n' +
'    progBar.style.width = "50%";\n' +
'    \n' +
'    const canvas = document.createElement("canvas");\n' +
'    const ctx = canvas.getContext("2d");\n' +
'    const img = new Image();\n' +
'    \n' +
'    return new Promise((resolve, reject) => {\n' +
'        img.onload = () => {\n' +
'            canvas.width = img.width;\n' +
'            canvas.height = img.height;\n' +
'            ctx.drawImage(img, 0, 0);\n' +
'            \n' +
'            progBar.style.width = "100%";\n' +
'            statusTxt.innerText = "Complete";\n' +
'            \n' +
'            canvas.toBlob((blob) => {\n' +
'                const url = URL.createObjectURL(blob);\n' +
'                actionArea.innerHTML = "<a href=\\"" + url + "\\" download=\\"" + file.name.split(".")[0] + "." + targetFormat + "\\" class=\\"bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 px-4 rounded shadow block text-center\\">Download</a>";\n' +
'                resolve();\n' +
'            }, "image/" + targetFormat);\n' +
'        };\n' +
'        img.onerror = reject;\n' +
'        img.src = URL.createObjectURL(file);\n' +
'    });\n' +
'}';
}

function getPDFToolsJS() {
  return 'pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";\n' +
'const TOOLS = [\n' +
'    { id: "merge", icon: "📚", color: "bg-indigo-50 text-indigo-600", title: "Merge PDF", desc: "Combine multiple files & reorder pages." },\n' +
'    { id: "organize", icon: "✂️", color: "bg-rose-50 text-rose-500", title: "Split & Edit", desc: "Rotate, delete, or extract specific pages.", type: "pages" },\n' +
'    { id: "img2pdf", icon: "🖼️", color: "bg-emerald-50 text-emerald-600", title: "Image to PDF", desc: "Convert JPG/PNG to PDF documents.", accept: "image/*" },\n' +
'    { id: "watermark", icon: "💧", color: "bg-blue-50 text-blue-500", title: "Watermark", desc: "Add text overlay to pages.", inputs: [{ id: "wm-text", type: "text", placeholder: "Watermark Text", width: "w-48" }, { id: "wm-color", type: "select", options: ["Red", "Grey", "Blue"], width: "w-24" }]},\n' +
'    { id: "numbers", icon: "🔢", color: "bg-slate-50 text-slate-600", title: "Page Numbers", desc: "Add pagination to footer." },\n' +
'    { id: "protect", icon: "🔒", color: "bg-orange-50 text-orange-600", title: "Protect", desc: "Encrypt with password.", inputs: [{ id: "pass-set", type: "password", placeholder: "Set Password", width: "w-40" }]},\n' +
'    { id: "unlock", icon: "🔓", color: "bg-teal-50 text-teal-600", title: "Unlock", desc: "Remove PDF password.", inputs: [{ id: "pass-unlock", type: "password", placeholder: "Original Password", width: "w-40" }]},\n' +
'    { id: "metadata", icon: "🏷️", color: "bg-purple-50 text-purple-600", title: "Metadata", desc: "Edit Title & Author.", inputs: [{ id: "meta-title", type: "text", placeholder: "New Title", width: "w-40" }, { id: "meta-author", type: "text", placeholder: "New Author", width: "w-40" }]},\n' +
'    { id: "flatten", icon: "🔨", color: "bg-gray-50 text-gray-600", title: "Flatten", desc: "Make forms un-editable." }\n' +
'];\n' +
'const app = { activeTool: null, files: [], sortable: null };\n' +
'const dom = {\n' +
'    dash: document.getElementById("view-dashboard"),\n' +
'    grid: document.getElementById("tool-grid"),\n' +
'    work: document.getElementById("view-workspace"),\n' +
'    workGrid: document.getElementById("grid-container"),\n' +
'    settings: document.getElementById("tool-settings"),\n' +
'    title: document.getElementById("tool-name"),\n' +
'    empty: document.getElementById("empty-state"),\n' +
'    input: document.getElementById("file-upload"),\n' +
'    toast: document.getElementById("toast"),\n' +
'    toastMsg: document.getElementById("toast-msg")\n' +
'};\n' +
'function initDashboard() {\n' +
'    dom.grid.innerHTML = "";\n' +
'    TOOLS.forEach(t => {\n' +
'        const div = document.createElement("button");\n' +
'        div.className = "tool-card bg-white p-6 rounded-2xl border border-slate-200 text-left flex flex-col items-start gap-4";\n' +
'        div.onclick = () => launchTool(t.id);\n' +
'        div.innerHTML = "<div class=\\"w-14 h-14 rounded-xl flex items-center justify-center text-3xl " + t.color + "\\">" + t.icon + "</div><div><h4 class=\\"font-bold text-lg text-slate-800\\">" + t.title + "</h4><p class=\\"text-sm text-slate-500 mt-1 leading-relaxed\\">" + t.desc + "</p></div>";\n' +
'        dom.grid.appendChild(div);\n' +
'    });\n' +
'}\n' +
'initDashboard();\n' +
'function launchTool(toolId) {\n' +
'    app.activeTool = toolId;\n' +
'    const conf = TOOLS.find(t => t.id === toolId);\n' +
'    dom.dash.classList.add("hidden");\n' +
'    dom.work.classList.remove("hidden");\n' +
'    dom.title.innerText = conf.title;\n' +
'    dom.input.accept = conf.accept || ".pdf";\n' +
'    dom.input.value = "";\n' +
'    renderSettings(conf.inputs || []);\n' +
'    initSortable();\n' +
'}\n' +
'function goHome() {\n' +
'    dom.work.classList.add("hidden");\n' +
'    dom.dash.classList.remove("hidden");\n' +
'    resetWorkspace();\n' +
'}\n' +
'function renderSettings(inputs) {\n' +
'    dom.settings.innerHTML = "";\n' +
'    if (app.activeTool === "organize") {\n' +
'        const grp = document.createElement("div");\n' +
'        grp.className = "flex gap-2 bg-slate-100 p-1.5 rounded-lg";\n' +
'        grp.innerHTML = "<button onclick=\\"rotateSelected(90)\\" class=\\"px-3 py-1.5 bg-white rounded shadow-sm text-sm font-semibold hover:text-iri\\">↻ 90°</button><button onclick=\\"deleteSelected()\\" class=\\"px-3 py-1.5 bg-white rounded shadow-sm text-sm font-semibold hover:text-red-600 text-red-500\\">🗑 Delete</button>";\n' +
'        dom.settings.appendChild(grp);\n' +
'    }\n' +
'    inputs.forEach(inp => {\n' +
'        if (inp.type === "select") {\n' +
'            const sel = document.createElement("select");\n' +
'            sel.id = inp.id;\n' +
'            sel.className = "p-2 rounded-lg border border-slate-300 text-sm focus:border-iri focus:ring-1 focus:ring-iri outline-none " + inp.width;\n' +
'            inp.options.forEach(o => {\n' +
'                const opt = document.createElement("option");\n' +
'                opt.value = o;\n' +
'                opt.innerText = o;\n' +
'                sel.appendChild(opt);\n' +
'            });\n' +
'            dom.settings.appendChild(sel);\n' +
'        } else {\n' +
'            const i = document.createElement("input");\n' +
'            i.id = inp.id;\n' +
'            i.type = inp.type;\n' +
'            i.placeholder = inp.placeholder;\n' +
'            i.className = "p-2 rounded-lg border border-slate-300 text-sm focus:border-iri focus:ring-1 focus:ring-iri outline-none " + inp.width;\n' +
'            dom.settings.appendChild(i);\n' +
'        }\n' +
'    });\n' +
'}\n' +
'dom.input.addEventListener("change", async (e) => {\n' +
'    if (!e.target.files.length) return;\n' +
'    showToast("Processing files...", true);\n' +
'    dom.empty.classList.add("hidden");\n' +
'    for (const file of e.target.files) {\n' +
'        await addFileToGrid(file);\n' +
'    }\n' +
'    hideToast();\n' +
'});\n' +
'async function addFileToGrid(file) {\n' +
'    const id = Math.random().toString(36).substr(2, 9);\n' +
'    const isPdf = file.type === "application/pdf";\n' +
'    const conf = TOOLS.find(t => t.id === app.activeTool);\n' +
'    if (conf.type === "pages" && isPdf) {\n' +
'        const buff = await file.arrayBuffer();\n' +
'        const pdf = await pdfjsLib.getDocument(buff).promise;\n' +
'        for (let i = 1; i <= pdf.numPages; i++) {\n' +
'            const div = createCard(id, true);\n' +
'            div.dataset.fileId = id;\n' +
'            div.dataset.pageIdx = i - 1;\n' +
'            div.dataset.rotation = 0;\n' +
'            await renderThumbnail(pdf, i, div.querySelector(".thumb-area"));\n' +
'            const num = document.createElement("span");\n' +
'            num.className = "absolute bottom-2 right-2 bg-slate-900/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded";\n' +
'            num.innerText = i;\n' +
'            div.querySelector(".thumb-area").appendChild(num);\n' +
'            div.onclick = (e) => {\n' +
'                if (!e.target.closest(".drag-handle")) {\n' +
'                    div.querySelector(".thumb-area").classList.toggle("selected");\n' +
'                }\n' +
'            };\n' +
'            dom.workGrid.appendChild(div);\n' +
'        }\n' +
'        app.files.push({ id, file, buffer: buff });\n' +
'    } else {\n' +
'        const div = createCard(id, false);\n' +
'        div.dataset.fileId = id;\n' +
'        const thumbArea = div.querySelector(".thumb-area");\n' +
'        if (isPdf) {\n' +
'            const buff = await file.arrayBuffer();\n' +
'            const pdf = await pdfjsLib.getDocument(buff).promise;\n' +
'            await renderThumbnail(pdf, 1, thumbArea);\n' +
'        } else {\n' +
'            const img = document.createElement("img");\n' +
'            img.src = URL.createObjectURL(file);\n' +
'            img.className = "w-full h-full object-contain";\n' +
'            thumbArea.appendChild(img);\n' +
'        }\n' +
'        const name = document.createElement("div");\n' +
'        name.className = "p-3 text-xs font-semibold text-slate-700 truncate bg-white border-t border-slate-100";\n' +
'        name.innerText = file.name;\n' +
'        div.appendChild(name);\n' +
'        dom.workGrid.appendChild(div);\n' +
'        app.files.push({ id, file });\n' +
'    }\n' +
'}\n' +
'function createCard(id, isPage) {\n' +
'    const div = document.createElement("div");\n' +
'    div.className = "group relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-all select-none";\n' +
'    const handle = document.createElement("div");\n' +
'    handle.className = "drag-handle absolute top-2 left-2 bg-white p-1.5 rounded shadow-sm border border-slate-100 cursor-grab z-10 text-slate-400 hover:text-iri transition-colors";\n' +
'    handle.innerHTML = "<svg width=\\"16\\" height=\\"16\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"><circle cx=\\"9\\" cy=\\"5\\" r=\\"1\\"/><circle cx=\\"9\\" cy=\\"12\\" r=\\"1\\"/><circle cx=\\"9\\" cy=\\"19\\" r=\\"1\\"/><circle cx=\\"15\\" cy=\\"5\\" r=\\"1\\"/><circle cx=\\"15\\" cy=\\"12\\" r=\\"1\\"/><circle cx=\\"15\\" cy=\\"19\\" r=\\"1\\"/></svg>";\n' +
'    div.appendChild(handle);\n' +
'    const del = document.createElement("button");\n' +
'    del.className = "absolute top-2 right-2 bg-white text-slate-400 hover:text-red-500 w-7 h-7 rounded shadow-sm border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10";\n' +
'    del.innerHTML = "&times;";\n' +
'    del.onclick = (e) => { e.stopPropagation(); div.remove(); };\n' +
'    div.appendChild(del);\n' +
'    const thumb = document.createElement("div");\n' +
'    thumb.className = "thumb-area w-full " + (isPage ? "h-56" : "h-40") + " bg-slate-50 relative overflow-hidden flex items-center justify-center";\n' +
'    div.appendChild(thumb);\n' +
'    return div;\n' +
'}\n' +
'async function renderThumbnail(pdf, pageNum, container) {\n' +
'    try {\n' +
'        const page = await pdf.getPage(pageNum);\n' +
'        const viewport = page.getViewport({ scale: 0.6 });\n' +
'        const canvas = document.createElement("canvas");\n' +
'        const ctx = canvas.getContext("2d");\n' +
'        canvas.width = viewport.width;\n' +
'        canvas.height = viewport.height;\n' +
'        canvas.className = "w-full h-full object-contain";\n' +
'        await page.render({ canvasContext: ctx, viewport: viewport }).promise;\n' +
'        container.appendChild(canvas);\n' +
'    } catch (e) {\n' +
'        container.innerText = "Preview N/A";\n' +
'    }\n' +
'}\n' +
'function initSortable() {\n' +
'    if (app.sortable) app.sortable.destroy();\n' +
'    app.sortable = new Sortable(dom.workGrid, {\n' +
'        animation: 200,\n' +
'        handle: ".drag-handle",\n' +
'        ghostClass: "sortable-ghost",\n' +
'        dragClass: "sortable-drag",\n' +
'        onStart: () => document.body.style.cursor = "grabbing",\n' +
'        onEnd: () => document.body.style.cursor = "default"\n' +
'    });\n' +
'}\n' +
'function rotateSelected(deg) {\n' +
'    document.querySelectorAll(".thumb-area.selected").forEach(el => {\n' +
'        const card = el.closest("div[data-rotation]");\n' +
'        let r = parseInt(card.dataset.rotation) || 0;\n' +
'        r = (r + deg) % 360;\n' +
'        card.dataset.rotation = r;\n' +
'        el.querySelector("canvas").style.transform = "rotate(" + r + "deg)";\n' +
'    });\n' +
'}\n' +
'function deleteSelected() {\n' +
'    document.querySelectorAll(".thumb-area.selected").forEach(el => {\n' +
'        el.closest(".group").remove();\n' +
'    });\n' +
'}\n' +
'function resetWorkspace() {\n' +
'    app.files = [];\n' +
'    app.activeTool = null;\n' +
'    dom.workGrid.innerHTML = "";\n' +
'    dom.empty.classList.remove("hidden");\n' +
'}\n' +
'async function processFiles() {\n' +
'    if (dom.workGrid.children.length === 0) return alert("Please add files first.");\n' +
'    showToast("Generating PDF...", true);\n' +
'    const { PDFDocument, rgb, degrees, StandardFonts } = PDFLib;\n' +
'    try {\n' +
'        const newPdf = await PDFDocument.create();\n' +
'        const cards = Array.from(dom.workGrid.children);\n' +
'        const conf = TOOLS.find(t => t.id === app.activeTool);\n' +
'        if (conf.type === "pages") {\n' +
'            const pdfCache = {};\n' +
'            for (const f of app.files) pdfCache[f.id] = await PDFDocument.load(f.buffer);\n' +
'            for (const card of cards) {\n' +
'                const fid = card.dataset.fileId;\n' +
'                const pIdx = parseInt(card.dataset.pageIdx);\n' +
'                const rot = parseInt(card.dataset.rotation);\n' +
'                const [page] = await newPdf.copyPages(pdfCache[fid], [pIdx]);\n' +
'                if (rot !== 0) page.setRotation(degrees(page.getRotation().angle + rot));\n' +
'                newPdf.addPage(page);\n' +
'            }\n' +
'        } else {\n' +
'            for (const card of cards) {\n' +
'                const fObj = app.files.find(f => f.id === card.dataset.fileId);\n' +
'                if (fObj.file.type.includes("image")) {\n' +
'                    const imgBuff = await fObj.file.arrayBuffer();\n' +
'                    let img = fObj.file.type.includes("png") ? await newPdf.embedPng(imgBuff) : await newPdf.embedJpg(imgBuff);\n' +
'                    const p = newPdf.addPage([img.width, img.height]);\n' +
'                    p.drawImage(img, {x:0, y:0, width: img.width, height: img.height});\n' +
'                } else {\n' +
'                    const srcBuff = await fObj.file.arrayBuffer();\n' +
'                    let srcPdf;\n' +
'                    if (app.activeTool === "unlock") {\n' +
'                        const pass = document.getElementById("pass-unlock").value;\n' +
'                        try { srcPdf = await PDFDocument.load(srcBuff, { password: pass }); }\n' +
'                        catch { throw new Error("Incorrect Password"); }\n' +
'                    } else {\n' +
'                        srcPdf = await PDFDocument.load(srcBuff);\n' +
'                    }\n' +
'                    const pgs = await newPdf.copyPages(srcPdf, srcPdf.getPageIndices());\n' +
'                    pgs.forEach(p => newPdf.addPage(p));\n' +
'                }\n' +
'            }\n' +
'        }\n' +
'        const pages = newPdf.getPages();\n' +
'        if (app.activeTool === "watermark") {\n' +
'            const text = document.getElementById("wm-text").value || "DRAFT";\n' +
'            const colorName = document.getElementById("wm-color").value;\n' +
'            const col = colorName === "Red" ? [1,0,0] : colorName === "Blue" ? [0,0,1] : [0.5,0.5,0.5];\n' +
'            const font = await newPdf.embedFont(StandardFonts.HelveticaBold);\n' +
'            pages.forEach(p => {\n' +
'                const {width, height} = p.getSize();\n' +
'                p.drawText(text, {\n' +
'                    x: width/2 - (text.length*15), y: height/2,\n' +
'                    size: 60, font: font, color: rgb(...col),\n' +
'                    opacity: 0.3, rotate: degrees(45)\n' +
'                });\n' +
'            });\n' +
'        }\n' +
'        if (app.activeTool === "numbers") {\n' +
'            const font = await newPdf.embedFont(StandardFonts.Courier);\n' +
'            pages.forEach((p, i) => {\n' +
'                p.drawText((i+1) + " / " + pages.length, {\n' +
'                    x: p.getWidth() - 100, y: 20, size: 10, font: font, color: rgb(0,0,0)\n' +
'                });\n' +
'            });\n' +
'        }\n' +
'        if (app.activeTool === "metadata") {\n' +
'            const t = document.getElementById("meta-title").value;\n' +
'            const a = document.getElementById("meta-author").value;\n' +
'            if(t) newPdf.setTitle(t);\n' +
'            if(a) newPdf.setAuthor(a);\n' +
'        }\n' +
'        if (app.activeTool === "flatten") newPdf.getForm().flatten();\n' +
'        if (app.activeTool === "protect") {\n' +
'            const pw = document.getElementById("pass-set").value;\n' +
'            if (pw) newPdf.encrypt({ userPassword: pw, ownerPassword: pw });\n' +
'        }\n' +
'        const pdfBytes = await newPdf.save();\n' +
'        const blob = new Blob([pdfBytes], { type: "application/pdf" });\n' +
'        const link = document.createElement("a");\n' +
'        link.href = URL.createObjectURL(blob);\n' +
'        link.download = "111iridescence_" + app.activeTool + ".pdf";\n' +
'        link.click();\n' +
'        showToast("Success! Downloading...", false);\n' +
'        setTimeout(hideToast, 2000);\n' +
'    } catch (err) {\n' +
'        console.error(err);\n' +
'        alert(err.message);\n' +
'        hideToast();\n' +
'    }\n' +
'}\n' +
'function showToast(msg, loading) {\n' +
'    dom.toastMsg.innerText = msg;\n' +
'    dom.toast.classList.remove("translate-y-32", "opacity-0");\n' +
'    dom.toast.querySelector(".loader").style.display = loading ? "block" : "none";\n' +
'}\n' +
'function hideToast() {\n' +
'    dom.toast.classList.add("translate-y-32", "opacity-0");\n' +
'}';
}

function getCSS() {
  return '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");\n' +
'/* Animations */\n' +
'.fade-in { animation: fadeIn 0.4s ease-out; }\n' +
'@keyframes fadeIn { \n' +
'    from { opacity: 0; transform: translateY(15px); } \n' +
'    to { opacity: 1; transform: translateY(0); } \n' +
'}\n' +
'/* Card Interactive Styling */\n' +
'.tool-card {\n' +
'    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n' +
'    cursor: pointer;\n' +
'}\n' +
'.tool-card:hover {\n' +
'    transform: translateY(-4px);\n' +
'    box-shadow: 0 12px 20px -8px rgba(99, 102, 241, 0.25);\n' +
'    border-color: #6366f1;\n' +
'}\n' +
'/* Converter Styles */\n' +
'.drag-over {\n' +
'    background-color: #e0e7ff !important;\n' +
'    border: 2px dashed #6366f1;\n' +
'}\n' +
'::-webkit-scrollbar { width: 8px; }\n' +
'::-webkit-scrollbar-track { background: transparent; }\n' +
'::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }\n' +
'::-webkit-scrollbar-thumb:hover { background: #94a3b8; }\n' +
'.spin { animation: spin 1s linear infinite; }\n' +
'@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }\n' +
'.progress-bar { transition: width 0.2s linear; }\n' +
'/* PDF Tools Styles */\n' +
'.sortable-ghost {\n' +
'    opacity: 0.4;\n' +
'    background: #e0e7ff;\n' +
'    border: 2px dashed #6366f1;\n' +
'}\n' +
'.sortable-drag {\n' +
'    cursor: grabbing;\n' +
'    opacity: 1;\n' +
'    background: white;\n' +
'    transform: scale(1.05) rotate(2deg);\n' +
'    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);\n' +
'    z-index: 100;\n' +
'}\n' +
'.drag-handle {\n' +
'    cursor: grab;\n' +
'    touch-action: none;\n' +
'}\n' +
'.drag-handle:active { cursor: grabbing; }\n' +
'.thumb-area {\n' +
'    transition: all 0.15s ease;\n' +
'    border: 3px solid transparent;\n' +
'}\n' +
'.thumb-area.selected {\n' +
'    border-color: #6366f1;\n' +
'    background-color: #e0e7ff;\n' +
'    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);\n' +
'    transform: scale(0.95);\n' +
'}\n' +
'.thumb-area.selected::after {\n' +
'    content: "✓";\n' +
'    position: absolute;\n' +
'    top: 50%;\n' +
'    left: 50%;\n' +
'    transform: translate(-50%, -50%);\n' +
'    font-size: 2rem;\n' +
'    color: #6366f1;\n' +
'    font-weight: bold;\n' +
'    z-index: 20;\n' +
'    background: rgba(255, 255, 255, 0.9);\n' +
'    width: 40px;\n' +
'    height: 40px;\n' +
'    display: flex;\n' +
'    align-items: center;\n' +
'    justify-content: center;\n' +
'    border-radius: 50%;\n' +
'    box-shadow: 0 4px 6px rgba(0,0,0,0.1);\n' +
'}\n' +
'.loader {\n' +
'    border: 3px solid rgba(255,255,255,0.3);\n' +
'    border-top: 3px solid white;\n' +
'    border-radius: 50%;\n' +
'    width: 20px;\n' +
'    height: 20px;\n' +
'    animation: spin 1s linear infinite;\n' +
'}';
}
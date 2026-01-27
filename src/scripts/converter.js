const { createFFmpeg, fetchFile } = FFmpeg;
let ffmpeg = null;

const FORMATS = {
    video: ["mp4", "webm", "avi", "mov", "mkv", "flv", "gif", "mp3"],
    audio: ["mp3", "wav", "aac", "ogg", "m4a", "flac"],
    image: ["jpg", "png", "webp", "bmp", "tiff", "ico", "gif"],
    document: ["pdf"]
};

const getType = (file) => {
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type.startsWith("image/")) return "image";
    const ext = file.name.split(".").pop().toLowerCase();
    if (["mkv", "avi", "mov"].includes(ext)) return "video";
    if (["docx", "doc"].includes(ext)) return "document";
    return "unknown";
};

let files = [];

const dom = {
    dropZone: document.getElementById("drop-zone"),
    fileList: document.getElementById("file-list"),
    empty: document.getElementById("empty-state"),
    status: document.getElementById("engine-status"),
    convertBtn: document.getElementById("convert-all-btn")
};

async function initFFmpeg() {
    try {
        if (typeof SharedArrayBuffer === "undefined") {
            dom.status.className = "flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200";
            dom.status.innerHTML = '<span class="w-2 h-2 rounded-full bg-blue-500"></span> Limited Mode (No Video/Audio)';
            console.log("SharedArrayBuffer not available - FFmpeg disabled");
            return;
        }
        ffmpeg = createFFmpeg({
            log: true,
            corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js"
        });
        await ffmpeg.load();
        dom.status.className = "flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200";
        dom.status.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500"></span> Engine Ready';
        console.log("FFmpeg Loaded");
    } catch (e) {
        console.error(e);
        dom.status.className = "flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200";
        dom.status.innerHTML = '<span class="w-2 h-2 rounded-full bg-blue-500"></span> Limited Mode (Images/Docs Only)';
    }
}
initFFmpeg();

["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dom.dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

dom.dropZone.addEventListener("dragenter", () => dom.dropZone.classList.add("drag-over"));
dom.dropZone.addEventListener("dragleave", () => dom.dropZone.classList.remove("drag-over"));
dom.dropZone.addEventListener("drop", (e) => {
    dom.dropZone.classList.remove("drag-over");
    handleFiles(e.dataTransfer.files);
});

document.getElementById("file-upload").addEventListener("change", (e) => handleFiles(e.target.files));
document.getElementById("folder-upload").addEventListener("change", (e) => handleFiles(e.target.files));

function handleFiles(fileList) {
    if (!fileList.length) return;

    dom.empty.style.display = "none";
    dom.fileList.classList.remove("hidden");
    dom.convertBtn.disabled = false;
    dom.convertBtn.classList.remove("opacity-50", "cursor-not-allowed");

    Array.from(fileList).forEach(file => {
        const type = getType(file);
        if (type === "unknown") return;

        const id = Math.random().toString(36).substr(2, 9);
        let defaultTarget = "mp4";
        if (type === "audio") defaultTarget = "mp3";
        if (type === "image") defaultTarget = "png";
        if (type === "document") defaultTarget = "pdf";

        files.push({ id, file, type, targetFormat: defaultTarget, status: "idle" });
        renderFileCard(id, file, type, defaultTarget);
    });
}

function renderFileCard(id, file, type, defaultTarget) {
    const div = document.createElement("div");
    div.id = "card-" + id;
    div.className = "bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-3 fade-in relative hover:shadow-md transition-all";

    const icon = type === "video" ? "🎬" : type === "audio" ? "🎵" : type === "document" ? "📄" : "🖼️";
    const options = FORMATS[type].map(fmt =>
        `<option value="${fmt}"${fmt === defaultTarget ? " selected" : ""}>to ${fmt.toUpperCase()}</option>`
    ).join("");

    div.innerHTML = `
        <div class="absolute top-2 right-2">
             <button onclick="removeFile('${id}')" class="text-slate-300 hover:text-red-500 p-1 rounded-full hover:bg-slate-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 mb-1">${icon}</div>
        <div class="w-full text-center">
            <h4 class="font-bold text-slate-700 truncate w-full px-2 text-sm" title="${file.name}">${file.name}</h4>
            <p class="text-xs text-slate-400 mt-0.5">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <div class="flex flex-col items-center gap-2 w-full mt-1">
            <div class="flex items-center gap-2 text-xs text-slate-500">
                <span>Convert to:</span>
                <select onchange="updateTarget('${id}', this.value)" class="bg-indigo-50 border-0 text-indigo-700 font-semibold text-xs rounded-md focus:ring-2 focus:ring-indigo-200 block py-1 px-2 cursor-pointer">
                    ${options}
                </select>
            </div>
        </div>
        <div id="action-${id}" class="w-full mt-2">
             <div class="w-full bg-slate-100 rounded-full h-2 hidden overflow-hidden" id="progress-container-${id}">
                <div class="bg-indigo-500 h-2 rounded-full progress-bar" style="width: 0%" id="progress-${id}"></div>
            </div>
            <div id="status-text-${id}" class="text-[10px] font-medium text-center text-slate-400 mt-1 h-4">Ready</div>
        </div>
    `;

    dom.fileList.appendChild(div);
}

function updateTarget(id, val) {
    const f = files.find(x => x.id === id);
    if (f) f.targetFormat = val;
}

function removeFile(id) {
    files = files.filter(f => f.id !== id);
    document.getElementById("card-" + id).remove();
    if (files.length === 0) {
        dom.empty.style.display = "flex";
        dom.fileList.classList.add("hidden");
        dom.convertBtn.disabled = true;
        dom.convertBtn.classList.add("opacity-50", "cursor-not-allowed");
    }
}

async function convertAll() {
    const needsFFmpeg = files.some(f => f.type === "video" || f.type === "audio");
    if (needsFFmpeg && !ffmpeg) {
        alert("Video/Audio conversion requires FFmpeg engine. Only image and document conversion available in limited mode.");
        return;
    }
    dom.convertBtn.disabled = true;
    dom.convertBtn.innerText = "Converting...";
    for (const f of files) {
        if (f.status === "done") continue;
        await processFile(f);
    }
    dom.convertBtn.disabled = false;
    dom.convertBtn.innerText = "Convert All";
}

async function processFile(fObj) {
    const progBar = document.getElementById("progress-" + fObj.id);
    const progCont = document.getElementById("progress-container-" + fObj.id);
    const statusTxt = document.getElementById("status-text-" + fObj.id);
    const actionArea = document.getElementById("action-" + fObj.id);

    progCont.classList.remove("hidden");
    statusTxt.innerText = "Processing...";
    fObj.status = "processing";

    try {
        const { file, id, targetFormat, type } = fObj;

        if (type === "document") {
            await processDocumentFile(fObj, progBar, statusTxt, actionArea);
        } else if (type === "image") {
            await processImageFile(fObj, progBar, statusTxt, actionArea);
        } else {
            // Video/Audio processing with FFmpeg
            const inputName = "input_" + id + "." + file.name.split(".").pop();
            const outputName = "output_" + id + "." + targetFormat;
            ffmpeg.FS("writeFile", inputName, await fetchFile(file));
            ffmpeg.setProgress(({ ratio }) => {
                progBar.style.width = (ratio * 100) + "%";
                statusTxt.innerText = (ratio * 100).toFixed(0) + "%";
            });
            await ffmpeg.run("-i", inputName, outputName);
            const data = ffmpeg.FS("readFile", outputName);
            const blob = new Blob([data.buffer], { type: type + "/" + targetFormat });
            const url = URL.createObjectURL(blob);
            actionArea.innerHTML = `<a href="${url}" download="${file.name.split(".")[0]}.${targetFormat}" class="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 px-4 rounded shadow block text-center">Download</a>`;
            ffmpeg.FS("unlink", inputName);
            ffmpeg.FS("unlink", outputName);
        }
        fObj.status = "done";
    } catch (err) {
        console.error(err);
        statusTxt.innerText = "Error";
        statusTxt.classList.add("text-red-500");
    }
}

async function processDocumentFile(fObj, progBar, statusTxt, actionArea) {
    const { file, targetFormat } = fObj;

    if (targetFormat === "pdf") {
        statusTxt.innerText = "Reading document...";
        progBar.style.width = "25%";

        const arrayBuffer = await file.arrayBuffer();

        statusTxt.innerText = "Converting to HTML...";
        progBar.style.width = "50%";

        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
        const html = result.value;

        statusTxt.innerText = "Generating PDF...";
        progBar.style.width = "75%";

        const element = document.createElement("div");
        element.innerHTML = html;
        element.style.padding = "20px";
        element.style.fontFamily = "Arial, sans-serif";
        element.style.fontSize = "12px";
        element.style.lineHeight = "1.5";

        const opt = {
            margin: 1,
            filename: file.name.split(".")[0] + ".pdf",
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
        };

        const pdfBlob = await html2pdf().set(opt).from(element).output("blob");

        progBar.style.width = "100%";
        statusTxt.innerText = "Complete";

        const url = URL.createObjectURL(pdfBlob);
        actionArea.innerHTML = `<a href="${url}" download="${file.name.split(".")[0]}.pdf" class="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 px-4 rounded shadow block text-center">Download</a>`;
    }
}

async function processImageFile(fObj, progBar, statusTxt, actionArea) {
    const { file, targetFormat } = fObj;

    statusTxt.innerText = "Processing image...";
    progBar.style.width = "50%";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    return new Promise((resolve, reject) => {
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            progBar.style.width = "100%";
            statusTxt.innerText = "Complete";

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                actionArea.innerHTML = `<a href="${url}" download="${file.name.split(".")[0]}.${targetFormat}" class="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 px-4 rounded shadow block text-center">Download</a>`;
                resolve();
            }, "image/" + targetFormat);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}
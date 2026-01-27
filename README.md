# 111iridescence - Unified App Hub

A comprehensive productivity suite with PDF tools and universal file converter, all running on a single Cloudflare Worker.

## Features

### 🏠 App Hub
- Clean landing page with navigation to all tools
- Professional 111iridescence branding
- Responsive design

### 📚 PDF Tools Suite
- **Merge PDF**: Combine multiple files & reorder pages
- **Split & Edit**: Rotate, delete, or extract specific pages
- **Image to PDF**: Convert JPG/PNG to PDF documents
- **Watermark**: Add text overlay to pages
- **Page Numbers**: Add pagination to footer
- **Protect**: Encrypt with password
- **Unlock**: Remove PDF password
- **Metadata**: Edit title & author
- **Flatten**: Make forms un-editable

### 🔄 Universal Converter
- **Video**: MP4, AVI, MOV, MKV, WEBM conversion
- **Audio**: MP3, WAV, AAC, OGG, M4A, FLAC conversion
- **Images**: JPG, PNG, WEBP, BMP, TIFF, ICO, GIF conversion
- **Documents**: DOCX to PDF conversion
- Client-side processing with FFmpeg.wasm
- Graceful fallback for limited environments

## Development

### Project Structure
```
├── src/
│   ├── scripts/           # JavaScript logic files
│   │   ├── converter.js   # Converter functionality
│   │   └── pdf.js         # PDF tools functionality
│   ├── styles/
│   │   └── input.css      # Tailwind CSS source
│   ├── templates/         # HTML templates
│   │   ├── index.js       # Hub page template
│   │   ├── converter.js   # Converter page template
│   │   └── pdf.js         # PDF tools page template
│   └── worker.js          # Main worker source (not used in build)
├── dist/
│   └── tailwind.css      # Pre-built Tailwind CSS
├── build.js               # Build script
├── worker.js              # Generated worker file (deployment ready)
└── wrangler.jsonc         # Cloudflare Worker config
```

### Build Process

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Develop locally**:
   ```bash
   npm run dev
   ```

3. **Deploy to production**:
   ```bash
   npm run deploy
   ```

### What the Build Does

The build script (`build.js`):
- Reads the pre-built Tailwind CSS from `dist/tailwind.css`
- Combines JavaScript files from `src/scripts/`
- Embeds templates from `src/templates/`
- Generates a single `worker.js` file ready for deployment
- Removes problematic COEP headers that blocked external resources

### Key Fixes Applied

✅ **SharedArrayBuffer Error**: Fixed by removing restrictive COEP headers and adding graceful fallbacks  
✅ **Tailwind Undefined Error**: Fixed by embedding local Tailwind CSS instead of CDN  
✅ **External Resource Blocking**: Resolved by using local assets  
✅ **Project Organization**: Split into maintainable, modular files  
✅ **Build Process**: Automated combination into deployable worker  

## Deployment

The project is configured to deploy to `111iridescence.org` via Cloudflare Workers.

**Deploy with**:
```bash
wrangler deploy
```

## Security & Privacy

- **Client-side Processing**: All file operations happen in the browser
- **No Data Uploads**: Files never leave the user's device
- **Cross-Origin Safe**: Proper headers for secure operation
- **Modern Security**: HTTPS-only, secure headers

## Browser Compatibility

- **Full Mode**: Modern browsers with SharedArrayBuffer support
- **Limited Mode**: All browsers (Images, Documents only)
- **Progressive Enhancement**: Graceful degradation for older browsers

---

Built with ❤️ using Cloudflare Workers, Tailwind CSS, FFmpeg.wasm, PDF-lib, and modern web technologies.
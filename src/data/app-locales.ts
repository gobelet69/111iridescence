import type { AppDefinition, AppSlug } from './apps';

export type AppEditorial = Pick<AppDefinition,
  'tagline' | 'description' | 'longDescription' | 'compatibility' | 'architecture' |
  'primaryScreenshot' | 'screenshots' | 'features' | 'sections' | 'seo'>;

export const englishAppContent: Record<AppSlug, AppEditorial> = {
  'iridescence-pdf-reader': {
    tagline: 'Read quickly. Stay focused.',
    description: 'A native PDF reader for macOS, designed for fast, fluid, distraction-free reading.',
    longDescription: 'Open one document or an entire workspace, find what you need instantly, and annotate without leaving a distinctly macOS interface.',
    compatibility: 'macOS 14 or later',
    architecture: 'Apple Silicon',
    primaryScreenshot: { src: '/apps/iridescence-pdf-reader/reader-workspace-light.png', alt: 'Iridescence PDF Reader main window with a workspace, document, and inspector.', width: 2200, height: 1400 },
    screenshots: [
      { src: '/apps/iridescence-pdf-reader/reader-workspace-light.png', alt: 'Iridescence PDF Reader workspace in light mode.', width: 2200, height: 1400, caption: 'A document, its folder, and its navigation in one window.' },
      { src: '/apps/iridescence-pdf-reader/tabs.png', alt: 'Several PDF documents open in native tabs.', width: 2200, height: 1400, caption: 'Each tab keeps its position, zoom level, and annotations.' },
      { src: '/apps/iridescence-pdf-reader/annotations.png', alt: 'An annotation and the comments list in the inspector.', width: 2200, height: 1400, caption: 'Highlights, underlines, strikeouts, and PDFKit comments.' },
      { src: '/apps/iridescence-pdf-reader/palette-command.png', alt: 'A command palette inspired by Spotlight.', width: 1240, height: 792, caption: 'Commands, search, files, and pages from the keyboard.' },
      { src: '/apps/iridescence-pdf-reader/ocr-panel.png', alt: 'Text recognized by Apple Vision in the OCR panel.', width: 1280, height: 1000, caption: 'Text from a scanned page becomes selectable, copyable, and exportable.' },
      { src: '/apps/iridescence-pdf-reader/settings.png', alt: 'Native Iridescence PDF Reader settings.', width: 1040, height: 846, caption: 'Reading, workspaces, and privacy remain configurable.' },
    ],
    features: [
      { title: 'Truly native', description: 'Rust talks directly to AppKit and PDFKit: no Electron and no web layer.' },
      { title: 'Workspaces', description: 'Browse folders, follow iCloud status, and index PDFs in the background.' },
      { title: 'Multiple documents', description: 'Independent tabs retain position, zoom, history, and changes.' },
      { title: 'Active reading', description: 'Outline, thumbnails, search, bookmarks, annotations, and comments stay close.' },
      { title: 'Quick palette', description: 'Open a command, file, search, or page as you would in Spotlight.' },
      { title: 'Apple Vision OCR', description: 'Recognize scanned text locally and export it as TXT.' },
    ],
    sections: [
      { id: 'workspaces', title: 'Your folders become reading spaces', description: 'Open an entire folder, browse its hierarchy, and let macOS download the required iCloud items.', screenshot: '/apps/iridescence-pdf-reader/reader-workspace-light.png' },
      { id: 'reading', title: 'Read, navigate, annotate', description: 'Thumbnails, outline, search, bookmarks, and PDFKit annotations organize the work without covering the document.', screenshot: '/apps/iridescence-pdf-reader/annotations.png' },
      { id: 'command-palette', title: 'Find anything from the keyboard', description: 'The palette combines actions, full-text search, page navigation, recent documents, and workspace files.', screenshot: '/apps/iridescence-pdf-reader/palette-command.png' },
      { id: 'ocr', title: 'Make scanned text accessible', description: 'Apple Vision recognizes a page on demand on your Mac. Copy or save the result without a remote service.', screenshot: '/apps/iridescence-pdf-reader/ocr-panel.png' },
    ],
    seo: { title: 'Iridescence PDF Reader for macOS', description: 'A native macOS PDF reader with workspaces, tabs, annotations, command palette, Apple Vision OCR, and iCloud Drive.', image: '/apps/iridescence-pdf-reader/og.png' },
  },
  'mass-print': {
    tagline: 'All your documents. The right order. One print run.',
    description: 'Arrange multiple documents in the exact order you need, then print them sequentially from one window.',
    longDescription: 'Drop files from Finder, reorder them manually or with precise sorting, choose your printer, and stay in control through the final document.',
    compatibility: 'macOS 12.3 or later',
    architecture: 'Apple Silicon and Intel',
    primaryScreenshot: { src: '/apps/mass-print/mass-print-main.png', alt: 'Mass Print window with four ordered documents, print options, and the Print All button.', width: 1180, height: 760 },
    screenshots: [{ src: '/apps/mass-print/mass-print-main.png', alt: 'Mass Print document queue with order, status, and print options.', width: 1180, height: 760, caption: 'The visible queue is the exact order sent to the printer.' }],
    features: [
      { title: 'Controlled order', description: 'Drag rows, use accessible buttons, or reverse a preset sort.' },
      { title: 'Useful sorting', description: 'Natural name, date, size, type, page count, or addition order.' },
      { title: 'Finder Quick Action', description: 'Send a selection to the queue from Quick Actions or Services without printing automatically.' },
      { title: 'Essential settings', description: 'Printer, copies, grayscale, duplex, and fit-to-page options.' },
      { title: 'Sequential printing', description: 'Jobs are prepared and submitted to CUPS one by one in the visible order.' },
      { title: 'Local processing', description: 'No account, analytics, or upload: originals never leave your Mac and are never modified.' },
    ],
    sections: [
      { id: 'ordering', title: 'The visible order is the print order', description: 'Build a custom queue or apply a stable sort. New documents respect the active mode.' },
      { id: 'finder', title: 'Straight from Finder', description: 'The Quick Action opens or wakes Mass Print with the selected files. It never starts printing on its own.' },
      { id: 'privacy', title: 'Your documents stay on your Mac', description: 'Preparation, conversion, and submission use local macOS tools. Source files remain untouched.' },
    ],
    seo: { title: 'Mass Print for macOS', description: 'Arrange and print multiple documents in a precise order with Finder drag and drop, sorting, and local sequential printing.', image: '/apps/mass-print/og.png' },
  },
};

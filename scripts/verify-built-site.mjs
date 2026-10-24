import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(target) : [target];
  }));
  return nested.flat();
}

async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}

const files = await filesBelow(dist);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const broken = [];
const privacyHits = [];
const privatePatterns = [/\/Users\//i, /theodeville/i, /\bTh[eé]o\b/i, /\bDeville\b/i, /file:\/\//i];

for (const file of files) {
  const content = await readFile(file);
  if (content.includes(0)) continue;
  const text = content.toString('utf8');
  for (const pattern of privatePatterns) {
    if (pattern.test(text)) privacyHits.push(`${path.relative(dist, file)}: ${pattern}`);
  }
}

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const attributes = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const value of attributes) {
    if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/api/')) continue;
    const pathname = value.split(/[?#]/, 1)[0];
    if (!pathname) continue;
    const relative = pathname.replace(/^\//, '');
    const candidates = pathname.endsWith('/')
      ? [path.join(dist, relative, 'index.html')]
      : [path.join(dist, relative), path.join(dist, relative, 'index.html'), path.join(dist, `${relative}.html`)];
    if (!(await Promise.all(candidates.map(exists))).some(Boolean)) {
      broken.push(`${path.relative(dist, file)} -> ${value}`);
    }
  }
}

if (broken.length || privacyHits.length) {
  if (broken.length) console.error(`Broken local references:\n${broken.join('\n')}`);
  if (privacyHits.length) console.error(`Privacy-sensitive strings:\n${privacyHits.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Verified ${htmlFiles.length} HTML pages: no broken local references or private local strings.`);
}

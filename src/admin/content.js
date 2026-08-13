const THEMES = new Set(['developpement', 'securite', 'systemes', 'projets']);
const PRIVATE_IDENTITY = /\b(?:th[eé]o|deville)\b/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_SAVE_BYTES = 20 * 1024 * 1024;

function requireText(value, label, minimum = 1, maximum = 2_000) {
  if (typeof value !== 'string' || value.trim().length < minimum || value.length > maximum) {
    throw new Error(`${label} is invalid`);
  }
  if (PRIVATE_IDENTITY.test(value)) throw new Error(`${label} must keep the public site anonymous`);
  return value;
}

function yamlString(value) {
  return JSON.stringify(value);
}

function validatePost(post) {
  if (!post || typeof post !== 'object') throw new Error('post is invalid');
  if (!['article', 'note'].includes(post.format)) throw new Error('format is invalid');
  requireText(post.title, 'title', 4, 160);
  requireText(post.description, 'description', 20, 180);
  if (!SLUG.test(post.slug)) throw new Error('slug is invalid');
  if (!THEMES.has(post.theme)) throw new Error('theme is invalid');
  if (!Array.isArray(post.tags) || post.tags.length < 2 || post.tags.length > 4
    || post.tags.some((tag) => typeof tag !== 'string' || !SLUG.test(tag))) {
    throw new Error('tags must contain 2 to 4 normalized values');
  }
  if (new Set(post.tags).size !== post.tags.length) throw new Error('tags contain duplicates');
  if (typeof post.publishedAt !== 'string'
    || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(post.publishedAt)
    || Number.isNaN(Date.parse(post.publishedAt))) throw new Error('publishedAt is invalid');
  if (post.updatedAt !== undefined && (typeof post.updatedAt !== 'string'
    || Number.isNaN(Date.parse(post.updatedAt)))) throw new Error('updatedAt is invalid');
  if (typeof post.draft !== 'boolean') throw new Error('draft is invalid');
  if (post.series !== undefined) requireText(post.series, 'series', 2, 120);
  if (post.socialImage !== undefined && !/^\.\/images\/[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/.test(post.socialImage)) {
    throw new Error('socialImage is invalid');
  }
  requireText(post.body, 'body', 1, 200_000);
  if (/<\/?[A-Za-z][^>]*>/.test(post.body)) throw new Error('Raw HTML is not allowed in Markdown');
  return post;
}

export function serializePost(post) {
  validatePost(post);
  const lines = [
    '---',
    `format: ${post.format}`,
    `title: ${yamlString(post.title)}`,
    `description: ${yamlString(post.description)}`,
    `slug: ${post.slug}`,
    `theme: ${post.theme}`,
    'tags:',
    ...post.tags.map((tag) => `  - ${tag}`),
    `publishedAt: ${yamlString(post.publishedAt)}`,
  ];
  if (post.updatedAt) lines.push(`updatedAt: ${yamlString(post.updatedAt)}`);
  lines.push(`draft: ${post.draft}`);
  if (post.series) lines.push(`series: ${yamlString(post.series)}`);
  if (post.socialImage) lines.push(`socialImage: ${yamlString(post.socialImage)}`);
  lines.push('---', '', post.body.replace(/\s+$/u, ''), '');
  return lines.join('\n');
}

function decodeBase64(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) throw new Error('image Base64 is invalid');
  try {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  } catch {
    throw new Error('image Base64 is invalid');
  }
}

export function validateImage(image) {
  if (!image || typeof image !== 'object' || !IMAGE_NAME.test(image.name)) throw new Error('image name is unsafe');
  const bytes = decodeBase64(image.contentBase64);
  if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) throw new Error('image size is invalid');
  const isWebP = bytes.length >= 12
    && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF'
    && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  if (!isWebP) throw new Error('image must be WebP');
  return { name: image.name, contentBase64: image.contentBase64, size: bytes.length };
}

export function buildPostChanges({ post, previousSlug, existingImages = [], images = [], deletedImages = [] }) {
  const markdown = serializePost(post);
  if (previousSlug !== undefined && !SLUG.test(previousSlug)) throw new Error('previous slug is invalid');
  const validatedImages = [...existingImages, ...images].map(validateImage);
  const total = validatedImages.reduce((sum, image) => sum + image.size, new TextEncoder().encode(markdown).length);
  if (validatedImages.length > 24) throw new Error('maximum 24 images per post');
  if (total > MAX_SAVE_BYTES) throw new Error('save is larger than 20 MiB');
  for (const name of deletedImages) if (!IMAGE_NAME.test(name)) throw new Error('deleted image name is unsafe');

  const changes = [{ path: `src/data/blog/${post.slug}/index.md`, content: markdown }];
  const names = new Set();
  for (const image of validatedImages) {
    if (names.has(image.name)) throw new Error(`duplicate image: ${image.name}`);
    names.add(image.name);
    changes.push({ path: `src/data/blog/${post.slug}/images/${image.name}`, contentBase64: image.contentBase64 });
  }
  if (previousSlug && previousSlug !== post.slug) {
    changes.push({ path: `src/data/blog/${previousSlug}/index.md`, delete: true });
    for (const image of existingImages.map(validateImage)) {
      changes.push({ path: `src/data/blog/${previousSlug}/images/${image.name}`, delete: true });
    }
  }
  for (const name of deletedImages) {
    changes.push({ path: `src/data/blog/${post.slug}/images/${name}`, delete: true });
  }
  return changes;
}

export function postPath(slug) {
  if (!SLUG.test(slug)) throw new Error('slug is invalid');
  return `src/data/blog/${slug}/index.md`;
}

export function imagePath(slug, name) {
  if (!SLUG.test(slug) || !IMAGE_NAME.test(name)) throw new Error('image path is invalid');
  return `src/data/blog/${slug}/images/${name}`;
}

function decodeTextBase64(value) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function scalar(value) {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1).replace(/''/g, "'");
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed.slice(1, -1).split(',').map((item) => item.trim()).filter(Boolean);
  }
  if (trimmed.startsWith('"')) return JSON.parse(trimmed);
  return trimmed;
}

export function parsePost(markdown) {
  if (typeof markdown !== 'string' || !markdown.startsWith('---\n')) throw new Error('Markdown frontmatter is missing');
  const boundary = markdown.indexOf('\n---\n', 4);
  if (boundary === -1) throw new Error('Markdown frontmatter is not closed');
  const lines = markdown.slice(4, boundary).split('\n');
  const data = {};
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^([A-Za-z][A-Za-z0-9]*):(?:\s*(.*))?$/);
    if (!match) throw new Error(`Unsupported frontmatter line: ${lines[index]}`);
    const [, key, raw = ''] = match;
    if (key === 'tags') {
      if (raw.trim()) {
        data.tags = scalar(raw);
      } else {
        const tags = [];
        while (lines[index + 1]?.startsWith('  - ')) tags.push(lines[++index].slice(4));
        data.tags = tags;
      }
    } else {
      data[key] = scalar(raw);
    }
  }
  const post = { ...data, body: markdown.slice(boundary + 5).replace(/\n$/, '') };
  validatePost(post);
  return post;
}

export async function readAdminContent(client) {
  const snapshot = await client.readSnapshot();
  const entries = snapshot.entries.filter((entry) => entry.type === 'blob' && typeof entry.path === 'string');
  const byPath = new Map(entries.map((entry) => [entry.path, entry]));
  async function readText(path) {
    const entry = byPath.get(path);
    if (!entry?.sha) throw new Error(`Required content file is missing: ${path}`);
    return decodeTextBase64(await client.readBlob(entry.sha));
  }

  const [aboutText, settingsText, repositoriesText] = await Promise.all([
    readText('src/data/pages/about.json'),
    readText('src/data/project-settings.json'),
    readText('src/generated/github-projects.json'),
  ]);
  const postEntries = entries.filter((entry) => /^src\/data\/blog\/[a-z0-9-]+\/index\.md$/.test(entry.path));
  const posts = await Promise.all(postEntries.map(async (entry) => {
    const post = parsePost(decodeTextBase64(await client.readBlob(entry.sha)));
    const prefix = `src/data/blog/${post.slug}/images/`;
    const images = await Promise.all(entries
      .filter((image) => image.path.startsWith(prefix) && image.path.endsWith('.webp'))
      .map(async (image) => ({
        name: image.path.slice(prefix.length),
        contentBase64: (await client.readBlob(image.sha)).replace(/\s/g, ''),
      })));
    return { ...post, images };
  }));
  return {
    headSha: snapshot.headSha,
    about: JSON.parse(aboutText),
    projectSettings: JSON.parse(settingsText),
    repositories: JSON.parse(repositoriesText),
    posts: posts.sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt)),
  };
}

export async function deletionChanges(client, slug) {
  const snapshot = await client.readSnapshot();
  const prefix = `src/data/blog/${slug}/`;
  const changes = snapshot.entries
    .filter((entry) => entry.type === 'blob' && entry.path.startsWith(prefix))
    .map((entry) => ({ path: entry.path, delete: true }));
  if (!changes.some((change) => change.path === postPath(slug))) throw new Error(`Post does not exist: ${slug}`);
  return changes;
}

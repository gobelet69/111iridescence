import { readFile, readdir } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('admin-editable content files', () => {
  it('stores every post as Markdown in its slug folder', async () => {
    const folders = await readdir('src/data/blog', { withFileTypes: true });

    expect(folders.length).toBeGreaterThan(0);
    expect(folders.every((entry) => entry.isDirectory())).toBe(true);
    for (const folder of folders) {
      await expect(readFile(`src/data/blog/${folder.name}/index.md`, 'utf8')).resolves.toMatch(/^---\n/);
    }
  });

  it('provides structured about and project settings data', async () => {
    const about = JSON.parse(await readFile('src/data/pages/about.json', 'utf8'));
    const settings = JSON.parse(await readFile('src/data/project-settings.json', 'utf8'));

    expect(about.sections).toHaveLength(3);
    expect(settings.pinned).toEqual([
      'gobelet69/portail-vault',
      'gobelet69/PwdGen',
      'gobelet69/Osint-Framework',
    ]);
  });
});

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Homepage from '../../src/pages/index.astro';
import { SITE } from '../../src/config/site';

describe('homepage copy contract', () => {
  it('renders the standalone hero identity and current app catalog', async () => {
    const container = await AstroContainer.create();

    const html = await container.renderToString(Homepage);

    expect(html).toContain(SITE.heroTitle);
    expect(html).not.toContain('Des applications macOS pensées');
    expect(html).not.toContain('le signal n’est jamais fixe.');
    expect(html).toContain('Iridescence PDF Reader');
    expect(html).toContain('Mass Print');
    expect(html).not.toContain('À lire et à explorer');
  });
});

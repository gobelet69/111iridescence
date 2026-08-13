import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { afterEach, describe, expect, it } from 'vitest';
import Homepage from '../../src/pages/index.astro';
import { SITE } from '../../src/config/site';

const approvedProfile = SITE.profile;

afterEach(() => {
  (SITE as { profile: string }).profile = approvedProfile;
});

describe('homepage copy contract', () => {
  it('renders the profile supplied by the shared site contract', async () => {
    const alternateProfile = 'Profil de test fourni par la configuration.';
    (SITE as { profile: string }).profile = alternateProfile;
    const container = await AstroContainer.create();

    const html = await container.renderToString(Homepage);

    expect(html).toContain(alternateProfile);
    expect(html).not.toContain(approvedProfile);
  });
});

import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import * as aboutModule from '../../src/lib/about';

const section = (id: string) => ({
  id,
  title: 'Une section',
  body: 'Un texte suffisamment explicite pour la page À propos.',
});

const aboutFixture = {
  eyebrow: 'Derrière le site',
  title: 'À propos',
  description: "Ce que je construis et la raison d'être de ce site public.",
  intro: "Je garde ici une trace publique de ce que j'apprends.",
  sections: [section('work'), section('interests')],
  contact: {
    label: 'Code public',
    text: 'GitHub',
    href: 'https://github.com/gobelet69',
  },
};

describe('about page data', () => {
  it('accepts the checked-in about page', async () => {
    const checkedIn = JSON.parse(await readFile('src/data/pages/about.json', 'utf8'));

    expect((aboutModule as any).validateAboutPage(checkedIn)).toEqual(checkedIn);
  });

  it('rejects duplicate anchors and insecure contact URLs', () => {
    const validate = (aboutModule as any).validateAboutPage;

    expect(() => validate({
      ...aboutFixture,
      sections: [section('same-id'), section('same-id')],
    })).toThrow('unique');
    expect(() => validate({
      ...aboutFixture,
      contact: { ...aboutFixture.contact, href: 'http://example.com' },
    })).toThrow('https');
  });

  it('keeps the public profile anonymous', () => {
    expect(() => (aboutModule as any).validateAboutPage({
      ...aboutFixture,
      intro: 'Theo Deville écrit ici.',
    })).toThrow('anonymous');
  });

  it('normalizes stable section ids', () => {
    expect((aboutModule as any).normalizeSectionId('  Sécurité & systèmes  ')).toBe('securite-systemes');
  });
});

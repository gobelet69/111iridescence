export interface AboutSection {
  id: string;
  title: string;
  body: string;
}

export interface AboutContact {
  label: string;
  text: string;
  href: string;
}

export interface AboutPage {
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
  sections: AboutSection[];
  contact: AboutContact;
}

const PRIVATE_IDENTITY = /\b(?:th[eé]o|deville)\b/i;

export function normalizeSectionId(value: string) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function requireText(value: unknown, label: string, maximum = 2_000) {
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > maximum) {
    throw new Error(`${label} must be a non-empty string of at most ${maximum} characters`);
  }
  if (PRIVATE_IDENTITY.test(value)) throw new Error(`${label} must keep the public profile anonymous`);
  return value;
}

function assertKeys(record: Record<string, unknown>, expected: string[], label: string) {
  const expectedKeys = new Set(expected);
  const unknown = Object.keys(record).filter((key) => !expectedKeys.has(key));
  if (unknown.length > 0) throw new Error(`${label} contains unknown field: ${unknown[0]}`);
}

export function validateAboutPage(input: unknown): AboutPage {
  const page = requireRecord(input, 'About page');
  assertKeys(page, ['eyebrow', 'title', 'description', 'intro', 'sections', 'contact'], 'About page');
  if (!Array.isArray(page.sections) || page.sections.length === 0 || page.sections.length > 12) {
    throw new Error('About page sections must contain between 1 and 12 entries');
  }

  const sectionIds = new Set<string>();
  const sections = page.sections.map((value, index) => {
    const section = requireRecord(value, `About section ${index + 1}`);
    assertKeys(section, ['id', 'title', 'body'], `About section ${index + 1}`);
    const id = requireText(section.id, `About section ${index + 1} id`, 80);
    if (id !== normalizeSectionId(id)) throw new Error(`About section id must be normalized: ${id}`);
    if (sectionIds.has(id)) throw new Error(`About section ids must be unique: ${id}`);
    sectionIds.add(id);
    return {
      id,
      title: requireText(section.title, `About section ${index + 1} title`, 120),
      body: requireText(section.body, `About section ${index + 1} body`),
    };
  });

  const contact = requireRecord(page.contact, 'About contact');
  assertKeys(contact, ['label', 'text', 'href'], 'About contact');
  const href = requireText(contact.href, 'About contact href', 500);
  let contactUrl: URL;
  try {
    contactUrl = new URL(href);
  } catch {
    throw new Error('About contact href must be a valid https URL');
  }
  if (contactUrl.protocol !== 'https:') throw new Error('About contact href must use https');

  return {
    eyebrow: requireText(page.eyebrow, 'About eyebrow', 120),
    title: requireText(page.title, 'About title', 120),
    description: requireText(page.description, 'About description', 180),
    intro: requireText(page.intro, 'About intro'),
    sections,
    contact: {
      label: requireText(contact.label, 'About contact label', 120),
      text: requireText(contact.text, 'About contact text', 120),
      href,
    },
  };
}

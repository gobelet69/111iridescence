# 111iridescence Website Agent Instructions

## 111iridescence Shared Directives

1. Inspect the active repository and preserve uncommitted changes.
2. Never expose private repository names, user identity or personal file contents in public artifacts. Never reveal the creator's real first or last name.
3. Keep the existing transparency about the use of AI in development.
4. Preserve the name and identity of 111iridescence and the focus on macOS applications.
5. Keep English as the primary language and maintain the complete French version.
6. Do not turn the website back into a traditional blog or GitHub portfolio.
7. Preserve existing functionality and valid URLs.
8. Use real runtime evidence for visual and performance claims. Respect platform boundaries and run real verification.
9. Propose scoped changes, run appropriate tests, and verify external writes.

## Frontend UI/UX work routes through frontend-design-pro

Before writing or editing anything a user sees in a browser — components, pages,
layouts, styles, animation, forms, dashboards — read
`frontend-design-pro/SKILL.md` first.

It is a registry, not a document. Do not read the whole pack; it is ~344k tokens
and loading it is neither possible nor the intent.

### Loading protocol

1. Read `frontend-design-pro/SKILL.md` (~2k tokens). Always.
2. Match the request against its **Trigger keywords** column and pick exactly
   **one** skill. Most specific wins — "form validation" routes to `forms`, not
   `react-components`.
3. Read `frontend-design-pro/catalog/{id}/SKILL.md`.
4. Read the `core/*.md` files that skill declares in its frontmatter `metadata.core-deps`,
   plus `frontend-design-pro/core/accessibility-baseline.md` and
   `frontend-design-pro/core/validate-checklist.md` whenever the task produces code.
5. Read a `frontend-design-pro/catalog/{id}/references/*.md` file **only** when the
   routed skill's Reference Index points at it for this specific task. Open it —
   do not paraphrase it from memory.
6. Budget **8,000 tokens**. A correctly routed request lands near 6,042–7,956.

Before building a page, site, app or dashboard, read
`frontend-design-pro/core/user-intake.md` and ask what is load-bearing. Building
on an invented assumption is the most expensive mistake available.

No keyword match? Ask one clarifying question. Never guess the route.

### The anti-slop wall is absolute

`frontend-design-pro/SKILL.md` contains a list of banned patterns. It overrides
style preferences, house habits and your own defaults. Follow it as written —
do not summarise it, and do not restate it here, because one copy is the only
reason it cannot drift.

### Before returning code

Self-check against `frontend-design-pro/core/validate-checklist.md`, and name the
skill id you routed to.
Priority when rules collide: **Accessibility > Usability > Aesthetics > Performance > Features > Speed.**

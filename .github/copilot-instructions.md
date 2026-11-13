# Defenders Academy project guidance

- Preserve existing code and behavior. Read the relevant implementation and its callers before editing; make the smallest complete change and never replace a file wholesale to simplify a task.
- Follow the established architecture: Next.js App Router frontend in `frontend/`; Express 5, Zod, Prisma 7, and PostgreSQL backend in `backend/`.
- The project uses TypeScript/JavaScript, React, CSS/Tailwind, HTML/JSX, SQL/Prisma schema, JSON, YAML, Docker Compose, and Windows/Unix shell scripts. Use the existing package scripts, types, helpers, naming, formatting, and localization patterns.
- Keep user-visible content in the French, English, and Arabic dictionaries. Preserve RTL behavior and test responsive layouts when changing shared UI.
- For researched or promotional content, verify claims against current primary/official sources. Do not invent services, dates, certifications, history, testimonials, or availability; distinguish unverified details and link sources where appropriate.
- For UI changes, preserve accessibility and responsive behavior across desktop and mobile, including keyboard focus, readable contrast, reduced-motion preferences, and RTL layouts.
- Treat authorization, data validation, database transactions, and API response shapes as contracts. Validate untrusted input at boundaries; report errors rather than silently masking failures.
- Before editing, trace the relevant UI or API flow. After editing, run the narrowest applicable lint, type-check, tests, and build; report any checks blocked by missing external services.
- Do not remove, rewrite, or broadly reformat unrelated code. Keep secrets and local environment values out of source changes.
- Load the matching project skill from `.github/skills/` for language/framework, logic/testing, or UI/UX work. Use `.github/skills/README.md` to navigate related skills and references.

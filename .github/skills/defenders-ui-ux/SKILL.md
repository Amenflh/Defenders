---
name: defenders-ui-ux
description: "Design, implement, improve, or audit Defenders Academy user interfaces and interactions. Use for responsive layout, navigation, forms, dialogs, accessibility, keyboard behavior, RTL/Arabic, French/English/Arabic localization, animation, or visual consistency."
---

# Defenders Academy UI and UX

## Product context

The public site is a multilingual fitness-academy website in French, English, and Arabic. Preserve its established visual identity, dark/gold design tokens, conversion journeys, and responsive navigation while improving clarity and usability.

## Workflow

1. Follow the complete interaction from entry point to completion, including loading, empty, error, success, and dismissal states.
2. Read the relevant component, shared styles, locale dictionaries, and mobile/desktop variants before editing. Reuse shared components and existing tokens.
3. Make layouts responsive and content-driven; test narrow and wide viewports, long labels, and translated text instead of assuming French strings fit every language.
4. Use semantic HTML, accessible names, visible focus, logical focus order, keyboard operation, and correct dialog/menu semantics. Restore focus after closing an overlay and keep modal focus contained.
5. For Arabic, preserve RTL document direction, mirrored layout and icons where appropriate, and correct reading order; do not hard-code left/right where logical start/end is intended.
6. Honor `prefers-reduced-motion` for CSS and JavaScript animations. Keep content visible if animation code does not run.
7. Prefer clear hierarchy, readable contrast and typography, concise labels, forgiving form errors, and predictable navigation over decorative effects.
8. Validate with the repository's lint, typecheck, and relevant tests. Use the existing [web-design-guidelines](../web-design-guidelines/SKILL.md) for a focused UI audit and [React best practices](../vercel-react-best-practices/SKILL.md) for rendering/performance concerns.

## Guardrails

- Do not silently remove features, change business rules, or create a visual redesign outside the requested scope.
- Keep translations in the established dictionaries and preserve all three supported locales.
- Avoid unnecessary animation, scroll listeners, layout shifts, focus loss, and duplicate controls.
- Inspect the final behavior at keyboard and touch interaction sizes, not only in a desktop screenshot.

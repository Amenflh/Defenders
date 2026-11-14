---
name: defenders-full-stack-engineering
description: "Implement, debug, review, or refactor Defenders Academy code across TypeScript, JavaScript, React, Next.js, Express, Prisma, PostgreSQL, SQL, CSS, Tailwind, HTML/JSX, JSON, YAML, Docker Compose, and shell scripts. Use for cross-layer changes, project conventions, or when the correct existing pattern is unclear."
---

# Defenders Academy full-stack engineering

## Goal

Deliver a precise, working change that fits this repository. This skill supplements—not replaces—the relevant source code, tests, framework documentation, and project instructions.

## Before changing code

1. Read `.github/copilot-instructions.md` and the relevant graph in [../README.md](../README.md).
2. Locate the entry point, callers, shared types/helpers, related translations, and tests. Trace the behavior from user input to UI/API and persistence when the change crosses layers.
3. Identify the actual language and framework from nearby files and manifests. Do not introduce a new library or architecture if existing patterns solve the problem.
4. State the behavior that must remain unchanged. Preserve unrelated work and avoid whole-file rewrites, speculative cleanup, and broad formatting.

## Stack-specific practices

- **TypeScript / JavaScript:** retain strict types and async error propagation; prefer existing domain types and helpers over casts, duplicated conditions, or silent fallbacks.
- **React / Next.js:** preserve Server Component boundaries, App Router conventions, stable keys, accessible semantics, and existing data-fetching patterns. Keep client state local and avoid rendering or subscribing to work that is not needed.
- **Express / Zod:** validate untrusted input at route boundaries, keep route/controller/service responsibilities consistent, and preserve documented status codes and response shapes.
- **Prisma / PostgreSQL / SQL:** use the project schema and generated types, parameterized queries, transactions for coupled writes, and migrations for schema changes. Never use a destructive query against a non-test database.
- **CSS / Tailwind / HTML / JSX:** follow the design tokens, responsive utilities, semantic markup, keyboard access, RTL behavior, and reduced-motion preferences already used by the site.
- **JSON / YAML / Docker Compose / scripts:** preserve valid syntax, quote values where required, avoid embedding secrets, and make changes compatible with the repository's supported runtime and CI.

## Make and verify a change

1. Implement the smallest complete change at the layer that owns the behavior. Update translations, API documentation, or tests when those contracts are affected.
2. Check edge cases and failure behavior; do not make an error look like success.
3. Run the narrowest applicable repository scripts (lint, typecheck, unit/integration tests, build). If a check depends on PostgreSQL, network access, or credentials, report that dependency instead of weakening the check.
4. Review the final diff for accidental deletions, unrelated changes, and preserved behavior.

For business invariants and test cases, also load [defenders-logic-and-testing](../defenders-logic-and-testing/SKILL.md). For user-facing interaction and layout, also load [defenders-ui-ux](../defenders-ui-ux/SKILL.md).

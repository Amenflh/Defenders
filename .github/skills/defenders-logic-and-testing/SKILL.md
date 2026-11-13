---
name: defenders-logic-and-testing
description: "Reason about, implement, debug, or test Defenders Academy business logic, validation, state transitions, API contracts, database operations, permissions, and edge cases. Use when correctness depends on rules or multiple layers, not just syntax."
---

# Defenders Academy logic and testing

## Reason from invariants

1. Describe the expected behavior in terms of inputs, state, outputs, and side effects before editing.
2. Trace the rule through its call sites, authorization checks, validation schema, service/database operations, UI state, and translations as applicable.
3. Identify invariants (ownership, roles, uniqueness, allowed transitions, totals, ordering, limits) and failure states. Never infer authorization from a client-supplied value.
4. Keep one authoritative implementation of each rule; reuse existing schemas and domain helpers rather than creating slightly different copies.

## Test design

- Cover the ordinary path, invalid input, boundary values, missing or stale state, repeated requests, and unauthorized access where relevant.
- Assert externally observable behavior: HTTP status and response shape, persisted state, rendered interaction, or generated output—not private implementation details.
- Use the project's test helpers and isolated test database. Do not run destructive integration tests against a database whose name does not end in `_test`.
- Make asynchronous tests await their work. Avoid order-dependent fixtures and tests that pass only because a previous test changed shared state.
- For bug fixes, add a regression case that fails before the fix and passes after it whenever practical.

## Safe implementation

- Validate at the trust boundary and enforce the rule again in the authoritative backend/service layer when needed.
- Use a transaction when several writes must succeed or fail together; handle uniqueness and concurrency with database constraints rather than check-then-write assumptions.
- Preserve existing API contracts and return explicit, meaningful failures. Do not catch and ignore errors or use success-shaped fallback data for a failed operation.
- For async UI, account for loading, empty, success, failure, cancellation, and stale responses where applicable.

Before finishing, run the narrow tests and type-check for the changed layer, then review adjacent callers for regressions. Use [the full-stack skill](../defenders-full-stack-engineering/SKILL.md) for stack conventions and [the UI/UX skill](../defenders-ui-ux/SKILL.md) when behavior is user-facing.

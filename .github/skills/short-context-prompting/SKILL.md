---
name: short-context-prompting
description: "Help write focused, short-context prompts for GitHub Copilot in VS Code. Use when choosing files, selections, codebase search, chat versus inline chat, agents, slash commands, or editor tools."
argument-hint: "[task or error]"
---

# Short-Context Prompting in VS Code

Help the user give Copilot enough relevant context to do the task without attaching unrelated files or making unsupported assumptions about editor features.

## Choose the smallest useful context

- **A local edit:** select the relevant code and use `#selection`, or attach the exact file with `#<file>`.
- **A known, short call chain:** attach the few involved files or symbols. State the expected behavior and what should remain unchanged.
- **A feature whose location is unknown:** use `#codebase` to ask Copilot to find the relevant implementation, then narrow to the files it discovers. `#codebase` searches the workspace; it does not attach the entire repository.
- **An error:** include the exact error and the relevant code. Use the context picker for terminal output when available; do not assume an old terminal reference works in every chat harness.
- Do not require a context variable in every prompt. If the task is clear and the needed context is already attached, ask directly.

## Choose the right VS Code surface

- Use **Inline Chat** (`Ctrl+I` on Windows/Linux) for a small edit in the active file. A selection narrows the target; review the proposed diff and choose **Keep** or **Undo**.
- Use **Chat / Agent** for codebase discovery, multi-file work, tool use, or a task that needs implementation and verification. Ask for the outcome, scope, constraints, and relevant checks.
- Use the **Tools** and **Add Context** pickers to discover what the current harness actually supports. Tool availability and approvals depend on the session.
- Type `/` to see the slash commands and skills available in the current session. Do not promise `/explain`, `/fix`, or `/tests` unless they appear in that picker; extensions and skills can add commands.
- For a terminal command suggestion, use terminal inline chat and review the command before choosing **Run**. In Chat, `!command` runs immediately; use it only when execution is intended.

## Correct common misconceptions

- In the **Copilot harness**, `@` chat participants such as `@workspace`, `@terminal`, and `@vscode` are deprecated and unsupported. Use `#` context references, the current agent, and the available tools instead. `@` participants may remain for Local-harness compatibility.
- `#file` is not written as `@file`. Type `#` and choose the file from the context picker.
- `#selection` refers to selected editor text; it is not a request to edit every file in the workspace.
- Context references focus a request; they do not guarantee that only those files can be inspected or changed. State scope explicitly, and review the diff.
- Inline Chat is useful for focused edits, not a substitute for Chat when tracing behavior across the app.

## Prompt patterns for this workspace

**Focused edit**

> `#frontend/src/components/Header.tsx` Adjust the tablet header spacing only. Keep the existing navigation and logo behavior. Run the frontend lint check.

**Trace before changing**

> Use `#codebase` to find where contact registrations are validated and submitted. Trace only that flow, list the relevant files, and explain the current behavior before proposing a change.

**Selected-code refactor**

> Refactor `#selection` to remove the repeated work. Preserve its behavior and update only directly related tests. Show the diff.

**Test failure**

> Here is the exact error: [paste error]. Inspect the relevant test and implementation, identify the cause, make the smallest fix, then run `npm test` from `frontend/`.

For code changes, preserve existing project conventions, inspect enough related code to avoid a proxy fix, and report which checks passed or failed.

## Official references

- [Add context to chat](https://code.visualstudio.com/docs/chat/copilot-chat-context)
- [Tools and context reference](https://code.visualstudio.com/docs/agents/reference/tools-reference)
- [Inline Chat and Quick Chat](https://code.visualstudio.com/docs/chat/inline-chat)
- [Use chat in VS Code](https://code.visualstudio.com/docs/chat/chat-overview)

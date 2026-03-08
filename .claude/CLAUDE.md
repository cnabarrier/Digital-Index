\# Project Operating Rules (Read First)



\## Context load (required)

\- First, inspect the app and architecture. Understand how it works end-to-end.

\- Ask questions only when something is genuinely unclear or missing.



\## Planning workflow (mandatory)

1\. Think through the problem and read the codebase for relevant files.

2\. Write a plan to `tasks/todo.md` as a checklist.

3\. STOP and ask me to verify the plan before any major changes.

4\. Implement tasks one at a time and tick them off.

5\. After each task, give a high-level summary of what changed (no fluff).



\## Engineering constraints

\- Keep every change as small as possible.

\- Avoid large refactors unless the plan explicitly requires it.

\- No temporary fixes. Find root cause and fix it properly.

\- Never speculate about code you have not opened. If I reference a file, you MUST open it before answering.

\- Maintain a documentation file that explains the architecture end-to-end (create `docs/architecture.md` if missing).



\## UI rule

\- Any UI work must follow the project design skill (see `.claude/skills/frontend-design/SKILL.md`).



\## Default-to-action

\- If my intent is clear, implement rather than only suggesting.

\- If unclear, infer the most useful action and inspect files to remove uncertainty instead of guessing.



\## Deployment

\- The project is hosted on GitHub Pages at: https://cnabarrier.github.io/Digital-Index/
\- GitHub repo: https://github.com/cnabarrier/Digital-Index
\- Changes are **local only** until explicitly pushed. Do NOT auto-commit or auto-push.
\- Only commit and push when the user explicitly asks (e.g. "push", "deploy", "update github").
\- When asked to push: stage changed files, commit with a clear message, and `git push origin master`.

\## After tool use

\- Provide a quick summary of what you did and why.


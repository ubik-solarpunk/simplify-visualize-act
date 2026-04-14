---
name: "resume-session"
description: "Use when you need to continue work in a fresh session with minimal prompting by reconstructing state from the repo handoff and current git status."
---

# Resume Session

Use this skill when the session is new or context is thin and the goal is to continue the repository's current work without re-reading the entire transcript.

## Workflow

1. Read `.codex/context/session-handoff.md`.
2. Run `git branch --show-current` and `git status --short`.
3. Confirm the current objective, current branch, open questions, and next three actions in one compact summary.
4. If the handoff and git state conflict, trust the current filesystem and git state, then update the handoff before substantial new work.
5. Continue from the smallest pending implementation or validation step instead of re-planning from scratch.

## Output Contract

- Restate the active goal in one sentence.
- Note the current branch and whether it satisfies the branch policy.
- List the next three actions exactly or refine them if the repo state has changed.
- Call out any missing context that still blocks execution.

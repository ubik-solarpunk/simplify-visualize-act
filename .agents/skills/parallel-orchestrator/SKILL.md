---
name: "parallel-orchestrator"
description: "Use when the task explicitly calls for parallel Codex agent work and you need a consistent orchestration pattern with compact handoffs."
---

# Parallel Orchestrator

Use this skill only when the user explicitly requests subagents, delegation, or parallel agent work.

## Delegation Pattern

1. Keep the immediate blocking task in the main thread whenever possible.
2. Spawn `repo_mapper` for code-path discovery, symbol mapping, and scope narrowing.
3. Spawn `plan_reviewer` for assumptions, regression risks, missing tests, and edge cases.
4. Use the built-in `worker` only for bounded implementation after the target files are already understood.
5. Give each child a narrow, self-contained task and require a concise summary instead of raw logs.

## Output Contract For Child Agents

- State the answer first.
- Include file references for every concrete claim.
- List open risks or missing evidence explicitly.
- Do not dump command output unless the parent agent asked for exact logs.

## Coordination Rules

- Prefer parallel read-heavy work over parallel write-heavy work.
- Avoid overlapping write scopes across workers.
- Integrate results in the main thread and refresh `.codex/context/session-handoff.md` before stopping.

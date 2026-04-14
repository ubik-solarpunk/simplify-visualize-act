#!/usr/bin/env python3
import json
import os
import re
import subprocess
import sys
from pathlib import Path


BLOCK_PATTERNS = [
    r"^\s*git\s+add\b",
    r"^\s*git\s+commit\b",
    r"^\s*git\s+push\b",
    r"^\s*git\s+merge\b",
    r"^\s*git\s+rebase\b",
    r"^\s*git\s+cherry-pick\b",
    r"^\s*git\s+am\b",
    r"^\s*git\s+restore\b.*\s--staged\b",
    r"^\s*git\s+stash\b",
    r"^\s*git\s+tag\b",
]


def current_branch(cwd: Path) -> str:
    result = subprocess.run(
        ["git", "branch", "--show-current"],
        cwd=cwd,
        capture_output=True,
        text=True,
        check=False,
    )
    return result.stdout.strip()


def main() -> None:
    payload = json.load(sys.stdin)
    cwd = Path(payload.get("cwd") or os.getcwd())
    command = ((payload.get("tool_input") or {}).get("command") or "").strip()

    if current_branch(cwd) != "main":
        print(json.dumps({"continue": True}))
        return

    for pattern in BLOCK_PATTERNS:
        if re.search(pattern, command):
            reason = (
                "Branch policy: mutating git commands are blocked on main. "
                "Switch to or create `jex` before editing history or pushing."
            )
            print(
                json.dumps(
                    {
                        "systemMessage": reason,
                        "hookSpecificOutput": {
                            "hookEventName": "PreToolUse",
                            "permissionDecision": "deny",
                            "permissionDecisionReason": reason,
                        },
                    }
                )
            )
            return

    if command.startswith("git "):
        print(
            json.dumps(
                {
                    "systemMessage": (
                        "You are on main. Read-only git commands are fine, but switch to `jex` before mutating work."
                    )
                }
            )
        )
        return

    print(json.dumps({"continue": True}))


if __name__ == "__main__":
    main()

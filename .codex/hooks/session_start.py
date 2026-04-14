#!/usr/bin/env python3
import json
import os
from pathlib import Path


def summarize_handoff(text: str) -> str:
    lines = [line.rstrip() for line in text.splitlines()]
    sections: dict[str, list[str]] = {}
    current = None
    for line in lines:
        if line.startswith("## "):
            current = line[3:].strip()
            sections[current] = []
            continue
        if current is not None:
            sections[current].append(line)

    wanted = [
        "Goal",
        "Current State",
        "Open Questions",
        "Next 3 Actions",
        "Files / Branch / Commands",
        "Validation Status",
    ]
    parts: list[str] = ["Resume using the current project handoff."]
    for name in wanted:
        body = " ".join(line.strip("- ").strip() for line in sections.get(name, []) if line.strip())
        if body:
            parts.append(f"{name}: {body}")
    return "\n".join(parts)


def main() -> None:
    payload = json.load(__import__("sys").stdin)
    cwd = Path(payload.get("cwd") or os.getcwd())
    handoff_path = cwd / ".codex" / "context" / "session-handoff.md"
    if not handoff_path.exists():
        print(json.dumps({"continue": True}))
        return

    text = handoff_path.read_text(encoding="utf-8")
    print(
        json.dumps(
            {
                "continue": True,
                "hookSpecificOutput": {
                    "hookEventName": "SessionStart",
                    "additionalContext": summarize_handoff(text),
                },
            }
        )
    )


if __name__ == "__main__":
    main()

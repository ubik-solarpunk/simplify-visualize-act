#!/usr/bin/env python3
import json
import os
import subprocess
import sys
from pathlib import Path


SECTION_ORDER = [
    "Goal",
    "Current State",
    "Decisions Made",
    "Open Questions",
    "Next 3 Actions",
    "Files / Branch / Commands",
    "Validation Status",
]


def read_existing_sections(path: Path) -> dict[str, list[str]]:
    if not path.exists():
        return {}
    sections: dict[str, list[str]] = {}
    current = None
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.rstrip()
        if line.startswith("## "):
            current = line[3:].strip()
            sections[current] = []
            continue
        if current is not None:
            sections[current].append(line)
    return sections


def git_output(cwd: Path, args: list[str]) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=cwd,
        capture_output=True,
        text=True,
        check=False,
    )
    return result.stdout.strip()


def recent_transcript_hint(path_str: str | None) -> str:
    if not path_str:
        return ""
    path = Path(path_str)
    if not path.exists():
        return ""
    try:
        tail = path.read_text(encoding="utf-8", errors="ignore")[-4000:]
    except OSError:
        return ""
    lines = [line.strip() for line in tail.splitlines() if line.strip()]
    if not lines:
        return ""
    return lines[-1][:400]


def as_bullets(values: list[str]) -> list[str]:
    cleaned = []
    for value in values:
        stripped = value.strip()
        if not stripped:
            continue
        cleaned.append(stripped if stripped.startswith("- ") else f"- {stripped}")
    return cleaned


def compact_message(text: str | None) -> str:
    if not text:
        return ""
    line = " ".join(part.strip() for part in text.splitlines() if part.strip())
    return line[:500]


def compact_status(text: str) -> str:
    if not text:
        return "clean"
    parts = [part.strip() for part in text.splitlines() if part.strip()]
    return "; ".join(parts)


def render_handoff(sections: dict[str, list[str]]) -> str:
    parts = ["# Session Handoff", ""]
    for name in SECTION_ORDER:
        parts.append(f"## {name}")
        body = sections.get(name) or ["- Pending update."]
        parts.extend(body)
        parts.append("")
    return "\n".join(parts).rstrip() + "\n"


def main() -> None:
    payload = json.load(sys.stdin)
    cwd = Path(payload.get("cwd") or os.getcwd())
    handoff_path = cwd / ".codex" / "context" / "session-handoff.md"
    handoff_path.parent.mkdir(parents=True, exist_ok=True)

    existing = read_existing_sections(handoff_path)
    branch = git_output(cwd, ["branch", "--show-current"]) or "unknown"
    status = compact_status(git_output(cwd, ["status", "--short"]))
    recent_commit = git_output(cwd, ["log", "-1", "--oneline"]) or "No commits found."
    assistant_message = compact_message(payload.get("last_assistant_message"))
    transcript_hint = recent_transcript_hint(payload.get("transcript_path"))

    current_state = [
        f"- Branch: `{branch}`.",
        f"- Git status: `{status}`.",
        f"- Latest commit: `{recent_commit}`.",
    ]
    if assistant_message:
        current_state.append(f"- Last assistant message: {assistant_message}")
    if transcript_hint and transcript_hint not in assistant_message:
        current_state.append(f"- Transcript tail hint: {transcript_hint}")

    files_branch_commands = [
        f"- Branch: `{branch}`.",
        "- Check status with `git status --short`.",
        "- Resume by reading `.codex/context/session-handoff.md` first.",
    ]

    next_actions = existing.get("Next 3 Actions") or [
        "- Re-read the current handoff and confirm the active goal.",
        "- Check `git status --short` and inspect the files mentioned in the handoff.",
        "- Continue from the smallest pending implementation or validation step.",
    ]

    validation = existing.get("Validation Status") or ["- Validation not yet recorded in this handoff."]
    decisions = existing.get("Decisions Made") or [
        "- Branch policy is `jex`, not `main`.",
        "- Fresh sessions should resume from the handoff instead of re-reading the whole transcript.",
    ]
    goal = existing.get("Goal") or ["- Continue the active repository task with minimal re-orientation."]
    open_questions = existing.get("Open Questions") or ["- None recorded."]

    sections = {
        "Goal": as_bullets(goal),
        "Current State": as_bullets(current_state),
        "Decisions Made": as_bullets(decisions),
        "Open Questions": as_bullets(open_questions),
        "Next 3 Actions": as_bullets(next_actions[:3]),
        "Files / Branch / Commands": as_bullets(files_branch_commands),
        "Validation Status": as_bullets(validation),
    }

    handoff_path.write_text(render_handoff(sections), encoding="utf-8")
    print(json.dumps({"continue": True}))


if __name__ == "__main__":
    main()

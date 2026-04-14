import { ArrowLeft, ArrowUpRight, CheckSquare, Plus, SendHorizontal, Square } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { PageContainer } from "@/components/page-container";
import { RichOperatorEditor } from "@/components/rich-operator-editor";
import { Separator } from "@/components/ui/separator";
import { SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import { meetings, openItems } from "@/lib/ubik-data";

type NoteState = "new" | "review" | "verified" | "erp-push";
type MeetingView = "summary" | "notes";

const noteStateFlow: NoteState[] = ["new", "review", "verified", "erp-push"];

export default function MeetingDetail() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { openDrawer } = useShellState();

  const [noteStateByMeeting, setNoteStateByMeeting] = useWorkbenchState<Record<string, NoteState>>("meeting-note-state", {});
  const [notesByMeeting, setNotesByMeeting] = useWorkbenchState<Record<string, string>>("meeting-notes-rich", {});
  const [chatPrompt, setChatPrompt] = useWorkbenchState<string>("meeting-chat-draft", "");
  const [activeViewByMeeting, setActiveViewByMeeting] = useWorkbenchState<Record<string, MeetingView>>("meeting-detail-view", {});
  const [actionChecksByMeeting, setActionChecksByMeeting] = useWorkbenchState<Record<string, Record<string, boolean>>>(
    "meeting-action-checks",
    {},
  );

  const meeting = useMemo(() => meetings.find((item) => item.id === meetingId) ?? meetings[0], [meetingId]);

  const noteState = noteStateByMeeting[meeting.id] ?? "new";
  const notes = notesByMeeting[meeting.id] ?? meeting.generatedNotes ?? "";
  const activeView = activeViewByMeeting[meeting.id] ?? "summary";
  const actionChecks = actionChecksByMeeting[meeting.id] ?? {};

  const nextState = () => {
    const currentIndex = noteStateFlow.indexOf(noteState);
    const next = noteStateFlow[(currentIndex + 1) % noteStateFlow.length];
    setNoteStateByMeeting({ ...noteStateByMeeting, [meeting.id]: next });
  };

  const setNotes = (next: string) => {
    setNotesByMeeting({ ...notesByMeeting, [meeting.id]: next });
  };

  const addQuickNote = () => {
    const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const line = `- [ ] Quick note ${stamp}`;
    const next = notes.trim() ? `${notes.trimEnd()}\n${line}` : line;
    setNotes(next);
    setActiveViewByMeeting({ ...activeViewByMeeting, [meeting.id]: "notes" });
  };

  const actionLines = meeting.actionItems;

  const toggleAction = (line: string) => {
    const next = { ...actionChecks, [line]: !actionChecks[line] };
    setActionChecksByMeeting({ ...actionChecksByMeeting, [meeting.id]: next });
  };

  const addActionToNotes = (line: string) => {
    const taskLine = `- [ ] ${line}`;
    if (notes.includes(taskLine)) return;

    const next = notes.trim() ? `${notes.trimEnd()}\n${taskLine}` : taskLine;
    setNotes(next);
    setActiveViewByMeeting({ ...activeViewByMeeting, [meeting.id]: "notes" });
  };

  return (
    <div className="px-4 py-6 lg:px-8">
      <PageContainer className="space-y-3">
        <Surface className="bg-background p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SmallButton onClick={() => navigate("/meetings")}>
              <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to meetings
            </SmallButton>
            <div className="flex items-center gap-2">
              {meeting.folder ? <StatusPill tone="muted">{meeting.folder}</StatusPill> : null}
              {meeting.platform ? <StatusPill tone="muted">{meeting.platform}</StatusPill> : null}
              <StatusPill tone={meeting.stage === "Upcoming" ? "alert" : "success"}>{meeting.stage}</StatusPill>
            </div>
          </div>
        </Surface>

        <div className="grid gap-3 xl:grid-cols-[1.62fr_0.9fr]">
          <Surface className="bg-background p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{meeting.time}</p>
            <h1 className="mt-2 text-4xl text-foreground">{meeting.title}</h1>
            <p className="mt-3 max-w-4xl text-base text-muted-foreground">{meeting.summary}</p>

            <div className="mt-5 border border-border/80 bg-background">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <div className="inline-flex border border-border bg-card p-1">
                  <button
                    className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
                      activeView === "summary" ? "bg-foreground text-background" : "text-foreground"
                    }`}
                    onClick={() => setActiveViewByMeeting({ ...activeViewByMeeting, [meeting.id]: "summary" })}
                    type="button"
                  >
                    Summary
                  </button>
                  <button
                    className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
                      activeView === "notes" ? "bg-foreground text-background" : "text-foreground"
                    }`}
                    onClick={() => setActiveViewByMeeting({ ...activeViewByMeeting, [meeting.id]: "notes" })}
                    type="button"
                  >
                    Notes
                  </button>
                </div>

                <button
                  className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                  onClick={nextState}
                  type="button"
                >
                  State: {noteState}
                </button>
              </div>

              {activeView === "summary" ? (
                <div className="p-4">
                  <p className="text-base font-semibold text-foreground">Transcript summary</p>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {(meeting.summaryLines?.length ? meeting.summaryLines : ["Summary pending live meeting."]).map((line) => (
                      <p key={line}>- {line}</p>
                    ))}
                  </div>

                  <p className="mt-5 text-base font-semibold text-foreground">Decisions</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {meeting.decisions.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>

                  <p className="mt-5 text-base font-semibold text-foreground">Action items</p>
                  <div className="mt-2 space-y-1.5">
                    {actionLines.map((line) => {
                      const checked = Boolean(actionChecks[line]);
                      return (
                        <div key={line} className="group flex items-center gap-2 border border-border/80 px-2 py-2 text-sm">
                          <button
                            aria-label={checked ? "Mark incomplete" : "Mark complete"}
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => toggleAction(line)}
                            type="button"
                          >
                            {checked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                          </button>
                          <span className={`flex-1 ${checked ? "line-through text-muted-foreground" : "text-foreground"}`}>{line}</span>
                          <button
                            className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                            onClick={() => addActionToNotes(line)}
                            title="Add to tasks"
                            type="button"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <RichOperatorEditor
                    minHeight={300}
                    onChange={setNotes}
                    placeholder="Type / for headings, lists, quotes, dividers, or diagrams."
                    value={notes}
                  />
                  {!notes.trim() ? (
                    <p className="mt-3 border border-border/80 bg-card px-3 py-2 text-sm text-muted-foreground">
                      Empty state: no notes captured yet. Use / to structure the note.
                    </p>
                  ) : null}
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex flex-wrap items-center gap-2">
              <SmallButton onClick={() => navigate("/meetings")}>
                Join <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
              </SmallButton>
              <SmallButton
                onClick={() =>
                  openDrawer({
                    title: `Prep for ${meeting.title}`,
                    eyebrow: "Meeting prep brief",
                    description: "Linked status and open items prepared for the operator.",
                    metadata: [
                      { label: "Linked project", value: meeting.linkedProject ?? "Unlinked" },
                      { label: "Client", value: meeting.linkedClient ?? "Unlinked" },
                    ],
                    timeline: [...meeting.actionItems, ...openItems.slice(0, 2).map((item) => `${item.label} · ${item.entity}`)],
                  })
                }
              >
                Prep
              </SmallButton>
              <SmallButton onClick={addQuickNote}>
                <Plus className="mr-2 h-3.5 w-3.5" /> Quick Note
              </SmallButton>
            </div>

            <div className="mt-3 flex items-center gap-2 border border-border/80 bg-background px-3 py-2">
              <input
                className="h-9 flex-1 bg-transparent text-sm text-foreground outline-none"
                onChange={(event) => setChatPrompt(event.target.value)}
                placeholder="Ask meeting chat for recap or follow-up draft"
                value={chatPrompt}
              />
              <SmallButton>
                <SendHorizontal className="mr-2 h-3.5 w-3.5" /> Send
              </SmallButton>
            </div>
          </Surface>

          <Surface className="bg-background p-4 xl:sticky xl:top-4 xl:h-fit">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Pre-read people</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {meeting.participants.map((person) => (
                <span key={person} className="inline-flex items-center border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-foreground">
                  {person}
                </span>
              ))}
            </div>

            {meeting.preReadNudges?.length ? (
              <>
                <Separator className="my-4" />
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Pre-read nudges</p>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {meeting.preReadNudges.map((nudge) => (
                    <p key={nudge}>- {nudge}</p>
                  ))}
                </div>
              </>
            ) : null}

            <Separator className="my-4" />

            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Meeting metadata</p>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <p className="line-clamp-1">Project: {meeting.linkedProject ?? "Unlinked"}</p>
              <p className="line-clamp-1">Client: {meeting.linkedClient ?? "Unlinked"}</p>
              <p className="line-clamp-1">Vendor: {meeting.vendor ?? "Unlinked"}</p>
            </div>
          </Surface>
        </div>
      </PageContainer>
    </div>
  );
}

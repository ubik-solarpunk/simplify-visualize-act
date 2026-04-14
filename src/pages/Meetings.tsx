import { useMemo } from "react";
import { ArrowUpRight, Mic, Pause, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PageContainer } from "@/components/page-container";
import { Separator } from "@/components/ui/separator";
import { SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { useWorkbenchState } from "@/hooks/use-shell-state";
import { meetings } from "@/lib/ubik-data";

type MeetingFolder = "All" | "Compliance" | "Customer Calls" | "Standups";
type RecordingState = "idle" | "recording" | "paused";

const folderFilters: MeetingFolder[] = ["All", "Compliance", "Customer Calls", "Standups"];

export default function Meetings() {
  const navigate = useNavigate();
  const [folderFilter, setFolderFilter] = useWorkbenchState<MeetingFolder>("meeting-folder-filter", "All");
  const [recordingState, setRecordingState] = useWorkbenchState<RecordingState>("meeting-recording-state", "idle");
  const [quickNotesByMeeting, setQuickNotesByMeeting] = useWorkbenchState<Record<string, string[]>>("meeting-quick-notes", {});

  const filteredMeetings = useMemo(
    () => meetings.filter((item) => folderFilter === "All" || item.folder === folderFilter),
    [folderFilter],
  );

  const todayMeetings = filteredMeetings.filter((item) => item.dayGroup === "Today");

  const toggleRecording = () => {
    if (recordingState === "idle") {
      setRecordingState("recording");
      return;
    }
    if (recordingState === "recording") {
      setRecordingState("paused");
      return;
    }
    setRecordingState("recording");
  };

  const addQuickNote = (meetingId: string) => {
    const notes = quickNotesByMeeting[meetingId] ?? [];
    const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setQuickNotesByMeeting({
      ...quickNotesByMeeting,
      [meetingId]: [`Quick note ${stamp}`, ...notes].slice(0, 5),
    });
  };

  return (
    <div className="px-4 py-6 lg:px-8">
      <PageContainer className="space-y-3">
        <Surface className="bg-background p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {folderFilters.map((folder) => (
                <SmallButton key={folder} active={folderFilter === folder} onClick={() => setFolderFilter(folder)}>
                  {folder}
                </SmallButton>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <SmallButton active={recordingState === "recording"} onClick={toggleRecording}>
                {recordingState === "recording" ? (
                  <Pause className="mr-2 h-3.5 w-3.5" />
                ) : (
                  <Mic className="mr-2 h-3.5 w-3.5" />
                )}
                {recordingState === "idle" ? "Start recording" : recordingState === "recording" ? "Pause" : "Resume"}
              </SmallButton>
              <SmallButton onClick={() => addQuickNote(todayMeetings[0]?.id ?? meetings[0].id)}>
                <Plus className="mr-2 h-3.5 w-3.5" /> Quick note
              </SmallButton>
            </div>
          </div>
        </Surface>

        <Surface className="bg-background p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">Upcoming Today</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Select card for full workspace</p>
          </div>

          <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
            {todayMeetings.map((item) => (
              <article key={item.id} className="min-w-[360px] border border-border/80 bg-background p-3">
                <button className="w-full text-left" onClick={() => navigate(`/meetings/${item.id}`)} type="button">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-1 text-lg text-foreground">{item.title}</p>
                    <StatusPill tone={item.stage === "Upcoming" ? "alert" : "success"}>{item.stage}</StatusPill>
                  </div>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{item.time}</p>
                  <p className="mt-1 line-clamp-1 text-sm text-foreground">{item.summary}</p>
                </button>

                <Separator className="my-2.5" />

                <div className="flex flex-wrap items-center gap-2">
                  {item.folder ? <StatusPill tone="muted">{item.folder}</StatusPill> : null}
                  {item.platform ? <StatusPill tone="muted">{item.platform}</StatusPill> : null}
                  {item.linkedClient ? <StatusPill tone="muted">{item.linkedClient}</StatusPill> : null}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <SmallButton onClick={() => navigate(`/meetings/${item.id}`)}>
                    Join now <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
                  </SmallButton>
                  <SmallButton onClick={() => addQuickNote(item.id)}>
                    <Plus className="mr-2 h-3.5 w-3.5" /> Quick note
                  </SmallButton>
                </div>

                {(quickNotesByMeeting[item.id] ?? []).length ? (
                  <p className="mt-2 text-sm text-muted-foreground">{(quickNotesByMeeting[item.id] ?? [])[0]}</p>
                ) : null}
              </article>
            ))}
          </div>
        </Surface>
      </PageContainer>
    </div>
  );
}

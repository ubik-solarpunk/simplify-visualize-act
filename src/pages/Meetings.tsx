import { CalendarClock, Users } from "lucide-react";

import { SectionHeading, SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import { meetings } from "@/lib/ubik-data";

export default function Meetings() {
  const { openDrawer } = useShellState();
  const [selectedMeetingId, setSelectedMeetingId] = useWorkbenchState<string>("meeting-id", meetings[0].id);
  const meeting = meetings.find((item) => item.id === selectedMeetingId) ?? meetings[0];

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionHeading
          eyebrow="Continuity"
          title="Meetings keep prep, decisions, and follow-through in one operational surface."
          description="Use a left list, a central summary, and a supporting action panel so operators can move from meeting context straight back into execution."
        />

        <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_280px]">
          <Surface className="overflow-hidden">
            <div className="border-b border-border px-4 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Meeting List</p>
            </div>
            <div className="divide-y divide-border">
              {meetings.map((item) => (
                <button key={item.id} className={`w-full px-4 py-4 text-left ${item.id === meeting.id ? "bg-background" : "bg-card"}`} onClick={() => setSelectedMeetingId(item.id)}>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{item.stage}</p>
                  <p className="mt-2 font-mono text-sm">{item.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{item.time}</p>
                </button>
              ))}
            </div>
          </Surface>

          <Surface className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{meeting.time}</p>
                <h2 className="mt-2 font-mono text-2xl font-semibold">{meeting.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{meeting.summary}</p>
              </div>
              <StatusPill tone={meeting.stage === "Upcoming" ? "alert" : "success"}>{meeting.stage}</StatusPill>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="border border-border p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Agenda</p>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {meeting.agenda.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </div>
              <div className="border border-border p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Decisions</p>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {meeting.decisions.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </div>
            </div>
          </Surface>

          <div className="space-y-4">
            <Surface className="p-5">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Participants</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {meeting.participants.map((item) => (
                  <StatusPill key={item}>{item}</StatusPill>
                ))}
              </div>
            </Surface>
            <Surface className="p-5">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary" />
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Action Items</p>
              </div>
              <div className="mt-4 space-y-3">
                {meeting.actionItems.map((item) => (
                  <p key={item} className="text-sm text-muted-foreground">{item}</p>
                ))}
              </div>
              <div className="mt-4">
                <SmallButton
                  onClick={() =>
                    openDrawer({
                      title: meeting.title,
                      eyebrow: "Meeting detail",
                      description: "Right-side inspection should hold prep, provenance, and follow-up context without changing the shell.",
                      metadata: [
                        { label: "Owner", value: meeting.owner },
                        { label: "Stage", value: meeting.stage },
                      ],
                      timeline: meeting.actionItems,
                    })
                  }
                >
                  Open right panel
                </SmallButton>
              </div>
            </Surface>
          </div>
        </div>
      </div>
    </div>
  );
}

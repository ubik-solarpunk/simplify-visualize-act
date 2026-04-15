import { useEffect, useMemo } from "react";
import {
  AudioLines,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Compass,
  History,
  LayoutGrid,
  List,
  Mic,
  NotebookPen,
  Paperclip,
  Plus,
  Search,
  Share2,
  Square,
  SquareCheck,
  Mail,
  UserPlus,
  Users,
  Link2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { PageContainer } from "@/components/page-container";
import { RichOperatorEditor } from "@/components/rich-operator-editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";
import { SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { useWorkbenchState } from "@/hooks/use-shell-state";
import { meetings, projects } from "@/lib/ubik-data";

type CalendarRange = "day" | "week" | "month";
type CalendarView = "timeline" | "agenda";
type MeetingTab = "summary" | "notes" | "transcript";
type SortMode = "time" | "company" | "team";
type RightRailAction = "share" | "project" | "create" | null;
type ShareApp = "Slack" | "Email" | "WhatsApp" | "Drive";

const rangeOptions: CalendarRange[] = ["day", "week", "month"];
const sortOptions: SortMode[] = ["time", "company", "team"];
const shareApps: ShareApp[] = ["Slack", "Email", "WhatsApp", "Drive"];
const defaultSuggestedSlots = ["10:00 - 10:30 AM", "2:30 - 3:00 PM", "4:30 - 5:00 PM"];

function faviconFor(domain?: string) {
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function Meetings() {
  const navigate = useNavigate();
  const { meetingId } = useParams();
  const isDraftMeeting = meetingId === "new";

  const [selectedFolder, setSelectedFolder] = useWorkbenchState<string>("meeting-selected-folder", "All meetings");
  const [sortMode, setSortMode] = useWorkbenchState<SortMode>("meeting-sort-mode", "time");
  const [calendarRange, setCalendarRange] = useWorkbenchState<CalendarRange>("meeting-calendar-range", "week");
  const [calendarView, setCalendarView] = useWorkbenchState<CalendarView>("meeting-calendar-view", "timeline");
  const [meetingSearchQuery, setMeetingSearchQuery] = useWorkbenchState<string>("meeting-search-query", "");
  const [bottomChatFolder, setBottomChatFolder] = useWorkbenchState<string>("meeting-bottom-chat-folder", "My notes");
  const [bottomChatDraft, setBottomChatDraft] = useWorkbenchState<string>("meeting-bottom-chat-draft", "");
  const [meetingRecordingLive, setMeetingRecordingLive] = useWorkbenchState<boolean>("meeting-live-recording", false);

  const [notesByMeeting, setNotesByMeeting] = useWorkbenchState<Record<string, string>>("meeting-v44-notes", {});
  const [tabByMeeting, setTabByMeeting] = useWorkbenchState<Record<string, MeetingTab>>("meeting-v44-tab", {});
  const [transcriptOpenByMeeting, setTranscriptOpenByMeeting] = useWorkbenchState<Record<string, boolean>>("meeting-v44-transcript-open", {});
  const [notesFocusMode, setNotesFocusMode] = useWorkbenchState<boolean>("meeting-v45-notes-focus", false);

  const [activeActionByMeeting, setActiveActionByMeeting] = useWorkbenchState<Record<string, RightRailAction>>("meeting-v44-right-action", {});
  const [shareAttendeesByMeeting, setShareAttendeesByMeeting] = useWorkbenchState<Record<string, string[]>>("meeting-v44-share-attendees", {});
  const [shareAppsByMeeting, setShareAppsByMeeting] = useWorkbenchState<Record<string, ShareApp[]>>("meeting-v44-share-apps", {});
  const [projectQueryByMeeting, setProjectQueryByMeeting] = useWorkbenchState<Record<string, string>>("meeting-v44-project-query", {});

  const [createTitle, setCreateTitle] = useWorkbenchState<string>("meeting-v44-create-title", "");
  const [createSeedDateTime, setCreateSeedDateTime] = useWorkbenchState<string>("meeting-v44-create-seed", "2026-04-15T14:00");
  const [createAttendees, setCreateAttendees] = useWorkbenchState<string>("meeting-v44-create-attendees", "");
  const [createSelectedSlot, setCreateSelectedSlot] = useWorkbenchState<string>("meeting-v44-create-slot", "");
  const [createRequestPreview, setCreateRequestPreview] = useWorkbenchState<string>("meeting-v44-create-preview", "");
  const [draftMeetingTitle, setDraftMeetingTitle] = useWorkbenchState<string>("meeting-v46-draft-title", "");
  const [draftMeetingSummary, setDraftMeetingSummary] = useWorkbenchState<string>("meeting-v46-draft-summary", "");
  const [draftMeetingNotes, setDraftMeetingNotes] = useWorkbenchState<string>("meeting-v46-draft-notes", "");
  const [draftMeetingSummaryLines, setDraftMeetingSummaryLines] = useWorkbenchState<string[]>("meeting-v46-draft-summary-lines", []);
  const [draftMeetingDecisions, setDraftMeetingDecisions] = useWorkbenchState<string[]>("meeting-v46-draft-decisions", []);
  const [draftMeetingTranscriptOpen, setDraftMeetingTranscriptOpen] = useWorkbenchState<boolean>("meeting-v46-draft-transcript-open", false);
  const [draftMeetingTab, setDraftMeetingTab] = useWorkbenchState<MeetingTab>("meeting-v46-draft-tab", "notes");

  const folderOptions = useMemo(() => {
    const systemFolders = Array.from(new Set(meetings.map((item) => item.folder).filter(Boolean))) as string[];
    return ["All meetings", "My notes", ...systemFolders];
  }, []);

  const baseFiltered = useMemo(() => {
    if (selectedFolder === "All meetings") return meetings;
    if (selectedFolder === "My notes") return meetings.filter((item) => Boolean(notesByMeeting[item.id]?.trim()));

    const lowered = selectedFolder.toLowerCase();
    return meetings.filter((item) => {
      const haystack = `${item.folder ?? ""} ${item.linkedClient ?? ""} ${item.vendor ?? ""} ${item.domain ?? ""}`.toLowerCase();
      return haystack.includes(lowered);
    });
  }, [notesByMeeting, selectedFolder]);

  const searchedMeetings = useMemo(() => {
    if (!meetingSearchQuery.trim()) return baseFiltered;
    const query = meetingSearchQuery.toLowerCase();
    return baseFiltered.filter((item) =>
      `${item.title} ${item.summary} ${item.folder ?? ""} ${item.linkedClient ?? ""} ${item.owner} ${item.participants.join(" ")}`
        .toLowerCase()
        .includes(query),
    );
  }, [baseFiltered, meetingSearchQuery]);

  const smartList = useMemo(() => {
    const items = [...searchedMeetings];

    if (sortMode === "company") {
      return items.sort((a, b) => (a.linkedClient ?? "").localeCompare(b.linkedClient ?? ""));
    }

    if (sortMode === "team") {
      return items.sort((a, b) => a.owner.localeCompare(b.owner));
    }

    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [searchedMeetings, sortMode]);

  const selectedMeeting = useMemo(
    () => (isDraftMeeting ? null : meetings.find((item) => item.id === meetingId) ?? null),
    [isDraftMeeting, meetingId],
  );

  const activeTab: MeetingTab = selectedMeeting
    ? tabByMeeting[selectedMeeting.id] ?? "summary"
    : isDraftMeeting
      ? draftMeetingTab
      : "summary";
  const activeNotes = selectedMeeting
    ? notesByMeeting[selectedMeeting.id] ?? selectedMeeting.generatedNotes ?? ""
    : isDraftMeeting
      ? draftMeetingNotes
      : "";
  const activeAction: RightRailAction = selectedMeeting ? activeActionByMeeting[selectedMeeting.id] ?? null : null;
  const transcriptOpen = selectedMeeting
    ? Boolean(transcriptOpenByMeeting[selectedMeeting.id])
    : isDraftMeeting
      ? draftMeetingTranscriptOpen
      : false;

  const shareAttendees = selectedMeeting
    ? shareAttendeesByMeeting[selectedMeeting.id] ?? selectedMeeting.participants
    : [];
  const selectedShareApps = selectedMeeting
    ? shareAppsByMeeting[selectedMeeting.id] ?? ["Slack"]
    : [];
  const projectQuery = selectedMeeting ? projectQueryByMeeting[selectedMeeting.id] ?? "" : "";

  const contextBlocks = selectedMeeting
    ? [
        {
          id: "why",
          title: "Why this matters",
          tone: "neutral" as const,
          body:
            selectedMeeting.preReadContext?.whyThisMatters ??
            selectedMeeting.summaryLines?.[0] ??
            selectedMeeting.summary,
        },
        {
          id: "changed",
          title: "What changed",
          tone: "neutral" as const,
          body:
            selectedMeeting.preReadContext?.whatChanged ??
            `${selectedMeeting.stage} status for ${selectedMeeting.linkedClient ?? "this account"} after latest prep updates.`,
        },
        {
          id: "blocked",
          title: "What is blocked",
          tone: "critical" as const,
          body:
            selectedMeeting.preReadContext?.whatIsBlocked ??
            (selectedMeeting.actionItems[0]
              ? `Action path remains blocked until: ${selectedMeeting.actionItems[0]}`
              : "No explicit blocker logged."),
        },
        {
          id: "next",
          title: "Recommended next step",
          tone: "inverted" as const,
          body:
            selectedMeeting.preReadContext?.recommendedNextStep ??
            selectedMeeting.actionItems[0] ??
            "Align owner and timeline before close.",
        },
      ]
    : [];

  const filteredProjects = useMemo(() => {
    if (!projectQuery.trim()) return projects;
    const lowered = projectQuery.toLowerCase();
    return projects.filter((project) => `${project.name} ${project.code} ${project.owner}`.toLowerCase().includes(lowered));
  }, [projectQuery]);

  const suggestedSlots = selectedMeeting?.schedulingSuggestions?.suggestedSlots?.length
    ? selectedMeeting.schedulingSuggestions.suggestedSlots
    : defaultSuggestedSlots;

  const landingHelper = useMemo(() => {
    const relatedMeetings = Array.from(
      new Set(meetings.flatMap((meeting) => meeting.landingHelper?.relatedMeetings ?? [])),
    ).slice(0, 5);
    const folderHighlights = Array.from(
      new Set(meetings.flatMap((meeting) => meeting.landingHelper?.folderHighlights ?? [])),
    ).slice(0, 4);
    const decisionCarryovers = Array.from(
      new Set(meetings.flatMap((meeting) => meeting.landingHelper?.decisionCarryovers ?? [])),
    ).slice(0, 4);

    return { relatedMeetings, folderHighlights, decisionCarryovers };
  }, []);

  const dayMeetings = useMemo(
    () => smartList.filter((meeting) => meeting.dayGroup === "Today"),
    [smartList],
  );

  const weekGroups = useMemo(
    () =>
      ["Today", "Yesterday", "This Week"]
        .map((group) => ({
          group,
          items: smartList.filter((meeting) => meeting.dayGroup === group),
        }))
        .filter((entry) => entry.items.length > 0),
    [smartList],
  );

  const monthBuckets = useMemo(() => {
    const thisWeek = smartList.filter((meeting) => meeting.dayGroup === "Today" || meeting.dayGroup === "Yesterday");
    const nextWeek = smartList.filter((meeting) => meeting.dayGroup === "This Week");
    const completed = smartList.filter((meeting) => meeting.stage === "Completed");

    return [
      { label: "This week", items: thisWeek },
      { label: "Next week", items: nextWeek },
      { label: "Completed", items: completed },
    ].filter((bucket) => bucket.items.length > 0);
  }, [smartList]);

  useEffect(() => {
    if (!meetingId || isDraftMeeting) return;
    if (!selectedMeeting) {
      navigate("/meetings", { replace: true });
    }
  }, [isDraftMeeting, meetingId, navigate, selectedMeeting]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (event.key === "Escape" && notesFocusMode) {
        event.preventDefault();
        setNotesFocusMode(false);
        return;
      }

      if ((!selectedMeeting && !isDraftMeeting) || isTypingTarget || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        if (selectedMeeting) {
          setTabByMeeting({ ...tabByMeeting, [selectedMeeting.id]: "notes" });
        } else {
          setDraftMeetingTab("notes");
        }
      }
      if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        if (selectedMeeting) {
          setTabByMeeting({ ...tabByMeeting, [selectedMeeting.id]: "summary" });
        } else {
          setDraftMeetingTab("summary");
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDraftMeeting, notesFocusMode, selectedMeeting, setDraftMeetingTab, setNotesFocusMode, setTabByMeeting, tabByMeeting]);

  const openMeeting = (id: string) => {
    navigate(`/meetings/${id}`);
  };

  const setMeetingTab = (tab: MeetingTab) => {
    if (selectedMeeting) {
      setTabByMeeting({ ...tabByMeeting, [selectedMeeting.id]: tab });
      return;
    }
    if (isDraftMeeting) {
      setDraftMeetingTab(tab);
    }
  };

  const setMeetingNotes = (value: string) => {
    if (selectedMeeting) {
      setNotesByMeeting({ ...notesByMeeting, [selectedMeeting.id]: value });
      return;
    }
    if (isDraftMeeting) {
      setDraftMeetingNotes(value);
    }
  };

  const openNewMeetingDraft = () => {
    setDraftMeetingTitle("");
    setDraftMeetingSummary("");
    setDraftMeetingSummaryLines([]);
    setDraftMeetingDecisions([]);
    setDraftMeetingNotes("");
    setDraftMeetingTab("notes");
    setDraftMeetingTranscriptOpen(false);
    setMeetingRecordingLive(false);
    navigate("/meetings/new");
  };

  const joinNowAndStartRecording = () => {
    setMeetingRecordingLive(true);
    if (!isDraftMeeting) return;

    if (!draftMeetingTitle.trim()) {
      setDraftMeetingTitle("Untitled meeting");
    }
    if (!draftMeetingSummary.trim()) {
      setDraftMeetingSummary("Live discussion started. Notes, decisions, and transcript are now being captured.");
    }
    if (!draftMeetingSummaryLines.length) {
      setDraftMeetingSummaryLines([
        "Participants joined and meeting scope confirmed.",
        "Key context points are now being captured live.",
      ]);
    }
    if (!draftMeetingDecisions.length) {
      setDraftMeetingDecisions(["Decision log is now open for this meeting."]);
    }
  };

  const toggleShareApp = (app: ShareApp) => {
    if (!selectedMeeting) return;
    const current = selectedShareApps;
    const next = current.includes(app)
      ? current.filter((item) => item !== app)
      : [...current, app];
    setShareAppsByMeeting({ ...shareAppsByMeeting, [selectedMeeting.id]: next.length ? next : [app] });
  };

  const toggleShareAttendee = (name: string) => {
    if (!selectedMeeting) return;
    const current = shareAttendees;
    const next = current.includes(name)
      ? current.filter((item) => item !== name)
      : [...current, name];
    setShareAttendeesByMeeting({ ...shareAttendeesByMeeting, [selectedMeeting.id]: next.length ? next : [name] });
  };

  const submitShare = () => {
    if (!selectedMeeting) return;
    toast("Shared meeting context", {
      description: `Sent to ${shareAttendees.length} attendee(s) via ${selectedShareApps.join(", ")}.`,
    });
    setActiveActionByMeeting({ ...activeActionByMeeting, [selectedMeeting.id]: null });
  };

  const attachToProject = (projectId: string) => {
    if (!selectedMeeting) return;
    const project = projects.find((item) => item.id === projectId);
    toast("Meeting added to project", {
      description: `${selectedMeeting.title} attached to ${project?.name ?? "project"}.`,
    });
    setActiveActionByMeeting({ ...activeActionByMeeting, [selectedMeeting.id]: null });
  };

  const sendMeetingRequest = () => {
    const title = createTitle.trim() || "New meeting";
    const requestedSlot = createSelectedSlot || createSeedDateTime;
    const attendees = createAttendees
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const preview = `${title} · ${requestedSlot} · ${attendees.length || 1} attendee(s)`;
    setCreateRequestPreview(preview);

    toast("Meeting request sent", {
      description: `Request created for ${title}${attendees.length ? ` with ${attendees.join(", ")}` : ""}.`,
    });
  };

  const sectionLabelClass = "font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/65";
  const actionButtonClass =
    "inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 font-mono text-[10px] uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-[hsl(var(--foreground)/0.03)]";

  const transcriptLines = selectedMeeting
    ? [
        `${selectedMeeting.owner}: ${selectedMeeting.summary}`,
        ...(selectedMeeting.summaryLines ?? []),
        ...selectedMeeting.decisions.map((item) => `Decision: ${item}`),
      ]
    : isDraftMeeting
      ? [
          "System: Draft meeting recording initialized.",
          "Operator: Waiting for live conversation...",
          ...draftMeetingSummaryLines,
        ]
      : [];

  const attendeeCards = useMemo(() => {
    if (!selectedMeeting) return [];

    const seen = new Set<string>();
    return selectedMeeting.participants
      .filter((name) => {
        const key = name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((name) => {
        const brief = selectedMeeting.attendeeBriefs?.find((item) => item.name === name);
        const title = name.toLowerCase().includes("bot")
          ? "Automation partner"
          : name.toLowerCase().includes("ops")
            ? "Operations lead"
            : brief
              ? "Primary stakeholder"
              : "Meeting attendee";
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return {
          name,
          title,
          note: brief?.whatsOnMind ?? `Context owner for ${selectedMeeting.title}.`,
          profileUrl: `https://www.linkedin.com/in/${slug}`,
          email: `${slug}@example.com`,
        };
      });
  }, [selectedMeeting]);

  const landingPriorityMeetings = useMemo(
    () =>
      smartList
        .filter((meeting) => meeting.dayGroup === "Today" || meeting.stage === "Upcoming")
        .slice(0, 3),
    [smartList],
  );

  const landingPeopleCards = useMemo(() => {
    const seen = new Set<string>();
    return landingPriorityMeetings
      .flatMap((meeting) =>
        meeting.participants.map((name) => ({
          name,
          meetingTitle: meeting.title,
          stage: meeting.stage,
        })),
      )
      .filter((item) => {
        const key = item.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 6);
  }, [landingPriorityMeetings]);
  const resolvedBottomChatFolder = folderOptions.includes(bottomChatFolder) ? bottomChatFolder : folderOptions[0] ?? "All meetings";
  const showBottomStopControl = Boolean(selectedMeeting || isDraftMeeting);

  return (
    <div className="px-4 py-5 lg:px-8">
      <PageContainer className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[15px] text-foreground/85">Meeting continuity, decisions, and follow-through.</p>
            <button
              aria-label="Create new meeting draft"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-primary/60 bg-primary px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={openNewMeetingDraft}
              type="button"
            >
              <Plus className="h-3.5 w-3.5" /> New meeting
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border/90 bg-background px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
            <Search className="h-4 w-4 text-foreground/55" />
            <input
              aria-label="Search meetings"
              className="h-8 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/45"
              onChange={(event) => setMeetingSearchQuery(event.target.value)}
              placeholder="Search meetings, people, folders, and context"
              value={meetingSearchQuery}
            />
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[0.86fr_1.66fr_0.92fr]">
          <Surface className="bg-background p-3.5">
            <p className={sectionLabelClass}>Customer spaces</p>

            <div className="mt-2.5 space-y-1.5">
              {folderOptions.map((folder) => {
                const active = folder === selectedFolder;
                return (
                  <button
                    key={folder}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left transition-colors ${
                      active
                        ? "bg-[hsl(var(--primary)/0.1)] text-foreground"
                        : "text-foreground/80 hover:bg-[hsl(var(--foreground)/0.04)]"
                    }`}
                    onClick={() => setSelectedFolder(folder)}
                    type="button"
                  >
                    <span className="inline-flex items-center gap-2 text-sm">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-[hsl(var(--foreground)/0.08)] text-[11px] font-medium text-foreground/85">
                        {initials(folder)}
                      </span>
                      {folder}
                    </span>
                    <span className="text-xs text-foreground/55">
                      {folder === "All meetings" ? meetings.length : smartList.filter((m) => (folder === "My notes" ? Boolean(notesByMeeting[m.id]) : true)).length}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 border-t border-border/70 pt-3">
              <p className={sectionLabelClass}>Smart list</p>
              <div className="mt-2 flex items-center gap-1.5">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    className={`h-7 rounded-full px-2.5 text-[11px] uppercase tracking-[0.08em] transition-colors ${
                      sortMode === option
                        ? "bg-[hsl(var(--primary)/0.14)] text-primary"
                        : "bg-[hsl(var(--foreground)/0.04)] text-foreground/70 hover:text-foreground"
                    }`}
                    onClick={() => setSortMode(option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="mt-2.5 space-y-1.5">
                {smartList.length ? (
                  smartList.map((item) => {
                    const active = selectedMeeting?.id === item.id;
                    const icon = faviconFor(item.clientDomain ?? item.vendorDomain);
                    return (
                      <button
                        key={item.id}
                        className={`w-full rounded-md border px-2.5 py-2 text-left transition-all ${
                          active
                            ? "border-primary/50 bg-[hsl(var(--primary)/0.08)]"
                            : "border-border/70 hover:border-border hover:bg-[hsl(var(--foreground)/0.03)]"
                        }`}
                        onClick={() => openMeeting(item.id)}
                        type="button"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-1 text-sm text-foreground">{item.title}</p>
                          <p className="text-[11px] text-foreground/60">{item.time.split("·")[0]?.trim()}</p>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-foreground/65">
                          {icon ? <img alt="" className="h-4 w-4 rounded-sm" src={icon} /> : <Building2 className="h-3.5 w-3.5" />}
                          <span className="line-clamp-1">{item.linkedClient ?? item.vendor ?? "Unlinked company"}</span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="rounded-md border border-border/80 bg-background px-2.5 py-2 text-xs text-foreground/65">
                    No meetings match this search yet.
                  </p>
                )}
              </div>
            </div>
          </Surface>

          <Surface className="bg-background p-4">
            {!selectedMeeting && !isDraftMeeting ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className={sectionLabelClass}>Upcoming meetings</p>
                    <h2 className="mt-1 text-[28px] leading-tight text-foreground">Schedule landing</h2>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {rangeOptions.map((option) => (
                      <button
                        key={option}
                        className={`h-8 rounded-full px-3 text-xs uppercase tracking-[0.1em] transition-colors ${
                          calendarRange === option
                            ? "bg-foreground text-background"
                            : "bg-[hsl(var(--foreground)/0.05)] text-foreground/70 hover:text-foreground"
                        }`}
                        onClick={() => setCalendarRange(option)}
                        type="button"
                      >
                        {option}
                      </button>
                    ))}
                    <button
                      className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[hsl(var(--foreground)/0.05)] px-3 text-xs text-foreground/70 transition-colors hover:text-foreground"
                      onClick={() => setCalendarView(calendarView === "timeline" ? "agenda" : "timeline")}
                      type="button"
                    >
                      {calendarView === "timeline" ? <LayoutGrid className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
                      View
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-border bg-background p-3.5">
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    No meeting selected. Pick one from Smart list or jump from the upcoming strip.
                  </div>

                  {calendarRange === "day" ? (
                    <div className="mt-3">
                      <p className={sectionLabelClass}>Day agenda</p>
                      <div className="mt-2 grid gap-2 md:grid-cols-2">
                        {dayMeetings.map((item) => (
                          <button
                            key={item.id}
                            className="rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-primary/45 hover:bg-[hsl(var(--primary)/0.035)]"
                            onClick={() => openMeeting(item.id)}
                            type="button"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="line-clamp-1 text-[17px] text-foreground">{item.title}</p>
                              <StatusPill className="shrink-0" tone={item.stage === "Upcoming" ? "alert" : "success"}>{item.stage}</StatusPill>
                            </div>
                            <p className="mt-1 text-xs text-foreground/65">{item.time}</p>
                            <p className="mt-2 text-xs text-foreground/75">{item.summaryLines?.[0] ?? item.summary}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {calendarRange === "week" ? (
                    <div className="mt-3 space-y-3">
                      <p className={sectionLabelClass}>Week agenda</p>
                      {weekGroups.map((entry) => (
                        <section key={entry.group}>
                          <p className="text-xs uppercase tracking-[0.08em] text-foreground/60">{entry.group}</p>
                          <div className="mt-1.5 space-y-1.5">
                            {entry.items.map((item) => (
                              <button
                                key={item.id}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-left transition-colors hover:border-primary/35 hover:bg-[hsl(var(--primary)/0.03)]"
                                onClick={() => openMeeting(item.id)}
                                type="button"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="line-clamp-1 text-sm text-foreground">{item.title}</span>
                                  <span className="text-xs text-foreground/65">{item.time.split("·")[1]?.trim() ?? item.time}</span>
                                </div>
                                <p className="mt-1 text-xs text-foreground/75">{item.linkedClient ?? item.vendor ?? "Unlinked company"}</p>
                              </button>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  ) : null}

                  {calendarRange === "month" ? (
                    <div className="mt-3 space-y-3">
                      <p className={sectionLabelClass}>Month buckets</p>
                      {monthBuckets.map((bucket) => (
                        <section key={bucket.label} className="rounded-lg border border-border bg-background p-2.5">
                          <p className="text-xs uppercase tracking-[0.08em] text-foreground/60">{bucket.label}</p>
                          <div className="mt-2 space-y-1.5">
                            {bucket.items.map((item) => (
                              <button
                                key={item.id}
                                className="w-full rounded-md border border-transparent px-2 py-2 text-left transition-colors hover:border-border hover:bg-[hsl(var(--foreground)/0.025)]"
                                onClick={() => openMeeting(item.id)}
                                type="button"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="line-clamp-1 text-sm text-foreground/88">{item.title}</span>
                                  <span className="text-[11px] text-foreground/60">{item.dayGroup}</span>
                                </div>
                                <p className="mt-1 text-xs text-foreground/70">{item.time}</p>
                              </button>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <p className={sectionLabelClass}>{isDraftMeeting ? "Draft meeting · Not scheduled" : selectedMeeting.time}</p>
                <h2 className="mt-1 text-[32px] leading-tight text-foreground">
                  {isDraftMeeting ? draftMeetingTitle || "New meeting note" : selectedMeeting.title}
                </h2>
                <p className="mt-2 text-[15px] text-foreground/80">
                  {isDraftMeeting
                    ? draftMeetingSummary || "Start with an empty note, then join to begin live capture."
                    : selectedMeeting.summary}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-foreground/78">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--foreground)/0.06)] px-2.5 py-1">
                    <CalendarDays className="h-3.5 w-3.5" /> {isDraftMeeting ? "Not scheduled" : selectedMeeting.schedulingSuggestions?.seedDate ?? "Today"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--foreground)/0.06)] px-2.5 py-1">
                    <Users className="h-3.5 w-3.5" /> {isDraftMeeting ? "0 attendees" : `${selectedMeeting.participants.length} attendees`}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--foreground)/0.06)] px-2.5 py-1">
                    <NotebookPen className="h-3.5 w-3.5" /> {isDraftMeeting ? resolvedBottomChatFolder : selectedMeeting.folder ?? "General"} folder
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-1.5">
                  {(["summary", "notes", "transcript"] as MeetingTab[]).map((tab) => (
                    <button
                      key={tab}
                      className={`h-8 rounded-full px-3 text-xs uppercase tracking-[0.1em] transition-colors ${
                        activeTab === tab
                          ? "bg-foreground text-background"
                          : "bg-[hsl(var(--foreground)/0.05)] text-foreground/70 hover:text-foreground"
                      }`}
                      onClick={() => setMeetingTab(tab)}
                      type="button"
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {activeTab === "summary" ? (
                  <div className="mt-3 space-y-3">
                    <section className="rounded-lg border border-border/70 bg-[hsl(var(--foreground)/0.012)] p-3">
                      <p className={sectionLabelClass}>Summary</p>
                      <div className="mt-2 space-y-1 text-sm text-foreground/85">
                        {(
                          isDraftMeeting
                            ? draftMeetingSummaryLines.length
                              ? draftMeetingSummaryLines
                              : ["No summary captured yet. Join now to start recording and capture context."]
                            : selectedMeeting.summaryLines?.length
                              ? selectedMeeting.summaryLines
                              : [selectedMeeting.summary]
                        ).map((line) => (
                          <p key={line}>- {line}</p>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-lg border border-border/70 bg-[hsl(var(--foreground)/0.012)] p-3">
                      <p className={sectionLabelClass}>Decisions</p>
                      <div className="mt-2 space-y-1 text-sm text-foreground/85">
                        {(isDraftMeeting ? draftMeetingDecisions : selectedMeeting.decisions).map((item) => (
                          <p key={item}>- {item}</p>
                        ))}
                      </div>
                    </section>

                  </div>
                ) : null}

                {activeTab === "notes" ? (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className={sectionLabelClass}>Notes editor</p>
                      <button
                        className="inline-flex h-8 items-center rounded-md border border-border px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/75 transition-colors hover:bg-[hsl(var(--foreground)/0.03)]"
                        onClick={() => setNotesFocusMode(true)}
                        type="button"
                      >
                        Focus mode (Esc to exit)
                      </button>
                    </div>
                    <RichOperatorEditor
                      minHeight={300}
                      onChange={setMeetingNotes}
                      placeholder="Write notes and decisions here."
                      value={activeNotes}
                    />
                  </div>
                ) : null}

                {activeTab === "transcript" ? (
                  <section className="mt-3 rounded-lg border border-border/70 bg-[hsl(var(--foreground)/0.012)] p-3">
                    <button
                      aria-expanded={transcriptOpen}
                      className="flex w-full items-center justify-between text-left"
                        onClick={() =>
                        isDraftMeeting
                          ? setDraftMeetingTranscriptOpen(!transcriptOpen)
                          : setTranscriptOpenByMeeting({
                              ...transcriptOpenByMeeting,
                              [selectedMeeting.id]: !transcriptOpen,
                            })
                      }
                      type="button"
                    >
                      <p className={sectionLabelClass}>Transcript</p>
                      <span className="text-xs text-foreground/65">{transcriptOpen ? "Hide" : "Show"}</span>
                    </button>
                    {transcriptOpen ? (
                      <div className="mt-2 space-y-1 text-sm text-foreground/82">
                        {transcriptLines.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    ) : null}
                  </section>
                ) : null}
              </>
            )}

            <section className="mt-4 rounded-xl border border-border/80 bg-[hsl(var(--foreground)/0.015)] p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-foreground/70">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-2.5 py-1 transition-colors hover:bg-[hsl(var(--foreground)/0.03)]"
                    type="button"
                  >
                    <History className="h-3.5 w-3.5" />
                    List recent todos
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-2.5 py-1 transition-colors hover:bg-[hsl(var(--foreground)/0.03)]"
                    type="button"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    Coach me Matt
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    aria-label={meetingRecordingLive ? "Recording live" : "Join now and start recording"}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors ${
                      meetingRecordingLive
                        ? "border-primary/70 bg-primary/10 text-primary"
                        : "border-border/80 bg-background text-foreground/80 hover:bg-[hsl(var(--foreground)/0.03)]"
                    }`}
                    onClick={joinNowAndStartRecording}
                    type="button"
                  >
                    <AudioLines className="h-3.5 w-3.5" />
                    {meetingRecordingLive ? "Recording" : "Join now"}
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        aria-label="Meeting bottom chat folder"
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border/80 bg-background px-3 text-xs text-foreground/80 transition-colors hover:bg-[hsl(var(--foreground)/0.03)]"
                        type="button"
                      >
                        {resolvedBottomChatFolder}
                        <ChevronDown className="h-3.5 w-3.5 text-foreground/60" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {folderOptions.map((folder) => (
                        <DropdownMenuItem key={folder} onClick={() => setBottomChatFolder(folder)}>
                          {folder}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex h-12 items-center gap-1.5 rounded-full border border-border/80 bg-background px-3">
                  <AudioLines className="h-4 w-4 text-primary" />
                  <ChevronDown className="h-3.5 w-3.5 text-foreground/55" />
                  {showBottomStopControl ? (
                    <Square className="h-3.5 w-3.5 text-foreground/70" />
                  ) : null}
                </div>
                <div className="flex h-12 flex-1 items-center gap-2 rounded-full border border-border/80 bg-background px-3">
                  <input
                    aria-label="Meetings bottom chat input"
                    className="h-8 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/45"
                    onChange={(event) => setBottomChatDraft(event.target.value)}
                    placeholder="Ask anything"
                    value={bottomChatDraft}
                  />
                  <span className="shrink-0 text-xs text-foreground/55">Opus 4.6</span>
                  <button
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/80 text-foreground/70 transition-colors hover:bg-[hsl(var(--foreground)/0.03)]"
                    type="button"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/80 text-foreground/70 transition-colors hover:bg-[hsl(var(--foreground)/0.03)]"
                    type="button"
                  >
                    <Mic className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </section>
          </Surface>

          <Surface className="bg-background p-4 xl:sticky xl:top-4 xl:max-h-[calc(100vh-8rem)] xl:overflow-auto">
            {selectedMeeting ? (
              <>
                <p className={sectionLabelClass}>Actions</p>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <button
                    aria-label={activeAction === "share" ? "Close share meeting panel" : "Open share meeting panel"}
                    className={`${actionButtonClass} ${activeAction === "share" ? "border-primary bg-primary text-primary-foreground" : "text-primary hover:border-primary/60 hover:bg-primary/10"}`}
                    onClick={() =>
                      setActiveActionByMeeting({
                        ...activeActionByMeeting,
                        [selectedMeeting.id]: activeAction === "share" ? null : "share",
                      })
                    }
                    type="button"
                  >
                    <Share2 className="h-3.5 w-3.5" /> Share meeting
                  </button>
                  <button
                    aria-label={activeAction === "project" ? "Close add to project panel" : "Open add to project panel"}
                    className={`${actionButtonClass} ${activeAction === "project" ? "border-primary bg-primary/10 text-primary" : ""}`}
                    onClick={() =>
                      setActiveActionByMeeting({
                        ...activeActionByMeeting,
                        [selectedMeeting.id]: activeAction === "project" ? null : "project",
                      })
                    }
                    type="button"
                  >
                    <SquareCheck className="h-3.5 w-3.5" /> Add to Project
                  </button>
                  <button
                    aria-label={activeAction === "create" ? "Close create meeting panel" : "Open create meeting panel"}
                    className={`col-span-2 ${actionButtonClass} ${activeAction === "create" ? "border-primary bg-primary/10 text-primary" : ""}`}
                    onClick={() =>
                      setActiveActionByMeeting({
                        ...activeActionByMeeting,
                        [selectedMeeting.id]: activeAction === "create" ? null : "create",
                      })
                    }
                    type="button"
                  >
                    <Plus className="h-3.5 w-3.5" /> Create meeting
                  </button>
                </div>

                {activeAction === "share" ? (
                  <div className="mt-2 border border-border/80 bg-background p-2">
                    <p className={sectionLabelClass}>Share meeting</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedMeeting.participants.map((name) => {
                        const selected = shareAttendees.includes(name);
                        return (
                          <button
                            key={name}
                            className={`rounded-full px-2.5 py-1 text-xs transition-colors ${selected ? "bg-foreground text-background" : "bg-[hsl(var(--foreground)/0.06)] text-foreground/75"}`}
                            onClick={() => toggleShareAttendee(name)}
                            type="button"
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>

                    <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-foreground/65">App targets</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {shareApps.map((app) => {
                        const selected = selectedShareApps.includes(app);
                        return (
                          <button
                            key={app}
                            className={`rounded-full px-2.5 py-1 text-xs transition-colors ${selected ? "bg-[hsl(var(--primary)/0.14)] text-primary" : "bg-[hsl(var(--foreground)/0.06)] text-foreground/75"}`}
                            onClick={() => toggleShareApp(app)}
                            type="button"
                          >
                            {app}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-2">
                      <SmallButton active onClick={submitShare}>
                        <UserPlus className="mr-2 h-3.5 w-3.5" /> Share now
                      </SmallButton>
                    </div>
                  </div>
                ) : null}

                {activeAction === "project" ? (
                  <div className="mt-2 border border-border/80 bg-background p-2">
                    <input
                      className="h-9 w-full border border-border bg-background px-2 text-sm text-foreground outline-none"
                      onChange={(event) =>
                        setProjectQueryByMeeting({
                          ...projectQueryByMeeting,
                          [selectedMeeting.id]: event.target.value,
                        })
                      }
                      placeholder="Find project"
                      value={projectQuery}
                    />
                    <div className="mt-2 max-h-36 space-y-1 overflow-auto">
                      {filteredProjects.map((project) => (
                        <button
                          key={project.id}
                          className="w-full border border-border/80 px-2 py-1.5 text-left text-xs text-foreground/80 transition-colors hover:bg-[hsl(var(--foreground)/0.03)]"
                          onClick={() => attachToProject(project.id)}
                          type="button"
                        >
                          <p className="text-sm text-foreground">{project.name}</p>
                          <p>{project.code} · {project.owner}</p>
                        </button>
                      ))}
                    </div>
                    <button
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--foreground)/0.06)] px-2.5 py-1 text-xs text-foreground/75"
                      onClick={() => toast("Quick add project", { description: "Project draft row opened (mock)." })}
                      type="button"
                    >
                      <Plus className="h-3.5 w-3.5" /> Quick add project
                    </button>
                  </div>
                ) : null}

                {activeAction === "create" ? (
                  <div className="mt-2 border border-border/80 bg-background p-2">
                    <p className={sectionLabelClass}>Create meeting request</p>
                    <div className="mt-2 space-y-2">
                      <input
                        className="h-9 w-full border border-border bg-background px-2 text-sm text-foreground outline-none"
                        onChange={(event) => setCreateTitle(event.target.value)}
                        placeholder="Meeting title"
                        value={createTitle}
                      />
                      <input
                        className="h-9 w-full border border-border bg-background px-2 text-sm text-foreground outline-none"
                        onChange={(event) => setCreateSeedDateTime(event.target.value)}
                        type="datetime-local"
                        value={createSeedDateTime}
                      />
                      <input
                        className="h-9 w-full border border-border bg-background px-2 text-sm text-foreground outline-none"
                        onChange={(event) => setCreateAttendees(event.target.value)}
                        placeholder="Attendees (comma separated)"
                        value={createAttendees}
                      />
                    </div>

                    <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-foreground/65">Suggested times</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {suggestedSlots.map((slot) => {
                        const selected = createSelectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${selected ? "border-primary bg-[hsl(var(--primary)/0.15)] text-primary" : "border-border/80 bg-background text-foreground/75"}`}
                            onClick={() => setCreateSelectedSlot(slot)}
                            type="button"
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>

                    <p className="mt-2 text-xs text-foreground/65">{selectedMeeting.schedulingSuggestions?.timezoneLabel ?? "Local timezone"}</p>

                    <div className="mt-2">
                      <SmallButton active onClick={sendMeetingRequest}>
                        <Check className="mr-2 h-3.5 w-3.5" /> Send request
                      </SmallButton>
                    </div>

                    {createRequestPreview ? (
                      <p className="mt-2 rounded-md bg-[hsl(var(--foreground)/0.05)] px-2 py-1.5 text-xs text-foreground/75">
                        Calendar preview: {createRequestPreview}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {contextBlocks.map((block) => (
                    <div
                      key={block.id}
                      className={`border p-3 ${
                        block.tone === "critical"
                          ? "border-primary bg-primary text-primary-foreground"
                          : block.tone === "inverted"
                            ? "border-foreground bg-foreground text-background"
                            : "border-border/80 bg-background text-foreground"
                      }`}
                    >
                      <p className={`font-mono text-[10px] uppercase tracking-[0.12em] ${block.tone === "neutral" ? "text-foreground/70" : "text-current/80"}`}>
                        {block.title}
                      </p>
                      <p className="mt-2 text-[15px] leading-7">{block.body}</p>
                    </div>
                  ))}
                </div>

                <Separator className="my-3" />

                <section>
                  <p className={sectionLabelClass}>Attendees</p>
                  <div className="mt-2 space-y-2">
                    {attendeeCards.map((person) => (
                      <article key={person.name} className="rounded-md border border-border/80 bg-background p-2.5">
                        <p className="text-sm text-foreground">{person.name}</p>
                        <p className="text-xs uppercase tracking-[0.08em] text-foreground/65">{person.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-foreground/70">{person.note}</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <a
                            className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-foreground/70 transition-colors hover:bg-[hsl(var(--foreground)/0.05)]"
                            href={person.profileUrl}
                            onClick={(event) => event.preventDefault()}
                          >
                            <Link2 className="h-3 w-3" /> Profile
                          </a>
                          <a
                            className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-foreground/70 transition-colors hover:bg-[hsl(var(--foreground)/0.05)]"
                            href={`mailto:${person.email}`}
                            onClick={(event) => event.preventDefault()}
                          >
                            <Mail className="h-3 w-3" /> Email
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <section className="rounded-lg border border-border/80 bg-[hsl(var(--foreground)/0.015)] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className={sectionLabelClass}>Related meetings</p>
                      <span className="text-[10px] uppercase tracking-[0.1em] text-foreground/50">
                        {landingHelper.relatedMeetings.length}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {landingHelper.relatedMeetings.slice(0, 4).map((title) => {
                        const linkedMeeting = meetings.find((meeting) => meeting.title.toLowerCase().includes(title.toLowerCase().split(" ")[0] ?? ""));
                        return (
                          <button
                            key={title}
                            className="block w-full rounded-md border border-border/70 bg-background px-2.5 py-2 text-left transition-colors hover:border-primary/35 hover:bg-[hsl(var(--primary)/0.03)]"
                            onClick={() => linkedMeeting && openMeeting(linkedMeeting.id)}
                            type="button"
                          >
                            {title}
                          </button>
                        );
                      })}
                      {!landingHelper.relatedMeetings.length ? (
                          <p className="rounded-md border border-border/70 bg-background px-2.5 py-2 text-xs text-foreground/65">
                            No related meetings suggested yet.
                          </p>
                        ) : null}
                    </div>
                  </section>

                  <section className="rounded-lg border border-border/80 bg-[hsl(var(--foreground)/0.015)] p-3">
                    <p className={sectionLabelClass}>Today spotlight</p>
                    <div className="mt-2 space-y-1.5">
                      {landingPriorityMeetings.map((meeting) => (
                        <button
                          key={meeting.id}
                          className="block w-full rounded-md border border-border/70 bg-background px-2.5 py-2 text-left transition-colors hover:border-primary/35 hover:bg-[hsl(var(--primary)/0.03)]"
                          onClick={() => openMeeting(meeting.id)}
                          type="button"
                        >
                          <p className="text-sm text-foreground">{meeting.title}</p>
                          <p className="text-xs text-foreground/65">{meeting.time} · {meeting.stage}</p>
                        </button>
                      ))}
                      {!landingPriorityMeetings.length ? (
                          <p className="rounded-md border border-border/70 bg-background px-2.5 py-2 text-xs text-foreground/65">
                            No meetings in today spotlight.
                          </p>
                        ) : null}
                    </div>
                  </section>

                  <section className="rounded-lg border border-border/80 bg-[hsl(var(--foreground)/0.015)] p-3">
                    <p className={sectionLabelClass}>People in motion</p>
                    <div className="mt-2 space-y-1.5">
                      {landingPeopleCards.map((person) => (
                        <article key={person.name} className="rounded-md border border-border/70 bg-background px-2.5 py-2">
                          <p className="text-sm text-foreground">{person.name}</p>
                          <p className="text-[11px] text-foreground/70">{person.meetingTitle} · {person.stage}</p>
                        </article>
                      ))}
                      {!landingPeopleCards.length ? (
                        <p className="rounded-md border border-border/70 bg-background px-2.5 py-2 text-xs text-foreground/65">
                          People context will appear when meetings are scheduled.
                        </p>
                      ) : null}
                    </div>
                  </section>

                  <section className="rounded-lg border border-border/80 bg-[hsl(var(--foreground)/0.015)] p-3">
                    <p className={sectionLabelClass}>Prep highlights</p>
                    <div className="mt-2 space-y-1.5">
                      {landingHelper.folderHighlights.slice(0, 2).map((item) => (
                        <p key={item} className="rounded-md border border-border/70 bg-background px-2.5 py-2 text-sm text-foreground/85">{item}</p>
                      ))}
                      {landingHelper.decisionCarryovers.map((item) => (
                        <p key={item} className="rounded-md border border-border/70 bg-background px-2.5 py-2 text-sm text-foreground/85">{item}</p>
                      ))}
                      {!landingHelper.folderHighlights.length && !landingHelper.decisionCarryovers.length ? (
                        <p className="rounded-md border border-border/70 bg-background px-2.5 py-2 text-xs text-foreground/65">
                          Prep highlights will populate from recent meeting decisions.
                        </p>
                      ) : null}
                    </div>
                  </section>
                </div>
              </>
            )}
          </Surface>
        </div>
      </PageContainer>
      {notesFocusMode && selectedMeeting ? (
        <div className="fixed inset-0 z-50 bg-white p-6 lg:p-10">
          <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/70">
                {selectedMeeting.title} · Focus notes
              </p>
              <button
                className="inline-flex h-8 items-center rounded-md border border-border px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/75"
                onClick={() => setNotesFocusMode(false)}
                type="button"
              >
                Exit focus (Esc)
              </button>
            </div>
            <RichOperatorEditor
              className="h-full flex-1 border-border/70 bg-white"
              minHeight={560}
              onChange={setMeetingNotes}
              placeholder="Blank slate. Press / for rich formatting commands."
              value={activeNotes}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

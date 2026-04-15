import { useCallback, useEffect, useMemo, useRef } from "react";
import { CalendarDays, CheckSquare, ChevronDown, ChevronUp, EllipsisVertical, Filter, FolderOpen, MessageSquare, Paperclip, Search, SendHorizontal, Square } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { PageContainer } from "@/components/page-container";
import { RichOperatorEditor } from "@/components/rich-operator-editor";
import { toast } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
import { SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import { contactCards, inboxThreads } from "@/lib/ubik-data";

type QuickFilter = "all" | "unread" | "attention" | "waiting" | "approval";

type AddedTask = {
  id: string;
  title: string;
  status: "Open";
  due: "Today";
  priority: (typeof inboxThreads)[number]["priority"];
  source: (typeof inboxThreads)[number]["source"];
  provenance: string;
};

function synthesizeThreadInsights(thread: (typeof inboxThreads)[number]) {
  return [
    `${thread.priority} priority signal from ${thread.sender}.`,
    `Thread includes ${thread.attachments.length} attachment${thread.attachments.length === 1 ? "" : "s"} and ${thread.provenance.length} linked context signal${thread.provenance.length === 1 ? "" : "s"}.`,
    `Action intent: ${thread.intentTag ?? "Follow-up"}. Domain: ${thread.domainTag ?? "General"}.`,
    ...thread.extractedTasks.map((task) => `Task extracted: ${task}`),
  ];
}

function buildInsightBlocks(thread: (typeof inboxThreads)[number]) {
  return [
    {
      id: "why",
      title: "Why this matters",
      body: thread.extractedTasks[0] ?? "Requires immediate operator action.",
      tone: "neutral" as const,
    },
    {
      id: "changed",
      title: "What changed",
      body: thread.provenance[1] ?? thread.provenance[0] ?? "No change signal.",
      tone: "neutral" as const,
    },
    {
      id: "blocked",
      title: "What is blocked",
      body:
        thread.priority === "Critical" || thread.priority === "High"
          ? "Outbound reply and release path remain blocked until this thread is resolved."
          : "No immediate blocker; monitor for follow-up risk.",
      tone: "critical" as const,
    },
    {
      id: "next",
      title: "Recommended next step",
      body: thread.recommendedReply || "Draft and route a clear next-step response.",
      tone: "inverted" as const,
    },
  ];
}

function buildThreadBubbles(thread: (typeof inboxThreads)[number]) {
  return [
    {
      id: `${thread.id}-source`,
      role: "source" as const,
      label: `${thread.sender} · ${thread.source}`,
      text: thread.preview,
    },
    {
      id: `${thread.id}-context`,
      role: "source" as const,
      label: "Thread context",
      text: thread.provenance[0] ?? "No linked provenance available.",
    },
    {
      id: `${thread.id}-suggested`,
      role: "operator" as const,
      label: "Suggested response",
      text: thread.recommendedReply,
    },
  ];
}

function defaultReplyTo(thread: (typeof inboxThreads)[number]) {
  return thread.sender;
}

export default function Inbox() {
  const navigate = useNavigate();
  const { createTab, setPageState } = useShellState();
  const { threadId } = useParams();
  const rowMenuRef = useRef<HTMLDivElement | null>(null);

  const [quickFilter, setQuickFilter] = useWorkbenchState<QuickFilter>("inbox-quick-filter", "all");
  const [filterPromptOpen, setFilterPromptOpen] = useWorkbenchState<boolean>("inbox-filter-prompt-open", false);
  const [filterPrompt, setFilterPrompt] = useWorkbenchState<string>("inbox-filter-prompt", "");
  const [lastSelectedThreadId, setLastSelectedThreadId] = useWorkbenchState<string>("inbox-selected-thread", inboxThreads[0]?.id ?? "");

  const [emailMetaByThread, setEmailMetaByThread] = useWorkbenchState<Record<string, { to: string; subject: string }>>("inbox-email-meta", {});
  const [emailCcByThread, setEmailCcByThread] = useWorkbenchState<Record<string, string>>("inbox-email-cc", {});
  const [emailBccByThread, setEmailBccByThread] = useWorkbenchState<Record<string, string>>("inbox-email-bcc", {});
  const [emailMetaOpenByThread, setEmailMetaOpenByThread] = useWorkbenchState<Record<string, boolean>>("inbox-email-meta-open", {});
  const [draftByThread, setDraftByThread] = useWorkbenchState<Record<string, string>>("inbox-draft-by-thread", {});

  const [reviewedStateByThread, setReviewedStateByThread] = useWorkbenchState<Record<string, boolean>>("inbox-reviewed-state", {});
  const [watchStateByThread, setWatchStateByThread] = useWorkbenchState<Record<string, boolean>>("inbox-watch-state", {});
  const [archiveStateByThread, setArchiveStateByThread] = useWorkbenchState<Record<string, boolean>>("inbox-archive-state", {});
  const [reminderByThreadId, setReminderByThreadId] = useWorkbenchState<Record<string, string | null>>("inbox-reminder-by-thread", {});
  const [rowRemindMenuThreadId, setRowRemindMenuThreadId] = useWorkbenchState<string | null>("inbox-row-remind-menu-thread-id", null);

  const [approvalOpenByThread, setApprovalOpenByThread] = useWorkbenchState<Record<string, boolean>>("inbox-approval-open", {});
  const [approvalQueryByThread, setApprovalQueryByThread] = useWorkbenchState<Record<string, string>>("inbox-approval-query", {});
  const [approvalSelectedByThread, setApprovalSelectedByThread] = useWorkbenchState<Record<string, string>>("inbox-approval-selected", {});
  const [approvalSentByThread, setApprovalSentByThread] = useWorkbenchState<Record<string, boolean>>("inbox-approval-sent", {});
  const [discussOpenByThread, setDiscussOpenByThread] = useWorkbenchState<Record<string, boolean>>("inbox-discuss-open", {});
  const [discussQueryByThread, setDiscussQueryByThread] = useWorkbenchState<Record<string, string>>("inbox-discuss-query", {});
  const [discussSelectedByThread, setDiscussSelectedByThread] = useWorkbenchState<Record<string, string>>("inbox-discuss-selected", {});
  const [discussSentByThread, setDiscussSentByThread] = useWorkbenchState<Record<string, boolean>>("inbox-discuss-sent", {});

  const [taskInputEnabledByThread, setTaskInputEnabledByThread] = useWorkbenchState<Record<string, boolean>>("inbox-task-input-enabled", {});
  const [taskInputByThread, setTaskInputByThread] = useWorkbenchState<Record<string, string>>("inbox-task-input", {});
  const [addedTasksByThread, setAddedTasksByThread] = useWorkbenchState<Record<string, AddedTask[]>>("inbox-added-tasks", {});

  const isThreadUnread = useCallback(
    (thread: (typeof inboxThreads)[number]) => Boolean(thread.isUnread) && !reviewedStateByThread[thread.id],
    [reviewedStateByThread],
  );

  const promptTokens = filterPrompt.toLowerCase().split(" ").filter(Boolean);

  const filteredByQuick = useMemo(() => {
    if (quickFilter === "all") return inboxThreads;
    if (quickFilter === "unread") return inboxThreads.filter((thread) => isThreadUnread(thread));
    if (quickFilter === "attention") return inboxThreads.filter((thread) => thread.priority === "Critical" || thread.priority === "High");
    if (quickFilter === "waiting") return inboxThreads.filter((thread) => thread.status === "Waiting");
    return inboxThreads.filter((thread) => thread.approvalRequired);
  }, [isThreadUnread, quickFilter]);

  const filtered = useMemo(() => {
    if (!promptTokens.length) return filteredByQuick;
    return filteredByQuick.filter((thread) => {
      const hay = `${thread.subject} ${thread.preview} ${thread.sender} ${thread.source} ${thread.domainTag} ${thread.intentTag}`.toLowerCase();
      return promptTokens.every((token) => hay.includes(token));
    });
  }, [filteredByQuick, promptTokens]);

  const visibleFiltered = useMemo(
    () => filtered.filter((thread) => !archiveStateByThread[thread.id]),
    [archiveStateByThread, filtered],
  );

  const requestedThreadId = threadId ?? lastSelectedThreadId;
  const selectedThread = visibleFiltered.find((thread) => thread.id === requestedThreadId) ?? visibleFiltered[0] ?? null;

  const emailMeta = selectedThread
    ? emailMetaByThread[selectedThread.id] ?? { to: defaultReplyTo(selectedThread), subject: `Re: ${selectedThread.subject}` }
    : { to: "", subject: "" };
  const emailCc = selectedThread ? emailCcByThread[selectedThread.id] ?? "" : "";
  const emailBcc = selectedThread ? emailBccByThread[selectedThread.id] ?? "" : "";
  const currentDraftText = selectedThread ? draftByThread[selectedThread.id] ?? "" : "";
  const suggestedReply = selectedThread?.recommendedReply ?? "";
  const threadInsights = selectedThread ? synthesizeThreadInsights(selectedThread) : [];
  const insightBlocks = selectedThread ? buildInsightBlocks(selectedThread) : [];
  const threadBubbles = selectedThread ? buildThreadBubbles(selectedThread) : [];
  const emailMetaOpen = selectedThread ? Boolean(emailMetaOpenByThread[selectedThread.id]) : false;

  const isRead = selectedThread ? Boolean(reviewedStateByThread[selectedThread.id]) || !selectedThread.isUnread : false;
  const approvalOpen = selectedThread ? Boolean(approvalOpenByThread[selectedThread.id]) : false;
  const approvalQuery = selectedThread ? approvalQueryByThread[selectedThread.id] ?? "" : "";
  const approvalSelectedId = selectedThread ? approvalSelectedByThread[selectedThread.id] : undefined;
  const approvalSent = selectedThread ? Boolean(approvalSentByThread[selectedThread.id]) : false;
  const selectedContact = contactCards.find((contact) => contact.id === approvalSelectedId);
  const discussOpen = selectedThread ? Boolean(discussOpenByThread[selectedThread.id]) : false;
  const discussQuery = selectedThread ? discussQueryByThread[selectedThread.id] ?? "" : "";
  const discussSelectedId = selectedThread ? discussSelectedByThread[selectedThread.id] : undefined;
  const discussSent = selectedThread ? Boolean(discussSentByThread[selectedThread.id]) : false;
  const selectedDiscussContact = contactCards.find((contact) => contact.id === discussSelectedId);

  const taskInputEnabled = selectedThread ? Boolean(taskInputEnabledByThread[selectedThread.id]) : false;
  const taskInput = selectedThread ? taskInputByThread[selectedThread.id] ?? "" : "";
  const addedTasks = selectedThread ? addedTasksByThread[selectedThread.id] ?? [] : [];

  const matchingContacts = useMemo(() => {
    const q = approvalQuery.toLowerCase().trim();
    if (!q) return contactCards;
    return contactCards.filter((contact) => `${contact.name} ${contact.role} ${contact.company}`.toLowerCase().includes(q));
  }, [approvalQuery]);
  const matchingDiscussContacts = useMemo(() => {
    const q = discussQuery.toLowerCase().trim();
    if (!q) return contactCards;
    return contactCards.filter((contact) => `${contact.name} ${contact.role} ${contact.company}`.toLowerCase().includes(q));
  }, [discussQuery]);

  useEffect(() => {
    if (!selectedThread) {
      if (threadId) {
        navigate("/inbox", { replace: true });
      }
      return;
    }

    if (lastSelectedThreadId !== selectedThread.id) {
      setLastSelectedThreadId(selectedThread.id);
    }
    if (threadId !== selectedThread.id) {
      navigate(`/inbox/${selectedThread.id}`, { replace: true });
    }
  }, [lastSelectedThreadId, navigate, selectedThread, setLastSelectedThreadId, threadId]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!rowMenuRef.current) return;
      if (rowMenuRef.current.contains(event.target as Node)) return;
      setRowRemindMenuThreadId(null);
    };

    if (rowRemindMenuThreadId) {
      window.addEventListener("mousedown", handleOutsideClick);
    }

    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [rowRemindMenuThreadId, setRowRemindMenuThreadId]);

  const setCurrentDraftText = (next: string) => {
    if (!selectedThread) return;
    setDraftByThread({ ...draftByThread, [selectedThread.id]: next });
  };

  const setEmailTo = (next: string) => {
    if (!selectedThread) return;
    setEmailMetaByThread({
      ...emailMetaByThread,
      [selectedThread.id]: {
        to: next,
        subject: emailMeta.subject,
      },
    });
  };

  const setEmailSubject = (next: string) => {
    if (!selectedThread) return;
    setEmailMetaByThread({
      ...emailMetaByThread,
      [selectedThread.id]: {
        to: emailMeta.to,
        subject: next,
      },
    });
  };

  const setEmailCc = (next: string) => {
    if (!selectedThread) return;
    setEmailCcByThread({
      ...emailCcByThread,
      [selectedThread.id]: next,
    });
  };

  const setEmailBcc = (next: string) => {
    if (!selectedThread) return;
    setEmailBccByThread({
      ...emailBccByThread,
      [selectedThread.id]: next,
    });
  };

  const selectThread = useCallback((nextThreadId: string) => {
    setLastSelectedThreadId(nextThreadId);
    setRowRemindMenuThreadId(null);
    navigate(`/inbox/${nextThreadId}`);
  }, [navigate, setLastSelectedThreadId, setRowRemindMenuThreadId]);

  const markThreadReviewed = (targetThreadId?: string) => {
    const threadIdToReview = targetThreadId ?? selectedThread?.id;
    if (!threadIdToReview) return;

    setReviewedStateByThread({ ...reviewedStateByThread, [threadIdToReview]: true });
    toast("Thread marked reviewed");
  };

  const archiveThread = (targetThreadId?: string) => {
    const threadIdToArchive = targetThreadId ?? selectedThread?.id;
    if (!threadIdToArchive) return;
    setArchiveStateByThread({ ...archiveStateByThread, [threadIdToArchive]: true });
    setRowRemindMenuThreadId(null);
    toast("Thread archived");
  };

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      if (!visibleFiltered.length || !selectedThread) return;

      event.preventDefault();

      const currentIndex = visibleFiltered.findIndex((thread) => thread.id === selectedThread.id);
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = currentIndex < 0
        ? 0
        : (currentIndex + delta + visibleFiltered.length) % visibleFiltered.length;

      const nextThread = visibleFiltered[nextIndex];
      if (!nextThread) return;
      selectThread(nextThread.id);
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [selectedThread, selectThread, visibleFiltered]);

  const sendApprovalAssign = () => {
    if (!selectedThread || !approvalSelectedId) return;
    setApprovalSentByThread({ ...approvalSentByThread, [selectedThread.id]: true });
  };
  const sendDiscuss = () => {
    if (!selectedThread || !discussSelectedId) return;
    setDiscussSentByThread({ ...discussSentByThread, [selectedThread.id]: true });
    toast("Shared with team", {
      description: `Discuss thread sent to ${selectedDiscussContact?.name ?? "teammate"}.`,
    });
  };

  const addQuickTask = () => {
    if (!selectedThread) return;
    const title = taskInput.trim();
    if (!title) return;

    const nextTask: AddedTask = {
      id: `${selectedThread.id}-${Date.now()}`,
      title,
      status: "Open",
      due: "Today",
      priority: selectedThread.priority,
      source: selectedThread.source,
      provenance: selectedThread.provenance[0] ?? "Thread context",
    };

    setAddedTasksByThread({
      ...addedTasksByThread,
      [selectedThread.id]: [nextTask, ...addedTasks],
    });
    setTaskInputByThread({ ...taskInputByThread, [selectedThread.id]: "" });
  };

  const sendEmailReply = () => {
    if (!selectedThread) return;
    const recipient = emailMeta.to.trim() || defaultReplyTo(selectedThread);
    toast("Email draft ready", {
      description: `Prepared for ${recipient}`,
    });
  };

  const setReminder = (preset: "1h" | "3h" | "tomorrow", targetThreadId?: string) => {
    const threadIdForReminder = targetThreadId ?? selectedThread?.id;
    if (!threadIdForReminder) return;
    const now = new Date();
    const next = new Date(now);
    const label = preset === "1h" ? "1 hour" : preset === "3h" ? "3 hours" : "Tomorrow 9:00 AM";

    if (preset === "1h") {
      next.setHours(next.getHours() + 1);
    } else if (preset === "3h") {
      next.setHours(next.getHours() + 3);
    } else {
      next.setDate(next.getDate() + 1);
      next.setHours(9, 0, 0, 0);
    }

    setReminderByThreadId({ ...reminderByThreadId, [threadIdForReminder]: next.toISOString() });
    setRowRemindMenuThreadId(null);

    toast("Reminder set", {
      description: `This thread will return in ${label}.`,
    });
  };

  const openInGmail = (_targetThreadId?: string) => {
    toast("Opening Gmail soon", {
      description: "Gmail deep link unavailable in mock mode.",
    });
  };

  const openInChat = () => {
    if (!selectedThread) return;
    const tabId = createTab("/chat");
    if (!tabId) return;

    const recipient = emailMeta.to.trim() || defaultReplyTo(selectedThread);
    const subject = emailMeta.subject.trim() || `Re: ${selectedThread.subject}`;
    const cc = emailCc.trim();
    const bcc = emailBcc.trim();
    const body = currentDraftText.trim() || suggestedReply;
    const prompt = [
      "Email assist (Gmail): review and improve this outbound draft.",
      "",
      `Thread subject: ${selectedThread.subject}`,
      `Sender: ${selectedThread.sender}`,
      `To: ${recipient}`,
      cc ? `Cc: ${cc}` : null,
      bcc ? `Bcc: ${bcc}` : null,
      `Subject: ${subject}`,
      "",
      "Current draft:",
      body || "(empty draft)",
      "",
      "Return one polished final email and one concise alternate.",
    ].filter(Boolean).join("\n");

    setPageState(`${tabId}:chat-composer`, prompt);
    setPageState(`${tabId}:chat-sources`, ["org_knowledge", "files", "gmail"]);
    setPageState(`${tabId}:chat-mode`, "speed");
    toast("Opened in Ubik", {
      description: "Email context and Gmail source were prefilled.",
    });
  };

  const sectionLabelClass = "font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/65";
  const actionButtonClass =
    "inline-flex h-10 items-center justify-center gap-1.5 border border-border bg-background px-3 text-xs uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-background/80";

  const renderContactPickerPanel = (opts: {
    open: boolean;
    query: string;
    placeholder: string;
    selectedId?: string;
    sent: boolean;
    selectedName?: string;
    contacts: typeof contactCards;
    onQueryChange: (value: string) => void;
    onSelect: (id: string) => void;
    onSend: () => void;
    sendLabel: string;
    sentLabel: string;
  }) => {
    if (!opts.open) return null;
    return (
      <div className="mt-2 border border-border/80 bg-background p-2 transition-all duration-200">
        <input
          className="h-9 w-full border border-border bg-background px-2 text-sm text-foreground outline-none"
          onChange={(event) => opts.onQueryChange(event.target.value)}
          placeholder={opts.placeholder}
          value={opts.query}
        />
        <div className="mt-2 max-h-32 space-y-1 overflow-auto">
          {opts.contacts.map((contact) => (
            <button
              key={contact.id}
              className={`w-full border px-2 py-1.5 text-left text-xs transition-colors duration-150 ${
                opts.selectedId === contact.id ? "border-primary bg-background text-foreground" : "border-border text-foreground/75 hover:bg-background"
              }`}
              onClick={() => opts.onSelect(contact.id)}
              type="button"
            >
              <p className="text-foreground">{contact.name}</p>
              <p>{contact.role} · {contact.company}</p>
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="text-xs text-foreground/70">
            {opts.selectedName ? `Selected: ${opts.selectedName}` : "No teammate selected"}
          </div>
          <SmallButton active={Boolean(opts.selectedName)} onClick={opts.onSend}>
            <SendHorizontal className="mr-2 h-3.5 w-3.5" /> {opts.sendLabel}
          </SmallButton>
        </div>
        {opts.sent ? <p className="mt-2 text-xs text-foreground">{opts.sentLabel}</p> : null}
      </div>
    );
  };

  return (
    <div className="px-4 py-5 lg:px-8">
      <PageContainer className="space-y-4">
        <Surface className="bg-background px-4 py-3.5">
          <p className="text-[15px] text-foreground/85">Unified thread intelligence across inbound channels and extracted tasks.</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {([
                ["all", "All"],
                ["unread", "Unread"],
                ["attention", "Needs attention"],
                ["waiting", "Waiting"],
                ["approval", "Approval"],
              ] as [QuickFilter, string][]).map(([key, label]) => (
                <SmallButton key={key} active={quickFilter === key} onClick={() => setQuickFilter(key)}>
                  {label}
                </SmallButton>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <SmallButton onClick={() => setFilterPromptOpen((open) => !open)}>
                <Filter className="mr-2 h-3.5 w-3.5" /> Filter
              </SmallButton>
              <StatusPill tone="muted">{visibleFiltered.length} threads</StatusPill>
            </div>
          </div>

          {filterPromptOpen ? (
            <div className="mt-2 flex items-center gap-2 rounded-md border border-border bg-background px-3 transition-all duration-200">
              <Search className="h-4 w-4 text-foreground/70" />
              <input
                className="h-10 w-full bg-transparent text-sm text-foreground outline-none"
                placeholder="Filter by sender, subject, domain, or intent"
                value={filterPrompt}
                onChange={(event) => setFilterPrompt(event.target.value)}
              />
            </div>
          ) : null}
        </Surface>

        <div className="grid gap-3 xl:grid-cols-[0.9fr_1.58fr_1.02fr]">
          <Surface className="bg-background p-1.5">
            {visibleFiltered.length ? (
              <div className="space-y-1.5">
                {visibleFiltered.map((thread) => {
                  const selected = selectedThread?.id === thread.id;
                  const isUnread = isThreadUnread(thread);
                  const isWatched = Boolean(watchStateByThread[thread.id]);
                  const rowMenuOpen = rowRemindMenuThreadId === thread.id;
                  const highSignalLabel = thread.approvalRequired
                    ? "Awaiting approval"
                    : thread.priority === "Critical" || thread.priority === "High"
                      ? "Action required"
                      : null;
                  return (
                    <div
                      key={thread.id}
                      className={`group w-full rounded-md border px-3.5 py-3 text-left transition-all duration-200 ${
                        selected
                          ? "border-primary/45 bg-[hsl(var(--primary)/0.06)]"
                          : "border-border/75 bg-background hover:border-border hover:bg-[hsl(var(--foreground)/0.02)]"
                      }`}
                      onClick={() => selectThread(thread.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectThread(thread.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="line-clamp-2 text-[16px] leading-6 text-foreground">{thread.subject}</p>
                        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-foreground/55">{thread.source}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-sm text-foreground">{thread.sender}</span>
                        <span className="text-sm text-foreground/65">{thread.time}</span>
                        {isUnread ? <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-primary">Unread</span> : null}
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-sm text-foreground/80">{thread.preview}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {thread.domainTag ? (
                          <span className="rounded-full bg-[hsl(var(--foreground)/0.05)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.11em] text-foreground/60">{thread.domainTag}</span>
                        ) : null}
                        {thread.intentTag ? (
                          <span className="rounded-full bg-[hsl(var(--foreground)/0.05)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.11em] text-foreground/60">{thread.intentTag}</span>
                        ) : null}
                        {highSignalLabel ? (
                          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.11em] text-primary">{highSignalLabel}</span>
                        ) : null}
                      </div>
                      <div className="relative mt-2.5 border-t border-border/60 pt-2">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-foreground/70">
                          <button
                            aria-label={`Mark reviewed for ${thread.subject}`}
                            className="h-7 px-0 transition-colors hover:text-foreground"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              markThreadReviewed(thread.id);
                            }}
                            type="button"
                          >
                            {isUnread ? "Mark reviewed" : "Reviewed"}
                          </button>
                          <span className="h-3.5 w-px bg-border/70" />
                          <button
                            aria-label={isWatched ? `Unwatch ${thread.subject}` : `Watch ${thread.subject}`}
                            className={`h-7 px-0 transition-colors hover:text-foreground ${
                              isWatched ? "text-primary" : ""
                            }`}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setWatchStateByThread({ ...watchStateByThread, [thread.id]: !isWatched });
                            }}
                            type="button"
                          >
                            Watch
                          </button>
                          <span className="h-3.5 w-px bg-border/70" />
                          <button
                            aria-label={`Archive ${thread.subject}`}
                            className="h-7 px-0 transition-colors hover:text-foreground"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              archiveThread(thread.id);
                            }}
                            type="button"
                          >
                            Archive
                          </button>
                          <span className="h-3.5 w-px bg-border/70" />
                          <button
                            aria-label={`Open in Email for ${thread.subject}`}
                            className="h-7 px-0 transition-colors hover:text-foreground"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              openInGmail(thread.id);
                            }}
                            type="button"
                          >
                            Open in Email
                          </button>
                          <button
                            aria-expanded={rowMenuOpen}
                            aria-label={`Open schedule menu for ${thread.subject}`}
                            className={`ml-auto h-7 w-7 rounded-full transition-colors hover:bg-[hsl(var(--foreground)/0.06)] hover:text-foreground ${
                              reminderByThreadId[thread.id] ? "text-primary" : "text-foreground/70"
                            }`}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setRowRemindMenuThreadId(rowMenuOpen ? null : thread.id);
                            }}
                            type="button"
                          >
                            <EllipsisVertical className="mx-auto h-4 w-4" />
                          </button>
                        </div>
                        {rowMenuOpen ? (
                          <div
                            className="absolute right-0 top-[calc(100%+0.25rem)] z-10 border border-border bg-background p-2 shadow-sm"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                            }}
                            ref={rowMenuRef}
                          >
                            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.11em] text-foreground/70">Schedule reminder</p>
                            <div className="flex gap-1.5">
                              <button
                                aria-label={`Remind ${thread.subject} in 1 hour`}
                                className="h-7 rounded-full border border-border/80 px-2 text-[11px] uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-[hsl(var(--primary)/0.08)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                onClick={() => setReminder("1h", thread.id)}
                                type="button"
                              >
                                1h
                              </button>
                              <button
                                aria-label={`Remind ${thread.subject} in 3 hours`}
                                className="h-7 rounded-full border border-border/80 px-2 text-[11px] uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-[hsl(var(--primary)/0.08)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                onClick={() => setReminder("3h", thread.id)}
                                type="button"
                              >
                                3h
                              </button>
                              <button
                                aria-label={`Remind ${thread.subject} tomorrow at 9 AM`}
                                className="h-7 rounded-full border border-border/80 px-2 text-[11px] uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-[hsl(var(--primary)/0.08)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                onClick={() => setReminder("tomorrow", thread.id)}
                                type="button"
                              >
                                Tomorrow 9 AM
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4">
                <p className="text-sm text-foreground/70">No active threads in this filter.</p>
              </div>
            )}
          </Surface>

          <Surface className="bg-background p-4">
            {selectedThread ? (
              <>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/65">
                  {selectedThread.sender} · {selectedThread.source} · {selectedThread.time}
                </p>
                <h2 className="mt-2 text-[32px] leading-[1.12] text-foreground">{selectedThread.subject}</h2>
                <p className="mt-2 text-[15px] text-foreground/85">{selectedThread.preview}</p>

                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {insightBlocks.map((block) => (
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
                      <p className="mt-2 text-sm leading-6">{block.body}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-md border border-border/80 bg-[hsl(var(--foreground)/0.01)] p-3">
                  <p className={sectionLabelClass}>UBIK analysis</p>
                  <div className="mt-2 space-y-1 text-sm leading-6 text-foreground">
                    {threadInsights.map((line) => (
                      <p key={line}>- {line}</p>
                    ))}
                  </div>
                </div>

                <div className="mt-4 rounded-md border border-border/80 bg-[hsl(var(--foreground)/0.01)] p-3">
                  <p className={sectionLabelClass}>Thread messages</p>
                  <div className="mt-3 space-y-2">
                    {threadBubbles.map((bubble) => (
                      <div
                        key={bubble.id}
                        className={`max-w-[88%] border px-3 py-2 text-sm ${
                          bubble.role === "operator"
                            ? "ml-auto border-primary/50 bg-background text-foreground"
                            : "mr-auto border-border/80 bg-background text-foreground"
                        }`}
                      >
                        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-foreground/65">{bubble.label}</p>
                        <p className="mt-1 leading-6">{bubble.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedThread.attachments.map((file) => (
                    <StatusPill key={file} tone="muted">{file}</StatusPill>
                  ))}
                </div>

                <Separator className="my-3" />

                <div className="space-y-2 rounded-md border border-border/80 bg-[hsl(var(--foreground)/0.01)] p-3">
                  <button
                    className="flex w-full items-center justify-between text-left"
                    onClick={() =>
                      setEmailMetaOpenByThread({
                        ...emailMetaOpenByThread,
                        [selectedThread.id]: !emailMetaOpen,
                      })
                    }
                    type="button"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/70">Recipients and subject</p>
                    {emailMetaOpen ? <ChevronUp className="h-4 w-4 text-foreground/60" /> : <ChevronDown className="h-4 w-4 text-foreground/60" />}
                  </button>
                  {emailMetaOpen ? (
                    <>
                      <div className="grid gap-2 md:grid-cols-[72px_1fr] md:items-center">
                        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/70">To</p>
                        <input
                          className="h-9 w-full rounded-md border border-border/80 bg-background px-2 text-sm text-foreground outline-none"
                          onChange={(event) => setEmailTo(event.target.value)}
                          placeholder="Recipient"
                          value={emailMeta.to}
                        />
                      </div>
                      <div className="grid gap-2 md:grid-cols-[72px_1fr] md:items-center">
                        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/70">Cc</p>
                        <input
                          className="h-9 w-full rounded-md border border-border/80 bg-background px-2 text-sm text-foreground outline-none"
                          onChange={(event) => setEmailCc(event.target.value)}
                          placeholder="Add Cc recipients"
                          value={emailCc}
                        />
                      </div>
                      <div className="grid gap-2 md:grid-cols-[72px_1fr] md:items-center">
                        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/70">Bcc</p>
                        <input
                          className="h-9 w-full rounded-md border border-border/80 bg-background px-2 text-sm text-foreground outline-none"
                          onChange={(event) => setEmailBcc(event.target.value)}
                          placeholder="Add Bcc recipients"
                          value={emailBcc}
                        />
                      </div>
                      <div className="grid gap-2 md:grid-cols-[72px_1fr] md:items-center">
                        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/70">Subject</p>
                        <input
                          className="h-9 w-full rounded-md border border-border/80 bg-background px-2 text-sm text-foreground outline-none"
                          onChange={(event) => setEmailSubject(event.target.value)}
                          placeholder="Subject"
                          value={emailMeta.subject}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/80">
                      <span className="rounded-full bg-[hsl(var(--foreground)/0.06)] px-2.5 py-1">To: {emailMeta.to || "Recipient"}</span>
                      {emailCc ? <span className="rounded-full bg-[hsl(var(--foreground)/0.06)] px-2.5 py-1">Cc</span> : null}
                      {emailBcc ? <span className="rounded-full bg-[hsl(var(--foreground)/0.06)] px-2.5 py-1">Bcc</span> : null}
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <RichOperatorEditor
                    compactCopyActions
                    minHeight={116}
                    onChange={setCurrentDraftText}
                    placeholder={`Draft your outbound reply. Suggestion: ${suggestedReply}`}
                    showMarkdownCopy={false}
                    showInsertBlock={false}
                    value={currentDraftText}
                  />
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-foreground/75">
                    <button className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary)/0.08)] px-2.5 py-1 text-primary transition-colors hover:bg-[hsl(var(--primary)/0.14)]" type="button">
                      <Paperclip className="h-3.5 w-3.5" /> Attach file
                    </button>
                    <button className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--foreground)/0.06)] px-2.5 py-1 transition-colors hover:bg-[hsl(var(--foreground)/0.1)]" type="button">
                      <CalendarDays className="h-3.5 w-3.5" /> Meeting
                    </button>
                    <button className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--foreground)/0.06)] px-2.5 py-1 transition-colors hover:bg-[hsl(var(--foreground)/0.1)]" type="button">
                      <FolderOpen className="h-3.5 w-3.5" /> Drive
                    </button>
                    <span className="ml-auto text-[11px] text-foreground/65">Connected: Gmail, Calendar, Drive</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <SmallButton active onClick={sendEmailReply}>
                      <SendHorizontal className="mr-2 h-3.5 w-3.5" /> Send
                    </SmallButton>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-foreground/70">No selected thread.</p>
            )}
          </Surface>

          <Surface className="bg-background p-4 xl:sticky xl:top-4 xl:max-h-[calc(100vh-8rem)] xl:overflow-auto">
            {selectedThread ? (
              <>
                <section className="rounded-md border border-border/80 bg-[hsl(var(--foreground)/0.01)] p-3">
                  <p className={sectionLabelClass}>Actions</p>
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    <button
                      aria-label={approvalOpen ? "Close approval and assign" : "Open approval and assign"}
                      className={`${actionButtonClass} ${
                        approvalOpen
                          ? "border-primary bg-primary text-primary-foreground"
                          : "text-primary hover:border-primary/60 hover:bg-primary/10"
                      }`}
                      onClick={() =>
                        setApprovalOpenByThread({
                          ...approvalOpenByThread,
                          [selectedThread.id]: !approvalOpen,
                        })
                      }
                      type="button"
                    >
                      Approval/Assign
                    </button>
                    <button
                      aria-label={discussOpen ? "Close discuss panel" : "Open discuss panel"}
                      className={`${actionButtonClass} ${
                        discussOpen ? "border-primary bg-primary/90 text-primary-foreground" : "text-primary hover:border-primary/60 hover:bg-primary/10"
                      }`}
                      onClick={() =>
                        setDiscussOpenByThread({
                          ...discussOpenByThread,
                          [selectedThread.id]: !discussOpen,
                        })
                      }
                      type="button"
                    >
                      Discuss
                    </button>
                    <button
                      aria-label="Open this thread in ubik"
                      className={actionButtonClass}
                      onClick={openInChat}
                      type="button"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Ubik
                    </button>
                    <button
                      aria-label={isRead ? "Thread already read" : "Mark thread as read"}
                      className={`${actionButtonClass} ${isRead ? "border-primary bg-primary/10 text-primary" : ""}`}
                      onClick={() => markThreadReviewed(selectedThread.id)}
                      type="button"
                    >
                      {isRead ? "Marked as Read" : "Mark as Read"}
                    </button>
                  </div>
                </section>
                {renderContactPickerPanel({
                  open: approvalOpen,
                  query: approvalQuery,
                  placeholder: "Search contact to assign",
                  selectedId: approvalSelectedId,
                  sent: approvalSent,
                  selectedName: selectedContact?.name,
                  contacts: matchingContacts,
                  onQueryChange: (value) =>
                    setApprovalQueryByThread({
                      ...approvalQueryByThread,
                      [selectedThread.id]: value,
                    }),
                  onSelect: (id) => {
                    setApprovalSelectedByThread({
                      ...approvalSelectedByThread,
                      [selectedThread.id]: id,
                    });
                    setApprovalSentByThread({ ...approvalSentByThread, [selectedThread.id]: false });
                  },
                  onSend: sendApprovalAssign,
                  sendLabel: "Send",
                  sentLabel: `Sent to ${selectedContact?.name ?? "assignee"}.`,
                })}
                {renderContactPickerPanel({
                  open: discussOpen,
                  query: discussQuery,
                  placeholder: "Search teammate to discuss",
                  selectedId: discussSelectedId,
                  sent: discussSent,
                  selectedName: selectedDiscussContact?.name,
                  contacts: matchingDiscussContacts,
                  onQueryChange: (value) =>
                    setDiscussQueryByThread({
                      ...discussQueryByThread,
                      [selectedThread.id]: value,
                    }),
                  onSelect: (id) => {
                    setDiscussSelectedByThread({
                      ...discussSelectedByThread,
                      [selectedThread.id]: id,
                    });
                    setDiscussSentByThread({ ...discussSentByThread, [selectedThread.id]: false });
                  },
                  onSend: sendDiscuss,
                  sendLabel: "Share",
                  sentLabel: `Shared with ${selectedDiscussContact?.name ?? "teammate"}.`,
                })}

                <section className="mt-3 rounded-md border border-border/80 bg-[hsl(var(--foreground)/0.01)] p-3">
                  <p className={sectionLabelClass}>Quick task</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                    aria-label={taskInputEnabled ? "Disable task input" : "Enable task input"}
                    className={`transition-colors ${taskInputEnabled ? "text-primary" : "text-foreground/70 hover:text-foreground"}`}
                    onClick={() =>
                      setTaskInputEnabledByThread({
                        ...taskInputEnabledByThread,
                        [selectedThread.id]: !taskInputEnabled,
                      })
                    }
                    type="button"
                  >
                    {taskInputEnabled ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                  </button>
                  <input
                    className="h-9 flex-1 border border-border bg-background px-2 text-sm text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!taskInputEnabled}
                    onChange={(event) =>
                      setTaskInputByThread({
                        ...taskInputByThread,
                        [selectedThread.id]: event.target.value,
                      })
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addQuickTask();
                      }
                    }}
                    placeholder="Add task line and press Enter"
                    value={taskInput}
                  />
                  </div>
                  {addedTasks.length ? (
                    <div className="mt-3 space-y-1.5">
                      {addedTasks.map((task) => (
                        <div key={task.id} className="rounded-md border border-border/80 bg-background p-2 text-xs">
                          <p className="line-clamp-2 text-sm text-foreground">{task.title}</p>
                          <p className="mt-1 text-foreground/70">
                            {task.status} · Due {task.due} · <span className="text-primary">{task.priority}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-foreground/70">No tasks added for this thread yet.</p>
                  )}
                </section>

                <section className="mt-3 rounded-md border border-border/80 bg-[hsl(var(--foreground)/0.01)] p-3">
                  <p className={sectionLabelClass}>Provenance</p>
                  <div className="mt-2 space-y-1.5 text-sm text-foreground/75">
                    {selectedThread.provenance.slice(0, 3).map((entry) => (
                      <p key={entry} className="line-clamp-1">{entry}</p>
                    ))}
                  </div>
                </section>

                <section className="mt-3 rounded-md border border-border/80 bg-[hsl(var(--foreground)/0.01)] p-3">
                  <p className={sectionLabelClass}>People</p>
                  <div className="mt-2 rounded-md border border-border/80 bg-background p-2 text-sm">
                    <p className="text-foreground">{selectedThread.sender}</p>
                    <p className="text-foreground/70">Owner: {selectedThread.owner}</p>
                  </div>
                </section>
              </>
            ) : (
              <p className="text-sm text-foreground/70">No selected thread.</p>
            )}
          </Surface>
        </div>
      </PageContainer>
    </div>
  );
}

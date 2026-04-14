import { useMemo } from "react";
import { ArrowLeft, Bot, MessageSquare, SendHorizontal, Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { PageContainer } from "@/components/page-container";
import { RichOperatorEditor } from "@/components/rich-operator-editor";
import { Separator } from "@/components/ui/separator";
import { SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { useWorkbenchState } from "@/hooks/use-shell-state";
import { inboxThreads } from "@/lib/ubik-data";

type ComposeTab = "drafts" | "comments";
type ReplyMode = "email" | "chat";

function synthesizeThreadInsights(thread: (typeof inboxThreads)[number]) {
  return [
    `${thread.priority} priority signal from ${thread.sender}.`,
    `Thread includes ${thread.attachments.length} attachment${thread.attachments.length === 1 ? "" : "s"} and ${thread.provenance.length} linked context signal${thread.provenance.length === 1 ? "" : "s"}.`,
    `Action intent: ${thread.intentTag ?? "Follow-up"}. Domain: ${thread.domainTag ?? "General"}.`,
    ...thread.extractedTasks.map((task) => `Task extracted: ${task}`),
  ];
}

export default function InboxDetail() {
  const navigate = useNavigate();
  const { threadId } = useParams();

  const thread = useMemo(() => inboxThreads.find((item) => item.id === threadId) ?? inboxThreads[0], [threadId]);

  const [readState, setReadState] = useWorkbenchState<Record<string, boolean>>("inbox-read-state", {});
  const [composeTab, setComposeTab] = useWorkbenchState<Record<string, ComposeTab>>("inbox-compose-tab", {});
  const [replyMode, setReplyMode] = useWorkbenchState<Record<string, ReplyMode>>("inbox-reply-mode", {});
  const [draftByThread, setDraftByThread] = useWorkbenchState<Record<string, string>>("inbox-draft-by-thread", {});
  const [commentByThread, setCommentByThread] = useWorkbenchState<Record<string, string>>("inbox-comment-by-thread", {});
  const [placeholderAccepted, setPlaceholderAccepted] = useWorkbenchState<Record<string, boolean>>("inbox-placeholder-accepted", {});

  const isRead = readState[thread.id] ?? !thread.isUnread;
  const activeComposeTab = composeTab[thread.id] ?? "drafts";
  const activeReplyMode = replyMode[thread.id] ?? "chat";
  const draftValue = draftByThread[thread.id] ?? "";
  const commentValue = commentByThread[thread.id] ?? "";

  const suggestedReply = thread.recommendedReply;
  const currentDraftText = activeComposeTab === "drafts" ? draftValue : commentValue;

  const setCurrentDraftText = (next: string) => {
    if (activeComposeTab === "drafts") {
      setDraftByThread({ ...draftByThread, [thread.id]: next });
      return;
    }
    setCommentByThread({ ...commentByThread, [thread.id]: next });
  };

  const threadInsights = synthesizeThreadInsights(thread);

  return (
    <div className="px-4 py-6 lg:px-8">
      <PageContainer className="space-y-4 pb-28">
        <Surface className="bg-background p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SmallButton onClick={() => navigate("/inbox")}>
              <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to inbox
            </SmallButton>
            <div className="flex items-center gap-2">
              {thread.domainTag ? <StatusPill tone="muted">{thread.domainTag}</StatusPill> : null}
              {thread.intentTag ? <StatusPill tone="default">{thread.intentTag}</StatusPill> : null}
              {thread.branchCount && thread.branchCount > 1 ? (
                <StatusPill tone="muted">{thread.branchCount} branches</StatusPill>
              ) : null}
            </div>
          </div>

          <p className="mt-4 text-xs uppercase tracking-[0.12em] text-muted-foreground">
            {thread.sender} · {thread.source} · {thread.time}
          </p>
          <h1 className="mt-2 text-4xl text-foreground">{thread.subject}</h1>
          <p className="mt-2 text-base text-foreground">{thread.preview}</p>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="border border-border bg-background p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Why this matters</p>
              <p className="mt-2 text-sm text-foreground">{thread.extractedTasks[0] ?? "Requires immediate operator action."}</p>
            </div>
            <div className="border border-border bg-background p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">What changed</p>
              <p className="mt-2 text-sm text-foreground">{thread.provenance[1] ?? thread.provenance[0] ?? "No change signal."}</p>
            </div>
          </div>

          <div className="mt-4 border border-border bg-background p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">UBIK analysis · full thread synthesis</p>
            <div className="mt-2 space-y-1 text-sm text-foreground">
              {threadInsights.map((line) => (
                <p key={line}>- {line}</p>
              ))}
            </div>
          </div>

          <div className="mt-4 border border-border bg-background p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Thread and files</p>
            <div className="mt-2 space-y-2">
              {thread.provenance.map((entry) => (
                <p key={entry} className="text-sm text-muted-foreground">{entry}</p>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {thread.attachments.map((file) => (
                <StatusPill key={file} tone="muted">{file}</StatusPill>
              ))}
            </div>
          </div>
        </Surface>

        <div className="sticky bottom-0 z-30 border border-border bg-background p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex border border-border bg-card p-1">
              <button
                className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
                  activeComposeTab === "drafts" ? "bg-foreground text-background" : "text-foreground"
                }`}
                onClick={() => setComposeTab({ ...composeTab, [thread.id]: "drafts" })}
                type="button"
              >
                Drafts
              </button>
              <button
                className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
                  activeComposeTab === "comments" ? "bg-foreground text-background" : "text-foreground"
                }`}
                onClick={() => setComposeTab({ ...composeTab, [thread.id]: "comments" })}
                type="button"
              >
                Comments
              </button>
            </div>

            <div className="inline-flex border border-border bg-card p-1">
              <button
                className={`px-3 py-1.5 text-xs ${activeReplyMode === "chat" ? "bg-foreground text-background" : "text-foreground"}`}
                onClick={() => setReplyMode({ ...replyMode, [thread.id]: "chat" })}
                type="button"
              >
                <MessageSquare className="mr-1 inline h-3.5 w-3.5" /> Chat-first
              </button>
              <button
                className={`px-3 py-1.5 text-xs ${activeReplyMode === "email" ? "bg-foreground text-background" : "text-foreground"}`}
                onClick={() => setReplyMode({ ...replyMode, [thread.id]: "email" })}
                type="button"
              >
                Email mode
              </button>
            </div>
          </div>

          <div className="mt-3">
            <RichOperatorEditor
              minHeight={150}
              onChange={setCurrentDraftText}
              placeholder={
                activeReplyMode === "chat"
                  ? `Suggestion: ${suggestedReply}`
                  : "Write final outbound response"
              }
              value={currentDraftText}
            />
            {activeReplyMode === "chat" && !placeholderAccepted[thread.id] && !currentDraftText.trim() ? (
              <button
                className="mt-2 inline-flex items-center gap-2 border border-border bg-card px-3 py-2 text-xs text-muted-foreground"
                onClick={() => {
                  setCurrentDraftText(suggestedReply);
                  setPlaceholderAccepted({ ...placeholderAccepted, [thread.id]: true });
                }}
                type="button"
              >
                <Sparkles className="h-3.5 w-3.5" /> Press to accept suggested reply
              </button>
            ) : null}
          </div>

          <Separator className="my-3" />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <SmallButton>Request</SmallButton>
              <SmallButton>Assign</SmallButton>
              <SmallButton>
                <Bot className="mr-2 h-3.5 w-3.5" /> Generate Reply
              </SmallButton>
              <SmallButton onClick={() => setReadState({ ...readState, [thread.id]: true })}>
                {isRead ? "Read" : "Mark as read"}
              </SmallButton>
            </div>
            <SmallButton active>
              <SendHorizontal className="mr-2 h-3.5 w-3.5" /> {activeComposeTab === "comments" ? "Post comment" : "Queue reply"}
            </SmallButton>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

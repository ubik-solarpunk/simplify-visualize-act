import { createElement } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "@/App";
import { inboxThreads, meetings } from "@/lib/ubik-data";

const CHAT_PLACEHOLDER = "How can I help you today?";

describe("Ubik shell", () => {
  it("renders Home as the default operator entry point", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    expect(await screen.findByText("Operator Brief")).toBeInTheDocument();
    expect(screen.getByText("Back at it, Hemanth")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(CHAT_PLACEHOLDER)).not.toBeInTheDocument();
    expect(screen.queryByText("Daily operating brief with widgets, actions, and execution signals.")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Refresh" })).not.toBeInTheDocument();
  });

  it("supports chat modes and source chips on Ubik", async () => {
    window.history.pushState({}, "", "/chat");
    render(createElement(App));

    fireEvent.click(await screen.findByText("Max"));
    fireEvent.click(screen.getByText("Internet"));
    fireEvent.click(screen.getByLabelText("Run prompt"));

    expect(await screen.findByText("Ubik runtime")).toBeInTheDocument();
    expect(screen.getByText("MAX")).toBeInTheDocument();
    expect(screen.getByText("Internet")).toBeInTheDocument();
  });

  it("removes chat topbar controls after removing the global description bar", async () => {
    window.history.pushState({}, "", "/chat?tab=chat-home");
    render(createElement(App));

    expect(await screen.findByPlaceholderText(CHAT_PLACEHOLDER)).toBeInTheDocument();
    expect(screen.queryByText("New Thread")).not.toBeInTheDocument();
    expect(screen.queryByText("Share")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Open temporary chat")).not.toBeInTheDocument();
  });

  it("toggles optional sources from More sources", async () => {
    window.history.pushState({}, "", "/chat");
    render(createElement(App));

    fireEvent.click(await screen.findByText("More sources"));
    fireEvent.click(screen.getByText("Salesforce"));

    expect(screen.getByText("Organization · Salesforce")).toBeInTheDocument();
  });

  it("keeps the fixed workbench row visible after topbar removal", async () => {
    window.history.pushState({}, "", "/chat?tab=chat-home");
    render(createElement(App));

    expect(await screen.findByRole("button", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ubik" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inbox" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Meetings" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByLabelText("Open new tab menu")).toBeInTheDocument();
    expect(screen.queryByLabelText("Contextual Ubik search")).not.toBeInTheDocument();
  });

  it("opens the command palette from Create", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    const createButtons = await screen.findAllByLabelText("Open command palette");
    fireEvent.click(createButtons[0]);

    expect(await screen.findByPlaceholderText("Type a command or search...")).toBeInTheDocument();
    expect(screen.getByText("SUGGESTED")).toBeInTheDocument();
  });

  it("runs approvals fetch into drawer and runtime and navigates to Approvals", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    const createButtons = await screen.findAllByLabelText("Open command palette");
    fireEvent.click(createButtons[0]);
    fireEvent.click(await screen.findByText("Fetch pending approvals from agents"));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/approvals");
    });

    expect(screen.getByText("Pending approvals")).toBeInTheDocument();
    expect(screen.getByText("Approvals fetch")).toBeInTheDocument();
  });

  it("matches Inbox v4.3 action layout and row schedule flow", async () => {
    window.localStorage.clear();
    window.history.pushState({}, "", `/inbox/${inboxThreads[0]?.id ?? ""}`);
    render(createElement(App));

    expect(await screen.findByText("Actions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open approval and assign/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open discuss panel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open this thread in ubik/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mark thread as read/i })).toBeInTheDocument();

    expect(screen.queryByText("Context suggestion")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Set reminder/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Open in Gmail$/i })).not.toBeInTheDocument();

    expect(screen.getAllByText("Mark reviewed").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Watch").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Archive").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Open in Email").length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByLabelText(/Open schedule menu for/i)[0]);
    expect(await screen.findByText("Schedule reminder")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Remind .* tomorrow at 9 AM/i }));
    await waitFor(() => {
      expect(screen.queryByText("Schedule reminder")).not.toBeInTheDocument();
    });
  }, 15000);

  it("keeps the same inbox tab while switching between thread routes", async () => {
    window.localStorage.clear();
    window.history.pushState({}, "", `/inbox/${inboxThreads[0]?.id ?? ""}?tab=inbox-main`);
    render(createElement(App));

    expect(await screen.findByText("Actions")).toBeInTheDocument();

    fireEvent.click(screen.getByText(inboxThreads[1].subject));

    await waitFor(() => {
      expect(window.location.pathname).toBe(`/inbox/${inboxThreads[1].id}`);
      expect(window.location.search).toContain("tab=inbox-main");
    });
  });

  it("removes reviewed threads from the unread filter immediately", async () => {
    window.localStorage.clear();
    window.history.pushState({}, "", `/inbox/${inboxThreads[0]?.id ?? ""}`);
    render(createElement(App));

    const unreadCount = inboxThreads.filter((thread) => thread.isUnread).length;

    fireEvent.click(await screen.findByRole("button", { name: "Unread" }));
    expect(await screen.findByText(`${unreadCount} threads`)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /Mark reviewed for/i })[0]);

    await waitFor(() => {
      expect(screen.getByText(`${unreadCount - 1} threads`)).toBeInTheDocument();
    });
  });

  it("matches Meetings refreshed action rail and transcript behavior without chat tab", async () => {
    window.localStorage.clear();
    window.history.pushState({}, "", `/meetings/${meetings[0]?.id ?? ""}`);
    render(createElement(App));

    expect(await screen.findByText("Actions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open share meeting panel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open add to project panel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open create meeting panel/i })).toBeInTheDocument();
    const meetingChatTab = screen
      .queryAllByRole("button", { name: /^chat$/i })
      .find((button) => button.className.includes("rounded-full"));
    expect(meetingChatTab).toBeUndefined();

    expect(screen.getByText("Why this matters")).toBeInTheDocument();
    expect(screen.getByText("What changed")).toBeInTheDocument();
    expect(screen.getByText("What is blocked")).toBeInTheDocument();
    expect(screen.getByText("Recommended next step")).toBeInTheDocument();
    expect(screen.getByLabelText("Meetings bottom chat input")).toBeInTheDocument();
    expect(screen.getByLabelText("Meeting bottom chat folder")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Join now and start recording/i })).toBeInTheDocument();
    expect(screen.queryByText("All recipes")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Ask anything... use @ to mention tabs, skills, agents")).not.toBeInTheDocument();

    expect(screen.queryByText(/Decision:/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /transcript/i }));
    fireEvent.click(screen.getByRole("button", { name: /Show/i }));
    expect(await screen.findByText(/Decision:/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Open share meeting panel/i }));
    expect(await screen.findByText("App targets")).toBeInTheDocument();
    expect(screen.queryByLabelText("Also add to task")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Close share meeting panel/i }));

    const attendeeSection = screen.getByText("Attendees").closest("section");
    expect(attendeeSection).toBeTruthy();
    expect(within(attendeeSection as HTMLElement).getByText("Raj Mehta")).toBeInTheDocument();
    expect(within(attendeeSection as HTMLElement).getAllByText("Profile").length).toBeGreaterThan(0);
    expect(within(attendeeSection as HTMLElement).getAllByText("Email").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /Open create meeting panel/i }));
    expect(await screen.findByText("Create meeting request")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "9:30 - 10:00 AM" }));
    fireEvent.click(screen.getByRole("button", { name: /Send request/i }));
    expect(await screen.findByText(/Calendar preview:/i)).toBeInTheDocument();
  }, 15000);

  it("renders distinct meetings calendar modes on landing", async () => {
    window.localStorage.clear();
    window.history.pushState({}, "", "/meetings");
    render(createElement(App));

    expect(await screen.findByLabelText("Search meetings")).toBeInTheDocument();
    expect(await screen.findByText("Schedule landing")).toBeInTheDocument();
    expect(screen.getByText("Week agenda")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create new meeting draft/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Join now and start recording/i })).toBeInTheDocument();
    expect(screen.queryByLabelText("Create folder label")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Meetings bottom chat input")).toBeInTheDocument();
    expect(screen.getByLabelText("Meeting bottom chat folder")).toBeInTheDocument();
    expect(screen.queryByText("All recipes")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^day$/i }));
    expect(await screen.findByText("Day agenda")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^month$/i }));
    expect(await screen.findByText("Month buckets")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Create new meeting draft/i }));
    await waitFor(() => {
      expect(window.location.pathname).toBe("/meetings/new");
    });
    expect(screen.getByText("New meeting note")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Join now and start recording/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Join now and start recording/i }));
    expect(await screen.findByText("Untitled meeting")).toBeInTheDocument();
  }, 15000);
});

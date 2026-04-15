import { createElement } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "@/App";
import { inboxThreads } from "@/lib/ubik-data";

describe("Ubik shell", () => {
  it("keeps chat as the default route", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    expect(await screen.findByText("Start with a question or a task")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Start with an operator task, a thread to continue, or a decision that needs context."),
    ).toBeInTheDocument();
  });

  it("renders Home on /home", async () => {
    window.history.pushState({}, "", "/home");
    render(createElement(App));

    expect(await screen.findByText("Operator Brief")).toBeInTheDocument();
    expect(screen.getByText("Back at it, Hemanth")).toBeInTheDocument();
    expect(screen.getByText("Activity Feed")).toBeInTheDocument();
  });

  it("opens chat from Home using the root route", async () => {
    window.history.pushState({}, "", "/home");
    render(createElement(App));

    fireEvent.click(await screen.findByRole("button", { name: "New" }));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
      expect(window.location.search).not.toBe("");
    });
  });

  it("renders Inbox detail on /inbox/:threadId", async () => {
    window.history.pushState({}, "", `/inbox/${inboxThreads[0]?.id ?? ""}`);
    render(createElement(App));

    expect(await screen.findByText("Actions")).toBeInTheDocument();
    expect(screen.getAllByText(inboxThreads[0]?.subject ?? "").length).toBeGreaterThan(0);
  });

  it("keeps the same Inbox tab when switching threads", async () => {
    window.history.pushState({}, "", `/inbox/${inboxThreads[0]?.id ?? ""}?tab=inbox-main`);
    render(createElement(App));

    expect(await screen.findByText("Actions")).toBeInTheDocument();
    fireEvent.click(screen.getAllByText(inboxThreads[1]?.subject ?? "")[0]);

    await waitFor(() => {
      expect(window.location.pathname).toBe(`/inbox/${inboxThreads[1]?.id}`);
      expect(window.location.search).toContain("tab=inbox-main");
    });
  });

  it("still supports the chat share dialog from the root route", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    fireEvent.click(await screen.findByText("Share"));

    expect(await screen.findByRole("heading", { name: "Share" })).toBeInTheDocument();
    expect(screen.getByText("Only me")).toBeInTheDocument();
  });
});

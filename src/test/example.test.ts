import { createElement } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "@/App";

describe("Ubik shell", () => {
  it("renders the Chat home as the default operator entry point", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    expect(await screen.findByText("Start with a question or a task")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Start with an operator task, a thread to continue, or a decision that needs context.")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Search threads, notes, approvals")).not.toBeInTheDocument();
    expect(screen.queryByText("Recent Work")).not.toBeInTheDocument();
  });

  it("preserves Chat composer state when switching tabs", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    const composer = await screen.findByPlaceholderText(
      "Start with an operator task, a thread to continue, or a decision that needs context.",
    );

    fireEvent.change(composer, {
      target: { value: "Prepare the operator note for the Thai Union review." },
    });

    fireEvent.click(screen.getAllByText("Inbox")[0]);

    await waitFor(() => {
      expect(screen.getByText("Inbox keeps inbound work readable and actionable.")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText("Know Anything")[0]);

    await waitFor(() => {
      expect(
        screen.getByDisplayValue("Prepare the operator note for the Thai Union review."),
      ).toBeInTheDocument();
    });
  });

  it("supports chat modes and source chips on Know Anything", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    fireEvent.click(await screen.findByText("Max"));
    fireEvent.click(screen.getByText("Internet"));

    fireEvent.click(screen.getByLabelText("Run prompt"));

    expect(await screen.findByText("Know Anything runtime")).toBeInTheDocument();
    expect(screen.getByText("MAX")).toBeInTheDocument();
    expect(screen.getByText("Internet")).toBeInTheDocument();
  });

  it("reuses the base Know Anything tab when New Thread is clicked on a pristine chat", async () => {
    window.history.pushState({}, "", "/?tab=chat-home");
    render(createElement(App));

    fireEvent.click(await screen.findByText("New Thread"));

    const composer = await screen.findByPlaceholderText(
      "Start with an operator task, a thread to continue, or a decision that needs context.",
    );

    expect(composer).toHaveValue("");
    expect(window.location.search).toContain("tab=chat-home");
  });

  it("creates a fresh Know Anything tab when New Thread is clicked after work starts", async () => {
    window.history.pushState({}, "", "/?tab=chat-home");
    render(createElement(App));

    const composer = await screen.findByPlaceholderText(
      "Start with an operator task, a thread to continue, or a decision that needs context.",
    );

    fireEvent.change(composer, {
      target: { value: "Draft a shipment delay response." },
    });

    fireEvent.click(await screen.findByText("New Thread"));

    await waitFor(() => {
      expect(window.location.search).not.toContain("tab=chat-home");
    });

    expect(
      screen.getByPlaceholderText("Start with an operator task, a thread to continue, or a decision that needs context."),
    ).toHaveValue("");
  });

  it("adds connector context from the composer toolbar", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    fireEvent.click(await screen.findByLabelText("Open context menu"));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Salesforce" }));

    expect(await screen.findByText("Salesforce")).toBeInTheDocument();
  });

  it("opens the share dialog from Know Anything", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    fireEvent.click(await screen.findByText("Share"));

    expect(await screen.findByRole("heading", { name: "Share" })).toBeInTheDocument();
    expect(screen.getByText("Only me")).toBeInTheDocument();
    expect(screen.getByText("Team access")).toBeInTheDocument();
    expect(screen.getByText("Public access")).toBeInTheDocument();
    expect(screen.getByText("Copy link")).toBeInTheDocument();
  });

  it("opens a fresh temporary chat from the composer icon", async () => {
    window.history.pushState({}, "", "/?tab=chat-home");
    render(createElement(App));

    const composer = await screen.findByPlaceholderText(
      "Start with an operator task, a thread to continue, or a decision that needs context.",
    );

    fireEvent.change(composer, {
      target: { value: "Review the latest approvals queue." },
    });

    fireEvent.click(screen.getByLabelText("Open temporary chat"));

    await waitFor(() => {
      expect(window.location.search).not.toContain("tab=chat-home");
    });

    expect(
      screen.getByPlaceholderText("Start with an operator task, a thread to continue, or a decision that needs context."),
    ).toHaveValue("");
    expect(screen.getByText("Temp Chat")).toBeInTheDocument();
  });

  it("limits the workbench to 8 tabs", async () => {
    window.history.pushState({}, "", "/?tab=chat-home");
    render(createElement(App));

    for (let index = 0; index < 4; index += 1) {
      fireEvent.click(screen.getByLabelText("Open temporary chat"));
      await waitFor(() => {
        expect(screen.getAllByText("Temp Chat").length).toBe(index + 1);
      });
    }

    fireEvent.click(screen.getByLabelText("Open temporary chat"));
    fireEvent.click(await screen.findByText("New Thread"));

    await waitFor(() => {
      expect(screen.getByText("Tab limit reached")).toBeInTheDocument();
    });

    expect(screen.getAllByRole("button", { name: /Close / }).length).toBe(7);
  });

  it("opens the command palette from Create", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    const createButtons = await screen.findAllByLabelText("Open command palette");
    fireEvent.click(createButtons[0]);

    expect(await screen.findByPlaceholderText("Type a command or search...")).toBeInTheDocument();
    expect(screen.getByText("SUGGESTED")).toBeInTheDocument();
  });

  it("runs Summarize priorities into a new Know Anything tab", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    const createButtons = await screen.findAllByLabelText("Open command palette");
    fireEvent.click(createButtons[0]);

    fireEvent.click(await screen.findByText("Summarize today's priorities"));

    const composer = await screen.findByPlaceholderText(
      "Start with an operator task, a thread to continue, or a decision that needs context.",
    );

    await waitFor(() => {
      expect(composer).toHaveValue(
        "Summarize today's priorities using Inbox, Approvals, and Meetings. Output top 5 priorities with next action, owner, and ETA.",
      );
    });
  });

  it("runs approvals fetch into drawer and runtime and navigates to Approvals", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    const createButtons = await screen.findAllByLabelText("Open command palette");
    fireEvent.click(createButtons[0]);

    fireEvent.click(await screen.findByText("Fetch pending approvals from agents"));

    await waitFor(() => {
      expect(
        screen.getByText("Approvals keep recommendations direct, auditable, and easy to inspect."),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Pending approvals")).toBeInTheDocument();
    expect(screen.getByText("Approvals fetch")).toBeInTheDocument();
  });
});

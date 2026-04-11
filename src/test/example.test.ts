import { createElement } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "@/App";

describe("Ubik shell", () => {
  it("renders the Chat home as the default operator entry point", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    expect(await screen.findByText("Start with a question or a task.")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Start with an operator task, a thread to continue, or a decision that needs context.")).toBeInTheDocument();
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
});

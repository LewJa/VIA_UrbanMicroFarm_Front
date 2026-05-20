import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useOutletContext } from "react-router";
import Predictions from "../predictions";
import type { PlantContext } from "../../plant-layout";

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return { ...actual, useOutletContext: vi.fn() };
});

vi.mock("../PredictionsChart", () => ({
  default: ({ plantId, plantName }: { plantId: number; plantName?: string }) => (
    <div
      data-testid="predictions-chart"
      data-plant-id={String(plantId)}
      data-plant-name={plantName ?? ""}
    />
  ),
}));

const mockUseOutletContext = vi.mocked(useOutletContext<PlantContext>);

const mockPlant = {
  id: 7,
  sensorId: 101,
  name: "Basil",
  type: "Herb",
  description: "Sweet basil",
  datePlanted: "2024-03-01",
  status: "Healthy" as const,
};

describe("Predictions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows loading indicator when plant data is still loading", () => {
    mockUseOutletContext.mockReturnValue({ plant: null, plantLoading: true, plantError: null });
    render(<Predictions />);
    expect(screen.getByLabelText("Loading plant data")).toHaveAttribute("aria-busy", "true");
  });

  it("shows error alert when plant data failed to load", () => {
    mockUseOutletContext.mockReturnValue({
      plant: null,
      plantLoading: false,
      plantError: "Failed to load plant data.",
    });
    render(<Predictions />);
    expect(screen.getByRole("alert")).toHaveTextContent("Failed to load plant data.");
  });

  it("renders PredictionsChart with the plant id and name when plant is available", () => {
    mockUseOutletContext.mockReturnValue({ plant: mockPlant, plantLoading: false, plantError: null });
    render(<Predictions />);
    const chart = screen.getByTestId("predictions-chart");
    expect(chart).toBeInTheDocument();
    expect(chart).toHaveAttribute("data-plant-id", "7");
    expect(chart).toHaveAttribute("data-plant-name", "Basil");
  });

  it("renders nothing when plant is null and not loading", () => {
    mockUseOutletContext.mockReturnValue({ plant: null, plantLoading: false, plantError: null });
    const { container } = render(<Predictions />);
    expect(container).toBeEmptyDOMElement();
  });
});

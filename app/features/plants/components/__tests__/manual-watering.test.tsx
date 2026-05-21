/* @vitest-environment jsdom */

import {
  describe,
  it,
  expect,
  vi,
} from "vitest";

import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

vi.mock("react-router", () => ({
  useParams: () => ({
    plantId: "1",
    setupId: "1",
  }),
}));

import ManualWatering
  from "../manual-watering";

import { wateringService }
  from "../../../../services/wateringService";

vi.spyOn(
  wateringService,
  "triggerManualWatering"
);

vi.spyOn(
  wateringService,
  "getLastWateringEvent"
);

describe(
  "Manual Watering Integration Test",
  () => {

    it(
      "trigger manual watering → verify watering event logged → verify UI updates",
      async () => {

        (
          wateringService
            .triggerManualWatering as any
        ).mockResolvedValue({
          message:
            "Watering triggered successfully",
        });

        (
          wateringService
            .getLastWateringEvent as any
        ).mockResolvedValue({
          eventId: 1,
          mode: "Manual",
        });

        render(<ManualWatering />);

        const button =
          screen.getByText(
            "Water Plant"
          );

        await userEvent.click(button);

        await waitFor(() => {

          expect(
            screen.getByText(
              "Watering triggered successfully"
            )
          ).toBeInTheDocument();

          expect(
            screen.getByText(
              "Watering Event Logged"
            )
          ).toBeInTheDocument();

          expect(
            screen.getByText(
              "Mode: Manual"
            )
          ).toBeInTheDocument();

        });

      }
    );
  }
);
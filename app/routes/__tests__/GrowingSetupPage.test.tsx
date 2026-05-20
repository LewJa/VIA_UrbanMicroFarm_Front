// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import { describe, it, expect, vi, beforeEach } from "vitest";
// import { MemoryRouter, Routes, Route } from "react-router";
// import GrowingSetupPage from "../growing-setup";
// import { growingSetupsService } from "~/services/growingSetupsService";
// import { getPlantsBySetup } from "~/services/plantsService";
//
// vi.mock("~/services/growingSetupsService", () => ({
//   growingSetupsService: {
//     getSetupSensorReadings: vi.fn(),
//     fetchAllAssignedSensors: vi.fn(),
//     getSetupById: vi.fn(),
//   },
// }));
//
// vi.mock("~/services/plantsService", () => ({
//   getPlantsBySetup: vi.fn(),
// }));
//
// vi.mock("~/components/plant/add-plant-popup/add-plant-popup", () => ({
//   AddPlantModal: ({ isOpen }: { isOpen: boolean }) =>
//     isOpen ? <div data-testid="add-plant-modal" /> : null,
// }));
//
// const mockGetSetupSensorReadings = vi.mocked(growingSetupsService.getSetupSensorReadings);
// const mockFetchAllAssignedSensors = vi.mocked(growingSetupsService.fetchAllAssignedSensors);
// const mockGetSetupById = vi.mocked(growingSetupsService.getSetupById);
// const mockGetPlantsBySetup = vi.mocked(getPlantsBySetup);
//
// const mockReading = {
//   setupId: 1,
//   timestamp: "2024-01-01T12:00:00.000Z",
//   temperature: 22,
//   humidity: 64,
//   light: 512,
// };
//
// const mockSensors = [
//   { id: 101, status: "Active" },
//   { id: 102, status: "Inactive" },
// ];
//
// const mockPlants = [
//   {
//     id: 1,
//     sensorId: 101,
//     name: "Basil",
//     type: "Herb",
//     datePlanted: "2024-01-01",
//     status: "Healthy",
//     description: "Sweet basil",
//   },
//   {
//     id: 2,
//     sensorId: 102,
//     name: "Tomato",
//     type: "Vegetable",
//     datePlanted: "2024-02-01",
//     status: "Needs Water",
//     description: "Cherry tomato",
//   },
// ];
//
// const mockSetup = { id: 1, location: "Greenhouse", status: "Active" };
//
// function renderPage(setupId = "1", navState?: { location?: string; status?: string }) {
//   return render(
//     <MemoryRouter
//       initialEntries={[{ pathname: `/setup/${setupId}`, state: navState ?? null }]}
//     >
//       <Routes>
//         <Route path="/setup/:setupId" element={<GrowingSetupPage />} />
//         <Route
//           path="/setup/:setupId/sensor/:sensorId/plant/:plantId"
//           element={<div>Plant page</div>}
//         />
//       </Routes>
//     </MemoryRouter>
//   );
// }
//
// describe("GrowingSetupPage", () => {
//   beforeEach(() => {
//     vi.clearAllMocks();
//     mockGetSetupSensorReadings.mockResolvedValue(mockReading);
//     mockFetchAllAssignedSensors.mockResolvedValue(mockSensors);
//     mockGetPlantsBySetup.mockResolvedValue(mockPlants);
//     mockGetSetupById.mockResolvedValue(mockSetup);
//   });
//
//   // ── Loading ───────────────────────────────────────────────────────────────
//
//   it("shows loading indicator on mount before fetches resolve", () => {
//     mockGetSetupSensorReadings.mockImplementation(() => new Promise(() => {}));
//     renderPage("1", { location: "Balcony", status: "Active" });
//     expect(screen.getByLabelText("Loading growing setup")).toHaveAttribute("aria-busy", "true");
//   });
//
//   // ── Navigation state vs cold load ─────────────────────────────────────────
//
//   it("renders setup location from navigation state without calling getSetupById", async () => {
//     renderPage("1", { location: "Balcony", status: "Active" });
//     await waitFor(() => expect(screen.getByRole("heading", { name: "Balcony" })).toBeInTheDocument());
//     expect(mockGetSetupById).not.toHaveBeenCalled();
//   });
//
//   it("calls getSetupById as fallback when no navigation state and renders its location", async () => {
//     renderPage("1");
//     await waitFor(() => expect(screen.getByRole("heading", { name: "Greenhouse" })).toBeInTheDocument());
//     expect(mockGetSetupById).toHaveBeenCalledWith(1, 1);
//   });
//
//   // ── Readings ──────────────────────────────────────────────────────────────
//
//   it("renders temperature with °C unit", async () => {
//     renderPage("1", { location: "Balcony" });
//     await waitFor(() => expect(screen.getByText("22 °C")).toBeInTheDocument());
//   });
//
//   it("renders humidity with % unit", async () => {
//     renderPage("1", { location: "Balcony" });
//     await waitFor(() => expect(screen.getByText("64 %")).toBeInTheDocument());
//   });
//
//   it("renders light as raw ADC value over 1023, not as a percentage", async () => {
//     renderPage("1", { location: "Balcony" });
//     await waitFor(() => expect(screen.getByText("512 / 1023")).toBeInTheDocument());
//     expect(screen.queryByText("50%")).not.toBeInTheDocument();
//   });
//
//   it("renders 'No readings available' when getSetupSensorReadings resolves null", async () => {
//     mockGetSetupSensorReadings.mockResolvedValue(null as never);
//     renderPage("1", { location: "Balcony" });
//     await waitFor(() =>
//       expect(screen.getByText("No readings available.")).toBeInTheDocument()
//     );
//   });
//
//   // ── Sensors ───────────────────────────────────────────────────────────────
//
//   it("renders sensor id and status for each sensor", async () => {
//     renderPage("1", { location: "Balcony" });
//     await waitFor(() => expect(screen.getByText("#101")).toBeInTheDocument());
//     expect(screen.getByText("Inactive")).toBeInTheDocument();
//   });
//
//   it("renders 'No sensors assigned' when sensor list is empty", async () => {
//     mockFetchAllAssignedSensors.mockResolvedValue([]);
//     renderPage("1", { location: "Balcony" });
//     await waitFor(() =>
//       expect(screen.getByText("No sensors assigned.")).toBeInTheDocument()
//     );
//   });
//
//   // ── Plants ────────────────────────────────────────────────────────────────
//
//   it("renders plant name, type, and datePlanted for each plant", async () => {
//     renderPage("1", { location: "Balcony" });
//     await waitFor(() => expect(screen.getByText("Basil")).toBeInTheDocument());
//     expect(screen.getByText("Herb · Planted 2024-01-01")).toBeInTheDocument();
//   });
//
//   it("renders plant status badge", async () => {
//     renderPage("1", { location: "Balcony" });
//     await waitFor(() => expect(screen.getByText("Needs Water")).toBeInTheDocument());
//   });
//
//   it("each plant row is a link to the correct plant detail URL", async () => {
//     renderPage("1", { location: "Balcony" });
//     await waitFor(() => expect(screen.getByRole("link", { name: /Basil/ })).toBeInTheDocument());
//     expect(screen.getByRole("link", { name: /Basil/ })).toHaveAttribute(
//       "href",
//       "/setup/1/sensor/101/plant/1"
//     );
//     expect(screen.getByRole("link", { name: /Tomato/ })).toHaveAttribute(
//       "href",
//       "/setup/1/sensor/102/plant/2"
//     );
//   });
//
//   it("renders 'No plants yet' when plant list is empty", async () => {
//     mockGetPlantsBySetup.mockResolvedValue([]);
//     renderPage("1", { location: "Balcony" });
//     await waitFor(() =>
//       expect(screen.getByText("No plants yet. Add one to get started.")).toBeInTheDocument()
//     );
//   });
//
//   // ── Error states ──────────────────────────────────────────────────────────
//
//   it("shows permission error message when fetch rejects with 401", async () => {
//     mockGetSetupSensorReadings.mockRejectedValue({ response: { status: 401 } });
//     renderPage("1", { location: "Balcony" });
//     await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
//     expect(
//       screen.getByText("You don't have permission to view this growing setup.")
//     ).toBeInTheDocument();
//   });
//
//   it("shows permission error message when fetch rejects with 403", async () => {
//     mockGetSetupSensorReadings.mockRejectedValue({ response: { status: 403 } });
//     renderPage("1", { location: "Balcony" });
//     await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
//     expect(
//       screen.getByText("You don't have permission to view this growing setup.")
//     ).toBeInTheDocument();
//   });
//
//   it("shows structured error message from API response", async () => {
//     mockGetSetupSensorReadings.mockRejectedValue({
//       response: { status: 500, data: { error: { message: "Sensor offline" } } },
//     });
//     renderPage("1", { location: "Balcony" });
//     await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
//     expect(screen.getByText("Sensor offline")).toBeInTheDocument();
//   });
//
//   it("shows fallback error message when rejection has no structured error body", async () => {
//     mockGetSetupSensorReadings.mockRejectedValue(new Error("Network Error"));
//     renderPage("1", { location: "Balcony" });
//     await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
//     expect(screen.getByText("Failed to load setup data.")).toBeInTheDocument();
//   });
//
//   it("any single Promise.all leg rejecting shows error state, not a partial render", async () => {
//     mockGetPlantsBySetup.mockRejectedValue(new Error("plants fetch failed"));
//     renderPage("1", { location: "Balcony" });
//     await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
//     expect(screen.queryByRole("list")).not.toBeInTheDocument();
//   });
//
//   // ── Retry ─────────────────────────────────────────────────────────────────
//
//   it("retry button re-triggers all fetches and shows success on second attempt", async () => {
//     mockGetSetupSensorReadings
//       .mockRejectedValueOnce(new Error("Network Error"))
//       .mockResolvedValue(mockReading);
//     renderPage("1", { location: "Balcony" });
//     await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
//
//     fireEvent.click(screen.getByRole("button", { name: "Retry" }));
//
//     await waitFor(() => expect(screen.getByText("22 °C")).toBeInTheDocument());
//     expect(mockGetSetupSensorReadings).toHaveBeenCalledTimes(2);
//   });
//
//   // ── Add Plant modal ───────────────────────────────────────────────────────
//
//   it("opens AddPlantModal when 'Add Plant' is clicked", async () => {
//     renderPage("1", { location: "Balcony" });
//     await waitFor(() => expect(screen.getByRole("button", { name: "Add Plant" })).toBeInTheDocument());
//     fireEvent.click(screen.getByRole("button", { name: "Add Plant" }));
//     expect(screen.getByTestId("add-plant-modal")).toBeInTheDocument();
//   });
// });

import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("setup/:setupId/plant/:plantId", "routes/plant.tsx", [
    index("features/plants/components/basic-data.tsx", {
      id: "plant-basic-data-index",
    }),
    route("basic-data", "features/plants/components/basic-data.tsx"),
    route("predictions", "features/plants/components/predictions.tsx"),
    route("historical-data", "features/plants/components/historical-data.tsx"),
  ]),
] satisfies RouteConfig;

import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  layout("components/AppLayout.tsx", [
    index("routes/home.tsx"),
    route("account", "routes/account.tsx"),
    route("setup/:setupId", "routes/growing-setup.tsx"),
    route("setup/:setupId/sensor/:sensorId/plant/:plantId", "routes/plant.tsx", [
      index("components/plant/plant-subpages/basic-data/basic-data.tsx", {
        id: "plant-basic-data-index",
      }),
      route("basic-data", "components/plant/plant-subpages/basic-data/basic-data.tsx"),
      route("predictions", "components/plant/plant-subpages/predictions/predictions.tsx"),
      route("historical-data", "components/plant/plant-subpages/historical-data/historical-data.tsx"),
    ]),
  ]),
] satisfies RouteConfig;

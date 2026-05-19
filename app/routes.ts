import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

export default [

  index("routes/home.tsx"),

  route(
    "setup/:setupId/sensor/:sensorId/plant/:plantId",
    "routes/plant.tsx"
  ),

] satisfies RouteConfig;
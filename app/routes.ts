import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

export default [

  index("routes/home.tsx"),

  route(
    "setup/:setupId/sensor/:sensorId/plant/:plantId",
    "routes/plant.tsx",
    [

      index(
        "features/plants/components/basic-data.tsx",
        {
          id: "plant-basic-data-index",
        }
      ),

      route(
        "basic-data",
        "features/plants/components/basic-data.tsx"
      ),

    ]
  ),

] satisfies RouteConfig;
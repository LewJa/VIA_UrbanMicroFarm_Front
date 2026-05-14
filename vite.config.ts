import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: process.env.VITEST
    ? [tailwindcss()]
    : [tailwindcss(), reactRouter()],

  resolve: {
    tsconfigPaths: true,
  },

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./app/setupTests.ts",

    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
});
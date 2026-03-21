import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@market-design-engine/foundation-layer": path.resolve(
        __dirname,
        "foundation-layer/dist/src/index.js"
      ),
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/photos": {
        target: "https://picsum.photos",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/photos/, "/v2/list"),
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    restoreMocks: true,
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    port: 8080,
    proxy: {
      "/api/packages": "http://localhost:8081",
    },
  },
  plugins: [react()],
});

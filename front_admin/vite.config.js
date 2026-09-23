import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.VITE_ADMIN_BASE ?? "/",
  build: { sourcemap: true }
});

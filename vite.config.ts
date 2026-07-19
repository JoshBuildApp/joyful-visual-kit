import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { galleryAdmin } from "./scripts/gallery-admin-plugin.mjs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  // galleryAdmin backs /gallery?curate (upload / save / remote-delete) —
  // dev server only, never part of the production build.
  plugins: [react(), mode === "development" && componentTagger(), galleryAdmin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  outDir: "./astroDist",
  publicDir: "./src/data",
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
});

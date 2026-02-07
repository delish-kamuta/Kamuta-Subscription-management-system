import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    allowedHosts: ["delish-kamuta.com", "www.delish-kamuta.com"],
    host: true,
    port: 3000,
    watch: {
      usePolling: true,
    },
  },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
});

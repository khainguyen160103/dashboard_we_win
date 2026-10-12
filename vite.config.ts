import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  server: {
    proxy: {
      // Proxy /kalodata-api/* → https://www.kalodata.com/* để bypass CORS khi dev
      "/kalodata-api": {
        target: "https://www.kalodata.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kalodata-api/, ""),
        secure: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});

import { defineConfig, PluginOption } from "vite";
import { enterDevPlugin, enterProdPlugin } from "vite-plugin-enter-dev";
import path from "path";
import fs from "fs";

function copyIndexTo404(): PluginOption {
  return {
    name: "copy-index-to-404",
    closeBundle() {
      const dist = path.resolve(__dirname, "dist");
      if (fs.existsSync(path.join(dist, "index.html"))) {
        fs.copyFileSync(
          path.join(dist, "index.html"),
          path.join(dist, "404.html")
        );
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const plugins = [...enterProdPlugin()];
  if (mode === "development") {
    plugins.push(...enterDevPlugin());
  }

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/zen": {
          target: "https://opencode.ai",
          changeOrigin: true,
        },
        "/a1111": {
          target: "http://127.0.0.1:7860",
          changeOrigin: false,
          rewrite: (p) => p.replace(/^\/a1111/, ""),
          configure: (proxy) => {
            proxy.on("error", (err) => console.error("[a1111 proxy err]", err));
          },
        },
      },
    },
    plugins: [...plugins.filter(Boolean), copyIndexTo404()] as PluginOption[],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: process.env.BASE_URL || "/",
    build: {
      outDir: "dist",
    },
  };
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function ttsProxyPlugin() {
  return {
    name: "tts-proxy-plugin",
    configureServer(server) {
      server.middlewares.use("/api/tts", async (req, res) => {
        try {
          const parsedUrl = new URL(req.url, "http://localhost:5173");
          const text = parsedUrl.searchParams.get("text") || "";
          const lang = parsedUrl.searchParams.get("lang") || "en-US";

          if (!text) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Text parameter is required" }));
            return;
          }

          const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
            lang
          )}&client=tw-ob&q=${encodeURIComponent(text)}`;

          const upstream = await fetch(googleTtsUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
              Referer: "https://translate.google.com/",
              Accept: "*/*",
            },
          });

          if (!upstream.ok) {
            res.statusCode = upstream.status;
            res.end("Upstream error from TTS provider");
            return;
          }

          res.setHeader("Content-Type", "audio/mpeg");
          res.setHeader("Cache-Control", "public, max-age=86400");
          const arrayBuffer = await upstream.arrayBuffer();
          res.end(Buffer.from(arrayBuffer));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), ttsProxyPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});


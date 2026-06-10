import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const https =
    mode === "https"
      ? {
          key: readFileSync(fileURLToPath(new URL("./cert/server.key", import.meta.url))),
          cert: readFileSync(fileURLToPath(new URL("./cert/server.crt", import.meta.url))),
        }
      : undefined;
  const plugins = [
    tailwindcss(),
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: false,
    }),
    Components({
      resolvers: [NaiveUiResolver()],
    }),
  ];
  return {
    plugins,
    root: "src",
    base: "/deepseek-chat/",
    publicDir: "public",
    build: {
      outDir: "../dist",
      sourcemap: false,
    },
    server: {
      host: true,
      https,
      port: 3010,
      proxy: {
        "/speech-api": {
          target: "https://tts.lideyong.fun",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/speech-api/, ""),
        },
        "/tts-ws": {
          target: "wss://tts.lideyong.fun",
          changeOrigin: true,
          secure: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/tts-ws/, ""),
        },
      },
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          silenceDeprecations: ["legacy-js-api"],
        },
      },
    },
  };
});

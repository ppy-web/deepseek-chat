import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import legacy from "@vitejs/plugin-legacy";
import topLevelAwait from "vite-plugin-top-level-await";
import AutoImport from "unplugin-auto-import/vite";

export default defineConfig(({ mode }) => {
  const plugins = [
    legacy({
      targets: ["chrome 52", "android 4.4"],
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
    }),
    topLevelAwait(),
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ];
  return {
    plugins,
    root: "src",
    base: "./",
    publicDir: "public",
    server: {
      host: true,
      port: 8090,
      proxy: {
        // "/apis": {
        //   target: "https://",
        //   changeOrigin: true,
        //   rewrite: (path) => path.replace(/^\/apis/, ""),
        // },
      },
    },
    build: {
      outDir: resolve(__dirname, "dist"),
      sourcemap: false,
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
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

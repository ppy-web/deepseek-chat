import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const plugins = [
    tailwindcss(),
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: false,
    }),
    Components({
      resolvers: [NaiveUiResolver(), IconsResolver({ prefix: 'i' })],
    }),
    Icons({
      autoInstall: true,
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
      port: 3010,
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

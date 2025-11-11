import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";

import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { resolve } from "path";
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import legacy from "@vitejs/plugin-legacy";
import topLevelAwait from "vite-plugin-top-level-await";


export default defineConfig(({ mode }) => {
  const plugins = [
    legacy({
      targets: ["chrome 52", "android 4.4"],
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
    }),
    topLevelAwait(),
    vue(),
    // 自动导入 API（ref、reactive 等）
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: false, // 如果不用 TS 可以关掉声明文件
      resolvers: [ElementPlusResolver()],
    }),
    // 自动导入组件
    Components({
      resolvers: [ElementPlusResolver(), IconsResolver({ prefix: 'i' })],
    }),
    Icons({
      autoInstall: true, // 没装过的图标包自动帮你安装
    }),
  ];
  return {
    plugins,
    root: "src",
    base: "/deepseek-chat/",
    publicDir: "public",
    build: {
      outDir: resolve(__dirname, "dist"),
      sourcemap: false,
    },
    server: {
      host: true,
      port: 3010,
      // open: true,
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

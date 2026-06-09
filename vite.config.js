import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
export default defineConfig(({ mode }) => {
    const plugins = [
        tailwindcss(),
        vue(),
        AutoImport({
            imports: ['vue', 'vue-router', 'pinia'],
            dts: false,
        }),
        Components({
            resolvers: [IconsResolver({ prefix: 'i' })],
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
            outDir: resolve(__dirname, "dist"),
            sourcemap: false,
        },
        server: {
            host: true,
            port: 3010,
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

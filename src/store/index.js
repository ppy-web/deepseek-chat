import { createPinia } from "pinia";
// import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import useAppStore from "./app";
import useChatStore from "./chat";
import useHistoryStore from "./history";
import useCallwordStore from "./callword";


const pinia = createPinia();
// pinia.use(piniaPluginPersistedstate);
export { useAppStore, useChatStore, useHistoryStore, useCallwordStore };
export default pinia;
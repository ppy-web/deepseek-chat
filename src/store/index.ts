import { createPinia } from "pinia";

import useAppStore from "./app";
import useChatStore from "./chat";
import useHistoryStore from "./history";
import useCallwordStore from "./callword";

const pinia = createPinia();

export { useAppStore, useChatStore, useHistoryStore, useCallwordStore };
export default pinia;

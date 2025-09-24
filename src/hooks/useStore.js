import { useAppStore } from "@/store/app";
import { useConfigStore } from "@/store/config";
import { useUserStore } from "@/store/user";

export function useStore() {
  const app = useAppStore();
  const user = useUserStore();
  const config = useConfigStore();
  return {
    app,
    user,
    config,
  };
}

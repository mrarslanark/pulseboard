import { api } from "@/lib/api";
import { socketManager } from "@/lib/SocketManager";
import { useAuthStore } from "@/store/auth.store";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      socketManager.disconnect();
      clearAuth();
      router.replace("/login");
    },
    onError: () => {
      socketManager.disconnect();
      clearAuth();
      router.replace("/login");
    },
  });
}

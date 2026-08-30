import { ApiError } from "@/src/api/errors";
import { QueryClient, focusManager } from "@tanstack/react-query";
import { AppState, Platform } from "react-native";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.kind !== "network") {
          return false;
        }
        return failureCount < 1;
      },
      staleTime: 30_000,
    },
    mutations: {
      retry: 0,
    },
  },
});

let appStateBound = false;

/** Native windows do not emit document focus; map AppState into Query instead. */
export function bindQueryAppState(): void {
  if (appStateBound || Platform.OS === "web") {
    return;
  }
  appStateBound = true;
  AppState.addEventListener("change", (status) => {
    focusManager.setFocused(status === "active");
  });
}

export const queryKeys = {
  all: ["lemonade"] as const,
  beverages: () => [...queryKeys.all, "beverages"] as const,
};

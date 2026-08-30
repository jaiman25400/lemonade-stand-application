import Constants from "expo-constants";
import { Platform } from "react-native";

const API_PORT = 3000;
const API_PREFIX = "api";

function hostFromHostUri(hostUri: string | undefined): string {
  if (!hostUri) {
    return "localhost";
  }

  const withoutProtocol = hostUri.replace(/^https?:\/\//, "");
  return withoutProtocol.split(":")[0] || "localhost";
}

/**
 * Base URL for Nest, e.g. http://10.0.0.169:3000/api
 *
 * On a phone, `localhost` is the phone — not your PC. We reuse the same
 * LAN IP Metro already used for Expo (`hostUri`, like 10.0.0.169:8081).
 * On web, use the browser hostname so localhost:8081 talks to localhost:3000.
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
  if (fromEnv) {
    return fromEnv;
  }

  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `http://${window.location.hostname}:${API_PORT}/${API_PREFIX}`;
  }

  return `http://${hostFromHostUri(Constants.expoConfig?.hostUri)}:${API_PORT}/${API_PREFIX}`;
}

/** Origin only (no `/api`). Kubb paths already include the global prefix. */
export function getApiOrigin(): string {
  return getApiBaseUrl().replace(/\/api\/?$/, "");
}

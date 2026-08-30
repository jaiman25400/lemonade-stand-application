import { getApiOrigin } from "@/src/config";
import { reactNativeTransport } from "@/src/api/kubb-transport";
import { client } from "@/src/gen/.kubb/client";

/**
 * Kubb bakes `/api/...` into each operation. Point the shared client at the
 * host origin (LAN IP on a phone, localhost on web) once at startup.
 */
export function ensureApiClient(): void {
  client.setConfig({
    baseURL: getApiOrigin(),
    throwOnError: true,
    transport: reactNativeTransport,
  });
}

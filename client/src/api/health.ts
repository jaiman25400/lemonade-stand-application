import { ensureApiClient } from "@/src/api/configure-client";
import { readKubbError, requestSignal } from "@/src/api/http";
import { healthControllerCheck } from "@/src/gen/clients/health/healthControllerCheck";

export async function fetchHealth(): Promise<{ status: string }> {
  ensureApiClient();
  try {
    const result = await healthControllerCheck({ signal: requestSignal() });
    return result.data as { status: string };
  } catch (error) {
    throw new Error(readKubbError(error));
  }
}

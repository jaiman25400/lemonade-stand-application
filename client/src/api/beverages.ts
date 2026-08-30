import { ensureApiClient } from "@/src/api/configure-client";
import { readKubbError, requestSignal } from "@/src/api/http";
import { beveragesControllerFindAll } from "@/src/gen/clients/beverages/beveragesControllerFindAll";
import type { Beverage } from "@/src/types/api";

export async function fetchBeverages(signal?: AbortSignal): Promise<Beverage[]> {
  ensureApiClient();
  try {
    const result = await beveragesControllerFindAll({
      signal: requestSignal(signal),
    });
    if (!Array.isArray(result.data)) {
      throw new Error("Could not load beverages");
    }
    return result.data;
  } catch (error) {
    throw new Error(readKubbError(error));
  }
}

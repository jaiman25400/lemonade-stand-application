import { fetchBeverages } from "@/src/api/beverages";
import { queryKeys } from "@/src/api/query-client";
import { useQuery } from "@tanstack/react-query";

export function useBeveragesQuery() {
  return useQuery({
    queryKey: queryKeys.beverages(),
    queryFn: ({ signal }) => fetchBeverages(signal),
  });
}

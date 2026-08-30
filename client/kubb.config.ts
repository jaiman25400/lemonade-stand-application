import { defineConfig } from "kubb";
import { pluginFetch } from "@kubb/plugin-fetch";
import { pluginTs } from "@kubb/plugin-ts";

/**
 * Generates typed models + fetch functions from the Nest OpenAPI spec.
 * Refresh the snapshot with `npm run openapi:pull` (Nest must be running),
 * then `npm run generate:api`.
 *
 * Do not bake a host into this config. The phone uses a LAN IP; web uses
 * localhost. `src/api/configure-client.ts` sets baseURL at runtime.
 */
export default defineConfig({
  input: "./openapi.json",
  output: {
    path: "./src/gen",
    clean: true,
  },
  plugins: [
    pluginTs({
      output: { path: "types", mode: "directory" },
    }),
    pluginFetch({
      output: { path: "clients", mode: "directory" },
      group: { type: "tag" },
    }),
  ],
});

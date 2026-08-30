import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SPEC_URL = process.env.OPENAPI_URL ?? "http://localhost:3000/docs-json";
const outPath = join(dirname(fileURLToPath(import.meta.url)), "..", "openapi.json");

const response = await fetch(SPEC_URL);
if (!response.ok) {
  throw new Error(
    `Could not pull OpenAPI from ${SPEC_URL} (${response.status}). Is Nest running?`,
  );
}

const json = await response.json();
await writeFile(outPath, `${JSON.stringify(json, null, 2)}\n`, "utf8");
console.log(`Wrote ${outPath} from ${SPEC_URL}`);

/**
 * The Sendust ref this site was rendered from.
 *
 * `scripts/sync-docs.mjs` writes `src/synced-docs.json` on every run, so a build
 * that has synced reads the ref it actually published. Before the first sync, and
 * on a host that has not fetched the source yet, the map's default ref is the
 * honest answer, because that is what a build would fetch next.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { REPOSITORY } from "../../scripts/doc-map.mjs";

function syncedRef(): string | undefined {
  try {
    const provenance = JSON.parse(
      readFileSync(path.join(process.cwd(), "src", "synced-docs.json"), "utf8"),
    ) as { ref?: unknown };
    return typeof provenance.ref === "string" && provenance.ref !== "" ? provenance.ref : undefined;
  } catch {
    return undefined;
  }
}

export const ref = syncedRef() ?? REPOSITORY.defaultRef;

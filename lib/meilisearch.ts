import { MeiliSearch } from "meilisearch";
import type { MeiliSearch as MeiliSearchType } from "meilisearch";

import { MEILISEARCH_HOST, MEILISEARCH_KEY, NODE_ENV } from "@/config";

const globalForMeilisearch = global as unknown as {
  Meilisearch: MeiliSearchType | undefined;
};

export const meilisearchClient =
  globalForMeilisearch.Meilisearch ??
  new MeiliSearch({
    host: MEILISEARCH_HOST ?? "",
    apiKey: MEILISEARCH_KEY ?? "",
  });

if (NODE_ENV !== "production")
  globalForMeilisearch.Meilisearch = meilisearchClient;

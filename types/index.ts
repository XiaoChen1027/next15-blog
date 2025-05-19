import { type meilisearchClient } from "@/lib/meilisearch";

export type MultiSearchQuery = NonNullable<
  Parameters<typeof meilisearchClient.multiSearch>["0"]
>["queries"][number];

export type SortOrder = "asc" | "desc";

export interface OptionItem<T> {
  value: T;
  label: string;
}

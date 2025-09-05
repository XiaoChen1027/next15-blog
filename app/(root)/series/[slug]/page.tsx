import { notFound } from "next/navigation";

import { isNil } from "lodash-es";

import { Wrapper } from "@/components/wrapper";

import { SeriesDetail, getPublishedSeriesBySlug } from "@/features/series";

export const revalidate = 60;

/**
 * 系列文章详情页面
 */
export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { series } = await getPublishedSeriesBySlug(params.slug);

  if (isNil(series)) {
    return notFound();
  }

  return (
    <Wrapper className="flex min-h-screen flex-col px-6 pb-24 pt-8">
      <SeriesDetail series={series} />
    </Wrapper>
  );
}



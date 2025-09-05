import { Wrapper } from "@/components/wrapper";

import { SeriesList, getPublishedSeries } from "@/features/series";

export const revalidate = 60;

/**
 * 系列文章列表页面
 */
export default async function Page() {
  const { series } = await getPublishedSeries();

  return (
    <Wrapper className="flex min-h-screen flex-col px-6 pb-24 pt-8">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold md:text-4xl">系列文章</h1>
          <p className="text-lg text-muted-foreground">
            探索我们的系列文章，深入了解各种主题的完整内容
          </p>
        </div>

        <SeriesList series={series} />
      </div>
    </Wrapper>
  );
}



// 详情页仅保留分隔与轮播，移除未使用的导入
import { Separator } from "@/components/ui/separator";

import { StackedCarousel } from "./stacked-carousel";

import { type Series } from "../types";

interface SeriesDetailProps {
  series: Series;
}

/**
 * 系列文章详情组件
 */
export function SeriesDetail({ series }: SeriesDetailProps) {
  return (
    <div className="space-y-6">
      {/* 系列文章头部信息 */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold md:text-4xl">{series.title}</h1>
          <p className="text-lg text-muted-foreground">{series.description}</p>
        </div>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>共 {series._count.blogs} 篇文章</span>
          <span>•</span>
          <span>创建于 {new Date(series.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <Separator />

      {/* 系列文章堆叠轮播 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">系列文章</h2>
        <StackedCarousel series={series} />
      </div>
    </div>
  );
}

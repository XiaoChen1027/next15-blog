import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { NextLink } from "@/components/next-link";

import { type Series } from "../types";

interface SeriesNavigationProps {
  series: Series;
  currentBlogId: string;
}

/**
 * 系列文章导航组件
 */
export function SeriesNavigation({
  series,
  currentBlogId,
}: SeriesNavigationProps) {
  const currentIndex = series.blogs.findIndex(
    (blog) => blog.id === currentBlogId,
  );
  const currentBlog = series.blogs[currentIndex];
  const prevBlog = currentIndex > 0 ? series.blogs[currentIndex - 1] : null;
  const nextBlog =
    currentIndex < series.blogs.length - 1
      ? series.blogs[currentIndex + 1]
      : null;

  if (!currentBlog) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* 系列信息 */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">
            系列文章
          </h3>
          <NextLink
            href={`/series/${series.slug}`}
            className="text-lg font-medium hover:text-primary transition-colors"
          >
            {series.title}
          </NextLink>
          <p className="text-sm text-muted-foreground">
            第 {currentIndex + 1} 篇，共 {series.blogs.length} 篇
          </p>
        </div>
      </div>

      {/* 导航按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {prevBlog ? (
            <NextLink href={`/blog/${prevBlog.slug}`}>
              <Button variant="outline" className="w-full justify-start">
                <ChevronLeft className="mr-2 h-4 w-4" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">上一篇</div>
                  <div className="line-clamp-1">{prevBlog.title}</div>
                </div>
              </Button>
            </NextLink>
          ) : (
            <Button variant="outline" className="w-full justify-start" disabled>
              <ChevronLeft className="mr-2 h-4 w-4" />
              <div className="text-left">
                <div className="text-xs text-muted-foreground">上一篇</div>
                <div>没有更多文章</div>
              </div>
            </Button>
          )}
        </div>

        <div className="mx-4">
          <NextLink href={`/series/${series.slug}`}>
            <Button variant="ghost" size="sm">
              查看系列
            </Button>
          </NextLink>
        </div>

        <div className="flex-1">
          {nextBlog ? (
            <NextLink href={`/blog/${nextBlog.slug}`}>
              <Button variant="outline" className="w-full justify-end">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">下一篇</div>
                  <div className="line-clamp-1">{nextBlog.title}</div>
                </div>
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </NextLink>
          ) : (
            <Button variant="outline" className="w-full justify-end" disabled>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">下一篇</div>
                <div>没有更多文章</div>
              </div>
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}



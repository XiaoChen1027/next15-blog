import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { NextLink } from "@/components/next-link";

import { type Series } from "../types";

interface SeriesListProps {
  series: Series[];
}

/**
 * 系列文章列表组件
 */
export function SeriesList({ series }: SeriesListProps) {
  if (!series.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">暂无系列文章</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {series.map((item) => (
        <Card
          key={item.id}
          className="group overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* 封面区域 */}
          {item.cover ? (
            <NextLink href={`/series/${item.slug}`}>
              <div className="relative h-40 w-full overflow-hidden">
                <img
                  src={item.cover}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
              </div>
            </NextLink>
          ) : null}
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                  <NextLink href={`/series/${item.slug}`}>
                    {item.title}
                  </NextLink>
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {item.description}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="ml-2 flex-shrink-0">
                {item._count.blogs} 篇
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* 系列文章预览 */}
              {item.blogs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    系列文章：
                  </p>
                  <div className="space-y-1">
                    {item.blogs.slice(0, 3).map((blog) => (
                      <div
                        key={blog.id}
                        className="flex items-center space-x-2"
                      >
                        <span className="text-xs text-muted-foreground">
                          {blog.seriesOrder !== null
                            ? `${blog.seriesOrder + 1}.`
                            : "•"}
                        </span>
                        <NextLink
                          href={`/blog/${blog.slug}`}
                          className="text-sm hover:text-primary transition-colors line-clamp-1"
                        >
                          {blog.title}
                        </NextLink>
                      </div>
                    ))}
                    {item.blogs.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        还有 {item.blogs.length - 3} 篇文章...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 标签 */}
              {(() => {
                const firstBlog =
                  item.blogs.length > 0 ? item.blogs[0] : undefined;
                if (!firstBlog || !firstBlog.tags?.length) return null;
                const extra = firstBlog.tags.length - 3;
                return (
                  <div className="flex flex-wrap gap-1">
                    {firstBlog.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                    {extra > 0 && (
                      <Badge variant="outline" className="text-xs">
                        +{extra}
                      </Badge>
                    )}
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

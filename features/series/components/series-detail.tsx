import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { NextLink } from "@/components/next-link";

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

      {/* 系列文章列表 */}
      {series.blogs.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">系列文章</h2>
          <div className="space-y-3">
            {series.blogs.map((blog, index) => (
              <Card
                key={blog.id}
                className="group hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        <NextLink href={`/blog/${blog.slug}`}>
                          {blog.seriesOrder !== null
                            ? `${blog.seriesOrder + 1}. `
                            : ""}
                          {blog.title}
                        </NextLink>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {blog.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-4 flex-shrink-0">
                      第 {index + 1} 篇
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {blog.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">该系列暂无文章</p>
        </div>
      )}
    </div>
  );
}

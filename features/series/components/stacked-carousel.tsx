"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { NextLink } from "@/components/next-link";

import { type Series } from "../types";

interface StackedCarouselProps {
  series: Series;
}

/**
 * 堆叠轮播组件：将系列内每篇文章渲染为一张可切换的卡片
 * @param series 系列数据，使用 series.blogs 作为数据源
 */
export function StackedCarousel({ series }: StackedCarouselProps) {
  const [active, setActive] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStartX, setDragStartX] = React.useState<number | null>(null);
  const [dragDeltaX, setDragDeltaX] = React.useState(0);

  const total = series.blogs.length;

  const handlePrev = () => setActive((v) => (v - 1 + total) % total);
  const handleNext = () => setActive((v) => (v + 1) % total);

  /**
   * 开始拖拽
   * @param e Pointer 事件
   */
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    setIsDragging(true);
    setDragStartX(e.clientX);
    (e.currentTarget as HTMLDivElement).setPointerCapture?.(e.pointerId);
  }

  /**
   * 拖拽中，更新位移
   * @param e Pointer 事件
   */
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging || dragStartX === null) return;
    const delta = e.clientX - dragStartX;
    setDragDeltaX(delta);
  }

  /**
   * 结束拖拽，判断是否切换
   * @param e Pointer 事件
   */
  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    const threshold = 60; // 触发切换的最小位移
    if (dragDeltaX > threshold) {
      handlePrev();
    } else if (dragDeltaX < -threshold) {
      handleNext();
    }
    setIsDragging(false);
    setDragStartX(null);
    setDragDeltaX(0);
    (e.currentTarget as HTMLDivElement).releasePointerCapture?.(e.pointerId);
  }

  if (!total) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">该系列暂无文章</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="relative h-[300px] w-full select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* 卡片堆叠容器 */}
        <div className="relative h-full w-full">
          {series.blogs.map((blog, index) => {
            const offset = (index - active + total) % total;
            // 仅渲染前 5 层，后面的隐藏以提升性能
            const visible = offset <= 4;
            const baseTranslateY = offset * 16; // 垂直堆叠间距
            const baseTranslateX = offset * 6; // 轻微水平错位
            const scale = 1 - offset * 0.05; // 层级缩放加强
            const rotate = offset * -1.5; // 轻微旋转增强堆叠感
            const zIndex = 70 - offset; // 层级
            const opacity = offset === 0 ? 1 : 0.9 - (offset - 1) * 0.1;

            // 拖拽时，仅对顶层卡片应用横向位移，其它层保持
            const dragX = offset === 0 ? dragDeltaX : 0;

            return (
              <div
                key={blog.id}
                className="absolute inset-0 transition-all duration-300 ease-out"
                style={{
                  transform: `translate(${
                    baseTranslateX + dragX
                  }px, ${baseTranslateY}px) rotate(${rotate}deg) scale(${
                    visible ? scale : 0.9
                  })`,
                  zIndex,
                  opacity: visible ? Math.max(opacity, 0) : 0,
                  pointerEvents: offset === 0 ? "auto" : "none",
                }}
              >
                <Card className="h-full overflow-hidden shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-lg leading-tight">
                          <NextLink href={`/blog/${blog.slug}`}>
                            {blog.seriesOrder !== null
                              ? `${blog.seriesOrder + 1}. `
                              : ""}
                            {blog.title}
                          </NextLink>
                        </CardTitle>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {blog.description}
                        </p>
                      </div>
                      <Badge variant="secondary">第 {index + 1} 篇</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {blog.tags.slice(0, 4).map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {blog.tags.length > 4 ? (
                          <Badge variant="outline" className="text-xs">
                            +{blog.tags.length - 4}
                          </Badge>
                        ) : null}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-end gap-2">
                      <NextLink href={`/blog/${blog.slug}`}>
                        <Button size="sm" variant="outline">
                          阅读全文
                        </Button>
                      </NextLink>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-12 flex items-center justify-between">
        <Button variant="outline" onClick={handlePrev} disabled={total <= 1}>
          上一篇
        </Button>
        <div className="text-sm text-muted-foreground">
          {active + 1} / {total}
        </div>
        <Button onClick={handleNext} disabled={total <= 1}>
          下一篇
        </Button>
      </div>
    </div>
  );
}

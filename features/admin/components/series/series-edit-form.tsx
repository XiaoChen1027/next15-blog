"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

import {
  type Series,
  type UpdateSeriesDTO,
  updateSeriesSchema,
} from "@/features/series";

interface SeriesEditFormProps {
  seriesId: string;
}

/**
 * 系列文章编辑表单组件
 */
export function SeriesEditForm({ seriesId }: SeriesEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [series, setSeries] = useState<Series | null>(null);

  const form = useForm<UpdateSeriesDTO>({
    resolver: zodResolver(updateSeriesSchema),
    defaultValues: {
      id: seriesId,
      title: "",
      slug: "",
      description: "",
      cover: "",
      published: false,
    },
  });

  // 加载系列文章数据
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await fetch(`/api/series/${seriesId}`);
        if (!response.ok) {
          throw new Error("加载失败");
        }
        const data = await response.json();
        setSeries(data.series);

        // 填充表单
        form.reset({
          id: seriesId,
          title: data.series.title,
          slug: data.series.slug,
          description: data.series.description,
          cover: data.series.cover ?? "",
          published: data.series.published,
        });
      } catch (error) {
        showErrorToast(error instanceof Error ? error.message : "加载失败");
        router.push("/admin/series");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeries();
  }, [seriesId, form, router]);

  const onSubmit = async (data: UpdateSeriesDTO) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/series/${seriesId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "更新失败");
      }

      showSuccessToast("系列文章已更新");

      router.push("/admin/series");
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : "更新失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">编辑系列文章</h1>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">编辑系列文章</h1>
          <p className="text-muted-foreground">系列文章不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">编辑系列文章</h1>
        <p className="text-muted-foreground">编辑系列文章 "{series.title}"</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>系列文章信息</CardTitle>
          <CardDescription>修改系列文章的基本信息</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标题 *</FormLabel>
                    <FormControl>
                      <Input placeholder="输入系列文章标题" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL 标识 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="输入 URL 标识（如：react-tutorial）"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      只允许输入数字、小写字母和中横线
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述 *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="输入系列文章描述"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cover"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>封面图片</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="输入封面图片 URL"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      可选，输入封面图片的 URL 地址
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">发布状态</FormLabel>
                      <FormDescription>是否发布此系列文章</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "更新中..." : "更新系列文章"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  取消
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
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

import { type CreateSeriesDTO, createSeriesSchema } from "@/features/series";

/**
 * 系列文章创建表单组件
 */
export function SeriesCreateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateSeriesDTO>({
    resolver: zodResolver(createSeriesSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      cover: "",
      published: false,
    },
  });

  const onSubmit = async (data: CreateSeriesDTO) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/series", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "创建失败");
      }

      showSuccessToast("系列文章已创建");

      router.push("/admin/series");
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : "创建失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">创建系列文章</h1>
        <p className="text-muted-foreground">创建一个新的系列文章</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>系列文章信息</CardTitle>
          <CardDescription>填写系列文章的基本信息</CardDescription>
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
                      <Input placeholder="输入封面图片 URL" {...field} />
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
                      <FormDescription>是否立即发布此系列文章</FormDescription>
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
                  {isSubmitting ? "创建中..." : "创建系列文章"}
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

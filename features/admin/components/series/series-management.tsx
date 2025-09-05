"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useSetState } from "ahooks";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

import { IllustrationNoContent } from "@/components/illustrations";

import { PATHS } from "@/constants";
import { type Series } from "@/features/series";

interface SeriesManagementProps {
  series?: Series[];
  total?: number;
}

/**
 * 系列文章管理组件
 */
export function SeriesManagement({
  series = [],
  total = 0,
}: SeriesManagementProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [tableParams, updateTableParams] = useSetState({
    pageIndex: 1,
    pageSize: 100,
  });

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      const response = await fetch(`/api/series/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除失败");
      }

      showSuccessToast("系列文章已删除");

      router.refresh();
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : "删除失败");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleTogglePublished = async (id: string) => {
    try {
      const response = await fetch(`/api/series/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "toggle-published" }),
      });

      if (!response.ok) {
        throw new Error("操作失败");
      }

      showSuccessToast("发布状态已更新");

      router.refresh();
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : "操作失败");
    }
  };

  const columns = [
    {
      accessorKey: "title",
      header: "标题",
      cell: ({ row }: { row: { original: Series } }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.title}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.slug}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "描述",
      cell: ({ row }: { row: { original: Series } }) => (
        <div className="max-w-xs truncate text-sm text-muted-foreground">
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "blogs",
      header: "文章数量",
      cell: ({ row }: { row: { original: Series } }) => (
        <Badge variant="secondary">{row.original._count.blogs} 篇</Badge>
      ),
    },
    {
      accessorKey: "published",
      header: "状态",
      cell: ({ row }: { row: { original: Series } }) => (
        <Badge variant={row.original.published ? "default" : "secondary"}>
          {row.original.published ? "已发布" : "草稿"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "创建时间",
      cell: ({ row }: { row: { original: Series } }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }: { row: { original: Series } }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTogglePublished(row.original.id)}
          >
            {row.original.published ? "取消发布" : "发布"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/series/edit/${row.original.id}`)}
          >
            编辑
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting === row.original.id}
              >
                {isDeleting === row.original.id ? "删除中..." : "删除"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除</AlertDialogTitle>
                <AlertDialogDescription>
                  确定要删除系列文章 "{row.original.title}" 吗？此操作不可撤销。
                  删除后，该系列下的所有文章将不再属于任何系列。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(row.original.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold">系列文章管理</h1>
          <p className="text-muted-foreground">
            管理您的系列文章，共 {total} 个系列
          </p>
        </div>
        <Button onClick={() => router.push("/admin/series/create")}>
          创建系列文章
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>系列文章列表</CardTitle>
          <CardDescription>查看和管理所有系列文章</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={series}
            total={total}
            params={tableParams}
            updateParams={updateTableParams}
            searchKey="title"
            searchPlaceholder="搜索系列文章..."
            noResult={
              <div className="grid place-content-center gap-4 py-16">
                <IllustrationNoContent />
                <p>暂无系列文章</p>
                <Button onClick={() => router.push(PATHS.ADMIN_SERIES_CREATE)}>
                  去创建
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

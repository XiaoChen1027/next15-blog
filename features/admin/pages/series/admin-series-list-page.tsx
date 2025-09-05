"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { type ColumnDef } from "@tanstack/react-table";
import { useSetState } from "ahooks";
import { Pen, Plus, RotateCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";

import { IllustrationNoContent } from "@/components/illustrations";

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, PATHS } from "@/constants";
import { DeleteSeriesButton } from "@/features/admin/components/series/delete-series-button";
import { type GetSeriesDTO, type Series } from "@/features/series";

interface AdminSeriesListPageProps {
  series: Series[];
  total: number;
}

export const AdminSeriesListPage = ({
  series,
  total,
}: AdminSeriesListPageProps) => {
  const router = useRouter();

  // 查询参数（含搜索与排序）
  const [params, updateParams] = useSetState<GetSeriesDTO>({
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: DEFAULT_PAGE_SIZE,
    orderBy: "createdAt",
    order: "desc",
  } as GetSeriesDTO);

  // DataTable 专用分页参数，保持严格类型
  const [pagination, setPagination] = useSetState<{
    pageIndex: number;
    pageSize: number;
  }>({
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  // 双向同步
  React.useEffect(() => {
    if (
      pagination.pageIndex !== params.pageIndex ||
      pagination.pageSize !== params.pageSize
    ) {
      updateParams({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      });
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  React.useEffect(() => {
    if (
      params.pageIndex !== pagination.pageIndex ||
      params.pageSize !== pagination.pageSize
    ) {
      setPagination({
        pageIndex: params.pageIndex!,
        pageSize: params.pageSize!,
      });
    }
  }, [params.pageIndex, params.pageSize]);

  const [inputParams, updateInputParams] = useSetState<{
    title?: string;
    slug?: string;
  }>({});

  const columns: ColumnDef<Series, unknown>[] = [
    {
      accessorKey: "title",
      header: "标题",
      cell: ({ row }) => (
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
      cell: ({ row }) => (
        <div className="max-w-xs truncate text-sm text-muted-foreground">
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "_count.blogs",
      header: "文章数量",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original._count.blogs} 篇
        </div>
      ),
    },
    {
      accessorKey: "published",
      header: "状态",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded border px-2 py-0.5 text-xs text-muted-foreground">
          {row.original.published ? "已发布" : "草稿"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "创建时间",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/admin/series/edit/${row.original.id}`)}
            aria-label="编辑"
            title="编辑"
          >
            <Pen className="size-4" />
          </Button>

          <DeleteSeriesButton
            id={row.original.id}
            title={row.original.title}
            refreshAsync={() => Promise.resolve(router.refresh())}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-y-6 p-6">
      <div className="grid grid-cols-4 items-end gap-4 px-1">
        <Input
          placeholder="请输入标题或 slug"
          value={inputParams.title ?? ""}
          onChange={(v) => {
            updateInputParams({ title: v.target.value, slug: v.target.value });
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />

        <div className="flex items-center space-x-4">
          <Button onClick={handleSearch}>
            <Search className="mr-2 size-4" />
            搜索
          </Button>
          <Button onClick={handleReset}>
            <RotateCw className="mr-2 size-4" />
            重置
          </Button>
          <Button onClick={handleGoToCreate}>
            <Plus className="mr-2 size-4" />
            创建系列
          </Button>
        </div>
      </div>

      <DataTable<Series, unknown>
        columns={columns}
        data={series}
        total={total}
        params={pagination}
        updateParams={setPagination}
        noResult={
          <div className="grid place-content-center gap-4 py-16">
            <IllustrationNoContent />
            <p>暂无系列文章</p>
            <Button onClick={handleGoToCreate}>去创建</Button>
          </div>
        }
      />
    </div>
  );

  function handleSearch() {
    updateParams({
      title: inputParams.title,
      slug: inputParams.slug,
    } as GetSeriesDTO);
  }

  function handleReset() {
    updateInputParams({ title: "", slug: "" });
    updateParams({
      title: "",
      slug: undefined,
      pageIndex: DEFAULT_PAGE_INDEX,
    } as GetSeriesDTO);
  }

  function handleGoToCreate() {
    router.push(PATHS.ADMIN_SERIES_CREATE);
  }
};

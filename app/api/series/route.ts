import { NextRequest, NextResponse } from "next/server";

import {
  type CreateSeriesDTO,
  type GetSeriesDTO,
  createSeries,
  getSeries,
} from "@/features/series";

/**
 * 获取系列文章列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const publishedParam = searchParams.get("published");
    const orderByParam = searchParams.get("orderBy");
    const orderParam = searchParams.get("order");

    const params: GetSeriesDTO = {
      title: searchParams.get("title") ?? undefined,
      slug: searchParams.get("slug") ?? undefined,
      published: (publishedParam as GetSeriesDTO["published"]) ?? undefined,
      pageIndex: Number(searchParams.get("pageIndex")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 10,
      orderBy:
        (orderByParam as NonNullable<GetSeriesDTO["orderBy"]>) ?? undefined,
      order: (orderParam as NonNullable<GetSeriesDTO["order"]>) ?? undefined,
    };

    const result = await getSeries(params);

    return NextResponse.json(result);
  } catch (error) {
    console.error("获取系列文章列表失败:", error);
    return NextResponse.json(
      { error: "获取系列文章列表失败" },
      { status: 500 },
    );
  }
}

/**
 * 创建系列文章
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateSeriesDTO = await request.json();

    const result = await createSeries(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error("创建系列文章失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建系列文章失败" },
      { status: 500 },
    );
  }
}

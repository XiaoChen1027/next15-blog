import { NextRequest, NextResponse } from "next/server";

import {
  type UpdateSeriesDTO,
  deleteSeriesByID,
  getSeriesByID,
  toggleSeriesPublished,
  updateSeries,
} from "@/features/series";

/**
 * 获取单个系列文章
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await getSeriesByID(id);

    if (!result.series) {
      return NextResponse.json({ error: "系列文章不存在" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("获取系列文章失败:", error);
    return NextResponse.json({ error: "获取系列文章失败" }, { status: 500 });
  }
}

/**
 * 更新系列文章
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body: Omit<UpdateSeriesDTO, "id"> = await request.json();

    const result = await updateSeries({ ...body, id });

    return NextResponse.json(result);
  } catch (error) {
    console.error("更新系列文章失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "更新系列文章失败" },
      { status: 500 },
    );
  }
}

/**
 * 删除系列文章
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await deleteSeriesByID(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除系列文章失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "删除系列文章失败" },
      { status: 500 },
    );
  }
}

/**
 * 切换系列文章发布状态
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { action } = await request.json();

    if (action === "toggle-published") {
      const result = await toggleSeriesPublished(id);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "不支持的操作" }, { status: 400 });
  } catch (error) {
    console.error("操作系列文章失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "操作系列文章失败" },
      { status: 500 },
    );
  }
}



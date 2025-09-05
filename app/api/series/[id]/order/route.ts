import { NextRequest, NextResponse } from "next/server";

import { updateSeriesOrder } from "@/features/series/actions";
import { type UpdateSeriesOrderDTO } from "@/features/series/types";

/**
 * 更新系列文章内博客的排序
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body: Omit<UpdateSeriesOrderDTO, "seriesId"> = await request.json();

    const result = await updateSeriesOrder({ ...body, seriesId: id });

    return NextResponse.json(result);
  } catch (error) {
    console.error("更新系列文章排序失败:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "更新系列文章排序失败",
      },
      { status: 500 },
    );
  }
}

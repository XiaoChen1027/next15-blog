"use server";

import { type Prisma } from "@prisma/client";
import { isUndefined } from "lodash-es";

import { ERROR_NO_PERMISSION, PUBLISHED_MAP } from "@/constants";
import { noPermission } from "@/features/user";
import { prisma } from "@/lib/prisma";
import { getSkip } from "@/utils";

import {
  type CreateSeriesDTO,
  type GetSeriesDTO,
  type UpdateSeriesDTO,
  type UpdateSeriesOrderDTO,
  createSeriesSchema,
  getSeriesSchema,
  updateSeriesOrderSchema,
  updateSeriesSchema,
} from "../types";

/**
 * 检查系列文章是否存在
 */
export const isSeriesExistByID = async (id: string): Promise<boolean> => {
  const isExist = await prisma.series.findUnique({ where: { id } });
  return Boolean(isExist);
};

/**
 * 获取系列文章列表
 */
export const getSeries = async (params: GetSeriesDTO) => {
  const result = await getSeriesSchema.safeParseAsync(params);

  if (!result.success) {
    throw new Error(result.error.format()._errors.join(";") || "");
  }

  const cond: Prisma.SeriesWhereInput = {
    OR: [
      ...(result.data.title?.trim()
        ? [{ title: { contains: result.data.title.trim() } }]
        : []),
      ...(result.data.slug?.trim()
        ? [{ slug: { contains: result.data.slug.trim() } }]
        : []),
    ],
  };

  const published = await noPermission();
  if (published || !isUndefined(result.data.published)) {
    cond.published = PUBLISHED_MAP[result.data.published!] ?? published;
  }

  const sort: Prisma.SeriesOrderByWithRelationInput | undefined =
    result.data.orderBy && result.data.order
      ? { [result.data.orderBy]: result.data.order }
      : undefined;

  if (!cond.OR?.length) {
    delete cond.OR;
  }

  const total = await prisma.series.count({ where: cond });
  const series = await prisma.series.findMany({
    include: {
      blogs: {
        where: { published: true },
        orderBy: { seriesOrder: "asc" },
        include: { tags: true },
      },
      _count: {
        select: { blogs: true },
      },
    },
    orderBy: sort,
    where: cond,
    take: result.data.pageSize,
    // 防御性处理，避免出现负数 skip
    skip: Math.max(0, getSkip(result.data.pageIndex, result.data.pageSize)),
  });

  return { series, total };
};

/**
 * 获取已发布的系列文章列表
 */
export const getPublishedSeries = async () => {
  const series = await prisma.series.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      blogs: {
        where: { published: true },
        orderBy: { seriesOrder: "asc" },
        include: { tags: true },
      },
      _count: {
        select: { blogs: true },
      },
    },
    where: {
      published: true,
    },
  });

  const count = await prisma.series.count({
    where: {
      published: true,
    },
  });

  const total = count ?? 0;

  return {
    series,
    total,
  };
};

/**
 * 根据ID获取系列文章
 */
export const getSeriesByID = async (id: string) => {
  const series = await prisma.series.findUnique({
    where: { id },
    include: {
      blogs: {
        where: { published: true },
        orderBy: { seriesOrder: "asc" },
        include: { tags: true },
      },
      _count: {
        select: { blogs: true },
      },
    },
  });

  return { series };
};

/**
 * 根据slug获取已发布的系列文章
 */
export const getPublishedSeriesBySlug = async (slug: string) => {
  const series = await prisma.series.findUnique({
    where: { slug, published: true },
    include: {
      blogs: {
        where: { published: true },
        orderBy: { seriesOrder: "asc" },
        include: { tags: true },
      },
      _count: {
        select: { blogs: true },
      },
    },
  });

  return { series };
};

/**
 * 删除系列文章
 */
export const deleteSeriesByID = async (id: string) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }

  const isExist = await isSeriesExistByID(id);

  if (!isExist) {
    throw new Error("系列文章不存在");
  }

  // 先移除所有关联的博客文章的系列关联
  await prisma.blog.updateMany({
    where: { seriesId: id },
    data: { seriesId: null, seriesOrder: null },
  });

  // 删除系列文章
  await prisma.series.delete({
    where: { id },
  });
};

/**
 * 创建系列文章
 */
export const createSeries = async (params: CreateSeriesDTO) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }

  const result = await createSeriesSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors.join(";");
    throw new Error(error);
  }

  const { title, slug, description, published, cover } = result.data;

  const series = await prisma.series.findMany({
    where: {
      OR: [{ title }, { slug }],
    },
  });

  if (series.length) {
    throw new Error("标题或者slug重复");
  }

  const newSeries = await prisma.series.create({
    data: {
      title,
      slug,
      description,
      published,
      cover,
    },
  });

  return newSeries;
};

/**
 * 切换系列文章发布状态
 */
export const toggleSeriesPublished = async (id: string) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }

  const series = await prisma.series.findUnique({
    where: { id },
  });

  if (!series) {
    throw new Error("系列文章不存在");
  }

  const updated = await prisma.series.update({
    data: {
      published: !series.published,
    },
    where: { id },
  });

  return updated;
};

/**
 * 更新系列文章
 */
export const updateSeries = async (params: UpdateSeriesDTO) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }

  const result = await updateSeriesSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors.join(";");
    throw new Error(error);
  }

  const { id, title, description, slug, cover, published } = result.data;

  const series = await prisma.series.findUnique({
    where: { id },
  });

  if (!series) {
    throw new Error("系列文章不存在");
  }

  const updated = await prisma.series.update({
    where: { id },
    data: {
      title: title ?? series.title,
      description: description ?? series.description,
      slug: slug ?? series.slug,
      cover: cover ?? series.cover,
      published: published ?? series.published,
    },
  });

  return updated;
};

/**
 * 更新系列文章内博客的排序
 */
export const updateSeriesOrder = async (params: UpdateSeriesOrderDTO) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }

  const result = await updateSeriesOrderSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors.join(";");
    throw new Error(error);
  }

  const { seriesId, blogOrders } = result.data;

  // 验证系列文章是否存在
  const series = await prisma.series.findUnique({
    where: { id: seriesId },
  });

  if (!series) {
    throw new Error("系列文章不存在");
  }

  // 批量更新博客的排序
  const updatePromises = blogOrders.map(({ blogId, order }) =>
    prisma.blog.update({
      where: { id: blogId },
      data: { seriesOrder: order },
    }),
  );

  await Promise.all(updatePromises);

  return { success: true };
};

/**
 * 将博客添加到系列
 */
export const addBlogToSeries = async (blogId: string, seriesId: string) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }

  // 验证博客和系列是否存在
  const [blog, series] = await Promise.all([
    prisma.blog.findUnique({ where: { id: blogId } }),
    prisma.series.findUnique({ where: { id: seriesId } }),
  ]);

  if (!blog) {
    throw new Error("博客文章不存在");
  }

  if (!series) {
    throw new Error("系列文章不存在");
  }

  // 获取系列中当前最大的排序值
  const maxOrder = await prisma.blog.findFirst({
    where: { seriesId },
    orderBy: { seriesOrder: "desc" },
    select: { seriesOrder: true },
  });

  const newOrder = (maxOrder?.seriesOrder ?? -1) + 1;

  // 更新博客的系列关联
  const updated = await prisma.blog.update({
    where: { id: blogId },
    data: {
      seriesId,
      seriesOrder: newOrder,
    },
  });

  return updated;
};

/**
 * 从系列中移除博客
 */
export const removeBlogFromSeries = async (blogId: string) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
  });

  if (!blog) {
    throw new Error("博客文章不存在");
  }

  const updated = await prisma.blog.update({
    where: { id: blogId },
    data: {
      seriesId: null,
      seriesOrder: null,
    },
  });

  return updated;
};

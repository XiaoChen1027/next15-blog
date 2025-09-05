import { z } from "zod";

import { PUBLISHED_ENUM, REGEX } from "@/constants";

import { type getSeries } from "../actions";

/**
 * 创建系列文章的验证模式
 */
export const createSeriesSchema = z.object({
  title: z.string().min(1, { message: "长度不能少于1个字符" }),
  slug: z
    .string()
    .regex(REGEX.SLUG, {
      message: "只允许输入数字、小写字母和中横线",
    })
    .min(1, { message: "长度不能少于1个字符" }),
  description: z.string().min(1, { message: "长度不能少于1个字符" }),
  cover: z.string().nullable().optional(),
  published: z.boolean().optional(),
});

/**
 * 更新系列文章的验证模式
 */
export const updateSeriesSchema = createSeriesSchema.partial().extend({
  id: z.string().min(1),
});

/**
 * 获取系列文章列表的验证模式
 */
export const getSeriesSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  published: z
    .enum([
      PUBLISHED_ENUM.ALL,
      PUBLISHED_ENUM.PUBLISHED,
      PUBLISHED_ENUM.NO_PUBLISHED,
    ])
    .optional(),
  // 页码从 1 开始，避免 skip 为负
  pageIndex: z.number().min(1).default(1),
  pageSize: z.number(),
  orderBy: z.enum(["createdAt", "updatedAt"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

/**
 * 系列文章排序的验证模式
 */
export const updateSeriesOrderSchema = z.object({
  seriesId: z.string().min(1),
  blogOrders: z.array(
    z.object({
      blogId: z.string().min(1),
      order: z.number().min(0),
    }),
  ),
});

export type CreateSeriesDTO = z.infer<typeof createSeriesSchema>;
export type UpdateSeriesDTO = z.infer<typeof updateSeriesSchema>;
export type GetSeriesDTO = z.infer<typeof getSeriesSchema>;
export type UpdateSeriesOrderDTO = z.infer<typeof updateSeriesOrderSchema>;

export type Series = Awaited<ReturnType<typeof getSeries>>["series"][number];

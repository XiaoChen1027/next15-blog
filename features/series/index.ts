// 导出类型
export type {
  CreateSeriesDTO,
  UpdateSeriesDTO,
  GetSeriesDTO,
  UpdateSeriesOrderDTO,
  Series,
} from "./types";

// 导出验证模式
export {
  createSeriesSchema,
  updateSeriesSchema,
  getSeriesSchema,
  updateSeriesOrderSchema,
} from "./types";

// 导出 actions
export {
  isSeriesExistByID,
  getSeries,
  getPublishedSeries,
  getSeriesByID,
  getPublishedSeriesBySlug,
  deleteSeriesByID,
  createSeries,
  toggleSeriesPublished,
  updateSeries,
  updateSeriesOrder,
  addBlogToSeries,
  removeBlogFromSeries,
} from "./actions";

// 导出组件
export { SeriesList } from "./components/series-list";
export { SeriesDetail } from "./components/series-detail";
export { SeriesNavigation } from "./components/series-navigation";



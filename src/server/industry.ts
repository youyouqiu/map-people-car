import Ajax from "@/framework/utils/ajax";

/**
 * 行业类别
 */
export const getIndustry = <T>(data: any) => Ajax.safeGet<T>('/api/mo/dict/INDUSTRY_CATEGORY/dropdown', data);//行业类别下拉列表
export const getIndustryById = (data: any) => Ajax.get(`/api/user/industry/${data}`, null);//根据id获取行业类别
import Ajax from "../framework/utils/ajax";

/**
 * 分页
 */
export const pageDataList = (param: any) => Ajax.safePost(`/api/tool/personalization/page`, param);

/**
 * 修改 1:登录页个性设置 2:ico 3:logo 4:标题 5：置低信息 6：登录首页
 */
export const personalizationEdit = (param: any) => Ajax.safePost(`/api/tool/personalization/update/${param.type}`, param);


/**
 * 预览 1:登录页个性设置 2:ico 3:logo 4:标题 5：置低信息 6：登录首页
 */
export const personalizationPreview = (param: any) => Ajax.safePost(`/api/tool/personalization/preview`, param);

/**
 * 恢复默认 1:登录页个性设置 2:ico 3:logo 4:标题 5：置低信息 6：登录首页
 */
export const personalizationReset = (param: any) => Ajax.safePost(`/api/tool/personalization/reset`, param);
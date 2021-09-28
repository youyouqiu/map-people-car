import Ajax from "../framework/utils/ajax";

/**
 * 数据列表
 */
export const getWorkList = <T>(data: any) => Ajax.safePostPage<T>(`/api/sa/work/approve/page`, data);

/**
 * 组织树
 */
export const getWorkTree = <T>(data: any) => Ajax.safeGet<T>(`/api/sa/work/approve/treeNode`, data);

/**
 * 获取标段详情
 */
export const sectionDetail = <T>(data: any) => Ajax.safeGet<T>(`/api/sa/work/approve/sectionDetail`, data);

/**
 * 获取审批详情
 */
export const auditsDetail = <T>(data: any) => Ajax.safeGet(`/api/sa/work/approve/approveDetail/${data.enterpriseId}/${data.workId}`, data);

/**
 * 批量审批
 */
export const auditsDetailAll = <T>(data: any) => Ajax.safePost(`/api/sa/work/approve/batchApprove`, data);

/**
 * 执行审批
 */

export const auditsApprove = <T>(data: any) => Ajax.safeGet(`/api/sa/work/approve/approve`, data);

/**
 * 点击审批.获取详情时，排班是否发生改变的小红点
 */
export const monitorShiftChangeStatus = <T>(data: any) => Ajax.safeGet<T>(`/api/sa/work/approve/monitorShiftChangeStatus/${data.workId}`, data);

/**
 * 点击当前监控对象排班，获取该监控对象之前的排班信息
 */
export const beforeShiftDetail = <T>(data: any) => Ajax.safeGet<T>(`/api/sa/work/approve/beforeShiftDetail/${data.enterpriseId}/${data.workId}/${data.monitorId}`, data);

/**
 *  获取当前作业审核详情
 */
export const getCurrentDetail = <T>(data: any) => Ajax.safeGet(`/api/sa/work/approve/currentDetail/${data.enterpriseId}/${data.workId}`, data);

/**
 *  获取企业下清运区域
*/
export const getOrgArea = <T>(data: any) => Ajax.safeGet<T>(`/api/sa/work/object/getWorkObjectByOrgId/${data.enterpriseId}`, data);
import Ajax from "../framework/utils/ajax";
/**
 * 获取权限下组织客户树
 *  @param data:{customerName: string}
 */
export const getCustomerTree = (data: any) => Ajax.safeGet(`/api/cc/customer/tree`, data); 
export const getCustomerTreeById = (data: any) => Ajax.safeGet(`/api/cc/customer/enable/${data.id}`, null);  //查询企业下的状态为启用的客户信息

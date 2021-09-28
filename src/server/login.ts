import Ajax from "../framework/utils/ajax";

/**
 * 获取用户权限列表
 * @param data 传null
 * orgGetPermission : 组织用户  1
 * userGetPermission： 企业用户  2
 */
export const getPermission = <T>(data: any) => Ajax.safeGet<T>('/api/user/permission/menu', data)
export const orgGetPermission = <T>(data: any) => Ajax.safeGet<T>('/api/user/permission/org/permission', data);
export const userGetPermission = <T>(data: any) => Ajax.safeGet<T>('/api/user/permission/enterprise/permission', data);

/**
 * 退出登录
 * @param data 传null
 */
export const logout = <T>() => Ajax.safePost<T>('/api/user/quit', null)


/**
 * 获取个性化设置--登录后调用
 * @returns 
 */
export const personalization = () => Ajax.safeGet('/api/tool/personalization', null);
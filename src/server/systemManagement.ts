import Ajax from "@/framework/utils/ajax";

export const roleList = (param: any) => Ajax.safePostPage(`/api/user/role/me`, param);
/**
 * 能否删除角色
 * @param id 角色id
 */
export const roleCanDelete = <T>(id: string) => Ajax.safeGet(`/api/user/role/canDelete/${id}`, null);
export const roleDetail = <T>(roleId: string) => Ajax.safeGet<T>(`/api/user/role/${roleId}`, null);
export const deleteRole = (param: any) => Ajax.safeDelete(`/api/user/role/${param.id}`, null);
export const batchDeleteRole = <T>(param: any) => Ajax.safeDelete<T>(`/api/user/role`, param);
export const rolePermission = <T>(data: any) => Ajax.safeGet<T>(`/api/user/role/${data.roleId}/permission`, { owner: data.owner });
export const saveRole = (param: any) => Ajax.safePut(`/api/user/role/${param.roleId}`, param.roleDto);
export const addRole = (param: any) => Ajax.safeRepeatPost(`/api/user/role`, param);
export const userTree = <T>(param: any) => Ajax.safeGet<T>(`/api/user/user/userOrgTree`, param);
export const saveRoleUser = (param: any) => Ajax.safeRepeatPost(`/api/user/role/${param.roleId}/user`, param.userIds);
export const pagePermissions = (data: any) => Ajax.get(`/api/sa/enterprise/role/org/permission`, data);
/**
 * 获取指定角色的用户列表
 * @param data {roleId,queryType,keyword} 角色id 查询类型 0：用户名 1:组织 关键字
 */
export const roleUserTree = <T>(data: any) => Ajax.safeGet<T>(`/api/user/role/${data.roleId}/users/${data.queryType}`, { keyword: data.keyword });


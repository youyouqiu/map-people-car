import Ajax from '@/framework/utils/ajax';

/**
 * 企业用户
 */
export const enterpriseList = <T>(data: any) => Ajax.safePostPage<T>(`/api/sa/enterprise/user/page`, data); //企业用户列表
export const enterpriseAdd = (data: any) => Ajax.safeRepeatPost<boolean>(`/api/sa/enterprise/user`, data); //新增企业用户
export const enterpriseUpdate = (data: any) => Ajax.safePut<boolean>(`/api/sa/enterprise/user/${data.userId}`, data.user); //修改企业用户
export const enterpriseDel = (data: any) => Ajax.safeDelete<boolean>(`/api/sa/enterprise/user/${data.userId}`, data); //删除企业用户
export const exterprisBatchDel = <T>(data: any) => Ajax.safeDelete<T>(`/api/sa/enterprise/user/batch`, data); //批量删除企业用户
export const exterpriseRole = <T>(data: any) => Ajax.safePost<T>(`/api/sa/enterprise/user/${data.userId}/role`, data.body); //分配企业用户
export const exterpriseDetail = <T>(data: any) => Ajax.safeGet<T>(`/api/sa/enterprise/user/detail/${data.userId}`, null); //企业用户详情
export const enterpriseOrgTree = <T>(data?: any) => Ajax.safeGet<T>(`/api/sa/enterprise/user/enterpriseOrgTree`, data); //企业用户树
export const exterpriseCharacter = <T>(data: any) => Ajax.safePost<T>(`/api/sa/enterprise/user/roles/${data.userId}`, null); //企业用户权限下的企业角色
export const exterpriseRoleCurrent = <T>(data: any) => Ajax.safePost<T>(`/api/sa/enterprise/user/roles/current/${data.userId}`, data); //当前用户拥有的该企业用户企业下的企业角色
export const userEnterpriseTree = <T>(data: any) => Ajax.safeGet<T>(`/api/sa/enterprise/user/userEnterpriseTree`, data); //获取企业用户树

// /**
//  * 获取指定角色的用户列表
//  * @param data {roleId,queryType,keyword} 角色id 查询类型 0：用户名 1:组织 关键字
//  */
// export const roleUserTree = <T>(data: any) => Ajax.safeGet<T>(`/api/user/role/${data.roleId}/users/${data.queryType}`, { keyword: data.keyword });

/**
 * 角色权限
 */
export const roleList = (param: any) => Ajax.safePostPage(`/api/sa/enterprise/role/me`, param); //角色权限列表
export const deleteRole = (param: any) => Ajax.safeDelete(`/api/sa/enterprise/role/${param.id}`, null); //删除
export const batchDeleteRole = <T>(param: any) => Ajax.safeDelete<T>(`/api/sa/enterprise/role`, param); //批量删除
export const addRole = (param: any) => Ajax.safeRepeatPost(`/api/sa/enterprise/role`, param); //新增
export const saveRole = (param: any) => Ajax.safePut(`/api/sa/enterprise/role/${param.roleId}`, param.roleDto); //保存
export const saveRoleUser = (param: any) => Ajax.safePost(`/api/sa/enterprise/role/${param.roleId}/user`, param.userIds); //为角色分配重新分配用户
export const roleCanDelete = <T>(id: string) => Ajax.safeGet(`/api/sa/enterprise/role/canDelete/${id}`, null); //是否删除角色
export const pagePermissions = (data: any) => Ajax.get(`/api/sa/enterprise/role/enterprise/permission`, data); //角色权限预览树
export const checkUserName = <T>(param: any) => Ajax.safePost<T>(`/api/sa/enterprise/role/checkName/${param.name}`, param.orgIds) //校验角色名是否重复
export const roleDetail = <T>(roleId: any) => Ajax.safeGet<T>(`/api/sa/enterprise/role/detail/${roleId}`, null); //角色详情
export const rolePermission = <T>(data: any) => Ajax.safeGet<T>(`/api/user/role/${data.roleId}/permission`, { owner: data.owner });

/**
 * 获取指定角色的用户列表
 * @param data {roleId,queryType,keyword} 角色id 查询类型 0：用户名 1:组织 关键字
 */
export const roleUserTree = <T>(data: any) => Ajax.safeGet<T>(`/api/sa/enterprise/role/${data.roleId}/users/${data.queryType}`, { keyword: data.keyword });
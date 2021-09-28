import Ajax from "@/framework/utils/ajax";

/**
 * 组织管理
 */
export const getOrgTree = <T>(data?: any) => Ajax.safeGet<T>('/api/user/organization/tree', data);//组织树
export const getCurOrgList = <T>(data: any) => Ajax.safePostPage<T>(`/api/user/organization/page`, data);//组织列表
export const getOrgDetail = <T>(data: any) => Ajax.safeGet<T>(`/api/user/organization/${data.id}`, null);//组织详情
export const addOrg = (data: any) => Ajax.safeRepeatPost<boolean>('/api/user/organization', data);//新增组织
export const updateOrg = (data: any) => Ajax.safePut<boolean>('/api/user/organization/update', data);//修改组织
export const insertOrg = (data: any) => Ajax.safePost<boolean>('/api/user/organization/insert', data);//插入组织
export const checkDelOrg = (data: any) => Ajax.safeGet<boolean>(`/api/sa/organization/canDelete/${data.id}`, null);//校验组织是否能删除
export const delOrg = (data: any) => Ajax.safeDelete<boolean>(`/api/sa/organization/${data.id}`, null);//删除组织
export const delOrgMore = <T>(data: any) => Ajax.safeDelete<T>('/api/sa/organization/more', data);//批量删除组织
export const checkorGanizationName = (data: any) => Ajax.safeGet(`/api/sa/organization/checkName/${data.pid}`, data) //检验同一级组织名称是否重复

/**
 *分组管理 
 */
// 监控分组列表
export const getGMonitorList = <T>(data: any) => Ajax.safePostPage<T>('/api/mo/group/page', data);//分组列表
export const getGMonitorDetail = (data: any) => Ajax.get(`/api/mo/group/id/${data.id}`, null);//分组详情
export const addGMonitor = (data: any) => Ajax.safeRepeatPost<boolean>(`/api/mo/group`, data);//新增分组
export const checkGroupName = (data: any) => Ajax.safePost<boolean>('/api/mo/group/checkName', data);//校验分组名称是否重复
export const updateGMonitor = (data: any) => Ajax.safePut<boolean>(`/api/mo/group/${data.id}`, data.group);//修改分组
export const checkDelGMonitor = <T>(data: any) => Ajax.safePost<T>('/api/mo/group/checkDelete', data);//检验分组是否能删除
export const delGMonitor = (data: any) => Ajax.safeDelete<boolean>(`/api/mo/group/${data.id}`, null);//删除分组
export const delGMonitorMore = <T>(data: any) => Ajax.safePost<T>('/api/mo/group/batch/delete', data);//批量删除分组
export const assignGroup = <T>(data: any) => Ajax.safePost<T>(`/api/mo/group/assignRoles/${data.userId}`, data.body);//分配分组
export const getGroupUsers = <T>(data: any) => Ajax.safeGet<T>(`/api/user/user/${data.groupId}/userOrgTree`, data.body);//分组组织权限下的监控人员
export const getCurGroupUsers = <T>(data: any) => Ajax.safeGet<T>(`/api/mo/group/users/${data.groupId}`, null);//当前分组下的监控人员
export const assignUsers = <T>(data: any) => Ajax.safePost<T>(`/api/mo/group/assignUsers/${data.groupId}`, data.body);//分配监控人员

export const getGroupMonitors = <T>(data: any) => Ajax.safeGet<T>(`/api/mo/group/monitors/${data.groupId}`, null);//获取分组下的监控对象
export const getMonitorTree = <T>(data: any) => Ajax.safePost<T>('/api/mo/monitoring-object/monitor/tree', data); //监控对象树
export const assignMonitors = (data: any) => Ajax.safePost<boolean>(`/api/mo/group/assignMonitors/${data.groupId}`, data.body);//分配监控对象
export const checkDelMonitorGroup = <T>(data: any) => Ajax.safePost<T>('/api/mo/monitorGroup/checkGroupNum', data);//检验取消分配的监控对象的分组是否只剩一个

/**
 *用户管理
 */
// 系统用户列表
export const getUserList = <T>(data: any) => Ajax.safePostPage<T>('/api/user/user/page', data);//用户列表
export const addUser = (data: any) => Ajax.safeRepeatPost<boolean>('/api/user/user', data);//新增用户
export const updateUser = (data: any) => Ajax.safePut<boolean>(`/api/user/user/${data.userId}`, data.body);//修改用户
export const delUserMore = (data: any) => Ajax.safeDelete<boolean>('/api/user/user/batch', data);//批量删除用户
export const delUser = (data: any) => Ajax.safeDelete<boolean>(`/api/user/user/${data.userId}`, null);//单个删除用户
export const resetPwd = (data: any) => Ajax.safePost<boolean>(`/api/user/user/reset/${data.userId}`, null);//重置密码
export const getUserDetail = <T>(data: any) => Ajax.safeGet<T>(`/api/user/user/detail/${data.userId}`, null);//用户详细信息
export const checkUserName = (data: any) => Ajax.safeGet<boolean>(`/api/user/user/checkName`, data);//用户名校验
// 角色
export const userRoles = <T>(data: any) => Ajax.safeGet<T>(`/api/user/user/${data.userId}/role`, null);//用户权限下的角色列表
export const userPermission = <T>(data: any) => Ajax.safeGet<T>(`/api/user/role/${data.roleId}/permission`, { owner: data.owner });//角色下的权限列表
export const assignRoles = (data: any) => Ajax.safePost<boolean>(`/api/user/user/${data.userId}/role`, data.body);//分配角色
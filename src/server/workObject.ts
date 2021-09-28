import Ajax from '@/framework/utils/ajax';

/**
 *
 * @param params 转换成url查询参数
 * {id:1,name:'asdas'} => "?id=1&name=asdas"
 */
const jsonToQueryString = (params: any) => {
  let res = '';
  Object.keys(params).forEach((key: string, index: number) => {
    let marker = '';
    index == 0 ? (marker = '?') : (marker = '&');
    res += marker + key + '=' + params[key];
  });
  return res;
};

/**
 * 组织管理
 */

export const getCurOrgList = <T>(data: any) => Ajax.safePostPage<T>(`/api/user/organization/page`, data); //组织列表
export const getOrgDetail = <T>(data: any) => Ajax.safeGet<T>(`/api/user/organization/${data.id}`, null); //组织详情
export const addOrg = (data: any) => Ajax.safeRepeatPost<boolean>('/api/user/organization', data); //新增组织
export const updateOrg = (data: any) => Ajax.safePut<boolean>('/api/user/organization/update', data); //修改组织
export const insertOrg = (data: any) => Ajax.safePost<boolean>('/api/user/organization/insert', data); //插入组织
export const checkDelOrg = (data: any) => Ajax.safeGet<boolean>(`/api/user/organization/hw/canDelete/${data.id}`, null); //校验组织是否能删除

export const modifyWorkObject = <T>(data: any, id: string) => Ajax.safePut<T>(`/api/sa/work/object/${id}`, data); //修改作业对象
export const deleteWorkObject = <T>(id: string) => Ajax.safeDelete<T>(`/api/sa/work/object/${id}`, null); // 删除作业对象  作业对象id
export const deleteWorkObjectBatch = <T>(ids: number[]) => Ajax.safeDelete<T>('/api/sa/work/object/batch', ids); // 批量删除作业对象  作业对象[id]
export const getWorkObjectDetail = <T>(workId: string) => Ajax.safeGet<T>(`/api/sa/work/object/detail/${workId}`, null); // 获取作业对象详情信息  作业对象id
export const getDetailFacility = <T>(data: { workId: string; orgId: string }) => Ajax.safeGet<T>(`/api/mb/facility/getOrgFacilityInfo`, data); // 获取当前用户企业下所有未指定清运区域的设施，以及已经指定清运区域的设施数量  作业对象id
export const getFence = <T>(data: { workId: string; pid?: string }) => Ajax.safeGet<T>(`/api/sa/work/object/fence`, data); // 获取已经生效的作业对象围栏  workId ?pid

export const getEnterpriseList = <T>(data: any) => Ajax.safePostPage<T>('/api/ec/enterpriseList', data); // 获取企业列表

export const getTree = <T>(data: any) => Ajax.safeGet<T>(`/api/sa/work/approve/treeNode${jsonToQueryString(data)}`, null); // 获取树

export const getSectionsById = <T>(data: { enterpriseId: string }) => Ajax.safeGet<T>(`/api/sa/work/object/sectionList`, data); //enterpriseId,企业Id 获取标段下拉列表
export const getLeaderList = <T>(data: { enterpriseId: string }) => Ajax.safeGet<T>(`/api/sa/work/object/groupLeaderList`, data); //获取管理组长列表
export const getModeList = <T>(data?: { enterpriseId: string }) => Ajax.safeGet<T>(`/api/sa/workSetting/modeList/all`, null); //根据企业id获取模式
export const getWorkObjectList = <T>(data: any) => Ajax.safePostPage<T>(`/api/sa/work/object/page`, data); // 分页获取用户权限下的作业对象信息

export const addWorkObject = <T>(data: any) => Ajax.safeRepeatPost<T>('/api/sa/work/object', data); //新增作业对象

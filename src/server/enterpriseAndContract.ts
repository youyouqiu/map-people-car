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
export const delOrg = (data: any) => Ajax.safeDelete<boolean>(`/api/user/organization/hw/${data.id}`, null); //删除组织
export const delOrgMore = <T>(data: any) => Ajax.safeDelete<T>('/api/user/organization/hw/more', data); //批量删除组织

/**
 *
 * 企业管理
 */

export const getTree = <T>() => Ajax.safeGet<T>(`/api/sa/enterprise/user/enterpriseOrgTree`, null); // (企业用户进入企业列表)获取组织树
export const getOrgTree = <T>(data: any) => Ajax.safeGet<T>(`/api/sa/enterprise/tree`, data); // (企业用户进入企业列表)获取组织树
export const getOrgTree22 = <T>(data: any) => Ajax.safeGet<T>(`/api/sa/organization/tree`, data); //

export const getEnterpriseList = <T>(data: any) => Ajax.safePostPage<T>('/api/sa/enterprise/page', data); // 企业列表

export const addEnterpriset = <T>(data: any) => Ajax.safeRepeatPost<T>('/api/sa/enterprise', data); //新增企业

export const modifyEnterpriset = <T>(data: any) => Ajax.safePut<T>(`/api/sa/enterprise`, data); //修改企业

export const getEnterpriseDetail = <T>(id: string) => Ajax.safeGet<T>(`/api/sa/enterprise/${id}`, null); // 查询企业详情  企业id

export const deleteEnterprise = <T>(id: number) => Ajax.safeDelete<T>(`/api/sa/enterprise/${id}`, null); // 删除单个企业  企业id

export const deleteEnterpriseBatch = <T>(ids: number[]) => Ajax.safeDelete<T>('/api/sa/enterprise/batch', ids); // 批量删除企业  企业[id]

export const modifyStatus = <T>(id: string, status: 0 | 1) => Ajax.safePostPage<T>(`/api/sa/enterprise/auditStatus/${id}/${status}`, null); // 修改审核状态  企业id  status

export const canDelete = <T>(id: number) => Ajax.safeGet<T>(`/api/sa/enterprise/canDelete/${id}`, null); // 校验能否删除  企业id  status

export const checkName = <T>(id: number) => Ajax.safeGet<T>(`/api/sa/enterprise/checkName/${id}`, null); // 校验企业名称,true : 不存在，false：存在

export const queryByOrgId = <T>(orgIds: number[]) => Ajax.safePostPage<T>('/api/sa/enterprise/queryByOrgId', orgIds); // 根据组织查询企业信息-组织id集合为空查询权限下的企业

/**
 *
 * 合同管理 Contract contract
 */
export const getDetailByOrganization = <T>(id: string) => Ajax.safeGet<T>(`/api/sa/organization/${id}`, null); // 新增时获取初始化数据

export const checkExists = <T>(data: { name: string; pid: string }) => Ajax.safeGet<T>(`/api/sa/enterprise/checkName`, data); // 校验企业名称,true : 不存在，false：存在

export const getEnterpriseOrgTree = <T>() => Ajax.safeGet<T>(`/api/sa/enterprise/user/enterpriseOrgTree`, null); // 获取企业组织树

export const getContractList = <T>(data: any) => Ajax.safePostPage<T>('/api/sa/contract/section/page', data); // 合同列表

export const addContract = <T>(data: any) => Ajax.safePostPage<T>('/api/sa/contract/section/insert', data); //新增合同

export const modifyContract = <T>(data: { id: string; body: any }) => Ajax.safePost<T>(`/api/sa/contract/section/update/${data.id}`, data.body); //修改合同

export const deleteContract = <T>(id: string) => Ajax.safeDelete<T>(`/api/sa/contract/section/delete/${id}`, null); // 删除单个合同  合同id

export const deleteContractBatch = <T>(ids: number[]) => Ajax.safeDelete<T>('/api/sa/contract/section/batch/delete', ids); // 批量删除合同  合同[id]

export const getContractDetailMore = <T>(id: string) => Ajax.safeGet<T>(`/api/sa/contract/section/details/${id}`, null); // 查询合同详情  合同id

export const getContractDetail = <T>(id: string) => Ajax.safeGet<T>(`/api/sa/contract/section/details/${id}`, null); // 查询单个合同详情（基本信息、人员信息、车辆信息）  合同id

export const getPeopleDetail = <T>(id: string) => Ajax.safeGet<T>(`/api/sa/contract/section/peopleList?id=${id}`, null); // 查询人员信息 合同id

export const getVehicleDetail = <T>(id: string) => Ajax.safeGet<T>(`/api/sa/contract/section/vehicleList?id=${id}`, null); // 查询车辆信息  合同id

export const SearchContractList = <T>(data: any) => Ajax.safePostPage<T>('/api/sa/contract', data); // /contract/screen/list 合同信息筛选接口

export const isExists = <T>(params: { enterpriseId: string; contractNo?: string; id?: string; sectionName?: string; sectionNo?: string }) =>
    Ajax.safeGet<T>(`/api/sa/contract/section/exists${jsonToQueryString(params)}`, null); // 同一【主管单位】的合同号和标段编号、标段名称是否存在(true表示有重复的不可以添加和修改，false没有重复的可以添加和修改)  合同id

export const updateState = <T>(data: any) => Ajax.safePut<T>(`/api/sa/contract/section/updateState${jsonToQueryString(data)}`, null); //修改企业

export const getEnterpriseByOrgId = <T>(data: any[]) => Ajax.safePost<T>('/api/sa/enterprise/queryByOrgId', data); //根据组织查询企业信息-组织id集合为空查询权限下的企业

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
//作业管理
/**
 * 1.作业设置
 */
export const addMode = <T>(data: any) => Ajax.safeRepeatPost<T>('/api/sa/workSetting/addMode', data); //新增模式
export const addShift = <T>(data: any) => Ajax.safeRepeatPost<T>('/api/sa/workSetting/addShift', data); //新增班次

export const deleteMode = <T>(id: string) => Ajax.safeDelete<T>(`/api/sa/workSetting/deleteMode/${id}`, null); // 删除模式
export const deleteModeBatch = <T>(ids: number[]) => Ajax.safeDelete<T>('/api/sa/workSetting/deleteMode/batch', ids); // 批量删除模式
export const deleteShift = <T>(id: string) => Ajax.safeDelete<T>(`/api/sa/workSetting/deleteShift/${id}`, null); // 删除班次
export const deleteShiftBatch = <T>(ids: number[]) => Ajax.safeDelete<T>('/api/sa/workSetting/deleteShift/batch', ids); // 批量删除班次

export const getModeDetailById = <T>(id: string) => Ajax.safeGet<T>(`/api/sa/workSetting/detail/${id}`, null); // 通过id查询模式详情
export const getShiftDetailById = <T>(id: string) => Ajax.safeGet<T>(`/api/sa/workSetting/shiftDetail/${id}`, null); // 通过id查询班次详情
export const getModeListByOrgId = <T>(data: { sectionId: string }) => Ajax.safeGet<T>(`/api/sa/workSetting/modeList/all`, null); // 获取作业模式
export const getShiftListByOrgId = <T>(data: { sectionId: string }) =>
    Ajax.safeGet<T>(`/api/sa/workSetting/enterprise/shiftList${jsonToQueryString(data)}`, null); // 根据企业id获取班次

export const getModeList = <T>(data: any) => Ajax.safePostPage<T>('/api/sa/workSetting/mode/page', data); // 获取模式列表
export const getShiftList = <T>(data: any) => Ajax.safePostPage<T>('/api/sa/workSetting/shift/page', data); // 获取班次列表

export const updateMode = (data: any) => Ajax.safePut<boolean>('/api/sa/workSetting/updateMode', data); //修改模式
export const updateShift = (data: any) => Ajax.safePut<boolean>('/api/sa/workSetting/updateShift', data); //修改班次

export const positionTypeList = <T>(orgId: string) => Ajax.safeGet<T>(`/api/mb/dict/POSITION_TYPE/dropdown`, null); // 岗位类型下拉列表查询
export const vehicleTypeList = <T>(orgId: string) => Ajax.safeGet<T>(`/api/mb/dict/VEHICLE_CATEGORY/dropdown`, null); // 车辆类型下拉列表查询
export const vehicleTypeList2 = <T>(orgId: string) => Ajax.safeGet<T>(`/api/mb/dict/VEHICLE_TYPE/dropdown`, null); // 车辆类型下拉列表查询
// export const positionTypeList = <T>(orgId: string) => Ajax.safeGet<T>(`/api/mb/dict/POSITION_TYPE/dropdown/${orgId}`, null); // 岗位类型下拉列表查询

/**
 * 2.作业排班
 */
export const getParentTree = <T>(data: any) => Ajax.safeGet<T>(`/api/sa/monitorShift/basisTree`, data); // 获取树
export const modifyShift = (data: any) => Ajax.safePut<boolean>('/api/sa/monitorShift/change', data); //排班设置(新增，删除，修改)
export const checkShift = <T>(data: any) => Ajax.safePost<T>('/api/sa/monitorShift/check', data); //检查排班是否冲突
export const undoShift = <T>(data: { sectionId: string; workId: string }) => Ajax.safeGet<T>('/api/sa/monitorShift/deleteChange', data); //撤销申请
export const getMonitorShiftList = <T>(data: any) => Ajax.safePost<T>('/api/sa/monitorShift/list', data); // 获取作业对象的排班信息
export const queryModeMonitors = <T>(data: any) => Ajax.safePostPage<T>('/api/sa/monitorShift/queryModeMonitors', data); // 新增排班监控对象通过模式筛选

/**
 * 3.排班调整
 */

export const modifyShiftStatus = (data: any) => Ajax.safePut<boolean>('/api/sa/adjustmentShift/changeStatus', data); //修改班次状态
export const checkTemporary = <T>(data: any) => Ajax.safePost<T>('/api/sa/adjustmentShift/checkTemporary', data); //检查临班是否冲突

export const clearTemporary = (data: any) => Ajax.safePut<boolean>('/api/sa/adjustmentShift/clearTemporary', data); //清除一天的临班
export const deleteTemporary = (data: any) => Ajax.safePut<boolean>('/api/sa/adjustmentShift/deleteTemporary', data); //删除临班
export const setTemporary = (data: any) => Ajax.safePut<boolean>('/api/sa/adjustmentShift/setTemporary', data); //设置临班

export const fuzzySearchTree = <T>(data: { keyword: string; queryType: 0 | 1 }) => Ajax.safeGet<T>(`/api/sa/adjustmentShift/fuzzySearchTree`, data); // 排班模块的树查询

export const getMonitorMonthData = <T>(data: any) => Ajax.safePost<T>('/api/sa/adjustmentShift/getMonitorMonthData', data); //获取监控对象月历数据
export const getMonitorShift = <T>(data: any) => Ajax.safePost<T>('/api/sa/adjustmentShift/getMonitorShift', data); //获取监控对象一天的排班信息
export const getWorkMonthData = <T>(data: any) => Ajax.safePost<T>('/api/sa/adjustmentShift/getWorkMonthData', data); //获取作业对象月历数据
export const getWorkShift = <T>(data: any) => Ajax.safePost<T>('/api/sa/adjustmentShift/getWorkShift', data); //获取作业对象一天的排班信息

export const getLunar = <T>(data: any) => Ajax.safeGet<T>(`/api/sa/adjustmentShift/getChineseDate`, data);
export const checkWork = <T>(workId: string) => Ajax.safeGet<T>(`/api/sa//adjustmentShift/checkWork?workId=${workId}`, null);

export const temporaryMonitors = <T>(data: any) => Ajax.safePost<T>('/api/sa/adjustmentShift/temporaryMonitors', data); //获取临班可分配的监控对象
export const treeMonitors = <T>(data: any) => Ajax.safeGet<T>(`/api/sa/adjustmentShift/treeMonitors`, data); // 点击作业对象下展开树获取监控对象信息

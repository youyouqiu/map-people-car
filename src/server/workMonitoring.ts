
import Ajax from "@/framework/utils/ajax";

// 组织树相关
/**
 * 获取父级组织树
 * @param data:{bindingType,keyword,queryType}
 */
export const getParentTree = <T>(data: any) => Ajax.safePost<T>('/api/sa/work/monitoring/treeNode', data);
/**
 * 获取作业对象或者监控对象节点
 * @param data:{queryType:3-监控对象,7-作业对象}
 */
export const getMonitorTree = <T>(data: any) => Ajax.safePost<T>('/api/sa/work/monitoring/openTreeNode', data);

/**
 * 获取顶部统计数据
 * @param {
 * id,
 * queryType:0组织,1企业
 * }
 */
export const getTopStatistic = <T>(data: any) => Ajax.safeGet<T>(`/api/sa/work/monitoring/topStatistic/${data.id}/${data.queryType}`, null);

/**
 * 获取所有监控对象id集合
 * @param data 
 */
export const getBindingVehicleIds = <T>() => Ajax.safeGet<T>('/api/sa/work/monitoring/getBindingVehicleIds', null);



/**
 * 获取作业对象概况统计
 * @param data:{workId,workType}
 */
export const getWorkBasicStatistic = <T>(data: any) => Ajax.safePost<T>('/api/sa/work/monitoring/workObject/basicStatistic', data);

/**
 * 获取监控对象海量点信息
 * @param data:{
    monitorType:监控对象类型：0 车辆,1 人员
    queryType:查询类型：-1 按总排班数查询 0 查询脱岗数查询 1 按在岗数查询 2 查询当前班次
    statisticTime:统计时间
    workId:作业对象Id
    workType:作业对象类型：0 机动组 1 作业道路 2作业区域 3 清运区域 4 未排班
    }
 */
export const getMonitorMassPoint = <T>(data: any) => Ajax.safePost<T>('/api/sa/work/monitoring/massivePoint/byShift', data);

/**
 * 获取设施类型海量点信息
 * @param data:{
    queryType:查询类型：-1 全部 1 智慧设施
    typeId:类型ID
    workId:作业对象Id
    workType:作业对象类型：0 机动组 1 作业道路 2作业区域 3 清运区域 4 未排班 目前仅支持：3清运区域
    }
 */
export const getFacilityMassPoint = <T>(data: any) => Ajax.safePost<T>('/api/sa/work/monitoring/massivePoint/byType', data);

/**
 * 获取作业对象当班情况
 * @param data:{
    monitorType:监控对象类型：0 当班车辆,1 当班人员
    workId*:作业对象Id
    workType:作业对象类型：0 机动组 1 作业道路 2作业区域 3 清运区域 4 未排班
    }
 */
export const getWorkObjectCurShift = <T>(data: any) => Ajax.safePost<T>('/api/sa/work/monitoring/workObject/curShift', data);

/**
 * 获取监控对象弹窗信息
 * @param data:{monitorId}
 */
export const getMonitorWindowInfo = <T>(data: any) => Ajax.safeGet<T>('/api/sa/work/monitoring/monitorPoint', data);

/**
 * 获取标段及作业对象地图显示数据
 * @param data 
 */
export const getMapFenceInfo = <T>(data: any) => Ajax.safeGet<T>('/api/sa/work/object/fence', data);

/**
 * 点击监控对象节点,获取所属标段及作业对象地图显示数据
 * @param data 
 */
export const getMonitorWorkObject = <T>(workId: any) => Ajax.safeGet<T>(`/api/sa/work/monitoring/workObject/fence?workId=${workId}`, null);




/**
 * 获取月份日历里程数据 
 */
export const requestMileageStatistic = <T>(data: any) => Ajax.safePost<T>('/api/sa/work/playback/getMileageStatisticInfos', data);
/**
 * 作业回放轨迹 
 */
export const requestHistoryData = <T>(data: any) => Ajax.safePost<T>('/api/saoverload/work/playback/getHistoryData', data);
/**
 * 获取指定时间范围的作业对象接口 
 */
export const requestWorkObjects = <T>(data: any) => Ajax.safePost<T>('/api/sa/work/playback/getWorkPlayBackResp', data);
// export const requestWorkObjects = <T>(data: any) => Ajax.safePost<T>('/api/sa/work/playback/getWorkObjects', data);

/**
 * 根据经纬度获取地址信息
 */
export const requestAddressData = <T>(data: any) => Ajax.safePost<T>('/api/tool/address/locations', data);

/**
 * 获取监控对象图标
 */
export const requestMonitorIcon = <T>(data: any) => Ajax.safePost<T>('/api/mb/monitoring-object/query', data);


// 作业统计模块相关接口
/**
 * 获取作业对象基本信息
 */
export const getWorkInfo = <T>(data: IStatReq) => Ajax.safePost<T>('/api/sa/workObject/base/info', data);

interface IStatReq {
  modeId?: number,// 模式ID 该模式的班次记录,为空返回全部记录
  modeType: number | string,// 作业模式类型 0: 机器作业 1：人工作业 2: 垃圾清运 3: 垃圾转运
  orderField?: string,// example: shiftStartTime 排序字段: shiftStartTime, roadFinishRate
  orderType?: string,// example: ASC 排序方式: ASC, DESC
  sectionId: string,// 标段Id
  taskStatus?: number,// 任务状态 0: 未开始 1: 作业中 2: 已完成 3: 未完成 为空返回全部记录
  workId: string, // 作业对象Id 当作业对象类型是机动组时{ 企业id } _{ 标段ID }
  workType: number,//作业对象类型：0 机动组 1 作业道路 2作业区域 3 清运区域 4 未排班
}

/**
 * 获取作业进度
 */
export const getWorkProgress = <T>(data: IStatReq) => Ajax.safePost<T>('/api/sa/workObject/progress/stat', data);

/**
 * 获取作业进度详情列表
 */
export const getWorkProgressDetail = <T>(data: IStatReq) => Ajax.safePost<T>('/api/sa/workObject/progress/record', data);

/**
 * 获取车辆概况
 */
export const getVehicleGeneral = <T>(data: IStatReq) => Ajax.safePost<T>('/api/sa/workObject/vehicle/general/stat', data);

/**
 * 获取人员概况
 */
export const getPeopleGeneral = <T>(data: IStatReq) => Ajax.safePost<T>('/api/sa/workObject/people/general/stat', data);

/**
 * 获取设施概况
 */
export const getFacilityGeneral = <T>(data: IStatReq) => Ajax.safePost<T>('/api/sa/workObject/facility/stat', data);

/**
 * 获取作业模式数据
 */
export const getModeList = <T>(data: any) => Ajax.safePost<T>('/api/sa/workObject/modeList', data);

/**
 * 获取当班车辆统计数据
 */
export const getDutyVehicles = <T>(data: IStatReq) => Ajax.safePost<T>('/api/sa/workObject/vehicle/general/record', data);

/**
 * 获取当班人员统计数据
 */
export const getDutyPeople = <T>(data: IStatReq) => Ajax.safePost<T>('/api/sa/workObject/people/general/record', data);

/**
 * 获取班次作业详情
 */
export const getShiftRecordDetail = <T>(data: { shiftRecordId: string }) => Ajax.safeGet<T>('/api/sa/work/monitoring/getShiftRecordDetail', data);

/**
 * 根据监控对象获取当天排班班次下拉
 */
export const getShiftRecordDropdown = <T>(data: { monitorId: string }) => Ajax.safeGet<T>('/api/sa/shiftDetailLog/shiftRecord/dropdown', data);

/**
 * 点击标段或作业对象，获取海量点信息
 */
export const getMassivePoint = <T>(data: {
  sectionId: string,// 标段Id
  workId: string,// 作业对象Id 当作业对象类型是机动组时{企业id}_{标段ID}
  workType: number,// 作业对象类型：0 机动组 1 作业道路 2作业区域 3 清运区域 4 未排班
}) => Ajax.safePost<T>('/api/sa/work/monitoring/massivePoint/byTreeNode', data);


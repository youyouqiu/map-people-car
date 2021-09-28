import Ajax from "../framework/utils/ajax";

export type WorkDetail = {
    alarmTimes: 0, //报警次数
    enterpriseName: string, //企业名称
    id: number,
    mile: number, //班段内行驶里程，单位km
    modeId: number, //作业模式id，管理组长为0
    modeName: string, //作业模式名字
    modeType: number, //作业模式类型 0:机器作业 1：人工作业 2:垃圾清运 3:垃圾转运
    monitorId: number, //监控对象ID
    monitorType: number,
    oilWear: number, //班段油耗，单位L
    roadFinishRate: number, //路径完成度(%)
    sectionName: string, //标段名称
    shiftEndTime: string, //排班结束时间
    shiftName: string, //排班名称
    shiftStartTime: string, //排班开始时间
    time: string, //日期
    waterWear: number, //班段水耗，单位L
    workId: number, //作业对象id，机动组为0
    workName: string, //作业对象名称
    workTimeStr: string, //作业耗时，xxx分xx秒
    workType: number //1 作业道路 2作业区域 3 清运区域 4 机动组
}
export type WorkDetailListParams = {
  endTime: string,
  startTime: string,
  monitorId: string,
  page?: number,
  size?: number,
  orderField?: string,
  orderType?: string,
}
export type WorkDetailList = {
  data: WorkDetail[],
  total: number
}

// 获取作业统计详情
export const getWorkDetailList = <T = WorkDetailList>(data: WorkDetailListParams) => Ajax.safePostPage<T>('/api/sa/workStat/report/detail/page', data)
// 人工作业统计详情导出
export const exportPeopleWorkDetail = <T>(data: {
  endTime: string,
  enterpriseId: string,
  monitorId: string,
  monitorName: string,
  startTime: string
}) => Ajax.safePostPage<T>('/api/tool/offline/export/people/workStat/detail', data)
// 机器作业统计详情导出
export const exportMachineWorkDetail = <T>(data: {
  endTime: string,
  enterpriseId: string,
  monitorId: string,
  monitorName: string,
  startTime: string
}) => Ajax.safePostPage<T>('/api/tool/offline/export/vehicle/workStat/detail', data)



export type MachineListParams = {
  endTime: string,
  enterpriseId: number,
  keyword: string,
  orderField: string,
  orderType: string,
  page: number,
  size: number,
  startTime: string
} 
export type PeopleListParams = MachineListParams
export type PeopleList = {
  actualOperationCycle: number, // 实际作业周期
  alarmTimes: number, // 报警次数
  monitorId: number, // 监控对象id
  monitorName: string, // 工号
  name: string, // 姓名
  orgName: string, // 所属企业名称
  plannedOperationCycle: number, // 计划作业周期
  positionTypeName: string, // 岗位类型
  workFuel: number, // 作业油耗
  workMile: number, // 行驶里程
  workTime: number, // 作业总耗时
  workWater: number // 作业水耗
}[]
export type MachineList = {
  actualOperationCycle: number //实际作业周期
  alarmTimes: number //报警次数
  monitorId: number //监控对象id
  monitorName: string //车牌号
  orgName: string //所属企业名称
  plannedOperationCycle: number //计划作业周期
  vehicleTypeName: string //车辆类型
  workFuel: number //作业油耗
  workMile: number //行驶里程
  workTime: number //作业总耗时
  workWater: number //作业水耗
}[]
// 人员作业统计列表
export const getPeopleWorkList = <T = PeopleList>(data: PeopleListParams) => Ajax.safePostPage<T>('/api/sa/workStat/report/manual/stat/page', data)
// 导出人员作业统计列表
export const exportPeopleWorkList = <T = any>(data: {
  endTime: string,
  enterpriseId: string,
  enterpriseName: string,
  keyword: string,
  monitorType: number,
  startTime: string
}) => Ajax.safePostPage<T>('/api/tool/offline/export/manual/work/stat', data)
// 人员作业统计概况
export const getPeopleWorkSumary = <T = any>(data: any) => Ajax.safePostPage<T>('/api/sa/workStat/report/manual/stat/survey', data)
// 车辆作业统计概况
export const getMachineWorkSumary = <T = any>(data: any) => Ajax.safePostPage<T>('/api/sa/workStat/report/machine/stat/survey', data)
// 导出车辆作业统计列表
export const exportVehicleWorkList = <T = PeopleList>(data: any) => Ajax.safePostPage<T>('/api/tool/offline/export/machine/work/stat', data)
// 车辆作业统计列表
export const getMachineWorkList = <T = MachineList>(data: MachineListParams) => Ajax.safePostPage<T>('/api/sa/workStat/report/machine/stat/page', data)

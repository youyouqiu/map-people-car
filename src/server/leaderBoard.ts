import Ajax from '@/framework/utils/ajax';

export type AlarmList = {
  alarmNumList: { //报警事件列表
      alarmName: string,
      alarmNum: number,
      alarmType: 0
    }[],
  chainComparison: string, // 环比
  orgName: string, //企业名称
  todayAlarmNum: number //今日报警数量
}

//获取领导看板定位信息
export const getLocations = () => Ajax.safeGet<any>('/api/mb/leadBoard/getMonitorLocationInfo', null); 

//获取领导看板在线率相关数据
export const getOnlineRatio = () => Ajax.safeGet<{ 
  facilityOnline: number, //在线人员总数
  facilityTotal: number, //设施总数
  peopleOnline: number, //在线人员总数
  peopleTotal: number, //人员总数
  vehicleOnline: number, //在线车辆总数
  vehicleTotal: number, //车辆总数
}>('/api/mb/leadBoard/getOnlineData ', null); 


//获取报警统计数据
export const getAlarmList = () => Ajax.safeGet<AlarmList>('/api/sa/leadBoard/getAlarmStatics', null) 
 

//获取作业情况
export const getWorkData = () => Ajax.safeGet<{
  garbageCleanFinish: number, //垃圾清运作业完成班次数量
  garbageCleanTotal: number, //垃圾清运作业班次总数
  garbageTransportFinish: number, //垃圾转运作业完成班次数量
  garbageTransportTotal: number, //垃圾转运作业班次总数
  machineFinish: number, //机器作业完成班次数量
  machineTotal: number, //机器作业班次总数
  manualFinish: number, //人工作业完成班次数量
  manualTotal: number //人工作业班次总数
}>('/api/sa/leadBoard/getTodayJobView', null) 

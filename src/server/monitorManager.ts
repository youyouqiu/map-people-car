import Ajax from "../framework/utils/ajax";

/**
 * 获取通讯类型数据
 */
export const getProtocolType = <T>(data: any) => Ajax.safeGet<T>('/api/mb/information/configuration/entry/getProtocolTypeList', null);

/**
 * 获取企业树
 *  @param data:{query:string}
 */
export const getOrgTree = <T>(data: any) => Ajax.safeGet<T>('/api/user/organization/tree', data);


/**
 * 
 * @param data 个性化设置组织树
 */
// export const requestOrgTree = <T>(data: any) => Ajax.safeGet<T>('/api/sa/enterprise/user/enterpriseOrgTree', data);
export const requestOrgTree = <T>(data: any) => Ajax.safeGet(`/api/sa/enterprise/user/personalized/enterpriseOrgTree`, data);

/**
 * 获取分组组织树
 * @param queryType(1：组织 2：分组)
 * @param queryParam
 */
export const getGroupTree = <T>(data: any) => Ajax.safeGet<T>('/api/sa/enterprise/user/enterpriseOrgTree', data);
export const getUserGroupTree = <T>(data: any) => Ajax.safeGet<T>(`/api/mb/group/${data.userId}/tree`, data);

/**
 * 获取绑定表单所需数据(监控对象、终端号、SIM卡信息)
 */
// export const getBasicUnbindData = <T>() => Ajax.safeGet<T>('/api/mb/information/monitor/independent/configuration/basicUnbindData', null);

export const getBasicUnbindData = <T>() => Ajax.safeGet<T>('/api/mb/information/configuration/entry/basicUnbindData', null);

/**
 * 获取车辆极速绑定未注册设备数据
 */
export const getUnknownDevice = <T>(data: any) => Ajax.safePost<T>('/api/mb/information/configuration/entry/speed/unknownDevice', data);

/**
 * 校验车牌号是否已存在
 * @param id 车辆id(修改时传入)
 * @param number 车牌号
 */
export const repeatMonitorNumber = <T>(data: any) => Ajax.safePost<T>('/api/mb/monitoring-vehicle/checkVehicleNumber', data);

/**
 * 校验终端号是否已存在
 * @param deviceId 终端id(修改时传入)
 * @param deviceNumber 终端号
 */
export const repeatDeviceNumber = <T>(data: any) => Ajax.safeGet<T>('/api/mb/device/checkDeviceNumberIsCanBeUsed', data);

/**
 * 校验SIM卡号是否已存在
 * @param id SIM卡id(修改时传入)
 * @param number SIM卡号
 * 返回true不存在
 */
export const repeatSimNumber = <T>(data: any) => Ajax.safeGet<T>('/api/mb/simcard/checkNumber', data);

/**
 * 快速绑定（车辆）
 */
export const quickEntry = <T>(data: any) => Ajax.safeRepeatPost<T>('/api/mb/information/configuration/entry/quickEntry', data);

/**
 * 快速绑定(人员、设施)
 */
export const monitorQuickEntry = <T>(data: any) => Ajax.safeRepeatPost<T>('/api/mb/information/monitor/independent/configuration/quickEntry', data);

/**
 * 极速绑定(车辆)
 */
export const speedEntry = <T>(data: any) => Ajax.safeRepeatPost<T>('/api/mb/information/configuration/entry/speedEntry', data);

/**
 * 极速绑定(人员、设施)
 */
export const monitorSpeedEntry = <T>(data: any) => Ajax.safeRepeatPost<T>('/api/mb/information/monitor/independent/configuration/speedEntry', data);


/**
 * 获取车辆列表
 * @param data
 */
export const getVehicleList = <T>(data: any) => Ajax.safePostPage<T>('/api/mb/monitoring-vehicle/page', data);

/**
 * 解除车辆绑定
 * @param data
 */
export const cancelVehicleBind = <T>(data: any) => Ajax.safeDelete<T>(`/api/sa/monitoring-object/config/${data}`, null);

/**
 * 批量解除绑定
 * @param configIds:[configIds]
 */
export const batchCancelMonitorBind = <T>(data: any) => Ajax.safeDelete<T>('/api/sa/monitoring-object/config/monitorIds', data);

/**
 * 获取监控对象详情信息
 * @param monitorId
 */
export const getMonitorDetailInfo = <T>(monitorId: any) => Ajax.safeGet<T>(`/api/mb/monitoring-vehicle/id/${monitorId}`, null);

/**
 * 车辆类型数据
 * @param pid 父节点id集合,不指定则全部
 */
export const getVehicleType = <T>() => Ajax.safeGet<T>('/api/mb/dict/VEHICLE_TYPE/dropdown', null);

/**
 * 燃料类型数据
 * @param pid 父节点id集合,不指定则全部
 */
export const getFuelType = <T>(data?: any) => Ajax.safeGet<T>('/api/mb/dict/FUEL_TYPE/dropdown', data);

/**
 * 删除图片
 * @param photo 图片url,多个用','分割
 */
export const deleteImg = <T>(data: any) => Ajax.safeDelete<T>('/api/mb/monitoring-vehicle/photo', data);

/**
 * 修改密码
 */
export const editPassword = <T>(data: any) => Ajax.safePost<T>(`/api/user/user/password/${data.userId}`, data)

/**
 * 删除车辆
 */
export const deleteVehicle = <T>(vehicleId: string) => Ajax.safeDelete<T>(`/api/sa/monitoring-object/vehicle/${vehicleId}`, null);

/**
 * 批量删除车辆
 */
export const batchDeleteVehicle = <T>(data: Array<string>) => Ajax.safeDelete<T>('/api/sa/monitoring-object/vehicle/batch', data);


/**
 * 新增车辆
 */
export const addVehicle = <T>(data: any) => Ajax.safeRepeatPost<T>('/api/mb/monitoring-vehicle/vehicle', data);

/**
 * 修改车辆基本信息
 */
export const editVehicleBasicInfo = <T>(data: any) => Ajax.safePut<T>('/api/mb/monitoring-vehicle/vehicle', data);

/**
 * 从业人员
 */
export const getProfessionalList = <T>(orgId: string) => Ajax.safeGet<T>(`/api/mb/professional/list/${orgId}`, null);

/**
 * 车辆信息详情
 */
export const getDetailInfo = <T>(monitorId: string) => Ajax.safeGet<T>(`/api/mb/monitoring-vehicle/detail/${monitorId}`, null);

/**
 * 修改绑定信息界面信息
 */
export const getEditBindInfo = <T>(monitorId: string) => Ajax.safeGet<T>(`/api/mb/information/configuration/entry/detail/${monitorId}`, null);

/**
 * 修改绑定信息
 */
export const updateBindInfo = <T>(data: any) => Ajax.safePut<T>('/api/mb/information/configuration/entry/config', data);

/**
 * 获取车辆类型
 */
export const getVehicleTypeValue = <T>(id: any) => Ajax.safeGet<T>(`/api/mb/monitoring-vehicle/getVehicleTypeInfo/${id}`, null);

// 综合设置相关
/**
 * 获取外设下拉列表
 */
export const getPeripheralDropdown = <T>() => Ajax.safeGet<T>('/api/mb/dict/peripheral/dropdown', null);

/**
 * 获取参考对象下拉列表(外设轮询)
 */
export const getMonitorDropdown = <T>(data: any) => Ajax.safeGet<T>('/api/mb/dict/peripheral/dropdown/monitor', data);

/**
 * 获取监控对象已设置的参数信息(外设轮询)
 */
export const getPollingMonitorInfo = <T>(monitorId: string) => Ajax.safeGet<T>(`/api/mb/dict/peripheral/bind/${monitorId}`, null);

/**
 * 获取监控对象已设置的参数信息(io传感器设置)
 */
export const getIoMonitorInfo = <T>(monitorId: string) => Ajax.safeGet<T>(`/api/mb/io/getBind/${monitorId}`, null);

/**
 * 获取监控对象已设置的参数信息(终端设置)
 */
export const getMonitorParamInfo = <T>(data: any) => Ajax.safePost<T>('/api/mb/commandParam/getCommandSetting', data);

/**
 * 获取参考对象下拉列表(传感器设置)
 */
export const getIoSetTMonitorDropdown = <T>(data: any) => Ajax.safeGet<T>('/api/mb/io/dropdown/monitor', data);

/**
 * 清除外设轮询
 */
export const clearPolling = <T>(monitorId: any) => Ajax.safeDelete<T>(`/api/mb/dict/peripheral/bind/${monitorId}`, null);

/**
 * 保存外设轮询
 */
export const savePolling = <T>(monitorId: string, data: any) => Ajax.safePost<T>(`/api/mb/dict/peripheral/bind/${monitorId}`, data);

/**
 * 获取检测功能类型下拉列表
 */
export const getSwitchTypeDropdown = <T>(data: any) => Ajax.safePost<T>('/api/mb/io/getNoUseSwitchType', data);

/**
 * 读取终端参数
 * commandType  指令类型11:通讯参数; 12:终端参数; 14:位置汇报参数;
 * monitorIds	[...]
 * sessionId
 * upgradeType
 */
export const getParamByCommandType = <T>(data: any) => Ajax.safePost<T>('/api/mb/commandParam/getParamByCommandType', data);

/**
 * 报存终端参数
 * commandType 指令类型11:通讯参数; 12:终端参数; 14:位置汇报参数;
 * monitorIds	[...]
 * paramJson json参数字符串
 */
export const saveParamByCommandType = <T>(data: any) => Ajax.safePost<T>('/api/mb/commandParam/saveParamByCommandType', data);

/**
 * 下发终端参数
 * commandType 指令类型11:通讯参数; 12:终端参数; 14:位置汇报参数;
 * monitorIds	[...]
 * sessionId
 * upgradeType
 */
export const sendParamByCommandType = <T>(data: any) => Ajax.safePost<T>('/api/mb/commandParam/sendParamByCommandType', data);

/**
 * 获取参数设置参考对象下拉列表
 */
export const getParamSetMonitorDropdown = <T>(data: any) => Ajax.safeGet<T>('/api/mb/commandParam/dropdown/monitor', data);

/**
 * 获取参数下发状态
 * {
 * functionPage 功能页面
 * monitorId 监控对象id
 * }
 */
export const getParamStatus = <T>(data: any) => Ajax.safePost<T>('/api/mb/direct/getStatus', data);

/**
 * 保存io传感器设置
 */
export const saveIoParam = <T>(data: any) => Ajax.safePost<T>('/api/mb/io/bind', data);

/**
 * 更新io传感器设置
 */
export const updateIoParam = <T>(data: any) => Ajax.safePost<T>('/api/mb/io/updateBind', data);

/**
 * 获取监控对象是否在线
 */
export const monitorOnline = <T>(monitorId: any) => Ajax.safeGet<T>(`/api/mb/commandParam/isOnline/${monitorId}`, null);

/**
 * 监控对象,终端设置恢复默认
 */
export const restoreDefaultData = <T>(data: any) => Ajax.safePost<T>('/api/mb/commandParam/deleteParamByCommandType', data);

/**
 * 更新监控对象,终端设置状态
 */
export const updateMonitorSetStatus = <T>(data: any) => Ajax.safePost<T>('/api/mb/monitoring-vehicle/updateMonitorSettingStatus', data);







// 人员管理
/**
 * 获取人员列表
 * @param data
 */
export const getPeopleList = <T>(data: any) => Ajax.safePostPage<T>('/api/mb/professional/page', data);

/**
 * 新增人员
 */
export const addPeople = <T>(data: any) => Ajax.safeRepeatPost<T>('/api/sa/professionals', data);

/**
 * 修改人员
 */
export const updatePeople = <T>(data: any) => Ajax.safePut<T>(`/api/sa/professionals/${data.id}`, data);

/**
 * 人员是否是机动组成员功能切换
 * @param memberType:0 否,1 是
 */
export const updateMember = <T>(data: any) => Ajax.safePut<T>(`/api/sa/professionals/updateMember/${data.id}?memberType=${data.memberType}`, data);

/**
 * 校验人员工号是否重复
 * @param id	修改校验时传
 * @param jobNumber 工号
 * @param orgId 所属企业id
 */
export const repeatPeopleName = <T>(data: any) => Ajax.safePost<T>('/api/mb/professional/checkProfessionalsByJobNumber', data);

/**
 * 校验身份证号是否重复
 * @param identity 身份证号
 */
export const repeatIdentity = <T>(data: any, id: string) => Ajax.safePost<T>(`/api/mb/professional/checkIdentity/${data}?professionalId=${id}`, null);

/**
 * 获取人员绑定信息界面信息
 */
export const getPeopleBindInfo = <T>(monitorId: string) => Ajax.safeGet<T>(`/api/mb/information/monitor/independent/configuration/detail/${monitorId}`, null);

/**
 * 获取人员详情信息(修改界面)
 * id 
 */
export const getPeopleInfo = <T>(id: string) => Ajax.safeGet<T>(`/api/mb/professional/${id}`, null);

/**
 * 获取人员详情信息
 * id 
 */
export const getPeopleDetail = <T>(id: string) => Ajax.safeGet<T>(`/api/mb/professional/detailContainsConfig/${id}`, null);

/**
 * 删除人员
 */
export const deletePeople = <T>(id: string) => Ajax.safeDelete<T>(`/api/sa/monitoring-object/professionals/${id}`, null);

/**
 * 批量删除人员
 */
export const batchDeletePeople = <T>(data: Array<string>) => Ajax.safeDelete<T>('/api/sa/monitoring-object/professionals/batch', data);


/**
 * 获取岗位类型下拉列表数据
 */
export const getPositionType = <T>() => Ajax.safeGet<T>('/api/mb/dict/POSITION_TYPE/dropdown', null);

/**
 * 解除绑定(人员、设施)
 * @param configIds:[configIds]
 */
export const cancelMonitorBind = <T>(data: any) => Ajax.safeDelete<T>(`/api/mb/information/monitor/independent/configuration/config/${data}`, null);

/**
 * 修改绑定信息
 */
export const updateMonitorBindInfo = <T>(data: any) => Ajax.safePut<T>('/api/mb/information/monitor/independent/configuration/config', data);

/**
 * 获取人员对应岗位类型
 */
export const getPeoplePositionType = <T>(id: any) => Ajax.safePost<T>(`/api/mb/professional/getPositionType?id=${id}`, null);




// 设施管理

/**
 * 设施列表
 */
export const getFacilityList = <T>(data: any) => Ajax.safePostPage<T>('/api/mb/facility/page', data);

/**
 * 新增设施
 */
export const addFacility = <T>(data: any) => Ajax.safeRepeatPost<T>('/api/mb/facility/insert', data);

/**
 * 修改设施
 */
export const updateFacility = <T>(data: any) => Ajax.safePut<T>(`/api/mb/facility/${data.id}`, data);

/**
 * 根据id获取设施详情信息
 * @param id
 */
export const getFacilityDetailInfo = <T>(id: string) => Ajax.safeGet<T>(`/api/sa/facility/${id}`, null);

/**
 * 删除设施
 */
export const deleteFacility = <T>(id: string) => Ajax.safeDelete<T>(`/api/mb/facility/${id}`, null);

/**
 * 设施类型数据
 */
export const getFacilityType = <T>(data?: any) => Ajax.safeGet<T>('/api/mb/dict/FACILITY_TYPE/dropdown', data);

/**
 * 批量删除
 */
export const deleteFacilities = <T>(data: any) => Ajax.safePost<T>(`/api/mb/information/monitor/independent/configuration/deleteFacilities`, data);

/**
 * 批量解除绑定
 */
export const LiftBind = <T>(data: any) => Ajax.safePost<T>('/api/mb/information/monitor/independent/configuration/config/facilities/monitorIds', data);

/**
 * 校验设施编号是否重复
 * @param data 
 */
export const repeatFacilityName = <T>(data: any) => Ajax.safePost<T>('/api/mb/facility/checkFacilityNumber', data);

/**
 * 检测监控对象是否有排班
 * @param data 
 */
export const checkShiftByMonitorId = <T>(monitorId: any) => Ajax.safeGet<T>(`/api/sa/monitorShift/checkShiftByMonitorId?monitorId=${monitorId}`, null);




// 车辆管理,综合设置传感器相关接口

/**
 * 获取监控对象已设置的传感器绑定信息
 */
// eslint-disable-next-line @typescript-eslint/class-name-casing
interface sensorParam {
  monitorId: string,// 监控对象id
  sensorId: number,// 传感器id,油量是1，水量是2，载重是3
  sensorOutId?: number,//传感器外设id：65(0x41油量主)、66(0x42油量副)、67(0x43水量主)、68(0x44水量副) 112(0x70载重主) 113(0x71载重副)

}
export const getSensorBindInfo = <T>(data: sensorParam) => Ajax.safePost<T>('/api/mb/sensorMonitor/getSensorBindInfo', data);

/**
 * 获取参考对象数据
 * @param data 
 */
export const getListDropdownMonitor = <T>(data: any) => Ajax.safePost<T>('/api/mb/sensorMonitor/listDropdownMonitor', data);


/**
 * 设置监控对象已设置的传感器绑定信息
 * @param data 
 */
export const addSensorBindInfo = <T>(data: any) => Ajax.safePut<T>('/api/mb/liquid/sensor/bind', data);
/**
 * 更新监控对象已设置的传感器绑定信息
 * @param data 
 */
export const updateSensorBindInfo = <T>(data: any) => Ajax.safePut<T>('/api/mb/liquid/sensor/update', data);

// 载重传感器
export const addLoadSensorBindInfo = <T>(data: any) => Ajax.safePost<T>('/api/mb/load/sensor/bind', data);
export const updateLoadSensorBindInfo = <T>(data: any) => Ajax.safePut<T>('/api/mb/load/sensor/bind', data);

/**
 * 解绑传感器绑定信息
 * @param data 
 */
export const unbindSensor = <T>(data: any) => Ajax.safeDelete<T>('/api/mb/sensorMonitor/unbindSensor', data);

/**
 * 计算标定
 * @param data 
 */
export const addCalibration = <T>(data: any) => Ajax.safePut<T>('/api/mb/liquid/sensor/addCalibration', data);

/**
 * 新增标定数据
 * @param data 
 */
export const addCalibrationData = <T>(data: any) => Ajax.safePut<T>('/api/mb/sensorMonitor/addCalibration', data);

/**
 * 获取最后标定时间
 * @param data 
 */
export const getLastCalibrationTime = <T>(data: any) => Ajax.safeGet<T>('/api/mb/sensorMonitor/getLastCalibrationTime', data);

/**
 * 查看标定
 * @param data 
 */
export const getCalibration = <T>(data: any) => Ajax.safeGet<T>('/api/mb/sensorMonitor/getCalibration', data);

/**
 * 计算理论容积
 * @param data 
 */
export const calTheoryVol = <T>(data: any) => Ajax.safePost<T>('/api/mb/liquid/sensor/calTheoryVol', data);



// 音视频设置相关接口

/**
 * 查询视频参数设置
 * @param monitorId 
 */
export const getMonitorVideoSetting = <T>(monitorId: string) => Ajax.safeGet<T>(`/api/cp/monitor/video/${monitorId}`, null);

/**
 * 保存视频参数设置
 * @param data 
 */
export const saveMonitorVideoSetting = <T>(data: any) => Ajax.safePost<T>('/api/cp/monitor/video', data);

/**
 * 获取参考对象数据
 * @param data 
 */
export const getVideoListDropdownMonitor = <T>(data: any) => Ajax.safeGet<T>('/api/cp/monitor/video/references', data);

/**
 * 获取监控对象当前最新下发记录
 * @param data 
 */
export const getVideoLastSendMsg = <T>(monitorId: string) => Ajax.safeGet<T>(`/api/cp/command/parameter/get/lastSendMsg?type=0&monitorId=${monitorId}`, null);



// 标定修正模块接口

/**
 * 获取标定图形数据
 * @param data 
 */
export const getEchartInfo = <T>(data: {
  startTime: string// 开始时间 格式yyyyMMddHHmmss
  endTime: string,// 结束时间 格式yyyyMMddHHmmss
  monitorId: string,// 监控对象id
  sensorId: number,//传感器id,油量是1，水量是2，载重是3
  sensorOutId: number,// 传感器外设id：65(0x41油量主) 、66(0x42油量副) 、67(0x43水量主) 、68(0x44水量副) 112(0x70载重主) 113(0x71载重副)
}) => Ajax.safePost<T>('/api/mb/liquid/sensor/getOilInfo', data);

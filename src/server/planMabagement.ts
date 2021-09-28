import Ajax from "@/framework/utils/ajax";

/**
 *  厂区管理
 */
export const factoryQuery = (data: any) => Ajax.safePostPage('/api/cc/factory/page', data) // 厂区列表查询
export const factoryAdd = (data: any) => Ajax.safeRepeatPost('/api/cc/factory', data) // 新增厂区
export const factoryUpdate = (data: any) => Ajax.safePut(`/api/cc/factory/${data.id}`, data) // 修改厂区
export const factoryDetail = (data: any) => Ajax.safeGet(`/api/cc/factory/${data.id}/info`, {}) // 厂区详情
export const factoryDelete = (data: any) => Ajax.safeDelete(`/api/cc/factory/${data.id}`, {}) // 删除厂区
export const factoryDeleteAll = (data: any) => Ajax.safePost(`/api/cc/factory/batch/delete`, data) // 批量删除厂区
export const factoryVehicleTree = <T>(data: any = {}) => Ajax.safeGet<T>(`/api/cc/factory/vehicle/tree`, data) // 获取权限下未被厂区绑定的组织-分组-车辆树
export const factoryEnable = (data: any = {}) => Ajax.safeGet(`/api/cc/factory/enable/${data.orgId}`, {}) // 企业下 启用状态的厂区

/**
 *  客户管理
 */
export const customerQuery = (data: any) => Ajax.safePostPage('/api/cc/customer/list', data) // 客户列表查询
export const customerAdd = (data: any) => Ajax.safeRepeatPost('/api/cc/customer', data) // 新增客户
export const customerUpdate = (data: any) => Ajax.safePut(`/api/cc/customer/update`, data) // 修改客户
export const customerDetail = (data: any) => Ajax.safeGet(`/api/cc/customer/${data.id}/info`, {}) // 客户详情
export const customerDelete = (data: any) => Ajax.safeDelete(`/api/cc/customer/${data.id}`, {}) // 删除客户
export const customerDeleteAll = (data: any) => Ajax.safePost(`/api/cc/customer/batch/delete`, data) // 批量删除客户
export const customerEnable = (data: any) => Ajax.safeGet(`/api/cc/customer/enable/orgId/list`, data) // 企业下 启用状态的客户
/**
 *  工地管理
 */
export const siteQuery = (data: any) => Ajax.safePostPage('/api/cc/construction/site/page', data) // 工地列表查询
export const siteAdd = (data: any) => Ajax.safeRepeatPost('/api/cc/construction/site', data) // 新增工地
export const siteUpdate = (data: any) => Ajax.safePut(`/api/cc/construction/site/${data.id}`, data) // 修改工地
export const siteDetail = (data: any) => Ajax.safeGet(`/api/cc/construction/site/${data.id}/info`, {}) // 工地详情
export const siteDelete = (data: any) => Ajax.safeDelete(`/api/cc/construction/site/${data.id}`, data) // 删除工地
export const siteDeleteAll = (data: any) => Ajax.safePost(`/api/cc/construction/site/batch/delete`, data) // 批量删除工地
export const siteEnable = (data: any) => Ajax.safeGet(`/api/cc/construction/site/enable/${data.id}`, {}) // 查询客户下的工地


/**
 * 属性管理 - 砼强度
 */
export const concreteListData = (param: any) => Ajax.safePostPage(`/api/cc/CONCRETE_STRENGTH/page`, param)  // 列表
export const concreteFreeze = (param: any) => Ajax.safePost(`/api/cc/CONCRETE_STRENGTH/${param.id}/disable`, null)  // 冻结
export const concreteUnFreeze = (param: any) => Ajax.safePost(`/api/cc/CONCRETE_STRENGTH/${param.id}/enable`, null)  // 取消冻结
export const concreteAdd = (param: any) => Ajax.safeRepeatPost(`/api/cc/CONCRETE_STRENGTH`, param)  // 新增
export const concreteModify = (param: any) => Ajax.safePost(`/api/cc/CONCRETE_STRENGTH/${param.id}`, param)  // 保存
export const concreteFreezeBatch = (param: any) => Ajax.safePost(`/api/cc/CONCRETE_STRENGTH/disable`, param)  // 批量冻结
export const concreteUnFreezeBatch = (param: any) => Ajax.safePost(`/api/cc/CONCRETE_STRENGTH/enable`, param)  // 批量取消冻结
export const concreteDetail = (param: any) => Ajax.safeGet(`/api/cc/CONCRETE_STRENGTH/${param.id}`, null)  // 详情
export const concreteDropdown = <T>() => Ajax.safeGet<T>(`/api/cc/CONCRETE_STRENGTH/dropdown`, null)  // 砼强度下拉列表查询
/**
 * 属性管理 - 特性
 */
export const characterListData = (param: any) => Ajax.safePostPage(`/api/cc/features/page`, param); //列表
export const characterAdd = (param: any) => Ajax.safePostPage(`/api/cc/features`, param); //新增
export const characterUpdate = (param: any) => Ajax.safePut(`/api/cc/features/${param.id}`, param); //更新
export const characterDisable = (param: any) => Ajax.safePostPage(`/api/cc/features/${param.id}/disable`, param) //冻结
export const characterEnable = (param: any) => Ajax.safePostPage(`/api/cc/features/${param.id}/enable`, param) //取消冻结
export const characterAlldisable = (param: any) => Ajax.safePost(`/api/cc/features/disable`, param) //批量冻结
export const characterAllenable = (param: any) => Ajax.safePostPage(`/api/cc/features/enable`, param) //批量取消冻结
export const characterVague = (param: any) => Ajax.safePostPage(`/api/cc/features/vague`, param) //维护特性模糊查询
// /contract/features/batch/save
export const characterSave = (param: any) => Ajax.safePostPage(`/api/cc/contract/features/batch/save/${param.contractId}`, param.data);

/**
 * 属性管理 - 坍落度
 */
export const slumpListData = (param: any) => Ajax.safePostPage(`/api/cc/COLLAPSE_DEGREE/page`, param)  // 列表
export const slumpFreeze = (param: any) => Ajax.safePost(`/api/cc/COLLAPSE_DEGREE/${param.id}/disable`, null)  // 冻结
export const slumpUnFreeze = (param: any) => Ajax.safePost(`/api/cc/COLLAPSE_DEGREE/${param.id}/enable`, null)  // 取消冻结
export const slumpAdd = (param: any) => Ajax.safeRepeatPost(`/api/cc/COLLAPSE_DEGREE`, param)  // 新增
export const slumpModify = (param: any) => Ajax.safePost(`/api/cc/COLLAPSE_DEGREE/${param.id}`, param)  // 保存
export const slumpFreezeBatch = (param: any) => Ajax.safePost(`/api/cc/COLLAPSE_DEGREE/disable`, param)  // 批量冻结
export const slumpUnFreezeBatch = (param: any) => Ajax.safePost(`/api/cc/COLLAPSE_DEGREE/enable`, param)  // 批量取消冻结
export const slumpDetail = (param: any) => Ajax.safeGet(`/api/cc/COLLAPSE_DEGREE/${param.id}`, null)  // 详情
export const slumpDropdown = <T>() => Ajax.safeGet<T>(`/api/cc/COLLAPSE_DEGREE/dropdown`, null)  // 坍落度下拉列表查询
/**
 * 属性管理 - 施工部位
 */
export const constructionListData = (param: any) => Ajax.safePostPage(`/api/cc/CONSTRUCTION_PART/page`, param)  // 列表
export const constructionFreeze = (param: any) => Ajax.safePost(`/api/cc/CONSTRUCTION_PART/${param.id}/disable`, null)  // 冻结
export const constructionUnFreeze = (param: any) => Ajax.safePost(`/api/cc/CONSTRUCTION_PART/${param.id}/enable`, null)  // 取消冻结
export const constructionAdd = (param: any) => Ajax.safeRepeatPost(`/api/cc/CONSTRUCTION_PART`, param)  // 新增
export const constructionModify = (param: any) => Ajax.safePost(`/api/cc/CONSTRUCTION_PART/${param.id}`, param)  // 保存
export const constructionFreezeBatch = (param: any) => Ajax.safePost(`/api/cc/CONSTRUCTION_PART/disable`, param)  // 批量冻结
export const constructionUnFreezeBatch = (param: any) => Ajax.safePost(`/api/cc/CONSTRUCTION_PART/enable`, param)  // 批量取消冻结
export const constructionDetail = (param: any) => Ajax.safeGet(`/api/cc/CONSTRUCTION_PART/${param.id}`, null)  // 详情
export const constructionPartDropdown = <T>() => Ajax.safeGet<T>(`/api/cc/CONSTRUCTION_PART/dropdown`, null)  // 施工部位下拉列表查询
/**
 * 属性管理 - 计价方式
 */
export const valuationListData = (param: any) => Ajax.safePostPage(`/api/cc/PRICING_METHOD/page`, param)  // 列表
export const valuationFreeze = (param: any) => Ajax.safePost(`/api/cc/PRICING_METHOD/${param.id}/disable`, null)  // 冻结
export const valuationUnFreeze = (param: any) => Ajax.safePost(`/api/cc/PRICING_METHOD/${param.id}/enable`, null)  // 取消冻结
export const valuationAdd = (param: any) => Ajax.safeRepeatPost(`/api/cc/PRICING_METHOD`, param)  // 新增
export const valuationModify = (param: any) => Ajax.safePost(`/api/cc/PRICING_METHOD/${param.id}`, param)  // 保存
export const valuationFreezeBatch = (param: any) => Ajax.safePost(`/api/cc/PRICING_METHOD/disable`, param)  // 批量冻结
export const valuationUnFreezeBatch = (param: any) => Ajax.safePost(`/api/cc/PRICING_METHOD/enable`, param)  // 批量取消冻结
export const valuationDetail = (param: any) => Ajax.safeGet(`/api/cc/PRICING_METHOD/${param.id}`, null)  // 详情
export const valuationPartDropdown = <T>() => Ajax.safeGet<T>(`/api/cc/PRICING_METHOD/dropdown`, null)  // 计价方式下拉列表查询
/**
 * 属性管理 - 砂浆价格
 */
export const mortarPriceListData = (param: any) => Ajax.safePostPage(`/api/cc/MORTAR_PRICE/page`, param)  // 列表
export const mortarPriceFreeze = (param: any) => Ajax.safePost(`/api/cc/MORTAR_PRICE/${param.id}/disable`, null)  // 冻结
export const mortarPriceUnFreeze = (param: any) => Ajax.safePost(`/api/cc/MORTAR_PRICE/${param.id}/enable`, null)  // 取消冻结
export const mortarPriceAdd = (param: any) => Ajax.safeRepeatPost(`/api/cc/MORTAR_PRICE`, param)  // 新增
export const mortarPriceModify = (param: any) => Ajax.safePost(`/api/cc/MORTAR_PRICE/${param.id}`, param)  // 保存
export const mortarPriceFreezeBatch = (param: any) => Ajax.safePost(`/api/cc/MORTAR_PRICE/disable`, param)  // 批量冻结
export const mortarPriceUnFreezeBatch = (param: any) => Ajax.safePost(`/api/cc/MORTAR_PRICE/enable`, param)  // 批量取消冻结
export const mortarPriceDetail = (param: any) => Ajax.safeGet(`/api/cc/MORTAR_PRICE/${param.id}`, null)  // 详情
export const mortarPriceDropdown = <T>() => Ajax.safeGet<T>(`/api/cc/MORTAR_PRICE/dropdown`, null)  // 砂浆价格下拉列表查询
/**
 * 属性管理 - 浇筑方式
 */
export const pouringMethodListData = (param: any) => Ajax.safePostPage(`/api/cc/POURING_METHOD/page`, param)  // 列表
export const pouringMethodFreeze = (param: any) => Ajax.safePost(`/api/cc/POURING_METHOD/${param.id}/disable`, null)  // 冻结
export const pouringMethodUnFreeze = (param: any) => Ajax.safePost(`/api/cc/POURING_METHOD/${param.id}/enable`, null)  // 取消冻结
export const pouringMethodAdd = (param: any) => Ajax.safeRepeatPost(`/api/cc/POURING_METHOD`, param)  // 新增
export const pouringMethodModify = (param: any) => Ajax.safePost(`/api/cc/POURING_METHOD/${param.id}`, param)  // 保存
export const pouringMethodFreezeBatch = (param: any) => Ajax.safePost(`/api/cc/POURING_METHOD/disable`, param)  // 批量冻结
export const pouringMethodUnFreezeBatch = (param: any) => Ajax.safePost(`/api/cc/POURING_METHOD/enable`, param)  // 批量取消冻结
export const pouringMethodDetail = (param: any) => Ajax.safeGet(`/api/cc/POURING_METHOD/${param.id}`, null)  // 详情
export const pouringDropdown = (param: any) => Ajax.safeGet(`/api/cc/POURING_METHOD/dropdown`, param)  // 通用下拉列表查询

/**
 * 合同管理 - 合同列表 合同信息
 */
export const contractListData = (param: any) => Ajax.safePostPage(`/api/cc/contract`, param)  // 列表
export const contractDelete = (param: any) => Ajax.safeDelete(`/api/cc/contract/single/delete/${param.id}`, null)  // 删除
export const contractAudit = (param: any) => Ajax.safePut(`/api/cc/contract/single/audit/${param.id}`, null)  // 审核
export const contractComplete = (param: any) => Ajax.safePut(`/api/cc/contract/update/complete/${param.id}`, null)  // 完成
export const contractRestart = (param: any) => Ajax.safePut(`/api/cc/contract/update/restart/${param.id}`, null)  // 重启
export const contractSuspended = <T>(param: any) => Ajax.safePut<T>(`/api/cc/contract/update/suspended/${param.id}`, null)  // 暂停
export const contractAdd = (param: any) => Ajax.safeRepeatPost(`/api/cc/contract/insert`, param)  // 新增
export const contractModify = (param: any) => Ajax.safePut(`/api/cc/contract/insert`, param)  // 修改
export const contractDeleteBatch = (param: any) => Ajax.safeDelete(`/api/cc/contract/batch/delete`, param)  // 批量删除
export const contractDetail = (param: any) => Ajax.safeGet(`/api/cc/contract/single/one/${param.id}`, null)  // 详情
export const contractStrengthAdd = (param: any) => Ajax.safePost(`/api/cc/contract/strength/batch/save/${param.contractId}`, param.data)  // 详情 新增维护强度
export const contractConstructionAdd = (id: any, param: any) => Ajax.safePost(`/api/cc/contract/road/work/save/${id}`, param)  // 详情 新增施工单位
export const contractEngineeringAdd = (id: any, param: any) => Ajax.safePost(`/api/cc/contract/engineering/batch/save/${id}`, param)  // 详情 新增工程明细
export const contractConstructionDropdown = (id: string) => Ajax.safeGet(`/api/cc/contract/dropdown/${id}`, null)  // 施工单位
/**
 * 校验是否工程名称存在
 * @param param {contractNumber:合同号,id:合同id,organizationId:组织id,projectName:工程名称}
 */
export const projectNameExist = <T>(param: { contractNumber?: string; id?: string; organizationId?: string; projectName: string }) =>
  Ajax.safeGet<T>(`/api/cc/contract/exists`, param)  // 
/**
 * 
 */
/**
 * 合同管理 - 合同列表 合同审核
 */
export const contractCensorData = (param: any) => Ajax.safePostPage(`/api/cc/contract/audit/screen/list`, param)  // 列表
export const contractAuditBatch = (param: any) => Ajax.safePost(`/api/cc/contract/batch/audit`, param)  // 批量审核
/**
 * 地图监控
 */
export const mapMonitorCustomer = (param: any) => Ajax.safeGet(`/api/cc/customer/enable/orgId/list`, param); //新增标注-所属客户
export const mapMonitorAllMarker = (param: any) => Ajax.safePost(`/api/cc/mapMonitoring/marks`, param);           //地图marker
export const mapMonitorFactory = (param: any) => Ajax.safeGet(`/api/cc/mapMonitoring/markInfo/factory/${param.id}`, null) //厂区详情
export const mapMonitorSite = (param: any) => Ajax.safeGet(`/api/cc/mapMonitoring/markInfo/site/${param.id}`, null); //工地详情
export const mapMonitorStoreMarkStatus = (param: any) => Ajax.safePut(`/api/cc/mapMonitoring/markStatus`, param); //存储用户标注
export const mapMonitorMarkStatus = (param: any) => Ajax.safeGet(`/api/cc/mapMonitoring/markStatus`, param);//标注状态
export const chinaArea = (param: any) => Ajax.safeGet(`/api/tool/china/area`, param); //查询行政区划代码
export const mapMonitorCustomColumn = (param: any) => Ajax.safeGet(`/api/mo/custom/column/setting_REALTIME_MONITORING`, param)//自定列读取
export const mapMonitorColumnSubmit = (param: any) => Ajax.safePost(`/api/mo/custom/column/customColumnConfig`, param);//自定义列设置
export const mapMonitorGetColumn = (param: any) => Ajax.safePost(`/api/mo/custom/column`, param) //获取定制列
export const mapMonitorTree = (param: any) => Ajax.safePost('/api/mo/monitoring-object/monitor/tree', param); //组织树
export const treeMonitors = (param: any) => Ajax.safeGet(`/api/mo/group/monitors/${param.id}`, null) // 获取分组下的监控对象
export const treeState = (param: any) => Ajax.safePost(`/api/cc/mapMonitoring/monitor/treeState/${param.state}`, null); //根据监控对象状态获取监控对象树
export const monitorCount = <T>(param: any) => Ajax.safeGet<T>(`/api/mo/monitoring-object/user/monitorCount`, param); //获取用户权限下监控对象数量
export const ztrrGroupIds = (param: any) => Ajax.safeGet(`/api/mo/group/groupIds/monitor/${param.id}`, null); //通过监控对象id获取分组
export const originaMonitor = (param: any) => Ajax.safeGet(`/api/mo/monitoring-object/${param.id}`, null) //原始数据监控对象详情
export const orgCount = (param: any) => Ajax.safeGet(`/api/mo/monitoring-object/monitorCount/${param.id}`, null); //企业数量
export const getFactiory = (param: any) => Ajax.safeGet(`/api/cc/factory/vehicle/${param.id}`, null);
export const treeOff = (param: any) => Ajax.safeGet(`/api/cc/mapMonitoring/monitors/${param.id}`, param);//获取分组下离线状态
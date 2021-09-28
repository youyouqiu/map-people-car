// 基本信息
export const vehicleInfoColumn = [{
    name: '车牌号',
    key: 'number',
}, {
    name: '别名',
    key: 'aliases',
}, {
    name: '车牌颜色',
    key: 'plateColorStr',
}, {
    name: '车辆颜色',
    key: 'vehicleColorStr',
}, {
    name: '所属企业',
    key: 'orgName',
    colSpan: 3,
}, {
    name: '车辆类型',
    key: 'vehicleType',
}, {
    name: '燃料类型',
    key: 'fuelType',
}, {
    name: '车辆状态',
    key: 'isStart',
}, {
    name: '维修状态',
    key: 'stateRepair'
}, {
    name: '核定载人数',
    key: 'numberLoad',
}, {
    name: '核定承载量',
    key: 'loadingQuality',
}, {
    name: '车辆联系人',
    key: 'vehicleOwner',
}, {
    name: '联系电话',
    key: 'vehicleOwnerPhone',
}, {
    name: '车辆保险单号',
    key: 'vehicleInsuranceNumber',
    colSpan: 3,
}, {
    name: '保养里程数(km)',
    key: 'maintainMileage',
}, {
    name: '保养有效期',
    key: 'maintainValidityStr',
}, {
    name: '保险有效期',
    key: 'insuranceValidityStr',
    colSpan: 3,
}, {
    name: '当前总里程数(km)',
    key: 'currentTotalMileage',
}, {
    name: '年审有效期',
    key: 'annualReviewValidityStr',
}, {
    name: '车台安装日期',
    key: 'vehiclePlatformInstallDateStr',
    colSpan: 3,
}, {
    name: '备注',
    key: 'remark',
    colSpan: 7,
}];

/** 绑定信息 */
// 对象详情
export const monitorInfoColumn = [{
    name: '车牌号',
    key: 'number',
}, {
    name: '车辆类型',
    key: 'vehicleType',
}, {
    name: '所属企业',
    key: 'orgName',
}];

// 终端详情
export const deviceInfoColumn = [{
    name: '终端号',
    key: 'deviceNumber',
}, {
    name: '终端厂商',
    key: 'terminalManufacturer',
}, {
    name: '所属企业',
    key: 'deviceOrgName',
}, {
    name: '通讯类型',
    key: 'deviceTypeStr',
}];

// SIM卡详情
export const simInfoColumn = [{
    name: '终端手机号',
    key: 'simCardNumber',
}, {
    name: 'ICCID',
    key: 'iccid',
}, {
    name: '所属企业',
    key: 'simCardOrgName',
}, {
    name: '运营商',
    key: 'operator',
}, {
    name: '真实SIM卡号',
    key: 'realNumber',
}];

// 服务期限
export const dateInfoColumn = [{
    name: '计费日期',
    key: 'billingDateStr',
}, {
    name: '到期日期',
    key: 'expireDateStr',
}]
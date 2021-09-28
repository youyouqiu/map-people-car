// 基本信息
export const peopleInfoColumn = [{
    name: '姓名',
    key: 'name',
}, {
    name: '工号',
    key: 'jobNumber',
}, {
    name: '身份证号',
    key: 'identity',
}, {
    name: '所属企业',
    key: 'orgName',
    colSpan: 3,
}, {
    name: '性别',
    key: 'gender',
}, {
    name: '服务企业',
    key: 'serviceCompany',
    colSpan: 3,
}, {
    name: '民族',
    key: 'national',
}, {
    name: '岗位类型',
    key: 'positionTypeName'
}, {
    name: '工作状态',
    key: 'state',
}, {
    name: '籍贯',
    key: 'nativePlace',
}, {
    name: '入职时间',
    key: 'hireDateStr',
}, {
    name: '机动组成员',
    key: 'manoeuvreMember',
}, {
    name: '血型',
    key: 'bloodType',
}, {
    name: '联系电话',
    key: 'phone',
}, {
    name: '手机2',
    key: 'phoneTwo',
}, {
    name: '邮箱',
    key: 'email',
}, {
    name: '紧急联系人',
    key: 'emergencyContact',
}, {
    name: '紧急联系电话',
    key: 'emergencyContactPhone',
}, {
    name: '生日',
    key: 'birthday',
}, {
    name: '住址',
    key: 'address',
    colSpan: 3,
}, {
    name: '所属地域',
    key: 'regional',
}];

// 驾驶证信息
export const drivingLicenseColumn = [{
    name: '操作证号',
    key: 'operationNumber',
}, {
    name: '发证机关',
    key: 'operationAgencies',
}, {
    name: '驾驶证号',
    key: 'drivingLicenseNo',
}, {
    name: '发证机关',
    key: 'drivingAgencies',
}, {
    name: '驾照类别',
    key: 'drivingType',
}, {
    name: '准驾有效期起',
    key: 'drivingStartDateStr',
}, {
    name: '准驾有效期至',
    key: 'drivingEndDateStr',
}, {
    name: '提前提醒天数',
    key: 'remindDays',
}]

/** 绑定信息 */
// 对象详情
export const monitorInfoColumn = [{
    name: '工号',
    key: 'jobNumber',
}, {
    name: '姓名',
    key: 'name',
}, {
    name: '岗位类型',
    key: 'positionTypeName',
}, {
    name: '所属企业',
    key: 'orgName',
    colSpan: 5,
}];

// 终端详情
export const deviceInfoColumn = [{
    name: '终端号',
    key: 'deviceNumber',
}, {
    name: '终端厂商',
    key: 'terminalManufacturer',
}, {
    name: '终端型号',
    key: 'terminalType',
}, {
    name: '通讯类型',
    key: 'deviceTypeStr',
}, {
    name: '所属企业',
    key: 'deviceOrgName',
    colSpan: 7,
}];

// SIM卡详情
export const simInfoColumn = [{
    name: '终端手机号',
    key: 'simCardNumber',
}, {
    name: 'ICCID',
    key: 'iccid',
}, {
    name: '真实SIM卡号',
    key: 'realNumber',
}, {
    name: '运营商',
    key: 'operator',
}, {
    name: '所属企业',
    key: 'simCardOrgName',
}];

// 服务期限
export const dateInfoColumn = [{
    name: '计费日期',
    key: 'billingDateStr',
}, {
    name: '到期日期',
    key: 'expireDateStr',
}]
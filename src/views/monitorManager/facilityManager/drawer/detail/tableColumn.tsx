// 基本信息
export const facilityInfoColumn = [{
    name: '设施编号',
    key: 'number',
}, {
    name: '别名',
    key: 'alias',
}, {
    name: '设施类型',
    key: 'facilityType',
}, {
    name: '设施颜色',
    key: 'facilityColor',
}, {
    name: '所属企业',
    key: 'orgName',
    colSpan: 3,
}, {
    name: '联系人',
    key: 'facilityContacts',
}, {
    name: '联系电话',
    key: 'contactsPhone',
}, {
    name: '设施状态',
    key: 'status',
}, {
    name: '维修状态',
    key: 'fixStatus',
}, {
    name: '定位安装日期',
    key: 'installTime',
    nameWidth: 140,
    colWidth: 200,
}, {
    name: '清运区域',
    key: 'workName',
}, {
    name: '备注',
    key: 'remark',
    colSpan: 7
}];

export const addressInfoColumn = [{
    name: '经度',
    key: 'longitude',
}, {
    name: '纬度',
    key: 'latitude',
}, {
    name: '省份',
    key: 'province',
}, {
    name: '地市',
    key: 'city',
}, {
    name: '区县',
    key: 'district',
}, {
    name: '详细地址',
    key: 'address',
}, {
    name: '描述',
    key: 'describe',
}]

/** 绑定信息 */
// 对象详情
export const monitorInfoColumn = [
    {
        name: '设施编号',
        key: 'number',
    }, {
        name: '设施类型',
        key: 'facilityType',
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
    name: '终端型号',
    key: 'terminalType',
}, {
    name: '通讯类型',
    key: 'deviceTypeStr',
}, {
    name: '所属企业',
    key: 'orgName',
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
    key: 'billingDate',
}, {
    name: '到期日期',
    key: 'expireDate',
}]
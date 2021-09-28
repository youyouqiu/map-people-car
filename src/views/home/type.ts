//用户信息
export interface IUserDetails {
    administrativeOffice?: string;
    authorizationDate?: string;
    createDataTime?: string;
    duty?: string;
    editable?: number;
    gender?: number;
    groupId?: string;
    groupName?: string;
    id?: number;
    identity?: string;
    industryId?: number;
    industryName?: string;
    isActive?: number;
    mail?: string;
    mobile?: string;
    enterpriseId?: number;
    organizationName?: string;
    photo?: string;
    realName?: string;
    roleId?: string;
    roleName?: string;
    sourceNum?: number;
    updateDataTime?: string;
    updateDataUsername?: string;
    [key: string]: any;
}

//角色信息
export interface IRoles {
    code?: string;
    createDataTime?: string;
    createDataUsername?: string;
    description?: string;
    editable?: number;
    id?: string;
    name?: string;
    priority?: number;
    updateDataTime?: string;
    updateDataUsername?: string;
}

//报警详情信息
export interface IAlarmDetails {
    alarmDataSource?: number;
    alarmStartAddress?: string;
    alarmTime: string;
    alarmType: string;
    alarmTypeStr: string;
    endTimeStr: string;
    monitorId: string;
    monitorName: string;
    remark: string;
    startTimeStr: string;
    status: string;
    taskNumber: string;
    threshold: number;
    alarmStartLocation: string;
}

//报警处理参数
export interface IDealParams {
    alarmTime: string;//报警时间
    alarmType: string;//报警类型
    dealOfMsg?: string;//短信内容 处理内容
    handlerType: string;//处理方式
    monitorId: string;//监控对象id
    taskNumber: string;
}

//快捷查询枚举
export enum EDaySearch {

}
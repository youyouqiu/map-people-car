/**
 * 审批详情数据
 */
export interface IAudit {
    currentMonitorShift: Array<monitorShiftItem>;
    currentWorkObjectDetail: workObjectItem;
    lastApproveWorkObjectDetail: workObjectItem;
}

export interface workObjectItem {
    id: string
    workName: string
    workType: number
    sectionId: string
    sectionName: string
    orgId: string
    orgName: string
    enterpriseId: string
    enterpriseName: string
    reviewStatus: number
    contactName: string
    contactPhone: string
    groupLeaderId: string
    updateDataTime: string
    updateDataUsername: string
    reviewTime: string
    reviewUser: string
    remark: string
    longLat: any
    workModeList: any,
    manualCleaning: string,
    sprinkleWork: string,
    sweepWork: string,
    monitorCategory: string,
    roadWidth: string,
    roadLength: string,
    groupLeader: string,
    area: string,
    num: number,
    extendObj: any
}


export interface monitorShiftItem {
    id: string
    flag: number
    monitorId: string
    workId: string
    sectionId: string
    modeId: string
    modeName: string
    monitorType: number
    effectiveFlag: number
    passFlag: number
    changeType: number
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
    mondayShow: any
    tuesdayShow: any
    wednesdayShow: any
    thursdayShow: any
    fridayShow: any
    saturdayShow: any
    sundayShow: any
    createDataTime: string

}

export interface workModeItem {
    monitorCategory: string,
    unitType: string,
    workModeId: string,
    workModeName: string,
    workNum: string,
    workType: number
}
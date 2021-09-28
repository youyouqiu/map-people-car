import { repeatMonitorNumber, repeatDeviceNumber, repeatSimNumber, repeatPeopleName, repeatFacilityName } from '@/server/monitorManager';
import { getStore } from '@/framework/utils/localStorage';

/**
 * 校验车牌号是否已存在
 */
export const repeatMonitorNumberFun = (rule: any, value: string, callback: Function) => {
    if (!value) {
        callback();
        return;
    }
    const param = new URLSearchParams();
    param.set('number', value);
    repeatMonitorNumber<boolean>(param).then(res => {
        if (res) {
            callback();
        } else {
            callback('车牌号已存在');
        }
    });
}

/**
 * 校验人员工号是否重复
 */
export const repeatPeopleNumberFun = (rule: any, value: string, callback: Function) => {
    if (!value) {
        callback();
        return;
    }
    const param = {
        jobNumber: value,
        orgId: getStore('orgId') || ''
    }
    repeatPeopleName<boolean>(param).then(res => {
        if (res) {
            callback();
        } else {
            callback('工号已存在');
        }
    });
}

/**
 * 校验设施编号号是否重复
 */
export const repeatFacilityNameFun = (rule: any, value: string, callback: Function) => {
    if (!value) {
        callback();
        return;
    }
    const param = new URLSearchParams();
    param.set('number', value);
    repeatFacilityName<boolean>(param).then(res => {
        if (res) {
            callback();
        } else {
            callback('设施编号已存在');
        }
    });
}

/**
* 校验终端号是否已存在
*/
export const repeatDeviceNumberFun = (rule: any, value: string, callback: Function) => {
    if (!value) {
        callback();
        return;
    }
    repeatDeviceNumber<boolean>({ deviceNumber: value }).then(result => {
        if (result) {
            callback();
        } else {
            callback('终端号已存在');
        }
    });
}

/**
 * 校验SIM卡号是否已存在
 */
export const repeatSimNumberFun = (rule: any, value: string, callback: Function) => {
    if (!value) {
        callback();
        return;
    }
    repeatSimNumber<boolean>({ number: value }).then(result => {
        if (result) {
            callback();
        } else {
            callback('SIM卡号已存在');
        }
    });
}


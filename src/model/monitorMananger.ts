import { Model } from "../framework/d.ts/model"
import { getStore } from "../framework/utils/localStorage";
import { getGroupTree, getOrgTree, getBasicUnbindData, getDetailInfo, getPeopleDetail, getVehicleType, getProtocolType, getPositionType, getFacilityType } from '@/server/monitorManager';
import { getTreeRoot } from "@/framework/utils/tree";

export type StateType = {
    unbindData: {
        vehicleList: Array<object>;
        deviceList: Array<object>;
        peopleList: Array<object>;
        thingList: Array<object>;
        simCardList: Array<object>;
        facilityList: Array<object>
    };
    groupTreeData: Array<object>;
    vehicleTypeData: Array<IOption>;
    protocolTypeData: Array<IOption>;
    postTypeData: Array<IOption>;
    facilityTypeData: Array<IOption>;
}

export interface IOption {
    id: string;
    name: string;
    val?: string;
    enabled?: boolean;
}
interface IItem {
    type: string;
    monitorCount: number;
    children?: Array<IItem>;
}

const MonitorMananger: Model<StateType> = {
    namespace: 'monitorMananger',
    defaultState: {
        unbindData: {// 未绑定的数据信息(车辆、终端号、SIM卡号)
            vehicleList: [],
            peopleList: [],
            thingList: [],
            deviceList: [],
            simCardList: [],
            facilityList: []
        },
        groupTreeData: [],// 企业树数据
        vehicleTypeData: [],// 车辆类型数据
        protocolTypeData: [],// 通讯类型数据
        /**
         * 人员管理
         */
        postTypeData: [],// 岗位类型数据
        /**
         * 设施管理
         */
        facilityTypeData: [],// 设施类型
    },
    reducers: {
        start: function (state: StateType) {
            return state;
        },
        default: (state: StateType) => {
            const token = getStore('token');
            if (token) {
                return Object.assign({}, state, { logined: true });
            }
            return state;
        },
        refreshData: function (state: StateType, action: any) {
            const { payload: { key, data } } = action;
            (state as any)[key] = data;
            return state;
        },
    },
    sagas: {
        // 获取未绑定的数据信息
        *getBindDataEvery(saga: any) {
            const result: any = yield saga.call(getBasicUnbindData);
            if (result) {
                const newInfo = result;
                delete newInfo.orgName;
                delete newInfo.orgId;
                yield saga.put({
                    type: 'monitorMananger/refreshData',
                    payload: {
                        key: 'unbindData',
                        data: newInfo
                    }
                })
            }
        },
        // 获取分组树数据
        *getGroupTreeDataEvery(saga: any) {
            const result: any = yield saga.call(getGroupTree);
            if (result) {
                yield saga.put({
                    type: 'monitorMananger/refreshData',
                    payload: {
                        key: 'groupTreeData',
                        data: result
                    }
                })
            }
        },
        // 获取车辆类型下拉框数据
        *getVehicleTypeDataEvery(saga: any) {
            const result: any = yield saga.call(getVehicleType);
            if (result) {
                yield saga.put({
                    type: 'monitorMananger/refreshData',
                    payload: {
                        key: 'vehicleTypeData',
                        data: result
                    }
                })
            }
        },
        // 获取通讯类型下拉框数据
        *getProtocolTypeDataEvery(saga: any) {
            const result: any = yield saga.call(getProtocolType);
            if (result) {
                yield saga.put({
                    type: 'monitorMananger/refreshData',
                    payload: {
                        key: 'protocolTypeData',
                        data: result
                    }
                })
            }
        },
        // 获取岗位类型下拉框数据
        *getPostTypeDataEvery(saga: any) {
            const result: any = yield saga.call(getPositionType);
            if (result) {
                yield saga.put({
                    type: 'monitorMananger/refreshData',
                    payload: {
                        key: 'postTypeData',
                        data: result
                    }
                })
            }
        },
        // 获取设施类型下拉框数据
        *getFacilityTypeDataEvery(saga: any) {
            const result: any = yield saga.call(getFacilityType);
            if (result) {
                yield saga.put({
                    type: 'monitorMananger/refreshData',
                    payload: {
                        key: 'facilityTypeData',
                        data: result
                    }
                })
            }
        },
    }
}

export default MonitorMananger;
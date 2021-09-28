/**
 * 作业回放
 */
import { Model } from "../framework/d.ts/model"
import { getStore } from "../framework/utils/localStorage";
import { Moment } from 'moment'
import { requestMileageStatistic, requestHistoryData, requestWorkObjects } from "@/server/workMonitoring";
import MarkerWrapper from "@/common/amapContainer/marker";

export type StateType = {
  mileageData: IMileageItem[] | null,
  currentDate: Moment | null,
  currentSelectDate: Moment | null,
  trackMonitorTreeData: INodeItem[] | null,
  currentSelectTreeNode: INodeItem | null,
  workObjectData: IWorkObjecItem[] | null,

  monitorTrackData: any[],

  mapSection: Map<string, MarkerWrapper> | null,
  mapWorkObject: Map<string, MarkerWrapper> | null,
  mapMonitor: Map<string, MarkerWrapper> | null,
  isVideo: boolean
  currentChangeDate: any;
}

export interface INodeItem {
  id: string;
  key: string;
  name: string;
  pId: string;
  title: string;
  type: string;
  value: number;
  workType: number | null;// 作业对象类型
  workId: number | null;// 作业对象id
  [propertys: string]: any
}

export interface IMileageItem {
  day: string;
  gpsMile: number;
  mileage: number;
  monitorId: number;
}
export interface IWorkObjecItem {
  fenceLongLat: string;
  name: string;
  workType: number;
}

const WorkPlayTrack: Model<StateType> = {
  namespace: 'workPlayTrack',
  defaultState: {
    mileageData: [], //月份日历里程数据
    currentDate: null, //设置日历为当前月
    currentSelectDate: null,// 当前选中的时间
    trackMonitorTreeData: [],//作业回放轨迹
    currentSelectTreeNode: null,// 当前选中的组织树节点
    workObjectData: null,// 指定时间范围的作业对象接口

    monitorTrackData: [],// 轨迹

    mapSection: null,// 地图显示标段
    mapWorkObject: null,// 地图上显示的作业对象(线路,区域,清运区域)
    mapMonitor: null,// 地图上显示的监控对象集合
    isVideo: false,//实施回放是否有数据

    currentChangeDate: null,
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
    setMileageData: (state: StateType, action: any) => {
      state.mileageData = action.data;
      return state;
    },
    setHistoryData: (state: StateType, action: any) => {
      state.monitorTrackData = action.data;
      return state;
    },
    // 更新state数据
    refreshData: function (state: StateType, action: any) {
      const { payload: { key, data } } = action;
      (state as any)[key] = data;
      return state;
    },
  },
  sagas: {
    *changeWorkObjectDataEvery(saga: any, data: any) {
      yield saga.put({
        type: 'workPlayTrack/refreshData',
        payload: {
          key: 'workObjectData',
          data: data.payload
        }
      })
    },
    // 设置日历为当前月
    *changeCurrentDateEvery(saga: any, data: any) {
      yield saga.put({
        type: 'workPlayTrack/refreshData',
        payload: {
          key: 'currentDate',
          data: data.payload
        }
      })
    },
    // 改变选中的日期
    *changeSelectDateEvery(saga: any, data: any) {
      yield saga.put({
        type: 'workPlayTrack/refreshData',
        payload: {
          key: 'currentSelectDate',
          data: data.payload
        }
      })
    },
    // 改变选中树节点
    *changeSelectTreeEvery(saga: any, data: any) {
      yield saga.put({
        type: 'workPlayTrack/refreshData',
        payload: {
          key: 'currentSelectTreeNode',
          data: data.payload
        }
      })
    },
    // 获取月份日历里程数据
    *getMonthlyMileageEvery(saga: any, data: any) {
      const result = yield saga.call(requestMileageStatistic, data.payload);
      if (result) {
        yield saga.put({
          type: "workPlayTrack/setMileageData",
          data: result
        })
      }
    },
    // 作业回放轨迹
    *getHistoryDataEvery(saga: any, data: any) {
      const result = yield saga.call(requestHistoryData, data.payload);
      if (result) {
        yield saga.put({
          type: "workPlayTrack/setHistoryData",
          data: result
        })
      }
    },
  }
}

export default WorkPlayTrack;
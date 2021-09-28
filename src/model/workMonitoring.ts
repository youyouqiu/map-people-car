/**
 * 作业监控
 */
import { Model } from "../framework/d.ts/model"
import { getStore } from "../framework/utils/localStorage";

export type StateType = {
  currentSelectTreeNode: INodeItem | null,
  mapCenterPos: Array<number> | null;
  mapSection: object | null,
  mapWorkObject: Map<string, { workId: string, type: string, path: Array<Array<number>> }> | null,
  mapMonitor: {
    type: string,// 监控对象类型(people:人员,vehicle:车辆,facility:人员)
    data: Array<object>,
    setFitView: boolean | undefined,// 地图是否聚焦显示
  } | null,
  focusMonitor: object | null,
  focusingTrack: object | null,
  workObjectList: Array<object>,
  activeWorkId: string,
  subscribeMonitorIds: Array<string>,
  monitorStatusMap: {
    update: boolean,
    data: Map<string, number> | null
  },
  topChangeStatus: boolean;
  detailMonitorInfo: any;
  videoParam: any;
}

export interface INodeItem {
  id: string;
  key: string;
  name: string;
  pId: string;
  title: any;
  type: string;
  value: number;
  workType: number | null;// 作业对象类型
  workId: number | null;// 作业对象id
  [propertys: string]: any
}

const WorkMonitoring: Model<StateType> = {
  namespace: 'workMonitoring',
  defaultState: {
    currentSelectTreeNode: null,// 当前选中的组织树节点
    topChangeStatus: false,// 控制顶部统计数据状态更新
    /**
     * 组织树
     */
    subscribeMonitorIds: [],// 当前订阅的监控对象id集合
    monitorStatusMap: {
      update: false,
      data: null
    },// 存储监控对象状态 key:monitorid,value:status
    /**
     * 地图模块
     */
    mapCenterPos: null,// 地图中心点经纬度数据
    mapSection: null,// 地图显示标段
    mapWorkObject: null,// 地图上显示的作业对象(线路,区域,清运区域)
    mapMonitor: null,// 地图上显示的监控对象集合
    focusMonitor: null,// 聚焦的监控对象信息
    focusingTrack: null,// 聚焦跟踪的对象信息
    /**
     * 作业内容模块
     */
    workObjectList: [],// 作业内容显示数据
    activeWorkId: '',// 当前显示的作业对象id(点击监控对象的时候,设置为它所属的作业对象id)
    detailMonitorInfo: null,// 作业详情模块显示的监控对象信息
    videoParam: null //实时视频监控对象信息
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
    // 更新state数据
    refreshData: function (state: StateType, action: any) {
      const { payload: { key, data } } = action;
      if (key === 'monitorStatusMap') {
        const newStatus = !state.monitorStatusMap.update;
        (state as any)[key] = {
          update: newStatus,
          data
        };
      } else {
        (state as any)[key] = data;
      }

      return state;
    },
  },
  sagas: {
    // 改变选中树节点
    *changeSelectTreeEvery(saga: any, data: any) {
      yield saga.put({
        type: 'workMonitoring/refreshData',
        payload: {
          key: 'currentSelectTreeNode',
          data: data.payload
        }
      })
    },
    // 改变作业详情模块显示的监控对象信息
    *changeDetailMonitorInfoEvery(saga: any, data: any) {
      yield saga.put({
        type: 'workMonitoring/refreshData',
        payload: {
          key: 'detailMonitorInfo',
          data: data.payload
        }
      })
    },
    // 顶部更新状态改变
    *changeTopChangeStatusEvery(saga: any, data: any) {
      yield saga.put({
        type: 'workMonitoring/refreshData',
        payload: {
          key: 'topChangeStatus',
          data: data.payload
        }
      })
    },
    // 改变当前订阅的监控对象id集合
    *changeSubscribeMonitorIdsEvery(saga: any, data: any) {
      yield saga.put({
        type: 'workMonitoring/refreshData',
        payload: {
          key: 'subscribeMonitorIds',
          data: data.payload
        }
      })
    },
    // 改变监控对象状态
    *changeMonitorStatusMapEvery(saga: any, data: any) {
      yield saga.put({
        type: 'workMonitoring/refreshData',
        payload: {
          key: 'monitorStatusMap',
          data: data.payload
        }
      })
    },
    // 改变地图中心点
    *changeMapCenterPosEvery(saga: any, data: any) {
      yield saga.put({
        type: 'workMonitoring/refreshData',
        payload: {
          key: 'mapCenterPos',
          data: data.payload
        }
      })
    },
    // 改变地图聚焦监控对象信息
    *changeFocusMonitorEvery(saga: any, data: any) {
      yield saga.put({
        type: 'workMonitoring/refreshData',
        payload: {
          key: 'focusMonitor',
          data: data.payload
        }
      })
    },
    // 改变地图显示标段
    *changeMapSectionEvery(saga: any, data: any) {
      yield saga.put({
        type: 'workMonitoring/refreshData',
        payload: {
          key: 'mapSection',
          data: data.payload
        }
      })
    },
    // 改变地图显示作业对象
    *changeMapWorkObjectEvery(saga: any, data: any) {
      yield saga.put({
        type: 'workMonitoring/refreshData',
        payload: {
          key: 'mapWorkObject',
          data: data.payload
        }
      })
    },
    // 改变地图显示海量点
    *changeMapMonitorEvery(saga: any, data: any) {
      yield saga.put({
        type: 'workMonitoring/refreshData',
        payload: {
          key: 'mapMonitor',
          data: data.payload
        }
      })
    },
    // 改变地图聚焦跟踪对象信息
    *changeFocusingTrackEvery(saga: any, data: any) {
      yield saga.put({
        type: 'workMonitoring/refreshData',
        payload: {
          key: 'focusingTrack',
          data: data.payload
        }
      })
    },
    // 改变作业内容显示数据
    *changeWorkObjectListEvery(saga: any, data: any) {
      yield saga.put({
        type: 'workMonitoring/refreshData',
        payload: {
          key: 'workObjectList',
          data: data.payload
        }
      })
    },
    // 改变当前监控对象所属的作业对象id
    *changeActiveWorkIdEvery(saga: any, data: any) {
      yield saga.put({
        type: 'workMonitoring/refreshData',
        payload: {
          key: 'activeWorkId',
          data: data.payload
        }
      })
    },
  }
}

export default WorkMonitoring;
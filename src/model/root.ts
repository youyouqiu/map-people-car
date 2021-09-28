import { Model } from "../framework/d.ts/model"
import { getStore } from "../framework/utils/localStorage";
import { IUserDetails } from "@/views/home/type";
import { getUserMsg } from "@/server/user";
import { WebSocketClass } from "@/framework/utils/webSocket";

export type StateType = {
  currentLocale: string;
  logined: boolean;
  loadingState: boolean;
  collapsed: boolean;
  activePathCode: string;
  userMessage: IUserDetails;
  globalSocket: WebSocketClass | null;
  exportManagementVisible: boolean;
}


const Root: Model<StateType> = {
  namespace: 'root',
  defaultState: {
    currentLocale: 'zh',
    logined: false,
    loadingState: false,
    collapsed: false,
    activePathCode: '',
    userMessage: {},
    globalSocket: null,// 全局socket对象
    exportManagementVisible: false
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
    // 更新用户信息
    refreshData: (state: StateType, action: any) => {
      return Object.assign({}, state, { userMessage: action.payload });
    },
    setSocket: (state: StateType, action: any) => {
      return Object.assign({}, state, { globalSocket: action.payload });
    },
    /**
    * 离线导出管理显示状态
    */
    setExportManagementVisible: (state: StateType, { payload }: any) => {
      state.exportManagementVisible = payload;
      return state;
    },
  },
  sagas: {
    *getDataEvery() {
      return 'world'
    },
    // 获取用户信息
    *getUserMsgEvery(saga: any) {
      const result: any = yield saga.call(getUserMsg, null);
      if (result) {
        yield saga.put({
          type: 'root/refreshData',
          payload: result
        })
      }
    },
    // 初始化全局socket对象
    *setGlobalSocketEvery(saga: any, payload) {
      yield saga.put({
        type: 'root/setSocket',
        payload: payload.payload
      })
    },

  }
}


export default Root;
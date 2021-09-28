import { Model } from "../framework/d.ts/model"

export type StateType = {
  videoControlPlugin: any;
  videoTimeSlice: any;
  queryTime: any;
}


const VideoPlayback: Model<StateType> = {
  namespace: 'videoPlayback',
  defaultState: {
    videoControlPlugin: null,
    videoTimeSlice: null,
    queryTime: null,
  },
  reducers: {
    refreshData: function (state: StateType, action) {
      const { payload: { key, data } } = action;
      (state as any)[key] = data;
      return state;
    },
    resetData: function (state: StateType) {
      for (let key in state) {
        (state as any)[key] = null
      }
      return state;
    }
  },
  sagas: {
  }
}


export default VideoPlayback;
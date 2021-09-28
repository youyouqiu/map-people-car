import root from './root';
import container from './container';
import permissionManager from './permissionManager';
import monitorMananger from './monitorMananger'; // 监控对象
import workMonitoring from './workMonitoring'; // 作业监控
import workTrack from './workTrack'; // 作业回放
import schedulCalendar from './schedulCalendar';
import videoPlayback from './videoPlayback'
import { Model } from '../framework/d.ts/model';

const allModels: { [key: string]: Model<any> } = {
  root,
  container,
  monitorMananger,
  permissionManager,
  workMonitoring,
  workTrack,
  schedulCalendar,
  videoPlayback
};

export type AllState = {
  [k in keyof typeof allModels]: any;
};

export default allModels;

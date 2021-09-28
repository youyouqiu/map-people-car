import LayerWrapper from "./layer";
import MarkerWrapper from "./marker";
import { mapFunsObj } from "./mapFunsObj";
/**
 * 地图底层类型
 * 高德默认地图，google默认地图，高德卫星地图，google卫星地图
 */
export type MapType = 'amap' | 'google' | 'amapSatellite' | 'googleSatellite';

export type LngLat = [number, number];

export interface IPoint {
  time: Date;
  lnglat: LngLat;
  direction: number;
}

export interface IMonitor {
  name: string;
  points: IPoint[];
  icon: string;
  status: string;
}

export default class MapWrapper {
  constructor(map: AMap.Map) {
    Object.assign(map, mapFunsObj);
    this.map = map;
    this.layerWrapper = new LayerWrapper(map);
    this.markerWrapper = new MarkerWrapper(map);
  }

  /**
   * 高德地图实例
   */
  map: AMap.Map

  /**
   * 处理图层相关
   */
  layerWrapper: LayerWrapper

  /**
   * 处理标注相关
   */
  markerWrapper: MarkerWrapper

  /**
   * 改变地图底层类型
   * @param mapType 地图类型
   */
  changeMapType(mapType: MapType) {
    this.layerWrapper.changeMapType(mapType);
  }

  /**
   * 地图主题切换
   */
  mapThemeChange(value: string) {
    console.log(value);
  }

  /**
   * 添加监控对象图标
   * @param monitor 监控对象信息
   */
  addMonitor(monitor: IMonitor) {
    this.markerWrapper.addMonitor(monitor);
  }
}
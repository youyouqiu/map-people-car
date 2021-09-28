import { MapType } from "./mapWrapper";

export default class LayerWrapper {
  constructor(map: AMap.Map) {
    this.map = map;
    this.mapType = 'amap';
  }

  /**
   * 高德地图实例
   */
  map: AMap.Map;

  /**
   * 当前地图底层类型
   */
  mapType: MapType;

  /**
   * 高德地图标准图层
   */
  amapLayer: AMap.Layer;
  /**
   * 高德地图卫星地图图层
   */
  amapSatelliteLayer: AMap.Layer;

  /**
   * google地图图层
   */
  googleLayer: AMap.Layer;

  /**
   * google地图卫星地图图层
   */
  googleSatelliteLayer: AMap.Layer;

  /**
   * 改变地图底层类型
   * @param mapType 地图类型
   */
  changeMapType(mapType: MapType) {
    if (this.mapType === mapType) {
      return;
    }
    this.removeOtherLayers();
    this.mapType = mapType;
    if (mapType === 'amapSatellite') {
      const satelliteLayer = new AMap.TileLayer.Satellite();
      satelliteLayer.setMap(this.map);
      this.amapSatelliteLayer = satelliteLayer;
    } else if (mapType === 'google') {
      const googleLayer = new AMap.TileLayer({
        tileUrl: 'http://mt{1,2,3,0}.google.cn/vt/lyrs=m@142&hl=zh-CN&gl=cn&x=[x]&y=[y]&z=[z]&s=Galil', // 图块取图地址
        zIndex: 100 //设置Google层级与高德相同  避免高德路况及卫星被Google图层覆盖
      });
      googleLayer.setMap(this.map);
      this.googleLayer = googleLayer;
    } else if (mapType === 'googleSatellite') {
      const googleSatelliteLayer = new AMap.TileLayer({
        tileUrl: 'http://mt{1,2,3,0}.google.cn/vt/lyrs=s@142&hl=zh-CN&gl=cn&x=[x]&y=[y]&z=[z]&s=Galil', // 图块取图地址
        zIndex: 100
      });
      googleSatelliteLayer.setMap(this.map);
      this.googleSatelliteLayer = googleSatelliteLayer;
    } else {
      const layer = new AMap.TileLayer();
      layer.setMap(this.map);
      this.amapLayer = layer;
    }
  }


  /**
   * 移除其他图层
   */
  removeOtherLayers() {
    if (this.amapSatelliteLayer) {
      this.amapSatelliteLayer.setMap(null);
      delete this.amapSatelliteLayer;
    }
    if (this.googleLayer) {
      this.googleLayer.setMap(null);
      delete this.googleLayer;
    }
    if (this.googleSatelliteLayer) {
      this.googleSatelliteLayer.setMap(null);
      delete this.googleSatelliteLayer;
    }
    if (this.amapLayer) {
      this.amapLayer.setMap(null);
      delete this.amapLayer;
    }
  }
}
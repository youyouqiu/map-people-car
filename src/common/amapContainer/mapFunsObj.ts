
/**
 * 地图类型
 * 标准地图，3D地图，卫星地图，卫星路网
 */
type MapType = 'standardMap' | 'threeDimensionalMap' | 'defaultMap' | 'satelliteRoadMap';

let controlBar: AMap.ControlBar | undefined = undefined;
let trafficLayer: AMap.TileLayer.Traffic | undefined = undefined;
let overView: AMap.OverView | undefined = undefined;

// 封装地图常用方法
export const mapFunsObj = {
  currentMap: 'amap',
  /**
  * 创建点标记
  */
  marker: (option: AMap.Marker.Options) => {
    return new AMap.Marker(option);
  },

  /**
   * 创建海量点
   */
  massMarks: (data: Array<AMap.MassMarks.Data>, opts: AMap.MassMarks.Options) => {
    return new AMap.MassMarks(data, opts);
  },

  /**
    * 创建信息弹窗
    */
  infoWindow: (option: AMap.InfoWindow.Options) => {
    return new AMap.InfoWindow(option);
  },

  /**
    * 构造多边形对象，通过PolygonOptions指定多边形样式
    */
  polygon: (option: AMap.Polygon.Options) => {
    return new AMap.Polygon(option);
  },

  /**
    * 构造折线对象
    */
  polyline: (option: AMap.Polyline.Options) => {
    return new AMap.Polyline(option);
  },

  /**
    * 比例尺插件
    */
  scale: (option: AMap.Scale.Options) => {
    return new AMap.Scale(option);
  },

  /**
   * 像素坐标，确定地图上的一个像素点
   */
  pixel: (x: number, y: number) => {
    return new AMap.Pixel(x, y);
  },

  /**
   * 地物对象的像素尺寸
   */
  size: (width: number, height: number) => {
    return new AMap.Size(width, height)
  },

  /**
   * 矩形
   */
  rectangle: (option: AMap.Rectangle.Options) => {
    return new AMap.Rectangle(option)
  },

  /**
   * 矩形编辑
   */
  rectangleEditor: (map: AMap.Map, rectangle: AMap.Rectangle) => {
    return new AMap.RectangleEditor(map, rectangle);
  },

  /**
   * 圆形
   */
  circle: (option: AMap.Circle.Options) => {
    return new AMap.Circle(option)
  },

  /**
   * 圆形编辑
   */
  circleEditor: (map: AMap.Map, circle: AMap.Circle) => {
    return new AMap.CircleEditor(map, circle)
  },

  /**
   * 天气
   */
  weather: () => {
    return new (AMap as any).Weather()
  },

  /**
   * 获取城市信息
   */
  citySearch: () => {
    return new AMap.CitySearch()
  },

  /**
   * 改变地图底层类型
   * @param mapType 地图类型
   */
  changeMapType: function (mapType: MapType) {
    this.remove_style_pitch_controlBar();
    const layers = this.getLayers();
    const tileLayer = layers.find((item: { CLASS_NAME: string; }) => item.CLASS_NAME === "AMap.TileLayer");
    const satelliteLayer = layers.find((item: { CLASS_NAME: string; }) => item.CLASS_NAME === "AMap.TileLayer.Satellite");
    const roadNetLayer = layers.find((item: { CLASS_NAME: string; }) => item.CLASS_NAME === "AMap.TileLayer.RoadNet");

    if (mapType === 'standardMap') {
      tileLayer.show();
      satelliteLayer.hide();
      roadNetLayer.hide()
    } else if (mapType === 'threeDimensionalMap') {
      tileLayer.show();
      satelliteLayer.hide();
      roadNetLayer.hide()
      this.setPitch(90);
      this.setRotation(45);
      if (!controlBar) {
        controlBar = new AMap.ControlBar({
          position: {
            right: '10px',
            top: '10px'
          }
        });
        this.addControl(controlBar)
      }

    } else if (mapType === 'defaultMap') {
      satelliteLayer.show();
      tileLayer.hide();
      roadNetLayer.hide();
    } else {
      satelliteLayer.show();
      roadNetLayer.show();
      tileLayer.hide();
    }

    trafficLayer?.setMap(this)
  },

  /**
   * 地图主题切换
   */
  mapThemeChange: function (value: string) {
    this.setMapStyle('amap://styles/' + value);
  },

  /**
   * 移除罗盘、地图俯仰度、主题颜色
   */
  remove_style_pitch_controlBar: function () {
    this.setMapStyle('amap://styles/normal');
    this.setPitch(0);
    this.setRotation(0);
    if (controlBar) {
      this.removeControl(controlBar);
      controlBar = undefined;
    }
  },

  /**
   * 路况
   */
  traffic: function (option: AMap.TileLayer.Traffic.Options | undefined) {
    const map = this;
    if (!trafficLayer) trafficLayer = new AMap.TileLayer.Traffic(option);

    return {
      add: function () {
        map.add(trafficLayer)
      },
      remove: function () {
        map.remove(trafficLayer)
        trafficLayer = undefined;
      }
    }
  },

  /**
   * 鹰眼
   */
  overView: function (option: AMap.OverView.Options<AMap.TileLayer> | undefined) {
    const map = this;
    if (!overView) {
      overView = new AMap.OverView(option);
      overView.open();
    }

    return {
      add: function () {
        map.addControl(overView);
      },
      remove: function () {
        map.removeControl(overView);
        overView = undefined
      }
    }
  },
}
// baidu地图方法

// 地图类型
type MapType = 'standardMap' | 'threeDimensionalMap' | 'dimensionalMap';
let trafficType: any = false;
let contentLngLat: Array<any> = [0, 0];
// 高德经纬度转换为百度经纬度
const _AMapTransLngLatBMap = (data: Array<any>) => {
  const X_PI: number = Math.PI * 3000.0 / 180.0;
  const newData = [];
  if (data && data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      const x: number = data[i][0];
      const y: number = data[i][1];
      const z: number = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI);
      const theta: number = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI);
      const bd_lng: string = (z * Math.cos(theta) + 0.0065).toFixed(8);
      const bd_lat: string = (z * Math.sin(theta) + 0.006).toFixed(8);
      const lngAndLat = [Number(bd_lng), Number(bd_lat)];
      newData.push(lngAndLat);
    }
  }
  return newData;
}

export const mapFunsObj = {
  // 所属地图
  currentMap: 'baidu',
  /**
   * 改变地图底层类型
   * @param mapType 地图类型
   */
  changeMapType: function (mapType: MapType) {
    switch (mapType) {
      default:
      case 'standardMap':// 标准地图
        this.enableScrollWheelZoom(true);
        this.setHeading(0);
        this.setTilt(0);
        this.setMapType(BMAP_NORMAL_MAP);
        break;
      case 'threeDimensionalMap':// 3D地图
        this.enableScrollWheelZoom(true);
        this.setHeading(64.5);
        this.setTilt(73);
        this.setMapType(BMAP_NORMAL_MAP);
        break;
      case 'dimensionalMap':// 三维地球
        this.centerAndZoom({lng: 118.5, lat: 27.5}, 5);
        this.enableScrollWheelZoom(true);
        this.setMapType("B_EARTH_MAP");
        break;
    }
  },

  /**
   * 路况
   */
  traffic: function () {
    const map = this as any;
    if (!trafficType) {
      const trafficLayer: any = {
        add: function () {
          map.setTrafficOn();
          trafficType = true;
        },
        remove: function () {
          map.setTrafficOff();
          trafficType = false;
        },
      };
      map.trafficObj = trafficLayer;
    }
    return map.trafficObj;
  },

  /**
   * 移除地图覆盖物
   */
  remove: function (option: any) {
    console.log(option, 'option 移除覆盖物');
    if (option instanceof Array) {
      for (let i = 0; i < option.length; i++) {
        this.removeOverlay(option[i]);
      }
    } else {
      this.removeOverlay(option);
    }
  },

  /**
   * 设置地图可视范围
   */
  setFitView: function (option: any) {
    console.log(option, 'option 可视范围');
    let bounds = this.getBounds();
    if (option._bounds) {
      bounds = option._bounds;
    }
    this.setBounds(bounds);
  },

  /**
   * 设置地图中心点
   */
  setCenter: function (point: any) {
    console.log(point, 'point 中心点');
    let newPoint: Array<any> = [[0, 0]];
    let bMapPoint: Array<any> = [];
    if (!point) return;
    if (point.lng) {
      newPoint = _AMapTransLngLatBMap([[point.lng, point.lat]]);
    } else {
      newPoint = _AMapTransLngLatBMap([point]);
    }
    bMapPoint = new (BMapGL as any).Point(newPoint[0][0], newPoint[0][1]);
    this.panTo(bMapPoint);
  },

  /**
  * 创建点标记
  */
  marker: function (option: any) {
    console.log(option, 'option 点标记');
    let newPoint: Array<any> = [[0, 0]];
    let bMapPoint: Array<any> = [];
    const point: any = option.position;
    if (point && point[0]) {
      newPoint = _AMapTransLngLatBMap([point]);
    }
    bMapPoint = new (BMapGL as any).Point(newPoint[0][0], newPoint[0][1]);
    const markerIcon = new (BMapGL as any).Icon(option.icon || '../../static/image/people.png', new (BMapGL as any).Size(38, 48));
    const marker = new (BMapGL as any).Marker(bMapPoint, {
      icon: markerIcon,
    });
    const markerZIndex = option.zIndex || 999;
    marker.getzIndex = function () {
      return markerZIndex;
    };
    marker.setzIndex = marker.setZIndex;
    marker.oldsetPosition = marker.setPosition;
    marker.setPosition = function (point: any) {
      if (point[0]) {
        marker.oldsetPosition({ lng: point[0], lat: point[1] });
      } else {
        marker.oldsetPosition(point);
      }
    };
    marker.setContent = function () {
      return null;
    };
    marker.show = function () {
      this.addOverlay(marker);
    };
    marker.hide = function () {
      this.removeOverlay(marker);
    };
    this.addOverlay(marker);
    return marker;
  },

  /**
   * 百度地图GL不支持海量点，自实现
   * @param data 
   * @param styleArr 
   */
   drawMassMarker: function (data: any, styleArr: any) {
    const markerArr: any = [];
    for (let i = 0; i < data.length; i += 1) {
      const item = data[i];
      const style = styleArr[i];
      let newPoint: Array<any> = [[0, 0]];
      let bMapPoint: Array<any> = [];
      const point: any = item.lnglat;
      const name = item.name;
      if (point && point[0]) {
        newPoint = _AMapTransLngLatBMap([point]);
      }
      contentLngLat = newPoint;
      bMapPoint = new (BMapGL as any).Point(newPoint[0][0], newPoint[0][1]);
      const markerIcon = new (BMapGL as any).Icon(
        style.url || '../../static/image/point_purple.png',
        new (BMapGL as any).Size(style.size.width, style.size.height),
        { anchor: new (BMapGL as any).Size(style.anchor.lng, style.anchor.lat) }
      );
      const marker = new (BMapGL as any).Marker(bMapPoint, {
        icon: markerIcon,
      });
      markerArr.push(marker);
      // 创建文本标注对象
      const label = new (BMapGL as any).Label(name, {
        position: new (BMapGL as any).Point(newPoint[0][0], newPoint[0][1]),
        offset: new (BMapGL as any).Size(38, -30),
      });
      // 自定义文本标注样式
      label.setStyle({
        color: 'rgb(255,255,255)',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderColor: 'rgba(0,0,0,0.7)',
        borderRadius: '8px',
        fontSize: '14px',
        height: '30px',
        lineHeight: '30px',
        padding: '0 20px',
      });
      marker.setLabel(label);
      this.addOverlay(marker);
    }
    return markerArr;
  },

  /**
   * 创建海量点
   */
  massMarks: function (data: Array<any>, option: any) {
    console.log(data, 'data 海量点');
    console.log(option, 'option 海量点');
    let styleArr = option.style;
    let markerData = data;
    let markerArr = this.drawMassMarker(markerData, styleArr);
    const map = this as any;
    let markerClickFun: Function;
    return {
      clear: function () {
        map.remove(markerArr);
      },
      on: function (event: string, callback: Function) {
        markerClickFun = callback;
        for (let i = 0; i < markerArr.length; i += 1) {
          markerArr[i].addEventListener(event, (e: any) => {
            callback({ data: { ...markerData[i], marker: markerArr[i] } })
          })
        }
      },
      setMap: function () {
        return null;
      },
      setStyle: function (newStyle: any) {
        styleArr = newStyle;
      },
      setData: function (newData: any) {
        markerData = newData;
        markerArr = map.drawMassMarker(markerData, styleArr);
        for (let i = 0; i < markerArr.length; i++) {
          markerArr[i].addEventListener('click', (e: any) => {
            markerClickFun({ data: { ...markerData[i], marker: markerArr[i] } })
          })
        }
      },
      getStyle: function () {
        return styleArr;
      },
      getData: function () {
        return markerData;
      },
    }
  },

  /**
    * 创建信息弹窗
    */
  infoWindow: function (option: any) {
    console.log(option, 'option 信息弹窗');
    let isOpen = false;
    const mapWindow = new (BMapGL as any).InfoWindow(option.content, {
      width: 380,
      height: 480,
      title: '',
      message: '这里是故宫',
    });
    mapWindow.open = function (map: any, marker: any) {
      console.log(map, 'map 信息弹窗');
      console.log(marker, 'marker 信息弹窗');
      const newBMapPoint = new (BMapGL as any).Point(contentLngLat[0][0], contentLngLat[0][1]);
      this.openInfoWindow(mapWindow, newBMapPoint);
      isOpen = true;
    };
    mapWindow.newClose = mapWindow.close;
    mapWindow.close = function () {
      mapWindow.close();
      isOpen = false;
    };
    mapWindow.getIsOpen = function () {
      return isOpen;
    };
    return mapWindow;
  },

  /**
    * 构造多边形对象，通过PolygonOptions指定多边形样式
    */
  polygon: function (option: any) {
    console.log(option, 'option 多边形');
    let bMapLngLat: Array<any> = [];
    const bMapPoint: Array<any> = [];
    const path: any = option.path;
    // 百度多边形多重数组转一维数组
    if (path.length > 1 && Array.isArray(path[0][0])) {
      const newPath: Array<any> = path[0];
      for (let i = 1; i < path.length; i++) {
        // eslint-disable-next-line prefer-spread
        newPath.push.apply(newPath, path[i]);
      }
      // 经纬度去重
      for (let j = 0; j < newPath.length; j++) {
        for (let k = j + 1, len = newPath.length; k < len; k++) {
          if (newPath[j][0] === newPath[k][0] && newPath[j][1] === newPath[k][1]) {
            newPath.splice(k, 1);
            k--;
            len--;
          }
        }
      }
      bMapLngLat = newPath;
    } else if (path.length > 1 && !Array.isArray(path[0][0])) {
      bMapLngLat = path;
    } else {
      bMapLngLat = path[0];
    };
    bMapLngLat = _AMapTransLngLatBMap(bMapLngLat);
    for (let i = 0; i < bMapLngLat.length; i++) {
      const newBMapPoint = new (BMapGL as any).Point(bMapLngLat[i][0], bMapLngLat[i][1]);
      bMapPoint.push(newBMapPoint);
    }
    const polygon = new (BMapGL as any).Polygon(bMapPoint, option);
    this.addOverlay(polygon);
    this.panTo(bMapPoint[0]);
    return polygon;
  },

  /**
    * 构造折线对象
    */
  polyline: function (option: any) {
    console.log(option, 'option 折线');
    let bMapLngLat: Array<any> = [];
    const bMapPoint: Array<any> = [];
    const path: any = option.path;
    // 百度多边形多重数组转一维数组
    if (path.length > 1 && Array.isArray(path[0][0])) {
      const newPath: Array<any> = path[0];
      for (let i = 1; i < path.length; i++) {
        // eslint-disable-next-line prefer-spread
        newPath.push.apply(newPath, path[i]);
      }
      // 经纬度去重
      for (let j = 0; j < newPath.length; j++) {
        for (let k = j + 1, len = newPath.length; k < len; k++) {
          if (newPath[j][0] === newPath[k][0] && newPath[j][1] === newPath[k][1]) {
            newPath.splice(k, 1);
            k--;
            len--;
          }
        }
      }
      bMapLngLat = newPath;
    } else if (path.length > 1 && !Array.isArray(path[0][0])) {
      bMapLngLat = path;
    } else {
      bMapLngLat = path[0];
    };
    bMapLngLat = _AMapTransLngLatBMap(bMapLngLat);
    for (let i = 0; i < bMapLngLat.length; i++) {
      const newBMapPoint = new (BMapGL as any).Point(bMapLngLat[i][0], bMapLngLat[i][1]);
      bMapPoint.push(newBMapPoint);
    }
    const polyline = new (BMapGL as any).Polyline(bMapPoint, {
      strokeColor: 'blue',
      strokeWeight: 2,
      strokeOpacity: 0.6,
    });
    this.addOverlay(polyline);
    this.panTo(bMapPoint[0]);
    return polyline;
  },

  /**
   * 地图经纬度坐标转为地图容器像素坐标
   */
  lngLatToContainer: function () {
    return {
      x: 0,
      y: 0,
      getX: function () {
        return 0;
      },
      getY: function () {
        return 0;
      },
    }
  },

  /**
    * 比例尺插件
    */
  scale: function () {
    return {};
  },

  /**
   * 像素坐标，确定地图上的一个像素点
   */
  pixel: function (x: number, y: number) {
    return new (BMapGL as any).Point(x, y);
  },

  /**
   * 地物对象的像素尺寸
   */
  size: function (width: number, height: number) {
    return {
      width,
      height,
    }
  },

  /**
   * 地图事件绑定
   */
  on: function (event: string, callback: Function) {
    this.addEventListener(event, callback);
  },

  /**
   * 地图事件解绑
   */
  off: function (event: any) {
    this.removeEventListener(event);
  },

  /**
   * 添加地图控件
   */
  addControl: function () {
    return null;
  }
}
// 封装地图常用方法
import { googleStyles } from './mapTheme';
type ThemeType = 'daytime' | 'silver' | 'night' | 'retro' | 'hiding';
type MapType = 'standardMap' | 'threeDimensionalMap' | 'satellite';
export const mapFunsObj = {
  currentMap: 'google',
  /**
   * 改变地图底层类型
   * @param mapType 地图类型
   */
  changeMapType: function (mapType: MapType) {
    switch (mapType) {
      default:
      case 'standardMap':// 标准地图
        this.setTilt(0);
        this.setMapTypeId(google.maps.MapTypeId.ROADMAP);
        break;
      case 'threeDimensionalMap':// 3D地图
        this.setMapTypeId(google.maps.MapTypeId.HYBRID);
        this.setZoom(18);
        this.setHeading(90);
        this.setTilt(45);
        break;
      case 'satellite':// 卫星地图
        this.setTilt(0);
        this.setMapTypeId(google.maps.MapTypeId.HYBRID);
        break;
    }
  },

  /**
   * 地图主题切换
   */
  mapThemeChange: function (value: ThemeType) {
    this.setOptions({ styles: googleStyles[value] });
  },

  /**
   * 路况
   */
  traffic: function () {
    const map = this as any;
    if (!map.trafficObj) {
      const trafficLayer: any = new google.maps.TrafficLayer();
      trafficLayer.remove = function () {
        this.setMap(null);
      };
      trafficLayer.add = function () {
        this.setMap(map);
      };
      map.trafficObj = trafficLayer;
    }

    return map.trafficObj;
  },

  /**
   * 移除地图覆盖物
   */
  remove: function (opt: any) {
    if (opt instanceof Array) {
      for (let i = 0; i < opt.length; i++) {
        if (opt[i] && opt[i].setMap) {
          opt[i].setMap(null);
        }
      }
    } else if (opt && opt.setMap) {
      opt.setMap(null);
    }
  },

  /**
   * 设置地图可视范围
   */
  setFitView: function (option: any) {
    if (!option) return;
    let bounds = new google.maps.LatLngBounds();
    if (option.my_getBounds) {
      bounds = option.my_getBounds();
    } else if (option[0].my_getBounds) {
      bounds = option[0].my_getBounds();
    } else if (option.forEach) {
      option.forEach(function (element: any) {
        if (element.position) {
          bounds.extend(element.position);
        }
      })
    }
    this.fitBounds(bounds);
  },

  /**
   * 设置地图中心点
   */
  setCenter: function (point: any) {
    if (!point) return;
    if (point.lng) {
      this.oldSetCenter(point);
    } else {
      this.oldSetCenter({ lng: point[0], lat: point[1] });
    }
  },

  /**
  * 创建点标记
  */
  marker: function (option: any) {
    const map = this as any;
    let point: any = option.position;
    if (point && point[0]) {
      point = {
        lng: point[0],
        lat: point[1]
      }
    }
    const marker: any = new google.maps.Marker({
      position: point || { lng: 0, lat: 0 },
      icon: option.icon || '/no.img',
      map: this,
      zIndex: 100,
      label: option.monitorName ? {
        text: option.monitorName,
        className: 'googleMonitorName',
      } : ""
    });
    marker.setContent = function () {
      return null;
    };
    if (!point) {
      marker.setMap(null);
      marker.setContent = function (content: string) {
        marker.setLabel({
          text: content,
          className: 'googleMonitorName',
        })
      };
    }
    marker.getzIndex = marker.getZIndex;
    marker.setzIndex = marker.setZIndex;
    marker.oldsetPosition = marker.setPosition;
    marker.setPosition = function (point: any) {
      if (point[0]) {
        marker.oldsetPosition({ lng: point[0], lat: point[1] });
      } else {
        this.oldsetPosition(point);
      }
    }
    marker.show = function () {
      marker.setMap(map);
    };
    marker.hide = function () {
      marker.setMap(null);
    };
    return marker;
  },

  /**
   * 因为谷歌地图没有绘制海量点功能,只能自己模拟绘制marker
   * @param data 
   * @param styleArr 
   */
  drawMassMarker: function (data: any, styleArr: any) {
    const markerArr: any = [];
    for (let i = 0; i < data.length; i += 1) {
      const item = data[i];
      const style = styleArr[i];
      let point: any = item.lnglat;
      if (point && point[0]) {
        point = {
          lng: point[0],
          lat: point[1]
        }
      }
      const marker = new google.maps.Marker({
        position: point,
        icon: style.url,
        map: this,
        label: ''
      });
      markerArr.push(marker);
    }
    return markerArr;
  },
  /**
   * 创建海量点
   */
  massMarks: function (data: Array<any>, opts: any) {
    let styleArr = opts.style;
    let markerData = data;
    let markerArr = this.drawMassMarker(markerData, styleArr);
    const map = this as any;
    const eventObj: any = {};
    return {
      clear: function () {
        map.remove(markerArr);
      },
      on: function (event: string, callback: Function) {
        eventObj[event] = callback;
        for (let i = 0; i < markerArr.length; i += 1) {
          markerArr[i].addListener(event, (e: any) => {
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
        for (let i = 0; i < markerArr.length; i += 1) {
          Object.keys(eventObj).map(key => {
            markerArr[i].addListener(key, (e: any) => {
              eventObj[key]({ data: { ...markerData[i], marker: markerArr[i] } })
            })
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
  infoWindow: (option: google.maps.InfoWindowOptions) => {
    const obj: any = new google.maps.InfoWindow(option);
    let isOpen = false;
    obj.oldOpen = obj.open;
    obj.open = (map: any, marker: google.maps.Marker) => {
      obj.oldOpen({
        anchor: marker,
        map,
        // content: content
      });
      isOpen = true;
    };
    obj.oldClose = obj.close;
    obj.close = () => {
      obj.oldClose();
      isOpen = false;
    };
    obj.getIsOpen = function () {
      return isOpen;
    }
    return obj;
  },

  /**
    * 构造多边形对象，通过PolygonOptions指定多边形样式
    */
  polygon: (option: any) => {
    const newPoint = [];
    const path: any = option.path;
    for (let i = 0; i < path.length; i++) {
      if (path[i][0] instanceof Array) {
        const arr = [];
        for (let j = 0; j < path[i].length; j++) {
          arr.push({ lng: path[i][j][0], lat: path[i][j][1] });
        }
        newPoint.push(arr);
      } else {
        newPoint.push({ lng: path[i][0], lat: path[i][1] })
      }
    }
    option.paths = newPoint;
    const polygon: any = new google.maps.Polygon(option);
    polygon.on = (event: string, callback: Function) => {
      polygon.addListener(event, (e: any) => {
        callback();
      })
    }
    polygon.my_getBounds = function () {
      const bounds = new google.maps.LatLngBounds();
      this.getPaths().forEach(function (element: any) {
        if (element.forEach) {
          element.forEach(function (subElement: any) {
            bounds.extend(subElement);
          })
        } else {
          bounds.extend(element);
        }
      })
      return bounds;
    }
    polygon.pathArr = newPoint;
    return polygon;
  },

  /**
    * 构造折线对象
    */
  polyline: (option: google.maps.PolylineOptions) => {
    const path: any = option.path;
    const newPoint = [];
    for (let i = 0; i < path.length; i++) {
      newPoint.push({ lng: path[i][0], lat: path[i][1] })
    }
    option.path = newPoint;
    const polyline: any = new google.maps.Polyline(option);
    polyline.on = (event: string, callback: Function) => {
      polyline.addListener(event, (e: any) => {
        callback();
      })
    }
    polyline.pathArr = newPoint;
    polyline.oldsetPath = polyline.setPath;
    polyline.setPath = function (newPath: any) {
      const newPoint = [];
      for (let i = 0; i < newPath.length; i++) {
        if (newPath[i][0]) {
          newPoint.push({ lng: newPath[i][0], lat: newPath[i][1] })
        } else {
          newPoint.push(newPath[i]);
        }
      }
      polyline.oldsetPath(newPoint);
      polyline.pathArr = newPoint;
    }
    polyline.my_getBounds = function () {
      const bounds = new google.maps.LatLngBounds()
      this.getPath().forEach(function (element: any, index: any) { bounds.extend(element) })
      return bounds;
    }

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
  scale: () => {
    return {};
  },

  /**
   * 像素坐标，确定地图上的一个像素点
   */
  pixel: (x: number, y: number) => {
    return new google.maps.Point(x, y);
  },

  /**
   * 地物对象的像素尺寸
   */
  size: (width: number, height: number) => {
    return {
      width,
      height
    }
  },

  /**
   * 地图事件绑定
   */
  on: function (event: string, callback: Function) {
    if (event === 'zoomend') event = 'zoom_changed';
    this.addListener(event, callback);
  },

  /**
   * 地图事件解绑
   */
  off: function (event: any) {
    this.unbind(event);
  },

  /**
   * 添加地图控件
   */
  addControl: function () {
    return null;
  }
}
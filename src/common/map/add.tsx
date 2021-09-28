import React, { useState, useRef, useEffect, useCallback } from 'react';
import LayerController from './Map/layerController'
import { AllCode } from './Tools/DistrictModal'
import Tools, { DrawType } from './Tools/Tools'
import MyMap, { MapType, LayerType, polygonOptions, polylineOptions, polygonOptions_district } from './Map'
import { cloneDeep } from 'lodash'

import deleteImg from '@/static/image/delete.svg';
import startImg from '@/static/image/start_point.png'
import midImg from '@/static/image/mid_point.png'
import endImg from '@/static/image/end_point.png'
import clearImg from '@/static/image/clear.svg'
import infoIcon from '@/static/image/icon_dir.png'
import { getArrDimension } from './Tools/Tools';

export type Lnglat = [number, number][]
export type Path = { Q: number, R: number, lng: number, lat: number }
export type FenceType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 //0关键点 1圆形 2矩形 3多边形 4行政区 5线路 6分段线段 7导航线路 8标注
interface IProps {
  type: DrawType;
  toolOptions: DrawType[];
  fences?: Lnglat | Lnglat[]; // 绘制边界
  detailFacility?: { //设施位置信息
    id: number;
    latitude: number;
    longitude: number;
  }[];
  setAdcode?: (adcode: AllCode) => void
  setArea: (res: number) => void; //调用父组件的setArea函数，把绘制的面积/长度作为参数传入
  setLngLat: (path: Lnglat | Lnglat[]) => void; //调用父组件的setLngLat函数，把绘制多边形/线路/导航线路关键点作为参数传入
  setFenceType: (fenceType: FenceType) => void //数据类型的确定
  setFacility?: (res: { facilitys: Lnglat; facilityNum: number; }) => void; //根据传入的设施位置信息和当前的绘制图像计算有多少个设施在当前绘制区域内；
  calcType: 0 | 1; //0面积 1长度
}

const AMapPlugins = [
  'AMap.MapType',
  'AMap.ToolBar',
  'AMap.MouseTool',
  'AMap.PolyEditor',
  'AMap.Scale',
  'AMap.Marker',
  'AMap.DistrictSearch',
  'AMap.Polygon',
  'AMap.GeometryUtil'
]

const Map: React.FC<IProps> = (props) => {
  const { setArea, setLngLat, setFacility, setAdcode, setFenceType, toolOptions, fences, calcType, type, detailFacility } = props
  const map = useRef<AMap.Map | undefined>(undefined) //地图实例
  const mapRef = useRef<HTMLDivElement | null>(null) // 地图容器的ref
  const layers = useRef<LayerController | null>(null) // 地图图层控制器

  const GPSline = useRef<AMap.DragRoute>()
  const polygonEditor = useRef<AMap.PolyEditor | undefined>(undefined) // 多边形编辑器实例
  const mouseTool = useRef<AMap.MouseTool>() //鼠标工具包
  const GPSPoints = useRef<{ start: any[], mid: any[], end: any[] }>({ start: [], mid: [], end: [] }) //gps绘制时的关键点

  const [position, setPosition] = useState([0, 0]) // 提示语位置
  const [show, setShow] = useState(false) // 区域绘制和线路绘制时跟随鼠标的提示语展示与否
  const [popDisabled, setPopDisabled] = useState(true) // 气泡框禁用与否
  const drawType = useRef<DrawType>()
  const [_force, forceUpdate] = useState('')

  useEffect(() => {
    mapRef.current?.addEventListener("mousemove", handleMouseMove)
    return () => {
      mapRef.current?.removeEventListener("mousemove", handleMouseMove)
    }
  }, [mapRef.current])

  useEffect(() => {
    if (!map.current) return () => { }
    layers.current?.clearPolygonLayers('fence')
    layers.current?.polygonLayers.fence.forEach((fence) => {
        fence.off('rightclick', onGPSDrawEnd)
    })
    fences && drawBounary(fences)
  }, [fences, _force])

  const initLayers = (ctrl: LayerController) => {
    ctrl.createPolygonLayer('fence') // 多边形 => 围栏图层
    ctrl.createPolygonLayer('draw') // 多边形 => 用户绘制的图层

    ctrl.createPolylineLayer('draw') // 线段 => 用户绘制的图层

    ctrl.createMarkerLayer('draw') // 点标记 => 用户绘制的图层
    ctrl.createMarkerLayer('temp') // 点标记 => 临时图层
  }

  // 地图初始化事件
  const onMapLoaded = (mapInstance: AMap.Map) => {
    forceUpdate(Math.random() + '')
    map.current = mapInstance
    layers.current = new LayerController(mapInstance)
    mouseTool.current = new AMap.MouseTool(mapInstance);
    mapInstance.addControl(new AMap.Scale());
    mapInstance.addControl(new AMap.ToolBar());
    initLayers(layers.current)
  };
  // 画地图的围栏
  const drawBounary = (data: Lnglat | Lnglat[]) => {
    if (getArrDimension(data) == 3) {
      data.forEach((item: any) => {
        const fence = new AMap.Polygon({
          map: map.current,
          path: cloneDeep(item as Lnglat),
          ...polygonOptions_district,
        });
        layers.current?.polygonLayers.fence.push(fence)
        if(drawType.current == 'GPS'){
          fence.on('rightclick', onGPSDrawEnd)
        }
      })
    } else if (getArrDimension(data) == 2) {
      const fence = new AMap.Polygon({
        map: map.current,
        path: cloneDeep(data),
        ...polygonOptions_district,
      });
      layers.current?.polygonLayers.fence.push(fence)
      if(drawType.current == 'GPS'){
        fence.on('rightclick', onGPSDrawEnd)
      }
    }
    map.current?.setFitView()
  }
  // 画行政区域
  const drawDistrict = (param?: { currentCode: string, allCode: AllCode }) => {
    setShow(false)
    clearMap()
    const opts: AMap.DistrictSearch.Options = {
      subdistrict: 0,
      extensions: 'all',
      level: 'district',
    };
    const district = new AMap.DistrictSearch(opts);
    if (!param) return
    const code = param.currentCode
    setAdcode && setAdcode(param.allCode)
    district.search(code, (status: AMap.DistrictSearch.SearchStatus, result: AMap.DistrictSearch.SearchResult) => {
      if (status != 'complete') return
      const bounds = result.districtList[0].boundaries;
      if (bounds) {
        const areas = []
        const paths: Lnglat | Lnglat[] = []
        for (let i = 0, l = bounds.length; i < l; i++) {
          //生成行政区划polygon
          const res = new AMap.Polygon({
            map: map.current,
            path: bounds[i],
            ...polygonOptions,
          })
          layers.current?.polygonLayers.draw.push(res)
          const path: any = res.getPath()
          const temp: any = path.map((item: any) => [item.lng, item.lat])
          paths.push(temp as any)
          areas.push(Math.round(calcPath(path as any, calcType)))
        }
        setArea(areas.reduce((a, b) => {
          return a + b
        }))
        setLngLat(paths)
        setFenceType(4)
      }
      map.current?.setFitView();
      setPopDisabled(false)
    });
  }
  /**
   * 画多边形
   * @param path 
   * @param noEdit 默认进入编辑模式，传入true时不进入编辑模式
   * @returns AMap.Polygon<any> | undefined
   */
  const drawPolygon = () => {
    setShow(true);// 显示提示框
    mouseTool.current?.polygon({
      ...polygonOptions
    });
    mouseTool.current?.on('draw', onPolygonDrawEnd)
  }
  // 画路线
  const drawPolyline = () => {
    setShow(true);// 显示提示框
    mouseTool.current?.polyline({
      ...polylineOptions
    });
    mouseTool.current?.on('draw', onPolyLineDrawEnd)
  }
  // 导航绘制
  const drawGPS = () => {
    setShow(false)
    map.current?.on('contextmenu', onGPSDrawEnd);
    layers.current?.polygonLayers.fence.forEach((fence) => {
      fence.on('rightclick', onGPSDrawEnd)
    })
  }
  // 添加删除图标
  const addDelMarker = useCallback((lnglat: [number, number], parent) => {
    const markerContent = `<div style="background: #fff;text-align: center;margin: 0;width: 23px;height: 27px;padding: 0;"><img src='${deleteImg}' style="width: 75%;height: 100%;"/></div>`;
    const marker = new AMap.Marker({
      map: map.current,
      position: new AMap.LngLat(...lnglat),
      content: markerContent,
      offset: new AMap.Pixel(-13, -30),
      extData: {
        relatedPoly: parent
      }
    });
    marker.on("click", (e) => {
      polygonEditor.current?.close()
      setLngLat([])
      setArea(0)
      setPopDisabled(true)
      calcFacility([])
      layers.current?.deleteObj(e.target.getExtData().relatedPoly)
      layers.current?.deleteObj(e.target, 2)
      drawType.current == 'polygon' && drawPolygon()
      drawType.current == 'polyline' && drawPolyline()
    })
    layers.current?.markerLayers.draw.push(marker)
    return marker
  }, []);
  // 清空地图
  const clearMap = () => {
    setLngLat([])
    setArea(0)
    setShow(false)
    setPopDisabled(true)
    calcFacility([])

    layers.current?.clearMarkerLayers()
    layers.current?.clearPolygonLayers('draw')
    layers.current?.clearPolylineLayers()

    polygonEditor.current?.close()
    GPSline.current?.destroy()
  }
  // 计算面积/路线长度  type: 0面积 1长度
  const calcPath = (paths: AMap.LocationValue[], type: 0 | 1): number => {
    try {
      if (type == 0) {
        return AMap.GeometryUtil.ringArea(paths)
      } else {
        return AMap.GeometryUtil.distanceOfLine(paths)
      }
    } catch (error) {
      return -1
    }
  }
  // 计算当前绘制区域内的设施数量
  const calcFacility = (path: Lnglat) => {
    const points: Lnglat = [];
    detailFacility && detailFacility.forEach((item) => {
      points.push([item.longitude, item.latitude]);
    });
    const res = howManyFacilityInArea(points, path);
    setFacility && setFacility(res);
  };
  const howManyFacilityInArea = (points: Lnglat, area: Lnglat) => {
    let result = 0;
    const facilitys: Lnglat = [];
    if(area.length == 0) return { facilitys: [], facilityNum: 0 };
    points.forEach((point: [number, number]) => {
      if (AMap.GeometryUtil.isPointInRing(point, area)) {
        result++;
        facilitys.push(point);
      }
    });
    return { facilitys, facilityNum: result };
  };
  // 多边形绘制回调
  const onPolygonDrawEnd = (e: any) => {
    const target = e.obj
    mouseTool.current?.close()
    if (!map.current) return
    layers.current?.polygonLayers.draw.push(target)
    const path = target.getPath()
    const temp: Lnglat = path.map((item: Path) => [item.lng, item.lat])
    setLngLat(temp)
    setFenceType(3)
    calcFacility(temp)
    setArea(Math.round(calcPath(path, calcType)))
    const delMarker = addDelMarker([path[path.length - 1].lng, path[path.length - 1].lat], target)
    polygonEditor.current = new AMap.PolyEditor(map.current, target)
    polygonEditor.current.open()
    mouseTool.current?.off('draw', onPolygonDrawEnd)
    polygonEditor.current.on('adjust', (e: any) => {
      onEditorAdjust(e, delMarker)
    })
    setShow(false)
    setPopDisabled(false)
  }
  // 路线绘制回调
  const onPolyLineDrawEnd = useCallback((e: any) => {
    mouseTool.current?.close()
    if (!map.current) return
    layers.current?.polylineLayers.draw.push(e.obj)
    const path = e.obj.getPath()
    const temp = path.map((item: Path) => [item.lng, item.lat])
    setLngLat(temp)
    setFenceType(5)
    setArea(Math.round(calcPath(path, calcType)))
    const delMarker = addDelMarker([path[path.length - 1].lng, path[path.length - 1].lat], e.obj)
    polygonEditor.current = new AMap.PolyEditor(map.current, e.obj)
    polygonEditor.current.open()
    mouseTool.current?.off('draw', onPolyLineDrawEnd)
    polygonEditor.current.on('adjust', (e: any) => {
      onEditorAdjust(e, delMarker)
    })
    setShow(false)
    setPopDisabled(false)
  }, [])
  // 编辑器adjust回调
  const onEditorAdjust = (e: any, delMarker?: AMap.Marker) => {
    const paths = e.target.getPath()
    const temp = paths.map((item: Path) => [item.lng, item.lat])
    setLngLat(temp)
    calcFacility(temp)
    setArea(Math.round(calcPath(paths, calcType)))
    const newPos = paths[paths.length - 1]
    delMarker?.setPosition(newPos)
  }
  // 导航绘制回调
  const onGPSDrawEnd = useCallback((e: any) => {
    mouseTool.current?.off('draw', onGPSDrawEnd)
    const styles = [
      `background: url(${infoIcon}) no-repeat;background-size: 281px 219px;display: inline-block;width: 22px;height: 22px;background-position: -95px -39px;margin-right: 10px;`,
      `background: url(${infoIcon}) no-repeat;background-size: 281px 219px;display: inline-block;width: 22px;height: 22px;background-position: -126px -39px;margin-right: 10px;`,
      `background: url(${infoIcon}) no-repeat;background-size: 281px 219px;display: inline-block;width: 22px;height: 22px;background-position: -158px -39px;margin-right: 10px;`,
      `background: url(${clearImg}) no-repeat;background-size: 23px 18px;display: inline-block;width: 22px;height: 22px;margin-right: 10px;`,
    ]
    const infoHtml = `
        <div id="infoHtml" data-lnglat=${JSON.stringify(e.lnglat)} style="width: 114px;line-height: 30px;cursor: pointer;background: #fff;padding: 2px 10px;border-radius: 4px;box-shadow: 0 0 6px 2px #676767;">
            <div data-type="0" style="display: flex;align-items: center;">
                <i style='${styles[0]}'></i><span>起点</span>
            </div>
            <div data-type="1" style="display: flex;align-items: center;">
                <i style='${styles[1]}'></i><span>途经点</span>
            </div>
            <div data-type="2" style="display: flex;align-items: center;">
                <i style='${styles[2]}'></i><span>终点</span>
            </div>
            <div data-type="3" style="border-top: 1px solid #a5a5a5;display: flex;align-items: center;">
                <i style='${styles[3]}'></i><span>清除路线</span>
            </div>
        </div>`
    const infoWindow = new AMap.InfoWindow({
      isCustom: true,
      anchor: 'top-left',
      offset: new AMap.Pixel(10, -20),
      content: infoHtml
    });
    map.current && infoWindow.open(map.current, e.lnglat)
    setTimeout(() => document.querySelector("#infoHtml")?.addEventListener("click", handleInfoClick), 0)
  }, [])
  // 弹出层点击事件
  const handleInfoClick = (e: any) => {
    const target = e.target.getAttribute('data-type') ? e.target : e.target.parentNode
    const type = target.getAttribute('data-type') // 0起点, 1途经点, 2终点, 3清除路线
    const lnglat = JSON.parse(target.parentNode.getAttribute('data-lnglat')) //点击点的经纬度坐标
    const iconTypes = [startImg, midImg, endImg];
    const point = [lnglat.lng, lnglat.lat]
    const lastStartPointMarker = layers.current?.markerLayers.temp.find((marker) => {
        return marker.getExtData().pointType == '0'
    })
    if (iconTypes[type]) {
      const marker = new AMap.Marker({
        map: map.current,
        position: new AMap.LngLat(point[0], point[1]),
        icon: new AMap.Icon({
          size: new AMap.Size(40, 40),
          image: iconTypes[type]
        }),
        extData: {
            pointType: type
        }
      });
      layers.current?.markerLayers.temp.push(marker)
    }
    switch (type) {
      case '0':
        //如果是起点，那么删除上一个起点
        layers.current?.deleteObj(lastStartPointMarker, 2)
        GPSPoints.current.start = point
        break;
      case '1':
        GPSPoints.current.mid.push(point)
        break;
      case '2':
        GPSPoints.current.end = point
        break;
      default:
        clearMap()
        GPSPoints.current = { start: [], mid: [], end: [] }
        break;
    }
    generateLine()
    map.current?.clearInfoWindow();
  }
  const generateLine = () => {
    if (GPSPoints.current.start.length > 0 && GPSPoints.current.end.length > 0) {
      map.current?.plugin("AMap.DragRoute", () => {
        const allPoints = [GPSPoints.current.start, ...GPSPoints.current.mid, GPSPoints.current.end]
        clearMap()
        GPSline.current = new AMap.DragRoute(map.current!, allPoints, AMap.DrivingPolicy.LEAST_DISTANCE, {});
        GPSline.current.search();
        GPSline.current.on('complete', (res: any) => {
          const path = res.target.getRoute().map((item: any) => [item.lng, item.lat])
          setArea(Math.round(calcPath(path, calcType)))
          setLngLat(path)
          setFenceType(7)
          const wayPoints = res.data.waypoints.map((item: any) => [item.location.lng, item.location.lat])
          GPSPoints.current.mid = wayPoints
          GPSPoints.current.start = [res.data.start.location.lng, res.data.start.location.lat]
          GPSPoints.current.end = [res.data.end.location.lng, res.data.end.location.lat]
        })
        setPopDisabled(false)
      });
    }
  }
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setPosition([e.offsetX + 20, e.offsetY + 50])
  }, [])
  // 地图类型切换
  const handleChangeMapType = (maptype: MapType[]) => {
    const allLayer = map.current?.layers //这个layers属性是创建地图时自己添加到实例中去的，所以没有类型推导
    for (const key in allLayer) {
      if (maptype.includes(key as MapType)) {
        allLayer[key as MapType]?.show()
      } else {
        allLayer[key as MapType]?.hide()
      }
    }
  }
  // 地图绘制模式切换
  const handleDrawTypeChange = (type: DrawType) => {
    if (type != drawType.current) {
      drawType.current = type
      mouseTool.current?.close();
      GPSPoints.current = { start: [], mid: [], end: [] }
      map.current?.off('contextmenu', onGPSDrawEnd);
      layers.current?.polygonLayers.fence.forEach((fence) => {
        fence.off('rightclick', onGPSDrawEnd)
      })
    }
  }
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <Tools
        mapRef={mapRef.current}
        map={map.current}
        drawTypes={toolOptions}
        disablePopComfirm={popDisabled}
        // defalutType={type}
        clearMap={clearMap}
        onMapTypeChange={handleChangeMapType}
        onDrawTypeChange={handleDrawTypeChange}
        drawPolygon={drawPolygon}
        drawDistrict={drawDistrict}
        drawPolyline={drawPolyline}
        drawGPS={drawGPS}
      />
      <MyMap
        ref={(mapDiv) => mapRef.current = mapDiv}
        onSuccess={onMapLoaded}
        options={{ zoom: 18 }}
        plugins={AMapPlugins}
      />
      <p
        style={{
          position: 'absolute',
          background: '#fff',
          border: '1px solid red',
          left: position[0],
          top: position[1],
          display: show ? 'block' : 'none',
        }}
      >
        单击开始绘制，双击结束绘制
            </p>
    </div>
  )
}

export default Map;

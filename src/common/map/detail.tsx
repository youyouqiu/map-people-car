import React, { useState, useRef, useEffect } from 'react';
import Tools, { DrawType } from './Tools/Tools'
import MyMap,{ polygonOptions, polygonOptions_district }  from './Map'
import {cloneDeep} from 'lodash'

import { getArrDimension } from './Tools/Tools';

export type MapType = "TileLayer" | "Satellite" | "RoadNet" | "Traffic"
export type Lnglat = [number,number][]
export type Path = {Q: number, R: number, lng: number, lat: number}
interface IProps {
    type: DrawType;
    pathStr: Lnglat | Lnglat[] | string;
    fences?: Lnglat | Lnglat[]; // 绘制边界
    detailFacility?: { //设施位置信息
        id: number;
        latitude: number;
        longitude: number;
    }[];
}

const polylineOptions: AMap.Polyline.Options  = {
  strokeColor: '#28A9EE',
  strokeOpacity: 1,
  strokeWeight: 3,
  strokeStyle: 'solid',
}

const AMapPlugins = [
    'AMap.MapType',
    'AMap.ToolBar',
    'AMap.Scale',
    'AMap.Marker',
    'AMap.Polygon',
]

const Map: React.FC<IProps> = (props) => {
    const {fences, type, pathStr } = props
    const map = useRef<AMap.Map | undefined>(undefined) //地图实例
    const mapRef = useRef<HTMLDivElement | null>(null) // 地图容器的ref
    const divRef = useRef<HTMLDivElement | null>(null) // 用来全屏展示
    const [_force, forceUpdate] = useState('')
    
    useEffect(() => {
        map.current?.clearMap()
        if(!map.current || !pathStr) return () => {}
        const path = typeof pathStr == 'string' ? JSON.parse(pathStr) : pathStr
        if(getArrDimension(path) == 3){ 
            // 三维数组 只有为行政区类型时才可能是三维数组
            path.forEach((item: any) => {
                drawPolygon(cloneDeep(item as Lnglat))
                map.current?.setFitView()
            })
        }else if(getArrDimension(path) == 2){
            switch (type) {
                case 'polygon':
                    if(path && path.length > 0){
                        if(path){
                            const res = drawPolygon(cloneDeep(path as Lnglat))
                            map.current?.setFitView(res)
                        }
                    }
                    break;
                case 'polyline':
                    if(path && path.length > 0){
                        if(path){
                            const res = drawPolyline(cloneDeep(path as Lnglat))
                            map.current?.setFitView(res)
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    },[pathStr, _force]) 
    useEffect(() => {
        if(!map.current) return () => {}
        fences && drawBounary(fences)
    },[fences, _force])

    // 地图初始化事件
    const onMapLoaded = (mapInstance: AMap.Map) => {
        forceUpdate(Math.random() + '')
        map.current = mapInstance
        mapInstance.addControl(new AMap.Scale());
        mapInstance.addControl(new AMap.ToolBar());
    };
    // 画地图的围栏
    const drawBounary = (data: Lnglat | Lnglat[]) => {
        
        if(getArrDimension(data) == 3){
            data.forEach((item: any) => {
                new AMap.Polygon({
                    map: map.current,
                    path: cloneDeep(item as Lnglat),
                    ...polygonOptions_district,
                });
            })
        }else if(getArrDimension(data) == 2){
            new AMap.Polygon({
                map: map.current,
                path: cloneDeep(data),
                ...polygonOptions_district,
            });
        }
    }
    // 画多边形
    const drawPolygon = (path?: Lnglat) => {
        if(path && path.length > 0){
            const polygon = new AMap.Polygon({
                ...polygonOptions,
                map: map.current,
                path: path,
            });
            return polygon
        }
    }
    // 画路线
    const drawPolyline = (path?: Lnglat) => {
        if(path && path.length > 0){
            const polyline = new AMap.Polyline({
                ...polylineOptions,
                map: map.current,
                path: path,  
            });
            return polyline
        }
    }
     // 地图类型切换
    const handleChangeMapType = (maptype: MapType[]) => {
      const allLayer = map.current?.layers 
      for (const key in allLayer) {
        if (maptype.includes(key as MapType)) {
          allLayer[key as MapType]?.show()
        } else {
          allLayer[key as MapType]?.hide()
        }
      }
    }
    return (
        <div ref={divRef} style={{ height: '100%', width: '100%', position: 'relative' }}>
            <Tools
                mapRef={mapRef.current}
                onMapTypeChange={handleChangeMapType}
                map={map.current}
                drawTypes={[]}
                clearMap={() => {}}
                customFullscreen={(fullScreen) => {
                  if(!fullScreen){
                    divRef.current?.requestFullscreen()
                  }else{
                    document.exitFullscreen();
                  }
                }}
            />
            <MyMap 
                ref={(mapDiv) => mapRef.current = mapDiv}
                onSuccess={onMapLoaded} 
                options={{ zoom: 18 }} 
                plugins={AMapPlugins} 
            />
        </div>
    )
}

export default Map;

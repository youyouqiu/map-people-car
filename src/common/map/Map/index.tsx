/* eslint-disable react/prop-types */
import React,{ useState, useEffect, forwardRef, useRef } from 'react'
import AMapLoader from '@amap/amap-jsapi-loader';
import Config from '@/framework/config'
import Loading from '@/common/loading'
import randomId from "@/framework/utils/randomString";

export type MapType = "TileLayer" | "Satellite" | "RoadNet" | "Traffic"
export type LayerType = {
    Satellite: AMap.TileLayer.Satellite | null,
    Traffic: AMap.TileLayer.Traffic | null,
    RoadNet: AMap.TileLayer.RoadNet | null,
    TileLayer: AMap.TileLayer | null,
}
interface IProps {
    onSuccess?: (map: AMap.Map ) => void;
    mapType?: MapType[]; //地图类型 默认 卫星图层+路网 ["Satellite", "RoadNet"]
    options?: AMap.Map.Options;
    plugins?: string[]; 
    ref?: React.MutableRefObject<HTMLDivElement | null> | ((instance: HTMLDivElement | null) => void) | null
}

export const polygonOptions: AMap.Polygon.Options =  {
    strokeColor: '#28A9EE',
    strokeOpacity: 1,
    strokeWeight: 2,
    fillColor: '#1791fc',
    fillOpacity: 0.4,
    strokeStyle: 'solid',
}
export const polygonOptions_district: AMap.Polygon.Options =  {
    strokeWeight: 1,
    fillOpacity: 0.2,
    fillColor: '#ffee22',
    strokeColor: '#ffd024',
}
export const polylineOptions: AMap.Polyline.Options =  {
    strokeColor: '#28A9EE',
    strokeOpacity: 1,
    strokeWeight: 2,
    strokeStyle: 'solid',
}

export default forwardRef<HTMLDivElement | null, IProps>((props,ref) => {
    const [ containerId ] = useState(() => randomId(8))
    const [ success, setSuccess] = useState(false)
    const { plugins, mapType = ["TileLayer", "RoadNet"]} = props;
    const { onSuccess, options } = props;
    useEffect(() => {
        (async () =>  {
            await AMapLoader.load({
                "key": Config.amapKey,
                "version": "1.4.15",
                "plugins": plugins ? plugins : []
            })
            const layerCollection: LayerType = {
                Satellite: null,
                Traffic: null,
                RoadNet: null,
                TileLayer: null,
            }
            const layers = mapType.map((name: MapType) => {
                switch (name) {
                    case "Satellite":
                        const Satellite = new AMap.TileLayer.Satellite();
                        layerCollection.Satellite = Satellite
                        return Satellite
                    case 'Traffic':
                        const Traffic = new AMap.TileLayer.Traffic();
                        layerCollection.Traffic = Traffic
                        return Traffic
                    case "RoadNet":
                        const RoadNet = new AMap.TileLayer.RoadNet();
                        layerCollection.RoadNet = RoadNet
                        return RoadNet
                    default:
                        const TileLayer = new AMap.TileLayer({zIndex: 2});
                        layerCollection.TileLayer = TileLayer
                        return TileLayer
                }
            })
            if(success){
                const map = new AMap.Map(containerId, {
                ...options,
                layers: layers
                });
                map.layers = layerCollection // 把当前所有图层存起来给map实例的layer属性，方便切换图层时拿到对应的图层实例
                typeof onSuccess == 'function' && onSuccess(map);
            }
            setSuccess(true)
        })()
    }, [success])
    return(
        success ? <div id={containerId} ref={ref} style={{height: '100%', width: '100%'}} ></div> : <Loading type="block" size="large" />
    )
})
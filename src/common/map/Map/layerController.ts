/**
 * 高德地图图层管理工具
 * 1. 把高德地图图层分为4种类型来分别进行管理
 *    1.1 polygonLayers 多边形图层[]，数组中的每一项都代表一个多边形图层层，里面可以放多个polygon,这样相当于分组管理 类似这样 
 *      {
 *          layer1: [polygon1_1, polygon1_2, ...],
 *          layer2: [polygon2_1, polygon2_2, ...],
 *          ...
 *      }
      1.2 polylineLayers 同上类似
      1.3 markerLayers 同上类似
      1.4 otherLayers 同上类似
 * 2. 当需要清除地图上的某个标记物时（polygon,polyline,marker）,如果这个标记物在本图层管理工具的某个图层中，那么删除时应该调用 layerController.deleteObj(标记物引用)来删除
 */

export interface PolygonLayers {
    [k: string]: AMap.Polygon[],
}
export interface PolylineLayers {
    [k: string]: AMap.Polyline[],
}
export interface MarkerLayers {
    [k: string]: AMap.Marker[],
}

export default class LayerController {
    map: AMap.Map;
    polygonLayers: PolygonLayers;
    polylineLayers: PolylineLayers;
    markerLayers: MarkerLayers;
    otherLayers: AMap.Marker | AMap.Polyline | AMap.Polygon[]
    constructor(map: AMap.Map){
        this.map = map
        this.polygonLayers = {}
        this.polylineLayers = {}
        this.markerLayers = {}
    }
    // 清除所有图层
    clearAll(){
        this.map.clearMap()
    }
    // 清除多边形图层
    clearPolygonLayers(name?: string){
        if(name){
            this.polygonLayers[name] && this.map.remove(this.polygonLayers[name])
            this.polygonLayers[name] = []
        }else{
            // 全部清除
            for(let layer in this.polygonLayers){
                this.map.remove(this.polygonLayers[layer])
                this.polygonLayers[layer] = []
            }
        }
    }
    // 清除线段图层
    clearPolylineLayers(name?: string){
        if(name){
            this.polylineLayers[name] && this.map.remove(this.polylineLayers[name])
            this.polylineLayers[name] = []
        }else{
            // 全部清除
            for(let layer in this.polylineLayers){
                this.map.remove(this.polylineLayers[layer])
                this.polylineLayers[layer] = []
            }
        }
    }
    // 清除点标记图层
    clearMarkerLayers(name?: string){
        if(name){
            this.markerLayers[name] && this.map.remove(this.markerLayers[name])
            this.markerLayers[name] = []
        }else{
            // 全部清除
            for(let layer in this.markerLayers){
                this.map.remove(this.markerLayers[layer])
                this.markerLayers[layer] = []
            }
        }
    }

    private addToLayer(target: any, poly: any){
        if(Array.isArray(poly)){
            target = [...target, ...poly]
        }else{
            target = [...target, poly]
        }
    }
    // 新增多边形图层
    createPolygonLayer(layerName: string){
        if(!this.polygonLayers[layerName]){
            this.polygonLayers[layerName] = []
        }
        return this.polygonLayers[layerName]
    }
    // 新增线段图层
    createPolylineLayer(layerName: string){
        if(!this.polylineLayers[layerName]){
            this.polylineLayers[layerName] = []
        }
        return this.polylineLayers[layerName]
    }
    // 新增点标记图层
    createMarkerLayer(layerName: string){
        if(!this.markerLayers[layerName]){
            this.markerLayers[layerName] = []
        }
        return this.markerLayers[layerName]
    }

    // 向指定多边形图层中增加多边形实例
    addPolygon(polygon: AMap.Polygon | AMap.Polygon[], layerName: string){
        if(!this.polygonLayers[layerName]){
            this.polygonLayers[layerName]  = []
        }
        const target = this.polygonLayers[layerName]
        this.addToLayer(target, polygon)
    }
    // 向指定线段图层中增加线段实例
    addPolyline(polyline: AMap.Polyline | AMap.Polyline[], layerName: string){
        if(!this.polylineLayers[layerName]){
            this.polylineLayers[layerName]  = []
        }
        const target = this.polylineLayers[layerName]
        this.addToLayer(target, polyline)
    }
    // 向指定点标记图层中增加点标记实例
    addMarker(marker: AMap.Marker | AMap.Marker[], layerName: string){
        if(!this.markerLayers[layerName]){
            this.markerLayers[layerName]  = []
        }
        const target = this.markerLayers[layerName]
        this.addToLayer(target, marker)
    }

    /**
     * 清除某一多边形 | 线段 | 点标记
     * @param obj 多边形 | 线段 | 点标记实例
     * @param type 0多边形,1线段, 2点标记 
     */

    deleteObj(obj: any, type?: 0 | 1 | 2){
        const delPolygon = () => {
            for(let layer in this.polygonLayers){
                let idx = -1
                const res = this.polygonLayers[layer].find((item: any,index) => {
                    if(item._amap_id == obj._amap_id){
                        idx = index
                        return true
                    }
                })
                if(res){
                    this.polygonLayers[layer].splice(idx, 1)
                    res.setMap(null)
                    return true
                }
            }
        }
        const delPolyline = () => {
            for(let layer in this.polylineLayers){
                let idx = -1
                const res = this.polylineLayers[layer].find((item: any,index) => {
                    if(item == obj){
                        idx = index
                        return true
                    }
                })
                if(res){
                    this.polylineLayers[layer].splice(idx, 1)
                    res.setMap(null)
                    return true
                }
            }
        }
        const delMarker = () => {
            for(let layer in this.markerLayers){
                let idx = -1
                const res = this.markerLayers[layer].find((item: any,index) => {
                    if(item == obj){
                        idx = index
                        return true
                    }
                })
                if(res){
                    this.markerLayers[layer].splice(idx, 1)
                    res.setMap(null)
                    return true
                }
            }
        }
        const arr = [delPolygon,delPolyline,delMarker]
        if(type){
            arr[type]()
        }else{
            let i = 0
            while(i< arr.length){
                const isSuccess = arr[i]()
                if(isSuccess){
                    break
                }
                i++
            }
        }
    }
}
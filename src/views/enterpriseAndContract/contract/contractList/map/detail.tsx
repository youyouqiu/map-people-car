import React, { Component } from 'react';
import ErrorBoundary from '../../../ErrorBoundary';
// import deleteImg from '@/static/image/delete.svg'
import MapWrapper, { MapType } from '@/common/amapContainer/mapWrapper';
import AmapContainer from '@/common/amapContainer';

interface IState {
    map: AMap.Map | undefined;
    mapType?: MapType;
}

interface IProps {
    path: any;
    type?: number;
    countyCode: string;
}

class Map extends Component<IProps, IState> {
    mouseTool: AMap.MouseTool;
    polygonObj: AMap.Polygon | null; //全局唯一多边形对象（）
    mapWrapper: MapWrapper;
    overlays: AMap.Overlay[] = [];
    state = {
        map: undefined,
    };

    /**
     * 画行政区域
     */
    drawBounds = (countyCode?: string) => {
        let district = null;
        const polygons: AMap.Overlay[] = [];
        //加载行政区划插件
        if (!district) {
            //实例化DistrictSearch
            const opts: AMap.DistrictSearch.Options = {
                subdistrict: 0, //获取边界不需要返回下级行政区
                extensions: 'all', //返回行政区边界坐标组等具体信息
                level: 'district', //查询行政级别为 市
            };
            district = new AMap.DistrictSearch(opts);
        }
        //行政区查询 500103 渝中区地图编码
        if (countyCode) {
            district.search(countyCode, (status: AMap.DistrictSearch.SearchStatus, result: AMap.DistrictSearch.SearchResult) => {
                const bounds = result.districtList[0].boundaries;
                if (bounds) {
                    for (let i = 0, l = bounds.length; i < l; i++) {
                        //生成行政区划polygon
                        const polygon = new AMap.Polygon({
                            strokeWeight: 1,
                            path: bounds[i],
                            fillOpacity: 0.2,
                            fillColor: '#ffee22',
                            strokeColor: '#ffd024',
                        });
                        polygons.push(polygon);
                    }
                }
                this.mapWrapper.map.add(polygons);
                // this.mapWrapper.map.setFitView();
            });
        }
    };

    /**
     * 清除地图 overlay
     */
    clearMap = () => {
        // 先退出polygon 编辑状态 ，不然会有一系列不可控制的编辑点无法删除，除非全部清除
        this.mapWrapper.map.remove(this.overlays);
        this.polygonObj = null;
    };

    /**
     * 获取实例并初始化地图
     * 然后赋值给 this.state.map
     * @param mapWrapper 高德地图容器
     */
    getInstance = (mapWrapper: MapWrapper) => {
        this.mapWrapper = mapWrapper;
        this.mapWrapper.map.plugin(
            [
                'AMap.MapType',
                'AMap.ToolBar',
                'AMap.MouseTool',
                'AMap.PolyEditor',
                'AMap.Scale',
                'AMap.Marker',
                'AMap.Marker',
                'AMap.DistrictSearch',
                'AMap.Polygon',
            ],
            () => {

                //在这里进行地图的初始化
                this.drawBounds(this.props.countyCode);
                //绘制初始围栏  不能在 CompoenntDidiMount 里面绘制 因为 Amap可能还未加载完成
                const { path } = this.props;
                if (path) {
                    this.polygonObj = new AMap.Polygon({
                        path: path,
                        zIndex: 50,
                        strokeColor: '#28A9EE',
                        strokeOpacity: 1,
                        strokeWeight: 2,
                        fillColor: '#1791fc',
                        fillOpacity: 0.4,
                        strokeStyle: 'solid',
                    });
                    this.mapWrapper.map.add(this.polygonObj);
                    this.overlays.push(this.polygonObj);
                    this.mapWrapper.map.setFitView(this.polygonObj);
                }
                this.mapWrapper.map.addControl(new AMap.Scale());
                //MouseTool工具
                this.mouseTool = new AMap.MouseTool(this.mapWrapper.map);
                //地图类型切换控件
                const type = new AMap.MapType({
                    defaultType: 1,
                    showRoad: true,
                });
                type.hide(); //隐藏地图类型切换控件
                this.mapWrapper.map.addControl(type);
                //原生toobar
                this.mapWrapper.map.addControl(new AMap.ToolBar());
            }
        );

        this.setState({
            map: this.mapWrapper.map,
        });
    };
    /**
     *
     * @param mapType 地图类型
     */
    handleChangeMapType = (mapType: MapType) => {
        if (mapType) {
            this.mapWrapper.changeMapType(mapType);
        }
    };

    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        const { path, countyCode } = nextProps;

        if (this.mapWrapper && path != this.props.path) {
            //每次 rowId 改变时,重绘overlays
            this.mapWrapper.map.clearMap();
            //画行政边界
            this.drawBounds(countyCode);
            this.polygonObj = new AMap.Polygon({
                path: path,
                zIndex: 50,
                strokeColor: '#28A9EE',
                strokeOpacity: 1,
                strokeWeight: 2,
                fillColor: '#1791fc',
                fillOpacity: 0.4,
                strokeStyle: 'solid',
            });
            // 根据path画多边形
            this.overlays.push(this.polygonObj);
            this.mapWrapper.map.add(this.polygonObj);
            this.mapWrapper.map.setFitView(this.polygonObj);
        }
    }

    render() {
        return (
            <div style={{ height: '386px', position: 'relative' }}>
                <ErrorBoundary>
                    <AmapContainer getInstance={this.getInstance.bind(this)} amapOption={{ zoom: 14 }} />
                </ErrorBoundary>
            </div>
        );
    }
}

export default Map;

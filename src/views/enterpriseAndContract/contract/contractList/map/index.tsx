import React, { Component } from 'react';
import ErrorBoundary from '../../../ErrorBoundary';
import Toolbar from './Toolbar';
import deleteImg from '@/static/image/delete.svg';
import { getDetailByOrganization } from '@/server/enterpriseAndContract';
import MapWrapper, { MapType } from '@/common/amapContainer/mapWrapper';
import AmapContainer from '@/common/amapContainer';

interface IState {
    map: AMap.Map | undefined;
    mapType?: MapType;
    cursorX: number;
    cursorY: number;
    toolTipShow: boolean;
    delShow: boolean;
}

interface IProps {
    setArea: (area: number) => void; //把绘制面积传递给外部函数
    setLngLat: (area: any) => void; //把绘经纬度传递给外部函数
    organizationId: string; //根据id查询初始化信息
}


class Map extends Component<IProps, IState> {
    mouseTool: AMap.MouseTool;
    polyEditor: AMap.PolyEditor | null; //全局唯一编辑器
    polygonObj: AMap.Polygon | null; //全局唯一多边形对象（）
    mapWrapper: MapWrapper;
    marker: AMap.Marker; // 删除按钮
    overlays: AMap.Overlay[] = [];
    state = {
        map: undefined,
        cursorX: 0,
        cursorY: 0,
        toolTipShow: false,
        delShow: false,
    };

    //mouseEvent
    mouseEvent = (e: { pixel: { x: number; y: number } }) => {
        this.setState({
            cursorX: e.pixel.x + 10,
            cursorY: e.pixel.y + 10,
        });
    };

    /**
     * 画行政区域
     */
    drawBounds = (organizationId: string) => {
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
        let countyCode: string = '';
        (async () => {
            const data = await getDetailByOrganization<any>(organizationId);
            countyCode = data.countyCode || data.cityCode || data.provinceCode;
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
        })();
    };

    /**
     * 绘制多边形
     */
    drawPolygon = () => {
        //当polygon实例已经被创建之后，不再创建新的 而是返回之前的编辑器对象
        if (this.polygonObj) {
            this.editPolygon('start');
            return;
        }

        //mouseEvent
        const mouseEvent = (e: { pixel: { x: number; y: number } }) => {
            this.setState({
                cursorX: e.pixel.x + 10,
                cursorY: e.pixel.y + 10,
            });
        };

        // 显示提示框
        this.setState({
            toolTipShow: true,
        });

        // 绑定提示框位置
        this.mapWrapper.map.on('mousemove', mouseEvent);

        //开始绘制
        // this.polygonObj = this.mouseTool.polygon({
        this.mouseTool.polygon({
            strokeColor: '#28A9EE',
            strokeOpacity: 1,
            strokeWeight: 2,
            fillColor: '#1791fc',
            fillOpacity: 0.4,
            strokeStyle: 'solid',
        });
    };

    // 注册相关事件
    init = () => {
        // 绑定提示框位置
        this.mapWrapper.map.on('mousemove', this.mouseEvent);
        // 绘制结束回调
        this.mouseTool.on('draw', (params: any) => {
            const { obj } = params;
            this.polygonObj = obj;
            this.overlays.push(obj);
            this.setState({
                toolTipShow: false,
                delShow: true,
            });
            // 获取最后一个点的位置，添加删除marker
            const len = obj.w.path.length;
            const lanAndLat: [number, number] = [obj.w.path[len - 1].lng, obj.w.path[len - 1].lat];
            this.addMarker(lanAndLat);

            const myPath: [number, number][] = [];
            obj.w.path.map((item: any) => {
                myPath.push([item.lng, item.lat]);
            });
            this.props.setLngLat(myPath);
            this.calcArea(obj);
            //关闭绘图事件
            this.mouseTool.close(false);
            // 开启编辑模式
            this.editPolygon('start');
            //注销事件
            this.mapWrapper.map.off('mousemove', this.mouseEvent);
        });
    };

    /**
     * 计算面积
     *
     */
    calcArea = (obj: any) => {
        try {
            const area = Math.round(AMap.GeometryUtil.ringArea(obj.w.path));
            this.props.setArea(area);
        } catch (error) {
        }
    };

    /**
     * 清除地图 overlay
     */
    clearMap = () => {
        // 先退出polygon 编辑状态 ，不然会有一系列不可控制的编辑点无法删除，除非全部清除
        this.editPolygon('close');
        this.props.setLngLat([]);
        this.props.setArea(0);
        this.mapWrapper.map.remove(this.overlays);
        this.polygonObj = null;
        this.polyEditor = null;
    };

    /**
     *
     * @param action 'start' | 'close'
     * 编辑多边形 start 开启编辑模式  close 关闭编辑模式
     */
    editPolygon = (action: 'start' | 'close') => {
        if (this.polygonObj) {
            //确保只有一个polyEditor实例 否则下面的open() 和 close() 方法指向的不是同一个实例 将不能关闭编辑
            if (!this.polyEditor) {
                this.polyEditor = new AMap.PolyEditor(this.mapWrapper.map, this.polygonObj);
            }
            //编辑结束后的回调
            if (this.polyEditor.on) {
                this.polyEditor.on('adjust', () => {
                    console.info('触发事件：adjust');
                    const myPath: [number, number][] = [];

                    (this.polygonObj as any).w.path.map((item: any) => {
                        myPath.push([item.lng, item.lat]);
                    });
                    this.props.setLngLat(myPath);
                    this.calcArea(this.polygonObj);
                    // 更新删除按钮的位置
                    try {
                        const lastPoint = (this.polygonObj as any).w.path[(this.polygonObj as any).w.path.length - 1];
                        const lnglat: [number, number] = [lastPoint.lng, lastPoint.lat];
                        this.marker.setPosition(lnglat);
                    } catch (error) {
                    }
                });
            }
            if (action === 'start') {
                this.polyEditor.open();
            } else if (action === 'close') {
                this.polyEditor.close();
            }
        }
    };

    /**
     *
     * @param lanAndLat [number, number]
     * 添加删除 marker
     */
    addMarker = (lanAndLat: [number, number]) => {
        const position = new AMap.LngLat(...lanAndLat);
        const btnId = Math.random();
        const markerContent = `<div id="${btnId}" style="background: #fff;text-align: center;margin: 0;width: 23px;height: 27px;padding: 0;">
        <img src='${deleteImg}' style="width: 75%;height: 100%;"/>
        </div>`;
        this.marker = new AMap.Marker({
            position: position,
            content: markerContent,
            offset: new AMap.Pixel(-13, -30),
        });
        // 将 marker 添加到地图
        this.mapWrapper.map.add(this.marker);
        this.overlays.push(this.marker);
        //由于高德地图添加的 markerContent 是不受 React 控制的  因此需要在确保高德地图添加了marker之后 我们在进行函数绑定
        setTimeout(() => {
            const btn: HTMLElement | null = document.getElementById(btnId + '');
            if (btn) {
                btn.addEventListener('click', () => {
                    this.clearMap();
                });
            }
        }, 500);
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
                'AMap.GeometryUtil',
            ],
            () => {
                //在这里进行地图的初始化
                this.drawBounds(this.props.organizationId);
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
                //注册事件
                this.init();
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
        const { organizationId } = nextProps;
        if (this.mapWrapper && organizationId != this.props.organizationId) {
            //每次 rowId 改变时,重绘overlays
            this.mapWrapper.map.clearMap();
            //画行政边界
            this.drawBounds(organizationId);
        }
    }

    render() {
        return (
            <div style={{ height: '386px', position: 'relative' }}>
                <ErrorBoundary>
                    <AmapContainer getInstance={this.getInstance.bind(this)} amapOption={{ zoom: 18 }} />
                    {/* 工具条 */}
                    <Toolbar
                        map={this.state.map}
                        changeMapType={(maptype: MapType) => {
                            this.handleChangeMapType(maptype);
                        }}
                        drawPolygon={this.drawPolygon}
                    />
                    <p
                        style={{
                            position: 'absolute',
                            background: '#fff',
                            border: '1px solid red',
                            left: this.state.cursorX,
                            top: this.state.cursorY,
                            display: this.state.toolTipShow ? 'block' : 'none',
                        }}
                    >
                        单击开始绘制，双击结束绘制
                    </p>
                </ErrorBoundary>
            </div>
        );
    }
}

export default Map;

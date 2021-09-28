/* eslint-disable react/prop-types */
import React,{useState, useEffect, useCallback, useRef} from 'react'
import { Menu, Dropdown, Radio, Popconfirm } from 'antd';
import FullscreenOutlined from "@ant-design/icons/FullscreenOutlined";
import FullscreenExitOutlined from "@ant-design/icons/FullscreenExitOutlined";
import District,{AllCode} from './DistrictModal'
import styles from './tools.module.less'
import tool from '@/static/image/tool.svg';
import settingSvg from '@/static/image/map-drop-sett.svg';
import iconGPS from '@/static/image/draw_GPS.png';
import iconDraw from '@/static/image/draw_draw.png';
import iconLine from '@/static/image/draw_line.png';
import iconPolygon from '@/static/image/draw_polygon.png';
import iconDistrict from '@/static/image/draw_district.png';

import { MapType } from '../Map';

export type DrawType = 'polygon' | 'polyline' | 'district' | 'GPS' | undefined

// 默认数据结构都是一样的
export const getArrDimension = (arr: any[]): number => {
    if(Array.isArray(arr)){
        return 1 + getArrDimension(arr[0])
    }
    return 0
} 

interface ITools {
    mapRef: HTMLDivElement | null;
    map: AMap.Map | undefined; // 传给子组件 District 使用，因为该组件获取行政区code时需要用到amap的内置api
    drawTypes: DrawType[];
    disablePopComfirm?: boolean;
    defalutType?: DrawType;
    initAdCode?: AllCode;
    customFullscreen?: (fullScreen: boolean) => void; // 自定义全屏函数
    clearMap: () => void;
    onMapTypeChange?: (maptypes: MapType[]) => void; //切换地图类型
    onDrawTypeChange?: (drawType: DrawType) => void; //切换地图绘制模式
    drawPolygon?: () => void //画多边形
    drawPolyline?: () => void //画线
    drawDistrict?: (param?: {currentCode: string, allCode: AllCode}) => void //画行政区 不传code时 清空地图
    drawGPS?: () => void //导航绘制
}

const Tool: React.FC<ITools> = (props) => {
    const { drawTypes, disablePopComfirm = true, defalutType, map, mapRef, initAdCode, clearMap, onDrawTypeChange, onMapTypeChange, drawPolygon, drawPolyline, drawDistrict, drawGPS} = props
    const [fullScreen, setFullScreen] = useState(false) //全屏
    const [currentDrawType, setCurrentDrawType] = useState<DrawType>(defalutType) //地图绘制模式
    const [districtShow, setDistrictShow] = useState(false) //行政区域绘制模态框展示与否
    const [toolShow,setToolShow] = useState(true)
    const mapOriginContainer = useRef<any>() 
    const toolPopupContainer = useRef<any>() 

    useEffect(() => {
        mapOriginContainer.current = mapRef?.parentNode?.parentNode
    },[mapRef])

    useEffect(() => {
        if(map && initAdCode?.province && defalutType == 'district'){
            setDistrictShow(true)
            setCurrentDrawType('district')
        }
    },[initAdCode, map])

    // 地图设置弹出层  "TileLayer" | "Satellite" | "RoadNet" | "Traffic"
    const menu = (
        <Menu>
            <Menu.Item>
                <Radio.Group defaultValue={0} onChange={(e) => {
                    const type: MapType[][] = [['TileLayer','RoadNet'],['Satellite','RoadNet']]
                    const layers = type[e.target.value].map((name: MapType) => {
                        switch (name) {
                            case "Satellite":
                                return new AMap.TileLayer.Satellite();
                            case 'Traffic':
                                return new AMap.TileLayer.Traffic();
                            case "RoadNet":
                                return new AMap.TileLayer.RoadNet();
                            default:
                                return new AMap.TileLayer({zIndex: 2});
                        }
                    })
                    map?.setLayers(layers)
                  }
                }>
                    <Radio value={0}>标准地图</Radio>
                    <br />
                    <Radio value={1}>卫星地图</Radio>
                </Radio.Group>
            </Menu.Item>
        </Menu>
    )
    
    // 切换全屏
    const toggleFullScreen = () => {
        if(typeof props.customFullscreen == 'function'){
          props.customFullscreen(fullScreen)
          setFullScreen((s) => !s)
          return 
        }
        const container = fullScreen ? mapOriginContainer.current : document.body;
        (mapRef as any).parentNode.classList.toggle(styles.fullscreen)
        if(!fullScreen){
            if(drawTypes.length == 0 && false){ //详情
              (mapRef as any).parentNode.style.height = 'calc(100% - 52px)';
              (mapRef as any).parentNode.style.zIndex = 10000;
              (mapRef as any).parentNode.style.top = 0;
            }else{
              (mapRef as any).parentNode.style.height = 'calc(100% - 110px)';
            }
            (mapRef as any).parentNode.style.position = 'absolute'
            addDiv();
        }else{
            (mapRef as any).parentNode.style.height = '100%';
            (mapRef as any).parentNode.style.position = 'relative'
            deleteDiv();
        }
        if(mapRef?.parentNode){
            container?.appendChild(mapRef?.parentNode)
        }
        setFullScreen((s) => !s)
        function addDiv(){
          if(!document.querySelector('#maskDiv')){
            const div = document.createElement('div')
            div.id = 'maskDiv'
            div.style.top = '0'
            div.style.height = '59px'
            div.style.width = '100%'
            div.style.background = '#ffffff00'
            div.style.position = 'fixed'
            div.style.zIndex = '10000'
            document.body.appendChild(div)
          }
        }
        function deleteDiv(){
          if(document.querySelector('#maskDiv')){
            document.querySelector('#maskDiv')?.remove()
          }
        }
    }

    const nameMapping = {
        polygon: '多边形',
        polyline: '线路',
        district: '行政区',
        GPS: '导航绘制'
    }

    // 绘制模式改变事件
    const changeDrawType = (type: DrawType) => {
        // 气泡框未启用时才走下面的逻辑，气泡框启用时通过气泡框的onComfirm事件走相应的逻辑
        if(disablePopComfirm){
            doIt(type)
        }
    }

    const doIt = (type: DrawType) => {
        clearMap()
        onDrawTypeChange && onDrawTypeChange(type)
        switch (type) {
            case 'polygon':
                drawPolygon && drawPolygon()
                break;
            case 'polyline':
                drawPolyline && drawPolyline()
                break;
            case 'district':
                drawDistrict && drawDistrict()
                break;
            case 'GPS':
                drawGPS && drawGPS()
                break;
            default:
                break;
        }
        setDistrictShow(type == 'district')
        setCurrentDrawType(type)
    }

    //气泡框确认事件
    const onPopComfirm = (type: DrawType) => {
        doIt(type)
    }

    // 行政区域绘制时——确认事件
    const handleComfirm = useCallback((code: string) => {
        setDistrictShow(false)
    },[])
    // 行政区域绘制时——省市区改变事件
    const handleChange = useCallback((currentCode: string, allCode: AllCode) => {
        drawDistrict && drawDistrict({currentCode, allCode})
    },[])
    // 行政区域绘制时——取消事件
    const handleCancle = useCallback(() => {
        setDistrictShow(false)
        drawDistrict && drawDistrict() // 参数为空说明清空地图
    },[])
    const getIcon = (type: DrawType) => {
        const s = {
            polygon: iconPolygon,
            polyline: iconLine,
            district: iconDistrict,
            GPS: iconGPS,
        }
        return type && <img style={{width: '16px',marginRight: '11px'}} src={s[type]}/>
    }
    return(
        <div>
            {/* <div className={styles.imgBox} style={toolShow ? {top: '63px'} : {top: '14px'}} onClick={() => {setToolShow((a) => !a)}}>
                <img src={tool} />
            </div> */}
            <div className={styles.tools} style={toolShow ? {display: 'flex'} : {display: 'none'}} ref={toolPopupContainer}>
                <div className={styles.left}>
                <div style={{ border: 'none', boxShadow: 'none', fontSize: '14px', fontWeight: 'bold',display: drawTypes.length == 0 ? 'none' : 'block'}}>
                    <img style={{width: '16px',marginRight: '4px'}} src={iconDraw}/>
                    绘制模式
                </div>
                    {
                        drawTypes.map((type, idx) => {
                            if(!type) return null
                            return(
                                <Popconfirm
                                    key={idx}
                                    disabled={disablePopComfirm}
                                    onConfirm={() => {onPopComfirm(type)}}
                                    title="重新绘制需删除已有图形"
                                    okText="确认"
                                    cancelText="取消"
                                    placement="bottom"
                                >
                                    <div className={currentDrawType == type ? styles.active : ''} onClick={() => {changeDrawType(type)}}>
                                        {getIcon(type)}
                                        <span>{nameMapping[type]}</span>
                                    </div>
                                </Popconfirm>
                            )
                        })
                    }
                </div>
                <div className={styles.left}>
                    <div onClick={toggleFullScreen}>
                        {   fullScreen ? 
                            <span className={styles.fullbox}><FullscreenExitOutlined className={styles.full}/>退出全屏</span>
                            :
                            <span className={styles.fullbox}><FullscreenOutlined className={styles.full}/>全屏{drawTypes.length == 0 ? '' : '绘制'}</span>
                        }
                    </div>
                    <Dropdown 
                      overlay={menu} 
                      placement="bottomCenter" 
                      trigger={['click']} 
                      overlayClassName={styles.dropdownFix} 
                      getPopupContainer={() => {
                        return toolPopupContainer.current || document.body
                      }}
                    >
                        <div>
                            <img src={settingSvg} alt="" />
                            地图设置
                        </div>
                    </Dropdown>
                </div>
                {districtShow && <District map={map} onChange={handleChange} onComfirm={handleComfirm} onCancle={handleCancle} initAdCode={initAdCode}/>}
            </div>
        </div>
    )
}
export default Tool
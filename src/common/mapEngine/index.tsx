// 地图公共组件
import React, { memo } from "react";
import AmapContainer from '@/common/amapContainer';// 高德地图
import BMapContainer from '@/common/bmapContainer';// 百度地图
import GoogleMapContainer from '@/common/googleMapContainer';// 谷歌地图

interface IProps {
  /**
   * 当前显示地图类型
   */
  mapType?: 'amap' | 'baidu' | 'google';
  /**
  * 初始化地图的选项
  */
  mapOption?: object;
  /**
   * 需要使用的插件列表
   */
  plugins?: Array<string>;
  /**
  * 获取实例
  */
  getInstance: (mapWrapper: any) => void;
  // 获取标段
  longLat?: Array<string>;
}

const LoadMap = memo((props: IProps) => {
  // 加载对应的地图实例
  const renderMap = () => {
    switch (props.mapType) {
      default:
      case 'amap':
        return <AmapContainer
          getInstance={props.getInstance}
          amapOption={props.mapOption}
          plugins={props.plugins}
        />
      case 'baidu':
        return <BMapContainer
          getInstance={props.getInstance}
          mapType={props.mapType}
        />;
      case 'google':
        return <GoogleMapContainer {...props} />;
    }
  }

  return <>
    {renderMap()}
  </>;
})

export default LoadMap;
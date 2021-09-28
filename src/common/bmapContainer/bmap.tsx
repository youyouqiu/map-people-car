import React, { memo, useRef, useState, useEffect } from 'react';
// import { Map } from 'react-bmapgl';
// import { useMap, Polygon } from '@uiw/react-baidu-map';
import { mapFunsObj } from './mapFunsObj';

interface IProps {
  getInstance: (mapWrapper: any) => void; // 地图实例
}

const BMap = memo((props: IProps) => {
  console.log(props, 'this.BMapProps');
  const { getInstance } = props;
  // 地图层级
  const [zoom, setZoom] = useState(18);
  
  // 获取地图实例
  useEffect(() => {
    const map = new BMapGL.Map('container'); // 创建bMap实例
    console.log(map, 'map');
    map.centerAndZoom(new (BMapGL as any).Point(116.404, 39.915), 16); // 初始化地图，设置中心点坐标和地图级别
    map.enableScrollWheelZoom(); // 开启鼠标滚轮缩放
    if (map) {
      const newMapWrapper = { map };
      // 地图实例方法合并
      Object.assign(newMapWrapper.map, mapFunsObj);
      if (typeof getInstance === 'function') {
        console.log(newMapWrapper, 'newMapWrapper');
        getInstance(newMapWrapper);
      }
    }
  }, []);
  
  return (
    <>
      <div id="container" style={{width: '100%', height: '100%'}} />
    </>
  );
});

export default BMap;

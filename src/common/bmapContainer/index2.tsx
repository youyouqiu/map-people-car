import React, { memo, useRef, useState, useEffect } from 'react';
// import { Marker, NavigationControl, InfoWindow } from 'react-bmapgl';
import { Map, Polygon, APILoader } from '@uiw/react-baidu-map';
import Loading from '@/common/loading';

interface IProps {
  mapType?: string
  longLat?: Array<any>
}

const BaiduMapContainer = memo((props: IProps) => {
  console.log(props, 'this.props');
  const { longLat } = props;
  const newLongLat = longLat || [];
  // baiduMap实例
  const mapRef: any = useRef();
  // 是否显示加载动画
  const [loadingType, setLoadingType] = useState(true);
  // 地图中心点
  const [centerData, setCenterData] = useState({lng: 116.402544, lat: 39.928216});
  // 地图层级
  const [zoomData, setZoomData] = useState(16);
  // 地图多边形数据
  const [longLatData, setLongLat] = useState([]);
  // 高德多边形经纬度数据结构转换为百度多边形经纬度数据结构
  const _AMapTransDataBMap = (data: Array<any>) => {
    if (data.length > 1) {
      return data[1];
    }
    return data[0];
  }
  // 高德经纬度转换为百度经纬度
  const _AMapTransLngLatBMap = (data: Array<any>) => {
    const X_PI: number = Math.PI * 3000.0 / 180.0;
    const newData = [];
    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        const x: number = data[i].lng;
        const y: number = data[i].lat;
        const z: number = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI);
        const theta: number = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI);
        const bd_lng: string = (z * Math.cos(theta) + 0.0065).toFixed(8);
        const bd_lat: string = (z * Math.sin(theta) + 0.006).toFixed(8);
        const lngAndLat = {lng: bd_lng, lat: bd_lat};
        newData.push(lngAndLat);
      }
    }
    return newData;
  }
  // 初始化
  useEffect(() => {
    // 切换地图组件Loading两秒
    setTimeout(() => {
      console.log(mapRef, 'mapRef');
      setLoadingType(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const res: any = _AMapTransLngLatBMap(_AMapTransDataBMap(newLongLat));
    // 取多边形中心经纬度
    if (res && res.length > 0) {
      const newCenterData = res[parseInt(`${res.length / 2}`)];
      // 设置多边形经纬度数据
      setLongLat(res);
      // 聚焦多边形中心点
      setCenterData(newCenterData);
      // 放大层级
      setZoomData(14);
    }
  }, [newLongLat]);

  // 绘制多边形
  const BaiduMapPolygon = () => {
    return (
      <Polygon
        visiable={true}
        strokeColor='red'
        strokeStyle='solid'
        strokeWeight={1}
        strokeOpacity={0.6}
        fillColor='rgb(38,148,238)'
        fillOpacity={0.4}
        path={longLatData}
        enableMassClear={false}
      />
    );
  }
  
  return (
    <div style={{ width: '100%', height: '100%' }}>
      {
        loadingType
        ? <Loading type='block' size='large' />
        : <APILoader akay='BOUTxUmuP8RMGbHvYuubgGTwWYHmNyFv'>
            <Map
              ref={mapRef}
              center={centerData}
              zoom={zoomData}
              enableScrollWheelZoom={true}
            >
              {BaiduMapPolygon()}
            </Map>
          </APILoader>
      }
    </div>
  );
});

export default BaiduMapContainer

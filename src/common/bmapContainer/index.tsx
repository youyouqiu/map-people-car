import React, { memo, useState, useEffect } from 'react';
// import { Marker, NavigationControl, InfoWindow } from 'react-bmapgl';
// import { APILoader } from '@uiw/react-baidu-map';
import Loading from '@/common/loading';
import BMap from './bmap';
// import Config from '@/framework/config';

interface IProps {
  getInstance: (mapWrapper: any) => void; // 地图实例
  mapType?: string;
}

const BaiduMapContainer = memo((props: IProps) => {
  console.log(props, 'this.BaiduMapContainerProps');
  const { getInstance } = props;
  // 是否显示加载动画
  const [loadingType, setLoadingType] = useState(true);
  // loader
  // const bMapLoader = () => {
  //   const _appHeaderDom = document.getElementsByTagName('head')[0];
  //   const bMapJS = document.createElement('script');
  //   bMapJS.setAttribute('type', 'text/javascript');
  //   bMapJS.setAttribute('src', `//api.map.baidu.com/api?type=webgl&v=1.0&ak=${Config.bmapKey}`);
  //   _appHeaderDom.appendChild(bMapJS);
  // }
  // 初始化
  useEffect(() => {
    // 加载bmapkey
    // bMapLoader();
    // 切换地图组件Loading两秒
    setTimeout(() => {
      setLoadingType(false);
    }, 2000);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {
        loadingType
        ? <Loading type='block' size='large' />
        : <BMap getInstance={getInstance} />
      }
    </div>
  );
});

export default BaiduMapContainer;

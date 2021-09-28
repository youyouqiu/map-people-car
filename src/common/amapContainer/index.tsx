import React, { Component } from "react";
import AMapLoader from '@amap/amap-jsapi-loader';
import Loading from '@/common/loading'
import Config from '@/framework/config'
import MapWrapper from "./mapWrapper";
import { mapFunsObj } from "./mapFunsObj";
import { generateRandomId } from '@/framework/utils/utils';

interface IProps {
  /**
   * 获取实例，包含高德地图实例和一系列操作方法
   */
  getInstance: (mapWrapper: MapWrapper) => void;
  /**
   * 初始化高德地图的选项
   */
  amapOption?: AMap.Map.Options;
  /**
   * 需要使用的插件列表
   */
  plugins?: Array<string>;
}

interface IState {
  loadingJSFile: boolean;
  containerId: string;
}

export default class AMapContainer extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      loadingJSFile: true,
      containerId: generateRandomId()
    };
    this.startLoadAmapJsFile();
  }

  shouldComponentUpdate() {
    const { loadingJSFile } = this.state;
    return loadingJSFile;
  }

  createAmapInstance() {
    const { getInstance, amapOption } = this.props;
    const { containerId } = this.state;
    this.setState({
      loadingJSFile: false,
    }, () => {
      const satellite = new AMap.TileLayer.Satellite();
      const roadNet = new AMap.TileLayer.RoadNet();
      const tileLayer = new AMap.TileLayer()
      satellite.hide();
      roadNet.hide();
      const layers = [tileLayer, satellite, roadNet];
      const map = new AMap.Map(containerId, Object.assign(amapOption, { layers }));
      const mapWrapper = new MapWrapper(map);
      if (typeof getInstance === 'function') {
        getInstance(mapWrapper);
      }
    })
  }

  startLoadAmapJsFile() {
    const { plugins } = this.props;
    AMapLoader.load({
      "key": Config.amapKey,   // 申请好的Web端开发者Key，首次调用 load 时必填
      "version": "1.4.15",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      "plugins": plugins ? plugins : []  //插件列表
    }).then(() => {
      this.createAmapInstance();
    }).catch(e => {
      console.error(e);
    })
  }

  render() {
    const { loadingJSFile, containerId } = this.state;
    return (
      loadingJSFile ?
        <Loading type="block" size="large" />
        : (
          <div id={containerId} style={{ width: '100%', height: '100%' }}>

          </div>
        )
    )

  }
}

export async function LoadAmapScript(plugins?: string[]) {
  await AMapLoader.load({
    "key": Config.amapKey,   // 申请好的Web端开发者Key，首次调用 load 时必填
    "version": "1.4.15",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    "plugins": plugins ? plugins : []  //插件列表
  });
}
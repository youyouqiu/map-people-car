/**
 * 谷歌地图
 */
import React, { Component } from "react";
import { Loader, LoaderOptions } from 'google-maps';
import Loading from '@/common/loading';
import Config from '@/framework/config';
import { generateRandomId } from '@/framework/utils/utils';
import { message } from "antd";
import { mapFunsObj } from "./mapFunsObj";

interface IProps {
  /**
   * 获取实例
   */
  getInstance: (mapWrapper: any) => void;
  /**
   * 初始化地图的选项
   */
  mapOption?: google.maps.MapOptions;
}

interface IState {
  loadingJSFile: boolean;
  containerId: string;
}

export default class GoogleMapContainer extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      loadingJSFile: true,
      containerId: generateRandomId()
    };
    this.startLoadMapJsFile();
  }

  shouldComponentUpdate() {
    const { loadingJSFile } = this.state;
    return loadingJSFile;
  }

  createMapInstance(map: any) {
    const { getInstance } = this.props;
    Object.assign(map, mapFunsObj);// 合并封装后的地图公共方法
    if (typeof getInstance === 'function') {
      getInstance({ map });
    }
  }

  async startLoadMapJsFile() {
    const { mapOption } = this.props;
    const options: LoaderOptions = {/* todo */ };
    const loader = new Loader(Config.googleKey, options);

    loader.load().then((google: any) => {
      console.log('google', google);
      this.setState({
        loadingJSFile: false,
      }, () => {
        const { containerId } = this.state;
        const map = new google.maps.Map(document.getElementById(containerId), {
          center: { lat: 39.915, lng: 116.404 },
          gestureHandling: 'greedy',
          ...mapOption
        });
        map.oldSetCenter = map.setCenter;
        this.createMapInstance(map);
      })
    }).catch((e: any) => {
      console.error(e);
      message.error('谷歌地图加载失败');
      this.setState({
        loadingJSFile: false,
      })
    })
  }

  render() {
    const { loadingJSFile, containerId } = this.state;
    return (
      loadingJSFile ?
        <Loading type="block" size="large" />
        : <div id={containerId} style={{ width: '100%', height: '100%' }}></div>
    )
  }
}
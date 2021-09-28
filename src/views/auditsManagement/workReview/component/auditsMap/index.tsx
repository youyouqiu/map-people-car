/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Component } from 'react';
import { Dropdown, Button, Radio, Menu } from 'antd';
import MapWrapper from "@/common/amapContainer/mapWrapper";
import AmapContainer from '@/common/amapContainer';
import { RadioChangeEvent } from "antd/lib/radio";
import styles from './index.module.less';
import setting from '@/static/image/map-drop-sett.svg';

interface IProps {
  currentLongLat: Array<Array<string>>;
  oldLongLat: Array<Array<string>>;
  workType: number | undefined | string;
  edit?: string | undefined;
  workId?: string | undefined;
}

interface IState {
  mapType: string;
  mapSetVisible: boolean;
  mapToolbarVisible: boolean;
}


class AuditsMap extends Component<IProps, IState, any>{
  mapWrapper: MapWrapper;
  areaData: any;
  constructor(props: IProps) {
    super(props)
    this.state = {
      mapSetVisible: false,
      mapType: 'amapSatellite',
      mapToolbarVisible: true,
    }
  }




  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { workType, currentLongLat, oldLongLat, edit, workId } = nextProps;

    if (edit && this.props.workId !== workId) {
      if (currentLongLat === this.props.currentLongLat) return;
      if (oldLongLat === this.props.currentLongLat) return;
      if (workType === this.props.workType) return;
    }

    this.areaData = nextProps
    if (this.mapWrapper != undefined) {
      this.mapWrapper.map.clearMap();
      this.coverInit(workType, currentLongLat, oldLongLat);
    }
  }

  /**
   * 高德地图初始化
   */
  getInstance = (mapWrapper: MapWrapper) => {
    this.mapWrapper = mapWrapper;
    this.mapWrapper.map.plugin([
      "AMap.MapType" //地图类型
    ], () => {
      const type = new AMap.MapType({
        defaultType: 1,
        showRoad: true
      })
      type.hide();
      this.mapWrapper.map.addControl(type);
    });


    if (this.areaData != undefined) {
      this.coverInit(this.areaData.workType, this.areaData.currentLongLat, this.areaData.oldLongLat)
    }
  }

  /**
   * 地图类型切换
   */
  mapTypeChange = (e: RadioChangeEvent) => {
    const value = e.target.value;
    this.mapWrapper.changeMapType(value)
    this.setState({
      mapType: value
    })
  }

  /**
  * 地图工具条
  */
  mapToolbarOperating = () => {
    const { mapToolbarVisible } = this.state;
    this.setState({
      mapToolbarVisible: !mapToolbarVisible
    })
  }

  handleVisibleChange = (flag: boolean) => {
    this.setState({ mapSetVisible: flag })
  }


  /**
  * 地图覆盖物
  */
  coverInit = (workType: any, currentLongLat: any, oldLongLat: any) => {
    if (workType == 1 || workType == '作业线路') {
      this.polylineArea(currentLongLat, oldLongLat)
    } else {
      this.polygonArea(currentLongLat, oldLongLat)
    }
  }

  /**
   * 作业线路
   */
  polylineArea = (currentLongLat: any, oldLongLat: any) => {
    /**当前线路 */
    if (currentLongLat && currentLongLat.length > 0) {
      const currentLine = new AMap.Polyline({
        path: currentLongLat,
        borderWeight: 4,
        strokeColor: '#54adff',
      });

      this.mapWrapper.map.add(currentLine);
      this.mapWrapper.map.setFitView([currentLine]);
    }

    /**原线路 */
    if (oldLongLat && oldLongLat.length > 0) {
      const option = {
        text: '原路线',
        position: oldLongLat[0],
        offset: new AMap.Pixel(5, -20),
        style: {
          'border-radius': '.25rem',
          'background-color': '#fff',
          'width': '84px',
          'border-width': 0,
          'text-align': 'center',
          'font-size': '14px',
          'color': 'rgb(255, 0, 0)',
          'border': '1px solid rgb(255, 0, 0)',
          'opacity': '0.9'
        },
      }
      const markerText = new AMap.Text(option);

      const oldLine = new AMap.Polyline({
        path: oldLongLat,
        borderWeight: 2,
        strokeColor: 'red'
      });

      this.mapWrapper.map.add([oldLine, markerText]);
    }
  }


  /**
   * 作业区域,清运区域
   */
  polygonArea = (currentLongLat: any, oldLongLat: any) => {
    if (currentLongLat && currentLongLat.length > 0) {
      const currentArea = new AMap.Polygon({
        path: currentLongLat,
        strokeColor: "#1791fc", //线颜色
        strokeOpacity: 1, //线透明度
        strokeWeight: 3, //线宽
        fillColor: "#1791fc", //填充色
        fillOpacity: 0.5, //填充透明度
      });

      this.mapWrapper.map.add(currentArea);
      this.mapWrapper.map.setFitView([currentArea]);
    }

    if (oldLongLat && oldLongLat.length > 0) {
      const option = {
        text: '原区域',
        position: oldLongLat[0],
        offset: new AMap.Pixel(5, -20),
        style: {
          'border-radius': '.25rem',
          'background-color': '#fff',
          'width': '84px',
          'border-width': 0,
          'text-align': 'center',
          'font-size': '14px',
          'color': 'rgb(255, 0, 0)',
          'border': '1px solid rgb(255, 0, 0)',
          'opacity': '0.9'
        },
      }
      const markerText = new AMap.Text(option);

      const oldArea = new AMap.Polygon({
        path: oldLongLat,
        strokeColor: "#f32828", //线颜色
        strokeOpacity: 1, //线透明度
        strokeWeight: 3, //线宽
        fillColor: "#f32828", //填充色
        fillOpacity: 0.5, //填充透明度
      });

      this.mapWrapper.map.add([oldArea, markerText]);
    }
  }

  /**
   * 获取区域中心点
   */
  // getCenterPoint(path: any) {
  //     let x = 0.0;
  //     let y = 0.0;
  //     for (let i = 0; i < path.length; i++) {
  //         x = x + parseFloat(path[i].lng);
  //         y = y + parseFloat(path[i].lat);
  //     }
  //     x = x / path.length;
  //     y = y / path.length;
  //     const position = [x, y]

  //     return position;
  // }


  render() {
    const {
      mapType,
      mapSetVisible,
      mapToolbarVisible
    } = this.state;

    const menu = (
      <Menu>
        <Menu.Item>
          <Radio.Group onChange={this.mapTypeChange} value={mapType}>
            <Radio value={'amapSatellite'}>卫星地图</Radio>
            <br />
            <Radio value={"google"}>谷歌地图</Radio>
          </Radio.Group>
        </Menu.Item>
      </Menu >
    );

    return (
      <div style={{ marginLeft: 5, height: 420, position: 'relative' }}>
        <AmapContainer
          getInstance={this.getInstance.bind(this)}
          amapOption={{ zoom: 14 }}
        />
        {/* 工具条 */}
        <div className={styles['toolbar']} onClick={this.mapToolbarOperating}></div>
        <div className={styles['menuBox']} >
          <Dropdown
            overlay={menu}
            placement="bottomCenter"
            onVisibleChange={this.handleVisibleChange}
            visible={mapSetVisible}
          >
            <Button className={mapToolbarVisible ? styles['defaultSetting'] : styles['setting']}><img src={setting} />地图设置</Button>
          </Dropdown>
        </div>
      </div>
    )
  }
}

export default AuditsMap
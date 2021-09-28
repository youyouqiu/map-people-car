/**
 * 设施地图
 */
import React, { Component } from 'react';

import AmapContainer from '@/common/amapContainer'
import MapWrapper from '@/common/amapContainer/mapWrapper';

import styles from '../../../index.module.less';

interface IProps {
  /**
   * 标注定位位置
   */
  position: Array<number> | null,
  /**
   * 标注位置改变后,回填显示位置信息方法
   */
  addressChange: Function
}

interface IState {
  map: AMap.Map | undefined;
  currentMarker: AMap.Marker | null;
  markerPosition: Array<number> | null
}

class Index extends Component<IProps, IState, any> {
  mapWrapper: MapWrapper
  constructor(props: IProps) {
    super(props);
    this.state = {
      map: undefined,// 地图
      currentMarker: null,// 地图上的标注
      markerPosition: null,// 标注位置
    };
  }

  componentDidMount() {
    const { position } = this.props;

    if (position) {
      this.setState({
        markerPosition: position
      })
    }
  }

  // props改变时触发
  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { position } = nextProps;

    const { map, currentMarker, markerPosition } = this.state;
    if (!position && map && currentMarker) {
      map.remove(currentMarker);
      this.setState({
        currentMarker: null
      })
    } else if (position !== markerPosition) {
      this.setState({
        markerPosition: position
      }, () => {
        this.renderMapMarker(position as AMap.LocationValue)
      })
    }
  }

  /**
   * 获取实例并初始化地图
   * 然后赋值给 this.state.map
   * @param mapWrapper 高德地图容器
   */
  getInstance = (mapWrapper: MapWrapper) => {
    this.mapWrapper = mapWrapper;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    this.mapWrapper.map.plugin(["AMap.Marker"], () => {
      this.mapWrapper.map.on('click', function (e) {
        const { lnglat: { lng, lat } } = e;
        const lnglatXY: AMap.LocationValue = [lng, lat];// 地图上所标点的坐标
        _this.renderMapMarker(lnglatXY);
      })
    });

    this.setState({
      map: this.mapWrapper.map,
    }, () => {
      const { position } = this.props;
      if (position) {
        this.renderMapMarker(position as AMap.LocationValue);
      }
    });
  }

  /**
   * 创建设施位置标注
   * @param position 经纬度信息
   */
  renderMapMarker = (position: AMap.LocationValue) => {
    let { currentMarker } = this.state;
    const { map } = this.state;
    if (!map) return;
    if (currentMarker) {
      currentMarker.setPosition(position);
    } else {
      currentMarker = new AMap.Marker({
        position: position,
        draggable: true,
        offset: new AMap.Pixel(-13, -30)
      });
      currentMarker.on('dragend', this.markerDrag);
      currentMarker.setMap(map);
    }
    map.setCenter(position);
    this.setState({
      currentMarker
    }, () => {
      this.renderAddressInfo(position);
    });
  }

  /**
   * 标记移动结束事件
   * @param e 
   */
  markerDrag = (e: any) => {
    const { lnglat: { lng, lat } } = e;
    const lnglatXY: AMap.LocationValue = [lng, lat];// 地图上所标点的坐标
    this.renderMapMarker(lnglatXY);
  }

  /**
   * 通过经纬度获取位置详细信息
   * @param position 
   */
  renderAddressInfo = (position: any) => {
    const { addressChange } = this.props;
    AMap.service('AMap.Geocoder', function () {// 回调函数
      const geocoder = new AMap.Geocoder({});
      geocoder.getAddress(position, function (status, result: any) {
        if (status === 'complete' && result.info === 'OK') {
          const { regeocode: { formattedAddress, addressComponent: { province, city, district } } } = result;
          const info = {
            province,
            city: city ? city : '市辖区',
            district: district,
            address: formattedAddress,
            longitude: position[0],
            latitude: position[1]
          }
          addressChange(info);
        } else {
          const info = {
            province: '',
            city: '',
            district: '',
            address: '',
          }
          addressChange(info);
        }
      });
    });
  }

  render() {
    return <div className={styles.mapContainer}>
      <AmapContainer
        getInstance={this.getInstance.bind(this)}
        amapOption={{ zoom: 14 }}
      />
    </div>
  }
}
export default Index;

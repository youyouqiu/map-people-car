import React, { Component } from "react";
import { Menu, Button, Dropdown, Radio } from 'antd';
import tool from '@/static/image/tool.svg';
import setting from '@/static/image/map-drop-sett.svg';
import styles from '../../index.module.less'
import { RadioChangeEvent } from "antd/lib/radio";
import { getSelectContainer } from "@/framework/utils/function";
import { distanceMeasurement, rectangularMeasurement, circularMeasurement, removeMulch } from './measurement';

export type Tool = {
  map: any,
  mousetool: AMap.MouseTool
}

interface IProps {
  mapWrapper: any;
  toggleMapType: (mapType: string) => void;
  currentMap: string
}
interface IState {
  mapSetVisible: boolean,
  toolMenuVisible: boolean,
  mapType: string,
  amapLevel2Value: string,
  bmapLevel2Value: string,
  gmapLevel2Value: string,
  amapLevel3Value: string,
  gmapLevel3Value: string,
  mapOverView: boolean,
  mapTraffic: boolean,
  measurementVisible: boolean,
  mapMeasurement: string,
}

const amapLevel2List = [
  { name: '标准地图', value: 'standardMap' },
  { name: '3D地图', value: 'threeDimensionalMap' },
  { name: '卫星地图', value: 'defaultMap' },
  { name: '卫星路网', value: 'satelliteRoadMap' }
];

const bmapLevel2List = [
  { name: '标准地图', value: 'standardMap' },
  { name: '3D地图', value: 'threeDimensionalMap' },
  { name: '三维地球', value: 'dimensionalMap' },
]

const gmapLevel2List = [
  { name: '标准地图', value: 'standardMap' },
  { name: '3D地图', value: 'threeDimensionalMap' },
  { name: '卫星地图', value: 'satellite' },
]

const gmapLevel3List = [
  { name: 'Default', value: 'daytime' },
  { name: 'Silver', value: 'silver' },
  { name: 'Night mode', value: 'night' },
  { name: 'Retro', value: 'retro' },
  { name: 'Hide features', value: 'hiding' },
]

const amapLevel3List = [
  { name: '标准', value: 'normal' },
  { name: '幻影黑', value: 'dark' },
  { name: '月光银', value: 'light' },
  { name: '远山黛', value: 'whitesmoke' },
  { name: '草色青', value: 'fresh' },
  { name: '雅士灰', value: 'grey' },
]
const amapLevel3List1 = [
  { name: '涂鸦', value: 'graffiti' },
  { name: '马卡龙', value: 'macaron' },
  { name: '靛青蓝', value: 'blue' },
  { name: '极夜蓝', value: 'darkblue' },
  { name: '酱籽', value: 'wine' },
]

class Toolbar extends Component<IProps, IState> {
  measurementTool: Tool | null
  constructor(props: IProps) {
    super(props)
    this.measurementTool = null;
    this.state = {
      mapSetVisible: true,// 地图设置项显示隐藏
      toolMenuVisible: false,// 下拉菜单显示隐藏
      mapType: 'amap',// 默认为标准地图
      amapLevel2Value: 'standardMap', //高德二级菜单
      bmapLevel2Value: 'standardMap', //百度二级菜单
      gmapLevel2Value: 'standardMap', //谷歌二级菜单
      amapLevel3Value: 'normal', //高德三级菜单
      gmapLevel3Value: 'daytime', //谷歌三级级菜单
      mapOverView: false, //鹰眼
      mapTraffic: false, //路况
      measurementVisible: false, //量算显示隐藏
      mapMeasurement: '' // 量算
    }
  }



  componentDidMount() {
    const { currentMap, mapWrapper } = this.props;
    this.setState({
      mapType: currentMap
    });

    this.measurementTool = {
      map: mapWrapper.map,
      mousetool: new AMap.MouseTool(mapWrapper.map)
    }
  }

  componentWillReceiveProps(proProps: any) {
    const { mapWrapper: { map } } = proProps;
    if (map.currentMap !== 'amap') return;
    this.measurementTool = {
      map: map,
      mousetool: new AMap.MouseTool(map)
    }
  }

  /**
   * 修改地图类型
   * @param e 
   */
  mapTypeChange = (e: RadioChangeEvent) => {

    if (e.target.value === 'amap') removeMulch();

    this.setState({
      mapType: e.target.value,
      amapLevel2Value: 'standardMap',
      bmapLevel2Value: 'standardMap',
      gmapLevel2Value: 'standardMap',
      amapLevel3Value: 'normal',
      gmapLevel3Value: 'daytime',
      mapTraffic: false,
      mapOverView: false,
      mapMeasurement: ''
    }, () => {
      this.props.toggleMapType(e.target.value)
    })

  }

  /**
   * 地图设置显示控制
   */
  mapSetVisibleChange = () => {
    const { mapSetVisible } = this.state;
    this.setState({ mapSetVisible: !mapSetVisible });
  };

  /**
   * 下拉菜单显示控制
   */
  handleVisibleChange = (flag: boolean) => {
    this.setState({ toolMenuVisible: flag });
  };

  /**
   * 二级菜单
   * @param e 
   */
  mapLevel2MenuOperation = (e: RadioChangeEvent) => {
    const { mapType } = this.state;
    const { mapWrapper } = this.props
    const value = e.target.value;

    mapWrapper.map.changeMapType(value);

    if (mapType === 'amap') { // 高德
      this.setState({
        amapLevel2Value: value,
        amapLevel3Value: 'normal',
      })
    } else if (mapType === 'baidu') { // 百度
      this.setState({
        bmapLevel2Value: value
      })
    } else { // 谷歌
      this.setState({
        gmapLevel2Value: value,
        gmapLevel3Value: 'daytime',
      })
    }
  }

  /**
   * 三级菜单(修改地图主题)
   * @param e 
   */
  mapLevel3MenuOperation = (e: RadioChangeEvent) => {
    const { mapType } = this.state;
    const { mapWrapper } = this.props;
    const value = e.target.value;

    mapWrapper.map.mapThemeChange(value);

    if (mapType === 'amap') {
      this.setState({
        amapLevel3Value: value
      })
    } else {
      this.setState({
        gmapLevel3Value: value
      })
    }
  }

  /**
   * 路况
   */
  toggleMapTraffic = () => {
    const { mapWrapper } = this.props;
    const traffic = mapWrapper.map.traffic();
    this.setState({
      mapTraffic: !this.state.mapTraffic
    }, () => {
      this.state.mapTraffic ? traffic.add() : traffic.remove();
    })
  }

  /**
   * 鹰眼
   */
  toggleMapOverView = () => {
    const { mapWrapper } = this.props
    this.setState({
      mapOverView: !this.state.mapOverView
    }, () => {
      const overView = mapWrapper.map.overView();
      this.state.mapOverView ? overView.add() : overView.remove();
    })
  }

  toggleButton = () => {
    this.setState({ mapMeasurement: '' })
  }

  /**
   * 量算操作
   */
  measurementOperation = (e: { currentTarget: any; }) => {
    const key = e.currentTarget.getAttribute('data-key');
    const { distanceOpen, distanceClose } = distanceMeasurement(this.measurementTool);
    const { circularOpen, circularClose } = circularMeasurement(this.measurementTool, this.toggleButton);
    const { rectangularOpen, rectangularClose } = rectangularMeasurement(this.measurementTool, this.toggleButton);
    if (key === '1' || key === this.state.mapMeasurement) {
      circularClose();
      rectangularClose();
      distanceClose()
    } else if (key === '2') {
      circularClose();
      rectangularClose();
      distanceOpen();
    } else if (key === '3') {
      rectangularClose();
      circularOpen();
    } else {
      circularClose();
      rectangularOpen();
    }

    this.setState({
      mapMeasurement: key === this.state.mapMeasurement ? '' : key
    })
  };


  render() {
    const { mapSetVisible, toolMenuVisible, mapType, amapLevel2Value, bmapLevel2Value, mapTraffic, mapOverView,
      gmapLevel2Value, amapLevel3Value, gmapLevel3Value, measurementVisible, mapMeasurement } = this.state;
    const { currentMap } = this.props;
    const mapSettingMenu = (
      <Menu className={styles.mapTypeMenu}>
        <Menu.Item key='1'>
          <Radio.Group onChange={this.mapTypeChange} value={mapType}>
            <Radio value={'amap'}>高德地图</Radio>
            <br />
            <Radio value={"baidu"}>百度地图</Radio>
            <br />
            <Radio value={"google"}>谷歌地图</Radio>
            <br />
          </Radio.Group>
          <div style={{ marginTop: 45 }}>
            <Button type={mapTraffic ? 'primary' : 'default'} onClick={this.toggleMapTraffic} disabled={mapType === 'baidu' ? true : false} size='small'>路况</Button>
            <Button type={mapOverView ? 'primary' : 'default'} onClick={this.toggleMapOverView} disabled={mapType === 'amap' ? false : true} size='small'>鹰眼</Button>
          </div>
        </Menu.Item>
        {
          mapType === 'amap' && <Menu.Item key='2'>
            <Radio.Group value={amapLevel2Value} onChange={this.mapLevel2MenuOperation}>
              {amapLevel2List.map((item) => <><Radio key={item.value} value={item.value}>{item.name}</Radio><br /></>)}
            </Radio.Group>
          </Menu.Item>
        }
        {
          mapType === 'baidu' && <Menu.Item key='3'>
            <Radio.Group value={bmapLevel2Value} onChange={this.mapLevel2MenuOperation}>
              {bmapLevel2List.map((item) => <><Radio key={item.value} value={item.value}>{item.name}</Radio><br /></>)}
            </Radio.Group>
          </Menu.Item>
        }
        {
          mapType === 'google' && <Menu.Item key='4'>
            <Radio.Group value={gmapLevel2Value} onChange={this.mapLevel2MenuOperation}>
              {gmapLevel2List.map((item) => <><Radio key={item.value} value={item.value}>{item.name}</Radio><br /></>)}
            </Radio.Group>
          </Menu.Item>
        }
        {
          mapType === 'amap' && amapLevel2Value === 'standardMap' && <Menu.Item key='5'>
            <Radio.Group value={amapLevel3Value} onChange={this.mapLevel3MenuOperation}>
              {amapLevel3List.map((item) => <><Radio key={item.value} value={item.value}>{item.name}</Radio><br /></>)}
            </Radio.Group>
            <Radio.Group value={amapLevel3Value} onChange={this.mapLevel3MenuOperation}>
              {amapLevel3List1.map((item) => <><Radio key={item.value} value={item.value}>{item.name}</Radio><br /></>)}
            </Radio.Group>
          </Menu.Item>
        }
        {
          mapType === 'google' && gmapLevel2Value === 'standardMap' && <Menu.Item key='6'>
            <Radio.Group value={gmapLevel3Value} onChange={this.mapLevel3MenuOperation}>
              {gmapLevel3List.map((item) => <><Radio key={item.value} value={item.value}>{item.name}</Radio><br /></>)}
            </Radio.Group>
          </Menu.Item>
        }
      </Menu>
    );

    const measurementMenu = (
      <Menu className={styles.measurementMenu}>
        <Menu.Item key={1}>
          <Button data-key={1} style={{ display: 'block' }} type={mapMeasurement !== '' && mapMeasurement !== '2' ? 'primary' : 'default'} block onClick={this.measurementOperation}>面积</Button>
          <Button data-key={2} style={{ marginTop: 5 }} type={mapMeasurement === '2' ? 'primary' : 'default'} block onClick={this.measurementOperation}>距离</Button>
        </Menu.Item>
        {
          mapMeasurement !== '2' && mapMeasurement !== '' ?
            <Menu.Item key={2}>
              <Button data-key={3} style={{ display: 'block' }} type={mapMeasurement === '3' ? 'primary' : 'default'} block onClick={this.measurementOperation}>圆形</Button>
              <Button data-key={4} style={{ marginTop: 5 }} type={mapMeasurement === '4' ? 'primary' : 'default'} block onClick={this.measurementOperation}>矩形</Button>
            </Menu.Item> : null
        }
      </Menu >
    );

    return (
      <div className={styles.toolBox}>
        <div id='menuBox' className={styles.menuBox}>
          <Dropdown
            overlay={mapSettingMenu}
            placement="bottomCenter"
            getPopupContainer={(triggerNode: any) => triggerNode.parentNode || getSelectContainer('menuBox')}
            onVisibleChange={this.handleVisibleChange}
            visible={toolMenuVisible}
          >
            <Button className={[styles.btn, !mapSetVisible ? styles.setHide : ''].join(' ')}><img src={setting} alt="" />地图设置</Button>
          </Dropdown>
          <Dropdown
            overlay={measurementMenu}
            placement="bottomCenter"
            getPopupContainer={(triggerNode: any) => triggerNode.parentNode || getSelectContainer('menuBox')}
            onVisibleChange={(flag) => this.setState({ measurementVisible: flag })}
            visible={measurementVisible}
            disabled={currentMap !== 'amap'}
          >
            <Button className={[styles.btn, !mapSetVisible ? styles.setHide : ''].join(' ')}><img src={setting} alt="" />量算</Button>
          </Dropdown>
        </div>
        <div className={styles.imgBox} onClick={this.mapSetVisibleChange}><img src={tool} /></div>
      </div>
    )
  }
}

export default Toolbar;
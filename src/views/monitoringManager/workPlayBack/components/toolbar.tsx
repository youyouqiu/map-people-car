import React, { Component } from "react";
import { Menu, Button, Dropdown, Radio } from 'antd';
import MapWrapper from "@/common/amapContainer/mapWrapper";
import tool from '@/static/image/tool.svg';
import setting from '@/static/image/map-drop-sett.svg';
import styles from '../index.module.less'
import { RadioChangeEvent } from "antd/lib/radio";
import { getSelectContainer } from "@/framework/utils/function";

interface IProps {
  mapWrapper: MapWrapper
}
interface IState {
  mapSetVisible: boolean,
  menuVisible: boolean,
  mapType: string
}
class Toolbar extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      mapSetVisible: false,// 地图设置项显示隐藏
      menuVisible: false,// 下拉菜单显示隐藏
      mapType: 'standard',// 默认为标准地图
    }
  }

  /**
   * 修改地图类型
   * @param e 
   */
  mapTypeChange = (e: RadioChangeEvent) => {
    const { mapWrapper } = this.props;
    this.setState({
      mapType: e.target.value
    }, () => {
      mapWrapper.changeMapType(e.target.value);
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
    this.setState({ menuVisible: flag });
  };

  render() {
    const { mapSetVisible, menuVisible, mapType } = this.state;
    const menu = (
      <Menu className={styles.mapTypeMenu}>
        <Menu.Item>
          <Radio.Group onChange={this.mapTypeChange} value={mapType}>
            <Radio value={'amapSatellite'}>卫星地图</Radio>
            <br />
            <Radio value={"standard"}>标准地图</Radio>
          </Radio.Group>
        </Menu.Item>
      </Menu>
    );

    return (
      <div className={styles.toolBox}>
        <div id='trackMenuBox' className={styles.menuBox}>
          <Dropdown
            overlay={menu}
            placement="bottomCenter"
            getPopupContainer={() => getSelectContainer('trackMenuBox')}
            onVisibleChange={this.handleVisibleChange}
            visible={menuVisible}
          >
            <Button className={[styles.btn, !mapSetVisible ? styles.setHide : ''].join(' ')}><img src={setting} alt="" />地图设置</Button>
          </Dropdown>
        </div>
        <div className={styles.imgBox} onClick={this.mapSetVisibleChange}><img src={tool} /></div>
      </div>
    )
  }
}

export default Toolbar
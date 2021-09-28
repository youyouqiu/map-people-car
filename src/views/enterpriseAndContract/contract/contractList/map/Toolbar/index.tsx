import React, { Component } from 'react';
import { Menu, Button, Dropdown, Radio } from 'antd';
import { MapType } from '@/common/amapContainer/mapWrapper';
import tool from '@/static/image/tool.svg';
import setting from '@/static/image/map-drop-sett.svg';
import styles from './index.module.less';
import { RadioChangeEvent } from 'antd/lib/radio';

interface IProps {
    map: AMap.Map | undefined;
    changeMapType: (maptype: MapType) => void;
    drawPolygon: () => void;
}
interface IState {
    mapSetVisible: boolean;
    mapType?: MapType | string;
    boxVisible: boolean;
}

class Toolbar extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            mapSetVisible: false,
            mapType: 'amapSatellite',
            boxVisible: false,
        };
    }
    mapTypeChange = (e: RadioChangeEvent) => {
        this.setState({ mapType: e.target.value });
        this.props.changeMapType(e.target.value);
    };

    handleVisibleChange = (flag: boolean) => {
        this.setState({ mapSetVisible: flag });
    };
    render() {
        const menu = (
            <Menu>
                <Menu.Item>
                    <Radio.Group onChange={this.mapTypeChange} value={this.state.mapType}>
                        <Radio value={'amapSatellite'}>卫星地图</Radio>
                        <br />
                        <Radio value={'google'}>谷歌地图</Radio>
                    </Radio.Group>
                </Menu.Item>
            </Menu>
        );
        const { boxVisible } = this.state;
        return (
            <>
                <div className={styles['toolBox']}>
                    <div className={styles['imgBox']} onClick={() => this.setState({ boxVisible: !this.state.boxVisible })}>
                        <img src={tool} />
                    </div>
                    <div className={styles['menuBox']} style={boxVisible ? { visibility: 'visible' } : { visibility: 'hidden' }}>
                        <Button className={styles['btn']} onClick={this.props.drawPolygon}>
                            <img src={setting} alt="" />
                            绘制工具
                        </Button>
                        <Dropdown overlay={menu} placement="bottomCenter" onVisibleChange={this.handleVisibleChange} visible={this.state.mapSetVisible}>
                            <Button className={styles['btn']}>
                                <img src={setting} alt="" />
                                地图设置
                            </Button>
                        </Dropdown>
                    </div>
                </div>
            </>
        );
    }
}

export default Toolbar;

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
        console.log('props改变', nextProps.position);
        const { position } = nextProps;
        const { markerPosition } = this.state;
        if (position !== markerPosition) {
            this.setState({
                markerPosition: position
            }, () => {
                if (this.mapWrapper) {
                    this.renderMapMarker(position as AMap.LocationValue)
                }
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
        const _this = this;
        this.mapWrapper.map.plugin(["AMap.Marker"], () => { });

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
        const { map = this.mapWrapper.map } = this.state;
        let { currentMarker } = this.state;
        if (currentMarker) {
            currentMarker.setPosition(position);
        } else {
            currentMarker = new AMap.Marker({
                position: position,
                offset: new AMap.Pixel(-13, -30)
            });
            currentMarker.setMap(map);
        }
        map.setCenter(position);
        this.setState({
            currentMarker
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

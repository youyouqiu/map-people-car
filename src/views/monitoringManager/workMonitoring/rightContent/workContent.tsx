/**
 * 右上角作业内容模块
 */
import React, { Component } from "react";

import styles from '../index.module.less';
import { connect } from "react-redux";
import { AllState } from "@/model";
import clearanceArea from '@/static/image/clearanceArea.svg';// 清运区域
import maneuveringGroup from '@/static/image/maneuveringGroup.svg';// 机动组
import unscheduled from '@/static/image/unscheduled.svg';// 未排班
import workArea from '@/static/image/workArea.svg';// 作业区域
import workRoute from '@/static/image/workRoute.svg';// 作业线路
import { getMapFenceInfo } from "@/server/workMonitoring";
import { INodeItem } from "@/framework/utils/treeMonitor";
import { getCenterPoint, getWorkIcon } from "../publicFun";

interface IProps {
    currentSelectTreeNode: INodeItem
    mapWorkObject: Map<number, Array<object>> | null,
    changeMapWorkObject: Function,
    changeMapCenterPos: Function,
    workObjectList: Array<IWorkItem>,
    activeWorkId: string,
}
interface IState {
    menuVisible: boolean,
    activeWork: Array<string>
}

interface IWorkItem {
    id: string,
    name: string,
    type: number
}

class Index extends Component<IProps, IState, any>{
    constructor(props: IProps) {
        super(props);
        this.state = {
            menuVisible: true,// 作业内容显示隐藏
            activeWork: [],// 当前选中的作业对象id集合
        }
    }

    componentDidMount() {
        const { activeWorkId } = this.props;
        if (activeWorkId) {
            this.setState({
                activeWork: [activeWorkId]
            })
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        const { activeWorkId, currentSelectTreeNode: { id } } = nextProps;
        const { activeWorkId: oldActiveWorkId, currentSelectTreeNode: { id: oldId } } = this.props;
        if (id !== oldId || (activeWorkId && activeWorkId !== oldActiveWorkId)) {
            this.setState({
                menuVisible: true,
                activeWork: [activeWorkId]
            })
        }
    }

    changeMenuVisible = () => {
        const { menuVisible } = this.state;
        this.setState({
            menuVisible: !menuVisible
        })
    }

    /**
     * 改变作业对象选中状态
     * @param workId 
     */
    changeActiveWork = (workId: string) => {
        const { activeWork } = this.state;
        const index = activeWork.indexOf(workId);
        if (index === -1) {
            activeWork.push(workId)
        } else {
            activeWork.splice(index, 1)
        }
        this.setState({
            activeWork
        })
    }

    /**
     * 改变地图上显示的作业对象数据
     * @param item 
     */
    changeSelectWork = async (item: IWorkItem) => {
        let { mapWorkObject: oldMapWorkObject, changeMapWorkObject, changeMapCenterPos } = this.props;
        let mapWorkObject: any = new Map();
        if (oldMapWorkObject) {
            oldMapWorkObject.forEach((value: any, key: number) => {
                mapWorkObject.set(key, value);
            })
        }
        const { id: workId } = item;
        if (mapWorkObject && mapWorkObject.has(workId)) {
            mapWorkObject.delete(workId);
        } else {
            const result: any = await getMapFenceInfo({ pid: '', workId });
            if (result && result.length > 0) {
                if (mapWorkObject) {
                    const obj: any = {
                        workId,
                        type: result[0].type,
                        path: result[0].longLat
                    }
                    mapWorkObject.set(workId, obj)
                } else {
                    const obj: any = {
                        workId,
                        type: result[0].type,
                        path: result[0].longLat
                    }
                    mapWorkObject.set(workId, obj)
                }
                changeMapCenterPos(getCenterPoint(result[0].longLat));// 修改地图显示中心点
            }
        }
        changeMapWorkObject(mapWorkObject);
        this.changeActiveWork(workId);
    }

    /**
     * 渲染作业对象列表
     */
    renderWorkLi = () => {
        const { workObjectList } = this.props;
        const { activeWork } = this.state;
        return workObjectList.map((item: IWorkItem) => {
            if (!item) return '';
            return <li
                key={`workLi_${item.id}`}
                title={item.name}
                className={activeWork.indexOf(item.id) !== -1 ? styles.activeWork : ''}
                onClick={() => { this.changeSelectWork(item) }}
            >
                {getWorkIcon(item.type)} {item.name}
            </li>
        })
    }

    render() {
        const { workObjectList } = this.props;
        const { menuVisible } = this.state;

        return <div className={[styles.workContentBox, (!workObjectList || workObjectList.length === 0) && styles.hide].join(' ')}>
            <h3 onClick={this.changeMenuVisible}>作业内容</h3>
            <ul className={[styles.contentMenu, !menuVisible ? styles.hideMenu : ''].join(' ')}>
                {this.renderWorkLi()}
            </ul>
        </div>
    }
}

export default connect(
    (state: AllState) => ({
        currentSelectTreeNode: state.workMonitoring.currentSelectTreeNode,
        mapWorkObject: state.workMonitoring.mapWorkObject,
        workObjectList: state.workMonitoring.workObjectList,
        activeWorkId: state.workMonitoring.activeWorkId,
    }),
    dispatch => ({
        changeMapWorkObject: (payload: any) => {
            dispatch({ type: 'workMonitoring/changeMapWorkObjectEvery', payload });
        },
        // 改变地图显示中心点
        changeMapCenterPos: (payload: any) => {
            dispatch({ type: 'workMonitoring/changeMapCenterPosEvery', payload });
        },
    }),
)(Index);
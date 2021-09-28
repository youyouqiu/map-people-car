/**
 * 当前分组下监控对象树
 */
import React, { Component } from 'react';
import styles from './index.module.less';
import { Input, Tree } from 'antd';
import groupIcon from '@/static/image/group.svg';
import monitorIcon from '@/static/image/monitorIcon.svg';
import { connect } from 'react-redux';
import { AllState } from '@/model';

interface IProps {
    isShowQuery?: boolean;//是否显示搜索框,默认true
    monitorDetail: { id: string; name: string };//分组信息
    onTreeCheck?: (node: any, e: any) => any;//树节点勾选回调,node:勾选节点
    onTreeAllCheck?: (node: any[]) => void;//获取树节点所有勾选节点,node:勾选节点
    groupMTreeDatas: any[];
    getGroupMonitorData: Function;
}

interface IState {
    treeData: any[];
    searchData: any[];
    checkedKeys: Array<string>;
    expandedKeys: string[];
}

class GroupVTree extends Component<IProps, IState, any> {
    refresh = true
    checkNodes: any[] = []//左树勾选集合
    static defaultProps = {
        isShowQuery: true
    }

    constructor(props: IProps) {
        super(props);

        this.state = {
            treeData: [],
            searchData: [],
            checkedKeys: [],
            expandedKeys: [],
        };

    }

    componentDidMount() {
        const {
            monitorDetail,
            groupMTreeDatas
        } = this.props;
        this.getTreeData(groupMTreeDatas, monitorDetail);
    }

    /**
     * 请求分组下的监控对象
     * @param id 
     */
    getGroupMonitor(id: string) {
        const params = {
            groupId: id
        };
        this.props.getGroupMonitorData(params);
    }

    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        const {
            groupMTreeDatas,
            monitorDetail
        } = nextProps;

        if (groupMTreeDatas != this.props.groupMTreeDatas) {
            this.getTreeData(groupMTreeDatas, monitorDetail);
        }
    }

    /**
     * 组装树节点
     */
    getTreeData = (groupMTreeDatas: any[], monitorDetail: { id: string; name: string }) => {
        // 添加icon图标
        const childrens = groupMTreeDatas.map((item: any) => {
            item.icon = <img src={monitorIcon} className={styles.treeIcon} />;
            return item;
        });
        // 组装树结构
        const treeData = [
            {
                title: monitorDetail.name,
                key: monitorDetail.id,
                id: monitorDetail.id,
                type: 'group',
                icon: <img src={groupIcon} className={styles.treeIcon} />,
                children: childrens,
            }
        ];

        this.setState({
            treeData: treeData,
            searchData: [Object.assign({}, treeData[0])],//实现两层深拷贝
            expandedKeys: [monitorDetail.id],
            checkedKeys: []
        })
    }

    // 勾选
    onTreeCheck = (checkedKeys: Array<string>, nodeInfos: any) => {
        const {
            onTreeCheck,
            onTreeAllCheck
        } = this.props;
        const {
            node,
            checkedNodes,
        } = nodeInfos;

        if (typeof onTreeCheck === 'function') {
            onTreeCheck(node, nodeInfos);
        }

        //组装所有勾选节点
        if (typeof onTreeAllCheck === 'function') {
            const nodes = checkedNodes.filter((item: any) => (item.type == 'monitor'));
            onTreeAllCheck(nodes);
        }

        this.setState({
            checkedKeys,
        });
    }

    /**
     * 模糊搜索
     */
    queryTree = (e: any) => {
        const { value } = e.target;
        const {
            treeData,
            searchData
        } = this.state;

        if (treeData && value != '') {
            const children = treeData[0].children.filter((item: any) => {
                return item.title.indexOf(value) != -1;
            });

            if (searchData) {
                searchData[0].children = children;
                this.setState({
                    searchData: searchData.slice(),
                })
            }
            return;
        }

        this.setState({
            searchData: [Object.assign({}, treeData[0])],
        })
    }

    /**
     * 组织树展开
     */
    onTreeExpand = (expandedKeys: any) => {
        this.setState({
            expandedKeys
        })
    }

    render() {
        const {
            searchData,
            checkedKeys,
            expandedKeys
        } = this.state;
        const {
            isShowQuery,
        } = this.props;

        return (
            <div
                className={styles['search-monitor-tree']}
            >
                {/* 搜索框 */}
                {
                    isShowQuery && (
                        <div className={styles['search-input']}>
                            <Input
                                type="text"
                                placeholder="请输入关键字"
                                onChange={this.queryTree}
                                maxLength={30}
                            />
                        </div>
                    )
                }

                {/* 组织树 */}
                <div
                    className={styles['tree-box']}
                >
                    <div style={{ height: '100%', overflow: 'auto' }}>
                        <Tree
                            checkable
                            showIcon
                            onCheck={this.onTreeCheck}
                            checkedKeys={checkedKeys}
                            treeData={searchData}
                            expandedKeys={expandedKeys}
                            onExpand={this.onTreeExpand}
                            className={styles['group-monitor-tree']}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
export default connect(
    (state: AllState) => ({
        groupMTreeDatas: state.assignMonitor.groupMTreeDatas,
    }),
    dispatch => ({
        getGroupMonitorData: (payload: any) => {
            dispatch({ type: 'assignMonitor/getGroupMonitorDatasEvery', payload });
        },
    }),
)(GroupVTree);
/**
 * 监控对象树
 */
import React, { Component } from 'react';
import styles from './index.module.less';
import { Select, Input, Tree, Spin } from 'antd';
import { getGroupMonitors } from '@/server/orgMgm';
const { Option } = Select;
import monitorIcon from '@/static/image/monitorIcon.svg';
import { getTreeRoot } from '@/framework/utils/treeMonitor';
import { monitorCount } from '@/server/planMabagement';
import { AllState } from '@/model';
import { connect } from 'react-redux';

export interface ITreeNode {
    id: string;
    key: string;
    value: string;
    name: string;
    title: string;
    type: string;
    monitorType: string;
    pId: string;
    [key: string]: any;
}

interface IProps {
    isshowquery?: boolean;//是否显示搜索框,默认true
    onTreeCheck?: Function;//树节点勾选回调,node:勾选节点
    onTreeAllCheck?: (node: any[], groupIds: Array<string>) => void;//获取树节点所有勾选节点,node:勾选节点
    monitorTreeDatas: any[];
    getMonotorTreeData: Function;
    changeMonitorTreeDatas: Function;
    currentGroupId?: string;//过滤当前选中的分组id
}

interface IState {
    checkedKeys: Array<string>;
    treeData: Array<any>;//接口原始数据
    treeSource: any[];//组织树组装数据
    keyword: string;//监控对象搜索值
    queryType: number;//监控对象搜索类型1:组织 2:分组 3:监控对象
    organizationKey: string[];//展开的节点
    loading: boolean;
}
class SearchVTree extends Component<IProps, IState, any> {
    monitorCount = 1000//监控对象限制超过1000不显示
    count = 0;//当前监控对象数
    checkNodes: ITreeNode[] = []//左树勾选集合
    groupIds: string[] = []//勾选的分组id
    searchTimer: null | NodeJS.Timeout//模糊搜索定时器timer
    maxChildrenCount = 0
    loadedKeys: string[] = []//已经异步加载过的树节点id
    isAsign = false//判断是否异步

    static defaultProps = {
        isshowquery: true
    }

    constructor(props: IProps) {
        super(props);

        this.state = {
            checkedKeys: [],
            treeData: [],
            treeSource: [],
            keyword: '',
            queryType: 3,
            organizationKey: [],
            loading: true
        };

    }

    componentDidMount() {
        this.getDatas(this.props.monitorTreeDatas);
    }
    /**
     * 请求监控对象组织树数据
     */
    getMonitors = (keywords = '', queryType = 3) => {
        const { getMonotorTreeData } = this.props;
        const params = {
            keyword: keywords,
            queryType: queryType
        };
        getMonotorTreeData(params);
    }

    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        const {
            monitorTreeDatas,
        } = nextProps;

        if (monitorTreeDatas != this.props.monitorTreeDatas) {
            this.getDatas(monitorTreeDatas);
        }
    }

    getDatas = async (monitorTreeDatas: any[]) => {
        let filterDatas = [];
        const expandkey: string[] = this.state.organizationKey;
        this.count = await this.getMCount();
        const {
            organizationKey,
            queryType,
            keyword,
            checkedKeys
        } = this.state;
        filterDatas = monitorTreeDatas.filter((item: any) => {
            /**
             * 只展开组织的情况:
             * 1.监控对象超过限制
             */
            if (
                this.count > this.monitorCount
                && item.type == 'organization'
                && organizationKey.indexOf(item.id) == -1
            ) {
                expandkey.push(item.id);
            }

            /**
             * 展开组织和分组情况:
             * 1.监控对象未超过限制
             * 2.模糊搜索监控对象
             */
            if (
                this.count <= this.monitorCount
                || (queryType == 3 && keyword != '')
                && (item.type == 'organization' || item.type == 'group')
                && organizationKey.indexOf(item.id) == -1
            ) {
                expandkey.push(item.id);
            }

            // 不显示当前选中的分组
            return (item.id != this.props.currentGroupId && item.pId != this.props.currentGroupId);
        });

        const treeData = getTreeRoot(filterDatas);
        this.setState({
            treeData,
            loading: false,
            organizationKey: [...expandkey],
            checkedKeys: this.isAsign ? checkedKeys : []
        });
        this.isAsign = false;
    }

    /**
     * 获取监控对象数量
     */
    getMCount = async () => {
        const mCount: any = await monitorCount(null);
        if (mCount) {
            return mCount;
        }
    }

    /**
     * 勾选
     */
    onTreeCheck = (checkedKeys: Array<string>, checkInfo: any) => {
        const {
            node,
            checked,
            checkedNodes,
        } = checkInfo;
        const {
            organizationKey,
            queryType,
            keyword
        } = this.state;

        // 勾选的时候展开节点
        if (checked && organizationKey.indexOf(node.key) == -1) {
            organizationKey.push(node.key);
        }

        this.setState({
            checkedKeys,
            organizationKey: [...organizationKey]
        });

        /**
         * 判断是否异步加载子节点
         */
        if (
            this.count <= this.monitorCount
            || this.loadedKeys.indexOf(node.id) > -1
            || (queryType == 3 && keyword != '')
            || node.type == 'monitor'
        ) {
            this.checkNodes = [];
            this.groupIds = [];

            this.getCheckAllNodes(checkedNodes);

            // 获取勾选节点回调
            if (typeof this.props.onTreeAllCheck == 'function') {
                this.props.onTreeAllCheck(this.checkNodes, this.groupIds);
            }
        }
    }
    getCheckAllNodes = (checkedNodes: any[]) => {
        for (let i = 0; i < checkedNodes.length; i++) {
            const item = checkedNodes[i];
            if (item.type == 'group') {
                this.groupIds.push(item.id);
            }
            if (item.type == 'monitor') {
                this.checkNodes.push(item);
            }
        }
    }

    /**
     * 异步加载监控对象子节点数据
     */
    onLoadTreeData(node: { id: string; key: string; children: any[]; type: string; checked: boolean }) {
        const {
            key,
            children,
            type,
            id
        } = node;

        return new Promise((resolve) => {
            if (children || type != 'group' || this.count <= this.monitorCount) {
                resolve();
                return;
            }

            this.isAsign = true;
            this.loadedKeys.push(id);

            const params = {
                groupId: key
            };
            const datas = getGroupMonitors<Array<ITreeNode>>(params);
            if (datas) {
                datas.then((res: ITreeNode[]) => {
                    if (res) {
                        for (let i = 0; i < res.length; i++) {
                            res[i].isLeaf = true
                            res[i].icon = <img src={monitorIcon} className={styles.treeIcon} />;
                        }

                        const newTreeData = this.props.monitorTreeDatas.concat(res);
                        this.props.changeMonitorTreeDatas({
                            key: 'monitorTreeDatas',
                            data: newTreeData
                        });

                        if (node.checked) {
                            this.checkNodes = this.checkNodes.concat(res);
                            this.groupIds.push(id);

                            // 获取勾选节点回调
                            if (typeof this.props.onTreeAllCheck == 'function') {
                                this.props.onTreeAllCheck(this.checkNodes, this.groupIds);
                            }
                        }
                        resolve();

                        // 组装子节点
                        // const treeDatas = this.updateTreeData(this.state.treeData, key, res);
                        // this.setState({
                        //     treeData: treeDatas
                        // });
                    }
                })

                resolve();
            }
        })
    }

    /* updateTreeData = (node: any, key: any, children: any) => {
        for (let i = 0; i < node.length; i++) {
            const item = node[i];

            if (item.children) {
                this.updateTreeData(item.children, key, children);
            } else if (item.key == key) {
                item.children = children;
            }
        }

        return [...node];
    } */

    // 展开
    onExpand(expandedKeys: any) {
        this.setState({
            organizationKey: expandedKeys
        })
    }

    /**
     * 模糊搜索
     */
    changeKeyword = (e: any) => {
        const value = e.target.value;
        if (this.searchTimer) {
            clearTimeout(this.searchTimer);
        }

        this.searchTimer = setTimeout(() => {
            this.setState({
                keyword: value,
                loading: true,
                checkedKeys: [],
                organizationKey: []
            });
            this.getMonitors(value, this.state.queryType);
        }, 500);
    }
    changeQueryType(value: number) {
        if (this.searchTimer) {
            clearTimeout(this.searchTimer);
        }

        this.searchTimer = setTimeout(() => {
            this.setState({
                queryType: value,
                loading: true,
                checkedKeys: [],
                organizationKey: []
            })
            this.getMonitors(this.state.keyword, value);
        }, 500);

    }

    render() {
        const {
            isshowquery,
        } = this.props;
        const {
            checkedKeys,
            treeData,
            organizationKey,
            loading
        } = this.state;

        return (
            <div
                className={styles['search-monitor-tree']}
            >
                {/* 搜索框 */}
                {
                    isshowquery && (
                        <div className={styles['search-input']}>
                            <Select
                                defaultValue={3}
                                style={{ width: 120 }}
                                className={styles['select']}
                                onChange={this.changeQueryType.bind(this)}
                            >
                                <Option value={3}>监控对象</Option>
                                <Option value={2}>分组</Option>
                                <Option value={1}>组织</Option>
                            </Select>
                            <Input
                                type="text"
                                placeholder="请输入关键字"
                                onChange={this.changeKeyword}
                            />
                        </div>
                    )
                }

                {/* 组织树 */}
                <div className={styles['tree-box']}>
                    <div
                        style={{ height: '100%', width: '100%', overflow: 'auto', position: 'relative' }}
                    >
                        {!loading && <Tree
                            checkable
                            showIcon
                            treeData={treeData}
                            loadData={this.onLoadTreeData.bind(this)}
                            expandedKeys={organizationKey}
                            onExpand={this.onExpand.bind(this)}
                            onCheck={this.onTreeCheck}
                            checkedKeys={checkedKeys}
                            className={styles['search-monitor-tree']}
                        />
                        }

                        {/* 加载框 */}
                        {
                            loading && (
                                <Spin
                                    spinning
                                    className={styles['loading']}
                                />
                            )
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    (state: AllState) => ({
        monitorTreeDatas: state.assignMonitor.monitorTreeDatas,
    }),
    dispatch => ({
        getMonotorTreeData: (payload: any) => {
            dispatch({ type: 'assignMonitor/getMonotorTreeDatasEvery', payload });
        },
        changeMonitorTreeDatas: (payload: any) => {
            dispatch({ type: 'assignMonitor/changeMonitorTreeDatas', payload });
        },
    }),
)(SearchVTree);
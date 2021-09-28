/**
 * 监控对象树
 */
import React, { Component } from 'react';
import styles from './index.module.less';
import { Select, Input, Tree, } from 'antd';
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
    onTreeAllCheck?: (node: any[], groupIds: Array<string>, maxCount: number) => void;//获取树节点所有勾选节点,node:勾选节点
    // onCloseLoad?: () => void//关闭加载框
    monitorTreeDatas: any[];
    getMonotorTreeData: Function;
    changeMonitorTreeDatas: Function;
    loading: boolean;
    currentGroupId?: string;//过滤当前选中的分组id
}

interface IState {
    checkedKeys: Array<string>;
    treeData: Array<any>;//接口原始数据
    treeSource: any[];//组织树组装数据
    keyword: string;//监控对象搜索值
    queryType: number;//监控对象搜索类型1:组织 2:分组 3:监控对象
    organizationKey: string[];//展开的节点
}
class SearchVTree extends Component<IProps, IState, any> {
    monitorCount = 1000
    checkNodes: ITreeNode[] = []//左树勾选集合
    groupIds: string[] = []//勾选的分组id
    searchTimer: null | NodeJS.Timeout
    maxChildrenCount = 0

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
        };

    }

    // componentDidMount() {
    //     if (this.props.loading) {
    //         this.getMonitors();
    //     }
    // }
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
            currentGroupId,
            // onCloseLoad
            loading
        } = nextProps;

        if (!loading && monitorTreeDatas) {
            // 过滤当前选中的分组,设置需要展开的节点
            // const expandkey: string[] = [];
            // const count = await this.getMCount();
            const filterDatas = monitorTreeDatas.filter((item: any) => {
                /* if (count > this.monitorCount) {
                    if (item.type == 'organization') {
                        expandkey.push(item.id);
                    }
                } else if (item.type == 'organization' || item.type == 'group') {
                    expandkey.push(item.id);
                } */

                return (item.id != currentGroupId && item.pId != currentGroupId);
            });

            const treeData = getTreeRoot(filterDatas);
            this.setState({
                treeData,
                // organizationKey: expandkey
            });

            // if (typeof onCloseLoad == 'function') {
            //     onCloseLoad();
            // }
        }
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
            organizationKey
        } = this.state;


        // if (node.type == 'organization') {
        //     message.warn('请勾选分组或者监控对象!');
        //     return;
        // }

        // 勾选的时候展开节点
        if (checked && organizationKey.indexOf(node.key) == -1) {
            organizationKey.push(node.key);
        }

        /**
         * 判断是否异步加载子节点
         */
        if (node.type == 'monitor' || node.children) {
            this.checkNodes = [];
            this.groupIds = [];
            this.maxChildrenCount = 0;

            this.getCheckAllNodes(checkedNodes);

            // 获取勾选节点回调
            if (typeof this.props.onTreeAllCheck == 'function') {
                this.props.onTreeAllCheck(this.checkNodes, this.groupIds, this.maxChildrenCount);
            }
        }

        this.setState({
            checkedKeys,
            organizationKey: [...organizationKey]
        });
    }
    getCheckAllNodes = (checkedNodes: any[]) => {
        for (let i = 0; i < checkedNodes.length; i++) {
            const item = checkedNodes[i];
            if (item.type == 'group') {
                this.groupIds.push(item.id);
                // 分组中最多的子节点个数,方便分配的时候限制每个分组下不能超过100个监控对象
                if (item.children && item.children.length > this.maxChildrenCount) {
                    this.maxChildrenCount = item.children.length;
                }
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
            if (children || type != 'group') {
                resolve();
                return;
            }

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

                        // 组装子节点
                        // const treeDatas = this.updateTreeData(this.state.treeData, key, res);
                        // this.setState({
                        //     treeData: treeDatas
                        // });
                        const newTreeData = this.props.monitorTreeDatas.concat(res);
                        this.props.changeMonitorTreeDatas(newTreeData);

                        if (node.checked) {
                            this.checkNodes = this.checkNodes.concat(res);
                            this.groupIds.push(id);
                            if (res.length > this.maxChildrenCount) {
                                this.maxChildrenCount = res.length;
                            }

                            // 获取勾选节点回调
                            if (typeof this.props.onTreeAllCheck == 'function') {
                                this.props.onTreeAllCheck(this.checkNodes, this.groupIds, this.maxChildrenCount);
                            }
                        }

                        resolve();
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
                keyword: value
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
                queryType: value
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
        } = this.state;

        return (

            <div
                {...this.props}
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
                        style={{ height: '100%', width: '100%', overflow: 'auto' }}
                    >
                        <Tree
                            checkable
                            showIcon
                            treeData={treeData}
                            loadData={this.onLoadTreeData.bind(this)}
                            expandedKeys={organizationKey}
                            onExpand={this.onExpand.bind(this)}
                            onCheck={this.onTreeCheck}
                            checkedKeys={checkedKeys}
                            key={treeData.length}
                            className={styles['search-monitor-tree']}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    (state: AllState) => ({
        monitorTreeDatas: state.assignMonitor.monitorTreeDatas,
        loading: state.assignMonitor.loading,
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
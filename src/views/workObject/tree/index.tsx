import React, { Component } from 'react';
import { getTree } from '@/server/workObject';
import styles from './index.module.less';
import { DownOutlined } from '@ant-design/icons';
import { Tree, Input, Spin } from 'antd';
import Icons from './icons';
import lodash from 'lodash';
import { getTreeRoot } from '@/framework/utils/tree';

type INodeItem = {
    id: string;
    name: string;
    type: number;
    monitorType: string;
    workType: string;
    orgId: string;
    value: string;
    key: string;
    title: string;
    pId: string;
    enterpriseId: string;
    enterpriseName: string;
    sectionName: string;
    workId: string;
};

export interface SelectParams {
    selectedKeys: string[];
    info: {
        event: 'select';
        selected: boolean;
        node: any;
        selectedNodes: any[];
        nativeEvent: MouseEvent;
    };
}

interface IProps {
    onNodeSelect?: ({ selectedKeys, info }: SelectParams) => void;
}
interface IState {
    rowData: INodeItem[];
    loading: boolean;
    treeData: any[];
    selectedKeys: string[];
    expandedKeys: string[];
}
class SuperTree extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            rowData: [],
            loading: false,
            selectedKeys: [],
            expandedKeys: [],
            treeData: [],
        };
    }
    /**
     * 节点选中事件
     */
    onSelect = (
        selectedKeys: string[],
        info: {
            event: 'select';
            selected: boolean;
            node: any;
            selectedNodes: any[];
            nativeEvent: MouseEvent;
        }
    ) => {
        if (this.props.onNodeSelect) {
            this.props.onNodeSelect({ selectedKeys, info });
        }
        if (info.node.type != 'organization') {
            this.setState({
                selectedKeys,
            });
            return;
        }

        const handledKeys = JSON.parse(JSON.stringify(this.state.expandedKeys));
        //处理树折叠展开事件
        this.getChildOrgId(info.node.id, this.state.treeData);
        //如果之前是折叠状态，那么变成收缩状态  反之亦然
        const toggleStatus = (arr: string[], key: string) => {
            if (arr.includes(key)) {
                const index = arr.indexOf(key);
                if (index > -1) {
                    arr.splice(index, 1);
                }
            } else {
                arr.push(key);
            }
        };
        console.log(this.childOrgIds);
        console.log(handledKeys);
        this.childOrgIds.map((item) => {
            // const index = handledKeys.indexOf(item);
            // if (index > -1) {
            //     handledKeys.splice(index, 1);
            // }
            toggleStatus(handledKeys, item);
        });
        // if (handledKeys.includes(info.node.id)) {
        //     const index = handledKeys.indexOf(info.node.id);
        //     if (index > -1) {
        //         handledKeys.splice(index, 1);
        //     }
        // } else {
        //     handledKeys.push(info.node.id);
        // }
        console.log(handledKeys);
        this.setState({
            selectedKeys,
            expandedKeys: handledKeys,
        });
        this.childOrgIds = [];
    };
    childOrgIds: string[] = [];
    //获取treeData某个组织下的所有子id
    getChildOrgId = (rootId: string, treeData: any, flag?: boolean) => {
        if (treeData) {
            treeData.forEach((item: any) => {
                if (item.id == rootId || flag) {
                    if (item.type == 'organization') {
                        this.childOrgIds.push(item.id);
                    }

                    this.getChildOrgId(rootId, item.children, true);
                } else {
                    this.getChildOrgId(rootId, item.children, false);
                }
            });
        }
    };
    //搜索节流
    debouncedSearchTree = lodash.debounce((value: string) => {
        this.getRowData();
    }, 500);
    //搜索树
    searchTree = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.debouncedSearchTree(e.target.value);
    };
    //获取原数据
    getRowData = async () => {
        this.setState({
            loading: true,
        });
        const data: any = await getTree<INodeItem[]>({ type: 0 });
        const treeArr = getTreeRoot(data);
        this.setState({
            treeData: treeArr,
        });
        return;
        if (data) {
            const rootIds = this.getRootIds(data);
            const expand: string[] = [];
            data.forEach((item: any) => {
                if (item.type == 'organization') {
                    expand.push(item.id);
                }
            });
            this.setState({
                expandedKeys: expand,
            });
            this.setState({
                // rowData: data,
                treeData: this.formatData(data, rootIds),
            });
        }
        this.setState({
            loading: false,
        });
    };
    //得到根节点
    getRootIds = (data: any[]) => {
        const dd = data;
        const ids = dd.map((item: any) => item.id);
        let rootIds: any = [];
        dd.forEach((item) => {
            if (!ids.includes(item.pId + '')) rootIds.push(item.pId);
        });
        return rootIds;
    };
    //转换成Tree组件所要求的treeData格式
    formatData = (data: INodeItem[], id: string[] | string = ['-1']) => {
        let treeData: any[] = [];
        data.forEach((item) => {
            // if (item.pId == id) {
            if (id.includes(item.pId)) {
                let node: any = {};
                const { id, type, title, sectionName } = item;
                node = {
                    ...item,
                    icon: ({ expanded }: any) => {
                        return expanded ? <Icons type={-1} /> : <Icons type={type} />;
                    },
                };
                node.children = this.formatData(data, id);
                !node.children.length && delete node.children;
                treeData.push(node);
            }
        });
        return treeData;
    };

    componentDidMount() {
        this.getRowData();
    }
    render() {
        const { selectedKeys, treeData, expandedKeys } = this.state;
        return (
            <div className={styles.treeBox}>
                <Input allowClear maxLength={30} placeholder="请输入组织名称" onChange={this.searchTree} />
                {treeData.length === 0 && <div className={styles.noTreeData}>未找到组织</div>}
                {/* <Spin spinning={this.state.loading}> */}
                {treeData.length > 0 && (
                    <Tree
                        className={styles.tree}
                        checkable={false}
                        treeData={treeData}
                        showIcon
                        defaultExpandAll
                        // expandedKeys={expandedKeys}
                        selectedKeys={selectedKeys}
                        onSelect={this.onSelect}
                        switcherIcon={<DownOutlined />}
                    />
                )}

                {/* </Spin> */}
            </div>
        );
    }
}

export default SuperTree;

// id: "10000"
// name: "重庆市城市管理局"
// type: "organization"
// monitorType: null
// workType: null
// orgId: null
// value: "10000"
// key: "10000"
// title: "重庆市城市管理局"
// pId: "-1"
// enterpriseId: null
// enterpriseName: null
// sectionName: null
// workId: null

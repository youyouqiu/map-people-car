// 客户组织树
import React, { Component } from 'react';
import { Tree, Input } from 'antd'
import { getCustomerTree } from '@/server/customerManagement';
import { getTreeRoot } from '@/framework/utils/tree';
import styles from './index.module.less';

interface IProps {
    /**
     * 树节点点击回调方法
     * callbackData
     * @param selectedNode:{id,type...}
     * @param e 节点相关数据
     */
    treeNodeClick?: Function;
    /**
     * 刷新组织树(需要再次刷新时需改变此数据)
     */
    refreshCount?: number;
}

interface IState {
    treeData: Array<INodeItem>;
    inputValue: string;
    oldRefreshCount: number;
    selectedKeys: Array<string>;
    searchTimer: null | NodeJS.Timeout;
}

interface INodeItem {
    id: string;
    key: string;
    monitorCount: any;
    monitorType: any;
    name: string;
    pId: number;
    title: string;
    type: string;
    value: number;
}

class CustomerTreeNode extends Component<IProps, IState, any> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            treeData: [],
            inputValue: '',
            oldRefreshCount: 0,
            selectedKeys: [],
            searchTimer: null,//模糊搜索定时器
        };

    }

    componentDidMount() {
        this.getGroupTree();
    }

    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        const { refreshCount } = nextProps;
        const { oldRefreshCount } = this.state;
        // refreshCount改变,刷新组织树
        if (refreshCount !== undefined && refreshCount !== oldRefreshCount) {
            this.refreshTree(refreshCount);
        }
    }

    /**
     * 刷新树
     */
    refreshTree = (refreshCount: number) => {
        this.setState({
            inputValue: '',
            oldRefreshCount: refreshCount,
            selectedKeys: [],
        }, () => {
            this.getGroupTree();
        })
    }

    getGroupTree = async (param?: string) => {
        const result: any = await getCustomerTree({ customerName: param, enabled: true });
        if (result) {
            const treeData = getTreeRoot(result);
            this.setState({
                treeData: treeData
            })
        }
    }

    /**
     * 重构组织树数据
     */
    renderTreeData = (dataArr: Array<INodeItem>) => {
        const resultObj: any = {};
        const data = JSON.parse(JSON.stringify(dataArr));
        for (let i = 0; i < data.length; i += 1) {
            const item = data[i];
            if (resultObj[item.pId]) {
                resultObj[item.pId].push(item);
            } else {
                resultObj[item.pId] = [item];
            }
        }
        for (let i = 0; i < data.length; i += 1) {
            const item = data[i];
            if (item && resultObj[item.id]) {
                item.children = resultObj[item.id];
            }
        }
        this.setState({
            treeData: resultObj['-1'] ? resultObj['-1'] : []
        })
    }

    /**
     * 组织树模糊搜索
     */
    serarchTree = (value: string) => {
        let { searchTimer } = this.state;
        if (searchTimer) {
            clearTimeout(searchTimer);
            searchTimer = null;
        }

        const timer = setTimeout(() => {
            this.getGroupTree(value);
        }, 500);
        this.setState({
            inputValue: value,
            searchTimer: timer
        })
    }


    // 点击树节点
    onTreeSelect = (selectedKeys: Array<string>, e: any) => {
        if (selectedKeys.length === 0) {
            return;
        }
        const { treeNodeClick } = this.props;
        if (typeof treeNodeClick === 'function') {
            treeNodeClick(e.node, e);
        }
        this.setState({
            selectedKeys,
        });
    }

    render() {
        const { selectedKeys, treeData, inputValue } = this.state;

        return (
            <div className={styles.treeWrapper}>
                <div className={styles.treeContainer}>
                    <Input
                        placeholder="请输入客户名称"
                        allowClear
                        value={inputValue}
                        onChange={(e: any) => this.serarchTree(e.target.value)}
                    />
                    {
                        this.state.treeData.length ?
                            <Tree
                                className={styles.treeBox}
                                showIcon
                                treeData={treeData}
                                autoExpandParent
                                defaultExpandParent
                                defaultExpandAll
                                defaultSelectedKeys={[]}
                                selectedKeys={selectedKeys}
                                key={treeData.length === 0 ? Math.random() : '1'}
                                onSelect={this.onTreeSelect}
                            />
                            : <div className={styles.treeNoData}>未找到用户</div>
                    }
                </div>
            </div>
        );
    }
}
export default CustomerTreeNode;
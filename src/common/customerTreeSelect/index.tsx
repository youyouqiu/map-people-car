// 客户组织树
import React, { Component } from 'react';
import { TreeSelect } from 'antd';
import { getCustomerTree } from '@/server/customerManagement';
import { getTreeRoot } from '@/framework/utils/tree';
import { TreeSelectProps } from 'antd/lib/tree-select';
interface IProps extends TreeSelectProps<string> {
    /**
     * 树节点点击回调方法
     * callbackData
     * @param selectedNode:{id,type...}
     * @param value: 
     * @param isParentSelect: 父节点是否可选
     * @param e 节点相关数据
     */
    treeNodeClick?: Function;
    value?: string;
    placeholder: string | undefined;
    disabled?: boolean;
    isParentSelect?: boolean;
    /**
     * 刷新组织树(需要再次刷新时需改变此数据)
     */
    refreshCount?: number;
}

interface IState {
    treeData: Array<INodeItem>;
    inputValue: string;
    oldRefreshCount: number;
    selectedKeys: string | undefined;
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
            selectedKeys: undefined,
            searchTimer: null,//模糊搜索定时器
        };

    }

    componentDidMount() {
        this.getGroupTree();
    }

    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        const {  value } = nextProps;
        const {  selectedKeys } = this.state;
        // refreshCount改变,刷新组织树
        // if (refreshCount !== undefined && refreshCount !== oldRefreshCount) {
        //     this.refreshTree(refreshCount);
        // }

        if (value && value !== selectedKeys) {
            this.setState({
                selectedKeys: value
            })
        }
    }

    /**
     * 刷新树
     */
    refreshTree = (refreshCount: number) => {
        this.setState({
            inputValue: '',
            oldRefreshCount: refreshCount,
            selectedKeys: '',
        }, () => {
            this.getGroupTree();
        })
    }

    getGroupTree = async (param?: string) => {
        const result: any = await getCustomerTree({ customerName: param });
        if (result && result.length) {
            const treeData = getTreeRoot(result);
            // 是否禁用用户之外的选择
            if ('isParentSelect' in this.props) {
                result.map((item: any) => ({
                    ...item,
                    disable: item.disabled = item.type !== "customer"
                }))
            }
            this.setState({
                treeData: treeData
            })
        }
    }

    /**
     * 重构组织树数据
     */
    renderTreeData = () => {
        // const resultObj: any = {};
        // const data = JSON.parse(JSON.stringify(dataArr));
        // for (let i = 0; i < data.length; i += 1) {
        //     const item = data[i];
        //     if ('isParentSelect' in this.props) {
        //         item.disabled = item.type !== "customer" ? true : false
        //     }
        //     if (resultObj[item.pId]) {
        //         resultObj[item.pId].push(item);
        //     } else {
        //         resultObj[item.pId] = [item];
        //     }
        // }
        // for (let i = 0; i < data.length; i += 1) {
        //     const item = data[i];
        //     if (item && resultObj[item.id]) {
        //         item.children = resultObj[item.id];
        //     }
        // }
        // this.setState({
        //     treeData: resultObj['-1'] ? resultObj['-1'] : []
        // })
    }


    // 点击树节点
    onTreeSelect = (selectedKeys: string, e: any) => {
        const { treeNodeClick } = this.props;
        if (typeof treeNodeClick === 'function') {
            treeNodeClick(e.node, e);
        }
        this.setState({
            selectedKeys,
        });
    }

    render() {
        const { selectedKeys, treeData } = this.state;

        return (
            <TreeSelect
                {...this.props}
                treeIcon
                treeDefaultExpandAll
                disabled={this.props.disabled}
                placeholder={this.props.placeholder}
                treeData={treeData}
                value={selectedKeys}
                virtual={false}
                key={treeData.length === 0 ? Math.random() : '1'}
                onSelect={this.onTreeSelect}
            />
        );
    }
}
export default CustomerTreeNode;
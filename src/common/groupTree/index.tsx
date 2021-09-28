/**
 * 分组组织树及用户有权限的分组树
 */
import React, { Component } from 'react';
import { Tree, Input, Spin, Empty } from 'antd';
import { getGroupTree, getUserGroupTree } from '@/server/monitorManager';

import styles from './index.module.less';
import { Select } from 'antd';
import { getTreeRoot } from '@/framework/utils/tree';
import { loopTreeChecked } from '@/framework/utils/treeOnChecked';
import TrimInput from '@/common/trimInput'
const { Option } = Select;

interface IProps {
  /**
   * 树节点点击回调方法
   * callbackData
   * @param selectedNode:{id,type...}
   * @param e 节点相关数据
   */
  treeNodeClick?: Function;
  onTreeCheck?: Function;//复选框勾选回调 (checkedKeys: any) => void
  /**
   * 刷新组织树(需要再次刷新时需改变此数据)
   */
  refreshCount?: number;
  /**
   * 组织树加载完成回调
   */
  treeInitCallback?: Function;
  isShowselect?: boolean;//是否显示搜索下拉
  isCheckable?: boolean;//是否显示勾选框
  checkedKeys?: Array<string>;//勾选节点id集合
  treeData?: Array<Record<string, any>>;// 组织树数据
  userId?: string;//用户id
  closeLoading?: Function;
}

export interface ITreeEvent {
  checked?: boolean;
  checkedNodes?: any;
  node?: any;
  event?: any;
  halfCheckedKeys?: any;
}

interface IState {
  allTreeData: Array<INodeItem>;
  treeData: Array<INodeItem>;
  inputValue: string;
  oldRefreshCount: number | null;
  selectedKeys: Array<string>;
  checkedKeys: Array<string>;
  searchTimer: null | NodeJS.Timeout;
  queryType: number;
  loading: boolean;
}

interface INodeItem {
  id: string;
  key: string;
  name: string;
  pId: string;
  title: string;
  type: string;
  value: number;
}

class GroupTreeNode extends Component<IProps, IState, any> {
  loopObj: Function | undefined = undefined

  static defaultProps = {
    isShowselect: false,
    isCheckable: false,
    userId: ''
  }

  constructor(props: IProps) {
    super(props);

    this.state = {
      allTreeData: [],// 存放所有的树节点数据,用于刷新树
      treeData: [],
      inputValue: '',
      oldRefreshCount: null,
      selectedKeys: [],
      checkedKeys: [],
      searchTimer: null,//模糊搜索定时器
      queryType: 2,
      loading: true,
    };

  }

  componentDidMount() {
    const {
      checkedKeys
    } = this.props;
    this.getGroupTreeFun();

    if (checkedKeys) {
      this.setState({
        checkedKeys,
      });
    }

    this.loopObj = loopTreeChecked(this.props.checkedKeys, 'enterprise');
  }

  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { refreshCount, checkedKeys } = nextProps;
    const { oldRefreshCount } = this.state;
    // refreshCount改变,刷新组织树
    if (refreshCount !== undefined && refreshCount !== oldRefreshCount) {
      this.refreshTree(refreshCount);
    }
    if (checkedKeys
      && checkedKeys.length > 0
      && (this.props.checkedKeys && checkedKeys.toString() != this.props.checkedKeys.toString())
    ) {
      this.setState({
        checkedKeys,
      });
      this.loopObj = loopTreeChecked(this.props.checkedKeys, 'enterprise');
    }
  }

  /**
   * 刷新树
   */
  refreshTree = (refreshCount: number) => {
    const { allTreeData } = this.state;
    this.setState({
      inputValue: '',
      oldRefreshCount: refreshCount,
      selectedKeys: [],
      treeData: allTreeData
    })
  }

  getGroupTreeFun = async (param?: string) => {
    const { treeData, userId } = this.props;
    let result: any = treeData;
    if (!treeData || param !== undefined) {
      // if (userId) {//用户有权限的分组
      //     result = await getUserGroupTree<Array<Record<string, any>>>({
      //         keyword: param,
      //         queryType: this.state.queryType,
      //         userId: userId
      //     });
      // } else {
      result = await getGroupTree<Array<Record<string, any>>>({
        keyword: param,
      });
      // }
    }

    if (result) {
      const treeData = getTreeRoot(result);
      this.setState({
        treeData: treeData,
        loading: false
      });
      // 首次加载时存储所有树节点数据
      if (param === undefined) {
        this.setState({
          allTreeData: treeData,
        })
      }
    }
  }

  /**
   * 组织树模糊搜索
   */
  serarchTree = (value: string) => {
    // value = value.replace(/[`\^\*;'"\\|,/<>\?]/g, '');
    let { searchTimer } = this.state;
    if (searchTimer) {
      clearTimeout(searchTimer);
      searchTimer = null;
    }

    this.setState({
      loading: true
    })
    const timer = setTimeout(() => {
      this.getGroupTreeFun(value);
    }, 500);
    this.setState({
      inputValue: value,
      searchTimer: timer
    })
  }

  // 点击树节点
  onTreeSelect = (selectedKeys: Array<string>, e: any) => {
    if (selectedKeys.length === 0) return;
    const { treeNodeClick } = this.props;
    const result: any = {
      orgIds: [],
    }
    const { children, type } = e.node;
    if (type === "enterprise") {
      result.orgIds.push(selectedKeys[0]);
    }
    if (children && children.length > 0) {
      this.traverseTreeNode(children, result);
    }

    if (typeof treeNodeClick === 'function') {
      treeNodeClick(e.node, e, result);
    }
    this.setState({
      selectedKeys,
    });
  }

  /**
   * 遍历获取节点下的所有节点
   * @param nodeData 节点数据
   * @param result 组装信息
   * @param initStatus 组织树首次渲染
   */
  traverseTreeNode = (nodeData: Array<object>, result: { orgIds: Array<string> }) => {
    nodeData.map((item: any) => {
      if (item.type === 'enterprise' && result.orgIds.indexOf(item.id) === -1) {
        result.orgIds.push(item.id);
      }
    })
  }

  /**
   * 搜索下拉改变
   */
  handleChange = (value: number) => {
    this.setState({
      queryType: value,
      loading: true
    }, () => {
      const { inputValue } = this.state;
      this.getGroupTreeFun(inputValue);
    })
  }

  /**
   * 复选框勾选
   */
  onTreeCheck = (checkedKey: any, e: ITreeEvent) => {
    const {
      node,
    } = e;

    if (this.loopObj) {
      const result = this.loopObj(node);
      this.setState({
        checkedKeys: [...result.treeChecked]
      })

      // 传递给父组件
      const {
        onTreeCheck
      } = this.props;
      if (typeof onTreeCheck === 'function') {
        onTreeCheck(result.checkTypeIds);
      }
    }
  }

  render() {
    const { isShowselect, isCheckable } = this.props;
    const { selectedKeys, treeData, inputValue, checkedKeys, loading } = this.state;

    return (
      <div className={styles.treeWrapper}>
        <div className={[styles.treeContainer, isShowselect ? styles['showArrow'] : null].join(' ')}>
          <div className={styles['search-input']}>
            {
              isShowselect && <Select
                defaultValue={2}
                style={{ width: 120 }}
                className={styles['select']}
                onChange={this.handleChange}
              >
                <Option value={2}>分组</Option>
                <Option value={1}>组织</Option>
              </Select>
            }
            <TrimInput
              placeholder="请输入企业名称"
              allowClear
              // value={inputValue}
              maxLength={30}
              onChange={(value: any) => this.serarchTree(value)}
            />
          </div>
          {treeData.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
          <Tree
            checkable={isCheckable}
            className={styles.treeBox}
            showIcon
            // checkStrictly
            treeData={treeData}
            defaultExpandAll
            selectedKeys={selectedKeys}
            checkedKeys={checkedKeys}
            key={treeData.length === 0 ? Math.random() : '1'}
            onSelect={this.onTreeSelect}
            onCheck={this.onTreeCheck}
          />

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
    );
  }
}

export default GroupTreeNode;
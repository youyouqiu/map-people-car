// 当前权限下的组织树
import React, { Component } from 'react';
import { Tree, Input } from 'antd';
import { getOrgTree } from '@/server/monitorManager';
import styles from './index.module.less';
import { INodeItem, getTreeRoot } from '@/framework/utils/tree';
import TrimInput from '@/common/trimInput'

export interface IOrgTree {
  id: string;
  key: string;
  monitorAliases: string;
  monitorCount: string;
  monitorType: string;
  name: string;
  pId: string;
  title: string;
  type: string;
  value: string;
  [key: string]: any;
}

interface IProps {
  /**
   * 树节点点击回调方法
   * callbackData
   * @param selectedNode:{id,type...}
   * @param e 节点相关数据
   */
  customizeTree?: <T>(data: any) => void; //树组件请求接口
  treeNodeClick?: Function;
  /**
   * 刷新组织树(需要再次刷新时需改变此数据)
   */
  refreshCount?: number; //传2：重新请求接口数据
  placeHolder?: string;
  queryOrgId?: any;
}

interface IState {
  allTreeData: Array<INodeItem>;
  treeData: Array<INodeItem>;
  inputValue: string;
  oldRefreshCount: number;
  selectedKeys: Array<string>;
  searchTimer: null | NodeJS.Timeout;
}

class OrgTree extends Component<IProps, IState, any> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      allTreeData: [], // 存放所有的树节点数据,用于刷新树
      treeData: [],
      inputValue: '',
      oldRefreshCount: 0,
      selectedKeys: [],
      searchTimer: null, //模糊搜索定时器
    };
  }

  componentDidMount() {
    this.getOrgTree();
  }

  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { refreshCount } = nextProps;
    const { oldRefreshCount } = this.state;
    // console.log('refreshCount', refreshCount);
    // console.log('oldRefreshCount', oldRefreshCount);


    if (refreshCount !== undefined && refreshCount !== oldRefreshCount) {
      this.refreshTree(refreshCount);
    }
    // if (refreshCount == 2) {
    //     //重新请求
    //     this.getOrgTree();
    //     this.setState({
    //         oldRefreshCount: 0,
    //     });
    // }
  }

  /**
   * 刷新树
   */
  refreshTree = (refreshCount: any) => {
    const { allTreeData } = this.state;
    this.setState({
      inputValue: '',
      selectedKeys: [],
      // treeData: allTreeData,
      oldRefreshCount: refreshCount
    }, () => {
      this.getOrgTree();
    });
  };
  getOrgTree = async (param?: string) => {
    const result = this.props.customizeTree
      ? await this.props.customizeTree<Array<IOrgTree>>({
        keyword: param,
      })
      : await getOrgTree<Array<IOrgTree>>({ keyword: param });
    if (result) {
      const data: any = result || [];
      const treeArr = getTreeRoot(data);
      this.setState({
        treeData: treeArr,
      });
      this.props.queryOrgId(treeArr[0].id)
      // 首次加载时存储所有树节点数据
      if (param === undefined) {
        this.setState({
          allTreeData: treeArr,
        });
      }
    }
  };

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

    const timer = setTimeout(() => {
      this.getOrgTree(value);
    }, 500);
    this.setState({
      inputValue: value,
      searchTimer: timer,
    });
  };

  // 点击树节点
  onTreeSelect = (selectedKeys: Array<string>, e: any) => {
    // console.log('selectedKeys', selectedKeys);

    if (selectedKeys.length === 0) return;
    const { treeNodeClick } = this.props;
    if (typeof treeNodeClick === 'function') {
      treeNodeClick(e.node, e);
    }
    this.setState({
      selectedKeys,
    });
  };

  render() {
    const { selectedKeys, treeData, inputValue } = this.state;
    // console.log('treeData', treeData);

    // console.log('selectedKeys', selectedKeys);

    return (
      <div className={styles.treeWrapper}>
        <div className={styles.treeContainer}>
          <div className={styles['search-input']}>
            <TrimInput
              placeholder={this.props.placeHolder || '请输入组织名称'}
              allowClear
              // value={inputValue}
              onChange={(value: any) => this.serarchTree(value)}
              maxLength={30}
            />
          </div>
          {treeData.length === 0 && <div className={styles.noTreeData}>未找到组织</div>}
          <Tree
            className={styles.treeBox}
            treeData={treeData}
            defaultExpandAll
            showIcon
            selectedKeys={selectedKeys}
            key={treeData.length === 0 ? Math.random() : '1'}
            onSelect={this.onTreeSelect}
          />
        </div>
      </div>
    );
  }
}
export default OrgTree;

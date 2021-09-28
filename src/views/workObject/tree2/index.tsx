// 当前权限下的组织树
import React, { Component } from 'react';
import { Tree, Input } from 'antd';
import { getTree } from '@/server/workObject';
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
    if (refreshCount !== undefined && refreshCount !== 0) {
      this.refreshTree();
    }

    if (refreshCount == 2) {
      //重新请求
      this.getOrgTree();
      this.setState({
        oldRefreshCount: 0,
      });
    }
  }

  /**
   * 刷新树
   */
  refreshTree = () => {
    const { allTreeData } = this.state;
    this.setState({
      inputValue: '',
      selectedKeys: [],
      treeData: allTreeData,
    });
  };
  getOrgTree = async (param?: string) => {
    const result = param ? await getTree<Array<IOrgTree>>({ type: 0, keyword: param }) : await getTree<Array<IOrgTree>>({ type: 0 });
    if (result) {
      const data: any = result || [];
      const treeArr = getTreeRoot(data);
      console.log('treeArr', treeArr);

      this.setState({
        treeData: treeArr,
      });
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
    const height = document.querySelector('body')?.offsetHeight;
    return (
      <div className={styles.treeWrapper}>
        <div className={styles.treeContainer}>
          <div className={styles['search-input']}>
            <TrimInput
              placeholder="请输入标段名称"
              allowClear
              // value={inputValue}
              onChange={(value: any) => this.serarchTree(value)}
              maxLength={30}
            />
          </div>
          {treeData.length === 0 && (
            <div className={styles.noTreeData} style={{ marginLeft: '28px' }}>
              未找到标段
            </div>
          )}
          <Tree
            className={styles.treeBox}
            // height={height ? height - 200 : 740}
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

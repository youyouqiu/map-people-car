/**
 * 分组组织树及用户有权限的分组树
 */
import React, { Component } from 'react';
import { Tree, Input, Spin, Empty } from 'antd';
import styles from './index.module.less';
import { Select } from 'antd';
import { getTreeRoot } from '@/framework/utils/tree';
import { fuzzySearchTree, treeMonitors } from '@/server/workManagement';
import { INodeItem } from '@/model/workMonitoring';
import { getStore } from '@/framework/utils/localStorage';
const { Option } = Select;

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
  /**
   * 组织树加载完成回调
   */
  treeInitCallback?: Function;
  isShowselect?: boolean; //是否显示搜索下拉
  treeData?: Array<Record<string, any>>; // 组织树数据
  getFirstMoniter: (params: { sectionId: string; workId: string }) => void;
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
  selectedNode: any;
  searchTimer: null | NodeJS.Timeout;
  type: number;
  loading: boolean;
  defaultExpandedKeys: Array<string>;
  expandedKeys: string[];
}

class Index extends Component<IProps, IState, any> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      allTreeData: [], // 存放所有的树节点数据,用于刷新树
      treeData: [],
      inputValue: '',
      oldRefreshCount: null,
      selectedKeys: [],
      selectedNode: null,
      searchTimer: null, //模糊搜索定时器
      type: 0, //  0 作业对象 1 监控对象
      loading: true,
      defaultExpandedKeys: [], // 组织树默认展开节点
      expandedKeys: [],
    };
  }
  localRef: any = React.createRef();
  componentDidMount() {
    this.getTreeDataFun();
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
    const { allTreeData } = this.state;
    this.setState({
      inputValue: '',
      oldRefreshCount: refreshCount,
      selectedKeys: [],
      treeData: allTreeData,
    });
  };

  /*
  获取树形节点中的第一个作业对象节点
  */
  getTreeFirstWorkNode(tree: any) {
    // const children = data.children;
    let workData: any = null;
    const len = tree.length;
    for (let i = 0; i < len; i++) {
      const idata = tree[i];
      if (idata.type === 'work') {
        workData = idata;
        break;
      } else if (idata.children && idata.children.length) {
        workData = this.getTreeFirstWorkNode(idata.children);
        if (workData) {
          break;
        }
      } else {
        workData = null;
      }
    }
    return workData;
  }
  //外部控制添加数据到某个节点
  outerAddData = (addData: any, pKey: string) => {
    const { treeData, expandedKeys } = this.state;
    expandedKeys.push('106876114966020096_106874423461937152');
    this.setState({
      treeData: this.updateTreeData(treeData, pKey, addData),
      expandedKeys,
    });
  };
  //外部控制选中的节点
  setSelectedKeys = (value: string) => {
    this.setState({
      selectedKeys: [value],
    });
  };
  //获取第一个机动组的 pId id
  res: any;
  getFirstMobile = (treeData: any) => {
    if (treeData) {
      return treeData.find((item: INodeItem) => {
        if (item.type == 'work') {
          this.res = item;
          return item;
        } else {
          return this.getFirstMobile(item.children);
        }
      });
    } else {
      return null;
    }
  };
  /**
   * 获取组织树数据
   * @param param
   */
  getTreeDataFun = async (param?: string) => {
    const { treeData } = this.props;
    const { type } = this.state;
    let result: any = treeData;
    // if (!treeData || param !== undefined) {
    result = await fuzzySearchTree<Array<Record<string, any>>>({
      keyword: param || '',
      queryType: type as 0 | 1,
    });
    // }
    if (result) {
      const defaultExpandedKeys: Array<string> = [];
      result.map((item: INodeItem) => {
        // 0 作业对象 1 监控对象
        // 默认打开 作业对象和监控对象之外的其它节点
        if (!this.state.inputValue) {
          if (item.type !== 'monitor' && item.type !== 'work') {
            defaultExpandedKeys.push(item.key);
          }
        } else {
          if (item.type !== 'monitor') {
            defaultExpandedKeys.push(item.key);
          }
        }
      });
      // 类型 enterprise:企业 organization :组织 section:标段work :作业对象 monitor :监控对象 user :用户
      const treeData = getTreeRoot(result);
      const selectedData = this.getTreeFirstWorkNode(treeData);
      this.setState({
        treeData: treeData,
        defaultExpandedKeys,
        expandedKeys: [...defaultExpandedKeys],
        loading: false,
        // selectedKeys: [selectedData.key || ''],
        selectedNode: selectedData || {},
      });
      this.onLoadData(selectedData);
      // 首次加载时存储所有树节点数据
      if (param === undefined) {
        this.setState({
          allTreeData: treeData,
        });
      }
      //找到第一个机动组
      if (!this.res) {
        this.getFirstMobile(this.state.treeData);
        this.props.getFirstMoniter(this.res);
      }
    } else {
      this.setState({
        treeData: [],
        loading: false,
        defaultExpandedKeys: [],
      });
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

    this.setState({
      loading: true,
    });
    const timer = setTimeout(() => {
      this.getTreeDataFun(value);
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

  /**
   * 搜索下拉改变
   */
  handleChange = (value: number) => {
    this.setState(
      {
        type: value,
        loading: true,
      },
      () => {
        const { inputValue } = this.state;
        this.getTreeDataFun(inputValue);
      }
    );
  };

  /**
   * 异步加载子节点数据
   * @param treeNode
   */
  onLoadData = async (treeNode: INodeItem) => {
    // console.log('treeNode', treeNode);
    if (this.state.inputValue) return;
    const { type, children } = treeNode;
    return new Promise((resolve) => {
      if (type !== 'work') {
        resolve();
        return;
      }
      const { treeData, inputValue, defaultExpandedKeys } = this.state;
      const paramObj = {
        sectionId: treeNode.pId, //标段ID
        workId: treeNode.workId, // - 100代表机动组，-200代表未排班，其他代表作业对象Id
      };
      treeMonitors(paramObj).then((res: Array<INodeItem>) => {
        res = res || [];
        res.forEach((e) => (e.isLeaf = true));
        if (res.length) {
          defaultExpandedKeys.push(treeNode.key);
          this.setState({
            treeData: this.updateTreeData(treeData, treeNode.key, res),
            // selectedKeys: [res[0].key],
            defaultExpandedKeys: defaultExpandedKeys,
          });
        } else {
          this.setState({
            selectedKeys: [treeNode.key],
          });
        }
        resolve();
        // }
      });
      resolve();
    });
  };
  /**
   * 控制节点收缩展开
   */
  onExpand = (expandedKeys: string[], info: { expanded: boolean; node: any }) => {
    console.log(expandedKeys);
    console.log(info);
    if (info.expanded) {
      this.setState({
        expandedKeys: [expandedKeys, info.node.key],
      });
    }
  };
  /**
   * 更新节点
   */
  updateTreeData = (list: any, key: any, children: any) => {
    return list.map((node: any) => {
      if (node.key === key) {
        if (node.type === 'monitor') {
          return children;
        }
        return { ...node, children };
      }
      if (node.children) {
        return { ...node, children: this.updateTreeData(node.children, key, children) };
      }
      return node;
    });
  };
  render() {
    const { isShowselect = false } = this.props;
    const { selectedKeys, treeData, defaultExpandedKeys, expandedKeys, inputValue, loading } = this.state;

    return (
      <div className={styles.treeWrapper}>
        <div className={[styles.treeContainer, isShowselect ? styles.showArrow : null].join(' ')}>
          <div className={styles['search-input']}>
            {isShowselect && (
              <Select defaultValue={0} style={{ width: 120 }} className={styles.select} onChange={this.handleChange}>
                {/* 0 作业对象 1 监控对象 */}
                <Option value={1}>监控对象</Option>
                <Option value={0}>作业对象</Option>
              </Select>
            )}
            <Input
              placeholder="请输入关键字"
              allowClear
              // value={inputValue}
              maxLength={30}
              onChange={(e: any) => this.serarchTree(e.target.value)}
            />
          </div>
          {treeData.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
          <Tree
            ref={this.localRef}
            checkable={false}
            className={styles.treeBox}
            showIcon
            treeData={treeData}
            defaultExpandedKeys={defaultExpandedKeys}
            // expandedKeys={expandedKeys}
            // loadData={this.onLoadData}
            loadData={this.onLoadData.bind(this)}
            onExpand={this.onExpand}
            selectedKeys={selectedKeys}
            key={treeData.length === 0 ? Math.random() : 'defaultTree'}
            onSelect={this.onTreeSelect}
          />
          {/* 加载框 */}
          {loading && <Spin spinning className={styles['loading']} />}
        </div>
      </div>
    );
  }
}

export default Index;

/**
 * 分组组织树及用户有权限的分组树
 */
import React, { Component } from 'react';
import { Tree, Input, Spin, Empty } from 'antd';
import styles from './index.module.less';
import { Select } from 'antd';
import { getTreeRoot } from '@/framework/utils/tree';
import { getMonitorTree } from '@/server/workMonitoring';
import { getParentTree } from '@/server/workManagement';
import { INodeItem } from '@/model/workMonitoring';
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
  getFirstMoniter: (params: any) => void;
  setAjaxParams: (params: { sectionId: string; workId: string }) => void;
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
  searchTimer: null | NodeJS.Timeout;
  type: number;
  loading: boolean;
  defaultExpandedKeys: Array<string>;
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
      searchTimer: null, //模糊搜索定时器
      type: 2, // 3:监控对象,7:作业对象
      loading: true,
      defaultExpandedKeys: [], // 组织树默认展开节点
    };
  }

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
  /**
   *
   * @param value 设置选中节点
   */
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
          this.setState({
            selectedKeys: [item.key],
          });
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
    if (!treeData || param !== undefined) {
      result = await getParentTree<Array<Record<string, any>>>({
        keyword: param,
        type,
      });
    }
    if (result) {
      const defaultExpandedKeys: Array<string> = [];
      result.map((item: INodeItem) => {
        if (item.type !== 'monitor' && (type === 7 || item.type !== 'work')) {
          defaultExpandedKeys.push(item.key);
        }
      });
      const treeData = getTreeRoot(result);
      this.setState({
        treeData: treeData,
        defaultExpandedKeys,
        loading: false,
      });
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
  onLoadData = async (treeNode: any) => {
    console.log('treeNode', treeNode);
    const { type, children } = treeNode;
    return new Promise((resolve) => {
      // if (type !== 'work' || children) {
      //     resolve();
      //     return;
      // }
      const { treeData, inputValue, type } = this.state;
      const paramObj = {
        id: treeNode.id, // 树节点的ID
        keyword: inputValue, // 模糊查询
        orgId: treeNode.orgId, // 企业ID
        pId: treeNode.pId, // 父节点id
        type: type, // 查询类型 0：用户名 1:组织 3:监控对象 4:终端 5：sim卡 6：从业人员 7：代表作业对象 -1：代表全部
        workId: treeNode.workId, // - 100代表机动组，-200代表未排班，其他代表作业对象Id
        workType: treeNode.workType, // 作业对象类型
      };
      // getMonitorTree(paramObj).then((res: { code: Number; data: Array<INodeItem> }) => {
      //     if (res && res.code === 200) {
      //         const children = res.data;
      //         // if (type === 'work') {
      //         //     children.map((item) => {
      //         //         item.isLeaf = true;
      //         //         return item;
      //         //     });
      //         // }
      //         this.setState({
      //             treeData: this.updateTreeData(treeData, treeNode.key, children),
      //         });
      //         resolve();
      //     }
      // });
      resolve();
    });
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
    const { selectedKeys, treeData, defaultExpandedKeys, inputValue, loading } = this.state;

    return (
      <div className={styles.treeWrapper}>
        <div className={[styles.treeContainer, isShowselect ? styles.showArrow : null].join(' ')}>
          <div className={styles['search-input']}>
            {isShowselect && (
              <Select defaultValue={3} style={{ width: 120 }} className={styles.select} onChange={this.handleChange}>
                <Option value={3}>监控对象</Option>
                <Option value={7}>作业对象</Option>
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
            checkable={false}
            className={styles.treeBox}
            showIcon
            treeData={treeData}
            defaultExpandedKeys={defaultExpandedKeys}
            loadData={this.onLoadData.bind(this)}
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

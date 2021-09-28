/**
 * 分组组织树及用户有权限的分组树
 */
import React, { Component } from 'react';
import { Tree, Input, Spin, Empty } from 'antd';
import styles from './index.module.less';
import { Select } from 'antd';
import { getTreeRoot } from '@/framework/utils/tree';
import { getParentTree, getMonitorTree, getBindingVehicleIds } from '@/server/workMonitoring';
import { INodeItem } from '@/model/workMonitoring';
import { CarOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons';
import { getStore } from '@/framework/utils/localStorage';
import { WebSocketClass } from '@/framework/utils/webSocket';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { ungzip } from '@/framework/utils/unzip';
const { Option } = Select;
import videoImg from '@/static/image/video.png';
import videoActiveImg from '@/static/image/videoActive.png';

interface IProps {
  type?: string;// monitoring:作业监控
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
  isShowselect?: boolean;//是否显示搜索下拉
  treeData?: Array<Record<string, any>>;// 组织树数据
  subscribeMonitorIds: any;
  globalSocket: WebSocketClass;
  treeHeight?: number;
  defaultValue?: { key: string, name: string };
  /**
   * 页面跳转参数
   */
  parameter?: { key: string, name: string } | undefined;
  changeTopChangeStatus: Function;
  changeMonitorStatusMap: Function;
  checkName?: string;
  videoClcik?: Function;// 监控对象后的视频按钮点击事件
  changeisVideo: Function;
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
  showTreeData: Array<INodeItem>;
  treeData: Array<INodeItem>;
  inputValue: string;
  oldRefreshCount: number | null;
  selectedKeys: Array<string>;
  queryType: number;
  loading: boolean;
  initStatus: boolean,
  defaultExpandedKeys: Array<string>;
  currentTab: number | string;
}

// let monitorStatusObj: any = {// 存储监控对象状态
//     online: [],// 在线
//     offline: [],// 离线
//     noAddress: []// 未定位
// }
let openMonitorIds: any = new Map();// 已经展开的监控对象id Map集合
let subscribeMonitorMap: any = new Set();//key:monitorid 存储已订阅的监控对象集合
let monitorStatusMap: any = new Map();//key:monitorid,value:status 存储监控对象状态
class Index extends Component<IProps, IState, any> {
  compositionStatus = true
  searchTimer: any
  inputRef: any
  constructor(props: IProps) {
    super(props);
    this.getBindingVehicleIdsFun();
    this.state = {
      allTreeData: [],// 存放所有的树节点数据,用于刷新树
      showTreeData: [],// 存放当前显示的树节点数据
      treeData: [],
      inputValue: '',
      oldRefreshCount: null,
      selectedKeys: [],
      queryType: 3,// 3:监控对象,7:作业对象
      loading: true,
      initStatus: true,
      defaultExpandedKeys: [],// 组织树默认展开节点
      currentTab: '',// 当前组织树激活tab
    };

  }

  componentDidMount() {
    this.getTreeDataFun();
  }

  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { refreshCount, defaultValue, checkName } = nextProps;
    const { oldRefreshCount } = this.state;

    // refreshCount改变,刷新组织树
    if (refreshCount !== undefined && refreshCount !== oldRefreshCount) {
      this.refreshTree(refreshCount);
    }

    if (checkName) {
      this.inputRef.state.value = checkName
    }

    if (defaultValue) {
      if (defaultValue.key != this.props.defaultValue?.key && defaultValue.name != this.props.defaultValue?.name) {
        this.inputRef.state.value = defaultValue.name;
        this.setState({
          inputValue: defaultValue.name,
          selectedKeys: [defaultValue.key],
        }, () => {
          this.getTreeDataFun(defaultValue.name);
        })
      }
    }
  }

  componentWillUnmount() {
    this.onSocketSucces(2);
    openMonitorIds = new Map();
    subscribeMonitorMap = new Set();
    monitorStatusMap = new Map();
  }

  getBindingVehicleIdsFun = async () => {
    const result: any = await getBindingVehicleIds();
    if (result) {
      const { globalSocket } = this.props;
      subscribeMonitorMap = new Set(result);
      if (globalSocket) {
        this.onSocketSucces();
      }
    }
  }

  /**
   * socket 连接成功
   */
  onSocketSucces = (status?: number, data?: any) => {
    const { globalSocket } = this.props;
    if (!globalSocket) return;

    const subscribeMonitorIdsArr = data ? data : Array.from(subscribeMonitorMap);
    const len = Math.ceil(subscribeMonitorIdsArr.length / 500);

    for (let i = 0; i < len; i += 1) {
      const arr = subscribeMonitorIdsArr.slice(i * 500, 500 * (i + 1));
      this.partialSubscribe(arr, status);
    }
    //   const requestStr = { data: { monitorIds: subscribeMonitorIdsArr }, desc: { type: status ? status : 0 } } // 0是订阅，2是取消订阅，3是断开连接
    //   globalSocket.subscribeAndSend('/user/queue/hw/tree/monitor/runningStatus', this.updateTreeStatus.bind(this), '/app/hw/tree/monitor/runningStatus', header, requestStr);
  }

  /**
   * 监控对象分批订阅状态信息
   * @param dataArr 
   * @param status 
   */
  partialSubscribe = (dataArr: any, status?: number) => {
    const { globalSocket } = this.props;
    if (!globalSocket) return;
    // const token = getStore('token');
    // const header = { access_token: `Bearer ${token}` };
    const header = {};
    const requestStr = { data: { monitorIds: dataArr }, desc: { type: status ? status : 0 } } // 0是订阅，2是取消订阅，3是断开连接
    globalSocket.subscribeAndSend('/user/queue/hw/tree/monitor/runningStatus', this.updateTreeStatus.bind(this), '/app/hw/tree/monitor/runningStatus', header, requestStr);
  }

  /**
   * socket回调方法
   * @param res 
   */
  updateTreeStatus = (data: any) => {
    const { showTreeData } = this.state;
    const statusList: any = JSON.parse(data.body);
    console.log('statusList', statusList);
    const { changeTopChangeStatus, changeMonitorStatusMap } = this.props;
    changeTopChangeStatus(true);
    if (statusList instanceof Array) {// 多条更新
      for (let j = 0; j < statusList.length; j++) {
        if (openMonitorIds.has(statusList[j].monitorId)) {
          for (let i = 0; i < showTreeData.length; i++) {
            if (showTreeData[i].type !== 'monitor') continue;
            if (showTreeData[i].id == statusList[j].monitorId) {
              this.changeMonitorStatus(statusList[j], showTreeData[i])
              break;
            }
          }
        } else {
          monitorStatusMap.set(statusList[j].monitorId, statusList[j].status);
          changeMonitorStatusMap(monitorStatusMap);
        }
      }
      // this.setState({
      //     treeData: getTreeRoot(showTreeData),
      // })
    } else {// 单条更新
      if (!openMonitorIds.has(statusList.monitorId)) {
        monitorStatusMap.set(statusList.monitorId, statusList.status);
        changeMonitorStatusMap(monitorStatusMap);
        return;
      }
      for (let i = 0; i < showTreeData.length; i++) {
        if (showTreeData[i].type !== 'monitor') continue;
        if (showTreeData[i].id == statusList.monitorId) {
          this.changeMonitorStatus(statusList, showTreeData[i])
          // this.setState({
          //     treeData: this.updateTreeData(this.state.treeData, statusList.monitorId, showTreeData[i]),
          // })
          break;
        }
      }
    }
  }

  /**
   * 更改监控对象状态
   * @param newStatusObj 
   * @param monitorData 
   */
  changeMonitorStatus = (newStatusObj: any, monitorData: any) => {
    const { monitorId, status, enterpriseId } = newStatusObj;
    const { monitorType } = monitorData;
    let oldStatus = null;
    if (monitorStatusMap.size > 0) {
      oldStatus = monitorStatusMap.get(monitorId);
    }
    if (oldStatus === status) return;
    this.changeMonitorNode(monitorData, monitorType, status);
    const newData = this.updateTreeData(this.state.treeData, monitorId, monitorData);

    this.setState({
      treeData: newData,
    })

    const { changeMonitorStatusMap } = this.props;
    monitorStatusMap.set(monitorId, status);
    changeMonitorStatusMap(monitorStatusMap);
  }

  /**
   * 状态改变,修改监控对象颜色
   * @param status 
   */
  handleStatusAlterColor(status: number) {
    switch (status) {
      case 1:
        return styles.statusColorOnline;// 在线
      case 2:
        return styles.statusNoAddrss;// 未定位
      case 3:
        return styles.statusColorOffLine;// 离线
      default:
        return '';
    };
  }

  getStatusStr = (status: number) => {
    switch (status) {
      case 1:
        return 'online';// 在线
      case 2:
        return 'noAddress';// 未定位
      case 3:
        return 'offline';// 离线
      default:
        return '';
    }
  }

  /**
   * socket 连接失败
   */
  onSocketClose = () => {
    console.log('socket 连接失败');
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
      treeData: getTreeRoot(allTreeData)
    })
  }

  /**
   * 获取组织树数据
   * @param param 
   */
  getTreeDataFun = async (param?: string) => {
    const { treeData, type: treeType } = this.props;
    const { queryType, inputValue, currentTab } = this.state;
    const { initStatus } = this.state;
    this.setState({
      loading: true
    })
    let result: any = treeData;
    let isReturnMonitor = false;
    if (!treeData || param !== undefined) {
      const resultData: any = await getParentTree<Array<Record<string, any>>>({
        keyword: param,
        queryType,
        monitorStatus: param ? 0 : currentTab
      });
      if (resultData) {
        result = resultData.treeNode;
        isReturnMonitor = resultData.isReturnMonitor;
      }
    }
    if (result) {
      openMonitorIds = new Map();// 清空之前展开的监控对象
      const defaultExpandedKeys: Array<string> = [];
      const needSubscribe: any = [];// 是否需要重新订阅
      if (typeof result === 'string') {
        result = JSON.parse(ungzip(result));
      }
      console.log('result', result);
      let firstItem: any = null;
      result.map((item: INodeItem) => {
        const { id, monitorType, type } = item;
        if ((queryType === 3 && inputValue) || (type !== 'monitor' && type !== 'work')) {
          defaultExpandedKeys.push(item.key);
        }
        if (isReturnMonitor && type === 'work') {
          defaultExpandedKeys.push(item.key);
        }
        if (treeType === 'monitoring' && initStatus && type === 'section') {
          firstItem = { ...item };
        }
        if (type === 'monitor') {
          const status = monitorStatusMap.get(id) || item.monitorStatus;
          // if (currentTab === 1) {
          //   status = 1;
          // }
          this.changeMonitorNode(item, monitorType, status);
          if (!subscribeMonitorMap.has(id)) {
            subscribeMonitorMap.add(id);
            needSubscribe.push(id)
          }
          if (!openMonitorIds.has(id)) {
            openMonitorIds.set(id, true);
          }
        }
      })
      const treeData = getTreeRoot(result);

      this.setState({
        loading: false,
        showTreeData: result,
        treeData: treeData,
        defaultExpandedKeys,
        initStatus: false,
      }, () => {
        if (needSubscribe.length > 0) {
          this.onSocketSucces(0, needSubscribe);
        }
        if (firstItem && this.props.treeNodeClick) {
          firstItem.initStatus = true;
          this.props.treeNodeClick(firstItem);
          this.setState({
            selectedKeys: [firstItem.key]
          })
        }
      });

      // 首次加载时存储所有树节点数据
      if (param === undefined) {
        this.setState({
          allTreeData: result,
        })
      }
    } else {
      this.setState({
        treeData: [],
        loading: false,
        initStatus: false,
        defaultExpandedKeys: []
      })
    }
  }

  /**
   * 组织树模糊搜索
   */
  serarchTree = (inputValue: any) => {
    setTimeout(() => {
      if (this.compositionStatus) {
        if (this.searchTimer) {
          clearTimeout(this.searchTimer);
          this.searchTimer = null;
        }
        this.searchTimer = setTimeout(() => {
          // let value = inputValue.replace(/[`\^\*;'"\\|,/<>\?]/g, '');
          this.setState({
            currentTab: '',
            inputValue: inputValue,
          }, () => {
            this.getTreeDataFun(inputValue);
          });
        }, 600);
      }
    }, 100);
  }

  onCompositionStart = () => {
    this.compositionStatus = false;
  };

  onCompositionEnd = () => {
    this.compositionStatus = true;
  };

  // 点击树节点
  onTreeSelect = (selectedKeys: Array<string>, e: any) => {
    if (selectedKeys.length === 0) return;
    const { treeNodeClick, changeisVideo, type } = this.props;
    if (typeof treeNodeClick === 'function') {
      treeNodeClick(e.node, e);
      changeisVideo({ key: 'isVideo', data: e.node.isVideo ? e.node.isVideo : false });
    }

    if (type === 'workPlayBack' && e.node.type === 'monitor') {
      this.setState({
        inputValue: e.node.name
      })
    }
    this.setState({
      selectedKeys,

    });
  }

  /**
   * 搜索下拉改变
   */
  handleChange = (value: number) => {
    this.setState({
      queryType: value,
    }, () => {
      const { inputValue } = this.state;
      if (inputValue) {
        this.setState({
          loading: true
        }, () => {
          this.getTreeDataFun(inputValue);
        })
      }
    })
  }

  /**
   * 异步加载子节点数据
   * @param treeNode 
   */
  onLoadData = async (treeNode: any) => {
    const { type, children, enterpriseId } = treeNode;
    return new Promise<void>(resolve => {
      if (type !== 'work' || children) {
        resolve();
        return;
      }
      const { treeData, inputValue, queryType, showTreeData, currentTab } = this.state;
      const paramObj = {
        enterpriseId,// 企业id
        id: treeNode.id,// 树节点的ID
        keyword: inputValue,// 模糊查询
        orgId: treeNode.orgId,// 企业ID
        pId: treeNode.pId,// 父节点id
        workName: treeNode.name,
        queryType: queryType,// 查询类型 0：用户名 1:组织 3:监控对象 4:终端 5：sim卡 6：从业人员 7：代表作业对象 -1：代表全部
        // workId: treeNode.workId,// - 100代表机动组，-200代表未排班，其他代表作业对象Id
        workType: treeNode.workType,// 作业对象类型
        monitorStatus: currentTab
      }
      getMonitorTree(paramObj).then((data: Array<INodeItem>) => {
        console.log('展开,res', data);
        if (typeof data === 'string') {
          data = JSON.parse(ungzip(data));
        }
        if (data && data.length > 0) {
          const children = data;
          const needSubscribe: any = [];
          if (type === 'work') {
            children.map(item => {
              const { id, monitorType } = item;
              const status = monitorStatusMap.get(id) || item.monitorStatus;
              item.isLeaf = true;
              item.key = `${item.id}_${item.pId}`;
              this.changeMonitorNode(item, monitorType, status);
              if (!subscribeMonitorMap.has(id)) {
                subscribeMonitorMap.add(id);
                needSubscribe.push(id);
              }
              openMonitorIds.set(id, true);
              showTreeData.push(item);
              return item;
            })
          }
          this.setState({
            showTreeData,
            treeData: this.updateTreeData(treeData, treeNode.id, children),
          }, () => {
            if (needSubscribe.length > 0) {
              this.onSocketSucces(0, needSubscribe);
            }
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  };

  /**
   * 修改树节点
   * @param item 
   * @param monitorType 
   * @param status 
   */
  changeMonitorNode = (item: any, monitorType: number, status: number) => {
    const colorClassName = this.handleStatusAlterColor(status);
    if (monitorType === 1) {// 人
      item.icon = <UserOutlined className={[styles.treeIcon, colorClassName].join(' ')} />;
    } else if (monitorType === 2) {// 物
      item.icon = <DeleteOutlined className={[styles.treeIcon, colorClassName].join(' ')} />;
    } else {// 车
      item.icon = <CarOutlined className={[styles.treeIcon, colorClassName].join(' ')} />;
    }
    if (this.props.type === 'monitoring') {
      let vidoeImg = <img width='20' src={videoImg} />;
      if (status && status !== 3) {// 在线监控对象,视频按钮可用
        vidoeImg = <img width='20' src={videoActiveImg} onClick={(e) => { e.stopPropagation(); if (this.props.videoClcik) this.props.videoClcik(item); }} />;
      }
      item.title = <span className={colorClassName}>{item.name} {item.isVideo ? vidoeImg : ''}</span>;
    } else {
      item.title = <span className={colorClassName}>{item.name}</span>;
    }
  }

  /**
   * 更新节点
   */
  updateTreeData = (list: any, key: any, children: any) => {
    return list.map((node: any) => {
      if (node.id === key) {
        if (node.type === 'monitor') {
          node.title = children.title;
          node.icon = children.icon;
          return node;
        }
        return { ...node, children };
      }
      if (node.children) {
        return { ...node, children: this.updateTreeData(node.children, key, children) };
      }
      return node;
    });
  }

  /**
   * 组织数据tab切换
   * @param tab 
   */
  changeTab = (tab: number | string) => {
    this.inputRef.state.value = '';
    this.setState({
      currentTab: tab,
      inputValue: '',
      defaultExpandedKeys: []
    }, () => {
      this.getTreeDataFun();
    })
  }

  render() {
    const { isShowselect = false, treeHeight } = this.props;
    const { selectedKeys, treeData, defaultExpandedKeys, loading } = this.state;

    return (
      <div className={styles.treeWrapper}>
        <div className={[styles.treeContainer, isShowselect ? styles.showArrow : null].join(' ')}>
          <div className={styles['search-input']}>
            {
              isShowselect && <Select
                defaultValue={3}
                style={{ width: 120 }}
                className={styles.select}
                onChange={this.handleChange}
              >
                <Option value={3}>监控对象</Option>
                <Option value={7}>作业对象</Option>
              </Select>
            }
            <Input
              ref={elem => this.inputRef = elem}
              placeholder="请输入关键字"
              value={this.state.inputValue}
              allowClear
              maxLength={30}
              onChange={(e) => {
                const trimValue = e.target.value.trim()
                this.setState({
                  inputValue: trimValue
                })
                this.serarchTree(trimValue)
              }}
            />
          </div>
          {treeData.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
          <Tree
            checkable={false}
            className={styles.treeBox}
            showIcon
            height={treeHeight}
            treeData={treeData}
            defaultExpandedKeys={defaultExpandedKeys}
            loadData={this.onLoadData.bind(this)}
            selectedKeys={selectedKeys}
            key={`${defaultExpandedKeys.length}_${treeData.length}`}
            onSelect={this.onTreeSelect}
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
        <div className={styles.treeStatus}>
          <div className={styles.statusTab} onClick={() => this.changeTab('')}>全部</div>
          <div className={`${styles.statusTab} ${styles.statusColorOnline}`} onClick={() => this.changeTab(1)}>在线</div>
          <div className={`${styles.statusTab}  ${styles.statusColorOffLine}`} onClick={() => this.changeTab(2)}>离线</div>
        </div>
      </div>
    );
  }
}

export default connect(
  (state: AllState) => ({
    globalSocket: state.root.globalSocket,
    subscribeMonitorIds: state.workMonitoring.subscribeMonitorIds,
  }),
  dispatch => ({
    changeTopChangeStatus: (payload: boolean) => {
      dispatch({ type: 'workMonitoring/changeTopChangeStatusEvery', payload });
    },
    changeMonitorStatusMap: (payload: boolean) => {
      dispatch({ type: 'workMonitoring/changeMonitorStatusMapEvery', payload });
    },
    changeisVideo: (payload: boolean) => {
      dispatch({ type: 'workPlayTrack/refreshData', payload });
    },
  })
)(Index)
import React, { Component, Fragment } from 'react';
import { Button, Spin, Tabs } from 'antd';
import styles from './index.module.less';
import Popconfirm from '@/common/popconfirm';
import DetailMap from '@/common/map/detail'
import { getWorkObjectDetail } from '@/server/workObject';
// import { getOperatingState } from '../../func';
import { DetailDrawer, OperatorContainer } from '@/common';
import PathAddDrawer from './add';
import moment from 'moment';
import AlarmSetting from '../../../alarmSetting';
const { TabPane } = Tabs;

interface IProps {
  visible: boolean;
  closeDrawer: Function;
  rowId: string;
  delOrg: Function; //删除组织
  reload: () => void; //刷新列表
  refreshOrgtTree: () => void; //刷新组织树
  hasPermission: Function; //用户操作权限
  rootId: string; //根节点id
}

interface IState {
  // dataSource: IDetail;
  dataSource: any;
  pName: string;
  rowId: string;
  addVisible: boolean | undefined;
  loading: boolean;
  lngLat: [number, number][];
  sectionLongLat: [number, number][]; //标段围栏信息
}

interface IItem {
  name: string;
  key: string;
  render?: Function;
}
const detials: IItem[] = [
  {
    name: '作业线路名称',
    key: 'workName',
  },
  {
    name: '主管单位',
    key: 'orgName',
  },
  {
    name: '负责企业',
    key: 'enterpriseName',
  },
  {
    name: '所属标段',
    key: 'sectionName',
  },
  {
    name: '宽度(m)',
    key: 'roadWidth',
  },
  {
    name: '长度(m)',
    key: 'roadLength',
  },
  {
    name: '管理组长',
    key: 'groupLeader',
  },
  {
    name: '作业模式',
    key: 'workModeList',
    render: (value: any) => {
      switch (value) {
        case 1:
          return '作业道路';
        case 2:
          return '作业区域';
        case 3:
          return '清运区域';
        default:
          break;
      }
    },
  },
  {
    name: '负责人',
    key: 'contactName',
  },
  {
    name: '负责人电话',
    key: 'contactPhone',
  },
  {
    name: '备注',
    key: 'remark',
  },
  {
    name: '审核意见',
    key: 'reviewOpinion',
  },
];

class PathDetailDrawer extends Component<IProps, IState> {
  // static defaultProps = {
  //     showUpdateDrawer: null
  // }

  constructor(props: IProps) {
    super(props);
    this.state = {
      dataSource: {},
      pName: '',
      rowId: this.props.rowId,
      addVisible: undefined,
      loading: true,
      lngLat: [],
      sectionLongLat: [],
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { rowId, visible } = nextProps;

    if (visible && rowId) {
      this.setState({
        loading: true,
      });
      this.getWorkObjectDetail(rowId);
    }
  }

  componentDidMount() {
    const { rowId, visible } = this.props;

    if (visible && rowId) {
      this.getWorkObjectDetail(rowId);
    }
  }

  /**
   * 获取组织详情
   */
  getWorkObjectDetail = async (id: string) => {
    const data = await getWorkObjectDetail<any>(id);
    if (data) {
      this.setState({
        dataSource: data.curWorkObject,
        lngLat: data.curWorkObject.longLat,
        loading: false,
        sectionLongLat: JSON.parse(data.curWorkObject.sectionLongLat),
      });
    }
  };

  /**
   * 抽屉底部
   */
  drawFooter = () => {
    return (
      <div
        style={{
          textAlign: 'left',
        }}
      >
        <Button onClick={this.closeDrawer} style={{ marginLeft: 8 }}>
          取消
                </Button>
      </div>
    );
  };

  closeDrawer = () => {
    this.props.closeDrawer();
  };

  /**
   * 修改组织
   */
  showUpdateDrawer = () => {
    this.setState({
      addVisible: true,
    });
  };
  closeAddDrawer = () => {
    this.setState({
      addVisible: false,
    });
  };

  /**
   * 删除组织
   */
  delConfirm = () => {
    const { rowId, delOrg } = this.props;
    delOrg(rowId);
  };

  renderWorkModeList = (value: any[]) => {
    const formatData = (value: string) => {
      const res = value.split(',');
      return `${res[0]}趟，${res[1]}次`;
    };
    return (
      <Fragment key={Math.random()}>
        {value.map((item: any) => {
          return (
            <tr key={Math.random()}>
              <th className={styles['tit']}>{item.workModeName}</th>
              {item.unitType == 'peopleNum' ? (
                <td className={styles['body']}>{item.workNum}人</td>
              ) : (
                <td className={styles['body']}>{formatData(item.workNum)}</td>
              )}
            </tr>
          );
        })}
      </Fragment>
    );
  };

  renderStatus() {
    switch (this.state.dataSource.reviewStatus) {
      case 0:
        return '待审核';
      case 1:
        return '审核通过';
      default:
        return '审核未通过';
    }
  }

  render() {
    const { visible, rowId, reload, refreshOrgtTree, hasPermission, rootId } = this.props;

    const { dataSource, addVisible, loading } = this.state;
    const length = Object.keys(dataSource).length

    return (
      <DetailDrawer title="作业线路" width={1200} visible={visible} onClose={this.closeDrawer}>
        <div className={styles['detail-wrapper']}>
          <div className={styles['left-box']}>
            <Tabs defaultActiveKey="1" tabBarStyle={{ paddingLeft: '20px' }}>
              <TabPane forceRender={true} tab="基本信息" key="1" className={styles['tab-pane']} style={{ height: '100%' }}>
                <div
                  className={styles['con-box']}
                  style={{ height: 'calc(100vh - 300px)', overflowY: 'auto', padding: '24px', display: 'flex' }}
                >
                  <table className={styles['table']}>
                    <tbody>
                      {detials.map((item: IItem) => {
                        const value = dataSource[item.key];
                        if (value) {
                          if (item.key == 'workModeList') {
                            //作业模式列表
                            return this.renderWorkModeList(value);
                          }
                          return (
                            <tr key={Math.random()}>
                              <th className={styles['tit']}>{item.name}</th>
                              <td className={styles['body']}>{item.render ? item.render(value) : value}</td>
                            </tr>
                          );
                        } else {
                          return (
                            <tr key={Math.random()}>
                              <th className={styles['tit']}>{item.name}</th>
                              <td className={styles['body']}>--</td>
                            </tr>
                          );
                        }
                      })}
                    </tbody>
                  </table>
                  <DetailMap
                    pathStr={this.state.lngLat}
                    fences={this.state.sectionLongLat}
                    type='polyline'
                  />
                </div>
              </TabPane>
              <TabPane forceRender={true} tab="报警设置" key="2" className={styles['tab-pane']} style={{ height: '100%' }}>
                <AlarmSetting
                  detailModeList={length == 0 ? [] : dataSource.workModeList}
                  workAlarmParameterSettingResps={length == 0 ? [] : dataSource.workAlarmParameterSettingResps}
                  type={2}
                />
              </TabPane>
            </Tabs>
          </div>

          <OperatorContainer>
            <p>
              主管单位
                            <br />
              {this.state.dataSource.orgName}
            </p>
            <p>
              审核状态
                            <br />
              {this.renderStatus()}
            </p>
            <p>
              最后修改时间
                            <br />
              {moment(this.state.dataSource.updateDataTime).format('YYYY-MM-DD HH:mm')}
            </p>
            <p>
              最后审核时间
                            <br />
              {this.state.dataSource.reviewTime}
            </p>
            <Button block onClick={this.showUpdateDrawer} disabled={!hasPermission('修改')}>
              修改线路
                        </Button>
            {rootId != rowId && hasPermission('删除') ? (
              <Popconfirm title="删除后无法找回！确认是否删除记录？" onConfirm={this.delConfirm} cancelText="取消" okText="确定">
                <Button block>删除线路</Button>
              </Popconfirm>
            ) : (
              <Button block disabled>
                删除线路
              </Button>
            )}
          </OperatorContainer>

          {/* 加载框 */}
          {loading && <Spin spinning className={styles['loading']} />}
        </div>

        {/* 修改路线抽屉 */}
        {addVisible !== undefined && (
          <PathAddDrawer
            visible={addVisible}
            type={1}
            rowId={rowId}
            closeDrawer={this.closeAddDrawer}
            closeDetailDrawer={this.closeDrawer}
            reload={reload}
            refreshOrgtTree={refreshOrgtTree}
            getContainer="body"
          />
        )}
      </DetailDrawer>
    );
  }
}
export default PathDetailDrawer;

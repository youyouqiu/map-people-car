import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Spin, Button, Radio, message, Dropdown, Menu } from 'antd';

import {
  getVehicleList, cancelVehicleBind,
  batchCancelMonitorBind, deleteVehicle,
  batchDeleteVehicle,
} from '@/server/monitorManager';
import { downloadFile, getSelectContainer } from '@/framework/utils/function';
import { Switch } from 'antd';
import { Badge } from 'antd';
import { GroupTree, Table, Popconfirm } from '@/common/';
import { getCurrentUserPermission } from '@/framework/utils/function';

import VehicleBind from "./bind/vehicleBind";
import DetailDrawer from './drawer/detail';// 车辆详情
import AddAndEditDrawer from './drawer/addAndEdit';// 新增修改车辆信息
import EditBindDrawer from './drawer/editBindDrawer';// 修改绑定信息
import ImportModal from './importModal';

import styles from '../index.module.less';
import { DownOutlined } from '@ant-design/icons';
import { getStore } from '@/framework/utils/localStorage';
import { getNowTime } from '@/framework/utils/utils';

interface IProps {
  intl: { messages: object };
  form: {
    getFieldDecorator: Function;
    getFieldsValue: Function;
  };
  getBindData: Function;
  getVehicleTypeData: Function;
  groupTreeData: Array<object>;
  getGroupTreeData: Function;
}

interface IState {
  bindStatus: boolean;
  columns: Array<any>;
  currentClickMonitor: null | object;
  queryArgs: {
    orgIds: Array<string>;
    orderField: string;
    bindingType: null | number;
  };
  addAndedit: false | 'add' | 'edit' | undefined;
  detailVisible: boolean | undefined | 'synthesisSet';
  editBindInfo: boolean | undefined;
  importVisible: boolean;
  selectRow: Array<Record<string, any>>;
  tableCheckArr: Array<string>;
  recordTotal: number;
  spinning: boolean;
  currentSelectOrg: string;
  batchDropVisible: boolean,
}

/**
 * 当前页面权限
 */
const permission = getCurrentUserPermission('4_vehicle_list');
class VehicleContent extends Component<IProps, IState, any> {
  // table显示列
  defColumns = [
    {
      title: '操作',
      dataIndex: null,
      width: 260,
      align: 'center',
      fixed: true,
      render: (text: any, record: { bindingType: number; id: string }) => {
        const { id, bindingType } = record;
        return (
          <div className='handleBtns'>
            <Button disabled={!this.hasPermission('修改')} type="link" onClick={(e) => {
              e.stopPropagation();
              this.setState({
                addAndedit: 'edit',
                detailVisible: false,
                currentClickMonitor: record
              })
            }}>
              修改
                        </Button>|
            <Button disabled={!this.hasPermission('绑定') || bindingType !== 1} type="link" onClick={(e) => {
              e.stopPropagation();
              this.setState({
                editBindInfo: true,
                detailVisible: false,
                currentClickMonitor: record
              })
            }}>修改绑定</Button>|
            {
              this.hasPermission('删除') ?
                <Popconfirm
                  title='删除后无法恢复,确认是否继续？'
                  onConfirm={() => { this.deleteVehicleFun(id) }}
                  okText="确定"
                  cancelText="取消">
                  <Button type="link" onClick={(e) => { e.stopPropagation() }}>删除</Button>
                </Popconfirm>
                : <Button disabled type="link" onClick={(e) => { e.stopPropagation() }}>删除</Button>
            }|
            <Button disabled={!this.hasPermission('综合设置') || bindingType !== 1} type="link" onClick={(e) => {
              e.stopPropagation();
              this.setState({
                currentClickMonitor: record,
                detailVisible: 'synthesisSet',
              })
            }}>综合设置</Button>
          </div >
        )
      },
    },
    {
      title: '车牌号',
      dataIndex: 'number',
      align: 'center',
      width: 200,
    },
    {
      title: '别名',
      dataIndex: 'aliases',
      align: 'center',
      width: 100,
    },
    {
      title: '车辆类型',
      dataIndex: 'vehicleType',
      width: 200,
      align: 'center',
    },
    {
      title: '所属企业',
      dataIndex: 'orgName',
      width: 200,
      align: 'center',
    },
    {
      title: '车辆状态',
      dataIndex: 'isStart',
      width: 100,
      filterMultiple: false,
      filter: {
        type: false,
        domData: [
          { value: null, label: '全部' },
          { value: 1, label: '启用' },
          { value: 0, label: '停用' },
        ]
      },
      render: (value: boolean) => {
        if (value) {
          return (
            <Badge color='green' text='启用' />
          );
        }
        return (
          <Badge color='red' text='停用' />
        );
      },
    },
    {
      title: '绑定状态',
      dataIndex: 'bindingType',
      width: 100,
      align: 'center',
      filterMultiple: false,
      filter: {
        type: false,
        domData: [
          { value: null, label: '全部' },
          { value: 1, label: '已绑定' },
          { value: 0, label: '未绑定' },
        ]
      },
      render: (value: boolean) => {
        if (value) {
          return (
            <Badge color='green' text='已绑定' />
          );
        }
        return (
          <Badge color='red' text='未绑定' />
        );
      },
    },
    {
      title: '终端设置',
      dataIndex: 'terminalSetting',
      width: 100,
      filterMultiple: false,
      filter: {
        type: false,
        domData: [
          { value: null, label: '全部' },
          { value: 1, label: '已设置' },
          { value: 0, label: '未设置' },
        ]
      },
      render: (value: boolean) => {
        if (value) {
          return (
            <Badge color='green' text='已设置' />
          );
        }
        return (
          <Badge color='red' text='未设置' />
        );
      },
    },
    {
      title: '传感器设置',
      dataIndex: 'sensorSetting',
      width: 120,
      filterMultiple: false,
      filter: {
        type: false,
        domData: [
          { value: null, label: '全部' },
          { value: 1, label: '已设置' },
          { value: 0, label: '未设置' },
        ]
      },
      render: (value: boolean) => {
        if (value) {
          return (
            <Badge color='green' text='已设置' />
          );
        }
        return (
          <Badge color='red' text='未设置' />
        );
      },
    },
    {
      title: '音视频设置',
      dataIndex: 'audioVideoSetting',
      width: 120,
      filterMultiple: false,
      filter: {
        type: false,
        domData: [
          { value: null, label: '全部' },
          { value: 1, label: '已设置' },
          { value: 0, label: '未设置' },
        ]
      },
      render: (value: boolean) => {
        if (value) {
          return (
            <Badge color='green' text='已设置' />
          );
        }
        return (
          <Badge color='red' text='未设置' />
        );
      },
    },
    {
      title: '报警设置',
      dataIndex: 'alarmSetting',
      width: 100,
      filterMultiple: false,
      filter: {
        type: false,
        domData: [
          { value: null, label: '全部' },
          { value: 1, label: '已设置' },
          { value: 0, label: '未设置' },
        ]
      },
      render: (value: boolean) => {
        if (value) {
          return (
            <Badge color='green' text='已设置' />
          );
        }
        return (
          <Badge color='red' text='未设置' />
        );
      },
    },
    {
      title: '终端号',
      dataIndex: 'deviceNumber',
      width: 200,
      align: 'center',
    },
    {
      title: '终端手机号',
      dataIndex: 'simCardNumber',
      width: 200,
      align: 'center',
    },
    {
      title: '通讯类型',
      dataIndex: 'deviceTypeStr',
      width: 220,
      align: 'center',
    },
    {
      title: '创建日期',
      dataIndex: 'createDataTime',
      width: 100,
      align: 'center',
      sorterKey: 'id',
      render: (value: string) => {
        if (value) {
          return value.substring(0, 10);
        }
        return '-';
      }
    },
    {
      title: '修改人',
      dataIndex: 'updateDataUsername',
      width: 100,
      align: 'center',
      render: (value: string) => {
        return value || '-';
      }
    },
  ];

  tableRef: any = React.createRef();
  constructor(props: IProps) {
    super(props);
    const { getVehicleTypeData, getBindData, getGroupTreeData } = this.props;
    getVehicleTypeData();// 获取车辆类型下拉框数据
    getBindData();// 获取绑定模块的未绑定数据信息
    getGroupTreeData();// 获取组织树数据

    this.state = {
      bindStatus: true,// 控制车辆绑定模块的显示隐藏(true:显示;false:隐藏)
      columns: this.defColumns,// 表格显示列
      currentClickMonitor: null,// 当前点击的表格行信息
      addAndedit: undefined,// 新增('add')、修改('edit')基本信息共用抽屉
      detailVisible: undefined,// 详情抽屉
      editBindInfo: undefined,// 修改绑定信息抽屉显示控制
      importVisible: false,// 导入弹窗显示隐藏
      selectRow: [],// 表格勾选项详细信息
      tableCheckArr: [],// 表格勾选项key值
      queryArgs: {// 列表查询参数
        orgIds: [],
        orderField: 'id',
        bindingType: null
      },
      currentSelectOrg: '',// 左侧组织树勾选的企业节点id
      recordTotal: 0,// 列表总记录数
      spinning: false,// 导出loading状态
      batchDropVisible: false,// 批量操作下拉菜单显示
    };

  }

  /**
   * 判断按钮权限
   * @param title 按钮名称
   */
  hasPermission = (title: string) => {
    return permission.indexOf(title) !== -1;
  }

  /**
   * 绑定模块显示隐藏
   */
  switchChange = (checked: boolean) => {
    this.setState({
      bindStatus: checked
    })
  }

  /**
   * 抽屉显示控制
   */
  changeDrawer = (param: object) => {
    this.setState(param);
  }

  /**
   * 删除车辆
   * @param id 车辆id
   */
  deleteVehicleFun = async (id: string) => {
    const result = await deleteVehicle<boolean>(id);
    if (result) {
      message.success('删除成功');
      const { getBindData } = this.props;
      getBindData();// 更新未绑定车辆数据
      this.tableRef.current.reload();
    }
  }

  /**
   * 车辆解绑
   */
  cancelVehicleBindFun = async (monitorId: string) => {
    const result = await cancelVehicleBind<boolean>(monitorId);
    if (result) {
      message.success('解绑成功');
      const { getBindData } = this.props;
      getBindData();// 更新未绑定车辆数据
      this.tableRef.current.reload();
    }
  }

  /**
   * 车辆批量解绑
   */
  batchCancelMonitorBindFun = async (bindArr: Array<{ id: number }>) => {
    const paramArr: Array<number> = [];
    bindArr.map(item => {
      paramArr.push(item.id);
    })
    const result = await batchCancelMonitorBind<number>(paramArr);
    this.setState({
      selectRow: [],
      tableCheckArr: []
    })
    if (result) {
      message.success(`批量解绑成功,已解绑${result}条数据!`);
      const { getBindData } = this.props;
      getBindData();// 更新未绑定车辆数据
      this.tableRef.current.reload();
    } else if (result !== undefined) {
      message.error(`批量解绑失败`);
    }
    this.changeDropDownVisible(false);
  }

  /**
   * 车辆批量删除
   */
  batchDeleteVehicleFun = async () => {
    const { tableCheckArr } = this.state;
    const result = await batchDeleteVehicle<number>(tableCheckArr);
    this.setState({
      tableCheckArr: []
    })
    if (result) {
      message.success(`批量删除成功，已删除${result}条记录!`);
      const { getBindData } = this.props;
      getBindData();// 更新未绑定车辆数据
      this.tableRef.current.reload();
    } else if (result !== undefined) {
      message.error(`批量删除失败`);
    }
    this.changeDropDownVisible(false);
  }

  /**
   * 表格行点击
   */
  tableRowClick = (record: object, e: Event) => {
    e.stopPropagation();
    this.setState({
      currentClickMonitor: record,
      detailVisible: true
    })
  }

  /**
   * 组织树节点点击
   */
  treeClick = (node: { id: string; pId: string; type: string }, e: object, result: { orgIds: Array<string> }) => {
    const { queryArgs } = this.state;
    const newArg = { ...queryArgs };
    newArg.orgIds = result.orgIds;
    let orgId = '';
    if (node.type === 'enterprise') {
      orgId = node.id;
    }
    this.setState({
      queryArgs: newArg,
      currentSelectOrg: orgId
    });
  }

  /**
   * 表格勾选变化
   */
  tableRowChange = (rowIdArr: Array<string>, selectRow: Array<object>) => {
    this.setState({
      selectRow,
      tableCheckArr: rowIdArr
    })
  }

  /**
   * 导出车辆列表
   */
  exportVehicleListFun = async () => {
    const { recordTotal } = this.state;
    if (recordTotal > 10000) {
      message.error('导出失败,单次最多导出10000行!');
      return;
    }
    this.setState({
      spinning: true
    })
    const queryArgs = this.tableRef.current.getQueryArgs;
    const nowTime = getNowTime();
    const fileName = `HW1-1 车辆导出${nowTime}`;
    downloadFile('/api/mb/monitoring-vehicle/export/vehicle', 'POST', `${fileName}.xls`, queryArgs, () => { this.setState({ spinning: false }) });
  }

  /**
   * 切换批量操作下拉菜单显示状态
   */
  changeDropDownVisible = (status: boolean) => {
    this.setState({
      batchDropVisible: status
    })
  }

  /**
   * 批量操作下拉菜单
   */
  getBatchDropdown = () => {
    const { tableCheckArr, selectRow, batchDropVisible } = this.state;

    let popTitle = '请勾选可以解绑的行！';
    let deletePop = '请勾选需要删除的行！';
    if (tableCheckArr.length > 0) {
      deletePop = '删除后无法恢复，确认是否继续删除？';
    }
    const bindArr: any = [];
    selectRow.map((item: any) => {
      if (item.bindingType === 1) {
        bindArr.push(item)
      }
    })
    if (bindArr.length > 0) {
      popTitle = `解绑后车辆所有关联数据无法恢复，确认是否继续解绑${bindArr.length}条记录？`;
    }

    return <Dropdown trigger={['click']} disabled={!this.hasPermission('解绑') && !this.hasPermission('删除')} visible={batchDropVisible} onVisibleChange={this.changeDropDownVisible} overlay={
      <Menu id='vehicleMenuBox' key={`vehicleMenu${batchDropVisible}`}>
        <Menu.Item key="vehicleMenu1">
          {this.hasPermission('解绑')
            ? <Popconfirm
              title={popTitle}
              onConfirm={() => { this.batchCancelMonitorBindFun(bindArr) }}
              showOk={bindArr.length > 0}
              okText="确定"
              cancelText="取消"
              getPopupContainer={() => getSelectContainer('vehicleMenuBox')}
            >
              <div>批量解绑</div>
            </Popconfirm>
            : <div className={styles.disabledBtn}>批量解绑</div>
          }
        </Menu.Item>
        <Menu.Item key="vehicleMenu2">
          {this.hasPermission('删除')
            ? <Popconfirm
              title={deletePop}
              onConfirm={this.batchDeleteVehicleFun}
              showOk={tableCheckArr.length > 0}
              okText="确定"
              cancelText="取消"
              getPopupContainer={() => getSelectContainer('vehicleMenuBox')}
            >
              <div>批量删除</div>
            </Popconfirm>
            : <div className={styles.disabledBtn}>批量删除</div>
          }
        </Menu.Item>
      </Menu>
    }>
      <div className={styles.batchHandle}>批量操作 <DownOutlined /></div>
    </Dropdown>
  }

  render() {
    const { groupTreeData } = this.props;
    const {
      bindStatus, queryArgs, addAndedit,
      detailVisible, editBindInfo,
      columns, currentClickMonitor,
      tableCheckArr, importVisible,
      spinning, currentSelectOrg, recordTotal,
    } = this.state;

    return (
      <div className={styles.pannelContainer}>
        <div key='bindSwitch' className={styles.bindSwitch}>
          <FormattedMessage id="monitor_vehicleBind" />
          <Switch
            onChange={this.switchChange}
            checkedChildren={<FormattedMessage id="monitor_switchOn" />}
            unCheckedChildren={<FormattedMessage id="monitor_switchOff" />}
            defaultChecked
          />
        </div>
        <div key='bindBox' className={`${styles.bindBox}${bindStatus ? '' : ' ' + styles.bindFold}`}>
          <VehicleBind currentTable={this.tableRef as any} />
        </div>
        <div key='vehicleContentWrapper' className={styles.contentWrapper}>
          <div className={styles.tableContainer}>
            <Table
              key='vehicleTable'
              columns={columns}
              ref={this.tableRef}
              queryAjax={getVehicleList}
              queryArgs={queryArgs}
              queryCallback={(data, res) => {
                this.setState({
                  recordTotal: res.code === 200 ? parseInt(res.total) : 0,
                  tableCheckArr: []
                })
              }}
              showRow
              rowClick={this.tableRowClick}
              rowSelection={{
                onChange: this.tableRowChange,
                getCheckboxProps: (record: any) => ({
                  id: record.id,
                }),
                selectedRowKeys: tableCheckArr
              }}
              tree={<GroupTree key={groupTreeData.length} treeData={groupTreeData} treeNodeClick={this.treeClick} />}
              scroll={{ y: `calc(100vh - ${bindStatus ? 500 : 330}px)` }}
              btnGroup={[
                <Radio.Group value="large" key='vehicleRadio'>
                  <Radio.Button value="addVehicleBtn" disabled={!this.hasPermission('新增')}
                    onClick={() => { this.changeDrawer({ addAndedit: 'add', detailVisible: detailVisible !== undefined ? false : undefined }); }}
                  >新增</Radio.Button>
                  <Radio.Button value="import" disabled={!this.hasPermission('导入') || getStore('userName') === 'admin'} onClick={() => { this.setState({ importVisible: true }) }}>导入</Radio.Button>
                  <Radio.Button value="export" disabled={recordTotal === 0 || !this.hasPermission('导出')} onClick={this.exportVehicleListFun}>导出</Radio.Button>
                  <Radio.Button value="batchCancelBtn" className={styles.noPadding} disabled={!this.hasPermission('解绑') && !this.hasPermission('删除')}>
                    {this.getBatchDropdown()}
                  </Radio.Button>
                </Radio.Group>
              ]}
              showSettingQuery
              settingQueryStyle={{ width: 260 }}
              settingQuery={{
                key: 'keyword',
                placeholder: '请输入车牌号/终端号/终端手机号'
              }}
            />
          </div>
          {
            detailVisible !== undefined &&
            <DetailDrawer
              monitorInfo={currentClickMonitor}
              drawerVisible={{ addAndedit, editBindInfo, detailVisible }}
              currentTable={this.tableRef}
              changeDrawer={this.changeDrawer} />
          }
          {
            !detailVisible && addAndedit !== undefined &&
            <AddAndEditDrawer
              currentTable={this.tableRef}
              monitorInfo={currentClickMonitor}
              currentSelectOrg={currentSelectOrg}
              drawerVisible={{ addAndedit, detailVisible }}
              changeDrawer={this.changeDrawer} />
          }
          {
            !detailVisible && editBindInfo !== undefined &&
            <EditBindDrawer
              currentTable={this.tableRef}
              monitorInfo={currentClickMonitor}
              drawerVisible={{ editBindInfo, detailVisible }}
              changeDrawer={this.changeDrawer} />
          }
          {/* 导入数据 */}
          <ImportModal
            currentTable={this.tableRef}
            modalVisible={importVisible}
            changeVisible={this.changeDrawer}
          />
        </div >
        {spinning && <Spin tip="导出中..." className={styles.spinning} spinning={spinning} />}
      </div>
    );
  }
}

export default connect(
  (state: AllState) => ({
    groupTreeData: state.monitorMananger.groupTreeData,
  }),
  dispatch => ({
    getBindData: (payload: any) => {
      dispatch({ type: 'monitorMananger/getBindDataEvery', payload });
    },
    getVehicleTypeData: (payload: any) => {
      dispatch({ type: 'monitorMananger/getVehicleTypeDataEvery', payload });
    },
    getGroupTreeData: (payload: any) => {
      dispatch({ type: 'monitorMananger/getGroupTreeDataEvery', payload });
    },
  }),
)(injectIntl(VehicleContent as any));

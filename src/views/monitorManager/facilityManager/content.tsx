import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Spin, Button, Radio, message, Dropdown, Menu } from 'antd';

import {
  getFacilityList, LiftBind,
  deleteFacility, deleteFacilities
} from '@/server/monitorManager';
import { downloadFile, getSelectContainer } from '@/framework/utils/function';
import { Switch } from 'antd';
import { Badge } from 'antd';
import { GroupTree, Table, Popconfirm } from '@/common/';
import { getCurrentUserPermission } from '@/framework/utils/function';

import FacilityBind from "./bind/bind";
import DetailDrawer from './drawer/detail';// 人员详情
import AddAndEditDrawer from './drawer/addAndEdit';// 新增修改人员信息
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
  getFacilityTypeData: Function;
  getGroupTreeData: Function;
  groupTreeData: Array<object>;
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
  detailVisible: boolean | undefined;
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
const permission = getCurrentUserPermission('4_facility_list');
class Index extends Component<IProps, IState, any> {
  // table显示列
  defColumns = [
    {
      title: '操作',
      dataIndex: null,
      key: null,
      width: 200,
      align: 'center',
      fixed: true,
      render: (text: any, record: { bindingType: number; id: string }) => {
        const { id, bindingType } = record;
        let disabledFlag;

        if (this.hasPermission('修改')) {
          disabledFlag = bindingType == 1 ? false : true;
        } else {
          disabledFlag = true;
        }



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
            <Button disabled={disabledFlag} type="link" onClick={(e) => {
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
                  onConfirm={() => { this.deleteMonitorFun(id) }}
                  okText="确定"
                  cancelText="取消">
                  <Button type="link" onClick={(e) => { e.stopPropagation() }}>删除</Button>
                </Popconfirm>
                : <Button disabled type="link" onClick={(e) => { e.stopPropagation() }}>删除</Button>
            }
          </div >
        )
      },
    },
    {
      title: '设施编号',
      dataIndex: 'number',
      align: 'center',
      width: 200,
    },
    {
      title: '别名',
      dataIndex: 'alias',
      align: 'center',
      width: 100,
    },
    {
      title: '设施类型',
      dataIndex: 'facilityType',
      width: 200,
      align: 'center',
      // filter: {
      //     key: 'facilityTypeId',
      //     type:false,
      //     domData
      // }

    },
    {
      title: '所属企业',
      dataIndex: 'orgName',
      width: 200,
      align: 'center',
    },
    {
      title: '设施状态',
      dataIndex: 'status',
      width: 170,
      align: 'center',
      filterMultiple: false,
      filter: {
        key: 'bindingType',
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
          <Badge color='yellow' text='停用' />
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
        key: 'bindingType',
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
    const { getFacilityTypeData, getBindData, getGroupTreeData } = this.props;
    getFacilityTypeData();// 获取设施类型数据
    getBindData();// 获取绑定模块的未绑定数据信息
    getGroupTreeData();// 获取组织树数据

    this.state = {
      bindStatus: true,// 控制人员绑定模块的显示隐藏(true:显示;false:隐藏)
      columns: this.defColumns,// 表格显示列
      currentClickMonitor: null,// 当前点击的表格行信息
      addAndedit: undefined,// 新增('add')、修改('edit')基本信息共用抽屉
      detailVisible: undefined,// 详情抽屉
      editBindInfo: undefined,// 修改绑定信息抽屉显示控制
      importVisible: false,// 导入弹窗显示隐藏
      selectRow: [],// 表格勾选项详细信息
      tableCheckArr: [],// 表格勾选项
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
   * 删除设施
   * @param id 设施id
   */
  deleteMonitorFun = async (id: string) => {
    const result = await deleteFacility<boolean>(id);
    if (result) {
      message.success('删除成功');
      this.tableRef.current.reload();
    }
  }

  /**
   * 设施解绑
   */
  cancelFacilityBindFun = async (monitorId: string) => {
    const result = await LiftBind([monitorId]);
    if (result) {
      message.success('解绑成功');
      this.tableRef.current.reload();
    }
  }

  /**
   * 设施批量解绑
   */
  batchCancelFacilityBindFun = async (bindArr: Array<{ id: number }>) => {
    const paramArr: Array<number> = [];
    bindArr.map(item => {
      paramArr.push(item.id);
    });
    const result = await LiftBind(paramArr);
    this.setState({
      selectRow: [],
      tableCheckArr: []
    })
    if (result) {
      message.success(`批量解绑成功,已解绑${result}条数据!`);
      this.refreshData();
    } else if (result !== undefined) {
      message.error(`批量解绑失败`);
    }
    this.changeDropDownVisible(false);
  }

  /**
   * 设施批量删除
   */
  batchdDleteMonitorFun = async () => {
    const { tableCheckArr } = this.state;
    const result = await deleteFacilities<number>(tableCheckArr);
    this.setState({
      selectRow: [],
      tableCheckArr: []
    })
    if (result) {
      message.success(`批量删除成功，已删除${result}条记录!`);
      this.refreshData();
    } else if (result !== undefined) {
      message.error(`批量删除失败`);
    }
    this.changeDropDownVisible(false);
  }
  /**
   * 更新表格及未绑定信息数据
   */
  refreshData = () => {
    const { getBindData } = this.props;
    getBindData();
    this.tableRef.current.reload();
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
   * 导出列表
   */
  exportListFun = async () => {
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
    const fileName = `HW1-3 设施导出${nowTime}`;
    downloadFile('/api/sa/facility/export/list', 'POST', `${fileName}.xls`, queryArgs, () => { this.setState({ spinning: false }) });
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
    const { selectRow, tableCheckArr, batchDropVisible } = this.state;

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
      popTitle = `解绑后所有关联数据无法恢复，确认是否继续解绑${bindArr.length}条记录？`;
    }

    return <Dropdown trigger={['click']} disabled={!this.hasPermission('解绑') && !this.hasPermission('删除')} visible={batchDropVisible} onVisibleChange={this.changeDropDownVisible} overlay={
      <Menu id='facilityMenuBox' key={`menu${batchDropVisible}`}>
        <Menu.Item key="menu1">
          {this.hasPermission('解绑')
            ? <Popconfirm
              title={popTitle}
              onConfirm={() => { this.batchCancelFacilityBindFun(bindArr) }}
              showOk={bindArr.length > 0}
              okText="确定"
              cancelText="取消"
              getPopupContainer={() => getSelectContainer('facilityMenuBox')}
            >
              <div>批量解绑</div>
            </Popconfirm>
            : <div className={styles.disabledBtn}>批量解绑</div>
          }
        </Menu.Item>
        <Menu.Item key="menu2">
          {this.hasPermission('删除')
            ? <Popconfirm
              title={deletePop}
              onConfirm={this.batchdDleteMonitorFun}
              showOk={tableCheckArr.length > 0}
              okText="确定"
              cancelText="取消"
              getPopupContainer={() => getSelectContainer('facilityMenuBox')}
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
      spinning, recordTotal, currentSelectOrg
    } = this.state;

    return (
      <div className={styles.pannelContainer}>
        <div key='bindSwitch' className={styles.bindSwitch}>
          <FormattedMessage id="monitor_facilityBind" />
          <Switch
            onChange={this.switchChange}
            checkedChildren={<FormattedMessage id="monitor_switchOn" />}
            unCheckedChildren={<FormattedMessage id="monitor_switchOff" />}
            defaultChecked
          />
        </div>
        <div key='bindBox' className={`${styles.bindBox}${bindStatus ? '' : ' ' + styles.bindFold}`}>
          <FacilityBind currentTable={this.tableRef as any} />
        </div>
        <div key='facilityContentWrapper' className={styles.contentWrapper}>
          <div className={styles.tableContainer}>
            <Table
              key='facilityTable'
              columns={columns}
              ref={this.tableRef}
              queryAjax={getFacilityList}
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
                <Radio.Group value="large" key='facilityRadio'>
                  <Radio.Button value="addFacilityBtn" disabled={!this.hasPermission('新增')}
                    onClick={() => { this.changeDrawer({ addAndedit: 'add', detailVisible: detailVisible !== undefined ? false : undefined }); }}
                  >新增</Radio.Button>
                  <Radio.Button value="import" disabled={!this.hasPermission('导入') || getStore('userName') === 'admin'} onClick={() => { this.setState({ importVisible: true }) }}>导入</Radio.Button>
                  <Radio.Button value="export" disabled={recordTotal === 0 || !this.hasPermission('导出')} onClick={this.exportListFun}>导出</Radio.Button>
                  <Radio.Button value="batchCancelBtn" className={styles.noPadding} disabled={!this.hasPermission('解绑') && !this.hasPermission('删除')}>
                    {this.getBatchDropdown()}
                  </Radio.Button>
                </Radio.Group>
              ]}
              showSettingQuery
              settingQueryStyle={{ width: 280 }}
              settingQuery={{
                key: 'keyword',
                placeholder: '请输入设施编号/终端号/终端手机号'
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
    getFacilityTypeData: (payload: any) => {
      dispatch({ type: 'monitorMananger/getFacilityTypeDataEvery', payload });
    },
    getGroupTreeData: (payload: any) => {
      dispatch({ type: 'monitorMananger/getGroupTreeDataEvery', payload });
    },
  }),
)(injectIntl(Index as any));

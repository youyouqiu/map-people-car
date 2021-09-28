import React, { Component } from 'react';
import { Table, Popconfirm } from '@/common';
import { Button, message, Badge } from 'antd';
import { frezzeMode, frezzeModeBatch, unfrezzeMode, getModeList } from '@/server/dataDictionary';
import WorkShiftAddDrawer from './drawer/add';
import WorkShiftDetailDrawer from './drawer/detail'
import OrgTree, { IOrgTree } from '@/common/orgTree';
import { getCurrentUserPermission } from '@/framework/utils/function';
/**
 * 当前页面权限
 */
const permission = getCurrentUserPermission('4_work_mode');

interface IState {
  addVisible: boolean;
  orgList: [];
  type: number; //抽屉类型(0:新增，1:修改)
  selectedRowKeys: [];
  orgId: string; //当前选中节点id
  orgName: string; //当前选中节点name
  rootId: string; //组织树根节点
  queryArgs: { orgId?: string }; //组织管理列表请求参数
  detailVisible: boolean;
  rowId: string;
  curRow: any;
  refreshCount: number;
}

interface IRecord {
  id: string;
  selectedRowKeys?: [];
}
interface Iprops {
  id?: string;
}

class WorkMode extends Component<Iprops, IState> {
  tableRef: any = React.createRef();
  columns: any[] = [
    {
      title: '操作',
      key: 'opra',
      width: 180,
      render: (value: any, record: any) => {
        const { enableEdit, enabled } = record;
        return (
          <>
            <Button
              disabled={enableEdit}
              type="link"
              onClick={(event) => this.updateOrgClick(event, record)}
              className="table-link-btn"
            >
              修改
            </Button>
            |
            <Popconfirm
                key={record.id}
                title={enabled ? '确认是否冻结此行？' : '确认是否恢复此行？'}
                onConfirm={() => this.toggleEnableConfirm(record, !enabled)}
                cancelText={'取消'}
                okText="确定"
              >
              <Button className="table-link-btn" type="link" onClick={(event: React.MouseEvent) => {event.stopPropagation()}}>
                {' '}
                {enabled ? '冻结' : '恢复'}
              </Button>
            </Popconfirm>
          </>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      filter: {
        type: false,
        key: 'enabled',
        domData: [
          {
            value: true, label: '正常'
          },
          {
            value: false, label: '冻结'
          }
        ]
      },
      width: 100,
      render: (enabled: boolean) => {
        if (enabled) {
          return <Badge color="green" text="正常" />;
        } else {
          return <Badge color="red" text="冻结" />;
        }
      },
    },
    {
      title: '作业模式',
      dataIndex: 'modeName',
      width: 120,
      key: 'modeName',
    },
    {
      title: '作业类型',
      dataIndex: 'modeType',
      width: 100,
      key: 'modeType',
      render: (value: number) => {
        return [ "机器作业", "人工作业", "垃圾清运", "垃圾转运" ][value];
      },
    },
    {
      title: '关联车辆/岗位类型',
      width: 200,
      dataIndex: 'monitorCategoryStr',
      key: 'monitorCategoryStr',
    },
    {
      title: '备注',
      width: 200,
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '创建日期',
      width: 150,
      dataIndex: 'createDataTime',
      key: 'createDataTime',
      sorterKey: 'createDataTime',
    },
    {
      title: '最后修改时间',
      width: 150,
      dataIndex: 'updateDataTime',
      key: 'updateDataTime',
      sorterKey: 'updateDataTime',
    },
    {
      title: '修改人',
      width: 120,
      dataIndex: 'updateDataUsername',
      key: 'updateDataUsername',
    },
  ];

  constructor(props: any) {
    super(props);
    this.state = {
      addVisible: false,
      detailVisible: false,
      orgList: [],
      type: 0,
      selectedRowKeys: [],
      orgId: '',
      rootId: '',
      queryArgs: {},
      rowId: '',
      curRow: '',
      refreshCount: 0,
      orgName: '',
    };
  }

  /**
   * 判断按钮权限
   * @param title 按钮名称
   */
  hasPermission = (title: string) => {
    return permission.indexOf(title) !== -1;
  };

  /**
   * 新增
   */
  addFun() {
    this.setState({
      detailVisible: false,
      addVisible: true,
      type: 0,
    });
  }

  /**
   * table行点击
   */
  rowClickFun = (record: any, event: any) => {
    event.stopPropagation();
    this.setState({
      detailVisible: true,
      rowId: record.id,
      curRow: record,
    });
  };

  /**
   * 修改
   */
  updateOrgClick = (event: any, record: IRecord) => {
    event.stopPropagation();
    const id = record.id;
    this.setState({
      rowId: id,
      type: 1,
      detailVisible: false,
      addVisible: true,
      curRow: record,
    });
  };

  /**
   * 多选框改变
   */
  rowChange = (selectedRowKeys: []) => {
    this.setState({
      selectedRowKeys,
      detailVisible: false,
    });
  };

  /**
   * 获取当前选中组织树节点
   */
  getSelectTNode = (selectedNode: any) => {
    if (!selectedNode) {
      return;
    }
    // console.log(selectedNode);
    this.setState({
      orgId: selectedNode.id,
      orgName: selectedNode.name,
      queryArgs: {
        orgId: selectedNode.id,
      },
    });
  };

  /**
   * 关闭抽屉
   */
  closeAddDrawer = () => {
    this.setState({
      addVisible: false,
    });
  };
  closeDetailDrawer = () => {
    this.setState({
      detailVisible: false,
    });
  };
  /**
   * 显示修改抽屉
   */
  showUpdateDawer = () => {
    this.setState({
      type: 1,
      detailVisible: true,
    });
  };

  /**
   * 批量冻结
   */
  toggleEnableConfirmBatch = () => {
    this.toggleEnableBatch();
  };
  async toggleEnableBatch() {
    const { selectedRowKeys } = this.state;
    const datas = await frezzeModeBatch<{ suceessNum: number; failNum: number }>(selectedRowKeys);
    if (datas) {
      message.success(`批量冻结成功，已冻结${selectedRowKeys.length}条记录!`);
      this.setState({
        orgId: this.state.rootId,
        queryArgs: {
          orgId: this.state.rootId,
        },
        selectedRowKeys: [],
      });
    }
  }

  /**
   * 单个冻结、解冻确定
   */
  toggleEnableConfirm(record: IRecord, enabled: boolean) {
    this.toggleEnableOne(record.id, enabled);
  }

  /**
   * 冻结作业模式
   * @param id number
   */
  async toggleEnableOne(id: string, enabled: boolean) {
    let datas
    if(enabled){
      datas = await unfrezzeMode(id);
    }else{
      datas = await frezzeMode(id);
    }
    
    if (datas) {
      message.success(enabled ? '解冻成功' : '恢复成功');
      if (this.state.orgId == id + '') {
        if (this.state.detailVisible) {
          this.closeDetailDrawer();
        }
        this.setState({
          orgId: this.state.rootId,
          queryArgs: {
            orgId: this.state.rootId,
          },
        });
      } else {
        this.reload();
      }
      this.setState({
        selectedRowKeys: this.state.selectedRowKeys.filter((item) => item != id) as [],
      });
      this.refreshOrgtTree();
    }
  }

  /**
   * 详情抽屉删除组织
   */
  detailDel = (id: string) => {
    // this.checkIsDel(id);
    console.log('删除企业' + id);
  };

  /**
   * 批量删除
   */
  getDelPop = () => {
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length > 0) {
      return (
        <Popconfirm
          key={'record1'}
          title={`冻结后无法使用,确认是否冻结${selectedRowKeys.length}条记录？`}
          onConfirm={this.toggleEnableConfirmBatch}
          cancelText="取消"
          okText="确定"
          showOk={true}
        >
          <Button>批量冻结</Button>
        </Popconfirm>
      );
    } else {
      return (
        <Popconfirm key={'record2'} title="请勾选需要冻结的行！" cancelText="取消" showOk={false}>
          <Button>批量冻结</Button>
        </Popconfirm>
      );
    }
  };

  /**
   * 刷新列表
   */
  reload = () => (this.tableRef.current as any).reload();

  /**
   *刷新组织树
   */
  refreshOrgtTree = () => {
    this.setState({
      refreshCount: Math.random(),
    });
  };

  render() {
    const {
      addVisible,
      type,
      selectedRowKeys,
      queryArgs,
      detailVisible,
      orgId,
      rootId,
      rowId,
      refreshCount,
      orgName,
      curRow,
    } = this.state;

    return (
      <div style={{ height: '100%' }}>
        <Table
          ref={this.tableRef}
          columns={this.columns}
          showTree={false}
          rowSelection={{
            selectedRowKeys,
            onChange: this.rowChange,
            getCheckboxProps: (record: any) => ({
              disabled: record.id === rootId,
            }),
          }}
          tree={
            <OrgTree
              // placeHolder="请输入主管单位名称"
              refreshCount={refreshCount}
              treeNodeClick={this.getSelectTNode}
            />
          }
          btnGroup={[
            <Button
              key={Math.random()}
              // disabled={!this.hasPermission('新增')}
              type="primary"
              onClick={this.addFun.bind(this)}
            >
              新增
                        </Button>,
            this.getDelPop(),
          ]}
          queryAjax={getModeList}
          settingQuery={{
            key: 'keyword', //模糊查询参数
            placeholder: '请输入作业模式',
          }}
          pageCallback={() => this.setState({ selectedRowKeys: [] })}
          queryCallback={() => this.setState({ selectedRowKeys: [] })}
          settingQueryStyle={{ width: 270 }}
          queryArgs={queryArgs}
          rowClick={this.rowClickFun.bind(this)}
          scroll={{ y: 'calc(100vh - 340px)' }}
        />

        {/* 新增、修改 抽屉 */}
        {addVisible ? (
          <WorkShiftAddDrawer
            key={type == 1 ? rowId : Math.random()}
            visible={addVisible}
            type={type}
            closeDrawer={this.closeAddDrawer}
            orgId={orgId}
            orgName={orgName}
            rowId={rowId}
            reload={this.reload}
          />
        ): null}

        {detailVisible ? (
          <WorkShiftDetailDrawer
            curRow={curRow}
            visible={detailVisible}
            closeDrawer={this.closeDetailDrawer}
            rowId={rowId}
            reload={this.reload}
          />
        ): null}
      </div>
    );
  }
}

export default WorkMode;

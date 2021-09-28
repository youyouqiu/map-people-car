import React, { Component } from 'react';
import { Table, Popconfirm } from '@/common';
import { Button, message, Badge } from 'antd';
import { getWorkObjectList, deleteWorkObjectBatch, deleteWorkObject } from '@/server/workObject';
import PathAddDrawer from './drawer/add';
import PathDetailDrawer from './drawer/detail';
import LeftTree from '../../tree2';
import { getCurrentUserPermission } from '@/framework/utils/function';
import moment from 'moment';
/**
 * 当前页面权限
 */
const permission = getCurrentUserPermission('4_working_area_list');

interface IState {
  addVisible: boolean | undefined;
  orgList: [];
  type: number; //抽屉类型(0:新增，1:修改)
  selectedRowKeys: [];
  orgId: string; //当前选中节点id
  initOrgId: string; //默认的企业ID
  orgName: string; //当前选中节点name
  rootId: string; //组织树根节点
  queryArgs: { orgId?: string; workType: number; sectionId?: string }; //组织管理列表请求参数
  detailVisible: boolean | undefined;
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

class WorkPath extends Component<Iprops, IState> {
  tableRef: any = React.createRef();
  switchRef = React.createRef();
  columns: any[] = [
    {
      title: '操作',
      key: 'opra',
      width: 110,
      render: (value: any, record: any) => {
        return (
          <>
            <Button
              disabled={!this.hasPermission('修改')}
              type="link"
              onClick={(event) => this.updateWorkClick(event, record)}
              className="table-link-btn"
            >
              修改
                        </Button>
                        |
            {record.id != this.state.rootId && this.hasPermission('删除') ? (
              <>
                <Popconfirm
                  key={record.id}
                  title="删除后无法找回！确认是否删除？"
                  onConfirm={() => this.delConfirm(record)}
                  cancelText="取消"
                  okText="确定"
                >
                  <Button
                    className="table-link-btn"
                    type="link"
                    onClick={(event: React.MouseEvent) => {
                      event.stopPropagation();
                      this.setState({ detailVisible: false });
                    }}
                  >
                    {' '}
                                        删除
                                    </Button>
                </Popconfirm>
              </>
            ) : (
              <Button type="link" disabled className="table-link-btn">
                {' '}
                                删除
              </Button>
            )}
          </>
        );
      },
    },
    {
      title: '审核状态',
      dataIndex: 'reviewStatus',
      key: 'reviewStatus',
      width: 100,
      render: (value: number) => {
        switch (value) {
          case 0:
            return <Badge color="grey" text="待审核" />;
          case 1:
            return <Badge color="green" text="审核通过" />;
          default:
            return <Badge color="red" text="审核未通过" />;
        }
      },
    },
    {
      title: '作业区域名称',
      dataIndex: 'workName',
      width: 200,
      key: 'workName',
    },
    {
      title: '主管单位',
      dataIndex: 'orgName',
      width: 200,
      key: 'orgName',
    },
    {
      title: '负责企业',
      dataIndex: 'enterpriseName',
      key: 'enterpriseName',
      width: 200,
    },
    {
      title: '所属标段',
      width: 200,
      dataIndex: 'sectionName',
      key: 'sectionName',
    },
    {
      title: '管理组长',
      width: 150,
      dataIndex: 'groupLeader',
      key: 'groupLeader',
    },
    {
      title: '负责人',
      width: 120,
      dataIndex: 'contactName',
      key: 'contactName',
    },
    {
      title: '负责人电话',
      width: 120,
      dataIndex: 'contactPhone',
      key: 'contactPhone',
    },
    {
      title: '最后修改时间',
      width: 150,
      dataIndex: 'updateDataTime',
      key: 'updateDataTime',
      sorterKey: 'updateDataTime',
      render: (value: string) => {
        return moment(value).format('YYYY-MM-DD HH:mm');
      },
    },
    {
      title: '最后审核时间',
      width: 150,
      dataIndex: 'reviewTime',
      key: 'reviewTime',
      sorterKey: 'reviewTime',
      render: (value: string) => {
        return value ? moment(value).format('YYYY-MM-DD HH:mm') : '--';
      },
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
      addVisible: undefined,
      detailVisible: undefined,
      orgList: [],
      type: 0,
      selectedRowKeys: [],
      orgId: '',
      initOrgId: '',
      rootId: '',
      queryArgs: {
        workType: 2, //1 作业线路 2 作业区域  3清运区域
      },
      rowId: '',
      curRow: '',
      refreshCount: 0,
      orgName: '',
    };
  }

  componentDidMount() { }

  //审核按钮切换事件
  onCheckChange = (chexked: boolean, id: string) => {
    console.log(`切换值：${chexked}`);
    console.log(`切换id： ${id}`);
  };

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
  updateWorkClick = (event: any, record: IRecord) => {
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
    if (selectedNode && selectedNode.type == 'section') {
      this.setState({
        orgId: selectedNode.id,
        initOrgId: '',
        orgName: selectedNode.name,
        queryArgs: {
          workType: 2,
          sectionId: selectedNode.id,
        },
      });
    } else {
      this.setState({
        orgId: selectedNode.id,
        initOrgId: selectedNode.id,
        orgName: selectedNode.name,
        queryArgs: {
          workType: 2,
          orgId: selectedNode.id,
        },
      });
    }
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
   * 批量删除确定
   */
  delMoreConfirm = () => {
    this.delMore();
  };
  async delMore() {
    const { selectedRowKeys } = this.state;
    const params = selectedRowKeys;
    const datas = await deleteWorkObjectBatch<{ failNum: number; successNum: number }>(params);
    if (datas) {
      if (datas.successNum == 0) {
        message.success('删除失败,已删除0条数据！');
      } else {
        message.success(`删除成功, 已删除${datas}条数据`);
        this.setState(
          {
            orgId: this.state.rootId,
            // queryArgs: {
            //     workType: 2,
            //     orgId: this.state.rootId,
            // },
            selectedRowKeys: [],
          },
          () => {
            this.reload();
          }
        );
      }
    }
  }

  /**
   * 单个删除确定
   */
  delConfirm(record: IRecord) {
    this.delOne(record.id);
  }

  /**
   * 单个组织删除
   * @param id
   */
  async delOne(id: string) {
    const { selectedRowKeys } = this.state;
    const datas = await deleteWorkObject(id);
    if (datas) {
      message.success('删除成功');
      if (this.state.orgId == id) {
        if (this.state.detailVisible) {
          this.closeDetailDrawer();
        }
        this.setState({
          orgId: this.state.rootId,
          queryArgs: {
            workType: 2,
            orgId: this.state.rootId,
          },
        });
      } else {
        this.reload();
      }
      this.setState({
        selectedRowKeys: selectedRowKeys.filter((item) => item != id) as [],
      });
      this.refreshOrgtTree();
    }
  }

  /**
   * 详情抽屉删除组织
   */
  detailDel = (id: string) => {
    this.delOne(id);
  };

  /**
   * 批量删除
   */
  getDelPop = () => {
    const { selectedRowKeys } = this.state;

    if (!this.hasPermission('删除')) {
      return <Button disabled>批量删除</Button>;
    }

    if (selectedRowKeys.length > 0) {
      return (
        <Popconfirm
          key={'record1'}
          title={`删除后无法找回！确认是否删除${selectedRowKeys.length}条记录？`}
          onConfirm={this.delMoreConfirm}
          cancelText="取消"
          okText="确定"
          showOk={true}
        >
          <Button>批量删除</Button>
        </Popconfirm>
      );
    } else {
      return (
        <Popconfirm key={'record2'} title="请勾选需要删除的行！" cancelText="取消" showOk={false}>
          <Button>批量删除</Button>
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
    const { addVisible, type, selectedRowKeys, queryArgs, detailVisible, initOrgId, rootId, rowId, refreshCount, orgName } = this.state;

    return (
      <div style={{ height: '100%', padding: '15px', background: '#eee' }}>
        <Table
          ref={this.tableRef}
          columns={this.columns}
          rowSelection={{
            selectedRowKeys,
            onChange: this.rowChange,
            getCheckboxProps: (record: any) => ({
              disabled: record.id === rootId,
            }),
          }}
          tree={<LeftTree treeNodeClick={this.getSelectTNode} />}
          btnGroup={[
            <Button key={Math.random()} disabled={!this.hasPermission('新增')} type="primary" onClick={this.addFun.bind(this)}>
              新增
                        </Button>,
            this.getDelPop(),
          ]}
          queryAjax={getWorkObjectList}
          settingQuery={{
            key: 'keyword', //模糊查询参数
            placeholder: '请输入作业区域名称',
          }}
          pageCallback={() => this.setState({ selectedRowKeys: [] })}
          queryCallback={() => this.setState({ selectedRowKeys: [] })}
          settingQueryStyle={{ width: 270 }}
          queryArgs={queryArgs}
          rowClick={this.rowClickFun.bind(this)}
          scroll={{ y: 'calc(100vh - 255px)' }}
        />

        {/* 新增、修改 抽屉 */}
        {addVisible !== undefined && (
          <PathAddDrawer
            visible={addVisible}
            type={type}
            closeDrawer={this.closeAddDrawer}
            orgId={initOrgId}
            orgName={orgName}
            rowId={rowId}
            reload={this.reload}
            refreshOrgtTree={this.refreshOrgtTree}
          />
        )}

        {detailVisible !== undefined && (
          <PathDetailDrawer
            visible={detailVisible}
            closeDrawer={this.closeDetailDrawer}
            rowId={rowId}
            delOrg={this.detailDel}
            reload={this.reload}
            refreshOrgtTree={this.refreshOrgtTree}
            hasPermission={this.hasPermission}
            // hasPermission={() => true}
            rootId={rootId}
          />
        )}
      </div>
    );
  }
}

export default WorkPath;

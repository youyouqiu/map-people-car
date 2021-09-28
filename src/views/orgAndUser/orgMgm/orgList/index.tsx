import React, { Component } from 'react';
import { Table, Popconfirm } from '@/common';
import { Button, message } from 'antd';
import { getCurOrgList, delOrgMore, delOrg, checkDelOrg, getOrgTree } from '@/server/orgMgm';
import OrgAddDrawer from '../drawer/add';
import OrgDetailDrawer from '../drawer/detail';
import OrgTree, { IOrgTree } from '@/common/orgTree';
import { getCurrentUserPermission } from '@/framework/utils/function';
import ConcretTable from '@/common/table/index2';
/**
 * 当前页面权限
 */
const permission = getCurrentUserPermission('4_organization_list');

interface IState {
  addVisible: boolean | undefined;
  orgList: [];
  type: number;//抽屉类型(0:新增，1:修改，2:插入组织)
  selectedRowKeys: [];
  orgId: string;//当前选中节点id
  orgName: string;//当前选中节点name
  rootId: string;//组织树根节点
  queryArgs: { orgId?: string };//组织管理列表请求参数
  detailVisible: boolean | undefined;
  rowId: string;
  curRow: any;
  refreshCount: number;
  quantity: number;

}

class OrgList extends Component<any, IState, any>{
  tableRef = React.createRef<ConcretTable<any>>()
  columns: any[] = [
    {
      title: '操作',
      // dataIndex: 'opra',
      key: 'opra',
      width: 180,
      render: (value: any, record: any) => {
        return (
          <>
            <Button
              disabled={!this.hasPermission('修改')}
              type="link"
              onClick={(event) => this.updateOrgClick(event, record)}
              className='table-link-btn'
            >
              修改
                        </Button>|
            <Button
              disabled={!this.hasPermission('新增') || record.id == this.state.rootId}
              type="link"
              onClick={(event) => this.insertOrg(event, record)}
              className='table-link-btn'
            > 插入上级 </Button>|
            {
              (record.id != this.state.rootId && this.hasPermission('删除')) ?
                (
                  <>
                    <Popconfirm
                      title='删除后无法找回！确认是否删除？'
                      onConfirm={() => this.delConfirm(record)}
                      cancelText="取消"
                      okText="确定"
                    >
                      <Button
                        className='table-link-btn'
                        type="link"
                        onClick={(event: any) => {
                          event.stopPropagation();
                          this.setState({ detailVisible: false })
                        }}
                      > 删除</Button>
                    </Popconfirm>
                  </>
                )
                : (
                  <Button
                    type="link"
                    disabled
                    className='table-link-btn'
                  > 删除</Button>
                )
            }

          </>
        );
      },
    },
    {
      title: '组织名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '组织机构代码',
      dataIndex: 'organizationCode',
      key: 'organizationCode',
      width: 150,
    },
    {
      title: '上级组织',
      dataIndex: 'superiorOrg',
      key: 'superiorOrg',
      width: 200
    },
    {
      title: '联系人',
      dataIndex: 'contactName',
      key: 'contactName',
      width: 120
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120
    }, {
      title: '联系地址',
      dataIndex: 'address',
      key: 'address',
      width: 120
    },
    {
      title: '最后修改时间',
      dataIndex: 'updateDataTime',
      key: 'updateDataTime',
      width: 150,
      sorterKey: 'updateDataTime',
      render: (value: any, record: any) => {
        const time = value.substring(0, value.length - 3);
        return time;
      }
    },
    {
      title: '修改人',
      dataIndex: 'updateDataUsername',
      key: 'updateDataUsername',
      width: 120
    }
  ]

  constructor(props: any) {
    super(props);

    this.state = {
      addVisible: undefined,
      detailVisible: undefined,
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
      quantity: 0
    }
  }

  componentDidMount() {
    this.getGroupTree();
  }

  /**
  * 判断按钮权限
  * @param title 按钮名称
   */
  hasPermission = (title: string) => {
    return permission.indexOf(title) !== -1;
  }

  /**
   * 获取组织树根节点
   */
  getGroupTree = async () => {
    const result = await getOrgTree<IOrgTree[]>();
    if (result) {
      // for (let item of result) {
      //     if (item.pId == '-1') {
      // this.setState({
      //     rootId: item.id,
      //     orgId: item.id,
      //     orgName: item.name
      // })
      //     }
      // }
      const ids = result.map((item: any) => item.id);
      for (const item of result) {
        if (item.pId == '-1') {
          this.setState({
            rootId: item.id,
            orgId: item.id,
            orgName: item.name
          });
          break;
        }

        if (ids.indexOf(item.pId) == -1) {
          this.setState({
            rootId: item.id,
            orgId: item.id,
            orgName: item.name
          });
          break;
        }
      }
    }
  }

  /**
   * 新增
   */
  addFun() {
    this.setState({
      detailVisible: false,
      addVisible: true,
      type: 0
    });
  }

  /**
   * 插入组织
   */
  async insertOrg(event: any, record: any) {
    event.stopPropagation();
    this.setState({
      rowId: record.id,
      detailVisible: false,
      addVisible: true,
      type: 2
    });
  }

  /**
   * 修改
   */
  updateOrgClick = (event: any, record: any) => {
    event.stopPropagation();
    const id = record.id;
    this.setState({
      rowId: id,
      type: 1,
      detailVisible: false,
      addVisible: true,
      curRow: record
    });
  }

  /**
   * 多选框改变
   */
  rowChange = (selectedRowKeys: any) => {
    this.setState({
      selectedRowKeys,
      detailVisible: false,
    })
  }

  /**
   * 获取当前选中组织树节点
   */
  getSelectTNode = (selectedNode: any) => {
    if (!selectedNode) { return; }
    // console.log(selectedNode);
    this.setState({
      orgId: selectedNode.id,
      orgName: selectedNode.name,
      queryArgs: {
        orgId: selectedNode.id
      }
    })
  }

  /**
   * 关闭抽屉
   */
  closeAddDrawer = () => {
    this.setState({
      addVisible: false
    });
  }
  closeDetailDrawer = () => {
    this.setState({
      detailVisible: false
    });
  }
  /**
   * 显示修改抽屉
   */
  showUpdateDawer = () => {
    this.setState({
      type: 1,
      addVisible: true,
    })
  }

  /**
   * table行点击
   */
  rowClickFun(record: any) {
    this.setState({
      detailVisible: true,
      rowId: record.id,
      curRow: record
    })
  }

  /**
   * 批量删除确定
   */
  delMoreConfirm = () => {
    this.delMore();
  }
  async delMore() {
    const { selectedRowKeys } = this.state;
    const number = selectedRowKeys.length;
    const datas = await delOrgMore(selectedRowKeys);

    if (datas) {
      if (datas == 0) {
        message.success('删除失败,已删除0条数据！');
      } else {
        if (datas == number) {
          message.success(`批量删除成功，已删除${datas}条数据！`);
        } else {
          message.warning(`批量删除成功，已删除${datas}条数据，${selectedRowKeys.length - Number(datas)}条数据删除失败！`);
        }

        this.setState({
          orgId: this.state.rootId,
          queryArgs: {
            orgId: this.state.rootId
          },
          selectedRowKeys: []
        });
        this.reload();
        this.refreshOrgtTree();

      }
    }
  }

  /**
   * 单个删除确定
   */
  delConfirm(record: any) {
    this.checkIsDel(record.id);
  }

  /**
   * 单个组织删除
   * @param id 
   */
  async checkIsDel(id: string) {
    const params = {
      id: id
    }
    const datas = await checkDelOrg(params);
    if (datas) {
      this.delOne(id);
    }
  }
  async delOne(id: string) {
    const params = {
      id: id
    }
    const datas = await delOrg(params);
    if (datas) {
      message.success('删除成功');
      if (this.state.detailVisible) {
        this.closeDetailDrawer();
      }
      if (this.state.orgId == id) {
        this.setState({
          orgId: this.state.rootId,
          queryArgs: {
            orgId: this.state.rootId
          }
        })
      } else {
        this.reload();
      }
      this.refreshOrgtTree();
    }
  }

  /**
   * 详情抽屉删除组织
   */
  detailDel = (id: string) => {
    this.checkIsDel(id);
  }

  /**
   * 批量删除
   */
  getDelPop = () => {
    const {
      selectedRowKeys
    } = this.state;

    if (!this.hasPermission('删除')) {
      return <Button disabled>批量删除</Button>;
    }

    if (selectedRowKeys.length > 0) {
      return (
        <Popconfirm
          title={`删除后无法找回！确认是否删除${selectedRowKeys.length}条记录？`}
          onConfirm={this.delMoreConfirm}
          cancelText="取消"
          okText="确定"
          showOk={true}
        >
          <Button>批量删除</Button>
        </Popconfirm>
      )
    } else {
      return (
        <Popconfirm
          title='请勾选需要删除的行！'
          cancelText="取消"
          showOk={false}
        >
          <Button>批量删除</Button>
        </Popconfirm>
      )
    }
  }

  /**
   * 更新一条数据
   * 字段不一致
   */
  // updateDataOne = (updateRow: any) => {
  //     const { curRow } = this.state;
  //     console.log(updateRow);
  //     (this.tableRef.current as any).updateDataOne({ ...this.state.curRow, ...updateRow }, curRow.key);
  // }

  /**
   * 刷新列表
   */
  reload = () => (this.tableRef.current as any).reload()

  /**
   *刷新组织树
   */
  refreshOrgtTree = () => {
    const { quantity } = this.state;
    let number = quantity + 1
    this.setState({
      refreshCount: number,
      quantity: number
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
      orgName
    } = this.state;

    return (
      <div
        style={{ height: '100%' }}
      >
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
          tree={<OrgTree
            refreshCount={refreshCount}
            treeNodeClick={this.getSelectTNode} />}
          btnGroup={[
            <Button
              key="new"
              disabled={!this.hasPermission('新增')}
              type="primary"
              onClick={this.addFun.bind(this)}>新增</Button>,
            this.getDelPop()
          ]}
          queryAjax={getCurOrgList}
          settingQuery={{
            key: 'keyword',//模糊查询参数
            placeholder: '请输入组织名称'
          }}
          settingQueryStyle={{ width: 300 }}
          queryArgs={queryArgs}
          rowClick={this.rowClickFun.bind(this)}
          scroll={{ y: 'calc(100vh - 340px)' }}
          queryCallback={() => {
            this.setState({
              selectedRowKeys: []
            });
          }}
        />

        {/* 详情抽屉 */}
        {
          detailVisible !== undefined && <OrgDetailDrawer
            visible={detailVisible}
            closeDrawer={this.closeDetailDrawer}
            rowId={rowId}
            delOrg={this.detailDel}
            reload={this.reload}
            refreshOrgtTree={this.refreshOrgtTree}
            hasPermission={this.hasPermission}
            rootId={rootId}
          />
        }


        {/* 新增、修改、插入组织抽屉 */}
        {
          addVisible !== undefined && <OrgAddDrawer
            visible={addVisible}
            type={type}
            closeDrawer={this.closeAddDrawer}
            orgId={orgId}
            orgName={orgName}
            rowId={rowId}
            reload={this.reload}
            refreshOrgtTree={this.refreshOrgtTree}
          />
        }

      </div>
    )
  }
}

export default OrgList;
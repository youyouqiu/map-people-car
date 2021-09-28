import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AllState } from '@/model'
import { Table, Popconfirm } from '@/common'
import { Button, message, Badge } from 'antd'
import {
  getEnterpriseList,
  deleteEnterpriseBatch,
  deleteEnterprise,
  canDelete,
  modifyStatus,
  getTree,
  getOrgTree22,
} from '@/server/enterpriseAndContract'
import OrgAddDrawer from './drawer/add'
import OrgDetailDrawer from './drawer/detail'
import OrgTree, { IOrgTree } from '@/common/orgTree'
import { getCurrentUserPermission } from '@/framework/utils/function'
import WrapedPopComfirm from './wrapedPopConfirm'
import moment from 'moment'
/**
 * 当前页面权限
 */
const permission = getCurrentUserPermission('4_enterprise_list')

interface IState {
  addVisible: boolean | undefined
  orgList: []
  type: number //抽屉类型(0:新增，1:修改)
  selectedRowKeys: []
  orgId: string //当前选中节点id
  orgName: string //当前选中节点name
  rootId: string //组织树根节点
  queryArgs: { orgId?: string } //组织管理列表请求参数
  detailVisible: boolean | undefined
  rowId: string
  curRow: any
  refreshCount: number
}

interface IRecord {
  id: string
  selectedRowKeys?: []
}
interface Iprops {
  id?: string
  userType: number //用户类型0: 组织用户;1:企业用户
}

class EnterpriseList extends Component<Iprops, IState> {
  tableRef: any = React.createRef()
  findLatestTd = (node: any): any => {
    if (node.nodeName == 'TD') return node
    if (node.nodeName == 'HTML') return node
    return this.findLatestTd(node.parentNode)
  }
  columns: any[] = [
    {
      title: '操作',
      key: 'opra',
      width: 100,
      render: (value: any, record: any) => {
        return (
          <>
            <Button
              disabled={!this.hasPermission('修改')}
              type="link"
              onClick={(event) => this.updateOrgClick(event, record)}
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
                      event.stopPropagation()
                      this.setState({
                        detailVisible: false,
                      })
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
        )
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      filter: {
        type: false,
        key: 'status',
        domData: [
          {
            label: '全部',
            value: null,
          },
          {
            label: '启用',
            value: 1,
          },
          {
            label: '停用',
            value: 0,
          },
        ],
      },
      render: (value: number) => {
        if (value == 1) {
          /* 需要转发点击事件给table组件*/
          return (
            <span onClick={(e) => this.findLatestTd(e.target).click()}>
              <Badge color="green" text="在用" />
            </span>
          )
        }
        return (
          <span onClick={(e) => this.findLatestTd(e.target).click()}>
            <Badge color="red" text="停用" />
          </span>
        )
      },
    },
    {
      title: '企业名称',
      dataIndex: 'name',
      width: 200,
      key: 'name',
    },
    {
      title: '是否审核',
      dataIndex: 'auditStatus',
      width: 100,
      key: 'auditStatus',
      filter: {
        type: false,
        key: 'auditStatus',
        domData: [
          {
            label: '全部',
            value: null,
          },
          {
            label: '开',
            value: 1,
          },
          {
            label: '关',
            value: 0,
          },
        ],
      },
      render: (value: number, record: IRecord) => {
        return (
          <WrapedPopComfirm
            value={value}
            record={record}
            onCheckChange={this.onCheckChange}
          />
        )
      },
    },
    {
      title: '主管单位',
      dataIndex: 'orgName',
      key: 'orgName',
      width: 200,
    },
    {
      title: '组织机构代码',
      width: 150,
      dataIndex: 'organizationCode',
      key: 'organizationCode',
    },
    {
      title: '管理员账号',
      width: 120,
      dataIndex: 'enterpriseAdmin',
      key: 'enterpriseAdmin',
    },
    {
      title: '法人',
      width: 120,
      dataIndex: 'principal',
      key: 'principal',
    },
    {
      title: '联系人',
      width: 60,
      dataIndex: 'contactName',
      key: 'contactName',
    },
    {
      title: '联系电话',
      width: 120,
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '成立日期',
      width: 120,
      dataIndex: 'registerDate',
      key: 'registerDate',
      sorterKey: 'registerDate',
    },
    {
      title: '最后修改时间',
      width: 150,
      dataIndex: 'updateDataTime',
      key: 'updateDataTime',
      sorterKey: 'updateDataTime',
      render: (value: string) => {
        return moment(value).format('YYYY-MM-DD HH:mm')
      },
    },
    {
      title: '修改人',
      width: 120,
      dataIndex: 'updateDataUsername',
      key: 'updateDataUsername',
    },
  ]

  constructor(props: any) {
    super(props)
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
    }
  }

  componentDidMount() {
    // this.getGroupTree()
    // alert('用户类型' + this.props.userType)
  }

  //审核按钮切换事件
  onCheckChange = (chexked: boolean, id: string) => {
    if (chexked) {
      modifyStatus(id, 1)
    } else {
      modifyStatus(id, 0)
    }
  }

  /**
   * 判断按钮权限
   * @param title 按钮名称
   */
  hasPermission = (title: string) => {
    return permission.indexOf(title) !== -1
  }

  /**
   * 获取组织树根节点
   */
  getGroupTree = async () => {
    const result = await getTree<IOrgTree[]>()
    if (result) {
      const ids = result.map((item: any) => item.id)
      for (const item of result) {
        if (item.pId == '-1') {
          this.setState({
            rootId: item.id,
            orgId: item.id,
            orgName: item.name,
          })
          break
        }

        if (ids.indexOf(item.pId) == -1) {
          this.setState({
            rootId: item.id,
            orgId: item.id,
            orgName: item.name,
          })
          break
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
      type: 0,
    })
  }

  /**
   * table行点击
   */
  rowClickFun = (record: any, event: any) => {
    const targetName = event.target.nodeName.toUpperCase()
    event.stopPropagation()
    if (targetName == 'P' || targetName == 'BUTTON' || targetName == 'SPAN') return
    this.setState({
      detailVisible: true,
      rowId: record.id,
      curRow: record,
    })
  }

  /**
   * 修改
   */
  updateOrgClick = (event: any, record: IRecord) => {
    event.stopPropagation()
    const id = record.id
    this.setState({
      rowId: id,
      type: 1,
      detailVisible: false,
      addVisible: true,
      curRow: record,
    })
  }

  /**
   * 多选框改变
   */
  rowChange = (selectedRowKeys: []) => {
    this.setState({
      selectedRowKeys,
      detailVisible: false,
    })
  }

  /**
   * 获取当前选中组织树节点
   */
  getSelectTNode = (selectedNode: any) => {
    if (!selectedNode) {
      return
    }
    this.setState({
      orgId: selectedNode.id,
      orgName: selectedNode.name,
      queryArgs: {
        orgId: selectedNode.id,
      },
    })
  }

  /**
   * 关闭抽屉
   */
  closeAddDrawer = () => {
    this.setState({
      addVisible: false,
    })
  }
  closeDetailDrawer = () => {
    this.setState({
      detailVisible: false,
    })
  }
  /**
   * 显示修改抽屉
   */
  showUpdateDawer = () => {
    this.setState({
      type: 1,
      detailVisible: true,
    })
  }

  /**
   * 批量删除
   */
  deleteBatchConfirm = () => {
    this.deleteBatch()
  }
  async deleteBatch() {
    const { selectedRowKeys } = this.state
    const datas = await deleteEnterpriseBatch<{
      data: number
      code: number
    }>(selectedRowKeys)
    if (datas) {
      message.success(`删除成功, 已删除${datas}条数据, `)
      this.reload()
      this.setState({
        orgId: this.state.rootId,
        queryArgs: {
          orgId: this.state.rootId,
        },
        selectedRowKeys: [],
      })
    }
  }

  /**
   * 单个删除确定
   */
  delConfirm(record: IRecord) {
    this.checkIsDel(Number(record.id))
  }

  /**
   *
   * @param id number
   * 检测能否删除
   */

  async checkIsDel(id: number) {
    const datas = await canDelete(id)
    if (datas) {
      this.delOne(id)
    }
  }

  /**
   * 单个组织删除
   * @param id number
   */
  async delOne(id: number) {
    const { selectedRowKeys } = this.state
    const datas = await deleteEnterprise(id)
    if (datas) {
      message.success('删除成功')
      if (this.state.orgId == id + '') {
        if (this.state.detailVisible) {
          this.closeDetailDrawer()
        }
        this.setState({
          orgId: this.state.rootId,
          queryArgs: {
            orgId: this.state.rootId,
          },
        })
      } else {
        this.reload()
      }
      this.setState({
        selectedRowKeys: selectedRowKeys.filter((item) => item != id) as [],
      })
      this.refreshOrgtTree()
    }
  }

  /**
   * 详情抽屉删除组织
   */
  detailDel = async (id: number) => {
    const datas = await deleteEnterprise(id)
    if (datas) {
      this.closeDetailDrawer()
      this.reload()
    }
  }

  /**
   * 批量删除
   */
  getDelPop = () => {
    const { selectedRowKeys } = this.state

    if (!this.hasPermission('删除')) {
      return <Button disabled>批量删除</Button>
    }

    if (selectedRowKeys.length > 0) {
      return (
        <Popconfirm
          key={'record1'}
          title={`删除后无法找回！确认是否删除${selectedRowKeys.length}条记录？`}
          onConfirm={this.deleteBatchConfirm}
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
          key={'record2'}
          title="请勾选需要删除的行！"
          cancelText="取消"
          showOk={false}
        >
          <Button>批量删除</Button>
        </Popconfirm>
      )
    }
  }

  /**
   * 刷新列表
   */
  reload = () => (this.tableRef.current as any).reload()

  /**
   *刷新组织树
   */
  refreshOrgtTree = () => {
    this.setState({
      refreshCount: Math.random(),
    })
  }
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
    } = this.state
    return (
      <div style={{ height: 'calc(100% - 24px)' }}>
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
          tree={
            <OrgTree
              placeHolder={'请输入主管单位名称'}
              customizeTree={getOrgTree22}
              refreshCount={refreshCount}
              treeNodeClick={this.getSelectTNode}
            />
          }
          btnGroup={[
            <Button
              key={Math.random()}
              disabled={!this.hasPermission('新增')}
              type="primary"
              onClick={this.addFun.bind(this)}
            >
              新增
            </Button>,
            this.getDelPop(),
          ]}
          queryAjax={getEnterpriseList}
          settingQuery={{
            key: 'keyword', //模糊查询参数
            placeholder: '请输入企业名称',
          }}
          queryCallback={() => this.setState({ selectedRowKeys: [] })}
          pageCallback={() => {
            this.setState({
              selectedRowKeys: [],
            })
          }}
          settingQueryStyle={{ width: 270 }}
          queryArgs={queryArgs}
          rowClick={this.rowClickFun.bind(this)}
          scroll={{ y: 'calc(100vh - 340px)' }}
        />

        {/* 新增、修改 抽屉 */}
        {addVisible !== undefined && (
          <OrgAddDrawer
            key={type == 1 ? rowId : 'add'}
            visible={addVisible}
            type={type}
            closeDrawer={this.closeAddDrawer}
            orgId={orgId}
            orgName={orgName}
            rowId={rowId}
            reload={this.reload}
          />
        )}
        {detailVisible !== undefined && (
          <OrgDetailDrawer
            visible={detailVisible}
            closeDrawer={this.closeDetailDrawer}
            rowId={rowId}
            delOrg={this.detailDel}
            reload={this.reload}
            hasPermission={this.hasPermission}
            rootId={rootId}
          />
        )}
      </div>
    )
  }
}

export default connect((state: AllState) => ({
  userType: state.root.userMessage.userType,
}))(EnterpriseList)

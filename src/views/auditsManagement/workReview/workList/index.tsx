/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Component } from 'react';
import { Button, message, Badge } from 'antd'
import Table from '../component/table/index2';
import { getCurrentUserPermission } from '@/framework/utils/function';
// import { IAuditsInfo } from '../type';
import { getWorkList, sectionDetail, auditsDetailAll } from '@/server/auditsManagement';
import OrgTree from '../component/orgTree';
import AuditDrawer from '../drawer/auditDrawer';
import Popconfirm from '../component/popconfirm';
import AuditDetailDrawer from '../drawer/auditDetailDrawer'

/**
 * 当前页面权限
 */
const permission = getCurrentUserPermission("4_work_object_list");

interface IState {
  queryArgs: { sectionId?: string, orgId?: string; isActive?: number | null } | undefined;
  selectedRowKeys: string[];
  detailVisible: boolean;
  auditsVisible: boolean;
  sectionDetailList: any;
  workId: string;
  enterpriseId: string;
  selectedNode: { id: string | undefined, type: string | undefined };
}

class WorkList extends Component<any, IState, any> {
  tableRef: any = React.createRef()
  columns = [
    {
      title: '操作',
      key: 'opra',
      width: 100,
      render: (value: any, record: any) => {
        return (
          <Button
            disabled={record.reviewStatus !== 0}
            type="link"
            className='table-link-btn'
            onClick={(event) => this.audits(event, record)}

          >审核</Button>
        )
      }
    },
    {
      title: '审核状态',
      key: 'reviewStatus',
      dataIndex: 'reviewStatus',
      width: 100,
      render: (value: number) => {
        if (value == 0) {
          return (
            <Badge color='blue' text='待审核' />
          );
        } else if (value == 1) {
          return (
            <Badge status="success" text='审核通过' />
          );
        } else {
          return (
            <Badge color='red' text='审核未通过' />
          )
        }
      }
    },
    {
      title: '作业对象名称',
      key: 'workName',
      dataIndex: 'workName',
      width: 150
    },
    {
      title: '主管单位',
      key: 'orgName',
      dataIndex: 'orgName',
      width: 150
    },
    {
      title: '负责企业',
      key: 'enterpriseName',
      dataIndex: 'enterpriseName',
      width: 150
    },
    {
      title: '负责人',
      key: 'contactName',
      dataIndex: 'contactName',
      width: 120
    },
    {
      title: '负责人电话',
      key: 'contactPhone',
      dataIndex: 'contactPhone',
      width: 120
    },
    {
      title: '申请日期',
      key: 'updateDataTime',
      dataIndex: 'updateDataTime',
      sorterKey: 'updateDataTime',
      width: 120,
      render: (value: string) => {
        const timearr = value.replace(" ", ":").replace(/\:/g, "-").split("-");
        return `${timearr[0]}-${timearr[1]}-${timearr[2]}`
      }
    },
    {
      title: '最后审核时间',
      key: 'reviewTime',
      dataIndex: 'reviewTime',
      sorterKey: 'reviewTime',
      width: 150
    },
    {
      title: '审核人',
      key: 'reviewUser',
      dataIndex: 'reviewUser',
      width: 120
    }
  ]
  sectionDetailData = [
    {
      name: '标段名称',
      key: 'sectionName',
    },
    {
      name: '标段编号',
      key: 'sectionNo',

    },
    {
      name: '状态',
      key: 'status',

    },
    {
      name: '主管单位',
      key: 'orgName',

    },
    {
      name: '养护企业',
      key: 'enterpriseName',
    },
    {
      name: '项目负责人',
      key: 'leader',
    },
    {
      name: '负责人电话',
      key: 'leaderPhone',
    },
    {
      name: '应配小组长数',
      key: 'needGroupLeaders',
    },
    {
      name: '要求面积（㎡）',
      key: 'requiredArea',
    },
    {
      name: '绘制面积（㎡）',
      key: 'drawArea',
    },
    {
      name: '要求配置人数',
      key: 'requiredPerson',
    },
    {
      name: '要求配置车辆数',
      key: 'requiredVehicles',
    },
    {
      name: '备注',
      key: 'remark',
    },
    {
      name: '审核状态',
      key: 'pendingReviewNo',
      value: ''
    },
  ]
  constructor(props: any) {
    super(props)
    this.state = {
      auditsVisible: false,
      detailVisible: false,
      queryArgs: {},
      selectedRowKeys: [],
      sectionDetailList: [],
      workId: '',
      enterpriseId: '',
      selectedNode: { id: undefined, type: undefined }
    }
  }

  componentDidMount() {
    this.setState({
      sectionDetailList: this.sectionDetailData
    })
  }


  /**
  * 判断按钮权限
  * @param title 按钮名称
  */
  hasPermission = (title: string) => {
    return permission.indexOf(title) !== -1;
  }


  /**
   * 批量审核气泡框
   */
  getDelPop = () => {
    const {
      selectedRowKeys
    } = this.state;

    if (!this.hasPermission('审核')) {
      return <Button disabled key="userListDel">批量审核</Button>;
    }

    if (selectedRowKeys.length > 0) {
      return (
        <Popconfirm
          key="userListDel"
          title={`批量审核作业对象`}
          onConfirm={this.auditsAll.bind(this)}
          cancelText="取消"
          okText="确定"
          showOk={true}
        >
          <Button>批量审核</Button>
        </Popconfirm>
      )
    } else {
      return (
        <Popconfirm
          key="userListDel"
          title='请勾选需要删除的行！'
          cancelText="取消"
          showOk={false}
        >
          <Button>批量审核</Button>
        </Popconfirm>
      )
    }
  }

  /**
   * 批量审核
   */
  async auditsAll(e: any) {
    const { selectedRowKeys } = this.state;
    const param = {
      ids: selectedRowKeys,
      reviewStatus: Number(e.currentTarget.getAttribute('data-type'))
    }

    const response = await auditsDetailAll(param);
    if (response) {
      message.success('批量审核成功');
      this.setState({
        selectedRowKeys: []
      })
      this.reload();
    }
  }
  /**
   * 审核
   */
  audits = (event: any, record: any) => {
    event.stopPropagation();
    this.setState({
      auditsVisible: true,
      workId: record.id,
      enterpriseId: record.enterpriseId,
      detailVisible: false
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
   * table行点击
   */
  rowClickFun(record: any) {
    this.setState({
      detailVisible: true,
      workId: record.id,
      enterpriseId: record.enterpriseId
    });
  }

  /**
  * 刷新列表
  */
  reload = () => {
    const { selectedNode } = this.state;
    (this.tableRef.current as any).reload();
    if (selectedNode.id && selectedNode.type) {
      this.getSectionDetail(selectedNode.id, selectedNode.type);
    }
  }

  /**
  * 关闭抽屉
  */
  closeAddDrawer = () => {
    this.setState({
      auditsVisible: false
    });
  }

  closeDetailDrawer = () => {
    this.setState({
      detailVisible: false
    });
  }

  /**
   * 获取当前选中组织树节点
   */
  getSelectTNode = (selectedNode: any) => {
    if (!selectedNode) { return; }
    let queryArgs;

    this.getSectionDetail(selectedNode.id, selectedNode.type);

    if (selectedNode.type === 'organization') {
      queryArgs = {
        orgId: selectedNode.id
      }
    } else {
      queryArgs = {
        sectionId: selectedNode.id
      }
    }

    this.setState({
      queryArgs,
      selectedNode: {
        id: selectedNode.id,
        type: selectedNode.type
      }
    })
  }

  /**
   * 获取标段详情
   */
  async getSectionDetail(sectionId: string, sectionType: string) {
    if (sectionType === 'organization') {
      this.setState({
        sectionDetailList: this.sectionDetailData
      });
    } else {
      const response: any = await sectionDetail({ sectionId: sectionId });
      const newData: any = JSON.parse(JSON.stringify(this.sectionDetailData));
      if (response) {
        newData.map((item: any) => {
          Object.keys(response).forEach(function (key) {
            if (item.key === key) {
              item.value = response[key]

              if (item.key == 'status') {
                item.value = response[key] == 0 ? '停用' : '启用';
              }

              if (item.key == 'pendingReviewNo') {
                item.value = response[key] == 0 ? '已审核' : `新申请(${response[key]})`
              }
            }
          });
        });
      };

      this.setState({
        sectionDetailList: newData
      });
    };
  }


  render() {
    const {
      queryArgs,
      selectedRowKeys,
      sectionDetailList,
      auditsVisible,
      workId,
      enterpriseId,
      detailVisible,
    } = this.state;


    return (
      <div style={{ height: '100%' }}>
        <Table
          ref={this.tableRef}
          scroll={{ y: 'calc(100vh -  490px)' }}
          columns={this.columns}
          rowSelection={{
            selectedRowKeys,
            onChange: this.rowChange,
            getCheckboxProps: (record: any) => ({
              disabled: record.reviewStatus !== 0,
            }),
          }}
          tree={<OrgTree treeNodeClick={this.getSelectTNode} />}
          btnGroup={[
            this.getDelPop()
          ]}
          queryAjax={getWorkList}
          settingQuery={{
            key: 'keyword',//模糊查询参数
            placeholder: '请输入作业对象名称'
          }}
          settingQueryStyle={{ width: 270 }}
          queryArgs={queryArgs}
          rowClick={this.rowClickFun.bind(this)}
          queryCallback={() => {
            this.setState({
              selectedRowKeys: []
            });
          }}
          sectionDetail={sectionDetailList}
        />

        {/* 详情抽屉 */}
        {
          detailVisible && (
            <AuditDetailDrawer
              visible={detailVisible}
              closeDrawer={this.closeDetailDrawer}
              workId={workId}
              enterpriseId={enterpriseId}
              hasPermission={this.hasPermission}
            />
          )
        }

        {/* 审核,批量审核 */}
        {
          auditsVisible && (
            <AuditDrawer
              visible={auditsVisible}
              closeDrawer={this.closeAddDrawer}
              reload={this.reload}
              workId={workId}
              enterpriseId={enterpriseId}
            />
          )
        }
      </div>
    )
  }

}

export default WorkList;
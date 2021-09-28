import React, { Component } from 'react';
import { Table, Popconfirm } from '@/common';
import { Button, message, Badge } from 'antd';
import { enterpriseList, enterpriseDel, exterprisBatchDel, exterpriseCharacter } from '@/server/enterpriseUser';
import { IUserInfo, IRoles } from '../type';
import { getStore } from '@/framework/utils/localStorage';
import { showEmpty, getCurrentUserPermission } from '@/framework/utils/function';
import UserDetailDrawer from '../drawer/userDetail';
import UserAddDrawer from '../drawer/userAdd';
import { getUserMsg } from '@/server/user';
import GroupTree from '@/common/groupTree';
import { IUserDetails } from '@/views/home/type';
import ConcretTable from '@/common/table/index2';
/**
 * 当前页面权限
 */
const permission = getCurrentUserPermission('4_enterprise_user_list');

interface IState {
  orgList: IUserInfo[];
  type: number;//抽屉类型(0:新增，1:修改，2:插入组织)
  selectedRowKeys: string[];
  queryArgs: { orgId?: string; isActive?: number | null } | undefined;
  addVisible: boolean | undefined;
  detailVisible: boolean | undefined;
  userId: string;
  loginUser: IUserDetails;
  roles: Ifilter[];
  enterpriseId: string | undefined;
  // curRow: any//当前更新的行数据
}

interface Ifilter {
  label: string;
  value: string | number;
}

class EnterpriseList extends Component<any, IState, any>{
  tableRef = React.createRef<ConcretTable<any>>()
  userId = getStore('user_id')//当前登录用户id
  columns: any[] = [
    {
      title: '操作',
      // dataIndex: 'opra',
      key: 'opra',
      width: 100,
      render: (value: any, record: IUserInfo) => {
        return (
          <>
            <Button
              disabled={!this.hasPermission('修改')}
              type="link"
              className='table-link-btn'
              onClick={(event) => this.updateOrgClick(event, record)}
            >修改</Button>|
            {
              (record.id != this.userId && this.hasPermission('删除')) ?
                (
                  <Popconfirm
                    // placement="top"
                    title='删除后无法找回！确认是否删除？'
                    onConfirm={() => this.delConfirm(record)}
                    // onCancel={this.delCancel}
                    cancelText="取消"
                    okText="确定"
                  >
                    <a onClick={(event: any) => {
                      event.stopPropagation();
                      this.setState({ detailVisible: false });
                    }}> 删除</a>
                  </Popconfirm>
                )
                : (
                  <Button
                    disabled
                    type="link"
                    className='table-link-btn'
                  > 删除</Button>
                )
            }

          </>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      filter: {
        type: false,
        key: 'isActive',
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
        ]
      },
      render: (value: number) => {
        if (value == 1) {
          return (
            <Badge color='green' text='启用' />
          );
        }
        return (
          <Badge color='red' text='停用' />
        );
      }
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150,
    },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      key: 'realName',
      width: 120,
      render: (value: string) => {
        return showEmpty(value);
      }
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 100,
      render: (value: number) => {
        if (value == 1) {
          return (
            <Badge color='blue' text='男' />
          );
        }
        return (
          <Badge color='red' text='女' />
        );
      }
    },
    {
      title: '电话号码',
      dataIndex: 'mobile',
      key: 'mobile',
      width: 120,
      render: (value: string) => {
        return showEmpty(value);
      }
    },
    {
      title: '所属企业',
      dataIndex: 'organizationName',
      key: 'organizationName',
      width: 200
    },
    {
      title: '授权截止日期',
      dataIndex: 'authorizationDate',
      key: 'authorizationDate',
      width: 150,
      sorterKey: 'authorization_date'
    },
    {
      title: '创建日期',
      dataIndex: 'createDataTime',
      key: 'createDataTime',
      sorterKey: 'id',
      width: 120,
      render: (value: string) => {
        const val = value.substring(0, 10);
        return showEmpty(val);
      }
    }, {
      title: '最后修改时间',
      dataIndex: 'updateDataTime',
      key: 'updateDataTime',
      sorterKey: 'update_data_time',
      width: 150,
      render: (value: string) => {
        const time = value.substring(0, value.length - 3);
        return time;
      }
    },
    {
      title: '修改人',
      dataIndex: 'updateDataUsername',
      key: 'updateDataUsername',
      width: 120,
      render: (value: string) => {
        return showEmpty(value);
      }
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
      queryArgs: {
        isActive: null
      },
      userId: '',
      loginUser: {
        "username": '',
        "organizationName": '',
        "gender": 0,
        "mobile": '',
        "mail": '',
        "identity": '',
        "industryId": 0,
        "duty": '',
        "administrativeOffice": '',
        "authorizationDate": '',
        "isActive": 0,
        "realName": '',
      },
      roles: [],
      enterpriseId: undefined,
      // curRow: null
    }
  }

  componentDidMount() {
    this.getLoginUser();
    this.getUserRoles();
  }

  /**
* 判断按钮权限
* @param title 按钮名称
*/
  hasPermission = (title: string) => {
    return permission.indexOf(title) !== -1;
  }

  /**
   * 获取登录用户信息
   */
  async getLoginUser() {
    const datas = await getUserMsg<IUserDetails>(null);

    if (datas) {
      this.setState({
        loginUser: datas
      })
    }
  }

  /**
   * 获取当前选中组织树节点
   */
  getSelectTNode = (selectedNode: any) => {
    if (!selectedNode) { return; }
    let treeSelectId;

    if (selectedNode.type == "enterprise") {
      treeSelectId = selectedNode.id
    } else {
      treeSelectId = undefined
    }

    this.setState({
      queryArgs: {
        orgId: selectedNode.id
      },
      enterpriseId: treeSelectId
    })
  }

  /**
   * 获取权限下的角色列表
   */
  async getUserRoles() {
    const params = {
      userId: this.userId
    }
    const datas = await exterpriseCharacter<IRoles[]>(params);

    if (datas) {
      const roles: Ifilter[] = [{
        label: '全部',
        value: ''
      }];

      datas.map((item: IRoles) => {
        const obj = {
          label: item.name,
          value: item.id
        };
        roles.push(obj);
      })

      this.setState({
        roles,
      });
    }
  }

  /**
   * 新增
   */
  addFun() {
    this.setState({
      addVisible: true,
      type: 0
    });
  }

  /**
   * 修改
   */
  updateOrgClick = (event: any, record: any) => {
    event.stopPropagation();
    this.setState({
      type: 1,
      addVisible: true,
      userId: record.id,
      // curRow: record,
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
   * 关闭抽屉
   */
  closeAddDrawer = () => {
    this.setState({
      addVisible: false
    });
  }
  closeDetailDrawer = () => {
    this.setState({
      detailVisible: false,
    });
  }

  /**
   * table行点击
   */
  rowClickFun(record: any) {
    this.setState({
      detailVisible: true,
      userId: record.id,
      // curRow: record
    })
  }

  /**
       * 多选框改变
       */
  rowChange = (selectedRowKeys: any) => {
    this.setState({
      selectedRowKeys,
      detailVisible: false
    })
  }

  /**
   * 批量删除确定
   */
  delMoreConfirm = () => {
    this.delMore();
  }
  async delMore() {
    const {
      selectedRowKeys
    } = this.state;

    const datas = await exterprisBatchDel(selectedRowKeys);
    console.log('datas', datas);

    if (datas) {
      message.success('删除成功');
      this.setState({
        selectedRowKeys: []
      });
      this.reload();
    }
  }

  /**
   * 单个删除确定
   */
  delConfirm = (record: any) => {
    this.delOne(record.id);
  }
  async delOne(id: string) {
    const params = {
      userId: id
    }
    const datas = await enterpriseDel(params);
    if (datas) {
      if (this.state.detailVisible) {
        this.setState({
          detailVisible: false
        })
      }

      message.success('删除成功');
      this.reload();
    }
  }

  /**
   * 批量删除确认框
   */
  getDelPop = () => {
    const {
      selectedRowKeys
    } = this.state;

    if (!this.hasPermission('删除')) {
      return <Button disabled key="userListDel">批量删除</Button>;
    }

    if (selectedRowKeys.length > 0) {
      return (
        <Popconfirm
          key="userListDel"
          // placement="top"
          title={`删除后无法找回！确认是否删除${selectedRowKeys.length}条记录？`}
          onConfirm={this.delMoreConfirm}
          // onCancel={this.delCancel}
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
          key="userListDel"
          // placement="top"
          title='请勾选需要删除的行！'
          // onCancel={this.delCancel}
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
   */
  // updateDataOne = (updateRow: any) => {
  //     const { curRow } = this.state;
  //     (this.tableRef.current as any).updateDataOne({ ...this.state.curRow, ...updateRow }, curRow.key);
  // }

  /**
   * 刷新列表
   */
  reload = () => (this.tableRef.current as any).reload();

  render() {
    const {
      addVisible,
      type,
      selectedRowKeys,
      queryArgs,
      detailVisible,
      userId,
      loginUser,
      enterpriseId
    } = this.state;


    return (
      <div style={{ height: '100%' }}>
        <Table
          ref={this.tableRef}
          scroll={{ y: 'calc(100vh -  348px)' }}
          columns={this.columns}
          rowSelection={{
            selectedRowKeys,
            onChange: this.rowChange,
            getCheckboxProps: (record: any) => ({
              disabled: record.id === this.userId,
            }),
          }}
          tree={<GroupTree treeNodeClick={this.getSelectTNode} />}
          btnGroup={[
            <Button
              disabled={!this.hasPermission('新增')}
              type="primary"
              key="userListAdd"
              onClick={this.addFun.bind(this)}
            >新增</Button>,
            this.getDelPop()
          ]}
          queryAjax={enterpriseList}
          settingQuery={{
            key: 'keyword',//模糊查询参数
            placeholder: '请输入用户名/真实姓名/电话号码'
          }}
          settingQueryStyle={{ width: 300 }}
          queryArgs={queryArgs}
          rowClick={this.rowClickFun.bind(this)}
          queryCallback={() => {
            this.setState({
              selectedRowKeys: []
            });
          }}
        />

        {/* 详情抽屉 */}
        {
          detailVisible != undefined && (
            <UserDetailDrawer
              visible={detailVisible}
              closeDrawer={this.closeDetailDrawer}
              userId={userId}
              delUser={this.delOne.bind(this)}
              reload={this.reload}
              hasPermission={this.hasPermission}
            />
          )
        }

        {/* 新增、修改抽屉 */}
        {
          addVisible != undefined && (
            <UserAddDrawer
              visible={addVisible}
              closeDrawer={this.closeAddDrawer}
              type={type}
              reload={this.reload}
              // updateDataOne={this.updateDataOne}
              loginUser={loginUser}
              userId={userId}
              enterpriseId={enterpriseId}
            />
          )
        }
      </div>
    )
  }
}

export default EnterpriseList;
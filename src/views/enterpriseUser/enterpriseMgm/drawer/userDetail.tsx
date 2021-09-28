/**
 * 车辆详情
 */
import React, { Component } from 'react';
import {
  Button,
  message,
  Table,
  Spin,
} from 'antd';
import styles from './index.module.less';
import { Tabs } from 'antd';
import { Row } from 'antd';
import { Col } from 'antd';
import { Form } from 'antd';
import { showEmpty } from '@/framework/utils/function';
import { resetPwd, getUserDetail, userPermission } from '@/server/orgMgm';
import { exterpriseDetail } from '@/server/enterpriseUser';
import Popconfirm from '@/common/popconfirm';
import { IUserInfo, IUserGroupDtos } from '../type';
import { getStore } from '@/framework/utils/localStorage';
import AssignRolesDrawer from './assignRoles';
import { DetailDrawer, OperatorContainer } from '@/common';
import { FormInstance } from 'antd/lib/form';
import UserAddDrawer from './userAdd';
import Newtable from '@/common/tableForm';
import UserTreeNode from '@/common/menuTree';
const { TabPane } = Tabs;

interface IProps {
  visible: boolean;
  closeDrawer: Function;
  userId: string;
  delUser: (id: string) => Promise<void>;//删除用户
  reload: () => void;//列表刷新
  hasPermission: Function;
}

interface IState {
  dataDetail: IUserInfo;
  assignRolesVisible: boolean | undefined;
  assignGroupVisible: boolean | undefined;
  tabActiveKey: string;
  addVisible: boolean | undefined;
  loading: boolean;
  rolePromiss: any;
}

interface IItem {
  createDataTime: string;
  priority: number;
  roleId: string;
  roleName: number;
  userId: number;

}

const detials = [
  {
    name: '用户名',
    key: 'username',
  },
  {
    name: '真实姓名',
    key: 'realName',
  },
  {
    name: '性别',
    key: 'gender',
  },
  {
    name: '所属组织',
    key: 'organizationName',
  },
  {
    name: '身份证号',
    key: 'identity',
  },
  {
    name: '电话号码',
    key: 'mobile',
  },
  {
    name: '邮箱',
    key: 'mail',
  },
  {
    name: '行业',
    key: 'industryName',
  },
  {
    name: '身份',
    key: 'userIdentity',
  },

  {
    name: '职务',
    key: 'duty',
  },
  {
    name: '科室',
    key: 'administrativeOffice',
  },
  {
    name: '授权截止日期',
    key: 'authorizationDate',
  },
  {
    name: '状态',
    key: 'isActive',
  }
]

class UserDetailDrawer extends Component<IProps, IState, any> {
  formRef = React.createRef<FormInstance>()
  roleColumns: any[] = [
    {
      title: '角色',
      dataIndex: 'roleName',
      key: 'roleName',
      align: 'center',
      width: 40,
    },
    {
      title: '分配时间',
      dataIndex: 'createDataTime',
      key: 'createDataTime',
      align: 'center',
      width: 120,
    },
  ]
  groupColumns: any[] = [
    {
      title: '分组',
      dataIndex: 'groupName',
      key: 'groupName',
      align: 'center'
      // width: 80,
    },
    {
      title: '所属企业',
      dataIndex: 'orgName',
      key: 'orgName',
      align: 'center'
      // width: 80,
    },
    {
      title: '分配时间',
      dataIndex: 'createDataTime',
      key: 'createDataTime',
      align: 'center'
      // width: 80,
    },
  ]
  static defaultProps = {
    showUpdateDrawer: null
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      dataDetail: {
        "id": '',
        "username": "",
        "organizationId": '',
        "organizationName": "",
        "authorizationDate": "",
        "gender": "1",
        "administrativeOffice": "",
        "duty": "",
        "identity": "",
        "industryId": '',
        "isActive": 0,
        "mail": "",
        "mobile": "",
        "password": "",
        "realName": "",
        "userGroupDtos": [],
        "userRoleDtos": [],
      },
      assignRolesVisible: undefined,
      assignGroupVisible: undefined,
      addVisible: undefined,
      tabActiveKey: '1',
      loading: true,
      rolePromiss: []
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const {
      userId,
      visible
    } = nextProps;

    if (visible && userId) {
      this.setState({
        loading: true,
        rolePromiss: []
      });
      this.getUserMsg(userId);
    }
  }

  componentDidMount() {
    const {
      userId,
      visible
    } = this.props;

    if (visible && userId) {
      this.getUserMsg(userId);
    }
  }

  /**
   * 获取当前用户信息
   */
  async getUserMsg(userId: string) {
    const params = {
      userId
    }
    const datas = await exterpriseDetail<IUserInfo>(params);

    if (datas) {
      datas.gender = datas.gender == '1' ? '男' : '女';
      datas.isActive = datas.isActive == '1' ? '开启' : '关闭';
      (this.formRef.current as any).setFieldsValue(datas);

      this.setState({
        dataDetail: datas,
        loading: false
      })
    }
  }

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
        <Button
          onClick={this.closeDrawer}
          style={{ marginLeft: 8 }}
        >
          取消
              </Button>
      </div>
    )
  }

  closeDrawer = () => {
    this.setState({
      tabActiveKey: '1',
      rolePromiss: []
    })
    this.props.closeDrawer();
  }

  /**
   * 显示修改
   */
  showUpdateDrawer = () => {
    this.setState({
      addVisible: true
    });
  }
  closeAddDrawer = () => {
    this.setState({
      addVisible: false
    });
  }

  /**
   * 渲染头部基础信息
   */
  renderTop = (dataSource: IUserInfo) => {

    return (<ul className={styles['basic-box']}>
      <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
        <div className={styles['tit']}>{showEmpty(dataSource.username)}</div>
      </li>
      <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
        <div className={styles['tit']}>状态:</div>
        <div className={styles['con']}>
          {dataSource.isActive}
        </div>
      </li>
      <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
        <div className={styles['tit']}>最后修改时间:</div>
        <div className={styles['con']}>{showEmpty(this.splitTime(dataSource.updateDataTime))}</div>
      </li>
    </ul>);
  }

  splitTime = (value: string) => {
    if (value) {
      const time = value.substring(0, value.length - 3);
      return time;
    }
  }

  /**
   * 删除用户
   */
  delConfirm = () => {
    this.props.delUser(this.props.userId);
  }

  /**
   * 重置密码
   */
  async resetPwd() {
    const params = {
      userId: this.props.userId
    };
    const datas = await resetPwd(params);
    if (datas) {
      message.success('重置密码成功');
    }
  }

  /**
   * 显示分配角色
   */
  openAssignRDrawer = () => {
    this.setState({
      assignRolesVisible: true,
      tabActiveKey: '2'
    })
  }
  closeAssignRDrawer = () => {
    this.setState({
      assignRolesVisible: false
    })
    // 更新详情数据
    this.getUserMsg(this.props.userId);
  }

  closeAssignGDrawer = () => {
    this.setState({
      assignGroupVisible: false
    });

    // 更新详情数据
    // this.getUserMsg(this.props.userId);
  }

  /**
   * tab标签点击
   */
  onTabClick = (key: string) => {
    this.setState({
      tabActiveKey: key
    })
  }

  /**
   * 切换预览权限
   */
  async switchPermissions(record: IItem) {
    const roleId = record.roleId;
    const datas = await this.getPromiss(roleId);
    this.setState({
      rolePromiss: datas
    });
  }

  async getPromiss(roleId: string) {
    const params = {
      roleId: roleId,
      owner: '2'
    }
    const datas = await userPermission<any>(params);
    if (datas) {
      return datas;
    }
  }




  render() {
    const {
      visible,
      userId,
      reload,
      hasPermission
    } = this.props;

    const {
      dataDetail: dataSource,
      assignRolesVisible,
      tabActiveKey,
      addVisible,
      loading,
      rolePromiss
    } = this.state;

    // 获取当前用户的分组id
    const checkKeys: string[] = [];
    if (dataSource.userGroupDtos && dataSource.userGroupDtos.length > 0) {
      dataSource.userGroupDtos.map((item: IUserGroupDtos) => {
        if (item.groupId) {
          checkKeys.push(item.groupId);
        }
      });
    }

    return (
      <DetailDrawer
        title="用户详情"
        width={740}
        visible={visible}
        onClose={this.closeDrawer}
      >
        <div
          className={styles['detail-wrapper']}
        >
          <div className={styles['left-box']}>
            <Tabs
              defaultActiveKey="1"
              activeKey={tabActiveKey}
              onTabClick={this.onTabClick}
              style={{ height: '100%' }}
            >
              {/* 基本信息 */}
              <TabPane
                tab="基本信息"
                key="1"
                className={styles['tab-pane']}
                style={{ height: '100%' }}
              >

                {/* 详细信息 */}
                <div
                  className={styles['con-box']}
                >
                  <Form
                    ref={this.formRef}
                  >
                    <Row>
                      <Col
                        span={24}
                        style={{ overflow: 'hidden' }}
                      >
                        <Newtable
                          dataSource={detials}
                          type={'detail'}>
                        </Newtable>
                      </Col>
                    </Row>
                  </Form>

                </div>
              </TabPane>

              {/* 角色信息 */}
              <TabPane
                tab="角色信息"
                key="2"
                className={styles['tab-pane']}
                style={{ height: '100%' }}
              >
                {/* 详细信息 */}
                <Row style={{ border: '1px solid #eee' }}>
                  <Col span={24}>
                    <div className={styles['tab-title']}>当前角色</div>
                    <div style={{ height: 190 }}>
                      <Table
                        onRow={(record) => {
                          return {
                            onClick: this.switchPermissions.bind(this, record)
                          }
                        }}
                        scroll={{ y: 150 }}
                        columns={this.roleColumns}
                        dataSource={dataSource.userRoleDtos}
                        pagination={false}
                        size='small'
                      />
                    </div>
                  </Col>
                  <Col span={24}>
                    <div className={styles['tab-title']}>
                      权限预览
                                        </div>
                    <div style={{ height: 400, overflowY: "auto" }}>
                      <UserTreeNode
                        menuTreeData={rolePromiss}
                      />
                    </div>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </div>

          <OperatorContainer>
            {/* 基础信息 */}
            {this.renderTop(dataSource)}

            <Button
              block
              onClick={this.showUpdateDrawer}
              disabled={!hasPermission('修改')}
            >
              修改用户
                        </Button>
            {
              hasPermission('重置密码')
                ? (
                  <Popconfirm
                    title='确认是否重置密码？重置后密码为123456？'
                    onConfirm={this.resetPwd.bind(this)}
                    cancelText="取消"
                    okText="确定"
                  >
                    <Button
                      disabled={userId == getStore('user_id')}
                      block
                    >
                      重置密码
                                        </Button>
                  </Popconfirm>
                ) : (
                  <Button
                    block
                    disabled
                  >
                    重置密码
                  </Button>
                )
            }

            <Button
              block
              onClick={this.openAssignRDrawer}
              disabled={userId == getStore('user_id') || !hasPermission('分配角色')}
            >
              分配角色
                        </Button>

            {
              (userId != getStore('user_id') && hasPermission('删除'))
                ? (
                  <Popconfirm
                    // placement="top"
                    title='删除后无法找回！确认是否删除记录？'
                    onConfirm={this.delConfirm}
                    cancelText="取消"
                    okText="确定"
                  >
                    <Button
                      block
                    >
                      删除用户
                                    </Button>
                  </Popconfirm>
                ) : (
                  <Button
                    block
                    disabled
                  >
                    删除用户
                  </Button>
                )
            }
          </OperatorContainer>
        </div>

        {/* 修改抽屉 */}
        {
          addVisible != undefined && (
            <UserAddDrawer
              visible={addVisible}
              closeDrawer={this.closeAddDrawer}
              closeDetailDrawer={this.closeDrawer}
              type={1}
              reload={reload}
              userId={userId}
              getContainer="body"
            />
          )
        }

        {/* 分配角色抽屉 */}
        {
          assignRolesVisible != undefined && (
            <AssignRolesDrawer
              visible={assignRolesVisible}
              closeDrawer={this.closeAssignRDrawer}
              userId={userId}
              getContainer="body"
              closeDetailDrawer={this.closeDrawer}
            />
          )
        }

        {/* 加载框 */}
        {
          loading && (
            <Spin
              spinning
              className={styles['loading']}
            />
          )
        }
      </DetailDrawer >
    );
  }
}
export default UserDetailDrawer;

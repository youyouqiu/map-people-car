import React from 'react';
import { Button } from 'antd';
import { Tabs } from 'antd';
import { Popconfirm, Form } from 'antd';
import { injectIntl } from 'react-intl';
import styles from './detail.module.less'
import { roleDetail, rolePermission } from '@/server/enterpriseUser';
import UserTree from '../userTree'
import MenuTree from '@/common/menuTree'
import Loading from '@/common/loading';
import { IRole, IMenuTreeData } from '.';
import { OperatorContainer, DetailDrawer } from '@/common';
import { getCurrentUserPermission } from '@/framework/utils/function';
import Edit from './edit';
import Assign from './assign';
import Newtable from '@/common/tableForm';
import { FormInstance } from 'antd/lib/form';
import { getStore } from '@/framework/utils/localStorage'

const { TabPane } = Tabs;

interface IProps {
  roleId: string;
  item: IRole | undefined;
  flag: boolean;
  update?: boolean;
  close: Function;
  edit: Function;
  assign: Function;
  delete: Function;
  intl: any;
  handleSaveRoleUser: Function;
  handleSaveRole: Function;
  menuPermissionData: any;
}

const permission = getCurrentUserPermission('4_enterprise_role_list');

const dataSource = [
  {
    name: '角色名称',
    key: 'name',
  },
  {
    name: '所属企业',
    key: 'enterpriseNames',
  },
  {
    name: '备注',
    key: 'description',
  }
]

interface IState {
  roleInfo: IRole | undefined;
  menuTreeData: IMenuTreeData | undefined;
  userTreeData: Array<object>;
  userCount: number;
  loading: boolean;
  editFlag: undefined | boolean;
  assignFlag: undefined | boolean;
}

class RoleDetail extends React.Component<IProps, IState, any> {
  userId = getStore('user_id');
  userName = getStore('userName');
  formRef: any = React.createRef<FormInstance>()
  checkedMenu: string[];
  permissionList: any;
  constructor(props: IProps) {
    super(props);
    this.state = {
      roleInfo: undefined,
      menuTreeData: undefined,
      userTreeData: [],
      userCount: 0,
      loading: true,
      editFlag: undefined,
      assignFlag: undefined
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { roleId } = this.props;
    if (roleId !== nextProps.roleId && nextProps.flag) {
      this.setState({
        loading: true,
      }, () => {
        this.getData(nextProps.roleId);
      })
    }
    if (!nextProps.flag) {
      this.setState({
        editFlag: undefined,
        assignFlag: undefined
      })
    }
  }

  componentDidMount() {
    if (this.props.flag) {
      this.getData(this.props.roleId)
    }
  }

  /**
   * 判断按钮权限
   * @param title 按钮名称
   */
  hasPermission = (title: string) => {
    return permission.indexOf(title) !== -1;
  }

  getData = async (roleId: string) => {
    const trueId = roleId.split('?')[0];
    const params = {
      roleId: trueId,
      owner: 2
    }
    const permission = await rolePermission<IMenuTreeData>(params);
    const roleInfo = await roleDetail<IRole>(trueId);

    if (roleInfo != undefined) {
      this.formRef.current.setFieldsValue({ name: roleInfo.name, description: roleInfo.description, enterpriseNames: roleInfo.enterpriseNames })
    }

    if (permission !== undefined && roleInfo !== undefined) {
      this.setState({
        menuTreeData: permission,
        roleInfo,
        loading: false,
      })
    }
  }

  closeAssignDrawer = () => {
    this.setState({
      assignFlag: false
    })
  }

  closeEditDrawer = () => {
    this.setState({
      editFlag: false
    })
  }

  openAssignDrawer = () => {
    this.setState({
      assignFlag: true
    })
  }

  openEditDrawer = () => {
    this.setState({
      editFlag: true
    })
  }

  bindDrawerFlag = () => {
    this.props.close({ detailFlag: false, detailItem: null });
  }
  userTreeCheck(checkedKeys: string[], permissionList: any) {
    this.checkedMenu = checkedKeys;
    this.permissionList = permissionList;
  }

  onGetUserCount = (count: number) => {
    this.setState({
      userCount: count
    })
  }

  /**
  * 用户权限按钮
  */
  userAppearance = (value: string) => {
    const { item } = this.props;
    const enterpriseAdminId = item != undefined ? item.enterpriseAdminId : '';
    const owner = item != undefined ? item.owner : '';
    const rowId = item != undefined ? item.id : "";

    if (!this.hasPermission(value) || rowId === '9999') {
      return true;
    } else {
      if (this.userName === 'admin' || this.userId === owner || enterpriseAdminId.indexOf(this.userId) != '-1') {
        return false
      } else {
        return true
      }
    }
  }

  splitTime = (value: string) => {
    if (value) {
      const time = value.substring(0, value.length - 3);
      return time;
    }
  }



  render() {
    const { intl: { messages }, flag, item } = this.props;
    const { menuTreeData, roleInfo, userCount, loading } = this.state;
    let rowId
    if (item) {
      rowId = item.id;
    }

    return (
      <DetailDrawer
        title={messages.permission_role_detail_title}
        width={720}
        onClose={this.bindDrawerFlag}
        visible={flag}
      >
        <div className={styles['role-detail-container']}>
          <div className={styles['role-left']}>
            <Tabs defaultActiveKey="1" tabBarStyle={{ paddingLeft: '20px' }}>
              <TabPane tab={messages.besic_message_text} key="1">
                <Form
                  ref={this.formRef}
                  style={{ padding: '0px 24px' }}>
                  <Newtable
                    dataSource={dataSource}
                    type="detail"
                  >
                  </Newtable>
                  <div className={styles['role-permission']}>
                    <div className={styles['tab-title']}>操作权限</div>
                    <div className={styles['tree-container']}>
                      {
                        menuTreeData && menuTreeData.menu ? <MenuTree
                          owner='2'
                          treeEditStatus={false}
                          menuTreeData={menuTreeData}
                          id={roleInfo != undefined ? roleInfo.id : ''}
                          treeCheck={(checkedKeys: string[], permissionList: any) => {
                            this.userTreeCheck(checkedKeys, permissionList);
                          }}
                        /> : null
                      }
                    </div>
                  </div>
                </Form>
              </TabPane>
              <TabPane tab={messages.user_message_text} key="2">
                <div style={{ padding: '0px 24px' }}>
                  <div className={styles['tab-title']} style={{ borderBottom: '1px solid #eee', marginBottom: 10 }}>用户列表</div>
                  <div className={styles['role-permission']}>
                    <div style={{ height: 'calc(100vh - 360px)' }}>
                      {
                        roleInfo != undefined ?
                          <UserTree
                            roleId={roleInfo.id}
                            treeQueryStatus={true}
                            treeEditStatus={true}
                            treeBanCheck={true}
                            onGetUserCount={this.onGetUserCount}
                          /> : null
                      }
                    </div>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </div>
          <OperatorContainer>
            <ul>
              <li style={{ marginBottom: 20 }}>
                <div>
                  {
                    roleInfo ?
                      roleInfo.name : ''
                  }
                </div>
              </li>
              <li style={{ marginBottom: 20 }}>
                <div>最后创建时间：</div>
                <div>
                  {
                    item != undefined ?
                      this.splitTime(item.updateDataTime) : ''
                  }
                </div>
              </li>
            </ul>

            <Button block disabled={this.userAppearance('修改')} onClick={this.openEditDrawer}>
              {messages.permission_role_modify_title}
            </Button>
            <Button block disabled={!this.hasPermission('分配用户') || rowId === '9999'} onClick={this.openAssignDrawer}>
              {messages.permission_role_assign_user_title}
            </Button>
            {
              roleInfo != undefined ?
                <Popconfirm disabled={this.userAppearance('删除')} title={messages.delete_popconfirm_notice} onConfirm={() => {
                  this.props.delete(roleInfo.id);
                }}>
                  <Button block disabled={this.userAppearance('删除')}>{messages.permission_role_delete_title}</Button>
                </Popconfirm> : null
            }
          </OperatorContainer>
        </div>
        {
          loading ? <div
            style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 10 }}
          >
            <Loading type="block" />
          </div> : null
        }
        {
          this.state.assignFlag !== undefined ? <Assign
            flag={this.state.assignFlag}
            item={this.props.item}
            save={this.props.handleSaveRoleUser}
            close={this.closeAssignDrawer}
            getContainer="body"
          /> : null
        }
        {
          this.state.editFlag !== undefined ? <Edit
            flag={this.state.editFlag}
            permission={this.props.menuPermissionData}
            roleId={this.props.roleId}
            close={this.closeEditDrawer}
            save={this.props.handleSaveRole}
            getContainer="body"
          /> : null
        }
      </DetailDrawer>
    )
  }
}
export default injectIntl(RoleDetail)
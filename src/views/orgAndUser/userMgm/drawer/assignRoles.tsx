
import React, { Component } from 'react';
import {
  message,
  Spin,
  Table
} from 'antd';
import styles from './index.module.less';
import { userRoles, userPermission, assignRoles } from '@/server/orgMgm';
import { IRoles } from '../type';
import { getStore } from '@/framework/utils/localStorage';
import UserTreeNode from '@/common/menuTree';
import { EditDrawer } from '@/common';

interface IProps {
  visible: boolean;
  closeDrawer: () => void;
  userId: string;
  getContainer?: string | false;
  closeDetailDrawer?: Function;//关闭详情抽屉
}

interface IState {
  loginRoles: IRoles[];
  roleIds: string[];
  rolePromiss: any;
  loading: boolean;
  checkRowkeys: Array<string>;
  activeName: string | undefined;
}

class AssignRolesDrawer extends Component<IProps, IState, any> {
  loginUserId = getStore('user_id')
  static defaultProps = {
    showUpdateDrawer: null,
    getContainer: false
  }

  roleColumns = [
    {
      title: '角色',
      dataIndex: 'name',
      width: 130,
    },
    {
      title: '操作',
      width: 50,
      render: (text: string, record: any, index: number) => {
        return <a
          onClick={() => this.preView(record.id, record.name)}
        >预览权限</a>
      }
    }
  ];

  constructor(props: IProps) {
    super(props);
    this.state = {
      loginRoles: [],
      roleIds: [],
      rolePromiss: {},
      loading: true,
      checkRowkeys: [],
      activeName: undefined
    };
  }

  async UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const {
      visible,
      userId
    } = nextProps;

    if (visible && this.loginUserId) {
      this.setState({
        loading: true
      });

      this.getDatas(userId);
    }
  }

  componentDidMount() {
    const {
      userId
    } = this.props;

    this.getDatas(userId);
  }

  /**
   * 获取角色信息
   */
  getDatas = async (userId: string) => {
    const [loginRoles, curRoles] = await Promise.all([
      this.getUserRoles(this.loginUserId as string)////登录用户角色
      , this.getUserRoles(userId)//当前选中用户角色
    ]);

    // 当前权限下的角色
    if (loginRoles) {
      this.setState({
        loginRoles,
      })
    }

    // 勾选已有的角色
    if (curRoles && curRoles.length > 0) {
      console.log('curRoles', curRoles);

      const checkIds = curRoles.map((item: IRoles) => {
        return item.id;
      })

      const rolePromiss = await this.getPromiss(checkIds[0]);//初始预览显示勾选的第一个
      this.setState({
        roleIds: checkIds,
        rolePromiss,
        loading: false,
        checkRowkeys: checkIds,
        activeName: curRoles[0].name
      })
    } else {
      this.setState({
        loading: false,
        checkRowkeys: [],
        activeName: undefined
      })
    }
  }

  /**
   * 获取权限下的角色列表
   */
  async getUserRoles(userId: string) {
    const params = {
      userId: userId
    }
    const datas = await userRoles<IRoles[]>(params);
    if (datas) {
      return datas;
    }
  }

  /**
   * 预览权限
   */
  async preView(roleId: string, roleName: string) {
    const datas = await this.getPromiss(roleId);
    this.setState({
      rolePromiss: datas,
      activeName: roleName
    })
  }
  async getPromiss(roleId: string) {
    const params = {
      roleId: roleId,
      owner: 1
    }
    const datas = await userPermission<any>(params);
    if (datas) {
      return datas;
    }
  }

  /**
   * 角色勾选
   */
  onCheckChange = (selectedRowKeys: any, selectedRows: Array<any>) => {
    const checkIds: Array<string> = [];
    selectedRows.map((item: any) => {
      checkIds.push(item.id)
    })

    this.setState({
      roleIds: checkIds,
      checkRowkeys: selectedRowKeys
    });
  }

  /**
   *  分配角色
   */
  refer = () => {
    this.assignRoles(this.props.userId, this.state.roleIds);
  }
  async assignRoles(userId: string, roleIds: string[]) {
    const params = {
      userId: userId,
      body: roleIds
    };
    const datas = await assignRoles(params);
    if (datas) {
      message.success('修改成功');

      const {
        closeDetailDrawer,
        closeDrawer
      } = this.props;
      closeDrawer();
      if (typeof closeDetailDrawer == 'function') {
        closeDetailDrawer()
      }
    }
  }



  render() {
    const {
      visible,
      closeDrawer,
      getContainer
    } = this.props;

    const {
      loginRoles,
      roleIds: checkIds,
      rolePromiss,
      loading,
      checkRowkeys,
      activeName
    } = this.state;

    return (
      <EditDrawer
        title="分配角色"
        width={560}
        visible={visible}
        onClose={closeDrawer}
        getContainer={getContainer}
        onConfirm={this.refer}
      >
        <div className={styles['assign-role-drawer']}>
          <div className={styles['role-title']}>请勾选需要分配的角色</div>
          <div className={styles['role-box']}>
            <Table
              rowKey={record => record.id}
              rowSelection={{
                type: 'checkbox',
                columnWidth: 30,
                onChange: this.onCheckChange,
                getCheckboxProps: record => ({
                  disabled: record.id === '0',
                }),
                selectedRowKeys: checkRowkeys
              }}
              scroll={{ y: 150 }}
              columns={this.roleColumns}
              dataSource={loginRoles}
              pagination={false}
              size='small'
            />
          </div>
          <div className={styles['role-title']}>
            权限预览({activeName ? activeName : '-'})
                    </div>
          < div
            className={styles['role-tree']}
            style={{ height: 'calc(100vh - 500px)', overflowY: 'auto', }}
          >
            <UserTreeNode
              owner='1'
              menuTreeData={rolePromiss}
            />
          </div>
        </div>

        {/* 加载框 */}
        {
          loading && (
            <Spin
              spinning
              className={styles['loading']}
            />
          )
        }
      </EditDrawer>
    );
  }
}
export default AssignRolesDrawer;

import React, { Component } from 'react';
import { Form } from 'antd';
import { injectIntl } from 'react-intl';
import styles from './index.module.less'
import MenuTree from '@/common/menuTree'
import { roleDetail } from '@/server/enterpriseUser';
import { IRole } from '.';
import { Loading, EditDrawer, PublicTreeSelect } from '@/common';
import { FormInstance } from 'antd/lib/form';
import { regularText } from '@/common/rules';
import Newtable from '@/common/tableForm';
import { getSelectContainer } from '@/framework/utils/function';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
};

interface IProps {
  flag: boolean;
  roleId: string;
  close: Function;
  save: Function;
  intl: any;
  permission?: any;
  getContainer?: 'body';
  enterpriseId?: string | undefined;
}

interface IState {
  roleInfo: IRole | undefined;
  loading: boolean;
}

class RoleEdit extends Component<IProps, IState, any> {
  checkedMenu: string[];
  editForm: FormInstance;
  permissionList: any;
  dataSource = [
    {
      name: '角色名称',
      key: 'name',
      validate: {
        rules: [
          regularText,
          {
            required: true,
            message: '请输入角色名称',
          },
          {
            max: 20,
            min: 2,
            message: '角色名称长度必须介于2到20之间'
          },
        ]
      },
      inputProps: {
        maxLength: 20
      }
    },
    {
      name: '所属企业',
      key: 'enterpriseId',
      validate: {
        rules: [{
          required: true,
          message: '请选择企业'
        }]
      },
      component: () => {
        const { roleId } = this.props;
        return (
          <PublicTreeSelect
            isEdit={roleId.length > 0 ? true : false}
            multipleFlag={true}
            labelInValue={false}
            treeType='enterprise'
            placeholder='请选择企业'
            getPopupContainer={() => getSelectContainer('userSelectContainer')}
          />
        );
      },
      colspan: 4,
    },
    {
      name: '备注',
      key: 'description',
      validate: {
        rules: [
          regularText
        ]
      },
      inputProps: {
        maxLength: 150
      }
    }
  ]

  constructor(props: IProps) {
    super(props);
    this.state = {
      roleInfo: undefined,
      loading: props.roleId.length > 0 ? true : false,
    }
    if (props.roleId.length > 0) {
      this.getData(props.roleId);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { roleId, enterpriseId, flag } = this.props;
    if (flag == nextProps.flag) return;

    if (!nextProps.roleId) {
      this.setState({
        loading: false,
        roleInfo: undefined
      })
    } else {
      this.setState({
        loading: true,
        roleInfo: undefined
      }, () => {
        this.getData(nextProps.roleId);
      })
    }

    // if (roleId !== nextProps.roleId) {
    //     if (nextProps.roleId.length > 0) {
    //         this.setState({
    //             loading: true,
    //             roleInfo: undefined
    //         }, () => {
    //             this.getData(nextProps.roleId);
    //         })
    //     } else {
    //         // 打开修改角色，再打开新增，页面信息重置
    //         this.setState({
    //             loading: false,
    //             roleInfo: undefined
    //         })
    //     }
    // }

    // if (nextProps.roleId.length == 0) {
    //     this.editForm.setFieldsValue({
    //         name: '',
    //         enterpriseId: enterpriseId
    //     })
    // }
  }

  componentDidMount() {
    const { enterpriseId, roleId } = this.props;

    if (roleId.length == 0) {
      setTimeout(() => {
        this.editForm.setFieldsValue({
          enterpriseId: enterpriseId
        })
      }, 500);
    }
  }

  saveFormRef = (ref: FormInstance | null) => {
    if (ref) {
      this.editForm = ref;
    }
  }

  getData = async (roleId: string) => {
    const trueId = roleId.split('?')[0];
    const roleInfo = await roleDetail<IRole>(trueId);

    if (roleInfo !== undefined) {
      this.editForm.setFieldsValue({
        name: roleInfo.name,
        description: roleInfo.description,
        enterpriseId: roleInfo.orgIds
      });
      this.setState({
        roleInfo,
        loading: false,
      })
    }
  }

  editDrawerFlag = () => {
    this.props.close({ editFlag: false, editTitle: '' });
    this.editForm.setFieldsValue({
      name: '',
      description: '',
      enterpriseId: undefined
    })
  }

  bindSaveRole = async () => {
    const { save, roleId } = this.props;
    const { roleInfo } = this.state;
    try {
      const value = await this.editForm.validateFields();
      const permissions: any = {};
      let param = {};

      for (const item of this.checkedMenu) {
        const items = item.split('?');
        const code = items[0], action = items[1];
        if (permissions[code]) {
          if (action) {
            permissions[code].push(action);
          }
        } else {
          permissions[code] = [];
          if (action) {
            permissions[code][0] = action;
          }
        }
      }

      for (const item in this.permissionList) {
        if (!permissions[item]) {
          permissions[item] = [];
        }
      }

      if (roleId.length > 0) {
        param = {
          roleId: roleId,
          roleDto: {
            "description": value.description,
            "name": value.name,
            "permissions": permissions,
            "enterpriseId": value.enterpriseId
          }
        }
      } else {
        param = {
          roleDto: {
            "description": value.description,
            "name": value.name,
            "permissions": permissions,
            "enterpriseId": value.enterpriseId
          }
        }
      }

      await save(value, param, roleInfo);

    } catch (error) {

    }

  }
  userTreeCheck(checkedKeys: string[], permissionList: any) {
    this.checkedMenu = checkedKeys;
    if (this.permissionList) return false;
    this.permissionList = permissionList;
  }
  render() {
    const { intl: { messages }, roleId, flag, getContainer, permission } = this.props;

    const { roleInfo, loading } = this.state;
    const formvalue: any = {};

    if (!roleInfo) {
      formvalue.name = '';
      formvalue.description = '';
    }
    return (
      <EditDrawer
        title={roleId.length > 0 ? messages.permission_role_modify_title : messages.permission_role_add_title}
        width={560}
        onClose={this.editDrawerFlag}
        visible={flag}
        getContainer={getContainer}
        onConfirm={this.bindSaveRole}
      >
        <Form {...layout} ref={this.saveFormRef} initialValues={formvalue}>
          <Newtable
            dataSource={this.dataSource}>
          </Newtable>
          <Form.Item>
            <div className={styles['tab-title']}>操作权限</div>
            <div className={styles['permission-tree']}>
              <MenuTree
                owner='2'
                id={roleInfo ? roleInfo.id : undefined}
                treeEditStatus={true}
                menuTreeData={permission}
                treeCheck={(checkedKeys: string[], permissionList: any) => {
                  this.userTreeCheck(checkedKeys, permissionList);
                }} />
            </div>
          </Form.Item>
        </Form>
        {
          loading ? <div
            style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 10 }}
          >
            <Loading type="block" />
          </div> : null
        }
      </EditDrawer>
    )
  }
}
export default injectIntl(RoleEdit)

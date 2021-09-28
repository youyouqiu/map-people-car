import React, { Component } from 'react';
import { Input, Form, message, Radio, DatePicker, Spin } from 'antd';
import { Col } from 'antd';
import { Row } from 'antd';
import IndustrySelect from '@/common/industrySelect';
import { PublicTreeSelect, EditDrawer } from '@/common';
import { addUser, updateUser, checkUserName } from '@/server/orgMgm';
import moment from 'moment';
import { getAfterToday, getToday } from '@/framework/utils/function';
// import { dateFormat } from '@/views/home/workbench/tabAlarm';
import { getUserMsg } from '@/server/user';
import { IUserInfo } from '../type';
import { getStore } from '@/framework/utils/localStorage';
import { IUserDetails } from '@/views/home/type';
import { FormInstance } from 'antd/lib/form';
import styles from './index.module.less';
import { mixReg, realNameReg } from '@/framework/utils/regExp';
import { onlyNumber, regularText, email } from '@/common/rules';
import { getSelectContainer } from '@/framework/utils/function';
import Newtable from '@/common/tableForm';

interface IProps {
  type?: number;//抽屉类型(新增:0,修改:1)
  userId: string;
  visible: boolean;
  closeDrawer: Function;
  reload: Function;//列表刷新
  updateDataOne?: Function;//更新一条数据
  loginUser?: IUserDetails;//当前登录用户信息
  getContainer?: string | false;
  closeDetailDrawer?: Function;//关闭详情
}

interface IState {
  formDom: any[];
  loading: boolean;
}

const formLayout = {
  labelCol: {
    span: 24,
    offset: 0
  },
  wrapperCol: {
    span: 24,
    offset: 0
  },
}

class UserAddDrawer extends Component<IProps, IState, any> {
  formRef = React.createRef<FormInstance>()
  dateFormat = 'YYYY-MM-DD'
  static defaultProps = {
    type: 0,
    getContainer: false
  }

  constructor(props: IProps) {
    super(props);

    this.state = {
      formDom: [],
      loading: true
    }
  }

  UNSAFE_componentWillReceiveProps(nextPros: IProps) {
    const {
      loginUser,
      type,
      visible,
      userId
    } = nextPros;

    if (!visible) { return; }
    if (visible === this.props.visible) { return; }

    if (type == 0 && loginUser) {//新增时候设置授权截止日期
      this.setState({
        loading: false
      }, () => {
        this.authorizationDate(loginUser);
        this.getFormInput(type, userId);
      });
    }

    if (
      type == 1
      && userId
    ) {
      this.setState({
        loading: true
      });
      this.setInputValue(userId);
    }

    if (type != this.props.type
      || userId != this.props.userId) {//重置表单
      this.getFormInput(type, userId);
    }
  }

  componentDidMount() {
    const {
      type,
      userId,
      loginUser,
    } = this.props;

    this.getFormInput(type, userId);


    if (type == 0 && loginUser) {//新增时候设置授权截止日期
      this.authorizationDate(loginUser);
    }
  }

  /**
   * 组装表单input
   */
  getFormInput = (type = 0, userId = '') => {
    const formDom = [
      {
        name: '用户名',
        key: 'username',
        validate: {
          rules: [
            {
              required: true,
              message: '请输入用户名',
            },
            {
              pattern: mixReg,
              message: '格式为中文/字母/数字/下划线/短杠',
            },
            type == 0 && this.checkUserName
          ]
        },
        inputProps: {
          maxLength: 25,
        },
        component: <Input
          maxLength={25}
          placeholder='请输入用户名'
          allowClear
          disabled={type == 1}
        />,
        colspan: 4,
      },
      {
        name: '真实姓名',
        key: 'realName',
        validate: {
          rules: [{
            validator: async (rule: any, value: string) => {
              if (value) {
                if (value.length != value.trim().length || !realNameReg.test(value)) {
                  return Promise.reject('格式为中文/字母/原点/非首尾的空格');
                }

                return Promise.resolve();
              }
            }
          }],
        },
        inputProps: {
          maxLength: 30,
        },
        colspan: 4,
      },
      {
        name: '性别',
        key: 'gender',
        validate: {
          rules: [{
            required: true,
            message: '请输入性别',
          }]
        },
        colspan: 4,
        component: <Radio.Group>
          <Radio value={1}>男</Radio>
          <Radio value={2}>女</Radio>
        </Radio.Group>
      },
      {
        name: '所属组织',
        key: 'organizationId',
        validate: {
          rules: [{
            required: true,
            message: '请勾选组织'
          }]
        },
        component:
          <PublicTreeSelect
            labelInValue={false}
            treeType='organization'
            placeholder='请勾选组织'
            disabled={type == 1 && userId == getStore('user_id')}
            getPopupContainer={() => getSelectContainer('userSelectContainer')}
          />,
        colspan: 4,
      },
      {
        name: '身份证号',
        key: 'identity',
        validate: {
          rules: [regularText]
        },
        inputProps: {
          maxLength: 18
        }
      },
      {
        name: '电话号码',
        key: 'mobile',
        validate: {
          rules: [onlyNumber],
        },
        inputProps: {
          maxLength: 11
        },
        colspan: 4,
      },
      {
        name: '邮箱',
        key: 'mail',
        validate: {
          rules: [email],
        },
        inputProps: {
          maxLength: 50
        },
        colspan: 4,
      },
      {
        name: '行业',
        key: 'industryId',
        inputProps: {
          maxLength: 18
        },
        component: <IndustrySelect formRef={this.formRef} getPopupContainer={() => getSelectContainer('userSelectContainer')} />,
        colspan: 4,
      },
      {
        name: '身份',
        key: 'userIdentity',
        validate: {
          rules: [regularText]
        },
        inputProps: {
          maxLength: 30
        },
        colspan: 4,
      },
      {
        name: '职务',
        key: 'duty',
        validate: {
          rules: [regularText],
        },
        inputProps: {
          maxLength: 30
        },
        clospan: 4
      },
      {
        name: "科室",
        key: 'administrativeOffice',
        validate: {
          rules: [regularText],
        },
        inputProps: {
          maxLength: 30
        },
        clospan: 4
      },
      {
        name: '授权截止日期',
        key: 'authorizationDate',
        validate: {
          rules: [
            {
              required: true,
            },
            this.checkAuthorizationDate
          ],
        },
        component: <DatePicker
          bordered={false}
          inputReadOnly
          allowClear={false}
          style={{ width: '100%' }}
          placeholder="请输入授权截止日期"
          disabled={type == 1 && userId == getStore('user_id')}
          getPopupContainer={() => getSelectContainer('userSelectContainer')}
        />
      },
      {
        name: '状态',
        key: 'isActive',
        component: <Radio.Group
          disabled={type == 1 && userId == getStore('user_id')}
        >
          <Radio value={0}>停用</Radio>
          <Radio value={1}>启用</Radio>
        </Radio.Group>
      }
    ]
    const formItem: any = {
      name: '密码',
      key: 'password',
      validate: {
        rules: [
          {
            required: true,
            message: '请输入密码',
          },
          {
            min: 6,
            max: 25,
            message: '请输入6-25位字符'
          }
        ]
      },
      inputProps: {
        maxLength: 25,
      },
      colspan: 4,
    }

    if (type == 0) {
      formDom.splice(1, 0, formItem)
    }


    this.setState({
      formDom,
      loading: type == 1
    }, () => {
      if (
        type == 1
        && userId
      ) {
        this.setInputValue(userId);
      }
    })
  }

  /**
   * 获取当前用户信息
   */
  async getUserMsg(userId: string) {
    const params = {
      userId: userId,
    };
    const datas = await getUserMsg<IUserInfo>(params);
    if (datas) {
      return datas;
    }
  }

  /**
   * 修改填充当前用户信息
   */
  async setInputValue(userId: string) {
    const userInfo = await this.getUserMsg(userId);
    if (!userInfo) { return; }
    // delete userInfo.authorizationDate;
    userInfo.authorizationDate = moment(userInfo.authorizationDate, this.dateFormat);
    if (this.formRef.current) {
      this.formRef.current.setFieldsValue(userInfo);
    }
    this.setState({
      loading: false
    });
  }

  /**
   * 授权日期校验
   */
  checkAuthorizationDate = () => ({
    validator: (rule: any, value: string) => {
      if (this.props.loginUser) {
        const { authorizationDate } = this.props.loginUser;
        if (authorizationDate != undefined) {
          const val = moment(value).format(this.dateFormat);

          let error: string;
          if (val < getToday()) {
            error = '授权截止日期必须大于/等于今天!'
            return Promise.reject(error);
          }

          if (this.props.loginUser.username == 'admin' || val <= authorizationDate) {
            return Promise.resolve();
          } else {
            error = '该用户的授权日期不能大于你自己的授权日期!'
            return Promise.reject(error);
          }
        }
      }
      return Promise.resolve();
    },
  })

  /**
   * 检验用户名是否存在
   */
  checkUserName = () => ({
    validator: async (rule: any, value: string) => {
      if (value) {
        const params = {
          username: value
        };
        const datas = await checkUserName(params);
        if (!datas) {
          return Promise.resolve();
        } else {
          return Promise.reject('用户名已经存在');
        }
      }

      return Promise.resolve();
    },
  })

  /**
   * 初始化授权日期
   */
  authorizationDate = (loginUser: IUserDetails) => {
    if (!loginUser) {
      return;
    }

    let date;
    if (loginUser.username == 'admin') {//登录用户为admin，授权日期为两年后的今天
      date = moment(getAfterToday(2), this.dateFormat);
    } else {//登录用户为普通用户时，授权日期为当前登录用户授权日期
      date = moment(loginUser.authorizationDate, this.dateFormat);
    }

    if (this.formRef.current) {
      this.formRef.current.setFieldsValue({
        authorizationDate: date,
        organizationId: loginUser.organizationId
      });
    }
  }

  /**
   * 重置表单
   */
  resetForm = () => {
    if (this.formRef.current) {
      this.formRef.current.resetFields();
    }
  }

  /**
   * 表单提交
   */
  // submit = () => {
  //     const form = this.formRef.current;
  //     if (form) {
  //         form.submit();
  //     }
  // }
  formSubmit = () => {
    if (this.formRef && this.formRef.current) {
      this.formRef.current.validateFields().then((values: any) => {
        const {
          type,
          userId
        } = this.props;

        values = {
          ...values,
          // organizationId: values.organizationId.value ? values.organizationId.value : values.organizationId,
          authorizationDate: moment(values.authorizationDate).format(this.dateFormat)
        }

        switch (type) {
          case 0://新增
            this.addRequest(values);
            break;
          case 1://修改
            values = {
              userId,
              body: values
            }
            this.upDateRequest(values);
            break;
          default:
            break;
        }
      })
    }
  }

  /**
   * 新增
   * @param params 
   */
  async addRequest(values: any) {
    const datas = await addUser(values);
    if (datas) {
      message.success('新增成功');
      this.closeDrawer();
      this.props.reload();
    }
  }

  /**
   * 修改
   * @param params 
   */
  async upDateRequest(params: any) {
    const datas = await updateUser(params);
    if (datas) {
      message.success('修改成功');
      this.closeDrawer();

      const {
        reload,
        closeDetailDrawer
      } = this.props;
      if (typeof closeDetailDrawer == 'function') {
        closeDetailDrawer()
      }
      reload();
    }
  }

  /**
   * 关闭抽屉
   */
  closeDrawer = () => {
    const {
      closeDrawer
    } = this.props;

    this.resetForm();
    closeDrawer();
  }

  render() {
    const {
      visible,
      type,
      getContainer
    } = this.props;
    const {
      formDom,
      loading
    } = this.state;

    return (
      < EditDrawer
        title={type == 0 ? '新增用户' : '修改用户'}
        onClose={this.closeDrawer}
        visible={visible}
        getContainer={getContainer}
        width={560}
        onConfirm={this.formSubmit}
      >

        <Form
          initialValues={{
            password: '123456',
            gender: 1,
            isActive: 1,
          }}
          {...formLayout}
          ref={this.formRef}
          id="userSelectContainer"
          style={{ position: 'relative' }}
        >
          <Row
            justify='space-around'
          >
            <Col span={24}>
              <Newtable
                dataSource={formDom}>
              </Newtable>
            </Col>
          </Row>
        </Form>

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
    )
  }
}

export default UserAddDrawer;
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AllState } from '@/model'
import { message, DatePicker, Radio, Form, Spin } from 'antd'
import {
  getOrgDetail,
  addEnterpriset,
  getEnterpriseDetail,
  modifyEnterpriset,
  checkExists,
} from '@/server/enterpriseAndContract'
import { IDetail } from '../type'
import { EditDrawer } from '@/common'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import PublicTreeSelect from '@/common/publicTreeSelect'
import moment from 'moment'
import { FormInstance } from 'antd/lib/form'
import TableForm from '@/common/tableForm'
import * as rules from '@/framework/utils/regExp'
import { regularText } from '@/common/rules'
import randomString from '@/framework/utils/randomString'
// import { getSelectContainer } from '@/framework/utils/function'

const { RangePicker } = DatePicker

interface IProps {
  type?: number //抽屉类型(新增:0,修改:1)
  visible: boolean
  closeDrawer: Function
  orgId?: string //当前选中上级组织id(新增的时候需要)
  orgName?: string //当前选中上级组织name(新增的时候需要)
  rowId: string
  reload: Function //刷新列表
  getContainer?: 'body'
  closeDetailDrawer?: Function //关闭详情抽屉
  organizationId: string
}

interface IState {
  loading: boolean
  dataSource: any[]
  pid: string //同一组织下的企业名称不可重复
  initEnterpriseName: string
}

class EnterpriseAddDrawer extends Component<IProps, IState> {
  static defaultProps = {
    type: 0,
  }

  formRef: React.RefObject<FormInstance> = React.createRef<FormInstance>()

  constructor(props: IProps) {
    super(props)
    this.state = {
      loading: true,
      /** 数据源格式示例 */
      dataSource: [
        {
          name: '企业名称',
          key: 'name',
          validate: {
            rules: [
              {
                required: true,
                message: '请输入企业名称',
              },
              regularText,
              this.checkEnterpriseName,
            ],
          },
          inputProps: {
            maxLength: 30,
            placeholder: '请输入企业名称',
          },
        },
        {
          name: '管理员账号',
          key: 'enterpriseAdmin',
          validate: {
            rules: [
              {
                required: true,
                message: '请输入管理员账号',
              },
              {
                pattern: rules.mixReg,
                message: '格式不正确',
              },
            ],
          },
          inputProps: {
            disabled: this.props.type == 1,
            maxLength: 25,
            placeholder: '请输入管理员账号',
          },
        },
        {
          name: '组织机构代码',
          key: 'organizationCode',
          inputProps: {
            maxLength: 10,
            placeholder: '请输入组织机构代码',
          },
          validate: {
            rules: [
              {
                pattern: rules.orgCodeReg,
                message: '8位数字或大写字母 + “-” + 1位数字或大写字母',
              },
            ],
          },
        },
        {
          name: '主管单位',
          key: 'pid',
          validate: {
            rules: [
              {
                required: true,
                message: '请选择主管单位',
              },
            ],
          },
          inputProps: {
            maxLength: 10,
            placeholder: '请选择主管单位',
          },
          component: (
            <PublicTreeSelect
              showSearch
              bordered={false}
              labelInValue={false}
              disabled={this.props.type == 1}
              onChange={(id) =>
                this.setState({
                  pid: id,
                })
              }
              treeType="organization"
              placeholder="请选择主管单位"
            />
          ),
        },
        {
          name: '经营许可证号',
          key: 'businessLicenseNo',
          inputProps: {
            maxLength: 30,
            placeholder: '请输入经营许可证号',
          },
          validate: {
            rules: [regularText],
          },
        },
        {
          name: '法人',
          key: 'principal',
          inputProps: {
            maxLength: 30,
            placeholder: '请输入法人',
          },
          validate: {
            rules: [regularText],
          },
        },
        {
          name: '联系人',
          key: 'contactName',
          inputProps: {
            maxLength: 30,
            placeholder: '请输入联系人',
          },
          validate: {
            rules: [regularText],
          },
        },
        {
          name: '联系电话',
          key: 'phone',
          inputProps: {
            maxLength: 20,
            placeholder: '请输入联系电话',
          },
          validate: {
            rules: [
              {
                pattern: rules.NumBarReg,
                message: '格式不正确',
              },
            ],
          },
        },
        {
          name: '成立日期',
          key: 'registerDate',
          inputProps: {
            placeholder: '请选择成立日期',
          },
          component: () => {
            return <DatePicker bordered={false} style={{ width: '100%' }} />
          },
        },
        {
          name: '执照有效期',
          key: 'licenseValidityDateRange',
          component: () => {
            return <RangePicker bordered={false} style={{ width: '100%' }} />
          },
        },
        {
          name: '地址',
          key: 'address',
          inputProps: {
            maxLength: 50,
            placeholder: '请输入地址最多50字',
          },
          validate: {
            rules: [regularText],
          },
        },
        {
          name: '是否审核',
          key: 'auditStatus',
          component: () => {
            return (
              <Radio.Group value={1}>
                <Radio value={1}>开启</Radio>
                <Radio value={0}>关闭</Radio>
              </Radio.Group>
            )
          },
        },
        {
          name: '状态',
          key: 'status',
          component: () => {
            return (
              <Radio.Group value={1}>
                <Radio value={1}>启用</Radio>
                <Radio value={0}>停用</Radio>
              </Radio.Group>
            )
          },
        },
        {
          name: '备注',
          key: 'remark',
          inputProps: {
            maxLength: 150,
            placeholder: '请输入备注最多150字',
          },
          validate: {
            rules: [regularText],
          },
        },
      ],
      pid: '',
      initEnterpriseName: '',
    }
  }
  /**
   * 检验企业名是否存在
   */
  checkEnterpriseName = () => ({
    validator: async (rule: any, value: string) => {
      const { initEnterpriseName } = this.state
      if (value == initEnterpriseName) return Promise.resolve()
      if (value) {
        const params = {
          pid: this.props.organizationId,
          name: value,
        }
        const datas = await checkExists(params)
        if (datas) {
          return Promise.resolve()
        } else {
          return Promise.reject('企业名已经存在')
        }
      }
      return Promise.resolve()
    },
  })
  /**
   * 表单初始值
   */
  initialValues = {
    auditStatus: 1,
    pid: this.props.orgId,
    status: 1,
  }

  UNSAFE_componentWillReceiveProps(nextPros: IProps) {
    const { type, visible, rowId } = nextPros
    if (
      rowId != this.props.rowId ||
      type != this.props.type ||
      visible != this.props.visible
    ) {
      // 新增的设置上级组织机构
      if (type == 0 && visible) {
        this.setState({
          loading: false,
        })
        //设置管理员账号 默认主管单位
        setTimeout(() => {
          this.formRef.current?.setFieldsValue({
            enterpriseAdmin: randomString(8),
            pid: this.props.organizationId,
          })
        }, 300)
      }

      // 修改回显表单数据
      if (type != 0 && visible && rowId + '' != '') {
        this.setState({
          loading: true,
        })
        this.setInputValue(rowId)
      }

      const newDataSource = this.state.dataSource.map((item) => {
        if (item.name == '管理员账号') {
          return {
            name: '管理员账号',
            key: 'enterpriseAdmin',
            validate: {
              rules: [
                {
                  required: true,
                  message: '请输入管理员账号',
                },
                {
                  pattern: rules.mixReg,
                  message: '格式不正确',
                },
              ],
            },
            inputProps: {
              disabled: type == 1,
              maxLength: 25,
              placeholder: '请输入管理员账号',
            },
          }
        } else {
          return item
        }
      })
      this.setState({
        dataSource: newDataSource,
      })
      setTimeout(() => {
        this.formRef.current?.setFieldsValue({
          enterpriseAdmin: randomString(8),
        })
      }, 300)
    }
  }

  componentDidMount() {
    const { type, visible, rowId } = this.props
    // 新增的时候设置上级组织机构
    if (type == 0 && visible) {
      this.setState({
        loading: false,
      })
      this.formRef.current?.setFieldsValue({
        enterpriseAdmin: randomString(8),
        pid: this.props.orgId || this.props.organizationId,
      })
    }

    // 修改回显表单数据
    if (type != 0 && visible && rowId + '' != '') {
      this.setInputValue(rowId)
    }
  }

  /**
   * 设置表单input值
   */
  async setInputValue(rowId: string) {
    this.setState({ loading: true })
    const data: any = await getEnterpriseDetail(rowId)
    if (data) {
      const registerDate = data.registerDate ? moment(data.registerDate) : ''
      const licenseValidityDateRange = [
        data.licenseValidityStartDate
          ? moment(data.licenseValidityStartDate)
          : moment(),
        data.licenseValidityEndDate
          ? moment(data.licenseValidityEndDate)
          : moment(),
      ]
      this.formRef.current?.setFieldsValue({
        ...data,
        registerDate,
        licenseValidityDateRange,
      })
    }
    this.setState({ loading: false, initEnterpriseName: data.name })
  }

  /**
   * 获取组织详情
   */
  async getOrgDetail(id: string) {
    const params = {
      id: id,
    }
    const datas = await getOrgDetail<IDetail>(params)
    if (datas) {
      return datas
    }
  }

  /**
   * 关闭抽屉
   */
  closeDrawer = () => {
    const { closeDrawer } = this.props
    this.setState({
      initEnterpriseName: '',
    })
    this.resetForm()
    closeDrawer()
  }

  /**
   * 重置表单
   */
  resetForm = () => {
    if (this.formRef.current) {
      this.formRef.current.resetFields()
    }
  }

  /**
   * 获取抽屉标题
   */
  getTitle = () => {
    const { type } = this.props
    return type == 0 ? '新增企业' : '修改企业'
  }

  /**
   * 表单提交
   */

  formSubmit = () => {
    const { type } = this.props
    switch (type) {
      case 0: //新增
        this.addRequest()
        break
      case 1: //修改
        this.upDateRequest()
        break
      default:
        break
    }
  }

  /**
   *
   * @param values 格式化表单数据
   */
  handleFormValue = (values: any) => {
    const handledValue = Object.assign({}, values, {
      registerDate: values.registerDate
        ? moment(values.registerDate).format('YYYY-MM-DD')
        : '',
      licenseValidityStartDate: values.licenseValidityDateRange
        ? moment(values.licenseValidityDateRange[0]).format('YYYY-MM-DD')
        : '',
      licenseValidityEndDate: values.licenseValidityDateRange
        ? moment(values.licenseValidityDateRange[1]).format('YYYY-MM-DD')
        : '',
    })
    delete handledValue.licenseValidityDateRange
    return handledValue
  }

  /**
   * 新增
   * @param params
   */
  async addRequest() {
    // 发送请求
    let handledValue = {}
    await this.formRef.current?.validateFields().then((values: any) => {
      handledValue = this.handleFormValue(values)
    })
    const datas = await addEnterpriset(handledValue)
    if (datas) {
      message.success('新增企业成功')
      this.closeDrawer() //关闭抽屉
      this.props.reload()
    }
  }

  /**
   * 修改
   * @param params
   */
  async upDateRequest() {
    // 发送请求
    let handledValue = {}
    await this.formRef.current?.validateFields().then((values: any) => {
      handledValue = this.handleFormValue(values)
    })
    // 发送请求

    const datas = await modifyEnterpriset({
      ...handledValue,
      id: this.props.rowId,
    })
    if (datas) {
      message.success('修改组织成功')
      this.closeDrawer() //关闭抽屉
      const { reload, closeDetailDrawer } = this.props
      reload()
      if (closeDetailDrawer) {
        closeDetailDrawer()
      }
    }
  }

  render() {
    const { visible, getContainer } = this.props

    return (
      <EditDrawer
        title={this.getTitle()}
        onClose={this.closeDrawer}
        // destroyOnClose
        visible={visible}
        getContainer={getContainer}
        width={560}
        onConfirm={this.formSubmit}
      >
        <Form ref={this.formRef} initialValues={this.initialValues}>
          <Spin spinning={this.state.loading}>
            <TableForm dataSource={this.state.dataSource} />
          </Spin>
        </Form>
        {this.props.type == 0 ? (
          <div
            style={{
              fontSize: '12px',
              padding: '10px',
              background: '#fff0ba',
              borderRadius: '4px',
              border: '1px solid #ffd362',
              display: 'flex',
            }}
          >
            <p>
              <ExclamationCircleOutlined
                style={{
                  fontSize: '16px',
                  color: '#ff8d00',
                  background: '#fff',
                  borderRadius: '100%',
                  marginRight: '10px',
                }}
              />
            </p>
            <p>
              新增企业时，根据“管理员账号”自动生成企业管理员系统用户，初始化登录密码为“123456”;
            </p>
          </div>
        ) : null}
      </EditDrawer>
    )
  }
}

export default connect((state: AllState) => ({
  organizationId: state.root.userMessage.organizationId,
}))(EnterpriseAddDrawer)

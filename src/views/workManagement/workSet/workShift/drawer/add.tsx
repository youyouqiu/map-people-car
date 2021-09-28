/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { message, Form, Spin, TimePicker } from 'antd';
import moment from 'moment';
import { addShift, updateShift, getShiftDetailById } from '@/server/workManagement';
// import { getStore } from '@/framework/utils/localStorage';
import { EditDrawer, PublicTreeSelect, TableForm } from '@/common';
import { FormInstance } from 'antd/lib/form';
import { regularText } from '@/common/rules';

// import { getSelectContainer } from '@/framework/utils/function'

const { RangePicker } = TimePicker;

interface IProps {
  type?: number; //抽屉类型(新增:0,修改:1)
  visible: boolean;
  closeDrawer: Function;
  orgId?: string; //当前选中上级组织id(新增的时候需要)
  orgName?: string; //当前选中上级组织name(新增的时候需要)
  rowId: string;
  reload: Function; //刷新列表
  getContainer?: 'body';
  closeDetailDrawer?: Function; //关闭详情抽屉
  userType: number; //用户类型0: 组织用户;1:企业用户
  // enterpriseId: string; // 用户企业Id
  organizationId: string;
  userName: string; //用户名
}

interface IState {
  loading: boolean;
  workType: boolean;
}

class EnterpriseAddDrawer extends Component<IProps, IState> {
  static defaultProps = {
    type: 0,
  };

  formRef: React.RefObject<FormInstance> = React.createRef<FormInstance>();

  constructor(props: IProps) {
    super(props);
    this.state = {
      loading: true,
      workType: false, //false 人工作业  true 车辆作业
    };
  }

  /**
   * 作业类型改变
   */
  handleWorkTypeChange = () => {
    this.setState({
      workType: !this.state.workType,
    });
  };

  /** 数据源格式示例 */
  dataSource = [
    {
      name: '班次名称',
      key: 'shiftName',
      validate: {
        rules: [
          {
            required: true,
            message: '请输入班次名称',
          },
          regularText,
        ],
      },
      inputProps: {
        maxLength: 30,
        placeholder: '请输入班次名称',
      },
    },
    {
      name: '所属企业',
      key: 'enterpriseId',
      validate: {
        rules: [
          {
            required: true,
            message: '请选择企业',
          },
        ],
      },
      component: <PublicTreeSelect labelInValue={false} treeType="enterprise" placeholder="请选择企业" disabled={this.props.userType == 1} />,
    },
    {
      name: '作业时间',
      key: 'workTimeRange',
      validate: {
        rules: [
          {
            required: true,
            message: '请选择作业时间',
          },
        ],
      },
      component: <RangePicker bordered={false} format="HH:mm" />,
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
  ];

  UNSAFE_componentWillReceiveProps(nextPros: IProps) {
    const { type, visible, rowId, userName, userType } = nextPros;

    // 新增的设置上级组织机构
    if (type == 0 && visible) {
      this.setState({
        loading: false,
      }, () => {
        //设置默认主管单位
        if (userName !== 'admin' && userType == 1) {
          this.formRef.current?.setFieldsValue({
            enterpriseId: nextPros.organizationId,
          });
        }
      });
    }

    // 修改回显表单数据
    if (type != 0 && visible && rowId + '' != '') {
      this.setState({
        loading: true,
      });
      this.setInputValue(rowId);
    }
    this.formRef.current?.setFieldsValue({
      enterpriseId: this.props.organizationId,
    });
  }

  componentDidMount() {
    const { type, visible, rowId, organizationId, userName, userType } = this.props;

    // 新增的时候设置上级组织机构
    if (type == 0 && visible) {
      this.setState({
        loading: false,
      });
      if (userName !== 'admin' && userType == 1) {
        this.formRef.current?.setFieldsValue({
          enterpriseId: organizationId,
        });
      }
    }

    // 修改回显表单数据
    if (type != 0 && visible && rowId + '' != '') {
      this.setInputValue(rowId);
    }
  }

  /**
   * 设置表单input值
   */
  async setInputValue(rowId: string) {
    this.setState({ loading: true });
    const data: any = await getShiftDetailById(rowId);
    if (data) {
      const workTimeRange = [moment(data.shiftStart, 'HH:mm'), moment(data.shiftEnd, 'HH:mm')];
      this.formRef.current?.setFieldsValue({
        ...data,
        workTimeRange,
        organizationId: this.props.organizationId,
      });

      //根据作业类型渲染不同表格
      if (data.status == 1) {
        this.setState({
          workType: true,
        });
      } else {
        this.setState({
          workType: false,
        });
      }
    }
    this.setState({ loading: false });
  }

  /**
   * 关闭抽屉
   */
  closeDrawer = () => {
    const { closeDrawer } = this.props;
    this.resetForm();
    closeDrawer();
  };

  /**
   * 重置表单
   */
  resetForm = () => {
    if (this.formRef.current) {
      this.formRef.current.resetFields();
    }
  };

  /**
   * 获取抽屉标题
   */
  getTitle = () => {
    const { type } = this.props;
    return type == 0 ? '新增班次' : '修改班次';
  };

  /**
   * 表单提交
   */

  formSubmit = () => {
    const { type } = this.props;
    switch (type) {
      case 0: //新增
        this.addRequest();
        break;
      case 1: //修改
        this.upDateRequest();
        break;
      default:
        break;
    }
  };

  /**
   *
   * @param values 格式化表单数据
   */
  formatFormValue = (values: any) => {
    const handledValue = Object.assign({}, values, {
      shiftStartStr: values.workTimeRange ? moment(values.workTimeRange[0]).format('HH:mm') : '',
      shiftEndStr: values.workTimeRange ? moment(values.workTimeRange[1]).format('HH:mm') : '',
    });
    delete handledValue.workTimeRange;
    return handledValue;
  };

  /**
   * 新增
   * @param params
   */
  async addRequest() {
    // 发送请求
    let handledValue = {};
    await this.formRef.current?.validateFields().then((values: any) => {
      handledValue = this.formatFormValue(values);
      console.log(handledValue);
    });
    const datas = await addShift({
      ...handledValue,
      organizationId: this.props.organizationId,
    });
    // const datas = true;
    if (datas) {
      message.success('新增班次成功');
      this.closeDrawer(); //关闭抽屉
      this.props.reload();
    }
  }

  /**
   * 修改
   * @param params
   */
  async upDateRequest() {
    let handledValue = {};
    await this.formRef.current?.validateFields().then((values: any) => {
      handledValue = this.formatFormValue(values);
      console.log(handledValue);
    });
    const datas = await updateShift({
      ...handledValue,
      organizationId: this.props.organizationId,
      id: this.props.rowId,
    });
    if (datas) {
      message.success('修改班次成功');
      this.closeDrawer(); //关闭抽屉
      const { reload, closeDetailDrawer } = this.props;
      reload();
      if (closeDetailDrawer) {
        closeDetailDrawer();
      }
    }
  }

  render() {
    const { visible, getContainer } = this.props;

    return (
      <EditDrawer
        title={this.getTitle()}
        onClose={this.closeDrawer}
        visible={visible}
        getContainer={getContainer}
        width={500}
        onConfirm={this.formSubmit}
      >
        <Form ref={this.formRef}>
          <Spin spinning={this.state.loading}>
            <TableForm dataSource={this.dataSource} />
          </Spin>
        </Form>
      </EditDrawer>
    );
  }
}
export default connect((state: AllState) => ({
  userType: state.root.userMessage.userType,
  organizationId: state.root.userMessage.organizationId,
  userName: state.root.userMessage.username,
}))(EnterpriseAddDrawer);

import React, { Component } from 'react';
import { Input, Form, Spin, message } from 'antd';
import { Col } from 'antd';
import { Row } from 'antd';
import { Select } from 'antd';
import { DatePicker } from 'antd';
import styles from './index.module.less';
import { NumBarReg, orgCodeReg, } from '@/framework/utils/regExp';
// import moment from 'moment';
// import { dateFormat } from '@/views/home/workbench/tabAlarm';
import { addOrg, updateOrg, insertOrg, getOrgDetail, checkorGanizationName } from '@/server/orgMgm';
import { IDetail } from '../type';
import IndustrySelect from '@/common/industrySelect';
import { Province, City, Area, EditDrawer } from '@/common';
import { FormInstance } from 'antd/lib/form';
import { onlyNumber, regularText } from '@/common/rules';
import { getSelectContainer } from '@/framework/utils/function';
import Newtable from '@/common/tableForm';

interface IProps {
  type?: number;//抽屉类型(新增:0,修改:1,插入组织:2)
  visible: boolean;
  closeDrawer: Function;
  orgId?: string;//当前选中上级组织id(新增的时候需要)
  orgName?: string;//当前选中上级组织name(新增的时候需要)
  rowId: string;
  reload: Function;//刷新列表
  refreshOrgtTree: Function;//刷新组织树
  getContainer?: 'body';
  closeDetailDrawer?: Function;//关闭详情抽屉
}

interface IState {
  provinceId: string;
  cityId: string;
  areaId: string;
  provinceName: string;
  cityName: string;
  countyName: string;
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

class OrgAddDrawer extends Component<IProps, IState, any> {
  formRef: any = React.createRef<FormInstance>()
  dataSource: any = [
    {
      name: '组织名称',
      key: 'name',
      validate: {
        rules: [
          regularText,
          {
            required: true,
            message: '请输入组织名称',
          }
        ]
      },
      inputProps: {
        maxLength: 30,
      },
      colspan: 4,
    },
    {
      name: '组织机构代码',
      key: 'organizationCode',
      validate: {
        rules: [{
          pattern: orgCodeReg,
          message: '8位数字或大写字母 + “-” + 1位数字或大写字母',
        }]
      },
      inputProps: {
        maxLength: 10,
      },
      colspan: 4,
    },
    {
      name: '上级组织',
      key: 'parentName',
      inputProps: {
        disabled: true
      },
      colspan: 4
    },
    {
      name: '省份',
      key: 'provinceCode',
      component: <Province
        onChange={(v: string, option: Array<any>) => {
          this.setState({
            provinceId: v,
            provinceName: (option as any).children[1],
            cityId: '',
            cityName: ''
          });

          // 重置市value值
          if (this.formRef && this.formRef.current) {
            this.formRef.current.setFieldsValue({
              cityCode: '',
              areaNumber: '',
              // countyCode: '',
            });
          }
        }}
        getPopupContainer={() => getSelectContainer('orgSelectContainer')}
      />,
      colspan: 4
    },
    {
      name: '地市',
      key: 'cityCode',
      component: () => {
        const {
          provinceId,
        } = this.state;

        return (
          <City
            pid={provinceId}
            onChange={(v: string, option: Array<any>) => {
              if (option.length != 0) {
                const name = (option as any).children[1];

                this.setState({
                  cityName: name,
                  cityId: v,
                  areaId: '',
                  countyName: '',
                });

                // 重置区value值
                if (this.formRef && this.formRef.current) {
                  this.formRef.current.setFieldsValue({
                    countyCode: '',
                    areaNumber: ''
                  });
                }
              }
            }}
            getPopupContainer={() => getSelectContainer('orgSelectContainer')}
          />
        )
      },
      colspan: 4
    },
    {
      name: '区县',
      key: 'countyCode',
      component: () => {
        const {
          cityId,
        } = this.state;

        return (
          <Area pid={cityId}
            onChange={(v: string, option: Array<any>) => {
              if (option.length != 0) {
                const name = (option as any).children[1];
                this.setState({
                  areaId: v,
                  countyName: name,
                });
                this.formRef.current.setFieldsValue({
                  areaNumber: v
                });
              }
            }}
            getPopupContainer={() => getSelectContainer('orgSelectContainer')}
          />
        )
      },
      colspan: 4
    },
    {
      name: '行政区划代码',
      key: 'areaNumber',
      validate: {
        rules: [onlyNumber]
      },
      colspan: 4,
      inputProps: {
        maxLength: 6
      },
    },
    {
      name: '联系人',
      key: 'contactName',
      validate: {
        rules: [regularText]
      },
      inputProps: {
        maxLength: 30,
      },
      colspan: 4
    },
    {
      name: '联系电话',
      key: 'phone',
      validate: {
        rules: [{
          pattern: NumBarReg,
          message: '请填写正确的联系电话',
        }]
      },
      inputProps: {
        maxLength: 20,
      },
      colspan: 4
    },
    {
      name: '地址',
      key: 'address',
      validate: {
        rules: [regularText]
      },
      inputProps: {
        maxLength: 50,
      },
      colspan: 4
    },
    {
      name: '备注',
      key: 'remark',
      validate: {
        rules: [regularText]
      },
      inputProps: {
        maxLength: 150,
      },
      colspan: 4
    }

  ];

  constructor(props: IProps) {
    super(props);

    this.state = {
      provinceId: '',
      cityId: '',
      areaId: '',
      provinceName: '',
      cityName: '',
      countyName: '',
      loading: true,
    }
  }

  UNSAFE_componentWillReceiveProps(nextPros: IProps) {
    const {
      type,
      visible,
      rowId,
      orgName,
      orgId
    } = nextPros;

    if (this.props.visible == visible) { return }

    // 新增的设置上级组织机构
    if (type == 0 && visible) {
      this.setState({
        loading: false
      }, () => {
        (this.formRef.current as any).setFieldsValue({
          parentName: orgName,
          pid: orgId
        });
      })
    }

    // 修改回显表单数据
    if (type != 0
      && visible
      && rowId != ''
    ) {
      this.setState({
        loading: true
      })
      this.setInputValue(rowId, type);
    }
  }

  componentDidMount() {
    const {
      type,
      visible,
      rowId,
      orgName,
      orgId
    } = this.props;

    // 新增的时候设置上级组织机构
    if (type == 0 && visible) {
      (this.formRef.current as any).setFieldsValue({
        pid: orgId,
        parentName: orgName,

      });

      this.setState({
        loading: false
      })
    }

    // 修改回显表单数据
    if (type != 0
      && visible
      && rowId != ''
    ) {
      this.setInputValue(rowId, type);
    }
  }

  /**
   * 设置表单input值
   */
  async setInputValue(rowId: string, type?: number) {

    const dataSource: any = await this.getOrgDetail(rowId);

    if (!dataSource) { return; }

    if (type == 2) {//插入组织上级组织机构赋值
      (this.formRef.current as any).setFieldsValue({
        parentName: dataSource.parentName,
        pid: dataSource.pid,
      });
    } else if (type == 1) {//修改赋值
      this.updateData(dataSource)
    }

    this.setState({
      loading: false
    });
  }
  updateData = (dataSource: IDetail) => {
    (this.formRef.current as any).setFieldsValue(dataSource);

    const {
      provinceCode,
      cityCode,
      countyCode,
      provinceName,
      cityName,
      countyName,
    } = dataSource;
    this.setState({
      provinceId: provinceCode ? provinceCode : '',
      cityId: cityCode ? cityCode : '',
      areaId: countyCode ? countyCode : '',
      provinceName: provinceName || '',
      cityName: cityName || '',
      countyName: countyName || '',
    })
  }

  /**
   * 获取组织详情
   */
  async getOrgDetail(id: string) {
    const params = {
      id: id
    };
    const datas = await getOrgDetail<IDetail>(params);
    if (datas) {
      return datas;
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

  /**
   * 重置表单
   */
  resetForm = () => {
    if (this.formRef.current) {
      (this.formRef.current as any).resetFields();
    }
  }

  /**
   * 获取抽屉标题
   */
  getTitle = () => {
    const {
      type
    } = this.props;

    if (type == 0) {
      return '新增组织';
    } else if (type == 1) {
      return '修改组织';
    } else {
      return '插入上级组织';
    }
  }

  /**
   * 表单提交
   */
  formSubmit = () => {
    if (this.formRef && this.formRef.current) {
      this.formRef.current.validateFields().then(async (values: any) => {
        const {
          type,
          rowId
        } = this.props;
        const {
          countyName,
          provinceName,
          cityName
        } = this.state;

        values = {
          countyName,
          provinceName,
          cityName,
          ...values,
        }


        if (values.provinceCode == '') {
          values.provinceName = '';
          values.countyName = ''
        }

        const params = {
          name: values.name,
          pid: values.pid,
          id: rowId
        }

        const checkName = await checkorGanizationName(params);
        if (!checkName) {
          message.warn('组织名称已经存在')
          return;
        }



        switch (type) {
          case 0://新增
            this.addRequest(values);
            break;
          case 1://修改
            values = {
              id: rowId,
              ...values,
            }
            this.upDateRequest(values);
            break;
          case 2://插入组织
            values = {
              id: rowId,
              ...values
            }
            this.insertRequest(values);
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
    const datas = await addOrg(values);
    if (datas) {
      message.success('新增组织成功');
      this.closeDrawer();//关闭抽屉
      this.props.reload();
      this.props.refreshOrgtTree();
    }
  }

  /**
   * 修改
   * @param params 
   */
  async upDateRequest(params: any) {
    const datas = await updateOrg(params);
    if (datas) {
      message.success('修改组织成功');
      this.closeDrawer();//关闭抽屉
      const {
        reload,
        closeDetailDrawer
      } = this.props;
      reload();
      this.props.refreshOrgtTree();
      if (closeDetailDrawer) {
        closeDetailDrawer();
      }
    }
  }

  /**
   * 插入
   * @param params 
   */
  async insertRequest(params: any) {
    const datas = await insertOrg(params);
    if (datas) {
      message.success('插入组织成功');
      this.closeDrawer();//关闭抽屉
      this.props.refreshOrgtTree();
      this.props.reload();
    }
  }

  render() {
    const {
      visible,
      getContainer,
    } = this.props;

    const {
      loading
    } = this.state;

    return (
      <EditDrawer
        title={this.getTitle()}
        onClose={this.closeDrawer}
        visible={visible}
        getContainer={getContainer}
        width={560}
        onConfirm={this.formSubmit}
      >
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
          <Form
            {...formLayout}
            ref={this.formRef}
            id="orgSelectContainer"
            style={{ position: 'relative' }}
          >
            <Row
              justify='space-around'
            >
              <Col
                span={24}
              >
                <Newtable
                  dataSource={this.dataSource}
                ></Newtable>
                <Form.Item
                  label=''
                  name='pid'
                  style={{ display: 'none' }}
                >
                  <Input
                    type="hidden"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
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
    )
  }
}

export default OrgAddDrawer;

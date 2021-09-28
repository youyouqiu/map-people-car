import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { message, Select, Form, Tabs } from 'antd';
import { getOrgDetail } from '@/server/orgMgm';
import { getSectionsById, getLeaderList, getModeList, addWorkObject, getWorkObjectDetail, modifyWorkObject } from '@/server/workObject';
import { getEnterpriseByOrgId } from '@/server/enterpriseAndContract';
import { EditDrawer, TableForm } from '@/common';
import AddMap, { Lnglat } from '@/common/map/add';
import ModifyMap, { FenceType } from '@/common/map/modify';
import LastDetail from './lastDetail';
import { FormInstance } from 'antd/lib/form';
import PublicTreeSelect from '../../../publicTreeSelect';
import DynamicForm from '../../../publicCommon/dynamicForm/dynamicForm';
import { regularText } from '@/common/rules';
import AlarmSetting from '../../../alarmSetting';
import styles from './index.module.less';

const { Option } = Select;
const { TabPane } = Tabs;

interface IProps {
  type?: number; //抽屉类型(新增:0,修改:1,插入组织:2)
  organizationId: string; //当前用户组织id
  visible: boolean;
  closeDrawer: Function;
  orgId?: string; //当前选中上级组织id(新增的时候需要)
  orgName?: string; //当前选中上级组织name(新增的时候需要)
  rowId: string;
  reload: Function; //刷新列表
  refreshOrgtTree: Function; //刷新组织树
  getContainer?: 'body';
  industryName: string; //当前用户所在企业
  closeDetailDrawer?: Function; //关闭详情抽屉
  userName: string; //用户名
}

interface IState {
  loading: boolean;
  dataSource1: any[];
  initValue: any;
  fenceType: FenceType;
  initPath: Lnglat | Lnglat[];
  newLogLat: Lnglat | Lnglat[]; //新增的经纬度信息
  sectionLonLat: Lnglat; //处理之后的围栏信息，将被传递给Map地图组件
  rowSectionLonLat: any[]; //原始标段围栏信息
  modeList: any[]; //作业模式下拉框列表
  detailModeList: any[]; // 作业模式详情数据
  rowData: {
    // 原始作业对象数据 包含当前排班和之前的排班
    curWorkObject: any; //当前作业对象
    lastApproveWorkObject: any; //历史生效的作业对象
  };
  workAlarmParameterSettingResps: any; //报警设置数据
}

interface IDetail {
  test?: string;
}

class AreaAddDrawer extends Component<IProps, IState> {
  static defaultProps = {
    type: 0,
  };
  formRef: React.RefObject<FormInstance> = React.createRef<FormInstance>();
  alarmSettingFormRef: any;
  constructor(props: IProps) {
    super(props);
    this.state = {
      fenceType: 3,
      loading: true,
      modeList: [],
      detailModeList: [],
      rowData: {
        curWorkObject: null,
        lastApproveWorkObject: null,
      },
      rowSectionLonLat: [],
      sectionLonLat: [],
      dataSource1: [
        {
          name: '作业区域名称',
          key: 'workName',
          nameWidth: 160,
          validate: {
            rules: [
              {
                required: true,
                message: '作业区域名称',
              },
              regularText,
            ],
          },
          inputProps: {
            maxLength: 30,
            placeholder: '作业区域名称',
          },
        },
        {
          name: '主管单位',
          key: 'orgName',
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
          component: () => {
            return (
              <PublicTreeSelect
                treeInit={this.orgNameInit}
                orgId={this.props.orgId}
                onSelect={(value: any) => {
                  this.handleOrganizationChange(value);
                }}
                // disabled={this.props.userName != 'admin'}
                treeType="organization"
              />
            );
          },
        },
        {
          name: '负责企业',
          key: 'enterprise',
          inputProps: {
            // disabled: true,
          },
          component: <Select bordered={false} placeholder="请选择"></Select>,
        },
        {
          name: '所属标段',
          key: 'sectionId',
          validate: {
            rules: [
              {
                required: true,
                message: '请选择所属标段',
              },
            ],
          },
          component: () => {
            return <Select style={{ width: '100%' }} bordered={false}></Select>;
          },
        },
        {
          name: '面积(m²)',
          key: 'area',
          inputProps: {
            maxLength: 3,
            placeholder: '请绘制作业区域',
            disabled: true,
          },
          validate: {
            rules: [
              {
                required: true,
                message: '请输入面积(m)',
              },
            ],
          },
        },
        {
          name: '管理组长',
          key: 'groupLeaderId',
          validate: {
            rules: [
              {
                required: true,
                message: '请选择管理组长位',
              },
            ],
          },
          component: () => {
            return <Select style={{ width: '100%' }} bordered={false}></Select>;
          },
        },
        {
          name: () => <><span style={{marginRight: '2px',verticalAlign: '-2px',color: '#ff4d4f'}}>*</span>作业模式</>,
          key: 'workModeList',
          validate:{
            rules: [
              {
                validator: () => {
                  return this.state.detailModeList.length == 0 ? Promise.reject(new Error('请输入作业模式')) : Promise.resolve()
                },
              }
            ]
          },
          component: () => {
            return <DynamicForm modeList={this.state.modeList} modeDetail={this.state.detailModeList} setModeList={this.setModeList} />;
          },
        },
        {
          name: '负责人',
          key: 'contactName',
          inputProps: {
            placeholder: '请输入项目负责人',
          },
        },
        {
          name: '负责人电话',
          key: 'contactPhone',
          inputProps: {
            maxLength: 11,
            placeholder: '请输入负责人电话',
          },
          validate: {
            rules: [
              {
                pattern: /^\d{11}$/,
                message: '格式不正确',
              },
            ],
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
      initPath: [],
      newLogLat: [],
      initValue: {
        orgName: { value: this.props.userName === 'admin' ? this.props.organizationId + '' : '' },
      },
      workAlarmParameterSettingResps: []
    };
    this.alarmSettingFormRef = React.createRef();
  }

  /**
   * 企业用户默认选中其所属的组织及企业
   * @param data
   */
  orgNameInit = (data: any) => {
    if (this.props.userName === 'admin') return;
    if (data && data[0]) {
      this.handleEnterpriseChange(this.props.organizationId);
      this.formRef.current?.setFieldsValue({
        orgName: data[0].id,
        enterprise: this.props.organizationId,
      });
    }
  };
  //主管单位改变时 动态改变负责企业
  handleOrganizationChange = async (value: string) => {
    const data = await getEnterpriseByOrgId<any>(value ? [value] : []);
    if (data) {
      const newOption = data.map((item: any) => {
        return <Option key={item.id} disabled={item.status == 0} value={item.id}>{item.name}</Option>;
      });
      const newDataSource1 = this.state.dataSource1.map((item) => {
        if (item.name != '负责企业') {
          return item;
        } else {
          return {
            ...item,
            component: (
              <Select
                bordered={false}
                placeholder="请选择"
                onChange={(value) => {
                  this.handleEnterpriseChange(value);
                }}
              >
                {newOption}
              </Select>
            ),
          };
        }
      });
      this.setState({
        dataSource1: [...newDataSource1],
      });
      this.formRef.current?.setFieldsValue({
        enterprise: this.props.userName !== 'admin' ? this.props.organizationId : '',
      });
    }
  };

  //负责企业改变时，获取相对应的 标段、组长、作业模式 下拉选择框
  handleEnterpriseChange = async (value: any) => {
    const data = Promise.all([
      await getSectionsById<any>({ enterpriseId: value }),
      await getLeaderList<any>({ enterpriseId: value }),
      await getModeList<any>({ enterpriseId: value }),
    ]);
    await data.then(([sectionRes, groupLeaderRes, modeListRes]) => {
      if (sectionRes && groupLeaderRes && modeListRes) {
        this.setState({
          rowSectionLonLat: sectionRes,
          modeList: modeListRes,
        });
        const renderOption = (options: any[]) => {
          const res = options.map((item: any) => {
            return (
              <Option value={item.id} key={item.id}>
                {item.name}
              </Option>
            );
          });
          return res;
        };
        const newDataSource1 = this.state.dataSource1.map((item) => {
          if (item.name == '所属标段') {
            return {
              ...item,
              component: (
                <Select
                  style={{ width: '100%' }}
                  bordered={false}
                  onChange={(value: any) => {
                    this.handleSectionChange(value);
                  }}
                >
                  {renderOption(sectionRes)}
                </Select>
              ),
            };
          } else if (item.name == '管理组长') {
            return {
              ...item,
              component: (
                <Select style={{ width: '100%' }} bordered={false} key={Math.random()}>
                  {renderOption(groupLeaderRes)}
                </Select>
              ),
            };
          }
          return item;
        });
        this.setState({
          dataSource1: [...newDataSource1],
        });
        //重置上面两个选择框的默认值
        this.formRef.current?.setFieldsValue({
          groupLeaderId: '',
          sectionId: '',
        });
      }
    });
  };
  //初始化 或者 标段改变时，设置不同的电子围栏
  handleSectionChange = async (id: string) => {
    if (this.state.rowSectionLonLat.length > 0) {
      this.state.rowSectionLonLat.forEach((item) => {
        if (item.id == id) {
          this.setState({
            sectionLonLat: JSON.parse(item.extendJson),
          });
        }
      });
    }
  };
  //新增经纬度信息
  setLanLat = (data: [number, number][]) => {
    this.setState({
      newLogLat: data,
    });
  };
  setArea = (area: number) => {
    console.log(area);
    if (this.formRef.current) {
      this.formRef.current.setFieldsValue({
        area: area,
      });
    }
  };
  setFenceType = (fenceType: FenceType) => {
    this.setState({
      fenceType
    })
  }
  //设置作业模式
  setModeList = (value: any[]) => {
    this.formRef.current?.validateFields()
    this.setState({
      detailModeList: value,
    });
  };
  UNSAFE_componentWillReceiveProps(nextPros: IProps) {
    const { type, visible, rowId, userName, organizationId } = nextPros;
    // 新增的设置上级组织机构
    if (type == 0 && visible) {
      this.setState({
        loading: false,
      });
      this.handleOrganizationChange(userName === 'admin' ? organizationId + '' : '');
    }

    // 修改回显表单数据
    if (type != 0 && visible && rowId != '') {
      this.setState({
        loading: true,
      });
      this.setInputValue(rowId);
    }
  }

  componentDidMount() {
    const { type, visible, rowId, userName, organizationId } = this.props;

    this.handleOrganizationChange(userName === 'admin' ? organizationId + '' : '');

    // 新增的时候设置上级组织机构
    if (type == 0 && visible) {
      this.setState({
        loading: false,
      });
    }

    // 修改回显表单数据
    if (type != 0 && visible && rowId != '') {
      this.setInputValue(rowId);
    }
  }

  /**
   * 设置表单input值
   */
  async setInputValue(rowId: string) {
    this.setState({
      loading: false,
    });
    const data = await getWorkObjectDetail<any>(rowId);
    //获取数据 this.formRef.current 有可能为空
    if (data) {
      this.setState({
        rowData: data,
      });
      const {
        id,
        workName,
        area,
        workType,
        sectionId,
        orgId,
        enterpriseId,
        reviewStatus,
        contactName,
        contactPhone,
        groupLeaderId,
        groupLeader,
        updateDataTime,
        updateDataUsername,
        roadLength,
        roadWidth,
        remark,
        sectionLongLat,
        longLat,
        workModeList,
        workFenceType,
        workAlarmParameterSettingResps
      } = data.curWorkObject;
      this.setState({
        sectionLonLat: JSON.parse(sectionLongLat), //标段围栏
        newLogLat: longLat, //路线经纬度
        initPath: longLat,
        detailModeList: workModeList, //作业模式详情
        fenceType: workFenceType || 3,
        workAlarmParameterSettingResps
      });
      this.handleOrganizationChange(orgId);
      await this.handleEnterpriseChange(enterpriseId);
      if (this.formRef.current) {
        //先设置简单的表单值
        this.formRef.current?.setFieldsValue({
          id,
          workName,
          workType,
          area,
          sectionId: sectionId,
          orgId,
          orgName: orgId,
          enterprise: enterpriseId,
          reviewStatus,
          contactName,
          contactPhone,
          groupLeaderId: groupLeaderId,
          groupLeader,
          updateDataTime,
          updateDataUsername,
          roadLength,
          roadWidth,
          remark,
        });
      }
    }
  }

  /**
   * 获取组织详情
   */
  async getOrgDetail(id: string) {
    const params = {
      id: id,
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
    this.resetForm();
    this.props.closeDrawer();
    this.setState({
      modeList: [],
      sectionLonLat: [],
      detailModeList: [],
    });
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
    return type == 0 ? '新增作业区域' : '修改作业区域';
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
   * 格式化表单上传数据
   * @param values
   */
  formatFormData = (values: any) => {
    const res = {
      ...values,
      longLat: this.state.newLogLat,
      workType: 2,
      workModeList: this.state.detailModeList,
      fenceType: this.state.fenceType
    };
    delete res.orgName;
    return res;
  };

  /**
   * 新增
   * @param params
   */
  async addRequest() {
    let data: any;
    // 发送请求
    if (this.formRef.current) {
      await this.formRef.current.validateFields().then((values: any) => {
        console.log(this.formatFormData(values));
        data = this.formatFormData(values);
      });
    }

    if (this.alarmSettingFormRef) {
      await this.alarmSettingFormRef.current.formRef.validateFields().then((values: any) => {
        const alarmData = this.formatFormAlarmData(values);
        data.alarmParameterSettingDtos = alarmData;
      });
    }
    if (this.state.newLogLat.length == 0) {
      return message.error('请绘制作业区域');
    }
    const datas = await addWorkObject<any>(data);
    if (datas) {
      message.success('新增作业区域成功');
      this.closeDrawer(); //关闭抽屉
      this.props.reload();
      this.props.refreshOrgtTree();
    }
  }

  /**
   * 修改
   * @param params
   */
  async upDateRequest() {
    let data: any;
    if (this.formRef.current) {
      await this.formRef.current.validateFields().then((values: any) => {
        console.log(this.formatFormData(values));
        data = this.formatFormData(values);
      });
    }

    if (this.alarmSettingFormRef) {
      await this.alarmSettingFormRef.current.formRef.validateFields().then((values: any) => {
        const alarmData = this.formatFormAlarmData(values);
        data.alarmParameterSettingDtos = alarmData;
      });
    }
    if (this.state.newLogLat.length == 0) {
      return message.error('请绘制作业区域');
    }
    // 发送请求
    const datas = await modifyWorkObject<any>(data, this.props.rowId);
    if (datas) {
      message.success('修改作业区域成功');
      this.closeDrawer(); //关闭抽屉
      const { reload, closeDetailDrawer } = this.props;
      reload();
      if (closeDetailDrawer) {
        closeDetailDrawer();
      }
    }
  }

  /**
   * 报警设置
   */
  formatFormAlarmData = (values: any) => {
    const data: any = [];
    this.state.detailModeList.forEach((item: any) => {
      const stayOvertime: any = {}, leaveTime = {}, gatherTime = {}, gatherScope = {}, workSpeed = {};
      const workModeId = item.workModeId;
      for (const key in values) {
        const keyArr = key.split('_');
        const name = keyArr[0].split('-');
        const alarmType = keyArr[1];
        const id = keyArr[2];

        if (workModeId == id) {
          switch (name[0]) {
            case 'stayOvertime':
              this.formatAlarmItem(id, name, alarmType, values[key], values, stayOvertime);
              break;
            case 'leaveTime':
              this.formatAlarmItem(id, name, alarmType, values[key], values, leaveTime);
              break;
            case 'gatherTime':
              this.formatAlarmItem(id, name, alarmType, values[key], values, gatherTime);
              break;
            case 'gatherScope':
              this.formatAlarmItem(id, name, alarmType, values[key], values, gatherScope);
              break;
            case 'workSpeed':
              this.formatAlarmItem(id, name, alarmType, values[key], values, workSpeed);
              break;
          }
        }
      }

      if (item.workType == 1) {
        data.push(stayOvertime, leaveTime, gatherTime, gatherScope);
      } else if (item.workType == 0) {
        data.push(stayOvertime, leaveTime, workSpeed);
      }
    });
    return data;
  }

  formatAlarmItem = (id: string, name: any, alarmType: string, value: any, values: any, origin: any) => {
    if (name[1] == 'alarmPush') origin.alarmPush = value ? 1 : 0;
    if (name[1] == 'parameterValue') origin.parameterValue = value == '' ? 0 : value;

    if (name[0] == 'gatherScope') {
      origin.paramCode = 'param2';
    } else {
      origin.paramCode = 'param1';
    }

    if (name[0] == 'gatherScope' || name[0] == 'gatherTime') {
      const key = `gather-alarmPush_${alarmType}_${id}`;
      origin.alarmPush = values[key] ? 1 : 0
    }

    origin.pos = alarmType;
    origin.modeId = id;
    origin.workId = this.props.rowId;
    origin.flag = 1;
  }

  render() {
    const { visible, getContainer, type } = this.props;
    const { detailModeList, workAlarmParameterSettingResps } = this.state;

    return (
      <div className={styles.drawer}>
        <EditDrawer
          title={this.getTitle()}
          onClose={this.closeDrawer}
          destroyOnClose={true}
          visible={visible}
          getContainer={getContainer}
          width={1200}
          onConfirm={this.formSubmit}
        >
          <Tabs defaultActiveKey='1'>
            <TabPane forceRender={true} key='1' tab='基础信息'>
              <div style={{ display: 'flex' }}>
                {/* 表单 */}
                <div className="form">
                  <Form ref={this.formRef} style={{ width: '450px' }} initialValues={this.state.initValue}>
                    <TableForm dataSource={this.state.dataSource1} />
                  </Form>
                </div>
                {/* 地图 */}
                <div className="map" style={{ width: '700px', marginLeft: '14px', height: '410px' }}>
                  {/* 根据新增还是修改展示不同地图 */}
                  {this.props.type == 0 ? (
                    visible ? (
                      <AddMap
                        type='polygon'
                        toolOptions={['polygon']}
                        fences={this.state.sectionLonLat}
                        calcType={0} // 0计算面积  1计算长度
                        setArea={this.setArea}
                        setLngLat={this.setLanLat}
                        setFenceType={this.setFenceType}
                      />
                    ) : null //抽屉隐藏时销毁实例
                  ) : (
                    <ModifyMap
                      type='polygon'
                      toolOptions={['polygon']}
                      calcType={0}
                      path={this.state.initPath}
                      fences={this.state.sectionLonLat}
                      setLngLat={this.setLanLat}
                      setArea={this.setArea}
                      setFenceType={this.setFenceType}
                    />
                  )}
                </div>
              </div>
              <div>
                {/* 原排班 */}
                {this.props.type != 0 ? <LastDetail allWorkList={this.state.rowData} /> : null}
              </div>
            </TabPane>
            <TabPane forceRender={true} key='2' tab='报警设置'>
              <AlarmSetting
                detailModeList={JSON.parse(JSON.stringify(detailModeList))}
                workAlarmParameterSettingResps={workAlarmParameterSettingResps}
                type={type}
                ref={this.alarmSettingFormRef}
              />
            </TabPane>
          </Tabs>
        </EditDrawer>
      </div>
    );
  }
}
export default connect((state: AllState) => ({
  organizationId: state.root.userMessage.organizationId,
  industryName: state.root.userMessage.industryName,
  userName: state.root.userMessage.username,
}))(AreaAddDrawer);

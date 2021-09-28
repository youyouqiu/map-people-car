/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Component } from 'react';
import { DetailDrawer, OperatorContainer } from '@/common';
import { Tabs, Row, Col, Input, Form, Table, Spin } from 'antd';
import styles from './index.module.less';
import TableForm from '@/common/tableForm';
import AuditsMap from '../component/auditsMap';
import { getCurrentDetail } from '@/server/auditsManagement';
import { workObjectItem } from '../type'
import moment from 'moment';
const { TabPane } = Tabs;
const { TextArea } = Input;

interface IProps {
  visible: boolean;
  closeDrawer: Function;
  workId: string;
  hasPermission: Function;
  enterpriseId: string;
}

interface IState {
  tabActiveKey: string;
  tableFormSource: any;
  lnglat: any;
  workType: number | undefined,
  detailData: any,
  loading: boolean,
  rosterDetailSource: any,
}

const textRender = (data: any, record: any) => {
  if (data) {
    const monitorId = record.monitorId;

    return (
      <ul style={{ textAlign: 'left' }}>
        {
          data.map((item: any, index: number) => {
            const text = item.split(',')
            const key = `${monitorId}_${index}`;
            return (
              <li key={key}>
                <span style={{ display: 'inline-block', width: 45 }}>{`${text[0]}:`}</span>
                <span>{text[1]}</span>
              </li>
            )
          })
        }
      </ul>
    )
  }
}


const rosterDetailColumns: any = [
  {
    title: '监控对象',
    dataIndex: 'monitorName',
    key: 'monitorName',
    align: 'center',
    width: 160,
    render: (text: any, record: any) => {
      const modeName = record.modeName;
      return (
        <div>
          <span style={{ position: 'relative' }}>{text}</span>
          <br />
          <span style={{ marginTop: 8, marginRight: 12 }}>{`(${modeName ? modeName : '--'})`}</span>
        </div>
      )
    }
  },
  {
    title: '星期一',
    dataIndex: 'mondayShow',
    key: 'mondayShow',
    align: 'center',
    width: 160,
    render: (text: any, record: any) => {
      return textRender(text, record);
    }

  },
  {
    title: '星期二',
    dataIndex: 'tuesdayShow',
    key: 'tuesdayShow',
    align: 'center',
    width: 160,
    render: (text: any, record: any) => {
      return textRender(text, record);
    }
  },
  {
    title: '星期三',
    dataIndex: 'wednesdayShow',
    key: 'wednesdayShow',
    align: 'center',
    width: 160,
    render: (text: any, record: any) => {
      return textRender(text, record);
    }
  },
  {
    title: '星期四',
    dataIndex: 'thursdayShow',
    key: 'thursdayShow',
    align: 'center',
    width: 160,
    render: (text: any, record: any) => {
      return textRender(text, record);
    }
  },
  {
    title: '星期五',
    dataIndex: 'fridayShow',
    key: 'fridayShow',
    align: 'center',
    width: 160,
    render: (text: any, record: any) => {
      return textRender(text, record);
    }
  },
  {
    title: '星期六',
    dataIndex: 'saturdayShow',
    key: 'saturdayShow',
    align: 'center',
    width: 160,
    render: (text: any, record: any) => {
      return textRender(text, record);
    }
  },
  {
    title: '星期天',
    dataIndex: 'sundayShow',
    key: 'sundayShow',
    align: 'center',
    width: 160,
    render: (text: any, record: any) => {
      return textRender(text, record);
    }
  },
]


class AuditDetailDrawer extends Component<IProps, IState, any>{
  formRef: any = React.createRef();
  constructor(props: IProps) {
    super(props)
    this.state = {
      tabActiveKey: '1',
      tableFormSource: [],
      lnglat: [],
      workType: undefined,
      detailData: undefined,
      loading: true,
      rosterDetailSource: []
    }
  }

  componentDidMount() {
    const { workId, enterpriseId } = this.props
    this.onCurrentDetail(workId, enterpriseId);
  }

  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { workId, enterpriseId, visible } = nextProps;

    if (this.formRef) {
      this.formRef.current.resetFields();
    }

    if (workId && enterpriseId && visible) {
      this.setState({
        loading: true,
        tableFormSource: []
      });

      this.onCurrentDetail(workId, enterpriseId);
    }
  }

  /**
   * 获取当前详情数据
   */
  async onCurrentDetail(workId: string, enterpriseId: string) {
    const param = {
      workId,
      enterpriseId
    }
    const detailResponse: any = await getCurrentDetail(param);

    if (detailResponse) {
      const currentDetail = detailResponse.currentWorkObjectDetail;
      const rosterDetail = detailResponse.currentMonitorShift;
      const workModeList = currentDetail.workModeList;

      this.currentDataAssembly(currentDetail, workModeList);

      this.setState({
        workType: currentDetail.workType,
        lnglat: currentDetail.longLat,
        detailData: currentDetail,
        rosterDetailSource: rosterDetail
      });
    }
  }

  /**
   * 基本信息数据组装
   */
  currentDataAssembly = (currentDetail: any, workModeList: Array<any>) => {
    let workTypeStr = '';
    const detailSource: any = [];

    const facilityNum = !currentDetail.extendObj ? '' : currentDetail.extendObj.facilityNum;
    const sourceItem: any = {
      workName: currentDetail.workName,
      workType: currentDetail.workType,
      enterpriseName: currentDetail.enterpriseName,
      sectionName: currentDetail.sectionName,
      roadWidth: currentDetail.roadWidth,
      roadLength: currentDetail.roadLength,
      area: currentDetail.area,
      facilityNum: facilityNum,
      groupLeader: currentDetail.groupLeader,
      contactName: currentDetail.contactName,
      contactPhone: currentDetail.contactPhone,
      remark: currentDetail.remark,
    };

    this.workTypeRenderChange(currentDetail.workType, sourceItem);

    const data = Object.getOwnPropertyNames(sourceItem);

    data.map((key: string) => {
      const sourceItem = {
        name: this.labalRender(key),
        key: key
      }
      detailSource.push(sourceItem);
    });


    let workModeItem;
    workModeList.map((item) => {
      workModeItem = {
        name: item.workModeName,
        key: item.workModeId
      };

      currentDetail[item.workModeId] = this.workModeUnit(item.workType, item.unitType, item.workNum);
      detailSource.splice(7, 0, workModeItem);
    });


    if (currentDetail.workType == 1) {
      workTypeStr = '作业线路'
    } else if (currentDetail.workType == 2) {
      workTypeStr = '作业区域'
    } else {
      workTypeStr = '清运区域'
    }

    currentDetail.workType = workTypeStr;
    this.formRef.current.setFieldsValue(currentDetail);
    this.formRef.current.setFieldsValue({ 'facilityNum': facilityNum });


    this.setState({
      tableFormSource: detailSource,
      loading: false
    });
  }

  /**
   * 工作模块单位设置
   * @param workType 
   * @param unitType 
   * @param workNum 
   */
  workModeUnit = (workType: number, unitType: string, workNum: string) => {
    if (workType === 1) {
      let unit;
      if (unitType === 'trips') {
        unit = '趟'
      } else if (unitType === 'peopleNum') {
        unit = '人'
      }
      return workNum + unit
    } else {
      const data = workNum.split(',');
      return `${data[0]}趟${data[1]}次`
    }
  }


  /**
   * key渲染
   */
  labalRender = (key: string) => {
    switch (key) {
      case 'workName':
        return '作业对象名称'
      case 'workType':
        return '作业对象类型'
      case 'enterpriseName':
        return '负责企业'
      case 'sectionName':
        return '所属标段'
      case 'roadWidth':
        return '宽度(m)'
      case 'roadLength':
        return '长度(m)'
      case 'groupLeader':
        return '管理组长'
      case 'contactName':
        return '负责人'
      case 'contactPhone':
        return '负责人电话'
      case 'remark':
        return '备注';
      case "area":
        return '面积(m²)';
      case 'facilityNum':
        return '设备个数';
      default:
        return ''
    };
  };

  /**
   * 根据审核类型渲染数据
   */
  workTypeRenderChange = (type: string | number, data: any) => {
    if (type == 1) { //作业线路
      delete data.area;
      delete data.facilityNum;
    } else if (type == 2) { //作业区域
      delete data.roadWidth;
      delete data.roadLength;
      delete data.facilityNum
    } else {  //清运区域
      delete data.roadWidth;
      delete data.roadLength;
    }
  }


  /**
   * 关闭抽屉
   */
  closeDrawer = () => {
    this.setState({
      tabActiveKey: '1',
    })
    this.props.closeDrawer();
  }

  /**
   * tab标签点击
   */
  onTabClick = (key: string) => {
    this.setState({
      tabActiveKey: key
    })
  }

  replaceTime = (time: string) => {
    const timearr = time.replace(" ", ":").replace(/\:/g, "-").split("-");
    return `${timearr[0]}-${timearr[1]}-${timearr[2]}`
  }



  /**
   * 渲染头部基础信息
   */
  renderTop = (detailData: workObjectItem) => {
    if (detailData != undefined) {
      return (<ul className={styles['basic-box']}>
        <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
          <div className={styles['tit']}>{detailData.workName}</div>
        </li>
        <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
          <div className={styles['tit']}>主管单位</div>
          <div className={styles['con']}>
            {detailData.orgName}
          </div>
        </li>
        <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
          <div className={styles['tit']}>申请日期:</div>
          <div className={styles['con']}>{this.replaceTime(detailData.updateDataTime)}</div>
        </li>
        <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
          <div className={styles['tit']}>最后修改时间:</div>
          <div className={styles['con']}>{moment(detailData.reviewTime).format('YYYY-MM-DD HH:mm')}</div>
        </li>
      </ul>);
    }
  }


  render() {

    const {
      visible,
    } = this.props;

    const {
      tabActiveKey,
      tableFormSource,
      workType,
      lnglat,
      detailData,
      loading,
      rosterDetailSource,
    } = this.state;

    return (
      <DetailDrawer
        title="审核详情"
        width={1240}
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
                  style={{ height: 'calc(100% - 28px)', overflowY: 'scroll' }}
                >
                  <Form
                    ref={this.formRef}
                  >
                    <Row>
                      <Col
                        span={6}
                        style={{ overflow: 'hidden' }}
                      >
                        <TableForm
                          dataSource={tableFormSource}
                          type={'detail'}>
                        </TableForm>
                      </Col>
                      <Col span={18}>
                        <AuditsMap
                          currentLongLat={lnglat}
                          oldLongLat={[]}
                          workType={workType}
                        />
                      </Col>
                    </Row>
                    <Row style={{ marginTop: 30 }}>
                      <Col span={3}>
                        <div
                          style={{ marginTop: 25, marginLeft: 15, color: '#5d5a5a', fontSize: 14, fontWeight: 600 }}>
                          审核意见:
                                                </div>
                      </Col>
                      <Col span={20}>
                        <Form.Item
                          name='reviewOpinion'
                        >
                          <TextArea name='reviewOpinion' disabled rows={3} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </div>
              </TabPane>

              {/* 排班信息 */}
              <TabPane
                tab="排班信息"
                key="2"
                className={styles['tab-pane']}
                style={{ height: '100%' }}
              >
                {/* 详细信息 */}
                <Row style={{ border: '1px solid #eee' }}>
                  <Col span={24}>
                    <Table
                      dataSource={rosterDetailSource}
                      columns={rosterDetailColumns}
                      pagination={false}
                      bordered={true}
                      scroll={{ x: 1050, y: 600 }}
                    />
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </div>
          <OperatorContainer>
            {this.renderTop(detailData)}
          </OperatorContainer>
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
      </DetailDrawer >
    )
  }
}

export default AuditDetailDrawer;
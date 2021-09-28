import React, { Component } from 'react';
import { Form, Button } from 'antd';
import Tabs from "antd/es/tabs";
import { DetailDrawer, TableForm } from '@/common';
import { FormInstance } from 'antd/lib/form';
import styles from '../index.module.less';

const { TabPane } = Tabs;
interface IProps {
  logInfo: any,//
  visible: boolean;
  // closeDrawer: Function; 
  getContainer?: 'body';
  closeDetailDrawer: Function; //关闭详情抽屉
}

interface IState {
  loading: boolean;
  logContent: string;
}

interface IFieldsValue {
  [key: string]: any;
}

class LogDetail extends Component<IProps, IState> {

  formRef: React.RefObject<FormInstance> = React.createRef<FormInstance>();
  constructor(props: IProps) {
    super(props);

    this.state = {
      loading: true,
      logContent: ''
    };
  }


  UNSAFE_componentWillReceiveProps(nextPros: IProps) {
    const { logInfo } = nextPros;
    let loginfo = { ...logInfo };
    let logSourceTxt: string = '--';
    const arr = ['1-终端上报', '2-平台下发', '3-平台操作', '4-APP操作'];
    const logSource: Number = logInfo.logSource;
    for (let i = 0; i < arr.length; i++) {
      if (logSource === Number(arr[i].split('-')[0])) {
        logSourceTxt = arr[i].split('-')[1]
        break
      }
    }
    this.setState({
      logContent: logInfo.logContent ? loginfo.logContent : ''
    })
    loginfo.logSourceTxt = logSourceTxt;
    this.setFormDataValue(loginfo);
  }

  componentDidMount() {
    const { logInfo } = this.props;
    let loginfo = { ...logInfo };
    let logSourceTxt: string = '--';
    const arr = ['1-终端上报', '2-平台下发', '3-平台操作', '4-APP操作'];
    const logSource: Number = logInfo.logSource;
    for (let i = 0; i < arr.length; i++) {
      if (logSource === Number(arr[i].split('-')[0])) {
        logSourceTxt = arr[i].split('-')[1]
        break
      }
    }
    this.setState({
      logContent: logInfo.logContent ? loginfo.logContent : ''
    })
    loginfo.logSourceTxt = logSourceTxt;
    this.setFormDataValue(loginfo);
  }
  /** 数据源格式 */
  dataSource1: any = [
    {
      name: '操作时间',
      key: 'eventDate',
    },
    {
      name: '操作用户',
      key: 'username',
    },
    {
      name: 'IP地址',
      key: 'ipAddress',
    },
  ];
  dataSource2: any = [
    {
      name: '日志类型',
      key: 'logSourceTxt',
      // render: (text: string, record: any,) => {

      // }
    },
    {
      name: '关联业务模块',
      key: 'moduleName',
    },
    {
      name: '关联监控对象',
      key: 'monitorName',
    },

  ];

  /*
  复用方法-设置表单的值 
  */
  setFormFieldsValue(IFieldsValue: IFieldsValue) {
    if (this.formRef.current) {
      this.formRef.current.setFieldsValue(IFieldsValue);
    }
  };

  /**
   * 设置表单input值
   */
  async setFormDataValue(data: any) {
    // this.setFormFieldsValue(Object.assign(data, { statusTxt: data.enabled ? '正常' : '冻结' }));
    this.setFormFieldsValue(data)
    console.log(data)
    this.setState({
      loading: false,
    });
  }
  /**
   * 重置表单
   */
  resetForm = () => {
    if (this.formRef.current) {
      this.formRef.current.resetFields();
    }
  };
  //下载日志详情
  downContent = (text: string, fileName: string) => {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', '日志详情_' + fileName);
    if (document.createEvent) {
      var event = document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
      pom.dispatchEvent(event);
    } else {
      pom.click();
    }
  }
  render() {
    const { visible, closeDetailDrawer, logInfo } = this.props;
    const { operationContent } = logInfo;
    const { logContent } = this.state;

    return (
      <DetailDrawer title={'日志详情'}
        onClose={() => {
          closeDetailDrawer()
        }}
        visible={visible}
        width={560}
      >
        <Tabs defaultActiveKey="1" tabBarStyle={{ paddingLeft: '20px' }}>


          <TabPane tab="基本信息" key="1">
            <div className={styles['drawer-wrapper']}>
              {/* 表单 */}

              <Form ref={this.formRef} style={{ width: '560px' }}  >
                <TableForm dataSource={this.dataSource1} type='detail' />
                <div style={{ position: 'relative', height: '40px' }} >
                  <div className={styles['icon-title']} >日志内容</div>
                </div>
                <div className={styles['detail_content']} style={{ minHeight: '30px' }}  >{operationContent || '--'}</div>
                <div style={{ position: 'relative', height: '40px' }}>
                  <div className={styles['icon-title']} >日志详情</div>
                </div>
                <div className={styles['detail_content']} style={{ minHeight: '160px' }} >
                  <div>
                    {logContent.substring(0, 5000) || '--'}
                    {logContent.substring(5000) ?
                      <Button type="link" onClick={() => this.downContent(logContent, operationContent)}>
                        ...下载更多
                    </Button>
                      // <button onClick={() => this.downContent(logContent)} >下载更多</button>
                      : ''}
                  </div>
                </div>
                <TableForm dataSource={this.dataSource2} type='detail' />
              </Form>
            </div >
          </TabPane>
        </Tabs>
      </DetailDrawer >
    );
  }
}

export default LogDetail;

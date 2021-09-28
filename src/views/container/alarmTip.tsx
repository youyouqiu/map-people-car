/* eslint-disable @typescript-eslint/camelcase */
import React, { Component } from 'react';
import History from 'history';
import { Tooltip, Modal } from 'antd';
import { getStore, setStore } from "../../framework/utils/localStorage";
import getWebsocket, { WebSocketClass } from "@/framework/utils/webSocket";
import alarmActiveIcon from '@/static/image/alarmActive.svg';

import styles from './index.module.less';
import { logout } from '@/server/login';

interface IProps {
  history: History.History;
}

interface IState {
  alarmResponse: {
    remindType: number;
    remindContent: string;
  };
}

let tipTimer: any = null;// 报警提醒文字消失定时器
class AlarmTip extends Component<IProps, IState, any>{
  /**
  * socket 实例
  */
  socket: WebSocketClass

  constructor(props: IProps) {
    super(props);

    this.state = {
      alarmResponse: {
        remindType: 0,// 0:报警,1:提醒
        remindContent: '',
      }
    }
  }

  componentDidMount() {
    // this.initSocket();
  }

  /**
   * 初始化socket
   */
  initSocket() {
    const token = getStore('token');
    if (token !== null && token !== false) {
      this.socket = getWebsocket({ access_token: `Bearer ${token}` }, this.onSocketSucces.bind(this), this.onSocketClose);
    }
  }

  /**
   * socket 连接成功
   */
  onSocketSucces = () => {
    // const token = getStore('token');
    // const header = { access_token: `Bearer ${token}` };
    const header = {};
    const requestStr = { data: {}, desc: { type: 0 } } //订阅
    this.socket.subscribeAndSend('/user/queue/monitor/alarmAndRemind', this.alarmCallback.bind(this), '/app/monitor/alarmAndRemind', header, requestStr);
    this.socket.subscribeAndSend('/user/queue/user/global', this.globalCallback.bind(this), '/app/user/global', header, requestStr);
  }
  /**
   * socket接收报警信息回调
   */
  alarmCallback = (response: { body: string }) => {
    console.log('报警提醒', response);
    const { body } = response;
    if (tipTimer) {
      clearTimeout(tipTimer);
      tipTimer = null;
    }
    const data = JSON.parse(body);
    this.setState({
      alarmResponse: data
    }, () => {
      tipTimer = setTimeout(() => {
        this.setState({
          alarmResponse: {
            remindType: 0,
            remindContent: '',
          }
        })
      }, 3000);
    })
  }

  /**
   * 用户过期等全局消息
   */
  globalCallback = (response: { body: string }) => {
    const { body } = response;
    const data: { type: number; data: string } = JSON.parse(body);
    if (data.type === 1) {
      // 将用户退出登录
      Modal.error({
        title: '错误',
        content: data.data,
        onOk: async () => {
          await logout();
          const theme: any = getStore('theme');
          window.sessionStorage.clear();
          setStore('theme', theme);
          window.location.href = '/login';
        }
      });
    }
  }


  /**
   * socket 连接失败
   */
  onSocketClose = () => {
    console.log('socket close');
  }

  /**
   * 报警跳转
   */
  alarmJump = (status?: boolean) => {
    const { history } = this.props;
    if (status) {
      const { alarmResponse: { remindType } } = this.state;
      if (remindType === 1) {// 跳转至提醒页面
        history.push('/view/home/workbench/remindList');
        this.setState({
          alarmResponse: {
            remindType: 0,
            remindContent: '',
          }
        })
        return;
      }
    }
    // 跳转至报警页面
    history.push('/view/home/workbench/alarmList');
    this.setState({
      alarmResponse: {
        remindType: 0,
        remindContent: '',
      }
    })
  }

  /**
   * 组装报警提醒文字
   */
  getTipText = () => {
    const { alarmResponse: { remindContent } } = this.state;
    if (remindContent) {
      return <a onClick={() => { this.alarmJump(true) }}>{remindContent}</a>;
    }
    return null;
  }

  render() {
    const { alarmResponse: { remindContent } } = this.state;

    return (
      <Tooltip overlayClassName={styles.tooltip} defaultVisible={!!remindContent} placement="bottom" visible={remindContent ? true : false} title={remindContent ? this.getTipText : ''}>
        <div className={styles.alarmIconBox} title="报警" onClick={() => { this.alarmJump() }}>
          {remindContent
            ?
            [
              <img key="1" src={alarmActiveIcon} />,
              <div key="2" className={styles.alarmWaves}></div>
            ]
            : <img className={styles.noAlarm} src={alarmActiveIcon} />
          }
        </div>
      </Tooltip>
    );
  }
}
export default AlarmTip;

import React, { Component, CSSProperties } from 'react';
import { connect } from 'react-redux';
import { Menu, Modal, Tooltip } from 'antd';
import { Dropdown } from 'antd';
import History from 'history';
import {
  UserOutlined,
  LogoutOutlined,
  AppstoreAddOutlined,
} from '@ant-design/icons';
import logo from "@/static/image/logo1.png";
import languageIcon from '@/static/image/language.svg';
import themeIcon from '@/static/image/theme.svg';

import styles from './index.module.less';
import { AllState } from '../../model';
import { setStore, getStore } from "../../framework/utils/localStorage";
import RouterTabs from "@/common/routerTabs/routerTabs";
import MenuPage from "./menu";
import AlarmTip from './alarmTip';
import { IUserDetails } from '../home/type';
import { logout } from '@/server/login';
import getWebsocket, { WebSocketClass } from '@/framework/utils/webSocket';
import Config from "../../framework/config";
import ExportManagement from '@/common/exportManagement';
import Theme from './theme';

interface IProps {
  style?: CSSProperties;
  history: History.History;
  userData: IUserDetails;
  getUserMsg: Function;
  setGlobalSocket: Function;
}

interface IState {
  dateAndTime: { week: string; date: string; time: string; morning: string };
  timer: any;
  historyRouters: Array<any>;
  activePathCode: string;
  headerInfo: any;
}

interface ItemRouter {
  name: string;
  code: string;
  path: string;
}

const defaultTabs = [
  {
    name: '首页',
    code: 'home',
    path: '/view/home',
    closable: false,
  }
];

let defaultactivePathCode = 'home';
let homePageItem: any = null;


class Header extends Component<IProps, IState, any>{
  /**
  * socket 实例
  */
  socket: WebSocketClass | null
  constructor(props: IProps) {
    super(props);
    const router = getStore('historyRouter');
    const activeTabPath = getStore('activeTabPath');

    const personalizedConfig: any = getStore('personalizedConfig');
    const configInfo = JSON.parse(personalizedConfig);
    if (configInfo) {
      const homePageCode = configInfo.homePageCode;
      const homePage = configInfo.homePage;
      if (configInfo && homePage && homePageCode && homePage != '/view/home/personal' && homePageCode != '3_personal_center') {
        this.getHomePageName(configInfo.homePageCode, configInfo.homePage);
        if (homePageItem) {
          const homePath = {
            name: homePageItem.name,
            code: homePageItem.code,
            path: homePageItem.path,
            closable: true,
          }
          defaultTabs.push(homePath);
          defaultactivePathCode = homePageItem.code;
        }
      }
    }

    this.state = {
      dateAndTime: {
        'week': '',
        'date': '',
        'time': '',
        'morning': ''
      },
      timer: null,
      historyRouters: router ? JSON.parse(router) : defaultTabs,// 用于顶部tabs页签显示
      activePathCode: activeTabPath ? activeTabPath : defaultactivePathCode,// 顶部页签选中项
      headerInfo: {
        logoImg: '',
        title: ''
      }
    }
  }

  componentDidMount() {
    this.initSocket();
    this.props.getUserMsg();
    this.getDateAndTime();
    this.titleRender();
  }

  componentWillUnmount() {
    const { timer } = this.state;
    if (timer) clearTimeout(timer);
  }

  getHomePageName(code: string, path: string) {
    const data: any = Config.routes[2].children;;

    for (let i = 0; i < data.length; i++) {
      if (homePageItem) return;
      const item = data[i];
      this.findCodeAndPath(code, path, item.children, item)
    }
  }

  findCodeAndPath(code: string, path: string, data: any, item: any) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].code == code && data[i].path == path) {
        homePageItem = item;
        return;
      }

      if (data[i].children && data[i].children.length > 0) {
        this.findCodeAndPath(code, path, data[i].children, item)
      }
    }
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
    const { setGlobalSocket } = this.props;
    setGlobalSocket(this.socket);
    if (this.socket) {
      // const token = getStore('token');
      // const header = { access_token: `Bearer ${token}` };
      const header = {};
      const requestStr = { data: {}, desc: { type: 0 } } //订阅
      this.socket.subscribeAndSend('/user/queue/user/global', this.globalCallback.bind(this), '/app/user/global', header, requestStr);
    }
  }

  /**
   * socket 连接失败
   */
  onSocketClose = () => {
    this.props.setGlobalSocket(null);
    this.socket = null;
    console.log('socket close');
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
   * 获取当前日期及时间
   * 每分钟更新
   */
  getDateAndTime = () => {
    const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

    const myDate = new Date();
    const month = myDate.getMonth() + 1;
    const curDate = myDate.getDate();
    const day = myDate.getDay();

    let hours: any = myDate.getHours();
    hours = hours < 10 ? `0${hours}` : hours;
    let minutes: any = myDate.getMinutes();
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    const seconds = myDate.getSeconds();

    const result = {
      'week': weekday[day],
      'date': `${month}月${curDate}日`,
      'time': `${hours}:${minutes}`,
      'morning': (hours >= 12) ? '下午' : '上午'
    }

    const { timer } = this.state;
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(this.getDateAndTime, 60000 - seconds * 1000);
    this.setState({
      dateAndTime: result,
      timer: newTimer
    })
  }

  /**
   * 修改历史路由与当前选中的tab项
  */
  changeRouterAndPath = (path: string, newRouter: Array<ItemRouter> = this.state.historyRouters) => {
    this.setState({
      activePathCode: path,
      historyRouters: newRouter,
    })
    if (path !== 'home') {
      if (newRouter.length > 2) {
        const result = [newRouter[0]];
        for (let i = 0; i < newRouter.length; i += 1) {
          if (newRouter[i].code === path) {
            result.push(newRouter[i]);
            break;
          }
        }
        setStore('historyRouter', result);
      } else {
        setStore('historyRouter', JSON.stringify(newRouter));
      }
    } else {
      setStore('historyRouter', JSON.stringify([newRouter[0]]));
    }
    setStore('activeTabPath', path);
  }

  /**
   * 跳转个人中心页面
   */
  goPersonCenter = () => {
    const { history } = this.props;
    this.setState({
      activePathCode: 'home'
    })
    history.push('/view/home/personal');
  }

  /**
  * 退出登录
  */
  loginExit = async () => {
    await logout();
    const personalizedConfig: any = getStore('personalizedConfig');
    const configurationInfo = JSON.parse(personalizedConfig);
    const theme: any = getStore('theme');
    window.sessionStorage.clear();
    setStore('personalizedConfig', configurationInfo);
    setStore('theme', theme);
    window.location.href = '/login';
  }

  titleRender = () => {
    let logoImg = logo, title = 'F3环卫云平台';
    let configData: any = getStore('personalizedConfig');
    configData = JSON.parse(configData);
    if (configData) {
      const platformTitle = configData.platformTitle;
      const platformLogo = configData.platformLogo;
      platformTitle ? title = platformTitle : 'F3环卫云平台';
      platformLogo ? logoImg = platformLogo : logo;
    }

    this.setState({
      headerInfo: {
        title,
        logoImg
      }
    })
  }

  render() {
    const { history, style } = this.props;
    const { dateAndTime, historyRouters, activePathCode, headerInfo } = this.state;
    const { userData: { username, photo } } = this.props;

    return (
      <div id="header" className={styles['header-container']} style={style}>
        <div className={styles['header-wrapper']}>
          <div className={styles['header-left']}>
            <div className={styles['header-logo']}>
              <img id="header_logo" alt="logo图片" src={headerInfo.logoImg} />
              <h2 id="header_title">{headerInfo.title}</h2>
            </div>
          </div>
          <div className={styles['header-tabs']}>
            <RouterTabs
              changeRouter={this.changeRouterAndPath}
              historyRouters={historyRouters}
              activePathCode={activePathCode}
              history={history}
            />
          </div>
          <div className={styles['header-right']}>
            <div className={styles['icons-list']}>
              {/* <AlarmTip history={history} /> */}
              <ExportManagement />
              <Dropdown overlay={
                <Menu>
                  <Menu.Item>
                    <a href="#">
                      CN 简体中文
                    </a>
                  </Menu.Item>
                </Menu>
              }>
                <a className="ant-dropdown-link">
                  <img alt="多语言" title="多语言" src={languageIcon} className={styles['item-icon']} />
                </a>
              </Dropdown>
              <Theme>
                <Tooltip title={'主题颜色'}>
                  <img alt="主题" src={themeIcon} className={styles['item-icon']} />
                </Tooltip>
              </Theme>

              {/* <Badge count={88} overflowCount={99}>
                                <BellOutlined title="消息" className={styles['item-icon']} />
                            </Badge> */}
            </div>
            <Dropdown overlay={
              <Menu>
                <Menu.Item>
                  <a href="#" onClick={this.goPersonCenter}>
                    <UserOutlined /> 个人中心
                  </a>
                </Menu.Item>
                <Menu.Item>
                  <a href="#" onClick={this.loginExit}>
                    <LogoutOutlined /> 退出登录
                  </a>
                </Menu.Item>
              </Menu>
            }
              className={styles.user}
            >
              <a className="ant-dropdown-link">
                {photo ? <img alt="" src={photo} /> : <UserOutlined style={{ fontSize: '22px' }} />}
                <span>{username}</span>
              </a>
            </Dropdown>
            <div className={styles.date}>
              <div>{dateAndTime.week}</div>
              <div>{dateAndTime.date}</div>
            </div>
            <div className={styles.time}>
              <div>{dateAndTime.morning}</div>
              <div className={styles.currentTime}>{dateAndTime.time}</div>
            </div>
          </div>
        </div>
        {/* 导航菜单部分 */}
        <div className={`${styles['menu-container']} theme-menu-container`}>
          <div id="triggerWrapper" className={styles['trigger-wrapper']}>
            {/* <MenuUnfoldOutlined className={styles.trigger} /> */}
            <AppstoreAddOutlined className={`${styles.trigger} theme-trigger`} />
          </div>
          <div id="menuWrapper" className={styles['menu-dropdown']}>
            <MenuPage changeRouter={this.changeRouterAndPath} historyRouters={historyRouters} history={history} />
          </div>
        </div>
      </div>
    );
  }
}
export default connect(
  (state: AllState) => ({
    collapsed: state.root.collapsed,
    userData: state.root.userMessage,//用户信息
  }),
  dispatch => ({
    loginExit: () => {
      dispatch({ type: 'root/LOGIN_EXIT' });
    },
    getUserMsg: (payload: any) => {
      dispatch({ type: 'root/getUserMsgEvery', payload });
    },
    setGlobalSocket: (payload: any) => {
      dispatch({ type: 'root/setGlobalSocketEvery', payload });
    },
  }),
)(Header);


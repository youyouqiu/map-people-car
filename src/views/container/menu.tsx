import React, { Component } from 'react';
import { Tabs, Menu } from 'antd';
// const { TabPane } = Tabs;
import {
  AlignLeftOutlined,
  DesktopOutlined,
  FundProjectionScreenOutlined,
  MailOutlined,
  MonitorOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import History from 'history';
import Config from "../../framework/config";
import { getStore } from '../../framework/utils/localStorage';
import styles from './index.module.less';

interface IProps {
  changeRouter: Function;
  historyRouters: Array<any>;
  history: History.History;
}

interface IState {
  menuList: Array<any>;
  codeMenuObj: object;
}

interface IMenuItem {
  name: string;
  code: string;
  children?: Array<any>;
}

interface IRoute {
  path: string;
  component: string;
  name: string;
  code: string;
  exact?: boolean;
  children?: IRoute[];
}

class MenuPage extends Component<IProps, IState, any> {
  data = {
    author: [],
  }
  icons = [DesktopOutlined, FundProjectionScreenOutlined, MailOutlined, MonitorOutlined, DatabaseOutlined, DatabaseOutlined, DatabaseOutlined, DatabaseOutlined];
  constructor(props: IProps) {
    super(props);
    this.state = {
      menuList: [],// 菜单数据
      codeMenuObj: {},// 按code属性存储菜单相关数据
    };
  }

  componentDidMount() {
    const codeMenuObj = this.renderMenuObj(Config.routes as any, {})
    this.setState({
      codeMenuObj
    }, () => {
      const menuList: Array<IMenuItem> = JSON.parse(getStore('authMenuList') as string);
      if (menuList) {
        this.renderMenuList(menuList);
        this.setState({
          menuList
        })
      }
    })

    // 监听路由变化
    this.props.history.listen(this.listenRouter)
  }

  /**
   * 监听路由变化,动态改变tabs选中菜单
   */
  listenRouter = (route: any) => {
    let curPath = '';
    const { pathname } = route;
    if (pathname) {
      curPath = `/${pathname.split('/')[1]}/${pathname.split('/')[2]}`;
    }
    const userMenuList = getStore('userMenuList');
    let config: any = null;
    if (curPath === '/view/home') {
      config = {
        name: '首页',
        code: 'home',
        path: '/view/home',
        closable: false,
      };
    } else if (userMenuList) {
      config = JSON.parse(userMenuList).filter((item: any) => item.path === curPath)[0];
    }
    const activeTabPath = getStore('activeTabPath');
    if (config && config.code !== activeTabPath) {
      this.changeRouterFun(config);
    }
  }

  /**
   * 组装菜单对象
   * 将菜单数据转换为({code:{path:'',component:''}})格式
   * 便于递归组装新的菜单结构
   */
  renderMenuObj = (data: Array<IRoute>, result: any) => {
    for (let i = 0; i < data.length; i += 1) {
      const item = data[i];
      result[item.code] = {
        path: item.path,
        component: item.component,
      };
      if (item.children) {
        this.renderMenuObj(item.children, result);
      }
    }
    return result;
  }

  /** 
   * 组装用于显示的菜单数据
   * @param pageStatus 是否是页面模块
  */
  renderMenuList = (data: Array<IMenuItem>, pageStatus?: boolean) => {
    const { codeMenuObj } = this.state;
    for (let i = data.length - 1; i >= 0; i -= 1) {
      const item = data[i];
      if ((codeMenuObj as any)[item.code]) {
        Object.assign(item, (codeMenuObj as any)[item.code] as any);
      } else if (pageStatus) {// 如果前端未配置相关页面路由,则不显示该菜单
        data.splice(i, 1);
      }
      if (item.children) {
        this.renderMenuList(item.children, true);
        if (!pageStatus && item.children.length === 0) {
          data.splice(i, 1);
        }
      }
    }
  }

  /**
   * 实现鼠标移入tab切换子菜单效果
   * */
  tabMouseEnter = (e: any) => {
    const curTabs = e.target.parentNode;
    curTabs.click();
  }

  changeRouterFun = (parentItem: any) => {
    let hasStatus = false;
    const { changeRouter, historyRouters } = this.props;
    const data = JSON.parse(JSON.stringify(historyRouters));

    for (let i = 0; i < data.length; i += 1) {
      const curItem = data[i];
      if (curItem.code === parentItem.code) {
        hasStatus = true;
        break;
      }
    }

    if (!hasStatus) {
      const currentTabs = {
        'name': parentItem.name,
        'code': parentItem.code,
        'path': parentItem.path,
      }
      if (data.length >= 6) {
        data.splice(1, 1)
      }
      data.push(currentTabs);
    }
    changeRouter(parentItem.code, data);
  }

  /**
   * 二级菜单点击跳转
   * @param parentItem 父级菜单(用于顶部tabs显示)
   * @param item 当前点击菜单
   * */
  subMenuClick = (parentItem: any, item: any) => {
    const { history } = this.props;
    this.changeRouterFun(parentItem);
    const menuWrapper: any = document.getElementById('menuWrapper');
    menuWrapper.style.top = '-500px';
    setTimeout(() => {
      menuWrapper.removeAttribute('style');
    }, 1000);
    history.push(item.path);
  }

  returnIcon = (i: any) => {
    const Icon = this.icons[i];
    return <Icon className={`${styles['first-menu-icon']} theme-first-menu-icon`} />;
  };

  render() {
    const { menuList } = this.state;
    return (
      <ul className={styles.submenuWrapper}>
        {
          menuList.map((item: any, index: number) => (
            <li key={item.code}>
              <div className={styles.header}>{this.returnIcon(index)}<span className={`${styles['first-menu-title']} theme-first-menu-title`}>{item.name}</span></div>
              {
                item.children && item.children.map((option: any) => (
                  <ul key={option.code}>
                    <AlignLeftOutlined className={`${styles['second-menu-icon']} theme-second-menu-icon`} /><span>{option.name}</span>
                    {
                      option.children && option.children.map((subOption: any) => (
                        <li className={'theme-menu-list'} key={subOption.code}><span onClick={() => { this.subMenuClick(option, subOption) }}>{subOption.name}</span></li>
                      ))
                    }
                  </ul>
                ))
              }
            </li>
          ))
        }
      </ul>
    );
  }
}

export default MenuPage;

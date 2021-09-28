/* eslint-disable @typescript-eslint/no-use-before-define */
import React from 'react';
import History from "history";
import { Switch, Route, BrowserRouter, useHistory } from 'react-router-dom';
import Config from "./config";
import { getStore } from './utils/localStorage';
import Loading from "@/common/loading";
import Page401 from '@/views/error/page401';
import Page404 from '@/views/error/page404';
import Login from '@/views/login';
import Container from '@/views/container';


export interface IRoute {
  path: string;
  component: string;
  name: string;
  code: string;
  exact?: boolean;
  children?: IRoute[];
}

export interface IAuthMenu {
  name: string;
  code: string;
  children?: IAuthMenu[];
}

export default function TopRouter() {
  return (
    <BrowserRouter>
      {
        mapConfig2Route(Config.routes as IRoute[])
      }
    </BrowserRouter>
  )
}


function getFirstComponent(code: string, history: History.History) {
  switch (code) {
    case 'login':
      return <Login history={history} />
    case 'view':
      return <Container history={history} />
    case '404':
      return <Page404 />
    case '401':
      return <Page401 />
    default:
      return <Loading />
      break;
  }
}

function RouterGuard(props: IRoute) {
  const history = useHistory();
  const { code, path } = props;
  const token = getStore('token');
  const authMenuList = getStore('authMenuList');

  if (path === '/') {
    if (token && isTokenValid()) {
      history.replace('/view/home/personal/index');
    } else {
      history.replace('/login');
    }
    return null;
  }

  // 检验用户是否有权限
  if (path.indexOf('/view') === 0) {
    if (token && isTokenValid()) {
      const systemCode = [
        { name: '登录', code: 'login' },
        { name: '页面', code: 'view' },
        { name: '401', code: '401' },
        { name: '404', code: '404' },
        { name: 'default', code: 'default' },
        { name: '首页', code: '2_home' },
      ]
      let auth = JSON.parse(authMenuList as string) as IAuthMenu[];
      auth = systemCode.concat(auth);
      if (!containCode(auth, code)) {
        return <Page401 />;
      }
    } else {
      history.replace('/login');
      return null;
    }
  }
  document.title = props.name;
  // const Loadable = getLoadable(component) as any;
  // return <Loadable history={history} />;
  return getFirstComponent(code, history)
}

// function getLoadable(componentPath: string) {
//     return Loadable({
//         loader: () => import('../views/' + componentPath),
//         loading: () => <Loading />
//     })
// }

function mapConfig2Route(routes: IRoute[]) {
  return (
    <Switch>
      {
        routes.map(config => (
          <Route
            key={config.code}
            path={config.path}
            exact={config.exact}
            render={props => (
              <RouterGuard {...config} {...props} code={config.code} />
            )}
          />
        ))
      }
    </Switch>
  )
}

/**
 * 比对token过期时间，判断token是否过期
 */
function isTokenValid() {
  const time = getStore('expires_in');
  const nowTime = new Date().getTime();
  if (time !== null && time !== false) {
    return Number(time) > nowTime;
  }
  return true;
}



/**
 * 判断用户是否有此菜单权限
 * @param menus 服务器返回的权限列表
 * @param code 本地的菜单code
 */
export function containCode(menus: IAuthMenu[], code: string): boolean {
  for (let i = 0; i < menus.length; i++) {
    const element = menus[i];
    if (element.code === code) {
      return true;
    } else if (element.children && containCode(element.children, code)) {
      return true;
    }
  }
  return false;
}

export function hasPagePermmision(pageCode: string): boolean {

  const permissionStore = getStore('authMenuList');
  if (!permissionStore) return false;

  const menuTree = JSON.parse(permissionStore) as IAuthMenu[];

  return containCode(menuTree, pageCode);
}
import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { Tabs } from 'antd';
import styles from './index.module.less';
// import { AllState } from '../../model';
import History from 'history';
import { getStore } from '@/framework/utils/localStorage';

const { TabPane } = Tabs;

interface IProps {
  changeRouter: Function;
  history: History.History;
  historyRouters: Array<{ name: string; code: string; path: string }>;
  activePathCode: string;
}

interface IState {
  activeKey: string;
  historyRouters: Array<{ name: string; code: string; path: string }>;
}

class RouterTabs extends Component<IProps, IState, any> {

  data = {
    defaultRouter: [{
      name: '首页',
      code: 'home',
      path: '/view/home',
      closable: false,
    }],
    defaultActiveKey: 'home',
  }

  constructor(props: IProps) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onEdit = this.onEdit.bind(this);
  }

  onChange = (activeKey: string) => {
    const { changeRouter, historyRouters, history } = this.props;
    const config = historyRouters.filter(item => item.code === activeKey);
    if (config) {
      changeRouter(activeKey);
      const thirdUrl = getStore(config[0].path);
      const path = this.pathDealWith(thirdUrl ? thirdUrl : config[0].path);
      history.push(path);
    }
  }

  onEdit = (targetKey: any, action: string) => {
    (this as any)[action](targetKey);
  }

  remove = (targetKey: any) => {
    const { changeRouter, historyRouters, activePathCode: activeKey, history } = this.props;

    let newActiveKey: any = activeKey;
    let lastIndex = -1;
    historyRouters.forEach((pane, i) => {
      if (pane.code === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = historyRouters.filter(pane => pane.code !== targetKey);
    if (panes.length && activeKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = panes[lastIndex].code;
      } else {
        newActiveKey = panes[0].code;
      }
      const config = historyRouters.filter(item => item.code === newActiveKey);
      const thirdUrl = getStore(config[0].path);
      const path = this.pathDealWith(thirdUrl ? thirdUrl : config[0].path);
      history.push(path);

    } else if (!panes.length) {
      const { defaultRouter } = this.data;
      const thirdUrl = getStore(defaultRouter[0].path);
      const path = this.pathDealWith(thirdUrl ? thirdUrl : defaultRouter[0].path);
      history.push(path);
    }
    changeRouter(newActiveKey, panes);
  };


  pathDealWith = (path: string) => {
    if (path == '/view/home/undefined' || path == '/view/home') {
      return '/view/home/personal';
    } else {
      return path;
    }
  }

  render() {
    const { activePathCode: activeKey, historyRouters } = this.props;

    return (
      <Tabs
        className={styles.tabs}
        onChange={this.onChange}
        onEdit={this.onEdit}
        activeKey={activeKey}
        hideAdd
        type="editable-card"
      >
        {
          historyRouters.map(item => (
            <TabPane tab={(item as any).name} key={item.code} closable={(item as any).closable} />
          ))
        }
      </Tabs>
    );
  }
}

export default RouterTabs;

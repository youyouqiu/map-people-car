
import React, { Component, useState } from 'react';
import { Menu, Tabs } from 'antd';

// import { hasPagePermmision } from '@/framework/router';
import styles from './index.module.less';
import CarTypes from './carTypes';
import JobsTypes from './jobsTypes';
import FacilitiesTypes from './facilitiesTypes';
import PeripheralsTypes from './peripheralsTypes';
import FunctionType from './functionType';
import workMode from './workMode'
// import { divide } from 'lodash';
const { TabPane } = Tabs
interface IState {
    current: any,
}

function WsTypes() {
    // const [key, setKey] = useState('PeripheralsTypes'); 
    return (
        <Tabs
            className={styles['right-tabs']}
            defaultActiveKey={'WsTypes1'}
        >
            <TabPane tab="外设类型" key="WsTypes1">
                <PeripheralsTypes />
            </TabPane>
            <TabPane tab="IO功能类型" key="WsTypes2">
                <FunctionType />
            </TabPane>
        </Tabs>

    )
}




class DataDictionary extends Component<any, IState> {
    menuList: any[] = [
        {
            key: 'carTypes',
            name: '车辆类型',
            component: CarTypes
        },
        {
            key: 'jobsTypes',
            name: '岗位类型',
            component: JobsTypes
        },
        {
            key: 'facilitiesTypes',
            name: '设施类型',
            component: FacilitiesTypes
        },
        {
            key: 'peripheralsTypes',
            name: '外设类型',
            component: WsTypes
        },
        {
            key: 'workMode',
            name: '作业模式',
            component: workMode
        }
    ];
    constructor(props: any) {
        super(props);
        this.state = {
            current: this.menuList[0].key,// 1=车辆类型 ,2=岗位类型 3=设施类型 4=外设类型 5=IO功能类型
        }

    }

    UNSAFE_componentWillMount() {
        const { location } = this.props.parentRouter;
        const { search } = location;
        const currentKey = this.getUrlSearchToObj(search).leftMenu || this.menuList[0].key;
        console.log(currentKey)
        this.setState({
            current: currentKey
        })
    }
    /*
    获取url的参数格式化为object
    */
    getUrlSearchToObj(search: string) {
        if (search.substr(0, 1) === '?') {
            const paramsStr = search.substr(1);
            const paramsArr: string[] = paramsStr.split('&');
            let params: any = {};
            console.log(paramsStr)
            console.log(paramsArr)
            paramsArr.forEach((v: string) => {
                try {
                    const vArr = v.split('=');
                    params[vArr[0]] = vArr[1];
                } catch (err) {
                    console.log(err)
                }
            })
            console.log(params)
            return params
        } else {
            return {}
        }
    }
    /*
    菜单点击
    */
    menuItemClick(e: any) {
        const { push } = this.props.parentRouter;

        push('/view/systemManagement/dataDictionary?leftMenu=' + e.key)

        this.setState({
            current: e.key
        })
    }
    /*
    当前的子组件
    */
    currentChildren = (props: any) => {
        const menuList = this.menuList;
        // const ChildComponent = <div>这是xx类型</div>;
        let ChildComponent = menuList[0].component;
        for (let i = 0; i < menuList.length; i++) {
            if (props.childKey === menuList[i].key) {
                ChildComponent = menuList[i].component
                return <ChildComponent />
            }
        }
        return <ChildComponent />
    }
    render() {
        const { current } = this.state;
        return (
            <div className={styles['menu-page-container']} >
                <div className={styles['left-layout']} >
                    <div className={styles['left-dataDictionary-title']} >字典目录</div>
                    <Menu
                        theme='light'
                        onClick={this.menuItemClick.bind(this)}
                        selectedKeys={[current]}
                        mode="inline"
                    >
                        {this.menuList.map(e =>
                            <Menu.Item key={e.key}>{e.name}</Menu.Item>
                        )}

                    </Menu>
                </div>
                <div className={styles['right-layout']} >
                    <this.currentChildren childKey={current} />
                </div>

            </div>

        )
    }

}

export default DataDictionary

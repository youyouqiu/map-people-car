import React from 'react';
import {
    useParams,
} from "react-router-dom";
import Config from "../../framework/config";
import { IRoute } from "../../framework/router";
import styles from "./content.module.less";
import Load from './load'

interface IParam {
    param2: string;
    param3: string;
    param4: string;
}

function getRouteByPath(routes: IRoute[], path: string): IRoute | undefined {
    for (let i = 0; i < routes.length; i++) {
        const element = routes[i];
        if (element.path === path) {
            return element;
        } else if (element.children) {
            const childRoute = getRouteByPath(element.children, path);
            if (childRoute) {
                return childRoute;
            }
        }
    }
    return undefined;
}

const secondMenuList: Array<string> = [];
const componentList: Array<{
    param2: string;
    element: JSX.Element;
}> = [];

export default function Content() {
    const params = useParams<IParam>();
    const path = `/view/${params.param2}`;

    if (!(secondMenuList.indexOf(path) > -1)) {
        const route = getRouteByPath(Config.routes as any, path);
        if (route) {
            // const Loadable = getLoadable(route.code);
            componentList.push({
                param2: params.param2,
                element: <Load component={route.component} code={route.code} />,
            });
            secondMenuList.push(path);
        }
    }
    // 如果超过了6个，则删除第一个不是首页的页面
    if (secondMenuList.length > 6) {
        for (let i = 0; i < secondMenuList.length; i++) {
            const element = secondMenuList[i];
            if (element !== 'home') {
                secondMenuList.splice(i, 1);
                componentList.splice(i, 1);
                break;
            }
        }
    }
    return (
        <div style={{ height: '100%', width: "100%" }}>
            {
                componentList.map(component => {
                    return (
                        <div
                            key={component.param2}
                            className={component.param2 === params.param2 ? styles.normal : styles.hidden}
                            style={{ height: '100%' }}
                        >
                            {component.element}
                        </div>
                    );
                })
            }
        </div>
    );
}

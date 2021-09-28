import { ReactNode } from "react";

export interface IProps {
    /**
     * 表单显示数据源
     */
    dataSource: Array<DataItem>;
    /**
     * 表单显示列数(默认2列)
     */
    column?: number;
    /**
     * 表单类型
     * default:新增/修改
     * detail:详情
     */
    type?: 'detail' | undefined;
    /**
     * 表格标题
     */
    header?: string | ReactNode;
}

export interface DataItem {
    /**
     * 列名
     */
    name?: string | null;
    /**
     * 列key
     */
    key: string;
    /**
    * 该列渲染的组件(不传则默认为input)
    */
    component?: ReactNode | ReactNode[] | ((data?: any) => ReactNode);
    /**
     * input组件属性
     */
    inputProps?: object;
    /**
     * 校验规则
     */
    validate?: { rules: Array<{ required?: boolean;[propertys: string]: any }> };
    /**
     * 所占列数
     */
    colSpan?: number;
    renderData?: any;
}


//快捷查询枚举
export enum EDaySearch {

}
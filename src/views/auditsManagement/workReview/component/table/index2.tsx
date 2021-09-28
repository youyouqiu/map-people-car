import React, { Component, ReactElement } from 'react'
import { Button, Form, Input, Table } from 'antd';
import { SearchOutlined, ReloadOutlined, LeftOutlined } from '@ant-design/icons';
import Setting from './setting'
import FilterDom, { IFilterItemProps } from './filter'
import { TableProps, ColumnProps } from 'antd/lib/table';
import { FormInstance } from 'antd/lib/form';
import styles from './index.module.less'
import { regularText } from '@/common/rules';

export interface QueryDomProps {
    name: string;
    label: string;
    dom: any;
    handleValue?: (value: any, data: any) => any;
}

export interface MyTableProps<T> extends TableProps<T> {
    columns: MyColumns<T>[];
    queryAjax?: any; // 查询请求
    queryDom?: QueryDomProps[];
    queryArgs?: Record<string, any>;
    queryBtnDoms?: any;
    hideQueryBtn?: boolean; // 是否隐藏头部查询按钮
    initialValues?: any; // 头部查询默认参数
    tableBodyClassName?: string; // table的class
    btnGroup?: any[]; // 左侧 新增 批量删除按钮组
    showSetting?: boolean; // 是否展示设置行
    showSettingRight?: boolean; // 是否展示设置行右侧
    showSettingLeft?: boolean;// 是否展示设置行左侧
    showSettingQuery?: boolean; //是否暂时右侧查询输入框
    settingQuery?: ISettingQueryProps | null; // 设置行输入框配置
    settingQueryStyle?: { // 设置行输入框 style
        width: number | string;
    };
    showRow?: boolean; // 是否展示勾选框
    showTree?: boolean; // 是否展示树
    rowChange?: Function; // 勾选函数
    rowSelections?: any; // rowSelection的拓展
    rowType?: string; // 单选 多选类型
    showPages?: boolean; // 是否展示分页
    ref?: any;
    tree?: ReactElement; // 左侧树
    queryCallback?: (data: any, record: any) => void; // 查询成功回调函数
    pageCallback?: (data: any) => void; // 分页回调函数
    rowClick?: (record: any, e: any) => void; // 行点击事件回调函数
    refresh?: () => void; // 刷新回调函数
    queryChange?: (obj: any) => void; // 右侧输入框查询回调函数
    sectionDetail: any
}

export interface MyColumns<T> extends ColumnProps<T> {
    filter?: IFilterItemProps;
}

interface ISettingQueryProps {
    placeholder: string;
    key: string;
    maxLength?: number;
}

interface IQueryParams {
    size: number;
    page: number;
    [propName: string]: any;
}

interface ISorterArgsParams {
    orderType?: string;
    orderField?: string;
}

interface IState {
    tableData: any;
    scroll: any;
    rowSetting: any;
    pagination: {
        current: number;
        pageSize: number;
        total: number;
    };
    showSetting: boolean;
    showSettingRight: boolean;
    showSettingLeft: boolean;
    showSettingQuery: boolean;
    loading: boolean;
    showTree: boolean;
    hideQueryBtn: boolean;
    treeShowOrHide: boolean;
    filterdInfo: any;
    sortedInfo: any;
    filterdInfoData: any;
    queryValue: string;
    settingColumnList: any[];
}

class ConcretTable<T> extends Component<MyTableProps<T>, IState, any> {
    constructor(props: MyTableProps<T>) {
        super(props)

        this.tableColumns = props.columns
        this.queryArgs = props.queryArgs
        this.defaultQueryArgs = props.queryArgs
        this.tableQueryArgs = {}
        this.filterAndSortArgs = {}
        this.settingInputArgs = {}
        this.pageArgs = {}
        // this.queryForm = React.createRef<FormInstance>();

        this.state = {
            scroll: {
                x: 'max-content',
                y: '500px',
                scrollToFirstRowOnChange: true
            },
            tableData: [],
            loading: false,
            filterdInfo: null,
            sortedInfo: null,
            filterdInfoData: null,
            queryValue: '',
            settingColumnList: props.columns.filter((a: MyColumns<T>) => !!a.dataIndex).map((b: MyColumns<T>) => b.dataIndex),
            ...this.handleInitSetting()
        }
    }

    // 父组件请求参数
    queryArgs: any
    // 父组件请求参数,用于重置
    defaultQueryArgs: any
    // 保存每次请求的参数
    tableQueryArgs: any
    // 暴露给外部的form对象
    queryForm: FormInstance
    // 暴露给外部的请求参数
    getQueryArgs: any
    // 分页数据
    pagination: any
    // 筛选排序参数
    filterAndSortArgs: any
    // 分页参数
    pageArgs: any
    // props中的columns
    tableColumns: MyColumns<T>[]
    // 右侧input请求参数
    settingInputArgs: any

    componentDidMount() {
        if (this.props.initialValues) {
            setTimeout(() => {
                this.queryForm.setFieldsValue(this.props.initialValues);
                this.queryTablePageOne()
            }, 0)
        } else {
            this.queryTablePageOne()
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps: MyTableProps<T>) {
        const { queryArgs, initialValues, dataSource, rowType, rowSelections } = this.props
        // 判断父组件是否改变queryArgs
        if (queryArgs && nextProps.queryArgs && JSON.stringify(queryArgs) !== JSON.stringify(nextProps.queryArgs)) {
            this.queryArgs = nextProps.queryArgs
            this.queryTablePageOne(nextProps.queryArgs)
        }
        // 判断父组件是否改变initialValues
        if (initialValues && nextProps.initialValues && JSON.stringify(initialValues) !== JSON.stringify(nextProps.initialValues)) {
            this.queryForm.setFieldsValue(nextProps.initialValues)
        }
        // 判断父组件是否改变dataSource
        if (dataSource && nextProps.dataSource && JSON.stringify(dataSource) !== JSON.stringify(nextProps.dataSource)) {
            this.setState({
                tableData: nextProps.dataSource
            })
        }
        // 判断父组件是否改变scroll
        if (scroll && nextProps.scroll && JSON.stringify(scroll) !== JSON.stringify(nextProps.scroll)) {
            this.setState({
                scroll: nextProps.scroll
            })
        }
        // 修改父组件为多选或者单选
        if (nextProps.rowType || nextProps.rowSelections) {
            if (rowType !== nextProps.rowType || JSON.stringify(rowSelections) !== JSON.stringify(nextProps.rowSelections)) {
                this.setState({
                    rowSetting: {
                        ...this.state.rowSetting,
                        ...nextProps.rowSelections,
                        type: nextProps.rowType,
                    }
                })
            }
        }
    }

    componentWillUnmount() {
        window.onresize = null
    }

    // 初始化各种状态
    handleInitSetting() {
        const props = this.props
        const obj: any = {
            rowSetting: {
                fixed: true,
                onChange: this.rowChange.bind(this),
                type: this.props.rowType || 'checkbox',
            },
            pagination: {
                current: 1,
                pageSize: 10,
                total: 10,
                showSizeChanger: true,
                showTotal: (total: number) => `共${total}条`,
                size: 'default'
            },
            showSetting: true,
            showSettingRight: true,
            showSettingLeft: true,
            showSettingQuery: true,
            showTree: true,
            hideQueryBtn: false,
            treeShowOrHide: true,
        }

        if ('showPages' in props && !props.showPages) {
            obj.pagination = false
        }

        if (
            ('showSetting' in props && !props.showSetting) ||
            ('showSettingRight' in props && !props.showSettingRight && 'showSettingLeft' in props && !props.showSettingLeft)) {
            obj.showSetting = false
        }

        if ('showSettingRight' in props && !props.showSettingRight) {
            obj.showSettingRight = false
        }

        if ('showSettingLeft' in props && !props.showSettingLeft) {
            obj.showSettingLeft = false
        }

        if ('showSettingQuery' in props && !props.showSettingQuery) {
            obj.showSettingQuery = false
        }

        if ('showTree' in props && !props.showTree) {
            obj.showTree = false
        }

        if ('hideQueryBtn' in props && props.hideQueryBtn) {
            obj.hideQueryBtn = true
        }

        if ('showRow' in props && (typeof props.showRow === 'boolean' && !props.showRow)) {
            obj.rowSetting = false
        }

        return obj
    }

    /**
     * 从第一页查询table数据
     * @param data 请求参数
     * */
    queryTablePageOne(data: any = {}) {
        this.pageArgs = this.state.pagination ? { page: 1, size: this.state.pagination.pageSize, } : {}
        this.queryTable({
            ...this.pageArgs,
            ...data
        })
    }

    /**
     * 查询table数据
     * @param data 请求参数
     * */
    async queryTable(data: IQueryParams) {
        const { queryAjax, queryCallback } = this.props
        const { pagination } = this.state
        const formArgs = await this.handleFormValues()

        this.tableQueryArgs = {
            orderType: 'DESC',
            orderField: 'createDataTime',
            ...this.queryArgs,
            ...data,
            ...this.settingInputArgs,
            ...this.filterAndSortArgs,
            ...formArgs,
            ...this.pageArgs,
        }
        // 保存请求参数 用于父组件获取
        this.getQueryArgs = this.tableQueryArgs

        // 判断是否有查询方法
        if (queryAjax) {
            this.setState({
                loading: true
            })

            const result: any = await queryAjax(this.tableQueryArgs)

            this.setState({
                loading: false
            })

            if (result) {
                const datas: any[] = result.data
                const total = Number(result.total)

                this.setState({
                    tableData: datas
                })

                if (pagination) {
                    // 重新计算当前分页，用于删除操作
                    let newPage = data ? data.page : 1

                    if (newPage > 1) {
                        const oldTotal = total <= ((data.page - 1) * data.size)
                        newPage = oldTotal ? data.page - 1 : data.page
                    }

                    this.setState({
                        pagination: {
                            ...pagination,
                            pageSize: data ? data.size : 10,
                            current: newPage,
                            total: total
                        }
                    })
                }

                if (queryCallback) { // 请求回调函数
                    queryCallback(datas, result)
                }
            } else {
                if (queryCallback) { // 请求回调函数
                    queryCallback([], result)
                }
            }
        }

    }

    /**
     * 处理头部表单数据
     * */
    async handleFormValues() {
        const { queryDom } = this.props
        let _values: any = queryDom ? this.queryForm.getFieldsValue() : {}
        if (queryDom) {
            queryDom.forEach((item: QueryDomProps) => {
                if (item.handleValue) {
                    const _value: any = _values[item.name] ? item.handleValue(_values[item.name], _values) : {}
                    _values = {
                        ..._values,
                        ..._value
                    }
                }
            })
        }
        return _values
    }

    /**
     *  处理formItem
     * @param data Array formItem参数
     * */
    handleFormItem(data: QueryDomProps[]) {
        return data.map((item) => {
            return <Form.Item key={item.name} label={item.label} name={item.name}>
                {item.dom}
            </Form.Item>
        })
    }

    /**
     * 表单提交事件
     * @param data 表单返回值
     * */
    queryFinish = () => {
        // 清除二级搜索
        this.refresh()
    }

    /**
     * 右侧设置中input的onChange 事件
     * @param value input值
     * */
    settingQueryHandle(value: string) {
        const { settingQuery, queryChange } = this.props
        const obj: any = {}
        obj[settingQuery!.key] = value

        if (queryChange) {
            queryChange(obj)
        }

        this.settingInputArgs = obj
        this.queryTablePageOne()
    }

    /**
     * 不刷新table的情况下，更新单条table数据
     * @param data 单条数据
     * @param key 对应rowKey 默认是id
     * */
    updateDataOne(data: any, key = 'id') {
        const { tableData } = this.state
        const _tableData: any = JSON.parse(JSON.stringify(tableData))
        const index = _tableData.findIndex((item: any) => item[key] === data[key])
        if (index > -1) {
            _tableData[index] = data
            this.setState({
                tableData: _tableData
            })
        }
    }

    // 重置表单为传入的默认值
    resetForm() {
        const { initialValues } = this.props
        if (this.queryForm) {
            this.queryForm.setFieldsValue(initialValues)
        }
    }

    reload() { // 重置刷新当前页数据
        this.resetForm()
        this.queryTable({
            ...this.tableQueryArgs,
            ...this.pageArgs
        })
    }

    // 重置刷新，并从第一页请求数据
    reloadPageOne() {
        this.resetForm()

        this.queryTablePageOne({
            ...this.tableQueryArgs,
            page: 1
        })
    }

    /**
     * 勾选回调事件
     * @param keys table列表key集合值
     * @param rows table列表集合值
     * */
    rowChange(keys: string[], rows: any[]) {
        const { rowChange } = this.props
        if (rowChange) {
            rowChange(keys, rows)
        }
    }

    //  右侧刷新按钮
    refresh() {
        const { refresh } = this.props

        this.setState({
            queryValue: '',
            filterdInfo: null,
            sortedInfo: null,
        })
        // 重置queryArgs为最开始默认值
        this.queryArgs = this.defaultQueryArgs
        this.filterAndSortArgs = {}
        this.settingInputArgs = {}

        if (refresh) {
            refresh()
        }

        this.queryTablePageOne()
    }

    // 翻页，过滤，排序回调事件
    tableChange = async (page: any, filters: any, sorter: any, extra: any) => {
        const { onChange, columns, pageCallback } = this.props
        const { pagination, filterdInfoData } = this.state

        if (onChange) {
            onChange(page, filters, sorter, extra)
        }

        if (JSON.stringify(page) !== '{}' && (pagination.pageSize !== page.pageSize || pagination.current !== page.current)) {
            this.pageArgs = {
                size: page.pageSize,
                page: page.current
            }
            await this.queryTable(this.pageArgs);
            if (pageCallback) {
                pageCallback(this.pageArgs)
            }
            return
        }

        let filterArgs: any = {}

        // 对比新旧筛选值，因为过滤会携带所有的过滤值
        for (const a in filters) {
            if (filters[a]) {
                if (filterdInfoData && a in filterdInfoData) {
                    if (JSON.stringify(filters[a][0]) === JSON.stringify(filterdInfoData[a])) {
                        filterArgs = filterdInfoData
                    } else {
                        filterArgs = {}
                        filterArgs[a] = filters[a][0]
                    }
                } else {
                    filterArgs = {}
                    filterArgs[a] = filters[a][0]
                }
            }
        }

        // 根据key 从columns 里面获取对应的filterKey
        for (const key in filterArgs) {
            const item: any = columns.find((a: any) => a.dataIndex === key)

            if (item && item.filter) {
                const queryKey = item.filter && item.filter.key ? item.filter.key : key;

                filterArgs = {
                    ...filterArgs,
                    [queryKey]: filterArgs[key]
                }
            }
        }

        let sorterArgs: ISorterArgsParams = {}

        if (JSON.stringify(sorter) !== '{}') {
            const column = sorter.column
            if (sorter.order === 'descend' || sorter.order === 'ascend') {
                sorterArgs.orderType = sorter.order === 'descend' ? 'DESC' : 'ASC'
                sorterArgs.orderField = column.sorterKey
            } else {
                sorterArgs = {}
            }

        }

        // 用来控制过滤、排序图标状态
        this.setState({
            filterdInfo: filterArgs,
            sortedInfo: sorter
        })

        this.filterAndSortArgs = {
            ...filterArgs,
            ...sorterArgs
        }

        this.queryTablePageOne()
    }

    /**
     * 处理columns过滤以及排序
     * @param columns
     * */
    handleColumnsFilter(columns: MyColumns<any>[]): MyColumns<any>[] {
        const { sortedInfo, filterdInfo } = this.state
        const arr = columns.map((item: any) => {
            item.key = item.dataIndex
            const { sorterKey, filter, ...extra } = item

            // 处理排序
            const sorter = sorterKey ? {
                sorterKey: sorterKey,
                sortOrder: sortedInfo ? sortedInfo.columnKey === item.dataIndex && sortedInfo.order : false,
                sorter: true
            } : {}

            // 处理过滤条件
            const _filter = filter ?
                {
                    filteredValue: filterdInfo ? filterdInfo[item.dataIndex] : null,
                    filterDropdown: (filterProps: any) =>
                        <FilterDom
                            dataIndex={item.dataIndex}

                            filter={{
                                ...filter,
                                domData: typeof filter.domData === 'function' ? filter.domData() : filter.domData
                            }}
                            onConfirm={(selectedKeys: any): void => {
                                this.setState({
                                    filterdInfo: {
                                        [item.dataIndex]: selectedKeys
                                    }
                                })
                            }}
                            onReset={() => {
                                this.setState({
                                    filterdInfo: null
                                })
                            }}
                            {...filterProps}
                        />
                }
                : {}

            if (!extra.render) { // 返回数据为false时 统一处理为'--'
                extra.render = (value: any) => {
                    return value !== '' && value !== null && value !== undefined ? value : '--'
                }
            }

            return {
                ellipsis: true,
                ...sorter,
                ..._filter,
                ...extra
            }
        })
        return arr
    }

    // 合并 columns
    mergeColumns(): MyColumns<any>[] {
        const { settingColumnList } = this.state
        const arr: any = []

        if (this.tableColumns[0] && !this.tableColumns[0].dataIndex) {
            arr.push(this.tableColumns[0])
        }

        // 从设置中获取勾选的column
        settingColumnList.forEach((b: string) => {
            const obj = this.tableColumns.find((item: any) => item.dataIndex === b)
            if (obj) {
                arr.push(obj)
            }
        })

        return this.handleColumnsFilter(arr)
    }

    saveFormRef = (ref: FormInstance) => {
        if (ref) {
            this.queryForm = ref;
        }
    }

    /**
     * 标段信息渲染
     */
    airDataRender = (value: string) => {
        if (value == undefined || value == '' || value == null) {
            return '--'
        } else {
            return value;
        }
    }

    render() {
        const { queryDom, queryBtnDoms, hideQueryBtn, tree, btnGroup, settingQueryStyle, settingQuery, columns, rowKey, sectionDetail, rowClick, ...extra } = this.props
        const {
            showTree,
            treeShowOrHide,
            showSetting,
            showSettingLeft,
            showSettingRight,
            showSettingQuery,
            queryValue,
            tableData,
            pagination,
            loading,
            rowSetting,
            scroll,
        } = this.state


        const _columns = this.mergeColumns()
        return (
            <div className={[styles['concrete-table'], 'concrete-table-style'].join(' ')}>
                {/* 头部查询组件 */}
                {
                    queryDom && queryDom.length ?
                        <div className={styles['concrete-table-queyr']} style={{ backgroundColor: '#fff' }}>
                            <Form layout="inline" ref={this.saveFormRef} onFinish={this.queryFinish}>
                                {this.handleFormItem(queryDom)}
                                {
                                    queryBtnDoms && queryBtnDoms.length ?
                                        queryBtnDoms.map((item: any[], index: number) => {
                                            return <Form.Item key={index}>
                                                {item}
                                            </Form.Item>
                                        })
                                        : null
                                }
                                {
                                    !hideQueryBtn ?
                                        <Form.Item>
                                            <Button icon={<SearchOutlined />} htmlType="submit" type='primary'>查询</Button>
                                        </Form.Item>
                                        : null
                                }
                            </Form>
                        </div>
                        : null
                }
                <div className={styles['concrete-table-body']} style={{ backgroundColor: '#fff' }}>
                    {/* 左侧树组件 */}
                    {
                        showTree ?
                            <div className={[styles['concrete-table-tree'], treeShowOrHide ? styles['tree-show'] : styles['tree-hide']].join(' ')}>
                                {
                                    tree ? tree : null
                                }
                                <LeftOutlined
                                    className={styles['tree-btn']}
                                    onClick={() => {
                                        this.setState({
                                            treeShowOrHide: !treeShowOrHide
                                        })
                                    }}
                                />

                            </div>
                            : null
                    }
                    <div className={styles['concrete-table-body-right']}>
                        <div className={styles['sectionDetail']}>
                            {
                                sectionDetail.map((item: any) => {
                                    return (
                                        <div key={item.key} className={styles['sectionItem']}>
                                            <span className={styles['sectionTitle']}>{item.name}</span>
                                            <span
                                                className={styles['textOmit']}
                                                style={item.key == 'pendingReviewNo' && item.value != '' ?
                                                    { color: 'red' } : { color: 'rgb(89, 89, 89)' }}
                                            >
                                                {this.airDataRender(item.value)}
                                            </span>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        {/* 设置行 */}
                        {
                            showSetting ?
                                <div className={styles['concrete-table-setting']}>
                                    {
                                        showSettingLeft ?
                                            <div className={styles['concrete-table-setting-btns']}>
                                                {
                                                    showSettingQuery ?
                                                        <span className={styles['concrete-table-setting-right-input']}>
                                                            <Input.Search
                                                                style={{
                                                                    width: 200,
                                                                    ...settingQueryStyle
                                                                }}
                                                                maxLength={settingQuery?.maxLength || 20}
                                                                onSearch={this.settingQueryHandle.bind(this)}
                                                                placeholder={settingQuery?.placeholder}
                                                                value={queryValue}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    const { queryValue } = this.state;
                                                                    const reg = regularText.pattern;
                                                                    if (reg.test(value)) {
                                                                        this.setState({
                                                                            queryValue: value
                                                                        })
                                                                    } else {
                                                                        this.setState({
                                                                            queryValue: queryValue
                                                                        })
                                                                    }

                                                                }}
                                                                allowClear
                                                            />
                                                        </span>
                                                        : null
                                                }
                                                {btnGroup}
                                            </div>
                                            : null
                                    }
                                    {
                                        showSettingRight ?
                                            <div className={styles['concrete-table-setting-right']}>
                                                {/* input输入框 */}

                                                {/* 重置按钮 */}
                                                <ReloadOutlined onClick={this.refresh.bind(this)} />
                                                {/* 设置按钮 */}
                                                <Setting columns={columns} onChange={(data: any) => {
                                                    this.setState({
                                                        settingColumnList: data
                                                    })
                                                }} />

                                            </div>
                                            : null
                                    }
                                </div>
                                : null
                        }
                        <Table
                            className={styles['concrete-table-content']}
                            dataSource={tableData}
                            columns={_columns}
                            pagination={pagination}
                            loading={loading}
                            onChange={this.tableChange}
                            rowSelection={rowSetting}
                            size='middle'
                            rowKey={rowKey || 'id'}
                            onRow={
                                record => ({
                                    onClick: e => {
                                        e.stopPropagation()
                                        return rowClick ? rowClick(record, e) : null
                                    }
                                })
                            }
                            showSorterTooltip={false}
                            scroll={scroll}
                            {...extra}
                        />

                    </div>

                </div>

            </div>
        )
    }
}

export default ConcretTable
/**
 * 驾驶证信息表单
 */
import React, { Component } from 'react';
import { DatePicker } from 'antd';

import { regularText } from '@/common/rules';
import { getSelectContainer } from '@/framework/utils/function';
import TableForm from '@/common/tableForm';

interface IProps {
    formRef: any
}

interface IState {

}

class Index extends Component<IProps, IState, any> {
    constructor(props: IProps) {
        super(props);
        this.state = {

        };
    }

    /**
     * 控制日期可选范围
     * 准驾有效期至必须大于等于准驾有效期起
     */
    dateDisabled = (currentDate: any, key: string) => {
        const { formRef } = this.props;
        const startDate = formRef.current.getFieldValue('drivingStartDate');
        const endDate = formRef.current.getFieldValue('drivingEndDate');
        if (key === 'drivingStartDate') {// 准驾有效期起
            return currentDate >= endDate;
        } else if (key === 'drivingEndDate') {// 准驾有效期至
            return currentDate < startDate;
        }
        return false;
    }

    /**
    * 获取表单显示列信息
    */
    getTableColumn = () => {
        // 驾驶证信息
        const drivingLicenseColumn = [{
            name: '操作证号',
            key: 'operationNumber',
            validate: {
                rules: [regularText]
            },
            inputProps: {
                maxLength: 30,
            },
        }, {
            name: '发证机关',
            key: 'operationAgencies',
            validate: {
                rules: [regularText]
            },
            inputProps: {
                maxLength: 50,
                placeholader: '请输入操作证发证机关'
            },
        }, {
            name: '驾驶证号',
            key: 'drivingLicenseNo',
            validate: {
                rules: [regularText]
            },
            inputProps: {
                maxLength: 30,
            },
        }, {
            name: '发证机关',
            key: 'drivingAgencies',
            validate: {
                rules: [regularText]
            },
            inputProps: {
                maxLength: 50,
                placeholader: '请输入驾驶证发证机关'
            },
        }, {
            name: '驾照类别',
            key: 'drivingType',
            validate: {
                rules: [regularText]
            },
            inputProps: {
                maxLength: 5,
            },
        }, {
            name: '准驾有效期起',
            key: 'drivingStartDate',
            component: <DatePicker
                bordered={false}
                style={{ width: '100%' }}
                disabledDate={(current: any) => { return this.dateDisabled(current, 'drivingStartDate') }}
                getPopupContainer={() => getSelectContainer('peopleSelectContainer')} />
        }, {
            name: '准驾有效期至',
            key: 'drivingEndDate',
            component: <DatePicker
                bordered={false}
                style={{ width: '100%' }}
                disabledDate={(current: any) => { return this.dateDisabled(current, 'drivingEndDate') }}
                getPopupContainer={() => getSelectContainer('peopleSelectContainer')} />
        }, {
            name: '提前提醒天数',
            key: 'remindDays',
            validate: {
                rules: [
                    {
                        pattern: new RegExp(/^[1-9][0-9]*$/),
                        message: '范围为1-999的整数',
                    }
                ]
            },
            inputProps: {
                maxLength: 3,
            },
        }]
        return drivingLicenseColumn;
    }

    render() {
        const drivingLicenseColumn = this.getTableColumn();

        return <TableForm dataSource={drivingLicenseColumn} column={8} header='驾驶证信息' />
    }
}
export default Index;

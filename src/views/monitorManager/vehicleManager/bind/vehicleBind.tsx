import React, { Component } from "react";
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';

import Tabs from "antd/es/tabs";
const { TabPane } = Tabs;

import QuickEntryForm from './quickEntry';
import SpeedEntryForm from './speedEntry';

interface IProps {
    intl: { messages: object };
    currentTable: any;
    form: {
        getFieldDecorator: Function;
        getFieldsValue: Function;
    };
}

class VehicleBind extends Component<IProps, any, any>{
    constructor(props: IProps) {
        super(props);
    }

    render() {
        const { currentTable } = this.props;
        return (
            <Tabs tabPosition="left">
                <TabPane tab={<FormattedMessage id="monitor_fastBind" />} key="fastBind">
                    <QuickEntryForm currentTable={currentTable} />
                </TabPane>
                <TabPane forceRender tab={<FormattedMessage id="monitor_speedBind" />} key="speedBind" >
                    <SpeedEntryForm currentTable={currentTable} />
                </TabPane>
            </Tabs>
        )
    }
}


export default connect()(injectIntl(VehicleBind as any));

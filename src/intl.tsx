/* eslint-disable @typescript-eslint/camelcase */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { ConfigProvider } from 'antd';
import zhCN_antd from 'antd/es/locale/zh_CN';
import enUS_antd from 'antd/es/locale/en_US';
import moment from 'moment';
import 'moment/locale/zh-cn';
import zhCN from './framework/locale/zh_CN/index';
import enUS from './framework/locale/en_US/index';
import Router from './framework/router';
import { AllState } from './model';

interface IProps {
    currentLocale: string;
}

const validateMessages = {
    default: "${label}校验失败",
    required: "${label}不能为空",
    enum: "${label} 必须是 [${enum}] 之一",
    whitespace: "${label} 不能为空",
    date: {
        format: "${label}日期格式不正确",
        parse: "${label}无法解析为日期",
        invalid: "${label}是不合法的日期",
    },
    types: {
        string: '字符串',
        method: '方法',
        array: '数组',
        object: '对象',
        number: '数字',
        date: '日期',
        boolean: '布尔值',
        integer: '整数',
        float: '浮点数',
        regexp: '正则表达式',
        email: '邮箱',
        url: '地址',
        hex: '16进制数字',
    },
    string: {
        len: "${label}  ${len}",
        min: "长度不符合，最短不少于${min}个字符",
        max: "长度不符合，最长不超过${max}字符",
        range: "长度不符合，应为${min}-${max}字符",
    },
    number: {
        len: "${label} 必须等于 ${len}",
        min: "${label} 不能小于 ${min}",
        max: "${label} 不能大于 ${max}",
        range: "数值范围不正确，应为${min}-${max}",
    },
    array: {
        len: "${label} 长度必须是 ${len}",
        min: "${label} 长度不能小于 ${min}",
        max: "${label} 长度不能大于 ${max}",
        range: "${label} 长度必须介于 ${min} 和 ${max} 之间",
    },
    pattern: {
        mismatch: "${label} 不匹配模式 ${pattern}",
    },
};

class Intl extends Component<IProps, any, any> {

    messagesLocale = () => {
        const { currentLocale } = this.props;
        switch (currentLocale) {
            case 'zh':
                return zhCN;
            case 'en':
                return enUS;
            default:
                return zhCN;
        }
    }

    antdLocale = () => {
        const { currentLocale } = this.props;
        moment.locale(currentLocale);
        switch (currentLocale) {
            case 'zh':
                return zhCN_antd;
            case 'en':
                return enUS_antd;
            default:
                return zhCN_antd;
        }
    }

    render() {
        const { currentLocale } = this.props;
        return (
            <ConfigProvider locale={this.antdLocale()} form={{ validateMessages }}>
                <IntlProvider locale={currentLocale} messages={this.messagesLocale()} >
                    <Router />
                </IntlProvider>
            </ConfigProvider>
        );
    }
}

function mapStateToProps(state: AllState) {
    return {
        currentLocale: state.root.currentLocale,
    };
}


export default connect<Partial<IProps>, any, any, any>(
    mapStateToProps,
    null
)(Intl);

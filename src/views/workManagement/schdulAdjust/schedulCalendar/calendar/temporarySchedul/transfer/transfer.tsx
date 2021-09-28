import React from 'react';
import { setTemporary, deleteTemporary, checkTemporary } from '@/server/workManagement';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { Transfer, Table, message, Popconfirm } from 'antd';
import lodash from 'lodash';
import styles from './index.module.less';
const { difference, differenceWith, isEqual } = lodash;

type Direction = 'toLeft' | 'toRight';

interface IProps {
    beforeDataTranslate?: (direction: Direction) => boolean; //数据传送之前的函数  false 终止传输
    leftTitle: string;
    rightTitle: string;
    leftCloumns: any[]; //左侧数据结构
    rightCloumns: any[]; //右侧数据结构
    leftData: any[]; //左侧数据列表
    rightData: any[]; //右侧数据列表
    onTransfer: (direction: Direction, rowKeys: string[]) => void;
    wrongDataRowKeys: string[];
    checkConflict: (rowKeys: string[]) => Promise<{ fail: string[]; success: string[] }>;
    setWrongRowKeys: (wrongRowKeys: string[]) => void;
}

interface IState {
    direction: Direction; //数据传送方向
    selectedRowKeysL: string[];
    selectedRowKeysR: string[];
    wrongDataRowKeys: string[];
    popDisabled: boolean;
    wrongDataLength: number;
    popVisible: boolean;
}

class Transfer2 extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            direction: 'toLeft',
            selectedRowKeysL: [],
            selectedRowKeysR: [],
            wrongDataRowKeys: [],
            popDisabled: true,
            wrongDataLength: 0,
            popVisible: false,
        };
    }
    clearSelectRows() {
        this.setState({
            selectedRowKeysR: [],
            selectedRowKeysL: [],
            wrongDataRowKeys: [],
        });
    }
    // 发送数据
    sendData = async () => {
        if (!this.beforeDataTranslate()) return;
        const { direction } = this.state;
        const { onTransfer } = this.props;
        if (direction == 'toRight') {
            const { selectedRowKeysL } = this.state;
            // console.log(selectedRowKeysL);
            onTransfer(this.state.direction, selectedRowKeysL);
        }

        if (direction == 'toLeft') {
            const { selectedRowKeysR } = this.state;
            // console.log(selectedRowKeysR);
            onTransfer(this.state.direction, selectedRowKeysR);
        }
    };
    //外部使用
    setPopVisible(value: boolean) {
        this.setState({
            popVisible: value,
        });
    }
    beforeDataTranslate = (): boolean => {
        const { beforeDataTranslate } = this.props;
        if (beforeDataTranslate) return beforeDataTranslate(this.state.direction);
        return true;
    };
    // 向右确认
    toRightComfirm = () => {
        this.setState({ direction: 'toRight', popVisible: false }, () => {
            this.sendData();
        });
    };
    // 向左确认
    toLeftComfirm = () => {
        this.setState({ direction: 'toLeft', popVisible: false }, () => {
            this.sendData();
        });
    };
    //左
    onSelectChangeL = (selectedRowKeys: any[]) => {
        this.setState({ selectedRowKeysL: selectedRowKeys });
    };
    //右
    onSelectChangeR = (selectedRowKeys: any[]) => {
        this.setState({ selectedRowKeysR: selectedRowKeys });
    };
    setRowClassName = (record: any, index: number): string => {
        const { wrongDataRowKeys } = this.props;
        return wrongDataRowKeys.includes(record.monitorId) ? styles.wrongRow : '';
    };
    getTitle(): string {
        const { wrongDataLength } = this.state;
        if (wrongDataLength != 0) {
            return `${wrongDataLength}个监控对象班次有冲突，确认操作？`;
        }
        return '确认操作？';
    }
    render() {
        const { leftTitle, rightTitle, leftCloumns, rightCloumns, leftData, rightData, wrongDataRowKeys } = this.props;
        const { selectedRowKeysL, selectedRowKeysR, popVisible } = this.state;
        const rowSelectionL = {
            selectedRowKeys: this.state.selectedRowKeysL,
            getCheckboxProps: (record: any) => ({
                disabled: wrongDataRowKeys.includes(record.monitorId),
            }),
            onChange: this.onSelectChangeL,
        };
        const rowSelectionR = {
            selectedRowKeys: this.state.selectedRowKeysR,
            onChange: this.onSelectChangeR,
        };
        return (
            <div className={styles.transferBox}>
                <div className={styles.left}>
                    <p>{leftTitle}</p>
                    <Table
                        rowClassName={this.setRowClassName}
                        rowKey="monitorId"
                        columns={leftCloumns}
                        dataSource={leftData}
                        rowSelection={rowSelectionL}
                        className={styles.table}
                        size="small"
                    />
                </div>
                <div className={styles.middle}>
                    <div>
                        {selectedRowKeysL.length > 0 ? (
                            <Popconfirm
                                visible={popVisible}
                                onCancel={() => this.setState({ popVisible: false, wrongDataLength: 0 })}
                                title={this.getTitle()}
                                onConfirm={() => {
                                  this.toRightComfirm()
                                  this.setState({ popVisible: false, wrongDataLength: 0 })
                                }}
                                cancelText="取消"
                                okText="确定"
                            >
                                <p
                                    className={styles.rightArrow}
                                    style={{ background: '#108ee9' }}
                                    onClick={async () => {
                                        const checkRes = await this.props.checkConflict(selectedRowKeysL);
                                        const newKeys = this.state.selectedRowKeysL.filter((item) => !checkRes.fail.includes(item));
                                        this.setState({
                                            selectedRowKeysL: newKeys,
                                            wrongDataLength: checkRes.fail.length,
                                            popVisible: newKeys.length > 0
                                        });
                                    }}
                                >
                                    &gt;
                                </p>
                            </Popconfirm>
                        ) : (
                            <p className={styles.rightArrow} style={{ background: '#c9c9c9' }}>
                                &gt;
                            </p>
                        )}
                        {selectedRowKeysR.length > 0 ? (
                            <Popconfirm title="确认操作？" onConfirm={() => this.toLeftComfirm()} cancelText="取消" okText="确定">
                                <p className={styles.rightArrow} style={{ background: '#108ee9' }}>
                                    &lt;
                                </p>
                            </Popconfirm>
                        ) : (
                            <p className={styles.rightArrow} style={{ background: '#c9c9c9' }}>
                                &lt;
                            </p>
                        )}
                    </div>
                </div>
                <div className={styles.right}>
                    <p>{rightTitle}</p>
                    <Table
                        rowKey="monitorId"
                        columns={rightCloumns}
                        dataSource={rightData}
                        rowSelection={rowSelectionR}
                        className={styles.table}
                        size="small"
                    />
                </div>
            </div>
        );
    }
}

export default Transfer2;

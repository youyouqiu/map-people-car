import React from 'react';
import EditableTagGroup from './tags';
import { getWorkShift } from '@/server/workManagement';
import { setTemporary, deleteTemporary, checkTemporary, temporaryMonitors } from '@/server/workManagement';
import { message } from 'antd';
import Transfer from './transfer/transfer';
import moment from 'moment';
import { connect } from 'react-redux';
import { AllState } from '@/model';

interface IState {
    tags: { id: string; data: any }[];
    length: number;
    selectedShiftId: string;
    shiftTime: string;
    hasChildrenArr: boolean[]; //是否有对号
    avilableMonitor: any[]; //可分配监控对象
    allTempSchedul: any[]; //所有临班数据
    tempSchedul: any[]; //某个具体班次的临班数据\
    leftFilters: { text: string; value: string }[];
    rightFilters: { text: string; value: string }[];
    wrongDataRowKeys: string[];
}
interface IProps {
    schedulArr: any[];
    reload: Function; //刷新日历月数据
    reGetData: Function; //重新获取 可分配临班数据  临班数据 正班数据
    sectionId: string;
    clickedDate: string;
    workId: string;
    time: string;
    weekType: string;
}

class Temporary extends React.Component<IProps, IState> {
    tempRef: any = React.createRef();
    constructor(props: any) {
        super(props);
        this.state = {
            tags: [],
            length: 0,
            selectedShiftId: '',
            shiftTime: '',
            hasChildrenArr: [],
            avilableMonitor: [],
            allTempSchedul: [],
            tempSchedul: [],
            leftFilters: [],
            rightFilters: [],
            wrongDataRowKeys: [],
        };
    }
    setSelectedShiftId = (selectedShiftId: string) => {
        this.setState({
            selectedShiftId,
        });
        const shiftTime = this.state.tags.find((item) => item.id == selectedShiftId);
        this.setSelectedShiftTime(shiftTime?.data.shiftTime);
    };
    setSelectedShiftTime = (shiftTime: string) => {
        this.setState(
            {
                shiftTime,
                wrongDataRowKeys: [],
            },
            this.getData
        );
        this.tempRef.current?.clearSelectRows();
    };
    //通过shiftTime获取shiftId
    getShiftId = (shiftTime: string) => {
        const { tags } = this.state;
        const res: any = tags.find((item: any) => {
            return item.id == shiftTime;
        });
        if (res) {
            if (!res.data.shiftId || res.data.shiftId.length == 8) return '';
            return res.data.shiftId;
        }
    };
    getData = async () => {
        const { sectionId, workId, clickedDate } = this.props;
        const { selectedShiftId, shiftTime } = this.state;
        if (!shiftTime) return;
        const param1 = {
            sectionId: sectionId,
            shiftType: 1,
            shiftTime: shiftTime, //为空时获取所有
            time: moment(clickedDate).format('YYYYMMDD'),
            weekType: moment(clickedDate).day(),
            workId: workId,
        };
        //临班数据
        const tempSchdul = await getWorkShift<any>(param1);
        if (tempSchdul) {
            const res = tempSchdul.shifts.map((item: any) => item.monitorCategoryStr);
            const handledRes: any = Array.from(new Set(res)).map((item) => ({
                text: item,
                value: item,
            }));
            this.setState({
                tempSchedul: tempSchdul.shifts,
                rightFilters: handledRes,
            });
        }
        const param2 = {
            sectionId: sectionId,
            workId: workId,
            shiftTime: shiftTime,
            time: moment(clickedDate).format('YYYYMMDD'),
            weekType: moment(clickedDate).day(),
            shiftId: this.getShiftId(shiftTime),
        };
        //可分配监控对象
        const res = await temporaryMonitors<any[]>(param2);
        if (res) {
            const res2 = res.map((item: any) => item.monitorCategoryStr);
            const handledRes: any = Array.from(new Set(res2)).map((item) => ({
                text: item,
                value: item,
            }));
            this.setState({
                avilableMonitor: res,
                leftFilters: handledRes,
            });
        }
    };
    componentDidMount() {
        const newTags: { id: string; data: any }[] = [];
        let hasChildrenArr = [];
        const { clickedDate, sectionId, workId } = this.props;
        // if (sectionId && workId) {
        this.getData();
        getWorkShift({
            sectionId: sectionId,
            shiftType: 2,
            shiftTime: '', //为空时获取所有
            time: moment(clickedDate).format('YYYYMMDD'),
            weekType: moment(clickedDate).day(),
            workId: workId,
        }).then((res: any) => {
            if (res) {
                this.setState({
                    allTempSchedul: res.shifts,
                });
                res.shifts?.forEach((item: any) => {
                    if (
                        !newTags.some((item2) => {
                            return item2.id == item.shiftTime;
                        })
                    ) {
                        newTags.push({
                            id: item.shiftTime,
                            data: { ...item },
                        });
                    }
                });
                this.setState({
                    tags: newTags,
                    length: newTags?.length,
                });
                hasChildrenArr = newTags.map((item1) => {
                    return res.shifts?.some((item2: any) => {
                        return item2.shiftType == 1 && item2.shiftTime == item1.id;
                    });
                });
                this.setState({
                    hasChildrenArr,
                });
            }
        });
        // }
    }
    //刷新tags  设置是否有对号
    refreshTag = (type: 'add' | 'delete', shiftTime: string, shiftName: string) => {
        // console.log('shiftTime', shiftTime);
        // console.log('shiftName', shiftName);

        const { tags, hasChildrenArr } = this.state;
        const targetIndex = tags.findIndex((item) => {
            return item?.data.shiftTime == shiftTime && item?.data.shiftName == shiftName;
        });
        console.log(targetIndex);

        const newHasChildrenArr = hasChildrenArr.map((item, index) => {
            if (index == targetIndex) {
                return true;
            }
            return item;
        });
        // console.log('newHasChildrenArr', newHasChildrenArr);
        this.tempRef.current?.clearSelectRows();
        this.setState({
            hasChildrenArr: newHasChildrenArr,
        });
        return;
        // const { clickedDate, sectionId, workId } = this.props;
        // getWorkShift({
        //     sectionId: sectionId,
        //     shiftType: 2,
        //     shiftTime: '', //为空时获取所有
        //     time: moment(clickedDate).format('YYYYMMDD'),
        //     weekType: moment(clickedDate).day(),
        //     workId: workId,
        // }).then((res: any) => {
        //     if (res) {
        //         console.log('res', res.shifts);
        //         res.shifts?.forEach((item: any) => {
        //             if (
        //                 !newTags.some((item2) => {
        //                     return item2.id == item.shiftTime;
        //                 })
        //             ) {
        //                 newTags.push({
        //                     id: item.shiftTime,
        //                     data: { ...item },
        //                 });
        //             }
        //         });
        //         this.setState({
        //             tags: newTags,
        //             length: newTags?.length,
        //         });
        //         hasChildrenArr = newTags.map((item1) => {
        //             return res.shifts?.some((item2: any) => {
        //                 return item2.shiftType == 1 && item2.shiftTime == item1.id;
        //             });
        //         });
        //         this.setState({
        //             hasChildrenArr,
        //         });
        //     }
        // });
    };
    //穿梭事件
    onTransfer = async (direction: 'toRight' | 'toLeft', rowKeys: string[]) => {
        const { tags, selectedShiftId, avilableMonitor } = this.state;
        const { sectionId, workId, time, weekType, reload, reGetData } = this.props;
        const { data }: any = tags.find((item) => item.id == selectedShiftId) || {};
        const monitorArr = avilableMonitor.filter((item) => {
            return rowKeys.includes(item.monitorId);
        });
        if (tags.length == 0) {
            message.warn('没有班次，请先设置班次！');
            return;
        }
        if (direction == 'toRight') {
            //设置临班
            const merge = {
                shiftName: data.shiftName || '临班',
                shiftStatus: data.shiftStatus,
                shiftTime: data.shiftTime,
                shiftId: data.shiftId?.length == 8 ? '' : data.shiftId, //班次id长度为8 时 说明是新增的临班(新增临班的id是前端的一个8位随机数)
                shiftType: 1,
                workName: data.workName,
                workType: data.workType,
                monitorType: data.monitorType,
            };
            const params = {
                sectionId: sectionId, //标段id
                time: time, //班次时间yyyymmdd
                weekType: weekType, //时间类型 (1：星期一；2：星期二…)
                workId: workId, //作业对象id，机动组
                ...merge,
            };
            const send = monitorArr.map((item) => ({
                ...params,
                ...item,
            }));
            const checkRes = await checkTemporary<any[]>(send);
            if (checkRes?.length == 0) {
                const result = await setTemporary(send);
                if (result) {
                    message.success('设置成功');
                    reload();
                    this.getData();
                    this.refreshTag('add', data.shiftTime, data.shiftName);
                    reGetData();
                }
            } else {
                // message.warn('设置失败');
                // 剔除错误班次，重新发起请求
                const worngTemp: string[] = [];
                checkRes?.forEach((item) => {
                    worngTemp.push(item.monitorId);
                });
                this.setState({ wrongDataRowKeys: worngTemp });
                const correctData = send.filter((item2) => {
                    return !worngTemp.includes(item2.monitorId);
                });
                const checkRes2 = await checkTemporary<any[]>(correctData);
                if (checkRes2?.length == 0) {
                    const res = await setTemporary(correctData);
                    if (res) {
                        message.success('设置成功');
                        reload();
                        this.getData();
                        this.refreshTag('add', data.shiftTime, data.shiftName);
                        reGetData();
                    }
                }
            }
            this.tempRef.current?.clearSelectRows();
        } else if (direction == 'toLeft') {
            //删除临班
            const moveIds = rowKeys;
            const params = {
                monitorId: moveIds.join(), //监控对象id 多个逗号隔开
                monitorIds: moveIds, //监控对象id 多个逗号隔开
                sectionId: sectionId, //标段id
                shiftTime: data.shiftTime, //排班时间
                time: time, //月历时间
                workId: workId, //作业对象id
            };
            const result = await deleteTemporary(params);
            if (result) {
                message.success('删除成功');
                reload();
                this.getData();
                this.refreshTag('delete', data.shiftTime, data.shiftName);
                reGetData();
            } else {
                message.warn('删除失败');
            }
            this.tempRef.current?.clearSelectRows();
            reload();
        }
    };
    /**
     * 检测冲突 返回有冲突的数据和没有冲突的数据
     * @param rowKeys
     * @return {fail:string[],success:string[]}
     */
    checkConflict = async (rowKeys: string[] = []): Promise<{ fail: string[]; success: string[] }> => {
        this.tempRef.current?.setPopVisible(false);
        const { tags, selectedShiftId, avilableMonitor } = this.state;
        const { sectionId, workId, time, weekType } = this.props;
        const { data }: any = tags.find((item) => item.id == selectedShiftId) || {};
        const monitorArr = avilableMonitor.filter((item) => {
            return rowKeys.includes(item.monitorId);
        });
        const merge = {
            shiftName: data.shiftName || '临班',
            shiftStatus: data.shiftStatus,
            shiftTime: data.shiftTime,
            shiftId: data.shiftId?.length == 8 ? '' : data.shiftId, //班次id长度为8 时 说明是新增的临班(新增临班的id是前端的一个8位随机数)
            shiftType: 1,
            workName: data.workName,
            workType: data.workType,
            monitorType: data.monitorType,
        };
        const params = {
            sectionId: sectionId, //标段id
            time: time, //班次时间yyyymmdd
            weekType: weekType, //时间类型 (1：星期一；2：星期二…)
            workId: workId, //作业对象id，机动组
            ...merge,
        };
        const send = monitorArr.map((item) => ({
            ...params,
            ...item,
        }));
        const checkRes = await checkTemporary<any[]>(send);
        if (checkRes?.length == 0) {
            return {
                fail: [],
                success: rowKeys,
            };
        } else {
            // message.warn('设置失败');
            // 剔除错误班次，重新发起请求
            const worngTemp: string[] = [];
            checkRes?.forEach((item) => {
                worngTemp.push(item.monitorId);
            });
            const correctData = rowKeys.filter((item2) => {
                return !worngTemp.includes(item2);
            });
            this.setState({ wrongDataRowKeys: worngTemp });
            return {
                fail: worngTemp,
                success: correctData,
            };
        }
    };
    setWrongRowKeys = (value: string[]) => {
        this.setState({
            wrongDataRowKeys: value,
        });
    };
    //添加编号
    withIndex(data: any[]) {
        return data.map((item, index: number) => {
            return {
                index: index + 1,
                ...item,
            };
        });
    }

    render() {
        const leftCloumns = [
            {
                dataIndex: 'index',
                title: '序号',
                width: 60,
            },
            {
                dataIndex: 'monitorName',
                title: '监控对象',
                width: 120,
            },
            {
                dataIndex: 'monitorCategoryStr',
                title: '类型',
                width: 140,
                filters: this.state.leftFilters,
                onFilter: (value: string, record: any) => {
                    return record.monitorCategoryStr == value;
                },
            },
        ];
        const rightColumns = [
            {
                dataIndex: 'index',
                title: '序号',
                width: 60,
            },
            {
                dataIndex: 'monitorName',
                title: '监控对象',
                width: 120,
            },
            {
                dataIndex: 'monitorCategoryStr',
                title: '类型',
                width: 140,
                filters: this.state.rightFilters,
                onFilter: (value: string, record: any) => {
                    return record.monitorCategoryStr == value;
                },
            },
        ];
        const { avilableMonitor, tempSchedul, wrongDataRowKeys } = this.state;
        return (
            <div>
                <EditableTagGroup
                    tags={this.state.tags}
                    setTags={(tags: { id: string; data: any }[]) => {
                        this.setState({ tags, hasChildrenArr: [...this.state.hasChildrenArr, false] });
                    }}
                    hasChildrenArr={this.state.hasChildrenArr}
                    length={this.state.length}
                    setSelectedShiftId={this.setSelectedShiftId}
                    selectedShiftId={this.state.selectedShiftId}
                    setSelectedShiftTime={this.setSelectedShiftTime}
                />
                <Transfer
                    ref={this.tempRef}
                    leftTitle="可分配监控对象（排班冲突的监控对象不可分配）"
                    rightTitle="已分配监控对象"
                    leftCloumns={leftCloumns}
                    rightCloumns={rightColumns}
                    leftData={this.withIndex(avilableMonitor)}
                    rightData={this.withIndex(tempSchedul)}
                    onTransfer={this.onTransfer}
                    checkConflict={this.checkConflict}
                    setWrongRowKeys={this.setWrongRowKeys}
                    wrongDataRowKeys={wrongDataRowKeys}
                />
            </div>
        );
    }
}

export default connect((state: AllState) => ({
    sectionId: state.schedulCalendar.sectionId,
    clickedDate: state.schedulCalendar.clickedDate,
    workId: state.schedulCalendar.workId,
    time: state.schedulCalendar.time,
    weekType: state.schedulCalendar.weekType,
}))(Temporary);

import React, { useState, useEffect, Fragment } from 'react';
import { Select } from 'antd';
import { EditDrawer } from '@/common';
import Temporary from './temporay';
import styles from './index.module.less';
const { Option } = Select;
interface IProps {
    visible: boolean;
    closeDrawer: Function;
    normalSchedulList: {
        //正班数据
        lastUpdateUser: string;
        shifts: any[];
    };
    reload: Function; //刷新日历月数据
    reGetData: Function; //重新获取 可分配临班数据  临班数据 正班数据
}

const TemporarySchedul = (props: IProps) => {
    const { visible, closeDrawer, normalSchedulList } = props;
    const [originData, setOriginData] = useState<any[]>([]); //原始数据
    const [filterData, setFilterData] = useState<any[]>([]); //过滤数据

    const allPeoples = new Set();
    const allVihecles = new Set();

    //
    const uniqueShiftId: any = {};
    const initData = () => {
        originData.forEach((item: any) => {
            if (item.monitorType == 1) {
                allPeoples.add(item.monitorName);
            } else if (item.monitorType == 0) {
                allVihecles.add(item.monitorName);
            }
            if (!uniqueShiftId[item.shiftId]) {
                uniqueShiftId[item.shiftId] = {};
            }
        });
    };
    initData();

    useEffect(() => {
        setOriginData(normalSchedulList.shifts);
        setFilterData(normalSchedulList.shifts);
    }, [normalSchedulList]);

    const tempWorkNameList: any[] = [];
    originData.forEach((item: any) => {
        if (!tempWorkNameList.includes(item.modeName)) {
            item.modeName && tempWorkNameList.push(item.modeName);
        }
    });
    const workNameList = tempWorkNameList;
    //获取通过shiftId分类的排班
    const getSchedulArr = () => {
        const tempSchedulArr = [];
        for (const key in uniqueShiftId) {
            let tempObj: any = {};
            const item = filterData.find((item: any) => {
                return key == item.shiftId;
            });
            if (item) {
                tempObj = {
                    id: item.shiftId,
                    shiftName: item.shiftName,
                    shiftTime: item.shiftTime,
                };
            }
            tempSchedulArr.push(tempObj);
        }
        return tempSchedulArr;
    };
    const schedulArr = getSchedulArr();
    //获取通过shiftId分类的人和车的分组信息
    const getPeopleAndVehiclelArr = () => {
        const tempPeopleArr = [];
        const tempVehicleArr = [];
        for (const key in uniqueShiftId) {
            const tempPeople: any = { id: key, peoples: [] };
            const tempVehecle: any = { id: key, vehicles: [] };
            filterData.forEach((item: any) => {
                if (key == item.shiftId) {
                    if (item.monitorType == 1) {
                        tempPeople.peoples.push(item.monitorName);
                    } else if (item.monitorType == 0) {
                        tempVehecle.vehicles.push(item.monitorName);
                    }
                }
            });
            tempPeopleArr.push(tempPeople);
            tempVehicleArr.push(tempVehecle);
        }
        return {
            peopleArr: tempPeopleArr,
            vehicleArr: tempVehicleArr,
        };
    };
    const { peopleArr, vehicleArr } = getPeopleAndVehiclelArr();
    const workChange = (value: any) => {
        if (value == 'all') {
            setFilterData(originData);
            return;
        }
        setFilterData(
            originData.filter((item: any) => {
                return item.modeName == value;
            })
        );
    };

    const renderTr = () => {
        return schedulArr.map((item: any) => {
            const { peoples } = peopleArr.find((item2) => item2.id == item.id) || {};
            const { vehicles } = vehicleArr.find((item3) => item3.id == item.id) || {};
            return (
                <Fragment key={item.id}>
                    {item.shiftTime ? (
                        <tr>
                            <td valign="top" align="center">
                                <p className={styles.p1}>{item.shiftName}</p>
                            </td>
                            <td valign="top" align="center">
                                <p className={styles.p2}>{item.shiftTime}</p>
                            </td>
                            <td valign="top" align="center">
                                <p className={styles.p3}>{peoples?.join() || '--'}</p>
                            </td>
                            <td valign="top" align="center">
                                <p className={styles.p3}>{vehicles?.join() || '--'}</p>
                            </td>
                        </tr>
                    ) : null}
                </Fragment>
            );
        });
    };
    return (
        <div>
            <EditDrawer title={'设置临班'} onClose={closeDrawer} destroyOnClose visible={visible} getContainer={'body'} width={1060} onConfirm={closeDrawer}>
                <div className={styles.wrap}>
                    <div className={styles.head}>
                        <p>正班班次</p>
                        <div>
                            <span>作业模式：</span>
                            <Select defaultValue="all" size="small" style={{ width: '100px' }} onChange={workChange}>
                                <Option value="all">全部</Option>
                                {workNameList.map((item: any, index: number) => {
                                    return (
                                        <Option value={item} key={index}>
                                            {item}
                                        </Option>
                                    );
                                })}
                            </Select>
                        </div>
                    </div>
                    <div className={styles.body}>
                        <table>
                            <thead>
                                <tr>
                                    <th>班次名称</th>
                                    <th>作业时间</th>
                                    <th>人员({allPeoples.size})</th>
                                    <th>车辆({allVihecles.size})</th>
                                </tr>
                            </thead>
                            <tbody>{renderTr()}</tbody>
                        </table>
                    </div>
                </div>
                <div className={styles.wrap}>
                    <div className={styles.head}>
                        <p>临班班次</p>
                    </div>
                    <div className={styles.body}>
                        <Temporary schedulArr={props.normalSchedulList.shifts} reload={props.reload} reGetData={props.reGetData} />
                    </div>
                </div>
            </EditDrawer>
        </div>
    );
};
export default TemporarySchedul;

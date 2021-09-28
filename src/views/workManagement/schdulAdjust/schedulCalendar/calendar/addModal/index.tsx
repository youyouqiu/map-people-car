import React, { useRef, useState, useEffect } from 'react';
import { Form, Select, Radio } from 'antd';
import styles from './index.module.less';
import { RadioChangeEvent } from 'antd/lib/radio';
import { cloneDeep } from 'lodash';
// import { FormInstance } from 'antd/lib/form';
const { Option } = Select;
interface Props {
    name: string;
    date: string;
    workData: any[];
    setModalValue: (value: any) => void;
    schedulList: {
        lastUpdateUser: string;
        shifts: any[];
    };
}
const AddModal = (props: Props) => {
    const { name, date, setModalValue, schedulList } = props;
    const formRef: React.MutableRefObject<null> = useRef(null);
    const [_schedulList, set_schedulList] = useState(schedulList.shifts);
    const [filteredSchdul, setFilteredSchdul] = useState(schedulList.shifts);
    const [globalWorkName, setWorkName] = useState('all');

    useEffect(() => {
        set_schedulList(schedulList.shifts);
        setFilteredSchdul(schedulList.shifts);
    }, [schedulList]);

    const workChange = (value: any) => {
        setWorkName(value);
        if (value == 'all') {
            setFilteredSchdul(_schedulList);
            return;
        }
        setFilteredSchdul(
            _schedulList.filter((item: any) => {
                return item.workName == value;
            })
        );
    };

    const handleChange = (e: any, shiftName: string, selectedWorkName: string) => {
        const new_schedulList = _schedulList.map((item: any) => {
            if (item.shiftName == shiftName && item.workName == selectedWorkName) {
                return {
                    ...item,
                    shiftStatus: e.target.value,
                };
            } else {
                return item;
            }
        });
        set_schedulList(new_schedulList);
        if (globalWorkName == 'all') {
            setFilteredSchdul(new_schedulList);
        } else {
            setFilteredSchdul(
                new_schedulList.filter((item: any) => {
                    return item.workName == globalWorkName;
                })
            );
        }
        setModalValue(new_schedulList);
    };

    return (
        <>
            <div className={styles.head}>
                <p>{name}</p>
                <p>{date}</p>
                <Select defaultValue="all" onChange={workChange} style={{ width: '160px' }}>
                    <Option value="all">全部</Option>
                    {props.workData.map((item) => {
                        return <Option value={item.workName}>{item.workName}</Option>;
                    })}
                </Select>
            </div>
            <Form ref={formRef}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>作业对象</th>
                            <th>班次名称</th>
                            <th>班次时间</th>
                            <th>
                                <Radio.Group>
                                    <Radio value={0}>上班</Radio>
                                    <Radio value={1}>调休</Radio>
                                    <Radio value={2}>请假</Radio>
                                </Radio.Group>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSchdul.map((item: any) => {
                            return (
                                <tr>
                                    <td>{item.workName}</td>
                                    <td>{item.shiftName}</td>
                                    <td>{item.shiftTime}</td>
                                    <td>
                                        <Form.Item style={{ margin: 0 }}>
                                            <Radio.Group
                                                value={item.shiftStatus}
                                                onChange={(e: any) => {
                                                    handleChange(e, item.shiftName, item.workName);
                                                }}
                                            >
                                                <Radio value={0}>上班</Radio>
                                                <Radio value={1}>调休</Radio>
                                                <Radio value={2}>请假</Radio>
                                            </Radio.Group>
                                        </Form.Item>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Form>
        </>
    );
};

export default AddModal;

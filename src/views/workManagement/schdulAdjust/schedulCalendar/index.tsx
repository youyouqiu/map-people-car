import React, { useState, useEffect, useRef } from 'react';
import LeftTree from '../leftTree';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { withRouter } from 'react-router';
import { getMonitorMonthData, getWorkMonthData, treeMonitors, checkWork } from '@/server/workManagement';
import { LeftOutlined, FolderOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import Calendar from './calendar';
import CalendarTemp from './calendar/indexTemp';
import styles from './index.module.less';
import moment from 'moment';
import { StateType } from '@/model/schedulCalendar';

interface IProps {
    userType: number; //用户类型 0 组织  1 企业
    enterpriseId: string; //企业Id
    dispatch: (action: { type: string; payload: Partial<StateType> }) => void;
    location: any; // location对象
}
interface IParams {
    enterpriseId: string;
    sectionId: string;
    workId: string;
}

const schedulCalendar = (props: IProps) => {
    const treeRef: any = useRef(null);
    const [treeVisible, setTreeVisible] = useState(true);
    const { enterpriseId } = props;
    const [sectionId, setSectionId] = useState('');
    const [name, setName] = useState('');
    const [workId, setWorkId] = useState('');
    const [key, setKey] = useState('');
    const [monitorId, setMonitorId] = useState('');
    const [type, setType] = useState('work');
    const [workData, setWorkData] = useState([]);
    const [id, setId] = useState('');
    const [timeStr, setTimeStr] = useState(moment().format('YYYY-MM'));
    const [dataSource, setDataSource] = useState([]);
    const [canTemp, setCanTemp] = useState(false);
    const [ treeNodeType, setTreeNodeType] = useState<string>(''); // 点击树节点的类型
    const [params, setParams] = useState<IParams>({
        enterpriseId: enterpriseId,
        sectionId: '',
        workId: '',
    });
    const reload = () => {
        if (type == 'work' && workId && sectionId) {
            // 作业对象
            getWorkMonthData({
                timeStr: timeStr,
                workId: workId,
                sectionId: sectionId,
            }).then((value: any) => {
                // console.log(value);
                setDataSource(value.monthData);
                setWorkData(value.workData);
            });
        } else {
            // 监控对象
            getMonitorMonthData({
                timeStr: timeStr,
                monitorId: id,
                sectionId: sectionId,
            }).then((value: any) => {
                setDataSource(value.monthData);
                setWorkData(value.workData);
            });
        }
    };
    useEffect(() => {
        if (!timeStr || !id) return;
        if (type == 'work' && workId) {
            //检测能否设置临班
            checkWork(workId).then((value: boolean) => {
                console.log(value);
                props.dispatch({
                    type: 'schedulCalendar/setBaseData',
                    payload: {
                        canTemp: value,
                    },
                });
            });
            // 作业对象
            getWorkMonthData({
                timeStr: timeStr,
                workId: workId,
                sectionId: sectionId,
            }).then((value: any) => {
                // console.log(value);
                setDataSource(value.monthData);
                setWorkData(value.workData);
            });
        } else if (type == 'monitor') {
            // 监控对象
            getMonitorMonthData({
                timeStr: timeStr,
                monitorId: id,
                sectionId: sectionId,
            }).then((value: any) => {
                setDataSource(value.monthData);
                setWorkData(value.workData);
            });
        }
    }, [id, timeStr]);

    //解析url查询字符串为对象格式
    function getQueryStringArgs(searchString: string) {
        //取得查询字符串并去掉开头的问号
        let qs = searchString.length > 0 ? searchString.substring(1) : '',
            //保存数据的对象
            args: any = {},
            //取得每一项
            items = qs.length ? qs.split('&') : [],
            item = null,
            name = null,
            value = null,
            //在 for 循环中使用
            i = 0,
            len = items.length;
        //逐个将每一项添加到 args 对象中
        for (i = 0; i < len; i++) {
            item = items[i].split('=');
            name = decodeURIComponent(item[0]);
            value = decodeURIComponent(item[1]);
            if (name.length) {
                args[name] = value;
            }
        }
        return args;
    }
    const getFirstMoniter = (value: any) => {
        console.log('value', value);
        const searchObj = getQueryStringArgs(props.location.search);
        if (Object.keys(searchObj).length > 0) {
            setSectionId(searchObj.sectionId);
            setWorkId(searchObj.workId);
            setMonitorId(searchObj.monitorId);
            setType('monitor');
            setName(searchObj.name);
            setId(searchObj.monitorId);
            setParams({
                ...params,
                sectionId: searchObj.sectionId,
                workId: searchObj.workId,
            });
            const paramObj = {
                sectionId: searchObj.sectionId,
                workId: searchObj.workId,
            };
            treeMonitors(paramObj).then((res: any[]) => {
                res = res || [];
                res.forEach((e) => (e.isLeaf = true));
                if (treeRef) {
                    treeRef.current.outerAddData(res, searchObj.key);
                }
            });
            if (treeRef) {
                setTimeout(() => {
                    if (searchObj.workId == '-200') {
                        treeRef.current.setSelectedKeys(`${searchObj.monitorId}_${searchObj.sectionId}_${searchObj.workId}`);
                    } else {
                        treeRef.current.setSelectedKeys(`${searchObj.monitorId}_${searchObj.workId}`);
                    }
                }, 500);
            }
            props.dispatch({
                type: 'schedulCalendar/setBaseData',
                payload: {
                    workId: searchObj.workId,
                    monitorId: searchObj.monitorId,
                    sectionId: searchObj.sectionId,
                    type: 'monitor',
                    // enterpriseId: value.pId,
                },
            });
        } else {
            setSectionId(value.sectionId);
            setWorkId(value.workId);
            setMonitorId(value.id);
            setName(value.name);
            setKey(value.key);
            setType(value.type);
            setId(value.id);
            props.dispatch({
                type: 'schedulCalendar/setBaseData',
                payload: {
                    workId: value.workId,
                    monitorId: value.id,
                    sectionId: value.sectionId,
                    type: value.type,
                    enterpriseId: value.pId,
                },
            });
            treeRef.current.setSelectedKeys(`${value.key}`);
            setParams({
                enterpriseId,
                ...value,
            });
        }
    };

    return (
        <div className={styles.box}>
            <div className={[styles['tree'], treeVisible ? styles.show : styles.hide].join(' ')}>
                <LeftTree
                    ref={treeRef}
                    isShowselect={true}
                    treeNodeClick={(treeNode: any) => {
                        console.log(treeNode);
                        if(treeNode){
                          setTreeNodeType(treeNode.type)
                        }
                        if ((treeNode && treeNode.type == 'work') || treeNode.type == 'monitor') {
                            setParams({
                                ...params,
                                sectionId: treeNode.sectionId,
                                workId: treeNode.workId,
                            });
                            setSectionId(treeNode.sectionId);
                            setWorkId(treeNode.workId);
                            setMonitorId(treeNode.id);
                            setName(treeNode.name);
                            setType(treeNode.type);
                            setKey(treeNode.key);
                            setId(treeNode.id);
                            props.dispatch({
                                type: 'schedulCalendar/setBaseData',
                                payload: {
                                    workId: treeNode.workId,
                                    monitorId: treeNode.id,
                                    sectionId: treeNode.sectionId,
                                    type: treeNode.type,
                                    enterpriseId: treeNode.pId,
                                },
                            });
                        }
                    }}
                    getFirstMoniter={getFirstMoniter}
                />
                <LeftOutlined className={styles['arrow']} onClick={() => setTreeVisible(!treeVisible)} />
            </div>
            <div className={styles.calendar}>
                <div className={styles.head}>
                    <div className={styles.p1}>
                        <FolderOutlined style={{ marginRight: '5px' }} />

                        {type == 'work' ? <p className={styles.pass}>{name}(临班)</p> : <p className={styles.nopass}>{name}</p>}
                    </div>
                    <p className={styles.p1}>
                        {type == 'work' ? (
                            <Button 
                              type="link" 
                              href={`/view/workManagement/workSchedul?workId=${workId}&sectionId=${sectionId}&key=${key}`} 
                              disabled={treeNodeType == "section" || treeNodeType=='organization'}
                            >
                              <span style={(treeNodeType == "section" || treeNodeType=='organization') ? {color:'#c7c7c7'} : {}}>查看正班</span>
                            </Button>
                        ) : (
                            <>
                                作业对象：
                                {workData?.map((item: any, index: number) => (
                                    <Button
                                        key={index}
                                        type="link"
                                        href={`/view/workManagement/workSchedul?workId=${item.id}&sectionId=${item.sectionId}&key=${item.id}_${item.sectionId}`}
                                    >
                                        {item.workName}
                                    </Button>
                                ))}
                            </>
                        )}
                    </p>
                </div>
                <div className={styles.wrap}>
                    {type == 'work' ? (
                        <CalendarTemp
                            setTimeStr={(value: string) => setTimeStr(value)}
                            dataSource={dataSource}
                            enterpriseId={props.enterpriseId}
                            sectionId={sectionId}
                            workId={workId}
                            name={name}
                            reload={reload}
                        />
                    ) : (
                        <Calendar
                            setTimeStr={(value: string) => setTimeStr(value)}
                            dataSource={dataSource}
                            workData={workData}
                            enterpriseId={props.enterpriseId}
                            sectionId={sectionId}
                            workId={workId}
                            name={name}
                            monitorId={monitorId}
                            reload={reload}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default withRouter(
    connect((state: AllState) => ({
        userType: state.root.userMessage.userType,
        enterpriseId: state.root.userMessage.organizationId,
    }))(schedulCalendar)
);

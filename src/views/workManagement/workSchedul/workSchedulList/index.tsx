import React, { useState, useRef } from 'react';
import LeftTree from './leftTree';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { withRouter } from 'react-router';
import { LeftOutlined } from '@ant-design/icons';
import styles from './index.module.less';
import SchedulTable from './schedulTable';
interface IProps {
    userType: number; //用户类型 0 组织  1 企业
    enterpriseId: string; //企业Id
    location: any; // location对象
}
interface IParams {
    // enterpriseId: string;
    sectionId: string;
    workId: string;
}

const WorkSchedulList = (props: IProps) => {
    const treeRef: any = useRef(null);
    const { enterpriseId } = props;
    const [treeVisible, setTreeVisible] = useState(true);
    const [sectionId, setSectionId] = useState('');
    const [workId, setWorkId] = useState('');
    const [type, setType] = useState('');
    const [params, setParams] = useState<IParams>({
        // enterpriseId: enterpriseId,
        sectionId: '',
        workId: '',
    });
    //解析url查询字符串为对象格式
    function getQueryStringArgs(searchString: string) {
        //取得查询字符串并去掉开头的问号
        var qs = searchString.length > 0 ? searchString.substring(1) : '',
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
        const searchObj = getQueryStringArgs(props.location.search);
        if (Object.keys(searchObj).length > 0) {
            setSectionId(searchObj.sectionId);
            setWorkId(searchObj.workId);
            setParams({
                sectionId: searchObj.sectionId,
                workId: searchObj.workId,
            });
            if (treeRef) {
                treeRef.current.setSelectedKeys(searchObj.key);
            }
        } else {
            setSectionId(value.sectionId);
            setWorkId(value.workId);
            setParams({
                sectionId: value.sectionId,
                workId: value.workId,
            });
        }
        setType(value.type);
    };
    return (
        <div className={styles.box} id={'strangeBug'}>
            <div className={[styles['tree'], treeVisible ? styles.show : styles.hide].join(' ')}>
                <LeftTree
                    ref={treeRef}
                    isShowselect={false}
                    treeNodeClick={(treeNode: any) => {
                        if (!treeNode) return;
                        console.log(treeNode);

                        if (treeNode.type == 'work') {
                            // console.log(treeNode);
                            setParams({
                                ...params,
                                sectionId: treeNode.sectionId,
                                workId: treeNode.workId,
                            });
                            setSectionId(treeNode.sectionId);
                            treeNode.workId && setWorkId(treeNode.workId);
                            setType(treeNode.type);
                        } else if (treeNode.type == 'section') {
                            setParams({
                                ...params,
                                sectionId: treeNode.id,
                                workId: '-200',
                            });
                            setSectionId(treeNode.id);
                            setWorkId('-200');
                            setType(treeNode.type);
                        }
                    }}
                    getFirstMoniter={getFirstMoniter}
                />
                <LeftOutlined className={styles['arrow']} onClick={() => setTreeVisible(!treeVisible)} />
            </div>
            <div className={styles.table}>
                <SchedulTable params={params} enterpriseId={props.enterpriseId} sectionId={sectionId} workId={workId} type={type} />
            </div>
        </div>
    );
};

export default withRouter(
    connect((state: AllState) => ({
        userType: state.root.userMessage.userType,
        enterpriseId: state.root.userMessage.organizationId,
    }))(WorkSchedulList)
);

import React from 'react';
import FourthMenuContainer from '@/common/fourthMenuContainer';
import { Tabs } from 'antd';
const { TabPane } = Tabs;
import styles from './index.module.less';
import { hasPagePermmision } from '@/framework/router';
import WorkSchedulList from './workSchedulList';

const WorkSchedul = () => {
    return (
        // <FourthMenuContainer contentFullHeight>
        /**
         * 解决样式bug  出现模态框框时，页面会整体往上移动
         */
        <div className={styles.box}>
            <Tabs>
                {hasPagePermmision('4_scheduling_list') && (
                    <TabPane tab="排班列表" key="schedulingList">
                        <WorkSchedulList />
                    </TabPane>
                )}
            </Tabs>
        </div>

        // {/* </FourthMenuContainer> */}
    );
};

export default WorkSchedul;

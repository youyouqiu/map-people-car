import React from 'react';
import orgIcon from '@/static/image/orgIcon.svg';
import openOrgIcon from '@/static/image/openOrgIcon.svg';
import group from '@/static/image/group.svg';
import workArea from '@/static/image/workArea.svg';
import clearanceArea from '@/static/image/clearanceArea.svg';
import maneuveringGroup from '@/static/image/maneuveringGroup.svg';
import unscheduled from '@/static/image/unscheduled.svg';
import workRoute from '@/static/image/workRoute.svg';

const styles: React.CSSProperties = { width: '14px', height: '14px', position: 'relative', top: '-2px' };

interface IProps {
    type: number | string; //-1 打开的组织   1 未打开的文件  2 组  3 作业线路 4 作业区域  5 清运区域 6 未排班  7 机动组
}
const Icons = (props: IProps) => {
    const { type } = props;
    switch (type) {
        case -1:
            return <img src={openOrgIcon} alt="" style={styles} />;
        case 1:
            return <img src={orgIcon} alt="" style={styles} />;
        case 'section':
            return <img src={group} alt="" style={styles} />;
        case 3:
            return <img src={workRoute} alt="" style={styles} />;
        case 4:
            return <img src={workArea} alt="" style={styles} />;
        case 5:
            return <img src={clearanceArea} alt="" style={styles} />;
        case 6:
            return <img src={unscheduled} alt="" style={styles} />;
        case 7:
            return <img src={maneuveringGroup} alt="" style={styles} />;
        default:
            return <img src={orgIcon} alt="" style={styles} />;
    }
};
export default Icons;

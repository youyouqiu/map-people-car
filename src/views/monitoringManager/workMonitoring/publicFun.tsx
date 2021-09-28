import React from "react";
import noImg from '@/static/image/noImg.png';
import clearanceArea from '@/static/image/clearanceArea.svg';// 清运区域
import maneuveringGroup from '@/static/image/maneuveringGroup.svg';// 机动组
import unscheduled from '@/static/image/unscheduled.svg';// 未排班
import workArea from '@/static/image/workArea.svg';// 作业区域
import workRoute from '@/static/image/workRoute.svg';// 作业线路
import styles from './index.module.less';

/**
 * 默认图片
 */
export { noImg };

/**
* 获取区域中心点
*/
export const getCenterPoint = (path: any) => {
  let x = 0.0;
  let y = 0.0;
  console.log('path', path);
  for (let i = 0; i < path.length; i++) {
    x = x + parseFloat(path[i][0]);
    y = y + parseFloat(path[i][1]);
  }
  x = x / path.length;
  y = y / path.length;
  return [x, y];
}

/**
  * 获取监控对象作业状态
  * @param status 
  */
export const getWorkStatus = (status: number) => {
  switch (status) {
    case 0:
      return <span className={styles.green}>有效工作</span>;
    case 1:
      return <span className={styles.yellow}>非有效作业</span>;
    case 2:
      return <span className={styles.red}>非工作</span>;
    case 3:
      return <span className={styles.red}>静止</span>;
    case 4:
      return <span className={styles.green}>行走</span>;
    // case 5:
    //   return <span className={styles.red}>离线</span>;
    // case 6:
    //   return <span className={styles.yellow}>未定位</span>;
    // case 7:
    //   return <span className={styles.green}>在线</span>;
    default:
      return <span>--</span>;
  }
}

/**
  * 获取作业状态
  * @param status 
  */
export const getOnWorkStatus = (status: number) => {
  switch (status) {
    case 0:
      return <span className={styles.red}>脱岗</span>;
    case 1:
      return <span className={styles.green}>在岗</span>;
    default:
      return <span>--</span>;
    // default:
    //   return <span className={styles.red}>休息</span>;
  }
}


/**
  * 获取监控对象在离线状态
  * @param status 
  */
export const getMonitorStatus = (status?: number) => {
  switch (status) {
    case 1:// 在线
      return `<span class='${styles.greenCircle}'></span>`;
    case 2:// 未定位
      return `<span class='${styles.yellowCircle}'></span>`;
    case 3:// 离线
      return `<span class='${styles.grayCircle}'></span>`;
    default:
      return `<span class='${styles.grayCircle}'></span>`;
  }
}


/**
 * 获取作业对象图标
 * @param type 
 */
export const getWorkIcon = (type: number) => {
  switch (type) {
    case 0:// 机动组
      return <img src={maneuveringGroup} className={styles.maxIcon} />;
    case 1:// 作业道路
      return <img src={workRoute} className={styles.treeIcon} />;
    case 2:// 作业区域
      return <img src={workArea} className={styles.treeIcon} />;
    case 3:// 清运区域
      return <img src={clearanceArea} className={styles.treeIcon} />;
    case 4:// 未排班
      return <img src={unscheduled} className={styles.treeIcon} />;
    default:
      return '';
  }
}

/**
 * 获取考勤状态
 */
export const getAttendanceStatus = (status: number) => {
  switch (status) {
    case 1:
      return '调休';
    case 2:
      return '请假';
    case 3:
      return '未签到';
    case 4:
      return '晚到';
    case 5:
      return '正常签到';
    case 6:
      return '早退';
    case 7:
      return '正常签退';
    case 8:
      return '缺勤';
    default:
      return '--';
  }
}
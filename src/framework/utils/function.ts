/* eslint-disable @typescript-eslint/no-use-before-define */
import moment from 'moment';
import { getStore } from './localStorage';
import { message } from 'antd';
import { getIcon } from './tree'
import { monitorOnline } from '@/server/monitorManager';

// 日期全局变量
const date = new Date();
const curWeekDay = date.getDay();// 星期
const year = date.getFullYear();// 年
const month = date.getMonth();// 月
const curDay = date.getDate();// 日

export function getAfterToday(num = 2) {
  const date = new Date();
  const newYear = date.getFullYear() + num;
  let newMonth: string | number = date.getMonth() + 1;
  let newDay: string | number = date.getDate();

  newMonth = newMonth > 10 ? newMonth : `0${newMonth}`;
  newDay = newDay > 10 ? newDay : `0${newDay}`;

  return `${newYear}-${newMonth}-${newDay}`;
}

/**
 * 获取查询天数日期(前1天，前3天，前7天)
 * @param {*} start:当前日期
 * @param {*} day: 查询天数
 */
export function searchDay(startDate: string, day: number) {
  const start = startDate.replace(/-/g, '/');
  const milliseconds = Date.parse(start) + day * 24 * 3600 * 1000;
  date.setTime(milliseconds);

  return moment(date).format('YYYY-MM-DD');
}

/**
 * 获取当前时间
 */
export function getToday() {
  return moment(new Date()).format('YYYY-MM-DD');
}

/**
 * 获取当前时间
 */
export function getNowDate(format?: string) {
  return moment(new Date()).format(format ? format : 'YYYY-MM-DD HH:mm:ss');
}

/**
 * 获取本周开始日期和结束日期
 * 返回:
 * weekStart: 本周开始日期
 * weekEnd: 本周结束日期
 */
export function getCurWeek() {
  const weekStart = new Date(year, month, curDay - curWeekDay);
  const weekEnd = new Date(year, month, curDay + (6 - curWeekDay));
  const start = moment(weekStart).format('YYYY-MM-DD');
  const end = moment(weekEnd).format('YYYY-MM-DD');

  return {
    start,
    end,
  };
}

/**
 * 获取本月开始日期和结束日期
 */
export function getCurMonth() {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const start = moment(monthStart).format('YYYY-MM-DD');
  const end = moment(monthEnd).format('YYYY-MM-DD');

  return {
    start,
    end,
  };
}

/**
 * 获取上月的开始日期和结束日期
 */
export function getLastMonth() {
  const lastMonthStart = new Date(year, month - 1, 1);
  const lastMonthEnd = new Date(year, month, 0);
  const lastStart = moment(lastMonthStart).format('YYYY-MM-DD');
  const lastEnd = moment(lastMonthEnd).format('YYYY-MM-DD');

  return {
    lastStart,
    lastEnd,
  };
}

/**
 * 如果符合条件返回对应样式，否则返回空字符串
 * @param condition 判断条件
 * @param className 条件通过后返回的class name
 */
export function classNvl(condition: boolean, className: string): string {
  if (condition) {
    return ' ' + className;
  } else {
    return '';
  }
}

/**
 * 空字段填充
 * @param value : 字段值
 * @param str : 填充字符，默认'--'
 */
export function showEmpty(value: any, str = '--') {
  if (
    value == ''
    || value == null
    || value == undefined
  ) {
    return str;
  }

  return value;
}

/**
 * 数组转树
 * @param data : 原始数据
 */

export function arrayToTree<T>(data: T[], showIcon?: boolean): T[] {
  // 重新遍历 生成组件需要的数据格式
  const deepArr = JSON.parse(JSON.stringify(data)).map((item: any) => {
    const obj = {
      isLeaf: false,
      key: item.value,
      ...item
    }
    if (showIcon) {
      obj.icon = getIcon
    }
    return obj
  })

  const temp: any = {}

  // 以id为键，当前对象为值，存入一个新的对象中
  for (const item of deepArr) {
    temp[item.id] = item
  }

  return deepArr.filter((father: any) => {
    // 把当前节点的所有子节点找到
    const childArr: Array<object> = deepArr.filter((child: any) => father.id === child.pId)

    if (childArr.length) {
      father.children = childArr
    }
    // 只返回第一级数据；如果当前节点的pId不为空，但是在父节点不存在，也为一级数据
    return father.pId === null || !temp[father.pId]
  })
}

/**
  * 下载文件方法
  * @param url 请求地址
  * @param method 请求方式
  * @param filename 下载后显示的文件名
  * @param param 请求参数
  * @param callBack 文件下载完成回调方法
  */
export function downloadFile(url: string, method: string, filename: string, param?: Record<string, any>, callBack?: Function, downType?: boolean) {
  const xhr = new XMLHttpRequest();
  xhr.open(method, url);  //url填写后台的接口地址
  xhr.setRequestHeader('Authorization', `Bearer ${getStore('token')}`);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.responseType = 'blob';
  xhr.onload = function () {
    if (this.status == 200) {
      if (!downType) { // 默认即时下载，downType=true使用离线下载组件
        const blob = this.response;
        if ((window.navigator as any).msSaveOrOpenBlob) {
          navigator.msSaveBlob(blob, filename);
        } else {
          const a = document.createElement('a');
          let downLoadUrl = '';
          if (window.URL) {
            downLoadUrl = window.URL.createObjectURL(blob)
          } else {
            downLoadUrl = window.webkitURL.createObjectURL(blob);
          }
          a.href = downLoadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(downLoadUrl);
        }
      }
    } else {
      // 原生ajax获取后端接口报错信息
      this.response.text().then((data: any) => {
        const messageText = JSON.parse(data).msg || '接口请求异常';
        message.error(messageText);
      }).catch((error: any) => {
        console.log(error, 'error');
        message.error(error);
      });
    }
    if (callBack) {
      callBack();
    }
  };
  if (param) {
    xhr.send(JSON.stringify(param));
  } else {
    xhr.send();
  }
}

/**
 * 获取当前用户权限(控制页面按钮是否可操作)
 * @param pageCode 页面路由code
 */
export function getCurrentUserPermission(pageCode?: string) {
  const permissionStore = getStore('authPermissionList');
  if (!permissionStore) return [];
  const authPermissionList = JSON.parse(permissionStore);
  if (!pageCode) return authPermissionList;

  const permissionList = authPermissionList[pageCode] || [];
  return permissionList;
}

/**
 * 验证点击的是否跟用户当前登录用户一致
 * 或者 登录用户为admin用户
 * @param updateUser 点击对象的用户
 */
export function getCurrentUserEqual(updateUser: string) {
  const userName = (getStore("userName") as string).toLowerCase();
  if (!updateUser) return false;
  updateUser = updateUser.toLowerCase();
  return userName == updateUser || userName == "admin";
}

/**
     * 问候语
     */
export const greeting = () => {
  const now = new Date(),
    hour = now.getHours();
  let txt = '早安';

  if (hour > 12 && hour < 14) {
    txt = '中午好'
  } else if (hour >= 14 && hour < 18) {
    txt = '下午好'
  } else if (hour >= 18 && hour < 6) {
    txt = '晚上好'
  }

  return txt;
}

export function stampToDate(str: string | number) {
  str = typeof str == 'string' ? Number(str) : str;
  const date = new Date(str);
  const Y = date.getFullYear();
  const M = date.getMonth() + 1;
  const D = date.getDate();
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();

  return `${Y}-${getzf(M)}-${getzf(D)} ${getzf(h)}:${getzf(m)}:${getzf(s)}`;
}

//补0操作
function getzf(num: string | number) {
  if (typeof num == 'string') { num = Number(num); }
  if (num < 10) {
    return `0${num}`;
  }
  return num;
}
/**
     * 高德地图逆地址解码Promise 封装
     */
export async function getAddress(lnglat: AMap.LocationValue): Promise<string> {
  const geocoder = new AMap.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.getAddress(lnglat, (status, result) => {
      if (status === 'complete' && typeof result !== 'string') {
        resolve(result.regeocode.formattedAddress);
      }
      else {
        reject('根据经纬度查询地址失败');
      }
    });
  });
}

export function getSelectContainer(container: string): HTMLElement {
  return document.getElementById(container) || document.body
}


// 设置第一个错误提示是否显示在下方, 默认错误提示的高度 errTipH=32 className=样式名
export function setFirstErrIsBottom(formId: string, className: string, errTipH?: number) {
  setTimeout(() => {
    const firstEl: any = document.getElementById(formId);
    errTipH = errTipH || 32;
    if (firstEl) {
      const currentTopH = firstEl.getBoundingClientRect().top;
      const parentTopH = didTopToParentHeigth(firstEl);
      // 如果表单元素到顶部的距离小于错误提示的高度
      if (errTipH > Math.abs(currentTopH - parentTopH)) {
        // console.log('formItem-bottom-explain')
        firstEl.classList.add(className);
      }
    }
  }, 300);
  // 递归查找元素顶部到父元素为overflow=超出隐藏样式，的间距
  function didTopToParentHeigth(currentEl: any): number {
    const parentNode: any = currentEl.parentNode;
    const parentNodeStyle = getComputedStyle(parentNode);
    const { overflow, overflowY } = parentNodeStyle;
    // 优先检查overflowY
    if (overflowY === 'visible') {
      return didTopToParentHeigth(parentNode);
    } else {
      if (!overflowY) {
        if (!overflow || overflow === 'visible') {
          return didTopToParentHeigth(parentNode);

        } else {
          // 返回元素与表单元素的顶部间距
          const parentRect = parentNode.getBoundingClientRect();
          return parentRect.top
        }
        // 返回元素与表单元素的顶部间距
      } else {
        // 返回元素与表单元素的顶部间距
        const parentRect = parentNode.getBoundingClientRect();
        // console.log(parentRect)
        return parentRect.top
      }

    }
  }
}

export function getStatus(data: number) {
  let status = '';
  switch (data) {
    case 0:
      status = '下发成功,参数已生效';
      break;
    case 1:
      status = '下发失败,终端离线';
      break;
    case 2:
      status = '下发失败,指令错误';
      break;
    case 3:
      status = '下发失败,平台等待应答超时';
      break;
    case 4:
      status = '下发失败,底层系统异常';
      break;
    case 5:
      status = '下发失败,终端处理失败';
      break;
    case 6:
      status = '下发失败,终端应答消息有误';
      break;
    case 7:
      status = '下发失败,终端应答指令不支持';
      break;
    case 8:
      status = '下发中,终端已接收指令';
      break;
    case 9:
      status = '下发中,平台等待应答';
      break;
  }

  return status;
}

/**
 * 获取 blob
 * url 目标文件地址
 */
function getBlob(url: string) {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response);
      }
    };
    xhr.send();
  });
}

/**
* 保存 blob
* filename 想要保存的文件名称
*/
function saveAs(blob: any, filename: string) {
  const a: any = window;
  if (a.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    const body = document.querySelector('body');

    link.href = window.URL.createObjectURL(blob);
    link.download = filename;

    // fix Firefox
    link.style.display = 'none';
    body?.appendChild(link);

    link.click();
    body?.removeChild(link);

    window.URL.revokeObjectURL(link.href);
  }
}

/**
* 下载
* @param  {String} url 目标文件地址
* @param  {String} filename 想要保存的文件名称
*/
export function download(url: string, filename: string): any {
  getBlob(url).then(blob => {
    saveAs(blob, filename);
  });
}

/**
 * 获取监控对象在线状态
 * @param monitorId
 */
export const monitorIsOnline = async (monitorId: any) => {
  const online = await monitorOnline(monitorId);
  return online;
}
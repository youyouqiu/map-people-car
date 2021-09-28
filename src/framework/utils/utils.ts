/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable prefer-rest-params */

import moment from "moment";

/**
 * 格式化请求参数 去掉undefined值
 */
export const debounce = (fn: Function, delay: number) => {
  let timer: number | undefined;
  return function () {
    const context = this;
    const args = arguments;
    if (timer) {
      clearTimeout(timer);
    }
    timer = window.setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
};

/**
 * 获取当前时间
 */
export const getNowTime = () => {
  const nowTime = moment(new Date()).format('YYYYMMDDhhmmss');
  return nowTime;
};

/**
 * 防抖函数 func：需要执行的方法；wait：多少秒内只执行一次，默认10000；args：需要传的参数
 * eg： antiShakeFun(func,wait)(args)
 */
export const antiShakeFun = (() => {
  let timeout: any;
  const defaultWait = 10000;
  return function (func: Function, wait = defaultWait) {
    return function () {
      const context = this;
      const args = arguments;
      if (timeout) clearTimeout(timeout);
      const callNow = !timeout;
      timeout = setTimeout(() => {
        timeout = null;
      }, wait);
      if (callNow) func.apply(context, args)
    }
  }
})();


/**
  * 生成一个10位的随机ID
  */
export const generateRandomId = (length = 10) => {
  const chars = 'abcdefghijklmnopqrskuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const len = chars.length;
  let str = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * len);
    str += chars[randomIndex];
  }
  return str;
}

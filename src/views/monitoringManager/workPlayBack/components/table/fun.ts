/**
  * 判断此对象是否是Object类型
  * @param {Object} obj  
  */
const isObject = (obj: any) => {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

/**
  * 判断此类型是否是Array类型
  * @param {Array} arr 
  */
const isArray = (arr: any) => {
  return Object.prototype.toString.call(arr) === '[object Array]';
};

/**
  *  深度比较两个对象是否相同
  * @param {Object} oldData 
  * @param {Object} newData 
  */
export const equalsObj = (oldData: any, newData: any) => {
  // 类型为基本类型时,如果相同,则返回true
  if (oldData === newData) return true;
  if (isObject(oldData) && isObject(newData) && Object.keys(oldData).length === Object.keys(newData).length) {
    // 类型为对象并且元素个数相同

    // 遍历所有对象中所有属性,判断元素是否相同
    for (const key in oldData) {
      if (oldData.hasOwnProperty(key)) {
        if (!equalsObj(oldData[key], newData[key]))
          // 对象中具有不相同属性 返回false
          return false;
      }
    }
  } else if (isArray(oldData) && isArray(oldData) && oldData.length === newData.length) {
    // 类型为数组并且数组长度相同

    for (let i = 0, length = oldData.length; i < length; i++) {
      if (!equalsObj(oldData[i], newData[i]))
        // 如果数组元素中具有不相同元素,返回false
        return false;
    }
  } else {
    // 其它类型,均返回false
    return false;
  }

  // 走到这里,说明数组或者对象中所有元素都相同,返回true
  return true;
};
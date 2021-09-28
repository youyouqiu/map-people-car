class MyEvent {
  clientList: Record<string, any>;

  constructor() {
    this.clientList = {};
  }

  /*
   * 事件监听
   */
  on = (eventName: string, callback: Function) => {
    if (this.clientList[eventName]) {
      this.clientList[eventName].push(callback);
      return;
    }
    this.clientList[eventName] = [callback];
  };

  /*
   * 事件触发
   */
  emit = (eventName: string, ...args: any[]) => {
    if (!this.clientList[eventName]) {
      return;
    }
    this.clientList[eventName].forEach((fn: Function) => {
      fn.apply(this, args);
    });
  };

  /*
   * 事件清除
   */
  remove = (eventName: string, callback: Function) => {
    if (!this.clientList[eventName]) {
      return;
    }
    this.clientList[eventName] = this.clientList[eventName].filter(
      (fn: Function) => {
        return fn !== callback;
      }
    );
  };

  /*
   * 事件清除所有
   */
  removeAll = (eventName: string) => {
    if (!this.clientList[eventName]) {
      return;
    }
    this.clientList[eventName] = undefined;
  };
}

/*
 * 单例产生一个事件实例
 */
function getSingleEvent() {
  let event: MyEvent;
  return function () {
    if (event) {
      return event;
    }
    event = new MyEvent();
    return event;
  };
}

export default getSingleEvent()();

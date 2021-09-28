const channel: { listener: Function[]; trigger: Function } = {
  listener: [],
  trigger: function (...args: any) {
    for (let i = 0; i < this.listener.length; i++) {
      const element = this.listener[i];
      element(...args);
    }
  }
}

export default channel;
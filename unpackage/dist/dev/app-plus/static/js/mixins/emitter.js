class EventEmitter {
  // 构造函数，初始化事件存储对象
  constructor() {
    this.events = {};
  }

  // 注册事件监听器
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  // 触发事件并传递参数
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(...args));
    }
  }

  // 移除指定事件的监听器
  off(event, listener) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
  }
}

// 导出EventEmitter类以供其他模块使用
module.exports = EventEmitter;

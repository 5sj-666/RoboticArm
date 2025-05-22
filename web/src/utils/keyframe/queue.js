// 队列对象实现
class Queue {
  constructor() {
    this.items = [];
  }

  // 入队
  enqueue(item) {
    this.items.push(item);
  }

  // 出队
  dequeue() {
    if (this.isEmpty()) {
      throw new Error("Queue is empty");
    }
    return this.items.shift();
  }

  // 查看队首元素
  peek() {
    if (this.isEmpty()) {
      throw new Error("Queue is empty");
    }
    return this.items[0];
  }

  // 检查队列是否为空
  isEmpty() {
    return this.items.length === 0;
  }

  // 获取队列长度
  size() {
    return this.items.length;
  }

  // 清空队列
  clear() {
    this.items = [];
  }
}

export default Queue;



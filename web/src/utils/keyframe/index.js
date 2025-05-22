// 关键帧系统  首先要有个队列，用来存储关键帧信息，然后有个定时器（requestAnimationFrame），每隔一段时间去执行队列中的关键帧

// import { requestAnimationFrame } from './requestAnimationFrame'
import Queue from './queue';

/**
  传入是数据对象:
  {
    time: 0, // 时间
    motorId: number,
    location: number, // 位置
    speed: number, // 速度
  }
 */
const queue = Queue();

const arr = [
  {
    time: 0, // 时间
    data: {
      motorId: 22,
      location: 0, // 位置
      // speed: 5, // 速度
    }
  },
  {
    time: 1000, // 时间
    data: {
      motorId: 22,
      location: 180, // 位置
      // speed: 5, // 速度
    }
  },
  {
    time: 2000, // 时间
    data: {
      motorId: 22,
      location: -180, // 位置
      // speed: 10, // 速度
    }
  }
]

/*
  时间系统：指令队列
  具体执行的指令和时间。animationFrame 会根据时间执行指令
  {
    time: 0, // 时间
    cmd: Array(12<hex>) // 指令
  }

*/
const cmdQueue = Queue();

let startTime = null;

function animate(timestamp) {
  if (!startTime) startTime = timestamp;
  const elapsed = timestamp - startTime;

  // // 执行队列中的关键帧
  // while (queue.length > 0 && queue[0].time <= elapsed) {
  //   const keyframe = queue.shift();
  //   keyframe.action();
  // }

  // // 如果队列还有关键帧，继续动画
  // if (queue.length > 0) {
  //   requestAnimationFrame(animate);
  // } else {
  //   startTime = null; // 重置时间计数
  // }
}

// 启动关键帧动画
function startAnimation() {
  if (queue.length > 0) {
    requestAnimationFrame(animate);
  }
}

export { startAnimation };
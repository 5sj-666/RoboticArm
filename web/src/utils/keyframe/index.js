
import { Loc_Director } from '@/utils/CyberGear.js';

// import { armModel } from '@/stores/armModel.js'

// const armStore = armModel();

/**
 * @description 计算关键帧具体信息
 * @param {Array} rawArr 原始关键帧数组
 * @param {boolean} bezierAble 是否支持贝塞尔曲线
 * @returns { Array<{time: number, action: function}>} 返回一个包含关键帧信息的数组
 */
function computedKeyframeDetails(rawArr,
  armStore,
  bezierAble = false
) {
  if (!Array.isArray(rawArr) || rawArr.length === 0) return [];
  let keyframes = [];
  // debugger;
  rawArr.forEach(item => {
    let { motorId, location: loc_ref, speed: limit_spd } = item;
    keyframes.push({
      time: item.time,
      action: () => {
        let cmds = Loc_Director({ motorId, limit_spd, loc_ref });
        // armStore
        // console.log('cmds: ', cmds);
        // console.log('armStore.map: ', armStore.map);
      }
    });
  });
  // keyframes;
  // debugger;

  // // 计算关键帧的详细信息
  // // 这里可以根据具体需求实现
  // // 返回一个包含关键帧信息的数组
  // return [
  //   { time: 0, action: () => console.log('Start Animation') },
  //   { time: 1000, action: () => console.log('Mid Animation') },
  //   { time: 2000, action: () => console.log('End Animation') }
  // ];
}


/**
 * 执行动画：依次执行关键帧队列中的动作
 * @param {Array} keyframes 关键帧数组，每个元素包含 time(毫秒) 和 action(函数)
 */
function runKeyframeAnimation(keyframes) {


  if (!Array.isArray(keyframes) || keyframes.length === 0) return;

  // 按时间排序
  keyframes = keyframes.slice().sort((a, b) => a.time - b.time);

  let start = null;
  let idx = 0;

  function step(ts) {
    if (start === null) start = ts;
    const elapsed = ts - start;

    // 执行所有到达时间点的关键帧
    while (idx < keyframes.length && elapsed >= keyframes[idx].time) {
      if (typeof keyframes[idx].action === 'function') {
        keyframes[idx].action();
      }
      idx++;
    }

    if (idx < keyframes.length) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// 示例用法
// runKeyframeAnimation([
//   { time: 0, action: () => console.log('0ms') },
//   { time: 1000, action: () => console.log('1000ms') },
//   { time: 2000, action: () => console.log('2000ms') },
// ]);

export {
  computedKeyframeDetails,
  runKeyframeAnimation
};




// // 关键帧系统  首先要有个队列，用来存储关键帧信息，然后有个定时器（requestAnimationFrame），每隔一段时间去执行队列中的关键帧

// // import { requestAnimationFrame } from './requestAnimationFrame'
// import Queue from './queue';

// /**
//   传入是数据对象:
//   {
//     time: 0, // 时间
//     motorId: number,
//     location: number, // 位置
//     speed: number, // 速度
//   }
//  */
// const queue = Queue();

// const arr = [
//   {
//     time: 0, // 时间
//     data: {
//       motorId: 22,
//       location: 0, // 位置
//       // speed: 5, // 速度
//     }
//   },
//   {
//     time: 1000, // 时间
//     data: {
//       motorId: 22,
//       location: 180, // 位置
//       // speed: 5, // 速度
//     }
//   },
//   {
//     time: 2000, // 时间
//     data: {
//       motorId: 22,
//       location: -180, // 位置
//       // speed: 10, // 速度
//     }
//   }
// ]

// /*
//   时间系统：指令队列
//   具体执行的指令和时间。animationFrame 会根据时间执行指令
//   {
//     time: 0, // 时间
//     cmd: Array(12<hex>) // 指令
//   }

// */
// const cmdQueue = Queue();

// let startTime = null;

// function animate(timestamp) {
//   if (!startTime) startTime = timestamp;
//   const elapsed = timestamp - startTime;

//   // // 执行队列中的关键帧
//   // while (queue.length > 0 && queue[0].time <= elapsed) {
//   //   const keyframe = queue.shift();
//   //   keyframe.action();
//   // }

//   // // 如果队列还有关键帧，继续动画
//   // if (queue.length > 0) {
//   //   requestAnimationFrame(animate);
//   // } else {
//   //   startTime = null; // 重置时间计数
//   // }
// }

// // 启动关键帧动画
// function startAnimation() {
//   if (queue.length > 0) {
//     requestAnimationFrame(animate);
//   }
// }

// export { startAnimation };
/*
  时间 位置 速度，三个只需要两个就行了。
  那么此时关键帧就需要认真考虑： 
  1. 参考css的使用来说： 只需要位置和时间。  电机静止时，可能需要写两个同样的关键帧，但时间不同
  2. 但电机需要速度和位置，所以速度需要我们计算。

*/


import { Loc_Director } from '@/utils/CyberGear.js';
import { parse } from 'vue/compiler-sfc';


// import { useArmModelStore } from '@/stores/armModel.js'

// const armModelStore = armModel();


/**
 * @description 获取动画所有指令，按时间排序。
 *  动画方面使用timing function控制，linear的话不用插帧，其他的需要插帧。
 * @param {Array} rawArr 原始关键帧数组
    Array<{
          time: 0,
          motorId: 21,
          location: 180,
          // speed: 2, // 速度应该是被计算出来的
          timingFunction: ''  // 规定动画的速度曲线
        }>
    对数据格式做下说明: 数组里的item，表明在time这个时刻，id为motorId的电机，需要位移到location这个位置，移动过程中的速度（可变速度）通过timing function来控制
 * @returns { Array<{time: number, action: function}>} 返回一个包含关键帧信息的数组
 */
function getAnimationCmds(keyframes, armModelStore, bleStore, mainStore) {
  // 所有的frames(帧信息)数组
  let allFrames = [];

  for(let i = 0; i < keyframes.length - 1; i++) {
    let curFrame = keyframes[i];
    let nextFrame = keyframes[i + 1];

    let splitCount = 2; // 默认插帧数量为2
    if(mainStore && mainStore.enableBezier) {
      splitCount = 60;
    }
    let insetKeyframes = insertFrame(curFrame, nextFrame, splitCount);

    // allFrames.push(insetKeyframes);

    // console.log("--insetKeyframes: ", insetKeyframes);
    allFrames.push(...insetKeyframes);
    
    // insetKeyframes;
    // debugger;
  }
  console.log("--allFrames: ", allFrames);



  // debugger;
  // if (!Array.isArray(keyframes) || keyframes.length === 0) return [];

  let cmdsWithTime = [];
  // // debugger;
  allFrames.forEach(item => {
    let { motorId, location: loc_ref, speed: limit_spd } = item;
    console.log("--getAnimationCmds motorId: ",motorId, "-loc_ref: ", loc_ref, "-limit_spd:", limit_spd);
    let cmd =  Loc_Director({ motorId, limit_spd, loc_ref });
    cmdsWithTime.push({
      time: item.time,
      // motorId,
      cmd
    });

    setTimeout(() => {
      for(let i = 0; i < cmd.length; i++) {
        // console.log("cmd:", cmd[i]);
        bleStore.sendMsg(cmd[i], mainStore);
      }

      // 更改机械臂位置
      let positionObj = {};
      positionObj[armModelStore.map[motorId]] = loc_ref;
      armModelStore.setPosition(positionObj);

    }, item.time);
  });

  console.log('getAnimationCmds:', cmdsWithTime);
  // //  debugger;

  // let time
  // this.queueTimer = setInterval(() => {
    
  // }, 50);
  
  // return cmdsWithTime;
}

/**
 * @description 插帧函数 根据贝塞尔曲线进行插帧    
 * @param {*} keyframes
 * @param {*} time
 * @param {*} action
 */
function insertFrame(keyframe, nextKeyframe, splitCount = 2) {
  keyframe = JSON.parse(JSON.stringify(keyframe));
  keyframe.location = parseFloat(keyframe.location);
  keyframe.time = parseInt(keyframe.time);
  keyframe.motorId = parseInt(keyframe.motorId);

  nextKeyframe = JSON.parse(JSON.stringify(nextKeyframe));
  nextKeyframe.location = parseFloat(nextKeyframe.location);
  nextKeyframe.time = parseInt(nextKeyframe.time);
  nextKeyframe.motorId = parseInt(nextKeyframe.motorId);

  // splitCount = 2时，表示取两个点即首位两个点，数组从0开始，所以需要-1 
  splitCount = splitCount - 1;
  console.log("--关键帧insertFrame: ", keyframe, nextKeyframe, splitCount);

  let timeDelta = nextKeyframe.time - keyframe.time;

  let locationDelta = nextKeyframe.location - keyframe.location;
  // 平均速度 rad / s 举例： 180°(角度) = Math.PI(弧度) ; time是毫秒，在此要转为秒
  let avgSpeed = (locationDelta / 180 * Math.PI) / (timeDelta / 1000);

  let timingFunction = handleTimingFunc(nextKeyframe.timingFunction || 'linear');

  let keyframes = [];
  let preCoord = [0, 0];
  
  for(let i = 0; i <= splitCount; i++) {
    let t = i / splitCount;
    // let coordinate = bezierCurve([0, 0], [1, 1], t);

    // timingFunction;
    // debugger;
    let p1 = timingFunction.slice(0, 2);
    let p2 =timingFunction.slice(2, 4)
    let coordinate = bezierCurve(p1, p2, t);
    // debugger;
   
    let newFrame = {
      time: parseInt(keyframe.time + timeDelta * coordinate[0]),
      motorId: keyframe.motorId, 
      // location: keyframe.location + locationDelta * coordinate[1], 
      location: (keyframe.location + locationDelta * coordinate[1]) / 180 * Math.PI, // 转换为弧度
      speed: avgSpeed * (coordinate[1] - preCoord[1]) / (coordinate[0] - preCoord[0]) || 0, 
    }

    // newFrame;
    // debugger;

    // // 每个关键帧的第一帧都是速度为零，前个关键帧的最后位置，是现在关键帧的起始位置
    if(newFrame && newFrame.speed === 0) {
      // 考虑是否将第一帧放进关键帧里
      // 但万一有漏帧的行为呢，在此可以校准起始位置。只需将手动赋予个固定速度，如果位置就是目标位置的话，就不用被执行
      newFrame.speed = 5;
      // keyframes.push(newFrame);
    }
    // 速度太快，电机会跳起来, 暂时限制15 6.28rad/s = 360°/s 
    if(newFrame?.speed >= 15) {
      newFrame.speed = 15;
    }
    if(newFrame && newFrame.speed){
        keyframes.push(newFrame);
    }

  }
  return keyframes;

  function bezierCurve(p1, p2, t) {
    // 定义起始点和结束点
    var p0 = [0, 0];
    var p3 = [1, 1];

    // 计算贝塞尔曲线上的点
    var x = (1 - t) * (1 - t) * (1 - t) * p0[0] + 3 * (1 - t) * (1 - t) * t * p1[0] + 3 * (1 - t) * t * t * p2[0] + t * t * t * p3[0];
    var y = (1 - t) * (1 - t) * (1 - t) * p0[1] + 3 * (1 - t) * (1 - t) * t * p1[1] + 3 * (1 - t) * t * t * p2[1] + t * t * t * p3[1];

    // 返回坐标结果
    return [x, y];
  }

  function handleTimingFunc(str) {
    const predefine = {
      'ease': '.25,.1,.25,1',
      'linear': '0,0,1,1',
      'ease-in': '.42,0,1,1',
      'ease-out': '0,0,.58,1',
      'ease-in-out':'.42,0,.58,1'
    }
    let bezierStr = str;

    if(Reflect.has(predefine, str)) {
      bezierStr = predefine[str];
    }
    let bezierArr = bezierStr.split(",");

    return bezierArr;
  }

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

/**
 * @description 移动到初始位置
 * 这个函数可以在动画开始前调用，确保机械臂在关键帧的第一帧位置
 */
function moveToInitialPosition(motionList, armModelStore, bleStore) {
  console.log("--moveToInitialPosition: ", motionList);
  
  motionList.joints.forEach(joint => {
    console.log("--moveToInitialPosition joint: ", joint);
    let { location, motorId } = joint.keyframes[0];

    let cmds = Loc_Director({ motorId, limit_spd: 5, loc_ref: location / 180 * Math.PI });

    let positionObj = {};
    positionObj[joint.name] = location / 180 * Math.PI
    armModelStore.setPosition(positionObj);


    for(let i = 0; i < cmds.length; i++) {
      bleStore.sendMsg(cmds[i]);
    }

  });

}

/**
 * @description 计算动画每帧的位置
 */
function framePositions() {
  // 遍历关键帧数
  // 计算delta location， delta time  那么贝塞尔曲线的t就是 elapsed / deltaTime
  // 根据 t 计算出贝塞尔曲线对应的x，y值
  // 根据x，y值计算出位置
  // 直接修改3d模型的位置信息
}

export {
  getAnimationCmds,
  runKeyframeAnimation,
  moveToInitialPosition
};


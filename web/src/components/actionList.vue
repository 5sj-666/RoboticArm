<template>
  <div class="action-list">
    <div>
      <span>动作列表</span>
      <el-button 
        size="small" 
        type="primary" 
        @click="emit('addAction')">
        新增动作
      </el-button>
      <el-button 
        size="small" 
        @click="simulatorCmd">
        模拟指令
      </el-button>

    </div>
    <div
      class="action-card"
      v-for="(action, index) in motionList"
      :key="index"
    >
      <div class="action-item">
        <span>{{ action.name }}</span>
        <div>{{ action.description }}</div>
      </div>
      <div class="action-btns">
        <el-button size="small" @click="editMotion(action)">编辑</el-button>
        <el-button size="small" @click="deleteMotion(action)">删除</el-button>

        <el-button size="small" @click="handlePrepare(action)">准备</el-button>
        <el-button 
          size="small" 
          type="primary" 
          @click="handleRun(action)"
        >
          运行
        </el-button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted } from "vue";
import {
  moveToInitialPosition,
  getAnimationCmds,
} from "@/utils/keyframe/index.js";
import { useMainStore } from "@/stores/index.js";
import { useMotionStore } from "../stores/motions";
import { useArmModelStore } from "@/stores/armModel.js";
import { useBleStore } from "@/stores/ble.js";
import { parse_cmd } from "@/utils/CyberGear.js";

const mainStore = useMainStore();
const motionStore = useMotionStore();
const armModelStore = useArmModelStore();
const bleStore = useBleStore();

const emit = defineEmits(["addAction", 'editAction']);

motionStore.initFromStorage();

let motionList = computed(() => {
  return motionStore.motionList || {name: '', id: '', description: '', joints: []};
});

function editMotion(action) {
  motionStore.setCurrentMotion(action);
  emit('editAction');
}

function deleteMotion(action) {
  motionStore.delete(action.id);
}

function handlePrepare(action) {
  // 你的准备逻辑
  console.log("准备", action.name);
  moveToInitialPosition(action, armModelStore, bleStore);
  // debugger;
}
function handleRun(action) {

  // action;
  // debugger;

  const motion = new BezierMotion({
    joints: action.joints,
    onUpdate: (elapsed, progress) => {
      // elapsed: 已过去时间(ms)
      // progress: 贝塞尔运动进度(0~1)
      // 这里可以更新物体位置
      console.log('elapsed:', elapsed, 'progress:', progress);
    }
  });
  motion.start();

  console.log("运行", action.name);
}

function simulatorCmd() {
  let embedMsg = [0,0 , 3.14, 2, 3.14, 2, 0, 0, 0, 0, 0, 0];
  const float32Array = new Float32Array(embedMsg);
  bleStore.sendMsg({type: 6, msg: float32Array});
}

class BezierMotion {
  /**
   * @param {Object} options
   * @param {number} options.duration 总时长(ms)
   * @param {Array} options.p1 贝塞尔控制点1 [x, y]
   * @param {Array} options.p2 贝塞尔控制点2 [x, y]
   * @param {Function} options.onUpdate 每帧回调 (elapsed, progress)
   */
  constructor({ joints, onUpdate }) {

    this.cursors = [1, 1, 1, 1, 1, 1];
    this.preFrameLocations = [0, 0, 0, 0, 0, 0];
    // 帧间隔时间
    this.frameInterval = null;
    // 上一帧时间
    this.lastFrameTime = null; 
    // Array<{ location, time }>
    this.delta = [];
    this.joints = joints;

    this.startTime = null;
    this.isRunning = false;
    this.onUpdate = onUpdate;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = performance.now();
    console.log("---开始动画: ", this.startTime);
    requestAnimationFrame(this._step.bind(this));
  }

  stop() {
    this.isRunning = false;
  }

  // _step(now) {
  //   if (!this.isRunning) return;

  //   // 计算当前帧间隔
  //   let frameInterval = 0;
  //   if (this.lastFrameTime !== null) {
  //     frameInterval = now - this.lastFrameTime;
  //     console.log('当前帧间隔:', frameInterval, 'ms');
  //   }
  //   this.lastFrameTime = now;
    
  //   const elapsed = now - this.startTime;
  //   // const t = Math.min(elapsed / this.duration, 1);

  //   let {positions, embedMsg}= getAllJointPosition({
  //     elapsed, 
  //     cursors: this.cursors, 
  //     delta: this.delta, 
  //     joints: this.joints, 
  //     preFrameLocations: this.preFrameLocations, 
  //     frameInterval
  //   });

  //   console.log("---动画函数执行: ", elapsed, positions, this.cursors, this.cursors.filter(item => item === 0).length, '--embedMsg: ', embedMsg);
  //   armModelStore.setPosition(positions);
    
  //   if(this.cursors.filter(item => item === -1).length == this.joints.length) {
  //     // debugger;
  //     this.isRunning = false;
  //     return;
  //   } else {
  //     requestAnimationFrame(this._step.bind(this));
  //   }
    
  //   // 每帧回调
  //   if (typeof this.onUpdate === 'function') {
  //     this.onUpdate(elapsed);
  //   }

  // }
  _step(now) {
    if (!this.isRunning) return;

    // 计算当前帧间隔
    let frameInterval = 0;
    if (this.lastFrameTime !== null) {
      frameInterval = now - this.lastFrameTime;
    }else {
      this.lastFrameTime = now;
    }
    // 目标间隔60帧：16.67ms 30帧：33.33ms
    const targetInterval = 1000 / 144;

    // 只有间隔大于等于目标间隔时才执行动画逻辑
    if (frameInterval >= targetInterval) {
      this.lastFrameTime = now;
      console.log('当前帧间隔:', frameInterval, 'ms');

      const elapsed = now - this.startTime;
      let { positions, embedMsg } = getAllJointPosition({
        elapsed,
        cursors: this.cursors,
        delta: this.delta,
        joints: this.joints,
        preFrameLocations: this.preFrameLocations,
        frameInterval
      });
      console.log("---动画函数执行: ", elapsed, positions, this.cursors, this.cursors.filter(item => item === 0).length, '--embedMsg: ', embedMsg);
 
      armModelStore.setPosition(positions);
      // 多关节数据在一个数组内发送
      // 确保数据是 Uint8Array 并获取其 ArrayBuffer
      // const buffer = (embedMsg instanceof Uint8Array) ? embedMsg.buffer : new Uint8Array(embedMsg).buffer;
      const float32Array = new Float32Array(embedMsg);
      bleStore.sendMsg({type: 6, msg: float32Array});
      // bleStore.sendMsg({type: 6, msg: embedMsg});

      if (this.cursors.filter(item => item === -1).length == this.joints.length) {
        this.isRunning = false;
        return;
      }

      // 每帧回调
      if (typeof this.onUpdate === 'function') {
        this.onUpdate(elapsed);
      }
    }

    requestAnimationFrame(this._step.bind(this));
  }

}

/**
 * @description 获取所有关节的当前帧位置
 * @param param0 
 */
function getAllJointPosition({elapsed, cursors, delta, joints, preFrameLocations, frameInterval}) {

  let positions = {};
  // 发送给单片机的信息，数组下标0-1表示21电机，2-3表示22电机，依次类推。
  // arr[0 + n*2] = location, arr[1 + n*2] = speed。 
  let embedMsg = new Array(12).fill(0); 
  // 遍历所有关节，计算当前机械臂关节应该在什么位置
  for (let i = 0; i < joints.length; i++) {
    // 如果是 -1 的话,即超出
    if(cursors[i] === -1) continue;
    
    // 如果没有对应的节点
    if(!joints[i] || !joints[i].keyframes || cursors[i] >= joints[i].keyframes.length) {
      cursors[i] = -1;
      // debugger;
      continue;
    }

    let cur = joints[i].keyframes[cursors[i]];
   
    // 初始化
    if (elapsed > cur.time || cursors[i] === 1) {
      if(elapsed > cur.time ) {
        cursors[i] += 1;
      }

      // 是否有下一帧，没有的话，将cursor置为-1
      if(cursors[i] >= joints[i].keyframes.length) {
        cursors[i] = -1;
        continue;
      }

      let pre = joints[i].keyframes[cursors[i] - 1];
      cur = joints[i].keyframes[cursors[i]];

      // 两个关键帧之间的差值计算， 算是优化，一次计算，就不用每一帧都去计算
      delta[i] = {};
      delta[i].time = cur.time - pre.time;
      delta[i].location = cur.location - pre.location;
      delta[i].baseTime = pre.time;
    }

    // 计算t
    let t = (elapsed - delta[i].baseTime) / (cur.time - delta[i].baseTime);

    let p1 = cur.timingFunction.split(",").slice(0, 2);
    let p2 = cur.timingFunction.split(",").slice(2, 4);
    let y = bezierXToY(t, p1, p2);

    let locationTarget = cur.location - delta[i].location * (1 - y);
    let speed = (locationTarget - preFrameLocations[i]) / frameInterval * Math.PI / 180 * 1000; // 转换为弧度每秒
    if(speed > 15) {
      console.warn(`电机 ${joints[i].name} 的速度过快: ${speed} rad/s`);
      speed = 15; // 限制最大速度为15
    }

    positions[joints[i].name] = (locationTarget * Math.PI) / 180;

    embedMsg[i * 2] = parseFloat((locationTarget * Math.PI) / 180);
    embedMsg[i * 2 + 1] = parseFloat(Math.abs(speed));

    preFrameLocations[i] = locationTarget;
  }

  return {positions, embedMsg};
}

/**
 * 三次贝塞尔曲线中，根据x坐标计算对应的y坐标
 * @param {number} xTarget - 目标x坐标
 * @param {Array} p1 - 第二个控制点 [x, y]
 * @param {Array} p2 - 第三个控制点 [x, y]
 * @param {number} epsilon - 精度控制，默认1e-6
 * @param {number} maxIter - 最大迭代次数，默认100
 * @returns {number|null} 对应的y坐标，如果求解失败返回null
 */
function bezierXToY(xTarget, p1, p2, epsilon = 1e-6, maxIter = 100) {
  const [x0, y0] = [0, 0];
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const [x3, y3] = [1, 1];

  // 计算x分量
  function bezierX(t) {
    return (
      x0 * Math.pow(1 - t, 3) +
      3 * x1 * Math.pow(1 - t, 2) * t +
      3 * x2 * (1 - t) * Math.pow(t, 2) +
      x3 * Math.pow(t, 3)
    );
  }

  // x分量的导数
  function derivativeX(t) {
    return (
      3 * Math.pow(1 - t, 2) * (x1 - x0) +
      6 * (1 - t) * t * (x2 - x1) +
      3 * Math.pow(t, 2) * (x3 - x2)
    );
  }

  // 检查x是否在有效范围内
  const xStart = bezierX(0);
  const xEnd = bezierX(1);
  const xMin = Math.min(xStart, xEnd);
  const xMax = Math.max(xStart, xEnd);

  if (xTarget < xMin - epsilon || xTarget > xMax + epsilon) {
    return null;
  }

  // 牛顿迭代求解t
  let t = 0.5;
  for (let i = 0; i < maxIter; i++) {
    const xCurrent = bezierX(t);
    if (Math.abs(xCurrent - xTarget) < epsilon) break;

    const dx = derivativeX(t);
    if (Math.abs(dx) < 1e-12) {
      // 导数接近0时使用二分法
      let low = 0,
        high = 1;
      for (let j = 0; j < 50; j++) {
        const mid = (low + high) / 2;
        if (bezierX(mid) < xTarget) low = mid;
        else high = mid;
        if (high - low < epsilon) {
          t = (low + high) / 2;
          break;
        }
      }
      break;
    }

    t -= (xCurrent - xTarget) / dx;
    t = Math.max(0, Math.min(1, t));
  }

  // 计算对应的y值
  return (
    y0 * Math.pow(1 - t, 3) +
    3 * y1 * Math.pow(1 - t, 2) * t +
    3 * y2 * (1 - t) * Math.pow(t, 2) +
    y3 * Math.pow(t, 3)
  );
}

  // 塞入三个指令: 设置模式, 设置速度,设置位置，
  // let TWAI_id = new Array(4).fill(0);
  // let TWAI_data = new Array(8).fill(0);
  // enable: ({motorId}) => {
  //       TWAI_id = [0x03, 0x00, 0xfd, motorId];
  //     },
  // 更改运行模式, 通信类型18
  // run_mode: ({motorId, run_mode}) => {
  //   TWAI_id = [0x12, 0x00, 0xfd, motorId];
  //   TWAI_data = [0x05, 0x70, 0x00, 0x00, run_mode, 0x00, 0x00, 0x00];
  // }
  // 设置速度，通信类型18， limit_spd: [0 - 30]
  // limit_spd: ({motorId, limit_spd}) => {
  //   TWAI_id = [0x12, 0x00, 0xfd, motorId];
  //   TWAI_data = [0x17, 0x70, 0x00, 0x00, ...numToUnit8Array(limit_spd)];
  // },
  // 设置要旋转的位置, 通信类型18
  // loc_ref: ({motorId, loc_ref}) => {
  //   TWAI_id = [0x12, 0x00, 0xfd, motorId];
  //   TWAI_data = [0x16, 0x70, 0x00, 0x00, ...numToUnit8Array(loc_ref)];
  // },

onMounted(() => {
  // generateCmd([0, 0, 0, 0, 0.8760904248626792, 1.5355051064121865, 0, 0, 0, 0, 0, 0], (cmd) => {
  //   console.log('cmd:', cmd);
  // });



})

function numToUnit8Array(num) {
  // 创建一个长度为 4 的 ArrayBuffer
  const buffer = new ArrayBuffer(4);
  // 创建一个 DataView 来操作 ArrayBuffer
  const dataView = new DataView(buffer);
  // 将 64 位的 number 转换为 32 位浮点数并写入 DataView
  dataView.setFloat32(0, num);
  // 创建一个 Uint8Array 视图来读取数据
  const uint8Array = new Uint8Array(buffer);
  // 由于小米电机的数据是倒序的，所以需要反转
  return uint8Array.reverse();
}


/**
 * @description 生成指令
 * @param {Array<float>} actionInfos 
 *  六个关节的信息(位置和速度) 2 * n 表示第n个关节的位置，2 * n + 1 表示第n个关节的速度
 *  [0, 0, 0, 0, 0.8760904248626792, 1.5355051064121865, 0, 0, 0, 0, 0, 0]
 */
function generateCmd(actionInfos, callbackFunc) {
  let cmds = [];

  for(let i = 0; i < actionInfos.length; i = i + 2) {
  
    console.log(i);
    let location = actionInfos[i]; // 位置，弧度
    let speed = actionInfos[i + 1]; // 速度，弧度每秒
    let run_mode = 1
    let motorId = i / 2 + 22; // 电机ID，从22开始

    if(speed === 0) {
      continue;
    }

    let runModeCmd = [0x12, 0x00, 0xfd, motorId, 0x05, 0x70, 0x00, 0x00, run_mode, 0x00, 0x00, 0x00]
    let speedCmd = [0x12, 0x00, 0xfd, motorId, 0x17, 0x70, 0x00, 0x00, ...numToUnit8Array(speed)];
    let locRefCmd = [0x12, 0x00, 0xfd, motorId, 0x16, 0x70, 0x00, 0x00, ...numToUnit8Array(location)];
    console.log('runModeCmd:', runModeCmd, parse_cmd(runModeCmd));
    console.log('speedCmd:', speedCmd, parse_cmd(speedCmd));
    console.log('locRefCmd:', parse_cmd(locRefCmd));

    callbackFunc(runModeCmd);
    callbackFunc(speedCmd);
    callbackFunc(locRefCmd);
    
  }

}
</script>
<style scoped>
.action-list {
  width: 100%;
  height: 300px;
  border: 1px solid #ccc;
  overflow: auto;
}
.action-card {
  box-sizing: border-box;
  width: 100%;
  min-height: 60px;
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fafbfc;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  padding: 12px 20px;
  transition: box-shadow 0.2s;
  cursor: pointer;
  justify-content: space-between;
}
.action-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  background: #f5f7fa;
}
.action-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.action-item span {
  font-size: 18px;
  font-weight: 600;
  color: #222;
}
.action-item div {
  font-size: 14px;
  color: #666;
  margin-top: 2px;
}
.action-btns {
  display: flex;
  gap: 8px;
}
</style>
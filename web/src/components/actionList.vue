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
import { computed } from "vue";
import {
  moveToInitialPosition,
  getAnimationCmds,
} from "@/utils/keyframe/index.js";
import { useMainStore } from "@/stores/index.js";
import { useMotionStore } from "../stores/motions";
import { useArmModelStore } from "@/stores/armModel.js";
import { useBleStore } from "@/stores/ble.js";

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

  _step(now) {
    if (!this.isRunning) return;

    const elapsed = now - this.startTime;
    // const t = Math.min(elapsed / this.duration, 1);

    let positions = getAllJointPosition({elapsed, cursors: this.cursors, delta: this.delta, joints: this.joints});
    console.log("---动画函数执行: ", elapsed, positions, this.cursors, this.cursors.filter(item => item === 0).length);
    armModelStore.setPosition(positions);
    
    if(this.cursors.filter(item => item === -1).length == this.joints.length) {
      // debugger;
      this.isRunning = false;
      return;
    }else {
      requestAnimationFrame(this._step.bind(this));
    }
    
    // 每帧回调
    if (typeof this.onUpdate === 'function') {
      this.onUpdate(elapsed);
    }

  }

}

/**
 * @description 获取所有关节的当前帧位置
 * @param param0 
 */
function getAllJointPosition({elapsed, cursors, delta, joints}) {

  let positions = {};
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

      // 差值计算， 算是优化，一次计算，就不用每一帧都去计算
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
    positions[joints[i].name] = (locationTarget * Math.PI) / 180;

  }

  return positions;
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
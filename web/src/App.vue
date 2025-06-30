<template>
  <section style="width: 100%; height: 100%; position: relative;">
  <!-- <div class="tool-box">
    <button @click="handleBlueTooth">连接蓝牙</button>

    <button @click="cmdVal('enable')">使能指令</button>
    <button @click="cmdVal('jog5')">jog指令</button>
    <button @click="cmdVal('jog0')">jog停止指令</button>
    <button @click="cmdVal('disable')">停止指令</button>
    <button @click="generateCMD('enable')">测试</button>

    <button @click="generateCMD('loc_ref', { motorId: 21, loc_ref: 12.5 })">loc_ref</button>
    <button @click="generateCMD('limit_spd', { motorId: 21, limit_spd: 12.5 })">limit_spd</button>
    <button @click="generateCMD('run_mode', { motorId: 21, run_mode: 4 })">run_mode</button>
    <button @click="testMode">测试位置模式</button>
  </div> -->

  <keyframeDialog v-model:visible="showKeyframe" />
  

  <div class="tool-box">
    <el-button @click="showKeyframe = true">打开</el-button>
    <el-button @click="setMotorInitialPoint"> 设置机械零点 </el-button>
    <el-button @click="trigger()">触发</el-button>

    <el-button>测试抽屉</el-button>

    启用贝塞尔曲线优化动作：
    <el-switch
      v-model="mainStore.enableBezier"
      class="mb-2"
      active-text="启用"
      inactive-text="关闭"
    />

    <el-button 
      primary 
      @click="rotateMotor({motorId: 22, limit_spd: 2, loc_ref: joint3})"
    >更改速度</el-button>


    <el-switch
      v-model="mainStore.enableMotor"
      class="mb-2"
      active-text="使能"
      inactive-text="停止"
      @change="motorEnableChange"
    />
    
  </div>

  <div id="scene"></div>

  <div class="toggle-box">
    <div>蓝牙连接: {{ bleStore.status === "connecting" ? "已连接" : "已断开" }}</div>
    <!-- <div>旋转角度(0 - 360)</div> -->

    <div class="slider-demo-block">
      <span class="demonstration">关节5 </span>
      <el-slider
        v-model="joint5"
        :min="-180"
        :max="180"
        :step="1"
        show-stops
        :marks="{
          '-180': { style: { color: '#ddd' }, label: '-180 deg' },
          0: { style: { color: '#ddd' }, label: '0 deg' },
          180: { style: { color: '#ddd' }, label: '180 deg' },
        }"
      />
    </div>
    <div class="slider-demo-block">
      <span class="demonstration">关节4 </span>
      <el-slider
        v-model="joint4"
        :min="-180"
        :max="180"
        :step="1"
        show-stops
        :marks="{
          '-180': { style: { color: '#ddd' }, label: '-180 deg' },
          0: { style: { color: '#ddd' }, label: '0 deg' },
          180: { style: { color: '#ddd' }, label: '180 deg' },
        }"
      />
    </div>

    <div class="slider-demo-block">
      <span class="demonstration">关节3 </span>
      <el-slider
        v-model="joint3"
        :min="-150"
        :max="140"
        :step="1"
        show-stops
        :marks="{
          '-150': { style: { color: '#ddd' }, label: '-150 deg' },
          0: { style: { color: '#ddd' }, label: '0 deg' },
          140: { style: { color: '#ddd' }, label: '140 deg' },
        }"
        @change="rotateMotor({motorId: 22, limit_spd: 5, loc_ref: joint3})"
      />
    </div>

    <div class="slider-demo-block">
      <span class="demonstration">关节2 </span>
      <el-slider
        v-model="joint2"
        :min="-95"
        :max="95"
        :step="1"
        show-stops
        :marks="{
          '-95': { style: { color: '#ddd' }, label: '-95 deg' },
          0: { style: { color: '#ddd' }, label: '0 deg' },
          95: { style: { color: '#ddd' }, label: '95 deg' },
        }"
        @change="rotateMotor({motorId: 23, limit_spd: 2, loc_ref: joint2})"
      />
    </div>

    <div class="slider-demo-block">
      <span class="demonstration">关节1 </span>
      <el-slider
        v-model="joint1"
        :min="-180"
        :max="180"
        :step="1"
        show-stops
        :marks="{
          '-180': { style: { color: '#ddd' }, label: '-180 deg' },
          0: { style: { color: '#ddd' }, label: '0 deg' },
          180: { style: { color: '#ddd' }, label: '180 deg' },
        }"
        @change="rotateMotor({motorId: 21, limit_spd: 2, loc_ref: joint1})"
      />
    </div>
  </div>

  <cmdsHistory />

</section>

  
  
</template>
<script setup>
import motor3d from "./utils/motor3d";
import { nextTick, onMounted, ref, watchEffect, render, watch } from "vue";

import { generateCMD, Loc_Director, parse_cmd, numToUnit8Array, enable_Director, disable_Director } from "./utils/CyberGear.js"
import { drawBezierCurve, getCmdSeries } from "./utils/BezierCurve.js"
import keyframeDialog from "./components/keyframeDialog.vue";
import cmdsHistory from "./components/cmdsHistory.vue";

import { useMainStore } from '@/stores/index.js';
import { useArmModelStore } from '@/stores/armModel.js';
import { useBleStore } from '@/stores/ble.js';

const mainStore = useMainStore();
const armModelStore = useArmModelStore();
const bleStore = useBleStore();

let armInstanceRef = ref(null);
let showKeyframe = ref(false);


/**
 * @description 设置电机的机械零点
 */
function setMotorInitialPoint() {
  // AA 01 00 08 06 00 01 05 01 00 00 00 00 00 00 00 7A
  for(let i = 21; i <= 23; i++) {
    let cmdFrame = generateCMD('initialPoint', { motorId: 21});
    bleStore.sendMsg(cmdFrame, mainStore); 
  }
}


onMounted(() => {
  // let info = parse_cmd();
  // console.log('---info: ', info);

  armInstanceRef.value = new motor3d("#scene");
  // console.log("--armInstance：", armInstance);
  console.log(armModelStore.armInstance);
  armModelStore.setInstance(armInstanceRef.value);
  console.log("armModel.armInstance", armModelStore.armInstance, armModelStore.test);

  // bleAvailable();
  bleStore.availableFunc();

  // BleCharacteristic.writeValue(cmdFrame);
  //   console.log("---指令发送成功---");
  // double2floatCode(0.001);
  // function test() {
  //   console.log('--test: ', arguments);
  // }

  // drawBezierCurve([.9,.13], [.88,.28]);(.17,.67,.83,.67)
  // 绘制贝塞尔曲线到html节点下
  // drawBezierCurve([.17,.67], [.83,.67]);


  // getCmdSeries( { p1: [.9,.13], p2: [.88,.28] }, 3, 2, 21, rotateMotor);

  // drawBezierCurve([.42,.42], [.58,.58]);
});


function trigger() {
  // getCmdSeries( { p1: [.9,.13], p2: [.88,.28] }, 180, 5, 23, rotateMotor);
  getCmdSeries({
    // cubicBezier: {p1: [.9,.13], p2: [.88,.28]},
    cubicBezier: {p1: [.17,.67], p2: [.83,.67]},
    rotateDeg: 180,
    duration: 1 * 1000,
    motorId: 22,
    sendBleMsg: rotateMotor,
    baseRotate: 0, // 从某个角度开始
  });
}

/**
 * @description 旋转电机
 * @param {
    motorId: ,
    limit_spd: ,
    loc_ref: 传入的是角度 比如180，程序里会做转换将其转为rad
  } 
 */
function rotateMotor({motorId, limit_spd, loc_ref}) {

  // debugger;
  // motorId, limit_spd;
  // let a =  loc_ref * 0.017;
  // debugger;
  let rad = loc_ref * Math.PI / 180;
  //  // 现在贝塞尔曲线传入的角度，所以需要做个转换，且最大转速不超过10
  // if(enableBezier.value) {
  //   limit_spd = limit_spd * Math.PI / 180;
  // }
  // if(limit_spd !== 2 && limit_spd !== 5) { // 暂时兼容原来的写法， 传入的是5rad
  //   // 现在贝塞尔曲线传入的角度，所以需要做个转换，且最大转速不超过30
  //   limit_spd = limit_spd * Math.PI / 180;
  //   console.warn('速度: ', limit_spd);
  // }
  // limit_spd = limit_spd * Math.PI / 180;


  // let cmdArr = Loc_Director({motorId, limit_spd, loc_ref: loc_ref * 0.017});
  let cmdArr = Loc_Director({motorId, limit_spd, loc_ref: rad});
  // console.log('---cmdArr: ', cmdArr);
  for(let i = 0; i < cmdArr.length; i++) {
    bleStore.sendMsg(cmdArr[i], mainStore);
  }
}

let joint1 = ref(0);
let joint2 = ref(0);
let joint3 = ref(0);

let joint4 = ref(0);
let joint5 = ref(0);


watchEffect(() => {
  let position = {
    joint1: -(joint1.value * Math.PI) / 180,
    joint2: -(joint2.value * Math.PI) / 180,
    joint3: -(joint3.value * Math.PI) / 180,
    joint4: -(joint4.value * Math.PI) / 180,
    joint5: -(joint5.value * Math.PI) / 180,
  };
  armModelStore.setPosition(position);
  // console.log(armModelStore);
});


/**
 *
 * @param {*} type 指令类型 enable  disable jog5 jog0
 * @param {*} position
 */
function cmdVal(type, position) {
  let cmdFrame = generateCMD(type, {position});
  
  console.log(cmdFrame);
  bleStore.sendMsg(cmdFrame);

}

/**
 * @description 电机使能开关
 * @param {boolean} value true: 使能电机， false: 停止电机
 */
function motorEnableChange(value) {
  console.log('--motorEnableChange: ', value);
  let cmdFrameArr = value ? enable_Director({motorId: 22}) : disable_Director({motorId: 22});
  mainStore.setEnableMotor(value);
  bleStore.sendMsg(cmdFrameArr[0], mainStore);
}

</script>

<style scoped>
body,
#scene {
  overflow: hidden;
}

.tool-box {
  position: absolute;
}

.toggle-box {
  position: absolute;
  right: 20px;
  top: 20px;
  width: 500px;
  /* height: 220px; */
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  box-sizing: border-box;
  padding: 10px;
  padding-bottom: 20px;
  padding-right: 40px;
  color: #ddd;
}
.slider-demo-block {
  max-width: 600px;
  display: flex;
  align-items: center;
}
.slider-demo-block .el-slider {
  margin-top: 0;
  margin-left: 12px;
}
.slider-demo-block .demonstration {
  font-size: 14px;
  /* color: var(--el-text-color-secondary); */
  color: #ddd;
  line-height: 44px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 0;
}
.slider-demo-block .demonstration + .el-slider {
  flex: 0 0 85%;
}

.monitor-box {
  position: absolute;
  left: 20px;
  bottom: 20px;
  width: 600px;
  height: 310px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.15);
  box-sizing: border-box;
  padding-right: 40px;
  overflow: hidden;
  user-select: none;
}


</style>
<style>
html, body, #app {
  overflow: hidden;
}
</style>

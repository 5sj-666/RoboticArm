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
      v-model="enableBezier"
      class="mb-2"
      active-text="启用"
      inactive-text="关闭"
    />

    <el-button 
      primary 
      @click="rotateMotor({motorId: 22, limit_spd: 2, loc_ref: armTopAngle})"
    >更改速度</el-button>


    <el-switch
      v-model="motorEnable"
      class="mb-2"
      active-text="使能"
      inactive-text="停止"
      @change="motorEnableChange"
    />
    
  </div>

  <div id="scene"></div>

  <div class="toggle-box">
    <div>蓝牙连接: {{ bleConnecting ? "已连接" : "已断开" }}</div>
    <!-- <div>旋转角度(0 - 360)</div> -->

    <div class="slider-demo-block">
      <span class="demonstration">five: </span>
      <el-slider
        v-model="armFiveAngle"
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
      <span class="demonstration">four: </span>
      <el-slider
        v-model="armFourAngle"
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
      <span class="demonstration">three： </span>
      <el-slider
        v-model="armTopAngle"
        :min="-180"
        :max="180"
        :step="1"
        show-stops
        :marks="{
          '-180': { style: { color: '#ddd' }, label: '-180 deg' },
          0: { style: { color: '#ddd' }, label: '0 deg' },
          180: { style: { color: '#ddd' }, label: '180 deg' },
        }"
        @change="rotateMotor({motorId: 22, limit_spd: 5, loc_ref: armTopAngle})"
      />
    </div>

    <div class="slider-demo-block">
      <span class="demonstration">two： </span>
      <el-slider
        v-model="armCenterAngle"
        :min="-120"
        :max="120"
        :step="1"
        show-stops
        :marks="{
          '-120': { style: { color: '#ddd' }, label: '-120 deg' },
          0: { style: { color: '#ddd' }, label: '0 deg' },
          120: { style: { color: '#ddd' }, label: '120 deg' },
        }"
        @change="rotateMotor({motorId: 23, limit_spd: 2, loc_ref: armCenterAngle})"
      />
    </div>

    <div class="slider-demo-block">
      <span class="demonstration">one： </span>
      <el-slider
        v-model="armBottomAngle"
        :min="-180"
        :max="180"
        :step="1"
        show-stops
        :marks="{
          '-180': { style: { color: '#ddd' }, label: '-180 deg' },
          0: { style: { color: '#ddd' }, label: '0 deg' },
          180: { style: { color: '#ddd' }, label: '180 deg' },
        }"
        @change="rotateMotor({motorId: 21, limit_spd: 2, loc_ref: armBottomAngle})"
      />
    </div>
  </div>

  <div class="monitor-box">
    <el-table-v2
      :columns="columns"
      :data="recordCmd"
      :row-class="rowClass"
      :width="600"
      :height="310"
      class="el-table-v2_custom"
      header-class="el-table-v2-header_custom"
    >
    <template #empty>
      <div class="flex items-center justify-center h-100%">
        <el-empty :description="'暂无数据'" :image-size="100" />
      </div>
    </template>
    </el-table-v2>
  </div>


  
</section>

  
  
</template>
<script setup>
import motor3d from "./utils/motor3d";
import { nextTick, onMounted, ref, watchEffect, render, h } from "vue";

import { generateCMD, Loc_Director, parse_cmd, numToUnit8Array, enable_Director, disable_Director } from "./utils/CyberGear.js"

import { drawBezierCurve, getCmdSeries } from "./utils/BezierCurve.js"

import keyframeDialog from "./components/keyframeDialog.vue";

let showKeyframe = ref(false);

/* --- */
import { useCounterStore } from './stores/index.js'

const counter = useCounterStore()

// counter.testCount++
// // 自动补全！ ✨
// counter.$patch({ testCount: counter.testCount + 1 })
// // 或使用 action 代替
// counter.increment()

console.log("---pinia: ", counter);
/* --- */


/**
 * @description 设置电机的机械零点
 */
function setMotorInitialPoint() {
  // AA 01 00 08 06 00 01 05 01 00 00 00 00 00 00 00 7A

  for(let i = 21; i <= 23; i++) {
    let cmdFrame = generateCMD('initialPoint', { motorId: 21});
    setTimeout(() => {
      try {
        BleCharacteristic.writeValue(cmdFrame);
        console.log("---指令发送成功---");
        recordCmd.value.push({type: 'send', data: cmdFrame, status: 'success'});
      } catch (error) {
        // ElNotification({
        //   title: "蓝牙",
        //   message: bleConnecting.value ? error : '请连接蓝牙',
        //   position: "bottom-right",
        //   type: "error",
        //   duration: 0,
        // });
        console.warn("---指令发送失败---");
        recordCmd.value.push({type: 'send', data: cmdFrame, status: 'fail'});
      } 
      console.log(cmdFrame);
    }, (i - 21) * 500)
    
  
  }
  
}


let armInstance = ref(null);

// 通信记录部分
// item : {type: enum[send | receive], data: str , status: enum[success | error | receive], msg: str}
let recordCmd = ref([]);


onMounted(() => {
  // let info = parse_cmd();
  // console.log('---info: ', info);

  armInstance.value = new motor3d("#scene");
  console.log("--armInstance：", armInstance);

  bleAvailable();

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
    setTimeout(() => { bleSend(cmdArr[i]); }, 15)
  }
}

let armBottomAngle = ref(0);
let armCenterAngle = ref(0);
let armTopAngle = ref(0);

let armFourAngle = ref(0);
let armFiveAngle = ref(0);


watchEffect(() => {
  // console.log('角度： ', armBottomAngle.value, armCenterAngle.value, armTopAngle.value);
  // console.log('角度： ', -(armBottomAngle.value * Math.PI) / 180, -(armCenterAngle.value * Math.PI) / 180, -(armTopAngle.value * Math.PI) / 180);
  // debugger; 
  if (armInstance.value) {
    armInstance.value.angle_bottom = -(armBottomAngle.value * Math.PI) / 180;
    armInstance.value.angle_center = -(armCenterAngle.value * Math.PI) / 180;
    armInstance.value.angle_top = -(armTopAngle.value * Math.PI) / 180;
    armInstance.value.angle_four = -(armFourAngle.value * Math.PI) / 180;
    armInstance.value.angle_five = -(armFiveAngle.value * Math.PI) / 180;
  }
});

let bleConnecting = ref(false);
/**
 * 判断蓝牙是否可用，可用的话，获取可用的蓝牙列表
 */
async function bleAvailable() {
  let available = await navigator.bluetooth.getAvailability();
  ElNotification.closeAll();

  if (!available) {
    console.log("Doh! Bluetooth is not supported");
    // alert("当前设备不支持蓝牙");
    ElNotification({
      title: "蓝牙",
      message: "当前设备不支持蓝牙",
      position: "bottom-right",
      type: "warning",
    });
    return;
  }


  ElNotification({
    title: "蓝牙可用",
    dangerouslyUseHTMLString: true,
    message: h("span", null, [
      h("span", "点击"),
      h(
        ElButton,
        {
          type: "primary",
          onClick: handleBlueTooth,
          style: { margin: "0 5px" },
          size: "small",
        },
        () => "连接蓝牙"
      ),
      h("span", "来控制机械臂"),
    ]),
    position: "bottom-right",
    type: "success",
    duration: 0,
  });
  console.log("This device supports Bluetooth!");
}

async function handleBlueTooth() {
  // console.log('连接蓝牙');
  let device = await navigator.bluetooth.requestDevice({
    filters: [{ namePrefix: "ESP" }],
    optionalServices: [0x00ff],
  });
  // 蓝牙断开时
  device.addEventListener("gattserverdisconnected", () => {
    ElNotification.closeAll();
    ElNotification({
      title: "蓝牙",
      message: "蓝牙已断开",
      position: "bottom-right",
      type: "warning",
      duration: 0,
    });
    bleConnecting.value = false;
  });

  let server = await device.gatt.connect();
  console.log("server: ", server);
  let service = await server.getPrimaryService(0x00ff);
  console.log("service: ", service);
  let characteristic = await service.getCharacteristic(0xff01);
  console.log("characteristic: ", characteristic);
  window.BleCharacteristic = characteristic;

  ElNotification.closeAll();
  ElNotification({
    title: "蓝牙",
    message: "连接成功",
    position: "bottom-right",
    type: "success",
    duration: 0,
  });
  bleConnecting.value = true;

  // 接收蓝牙服务发出的通知
  characteristic.addEventListener("characteristicvaluechanged", (e) => {
    try{
      console.log("蓝牙Notification通知: ", e, "值:");
      let CAN_frame_data = Array.from(new Uint8Array(e.target.value.buffer));
      // .map(
      //   (num) => {
      //     return "0x" + num.toString(16);
      //   }
      // );
      recordCmd.value.push({type: 'receive', data: CAN_frame_data, status: 'received'});
    } catch(error) {
      console.error("蓝牙Notification通知错误: ", error);
    }
   
  });

  characteristic.startNotifications();

  // let testData = new Uint8Array([ 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff  ])

  // setInterval(() => {characteristic.writeValue(testData);}, 3000 );
}

// /**
//  * @description 生成指令   采用策略模式  因为使用非常频繁，所以改为静态类
//  * @param { string } type 策略类型
//  * @param { obj } params 所需的参数，暂无法全部确定
//  */
// function generateCMD(type, params = {}) {
//   // let TWAI_id = new Array(4).fill(0);
//   // let TWAI_data = new Array(8).fill(0);

//   // if (type === "enable") {
//   //   TWAI_id = [0x03, 0x00, 0xfd, 0x15];
//   //   // TWAI_data = []
//   // } else if (type === "disable") {
//   //   TWAI_id = [0x04, 0x00, 0xfd, 0x15];
//   // } else if (type === "jog5") {
//   //   TWAI_id = [0x12, 0x00, 0xfd, 0x15];
//   //   TWAI_data = [0x05, 0x70, 0x00, 0x00, 0x07, 0x01, 0x95, 0x54];
//   // } else if (type === "jog0") {
//   //   TWAI_id = [0x12, 0x00, 0xfd, 0x15];
//   //   TWAI_data = [0x05, 0x70, 0x00, 0x00, 0x07, 0x00, 0x7f, 0xff];
//   // }

//   // console.log("TWAI_id: ", TWAI_id, "TWAI_data: ", TWAI_data);
//   // let cmdFrame = Uint8Array.from([...TWAI_id, ...TWAI_data]);

//   let TWAI_id = new Array(4).fill(0);
//   let TWAI_data = new Array(8).fill(0);

//   var Strategies =  {
//     enable: () => {
//       TWAI_id = [0x03, 0x00, 0xfd, 0x15];
//     },
//     disable: () => {
//       TWAI_id = [0x04, 0x00, 0xfd, 0x15];
//     },
//     jog5: () => {
//       TWAI_id = [0x12, 0x00, 0xfd, 0x15];
//       TWAI_data = [0x05, 0x70, 0x00, 0x00, 0x07, 0x01, 0x95, 0x54];
//     },
//     jog0: () => {
//       TWAI_id = [0x12, 0x00, 0xfd, 0x15];
//       TWAI_data = [0x05, 0x70, 0x00, 0x00, 0x07, 0x00, 0x7f, 0xff];
//     }
//   }

//   Strategies[type](params);
//   console.log('策略模式: ', [...TWAI_id, ...TWAI_data]);
//   return Uint8Array.from([...TWAI_id, ...TWAI_data]);

// }

/**
 *
 * @param {*} type 指令类型 enable  disable jog5 jog0
 * @param {*} position
 */
function cmdVal(type, position) {
  let cmdFrame = generateCMD(type, {position});
  
  console.log(cmdFrame);
  bleSend(cmdFrame);

}

function bleSend(cmdFrame) {
  try {
    // BleCharacteristic.writeValue(cmdFrame);
    BleCharacteristic.writeValueWithoutResponse(cmdFrame);
    console.log("---指令发送成功---");
    recordCmd.value.push({type: 'send', data: cmdFrame, status: 'success'});
  } catch (error) {
    // ElNotification({
    //   title: "蓝牙",
    //   message: bleConnecting.value ? error : '请连接蓝牙',
    //   position: "bottom-right",
    //   type: "error",
    //   duration: 0,
    // });
    console.warn("---指令发送失败---");
    recordCmd.value.push({type: 'send', data: cmdFrame, status: 'fail'});
  }
}

// 使用队列，存放指令的顺序列表， 以完成一个动作， 使用建造者模式，

/**
 * @description  构建动作的指令数组  采用建造者模式， 比如要发送个jog5的动作   [ 开始提示, 使能指令， jog指令，jog停止，停止指令， 结束提示 ]
 */
function builderAction() {
    //
    function tip() {
      return () => {
        console.log("---执行函数---");
      }
    }

    // 指挥者
    function director() {

      return []
    }
}

const columns = ref([
  {
    key: 'type',
    title: '类型',
    dataKey: 'type',
    width: 50,
    cellRenderer: ({ cellData }) => cellData === 'send' ? '发送' : '接收',
  },
  {
    key: 'data',
    title: '',
    dataKey: 'data',
    width: 420,
    align: 'center',
    // 因为是 Unit8Array类型
    // cellRenderer: ({ cellData }) => cellData.slice(0, 4).join(','),
    cellRenderer: ({ cellData }) => {
      let cmd = Array.from(cellData);
      let data = parse_cmd(cmd)
      return data ? data.parseStr : cmd.join(',');
    },
    // flexGrow: true
  },
  {
    key: 'status',
    title: '状态',
    dataKey: 'status',
    width: 50,
    align: 'center',
  },

]);

const rowClass = ({rowData, rowIndex}) => {
  // console.log('rowClass: ', rowData.status, rowData);
  if(rowData.status === 'fail') {
    return 'el-table-v2_row-error';
  }
  // else if(rowData.status === 'success') {
  //   return 'el-table-v2_row-success'
  // }
  return '';
}


let enableBezier = ref(false);

let motorEnable = ref(false);
function motorEnableChange(value) {
  console.log('--motorEnableChange: ', value);
  if(value) {
    
    // enable_Director({motorId: 21});
    let cmdFrameArr = enable_Director({motorId: 22});
    // debugger;
    bleSend(cmdFrameArr[0]);;
    // enable_Director({motorId: 23});
  }else {
    // disable_Director({motorId: 21});
    let cmdFrameArr = disable_Director({motorId: 22});
    // debugger;
    bleSend(cmdFrameArr[0]);
    // disable_Director({motorId: 23});
  }
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
}


</style>
<style>
html, body, #app {
  overflow: hidden;
}
.el-table-v2_row-error {
  background: var(--el-color-danger-light-5);
}
/* .el-table-v2_row-success {
  background: var(--el-color-success-light-5);
} */
</style>

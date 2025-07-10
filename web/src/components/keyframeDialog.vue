<template>
  <el-dialog
    v-model="visible"
    title="设计一个动作"
    width="800"
    :before-close="handleClose"
    destroy-on-close
  >
    <!-- <div class="dialog-header">
      <h3>设计一个动作</h3>
    </div> -->
   
    <div class="dialog-body">

      <el-button>新增关键帧</el-button>
      <div v-for="joint in actionKeyFrames" :key="joint.id">
        关节1: 

      </div>

      
      <div style="display:flex; flex-direction: row;border: 1px solid #444">
        <div style="width: 30%">
          <div> 关节： 
            <el-select
              v-model="currJoint"
              placeholder="选择关节"
              size="middle"
              style="width: 240px"
            >
              <el-option
                v-for="item in jointList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div>电机id: </div>
          <div>当前状态: </div>
          <div>时间区间: 
            <div>
              开始时间/s: <input type="text" v-model="startTime" />
            </div>
            <div>
              结束时间/s: <input type="text" v-model="endTime" />
            </div>
            
          </div>
          <div>
            旋转角度： <input type="text" v-model="rotateDeg" />
          </div>
        </div>
        
        <div style="flex: 1; max-width: 70%">
          <div>贝塞尔曲线</div>
          <div class="bezier-example">
            <!-- <div ref="refBezierExample">1</div> -->
            <Track :bezier="interactBezierStr" />
          </div>
          <div class="cubic-ctrl-container" style="display: flex; justify-content: flex-start;">
            <div  style="width: 60px; display: flex;  flex-direction: column; justify-content: space-around;flex-shrink: 0; margin-left: 20px;">
              <div style="border: 1px solid #555; height: 20%">
                <CubicBezier 
                  size="60px" 
                  transitionTimingFunction="ease" 
                  backgroundColor="#0ab" 
                  @click="setInteractBezierStr('ease')" 
                  :canvasPadding="0.1" 
                  style="border-radius: 5px;"
                />
              </div>
              <div>
                <CubicBezier 
                  size="60px" 
                  transitionTimingFunction="ease-in" 
                  backgroundColor="#f08" 
                  @click="setInteractBezierStr('ease-in')" 
                  :canvasPadding="0.2"
                />
              </div>
              <div>
                <CubicBezier 
                  size="60px" 
                  transitionTimingFunction="ease-out" 
                  backgroundColor="rgb(248,250,253)" 
                  @click="setInteractBezierStr('ease-out')" 
                  :canvasPadding="0.1"
                  :bezierStyle="{
                    bezierLine: {
                      strokeStyle: '#333',
                    }
                  }"
                />
                <!-- backgroundColor="rgb(211,227,253)"  -->

              </div>
              <div>
                <CubicBezier 
                  size="60px" 
                  transitionTimingFunction="ease-in-out" 
                  backgroundColor="#0ab" 
                  @click="setInteractBezierStr('ease-in-out')" 
                  :canvasPadding="0.1"
                />
              </div>
            </div>
            <!-- <div style="width: 100%; height: 300px;border: 1px solid #555; flex: 1; background: #FFF"> -->
              <CubicBezier 
                style="border: 1px solid #333;" 
                size="300px" 
                :transitionTimingFunction="interactBezierStr" 
                backgroundColor="transparent" 
                :interact="true" 
                :canvasPadding="0.1"
                :bezierStyle="{
                  bezierLine: {
                    strokeStyle: '#333',
                  },
                }"
                :polylineBezier="true"
                :polylineCount="5"  
                @newBezier="newBezierFunc"
              />
            <!-- </div> -->
          </div>
        </div>
      </div>

      <!-- <div>运动曲线预览</div>
      <div class="dialog-graph_detail">
      </div> -->
      <el-button @click="addKeyData">添加</el-button>

      <el-button @click="getAnimationCmds(arr, armModelStore, bleStore, mainStore)">测试关键帧</el-button>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="visible = false">
          确定
        </el-button>
      </div>
    </template>
  <!-- </section> -->
  </el-dialog>
</template>
<script setup>
  import CubicBezier from "./CubicBezier/index.vue";
  import { nextTick, ref, onMounted, reactive } from "vue";
  import { getCmdSeries } from "../utils/BezierCurve.js"
  import Track from "./CubicBezier/track.vue";
  import { runKeyframeAnimation, getAnimationCmds } from "@/utils/keyframe/index.js";
  import { useArmModelStore } from '@/stores/armModel.js';
  import { useMainStore } from '@/stores/index.js';
  import { useBleStore } from '@/stores/ble.js';

  const armModelStore = useArmModelStore();
  const mainStore = useMainStore();
  const bleStore = useBleStore();


  // runKeyframeAnimation([
  //   { time: 0,
  //     motorId: 21,
  //     location: 180,
  //     speed: 2, 
  //   },
  //   { time: 1000, 
  //     motorId: 21,
  //     location: 180, 
  //     speed: 2,
  //   },
  //   { time: 2000,
  //     motorId: 21,
  //     location: 180, 
  //     speed: 2, 
  //   }
  // ]);
  let arr = reactive([
        {
          time: 0,
          motorId: 22,
          location: 0,
          timingFunction: 'linear'
        },
        {
          time: 1000,
          motorId: 22,
          location: 180,
          timingFunction: '0.9, 0.13, 0.88, 0.28'
        },
        {
          time: 2000,
          motorId: 22,
          location: 210,
          timingFunction: '0.9, 0.13, 0.88, 0.28'
        }
      ]);
  onMounted(() => {
    // nextTick(() => {
      // getAnimationCmds(arr, armModelStore);
      // debugger;
    // });
  });
  
  // const props = defineProps({
  //   visible: {
  //     type: Boolean,
  //     default: false,
  //   },
  // });
  // const visible = defineModel(visible, {
  //   event: 'update:visible',
  // })
  const [visible, visibleModifiers] = defineModel('visible');
  console.log('visible', visible, visibleModifiers);

  let startTime = ref();
  let endTime = ref();

  let rotateDeg = ref(0);


  let interactBezierStr = ref("0.9, 0.13, 0.88, 0.28"); //ease-in

  function setInteractBezierStr(str) {
    interactBezierStr.value = str;
    console.log('setInteractBezierStr', setInteractBezierStr.value);
  }

  function handleClose() {
    console.log('handleClose');
    visible.value = false;
  }


  const refBezierExample = ref(null);

  let currentBezier = ref("ease-in");

  //问题:  transitionTimingFunction不生效
  function newBezierFunc(bezierStr) {
    // bezierStr;
    // debugger;
    // refBezierExample.value.style = `transition: all 0s linear; transform: translate(0, 0);`;
    console.log('newBezierFunc', bezierStr);
    // setInteractBezierStr(`${bezierStr.p1[0]}, ${bezierStr.p1[1]}, ${bezierStr.p2[0]}, ${bezierStr.p2[1]}`);
    currentBezier.value = bezierStr;
    // setTimeout(() => {
    //   refBezierExample.value.style = `transition: all 1s; transitionTimingFunction: ${bezierStr}; transform: translate(480px, 0); `;
      
    //   console.log( `transition: all 1s; transitionTimingFunction: ${bezierStr}; transform: translate(480px, 0); `)
    //   // debugger;
    // }, 0.5 * 1000);
  }


  let keyData = ref([]);
  function generatorKeyData() {
    return {
      timeSpan: [startTime.value, endTime.value],
      bezier: currentBezier.value,
      motorId: 32,
    }
  }

  function addKeyData() {
    keyData.value.push(generatorKeyData());
    execKeyData();
  }

  function execKeyData() {
    console.log('execKeyData', keyData.value);

    keyData.value.forEach((item, index) => {
      setTimeout(() => {
        let data = {
          cubicBezier: item.bezier,
          // rotateDeg: rotateDeg.value,
          // cubicBezier: { p1: [0.9, 0.13], p2: [0.88, 0.28]},
          rotateDeg: 180,
          duration: (parseInt(endTime.value) - parseInt(startTime.value) ),
          motorId: item.motorId,
          // sendBleMsg: rotateMotor,
          sendBleMsg: (params)=> {
            // console.log('sendBleMsg', params);
          },
          baseRotate: 0, // 从某个角度开始
        };

        console.log('data', data);

        getCmdSeries(data);

      }, parseInt(startTime.value) * 1000);
      

   
      // getCmdSeries({
      //   // cubicBezier: item.bezier, 
      //   cubicBezier: {
      //     p1: {x: 130.8, y: 270},
      //     p2: {x: 270, y: 30}
      //   },
      //   // rotateDeg: rotateDeg.value,
      //   rotateDeg: 180,
      //   duration: parseInt(startTime.value),
      //   motorId: item.motorId,
      //   // sendBleMsg: rotateMotor,
      //   sendBleMsg: (params)=> {
      //     console.log('sendBleMsg', params);
      //   },
      //   baseRotate: 0, // 从某个角度开始
      // });

      // getCmdSeries({
      //   // cubicBezier: {p1: [.17,.67], p2: [.83,.67]},
      //   cubicBezier: item.bezier,
      //   rotateDeg: 360,
      //   duration: 3,
      //   motorId: 23,
      //   sendBleMsg: (params)=> {
      //     console.log('sendBleMsg', params);
      //   },
      //   baseRotate: 0, // 从某个角度开始
      // });




    });


  }
  let currJoint = ref('');
  const jointList = [
    {
      value: '21',
      label: '关节1',
    },
    {
      value: '22',
      label: '关节2',
    },
    {
      value: '23',
      label: '关节3',
    },
    {
      value: '24',
      label: '关节4',
    },
    {
      value: '25',
      label: '关节5',
    },
  ];

  let actionKeyFrames = reactive({
    joint1: {
      id: "21",
      keyframes: [
        {
          time: 0,
          motorId: 21,
          location: 0,
          timingFunction: 'linear'
        },
        {
          time: 1000,
          motorId: 21,
          location: 180,
          timingFunction: '0.9, 0.13, 0.88, 0.28'
        },
        {
          time: 2000,
          motorId: 21,
          location: 210,
          timingFunction: '0.9, 0.13, 0.88, 0.28'
        }
      ]
    },
    joint2: {
      id: "22",
      keyframes: [
        {
          time: 0,
          motorId: 22,
          location: 0,
          timingFunction: 'linear'
        },
        {
          time: 1000,
          motorId: 22,
          location: 180,
          timingFunction: '0.9, 0.13, 0.88, 0.28'
        },
        {
          time: 2000,
          motorId: 22,
          location: 210,
          timingFunction: '0.9, 0.13, 0.88, 0.28'
        }
      ]
    }
  });

</script>
<style scoped>
  .dialog {
    position: absolute;
    left: 50%;
    top: 50%;
    box-sizing: border-box;
    padding: 10px;
    transform: translate(-50%, -60%);
    z-index: 10;
    width: 800px;
    height: 500px;
    border: 1px solid #333;
    background: #222;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .dialog-graph_detail {
    width: 100%;
    height: 50px;
    background: cyan;
  }

  .dialog-footer {
    /* height: 30px; */
    display: flex;
    align-items: center;
    justify-content: center;
    background: orange;
  }

  .cubic-ctrl-container {
    background-image: url("../assets/y-so-serious-white.png");
  }

  .bezier-example {
    position:relative;
    width: 100%;
    height: 50px;
    border: 1px solid #333;
    background: #FFF;
  }

  .bezier-example div {
    position: absolute;
    left: 0;
    top: 0;
    width: 50px;
    height: 50px;
    border-radius: 50% 50%;
    border: 1px solid blue;
  }
</style>
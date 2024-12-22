<template>
  <el-dialog
    v-model="visible"
    title="设计一个动作"
    width="800"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="dialog-header">
      <h3>设计一个动作</h3>
    </div>
    <div class="dialog-body">
      
      <div style="display:flex; flex-direction: row;border: 1px solid #444">
        <div style="width: 30%">
          <div>电机id: 32</div>
          <div>当前状态: </div>
          <div>时间: </div>
        </div>
        
        <div style="flex: 1">
          <div>贝塞尔曲线</div>
          <div class="bezier-example">
            <div ref="refBezierExample">1</div>
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
                  }
                }" 
                @newBezier="newBezierFunc"
              />
            <!-- </div> -->
          </div>
        </div>
      </div>

      
      

      <!-- <div>运动曲线预览</div>
      <div class="dialog-graph_detail">


      </div> -->
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
  import { nextTick, ref } from "vue";

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

  // function update() {
  //   model.value++
  // }

  // let visible = computed(() => {
  //   get() {

  //   }, 
  //   set() {

  //   }
  // })

  let interactBezierStr = ref("ease-in");

  function setInteractBezierStr(str) {
    interactBezierStr.value = str;
    console.log('setInteractBezierStr', setInteractBezierStr.value);
  }

  function handleClose() {
    console.log('handleClose');
    visible.value = false;
  }


  const refBezierExample = ref(null);

  //问题:  transitionTimingFunction不生效
  function newBezierFunc(bezierStr) {
    // bezierStr;
    // debugger;
    refBezierExample.value.style = `transition: all 0s linear; transform: translate(0, 0);`;
    console.log('newBezierFunc', bezierStr);
    setTimeout(() => {
      refBezierExample.value.style = `transition: all 1s; transitionTimingFunction: ${bezierStr}; transform: translate(480px, 0); `;
      
      console.log( `transition: all 1s; transitionTimingFunction: ${bezierStr}; transform: translate(480px, 0); `)
      // debugger;
    }, 0.5 * 1000);
  }

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
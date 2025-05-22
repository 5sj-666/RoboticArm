<template>
  <canvas 
    ref="refTrace" 
    width="600" 
    height="50"
    style="border: 2px solid green"
  ></canvas>
</template>
<script setup>

  import { nextTick, onMounted, ref, watch } from "vue";
  import { getCubicCoordsState, bezierCurve } from "../../utils/BezierCurve";
  
  const props = defineProps({
    bezier: {
      type: String || Array,
      default: () => {
        return '.25,.1,.25,1'
      }
    },
  });

  
  const predefine = {
    'ease': '.25,.1,.25,1',
    'linear': '0,0,1,1',
    'ease-in': '.42,0,1,1',
    'ease-out': '0,0,.58,1',
    'ease-in-out':'.42,0,.58,1'
  }

  let refTrace = ref(null);


  // let ctx = refTrace.value.getContext("2d");
  let ctx;

  watch(() => props.bezier, () => {
    nextTick(() => {
      if(ctx) {
        console.log("watch  props.bezier: ", props.bezier);
        paintTrack(ctx, props.bezier, props.count);
      }
     
    });

  }, true)

  onMounted(() => {
    console.log('refTrace', refTrace);
    ctx = refTrace.value.getContext("2d");
   
    // paintTrack(ctx, [[0.9, 0.13], [0.88, 0.28]]);
    // props.bezier;
    // debugger;
    paintTrack(ctx, props.bezier, props.count);
  });

  /**
   * @param ctx 
   * @param bezier 字符串或者数组 "ease-in", '.25,.1,.25,1', ([0.9, 0.13], [0.88, 0.28])
   * @param count 
   */
  function paintTrack(ctx, bezier="ease-in") {
    console.warn("paintTrack bezier: ", bezier);
    if(typeof bezier === "string") {
      let arr = (predefine[bezier] || bezier).split(",");
      console.log(arr);
      bezier = [[arr[0], arr[1]], [arr[2], arr[3]]];
    }

    // console.warn("paintTrack bezier: ", bezier);

    // bezier;
    // debugger;

    // console.log("---paintTrack: ", bezier);

    let start;
    let done = false;
    let span = 0;

    let renderArcs = []; // 记录下来要渲染的圆的x坐标

    function draw(timestamp) {
      if (start === undefined) {
        start = timestamp;
      }
      
      const elapsed = timestamp - start;

      if(!span) {
        span = elapsed;
        console.log(span);
      }

      if (elapsed <= 3000) {
        ctx.clearRect(0, 0, 600, 50);
        let t = elapsed / 3000;

        // let point = bezierCurve([0.9, 0.13], [0.88, 0.28], t);
        let point =  bezierCurve(bezier[0], bezier[1], t);


        // console.log(point, "---", elapsed, "---", elapsed / 1000, "---x: ", 575 * point[1] + 12.5);

        drawArc(575 * point[1]  + 25, 25, "rgba(167, 67, 238, 1)");

        renderArcs.forEach((item) => {
          drawArc(item, 25);
        });

        if(elapsed % 50 < 7) {
          // if(1 - point[1] < 0.05 ) {
          //   console.log("最后一个", 1 - point[1])
          //   renderArcs.push(575 * 1);
          // }else {
            renderArcs.push(575 * point[1]  + 25);
          // }
          
        }

        requestAnimationFrame(draw);
      }else {
        requestAnimationFrame(() => {
          ctx.clearRect(0, 0, 600, 50);
          renderArcs.forEach((item) => {
            drawArc(item, 25);
          });
        })
      }

    }

    window.requestAnimationFrame(draw);

    function drawArc(x, y, rgba = "rgba(167, 67, 238, 0.3)") {
      ctx.beginPath();
      ctx.fillStyle = rgba;
      // ctx.arc(x, 25, 25, 0, Math.PI * 2, true);
      ctx.fillRect(x, 0, 1, 50);
      ctx.fill();
    }

  }


</script>
<style scoped>

</style>
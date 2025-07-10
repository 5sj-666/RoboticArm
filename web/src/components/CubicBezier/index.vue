<template>
  <div class="container">
    <canvas 
      :width="size" 
      :height="size" 
      ref="refCubicBezier"
      style="background: transparent"
    >
    </canvas> 
  </div>
</template>
<script setup>
  import { nextTick, onMounted, ref, watch, watchEffect } from 'vue';
  
  import _ from "lodash";

  const props = defineProps({
    timingFunction: {
      type: String,
      default: ".2,.8,.8,.26"
    },
    size: {
      type: String,
      default: "300px"
    },
    backgroundColor: {
      type: [String, Array],
      default: ["#ccc", "#fff"]
    },
    interact: { // 是否需要交互
      type: Boolean,
      default: false
    },
    canvasPadding: {
      type: Number,
      default: 0
    },
    bezierStyle: {
      type: Object,
      default: () => {
        return {
          padding: {},
        }
      }
    },
    // 采样贝塞尔曲线，并绘制出来
    polylineBezier: { 
      type: Boolean,
      default: false
    },
    polylineCount: { // 采样点数量 >= 2
      type: Number,
      default: 10
    }
   
  });

  function update(timingFunction) {
    cubic.update(timingFunction);
  }

  // 暴露给父组件
  defineExpose({
    update
  })

  const emits = defineEmits(['newBezier', 'update:timingFunction']);

  let cubic;

  const refCubicBezier = ref(null);

      
  // const predefine = {
  //   'ease': '.25,.1,.25,1',
  //   'linear': '0,0,1,1',
  //   'ease-in': '.42,0,1,1',
  //   'ease-out': '0,0,.58,1',
  //   'ease-in-out':'.42,0,.58,1'
  // }
  const predefine = {
    'ease': '0.25,0.10,0.25,1.00',
    'linear': '0.00,0.00,1.00,1.00',
    'ease-in': '0.42,0.00,1.00,1.00',
    'ease-out': '0.00,0.00,0.58,1.00',
    'ease-in-out':'0.42,0.00,0.58,1.00'
  }
  
  

  function getBezierStr(timingFunction) {

    if(Reflect.has(predefine, timingFunction)) {
      timingFunction = predefine[timingFunction];
    }

    return timingFunction;
  }



  onMounted(() => {
    nextTick(() => {
      props.timingFunction;
      // console.log('props.timingFunction: ', props.timingFunction); 

      cubic = new CubicBezier({
        cubicBezierStr: getBezierStr(props.timingFunction), 
        dom: refCubicBezier.value, 
        backgroundColor: props.backgroundColor,
        interact: props.interact,
        padding: props.canvasPadding,
        // polylineBezier: props.polylineBezier,
        // polylineCount: props.polylineCount,
      })
      // console.log(cubic);
    })
    
  })

  class CubicBezier {
    cubicBezierStr = ".2, .8 , .8, .26";
    refCanvas;
    ctx;
    points = {
      start: {x: 0, y: 0},
      cp1: {x: 0, y: 0},
      cp2: {x: 1, y: 1},
      end: {x: 1, y: 1},
    };
    style = {
      start: { 
        radius: 0.03,
        strokeStyle: '#666',
        lineWidth: 2,
        fillStyle: '#FFF',
      },
      cp1: {
        radius: 0.03,
        strokeStyle: 'white',
        lineWidth: 2,
        fillStyle: '#f08'
      },
      cp2: {
        radius: 0.03,
        strokeStyle: 'white',
        lineWidth: 2,
        fillStyle: '#0ab'
      },
      end: {
        radius: 0.03,
        strokeStyle: '#666',
        lineWidth: 2,
        fillStyle: '#FFF'
      },
      backgroundColor: [],
      bezierLine: {
        strokeStyle: '#333',
        lineWidth: 0.03,
        // fillStyle: 'rgba(200,200,200,0.8)'
      },
      reference: {
        strokeStyle: 'rgba(200,200,200,0.5)',
      },
      padding: {
        x: 0,
        y: 0,
      },
      canvas: {

      }
    }
    activeStyle ={};
    ratio = 100;
    // 偏移量 待完成
    // delta = {x: 0, y: 0}; 
    
    action = {
      able: true,
      currPoint: null, // cp1, cp2
      dragAble: false, // 目前可拖动状态
    }

    // constructor({cubicBezierStr, canvasId="#refCubicBezier"}) {
    constructor({cubicBezierStr, dom, backgroundColor, interact = false, padding = 0}) {
      this.action.able = interact;
      this.cubicBezierStr = cubicBezierStr;
 
      this.refCanvas = dom;

      // this.style = {...this.style, ...props.bezierStyle};
      this.style = _.merge({}, this.style, props.bezierStyle);

      // debugger;
      this.ctx = this.refCanvas.getContext('2d');

      let { width, height } = this.refCanvas.getBoundingClientRect();

      // debugger;

      // 设置百分十的内边距
      this.style.padding.x = width * padding;
      this.style.padding.y = height * padding;


      // 如果有内边距得话，减去内边距得值
      this.ratio = Math.floor(Math.min(width - this.style.padding.x * 2 || 0, height - this.style.padding.y * 2 || 0));

      this.points = this.getCtrlPoint(this.cubicBezierStr, this.ratio);

      this.calcBezierStr();

      // this.backgroundColor = (backgroundColor + "" ).split(",");
      if(typeof backgroundColor === "string") {
        this.backgroundColor = [backgroundColor];
        // debugger;
      }else {
        this.backgroundColor = backgroundColor;
      }
      

      this.drawBg(10, this.backgroundColor);

      // this.drawCoord();


      // 需要交互
      if(interact) {
        this.refCanvas.addEventListener('mousedown', this.mousedownFunc.bind(this));
        this.refCanvas.addEventListener('mousemove', this.mouseMoveFunc.bind(this));
        this.refCanvas.addEventListener('mouseup', this.mouseupFunc.bind(this));
        // this.refCanvas.addEventListener('mouseleave', this.mouseleaveFunc.bind(this));
        this.drawLinearReference();
      }else {
        this.refCanvas.style["border-radius"] = "5%";
        // this.style.bezierLine.strokeStyle = "#fff";
        // this.ctx.scale(0.5, 0.5)
      }

      this.draw();
    }

     /**
     * @description 贝塞尔曲线的字符串一般是0-1范围内，但画布可能是几百px，所以要根据倍率放大
     * @param arr 
     * @param ratio 
     */
    getCtrlPoint(arr, ratio = 1) {
      // 正常情况下， 起点[0,0]，终点[1, 1]
      let points = {
        start: {x: 0, y: 0},
        cp1: {x: 0, y: 0},
        cp2: {x: 0, y: 0},
        end: {x: 1, y: 1}
      }

      if(typeof arr === "string") {
        arr = (arr + "").split(",");
        // console.log(arr);
      }

      if(Array.isArray(arr) && arr.length >= 4) {
        points.cp1 = {x: arr[0], y: arr[1]};
        points.cp2 = {x: arr[2], y: arr[3]};
      }
      
      let maxY =  ratio;
      for(let key in points) {
        // console.log(points[key])
        points[key].x = points[key].x * ratio + this.style.padding.x;
        // 画布的左上角是[0,0]。 展示给用户看的是左下角是[0,0]。在此做处理
        points[key].y = maxY - points[key].y * ratio + this.style.padding.y;
        // console.log('--resolved: ', points[key])
      }

      return points;

    };

    drawBg(stripCount = 10, colorArr=[]) {
      let {width, height} = this.refCanvas.getBoundingClientRect();
      // console.log(width, height);
      // 暂时解决在size = 55时候，纯背景会有斑马线
      if(colorArr.length === 1) {
        this.ctx.fillStyle = colorArr[0] || "#fff";
        this.ctx.fillRect( 0, 0, width, height);
        this.ctx.closePath();
        return ;
      }
      // 在size = 55时候，纯背景会有斑马线（原因可能是height/ 10得出的值问题），待修复
      for(let i = 0;  i < stripCount; i++) {
        this.ctx.beginPath();
        // this.ctx.fillStyle = i % 2 === 0 ? "#f0f0f0" : "#FFF";
        this.ctx.fillStyle = colorArr[i % colorArr.length] || "#fff";
        this.ctx.fillRect( 0, height / 10 * i, width, height / 10);
        this.ctx.closePath();
      }

    }

    /**
     * @description 画出x、y轴
     */
    drawCoord() {
      let ctx = this.ctx;
      let { width, height } = this.refCanvas.getBoundingClientRect();

      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000";
      ctx.moveTo(this.points.start.x, this.points.start.y);
      ctx.lineTo(this.points.start.x, 1 - height);
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.moveTo(this.points.start.x, this.points.start.y);
      ctx.lineTo(width, this.points.start.y);
      ctx.stroke();
      ctx.closePath();
    }

    drawLinearReference() {
      let ctx = this.ctx;
      ctx.lineWidth = 0.02 * this.ratio;
      ctx.strokeStyle = this.style.reference.strokeStyle || "#aaa";
      // console.warn("--ctx.strokeStyle:", ctx.strokeStyle, this);
      ctx.beginPath();
      ctx.moveTo(this.points.start.x, this.points.start.y);
      ctx.lineTo(this.points.end.x, this.points.end.y);
      ctx.stroke();
      ctx.closePath();
    }

    /**
     * @description 绘制出控制点
     * 
     */
    draw() {
      let ctx = this.ctx;
      let {start, cp1, cp2, end} = this.points;

      // 贝塞尔曲线
      ctx.beginPath();
      ctx.strokeStyle = this.style.bezierLine.strokeStyle || "#000";
      ctx.lineWidth = this.style.bezierLine.lineWidth * this.ratio || 5;
      // console.log('--this.style.bezierLine.strokeWidthL:', this.style.bezierLine.lineWidth);
      // debugger;
      ctx.moveTo(start.x, start.y);
      // 贝塞尔曲线绘制
      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
      ctx.stroke();
      
      if(this.action.able) {
        
        // 控制点连接线
        ctx.beginPath();
        ctx.strokeStyle = "#6a6a6a"
        ctx.lineWidth = 2;
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(cp1.x, cp1.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = "#6a6a6a"
        ctx.lineWidth = 2;
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(cp2.x, cp2.y);
        ctx.stroke();

     
      }

      // 起点终点
      drawArc({point: start, ...this.style.start}, this.ratio)
      drawArc({point: end, ...this.style.end}, this.ratio)

      if(this.action.able) {
        // 控制点
        drawArc({point: cp1, ...this.style.cp1}, this.ratio)
        drawArc({point: cp2, ...this.style.cp2}, this.ratio)
      }

      if(props.polylineBezier) {
        this.bezierToPolyline(ctx, [start.x, start.y],[cp1.x, cp1.y], [cp2.x, cp2.y],[end.x, end.y], props.polylineCount);
      }

      // drawArc({point: {x: 150, y: 150}, fillStyle: 'yellow', strokeStyle: 'black', lineWidth: 5})

      function drawArc({point, radius = 10, fillStyle, strokeStyle, lineWidth = 1}, ratio = 1) {
        if(!point || (!point.x && point.x !== 0) || (!point.y && point.y !== 0)) {
          debugger;
          return ;
        }
        if(fillStyle) {
          ctx.fillStyle = fillStyle;
        }
        if(strokeStyle) {
          ctx.lineWidth = lineWidth,
          ctx.strokeStyle = strokeStyle;
        }
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius * ratio, 0, 2 * Math.PI); 
        
        ctx.fill();   
        ctx.stroke();
        ctx.restore();
      }

    }

    update(bezierStr = "") {
      if(bezierStr) {
        this.cubicBezierStr = bezierStr;
        let formateTimingFunction = getBezierStr(bezierStr);
        this.points = this.getCtrlPoint(formateTimingFunction, this.ratio);
      }

      // 直接通过更新的控制点，重新渲染
      this.ctx.clearRect(0, 0, this.refCanvas.width, this.refCanvas.height);
      this.drawBg(10, this.backgroundColor);
      if(this.action.able) {
        this.drawLinearReference();
      }
      
      this.draw();
    }

    mousedownFunc(e) {
      // console.log('--mouseDownFunc', e);
      let {cp1, cp2} = this.points;

      let canvasOriginCoord = {
        x: this.refCanvas.getBoundingClientRect().left,
        y: this.refCanvas.getBoundingClientRect().top
      }

      let clickPoint = {
        x: e.clientX,
        y: e.clientY
      }

      let canvasClickPoint = {
        x: clickPoint.x - canvasOriginCoord.x,
        y: clickPoint.y - canvasOriginCoord.y
      }

      if(Math.abs(canvasClickPoint.x - cp1.x) < 10 && Math.abs(canvasClickPoint.y - cp1.y) < 10) {
        // console.log('cp1')
        this.action.currPoint = 'cp1';
        this.style.cp1.strokeStyle = "yellow";
      } else if(Math.abs(canvasClickPoint.x - cp2.x) < 10 && Math.abs(canvasClickPoint.y - cp2.y) < 10) {
        // console.log('cp2')
        this.action.currPoint = 'cp2';
        this.style.cp2.strokeStyle = "yellow";
      }
      this.action.dragAble = true;

      this.update();
    }

    mouseMoveFunc(e) {
      
      if(this.action.dragAble) {
        // console.log('mouseMoveFunc', e);
        if(this.action.currPoint) {
          let canvasOriginCoord = {
            x: this.refCanvas.getBoundingClientRect().left,
            y: this.refCanvas.getBoundingClientRect().top
          }
          let deltaX = e.clientX - canvasOriginCoord.x;
          let deltaY = e.clientY - canvasOriginCoord.y;
          this.points[this.action.currPoint] = {
            // x: limitVal(deltaX, this.ratio),
            // y: limitVal(deltaY, this.ratio),
            x: deltaX,
            y: deltaY,
          }
        }
        this.update();
      }

      /**
       * @description 限制数值在0-1之间
       * @param num 
       */
      function limitVal(num, ratio) {
        if(num <= 0) {
          return 0;
        } else if(num >= 1 * ratio) {
          return 1;
        }
        return num;
      }
      
    }

    mouseupFunc(e) {
      // console.log('mouseupFunc', e)

      this.action.dragAble = false;
      this.action.currPoint = null;
      this.style.cp1.strokeStyle = "white";
      this.style.cp2.strokeStyle = "white";
      this.update();
      this.calcBezierStr();
    }

    mouseleaveFunc(e) {
      // console.log('mouseleaveFunc', e);

      this.action.dragAble = false;
      this.action.currPoint = null;
      this.style.cp1.strokeStyle = "white";
      this.style.cp2.strokeStyle = "white";
      this.update();
      this.calcBezierStr();
    }

    calcBezierStr() {
      let {cp1, cp2} = this.points;

      let str = `${toFix((cp1.x - this.style.padding.x) / this.ratio)},${toFix(1 - (cp1.y - this.style.padding.y)  / this.ratio)},${toFix((cp2.x - this.style.padding.x)  / this.ratio)},${toFix(1 - (cp2.y - this.style.padding.y)  / this.ratio)}`;
      // this.refCanvas.style["transition-timing-function"] = str;
      // console.log("---transition-timing-function: ", str);

      // emits('newBezier', `cubic-bezier(${str})`);
      // emits('newBezier', {p1: [toFix(cp1.x / this.ratio), toFix(1 - cp1.y  / this.ratio)], p2: [toFix(cp2.x  / this.ratio), toFix(1 - cp2.y  / this.ratio)]});
      let bezierPresets = "";
      for(let key in predefine) {
        if(predefine[key] === str) {
          bezierPresets = key;
          break;
        }
      }

      emits('update:timingFunction', bezierPresets || str);

      // return `cubic-bezier(${str})`;

      function toFix(num) {
        return num.toFixed(2);
      }
    }

    // 采样贝塞尔曲线上的等分点并用直线连接
  bezierToPolyline(ctx, start, p1, p2, end, splitCount) {
    if(splitCount < 2) {
      splitCount = 2;
    }
    
    let prePoint = [start[0], start[1]];

    for (let i = 0; i <= splitCount; i++) {
      let t = i / splitCount;
      let coordinate = getBezierCurvePoints(start, p1, p2, end, t);
      drawPoint(coordinate[0],coordinate[1], ctx);
      linkWithLine(prePoint, coordinate, ctx);
      prePoint = coordinate;
    }

    /**
     * @description 计算贝塞尔曲线上的点
     * @param start 
     * @param p1 
     * @param p2 
     * @param end 
     * @param t 
     */
    function getBezierCurvePoints(start, p1, p2, end, t) {
      // 定义起始点和结束点
      var p0 = start;
      var p3 = end;

      // 计算贝塞尔曲线上的点
      var x = (1 - t) * (1 - t) * (1 - t) * p0[0] + 3 * (1 - t) * (1 - t) * t * p1[0] + 3 * (1 - t) * t * t * p2[0] + t * t * t * p3[0];
      var y = (1 - t) * (1 - t) * (1 - t) * p0[1] + 3 * (1 - t) * (1 - t) * t * p1[1] + 3 * (1 - t) * t * t * p2[1] + t * t * t * p3[1];

      // 返回坐标结果
      return [x, y];
    }

    //  绘制背景为红色的圆
    function drawPoint(x, y, ctx) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
      ctx.closePath();
    }

    function linkWithLine(prePoint, coordinate, ctx) {
      ctx.beginPath();
      ctx.moveTo(prePoint[0], prePoint[1]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "yellow"
      ctx.lineTo(coordinate[0], coordinate[1]);
      ctx.stroke();
      ctx.closePath();
    }

  }

  }


</script>
<style scoped>
  .container {
    flex: 0;
  }
  #cubicBezier {
    /* background: #333; */
  }
</style>
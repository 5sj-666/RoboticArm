export function bezierCurve(p1, p2, t) {
  // 定义起始点和结束点
  var p0 = [0, 0];
  var p3 = [1, 1];

  // 计算贝塞尔曲线上的点
  var x = (1 - t) * (1 - t) * (1 - t) * p0[0] + 3 * (1 - t) * (1 - t) * t * p1[0] + 3 * (1 - t) * t * t * p2[0] + t * t * t * p3[0];
  var y = (1 - t) * (1 - t) * (1 - t) * p0[1] + 3 * (1 - t) * (1 - t) * t * p1[1] + 3 * (1 - t) * t * t * p2[1] + t * t * t * p3[1];

  // 返回坐标结果
  return [x, y];
}

/**
 * @description: 获取贝塞尔曲线的状态数据列表
 * @param { Array<number> } p1 e.g: [0, 0]
 * @param { Array<number> } p2 e.g: [1, 1]
 * @param { number } count 坐标点的个数
 * @returns { Array<object> } e.g: [{speed: 0.5, rotate: 0.5, duration: 0.5}]
 */
export function getCubicCoordsState(p1, p2, count) {
  let preCoord = [0, 0];
  let cubicCoordData = [];

  for (let i = 1; i <= count; i++) {
    let t = i / count;
    let coordinate = bezierCurve(p1, p2, t);

    // drawPoint(coordinate[0] * 500, (1 - coordinate[1]) * 500, ctx);

    cubicCoordData.push({
      speed: (coordinate[1] - preCoord[1]) / (coordinate[0] - preCoord[0]),
      process: coordinate[1],
      duration: preCoord[0],
    });

    preCoord = coordinate;
  }

  return cubicCoordData;
}

/**
 * @description 获取一个贝塞尔曲线区间的指令列表，包含 旋转角度，延迟时间，速度
 * @param { object {p1: Array<number>, p2: Array<number>} } cubicBezier
 * @param { number } rotateDeg
 * @param { number } deration
 * @param { motorId } debugger
 * @param { function } sendBleMsg
 */
// export function getCmdSeries(cubicBezier = {p1: [.9,.13], p2: [.88,.28]}, rotateDeg, duration, motorId = 21, sendBleMsg) {
export function getCmdSeries({
    cubicBezier= { p1: [0.9, 0.13], p2: [0.88, 0.28]},
    rotateDeg,
    duration,
    motorId,
    sendBleMsg,
    baseRotate = 0, // 从某个角度开始
  }) {

  let cubicCoordData = getCubicCoordsState(cubicBezier.p1, cubicBezier.p2, 10);
  let avgSpeed = rotateDeg / 360 / duration * 1000;
  console.warn("--cubicCoordData: ", cubicCoordData, '--avgSpeed: ', avgSpeed);
  

  cubicCoordData.forEach((item, index) => {
    let nextItem = cubicCoordData[index + 1] || {duration: 1};
    let speed = item.speed * avgSpeed;
    let time = nextItem.duration * duration;
    let rotate = item.process * rotateDeg;

    setTimeout(() => {
      console.warn(JSON.stringify(`'---speed: ', ${speed}, '---duration: ', ${time}, '---rotate: ', ${rotate / 180 * Math.PI}`));
      // limit_spd = limit_spd * Math.PI / 180;
      sendBleMsg({ motorId: motorId, limit_spd: speed, loc_ref: baseRotate + rotate });
    }, time);

  });


  // debugger;


}


/**
 * @description: 计算贝塞尔曲线的一百个点，并渲染到canvas画布上。
 * @param { Array<number> } p1 e.g: [0, 0]
 * @param { Array<number> } p2 e.g: [1, 1]
 */
export function drawBezierCurve(p1, p2, splitCount = 10) {
  var canvas = document.getElementById("myCanvas");

  if (!canvas) {
    // 创建canvas元素
    canvas = document.createElement("canvas");
    canvas.id = "myCanvas";
    canvas.width = 500;
    canvas.height = 500;
    canvas.style.backgroundColor = "black";
    canvas.style.border = "1px solid #FFF";
    canvas.style.position = "absolute";
    canvas.style.left = "50px";
    canvas.style.top = "50px";

    let body = document.querySelector("body");
    body.appendChild(canvas);

  }

  var ctx = canvas.getContext("2d");

  drawGrid();

  // let splitCount = 3;

  // 假设现在机械臂要移动到10rad，时间要求是2s。 此时速度为5rad;
  let sumDistance = 10;
  let duration = 2;
  let avgSpeed = sumDistance / duration;

  let durationSpan = duration / splitCount;
  console.log('--durationSpan: ', durationSpan, '--sumDistance: ', sumDistance);

  let cubicRateArr = [];

  let preCoord = [0, 0];
  for (let i = 1; i <= splitCount; i++) {
    let t = i / splitCount;
    let coordinate = bezierCurve(p1, p2, t);

    drawPoint(coordinate[0] * 500, (1 - coordinate[1]) * 500, ctx);

    cubicRateArr.push({
      speed: (coordinate[1] - preCoord[1]) / (coordinate[0] - preCoord[0]),
      rotate: coordinate[1],
      duration: preCoord[0],// coordinate[0] -
    });

    preCoord = coordinate;
  }

  console.log('---cubicRateArr: ', cubicRateArr);

  cubicRateArr.forEach(item => {
    // 计算速度
    let speed = item.speed * avgSpeed;
    console.log('---speed: ', speed);

    // 计算时间
    let duration1 = item.duration * duration;
    console.log('---duration: ', duration1);

    // 计算旋转角度
    let rotate = item.rotate * sumDistance;
    console.log('---rotate: ', rotate);

    setTimeout(() => {

    }, item.duration * duration);
  });


  //  绘制背景为白色的圆
  function drawPoint(x, y, ctx) {
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
  }


  function drawGrid() {
    // 绘制网格
    ctx.strokeStyle = "white";
    ctx.lineWidth = 0.5;
    for (var i = 0; i <= 10; i++) {
      var x = i * (canvas.width / 10);
      var y = i * (canvas.height / 10);

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }
}
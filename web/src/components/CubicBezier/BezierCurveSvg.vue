<template>
  <svg viewBox="0 0 100 100" :width="width" :height="height" preserveAspectRatio="none">
    <path :d="bezierPath" stroke="blue" fill="none" stroke-width="2"/>
    <!-- <circle v-for="(p, i) in bezierPoints" :key="i" :cx="p.x" :cy="p.y" r="4" :fill="i === 0 || i === 3 ? 'red' : 'green'" />
    <line :x1="bezierPoints[0].x" :y1="bezierPoints[0].y" :x2="bezierPoints[1].x" :y2="bezierPoints[1].y" stroke="#aaa" stroke-dasharray="2" />
    <line :x1="bezierPoints[2].x" :y1="bezierPoints[2].y" :x2="bezierPoints[3].x" :y2="bezierPoints[3].y" stroke="#aaa" stroke-dasharray="2" /> -->
  </svg>
</template>
<script setup>
import { computed } from 'vue'

const props = defineProps({
  points: Array, // 优先使用points
  width: { type: Number, default: 300 },
  height: { type: Number, default: 200 },
  timingFunction: { type: String, default: 'linear' }
})


// 关键字转贝塞尔参数
const timingMap = {
  'linear':      [0.0, 0.0, 1.0, 1.0],
  'ease-in':     [0.42, 0, 1.0, 1.0],
  'ease-out':    [0.0, 0.0, 0.58, 1.0],
  'ease-in-out': [0.42, 0, 0.58, 1.0]
}

const bezierPoints = computed(() => {
  if (props.points && props.points.length === 4) return props.points
  // 自动生成贝塞尔点
  // const [w, h] = [props.width, props.height]
  const [w, h] = [100, 100]
  const [x0, y0, x3, y3] = [10, h - 10, w - 10, 10]
  const [x1, y1, x2, y2] = timingMap[props.timingFunction] 
    ? [
        x0 + (x3 - x0) * timingMap[props.timingFunction][0],
        y0 + (y3 - y0) * timingMap[props.timingFunction][1],
        x0 + (x3 - x0) * timingMap[props.timingFunction][2],
        y0 + (y3 - y0) * timingMap[props.timingFunction][3]
      ]
    : [x0, y0, x3, y3]
  return [
    { x: x0, y: y0 },
    { x: x1, y: y1 },
    { x: x2, y: y2 },
    { x: x3, y: y3 }
  ]
})

const bezierPath = computed(() => {
  const [p0, p1, p2, p3] = bezierPoints.value
  return `M ${p0.x},${p0.y} C ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`
})
</script>

<style scoped>
svg {
  background: #f8f8f8;
}
</style>


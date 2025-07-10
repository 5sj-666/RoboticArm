<template>
  <div class="action-list">
    <div>
      <span>动作列表</span> 
      <el-button size="small" type="primary" @click="emit('addAction')">新增动作</el-button>
    </div>
    <div class="action-card" v-for="(action, index) in motionStore.motionList" :key="index">
      <div class="action-item">
        <span>{{ action.name }}</span>
        <div>{{ action.description }}</div>
      </div>
      <div class="action-btns">
        <el-button size="small" @click="handlePrepare(action)">准备</el-button>
        <el-button size="small" type="primary" @click="handleRun(action)">运行</el-button>
      </div>
    </div>
    <!-- {{ motionStore }} -->
  </div>
</template>
<script setup>
import { useMotionStore } from '../stores/motions';
const motionStore = useMotionStore();

const emit = defineEmits(['addAction']);

function handlePrepare(action) {
  // 你的准备逻辑
  console.log('准备', action.name);
}
function handleRun(action) {
  // 你的运行逻辑
  console.log('运行', action.name);
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
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
  display: flex;
  align-items: center;
  padding: 12px 20px;
  transition: box-shadow 0.2s;
  cursor: pointer;
  justify-content: space-between;
}
.action-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0,0,0,0.10);
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
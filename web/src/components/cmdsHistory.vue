<template>
  <div class="monitor-box">
    <el-table-v2
      ref="tableRef"
      :columns="columns"
      :data="mainStore.cmdsHistory"
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
</template>
<script setup>
import { ref } from 'vue';
import { useMainStore } from '@/stores/index.js';

const mainStore = useMainStore();

const tableRef = ref(null);
const columns = ref([
  {
    key: 'type',
    title: '类型',
    dataKey: 'type',
    width: 50,
    // cellRenderer: ({ cellData }) => cellData === 'send' ? '发送' : '接收',
  },
  {
    key: 'parseStr',
    title: '',
    dataKey: 'parseStr',
    width: 420,
    align: 'center',
    // flexGrow: true
  },
  {
    key: 'status',
    title: '状态',
    dataKey: 'status',
    width: 50,
    align: 'center'
  },
  {
    key: 'time',
    title: '时间',
    dataKey: 'time',
    width: 100,
    align: 'center'
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

</script>
<style scoped></style>
<style>
.el-table-v2_row-error {
  background: var(--el-color-danger-light-5);
}
/* .el-table-v2_row-success {
  background: var(--el-color-success-light-5);
} */
</style>
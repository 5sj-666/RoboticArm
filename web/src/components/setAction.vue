<template>
  <el-dialog
    v-model="visible"
    title="设计一个动作"
    width="800"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="dialog-body set-action">
      <div style="margin-bottom: 10px; display: inline-block">
        <span>名称：</span>
        <el-input
          v-model="actionName"
          placeholder="请输入动作名称"
          style="width: 200px"
        />
      </div>
      <div style="margin-bottom: 10px;margin-left: 10px; display: inline-block">
        <span>描述：</span>
        <el-input
          v-model="actionDescription"
          placeholder="请输入动作描述"
          style="width: 200px"
        />
      </div>
      <br />
      <el-button
        type="primary"
        @click="
          dialogFormVisible = true;
          formType = 'add';
        "
      >
        新增关键帧
      </el-button>
      <el-table
        :data="tableData"
        :border="false"
        :preserve-expanded-content="true"
        row-key="motorId"
        :expand-row-keys="expandRowKeys"
        style="width: 100%"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div class="keyframe-row">
              <h3>关键帧：</h3>
              <el-table
                :data="props.row.keyframes"
                :border="false"
                class="keyframe-table"
              >
                <el-table-column label="时间" prop="time" />
                <el-table-column label="位置" prop="location" />
                <el-table-column label="过渡函数">
                  <template #default="scope">
                    <div style="display: flex; align-items: center">
                      <BezierCurveSvg
                        :timingFunction="scope.row.timingFunction"
                        :width="40"
                        :height="20"
                      />
                      &nbsp;&nbsp;
                      <span>{{ scope.row.timingFunction }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="right">
                  <template #default="scope">
                    <el-button
                      size="small"
                      @click="handleEdit(scope.$index, scope.row)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      @click="handleDelete(props.row, scope.$index, scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="关节名称" prop="jointName" />
        <el-table-column label="关节ID" prop="motorId" />
      </el-table>

      <!-- <BezierCurveSvg :timingFunction="'ease-in'" :width="40" :height="20" /> -->
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="save"> 保存 </el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog
    v-model="dialogFormVisible"
    :title="dialogFormTitle"
    width="500"
    destroy-on-close
  >
    <el-form :model="form">
      <el-form-item label="关节" :label-width="formLabelWidth">
        <el-select v-model="form.motorId" placeholder="选择关节">
          <el-option
            v-for="item in motionStore.jointList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="时间" :label-width="formLabelWidth">
        <el-input
          v-model="form.time"
          autocomplete="off"
          placeholder="请输入时间(毫秒)"
        />
      </el-form-item>
      <el-form-item label="位置" :label-width="formLabelWidth">
        <el-input
          v-model="form.location"
          autocomplete="off"
          placeholder="请输入位置(角度)"
        />
      </el-form-item>
      <el-form-item label="过渡函数" :label-width="formLabelWidth">
        <el-input
          v-model="form.timingFunction"
          autocomplete="off"
          placeholder="贝塞尔曲线"
          disabled
        />
        <div style="display: flex; flex-shrink: 0; margin-top: 10px">
          <div
            style="
              width: 55px;
              display: flex;
              flex-direction: column;
              justify-content: space-around;
              flex-shrink: 0;
              margin-right: 20px;
            "
          >
            <CubicBezier
              v-for="(item, index) in cubicExample"
              :key="index"
              size="55px"
              v-model:timingFunction="item.timingFunction"
              :backgroundColor="item.backgroundColor"
              @click="setInteractBezierStr(item.timingFunction)"
              :canvasPadding="0.1"
              :interact="false"
              style="border-radius: 5px"
            />
          </div>
          <CubicBezier
            ref="cubicBezierRef"
            size="250px"
            v-model:timingFunction="form.timingFunction"
            :canvasPadding="0.1"
            :interact="true"
            :polylineBezier="true"
            :polylineCount="20"
          />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmForm"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, unref, nextTick, onMounted } from "vue";
import BezierCurveSvg from "./CubicBezier/BezierCurveSvg.vue";
import CubicBezier from "./CubicBezier/index.vue";
import { useMotionStore } from "@/stores/motions"; 

const motionStore = useMotionStore();
console.log(motionStore);

const [visible, visibleModifiers] = defineModel("visible");
console.log("visible", visible, visibleModifiers);

function handleClose() {
  console.log("handleClose");
  visible.value = false;
}

// const jointList = [
//   {
//     value: "21",
//     label: "关节1",
//   },
//   {
//     value: "22",
//     label: "关节2",
//   },
//   {
//     value: "23",
//     label: "关节3",
//   },
//   {
//     value: "24",
//     label: "关节4",
//   },
//   {
//     value: "25",
//     label: "关节5",
//   },
//   {
//     value: "26",
//     label: "关节6",
//   },
// ];

// const cubicExample = {
//   "ease-in": [0.42, 0, 1, 1],
//   "ease-out": [0, 0, 0.58, 1],
//   "ease-in-out": [0.42, 0, 0.58, 1],
//   "linear": [0, 0, 1, 1],
// };
const cubicExample = reactive([
  {
    timingFunction: "ease-in",
    backgroundColor: "#0ab",
  },
  {
    timingFunction: "ease-out",
    backgroundColor: "#f08",
  },
  {
    timingFunction: "ease-in-out",
    backgroundColor: "rgb(248,250,253)",
  },
  {
    timingFunction: "linear",
    backgroundColor: "#0ab",
  },
]);

let actionName = ref("");
let actionDescription = ref("");

// const tableData = reactive([
//   {
//     jointName: "关节1",
//     motorId: "21",
//     keyframes: [
//       {
//         time: "1000",
//         location: "180",
//         timingFunction: "linear",
//         motorId: "21",
//       },
//     ],
//   },
//   {
//     jointName: "关节2",
//     motorId: "22",
//     keyframes: [
//       {
//         time: "0",
//         location: "180",
//         timingFunction: "ease-in",
//         motorId: "22",
//       },
//       {
//         time: "1000",
//         location: "180",
//         timingFunction: "ease-in-out",
//         motorId: "22",
//       },
//       {
//         time: "2000",
//         location: "180",
//         timingFunction: "linear",
//         motorId: "22",
//       },
//     ],
//   },
// ]);

  motionStore.initMotion();
const tableData = reactive(motionStore.currentMotion.joints);

// onMounted(() => {
//   motionStore.initMotion();
//   tableData.value = motionStore.currentMotion.joints;
// });




const expandRowKeys = ref([]);

// 初始化时全部展开
// expandRowKeys.value = tableData.map(item => item.motorId);

function handleEdit(index, row) {
  console.log("handleEdit", index, row);

  form.motorId = row.motorId;
  form.time = row.time;
  form.location = row.location;
  form.timingFunction = row.timingFunction;

  formType.value = "edit";
  dialogFormVisible.value = true;
}
function handleDelete(fooRow, index, row) {
  console.log("handleDelete", index, row);
  // debugger;
  // 删除当前行
  fooRow.keyframes.splice(index, 1);
  // 保证删除后依然展开
  if (!expandRowKeys.value.includes(fooRow.motorId)) {
    expandRowKeys.value.push(fooRow.motorId);
  }
}

const dialogFormVisible = ref(false);
const formLabelWidth = "140px";
let formType = ref("add"); // add or edit
const dialogFormTitle = computed(() =>
  formType.value === "add" ? "新增关键帧" : "编辑关键帧"
);

const form = reactive({
  motorId: "",
  time: "",
  location: "",
  timingFunction: "linear",
});

function confirmForm() {
  if (formType.value === "add") {
    tableData.forEach((joint) => {
      if (joint.motorId === form.motorId) {
        joint.keyframes.push(JSON.parse(JSON.stringify(unref(form))));
        // debugger;
        joint.keyframes.sort((a, b) => a.time - b.time);
      }
    });
  } else if (formType.value === "edit") {
    // 编辑时，找到对应的行
    tableData.forEach((joint) => {
      if (joint.motorId === form.motorId) {
        joint.keyframes.forEach((keyframe, index) => {
          if (keyframe.time === form.time) {
            // 更新当前行
            joint.keyframes[index] = JSON.parse(JSON.stringify(unref(form)));
            // debugger;
            joint.keyframes.sort((a, b) => a.time - b.time);
          }
        });
      }
    });
  }

  dialogFormVisible.value = false;
}

const cubicBezierRef = ref(null);

/**
 *
 * @param params <string | Object>
 */
function setInteractBezierStr(bezierStr) {
  // bezierStr;
  // debugger;
  form.timingFunction = bezierStr;
  cubicBezierRef.value.update(bezierStr);
}


function save() {
  visible.value = false;
  motionStore.addMotion({
    name: actionName.value,
    description: actionDescription,
    joints: JSON.parse(JSON.stringify(unref(tableData))),
  });

  // motion.motionList
  console.log(motionStore.motionList);
}
</script>

<style scoped>
.set-action {
  max-height: 600px;
  overflow: auto;
  /* padding: 20px; */
}

.keyframe-row {
  display: flex;
  /* align-items: center; */
  gap: 16px;
}
.keyframe-table {
  flex: 1;
}
</style>

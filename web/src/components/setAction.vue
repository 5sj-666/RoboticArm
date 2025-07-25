<template>
  <el-dialog
    v-model="visible"
    :title="actionId ? '编辑一个动作' :'设计一个动作'"
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
      <div v-if="actionId" style="margin-bottom: 10px; display: inline-block">
        <span>ID: </span>
        <el-input
          v-model="actionId"
          placeholder="请输入动作名称"
          style="width: 200px"
          disabled
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
                <el-table-column label="过渡函数" min-width="120">
                  <template #default="scope">
                    <div style="display: flex; align-items: center">
                      <BezierCurveSvg
                        :timing-function="scope.row.timingFunction"
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
        <el-table-column label="关节名称" prop="name" />
        <el-table-column label="关节ID" prop="motorId" />
      </el-table>

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
    <el-form :model="form" :rules="rules" ref="formRef">
      <el-form-item label="关节" prop="motorId" :label-width="formLabelWidth">
        <el-select v-model="form.motorId" placeholder="选择关节">
          <el-option
            v-for="item in motionStore.jointList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="时间" prop="time" :label-width="formLabelWidth">
        <el-input
          v-model.number="form.time"
          autocomplete="off"
          placeholder="请输入时间(毫秒)"
          type="number"
          @input="val => {
            // 最大值为一天
            if (val > 24 * 60 * 60 * 1000) form.time = 24 * 60 * 60 * 1000
            if (val < 0) form.time = 0
          }"
        >
        <template #suffix>
          <span v-show="form.time">ms</span>
        </template>
    </el-input>
      </el-form-item>
      <el-form-item label="位置" prop="location" :label-width="formLabelWidth">
        <el-input
          v-model.number="form.location"
          autocomplete="off"
          placeholder="请输入位置(角度 -180 ~ 180)"
          type="number"
          @input="val => {
            if (val > 180) form.location = 180
            if (val < -180) form.location = -180
          }"
        >
          <template #suffix>
            <span v-show="form.location">°</span>
          </template> 
        </el-input>
      </el-form-item>
      <el-form-item label="过渡函数" :label-width="formLabelWidth">
        <el-input
          v-model="form.timingFunction"
          autocomplete="off"
          placeholder="贝塞尔曲线"
          :formatter="value => predefine[value] ? predefine[value] : value"
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

const predefine = {
  '0.25,0.10,0.25,1.00': 'ease',
  '0.00,0.00,1.00,1.00': 'linear',
  '0.42,0.00,1.00,1.00': 'ease-in',
  '0.00,0.00,0.58,1.00': 'ease-out',
  '0.42,0.00,0.58,1.00': 'ease-in-out'
}

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
let actionId = ref("");
let actionDescription = ref("");


const tableData = ref({});

onMounted(() => {
  // motionStore.currentMotion;
  // debugger;
  
  actionId.value = motionStore.currentMotion.id || null;
  // debugger;
  if(!actionId.value) {
    motionStore.initMotion();
  }

  tableData.value = motionStore.currentMotion.joints;
  actionName.value = motionStore.currentMotion.name;
  actionDescription.value = motionStore.currentMotion.description;
});


const expandRowKeys = ref([]);

// 初始化时全部展开
// expandRowKeys.value = tableData.map(item => item.motorId);


/**
 * 编辑行
 * @param index 
 * @param row 
 */
function handleEdit(index, row) {
  console.log("handleEdit", index, row);

  form.motorId = row.motorId;
  form.time = row.time;
  form.location = row.location;
  form.timingFunction = row.timingFunction;

  formType.value = "edit";
  editIndex.value = index;
  dialogFormVisible.value = true;
}

/**
 * 删除行
 * @param fooRow 
 * @param index 
 * @param row 
 */
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
let editIndex = ref(-1);
const dialogFormTitle = computed(() =>
  formType.value === "add" ? "新增关键帧" : "编辑关键帧"
);

const form = reactive({
  motorId: "",
  time: "",
  location: "",
  timingFunction: "linear",
});

function initForm() {
  form.motorId = "";
  form.time = "";
  form.location = "";
  form.timingFunction = "0.00,0.00,1.00,1.00";
}

const formRef = ref(null);

const rules = {
  motorId: [
    { required: true, message: '请选择关节', trigger: 'change' }
  ],
  time: [
    { required: true, message: '请输入时间', trigger: 'change' },
    { type: 'number', min: 0, max: 86400000, message: '时间范围0~86400000', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请输入位置', trigger: 'change' },
    { type: 'number', min: -180, max: 180, message: '位置范围-180~180', trigger: 'change' }
  ]
};

function confirmForm() {
  formRef.value.validate((valid) => {
    if (!valid) return; // 校验不通过
    // 校验通过，执行保存逻辑
      
    if (formType.value === "add") {
      tableData.value.forEach((joint) => {
        if (joint.motorId === form.motorId) {
          joint.keyframes.push(JSON.parse(JSON.stringify(unref(form))));
          // debugger;
          joint.keyframes.sort((a, b) => a.time - b.time);
        }
      });
    } else if (formType.value === "edit") {
      // form;
      // debugger;
      // 编辑时，找到对应的行
      tableData.value.forEach((joint) => {
        if (joint.motorId === form.motorId) {
          joint.keyframes[editIndex.value] = JSON.parse(JSON.stringify(unref(form)));
          joint.keyframes.sort((a, b) => a.time - b.time);
          // joint.keyframes.forEach((keyframe, index) => {
          //   if (keyframe.time === form.time) {
          //     // 更新当前行
          //     joint.keyframes[index] = JSON.parse(JSON.stringify(unref(form)));
          //     // debugger;
          //     joint.keyframes.sort((a, b) => a.time - b.time);
          //   }
          // });
        }
      });
    }

    dialogFormVisible.value = false;
    initForm();
  });

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

/**
 * @description 保存动作 有id的情况是编辑
 */
function save() {
  // debugger;
  if(!actionName.value) {
    ElMessage({ message: '请输入动作名称', type: 'warning',});
    return;
  }
  let type = !!actionId.value ? 'edit' : 'add';
  visible.value = false;
  if(type === 'add') {
    motionStore.add({
      id: new Date().getTime() + '_' + parseInt(Math.random() * 100),
      name: actionName.value,
      description: actionDescription.value,
      joints: JSON.parse(JSON.stringify(unref(tableData))),
    });
  } else {
    motionStore.edit({
      id: actionId.value,
      name: actionName.value,
      description: actionDescription.value,
      joints: JSON.parse(JSON.stringify(unref(tableData))),
    });
  }

  


  motionStore.saveToStorage();
  // motion.motionList
  console.log(motionStore.motionList);
  initForm();
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

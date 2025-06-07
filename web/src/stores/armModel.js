// stores/counter.js
import { defineStore } from 'pinia'

export const armModel = defineStore('armModel', {
  state: () => {
    return {
      map: {
        21: 'joint1',
        23: 'joint2',
        22: 'joint3',
        24: 'joint4',
        25: 'joint5',
      },
      armInstance: null,
      test: 1
    }
  },
  actions: {
    setInstance(instance) {
      this.armInstance = instance;
      console.log('Arm instance set:', this.armInstance);
    },
    /* 
     * @description 设置机械臂位置
     * @param {Object} position 位置对象，包含各个关节的角度或位置
        let position = {
          joint1: -(joint1.value * Math.PI) / 180,
          joint2: -(joint2.value * Math.PI) / 180,
          joint3: -(joint3.value * Math.PI) / 180,
          joint4: -(joint4.value * Math.PI) / 180,
          joint5: -(joint5.value * Math.PI) / 180,
        };
     * @param {boolean} sendCmd 是否发送命令到机械臂
     */
    setPosition(position, sendCmd = false) {
      if (this.armInstance && position && typeof position === 'object') {
        Object.assign(this.armInstance, position);
      }
      // if (this.armInstance) {
      //   for (const key in position) {
      //     this.armInstance[key] = position[key];
      //   }
      //   // console.log('Setting arm position:', position);
      // }


    },
  },
})
// stores/counter.js
import { defineStore } from 'pinia'

export const useArmModelStore = defineStore('armModel', {
  state: () => {
    return {
      map: {
        21: 'joint1',
        22: 'joint2',
        23: 'joint3',
        24: 'joint4',
        25: 'joint5',
      },
      armInstance: null,
      frameInterval: 16, // 帧间隔，单位ms
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
    playMotion(motion) {
      motion;
      debugger;

      // // const element = document.getElementById("some-element-you-want-to-animate");
      // let start, previousTimeStamp;
      // let done = false;

      // function step(timestamp) {
      //   if (start === undefined) {
      //     start = timestamp;
      //   }
      //   const elapsed = timestamp - start;

      //   if (previousTimeStamp !== timestamp) {
      //     // 这里使用 Math.min() 确保元素在恰好位于 200px 时停止运动
      //     const count = Math.min(0.1 * elapsed, 200);
      //     // element.style.transform = `translateX(${count}px)`;
      //     if (count === 200) done = true;
      //   }

      //   if (elapsed < 2000) {
      //     // 2 秒之后停止动画
      //     previousTimeStamp = timestamp;
      //     if (!done) {
      //       window.requestAnimationFrame(step);
      //     }
      //   }
      // }

      // window.requestAnimationFrame(step);


    }
  },
})
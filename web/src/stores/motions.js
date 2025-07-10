// 动作库
import { defineStore } from 'pinia'

export const useMotionStore = defineStore('motion', {
  state: () => {
    return {
      jointList: [
        {
          value: "21",
          label: "关节1",
        },
        {
          value: "22",
          label: "关节2",
        },
        {
          value: "23",
          label: "关节3",
        },
        {
          value: "24",
          label: "关节4",
        },
        {
          value: "25",
          label: "关节5",
        },
        {
          value: "26",
          label: "关节6",
        },
      ],
      motionList: [
        {
          name: '测试动作',
          description: '这是一个测试动作',
          joints: [
            {
              jointName: "关节1",
              motorId: "21",
              keyframes: [
                {
                  time: "1000",
                  location: "180",
                  timingFunction: "linear",
                  motorId: "21",
                },
              ],
            },
            {
              jointName: "关节2",
              motorId: "22",
              keyframes: [
                {
                  time: "0",
                  location: "180",
                  timingFunction: "ease-in",
                  motorId: "22",
                },
                {
                  time: "1000",
                  location: "180",
                  timingFunction: "ease-in-out",
                  motorId: "22",
                },
                {
                  time: "2000",
                  location: "180",
                  timingFunction: "linear",
                  motorId: "22",
                },
              ],
            },
          ],
        }
      ],
      currentMotion: {
        name: '',
        description: '',
        joints: [],
      },
    }
  },
  actions: {
    addMotion(motion) {
      this.motionList.push(motion);
      console.log('Motion added:', motion);
    },
    editList(motion) {
      this.motionList = this.motionList.map((item, index) => {
        if (item.name === motion.name) {
          // return motion;
          this.motionList[index] = motion;
          console.log('Motion edited:', motion);
          return;
        }
        // return item;
      });
    },
    /**
     * @description 设置当前动作
     * @param {Object} motion 动作对象，包含名称和关节信息
     * * @example 
        {
          jointName: joint.label,
          motorId: joint.value,
          keyframes: [
            {
              time: "0",
              location: "0",
              timingFunction: "linear",
              motorId: joint.value,
            },
          ],
        }
     * @param {*} motion 
     */
    setCurrentMotion(motion) {
      this.currentMotion = motion;
      console.log('Current motion set:', this.currentMotion);
    },
    /**
     * @description 初始化当前动作
     */
    initMotion() {
      for(let i = 0; i < this.jointList.length; i++) {
        let joint = this.jointList[i];

        this.currentMotion.joints.push({
          jointName: joint.label,
          motorId: joint.value,
          keyframes: [
            {
              time: "0",
              location: "0",
              timingFunction: "linear",
              motorId: joint.value,
            },
          ],
        });
      }
    }
  },

});

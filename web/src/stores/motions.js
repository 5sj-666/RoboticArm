// 动作库
import { defineStore } from 'pinia'

export const useMotionStore = defineStore('motion', {
  state: () => {
    return {
      jointList: [
        {
          value: 21,
          label: "joint1",
        },
        {
          value: 22,
          label: "joint2",
        },
        {
          value: 23,
          label: "joint3",
        },
        {
          value: 24,
          label: "joint4",
        },
        {
          value: 25,
          label: "joint5",
        },
        {
          value: 26,
          label: "joint6",
        },
      ],
      motionList: [
        // {
        //   id: "", // 时间戳 + 随机数
        //   name: '测试动作',
        //   description: '这是一个测试动作',
        //   joints: [
        //     {
        //       name: "joint1",
        //       motorId: 21,
        //       keyframes: [
        //         {
        //           time: 0,
        //           location: 20,
        //           // timingFunction: "linear",
        //           timingFunction: "0,0,1,1",
        //           motorId: 21,
        //         },
        //         {
        //           time: 1000,
        //           location: 100,
        //           // timingFunction: "linear",
        //           timingFunction: "0,0,1,1",
        //           motorId: 21,
        //         },
        //       ],
        //     },
        //     {
        //       name: "joint2",
        //       motorId: 22,
        //       keyframes: [
        //         {
        //           time: 0,
        //           location: 0,
        //           // timingFunction: "ease-in",
        //           timingFunction: "0,0,1,1",
        //           motorId: 22,
        //         },
        //         {
        //           time: 800,
        //           location: 180,
        //           // timingFunction: "ease-in-out",
        //           timingFunction: "0,0,1,1",
        //           motorId: 22,
        //         },
        //         {
        //           time: 3000,
        //           location: 60,
        //           // timingFunction: "linear",
        //           timingFunction: "0,0,1,1",
        //           motorId: 22,
        //         },
        //       ],
        //     },
        //   ],
        // }
      ],
      currentMotion: {
        id: '',
        name: '',
        description: '',
        joints: [],
      },
    }
  },
  actions: {
    add(motion) {
      this.motionList.push(motion);
      console.log('Motion added:', motion);
    },
    edit(motion) {
      console.log('Motion edited:', motion);
      
      this.motionList.map((item, index) => {
        if (item.id == motion.id) {
          // return motion;
          this.motionList[index] = motion;
          return;
        }
        // return item;
      });
    },
    delete(id) {
      let index = this.motionList.findIndex(item => item.id === id);
      if (index === -1) {
        console.error('Motion delete not found:', id);
        return;
      }else {
        this.motionList.splice(index, 1);
        this.saveToStorage();
      }
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
      console.log("---initMotion");
      this.currentMotion.joints = [];

      for(let i = 0; i < this.jointList.length; i++) {
        let joint = this.jointList[i];
        this.currentMotion.joints.push({
          name: joint.label,
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
    },
    /**
     * @description 从localstorage中获取一设置的动作列表
     */
    initFromStorage() {
      let motions = localStorage.getItem('motions');
      if (motions) {
        this.motionList = JSON.parse(motions);
        console.log('Motions initialized from localStorage:', this.motionList);
      } else {
        console.log('No motions found in localStorage.');
      }
    },
    saveToStorage() {
      localStorage.setItem('motions', JSON.stringify(this.motionList));
      console.log('Motions saved to localStorage:', this.motionList);
    }
  },

});

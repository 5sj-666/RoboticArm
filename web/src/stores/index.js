import { defineStore } from 'pinia';
import { parse_cmd } from "../utils/CyberGear.js";

export const useMainStore = defineStore('main', {
  state: () => {
    return { 
      enableBezier: false, // 是否支持贝塞尔曲线
      enableMotor: false, // 是否使能电机
      // Array<{type: enum[send | receive], data: str , status: enum[success | error | receive], msg: str}>
      cmdsHistory: [],
      actionList: [
        // {
        //   name: '',
        //   keyframes: [],
        // }
      ]
     }
  },
  actions: {
    setEnableBezier(status) { // true | false
      console.log('setEnableBezier:', status);
      this.enableBezier = status;
    },
    setEnableMotor(status) { // true | false
      console.log('setEnableMotor:', status);
      this.enableMotor = status;
    },
    /**
     * @description 添加指令到历史记录
     * @param {Object} cmdObj 指令对象，
     * {type: enum[send | receive], data: str , status: enum[success | error | receive], msg: str}
     */
    addCmdsHistory(cmdObj) {
      let cmd = Array.from(cmdObj.data);
      if(cmdObj && cmdObj.msgType === 6) {
        this.cmdsHistory.unshift({...cmdObj, parseStr: cmdObj.data, time: formatTime(new Date())});
      }else {
        this.cmdsHistory.unshift({...cmdObj, parseStr: parse_cmd(cmd)?.parseStr || cmd, time: formatTime(new Date())});
      }

      // console.log('addCmdToHistory:', {...cmdObj, parseStr: parse_cmd(cmd)?.parseStr || cmd});
      function formatTime(date) {
        const pad = n => n.toString().padStart(2, '0');
        return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
      }
    },
    /**
     * @description 添加动作到动作列表
     * @param {Object} action 动作对象，{name: str, keyframes: Array}
     */
    addAction(action) {
      if (!action || !action.name || !Array.isArray(action.keyframes)) {
        console.error('Invalid action object:', action);
        return;
      }
      this.actionList.push(action);
      console.log('addAction:', action);
    }
  },
})
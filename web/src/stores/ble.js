// stores/counter.js
import { defineStore } from 'pinia';
import { h } from "vue";

export const useBleStore = defineStore('BLE', {
  state: () => {
    return {
      device: null,
      server: null,
      service: null,
      connecting: false,
      characteristic: null,
      status: 'disconnected', // 枚举值[ connecting, connected, disconnecting, disconnected ] 待完善
      msgQueue: [], // 消息队列
      queueTimer: null,
      sendInterval: 30, // 发送间隔，单位ms
      mainStore: null, 
      test: "BLE Store"
    }
  },
  actions: {
    // 由于init函数需要访问mainStore，所以需要在使用前注入mainStore
    injectMainStore(mainStore) {
      this.mainStore = mainStore;
    },
    async availableFunc() {
      let available = await navigator.bluetooth.getAvailability();
      ElNotification.closeAll();

      if (!available) {
        console.log("Doh! Bluetooth is not supported");
        // alert("当前设备不支持蓝牙");
        ElNotification({
          title: "蓝牙",
          message: "当前设备不支持蓝牙",
          position: "bottom-right",
          type: "warning",
        });
        return;
      }

      ElNotification({
        title: "蓝牙可用",
        dangerouslyUseHTMLString: true,
        message: h("span", null, [
          h("span", "点击"),
          h(
            ElButton,
            {
              type: "primary",
              onClick: this.init,
              style: { margin: "0 5px" },
              size: "small",
            },
            () => "连接蓝牙"
          ),
          h("span", "来控制机械臂"),
        ]),
        position: "bottom-right",
        type: "success",
        duration: 0,
      });
      console.log("This device supports Bluetooth!");
    },
    async init() {
      // console.log('BLE Store initialized');

      console.log('连接蓝牙');
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "ESP" }],
        optionalServices: [0x00ff],
      });

      this.server = await this.device.gatt.connect();
      console.log("server: ", this.server);
      this.service = await this.server.getPrimaryService(0x00ff);
      console.log("service: ", this.service);
      this.characteristic = await this.service.getCharacteristic(0xff01);
      console.log("characteristic: ", this.characteristic);
      window.BleCharacteristic = this.characteristic;

      ElNotification.closeAll();
      ElNotification({
        title: "蓝牙",
        message: "连接成功",
        position: "bottom-right",
        type: "success",
        duration: 0,
      });

      // bleConnecting.value = true;
      this.status = 'connecting';

      // 接收蓝牙服务发出的通知
      this.characteristic.addEventListener("characteristicvaluechanged", (e) => {
        try {
          console.log("蓝牙Notification通知: ", e, "值:");
          let CAN_frame_data = Array.from(new Uint8Array(e.target.value.buffer));
          // recordCmd.value.push({ type: 'receive', data: CAN_frame_data, status: 'received' });
          this.mainStore.addCmdsHistory({ type: 'receive', data: CAN_frame_data, status: 'received' });
        } catch (error) {
          console.error("蓝牙Notification通知错误: ", error);
        }

      });

      this.characteristic.startNotifications();

    },
    /**
     * @description 发送指令到蓝牙设备, 需要做消息队列管理，因为发送太快的话，可能会导致失败
     * @param {*} cmdFrame 
     * @param {*} mainStore 
     */
    // sendMsg(cmdFrame, mainStore) {
    //   this.msgQueue.push(cmdFrame);


    //   // if (this.status !== 'connected') {
    //   //   console.warn("---请先连接蓝牙---");
    //   //   ElNotification({
    //   //     title: "蓝牙",
    //   //     message: "请先连接蓝牙",
    //   //     position: "bottom-right",
    //   //     type: "warning",
    //   //   });
    //   //   return;
    //   // }
    //   let msgStatus = null;
    //   try {
    //     // BleCharacteristic.writeValue(cmdFrame);
    //     BleCharacteristic.writeValueWithoutResponse(cmdFrame);
    //     console.log("---指令发送成功---");
    //     // recordCmd.value.push({type: 'send', data: cmdFrame, status: 'success'});
    //     msgStatus = 'success';
    //   } catch (error) {
    //     msgStatus = 'fail';
    //     console.warn("---指令发送失败---", error);
    //     // recordCmd.value.push({type: 'send', data: cmdFrame, status: 'fail'});
    //   }
    //   if (msgStatus) {
    //     mainStore.addCmdsHistory({
    //       type: 'send',
    //       data: cmdFrame,
    //       status: msgStatus
    //     });

    //   }

    // },
    disconnect() {
      this.device.addEventListener("gattserverdisconnected", () => {
        ElNotification.closeAll();
        ElNotification({
          title: "蓝牙",
          message: "蓝牙已断开",
          position: "bottom-right",
          type: "warning",
          duration: 0,
        });
        this.status = 'disconnected';
      });
    },
    startQueue(mainStore) {
      if (this.queueTimer) return; // 已经启动
      this.queueTimer = setInterval(() => {
        // if (this.msgQueue.length > 0 && this.status === 'connected') {
        if (this.msgQueue.length > 0) {
          const cmdFrame = this.msgQueue.shift();
          this._sendNow(cmdFrame, mainStore);
        }
        if (this.msgQueue.length === 0) {
          this.stopQueue();
        }
      }, this.sendInterval);

    },
    stopQueue() {
      if (this.queueTimer) {
        console.log("ble.js停止消息队列");
        clearInterval(this.queueTimer);
        this.queueTimer = null;
      }
    },
    sendMsg(cmdFrame, mainStore) {
      this.msgQueue.push(cmdFrame);
      this.startQueue(mainStore); // 确保队列已启动
    },
    _sendNow(cmdFrame, mainStore) {
      console.log("ble.js发送指令", cmdFrame, '时间戳: ', new Date().getTime());
      let msgStatus = null;
      try {
        BleCharacteristic.writeValueWithoutResponse(cmdFrame);
        msgStatus = 'success';
      } catch (error) {
        msgStatus = 'fail';
        console.warn("ble.js指令发送失败", error);
      }
      // 记录消息历史
      if (msgStatus) {
        // console.warn("ble.js记录消息历史");
        mainStore.addCmdsHistory({
          type: 'send',
          data: cmdFrame,
          status: msgStatus
        });
      }
    },


  },
})
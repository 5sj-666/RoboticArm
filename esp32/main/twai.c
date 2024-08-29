#include <stdio.h>
#include <stdlib.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "freertos/semphr.h"
#include "esp_err.h"
#include "esp_log.h"
#include "driver/twai.h"



#define TX_GPIO_NUM             CONFIG_EXAMPLE_TX_GPIO_NUM   //  发送的GPIO序号   General Purpose Input Output 通用输入输出
#define RX_GPIO_NUM             CONFIG_EXAMPLE_RX_GPIO_NUM   //  接收的GPIO序号
#define TX_QUEUE_LEN            100

#define EXAMPLE_TAG     "TWAI_CUSTOM"

// 使用初始化宏初始化配置结构体
// twai_general_config_t g_config = TWAI_GENERAL_CONFIG_DEFAULT(TX_GPIO_NUM, RX_GPIO_NUM, TWAI_MODE_NORMAL, TX_QUEUE_LEN);
twai_general_config_t g_config = {
                                    .mode = TWAI_MODE_NORMAL , //TWAI_MODE_NORMAL / TWAI_MODE_NO_ACK / TWAI_MODE_LISTEN_ONLY
                                    .tx_io = CONFIG_EXAMPLE_TX_GPIO_NUM, // 发送gpio编号
                                    .rx_io = CONFIG_EXAMPLE_RX_GPIO_NUM, // 接收gpioIO号
                                    .clkout_io = -1, //TWAI_IO_UNUSED, //io号，不用为-1
                                    .bus_off_io = -1, //TWAI_IO_UNUSED,//io号，不用为-1
                                    .tx_queue_len = 100, //发送队列长度，0-禁用发送队列
                                    .rx_queue_len = 100, // 接收队列长度 0-禁用接收队列
                                    .alerts_enabled = TWAI_ALERT_ALL,  //警告标志 TWAI_ALERT_ALL 可开启所有警告
                                    .clkout_divider = 0, // 1 to 14 , 0-不用
                                    .intr_flags = ESP_INTR_FLAG_LEVEL1 //中断优先级
                                  };
twai_timing_config_t t_config = TWAI_TIMING_CONFIG_1MBITS();
twai_filter_config_t f_config = TWAI_FILTER_CONFIG_ACCEPT_ALL();


void startTwai() {
  // 安装 TWAI 驱动程序
    if (twai_driver_install(&g_config, &t_config, &f_config) == ESP_OK) {
        printf("Driver installed\n");
    } else {
        printf("Failed to install driver\n");
        return;
    }

    // 启动 TWAI 驱动程序
    if (twai_start() == ESP_OK) {
        printf("Driver started\n");
    } else {
        printf("Failed to start driver\n");
        return;
    }
}

/**
 * @description 控制台打印当前twai的状态 type: info 1  warn 2  error 3
  状态信息: 
    twai_status_info_t status_info={
      .state=,//TWAI_STATE_STOPPED 0 / TWAI_STATE_RUNNING 1 / TWAI_STATE_BUS_OFF 2 / TWAI_STATE_RECOVERING 3
      .msgs_to_tx=,//发送队列消息数       
      .msgs_to_rx=,//接收队列消息数    
      .tx_error_counter=, //发送错误计数
      .rx_error_counter=, //接收错误计数
      .tx_failed_count=,  //发送失败计数
      .rx_missed_count=,  //因接收队列满丢失的消息数
      .rx_overrun_count=, //因接收buf(64Byte)满而丢失的消息数
      .arb_lost_count=,   //仲裁失败计数
      .bus_error_count=};//总线错误计数
    }
 */
void consoleTwaiStatus(int type) {

  // 获取状态
  twai_status_info_t status_info;
  twai_get_status_info(&status_info);

  if(type == 3) {
    ESP_LOGE("TWAI 状态", "state: %u  发送队列消息数: %lu  -接收队列消息数, %lu -发送错误计数: %lu  -接收错误计数: %lu  ", status_info.state, status_info.msgs_to_tx, status_info.msgs_to_rx, status_info.tx_error_counter, status_info.rx_error_counter);
    ESP_LOGE("TWAI 状态", "-发送失败计数: %lu  -rx_missed_count %lu -rx_overrun_count: %lu -仲裁失败计数: %lu -总线错误计数: %lu", status_info.tx_failed_count, status_info.rx_missed_count,status_info.rx_overrun_count, status_info.arb_lost_count, status_info.bus_error_count);
  }
  else if(type == 2) {
    ESP_LOGW("TWAI 状态", "state: %u  发送队列消息数: %lu  -接收队列消息数, %lu -发送错误计数: %lu  -接收错误计数: %lu  ", status_info.state, status_info.msgs_to_tx, status_info.msgs_to_rx, status_info.tx_error_counter, status_info.rx_error_counter);
    ESP_LOGW("TWAI 状态", "-发送失败计数: %lu  -rx_missed_count %lu -rx_overrun_count: %lu -仲裁失败计数: %lu -总线错误计数: %lu", status_info.tx_failed_count, status_info.rx_missed_count,status_info.rx_overrun_count, status_info.arb_lost_count, status_info.bus_error_count);
  }else {
    ESP_LOGI("TWAI 状态", "state: %u  发送队列消息数: %lu  -接收队列消息数, %lu -发送错误计数: %lu  -接收错误计数: %lu  ", status_info.state, status_info.msgs_to_tx, status_info.msgs_to_rx, status_info.tx_error_counter, status_info.rx_error_counter);
    ESP_LOGI("TWAI 状态", "-发送失败计数: %lu  -rx_missed_count %lu -rx_overrun_count: %lu -仲裁失败计数: %lu -总线错误计数: %lu", status_info.tx_failed_count, status_info.rx_missed_count,status_info.rx_overrun_count, status_info.arb_lost_count, status_info.bus_error_count);
  }
}


/**
 * @description 发送can数据
    // 配置要传输的报文
    twai_message_t message = {
        // 设置报文类型及格式
        .extd = 1,              // 标准格式或是扩展格式
        .rtr = 0,               // 数据帧或是远程传输请求帧
        .ss = 0,                // 报文是否为单次发送（即，在报错时不重复发送）
        .self = 0,              // 报文是否为自收发（回环）
        .dlc_non_comp = 0,      // 数据长度代码小于 8
        // 报文 ID 及有效载荷
        .identifier = 0xAAAA,
        .data_length_code = 4,
        .data = {0, 1, 2, 3},
    };
 */
void emitMsg(long unsigned int id,  int dataArr[]) {
  twai_message_t msg = { .extd = 1, .identifier = id, .data_length_code = 8 };
  for(int i = 0; i < 8; i++) {
    msg.data[i] = dataArr[i];
  }

  esp_err_t res = twai_transmit(&msg, portMAX_DELAY);
  if(res) {
    ESP_LOGE("TWAI 发送", "%x, -- %s", res, esp_err_to_name(res));
    // 控制台打印tawi状态
    consoleTwaiStatus(3);

    // 暂停	
    // twai_stop();
    // 遇到错误就卸载，重新安装
    // ESP_ERROR_CHECK(twai_driver_uninstall());
    // startTwai();
 
    // 发送错误后恢复总线 
    twai_initiate_recovery();
    twai_start();
    // twai_transmit(&msg, pdMS_TO_TICKS(500));
    // 重发该消息
    if (twai_transmit(&msg, pdMS_TO_TICKS(1000)) == ESP_OK) {
        printf("msg queued for transmission\n");
    } else {
        printf("Failed to queue msg for transmission\n");
        // 再次重发该消息
        twai_transmit(&msg, pdMS_TO_TICKS(1000));
    }
  }else {
     // 获取状态
    twai_status_info_t status_info;
    twai_get_status_info(&status_info);
    ESP_LOGI("TWAI 状态", "state: %u ---tx_error_counter: %lu ---rx_error_counter: %lu", status_info.state, status_info.tx_error_counter, status_info.rx_error_counter);
    
    consoleTwaiStatus(0);
  }       
}

// /**
//  * @description 接收报文
//  */
// void receive_msg() { // 发送相同的消息时，好像有时会丢失
//   while(true) { // FreeRTOS: FreeRTOS Task "TWAI_rx" should not return, Aborting now! 这个函数应该要死循环，不然报错
//     twai_message_t rx_msg;
//     twai_receive(&rx_msg, portMAX_DELAY);
//     ESP_LOGW(EXAMPLE_TAG, "接收接收到can信号: %lu", rx_msg.identifier);
//   }
// }

/**
 * @description 测试周期性发送报文
 */
// void recycle_transmit_msg() {
//     long unsigned int id = 0x1A000000; //emitMsg
//     int data[8] = {0x05, 0x70, 0x00, 0x00, 0x07, 0x00, 0x7f, 0xff};
//     // long unsigned int index = 0x1A000000;
//     while(true) {
//       id++;
//       // 发送twai报文
//       emitMsg(id, data);
//       // twai_transmit(&ping_message, portMAX_DELAY);
//       // ESP_LOGI(EXAMPLE_TAG, "发送报文: %lu", ping_message.identifier);
//       vTaskDelay(pdMS_TO_TICKS(2000));
//     }    
// } 


// void app_main() {
//     startTwai();
//     consoleTwaiStatus(1);
//     xTaskCreatePinnedToCore(receive_msg, "TWAI_rx", 4096, NULL, 7, NULL, tskNO_AFFINITY);
//     // xTaskCreatePinnedToCore(recycle_transmit_msg, "TWAI_tx", 4096, NULL, 10, NULL, tskNO_AFFINITY);
// }
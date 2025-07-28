// https://github.com/espressif/esp-idf/blob/c9df77ef/examples/bluetooth/bluedroid/ble/gatt_server/tutorial/Gatt_Server_Example_Walkthrough.md

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
#include "esp_system.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "esp_bt.h"
#include "esp_gap_ble_api.h"
#include "esp_gatts_api.h"
#include "esp_bt_defs.h"
#include "esp_bt_main.h"
#include "esp_gatt_common_api.h"
#include "sdkconfig.h"

// #include "freertos/queue.h"
// #include "freertos/semphr.h"
// #include "esp_err.h"
// #include "driver/twai.h"
#include "twai.c"

#define GATTS_TAG "GATTS_DEMO"

/**
 * profile 结构体 
 */
struct gatts_profile_inst {
    esp_gatts_cb_t gatts_cb; 
    uint16_t gatts_if;  
    uint16_t app_id;  
    uint16_t conn_id;  
    uint16_t service_handle;  
    esp_gatt_srvc_id_t service_id;  
    uint16_t char_handle;  
    esp_bt_uuid_t char_uuid;  
    esp_gatt_perm_t perm;  
    esp_gatt_char_prop_t property;  
    uint16_t descr_handle;  
    esp_bt_uuid_t descr_uuid;  
};

static void gatts_profile_a_event_handler(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param);

#define GATTS_SERVICE_UUID_TEST_A   0x00FF
#define GATTS_CHAR_UUID_TEST_A      0xFF01
// #define GATTS_DESCR_UUID_TEST_A     0x3333
#define GATTS_NUM_HANDLE_TEST_A     4


#define TEST_DEVICE_NAME            "ESP_GATTS_DEMO"
#define TEST_MANUFACTURER_DATA_LEN  17 

#define PROFILE_NUM 1
#define PROFILE_A_APP_ID 0

/* One gatt-based profile one app_id and one gatts_if, this array will store the gatts_if returned by ESP_GATTS_REG_EVT */
/* profile数组 */
static struct gatts_profile_inst gl_profile_tab[PROFILE_NUM] = {
    [PROFILE_A_APP_ID] = {
        .gatts_cb = gatts_profile_a_event_handler,
        .gatts_if = ESP_GATT_IF_NONE,       /* Not get the gatt_if, so initial is ESP_GATT_IF_NONE */
    },
    // 需要注册其他profile 往下加就可以了, 并且增加PROFILE_NUM
    // [PROFILE_B_APP_ID] = {
    //     .gatts_cb = gatts_profile_b_event_handler,                   /* This demo does not implement, similar as profile A */
    //     .gatts_if = ESP_GATT_IF_NONE,       /* Not get the gatt_if, so initial is ESP_GATT_IF_NONE */
    // },
};

/**
 * gatt(GATT (Generic Attribute Profile) )事件处理
 */
static void gatts_event_handler(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param)
{
    /* If event is register event, store the gatts_if for each profile */
    /* 注册profile */
    if (event == ESP_GATTS_REG_EVT) {
        if (param->reg.status == ESP_GATT_OK) {
            gl_profile_tab[param->reg.app_id].gatts_if = gatts_if;
        } else {
            ESP_LOGE(GATTS_TAG, "gatts_event_handler配置失败 Reg app failed, app_id %04x, status %d",
                    param->reg.app_id,
                    param->reg.status);
            return;
        }
    }

    /* If the gatts_if equal to profile A, call profile A cb handler,
     * so here call each profile's callback */
    do {
        int idx;
        for (idx = 0; idx < PROFILE_NUM; idx++) {
            if (gatts_if == ESP_GATT_IF_NONE || /* ESP_GATT_IF_NONE, not specify a certain gatt_if, need to call every profile cb function */
                    gatts_if == gl_profile_tab[idx].gatts_if) {
                if (gl_profile_tab[idx].gatts_cb) {
                    gl_profile_tab[idx].gatts_cb(event, gatts_if, param);
                }
            }
        }
    } while (0);
}


// #define GATTS_DEMO_CHAR_VAL_LEN_MAX 0x40

// #define PREPARE_BUF_MAX_SIZE 1024 // 蓝牙一次性传输超出23字节长度时，在此暂时用不到

static uint8_t char1_str[] = {0x11,0x22,0x33};
static esp_gatt_char_prop_t a_property = 0;


static esp_attr_value_t gatts_demo_char1_val =
{
    // .attr_max_len = GATTS_DEMO_CHAR_VAL_LEN_MAX,
    .attr_max_len = 0x40,
    .attr_len     = sizeof(char1_str),
    .attr_value   = char1_str,
};

static uint8_t adv_config_done = 0;
#define adv_config_flag      (1 << 0)
#define scan_rsp_config_flag (1 << 1)

// // 如果定义了自定义的蓝牙广播数据, 则条件编译以下变量
// #ifdef CONFIG_SET_RAW_ADV_DATA
// static uint8_t raw_adv_data[] = {
//         0x02, 0x01, 0x06,                  // Length 2, Data Type 1 (Flags), Data 1 (LE General Discoverable Mode, BR/EDR Not Supported)
//         0x02, 0x0a, 0xeb,                  // Length 2, Data Type 10 (TX power leve), Data 2 (-21)
//         0x03, 0x03, 0xab, 0xcd,            // Length 3, Data Type 3 (Complete 16-bit Service UUIDs), Data 3 (UUID)
// };
// static uint8_t raw_scan_rsp_data[] = {     // Length 15, Data Type 9 (Complete Local Name), Data 1 (ESP_GATTS_DEMO)
//         0x0f, 0x09, 0x45, 0x53, 0x50, 0x5f, 0x47, 0x41, 0x54, 0x54, 0x53, 0x5f, 0x44,
//         0x45, 0x4d, 0x4f
// };
// // 否则编译以下默认变量
// #else
static uint8_t adv_service_uuid128[32] = {
    /* LSB <--------------------------------------------------------------------------------> MSB */
    //first uuid, 16bit, [12],[13] is the value
    0xfb, 0x34, 0x9b, 0x5f, 0x80, 0x00, 0x00, 0x80, 0x00, 0x10, 0x00, 0x00, 0xEE, 0x00, 0x00, 0x00,
    //second uuid, 32bit, [12], [13], [14], [15] is the value
    0xfb, 0x34, 0x9b, 0x5f, 0x80, 0x00, 0x00, 0x80, 0x00, 0x10, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00,
};


// typedef struct {
//     bool set_scan_rsp;            /*!< Set this advertising data as scan response or not*/
//     bool include_name;            /*!< Advertising data include device name or not */
//     bool include_txpower;         /*!< Advertising data include TX power */
//     int min_interval;             /*!< Advertising data show slave preferred connection min interval */
//     int max_interval;             /*!< Advertising data show slave preferred connection max interval */
//     int appearance;               /*!< External appearance of device */
//     uint16_t manufacturer_len;    /*!< Manufacturer data length */
//     uint8_t *p_manufacturer_data; /*!< Manufacturer data point */
//     uint16_t service_data_len;    /*!< Service data length */
//     uint8_t *p_service_data;      /*!< Service data point */
//     uint16_t service_uuid_len;    /*!< Service uuid length */
//     uint8_t *p_service_uuid;      /*!< Service uuid array point */
//     uint8_t flag;                 /*!< Advertising flag of discovery mode, see BLE_ADV_DATA_FLAG detail */
// } esp_ble_adv_data_t;  // 定义的广播结构体

// The length of adv data must be less than 31 bytes
//static uint8_t test_manufacturer[TEST_MANUFACTURER_DATA_LEN] =  {0x12, 0x23, 0x45, 0x56};
//adv data  广播的默认数据
static esp_ble_adv_data_t adv_data = {
    .set_scan_rsp = false,
    .include_name = true,
    .include_txpower = false,
    // 从机连接的最小连接间隔 0x0006 * 1.25ms = 7.5ms    slave connection min interval, Time = min_interval * 1.25 msec
    .min_interval = 0x0006, 
    // 从机连接的最大连接间隔 0x0010 * 1.25ms = 16 * 1.25 = 20ms   slave connection max interval, Time = max_interval * 1.25 msec
    .max_interval = 0x000A, 
    .appearance = 0x00,
    .manufacturer_len = 0, //TEST_MANUFACTURER_DATA_LEN,
    .p_manufacturer_data =  NULL, //&test_manufacturer[0],
    .service_data_len = 0,
    .p_service_data = NULL,
    .service_uuid_len = sizeof(adv_service_uuid128),
    .p_service_uuid = adv_service_uuid128,
    .flag = (ESP_BLE_ADV_FLAG_GEN_DISC | ESP_BLE_ADV_FLAG_BREDR_NOT_SPT),
};
// scan response data
static esp_ble_adv_data_t scan_rsp_data = {
    .set_scan_rsp = true,
    .include_name = true,
    .include_txpower = true,
    //.min_interval = 0x0006,
    //.max_interval = 0x0010,
    .appearance = 0x00,
    .manufacturer_len = 0, //TEST_MANUFACTURER_DATA_LEN,
    .p_manufacturer_data =  NULL, //&test_manufacturer[0],
    .service_data_len = 0,
    .p_service_data = NULL,
    .service_uuid_len = sizeof(adv_service_uuid128),
    .p_service_uuid = adv_service_uuid128,
    .flag = (ESP_BLE_ADV_FLAG_GEN_DISC | ESP_BLE_ADV_FLAG_BREDR_NOT_SPT),
};

// #endif 
// 广告参数初始化如下：
static esp_ble_adv_params_t adv_params = {
    .adv_int_min        = 0x20,
    .adv_int_max        = 0x40,
    .adv_type           = ADV_TYPE_IND,
    .own_addr_type      = BLE_ADDR_TYPE_PUBLIC,
    .channel_map        = ADV_CHNL_ALL,
    .adv_filter_policy = ADV_FILTER_ALLOW_SCAN_ANY_CON_ANY,
};

//
static void gap_event_handler(esp_gap_ble_cb_event_t event, esp_ble_gap_cb_param_t *param)
{
    switch (event) {
// #ifdef CONFIG_SET_RAW_ADV_DATA
//     case ESP_GAP_BLE_ADV_DATA_RAW_SET_COMPLETE_EVT:
//         adv_config_done &= (~adv_config_flag);
//         if (adv_config_done==0){
//             esp_ble_gap_start_advertising(&adv_params);
//         }
//         break;
//     case ESP_GAP_BLE_SCAN_RSP_DATA_RAW_SET_COMPLETE_EVT:
//         adv_config_done &= (~scan_rsp_config_flag);
//         if (adv_config_done==0){
//             esp_ble_gap_start_advertising(&adv_params);
//         }
//         break;
// #else
    case ESP_GAP_BLE_ADV_DATA_SET_COMPLETE_EVT:
        adv_config_done &= (~adv_config_flag);
        if (adv_config_done == 0){
            esp_ble_gap_start_advertising(&adv_params);
        }
        break;
    case ESP_GAP_BLE_SCAN_RSP_DATA_SET_COMPLETE_EVT:
        adv_config_done &= (~scan_rsp_config_flag);
        if (adv_config_done == 0){
            esp_ble_gap_start_advertising(&adv_params);
        }
        break;
// #endif
    // 广播开始
    case ESP_GAP_BLE_ADV_START_COMPLETE_EVT:
        //advertising start complete event to indicate advertising start successfully or failed
        if (param->adv_start_cmpl.status != ESP_BT_STATUS_SUCCESS) {
            ESP_LOGE(GATTS_TAG, "Advertising start failed");
        }
        break;
        // 广播暂停
    case ESP_GAP_BLE_ADV_STOP_COMPLETE_EVT:
        if (param->adv_stop_cmpl.status != ESP_BT_STATUS_SUCCESS) {
            ESP_LOGE(GATTS_TAG, "Advertising stop failed");
        } else {
            ESP_LOGI(GATTS_TAG, "Stop adv successfully");
        }
        break;
    // 广播升级
    case ESP_GAP_BLE_UPDATE_CONN_PARAMS_EVT:
         ESP_LOGI(GATTS_TAG, "update connection params status = %d, min_int = %d, max_int = %d,conn_int = %d,latency = %d, timeout = %d",
                  param->update_conn_params.status,
                  param->update_conn_params.min_int,
                  param->update_conn_params.max_int,
                  param->update_conn_params.conn_int,
                  param->update_conn_params.latency,
                  param->update_conn_params.timeout);
        break;
    default:
        break;
    }
}


// int newest_con_id = 0;

static void gatts_profile_a_event_handler(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param) {
    ESP_LOGI(GATTS_TAG,"a服务的事件函数处理");

    switch (event) {
    case ESP_GATTS_REG_EVT:
        ESP_LOGI(GATTS_TAG, "蓝牙配置REGISTER_APP_EVT, status %d, app_id %d", param->reg.status, param->reg.app_id);
        gl_profile_tab[PROFILE_A_APP_ID].service_id.is_primary = true;
        gl_profile_tab[PROFILE_A_APP_ID].service_id.id.inst_id = 0x00;
        gl_profile_tab[PROFILE_A_APP_ID].service_id.id.uuid.len = ESP_UUID_LEN_16;
        gl_profile_tab[PROFILE_A_APP_ID].service_id.id.uuid.uuid.uuid16 = GATTS_SERVICE_UUID_TEST_A;

        esp_err_t set_dev_name_ret = esp_ble_gap_set_device_name(TEST_DEVICE_NAME);
        if (set_dev_name_ret){
            ESP_LOGE(GATTS_TAG, "set device name failed, error code = %x", set_dev_name_ret);
        }
// #ifdef CONFIG_SET_RAW_ADV_DATA  // 自定义广告
//         esp_err_t raw_adv_ret = esp_ble_gap_config_adv_data_raw(raw_adv_data, sizeof(raw_adv_data));
//         if (raw_adv_ret){
//             ESP_LOGE(GATTS_TAG, "config raw adv data failed, error code = %x ", raw_adv_ret);
//         }
//         adv_config_done |= adv_config_flag;
//         esp_err_t raw_scan_ret = esp_ble_gap_config_scan_rsp_data_raw(raw_scan_rsp_data, sizeof(raw_scan_rsp_data));
//         if (raw_scan_ret){
//             ESP_LOGE(GATTS_TAG, "config raw scan rsp data failed, error code = %x", raw_scan_ret);
//         }
//         adv_config_done |= scan_rsp_config_flag;
// #else
        //config adv data
        esp_err_t ret = esp_ble_gap_config_adv_data(&adv_data);
        if (ret){
            ESP_LOGE(GATTS_TAG, "config adv data failed, error code = %x", ret);
        }
        adv_config_done |= adv_config_flag;
        //config scan response data
        ret = esp_ble_gap_config_adv_data(&scan_rsp_data);
        if (ret){
            ESP_LOGE(GATTS_TAG, "config scan response data failed, error code = %x", ret);
        }
        adv_config_done |= scan_rsp_config_flag;

// #endif
        esp_ble_gatts_create_service(gatts_if, &gl_profile_tab[PROFILE_A_APP_ID].service_id, GATTS_NUM_HANDLE_TEST_A);
        break;
    // gatt 读 事件
    case ESP_GATTS_READ_EVT: {
        ESP_LOGI(GATTS_TAG, "GATT_READ_EVT, conn_id %d, trans_id %" PRIu32 ", handle %d", param->read.conn_id, param->read.trans_id, param->read.handle);
        // 虚拟数据
        esp_gatt_rsp_t rsp;
        memset(&rsp, 0, sizeof(esp_gatt_rsp_t));
        rsp.attr_value.handle = param->read.handle;
        rsp.attr_value.len = 4;
        rsp.attr_value.value[0] = 0xde;
        rsp.attr_value.value[1] = 0xed;
        rsp.attr_value.value[2] = 0xbe;
        rsp.attr_value.value[3] = 0xef;
        esp_ble_gatts_send_response(gatts_if, param->read.conn_id, param->read.trans_id,
                                    ESP_GATT_OK, &rsp);
        break;
    }
    case ESP_GATTS_WRITE_EVT: {
        ESP_LOGI(GATTS_TAG, "蓝牙写入事件 GATT_WRITE_EVT, conn_id %d, trans_id %" PRIu32 ", handle %d", param->write.conn_id, param->write.trans_id, param->write.handle);
        esp_gatt_status_t status = ESP_GATT_OK;

        ESP_LOGW(GATTS_TAG, "GATT_WRITE_EVT, value len %d, value :", param->write.len);
        esp_log_buffer_hex(GATTS_TAG, param->write.value, param->write.len);

        // 将接收到的蓝牙数据做处理，提取出想要格式的帧id和帧数据
        unsigned int frameId = 0;
        int frameData[8];
        for(int i = 0; i < param->write.len; i++) {
          // printf("遍历蓝牙%d值: %d", i, param->write.value[i]);
          if(i < 4) {
            frameId = frameId * 16 * 16 + param->write.value[i];
            // ESP_LOGI(GATTS_TAG, "----蓝牙 16进制 转换帧id:  %u", frameId);
          }else {
            frameData[i - 4] = param->write.value[i];
          }
        }
        printf("frameId%u值: %d, --- %d  \n", frameId, frameData[0], frameData[7]);

        // printf("in app_main the min free stack size is %ld \r\n", (int32_t)uxTaskGetStackHighWaterMark(NULL));
        ESP_LOGI(EXAMPLE_TAG, "-----发送can数据指令------");
        // unsigned int testId = 0x0300FD15;
        // int testArr[8] = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
        emitMsg(frameId, frameData);
        ESP_LOGI(EXAMPLE_TAG, "-----发送can数据指令结束-----");


        // // 测试通知
        // uint8_t notify_data[8];
        // for (int i = 0; i < 8; ++i) {
        //     notify_data[i] = frameData[i];
        // }

        // esp_ble_gatts_send_indicate(gl_profile_tab[PROFILE_A_APP_ID].gatts_if, gl_profile_tab[PROFILE_A_APP_ID].conn_id, gl_profile_tab[PROFILE_A_APP_ID].char_handle,
        //                     sizeof(notify_data), notify_data, false);



        // 客户端的请求是需要需要回复时候
        if(param->write.need_rsp) {
          // 向 GATT 客户端发送指示或通知。将参数 need_confirm 设置为 false 将发送通知，否则为指示。注意：指示或通知数据的大小需要小于 MTU 大小，请参阅“esp_ble_gattc_send_mtu_req”。
          // 参数
          // gatts_if -- [输入] GATT 服务器访问接口
          // conn_id -- [输入] - 要指示的连接 id。
          // attr_handle —— [输入] ——需要指示的属性句柄。
          // value_len —— [输入] ——表示值的长度。
          // value —— [输入]要指示的值。
          // need_confirm -- [输入] - 是否需要确认。false 发送 GATT 通知，true 发送 GATT 指示。
          // 返回
          // ESP_OK ：成功
          // 其他：失败
          // esp_ble_gatts_send_indicate(gatts_if, param->write.conn_id, gl_profile_tab[PROFILE_A_APP_ID].char_handle,
          //                         sizeof(notify_data), notify_data, false);
          esp_ble_gatts_send_response(gatts_if, param->write.conn_id, param->write.trans_id, status, NULL);
          // esp_ble_gatts_send_response(gatts_if, gl_profile_tab[PROFILE_A_APP_ID].conn_id, gl_profile_tab[PROFILE_A_APP_ID].char_handle, status, NULL);
        }
        
        // if (!param->write.is_prep){
            
        //     // receiveBleMsg(param);
        //     ESP_LOGI(GATTS_TAG, "GATT_WRITE_EVT, value len %d, value :", param->write.len);
        //     esp_log_buffer_hex(GATTS_TAG, param->write.value, param->write.len);
        //     ESP_LOGI(GATTS_TAG, "a服务的写入十六进制结束%d", param->write.len);

        //     // 将接收到的蓝牙数据做处理，提取出想要格式的帧id和帧数据
        //     unsigned int frameId = 0;
        //     int frameData[8];
        //     for(int i = 0; i < param->write.len; i++) {
        //       printf("遍历蓝牙%d值: %d", i, param->write.value[i]);
        //       if(i < 4) {
        //         frameId = frameId * 16 * 16 + param->write.value[i];
        //         ESP_LOGI(GATTS_TAG, "----蓝牙 16进制 转换帧id:  %u", frameId);
        //       }else {
        //         frameData[i - 4] = param->write.value[i];
        //       }
        //     }
        //     printf("frameId%u值: %d, --- %d", frameId, frameData[0], frameData[7]);

        //     // printf("in app_main the min free stack size is %ld \r\n", (int32_t)uxTaskGetStackHighWaterMark(NULL));
        //     ESP_LOGI(EXAMPLE_TAG, "-----发送can数据指令------");
        //     // unsigned int testId = 0x0300FD15;
        //     // int testArr[8] = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
        //     emitMsg(frameId, frameData);
        //     ESP_LOGI(EXAMPLE_TAG, "-----发送can数据指令结束-----");

        //     // // 发送通知
        //     // uint8_t notify_data[15];
        //     // for (int i = 0; i < sizeof(notify_data); ++i)
        //     // {
        //     //     notify_data[i] = i%0xff;
        //     // }
        //     // //the size of notify_data[] need less than MTU size

        //     // // 向 GATT 客户端发送指示或通知。将参数 need_confirm 设置为 false 将发送通知，否则为指示。注意：指示或通知数据的大小需要小于 MTU 大小，请参阅“esp_ble_gattc_send_mtu_req”。
        //     // // 参数
        //     // // gatts_if -- [输入] GATT 服务器访问接口
        //     // // conn_id -- [输入] - 要指示的连接 id。
        //     // // attr_handle —— [输入] ——需要指示的属性句柄。
        //     // // value_len —— [输入] ——表示值的长度。
        //     // // value —— [输入]要指示的值。
        //     // // need_confirm -- [输入] - 是否需要确认。false 发送 GATT 通知，true 发送 GATT 指示。
        //     // // 返回
        //     // // ESP_OK ：成功
        //     // // 其他：失败
        //     // esp_ble_gatts_send_indicate(gatts_if, param->write.conn_id, gl_profile_tab[PROFILE_A_APP_ID].char_handle,
        //     //                         sizeof(notify_data), notify_data, false);

        // }
        // 长特征值时候才会调用
        // // example_write_event_env(gatts_if, &a_prepare_write_env, param);
        // esp_ble_gatts_send_response(gatts_if, param->write.conn_id, param->write.trans_id, ESP_GATT_OK, NULL);
        break;
    }
    case ESP_GATTS_EXEC_WRITE_EVT:
        // ESP_LOGI(GATTS_TAG,"蓝牙执行写入ESP_GATTS_EXEC_WRITE_EVT");
        // esp_ble_gatts_send_response(gatts_if, param->write.conn_id, param->write.trans_id, ESP_GATT_OK, NULL);
        // example_exec_write_event_env(&a_prepare_write_env, param);
        ESP_LOGI(GATTS_TAG,"蓝牙执行写入事件 ESP_GATTS_EXEC_WRITE_EVT");
        break;
    case ESP_GATTS_MTU_EVT:
        ESP_LOGI(GATTS_TAG, "蓝牙MTU事件 ESP_GATTS_MTU_EVT, MTU %d", param->mtu.mtu);
        break;
    case ESP_GATTS_UNREG_EVT:
        ESP_LOGI(GATTS_TAG, "ESP_GATTS_UNREG_EVT");
        break;
    case ESP_GATTS_CREATE_EVT:
        ESP_LOGI(GATTS_TAG, "蓝牙GATTS创建  CREATE_SERVICE_EVT, status %d,  service_handle %d", param->create.status, param->create.service_handle);
        gl_profile_tab[PROFILE_A_APP_ID].service_handle = param->create.service_handle;
        gl_profile_tab[PROFILE_A_APP_ID].char_uuid.len = ESP_UUID_LEN_16;
        gl_profile_tab[PROFILE_A_APP_ID].char_uuid.uuid.uuid16 = GATTS_CHAR_UUID_TEST_A;

        esp_ble_gatts_start_service(gl_profile_tab[PROFILE_A_APP_ID].service_handle);
        a_property = ESP_GATT_CHAR_PROP_BIT_READ | ESP_GATT_CHAR_PROP_BIT_WRITE | ESP_GATT_CHAR_PROP_BIT_NOTIFY;
        esp_err_t add_char_ret = esp_ble_gatts_add_char(gl_profile_tab[PROFILE_A_APP_ID].service_handle, &gl_profile_tab[PROFILE_A_APP_ID].char_uuid,
                                                        ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
                                                        a_property,
                                                        &gatts_demo_char1_val, NULL);
        if (add_char_ret){
            ESP_LOGE(GATTS_TAG, "蓝牙 add char failed, error code =%x",add_char_ret);
        }
        break;
    case ESP_GATTS_ADD_INCL_SRVC_EVT:
        ESP_LOGI(GATTS_TAG,"蓝牙ESP_GATTS_ADD_INCL_SRVC_EVT");
        break;
    // service添加character
    case ESP_GATTS_ADD_CHAR_EVT: {
        uint16_t length = 0;
        const uint8_t *prf_char;

        ESP_LOGI(GATTS_TAG, "services添加character事件  ADD_CHAR_EVT, status %d,  attr_handle %d, service_handle %d",
                param->add_char.status, param->add_char.attr_handle, param->add_char.service_handle);
        gl_profile_tab[PROFILE_A_APP_ID].char_handle = param->add_char.attr_handle;
        gl_profile_tab[PROFILE_A_APP_ID].descr_uuid.len = ESP_UUID_LEN_16;
        gl_profile_tab[PROFILE_A_APP_ID].descr_uuid.uuid.uuid16 = ESP_GATT_UUID_CHAR_CLIENT_CONFIG;
        esp_err_t get_attr_ret = esp_ble_gatts_get_attr_value(param->add_char.attr_handle,  &length, &prf_char);
        if (get_attr_ret == ESP_FAIL){
            ESP_LOGE(GATTS_TAG, "services添加character失败  ILLEGAL HANDLE");
        }

        ESP_LOGI(GATTS_TAG, "services添加character成功 the gatts demo char length = %x", length);
        for(int i = 0; i < length; i++){
            ESP_LOGI(GATTS_TAG, "prf_char[%x] =%x",i,prf_char[i]);
        }
        // 添加character描述符，比如hadle，uuid， permit权限等
        esp_err_t add_descr_ret = esp_ble_gatts_add_char_descr(gl_profile_tab[PROFILE_A_APP_ID].service_handle, &gl_profile_tab[PROFILE_A_APP_ID].descr_uuid,
                                                                ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE, NULL, NULL);
        if (add_descr_ret){
            ESP_LOGE(GATTS_TAG, "services添加character失败 add char descr failed, error code =%x", add_descr_ret);
        }
        break;
    }
    // 添加character描述符
    case ESP_GATTS_ADD_CHAR_DESCR_EVT:
        gl_profile_tab[PROFILE_A_APP_ID].descr_handle = param->add_char_descr.attr_handle;
        ESP_LOGI(GATTS_TAG, "ADD_DESCR_EVT, status %d, attr_handle %d, service_handle %d",
                 param->add_char_descr.status, param->add_char_descr.attr_handle, param->add_char_descr.service_handle);
        break;
    // 删除事件
    case ESP_GATTS_DELETE_EVT:
        break;
    // 服务开始事件
    case ESP_GATTS_START_EVT:
        ESP_LOGI(GATTS_TAG, "服务开始的回调事件 SERVICE_START_EVT, status %d, service_handle %d",
                 param->start.status, param->start.service_handle);
        break;
    // 服务暂停事件
    case ESP_GATTS_STOP_EVT:
        break;
     // 服务连接事件
    case ESP_GATTS_CONNECT_EVT: {
        // 
        esp_ble_conn_update_params_t conn_params = {0};
        memcpy(conn_params.bda, param->connect.remote_bda, sizeof(esp_bd_addr_t));
        /* For the IOS system, please reference the apple official documents about the ble connection parameters restrictions. */
        conn_params.latency = 0;
        conn_params.max_int = 0x20;    // max_int = 0x20*1.25ms = 40ms
        conn_params.min_int = 0x10;    // min_int = 0x10*1.25ms = 20ms
        conn_params.timeout = 400;    // timeout = 400*10ms = 4000ms
        ESP_LOGI(GATTS_TAG, "ESP_GATTS_CONNECT_EVT, conn_id %d, remote %02x:%02x:%02x:%02x:%02x:%02x:",
                 param->connect.conn_id,
                 param->connect.remote_bda[0], param->connect.remote_bda[1], param->connect.remote_bda[2],
                 param->connect.remote_bda[3], param->connect.remote_bda[4], param->connect.remote_bda[5]);
        gl_profile_tab[PROFILE_A_APP_ID].conn_id = param->connect.conn_id;
        //start sent the update connection parameters to the peer device.
        esp_ble_gap_update_conn_params(&conn_params);
        break;
    }
    // 服务断开连接的回调事件
    case ESP_GATTS_DISCONNECT_EVT:
        ESP_LOGI(GATTS_TAG, "ESP_GATTS_DISCONNECT_EVT, disconnect reason 0x%x", param->disconnect.reason);
        esp_ble_gap_start_advertising(&adv_params);
        break;
    // profile配置事件
    case ESP_GATTS_CONF_EVT:
        ESP_LOGI(GATTS_TAG, "gatts配置事件 ESP_GATTS_CONF_EVT, status %d attr_handle %d", param->conf.status, param->conf.handle);
        if (param->conf.status != ESP_GATT_OK){
            esp_log_buffer_hex(GATTS_TAG, param->conf.value, param->conf.len);
        }
        break;
    case ESP_GATTS_OPEN_EVT:
      ESP_LOGI(GATTS_TAG, "ESP_GATTS_OPEN_EVT");
      break;
    case ESP_GATTS_CANCEL_OPEN_EVT:
      ESP_LOGI(GATTS_TAG, "ESP_GATTS_CANCEL_OPEN_EVT");
      break;
    case ESP_GATTS_CLOSE_EVT:
      ESP_LOGI(GATTS_TAG, "ESP_GATTS_CLOSE_EVT");
      break;
    case ESP_GATTS_LISTEN_EVT:
      ESP_LOGI(GATTS_TAG, "ESP_GATTS_LISTEN_EVT");
      break;
    case ESP_GATTS_CONGEST_EVT:
      ESP_LOGI(GATTS_TAG, "ESP_GATTS_CONGEST_EVT");
      break;
    default:
        break;
    }
}


void initBle() {
    esp_err_t ret;

    // Initialize NVS. 初始化持久性存储
    ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    // 控制器初始化 
    esp_bt_controller_config_t bt_cfg = BT_CONTROLLER_INIT_CONFIG_DEFAULT();
    ret = esp_bt_controller_init(&bt_cfg);
    if (ret) {
        ESP_LOGE(GATTS_TAG, "%s initialize controller failed", __func__);
        return;
    }

  /** 启用控制器
   * ESP_BT_MODE_BTDM支持四种蓝牙模式：
        ESP_BT_MODE_IDLE：蓝牙未运行
        ESP_BT_MODE_BLE：BLE 模式  低功耗蓝牙
        ESP_BT_MODE_CLASSIC_BT：BT 经典模式
        ESP_BT_MODE_BTDM：双模式（BLE + BT Classic）
    */  
    ret = esp_bt_controller_enable(ESP_BT_MODE_BLE);
    if (ret) {
        ESP_LOGE(GATTS_TAG, "%s enable controller failed", __func__);
        return;
    }


    /**
     * 初始化和启动蓝牙（面向服务的那一层）
     * 
     */
    ret = esp_bluedroid_init();
    if (ret) {
        ESP_LOGE(GATTS_TAG, "%s init bluetooth failed 初始化蓝牙失败: ", __func__);
        return;
    }
    ret = esp_bluedroid_enable();
    if (ret) {
        ESP_LOGE(GATTS_TAG, "%s enable bluetooth failed 使能蓝牙失败： ", __func__);
        return;
    }

    /**
     * 注册 描述文件（profile）的启动函数
     */
    ret = esp_ble_gatts_register_callback(gatts_event_handler);
    if (ret){
        ESP_LOGE(GATTS_TAG, "gatts register error, error code = %x", ret);
        return;
    }
    /**
     * 蓝牙连接的事件回调
     * GAP（Generic Access Profile）  通用访问配置文件  
     * 用来控制设备连接和广播。GAP 使你的设备被其他设备可见，并决定了你的设备是否可以或者怎样与合同设备进行交互。
     * 例如 Beacon 设备就只是向外广播，不支持连接，小米手环就等设备就可以与中心设备连接
     */
    ret = esp_ble_gap_register_callback(gap_event_handler);
    if (ret){
        ESP_LOGE(GATTS_TAG, "gap register error, error code = %x", ret);
        return;
    }

    /**
     * 注册gatts-app
     */
    ret = esp_ble_gatts_app_register(PROFILE_A_APP_ID);
    if (ret){
        ESP_LOGE(GATTS_TAG, "gatts app register error, error code = %x", ret);
        return;
    }
    // 注册其他profile往下加
    // ret = esp_ble_gatts_app_register(PROFILE_B_APP_ID);
    // if (ret){
    //     ESP_LOGE(GATTS_TAG, "gatts app register error, error code = %x", ret);
    //     return;
    // }
    esp_err_t local_mtu_ret = esp_ble_gatt_set_local_mtu(512);
    if (local_mtu_ret){
        ESP_LOGE(GATTS_TAG, "set local  MTU failed, error code = %x", local_mtu_ret);
    }
    return;
}

/* ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ TWAI 接收↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ */

/**
 * @description 接收报文
 */
void receive_msg() { // 发送相同的消息时，好像有时会丢失
  vTaskDelay(pdMS_TO_TICKS(500));
  printf("开始接收报文 receive_msg");
  while(true) { // FreeRTOS: FreeRTOS Task "TWAI_rx" should not return, Aborting now! 这个函数应该要死循环，不然报错
    twai_message_t rx_msg;
    twai_receive(&rx_msg, portMAX_DELAY);
    ESP_LOGW(EXAMPLE_TAG, "接收接收到can信号: %lu", rx_msg.identifier);
    
    // 发送通知
    uint8_t notify_data[12];

    // for (int i = 0; i < sizeof(rx_msg.data); ++i) {
    for (int i = 0; i < 12; ++i) {
      if(i < 4) {
        notify_data[i] = (rx_msg.identifier >> (8 * (3 - i))) & 0xff;
      }else {
        notify_data[i] = rx_msg.data[i - 4];
      }
        
    }
    
    // 向 GATT 客户端发送指示或通知。将参数 need_confirm 设置为 false 将发送通知，否则为指示。注意：指示或通知数据的大小需要小于 MTU 大小，请参阅“esp_ble_gattc_send_mtu_req”。
    // 参数
    // gatts_if -- [输入] GATT 服务器访问接口
    // conn_id -- [输入] - 要指示的连接 id。
    // attr_handle —— [输入] ——需要指示的属性句柄。
    // value_len —— [输入] ——表示值的长度。
    // value —— [输入]要指示的值。
    // need_confirm -- [输入] - 是否需要确认。false 发送 GATT 通知，true 发送 GATT 指示。
    // 返回
    // ESP_OK ：成功
    // 其他：失败
    // esp_ble_gatts_send_indicate(current_gatts_if, current_param->write.conn_id, gl_profile_tab[PROFILE_A_APP_ID].char_handle,
    //                         sizeof(notify_data), notify_data, false);

    // gl_profile_tab[PROFILE_A_APP_ID].conn_id

    // esp_ble_gatts_send_indicate(gl_profile_tab[PROFILE_A_APP_ID].gatts_if, gl_profile_tab[PROFILE_A_APP_ID].conn_id, gl_profile_tab[PROFILE_A_APP_ID].char_handle,
    //                         sizeof(notify_data), notify_data, false);
    esp_ble_gatts_send_indicate(gl_profile_tab[PROFILE_A_APP_ID].gatts_if, gl_profile_tab[PROFILE_A_APP_ID].conn_id, gl_profile_tab[PROFILE_A_APP_ID].char_handle,
                              sizeof(notify_data), notify_data, false);
  }
}

void ctrl_task(void *arg)
{
    twai_reconfigure_alerts(TWAI_ALERT_ABOVE_ERR_WARN | TWAI_ALERT_ERR_PASS | TWAI_ALERT_BUS_OFF | TWAI_ALERT_ARB_LOST | TWAI_ALERT_ERR_ACTIVE | TWAI_ALERT_RECOVERY_IN_PROGRESS | TWAI_ALERT_ABOVE_ERR_WARN, NULL); // TWAI_ALERT_BUS_ERROR

    while (true) {
        uint32_t alerts;
        twai_read_alerts(&alerts, portMAX_DELAY);
        if(alerts) {
          switch(alerts) {
            case TWAI_ALERT_TX_IDLE: 
              printf("队列中无待传输报文 TWAI_ALERT_TX_IDLE \n");
              break;

            case TWAI_ALERT_TX_SUCCESS: 
              printf("上一次传输成功 TWAI_ALERT_TX_SUCCESS \n");
              break;

            case TWAI_ALERT_RX_DATA: 
              printf("收到一帧数据并添加到RX队列 TWAI_ALERT_RX_DATA \n");
              break;
            
            case TWAI_ALERT_BELOW_ERR_WARN: 
              printf("两个错误计数器都低于错误报警限制 TWAI_ALERT_BELOW_ERR_WARN \n");
              break;

            case TWAI_ALERT_ERR_ACTIVE: 
              printf("TWAI 控制器已进入主动错误状态 TWAI_ALERT_ERR_ACTIVE \n");
              break;

            case TWAI_ALERT_RECOVERY_IN_PROGRESS: 
              printf("TWAI控制器正在进行离线恢复 TWAI_ALERT_RECOVERY_IN_PROGRESS  \n");
              break;

            case TWAI_ALERT_BUS_RECOVERED: 
              printf("TWAI 控制器已成功完成离线恢复 TWAI_ALERT_BUS_RECOVERED  \n");
              break;
            
            case TWAI_ALERT_ARB_LOST: 
              printf("TWAI 上一次传输丢失仲裁 TWAI_ALERT_ARB_LOST  \n");
              break;

            case TWAI_ALERT_ABOVE_ERR_WARN: 
              printf("TWAI 有错误计数器超过了错误报警限制 TWAI_ALERT_ABOVE_ERR_WARN  \n");
              break;

            case TWAI_ALERT_BUS_ERROR: 
              printf("TWAI 总线上发生了（位、填充、CRC、格式、ACK）错误 TWAI_ALERT_BUS_ERROR  \n");
              break;

            case TWAI_ALERT_TX_FAILED: 
              printf("TWAI 上一次传输失败 TWAI_ALERT_TX_FAILED \n");
              break;

            case TWAI_ALERT_RX_QUEUE_FULL: 
              printf("TWAI RX 队列已满，接收到的帧丢失 TWAI_ALERT_RX_QUEUE_FULL  \n");
              break;
            
            case TWAI_ALERT_ERR_PASS: 
              printf("TWAI 控制器已进入被动错误状态 TWAI_ALERT_ERR_PASS  \n");
              break;

            case TWAI_ALERT_BUS_OFF: 
              printf("离线条件已触发，TWAI 控制器无法干扰总线 TWAI_ALERT_BUS_OFF \n");
              break;

            default: 
              break;
          }
        }
    }

}



/* ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑   ---- TWAI 接收 ----    ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑ */

void app_main()
{
    
    initBle();

    
    startTwai();
    consoleTwaiStatus(1);

    twai_reconfigure_alerts(TWAI_ALERT_ABOVE_ERR_WARN | TWAI_ALERT_ERR_PASS | TWAI_ALERT_BUS_OFF, NULL);

    xTaskCreatePinnedToCore(receive_msg, "TWAI_rx", 4096, NULL, 1, NULL, tskNO_AFFINITY);
    xTaskCreatePinnedToCore(ctrl_task, "TWAI_ctrl", 4096, NULL, 2, NULL, tskNO_AFFINITY);
    // xTaskCreatePinnedToCore(recycle_transmit_msg, "TWAI_tx", 4096, NULL, 10, NULL, tskNO_AFFINITY); 
    return ;
}
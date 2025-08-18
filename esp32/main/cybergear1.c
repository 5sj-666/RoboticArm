

// // // 设置运行模式


// // // 设置位置

// // // 设置速度

// // // 设置零点


// // // 设置使能
// // // void enable() {
// // //   // let TWAI_id = new Array(4).fill(0);
// // //   // let TWAI_data = new Array(8).fill(0);
// // //   //  TWAI_id = [0x03, 0x00, 0xfd, motorId];
// // // }

// // // 设置停止


// // // 动画执行函数



// // #include <stdint.h>
// // #include <stdio.h>
// // #include <string.h>

// // // 工具函数：将float转为倒序的uint8_t数组（小米电机要求）
// // void floatToUint8Array(float num, uint8_t arr[4]) {
// //     union {
// //         float f;
// //         uint8_t bytes[4];
// //     } u;
// //     u.f = num;
// //     // for (int i = 0; i < 4; i++) printf("测试%02X ", u.bytes[i]);
// //     // // 反转顺序
// //     for (int i = 0; i < 4; i++) {
// //         // arr[i] = u.bytes[3 - i];
// //         arr[i] = u.bytes[i];
// //     }
// // }

// // // 指令参数结构体
// // typedef struct {
// //     uint8_t motorId;
// //     float limit_spd;
// //     float loc_ref;
// //     uint8_t run_mode;
// // } CmdParams;

// // // 指令结果结构体
// // typedef struct {
// //     uint8_t TWAI_id[4];
// //     uint8_t TWAI_data[8];
// // } CmdResult;

// // // 各种策略函数声明
// // void initialPoint(CmdParams *params, CmdResult *result);
// // void enable(CmdParams *params, CmdResult *result);
// // void disable(CmdParams *params, CmdResult *result);
// // void jog5(CmdParams *params, CmdResult *result);
// // void jog0(CmdParams *params, CmdResult *result);
// // void limit_spd(CmdParams *params, CmdResult *result);
// // void loc_ref(CmdParams *params, CmdResult *result);
// // void run_mode(CmdParams *params, CmdResult *result);

// // // 策略分发
// // typedef void (*StrategyFunc)(CmdParams *, CmdResult *);

// // typedef struct {
// //     const char *type;
// //     StrategyFunc func;
// // } StrategyMap;

// // // 各种策略函数实现
// // void initialPoint(CmdParams *params, CmdResult *result) {
// //     result->TWAI_id[0] = 0x06;
// //     result->TWAI_id[1] = 0x00;
// //     result->TWAI_id[2] = 0xfd;
// //     result->TWAI_id[3] = params->motorId;
// //     uint8_t data[8] = {0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00};
// //     memcpy(result->TWAI_data, data, 8);
// // }

// // void enable(CmdParams *params, CmdResult *result) {
// //     result->TWAI_id[0] = 0x03;
// //     result->TWAI_id[1] = 0x00;
// //     result->TWAI_id[2] = 0xfd;
// //     result->TWAI_id[3] = params->motorId;
// //     memset(result->TWAI_data, 0, 8);
// // }

// // void disable(CmdParams *params, CmdResult *result) {
// //     result->TWAI_id[0] = 0x04;
// //     result->TWAI_id[1] = 0x00;
// //     result->TWAI_id[2] = 0xfd;
// //     result->TWAI_id[3] = params->motorId;
// //     memset(result->TWAI_data, 0, 8);
// // }

// // void jog5(CmdParams *params, CmdResult *result) {
// //     result->TWAI_id[0] = 0x12;
// //     result->TWAI_id[1] = 0x00;
// //     result->TWAI_id[2] = 0xfd;
// //     result->TWAI_id[3] = 0x16;
// //     uint8_t data[8] = {0x05,0x70,0x00,0x00,0x07,0x01,0x95,0x54};
// //     memcpy(result->TWAI_data, data, 8);
// // }

// // void jog0(CmdParams *params, CmdResult *result) {
// //     result->TWAI_id[0] = 0x12;
// //     result->TWAI_id[1] = 0x00;
// //     result->TWAI_id[2] = 0xfd;
// //     result->TWAI_id[3] = 0x16;
// //     uint8_t data[8] = {0x05,0x70,0x00,0x00,0x07,0x00,0x7f,0xff};
// //     memcpy(result->TWAI_data, data, 8);
// // }

// // void limit_spd(CmdParams *params, CmdResult *result) {
// //     result->TWAI_id[0] = 0x12;
// //     result->TWAI_id[1] = 0x00;
// //     result->TWAI_id[2] = 0xfd;
// //     result->TWAI_id[3] = params->motorId;
// //     uint8_t arr[4];
// //     floatToUint8Array(params->limit_spd, arr);
// //     result->TWAI_data[0] = 0x17;
// //     result->TWAI_data[1] = 0x70;
// //     result->TWAI_data[2] = 0x00;
// //     result->TWAI_data[3] = 0x00;
// //     memcpy(&result->TWAI_data[4], arr, 4);
// // }

// // void loc_ref(CmdParams *params, CmdResult *result) {
// //     result->TWAI_id[0] = 0x12;
// //     result->TWAI_id[1] = 0x00;
// //     result->TWAI_id[2] = 0xfd;
// //     result->TWAI_id[3] = params->motorId;
// //     uint8_t arr[4];
// //     floatToUint8Array(params->loc_ref, arr);
// //     result->TWAI_data[0] = 0x16;
// //     result->TWAI_data[1] = 0x70;
// //     result->TWAI_data[2] = 0x00;
// //     result->TWAI_data[3] = 0x00;
// //     memcpy(&result->TWAI_data[4], arr, 4);
// // }

// // void run_mode(CmdParams *params, CmdResult *result) {
// //     result->TWAI_id[0] = 0x12;
// //     result->TWAI_id[1] = 0x00;
// //     result->TWAI_id[2] = 0xfd;
// //     result->TWAI_id[3] = params->motorId;
// //     result->TWAI_data[0] = 0x05;
// //     result->TWAI_data[1] = 0x70;
// //     result->TWAI_data[2] = 0x00;
// //     result->TWAI_data[3] = 0x00;
// //     result->TWAI_data[4] = params->run_mode;
// //     result->TWAI_data[5] = 0x00;
// //     result->TWAI_data[6] = 0x00;
// //     result->TWAI_data[7] = 0x00;
// // }

// // // 策略映射表
// // StrategyMap strategies[] = {
// //     {"initialPoint", initialPoint},
// //     {"enable", enable},
// //     {"disable", disable},
// //     {"jog5", jog5},
// //     {"jog0", jog0},
// //     {"limit_spd", limit_spd},
// //     {"loc_ref", loc_ref},
// //     {"run_mode", run_mode}
// // };

// // // 主生成函数
// // int generateCMD(const char *type, CmdParams *params, CmdResult *result) {
// //     int found = 0;
// //     for (int i = 0; i < sizeof(strategies)/sizeof(strategies[0]); i++) {
// //         if (strcmp(type, strategies[i].type) == 0) {
// //             strategies[i].func(params, result);
// //             found = 1;
// //             break;
// //         }
// //     }
// //     if (!found) {
// //         printf("策略未找到: %s\n", type);
// //         return -1;
// //     }
// //     // 打印结果
// //     printf("策略模式: %s [", type);
// //     for (int i = 0; i < 4; i++) printf("0x%02X,", result->TWAI_id[i]);
// //     for (int i = 0; i < 8; i++) printf("0x%02X,", result->TWAI_data[i]);
// //     printf("]\n");
// //     return 0;
// // }

// // // 示例调用
// // int main() {
// //     CmdParams params = { .motorId = 21, .limit_spd = 5.5, .loc_ref = 1.57, .run_mode = 1 };
// //     CmdResult result;
// //     generateCMD("run_mode", &params, &result);
// //     generateCMD("loc_ref", &params, &result);
// //     generateCMD("limit_spd", &params, &result);

// //     params.motorId = 21;
// //     params.limit_spd = 2;
// //     params.loc_ref = 0.57;
// //     params.run_mode = 1;
// //     generateCMD("run_mode", &params, &result);
// //     generateCMD("loc_ref", &params, &result);
// //     generateCMD("limit_spd", &params, &result);

// //     params.motorId = 22;
// //     params.limit_spd = 2;
// //     params.loc_ref = 0.57;
// //     params.run_mode = 1;
// //     generateCMD("run_mode", &params, &result);
// //     generateCMD("loc_ref", &params, &result);
// //     generateCMD("limit_spd", &params, &result);


// //     // result.TWAI_id 和 result.TWAI_data 即为最终指令
// //     return 0;
// // }

// #include <stdio.h>
// #include <stdint.h>
// #include <string.h>

// // 浮点数转倒序 uint8_t 数组
// void numToUint8Array(float num, uint8_t arr[4]) {
//     union {
//         float f;
//         int bytes[4];
//     } u;
//     u.f = num;

//     for (int i = 0; i < 4; i++) {
//         arr[i] = u.bytes[i];
//     }
// }

// // 回调函数类型
// typedef void (*CmdCallback)(uint8_t *cmd, int len);

// // 生成指令
// void generateCmd(const float *actionInfos, int len, CmdCallback callbackFunc) {
//     for (int i = 0; i < len; i += 2) {
//         float location = actionInfos[i];       // 位置，弧度
//         float speed = actionInfos[i + 1];      // 速度，弧度每秒
//         uint8_t run_mode = 1;
//         uint8_t motorId = i / 2 + 22;          // 电机ID，从22开始

//         if (speed == 0) {
//             continue;
//         }

//         // runModeCmd
//         uint8_t runModeCmd[12] = {0x12, 0x00, 0xfd, motorId, 0x05, 0x70, 0x00, 0x00, run_mode, 0x00, 0x00, 0x00};
//         callbackFunc(runModeCmd, 12);

//         // speedCmd
//         uint8_t speedCmd[12] = {0x12, 0x00, 0xfd, motorId, 0x17, 0x70, 0x00, 0x00};
//         uint8_t speedArr[4];
//         numToUint8Array(speed, speedArr);
//         memcpy(&speedCmd[8], speedArr, 4);
//         callbackFunc(speedCmd, 12);

//         // locRefCmd
//         uint8_t locRefCmd[12] = {0x12, 0x00, 0xfd, motorId, 0x16, 0x70, 0x00, 0x00};
//         uint8_t locArr[4];
//         numToUint8Array(location, locArr);
//         memcpy(&locRefCmd[8], locArr, 4);
//         callbackFunc(locRefCmd, 12);
//     }
// }

// // 示例回调函数：打印指令
// void printCmd(uint8_t *cmd, int len) {
//     printf("cmd: ");
//     for (int i = 0; i < len; i++) {
//         printf("%02X ", cmd[i]);
//     }
//     printf("\n");
// }

// // 示例 main
// // int main() {
// //     float actionInfos[12] = {0, 0, 0, 0, 0.8760904f, 1.5355051f, 0, 0, 0, 0, 0, 0};
// //     generateCmd(actionInfos, 12, printCmd);
// //     return 0;
// // }

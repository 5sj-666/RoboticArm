// #include <stdint.h>

// #define P_MIN -12.5f 
// #define P_MAX 12.5f 
// #define V_MIN -30.0f 
// #define V_MAX 30.0f 
// #define KP_MIN 0.0f 
// #define KP_MAX 500.0f 
// #define KD_MIN 0.0f 
// #define KD_MAX 5.0f 
// #define T_MIN -12.0f 
// #define T_MAX 12.0f 
// struct exCanIdInfo{ 
//   uint32_t id:8; 
//   uint32_t data:16; 
//   uint32_t mode:5; 
//   uint32_t res:3; 
// }; 
// can_receive_message_struct rxMsg; 
// can_trasnmit_message_struct txMsg={ 
// .tx_sfid = 0, 
// .tx_efid = 0xff, 
// .tx_ft = CAN_FT_DATA, 
// .tx_ff = CAN_FF_EXTENDED, 
// .tx_dlen = 8, 
// }; 
// #define txCanIdEx (((struct exCanIdInfo)&(txMsg.tx_efid))) 
// #define rxCanIdEx (((struct exCanIdInfo)&(rxMsg.rx_efid))) //将扩展帧 id 解析为自定义数据结构
// int float_to_uint(float x, float x_min, float x_max, int bits){ 
//   float span = x_max - x_min; 
//   float offset = x_min; 
//   if(x > x_max) x=x_max; 
//   else if(x < x_min) x= x_min; 
//   return (int) ((x-offset)*((float)((1<<bits)-1))/span); 
// } 
// #define can_txd() can_message_transmit(CAN0, &txMsg) 
// #define can_rxd() can_message_receive(CAN0, CAN_FIFO1, &rxMsg)

// // 使能电机
// void motor_enable(uint8_t id, uint16_t master_id) 
// { 
//   txCanIdEx.mode = 3; 
//   txCanIdEx.id = id; 
//   txCanIdEx.res = 0; 
//   txCanIdEx.data = master_id; 
//   txMsg.tx_dlen = 8; 
//   txCanIdEx.data = 0; 
//   can_txd(); 
// }

// // 运控模式
// void motor_controlmode(uint8_t id, float torque, float MechPosition, float speed, float kp, float kd) 
// { 
//   txCanIdEx.mode = 1; 
//   txCanIdEx.id = id; 
//   txCanIdEx.res = 0; 
//   txCanIdEx.data = float_to_uint(torque,T_MIN,T_MAX,16); 
//   txMsg.tx_dlen = 8; 
//   txMsg.tx_data[0]=float_to_uint(MechPosition,P_MIN,P_MAX,16)>>8; 
//   txMsg.tx_data[1]=float_to_uint(MechPosition,P_MIN,P_MAX,16); 
//   txMsg.tx_data[2]=float_to_uint(speed,V_MIN,V_MAX,16)>>8; 
//   txMsg.tx_data[3]=float_to_uint(speed,V_MIN,V_MAX,16); 
//   txMsg.tx_data[4]=float_to_uint(kp,KP_MIN,KP_MAX,16)>>8; 
//   txMsg.tx_data[5]=float_to_uint(kp,KP_MIN,KP_MAX,16); 
//   txMsg.tx_data[6]=float_to_uint(kd,KD_MIN,KD_MAX,16)>>8; 
//   txMsg.tx_data[7]=float_to_uint(kd,KD_MIN,KD_MAX,16); 
//   can_txd(); 
// }

// // 停止电机
// void motor_reset(uint8_t id, uint16_t master_id) 
// { 
//   txCanIdEx.mode = 4; 
//   txCanIdEx.id = id; 
//   txCanIdEx.res = 0; 
//   txCanIdEx.data = master_id; 
//   txMsg.tx_dlen = 8; 
//   for(uint8_t i=0;i<8;i++) 
//   { 
//   txMsg.tx_data[i]=0; 
//   } 
//   can_txd(); 
// }

// // 电机模式参数写入命令（通信类型 18，运行模式切换）
// uint8_t runmode; 
// uint16_t index; 
// void motor_modechange(uint8_t id, uint16_t master_id) 
// { 
//   txCanIdEx.mode = 0x12; 
//   txCanIdEx.id = id; 
//   txCanIdEx.res = 0; 
//   txCanIdEx.data = master_id; 
//   txMsg.tx_dlen = 8; 
//   for(uint8_t i=0;i<8;i++) 
//   { 
//   txMsg.tx_data[i]=0; 
//   } 
//   memcpy(&txMsg.tx_data[0],&index,2); 
//   memcpy(&txMsg.tx_data[4],&runmode, 1); 
//   can_txd(); 
// }

// // 电机模式参数写入命令（通信类型 18，控制参数写入）
// uint16_t index; 
// float ref; 
// void motor_write(uint8_t id, uint16_t master_id) 
// { 
//   txCanIdEx.mode = 0x12; 
//   txCanIdEx.id = id; 
//   txCanIdEx.res = 0; 
//   txCanIdEx.data = master_id; 
//   txMsg.tx_dlen = 8; 
//   for(uint8_t i=0;i<8;i++) 
//   { 
//   txMsg.tx_data[i]=0; 
//   } 
//   memcpy(&txMsg.tx_data[0],&index,2); 
//   memcpy(&txMsg.tx_data[4],&ref,4); 
//   can_txd(); 
// }

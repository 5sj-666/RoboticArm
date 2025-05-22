/* 小米电机相关 */

export default {
  numToUnit8Array, 
  generateCMD,
  // double2floatCode,
  parse_cmd
}
/**
 * @description 将 64 位浮点数转换为 32 位浮点数的 Uint8Array 表示
  // 示例使用
  const num64Bit = 3.141592653589793;
  const num32BitUint8Array = convert64BitTo32BitFloat(num64Bit);
  console.log('64 位浮点数:', num64Bit);
  console.log('32 位浮点数的 Uint8Array 表示:', num32BitUint8Array);  
 * @param {*} num 
 * @returns 
 */
// function convert64BitTo32BitFloat(num) {
export function numToUnit8Array(num) {
  // 创建一个长度为 4 的 ArrayBuffer
  const buffer = new ArrayBuffer(4);
  // 创建一个 DataView 来操作 ArrayBuffer
  const dataView = new DataView(buffer);
  // 将 64 位的 number 转换为 32 位浮点数并写入 DataView
  dataView.setFloat32(0, num);
  // 创建一个 Uint8Array 视图来读取数据
  const uint8Array = new Uint8Array(buffer);
  // 由于小米电机的数据是倒序的，所以需要反转
  return uint8Array.reverse();
}

  

// /**
//  * @description 获取数字（64位, Number类型即双精度double）的32位（单精度float）原始码。 
//  *              举个例子： 12.5的float原始码： 符号位： 0  E指数：1000 0010 尾数：100 1000 0000 0000 0000 0000
//  *              
//  *              原理参考（https://blog.csdn.net/whyel/article/details/81067989）
//  *              
//  * @param {*} num 
//  * @return { 32位Array<0, 1> } 例子  ['0','1','0','0','0','0','0','1','0','1','0','0','1','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0']
//  */
// export function double2floatCode(num) {
//   if(num == 0) {
//     return fillZero([], 32);
//   }
//   let num0b = (num).toString(2).replace('-', '');
//   console.log('double2floatCode  num: ', num, '二进制: ', num0b);
//   let integer0b = num0b.split('.')[0];
//   let fraction = num0b.split('.').length === 2 ? num0b.split('.')[1] : [];
//   // debugger;

//   // 符号
//   let signal = num >= 0 ? '0' : '1';
//   // -----  指数部分  -----
//   let e = 127;
  
//   let first1Index = num0b.indexOf('1');  // 二进制1第一次出现的位置
//   let pointIndex = num0b.indexOf('.') || 0;  // 小数点位置
//   // 表示整数部分大于等于1,   例子1： 10.011 => first1Index：0 , pointIndex: 2  e为1   例子2： 0.011 first1Index：3 , pointIndex: 1  e为-2
//   if(first1Index < pointIndex) {
//     // 由于二进制都是1开头，所以大于的1的数字e为 pointIndex - 1
//     e += pointIndex - 1;
//   }else {
//     e += pointIndex - first1Index;
//   }
//   let e0bArr = e.toString(2).split('');
//   // 128的二进制是1111 1111，两种情况： 小于128的往前补0， 大于128的不用补 122： 0111 1010      133： 10000101
//   if(e < 128) {
//     e0bArr = fillZero(e0bArr, 8, 'head');
//   }
//   // -----  指数部分结束  -----
  
//   // -----尾数部分-----
//   // float的尾数为23位 
//   /*
//     mantissaBasis尾数取值的开始坐标，first1Index由于小数点的前后位置，可能会差1，所以在first1Index < pointIndex（num > 1）时候，加一位
//     例子1： num < 1
//         0.55的二进制: 0.1000 1100 1100 1100 1100 1100  
//         第一次出现1的位置 first1Index = 2 ; 小数点位置 pointIndex = 1;
//         [...integer0b, ...fraction] = [0, 1,0,0,0, 1,1,0,0, 1,1,0,0, 1,1,0,0, 1,1,0,0, 1,1,0,0 ]
//         mantissaBasis = 2 即：first1Index
//         尾数部分是 000 1100 1100 1100 1100 1100
//     例子2： num > 1
//         3.06 二进制:  11.0000 1111 0101 1100 0010 1000 1111 0101 1100 0010 1000 111 1011
//         第一次出现1的位置 first1Index = 0 ; 小数点位置 pointIndex = 2;
//         [...integer0b, ...fraction] = [1,1, 0,0,0,0, 1,1,1,1, 0,1,0,1, 1,1,0,0, 0,0,1,0, 1,0,0,0]
//         mantissaBasis = 1 即：first1Index + 1 (二进制的小数点在后边)
//         最后尾数部分是 100 0111 1010 1110 0001 0100
//   */
//   let mantissaBasis = first1Index + (first1Index < pointIndex ? 1: 0)
//   // 尾数
//   let mantissa = [...integer0b, ...fraction].slice(mantissaBasis, mantissaBasis + 23);
//   // -----  尾数部分结束  -----

//   // debugger;
//   console.log('single', signal, 'e', e, 'mantissa: ', mantissa.join(''));

//   // 32位浮点数编码数组
//   const floatCodeArr = [signal, ...e0bArr, ...fillZero(mantissa, 23)];
//   // debugger;
//   console.log('floatCodeArr: ', floatCodeArr.join(''));
//   return floatCodeArr;

//    /**
//    * @description 补充0位， 指数e和尾数需要8和23位，在此补充不足的尾数，用'0'填充
//    *              例子: 12.5 的尾数是: 1001 需要补充到23位： 100 1000 0000 0000 0000 0000
//    * @param { Array } arr
//    * @param { number } len
//    * @param { number } type head 往前添加； tail 往后添加 
//    */
//    function fillZero(arr, len, type = 'tail') {
//     if(type === 'head') {
//       return [...new Array(len - arr.length).fill('0'), ...arr];
//     }else {
//       // return arr.concat(new Array(len - arr.length).fill('0'));
//       return [...arr , ...new Array(len - arr.length).fill('0')]
//     }
    
//   }
// }


// /**
//  * 获取四个字节的Uint8Array， 比如 12.5 表示为 [65, 72, 0, 0]
//  * 转化为4字节的十六进制： 41 48 00 00, 二进制，十进制，十六进制表示的数都一样，传给Uint8Array就行了, 直接用Uint8Array.from([0x41, 0x48, 0x00, 0x00])；
//  * 例子 
//    ['0','1','0','0','0','0','0','1','0','1','0','0','1','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0'] 
//    => [0x41, 0x48, 0x00, 0x00] 或者十进制 [65, 72, 0, 0]
//  * @param { double } num 
//  * @return { Uint8Array }
//  */
// export function numToUnit8Array(num) {
//   let floatCodeArr = double2floatCode(num);
//   // debugger;
//   let binaryArr = [];
//   for(let i = 0; i < floatCodeArr.length; i = i + 8) {
//     // 获取二进制字符串
//     let binaryStr = '0b' + floatCodeArr.slice(i, i + 8).join('');
//     binaryArr.push(binaryStr);
//   }
//   // 观察小米电机的数据，发现需要倒叙
//   console.log('--numToUnit8Array: num ', num, 'binaryArr: ', new Uint8Array(binaryArr));
//   return new Uint8Array(binaryArr.reverse());
// }


/**
 * @description 将32位浮点数的二进制数据转换为 64 位浮点数
 * @param {*} binaryData 
// // 示例使用
// const binaryData = [0x41, 0x48, 0xF5, 0xC3]; // 32 位浮点数的二进制数据
// const result = convert32BitFloatTo64BitNumber(binaryData);
// console.error("-----convert32BitFloatTo64BitNumber   result: ", result);
 * @returns 
 */
export function convert32BitFloatTo64BitNumber(binaryData) {
  // 创建一个 ArrayBuffer 用于存储二进制数据
  const buffer = new ArrayBuffer(4);
  // 创建一个 DataView 对象来操作 ArrayBuffer
  const view = new DataView(buffer);
  // 将二进制数据写入 DataView
  for (let i = 0; i < 4; i++) {
      view.setUint8(i, binaryData[i]);
  }
  // 从 DataView 中读取 32 位浮点数
  const float32 = view.getFloat32(0);
  // 将 32 位浮点数转换为 64 位浮点数（JavaScript 的 Number 类型本身就是 64 位浮点数）
  return float32;
}


/**
 * @description 生成指令，采用策略模式，注意： 这里生成的是单一的指令,
 *              策略的命名为了简单，跟小米电机的文档保持命名一致
 * @param { string } type 策略类型
 * @param { obj } params 所需的参数，暂无法全部确定
 */
export function generateCMD(type, params = {}) {
  // let TWAI_id = new Array(4).fill(0);
  // let TWAI_data = new Array(8).fill(0);

  // if (type === "enable") {
  //   TWAI_id = [0x03, 0x00, 0xfd, 0x15];
  //   // TWAI_data = []
  // } else if (type === "disable") {
  //   TWAI_id = [0x04, 0x00, 0xfd, 0x15];
  // } else if (type === "jog5") {
  //   TWAI_id = [0x12, 0x00, 0xfd, 0x15];
  //   TWAI_data = [0x05, 0x70, 0x00, 0x00, 0x07, 0x01, 0x95, 0x54];
  // } else if (type === "jog0") {
  //   TWAI_id = [0x12, 0x00, 0xfd, 0x15];
  //   TWAI_data = [0x05, 0x70, 0x00, 0x00, 0x07, 0x00, 0x7f, 0xff];
  // }

  // console.log("TWAI_id: ", TWAI_id, "TWAI_data: ", TWAI_data);
  // let cmdFrame = Uint8Array.from([...TWAI_id, ...TWAI_data]);

  let TWAI_id = new Array(4).fill(0);
  let TWAI_data = new Array(8).fill(0);

  var Strategies =  {
    initialPoint({motorId}) {
      // AA 01 00 08     06 00 01 05     01 00 00 00 00 00 00 00     7A
      TWAI_id = [0x06, 0x00, 0xfd, motorId];
      TWAI_data = [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    },
    enable: ({motorId}) => {
      TWAI_id = [0x03, 0x00, 0xfd, motorId];
    },
    disable: ({motorId}) => {
      TWAI_id = [0x04, 0x00, 0xfd, motorId];
    },
    jog5: () => {
      TWAI_id = [0x12, 0x00, 0xfd, 0x16];
      TWAI_data = [0x05, 0x70, 0x00, 0x00, 0x07, 0x01, 0x95, 0x54];
    },
    jog0: () => {
      TWAI_id = [0x12, 0x00, 0xfd, 0x16];
      TWAI_data = [0x05, 0x70, 0x00, 0x00, 0x07, 0x00, 0x7f, 0xff];
    },
    // 设置速度，通信类型18， limit_spd: [0 - 30]
    limit_spd: ({motorId, limit_spd}) => {
      TWAI_id = [0x12, 0x00, 0xfd, motorId];
      TWAI_data = [0x17, 0x70, 0x00, 0x00, ...numToUnit8Array(limit_spd)];
    },
    // 设置要旋转的位置, 通信类型18
    loc_ref: ({motorId, loc_ref}) => {
      TWAI_id = [0x12, 0x00, 0xfd, motorId];
      TWAI_data = [0x16, 0x70, 0x00, 0x00, ...numToUnit8Array(loc_ref)];
    },
    // 更改运行模式, 通信类型18
    run_mode: ({motorId, run_mode}) => {
      TWAI_id = [0x12, 0x00, 0xfd, motorId];
      TWAI_data = [0x05, 0x70, 0x00, 0x00, run_mode, 0x00, 0x00, 0x00];
    }
  }

  Strategies[type](params);
  console.log('策略模式: ', type , [...TWAI_id, ...TWAI_data]);
  return Uint8Array.from([...TWAI_id, ...TWAI_data]);

}

/**
 * @description 使用建造者模式来构建指令
 * @return { Array<cmd> }
 */
class build {
  motorId
  cmdArr = []

  setMotorId(motorId){
    this.motorId = motorId;
    return this;
  }

  enableCmd() {
    this.cmdArr.push(generateCMD('enable'))
    return this;
  }
  disableCmd() {
    this.cmdArr.push(generateCMD('disable'))
    return this;
  }

  runModeCmd() { }

  // 核心指令
  coreCmd() { }

  getCmdArr() {
    return this.cmdArr;
  }
}

/**
 * @description 位置模式的具体的实现类
 */
export class Loc_Builder extends build {
  constructor({ motorId }) {
    super();
    this.setMotorId(motorId)
  }

  enableCmd() {
    this.cmdArr.push(generateCMD('enable', {motorId: this.motorId}))
    return this;
  }
  disableCmd() {
    this.cmdArr.push(generateCMD('disable', {motorId: this.motorId}))
    return this;
  }

  runModeCmd() {
    let cmd = generateCMD('run_mode', {motorId: this.motorId, run_mode: 1})
    this.cmdArr.push(cmd);
    return this;
  }
  
  coreCmd({limit_spd, loc_ref}) {
    let limit_spd_cmd = generateCMD('limit_spd', {motorId: this.motorId, limit_spd});
    let loc_ref_cmd = generateCMD('loc_ref', {motorId: this.motorId, loc_ref});
    this.cmdArr.push(limit_spd_cmd, loc_ref_cmd);
    return this;
  }

}

/**
 * @description 位置模式的指挥者
 * @param { object } { motorId: number, limit_spd: number, loc_ref: number(0-30) } 
 * @returns { Array<cmd> }
 */
export function Loc_Director({motorId, limit_spd, loc_ref}) {
  // 保留四位小数
  // loc_ref = parseInt(loc_ref * 10000) / 10000;

  // if(!motorId || !limit_spd || !loc_ref) {
  //   console.log('请输入有效值');
  //   return [];
  // }

  // 小米电机的规范要求， 0 < limit_spd < 30, 在此限制为10
  if(limit_spd > 10) {
    console.warn("---Loc_Director   limit_spd: 超速: ", limit_spd);
    limit_spd = 10;
  }else if(limit_spd < 0) {
    limit_spd = 0;
  }
  // let loc_instance = new Loc_Builder({motorId}).runModeCmd().enableCmd().coreCmd({ limit_spd, loc_ref });
  // let loc_instance = new Loc_Builder({motorId}).runModeCmd().enableCmd().coreCmd({ limit_spd, loc_ref });
  // let loc_instance = new Loc_Builder({motorId}).runModeCmd().coreCmd({ limit_spd, loc_ref });
  let loc_instance = new Loc_Builder({motorId}).coreCmd({ limit_spd, loc_ref });
  return loc_instance.getCmdArr();
}

export function enable_Director({motorId}) {
  return new Loc_Builder({motorId}).enableCmd().runModeCmd().getCmdArr();
}

export function disable_Director({motorId}) {
  return new Loc_Builder({motorId}).disableCmd().getCmdArr();
}

/**
 * @description 解析指令
 * @param {*} cmd 2,80,16,fd,8d,f1,80,3b,80,76,00,f6
 * 帧头： 2, 80, 16, fd 
 * 帧内容： 8d, f1, 80, 3b, 80, 76, 00, f6
 * @return { object } { motorId: number, error: str, content: object, rawCmd: Array, parseStr: string }
 */
// export function parse_cmd(cmd = [0x2,0x80,0x16,0xfd,0x8d,0xf1,0x80,0x3b,0x80,0x76,0x00,0xf6]) {
export function parse_cmd(cmd) {
  console.log("--parse_cmd: ", cmd);
  if(!cmd || cmd.length !== 12) {
    console.log('指令错误');
    return ;
  }

  let identify = cmd.slice(0, 4);
  let data = cmd.slice(4, 12);
  // debugger;

  const headerObj = handleFrameHead(cmd);
  // console.log('headerObj: ', headerObj);
  

  let obj = { }

  // hex2bit(0x80);

  const strategy = {
    0: msg_0,
    // 2: msg_2,
    3: msg_3,
    4: msg_4,
    18: msg_18,
    // getResult() {}
  }

  if(strategy.hasOwnProperty(headerObj.type)) {
    return strategy[headerObj.type](cmd, headerObj);
  }



  //  回馈帧
  if(identify[0] === 2) {
    /**
      帧头: 
        bit7~0:主机CAN _ID 
        Bit8~Bit15:当前电机CAN ID  
        bit21~16:故障信息（0无 1有）  
        bit21: 未标定  
        bit20: HALL编码故障  
        bit19: 磁编码故障  
        bit18: 过温  
        bit17: 过流  
        bit16: 欠压故障  
        bit22~23:模式状态  
          0 : Reset模式[复位]  
          1 : Cali 模式[标定]  
          2 : Motor模式[运行]  
        Bit28~bit24 : 2  
        
        举个例子: 
          2,80,16,fd 对应二进制： 0000 0010   1000 0000   0001 0110    1111 1101 ; bit坐标从左到右： 31 =》 0
          bit28~24: 0 0010  => 2    通信类型是2
          bit23~22: 10     => 2    模式状态是2 ： Motor模式[运行]
          bit21~16: 00 0000 => 0    无故障信息
          bit15~8: 0001 0110 => 22  CAN ID是22
          bit7~0: 1111 1101 => 253 主机CAN ID是253

      帧内容Byte0~Byte7  :
        Byte0~1: 当前角度 [0~65535]对应(-4π~4π)  
        Byte2~3: 当前角速度 [0~65535]对应(-30rad/s~30rad/s)  
        Byte4~5:当前力矩 [0~65535]对应（-12Nm~12Nm）  
        Byte6~7:当前温度：Temp(摄氏度）*10  

          举个例子: 8d f1 80 3b 80 76 00 f6
          0x8df1 => 36337 => 36337/65535 * 8π ≈ 0.554 * 8π = 4.43π  当前角度 4.43π - 4π = 0.43π = 0.43 * π * 180 / π = 77.4°
          0x803b => 32827 => 32827/65535 * 60 ≈ 0.5009 * 60 = 30.05 rad/s  当前角速度 30.05 - 30 = 0.05 rad/s
          0x8076 => 32886 => 32886/65535 * 24 ≈ 0.5018 * 24 = 12.04 Nm  当前力矩 12.04 - 12 = 0.04 Nm
          00,f6 => 246 => 246     当前温度 246 / 10 = 24.6 摄氏度
     */
    
    let identifier = identify.map(hex =>  hex2bit(hex)).flat();

    // console.log('identifier: ', identifier);

    let masterId = parseInt(identifier.slice(31-7, 31 - 0 + 1).join(''), 2);
    let motorId = parseInt(identifier.slice(31 - 15, 31 - 8 + 1).join(''), 2);
    let errObj = {
      21: '未标定',
      20: 'HALL编码故障',
      19: '磁编码故障',
      18: '过温',
      17: '过流',
      16: '欠压故障'
    }
    let errorArr = identifier.slice(31 - 21, 31 - 16 + 1).map((boolean, index) => boolean == "1" ? errObj[21 - index] : '').filter(item => item);
    let modeObj = {
      0: 'Reset模式[复位]',
      1: 'Cali 模式[标定]',
      2: 'Motor模式[运行]'
    }
    let motorMode = modeObj[parseInt(identifier.slice(31 - 23, 31 - 22 + 1).join(''), 2)];

    // 当前角度
    let loc_ref = data.slice(0, 2);
    // let loc_ref_num = convert32BitFloatTo64BitNumber(loc_ref);
    let loc_ref_num =  ( ((loc_ref[0] << 8) | loc_ref[1]) - 32767 ) / 8192 * 180; // / 65535 
    // let loc_ref_num =   (loc_ref[0] << 8) | loc_ref[1];
    // 角速度
    let limit_spd = data.slice(2, 4);
    let limit_spd_num = ((limit_spd[0] << 8) | limit_spd[1]) / 65535 * 60 - 30;
    // 扭矩
    let torque = data.slice(4, 6);
    let torque_num = ((torque[0] << 8) | torque[1]) / 65535 * 24 - 12;
    // 温度
    let temp = data.slice(6, 8);
    let temp_num = ((temp[0] << 8) | temp[1]) / 10;

    // debugger;
    return {
      masterId, motorId, errorArr, motorMode, loc_ref_num, limit_spd_num, torque_num, temp_num,
      rawCmd: cmd,
      parseStr: `电机id: ${motorId}, 错误: ${errorArr.join(',') ? errorArr.join(',') : '无'}, 电机模式: ${motorMode}, 当前角度: ${ loc_ref_num }°, 角速度: ${parseInt(limit_spd_num * 100) / 100}rad/s, 扭矩: ${parseInt(torque_num * 100) / 100}Nm, 温度: ${temp_num}`
    }
   

  }

   /**
   * @description 帧头处理 固定分为三段: 
   *                  bit28~24(通信类型) 
   *                  bit23~8(主机CAN_ID/目标电机CAN_ID/故障信息/电机信息) 
   *                  bit7~0(目标电机CAN_ID/主机CAN_ID)
   *              bit23~8,bit7~0在此只做分隔，具体的解析在对应的通信类型处理中
   * @param {*} identify 
   * @returns {
   *    bit28_24: string,
   *    bit23_8: string,
   *    bit7_0: string
   * }
   */
  function handleFrameHead(cmd) {
   
    // debugger;
    let identify = cmd.slice(0, 4);
    let identifier = identify.map(hex =>  hex2bit(hex)).flat();
    // console.log('handleFrameHead, ', identify, identifier);
    let bit28_24 = identifier.slice(31 - 28, 31 - 24 + 1).join('');
    let bit23_8 = identifier.slice(31 - 23, 31 - 8 + 1).join('');
    let bit7_0 = identifier.slice(31-7, 31 - 0 + 1).join('');
    // debugger;
    return {
      type: parseInt(bit28_24, 2),
      bit28_24,
      bit23_8,
      bit7_0,
    }
  }

  /**
   * 16进制转二进制，不足8位补0
   * @param {*} hex 
   * @returns 
   */
  function hex2bit(hex) {
    // console.warn(hex.toString(16) + " hex2bit: ", parseInt(hex).toString(2).padStart(8, '0').split(''));
    return parseInt(hex).toString(2).padStart(8, '0').split('');
  }


  /**
   * @description 获取设备ID （通信类型0） ；获取设备的ID和64位MCU唯一标识符 
   */
  function msg_0(cmd, headerObj) {
    // 应答帧
    if(parseInt(headerObj.bit7_0, 2) === 0xFE) {
      let canId = parseInt(headerObj.bit23_8, 2);
      let MCUId = cmd.slice(4, 12);
      return {
        canId,
        masterId: 0xFE,
        MCUId,
        rawCmd: cmd,
        parseStr: `获取到${canId}设备ID: ${MCUId.join('')}}`
      }
    }else { // 请求帧
      let canId = parseInt(headerObj.bit7_0, 2);
      let masterId = parseInt(headerObj.bit23_8, 2);
      return {
        canId,
        masterId,
        rawCmd: cmd,
        parseStr: `请求获取${canId}}电机的设备ID`
      }
    }
    
  }

  function msg_3(cmd, headerObj) {
    // console.log("--------电机使能---------");
    let canId = parseInt(headerObj.bit7_0, 2);
    let masterId = parseInt(headerObj.bit23_8, 2);
    return {
      canId, masterId,
      rawCmd: cmd,
      parseStr: `③使能${canId}电机`
    }
  }

  function msg_4(cmd, headerObj) {
    console.log("--------电机停止---------");
    let canId = parseInt(headerObj.bit7_0, 2);
    let masterId = parseInt(headerObj.bit23_8, 2);
    return {
      canId, masterId,
      rawCmd: cmd,
      parseStr: `④停止${canId}电机`
    }
  }

  function msg_6(cmd, headerObj) {
    console.log("--------置设为机械零位（掉电丢失）---------");
  }

  function msg_7(cmd, headerObj) {
    console.log("--------设置电机CAN_ID---------");
  }

  function msg_17(cmd, headerObj) {
    console.log("-------- 单个参数读取(通信类型17)---------");
  }

  function msg_18(cmd, headerObj) {
    console.log("-------- 单个参数写入(通信类型18) （掉电丢失）---------");
    let canId = parseInt(headerObj.bit7_0, 2);
    let masterId = parseInt(headerObj.bit23_8, 2);

    let cmdData = cmd.slice(4, 12);

    // 例子: 文档上是0x7005 但在此的前两位数组是[0x05, 0x70]，所以需要reverse
    let writeType = cmdData[1] << 8 | cmdData[0];

    let parseStr = `①⑧写入${canId}电机参数`;
    /**
        0X7005  run_mode  0: 运控模式  1: 位置模式  2: 速度模式  3: 电流模式  uint8  1   W/R 
     */
    if(writeType === 0X7005) {
      let run_mode = cmdData[4];
      let run_modeObj = {
        0: '运控模式',
        1: '位置模式',
        2: '速度模式',
        3: '电流模式'
      }
      parseStr = `①⑧更改${canId}电机的run_mode为${run_modeObj[run_mode] || run_mode}`;
    }

    // 0X7016  loc_ref  位置模式角度指令  float  4  rad  W/R  
    if(writeType === 0X7016) {
      let loc_ref = cmdData.slice(4, 8).reverse();
      // debugger;
      // 待办: loc_ref 经过了numtoUnit8Array处理，所以需要转回来 
      parseStr = `①⑧更改${canId}电机的位置模式角度为${ convert32BitFloatTo64BitNumber(loc_ref) / Math.PI * 180 }°`;
    }
    // 0X7017  limit_spd  位置模式速度限制 float  4  0~30rad/s  W/R 
    if(writeType === 0X7017) {
      let limit_spd = cmdData.slice(4, 8).reverse();
      // 待办: limit_spd 经过了numtoUnit8Array处理，所以需要转回来 
      parseStr = `①⑧更改${canId}电机的位置模式速度限制为${ convert32BitFloatTo64BitNumber(limit_spd) }`;
    }

    return {
      canId, masterId,
      rawCmd: cmd,
      parseStr
    }

  }

  function msg_21(cmd, headerObj) {
    console.log("-------- 故障反馈帧(通信类型21)---------");
  }

  function msg_22(cmd, headerObj) {
    console.log("-------- 波特率修改(通信类型22) ---------");
  }
}




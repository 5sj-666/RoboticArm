/* 小米电机相关 */

export default {
  numToUnit8Array, 
  generateCMD,
  double2floatCode
}

/**
 * @description 获取数字（64位, Number类型即双精度double）的32位（单精度float）原始码。 
 *              举个例子： 12.5的float原始码： 符号位： 0  E指数：1000 0010 尾数：100 1000 0000 0000 0000 0000
 *              
 *              原理参考（https://blog.csdn.net/whyel/article/details/81067989）
 *              
 * @param {*} num 
 * @return { 32位Array<0, 1> } 例子  ['0','1','0','0','0','0','0','1','0','1','0','0','1','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0']
 */
export function double2floatCode(num) {
  if(num == 0) {
    return fillZero([], 32);
  }
  let num0b = (num).toString(2).replace('-', '');
  console.log('num: ', num, '二进制: ', num0b);
  let integer0b = num0b.split('.')[0];
  let fraction = num0b.split('.').length === 2 ? num0b.split('.')[1] : [];
  // debugger;

  // 符号
  let signal = num >= 0 ? '0' : '1';
  // -----  指数部分  -----
  let e = 127;
  
  let first1Index = num0b.indexOf('1');  // 二进制1第一次出现的位置
  let pointIndex = num0b.indexOf('.') || 0;  // 小数点位置
  // 表示整数部分大于等于1,   例子1： 10.011 => first1Index：0 , pointIndex: 2  e为1   例子2： 0.011 first1Index：3 , pointIndex: 1  e为-2
  if(first1Index < pointIndex) {
    // 由于二进制都是1开头，所以大于的1的数字e为 pointIndex - 1
    e += pointIndex - 1;
  }else {
    e += pointIndex - first1Index;
  }
  let e0bArr = e.toString(2).split('');
  // 128的二进制是1111 1111，两种情况： 小于128的往前补0， 大于128的不用补 122： 0111 1010      133： 10000101
  if(e < 128) {
    e0bArr = fillZero(e0bArr, 8, 'head');
  }
  // -----  指数部分结束  -----
  
  // -----尾数部分-----
  // float的尾数为23位 
  /*
    mantissaBasis尾数取值的开始坐标，first1Index由于小数点的前后位置，可能会差1，所以在first1Index < pointIndex（num > 1）时候，加一位
    例子1： num < 1
        0.55的二进制: 0.1000 1100 1100 1100 1100 1100  
        第一次出现1的位置 first1Index = 2 ; 小数点位置 pointIndex = 1;
        [...integer0b, ...fraction] = [0, 1,0,0,0, 1,1,0,0, 1,1,0,0, 1,1,0,0, 1,1,0,0, 1,1,0,0 ]
        mantissaBasis = 2 即：first1Index
        尾数部分是 000 1100 1100 1100 1100 1100
    例子2： num > 1
        3.06 二进制:  11.0000 1111 0101 1100 0010 1000 1111 0101 1100 0010 1000 111 1011
        第一次出现1的位置 first1Index = 0 ; 小数点位置 pointIndex = 2;
        [...integer0b, ...fraction] = [1,1, 0,0,0,0, 1,1,1,1, 0,1,0,1, 1,1,0,0, 0,0,1,0, 1,0,0,0]
        mantissaBasis = 1 即：first1Index + 1 (二进制的小数点在后边)
        最后尾数部分是 100 0111 1010 1110 0001 0100
  */
  let mantissaBasis = first1Index + (first1Index < pointIndex ? 1: 0)
  // 尾数
  let mantissa = [...integer0b, ...fraction].slice(mantissaBasis, mantissaBasis + 23);
  // -----  尾数部分结束  -----

  // debugger;
  console.log('single', signal, 'e', e, 'mantissa: ', mantissa.join(''));

  // 32位浮点数编码数组
  const floatCodeArr = [signal, ...e0bArr, ...fillZero(mantissa, 23)];
  // debugger;
  console.log('floatCodeArr: ', floatCodeArr.join(''));
  return floatCodeArr;

   /**
   * @description 补充0位， 指数e和尾数需要8和23位，在此补充不足的尾数，用'0'填充
   *              例子: 12.5 的尾数是: 1001 需要补充到23位： 100 1000 0000 0000 0000 0000
   * @param { Array } arr
   * @param { number } len
   * @param { number } type head 往前添加； tail 往后添加 
   */
   function fillZero(arr, len, type = 'tail') {
    if(type === 'head') {
      return [...new Array(len - arr.length).fill('0'), ...arr];
    }else {
      // return arr.concat(new Array(len - arr.length).fill('0'));
      return [...arr , ...new Array(len - arr.length).fill('0')]
    }
    
  }
}


/**
 * 获取四个字节的Uint8Array， 比如 12.5 表示为 [65, 72, 0, 0]
 * 转化为4字节的十六进制： 41 48 00 00, 二进制，十进制，十六进制表示的数都一样，传给Uint8Array就行了, 直接用Uint8Array.from([0x41, 0x48, 0x00, 0x00])；
 * 例子 
   ['0','1','0','0','0','0','0','1','0','1','0','0','1','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0'] 
   => [0x41, 0x48, 0x00, 0x00] 或者十进制 [65, 72, 0, 0]
 * @param { double } num 
 * @return { Uint8Array }
 */
export function numToUnit8Array(num) {
  let floatCodeArr = double2floatCode(num);
  // debugger;
  let binaryArr = [];
  for(let i = 0; i < floatCodeArr.length; i = i + 8) {
    // 获取二进制字符串
    let binaryStr = '0b' + floatCodeArr.slice(i, i + 8).join('');
    binaryArr.push(binaryStr);
  }
  // 观察小米电机的数据，发现需要倒叙
  return new Uint8Array(binaryArr.reverse());
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
    // 更改运行模式
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
  loc_ref = parseInt(loc_ref * 10000) / 10000;

  // if(!motorId || !limit_spd || !loc_ref) {
  //   console.log('请输入有效值');
  //   return [];
  // }

  // 小米电机的规范要求， 0 < limit_spd < 30
  if(limit_spd > 30) {
    limit_spd = 30;
  }else if(limit_spd < 0) {
    limit_spd = 0;
  }
  let loc_instance = new Loc_Builder({motorId}).runModeCmd().enableCmd().coreCmd({ limit_spd, loc_ref });
  return loc_instance.getCmdArr();
}



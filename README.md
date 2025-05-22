# 机械臂:

## 需要准备的物料：

| 名称              | 数量 | 价格      |
| --------------- | -- | ------- |
| 小米电机            | 3  | 1497元   |
| ESP32 N16R8     | 1  | 54.90元  |
| SN65HVD23x CAN模块   | 1  | 18.5元      | 
| 艾迈斯线XT30插头带线    | 3  | 12.6元   |
| usb-can转换器      | 1  | 79元     |
| 24V10A电源        | 1  | 46.56元  |
| DC5.5转XT30转接线   | 1  | 10元     |
| 黑色绝缘胶带          | 1  | 3.97元   |
| 杜邦线             | 2板 | 5.26元   |
| 螺丝螺母套装          | 1  | 17.91元  |
| 3D打印模型          | 1  | 自己打印，50元    |
| 12V电源           | 1  | 11.16元  |
| 硅胶线18AWG（红黑2米）  | 2  | 3.4元    |
| 特氟龙双绞高温线  | 1  | 4.48元    |
| 艾迈斯线XT30连接器线公转母 | 2  | 4.2元    |
| 合计              |    | 1818.94 |


## 单片机部分(esp32文件夹) :scream_cat: ： 
1. idf.py set-target esp32-s3 
2. idf.py build 
3. idf.py flash
4. idf.py monitor

## 前端部分（web文件夹） :scream_cat: ：
1. npm install
2. npm run dev 

## APP端：
使用flutter技术，在开发中。主要页面与功能跟web端类似。

初始化🍺 ：
![image](assets/example.png)

运行中示例💪 ：
![image](assets/example-pose.png)

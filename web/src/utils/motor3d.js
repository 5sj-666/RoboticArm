import * as THREE from 'three'//导入three.js核心库
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' //导入轨道控制器
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'//导入GLTF模型加载器

import { TransformControls } from 'three/addons/controls/TransformControls.js'; // 控制

// import huan3 from '/3dModules/huan3.gltf?url'

// console.log(huan3);




class motor3d {
  constructor(selector) {    
    this.container = document.querySelector(selector); //获取容器
    this.scene;
    this.camera;
    this.renderer;
    this.orbit;
    this.control;
    this.init(); //初始化
    this.animate();//循环函数
    this.angle_top = 0;
    this.angle_center = 0;
    this.angle_bottom = 0;
    var that = this;

  }

  async init() {
    // 初始化场景
    this.initScene()    
    // 初始化辅助轴
    this.initAxesHelper()
    // 初始化灯光
    this.initLight()
    // 初始化Mesh
    this.initMesh()
    // 初始化相机
    this.initCamera()
    // 初始化渲染器
    this.initRender()
    // 初始化轨道控制器
    this.initControls()
    // 监听场景大小改变，重新渲染尺寸
    window.addEventListener('resize',this.onWindowResize.bind(this))
  }
  
  initScene() {
    this.scene = new THREE.Scene()
    // this.scene.background = new THREE.Color(0xa0a0a0);
    this.scene.add( new THREE.GridHelper( 5, 10, 0x888888, 0x444444 ) );
    // this.scene.fog = new THREE.Fog(0x000000, 0, 10000) // 添加雾的效果
  }

  initAxesHelper() {
    const axesHelper = new THREE.AxesHelper(5)
    this.scene.add(axesHelper)
  }

  initLight() {
    const hesLight = new THREE.HemisphereLight(0xffffff,0x444444)
    hesLight.intensity = 0.6
    this.scene.add(hesLight)

    const dirLight = new THREE.DirectionalLight()
    dirLight.position.set(5,5,5)
    this.scene.add(dirLight)    
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
    this.camera.position.set(1.5, 2, 3)
}

initRender() {
  this.renderer = new THREE.WebGLRenderer({antialias:true})//设置抗锯齿
  //设置屏幕像素比
  this.renderer.setPixelRatio(window.devicePixelRatio)
  //渲染的尺寸大小
  this.renderer.setSize(window.innerWidth,window.innerHeight) 
  // 添加到容器
  this.container.appendChild(this.renderer.domElement)
}


 render() { 
    this.renderer.render(this.scene,this.camera)
  }

  animate() { 
    this.renderer.setAnimationLoop(this.render.bind(this))
  }

  initControls() {
    this.orbit = new OrbitControls(this.camera,this.renderer.domElement)
    // 开启控制器的阻尼效果
    // this.orbit.enableDamping = true
    // 使用控制器
    this.orbit.update()
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()//更新矩阵，将3d内容投射到2d画面上转换
    this.renderer.setSize(window.innerWidth,window.innerHeight)
  }

  /**
   * @description 
   */
  // async rotateArm(type, angle) {
  //   console.log('旋转手臂');
  //   let cyberGear = await this.addGLTFModel('cybergearmotor.stp.glb', 'cyber_gear');

  //   // 下臂
  //   var bottomArmWrapper = new THREE.Object3D();
  //   bottomArmWrapper.position.x = 0.5;
  //   bottomArmWrapper.position.y = 0;
  //   this.scene.add(bottomArmWrapper);
  //   // bottomArmWrapper.add(new THREE.AxesHelper(2));
  //   let bottom_arm = await this.addGLTFModel('bottom_arm.glb', 'bottom_arm');

  //   // 中臂
  //   var centerArmWrapper = new THREE.Object3D();
  //   centerArmWrapper.position.x = 0;
  //   centerArmWrapper.position.y =  0.6;
  //   this.scene.add(centerArmWrapper);
  //   // centerArmWrapper.add(new THREE.AxesHelper(2));
  //   let center_arm = await this.addGLTFModel('center_arm.glb', 'center_arm');


  //   // 上臂
  //   var topArmWrapper = new THREE.Object3D();
  //   topArmWrapper.position.x = 0;
  //   topArmWrapper.position.y = 0.8;
  //   topArmWrapper.position.z = 0.2;
  //   this.scene.add(topArmWrapper);
  //   // topArmWrapper.add(new THREE.AxesHelper(2));
  //   let top_arm = await this.addGLTFModel('top_arm.glb', 'top_arm');



  //   this.angle_top += 0.1;

  //   let render = () => {
  //     requestAnimationFrame(render);
  //       bottomArmWrapper.add(bottom_arm.scene);
  //       bottomArmWrapper.add(centerArmWrapper);

  //       centerArmWrapper.add(center_arm.scene);
  //       centerArmWrapper.add(topArmWrapper);
        
  //       topArmWrapper.add(top_arm.scene);

  //       bottomArmWrapper.rotation.y = this.angle_bottom;
  //       centerArmWrapper.rotation.z = this.angle_center;
  //       topArmWrapper.rotation.z = this.angle_top;

  //       this.renderer.render(this.scene, this.camera);
  //   }

  //   render();
  // }

  async initMesh() {

    let cyberGear = await this.addGLTFModel('cybergearmotor.stp.glb', 'cyber_gear');

    // 下臂
    var bottomArmWrapper = new THREE.Object3D();
    bottomArmWrapper.position.x = 0.5;
    bottomArmWrapper.position.y = 0;
    this.scene.add(bottomArmWrapper);
    // bottomArmWrapper.add(new THREE.AxesHelper(2));
    let bottom_arm = await this.addGLTFModel('bottom_arm.glb', 'bottom_arm');

    // 中臂
    var centerArmWrapper = new THREE.Object3D();
    centerArmWrapper.position.x = 0;
    centerArmWrapper.position.y =  0.6;
    this.scene.add(centerArmWrapper);
    // centerArmWrapper.add(new THREE.AxesHelper(2));
    let center_arm = await this.addGLTFModel('center_arm.glb', 'center_arm');


    // 上臂
    var topArmWrapper = new THREE.Object3D();
    topArmWrapper.position.x = 0;
    topArmWrapper.position.y = 0.8;
    topArmWrapper.position.z = 0.2;
    this.scene.add(topArmWrapper);
    // topArmWrapper.add(new THREE.AxesHelper(2));
    let top_arm = await this.addGLTFModel('top_arm.glb', 'top_arm');

    // let angle_bottom = 0, angle_center = 0, angle_top = 0;

    // 响应键盘事件
    // onkeydown = (event) => {
    //   console.log('---响应键盘事件旋转: ', event, this.angle_bottom, this.angle_center, this.angle_top);
    //   if(this.angle_center >= 180 || this.angle_center <= -180) {
    //     this.angle_center = 0;
    //     return false;
    //   }
    //   if(this.angle_top >= 180 || this.angle_top <= -180) {
    //     this.angle_top = 0;
    //     return false;
    //   }
    //   if(this.angle_bottom >= 180 || this.angle_bottom <= -180) {
    //     this.angle_bottom = 0;
    //     return false;
    //   }
    //   if(event.keyCode == 40) { // 	Dw Arrow  
    //     this.angle_center += 0.1;
    //   } else if(event.keyCode == 38) { // Up Arrow 
    //     this.angle_center -= 0.1;
    //   } else if(event.keyCode == 37) { // Left Arrow	
    //     this.angle_top += 0.1;
    //   } else if(event.keyCode == 39) {  // Right Arrow
    //     this.angle_top -= 0.1;
    //   } else if(event.keyCode == 65) { // A 左
    //     this.angle_bottom += 0.1;
    //   } else if(event.keyCode == 68) { // D 右
    //     this.angle_bottom -= 0.1;
    //   }
    // }

    let render = () => {
      requestAnimationFrame(render);
        bottomArmWrapper.add(bottom_arm.scene);
        bottomArmWrapper.add(centerArmWrapper);

        centerArmWrapper.add(center_arm.scene);
        centerArmWrapper.add(topArmWrapper);
        
        topArmWrapper.add(top_arm.scene);

        bottomArmWrapper.rotation.y = this.angle_bottom;
        centerArmWrapper.rotation.z = this.angle_center;
        topArmWrapper.rotation.z = this.angle_top;

        this.renderer.render(this.scene, this.camera);
    }

    render();
  }

  // 加载模型
  addGLTFModel(modelName, type) { 
    return new Promise((resolve,reject) => {
      const loader = new GLTFLoader().setPath('3dModules/')
      loader.load(modelName,(gltf) =>{
        // console.log('模型加载成功: ', gltf);
        
        this.scene.add(gltf.scene);
        initGLTF.bind(this)(gltf, type);

        resolve(gltf);
      });
    });

    // 初始化模型的位置
    function initGLTF (gltf, type ) {
      gltf.scene.scale.set(5,5,5);

      if(type === 'bottom_arm') {
        // 初始化位置等信息
        gltf.scene.scale.set(5,5,5);
        gltf.scene.rotation.set(Math.PI / 2, 0, 0);
        gltf.scene.translateZ(-0.6);
        gltf.scene.translateY(-0);

      }else if(type === 'center_arm') {
        gltf.scene.translateX(-0);
        gltf.scene.translateZ(0.1);
        gltf.scene.scale.set(5,5,5);
        gltf.scene.rotation.set(Math.PI / 180 * 183.5, Math.PI / 180 * 330, Math.PI / 180 * 57);

      }else if(type === 'top_arm') {
        gltf.scene.rotation.set(Math.PI / 2, 0, 0);
        gltf.scene.translateY(0.1);

      }else if(type === 'cyber_gear') {
        gltf.scene.rotation.set(Math.PI / 2, 0, 0);
        gltf.scene.translateX(0.03);
        gltf.scene.translateY(-0.4);
        gltf.scene.translateZ(0.05);
      }

    } 
  }
} 
export default motor3d
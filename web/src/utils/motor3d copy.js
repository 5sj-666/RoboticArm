import * as THREE from 'three'//导入three.js核心库
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' //导入轨道控制器
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'//导入GLTF模型加载器

import { TransformControls } from 'three/addons/controls/TransformControls.js'; // 控制

// import huan3 from '/3dModules/huan3.gltf?url'

// console.log(huan3);




class motor3d {
  constructor(selector) {    
    this.container = document.querySelector(selector)//获取容器
    this.scene
    this.camera 
    this.renderer
    this.orbit
    this.control
    this.init() //初始化
    this.animate()//循环函数
  }

  init() {
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
    this.camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,100)
    this.camera.position.set(2.5,2.5,2.5)
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

    this.control = new TransformControls(this.camera,this.renderer.domElement);
    // this.control.addEventListener( 'change', this.render );
    this.control.addEventListener( 'dragging-changed', ( event ) => {
      console.log('dragging-changed: ', event, this.orbit);
      this.orbit.enabled = ! event.value;
    } );
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()//更新矩阵，将3d内容投射到2d画面上转换
    this.renderer.setSize(window.innerWidth,window.innerHeight)
  }

  initMesh() {
    // this.addGLTFModel('huan3.gltf')
    this.addGLTFModel('b_arm.glb')
    // this.addGLTFModel('testarm1/testarm1.gltf')
  }

  // 加载模型
  addGLTFModel(modelName) { 
    return new Promise((resolve,reject) => {
      const loader = new GLTFLoader().setPath('3dModules/')
      loader.load(modelName,(gltf) =>{
        console.log(gltf);
        gltf.scene.scale.set(5,5,5);
        // gltf.scene.position.set(0.1, 1, 0);
        gltf.scene.rotation.set(Math.PI / 2, 0, 0);
        gltf.scene.translateZ(-0.4);
        gltf.scene.translateY(-0.1);
        
        this.scene.add(gltf.scene);

        resolve(this.modelName + '模型添加成功')  

        this.control.attach(gltf.scene);
        this.scene.add(this.control);
        this.control.setMode( 'rotate' );

        // 只有Y轴可旋转
        this.control.showX = false;
        this.control.showZ = false;
        console.log(this.control);
        // this.control.space = 'local';
      })

    })  
  }
} 
export default motor3d
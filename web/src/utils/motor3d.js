import * as THREE from 'three'//导入three.js核心库
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' //导入轨道控制器
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'//导入GLTF模型加载器
import { TransformControls } from 'three/addons/controls/TransformControls.js'; // 控制


class motor3d {
  constructor(selector) {    
    this.container = document.querySelector(selector); //获取容器

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    // debugger;
    // this.container;
    // const { width, height } = this.container.getBoundingClientRect()
    // debugger;
    

    this.scene;
    this.camera;
    this.renderer;
    this.orbit;
    this.control;
    this.init(); //初始化
    this.animate();//循环函数
    this.joint3 = 0;
    this.joint2 = 0;
    this.joint1 = 0;
    this.joint4 = 0;
    this.joint5 = 0;
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
    this.scene.add( new THREE.GridHelper( 20, 20, 0x888888, 0x444444) );
    // this.scene.fog = new THREE.Fog(0x000000, 0, 10000) // 添加雾的效果
    this.scene.position.y -= 2;
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
    dirLight.position.set(10, 10, 10)
    this.scene.add(dirLight)    
  }

  initCamera() {
    // this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 100)
    // this.camera.position.set(1.5, 2, 3)
    this.camera.position.set(3, 2, 4.5)
}

initRender() {
  this.renderer = new THREE.WebGLRenderer({antialias:true})//设置抗锯齿
  //设置屏幕像素比
  this.renderer.setPixelRatio(window.devicePixelRatio)
  //渲染的尺寸大小
  // this.renderer.setSize(window.innerWidth,window.innerHeight) 
  this.renderer.setSize(this.width, this.height,) 
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
    // this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()//更新矩阵，将3d内容投射到2d画面上转换
    // this.renderer.setSize(window.innerWidth,window.innerHeight)
    this.renderer.setSize(this.width, this.height)
  }


  async initMesh() {

    // let cyberGear = await this.addGLTFModel('cybergearmotor.stp.glb', 'cyber_gear');
    let zero = await this.addGLTFModel('zero.glb', 'zero');
    // cyberGear.add(new THREE.AxesHelper(2));

    var oneWrapper = new THREE.Object3D();
    oneWrapper.position.x = 0.5;
    oneWrapper.position.y = 0.4;
    // oneWrapper.position.z = 1;
    this.scene.add(oneWrapper);
    // oneWrapper.add(new THREE.AxesHelper(2));
    let one = await this.addGLTFModel('one.glb', 'one');

    // 
    var twoWrapper = new THREE.Object3D();
    twoWrapper.position.x = 0;
    twoWrapper.position.y =  0.25;
    twoWrapper.position.z =  -0.32;
    this.scene.add(twoWrapper);
    // twoWrapper.add(new THREE.AxesHelper(2));
    let two = await this.addGLTFModel('two.glb', 'two');


    // 
    var threeWrapper = new THREE.Object3D();
    threeWrapper.position.x = 0;
    threeWrapper.position.y = 1.5;
    threeWrapper.position.z = -0.02;
    this.scene.add(threeWrapper);
    // threeWrapper.add(new THREE.AxesHelper(2));
    let three = await this.addGLTFModel('three.glb', 'three');

    //
    var fourWrapper = new THREE.Object3D();
    fourWrapper.position.x = 0.175;
    fourWrapper.position.y = 0.32;
    fourWrapper.position.z =0.32;
    this.scene.add(fourWrapper);
    // fourWrapper.add(new THREE.AxesHelper(2));
    let four = await this.addGLTFModel('four.glb', 'four');

    //
    var fiveWrapper = new THREE.Object3D();
    fiveWrapper.position.x = 0;
    fiveWrapper.position.y = 1.25;
    fiveWrapper.position.z = 0.197;
    this.scene.add(fiveWrapper);
    // fiveWrapper.add(new THREE.AxesHelper(2));
    let five = await this.addGLTFModel('five.glb', 'five');


    let render = () => {
      requestAnimationFrame(render);
        oneWrapper.add(one.scene);
        oneWrapper.add(twoWrapper);

        twoWrapper.add(two.scene);
        twoWrapper.add(threeWrapper);
        
        threeWrapper.add(three.scene);
        threeWrapper.add(fourWrapper);

        fourWrapper.add(four.scene);
        fourWrapper.add(fiveWrapper);

        fiveWrapper.add(five.scene);


        oneWrapper.rotation.y = this.joint1;
        twoWrapper.rotation.z = this.joint2;
        threeWrapper.rotation.z = this.joint3;

        fourWrapper.rotation.y = this.joint4;
        fiveWrapper.rotation.z = this.joint5;

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

      if(type === 'zero') {
        gltf.scene.translateX(0.5);
      }else if(type === 'one') {
        gltf.scene.translateX(0.5);
        gltf.scene.translateX(-0.5);

      }else if(type === 'two') {
        gltf.scene.translateZ(-0.2);
        let oneDegree = Math.PI / 180;
        gltf.scene.rotation.set(oneDegree * 90, oneDegree * 90, oneDegree * 0);

      }else if(type === 'three') {
        gltf.scene.rotation.set(Math.PI / 2, Math.PI / 180 * -116, 0);
      }else if(type === 'four') {
        gltf.scene.rotation.set(0, Math.PI / 180 * 90,  Math.PI / 180 * -90);
        gltf.scene.translateX(-1.25);
        gltf.scene.translateY(-0.35);
      }
      else if(type === 'five') {
        gltf.scene.rotation.set(Math.PI / 180  * 0, Math.PI / 180 * 270,  Math.PI / 180 * 90);
        // let oneDegree = Math.PI / 180;
        // gltf.scene.rotation(oneDegree * 0, oneDegree * 90, oneDegree * 270);
      }

    } 
  }
} 
export default motor3d
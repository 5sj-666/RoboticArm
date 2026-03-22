import * as THREE from 'three'//导入three.js核心库
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' //导入轨道控制器
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'//导入GLTF模型加载器
// import { TransformControls } from 'three/addons/controls/TransformControls.js'; // 控制
import URDFLoader from 'urdf-loader'; // URDF 加载器

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
    this.robot = null;
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
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 100)
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
    this.orbit.enableDamping = true;
    // 使用控制器
    this.camera.position.set(-1.58, -1.31, 1.14);
    this.orbit.target.set(0.08, -1.77, -0.19);
    this.camera.lookAt(0.08, -1.77, -0.19);
    this.orbit.update();

     // 监听相机变化，实时打印位置和朝向
    // this.orbit.addEventListener('change', () => {
    //   const pos = this.camera.position;
    //   const target = this.orbit.target;
    //   console.log(
    //     `camera.position: x=${pos.x.toFixed(2)}, y=${pos.y.toFixed(2)}, z=${pos.z.toFixed(2)}`
    //   );
    //   console.log(
    //     `camera.lookAt: x=${target.x.toFixed(2)}, y=${target.y.toFixed(2)}, z=${target.z.toFixed(2)}`
    //   );
    // });
  }

  onWindowResize() {
      this.width = window.innerWidth;
    this.height = window.innerHeight;
    // this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.aspect = this.width / this.height;
    this.renderer.setSize(this.width, this.height);
    this.camera.updateProjectionMatrix();//更新矩阵，将3d内容投射到2d画面上转换
    // this.renderer.setSize(window.innerWidth,window.innerHeight)
  }

  async initMesh() {
    this.addURDFModel('3dModules/roboticArm.urdf');
    let render = () => {
      requestAnimationFrame(render);
      if(this.robot != null) {
        this.robot.setJointValue( 'joint_1', this.joint1 );
        this.robot.setJointValue( 'joint_2', this.joint2 );
        this.robot.setJointValue( 'joint_3', this.joint3 );
        this.robot.setJointValue( 'joint_4', this.joint4 );
        this.robot.setJointValue( 'joint_5', this.joint5 );
      }
    }

    render();
  }

  addURDFModel(urdfPath = '3dModules/roboticArm.urdf') {
    const manager = new THREE.LoadingManager();
    const loader = new URDFLoader(manager);

    loader.loadMeshCb = function(path, manager, onComplete) {
      const gltfLoader = new GLTFLoader(manager);
      gltfLoader.load(
        path,
        result => {
          onComplete(result.scene);
        },
        undefined,
        err => {
          onComplete(null, err);
        }
      );
    };

    loader.load(
      urdfPath,
      robot => {
        this.robot = robot;
        this.robot.position.set(0, 0, 0);
        this.scene.add(this.robot);
      },
      progress => {
        console.log('urdf: progress' + progress);
      },
      err => {
        console.log('urdf: err' + err);
      }
    );
  }

} 
export default motor3d
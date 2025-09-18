import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import MinMaxGUIHelper from './src/helpers/CameraHelper.mjs';
// import ColorGUIHelper from './src/helpers/CameraHelper.mjs';

import CharacterController from '/src/CharacterController.mjs';

class ColorGUIHelper {
	constructor( object, prop ) {
    this.object = object;
		this.prop = prop;
	}
		
  get value() {
		return `#${this.object[ this.prop ].getHexString()}`;
	}
		
  set value( hexString ) {
		this.object[ this.prop ].set( hexString );
  }
}

export default ColorGUIHelper;

class World {
  constructor() {
    this._Initialize();
  }

  _Initialize () {
    this._scene = new THREE.Scene();
	  this._camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    this._camera.position.set(5, 45, 50);

    this._renderer = new THREE.WebGLRenderer({ antialias: true });
    this._renderer.shadowMap.enabled = true;
    this._renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this._renderer.domElement );

    const planeSize = 400;
    this._planeGeometry = new THREE.PlaneGeometry( planeSize, planeSize );
    this._planeMaterial = new THREE.MeshPhongMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    this._plane = new THREE.Mesh( this._planeGeometry, this._planeMaterial );
    this._plane.rotation.x = Math.PI * -.5;
    this._plane.castShadow = true;
    this._scene.add( this._plane );

    this._controls = new PointerLockControls( this._camera, this._renderer.domElement );

    window.addEventListener('click', () => {
					this._controls.lock();
          this._controls.enabled = false;
		});

    this._scene.add( this._controls.object );

    this._light = new THREE.DirectionalLight( 0xffffbb, 1 );
    this._light.position.set(0, 26, 85);
    this._light.target.position.set(0, 0, 0); 
    this._light.castShadow = true; 
    this._scene.add( this._light );
    this._scene.add(this._light.target);

    this._helper = new THREE.DirectionalLightHelper(this._light);
    this._scene.add(this._helper);

    this._skybox = new THREE.CubeTextureLoader();
    this._skytexture = this._skybox.load([
      '/images/skyboxes/px.png',
      '/images/skyboxes/nx.png',
      '/images/skyboxes/py.png',
      '/images/skyboxes/ny.png',
      '/images/skyboxes/pz.png',
      '/images/skyboxes/nz.png',
    ]);
    this._scene.background = this._skytexture;
    
    // this._Cube();
    // this._LoadModel();
    this._LoadAnimatedModel();
    this._HelpersGUI();
    this._RAF();
  }
  
  _LoadAnimatedModel() {
    const params = {
      camera: this._camera,
      scene: this._scene,
    }
    this._inputs = new CharacterController(params);
  }

  // _Cube() {
  //   const cubegeo = new THREE.BoxGeometry(1, 1, 1);
  //   const cubemat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  //   this._cubemesh = new THREE.Mesh(cubegeo, cubemat);
  //   this._scene.add(this._cubemesh);
  // }

  _HelpersGUI() {
    const updateCamera = (camera) => {
		  camera.updateProjectionMatrix();
    }

    const updateLight = () => {
      this._light.target.updateMatrixWorld();
      this._helper.update();
    } 
    updateLight();

    const gui = new GUI();
	  gui.add( this._camera, 'fov', 1, 180 ).onChange( updateCamera(this._camera) );
	  const minMaxGUIHelper = new MinMaxGUIHelper( this._camera, 'near', 'far', 0.1 );
	  gui.add( minMaxGUIHelper, 'min', 0.1, 100, 0.1 ).name( 'near' ).onChange( updateCamera(this._camera)  );
	  gui.add( minMaxGUIHelper, 'max', 0.1, 150, 0.1 ).name( 'far' ).onChange( updateCamera(this._camera)  );

    const folder = gui.addFolder( 'Lights' );
    folder.addColor(new ColorGUIHelper(this._light, 'color'), 'value').name('color');
    folder.add(this._light, 'intensity', 0, 5, 0.01);
    folder.add(this._light.target.position, 'x', -10, 10); 
    folder.add(this._light.target.position, 'z', -10, 10);
    folder.add(this._light.target.position, 'y', 0, 10);

    const makeXYZGUI = (gui, vector3, name, onChangeFn) => {
      const folder = gui.addFolder(name);
      folder.add(vector3, 'x', -10, 100).onChange(onChangeFn);
      folder.add(vector3, 'y', 0, 100).onChange(onChangeFn);
      folder.add(vector3, 'z', -10, 100).onChange(onChangeFn);
      folder.open();
    }

    makeXYZGUI(gui, this._light.position, 'position', updateLight);
    makeXYZGUI(gui, this._light.target.position, 'target', updateLight);
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();
      this._camera.updateProjectionMatrix();
      this._renderer.render(this._scene, this._camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    if (this._mixers) {
      this._mixers.map(m => m.update(timeElapsedS));
    }

    if (this._inputs) {
      this._inputs.Update(timeElapsedS);
    }
  }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new World();
});



// const bgTextureLoader = new THREE.TextureLoader();
// const bgTexture = bgTextureLoader.load('/images/bg.jpg');
// bgTexture.colorSpace = THREE.SRGBColorSpace;
// scene.background = bgTexture;




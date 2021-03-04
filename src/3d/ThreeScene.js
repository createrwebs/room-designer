import {
    select,
    add,
    remove
}
    from '../api/actions'
import store from '../api/store';

import { NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

import Loader from './Loader'
import Meuble from './Meuble'

import * as THREE from "three";
import { WEBGL } from 'three/examples/jsm/WEBGL.js';
// import { Scene } from 'three';
// import Stats from 'three/examples/jsm/libs/stats.module'

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// Controls
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
// import { Interaction } from 'three.interaction';


export default {
    getRendererNodeElement() {
        return this.renderer.domElement
    },
    getStatNodeElement() {
        // return this.frame_stats.dom
    },
    setup(config) {
        window.ts = this// f12 helper

        let camera, scene, renderer, orbitControls, stats, manager;

        Loader.setup();
        /*         this.manager = manager = new THREE.LoadingManager();
                manager.onStart = function (url, itemsLoaded, itemsTotal) {
        
                    // console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
        
                };
                manager.onStart = this.loadManagerStart.bind(this);
                manager.onLoad = this.loadManagerLoad.bind(this);
                manager.onProgress = this.loadManagerProgress.bind(this);
                manager.onError = this.loadManagerError.bind(this); */

        // console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');


        this.scene = scene = new THREE.Scene();
        scene.background = new THREE.Color(0xfefefe);
         scene.fog = new THREE.Fog(0xfefefe, 10000, 15000);
        // THREE.Object3D.DefaultUp.set(0, 0, 1);

        // this.frame_stats = stats = new Stats();
        // stats.begin();

        var renderer_args = {
            antialias: true
        }

        this.renderer = renderer = new THREE.WebGLRenderer(renderer_args);

        renderer.shadowMap.enabled = true;

        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        //renderer.gammaInput = true;
        //renderer.gammaOutput = true;
        //renderer.gammaFactor = 2.2;
        //renderer.outputEncoding = THREE.sRGBEncoding;

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        // renderer.toneMapping = THREE.ACESFilmicToneMapping;
        // renderer.toneMappingExposure = 1;
        // renderer.outputEncoding = THREE.sRGBEncoding;
        // renderer.physicallyCorrectLights = true;
        // renderer.shadowMap.enabled = true;
        // renderer.localClippingEnable = false;
        // renderer.setClearColor(0xFFFFFF);

        // /* renderer.domElement.addEventListener("click", onclick, true);
        var selectedObject;
        var raycaster = new THREE.Raycaster();
        function onclick(event) {
            console.log("onclick")
            var mouse = new THREE.Vector2();
            raycaster.setFromCamera(mouse, camera);
            var intersects = raycaster.intersectObjects(scene.children, false); //array
            if (intersects.length > 0) {
                selectedObject = intersects[0];
                // console.log(selectedObject);
            }
        }

        /* camera */

        // +Z is up in Blender, whereas + Y is up in three.js
        this.camera = camera = new THREE.PerspectiveCamera(120, window.innerWidth / window.innerHeight, 1, 40000);
        camera.position.set(5038, 3500, 1987)

        /* controls */

        this.orbitControls = orbitControls = new OrbitControls(camera, renderer.domElement);
        // orbitControls.addEventListener('start', this.render.bind(this)); // use if there is no animation loop
        orbitControls.addEventListener('change', this.render.bind(this)); // use if there is no animation loop
        orbitControls.minDistance = 200;
        orbitControls.maxDistance = 10000;//10m
        orbitControls.target.set(2000, 100, 2000);
        // orbitControls.update();

        // const interaction = new Interaction(renderer, scene, camera);

        /*
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        scene.add(mesh);
        */

        /* lights */

		
		/**/
        const ceilHeight = 5000//ceiling @2.6m

        var light = new THREE.HemisphereLight(0xFFFDF4, 0x000000, .6);
        light.position.set(2500, 1200, 2500);
        const helper = new THREE.HemisphereLightHelper(light, 100);

		scene.add(light);
        //scene.add( helper );
		
		
		/*
        var spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.position.set(3000, 5500, 3000);
        //spotLight.penumbra = .4;
        //spotLight.decay = 2;
        spotLight.distance = 6000;
		
        
        scene.add(spotLight);

        scene.add(spotLight.target);
        spotLight.target.position.set(2000, 0, 2000);
        spotLight.target.updateMatrixWorld();
		*/
		
		/*
		var directionalLight = new THREE.DirectionalLight(0xffffff,.3);
        directionalLight.position.set(3000, 5000, 3000);
        directionalLight.target.position.set(3000, 0, 3000);

        directionalLight.castShadow = true;
        directionalLight.shadowDarkness = 0.05;

        directionalLight.shadowCameraNear = 0;
        directionalLight.shadowCameraFar = 15000;

        directionalLight.shadowCameraLeft = -2000;
        directionalLight.shadowCameraRight = 2000;
        directionalLight.shadowCameraTop = 2000;
        directionalLight.shadowCameraBottom = -2000;
		
		scene.add(directionalLight);

        var lightHelper = new THREE.DirectionalLightHelper(directionalLight,100);
        scene.add( lightHelper );
		*/
		
		/**/
		const pointLight = new THREE.PointLight( 0xffffff, .55, 0, 1 );
		pointLight.position.set( 2500, 3000, 2500 );
		pointLight.castShadow = true; // default false
		
		var PointLightHelper = new THREE.PointLightHelper(pointLight, 100);
		
		scene.add( pointLight );
		scene.add( PointLightHelper );
		
		//Set up shadow properties for the light
		pointLight.shadow.mapSize.width = 2048; // default
		pointLight.shadow.mapSize.height = 2048; // default
		pointLight.shadow.camera.near = 0.5; // default
		pointLight.shadow.camera.far = 10000; // default
		
		
        
		

        /* 0,0,0 dot */

        const axesHelper = new THREE.AxesHelper(15000);
        scene.add(axesHelper);

        /* floor grid */

        const grid = new THREE.GridHelper(15000, 100, 0x000000, 0x9A9A9A);
        grid.material.opacity = 0.25;
        grid.material.transparent = true;
        scene.add(grid);

        /* walls */

        const wallConfig = config.walls;
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x7E838D,
			transparent: true,
			opacity: .25
        });
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0xFAFAFA,
			emissive: 0x2C2C2C,
        });

        const geometryGround = new THREE.PlaneGeometry(55000, 55000, 12);
        this.ground = new THREE.Mesh(geometryGround, groundMaterial);
        this.ground.rotateX(Math.PI / -2);

        //this.ground.castShadow = true;
        //this.ground.receiveShadow = true;

        //if(this.ground.material.map) this.ground.material.map.anisotropy = 5;		

        scene.add(this.ground);

        const geometryRight = new THREE.PlaneGeometry(wallConfig.right.width, 2600, 10, 10);
        this.wallRight = new THREE.Mesh(geometryRight, wallMaterial);
        this.wallRight.position.x = wallConfig.right.width / 2;
        this.wallRight.position.y = 2600 / 2;
        this.wallRight.castShadow = this.wallRight.receiveShadow = false;
        scene.add(this.wallRight);

        const geometryBack = new THREE.PlaneGeometry(wallConfig.back.width, 2600, 10, 10);
        this.wallBack = new THREE.Mesh(geometryBack, wallMaterial);
        this.wallBack.rotateY(Math.PI / 2)
        this.wallBack.position.x = 0;
        this.wallBack.position.y = 2600 / 2;
        this.wallBack.position.z = wallConfig.back.width / 2;
        this.wallBack.castShadow = this.wallBack.receiveShadow = false;
        scene.add(this.wallBack);

        const geometryLeft = new THREE.PlaneGeometry(wallConfig.left.width, 2600, 10, 10);
        this.wallLeft = new THREE.Mesh(geometryLeft, wallMaterial);
        this.wallLeft.position.x = wallConfig.left.width / 2;
        this.wallLeft.position.y = 2600 / 2;
        this.wallLeft.position.z = wallConfig.back.width;
        this.wallLeft.rotateY(Math.PI);
        this.wallLeft.castShadow = this.wallLeft.receiveShadow = false;
        scene.add(this.wallLeft);

    },
    updateCamera(props) {
        let camera = this.camera
        camera.fov = props.fov;
        camera.zoom = props.zoom;
        camera.focus = props.focus;
        camera.updateProjectionMatrix();
    },
    updateLights(light) {
        let scene = this.scene
        let spotLight = this.spotLight
        let spotLight2 = this.spotLight2

        if (light) {
            scene.add(spotLight);
            scene.add(spotLight2);
        }
        else {
            scene.remove(spotLight);
            scene.remove(spotLight2);
        }
    },
    allLoaded() {
        // this.orbitControls.update();
    },
    render() {
        // console.log(`render ${this}`);
        if (store.getState().cameraLog) {
            console.log(`camera.position.set(${Math.round(this.camera.position.x)},${Math.round(this.camera.position.y)},${Math.round(this.camera.position.z)})`);
            console.log(`orbitControls.target.set(${Math.round(this.orbitControls.target.x)},${Math.round(this.orbitControls.target.y)},${Math.round(this.orbitControls.target.z)})`);
        }

        // this.frame_stats.update();
        this.renderer.render(this.scene, this.camera);

    },
    fbxloadAll() {
        const loader = new FBXLoader(Loader.manager);
        store.getState().config.fbx.forEach(props => loader.load(`models/${props.file}.fbx`, this.fbxloaded.bind(this, props)))
    },
    fbxloaded(props, object) {
        this.add(new Meuble(props, object));// meuble to put in the list better than the scene
    },
    add(meuble) {
        this.scene.add(meuble.object);
        this.render();
        store.dispatch(add(meuble))
    },
}
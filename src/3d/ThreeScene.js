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
        scene.background = new THREE.Color(0xa0a0a0);
        // scene.fog = new THREE.Fog(0xa0a0a0, 7000, 10000);
        // THREE.Object3D.DefaultUp.set(0, 0, 1);

        // this.frame_stats = stats = new Stats();
        // stats.begin();

        var renderer_args = {
            //antialias: true
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
        camera.position.set(5038, 5089, 1987)

        /* controls */

        this.orbitControls = orbitControls = new OrbitControls(camera, renderer.domElement);
        // orbitControls.addEventListener('start', this.render.bind(this)); // use if there is no animation loop
        orbitControls.addEventListener('change', this.render.bind(this)); // use if there is no animation loop
        orbitControls.minDistance = 200;
        orbitControls.maxDistance = 10000;//10m
        orbitControls.target.set(1317, -673, 1832);
        // orbitControls.update();

        // const interaction = new Interaction(renderer, scene, camera);

        /*
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        scene.add(mesh);
        */

        /* lights */

        const ceilHeight = 5000//ceiling @2.6m

        var light = new THREE.HemisphereLight(0xFFFDF4, 0x000000, 1);
        light.position.set(2500, 1700, 2500);
        // light.castShadow = true;
        const helper = new THREE.HemisphereLightHelper(light, 100);
        scene.add(light);
        //scene.add( helper );

        var spotLight = new THREE.SpotLight(0xffffff, 1.5);
        spotLight.position.set(3000, 5500, 3000);
        spotLight.penumbra = .4;
        spotLight.decay = 2.5;
        spotLight.distance = 10000;

        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.near = 2;
        spotLight.shadow.camera.far = 6000;
        spotLight.shadow.focus = 5;
        scene.add(spotLight);

        scene.add(spotLight.target);
        spotLight.target.position.set(2000, 0, 2000);
        spotLight.target.updateMatrixWorld();

        var lightHelper = new THREE.SpotLightHelper(spotLight);
        //scene.add( lightHelper );


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
        const wallMaterial = new THREE.MeshBasicMaterial({
            color: 0x7E838D
        });
        const groundMaterial = new THREE.MeshPhongMaterial({
            color: 0xFBFBFB,
            dithering: true
        });

        const geometryGround = new THREE.CircleGeometry(15000, 32);
        this.ground = new THREE.Mesh(geometryGround, groundMaterial);
        this.ground.rotateX(Math.PI / -2);

        this.ground.castShadow = true;
        this.ground.receiveShadow = true;

        //if(this.ground.material.map) this.ground.material.map.anisotropy = 5;		

        scene.add(this.ground);

        const geometryRight = new THREE.PlaneGeometry(wallConfig.right.width, 2600, 10, 10);
        this.wallRight = new THREE.Mesh(geometryRight, wallMaterial);
        this.wallRight.position.x = wallConfig.right.width / 2;
        this.wallRight.position.y = 2600 / 2;
        this.wallRight.castShadow = this.wallRight.receiveShadow = true;
        scene.add(this.wallRight);

        const geometryBack = new THREE.PlaneGeometry(wallConfig.back.width, 2600, 10, 10);
        this.wallBack = new THREE.Mesh(geometryBack, wallMaterial);
        this.wallBack.rotateY(Math.PI / 2)
        this.wallBack.position.x = 0;
        this.wallBack.position.y = 2600 / 2;
        this.wallBack.position.z = wallConfig.back.width / 2;
        this.wallBack.castShadow = this.wallBack.receiveShadow = true;
        scene.add(this.wallBack);

        const geometryLeft = new THREE.PlaneGeometry(wallConfig.left.width, 2600, 10, 10);
        this.wallLeft = new THREE.Mesh(geometryLeft, wallMaterial);
        this.wallLeft.position.x = wallConfig.left.width / 2;
        this.wallLeft.position.y = 2600 / 2;
        this.wallLeft.position.z = wallConfig.back.width;
        this.wallLeft.rotateY(Math.PI);
        this.wallLeft.castShadow = this.wallLeft.receiveShadow = true;
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
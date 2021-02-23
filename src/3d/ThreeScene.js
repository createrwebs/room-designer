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
        // scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);
        // THREE.Object3D.DefaultUp.set(0, 0, 1);

        // this.frame_stats = stats = new Stats();
        // stats.begin();

        this.renderer = renderer = new THREE.WebGLRenderer({ antialias: true });
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

        const ceilHeight = 2600//ceiling @2.6m

        const dirLight = new THREE.DirectionalLight(0xffffff);
        dirLight.position.set(0, 200, 100);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 180;
        dirLight.shadow.camera.bottom = - 100;
        dirLight.shadow.camera.left = - 120;
        dirLight.shadow.camera.right = 120;
        // scene.add(dirLight);

        const spotLight = new THREE.SpotLight(0xffffff);
        this.spotLight = spotLight
        spotLight.position.set(600, ceilHeight, 700);
        spotLight.target.position.set(spotLight.position.x, 0, spotLight.position.y);
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.near = 500;
        spotLight.shadow.camera.far = 4000;
        spotLight.shadow.camera.fov = 30;
        spotLight.distance = 6000;
        spotLight.angle = Math.PI / 2;
        spotLight.penumbra = .4;
        scene.add(spotLight.target);
        scene.add(spotLight);

        const spotLight2 = new THREE.SpotLight(0xffffff).copy(spotLight);
        this.spotLight2 = spotLight2
        spotLight2.position.set(1800, ceilHeight, 700);
        spotLight2.target.position.set(spotLight2.position.x, 0, spotLight2.position.y);
        scene.add(spotLight2.target);
        scene.add(spotLight2);
        /* const spotLightHelper = new THREE.SpotLightHelper(spotLight);
        scene.add(spotLightHelper); */

        const light = new THREE.HemisphereLight(0xffffbb, 0x080820, .6);
        scene.add(light);

        /* 0,0,0 dot */

        const axesHelper = new THREE.AxesHelper(5);
        scene.add(axesHelper);

        /* floor grid */

        const grid = new THREE.GridHelper(10000, 100, 0x000000, 0x445544);
        grid.material.opacity = 0.3;
        // grid.material.transparent = true;
        scene.add(grid);

        /* walls */

        const wallConfig = config.walls;
        const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x336633, side: THREE.DoubleSide });

        const geometryRight = new THREE.PlaneGeometry(wallConfig.right.width, 2600, 10, 10);
        this.wallRight = new THREE.Mesh(geometryRight, wallMaterial);
        this.wallRight.position.x = wallConfig.right.width / 2;
        this.wallRight.position.y = 2600 / 2;
        scene.add(this.wallRight);

        const geometryBack = new THREE.PlaneGeometry(wallConfig.back.width, 2600, 10, 10);
        this.wallBack = new THREE.Mesh(geometryBack, wallMaterial);
        this.wallBack.rotateY(Math.PI / 2)
        this.wallBack.position.x = 0;
        this.wallBack.position.y = 2600 / 2;
        this.wallBack.position.z = wallConfig.back.width / 2;
        scene.add(this.wallBack);

        const geometryLeft = new THREE.PlaneGeometry(wallConfig.left.width, 2600, 10, 10);
        this.wallLeft = new THREE.Mesh(geometryLeft, wallMaterial);
        this.wallLeft.position.x = wallConfig.left.width / 2;
        this.wallLeft.position.y = 2600 / 2;
        this.wallLeft.position.z = wallConfig.back.width;
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
        store.getState().config.fbx.forEach(props => loader.load(`models/${props.file}`, this.fbxloaded.bind(this, props)))
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
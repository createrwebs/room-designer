/* import {
    select,
    add,
    remove
}
    from '../api/actions'
import store from '../api/store'; */

import * as THREE from "three";
import { WEBGL } from 'three/examples/jsm/WEBGL.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import Loader from './Loader'

import Stats from 'three/examples/jsm/libs/stats.module'
import { localhost } from '../api/Config';


// Controls
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
// import { Interaction } from 'three.interaction';

import Draggable from './Draggable'
import { setupLights } from './Lights'
// import helvetiker_regular from 'three/examples/fonts/helvetiker_regular.typeface.json'

export default {
    loader: new FBXLoader(Loader.manager),
    getRendererNodeElement() {
        return this.renderer.domElement
    },
    getStatNodeElement() {
        return this.frame_stats.dom
    },
    setup(config) {
        window.ts = this// f12 helper

        // this.font = new THREE.Font(helvetiker_regular);
        // console.log(this.font)

        const scene_params = this.scene_params = config.scene_params;
        let camera, scene, renderer, orbitControls, stats, manager;

        if (this.scene) {
            this.scene.clear()
        }
        else {
            this.scene = new THREE.Scene();
        }
        scene = this.scene
        scene.background = new THREE.Color(scene_params.backgroundColor);

        /*         if (scene_params.fogEnabled) {
                    scene.fog = new THREE.Fog(scene_params.fog.color, scene_params.fog.near, scene_params.fog.far);
                } */
        // THREE.Object3D.DefaultUp.set(0, 0, 1);

        // renderer props hard coded :
        /*         var renderer_args = {
                    "preserveDrawingBuffer": true,// for picture taking
                    "antialias": true,
                    "powerPreference": "low-power",
                    "failIfMajorPerformanceCaveat": false
                } */
        var renderer_args = scene_params.renderer

        this.renderer = renderer = new THREE.WebGLRenderer(renderer_args);

        renderer.shadowMap.enabled = scene_params.shadowMap.enabled;

        /*
        Shadow maps possibles =>
        THREE.BasicShadowMap
        THREE.PCFShadowMap
        THREE.PCFSoftShadowMap
        THREE.VSMShadowMap
        */
        if (scene_params.shadowMap.type === "BasicShadowMap") {
            renderer.shadowMap.type = THREE.BasicShadowMap;
        } else if (scene_params.shadowMap.type === "PCFShadowMap") {
            renderer.shadowMap.type = THREE.PCFShadowMap;
        } else if (scene_params.shadowMap.type === "PCFSoftShadowMap") {
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        } else if (scene_params.shadowMap.type === "VSMShadowMap") {
            renderer.shadowMap.type = THREE.VSMShadowMap;
        } else {
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        // renderer.toneMapping = THREE.ACESFilmicToneMapping;
        // renderer.toneMappingExposure = 1;
        // renderer.outputEncoding = THREE.sRGBEncoding;
        // renderer.physicallyCorrectLights = true;
        // renderer.shadowMap.enabled = true;
        // renderer.localClippingEnable = false;
        // renderer.setClearColor(0xFFFFFF);



        this.frame_stats = stats = new Stats();

        /* raycaster */

        var selectedObject;
        // /* renderer.domElement.addEventListener("click", onclick, true);
        function onclick(event) {
            console.log("onclick")
            var raycaster = new THREE.Raycaster();
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
        this.camera = camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 15000);
        camera.position.set(5038, 2000, 1987)

        /* controls */

        this.orbitControls = orbitControls = new OrbitControls(camera, renderer.domElement);
        // orbitControls.addEventListener('start', this.render.bind(this)); // use if there is no animation loop
        orbitControls.addEventListener('change', this.render.bind(this)); // use if there is no animation loop
        orbitControls.minDistance = 200;//20cm
        orbitControls.maxDistance = 10000;//10m
        orbitControls.target.set(2000, 1000, 2000);
        orbitControls.update();

        // const interaction = new Interaction(renderer , scene, camera);

        /*
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        scene.add(mesh);
        */

        this.setupLights()

        /* ground */

        /*         const groundMaterial = new THREE.MeshStandardMaterial({
                    color: scene_params.groundColor,
                    emissive: 0x2C2C2C,
                });
        
                const geometryGround = new THREE.PlaneGeometry(55000, 55000, 12);
                this.ground = new THREE.Mesh(geometryGround, groundMaterial);
                this.ground.rotateX(Math.PI / -2);
                //this.ground.castShadow = true;
                //this.ground.receiveShadow = true;
                //if(this.ground.material.map) this.ground.material.map.anisotropy = 5;		
                scene.add(this.ground); */

        /* walls */

        this.setupWalls(config.walls)

    },
    loadFbx(fbx, callback) {
        this.loader.load(fbx, callback)
    },
    resize() {
        const canvasWrapper = document.getElementById("canvas-wrapper")
        if (!canvasWrapper) return
        console.log(`canvas-wrapper size is ${canvasWrapper.offsetWidth}x${canvasWrapper.offsetHeight}`)
        this.renderer.setPixelRatio(canvasWrapper.offsetWidth / canvasWrapper.offsetHeight);
        this.renderer.setSize(canvasWrapper.offsetWidth, canvasWrapper.offsetHeight);
        this.camera.aspect = canvasWrapper.offsetWidth / canvasWrapper.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.render()
    },
    setupLights() {
        setupLights(this.scene, this.scene_params)
    },
    setupWalls(wallConfig, visible = true) {

        if (localhost) {

            /* 0,0,0 dot */

            const axesHelper = new THREE.AxesHelper(15000);
            this.scene.add(axesHelper);

            /* floor grid */
            // TODO because cannot be rectangle, make its own !
            const grid = new THREE.GridHelper(10000, 100, 0x000000, 0x9A9A9A);
            grid.material.opacity = 0.25;
            grid.material.transparent = true;
            grid.position.x = 10000 / 2
            grid.position.z = 10000 / 2
            this.scene.add(grid);
            // console.log(grid)
        }

        if (this.wallRight) this.scene.remove(this.wallRight);
        if (this.wallBack) this.scene.remove(this.wallBack);
        if (this.wallLeft) this.scene.remove(this.wallLeft);

        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x7E838D,
            transparent: true,
            opacity: visible ? .25 : 0
        });

        if (wallConfig.right > 0) {
            const geometryRight = new THREE.PlaneGeometry(wallConfig.right, 2600, 10, 10);
            this.wallRight = new THREE.Mesh(geometryRight, wallMaterial);
            this.wallRight.name = "wall-right";
            this.wallRight.position.x = wallConfig.right / 2;
            this.wallRight.position.y = 2600 / 2;
            this.wallRight.castShadow = this.wallRight.receiveShadow = false;
            this.scene.add(this.wallRight);
        }

        if (wallConfig.back > 0) {
            const geometryBack = new THREE.PlaneGeometry(wallConfig.back, 2600, 10, 10);
            this.wallBack = new THREE.Mesh(geometryBack, wallMaterial);
            this.wallBack.name = "wall-back";
            this.wallBack.rotateY(Math.PI / 2)
            this.wallBack.position.x = 0;
            this.wallBack.position.y = 2600 / 2;
            this.wallBack.position.z = wallConfig.back / 2;
            this.wallBack.castShadow = this.wallBack.receiveShadow = false;
            this.scene.add(this.wallBack);
        }

        if (wallConfig.left > 0) {
            const geometryLeft = new THREE.PlaneGeometry(wallConfig.left, 2600, 10, 10);
            this.wallLeft = new THREE.Mesh(geometryLeft, wallMaterial);
            this.wallLeft.name = "wall-left";
            this.wallLeft.position.x = wallConfig.left / 2;
            this.wallLeft.position.y = 2600 / 2;
            this.wallLeft.position.z = wallConfig.back;
            this.wallLeft.rotateY(Math.PI);
            this.wallLeft.castShadow = this.wallLeft.receiveShadow = false;
            this.scene.add(this.wallLeft);
        }
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
        this.frame_stats.begin();

        this.render();
    },
    render() {
        // console.log(`render ${this}`);
        /* if (store.getState().cameraLog) {
            console.log(`camera.position.set(${Math.round(this.camera.position.x)},${Math.round(this.camera.position.y)},${Math.round(this.camera.position.z)})`);
            console.log(`orbitControls.target.set(${Math.round(this.orbitControls.target.x)},${Math.round(this.orbitControls.target.y)},${Math.round(this.orbitControls.target.z)})`);
        } */

        this.frame_stats.update();
        this.renderer.render(this.scene, this.camera);
    },

    add(meuble) {
        this.scene.add(meuble.object);
        // this.render();
        // store.dispatch(add(meuble))
    },
    remove(meuble) {
        this.scene.remove(meuble.object);
        this.render();
    },
    getRaycasterIntersect() {
        var raycaster = new THREE.Raycaster();
        var vec = new THREE.Vector2();
        raycaster.setFromCamera(vec, this.camera);
        var intersects = raycaster.intersectObjects(this.scene.children, false); //array
        return intersects;
        // if (intersects.length > 0) {
        //     // selectedObject = intersects[0];
        //     // console.log(selectedObject);
        // }
    }
}
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
 import Stats from 'three/examples/jsm/libs/stats.module'

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
         return this.frame_stats.dom
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



        var scene_params = config.scene_params;


        this.scene = scene = new THREE.Scene();
        scene.background = new THREE.Color( scene_params.backgroundColor );

        if( scene_params.fogEnabled ){
            scene.fog = new THREE.Fog( scene_params.fog.color, scene_params.fog.near, scene_params.fog.far );
        }
        


        // THREE.Object3D.DefaultUp.set(0, 0, 1);

         

         
        var renderer_args = scene_params.properties

        this.renderer = renderer = new THREE.WebGLRenderer(renderer_args);

        renderer.shadowMap.enabled = scene_params.shadowMap.enabled;

        /*
        Shadow maps possibles =>
        THREE.BasicShadowMap
        THREE.PCFShadowMap
        THREE.PCFSoftShadowMap
        THREE.VSMShadowMap
        */
        if( scene_params.shadowMap.type === "BasicShadowMap" ){
            renderer.shadowMap.type = THREE.BasicShadowMap;
        } else if( scene_params.shadowMap.type === "PCFShadowMap" ) {
            renderer.shadowMap.type = THREE.PCFShadowMap;
        } else if( scene_params.shadowMap.type === "PCFSoftShadowMap" ) {
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        } else if( scene_params.shadowMap.type === "VSMShadowMap" ) {
            renderer.shadowMap.type = THREE.VSMShadowMap;
        } else {
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );

        // renderer.toneMapping = THREE.ACESFilmicToneMapping;
        // renderer.toneMappingExposure = 1;
        // renderer.outputEncoding = THREE.sRGBEncoding;
        // renderer.physicallyCorrectLights = true;
        // renderer.shadowMap.enabled = true;
        // renderer.localClippingEnable = false;
        // renderer.setClearColor(0xFFFFFF);

        // /* renderer.domElement.addEventListener("click", onclick, true);

        
        this.frame_stats = stats = new Stats();

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
        this.camera = camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 15000);
        camera.position.set(5038, 2000, 1987)

        /* controls */

        this.orbitControls = orbitControls = new OrbitControls(camera, renderer.domElement);
        // orbitControls.addEventListener('start', this.render.bind(this)); // use if there is no animation loop
        orbitControls.addEventListener('change', this.render.bind(this)); // use if there is no animation loop
        orbitControls.minDistance = 200;
        orbitControls.maxDistance = 10000;//10m
        orbitControls.target.set(2000, 1000, 2000);
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


        /* lumière moyenne ambiance */
        var light = new THREE.HemisphereLight(0xFFFDF4, 0x000000, .6);
        light.position.set(2500, 1200, 2500);
        const helper = new THREE.HemisphereLightHelper(light, 100);

		scene.add(light);
        //scene.add( helper );
		
		/* plafonnier */
		const pointLight = new THREE.PointLight( 0xffffff, .55, 0, 1 );
		pointLight.position.set( 2500, 3000, 2500 );
		pointLight.castShadow = true; // default false
		
		var PointLightHelper = new THREE.PointLightHelper(pointLight, 100);
		
		scene.add( pointLight );
		scene.add( PointLightHelper );
		
		pointLight.shadow.mapSize.width = scene_params.lightsShadowMapSize.width; //2048; // default
		pointLight.shadow.mapSize.height = scene_params.lightsShadowMapSize.height; //2048 // default
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
            color: scene_params.groundColor,
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

        

        const animate = function () {
            requestAnimationFrame(animate);

            var container = document.getElementById('canvas_wrapper');
            if( container ){

                renderer.setPixelRatio( container.offsetWidth / container.offsetHeight );
                renderer.setSize( container.offsetWidth, container.offsetHeight );
                camera.aspect = container.offsetWidth / container.offsetHeight;
                camera.updateProjectionMatrix();
            }

            
           
            scene.traverse(function ( ob ) {
                if( ob.name === "groupe-coulissante-2" ){
                    //console.log( "groupe-coulissante-2 x = ", ob.position.x );
                    if( ob.position.x > -695 ){
                        ob.position.x = ob.position.x - 4;
                    } else {
                        ob.position.x = 0;
                    }
                } 
            });

            stats.update();
            renderer.render(scene, camera);
        };

        animate();
        
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
        // putain obligé de gratter au fin fond pour mettre les stats dans le container plutot que dans le body !!
        this.frame_stats.dom.style.position = "absolute";
        document.getElementById('canvas_wrapper').appendChild( this.frame_stats.dom );
        this.frame_stats.begin();
    },
    render() {
        // console.log(`render ${this}`);
        if (store.getState().cameraLog) {
            console.log(`camera.position.set(${Math.round(this.camera.position.x)},${Math.round(this.camera.position.y)},${Math.round(this.camera.position.z)})`);
            console.log(`orbitControls.target.set(${Math.round(this.orbitControls.target.x)},${Math.round(this.orbitControls.target.y)},${Math.round(this.orbitControls.target.z)})`);
        }

        

        //this.frame_stats.update();
        //this.renderer.render(this.scene, this.camera);

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
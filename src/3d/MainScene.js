import {
    printRaycast,
    Tools,
    sceneChange,
}
    from '../api/actions'
import { KinoEvent, goingToKino } from '../api/Bridge'
import { Errors } from '../api/Errors'
import {
    Scene,
    Color,
    Raycaster,
    Vector2,
    WebGLRenderer,
    BasicShadowMap,
    PCFShadowMap,
    PCFSoftShadowMap,
    VSMShadowMap,
    PerspectiveCamera,
    Mesh,
    PlaneGeometry,
    MeshPhongMaterial,
    MeshStandardMaterial,
    AxesHelper,
    DoubleSide,
    CameraHelper,
} from "three";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import Stats from 'three/examples/jsm/libs/stats.module'

import { InteractionManager } from "./ThreeInteractive";// ok, pasted from ./node_modules\three.interactive\src\index.js

import store from '../api/store';
import { setupLights } from './helpers/Lights'
import { create as createSolGrid } from './helpers/Sol';
import { localhost } from '../api/Utils';
import { startEngine, stopEngine } from './Utils';
import { Walls, Corners } from "./Constants";
import Room from './Room';

import Draggable from './meubles/Draggable'
import Angle from './meubles/Angle'
import RL057 from './meubles/RL057'
import LSM from './meubles/LSM'
import Fileur from './meubles/Fileur'
import FileurAng90 from './meubles/FileurAng90'

export default {
    meubles: [],
    laque: null,
    laqueId: null,
    selection: null,

    getRendererNodeElement() {
        return this.renderer.domElement
    },
    getStatNodeElement() {
        return this.frame_stats.dom
    },
    setup(scene_params) {
        window.ts = this// f12 helper

        this.tool = Tools.ARROW
        this.scene_params = scene_params;
        let camera, scene, renderer, orbitControls, stats, manager;

        this.clear()
        this.scene = new Scene();
        scene = this.scene
        scene.background = new Color(scene_params.backgroundColor);

        /*         if (scene_params.fogEnabled) {
                    scene.fog = new Fog(scene_params.fog.color, scene_params.fog.near, scene_params.fog.far);
                } */
        // Object3D.DefaultUp.set(0, 0, 1);

        // renderer props hard coded :
        /*         var renderer_args = {
                    "preserveDrawingBuffer": true,// for picture taking
                    "antialias": true,
                    "powerPreference": "low-power",
                    "failIfMajorPerformanceCaveat": false
                } */
        var renderer_args = scene_params.renderer

        this.renderer = renderer = new WebGLRenderer(renderer_args);

        renderer.shadowMap.enabled = scene_params.shadowMap.enabled;

        /*
        Shadow maps possibles =>
        BasicShadowMap
        PCFShadowMap
        PCFSoftShadowMap
        VSMShadowMap
        */
        if (scene_params.shadowMap.type === "BasicShadowMap") {
            renderer.shadowMap.type = BasicShadowMap;
        } else if (scene_params.shadowMap.type === "PCFShadowMap") {
            renderer.shadowMap.type = PCFShadowMap;
        } else if (scene_params.shadowMap.type === "PCFSoftShadowMap") {
            renderer.shadowMap.type = PCFSoftShadowMap;
        } else if (scene_params.shadowMap.type === "VSMShadowMap") {
            renderer.shadowMap.type = VSMShadowMap;
        } else {
            renderer.shadowMap.type = PCFSoftShadowMap;
        }

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        // renderer.toneMapping = THREE.ACESFilmicToneMapping;
        // renderer.toneMappingExposure = 1;
        // renderer.outputEncoding = THREE.sRGBEncoding;
        // renderer.shadowMap.enabled = true;
        // renderer.localClippingEnable = false;
        // renderer.setClearColor(0xFFFFFF);

        /* stats */

        // this.frame_stats = stats = new Stats();

        /* camera */

        // +Z is up in Blender, whereas + Y is up in three.js
        this.camera = camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 100, 15000);
        camera.position.set(Room.xmax / 2, Room.ymax / 2, Room.zmax / 2)
        this.cameraHelper = new CameraHelper(this.camera);

        /* controls */

        this.orbitControls = orbitControls = new OrbitControls(camera, renderer.domElement);
        /* controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        } */
        // orbitControls.addEventListener('start', this.render.bind(this)); // use if there is no animation loop
        orbitControls.addEventListener('change', this.render.bind(this)); // use if there is no animation loop
        orbitControls.minDistance = 20;//2cm//How far you can dolly in
        orbitControls.maxDistance = 10000;//10m//How far you can dolly out
        orbitControls.enableZoom = true
        orbitControls.target.set(2000, 1000, 2000);
        orbitControls.update();

        // https://github.com/markuslerner/THREE.Interactive
        this.interactionManager = new InteractionManager(
            renderer,
            camera,
            renderer.domElement
        );

        const mesh = new Mesh(new PlaneGeometry(2000, 2000), new MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        scene.add(mesh);

        setupLights(this.scene, this.scene_params)
        this.buildWalls()
        this.resize()
    },
    render() {
        if (this.interactionManager) this.interactionManager.update();

        this.getRaycasterIntersect()

        // this.cameraHelper.update();
        // this.cameraHelper.visible = true;

        const renderer = this.renderer
        // this.frame_stats.update();
        this.renderer.render(this.scene, this.camera);
    },

    buildWalls(visible = true) {

        if (localhost) {

            /* 0,0,0 dot */

            const axesHelper = new AxesHelper(15000);
            this.scene.add(axesHelper);
        }

        if (this.wallRight) this.scene.remove(this.wallRight);
        if (this.wallFront) this.scene.remove(this.wallFront);
        if (this.wallLeft) this.scene.remove(this.wallLeft);
        if (this.wallBack) this.scene.remove(this.wallBack);

        const wallMaterial = new MeshStandardMaterial({
            color: 0x7E838D,
            transparent: true,
            opacity: visible ? .20 : 0,
            side: DoubleSide
        });

        if (Room.xmax > 0) {
            const geometryRight = new PlaneGeometry(Room.xmax, Room.ymax, 10, 10);
            this.wallRight = new Mesh(geometryRight, wallMaterial);
            this.wallRight.name = "wall-right";
            this.wallRight.position.x = Room.xmax / 2;
            this.wallRight.position.y = Room.ymax / 2;
            this.wallRight.castShadow = this.wallRight.receiveShadow = false;
            this.scene.add(this.wallRight);

            this.wallLeft = new Mesh(geometryRight, wallMaterial);
            this.wallLeft.name = "wall-left";
            this.wallLeft.position.x = Room.xmax / 2;
            this.wallLeft.position.y = Room.ymax / 2;
            this.wallLeft.position.z = Room.zmax;
            this.wallLeft.rotateY(Math.PI);
            this.wallLeft.castShadow = this.wallLeft.receiveShadow = false;
            this.scene.add(this.wallLeft);
        }

        if (Room.zmax > 0) {
            const geometryBack = new PlaneGeometry(Room.zmax, Room.ymax, 10, 10);
            this.wallFront = new Mesh(geometryBack, wallMaterial);
            this.wallFront.name = "wall-front";
            this.wallFront.rotateY(Math.PI / 2)
            this.wallFront.position.x = 0;
            this.wallFront.position.y = Room.ymax / 2;
            this.wallFront.position.z = Room.zmax / 2;
            this.wallFront.castShadow = this.wallFront.receiveShadow = false;
            this.scene.add(this.wallFront);

            this.wallBack = new Mesh(geometryBack, wallMaterial);
            this.wallBack.name = "wall-back";
            this.wallBack.rotateY(Math.PI / 2)
            this.wallBack.position.x = Room.xmax;
            this.wallBack.position.y = Room.ymax / 2;
            this.wallBack.position.z = Room.zmax / 2;
            this.wallBack.castShadow = this.wallBack.receiveShadow = false;
            this.scene.add(this.wallBack);
        }

        if (visible) {
            if (this.sol && this.sol.parent == this.scene) this.scene.remove(this.sol);
            this.sol = createSolGrid(Room.xmax, Room.zmax)
            this.scene.add(this.sol);
        }
    },
    clear() {
        if (this.scene) this.scene.clear();
        this.meubles = [];

        //TODO clean all...search for threejs clean scene
    },
    update(wallVisible = true) {
        this.clear();
        setupLights(this.scene, this.scene_params)
        this.buildWalls(wallVisible)
    },
    resize() {
        const canvasWrapper = document.getElementById("canvas-wrapper")
        if (!canvasWrapper) return
        // console.log(`canvas-wrapper size is ${canvasWrapper.offsetWidth}x${canvasWrapper.offsetHeight}`)
        this.renderer.setPixelRatio(canvasWrapper.offsetWidth / canvasWrapper.offsetHeight);
        this.renderer.setSize(canvasWrapper.offsetWidth, canvasWrapper.offsetHeight);
        this.camera.aspect = canvasWrapper.offsetWidth / canvasWrapper.offsetHeight;
        this.camera.updateProjectionMatrix();

        // this.orthoCamera.aspect = canvasWrapper.offsetWidth / canvasWrapper.offsetHeight;
        // this.orthoCamera.updateProjectionMatrix();

        this.render()
    },

    add(meuble) {
        this.scene.add(meuble.object);
        this.meubles.unshift(meuble);
        sceneChange()
    },
    remove(meuble) {
        meuble.remove()
        this.scene.remove(meuble.object);
        this.meubles = this.meubles.filter(item => item !== meuble)
        sceneChange()
    },
    deselect() {
        if (this.selection && this.selection.deselect) this.selection.deselect()
        this.selection = null
    },
    enableMeubleDragging(enabled) {
        this.meubles.forEach(m => {
            if (m.dragControls) {
                if (enabled) m.dragControls.activate()
                else m.dragControls.deactivate()
            }
        })
    },
    enableItemsDragging(enabled) {
        this.meubles.forEach(m => {
            m.items.forEach(i => {
                if (i.dragControls) {
                    if (enabled) i.dragControls.activate()
                    else i.dragControls.deactivate()
                }
            })
        })
    },
    enableMeubleClicking(enabled) {
        this.meubles.forEach(m => {
            m.enableClick(enabled)
        })
    },

    /*
    roll over works if interactionManager updates
    */
    itemMouseOver(fbx, interactiveEvent) {
        interactiveEvent.stopPropagation()
        goingToKino(KinoEvent.MOUSEOVER_ITEM, `${fbx.props.sku}|${fbx.getUid()}`, interactiveEvent.target ? interactiveEvent.target.name : "no-name")

    },
    itemMouseOut(fbx, interactiveEvent) {
        interactiveEvent.stopPropagation()
        goingToKino(KinoEvent.MOUSEOUT_ITEM, `${fbx.props.sku}|${fbx.getUid()}`, interactiveEvent.target ? interactiveEvent.target.name : "no-name")
    },
    enableMeublePainting(enabled) {
        this.meubles.forEach(m => {
            m.object.children
                .filter(c => m.props.laquables.includes(c.name))
                .forEach(c => {
                    if (enabled) {
                        this.interactionManager.add(c)
                        c.addEventListener('mousedown', m.clickLaquable.bind(m))
                        c.addEventListener('mouseover', this.itemMouseOver.bind(this, m))
                        c.addEventListener('mouseout', this.itemMouseOut.bind(this, m))

                    } else {
                        this.interactionManager.remove(c)
                        c.removeEventListener('mousedown', m.clickLaquable.bind(m))
                        c.removeEventListener('mouseover', this.itemMouseOver.bind(this, m))
                        c.removeEventListener('mouseout', this.itemMouseOut.bind(this, m))
                    }
                })
            m.items.forEach(i => {
                i.object.children.filter(c => i.props.laquables.includes(c.name)).forEach(c => {
                    if (enabled) {
                        this.interactionManager.add(c)
                        c.addEventListener('mousedown', i.clickLaquable.bind(i))
                        c.addEventListener('mouseover', this.itemMouseOver.bind(this, i))
                        c.addEventListener('mouseout', this.itemMouseOut.bind(this, i))
                    } else {
                        this.interactionManager.remove(c)
                        c.removeEventListener('mousedown', i.clickLaquable.bind(i))
                        c.removeEventListener('mouseover', this.itemMouseOver.bind(this, i))
                        c.removeEventListener('mouseout', this.itemMouseOut.bind(this, i))
                    }
                })
            })
        })
        if (enabled) {
            startEngine(this.render.bind(this))
        }
        else {
            stopEngine()
        }
    },


    enableItemsRemoving(enabled) {
        this.meubles.forEach(m => {
            m.items.forEach(i => {
                if (enabled) {
                    this.interactionManager.add(i.object)
                    i.object.addEventListener('mousedown', m.removeItem.bind(m, i))
                } else {
                    this.interactionManager.remove(i.object)
                    i.object.removeEventListener('mousedown', m.removeItem.bind(m, i))
                }
            })
        })
    },
    getRaycasterIntersect() {
        const raycaster = new Raycaster();
        const vec = new Vector2();
        raycaster.setFromCamera(vec, this.camera);
        const intersects = raycaster.intersectObjects(this.scene.children, false); //array
        const intersect = intersects.find(i => i.object.name.includes("wall-"))
        let pRaycast = ""
        if (intersect) {
            const wall = intersect.object
            const p = intersect.point
            const corner = Room.getClosestCorner(wall, p)
            pRaycast = `Central ray on ${wall.name} @${Math.round(intersect.distance)}mm`
            // pRaycast += ` ${Math.round(p.x)}|${Math.round(p.y)}|${Math.round(p.z)} ${corner}`
        }
        store.dispatch(printRaycast(pRaycast))

        return intersects;
        // if (intersects.length > 0) {
        //     // selectedObject = intersects[0];
        // }
    },
    /*
        props from catalogue (infos)
        object from fbx (3d)
        state from saved dressing (user modifications)

        2 origins : click meuble line or load meuble from dressing => confusion
    */
    createMeuble(props, object, state, skuInfo) {
        if (!skuInfo.isModule) {
            return Errors.NOT_A_MODULE
        }

        // distinction clickMeubleLine vs. loadMeubleFromDressing : state == null

        let pState, wall = "right", corner = Corners.FR
        if (!state) {
            // find front wall, best location for new Meuble
            const intersects = this.getRaycasterIntersect()
            const intersect = intersects.find(i => i.object.name.includes("wall-"))
            if (intersect) {
                const wallObject = intersect.object
                wall = wallObject.name.substring("wall-".length)
                corner = Room.getClosestCorner(wallObject, intersect.point)
                console.log(`facing to wall ${wall}, closest corner ${corner}`, intersect)
            }
            pState = {
                position: {
                    wall,
                    x: 1000
                }
            }
        }
        else {
            pState = state
        }

        // distingo creation : state
        // TODO preparation de la pose comme sur le dragStart : à sortir plus haut ?
        Room.setupWallConstraints(skuInfo.l)
        Room.axis = Room.getAxisForWall(wall);
        Room.populateMeublesOnWalls(this.meubles)
        Room.populateSpacesOnWalls(null, skuInfo)
        Room.populateMeublesOnCorners(this.meubles)


        let meuble
        /* 
            better find a place for future meuble before creation, only using skuInfo dimensions, and send error if no room !
        */
        switch (skuInfo.type) {
            case "ANG":// not Draggable, only located in angles
                if (!state) {
                    const cornerFree = Room.isCornerFreeForMeuble(corner, skuInfo)
                    if (typeof cornerFree === "string") return cornerFree// error
                }
                meuble = new Angle(props, object, state ? state : { position: { wall: corner, x: 0 } }, skuInfo)
                break;
            case "ANG90":// fileur angle not Draggable, only located in angles
                if (!state) {
                    const cornerFree = Room.isCornerFreeForMeuble(corner, skuInfo)
                    if (typeof cornerFree === "string") return cornerFree// error
                }
                meuble = new FileurAng90(props, object, state ? state : { position: { wall: corner, x: 0 } }, skuInfo)
                break;
            case "FIL":// a Draggable with depth adjustement
                meuble = new Fileur(props, object, pState, skuInfo)
                break;
            case "P40RL057":// range chaussure, pivotable à 90
                meuble = new RL057(props, object, pState, skuInfo)
                break;
            case "LSM":// largeur sur mesure
                meuble = new LSM(props, object, pState, skuInfo)
                break;
            default:
                meuble = new Draggable(props, object, pState, skuInfo)
        }
        if (!state && skuInfo.type != "ANG" && skuInfo.type != "ANG90") {

            // TODO

            // place on front wall ? ..Draggable routines ! 
            // on n'utilise pas setPosition 2 fois !. Routine getSpaceOnWall pour trouver sa place :
            const axis = Room.getAxisForWall(wall);
            const x = Room.getSpaceOnWall(meuble, this.meubles)

            if (x === false) {// destroy Meuble?
                return Errors.NO_ROOM
            }
            else {
                meuble.object.position[axis] = x


            }
        }
        return meuble
    }




    /* orthographic camera for 2d plan */

    /*      const left = -Room.xmax / 2;
            const right = Room.xmax / 2;  // default canvas size
            const top = -Room.zmax / 2;
            const bottom = Room.zmax / 2;  // default canvas size
            const near = 10;
            const far = 6000;
            this.orthoCamera = new OrthographicCamera(left, right, top, bottom, near, far);
            this.orthoCamera.position.set(Room.xmax / 2, 6000, Room.zmax / 2)
            this.orthoCamera.lookAt(Room.xmax / 2, 0, Room.zmax / 2);
            this.orthoCamera.zoom = 1;
            this.orthoCameraHelper = new CameraHelper(this.orthoCamera); */

    /*     setScissorForElement(elem) {
            const canvas = document.getElementById("canvas-wrapper")
            const canvasRect = canvas.getBoundingClientRect();
            const elemRect = elem.getBoundingClientRect();
    
            // compute a canvas relative rectangle
            const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
            const left = Math.max(0, elemRect.left - canvasRect.left);
            const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
            const top = Math.max(0, elemRect.top - canvasRect.top);
    
            const width = Math.min(canvasRect.width, right - left);
            const height = Math.min(canvasRect.height, bottom - top);
    
            // setup the scissor to only render to that part of the canvas
            const positiveYUpBottom = canvasRect.height - bottom;
            this.renderer.setScissor(left, positiveYUpBottom, 5000, 5000);
            this.renderer.setViewport(left, positiveYUpBottom, 5000, 5000);
    
            // return the aspect
            return width / height;
        }, */
}
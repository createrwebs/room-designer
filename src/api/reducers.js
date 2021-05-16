import {
    CameraEvent,
    MeubleEvent,
    SceneEvent,
    KinoEvent,
    Tools
}
    from './actions'

// here or on Room?
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import Loader from '../3d/Loader'
import MainScene from '../3d/MainScene';
import Draggable from '../3d/Draggable'
import { getCurrentScene } from '../3d/Dressing';
import { cameraTo, tweenTo } from '../3d/Animate';
import { Vector3 } from 'three';
import { takePix } from '../3d/Capture';
import { load as loadMaterial, apply as applyMaterial } from '../3d/Material'

const initialState = {
    config: null,
    scenes: [],
    light: true,
    dragged: null,
    selection: null,
    cameraLog: false,
    currentScene: null,
    allAssetsLoaded: false,
    camera: {
        fov: 70,
        zoom: 1.0,
        focus: 10
    },
    meublesOnScene: [],
    layout: {
        meubleListShowed: true,
        composerShowed: false,
        texturerShowed: false,
    },
    tool: Tools.ARROW
}
let currentScene, localScenes, scenes, meublesOnScene, selection;
export const reducer = (state = initialState, action) => {
    switch (action.type) {

        case SceneEvent.SETLIGHT:
            return {
                ...state, light: !state.light
            }
        case SceneEvent.SETCONFIG:
            MainScene.setup(action.config)
            return {
                ...state, config: action.config
            }
        case SceneEvent.RESIZE:
            MainScene.resize()
            return {
                ...state
            }
        case SceneEvent.SETCATALOGUE:
            return {
                ...state, catalogue: action.catalogue
            }
        case SceneEvent.SETSCENES:
            scenes = action.scenes
            localScenes = localStorage && localStorage.getItem('scenes');
            if (localScenes) scenes.push(...JSON.parse(localScenes))
            return {
                ...state, scenes
            }
        case SceneEvent.NEWSCENE:
            if (!action.dressing) {
                console.error("New scene failed : no config object passed")
                return {
                    ...state
                }
            }
            currentScene = action.dressing
            currentScene.walls.left = currentScene.walls.right// longueur murs latéraux égales

            MainScene.scene.clear();
            MainScene.setupLights();
            MainScene.setupWalls(currentScene.walls)
            MainScene.render()
            return {
                ...state, currentScene
            }
        case SceneEvent.LOADSCENE:
            currentScene = action.dressing
            currentScene.walls.left = currentScene.walls.right// longueur murs latéraux égales

            MainScene.scene.clear();
            MainScene.setupLights();
            MainScene.setupWalls(currentScene.walls)
            meublesOnScene = [];
            currentScene.meubles.forEach(m => {

                const props = state.catalogue.find(f => f.sku === m.sku)
                if (!props) {
                    console.log("no meuble found for sku ", m.sku)
                    return null
                }

                //meuble props are catalogue props + dressing props
                props.position = m.position;

                MainScene.loadFbx(props.fbx.url, object => {
                    if (m.position) {
                        const meuble = new Draggable(props, object)
                        MainScene.add(meuble);
                        meublesOnScene.unshift(meuble);
                    }
                    MainScene.render()
                })

            })
            MainScene.render()
            return {
                ...state, currentScene, meublesOnScene
            }
        case SceneEvent.NEWSCENE_OLD:
            scenes = []
            localScenes = localStorage && localStorage.getItem('scenes');
            if (localScenes) scenes.push(...JSON.parse(localScenes))

            let k = 1;
            let name = "Nouvelle composition"
            while (scenes.find(s => s.name === name) != null)
                name = `Nouvelle composition ${k++}`

            currentScene = {
                name,
                walls: state.config.walls,
                meubles: []
            }

            scenes.push(currentScene)
            localStorage.setItem('scenes', JSON.stringify(scenes));

            MainScene.scene.clear();
            MainScene.setupLights();
            MainScene.setupWalls(currentScene.walls)
            MainScene.render()
            return {
                ...state, currentScene: currentScene
            }
        case SceneEvent.SAVESCENE:
            if (state.currentScene) {
                scenes = []
                localScenes = localStorage && localStorage.getItem('scenes');
                if (localScenes) scenes.push(...JSON.parse(localScenes))

                const item = scenes.find(s => s.name === state.currentScene.name)
                const idx = scenes.indexOf(item)
                if (idx >= 0)
                    scenes[idx] = state.currentScene

                localStorage.setItem('scenes', JSON.stringify(scenes));
            }
            return {
                ...state
            }
        case SceneEvent.SAVESCENETOFILE:
            if (state.currentScene) {
                // const uriContent = 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.currentScene));
                const uriContent = 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(getCurrentScene(state)));

                var pom = document.createElement('a');
                pom.setAttribute('href', uriContent);
                pom.setAttribute('download', `${state.currentScene.name}.minet`);
                if (document.createEvent) {
                    var event = document.createEvent('MouseEvents');
                    event.initEvent('click', true, true);
                    pom.dispatchEvent(event);
                }
                else {
                    pom.click();
                }
            }
            return {
                ...state
            }
        case SceneEvent.SETCURRENTSCENEPROP:
            return {
                ...state, currentScene: Object.assign(state.currentScene, action.prop)
            }
        case SceneEvent.SETCURRENTSCENEWALL:
            currentScene = state.currentScene;
            if (action.checked) {
                currentScene.walls[action.wall] = 4000
            }
            else {
                delete currentScene.walls[action.wall]
            }
            MainScene.setupWalls(currentScene.walls)
            MainScene.render()
            return {
                ...state, currentScene
            }
        case SceneEvent.SETCURRENTSCENEWALLLENGTH:
            // console.log("SETCURRENTSCENEWALLLENGTH", action)
            currentScene = state.currentScene;
            currentScene.walls[action.wall] = action.length

            // mapDispatchToProps on Room for currentScene, to update and render Three mainscene, or :
            MainScene.setupWalls(currentScene.walls)
            MainScene.render()
            return {
                ...state, currentScene
            }
        case SceneEvent.TAKEPICTURE:
            takePix("minet3d-scene-snapshopt")
            return {
                ...state
            }

        /* camera */

        case CameraEvent.SET:
            const camera = Object.assign(state.camera, action.prop);
            return {
                ...state, camera
            }
        case CameraEvent.LOG:
            return {
                ...state, cameraLog: !state.cameraLog
            }



        case MeubleEvent.ALLLOADED:
            MainScene.allLoaded();
            return {
                ...state, allAssetsLoaded: true
            }
        case MeubleEvent.SELECT:
            switch (state.tool) {
                case Tools.ARROW:
                    console.warn(`Scene tool click`)
                    if (action.meuble) console.warn(`Use hammer tool to edit ${action.meuble.props.sku}`)
                    if (state.selection) state.selection.deselect();
                    return {
                        ...state, selection: null
                    }
                case Tools.HAMMER:
                    if (action.meuble) {
                        if (state.selection) state.selection.deselect();
                        action.meuble.select()
                        const front = action.meuble.getFrontPosition()
                        const center = action.meuble.getCenterPoint()
                        // MainScene.camera.position.set(front.x, front.y, front.z)
                        // MainScene.orbitControls.target = action.meuble.getCenterPoint()
                        // MainScene.orbitControls.update();
                        // MainScene.render()
                        cameraTo(front, center, 800)
                        if (window.kino_bridge)
                            window.kino_bridge(KinoEvent.SELECT_MEUBLE, action.meuble.props.sku)
                        return {
                            ...state, selection: action.meuble
                        }
                    }
                    else {
                        return {
                            ...state
                        }
                    }
                case Tools.TRASH:

                    meublesOnScene = [...state.meublesOnScene];
                    meublesOnScene = meublesOnScene.filter(m => {
                        return m !== action.meuble
                    })
                    MainScene.remove(action.meuble)
                    MainScene.render()
                    return { ...state, meublesOnScene, selection: null };

                default:
                    console.warn(`No tool selected`)
                    return {
                        ...state
                    }
            }
        case MeubleEvent.ADD:
            meublesOnScene = [...state.meublesOnScene];
            meublesOnScene.unshift(action.meuble);
            // meublesOnScene.sort((a, b) => {... possible to sort
            return { ...state, meublesOnScene: meublesOnScene };
        case MeubleEvent.DRAG:
            return { ...state, dragged: action.meuble };
        case MeubleEvent.REMOVESELECTED:
            meublesOnScene = [...state.meublesOnScene];
            meublesOnScene = meublesOnScene.filter(m => {
                return m !== state.selection
            })
            MainScene.remove(state.selection)
            MainScene.render()
            return { ...state, meublesOnScene, selection: null };

        case SceneEvent.CHANGE_TOOL:
            switch (action.tool) {
                case Tools.ARROW:// deselection => camera to room center ?
                    if (state.selection) state.selection.deselect();
                case Tools.HAMMER:
                case Tools.TRASH:
                default:
            }
            return { ...state, tool: action.tool, selection: null };

        case MeubleEvent.DROP_MEUBLE_TO_SCENE:
        case MeubleEvent.CLICKMEUBLELINE:
            if (!state.currentScene) {
                console.warn("No scene : please add a scene bofore meuble")
                return { ...state }
            }

            const props = state.catalogue.find(f => f.sku === action.sku)
            if (!props) {
                console.warn(`No meuble found for sku ${action.sku}`)
                return { ...state }
            }

            if (state.selection) {

                if (state.selection.props.accessoirescompatibles.indexOf(action.sku) === -1) {
                    console.warn(`${action.sku} non compatible avec ${state.selection.props.sku} sélectionné`)
                    return { ...state };
                }
                else {
                    state.selection.addItem(props);
                    return { ...state };
                }
            } else {
                meublesOnScene = [...state.meublesOnScene];

                MainScene.loadFbx(props.fbx.url, object => {

                    // find front wall, best location for new Meuble
                    let wall = Object.keys(state.currentScene.walls)[0] || "right"
                    const intersects = MainScene.getRaycasterIntersect()
                    const intersect = intersects.find(i => i.object.name.includes("wall-"))
                    if (intersect) wall = intersect.object.name.substring("wall-".length)
                    console.log("front wall found", wall)

                    props.position = {
                        wall,
                        x: 0
                    }
                    selection = new Draggable(props, object)

                    // place on front wall ? ..Draggable routines ! //TODO
                    // on n'utilise pas setPosition 2 fois !. Routine getSpaceOnWall pour trouver sa place :
                    const axis = Draggable.getAxisForWall(wall);
                    const x = Draggable.getSpaceOnWall(selection)
                    if (x === false) {
                        console.log(`no space for ${selection.ID} on wall ${wall}`)
                    }
                    else {
                        selection.object.position[axis] = x
                        console.log(selection.wall, x)

                        MainScene.add(selection);
                        meublesOnScene.unshift(selection);
                        MainScene.render()
                    }
                })
                return { ...state, meublesOnScene, selection };
            }

        case MeubleEvent.DRAG_MEUBLE_OVER_SCENE:
            return { ...state };

        case MeubleEvent.ANIM:

            const selectedMeuble = state.selection
            if (!selectedMeuble) return { ...state }
            const center = selectedMeuble.getCenterPoint()
            // var center = new Vector3(0, 0, 0);
            var distanceToMove = 200;

            selectedMeuble.object.traverse(function (child) {
                console.log(child, child.name, child.position)


                // var meshPosition = child.position;

                // var direction = meshPosition.clone().sub(center).normalize();

                // var moveThisFar = direction.clone().multiplyScalar(distanceToMove);

                // // mainStand.children[i].position.add(moveThisFar);
                // var gotoPosition = new Vector3(0, 0, 0);


                // tweenTo(child.position, moveThisFar, 1000)
            })

            return { ...state };

        case SceneEvent.SET_SCENE_MATERIAL:
            meublesOnScene = [...state.meublesOnScene];
            loadMaterial(action.material).then(material => {
                console.log(`material loaded`, material)
                meublesOnScene.forEach(meuble => {
                    applyMaterial(material, meuble)
                })
                MainScene.render()
            })
            return { ...state };

        case MeubleEvent.LOAD_ALL_SKU:

            if (!state.currentScene) {
                console.error("No scene : Please create a scene")
                return { ...state }
            }

            let lastPos = 0;
            meublesOnScene = [...state.meublesOnScene];
            let subobjectsNames = []
            state.catalogue.forEach(props => {

                if (!props) {
                    console.log("no meuble found for sku ", action.sku)
                    return { ...state }
                }

                MainScene.loadFbx(props.fbx.url, object => {

                    object.traverse(function (child) {
                        if (subobjectsNames.indexOf(child.name) >= 0) {
                        }
                        else {
                            subobjectsNames.push(child.name)
                            console.log(child.name)
                        }
                        // find front wall, best location for new Meuble
                        let wall = Object.keys(state.currentScene.walls)[0] || "right"
                        const intersects = MainScene.getRaycasterIntersect()
                        const intersect = intersects.find(i => i.object.name.includes("wall-"))
                        if (intersect) wall = intersect.object.name.substring("wall-".length)
                        console.log("front wall found", wall)

                        // place on front wall ? ..Draggable routines ! //TODO
                        props.position = {
                            wall,
                            x: lastPos
                        }
                        lastPos += parseInt(props.largeur)
                        selection = new Draggable(props, object)
                        MainScene.add(selection);
                        meublesOnScene.unshift(selection);
                        MainScene.render()
                    })

                })
            })
            return { ...state, meublesOnScene };



        case SceneEvent.GENERATE_ALL_PIX:

            // if meuble selected, take its center to put meubles for pix batching
            var centerMeubleForPix = 2000
            if (state.selection) {// please on back wall !!
                centerMeubleForPix = state.selection.getCenterPoint().z//for back wall !
            }

            MainScene.scene.clear();
            MainScene.setupLights();
            MainScene.setupWalls({
                "right": 1000,
                "back": 8000
            }, false)

            state.catalogue.forEach(props => {
                if (props.sku && props.sku != "" && props.fbx.url && props.fbx.url != "") {
                    MainScene.loadFbx(props.fbx.url, object => {
                        props.position = {
                            wall: "back",
                            x: centerMeubleForPix - props.largeur / 2
                        }
                        var meuble = new Draggable(props, object)

                        //test textures
                        /* var textu = {
                            hori: {
                                url: "chene-blanc-hori.jpg",
                                label: "Chêne blanc",
                                angle_fil: 0
                            },
                            vert: {
                                url: "chene-blanc-vert.jpg",
                                label: "Chêne blanc",
                                angle_fil: 90
                            },
                            fond: {
                                url: "cuir.jpg",
                                label: "Chêne blanc",
                                angle_fil: 0
                            },
                            portes: {
                                url: "chene-charleston-vert.jpg",
                                label: "Chêne charleston",
                                angle_fil: 0
                            }
                        }
                        loadTextures(meuble.object, textu).then(response => {
                            console.log(`textures loaded`, response)
                            MainScene.add(meuble);
                            MainScene.render()
                            takePix(`${props.sku}`)// textures !!?
                            MainScene.remove(meuble);
                        }) */
                        MainScene.add(meuble);
                        MainScene.render()
                        takePix(`${props.sku}`)// textures !!?
                        MainScene.remove(meuble);


                    })
                }
                else {
                    console.warn(`Reference problem found in catalogue :`, props)
                }
            })
            return { ...state };
        default:
            return state;
    }
}

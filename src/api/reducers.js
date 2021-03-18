import { NotificationManager } from 'react-notifications';
import {
    CameraEvent,
    MeubleEvent,
    SceneEvent
}
    from './actions'

// here or on Room?
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import Loader from '../3d/Loader'
import MainScene from '../3d/MainScene';
import Draggable from '../3d/Draggable'

const loader = new FBXLoader(Loader.manager);
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
    }
}
let currentScene, localScenes, scenes
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
        case SceneEvent.SETSCENES:
            scenes = action.scenes
            localScenes = localStorage && localStorage.getItem('scenes');
            if (localScenes) scenes.push(...JSON.parse(localScenes))
            return {
                ...state, scenes
            }
        case SceneEvent.NEWSCENE:
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
                const uriContent = 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.currentScene));
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
        case SceneEvent.LOADSCENE:
            currentScene = state.scenes.find(s => s.name == action.name)
            if (currentScene) {

                MainScene.scene.clear();
                MainScene.setupLights();
                MainScene.setupWalls(currentScene.walls)
                currentScene.meubles.forEach(props => loader.load(`models/${props.file}.fbx`, object => {
                    if (props.position) {
                        MainScene.add(new Draggable(props, object));
                    }
                }))
                MainScene.render()
            }
            return {
                ...state, currentScene: currentScene
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
            console.log("ooo", action)
            currentScene = state.currentScene;
            currentScene.walls[action.wall] = action.length

            // mapDispatchToProps on Room for currentScene, to update and render Three mainscene, or :
            MainScene.setupWalls(currentScene.walls)
            MainScene.render()
            return {
                ...state, currentScene
            }

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
            return {
                ...state, selection: action.meuble
            }
        case MeubleEvent.ADD:
            let meublesOnScene = [...state.meublesOnScene];
            meublesOnScene.unshift(action.meuble);
            // meublesOnScene.sort((a, b) => {... possible to sort
            return { ...state, meublesOnScene: meublesOnScene };
        case MeubleEvent.DRAG:
            return { ...state, dragged: action.meuble };
        case MeubleEvent.REMOVE:
            let meublesOnScene2 = [...state.meublesOnScene];
            meublesOnScene2 = meublesOnScene2.filter(m => {
                return m !== action.meuble
            })
            return { ...state, meublesOnScene: meublesOnScene2 };
        case MeubleEvent.CLICKMEUBLELINE:
            const props = state.config.fbx.find(f => f.file === action.file)

            loader.load(`models/${props.file}.fbx`, object => {

                // find front wall, best location for new Meuble
                let wall = Object.keys(state.currentScene.walls)[0] || "right"
                const intersects = MainScene.getRaycasterIntersect()
                const intersect = intersects.find(i => i.object.name.includes("wall-"))
                if (intersect) wall = intersect.object.name.substring("wall-".length)
                console.log("front wall found", wall)

                // place on front wall ? ..Draggable routines ! //TODO
                props.position = {
                    wall,
                    x: 0
                }
                MainScene.add(new Draggable(props, object));
            })
            MainScene.render()

            return { ...state };
        default:
            return state;
    }
}

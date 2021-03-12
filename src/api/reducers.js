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


const initialState = {
    config: null,
    scenes: [],
    light: true,
    dragged: null,
    selection: null,
    cameraLog: false,
    // currentScene: null,
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
            return {
                ...state, scenes: action.scenes
            }
        case SceneEvent.LOADSCENE:
            const currentScene = state.scenes.find(s => s.name == action.name)
            if (currentScene) {
                const loader = new FBXLoader(Loader.manager);
                MainScene.scene.clear();
                MainScene.setupLights();
                MainScene.setupWalls(currentScene.walls)
                currentScene.meubles.forEach(props => loader.load(`models/${props.file}.fbx`, object => {
                    if (props.position) {
                        MainScene.add(new Draggable(props, object));
                    }
                }))
            }
            return {
                ...state, currentScene: currentScene
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
        default:
            return state;
    }
}

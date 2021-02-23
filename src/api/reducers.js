import { NotificationManager } from 'react-notifications';
import ThreeScene from '../3d/ThreeScene';
import {
    CameraEvent,
    ObjectEvent,
    SceneEvent
}
    from './actions'

const initialState = {
    config: null,
    light: true,
    dragged: null,
    selection: null,
    cameraLog: false,
    camera: {
        fov: 70,
        zoom: 1.0,
        focus: 10
    },
    meublesOnScene: []
}

export const reducer = (state = initialState, action) => {
    switch (action.type) {

        case SceneEvent.SETLIGHT:
            return {
                ...state, light: !state.light
            }
        case SceneEvent.SETCONFIG:
            ThreeScene.setup(action.config)
            return {
                ...state, config: action.config
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
        case ObjectEvent.ALLLOADED:
            ThreeScene.allLoaded();
            return {
                ...state
            }
        case ObjectEvent.SELECT:
            return {
                ...state, selection: action.meuble
            }
        case ObjectEvent.ADD:
            let meublesOnScene = [...state.meublesOnScene];
            meublesOnScene.unshift(action.meuble);
            // meublesOnScene.sort((a, b) => {... possible to sort
            return { ...state, meublesOnScene: meublesOnScene };
        case ObjectEvent.DRAG:
            return { ...state, dragged: action.meuble };
        case ObjectEvent.REMOVE:
            let meublesOnScene2 = [...state.meublesOnScene];
            meublesOnScene2 = meublesOnScene2.filter(m => {
                return m !== action.meuble
            })
            return { ...state, meublesOnScene: meublesOnScene2 };
        default:
            return state;
    }
}

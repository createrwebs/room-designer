import { NotificationManager } from 'react-notifications';
import {
    CameraEvent,
    ObjectEvent,
    SceneEvent
}
    from './actions'


const initialState = {
    light: true,
    selection: null,
    camera: {
        fov: 70,
        zoom: 1.0,
        focus: 10
    }
}

export const reducer = (state = initialState, action) => {
    switch (action.type) {

        case SceneEvent.SETLIGHT:
            return {
                ...state, light: !state.light
            }
        case CameraEvent.SET:
            const camera = Object.assign(state.camera, action.prop);
            return {
                ...state, camera
            }
        case ObjectEvent.SELECT:
            return {
                ...state, selection: action.selection
            }
        default:
            return state;
    }
}

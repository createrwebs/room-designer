import {
    CameraEvent,
    MeubleEvent,
    SceneEvent,
    LoadingEvent
}
    from './actions'

function insertItem(array, item) {
    const newArray = [...array];
    newArray.push(item)
    return newArray
}

function removeItem(array, item) {
    return [...array].filter(i => item !== i)
}
import defaultdressing from '../../assets/dressings/defaultdressing.json';

const initialState = {
    configLoaded: false,
    scenes: [],
    light: true,
    dragged: null,
    currentScene: defaultdressing,
    allAssetsLoaded: false,
    camera: {
        fov: 70,
        zoom: 1.0,
        focus: 10
    },
    loadingItems: []
}
export const reducer = (state = initialState, action) => {
    switch (action.type) {

        /* file loadings */

        case LoadingEvent.START:
            return {
                ...state, loadingItems: insertItem(state.loadingItems, action.url)
            }
        case LoadingEvent.PROGRESS:
            return {
                ...state, loadingItems: removeItem(state.loadingItems, action.url)
            }
        case LoadingEvent.QUEUE_FINISHED:
            return {
                ...state
            }
        case LoadingEvent.ERROR:
            return {
                ...state, loadingItems: removeItem(state.loadingItems, action.url)
            }

        /* setters */

        case SceneEvent.SETCONFIG:
            return {
                ...state, configLoaded: true
            }
        case SceneEvent.SETCATALOGUE:
            return {
                ...state, catalogue: action.catalogue
            }
        case SceneEvent.SETSCENES:
            return {
                ...state, scenes: action.scenes
            }

        /* scenes 
        
        - new dressing comes from wp without ID
        - loaded dressing comes from wp with ID        
        */

        case SceneEvent.NEWSCENE:
        case SceneEvent.LOADSCENE:
            return {
                ...state, currentScene: action.dressing
            }


        /* camera */

        case CameraEvent.SET:
            const camera = Object.assign(state.camera, action.prop);
            return {
                ...state, camera
            }

        /* meubles */

        case MeubleEvent.ALLLOADED:
            return {
                ...state, allAssetsLoaded: true
            }
        case MeubleEvent.DRAG:
            return {
                ...state, dragged: action.meuble
            };

        default:
            return state;
    }
}

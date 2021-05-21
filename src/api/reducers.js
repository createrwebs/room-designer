import {
    CameraEvent,
    MeubleEvent,
    SceneEvent,
    Tools,
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

const initialState = {
    config: null,
    scenes: [],
    light: true,
    dragged: null,
    currentScene: null,
    allAssetsLoaded: false,
    camera: {
        fov: 70,
        zoom: 1.0,
        focus: 10
    },
    tool: Tools.ARROW,
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
        case LoadingEvent.ERROR:
            return {
                ...state, loadingItems: removeItem(state.loadingItems, action.url)
            }

        /* setters */

        case SceneEvent.SETLIGHT:
            return {
                ...state, light: !state.light
            }
        case SceneEvent.SETCONFIG:
            return {
                ...state, config: action.config
            }
        case SceneEvent.SETCATALOGUE:
            return {
                ...state, catalogue: action.catalogue
            }
        case SceneEvent.SETSCENES:
            return {
                ...state, scenes: action.scenes
            }

        /* scenes */

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

        /* tools */

        case SceneEvent.CHANGE_TOOL:
            return {
                ...state, tool: action.tool
            };

        default:
            return state;
    }
}

import {
    MeubleEvent,
    SceneEvent,
    LoadingEvent
}
    from './actions'
import { KinoEvent, goingToKino } from './Bridge'

function insertItem(array, item) {
    const newArray = [...array];
    newArray.push(item)
    return newArray
}

function removeItem(array, item) {
    return [...array].filter(i => item !== i)
}

const initialState = {
    loggingBottomRight: null,
    loggingBottomLeft: null,
    loggingTopRight: null,
    raycast: "",
    loadingItems: [],
    kinoBridge: "",
}
export const reducer = (state = initialState, action) => {
    switch (action.type) {

        /* file loadings */

        case LoadingEvent.START:
            return {
                ...state, loggingBottomLeft: insertItem(state.loadingItems, action.url)
            }
        case LoadingEvent.PROGRESS:
        case LoadingEvent.ERROR:
            return {
                ...state, loggingBottomLeft: removeItem(state.loadingItems, action.url)
            }
        case LoadingEvent.QUEUE_FINISHED:
            return {
                ...state
            }

        case KinoEvent.DRAG:
            return {
                ...state, loggingBottomRight: action.meuble ? action.meuble.info() : ""
            };
        case MeubleEvent.DRAG:
            return {
                ...state, loggingBottomRight: action.meuble ? action.meuble.info() : ""
            };
        case SceneEvent.PRINTRAYCAST:
            return {
                ...state, raycast: action.raycast
            };
        case SceneEvent.LOGKINOEVENT:
            const kinoBridge = `${action.event}
            ${action.param1 ? action.param1.toString() : ""}
            ${action.param2 ? action.param2.toString() : ""}`
            return {
                ...state, kinoBridge
            };
        default:
            return state;
    }
}

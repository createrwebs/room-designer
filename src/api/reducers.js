import {
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

const initialState = {
    configLoaded: false,
    scenes: [],
    light: true,
    dragged: null,
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

        case SceneEvent.SETSCENES:
            return {
                ...state, scenes: action.scenes
            }

        /* meubles */

        case MeubleEvent.DRAG:
            return {
                ...state, dragged: action.meuble
            };

        default:
            return state;
    }
}

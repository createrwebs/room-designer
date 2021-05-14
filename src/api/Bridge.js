import {
    BridgeEvent,
    Tools,
    setConfig,
    resizeScene,
    newScene,
    saveScene,
    loadScene,
    takePicture,
    downloadScene,
    setScenes,
    loadAllSku,
    setCatalogue,
    clickMeubleLine,
    select,
    dragMeubleOverScene,
    dropMeubleOnScene,
    animeSelectedMeuble,
    changeTool,
    generateAllPix,
    setSceneMaterial,
}
    from './actions'
import store from './store';// localhost tests

import { getCurrentScene } from '../3d/Dressing';

export default function (event, param1, param2) {
    console.log("scene_bridge :", event, param1, param2)
    switch (event) {
        case BridgeEvent.NEW_DRESSING:
            store.dispatch(newScene(param1, param2))
            break;
        case BridgeEvent.SAVE_DRESSING:
            return getCurrentScene()
            break;
        case BridgeEvent.LOAD_DRESSING:
            store.dispatch(loadScene(param1, param2))
            break;
        case BridgeEvent.DOWNLOAD_DRESSING:
            store.dispatch(downloadScene(param1, param2))
            break;
        case BridgeEvent.TAKE_PICTURE:
            store.dispatch(takePicture())
            break;
        case BridgeEvent.GENERATE_ALL_PIX:
            store.dispatch(generateAllPix())
            break;

        case BridgeEvent.ADD_MEUBLE_TO_SCENE:
            store.dispatch(clickMeubleLine(param1, param2))
            break;
        case BridgeEvent.DRAG_MEUBLE_OVER_SCENE:
            store.dispatch(dragMeubleOverScene(param1, param2))
            break;
        case BridgeEvent.DROP_MEUBLE_TO_SCENE:
            store.dispatch(dropMeubleOnScene(param1, param2))
            break;
        case BridgeEvent.SET_SCENE_MATERIAL:
            store.dispatch(setSceneMaterial(param1))
            break;
        case BridgeEvent.LOAD_ALL_SKU:
            store.dispatch(generateAllPix(param1))


        case BridgeEvent.SELECT_MEUBLE:
            store.dispatch(changeTool(Tools.ARROW))
            break;
        case BridgeEvent.EDIT_MEUBLE:
            store.dispatch(changeTool(Tools.HAMMER))
            break;
        case BridgeEvent.REMOVE_MEUBLE:
            store.dispatch(changeTool(param1 ? Tools.TRASH : null))
            break;
        case BridgeEvent.ANIM_SELECTED_MEUBLE:
            store.dispatch(animeSelectedMeuble())
            break;
        default:
            console.log("no case found for event ", event)
            break;
    }
}
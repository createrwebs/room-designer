import {
    BridgeEvent,
    Tools,
    newScene,
    loadScene,
    takePicture,
    downloadScene,
    clickMeubleLine,
    dragMeubleOverScene,
    dropMeubleOnScene,
    animeSelectedMeuble,
    changeTool,
    generateAllPix,
    generateOnePix,
    setSceneMaterial,
}
    from './actions'

import { getCurrentDressing } from '../3d/Dressing';

/*
    all actions coming from front end site are treated here
*/

export default function (event, param1, param2) {
    console.log("scene_bridge :", event, param1, param2)
    switch (event) {
        case BridgeEvent.NEW_DRESSING:
            newScene(param1, param2)
            break;
        case BridgeEvent.SAVE_DRESSING:
            return getCurrentDressing()
            break;
        case BridgeEvent.LOAD_DRESSING:
            loadScene(param1, param2)
            break;
        case BridgeEvent.DOWNLOAD_DRESSING:
            downloadScene(param1, param2)
            break;
        case BridgeEvent.TAKE_PICTURE:
            takePicture()
            break;
        case BridgeEvent.GENERATE_ALL_PIX:
            generateAllPix()
            break;
        case BridgeEvent.GENERATE_ONE_PIX:
            generateOnePix(param1)
            break;
        case BridgeEvent.ADD_MEUBLE_TO_SCENE:
            clickMeubleLine(param1, param2)
            break;
        case BridgeEvent.DRAG_MEUBLE_OVER_SCENE:
            dragMeubleOverScene(param1, param2)
            break;
        /*         case BridgeEvent.DROP_MEUBLE_TO_SCENE:
                    store.dispatch(dropMeubleOnScene(param1, param2))
                    break; */
        case BridgeEvent.SET_SCENE_MATERIAL:
            setSceneMaterial(param1)
            break;
        case BridgeEvent.LOAD_ALL_SKU:
            generateAllPix(param1)
        case BridgeEvent.SELECT_MEUBLE:
            changeTool(Tools.ARROW)
            break;
        case BridgeEvent.EDIT_MEUBLE:
            changeTool(Tools.HAMMER)
            break;
        case BridgeEvent.REMOVE_MEUBLE:
            changeTool(param1 ? Tools.TRASH : null)
            break;
        case BridgeEvent.BRUSH_MODE:
            changeTool(Tools.BRUSH, param1)
            break;
        case BridgeEvent.ANIM_SELECTED_MEUBLE:
            animeSelectedMeuble()
            break;
        default:
            console.log("Bridge : no case found for event ", event)
            break;
    }
}
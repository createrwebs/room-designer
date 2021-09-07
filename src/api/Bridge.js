
import {
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
    showhideFacades,
    logKinoEvent
}
    from './actions'
import store from './store';

import { getCurrentDressing, getCurrentDressingForDevis } from '../3d/Dressing';

export const KinoEvent = {
    APP_READY: 'app_ready',
    SELECT_MEUBLE: 'select_meuble',
    SCENE_CHANGE: 'scene_change',
    SEND_MESSAGE: 'send_message',
    MOUSEOVER_ITEM: 'mouseover_item',
    MOUSEOUT_ITEM: 'mouseout_item',
    LOADING_MEUBLE: 'loading_meuble',
    MEUBLE_LOADED: 'meuble_loaded',
    ERROR_LOADING_MEUBLE: 'error_loading_meuble',
    NO_CONFIG_FILE: 'no_config_file',
    NO_DRESSING_FILE: 'no_dressing_file',
}

export const goingToKino = (event, param1, param2) => {
    store.dispatch(logKinoEvent(event, param1, param2))
    window.kino_bridge(event, param1, param2)
}

const BridgeEvent = {
    NEW_DRESSING: 'new_dressing',
    SAVE_DRESSING: 'save_dressing',
    LOAD_DRESSING: 'load_dressing',
    DOWNLOAD_DRESSING: 'download_dressing',
    TAKE_PICTURE: 'take_picture',
    ADD_MEUBLE_TO_SCENE: 'add_meuble_to_scene',
    DRAG_MEUBLE_OVER_SCENE: 'drag_meuble_over_scene',
    DROP_MEUBLE_TO_SCENE: 'drop_meuble_to_scene',
    SELECT_MEUBLE: 'select_meuble',
    EDIT_MEUBLE: 'edit_meuble',
    ANIM_SELECTED_MEUBLE: 'anim_selected_meuble',
    REMOVE_MEUBLE: 'remove_meuble',
    BRUSH_MODE: 'brush_mode',
    GENERATE_ALL_PIX: 'generateallpix',
    GENERATE_ONE_PIX: 'generateonepix',
    SET_SCENE_MATERIAL: 'set_scene_material',
    LOAD_ALL_SKU: 'load_all_sku',
    SHOW_HIDE_FACADES: 'showhideFacades',
    GET_DEVIS: 'get_devis'
}

/*
    all actions coming from front end site are treated here
*/

export const comingFromKino = (event, param1, param2) => {
    // console.log("comingFromKino :", event, param1, param2)
    switch (event) {
        case BridgeEvent.NEW_DRESSING:
            newScene(param1)
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
        case BridgeEvent.GET_DEVIS:
            console.log(getCurrentDressingForDevis())
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
        case BridgeEvent.SHOW_HIDE_FACADES:
            showhideFacades(param1)
            break;
        default:
            console.log("Bridge : no case found for event ", event)
            break;
    }
}
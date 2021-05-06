export const BridgeEvent = {
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
    GENERATE_ALL_PIX: 'generateallpix',
    SET_SCENE_TEXTURE: 'set_scene_texture'
}
export const SceneEvent = {
    SETCONFIG: 'setconfig',
    RESIZE: 'RESIZE',
    SETCATALOGUE: 'setcatalogue',
    SETSCENES: 'setscenes',
    NEWSCENE: 'newscene',
    SAVESCENE: 'savescene',
    SAVESCENETOFILE: 'savescenetofile',
    LOADSCENE: 'loadscene',
    SETLIGHT: 'setlight',
    SETCURRENTSCENEPROP: 'setcurrentsceneprop',
    SETCURRENTSCENEWALL: 'setcurrentscenewall',
    SETCURRENTSCENEWALLLENGTH: 'setcurrentscenewalllength',
    CHANGE_TOOL: 'change_tool',
    TAKEPICTURE: 'takepicture',
    GENERATE_ALL_PIX: 'generateallpix',
    SET_SCENE_TEXTURE: 'setscenetexture'
}
export const CameraEvent = {
    SET: 'set',
    LOG: 'log'
}
export const MeubleEvent = {
    ALLLOADED: 'allLoaded',
    ADD: 'add',
    REMOVE: 'remove',
    REMOVESELECTED: 'removeselected',
    SELECT: 'select',
    ANIM: 'anim',
    DRAG: 'drag',
    DROP: 'drop',
    CLICKMEUBLELINE: 'clickmeubleline',
    DRAG_MEUBLE_OVER_SCENE: 'drag_meuble_over_scene',
    DROP_MEUBLE_TO_SCENE: 'drop_meuble_to_scene',
    LOAD_ALL_SKU: 'load_all_sku'
}
export const Tools = {
    ARROW: 'arrow',
    HAMMER: 'hammer',
    TRASH: 'trash',
}

export const logCamera = () => {
    return {
        type: CameraEvent.LOG
    }
}
export const setCamera = (prop) => {
    return {
        type: CameraEvent.SET, prop
    }
}
export const setConfig = (config) => {
    return {
        type: SceneEvent.SETCONFIG, config
    }
}
export const resizeScene = () => {
    return {
        type: SceneEvent.RESIZE
    }
}
export const setCatalogue = (catalogue) => {
    return {
        type: SceneEvent.SETCATALOGUE, catalogue
    }
}
export const setScenes = (scenes) => {
    return {
        type: SceneEvent.SETSCENES, scenes
    }
}
export const newScene = (dressing) => {
    return {
        type: SceneEvent.NEWSCENE, dressing
    }
}
export const saveScene = () => {
    return {
        type: SceneEvent.SAVESCENE
    }
}
export const loadScene = (dressing) => {
    return {
        type: SceneEvent.LOADSCENE, dressing
    }
}
export const setSceneTexture = () => {
    return {
        type: SceneEvent.SET_SCENE_TEXTURE
    }
}
export const takePicture = () => {
    return {
        type: SceneEvent.TAKEPICTURE
    }
}
export const generateAllPix = () => {
    return {
        type: SceneEvent.GENERATE_ALL_PIX
    }
}
export const downloadScene = () => {
    return {
        type: SceneEvent.LOADSCENE
    }
}
export const changeTool = (tool) => {
    return {
        type: SceneEvent.CHANGE_TOOL, tool
    }
}
export const saveSceneToFile = () => {
    return {
        type: SceneEvent.SAVESCENETOFILE
    }
}
export const setCurrentSceneProp = (prop) => {
    return {
        type: SceneEvent.SETCURRENTSCENEPROP, prop
    }
}
export const setCurrentSceneWall = (wall, checked) => {
    return {
        type: SceneEvent.SETCURRENTSCENEWALL, wall, checked
    }
}
export const setCurrentSceneWallLength = (wall, length) => {
    return {
        type: SceneEvent.SETCURRENTSCENEWALLLENGTH, wall, length
    }
}


export const setLight = () => {
    return {
        type: SceneEvent.SETLIGHT
    }
}
export const allLoaded = () => {
    return {
        type: MeubleEvent.ALLLOADED
    }
}
export const drag = (meuble) => {
    return {
        type: MeubleEvent.DRAG, meuble
    }
}
export const add = (meuble) => {
    return {
        type: MeubleEvent.ADD, meuble
    }
}
export const removeSelectedMeuble = () => {
    return {
        type: MeubleEvent.REMOVESELECTED
    }
}
export const select = (meuble) => {
    return {
        type: MeubleEvent.SELECT, meuble
    }
}
export const animeSelectedMeuble = () => {
    return {
        type: MeubleEvent.ANIM
    }
}
export const drop = (meuble) => {
    return {
        type: MeubleEvent.DROP, meuble
    }
}
/**
 * click on meuble to add it on scene.
 * window.scene_bridge('add_meuble_to_scene','NYC155H219P0').
 *
 * @param {String} sku Stock Keeping Unit of clicked meuble
 * @return {Object} Action object with type and sku
 */
export const clickMeubleLine = (sku) => {
    return {
        type: MeubleEvent.CLICKMEUBLELINE, sku
    }
}
/**
 * drag meuble on scene.
 * window.scene_bridge('drag_meuble_over_scene','NYC155H219P0').
 *
 * @param {String} sku Stock Keeping Unit of clicked meuble
 * @return {Object} Action object with type and sku
 */
export const dragMeubleOverScene = (sku) => {
    return {
        type: MeubleEvent.DRAG_MEUBLE_OVER_SCENE, sku
    }
}
/**
 * drop meuble on scene.
 * window.scene_bridge('drop_meuble_to_scene','NYC155H219P0').
 *
 * @param {String} sku Stock Keeping Unit of clicked meuble
 * @return {Object} Action object with type and sku
 */
export const dropMeubleOnScene = (sku) => {
    return {
        type: MeubleEvent.DROP_MEUBLE_TO_SCENE, sku
    }
}


export const loadAllSku = () => {
    return {
        type: MeubleEvent.LOAD_ALL_SKU
    }
}

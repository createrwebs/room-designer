import store from './store';
import { Vector3 } from "three";
import {
    loadOne as loadOneMaterial,
    load as loadMaterial, apply as applyMaterial,
    getMaterialById,
    getLaqueById,
    setId as setMaterialId,
    getId as getMaterialId,
} from '../3d/Material'
import MainScene from '../3d/MainScene';
import { getCurrentDressing, getCurrentDressingForDevis } from '../3d/Dressing';
import { cameraTo } from '../3d/Animate';
import { takePix } from '../3d/helpers/Capture';
import { loadFbx } from '../3d/Loader'
import { parseSKU } from '../3d/Sku'
import Room from '../3d/Room'
import { getCenterPoint, getSize } from '../3d/Utils'
import { getProps, getMultipleProps } from './Catalogue'
import defaultconfig from '../../assets/config.json';

export const Errors = {
    NOT_A_MODULE: 'not_a_module',
    IS_A_MODULE: 'is_a_module',
    NO_MODULE_FOUND: 'no_module_found',
    NO_SCENE: 'no_scene',
    NO_ROOM: 'no_room',
    ITEM_NON_COMPATIBLE: 'item_non_compatible',
    TOO_MANY_DOORS: 'too_many_doors',
    TOO_MANY_DRAWERS: 'too_many_drawers'
}
export const KinoEvent = {
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
    BRUSH_MODE: 'brush_mode',
    GENERATE_ALL_PIX: 'generateallpix',
    GENERATE_ONE_PIX: 'generateonepix',
    SET_SCENE_MATERIAL: 'set_scene_material',
    LOAD_ALL_SKU: 'load_all_sku'
}
export const SceneEvent = {
    SETCONFIG: 'setconfig',
    RESIZE: 'RESIZE',
    SETSCENES: 'setscenes',
    NEWSCENE: 'newscene',
    LOADSCENE: 'loadscene',
    SETCURRENTSCENEPROP: 'setcurrentsceneprop',
    SETCURRENTSCENEWALL: 'setcurrentscenewall',
    SETCURRENTSCENEWALLLENGTH: 'setcurrentscenewalllength',
    CHANGE_TOOL: 'change_tool',
    PRINTRAYCAST: 'printraycast',
}
export const CameraEvent = {
    SET: 'set',
}
export const MeubleEvent = {
    ADD: 'add',
    REMOVE: 'remove',
    SELECT: 'select',
    ANIM: 'anim',
    DRAG: 'drag',
    DROP: 'drop',
    CLICKMEUBLELINE: 'clickmeubleline',
    DROP_MEUBLE_TO_SCENE: 'drop_meuble_to_scene',
    LOAD_ALL_SKU: 'load_all_sku'
}
export const LoadingEvent = {
    START: 'start',
    LOAD: 'load',
    PROGRESS: 'progress',
    QUEUE_FINISHED: 'queue_finished',
    ERROR: 'error',
}
export const Tools = {
    ARROW: 'arrow',
    HAMMER: 'hammer',
    TRASH: 'trash',
    BRUSH: 'brush',
    HAMMER_TRASH: 'hammer_trash',// to remove items
}



export const loadManagerStart = (url) => {
    return {
        type: LoadingEvent.START, url
    }
}
export const loadManagerLoad = () => {
    return {
        type: LoadingEvent.LOAD
    }
}
export const loadManagerProgress = (url, itemsLoaded, itemsTotal) => {
    return {
        type: LoadingEvent.PROGRESS, url, itemsLoaded, itemsTotal
    }
}
export const loadManagerQueueFinished = () => {
    return {
        type: LoadingEvent.QUEUE_FINISHED
    }
}
export const loadManagerError = (url) => {
    return {
        type: LoadingEvent.ERROR, url
    }
}

export const resizeScene = () => {
    MainScene.resize()
}
export const setScenes = (scenes) => {
    localScenes = localStorage && localStorage.getItem('scenes');
    if (localScenes) scenes.push(...JSON.parse(localScenes))
    return {
        type: SceneEvent.SETSCENES, scenes
    }
}

export const saveSceneToLocalStorage = () => {
    const scenes = []
    const localScenes = localStorage && localStorage.getItem('scenes');
    if (localScenes) scenes.push(...JSON.parse(localScenes))

    const item = scenes.find(s => s.name === Room.name)
    const idx = scenes.indexOf(item)
    if (idx >= 0)
        scenes[idx] = getCurrentDressing()

    localStorage.setItem('scenes', JSON.stringify(scenes));
}
export const saveSceneToFile = () => {
    const uriContent = 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(getCurrentDressing()));
    var pom = document.createElement('a');
    pom.setAttribute('href', uriContent);
    pom.setAttribute('download', `${Room.name}.minet3d`);
    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

export const setConfig = (c) => {
    if (!c) window.kino_bridge(KinoEvent.NO_CONFIG_FILE)
    const config = c ? c : defaultconfig
    Room.setup(config.defaultdressing)
    MainScene.setup(config.scene_params)
}

/* scenes 
 
- new dressing comes from wp without ID
- loaded dressing comes from wp with ID        
*/

export const newScene = (dressing) => {
    if (!dressing) window.kino_bridge(KinoEvent.NO_DRESSING_FILE)
    Room.setup(dressing)
    if (dressing) setMaterialId(dressing.materialId)
    MainScene.update()
    MainScene.render()
}
export const loadScene = (dressing) => {
    if (!dressing) {
        window.kino_bridge(KinoEvent.NO_DRESSING_FILE)
        return
    }
    Room.setup(dressing)
    setMaterialId(dressing.materialId)
    MainScene.update()
    /*
    1/ load scene material
    2/ load fbx
    */

    const material = getMaterialById(getMaterialId())
    if (material) {
        loadMaterial(material.textures).then(mtl => {
            loadMeubles(dressing)
        })
    }
    else {
        loadMeubles(dressing)
    }
}

const loadMeubles = (dressing) => {
    dressing.meubles.forEach(state => loadMeuble(state))
}
const loadMeuble = (state) => {
    const props = getProps(state.sku)
    if (!props) {
        console.error(`no meuble found for sku  ${state.sku}`)
        return null
    }
    const skuInfo = parseSKU(state.sku)
    if (!skuInfo.isModule) {
        console.error(`${state.sku} is not a module`)
        return null
    }

    if (!state.position) {
        console.error(`skipped ${state.sku} has no position`)
        return null
    }

    // meuble props are catalogue props + dressing props : no! => dressing props = state 
    // props.position = state.position;

    window.kino_bridge(KinoEvent.LOADING_MEUBLE, state.sku)
    loadFbx(props.fbx.url, object => {
        const meuble = MainScene.createMeuble(props, object, state, skuInfo)
        MainScene.add(meuble);
        MainScene.render()
    })
}

/**
 * click on palette to set material on scene.
 * window.scene_bridge('set_scene_material',materialId) *
 * @return {Object} material object
 */
export const setSceneMaterial = (id) => {
    if (id) {
        const material = getMaterialById(id)
        if (material) {
            setMaterialId(id)
            loadMaterial(material.textures).then(mtl => {
                MainScene.meubles.forEach(meuble => {
                    meuble.applyMaterialOnMeuble(mtl)
                })
                MainScene.render()
                sceneChange()
            })
        }
        else {
            console.warn(`No material found with id ${id}`)
        }
    } else {
        console.warn(`No material id ${id}`)
    }
}

/* pix */
export const takePicture = () => {
    takePix("minet3d-scene-snapshopt")
}
export const generateAllPix = async (skus = []) => {
    // if meuble selected, take its center to put meubles for pix batching

    /*     let selectionCenter = new Vector3()
        if (MainScene.selection) {// please on back wall !!
            selectionCenter = MainScene.selection.getCenterPoint()//for back wall !
        } */
    Room.setup({
        name: "generation-scene",
        xmax: 4000,
        zmax: 6000
    })
    MainScene.update(false)
    for (const skuProps of getMultipleProps(skus)) {
        await generatePix(skuProps)
    }
}
window.generateAllPix = generateAllPix
// ["NYC231H219PP", "NYC231H238PP", "NYC155H219PP", "NYANGH238", "NYH238P40RL057","NYC155H219PG"]
export const generateOnePix = (sku) => {
    Room.setup({
        name: "generation-scene",
        xmax: 4000,
        zmax: 6000
    })
    MainScene.update(false)

    const props = getProps(sku)
    if (!props) {
        console.error(`no meuble found for sku  ${sku}`)
        return null
    }
    generatePix(props)
}
const generatePix = async (props) => {
    return new Promise((resolve, reject) => {
        if (props.sku && props.sku != "" && props.fbx.url && props.fbx.url != "") {
            loadFbx(props.fbx.url, object => {
                const skuInfo = parseSKU(props.sku)// put Item on scene as well
                object.position.x = 0
                object.position.y = 0
                object.position.z = 0
                const materialId = getMaterialId()
                if (materialId) {
                    const material = getMaterialById(materialId)
                    if (material) {
                        loadMaterial(material.textures)
                            .then(mtl => {
                                applyMaterial(mtl, { object: object })

                                MainScene.scene.add(object);

                                // position camera
                                if (skuInfo.type === "ANG") {
                                    MainScene.camera.position.set(getSize(object, "x") * 2.5, 1200, getSize(object, "z") * 2.5)
                                }
                                else {
                                    MainScene.camera.position.set(getSize(object, "x") / 2, 1200, 3000)
                                }
                                MainScene.orbitControls.target = getCenterPoint(object)
                                MainScene.orbitControls.update();

                                MainScene.render()
                                takePix(`${props.sku}`)
                                MainScene.scene.remove(object);
                                MainScene.render()

                                resolve()
                            })
                            .catch((e) => {
                                reject(new Error(`loadMaterial`))
                            })
                    }
                    else {
                        reject(new Error(`no material`))
                    }
                }
                else {
                    reject(new Error(`no materialId`))
                }
            })
        }
        else {
            reject(new Error(`Reference problem found in catalogue :`))
        }
    })
}
export const downloadScene = () => {
    // console.warn(`what to do here ? downloadScene`)
    saveSceneToFile()
}
export const changeTool = (tool, arg) => {

    switch (tool) {
        case Tools.ARROW:
            MainScene.deselect()// deselection => camera to room center ?
            MainScene.enableMeubleDragging(true)
            MainScene.enableMeubleClicking(false)
            MainScene.enableMeublePainting(false)
            MainScene.enableItemsDragging(false)
            MainScene.enableItemsRemoving(false)
            break;
        case Tools.BRUSH:
            MainScene.deselect()// ?
            const laqueId = arg
            if (laqueId) {
                const material = getLaqueById(laqueId)
                if (material) {
                    loadOneMaterial(material).then(m => {
                        MainScene.laque = m
                        MainScene.laqueId = laqueId
                        MainScene.enableMeubleDragging(false)
                        MainScene.enableMeubleClicking(false)
                        MainScene.enableMeublePainting(true)
                        MainScene.enableItemsDragging(false)
                        MainScene.enableItemsRemoving(false)
                    });
                }
                else {
                    console.warn(`No laque material found with id ${laqueId}`)
                }
            } else {
                console.warn(`No laque material id`)
            }

            break;
        case Tools.HAMMER:
            // MainScene.deselect()// ?
            MainScene.enableMeubleDragging(false)
            MainScene.enableMeubleClicking(true)
            MainScene.enableMeublePainting(false)
            MainScene.enableItemsDragging(false)
            MainScene.enableItemsRemoving(false)
            break;
        case Tools.TRASH:
            if (MainScene.tool === Tools.HAMMER && MainScene.selection) {

                MainScene.enableMeubleDragging(false)
                MainScene.enableMeubleClicking(false)
                MainScene.enableMeublePainting(false)
                MainScene.enableItemsDragging(false)
                MainScene.enableItemsRemoving(true)

                tool = Tools.HAMMER_TRASH
            }
            else {
                MainScene.enableMeubleDragging(false)
                MainScene.enableMeubleClicking(true)
                MainScene.enableMeublePainting(false)
                MainScene.enableItemsDragging(false)
                MainScene.enableItemsRemoving(false)
            }
            break;
        default:
            MainScene.deselect()// ?
            MainScene.enableMeubleDragging(false)
            MainScene.enableMeubleClicking(true)
            MainScene.enableMeublePainting(false)
            MainScene.enableItemsDragging(false)
            MainScene.enableItemsRemoving(false)
            break;
    }
    MainScene.tool = tool;
}

export const drag = (meuble) => {
    return {
        type: MeubleEvent.DRAG, meuble
    }
}

export const select = (meuble, arg) => {
    console.warn(`Scene click with tool ${MainScene.tool}`)
    switch (MainScene.tool) {
        case Tools.ARROW:
            if (meuble) console.warn(`Use hammer tool to edit ${meuble.props.sku}`)
            MainScene.deselect()
            break;
        case Tools.HAMMER:
            if (meuble) {
                console.warn(`meuble`, meuble)
                if (MainScene.selection === meuble) return
                if (MainScene.selection) MainScene.selection.deselect();
                meuble.select()
                const front = meuble.getFrontPosition()
                const center = meuble.getCenterPoint()
                // MainScene.camera.position.set(front.x, front.y, front.z)
                // MainScene.orbitControls.target = meuble.getCenterPoint()
                // MainScene.orbitControls.update();
                // MainScene.render()
                cameraTo(front, center, 800)
                if (window.kino_bridge)
                    window.kino_bridge(KinoEvent.SELECT_MEUBLE, meuble.props.sku)
                MainScene.selection = meuble
            }
            else {

            }
            break;
        case Tools.BRUSH:
            let interactiveEvent = arg;
            console.warn(`Brush on`, interactiveEvent)



            break;
        case Tools.TRASH:
            MainScene.deselect()
            interactiveEvent = arg;
            if (interactiveEvent.target != this) {
                const itemClicked = meuble.items.filter(i => i.object == interactiveEvent.target)
                console.warn(`trash tool itemClicked`, itemClicked)
            }
            else {
            }
            MainScene.remove(meuble)
            MainScene.render()
            break;
        default:
            console.warn(`No tool selected`)
    }
}

export const sceneChange = () => {
    if (window.kino_bridge)
        window.kino_bridge(KinoEvent.SCENE_CHANGE, getCurrentDressingForDevis())
}

export const animeSelectedMeuble = () => {
    const selectedMeuble = MainScene.selection
    if (!selectedMeuble) return
    const center = selectedMeuble.getCenterPoint()
    // var center = new Vector3(0, 0, 0);
    var distanceToMove = 200;

    selectedMeuble.object.traverse(function (child) {// bug : traverse drops first object !!?
        console.log(child, child.name, child.position)


        // var meshPosition = child.position;

        // var direction = meshPosition.clone().sub(center).normalize();

        // var moveThisFar = direction.clone().multiplyScalar(distanceToMove);

        // // mainStand.children[i].position.add(moveThisFar);
        // var gotoPosition = new Vector3(0, 0, 0);


        // tweenTo(child.position, moveThisFar, 1000)
    })
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

    const props = getProps(sku)
    if (!props) {
        return window.kino_bridge(KinoEvent.SEND_MESSAGE, Errors.NO_MODULE_FOUND, `Pas de meuble ${sku}`)
    }
    const skuInfo = parseSKU(sku)
    if (MainScene.selection) {
        if (skuInfo.isModule) {
            return window.kino_bridge(KinoEvent.SEND_MESSAGE, Errors.IS_A_MODULE, `${sku} n'est pas un accessoire`)
        }
        if (MainScene.selection.props.accessoirescompatibles.indexOf(sku) === -1) {
            return window.kino_bridge(KinoEvent.SEND_MESSAGE, Errors.ITEM_NON_COMPATIBLE, `${sku} non compatible avec ${MainScene.selection.props.sku} sélectionné`)
        }
        else {
            MainScene.selection.addItem(props, {}, skuInfo);
        }
    } else {
        if (!skuInfo.isModule) {
            return window.kino_bridge(KinoEvent.SEND_MESSAGE, Errors.NOT_A_MODULE, `${sku} n'est pas un module`)
        }
        window.kino_bridge(KinoEvent.LOADING_MEUBLE, sku)
        loadFbx(props.fbx.url, object => {
            const result = MainScene.createMeuble(props, object, null, skuInfo)
            if (typeof result === "string") {// creation problem
                switch (result) {
                    case Errors.NOT_A_MODULE:
                        return window.kino_bridge(KinoEvent.SEND_MESSAGE, Errors.NOT_A_MODULE, `${sku} n'est pas un module`)
                    case Errors.NO_ROOM:
                        return window.kino_bridge(KinoEvent.SEND_MESSAGE, Errors.NO_ROOM, `Il n'y a pas assez de place pour ce meuble`)
                }
            }
            else {
                MainScene.add(result);
                MainScene.render()
            }
        })
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
    console.warn(`what to do here ? dragMeubleOverScene`)

}
/**
 * drop meuble on scene.
 * window.scene_bridge('drop_meuble_to_scene','NYC155H219P0').
 *
 * @param {String} sku Stock Keeping Unit of clicked meuble
 * @return {Object} Action object with type and sku
 */
/* export const dropMeubleOnScene = (sku) => {
    return {
        type: MeubleEvent.DROP_MEUBLE_TO_SCENE, sku
    }
} */

export const printRaycast = (raycast) => {
    return {
        type: SceneEvent.PRINTRAYCAST, raycast
    }
}
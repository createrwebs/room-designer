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
import { KinoEvent, goingToKino } from './Bridge'
import { Errors } from './Errors'
import Meuble from '../3d/meubles/Meuble';
import { draw as drawMetrage } from '../3d/helpers/Metrage';

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
    LOGKINOEVENT: 'logkinoevent'
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
    CLICKMEUBLELINE: 'clickmeubleline',
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
    if (!c) goingToKino(KinoEvent.NO_CONFIG_FILE)
    const config = c ? c : defaultconfig
    Room.setup(config.defaultdressing)
    MainScene.setup(config.scene_params)
}

/* scenes 
 
- new dressing comes from wp without ID
- loaded dressing comes from wp with ID        
*/

export const newScene = (dressing) => {
    if (!dressing) goingToKino(KinoEvent.NO_DRESSING_FILE)
    Room.setup(dressing)
    if (dressing && dressing.materialId) setMaterialId(dressing.materialId)
    MainScene.update()
    MainScene.render()
}
export const loadScene = (dressing) => {
    if (!dressing) {
        goingToKino(KinoEvent.NO_DRESSING_FILE)
        return
    }
    Room.setup(dressing)
    setMaterialId(dressing.materialId)
    MainScene.update()
    /*
    1/ load scene material
    2/ load fbx
    */

    if (dressing.joins) Meuble.Joins = dressing.joins
    const material = getMaterialById(getMaterialId())
    if (material) {
        loadMaterial(material).then(mtl => {
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
        console.error(`no meuble found for sku ${state.sku} in catalogue`)
        return null
    }
    if (!state.position) {
        console.error(`skipped ${state.sku} has no position`)
        return null
    }
    loadMeubleFbx(props, state, parseSKU(state.sku))
}

/**
 * loadMeubleFbx loads a fbx 3d file from props.fbx.url
 * and tries to create and add the 3d object to MainScene
 *
 * @param {Object} props catalogue properties by sku
 * @param {Object} state uid, position, items, material props on scene
 * @param {Object} skuInfo all info deduced from sku parsing
 * @return {null}
 */
const loadMeubleFbx = (props, state, skuInfo) => {

    if (!skuInfo.isModule) {
        console.error(`${props.sku} is not a module`)
        return null
    }
    goingToKino(KinoEvent.LOADING_MEUBLE, props.sku)
    loadFbx(props.fbx.url, object => {
        const createMeubleResult = MainScene.createMeuble(props, object, state, skuInfo)
        if (typeof createMeubleResult === "string") {// creation problem
            // console.warn(`creation error : ${createMeubleResult}`)
            switch (createMeubleResult) {

                // TODO extraire gestion Errors

                case Errors.NOT_A_MODULE:
                    return goingToKino(KinoEvent.SEND_MESSAGE, Errors.NOT_A_MODULE, `${props.sku} n'est pas un module`)
                case Errors.NO_ROOM:
                    return goingToKino(KinoEvent.SEND_MESSAGE, Errors.NO_ROOM, `Il n'y a pas assez de place pour ce meuble`)
                case Errors.CORNER_FULL:
                    return goingToKino(KinoEvent.SEND_MESSAGE, Errors.CORNER_FULL, `Ce coin est déjà occupé`)
                case Errors.NO_PLACE_IN_CORNER:
                    return goingToKino(KinoEvent.SEND_MESSAGE, Errors.NO_PLACE_IN_CORNER, `Il n'y a pas assez de place dans le coin pour ce meuble`)
                default:
                    console.warn(`error ${createMeubleResult} not handled`)
            }
        }
        else {
            MainScene.add(createMeubleResult);
            showhideMetrage()
            MainScene.render()
        }
    })
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
        return goingToKino(KinoEvent.SEND_MESSAGE, Errors.NO_MODULE_FOUND, `Pas de meuble ${sku}`)
    }
    const skuInfo = parseSKU(sku)
    if (MainScene.selection) {
        if (skuInfo.isModule) {
            return goingToKino(KinoEvent.SEND_MESSAGE, Errors.IS_A_MODULE, `${sku} n'est pas un accessoire`)
        }
        if (MainScene.selection.props.accessoirescompatibles.indexOf(sku) === -1) {
            return goingToKino(KinoEvent.SEND_MESSAGE, Errors.ITEM_NON_COMPATIBLE, `${sku} non compatible avec ${MainScene.selection.props.sku} sélectionné`)
        }
        else {
            MainScene.selection.addItem(props, {}, skuInfo);
        }
    } else {
        loadMeubleFbx(props, null, skuInfo)
    }
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
            loadMaterial(material).then(mtl => {
                MainScene.meubles.forEach(meuble => {
                    meuble.applyMaterialOnMeuble(mtl, true)
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

export const downloadScene = () => {
    // console.warn(`what to do here ? downloadScene`)
    saveSceneToFile()
}
export const changeTool = (tool, arg) => {
    // console.warn(`changeTool`, tool, arg)
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
    // console.warn(`Scene click with tool ${MainScene.tool}`)
    switch (MainScene.tool) {
        case Tools.ARROW:
            if (meuble) console.warn(`Use hammer tool to edit ${meuble.props.sku}`)
            MainScene.deselect()
            break;
        case Tools.HAMMER:
            if (meuble) {
                // console.warn(`meuble`, meuble)
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
                if (goingToKino)
                    goingToKino(KinoEvent.SELECT_MEUBLE, meuble.props.sku, meuble.getJSON())
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
    if (goingToKino)
        goingToKino(KinoEvent.SCENE_CHANGE, getCurrentDressingForDevis())
}

export const showhideFacades = (show) => {
    MainScene.meubles.forEach(meuble => {
        meuble.showFacades(show)
    })
    MainScene.render()
}
let Metrage;
let showMetrage = false
export const showhideMetrage = (show) => {
    if (typeof show === "undefined") {//from dragging

    }
    else {
        showMetrage = show
    }
    if (showMetrage) {
        if (Metrage) MainScene.scene.remove(Metrage)
        Metrage = drawMetrage()
        if (Metrage) MainScene.scene.add(Metrage)
    }
    else {
        if (Metrage) MainScene.scene.remove(Metrage)
    }
    MainScene.render()
}

export const animeSelectedMeuble = () => {
    const selectedMeuble = MainScene.selection
    if (!selectedMeuble) return
    const center = selectedMeuble.getCenterPoint()
    // var center = new Vector3(0, 0, 0);
    var distanceToMove = 200;

    selectedMeuble.object.traverse(function (child) {// bug : traverse drops first object !!?

        // var meshPosition = child.position;

        // var direction = meshPosition.clone().sub(center).normalize();

        // var moveThisFar = direction.clone().multiplyScalar(distanceToMove);

        // // mainStand.children[i].position.add(moveThisFar);
        // var gotoPosition = new Vector3(0, 0, 0);


        // tweenTo(child.position, moveThisFar, 1000)
    })
}

export const printRaycast = (raycast) => {
    return {
        type: SceneEvent.PRINTRAYCAST, raycast
    }
}

export const logKinoEvent = (event, param1, param2) => {
    return {
        type: SceneEvent.LOGKINOEVENT, event, param1, param2
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
                        loadMaterial(material)
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
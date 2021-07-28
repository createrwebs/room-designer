import store from './store';
import { loadOne as loadOneMaterial, load as loadMaterial, apply as applyMaterial, getMaterialById, getLaqueById } from '../3d/Material'
import MainScene from '../3d/MainScene';
import { Room } from '../3d/Drag'
import { getCurrentDressing, getCurrentDressingForDevis } from '../3d/Dressing';
import { cameraTo } from '../3d/Animate';
import { takePix } from '../3d/helpers/Capture';
import { loadFbx } from '../3d/Loader'
import { parseSKU } from '../3d/Sku'

export const KinoEvent = {
    SELECT_MEUBLE: 'select_meuble',
    SCENE_CHANGE: 'scene_change',
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
    SET_SCENE_MATERIAL: 'set_scene_material',
    LOAD_ALL_SKU: 'load_all_sku'
}
export const SceneEvent = {
    SETCONFIG: 'setconfig',
    RESIZE: 'RESIZE',
    SETCATALOGUE: 'setcatalogue',
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


export const setConfig = (config) => {
    MainScene.setup(config)
}
export const resizeScene = () => {
    MainScene.resize()
}
export const setCatalogue = (catalogue) => {
    MainScene.catalogue = catalogue
}
export const setScenes = (scenes) => {
    localScenes = localStorage && localStorage.getItem('scenes');
    if (localScenes) scenes.push(...JSON.parse(localScenes))
    return {
        type: SceneEvent.SETSCENES, scenes
    }
}

export const saveSceneToLocalStorage = () => {
    if (MainScene.currentDressing) {
        const scenes = []
        const localScenes = localStorage && localStorage.getItem('scenes');
        if (localScenes) scenes.push(...JSON.parse(localScenes))

        const item = scenes.find(s => s.name === MainScene.currentDressing.name)
        const idx = scenes.indexOf(item)
        if (idx >= 0)
            scenes[idx] = MainScene.currentDressing

        localStorage.setItem('scenes', JSON.stringify(scenes));
    }
}
export const saveSceneToFile = () => {
    if (MainScene.currentDressing) {
        const uriContent = 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(getCurrentDressing()));

        var pom = document.createElement('a');
        pom.setAttribute('href', uriContent);
        pom.setAttribute('download', `${MainScene.currentDressing.name}.minet`);
        if (document.createEvent) {
            var event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            pom.dispatchEvent(event);
        }
        else {
            pom.click();
        }
    } else {
        console.warn(`No dressing on scene to save`)
    }
}

/* scenes 
 
- new dressing comes from wp without ID
- loaded dressing comes from wp with ID        
*/

export const newScene = (dressing) => {
    if (!dressing) {
        console.error("New scene failed : no config object passed")
        return
    }
    MainScene.update(dressing)
    MainScene.render()
}
export const loadScene = (dressing) => {
    if (!dressing) {
        console.error("load scene failed : no config object passed")
        return
    }
    console.log("loadScene ", dressing)
    MainScene.update(dressing)

    /*
    1/ load scene material
    2/ load fbx
    */

    const material = getMaterialById(MainScene.materialId)
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
    const props = MainScene.catalogue.find(f => f.sku === state.sku)
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

    //meuble props are catalogue props + dressing props : no! => dressing props = state 
    // props.position = state.position;

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
export const setSceneMaterial = (materialId) => {
    if (materialId) {
        const material = getMaterialById(materialId)
        if (material) {
            MainScene.materialId = materialId
            loadMaterial(material.textures).then(mtl => {
                MainScene.meubles.forEach(meuble => {
                    meuble.applyMaterialOnMeuble(mtl)
                })
                MainScene.render()
            })
        }
        else {
            console.warn(`No material found with id ${materialId}`)
        }
    } else {
        console.warn(`No material id ${materialId}`)
    }
}
export const takePicture = () => {
    takePix("minet3d-scene-snapshopt")
}
export const generateAllPix = () => {
    // if meuble selected, take its center to put meubles for pix batching

    var centerMeubleForPix = 2000
    if (MainScene.selection) {// please on back wall !!
        centerMeubleForPix = MainScene.selection.getCenterPoint().z//for back wall !
    }

    MainScene.update({
        name: "generation-scene",
        xmax: 2000,
        zmax: 8000
    }, false)

    MainScene.catalogue.forEach(props => {
        if (props.sku && props.sku != "" && props.fbx.url && props.fbx.url != "") {
            loadFbx(props.fbx.url, object => {
                const state = {
                    position: {
                        wall: "back",
                        x: centerMeubleForPix - object.getWidth() / 2
                    }
                }
                const meuble = MainScene.createMeuble(props, object, state)

                //test textures
                /* var textu = {
                    hori: {
                        url: "chene-blanc-hori.jpg",
                        label: "Chêne blanc",
                        angle_fil: 0
                    },
                    vert: {
                        url: "chene-blanc-vert.jpg",
                        label: "Chêne blanc",
                        angle_fil: 90
                    },
                    fond: {
                        url: "cuir.jpg",
                        label: "Chêne blanc",
                        angle_fil: 0
                    },
                    portes: {
                        url: "chene-charleston-vert.jpg",
                        label: "Chêne charleston",
                        angle_fil: 0
                    }
                }
                loadTextures(meuble.object, textu).then(response => {
                    console.log(`textures loaded`, response)
                    MainScene.add(meuble);
                    MainScene.render()
                    takePix(`${props.sku}`)// textures !!?
                    MainScene.remove(meuble);
                }) */
                MainScene.add(meuble);
                MainScene.render()
                takePix(`${props.sku}`)// textures !!?
                MainScene.remove(meuble);
                MainScene.render()
            })
        }
        else {
            console.error(`Reference problem found in catalogue :`, props)
        }
    })
}
export const downloadScene = () => {
    console.warn(`what to do here ? downloadScene`)

}
export const changeTool = (tool, arg) => {
    MainScene.deselect()// deselection => camera to room center ?
    switch (tool) {
        case Tools.ARROW:
            MainScene.enableMeubleDragging(true)
            MainScene.enableMeubleClicking(false)
            MainScene.enableMeublePainting(false)
            MainScene.enableItemsDragging(false)
            break;
        case Tools.BRUSH:
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
            MainScene.enableMeubleDragging(false)
            MainScene.enableMeubleClicking(true)
            MainScene.enableMeublePainting(false)
            MainScene.enableItemsDragging(false)
            break;
        case Tools.TRASH:
            MainScene.enableMeubleDragging(false)
            MainScene.enableMeubleClicking(true)
            MainScene.enableMeublePainting(false)
            MainScene.enableItemsDragging(false)
            break;
        default:
            MainScene.enableMeubleDragging(false)
            MainScene.enableMeubleClicking(true)
            MainScene.enableMeublePainting(false)
            MainScene.enableItemsDragging(false)
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
                meuble.enableItemsDragging(true)

                sceneChange()
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
    sceneChange()
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

    if (!MainScene.currentDressing) {
        console.error("No scene : please add a scene before meuble")
        return null
    }

    const props = MainScene.catalogue.find(f => f.sku === sku)
    if (!props) {
        console.error(`No meuble found for sku ${sku}`)
        return null
    }
    const skuInfo = parseSKU(sku)
    if (MainScene.selection) {
        if (skuInfo.isModule) {
            console.error(`${sku} is a module`)
            return null
        }
        if (MainScene.selection.props.accessoirescompatibles.indexOf(sku) === -1) {
            console.warn(`${sku} non compatible avec ${MainScene.selection.props.sku} sélectionné`)
        }
        else {
            MainScene.selection.addItem(props, {}, skuInfo);
        }
    } else {
        if (!skuInfo.isModule) {
            console.error(`${sku} is not a module`)
            return null
        }
        loadFbx(props.fbx.url, object => {
            const selection = MainScene.createMeuble(props, object, null, skuInfo)
            MainScene.add(selection);
            MainScene.render()
        })
    }
    sceneChange()
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
export const dropMeubleOnScene = (sku) => {
    return {
        type: MeubleEvent.DROP_MEUBLE_TO_SCENE, sku
    }
}

export const printRaycast = (raycast) => {
    return {
        type: SceneEvent.PRINTRAYCAST, raycast
    }
}

/**
 * parsing de catalogue
 */
export const loadAllSku = () => {
    return {
        type: MeubleEvent.LOAD_ALL_SKU
    }
}

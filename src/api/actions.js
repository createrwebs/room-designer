import store from './store';
import { loadOne as loadOneMaterial, load as loadMaterial, apply as applyMaterial, getMaterialById, getLaqueById } from '../3d/Material'
import MainScene from '../3d/MainScene';
import Draggable from '../3d/Draggable'
import { Room } from '../3d/Drag'
import { getCurrentScene } from '../3d/Dressing';
import { cameraTo, tweenTo } from '../3d/Animate';
import { takePix } from '../3d/Capture';
import { loadFbx } from '../3d/Loader'

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
}
export const CameraEvent = {
    SET: 'set',
}
export const MeubleEvent = {
    ALLLOADED: 'allLoaded',
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


export const setCamera = (prop) => {
    return {
        type: CameraEvent.SET, prop
    }
}
export const setConfig = (config) => {
    MainScene.setup(config)
    return {
        type: SceneEvent.SETCONFIG
    }
}
export const resizeScene = () => {
    MainScene.resize()
    /*     return {
            type: SceneEvent.RESIZE
        } */
}
export const setCatalogue = (catalogue) => {
    return {
        type: SceneEvent.SETCATALOGUE, catalogue
    }
}
export const setScenes = (scenes) => {
    localScenes = localStorage && localStorage.getItem('scenes');
    if (localScenes) scenes.push(...JSON.parse(localScenes))
    return {
        type: SceneEvent.SETSCENES, scenes
    }
}
export const newScene = (dressing) => {
    if (!dressing) {
        console.error("New scene failed : no config object passed")
        return
    }
    MainScene.update(dressing)
    MainScene.render()
    return {
        type: SceneEvent.NEWSCENE, dressing
    }
}
export const saveSceneToLocalStorage = () => {
    const currentScene = store.getState().currentScene
    if (currentScene) {
        const scenes = []
        const localScenes = localStorage && localStorage.getItem('scenes');
        if (localScenes) scenes.push(...JSON.parse(localScenes))

        const item = scenes.find(s => s.name === currentScene.name)
        const idx = scenes.indexOf(item)
        if (idx >= 0)
            scenes[idx] = currentScene

        localStorage.setItem('scenes', JSON.stringify(scenes));
    }
}
export const saveSceneToFile = () => {
    const currentScene = store.getState().currentScene
    if (currentScene) {
        // const uriContent = 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.currentScene));
        const uriContent = 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(getCurrentScene(store.getState())));

        var pom = document.createElement('a');
        pom.setAttribute('href', uriContent);
        pom.setAttribute('download', `${state.currentScene.name}.minet`);
        if (document.createEvent) {
            var event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            pom.dispatchEvent(event);
        }
        else {
            pom.click();
        }
    }
}

export const loadScene = (dressing) => {
    console.log("loadScene ", dressing)
    MainScene.update(dressing)

    /*
        1/ load scene material
        2/ load fbx
    */

    const material = getMaterialById(MainScene.materialId)
    if (material) {
        loadMaterial(material.textures).then(mtl => {
            createScene(dressing)
        })
    }
    else {
        createScene(dressing)
    }

    // material put at meuble construction

    //TODO ....renvoyer action juste pour current dressing !!???
    return {
        type: SceneEvent.LOADSCENE, dressing
    }
}

const createScene = (dressing) => {
    dressing.meubles.forEach(state => {

        const props = store.getState().catalogue.find(f => f.sku === state.sku)
        if (!props) {
            console.log("no meuble found for sku ", state.sku)
            return null
        }

        //meuble props are catalogue props + dressing props
        props.position = state.position;

        loadFbx(props.fbx.url, object => {
            if (state.position) {
                const meuble = MainScene.createMeuble(props, object, state)
                MainScene.add(meuble);
            }
            MainScene.render()
        })
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
            loadMaterial(material.textures).then(m => {
                MainScene.meubles.forEach(meuble => {
                    applyMaterial(m, meuble)
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
    const state = store.getState()

    var centerMeubleForPix = 2000
    if (MainScene.selection) {// please on back wall !!
        centerMeubleForPix = MainScene.selection.getCenterPoint().z//for back wall !
    }

    MainScene.update({
        name: "generation-scene",
        xmax: 2000,
        zmax: 8000
    }, false)

    state.catalogue.forEach(props => {
        if (props.sku && props.sku != "" && props.fbx.url && props.fbx.url != "") {
            loadFbx(props.fbx.url, object => {
                props.position = {
                    wall: "back",
                    x: centerMeubleForPix - props.largeur / 2
                }
                const meuble = MainScene.createMeuble(props, object)

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
            console.warn(`Reference problem found in catalogue :`, props)
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
        case Tools.TRASH:
        default:
            MainScene.enableMeubleDragging(false)
            MainScene.enableMeubleClicking(true)
            MainScene.enableMeublePainting(false)
            break;
    }
    MainScene.tool = tool;
    /*     return {
            type: SceneEvent.CHANGE_TOOL, tool
        } */
}

export const allLoaded = () => {
    MainScene.allLoaded();
    return {
        type: MeubleEvent.ALLLOADED
    }
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

                if (window.kino_bridge)
                    window.kino_bridge(KinoEvent.SCENE_CHANGE, MainScene.getMeubleList())
            }
            else {

            }
            break;
        case Tools.BRUSH:
            const interactiveEvent = arg;
            console.warn(`Brush on`, interactiveEvent)



            break;
        case Tools.TRASH:
            MainScene.deselect()
            MainScene.remove(meuble)
            MainScene.render()
            break;
        default:
            console.warn(`No tool selected`)
    }
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

    const state = store.getState()
    if (!state.currentScene) {
        console.warn("No scene : please add a scene before meuble")
    }

    const props = state.catalogue.find(f => f.sku === sku)
    if (!props) {
        console.warn(`No meuble found for sku ${sku}`)
    }

    if (MainScene.selection) {

        if (MainScene.selection.props.accessoirescompatibles.indexOf(sku) === -1) {
            console.warn(`${sku} non compatible avec ${MainScene.selection.props.sku} sélectionné`)
        }
        else {
            MainScene.selection.addItem(props);
        }
    } else {
        loadFbx(props.fbx.url, object => {

            // find front wall, best location for new Meuble
            // let wall = Object.keys(state.currentScene.walls)[0] || "right"
            let wall = "right"
            const intersects = MainScene.getRaycasterIntersect()
            const intersect = intersects.find(i => i.object.name.includes("wall-"))
            if (intersect) wall = intersect.object.name.substring("wall-".length)
            console.log("front wall found", wall)

            props.position = {
                wall,
                x: 0
            }
            const selection = MainScene.createMeuble(props, object)


            // place on front wall ? ..Draggable routines ! //TODO
            // on n'utilise pas setPosition 2 fois !. Routine getSpaceOnWall pour trouver sa place :
            const axis = Room.getAxisForWall(wall);
            Room.setWallsLength(state.currentScene, state.config)
            const x = Room.getSpaceOnWall(selection, MainScene.meubles)
            if (x === false) {
                console.log(`no space for ${selection.ID} on wall ${wall}`)
            }
            else {
                selection.object.position[axis] = x
                console.log(selection.wall, x)

                MainScene.add(selection);
                // MainScene.selection = selection// ????
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
export const dropMeubleOnScene = (sku) => {
    return {
        type: MeubleEvent.DROP_MEUBLE_TO_SCENE, sku
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


export const SceneEvent = {
    SETCONFIG: 'setconfig',
    SETSCENES: 'setscenes',
    NEWSCENE: 'newscene',
    SAVESCENE: 'savescene',
    SAVESCENETOFILE: 'savescenetofile',
    LOADSCENE: 'loadscene',
    SETLIGHT: 'setlight',
    SETCURRENTSCENEPROP: 'setcurrentsceneprop',
    SETCURRENTSCENEWALL: 'setcurrentscenewall',
    SETCURRENTSCENEWALLLENGTH: 'setcurrentscenewalllength',
}
export const CameraEvent = {
    SET: 'set',
    LOG: 'log'
}
export const MeubleEvent = {
    ALLLOADED: 'allLoaded',
    ADD: 'add',
    REMOVE: 'remove',
    SELECT: 'select',
    DRAG: 'drag',
    DROP: 'drop',
    CLICKMEUBLELINE: 'clickmeubleline'
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
export const setScenes = (scenes) => {
    return {
        type: SceneEvent.SETSCENES, scenes
    }
}
export const newScene = () => {
    return {
        type: SceneEvent.NEWSCENE
    }
}
export const saveScene = () => {
    return {
        type: SceneEvent.SAVESCENE
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

export const loadScene = (name) => {
    return {
        type: SceneEvent.LOADSCENE, name
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
export const remove = (meuble) => {
    return {
        type: MeubleEvent.REMOVE, meuble
    }
}
export const select = (meuble) => {
    return {
        type: MeubleEvent.SELECT, meuble
    }
}
export const drop = (meuble) => {
    return {
        type: MeubleEvent.DROP, meuble
    }
}
export const clickMeubleLine = (file) => {
    return {
        type: MeubleEvent.CLICKMEUBLELINE, file
    }
}
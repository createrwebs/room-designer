
export const SceneEvent = {
    SETCONFIG: 'setconfig',
    SETSCENES: 'setscenes',
    LOADSCENE: 'loadscene',
    SETLIGHT: 'setlight',
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
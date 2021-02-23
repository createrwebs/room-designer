
export const SceneEvent = {
    SETCONFIG: 'setconfig',
    SETLIGHT: 'setlight',
}
export const CameraEvent = {
    SET: 'set',
    LOG: 'log'
}
export const ObjectEvent = {
    ALLLOADED: 'allLoaded',
    ADD: 'add',
    REMOVE: 'remove',
    SELECT: 'select',
    DRAG: 'drag',
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
export const setLight = () => {
    return {
        type: SceneEvent.SETLIGHT
    }
}
export const allLoaded = () => {
    return {
        type: ObjectEvent.ALLLOADED
    }
}
export const drag = (meuble) => {
    return {
        type: ObjectEvent.DRAG, meuble
    }
}
export const add = (meuble) => {
    return {
        type: ObjectEvent.ADD, meuble
    }
}
export const remove = (meuble) => {
    return {
        type: ObjectEvent.REMOVE, meuble
    }
}
export const select = (meuble) => {
    return {
        type: ObjectEvent.SELECT, meuble
    }
}
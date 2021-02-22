
export const SceneEvent = {
    SETCONFIG: 'setconfig',
    SETLIGHT: 'setlight',
}
export const CameraEvent = {
    SET: 'set',
}
export const ObjectEvent = {
    ADD: 'add',
    REMOVE: 'remove',
    SELECT: 'select',
    DRAG: 'DRAG',
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
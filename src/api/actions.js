
export const SceneEvent = {
    SETLIGHT: 'setlight',
}
export const CameraEvent = {
    SET: 'set',
}
export const ObjectEvent = {
    SELECT: 'select',
}

export const setCamera = (prop) => {
    return {
        type: CameraEvent.SET, prop
    }
}
export const setLight = () => {
    return {
        type: SceneEvent.SETLIGHT
    }
}
export const select = (selection) => {
    return {
        type: ObjectEvent.SELECT, selection
    }
}
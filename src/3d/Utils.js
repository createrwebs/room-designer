import {
    Box3,
    Vector3
} from "three";
/* get [min,max] for object on axis (if NaN...is axis defined ?) */
export const getSegment = (object, axis) => {
    const box = new Box3().setFromObject(object);
    return { min: Math.round(box.min[axis]), max: Math.round(box.max[axis]) };
}

export const segmentIntersect = (s1, s2) => {
    return !(s1.min > s2.max || s1.max < s2.min)
}

/* real bounding box size along axis */
export const getSize = (object, axis) => {
    const box = new Box3().setFromObject(object);
    return Math.round(box.max[axis] - box.min[axis]);
}
window.getSize = getSize

export const getCenterPoint = (object) => {
    const box = new Box3().setFromObject(object);
    const middle = new Vector3();
    middle.x = (box.max.x + box.min.x) / 2;
    middle.y = (box.max.y + box.min.y) / 2;
    middle.z = (box.max.z + box.min.z) / 2;
    // mesh.localToWorld(middle);
    return middle;
}

export const Measures = {
    thick: 25,// epaisseur de planche
    arrondi: 2,// rayon du champfrein arrondi
}

/*
    rendering engine
    https://stackoverflow.com/questions/9677985/uncaught-typeerror-illegal-invocation-in-chrome
*/
const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
const cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
let engineId = null
let engineFunc = null
const engine = (time) => {
    if (engineFunc) engineFunc()
    engineId = requestAnimationFrame(engine);
}
export const startEngine = (func) => {
    engineFunc = func
    engineId = requestAnimationFrame(engine);
}
export const stopEngine = () => {
    cancelAnimationFrame(engineId)
}
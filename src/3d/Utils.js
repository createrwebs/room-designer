import {
    Box3,
    Vector3
} from "three";
/* get [min,max] for object on axis */
export const getSegment = (object, axis) => {
    const box = new Box3().setFromObject(object);
    return { min: Math.round(box.min[axis]), max: Math.round(box.max[axis]) };
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
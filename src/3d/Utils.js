import * as THREE from "three";

/* get [min,max] for object on axis */
export const getSegment = (object, axis) => {
    const box = new THREE.Box3().setFromObject(object);
    return { min: Math.round(box.min[axis]), max: Math.round(box.max[axis]) };
}

/* real bounding box width, or props.largeur ? */
export const getWidth = (object, axis) => {
    var box = new THREE.Box3().setFromObject(object);
    return Math.round(box.max[axis] - box.min[axis]);
}
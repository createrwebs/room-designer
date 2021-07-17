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

export const getCenterPoint = (object) => {
    const box = new Box3().setFromObject(object);
    const middle = new Vector3();
    middle.x = (box.max.x + box.min.x) / 2;
    middle.y = (box.max.y + box.min.y) / 2;
    middle.z = (box.max.z + box.min.z) / 2;
    // mesh.localToWorld(middle);
    return middle;
}



const types = [
    "ANG",// Module angle
    "ANGTIR",// NYANGTIR
    "ANGAB",// Gabarit montage d'angles 45°
    "ANG90",
    "FIL",// fileur droit
    "PPC0",// jeu de 2 portes pleines
    "PPD",// porte pleine droite
    "PPG",// porte pleine gauche    
    "PVD",// porte verre droite
    "PVG",// porte verre gauche
    "PGD",// porte glace droite
    "PGG",// porte glace gauche    
    "COIF",// coiffeuse
    "RGC",// Range Chaussure
    "PENRAB",// Penderie rabattable
    "TABREP",// table repasser
    "MIROIR",
    "CHACAS",//chassis
    "CHALINGE",
    "CHAPANT",
    "CHAPANF",
    "CHACHAUSS",
    "NY2T",// Module 2 Tiroirs
    "NY4T",
]

/* NYH238P62FD */
const panneaux = [
    "FD",// Finition droite
    "FG",// Finition gauche
    "SE"// separateur
]

export const parseSKU = (sku) => {
    const obj = {}

    const HMatch = sku.match(/H\d*/g)
    if (HMatch && HMatch.length > 0) {
        obj.H = parseInt(HMatch[0].substring(1))
    }

    const LMatch = sku.match(/L\d*/g)
    if (LMatch && LMatch.length > 0) {
        obj.L = parseInt(LMatch[0].substring(1))
    }

    const PMatch = sku.match(/P\d*/g)
    if (PMatch && PMatch.length > 0) {
        obj.P = parseInt(PMatch[0].substring(1))
        if (PMatch.length > 1) {// Module de liaison
            obj.PRight = parseInt(PMatch[1].substring(1))
        }
    }

    return obj
}
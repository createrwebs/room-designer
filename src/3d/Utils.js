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
    "ETA",// étagère
    "ETT",// étagère tringle
    "ETL",// étagère tringle led
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
    "CAS",
    "TIR2",// Module 2 Tiroirs
    "TIR4",
    "BLOTMM",// bloc ...
    "BLOTMP",
    "BLOTPP",
    "BLOT0G",
    "FD",// Finition droite
    "FG",// Finition gauche
    "SE",// separateur
    "BC",// porte cintre
]

/* NYH238P62FD */
const panneaux__ = [
    "FD",// Finition droite
    "FG",// Finition gauche
    "SE"// separateur
]
export const panneaux = [
    "NYH238P62FG",
    "NYH238P62FD",
    "NYH238P62SE",
    "NYH238P40FG",
    "NYH238P40FD",
    "NYH238P40SE",
    "NYH219P62FG",
    "NYH219P62FD",
    "NYH219P62SE",
    "NYH219P40FG",
    "NYH219P40FD",
    "NYH219P40SE",
]

export const Measures = {
    thick: 25,
}

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
    if (PMatch && PMatch.length > 0 && PMatch[0] != "P") {
        obj.P = parseInt(PMatch[0].substring(1))
        if (PMatch.length > 1) {// Module de liaison
            obj.PRight = parseInt(PMatch[1].substring(1))
        }
    }


    const typeMatches = types.filter(function (pattern) {
        return new RegExp(pattern).test(sku);
    })
    obj.type = typeMatches.length > 0 ? typeMatches[0] : "module"

    return obj
}
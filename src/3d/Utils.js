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

// const trous219 = [2071]
const trous219 = [372, 431, 599, 663, 727, 815, 919, 983, 1047, 1111, 1175, 1239, 1303, 1367, 1431, 1495, 1559, 1623, 1687, 1751, 1815, 1879, 1943, 2007, 2071]
const trous238 = trous219.concat([2135, 2199, 2263])
export const trousTIR = [80, 290, 480, 640]// trous du bas pour les tiroirs

const types = [
    "ANG90",
    "ANGAB",// Gabarit montage d'angles 45° 40 & 62
    "ANGETAL",
    "ANGETAP",
    "ANGTIR",// option tiroir supp pour angle
    "ANG",// Module angle, last match after ANGXX
    "BC",// porte cintre // sans NY
    "BLOT0G",// bloc ...
    "BLOTMM",
    "BLOTMP",
    "BLOTPP",
    "C155",// armoire coulissante
    "C191",
    "C231",
    "CAS",
    "CHACAS",//chassis
    "CHACHAUSS",
    "CHALINGE",
    "CHAPANF",
    "CHAPANT",
    "COIF",// coiffeuse
    "ETA",// étagère
    "ETL",// étagère tringle led
    "ETT",// étagère tringle
    "FIL",// fileur droit
    "MIROIR",
    "PENRAB",// Penderie rabattable
    "PGD2",// porte glace droite
    "PGD4",
    "PGD-",
    "PGG2",// porte glace gauche    
    "PGG4",
    "PGG-",
    "PPC-",// jeu de 2 portes pleines
    "PPD2",// porte pleine droite
    "PPD4",
    "PPD-",
    "PPG2",// porte pleine gauche    
    "PPG4",
    "PPG-",
    "PVD2",// porte verre droite
    "PVD4",
    "PVD-",
    "PVG2",// porte verre gauche
    "PVG4",
    "PVG-",
    "RGCH",// Range Chaussure accessoire
    "P40RL057",// Range Chaussure pivotable
    "TABREP",// table repasser
    "TIR2",// Module 2 Tiroirs
    "TIR4",
]

export const panneaux = [
    "NYH238P62FG",// Finition gauche
    "NYH238P62FD",// Finition droite
    "NYH238P62SE",// separateur
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
    thick: 25,// epaisseur de planche
    arrondi: 2,// rayon du champfrein arrondi
}

export const parseSKU = (sku) => {
    const obj = {}

    const HMatch = sku.match(/H\d{2,}/g)//https://regex101.com/
    if (HMatch && HMatch.length > 0) {
        obj.H = parseInt(HMatch[0].substring(1))
    }

    const PMatch = sku.match(/P\d{2,}/g)
    if (PMatch && PMatch.length > 0 && PMatch[0] != "P") {
        obj.PR = obj.PL = parseInt(PMatch[0].substring(1))
        if (PMatch.length > 1) {// Module de liaison
            obj.PR = parseInt(PMatch[1].substring(1))
            obj.L = 40// modulae liaison fixed L
        }
        obj.P = Math.max(obj.PR, obj.PL)
    }

    const LMatch = sku.match(/L\d{2,}/g)
    if (LMatch && LMatch.length > 0) {
        obj.L = parseInt(LMatch[0].substring(1))
    }


    const typeMatches = types.filter(function (pattern) {
        return new RegExp(pattern).test(sku);
    })
    obj.type = typeMatches.length > 0 ? typeMatches[0] : "module"

    /* module to put on scene */
    obj.isModule = obj.type === "module"
        || obj.type === "ANG"
        || obj.type === "COIF"
        || obj.type === "C155"
        || obj.type === "C191"
        || obj.type === "C231"
        || obj.type === "P40RL057"
        || obj.type === "FIL"

    /* panneaux inamovibles */
    obj.hasSides = obj.type === "ANG"
        || obj.type === "C155"
        || obj.type === "C191"
        || obj.type === "C231"
        || obj.type === "FIL"

    /* portes */
    obj.isPorte = obj.type.substr(0, 1) === "P" && obj.type.length == 4

    /* titoir */
    obj.isTiroir = obj.type.substr(0, 3) === "TIR"

    /* alignement en applique */
    obj.frontAlign = obj.type.substr(0, 2) === "ET"//etagere
        || obj.isTiroir// tiroir en applique

    switch (obj.type) {
        case "ANG":
            obj.P = obj.PR = obj.PL = 62// angle module has fixed depth of 62
            obj.L = 106
            break;
        case "COIF":
            obj.P = obj.PR = obj.PL = 62// coif module has fixed depth of 62
            obj.L = 81
            break;
        case "C155":
            obj.P = obj.PR = obj.PL = 62
            obj.L = 155
            break;
        case "C191":
            obj.P = obj.PR = obj.PL = 62
            obj.L = 191
            break;
        case "C231":
            obj.P = obj.PR = obj.PL = 62
            obj.L = 231
            break;
    }

    if (obj.isModule) {
        obj.trous = obj.H === 219 ? trous219 : trous238
        obj.has2Doors = obj.L > 70
    }

    console.log(sku, obj)

    return obj
}
window.parseSKU = parseSKU
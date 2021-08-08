
// perçages sur panneaux amovibles :
const trous219Panneaux = [372, 431, 599, 663, 727, 815, 919, 983, 1047, 1111, 1175, 1239, 1303, 1367, 1431, 1495, 1559, 1623, 1687, 1751, 1815, 1879, 1943, 2007, 2071]
const trous238Panneaux = trous219Panneaux.concat([2135, 2199, 2263])

// perçages sur armoire coulissante :
const trous219COL = [343, 407, 471, 535, 599, 663, 727, 791, 855, 919, 983, 1047, 1111, 1175, 1239, 1303, 1367, 1431, 1495, 1559, 1623, 1687, 1751, 1815]
const trous238COL = [372, 436, 500, 564, 628, 692, 756, 820, 884, 948, 1012, 1076, 1140, 1204, 1268, 1332, 1396, 1460, 1524, 1588, 1652, 1716, 1780, 1844, 1908, 1972, 2036]

export const trousTIR = [80, 290, 480, 640]// trous du bas pour les tiroirs

const types = [
    "ANG90",
    "ANGAB",// Gabarit montage d'angles 45° 40 & 62
    "ANGETAL",
    "ANGETAP",
    "ANGTIR",// option tiroir supp pour angle
    "ANG",// Module angle, last match after ANGXX
    "BC",// porte cintre, range cravate  // sans NY
    "BLOT0G",// bloc ...
    "BLOTMM",
    "BLOTMP",
    "BLOTPP",
    "C155",// armoire coulissante
    "C191",
    "C231",
    "CHACAS",//chassis
    "CHACHAUSS",
    "CHALINGE",
    "CHAPANF",
    "CHAPANT",
    "CAS",// parsed after chacas!!!
    "COIF",// coiffeuse
    "ETA",// étagère
    "ETL",// étagère tringle led
    "ETT",// étagère tringle// PCO pour coulissante
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

    // largeurs : 40 48 57 59 74 81 96 119 106 155 191 231
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

    /* modules with panneaux inamovibles */
    obj.hasSides = obj.type === "ANG"
        || obj.type === "C155"
        || obj.type === "C191"
        || obj.type === "C231"
        || obj.type === "FIL"

    /* etagere */
    obj.isEtagere = obj.type.substr(0, 2) === "ET"

    /* portes */
    obj.isPorte = obj.type.substr(0, 1) === "P" && obj.type.length == 4

    /* tiroir */
    obj.isTiroir = obj.type.substr(0, 3) === "TIR"

    /* chassis */
    obj.isChassis = obj.type.substr(0, 3) === "CHA"

    /* alignement en applique */
    obj.frontAlign = obj.isEtagere//etagere
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
            obj.slots = [0, 760]
            obj.trous = obj.H === 219 ? trous219COL : trous238COL
            break;
        case "C191":
            obj.P = obj.PR = obj.PL = 62
            obj.L = 191
            obj.slots = [0, 940]
            obj.trous = obj.H === 219 ? trous219COL : trous238COL
            break;
        case "C231":
            obj.P = obj.PR = obj.PL = 62
            obj.L = 231
            obj.slots = [0, 760, 1520]
            obj.trous = obj.H === 219 ? trous219COL : trous238COL
            break;
        default:
            if (obj.isModule) {
                obj.trous = obj.H === 219 ? trous219Panneaux : trous238Panneaux
            }
    }

    if (obj.isModule) {
        obj.has2Doors = obj.L > 70 && obj.type != "ANG"
        obj.angABSku = `NYANGABP${obj.P}`

        obj.paneSku = {// TODO to use
            "right": `NYH${obj.H}P${obj.PR}FD`,
            "left": `NYH${obj.H}P${obj.PR}FG`,
        }
    }
    else {
        obj.draggable = obj.type !== "ANG90"
            && obj.type !== "ANGAB"
            && obj.type !== "FIL"
    }

    console.info(sku, obj)

    return obj
}
window.parseSKU = parseSKU
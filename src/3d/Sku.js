/*
    get infos from sku
*/

// perçages sur panneaux amovibles :
const trous219Panneaux = [372, 431, 599, 663, 727, 815, 919, 983, 1047, 1111, 1175, 1239, 1303, 1367, 1431, 1495, 1559, 1623, 1687, 1751, 1815, 1879, 1943, 2007, 2071]
const trous238Panneaux = trous219Panneaux.concat([2135, 2199, 2263])

// [983,1623,2263]//charnieres des portes on H238
// [983,1623,2071]//charnieres des portes on H219
// [372, 431]// 2 tiroirs encombrement on H238 & H219
// [372, 431, 599, 663, 727, 815]// 4 tiroirs encombrement on H238 & H219

// perçages sur armoire coulissante :
// const trous219COL = [343, 407, 471, 535, 599, 663, 727, 791, 855, 919, 983, 1047, 1111, 1175, 1239, 1303, 1367, 1431, 1495, 1559, 1623, 1687, 1751, 1815]
const trous219COL = [372, 436, 500, 564, 628, 692, 756, 820, 884, 948, 1012, 1076, 1140, 1204, 1268, 1332, 1396, 1460, 1524, 1588, 1652, 1716, 1780, 1844]
const trous238COL = [372, 436, 500, 564, 628, 692, 756, 820, 884, 948, 1012, 1076, 1140, 1204, 1268, 1332, 1396, 1460, 1524, 1588, 1652, 1716, 1780, 1844, 1908, 1972, 2036]

// perçages NYANG
// le bas se trouve à 87mm du sol puis décalage vers le haut tous les 64mm

export const trousTIR = [80, 290, 480, 640]// trous du bas pour les tiroirs

const types = [
    "ANG90",// fileur d'angle
    "ANGAB",// Gabarit montage d'angles 45° 40 & 62
    "ANGETAL",
    "ANGETAP",
    "ANGTIR",// option tiroir supp pour angle
    "ANG",// Module angle, last match after ANGXX
    "BC",// porte cintre, range cravate (sans NY)
    "BLOT0G",// bloc tiroir
    "BLOTMM",
    "BLOTMP",
    "BLOTPP",
    "BUR",
    "C155",// armoire coulissante
    "C191",
    "C231",
    "CHACAS",//chassis, à l'intérieur des NYTIR
    "CHACHAUSS",
    "CHALINGE",
    "CHAPANF",
    "CHAPANT",
    "CAS",// chassis général, parsed after chacas!!!
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
    "RP1",// Range Pulls
    "RP2",// Range Pulls Led
    "P40RL057",// Range Chaussure pivotable
    "TABREP",// table repasser
    "TIR2",// Module 2 Tiroirs
    "TIR4",
    "SEPV"// separateur vertical
]

export const parseSKU = (sku) => {
    const obj = {}

    const HMatch = sku.match(/H\d{2,}/g)//https://regex101.com/
    if (HMatch && HMatch.length > 0) {
        obj.H = parseInt(HMatch[0].substring(1))
    }

    /* profondeur 40 | 62 */
    const PMatch = sku.match(/P\d{2,}/g)
    if (PMatch && PMatch.length > 0 && PMatch[0] != "P") {
        obj.PR = obj.PL = parseInt(PMatch[0].substring(1))
        if (PMatch.length > 1) {// Module de liaison
            obj.PR = parseInt(PMatch[1].substring(1))
            obj.L = 40// module liaison fixed L
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
        || obj.type === "ANG90"
        || obj.type === "BUR"
        || obj.type === "COIF"
        || obj.type === "C155"
        || obj.type === "C191"
        || obj.type === "C231"
        || obj.type === "P40RL057"
        || obj.type === "FIL"

    /* modules with panneaux inamovibles */
    obj.hasSides = obj.type === "ANG90"
        || obj.type === "ANG"
        || obj.type === "C155"
        || obj.type === "C191"
        || obj.type === "C231"
        || obj.type === "FIL"

    obj.isCoulissante = obj.type === "C155"
        || obj.type === "C191"
        || obj.type === "C231"

    /* etagere */
    obj.isEtagere = obj.type.substr(0, 2) === "ET"
        || obj.type === "ANGETAL"
        || obj.type === "ANGETAP"

    /* portes */
    obj.isPorte = obj.type.substr(0, 1) === "P" && obj.type.length == 4

    /* tiroir */
    obj.isTiroir = obj.type.substr(0, 3) === "TIR"

    /* chassis */
    obj.isChassis = obj.type.substr(0, 3) === "CHA"

    /* blot */
    obj.isBlot = obj.type.substr(0, 4) === "BLOT"

    /* alignement en applique */
    obj.frontAlign = obj.isEtagere//etagere
        || obj.isTiroir// tiroir en applique
        || obj.type.substr(0, 2) === "RP"
        || obj.type.substr(0, 4) === "SEPV"

    switch (obj.type) {
        case "FIL":
            obj.P = obj.PR = obj.PL = 40
            obj.L = 15
            break;
        case "ANG90":
            obj.P = obj.PR = obj.PL = 40
            obj.L = 24
            break;
        case "ANG":
            obj.P = obj.PR = obj.PL = 62// angle module has fixed depth of 62
            obj.L = 106
            obj.trous = obj.H === 219 ? trous219Panneaux : trous238Panneaux
            obj.slots = [0, 99]// R & C
            break;
        case "BUR":
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

                if (obj.PR === obj.PL && obj.type != "FIL") {// module de liaison not in corners
                    obj.angABSku = {// put in corners with 1/4 turn and triangles
                        "right": `NYANGABP${obj.P}R`,
                        "left": `NYANGABP${obj.P}L`,
                    }
                }
            }
    }

    switch (obj.L) {
        case 48:
            obj.l = 475
            break;
        case 59:
            obj.l = 587
            break;
        case 119:
            obj.l = 1184
            break;
        default:
            if (obj.L) obj.l = obj.L * 10
    }
    obj.p = obj.P === 62 ? 622 : 396

    if (obj.isModule) {
        obj.has2Doors = obj.L > 70 && obj.type != "ANG"

        obj.paneSku = {
            "right": `NYH${obj.H}P${obj.PR}FD`,
            "left": `NYH${obj.H}P${obj.PR}FG`,
        }

        obj.zback = obj.isCoulissante ? 20 : 26// profondeur du fond
        obj.ymin = obj.isCoulissante ? 89 : 50// hauteur interieure du bas
        obj.ymax = obj.H * 10 - (obj.isCoulissante ? 60 + 17 : 25) // hauteur interieure du haut
    }
    else {
        obj.useHole = obj.isEtagere// use a drilled hole to fix
            || obj.type.substr(0, 2) === "RP"
            || obj.isChassis

        obj.draggableX = obj.type.substr(0, 3) !== "ANG"
            && !obj.isPorte

        obj.draggableY = obj.type !== "ANGAB"
            && obj.type !== "BC77000"
            && obj.type !== "BC78000"
            && obj.type !== "BC80000"
            && !obj.isBlot
            && !obj.isTiroir
            && !obj.isPorte
    }

    // console.info(sku, obj)

    return obj
}
window.parseSKU = parseSKU
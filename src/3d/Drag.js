import Meuble from './Meuble';
import { getSegment, segmentIntersect, getSize, Measures } from './Utils'
import { Vector3 } from "three";

const insideRoomThreshold = 620// mm de drag contre le mur pour changer
const enterWallThreshold = 300// mm de drag dans un mur pour changer

export const Walls = {
    R: "right",
    L: "left",
    F: "front",
    B: "back",
}
export const Corners = {
    FR: "front-right",
    RB: "right-back",
    BL: "back-left",
    LF: "left-front",
}
export const Sides = {
    R: "right",
    L: "left",
}
export const Slots = {
    L: "left",
    C: "center",
    R: "right",
}

/* dragging help routines & objects */

/*
    a one-dim segment with a minimum and a maximum
*/
export class Space {
    static onWall = []// right,back,left,front
    static getClosest(wall, segment) {
        if (!Space.onWall[wall]) return null;
        if (Space.onWall[wall] && Space.onWall[wall].length == 0) return null;
        Space.onWall[wall].sort((s1, s2) =>
            Math.min(segment.max - s2.min, s2.max - segment.min) - Math.min(segment.max - s1.min, s1.max - segment.min))
        return Space.onWall[wall][0]
    }
    constructor (min, max, prev, next) {
        this.min = min;
        this.max = max;
        this.prev = prev;// Draggable object (Meuble...) located at the minimum of the segment
        this.next = next;// Draggable object (Meuble...) located at the maximum of the segment
    }
    include(segment) {
        return segment.max <= this.max && segment.min >= this.min
    }
}
// get closest value from x in array
export const getClosestInArray = (x, array) => {
    return array.reduce(function (prev, curr) {
        return (Math.abs(curr - x) < Math.abs(prev - x) ? curr : prev);
    });
}

export const Room = {
    xmax: 1000,
    zmax: 1000,
    right: {},
    front: {},
    left: {},
    back: {},
    axis: "x",
    MeublesOnWall: [],
    MeublesOnCorners: [],
    meubleMagnet: 50,// magnetisme du meuble (mm)

    // set walls length
    setWallsLength(scene, config) {
        // console.log(`setWallsLength`, scene, config)
        Room.xmax = scene ? scene.xmax : config && config.defaultdressing ? config.defaultdressing.xmax : Room.xmax;
        Room.zmax = scene ? scene.zmax : config && config.defaultdressing ? config.defaultdressing.zmax : Room.zmax;
        // console.log(`Room`, Room.xmax, Room.zmax)
    },
    getRoofPosition(h = Math.max(Room.xmax, Room.zmax) + 4000) {
        return new Vector3(Room.xmax / 2, h, Room.zmax / 2)
    },

    /*
    given raycaster wall & point on wall, get closest corner from that point
    */
    getClosestCorner(wall, point) {
        switch (wall.name) {
            case "wall-front":
                return point.z > Room.zmax / 2 ? Corners.LF : Corners.FR
            case "wall-right":
                return point.x > Room.xmax / 2 ? Corners.RB : Corners.FR
            case "wall-back":
                return point.z > Room.zmax / 2 ? Corners.BL : Corners.RB
            case "wall-left":
                return point.x > Room.xmax / 2 ? Corners.BL : Corners.LF
        }
    },

    /*
     for click to add new meuble
     */
    getSpaceOnWall(meuble, meublesOnScene) {

        // Room.setupWallConstraints(meuble)
        Room.setupWallConstraints(meuble)


        // Room.Nowtime = Date.now();
        Room.axis = Room.getAxisForWall(meuble.wall);
        Room.populateMeublesOnWalls(meublesOnScene)
        // Room.populateSpacesOnWalls(meuble)
        const hasSpace = Room.getSpacesOnWall(meuble.wall, meuble)
        if (!hasSpace) return false
        return Room.collisionSolver(meuble)
    },

    /* right and left walls along x-axis */
    getAxisForWall(wall) {
        switch (wall) {
            case Walls.R:
            case Walls.L:
                return "x";
            case Walls.F:
            case Walls.B:
                return "z";
        }
    },
    /* right and left walls along x-axis */
    getWallLength(wall) {
        return (wall === Walls.L || wall === Walls.R) ? Room.xmax : Room.zmax
    },

    /* right & back walls has right hand direction when looking at */
    toRightDirection(wall) {
        return wall === Walls.R || wall === Walls.B
    },

    setupWallConstraints(meuble) {
        const mWidth = meuble.getWidth()
        if (Room.right) {
            Room.right.min = 0
            Room.right.max = Room.xmax - mWidth
        }
        if (Room.front) {
            Room.front.min = mWidth
            Room.front.max = Room.zmax
        }
        if (Room.left) {
            Room.left.min = mWidth
            Room.left.max = Room.xmax
        }
        if (Room.back) {
            Room.back.min = 0
            Room.back.max = Room.zmax - mWidth
        }
    },

    /* populate Space.onWall list of spaces for meuble on all walls */
    populateSpacesOnWalls(meuble) {
        // Object.keys(Room).forEach(w => {// right,back,left if exists
        [Walls.R, Walls.B, Walls.L, Walls.F].forEach(w => {// right,back,left if exists
            Room.getSpacesOnWall(w, meuble)
        });

        //log
        // window.mow = Room.MeublesOnWall
        // window.Space = Space

    },

    getSideWalls(wall) {
        switch (wall) {
            case Walls.R:
            case Walls.L:
                return [Walls.F, Walls.B];// first element is close to 0
            case Walls.F:
            case Walls.B:
                return [Walls.R, Walls.L];// first element is close to 0
        }
    },

    /* get spaces on a wall for meuble */
    getSpacesOnWall(wall, meuble) {
        let lastMeuble = null;
        let lastPos = 0, segment;
        const axis = Room.getAxisForWall(wall)
        let wallLength = (wall === Walls.L || wall === Walls.R) ? Room.xmax : Room.zmax


        // meuble on side wall forbid drag to corner :
        // console.warn("Wall", wall)
        let ax, inter, seg, meubleDepthSegment
        if (Room.getSideWalls(wall) && Room.getSideWalls(wall).length == 2) {

            const leftWall = Room.getSideWalls(wall)[0]
            // console.log(leftWall)
            if (wall === Walls.R || wall === Walls.F) {// close to origin
                meubleDepthSegment = { min: 0, max: meuble.skuInfo.P * 10 }
            }
            else {
                meubleDepthSegment = { min: Room.getWallLength(leftWall) - meuble.skuInfo.P * 10, max: Room.getWallLength(leftWall) }
            }
            ax = Room.getAxisForWall(leftWall)
            Room.MeublesOnWall[leftWall].filter(m => m !== meuble).forEach(m => {
                seg = getSegment(m.object, ax)
                // console.log("+++", m.props.sku, meubleDepthSegment, seg)
                inter = segmentIntersect(meubleDepthSegment, seg)
                // console.log(inter)
                if (inter) {
                    lastPos = Math.max(lastPos, lastPos + m.skuInfo.P * 10)
                }
            })

            const rightWall = Room.getSideWalls(wall)[1]
            // console.log(rightWall)
            if (wall === Walls.R || wall === Walls.F) {// close to origin
                meubleDepthSegment = { min: 0, max: meuble.skuInfo.P * 10 }
            }
            else {
                meubleDepthSegment = { min: Room.getWallLength(rightWall) - meuble.skuInfo.P * 10, max: Room.getWallLength(rightWall) }
            }
            ax = Room.getAxisForWall(rightWall)
            Room.MeublesOnWall[rightWall].filter(m => m !== meuble).forEach(m => {
                seg = getSegment(m.object, ax)
                // console.log("---", m.props.sku, meubleDepthSegment, seg)
                inter = segmentIntersect(meubleDepthSegment, seg)
                // console.log(inter)
                if (inter) {
                    wallLength = Math.min(wallLength, wallLength - m.skuInfo.P * 10)
                }
            })
        }
        // console.warn(lastPos, wallLength)

        // ------------------


        const mWidth = getSize(meuble.object, "x")

        // looks for spaces
        Space.onWall[wall] = []
        Room.MeublesOnWall[wall].filter(m => m !== meuble).forEach(m => {
            segment = getSegment(m.object, axis)
            if (segment.min - lastPos >= mWidth) {
                Space.onWall[wall].push(new Space(lastPos, segment.min, lastMeuble, m))
            }
            // console.warn(segment, segment.max - segment.min)
            lastMeuble = m;
            lastPos = segment.max;//m.position;
        })
        if (wallLength - (segment ? segment.max : 0) >= mWidth) {
            Space.onWall[wall].push(new Space((segment ? segment.max : lastPos), wallLength, lastMeuble, null))
        }
        // console.warn(`Spaces on Wall ${wall} of ${wallLength}mm`, Space.onWall[wall],"/meuble seg" segment, mWidth)
        if (Space.onWall[wall].length == 0) {
            console.warn(`no space on wall : ${wall}`)
            return false;
        }
        else return true
    },

    /* populate MeublesOnWall list for all walls */
    populateMeublesOnWalls(meublesOnScene) {
        // Object.keys(Room).forEach(w => {// right,back,left
        [Walls.R, Walls.B, Walls.L, Walls.F].forEach(w => {// right,back,left if exists
            Room.MeublesOnWall[w] = Room.getMeublesOnWall(meublesOnScene, w, Room.getAxisForWall(w))
            // console.log(Room.MeublesOnWall[w])
        });
    },

    /* get all other meubles on a wall and its corners */
    getMeublesOnWall(meublesOnScene, wall, axis) {
        return meublesOnScene
            .filter(m => m.wall.includes(wall))// test ok for corners & walls
            .sort((m1, m2) => m1.object.position[axis] - m2.object.position[axis])
    },

    /* populate MeublesOnCorners list for all corners */
    populateMeublesOnCorners(meublesOnScene) {
        Room.MeublesOnCorners = []
        meublesOnScene.forEach(m => {
            if (!m.isOnAWall())
                Room.MeublesOnCorners[m.wall] = m
        });
    },

    /* given Space.onWall[meuble.wall], detect closestSpace for meuble */
    collisionSolver(meuble) {
        const axis = Room.axis
        const segment = getSegment(meuble.object, axis)
        const mWidth = getSize(meuble.object, axis)

        if (Space.onWall[meuble.wall] && Space.onWall[meuble.wall].length == 0) {
            console.warn(`no space on wall ${meuble.wall}`)
            return meuble.position//TODO
        }

        const toRight = Room.toRightDirection(meuble.wall);
        const closestSpace = Space.getClosest(meuble.wall, segment);

        let stickTo = null, fusion = false, insideDrag = false;
        Meuble.detach(meuble)
        if (closestSpace.include(segment)) {
            if (closestSpace.max - segment.max <= Room.meubleMagnet) {// stick to right, still in space
                stickTo = "right"
            } else if (segment.min - closestSpace.min <= Room.meubleMagnet) {// stick to left, still in space
                stickTo = "left"
            } else {
            }
        } else if (closestSpace.max <= segment.max) {// stick to right, inside drag
            stickTo = "right"
            insideDrag = true
        } else if (closestSpace.min >= segment.min) {// stick to left, inside drag
            insideDrag = true
            stickTo = "left"
        } else {
            console.error("collisionSolver fails", closestSpace, segment)
        }

        let prev = closestSpace.prev
        let next = closestSpace.next
        if (stickTo && !toRight) {
            stickTo = stickTo == "left" ? "right" : "left"
            prev = closestSpace.next
            next = closestSpace.prev
        }

        // if (insideDrag) console.warn(`stickTo ${stickTo}`, closestSpace.prev ? closestSpace.prev.skuInfo.PR : "", meuble.skuInfo.PL)
        // insideDrag
        if (meuble.insideDrag) {
            meuble.insideDrag(insideDrag, stickTo, stickTo == "left" ? prev : next)
        }

        switch (stickTo) {
            case "left":
                fusion = prev
                    && !prev.skuInfo.hasSides
                    && !meuble.skuInfo.hasSides
                    && prev.skuInfo.PR == meuble.skuInfo.PL
                if (fusion) {
                    Meuble.attach(prev, meuble)
                }
                return toRight ? closestSpace.min + (fusion ? -Measures.thick : 0) :
                    closestSpace.max + (fusion ? Measures.thick : 0)
            case "right":
                fusion = next
                    && !next.skuInfo.hasSides
                    && !meuble.skuInfo.hasSides
                    && next.skuInfo.PL == meuble.skuInfo.PR
                if (fusion) {
                    Meuble.attach(meuble, next)
                }
                return toRight ? closestSpace.max - mWidth + (fusion ? Measures.thick : 0) :
                    closestSpace.min + mWidth + (fusion ? -Measures.thick : 0)
            default:
                return meuble.position
        }
    },


}
/*
    dragging routine : position regions on floor (x,z) determine meuble locations
    from walls and corners to walls and corners
*/
export const getWallChange = (wall, position) => {

    const x = position.x
    const z = position.z
    const t1 = insideRoomThreshold
    const t2 = enterWallThreshold

    switch (wall) {
        case Walls.F:
            if (z < -t2 && x < -t2) {
                return Corners.FR
            }
            if (z > t2 + Room.zmax && x < -t2) {
                return Corners.LF
            }
            if (z < t1 && x > t1 && Space.onWall[Walls.R].length > 0) {
                return Walls.R
            }
            if (z > Room.zmax - t1 && x > t1 && Space.onWall[Walls.L].length > 0) {
                return Walls.L
            }
            break;
        case Walls.B:
            if (z < -t2 && x > t2 + Room.xmax) {
                return Corners.RB
            }
            if (z > t2 + Room.zmax && x > t2 + Room.xmax) {
                return Corners.BL
            }
            if (z < t1 && x < Room.xmax - t1 && Space.onWall[Walls.R].length > 0) {
                return Walls.R
            }
            if (z > Room.zmax - t1 && x < Room.xmax - t1 && Space.onWall[Walls.L].length > 0) {
                return Walls.L
            }
            break;
        case Walls.R:
            if (z < -t2 && x < -t2) {
                return Corners.FR
            }
            if (z < -t2 && x > t2 + Room.xmax) {
                return Corners.RB
            }
            if (x < t1 && z > t1 && Space.onWall[Walls.F].length > 0) {
                return Walls.F
            }
            if (x > Room.xmax - t1 && z > t1 && Space.onWall[Walls.B].length > 0) {
                return Walls.B
            }
            break;
        case Walls.L:
            if (z > t2 + Room.zmax && x < -t2) {
                return Corners.LF
            }
            if (z > t2 + Room.zmax && x > t2 + Room.xmax) {
                return Corners.BL
            }
            if (x < t1 && z < Room.zmax - t1 && Space.onWall[Walls.F].length > 0) {
                return Walls.F
            }
            if (x > Room.xmax - t1 && z < Room.zmax - t1 && Space.onWall[Walls.B].length > 0) {
                return Walls.B
            }
            break;
        case Corners.FR:
            if (x < t1 && z > t1 && Space.onWall[Walls.F].length > 0) {
                return Walls.F
            }
            if (z < t1 && x > t1 && Space.onWall[Walls.R].length > 0) {
                return Walls.R
            }
            break;
        case Corners.RB:
            if (z < t1 && x < Room.xmax - t1 && Space.onWall[Walls.R].length > 0) {
                return Walls.R
            }
            if (x > Room.xmax - t1 && z > t1 && Space.onWall[Walls.B].length > 0) {
                return Walls.B
            }
            break;
        case Corners.BL:
            if (x > Room.xmax - t1 && z < Room.zmax - t1 && Space.onWall[Walls.B].length > 0) {
                return Walls.B
            }
            if (z > Room.zmax - t1 && x < Room.xmax - t1 && Space.onWall[Walls.L].length > 0) {
                return Walls.L
            }
            break;
        case Corners.LF:
            if (z > Room.zmax - t1 && x > t1 && Space.onWall[Walls.L].length > 0) {
                return Walls.L
            }
            if (x < t1 && z < Room.zmax - t1 && Space.onWall[Walls.F].length > 0) {
                return Walls.F
            }
            break;
        default:
    }
    return wall
}
import Meuble from './Meuble';
import { getSegment, Measures } from './Utils'

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
    constructor(min, max, prev, next) {
        this.min = min;
        this.max = max;
        this.prev = prev;// Draggable object (Meuble...) located at the minimum of the segment
        this.next = next;// Draggable object (Meuble...) located at the maximum of the segment
    }
    include(segment) {
        return segment.max <= this.max && segment.min >= this.min
    }
}

export const Walls = {
    R: 'right',
    L: 'left',
    F: 'front',
    B: 'back',
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
    meubleMagnet: 50,// magnetisme du meuble (mm)

    // set walls length
    setWallsLength(scene, config) {
        // console.log(`setWallsLength`, scene, config)
        Room.xmax = scene ? scene.xmax : config && config.defaultdressing ? config.defaultdressing.xmax : Room.xmax;
        Room.zmax = scene ? scene.zmax : config && config.defaultdressing ? config.defaultdressing.zmax : Room.zmax;
        // console.log(`Room`, Room.xmax, Room.zmax)
    },

    /*
    given raycaster wall & point on wall, get closest corner from that point
    */
    getClosestCorner(wall, point) {
        switch (wall.name) {
            case "wall-front":
                return point.z > Room.zmax / 2 ? "left-front" : "front-right"
            case "wall-right":
                return point.x > Room.xmax / 2 ? "right-back" : "front-right"
            case "wall-back":
                return point.z > Room.zmax / 2 ? "back-left" : "right-back"
            case "wall-left":
                return point.x > Room.xmax / 2 ? "back-left" : "left-front"
        }
    },

    /*
     for click to add new meuble (called from reducers)
     */
    getSpaceOnWall(meuble, meublesOnScene) {

        // Room.setupWallConstraints(meuble)
        Room.setupWallConstraints(meuble)


        // Room.Nowtime = Date.now();
        Room.axis = Room.getAxisForWall(meuble.wall);
        Room.populateMeublesOnWalls(meublesOnScene)
        // Room.populateSpacesOnWalls(meuble)
        const hasSpace = Room.getSpacesOnWall(meuble.wall, Room.getAxisForWall(meuble.wall), meuble)
        if (!hasSpace) return false
        return Room.collisionSolver(meuble)
    },

    /* right and left walls along x-axis */
    getAxisForWall(wall) {
        switch (wall) {
            case "right":
            case "left":
                return "x";
            case "front":
            case "back":
                return "z";
        }
    },

    /* right & back walls has right hand direction when looking at */
    toRightDirection(wall) {
        return wall === "right" || wall === "back"
    },

    setupWallConstraints(meuble) {
        if (Room.right) {
            Room.right.min = 0
            Room.right.max = Room.xmax - meuble.width
        }
        if (Room.front) {
            Room.front.min = meuble.width
            Room.front.max = Room.zmax
        }
        if (Room.left) {
            Room.left.min = meuble.width
            Room.left.max = Room.xmax
        }
        if (Room.back) {
            Room.back.min = 0
            Room.back.max = Room.zmax - meuble.width
        }
    },

    /* populate Space.onWall list of spaces for meuble on all walls */
    populateSpacesOnWalls(meuble) {
        // Object.keys(Room).forEach(w => {// right,back,left if exists
        ["right", "back", "left", "front"].forEach(w => {// right,back,left if exists
            Room.getSpacesOnWall(w, Room.getAxisForWall(w), meuble)
        });

        //log
        window.mow = Room.MeublesOnWall
        window.Space = Space

    },

    /* get spaces on a wall for meuble */
    getSpacesOnWall(wall, axis, meuble) {
        let lastMeuble = null;
        let lastPos = 0, segment;
        const wallLength = (wall === "left" || wall === "right") ? Room.xmax : Room.zmax

        Space.onWall[wall] = []
        Room.MeublesOnWall[wall].filter(m => m !== meuble).forEach(m => {
            segment = getSegment(m.object, axis)
            if (segment.min - lastPos >= meuble.width) {
                Space.onWall[wall].push(new Space(lastPos, segment.min, lastMeuble, m))
            }
            console.warn(segment, segment.max - segment.min)
            lastMeuble = m;
            lastPos = segment.max;//m.position;
        })
        if (wallLength - (segment ? segment.max : 0) >= meuble.width) {
            Space.onWall[wall].push(new Space((segment ? segment.max : 0), wallLength, lastMeuble, null))
        }
        // console.log(`Spaces.onWall ${wall}`, Space.onWall[wall]);
        if (Space.onWall[wall].length == 0) {
            console.warn(`no space on wall ${wall}`)
            return false;
        }
        else return true
    },

    /* populate MeublesOnWall list for all walls */
    populateMeublesOnWalls(meublesOnScene) {
        // Object.keys(Room).forEach(w => {// right,back,left
        ["right", "back", "left", "front"].forEach(w => {// right,back,left if exists
            Room.MeublesOnWall[w] = Room.getMeublesOnWall(meublesOnScene, w, Room.getAxisForWall(w))
        });
    },

    /* get all other meubles on a wall */
    getMeublesOnWall(meublesOnScene, wall, axis) {
        return meublesOnScene
            .filter(m => m.wall === wall)
            .sort((m1, m2) => m1.object.position[axis] - m2.object.position[axis])
    },

    /* given Space.onWall[meuble.wall], detect closestSpace for meuble */
    collisionSolver(meuble) {
        const axis = Room.axis
        const segment = getSegment(meuble.object, axis)

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
                return toRight ? closestSpace.max - meuble.width + (fusion ? Measures.thick : 0) :
                    closestSpace.min + meuble.width + (fusion ? -Measures.thick : 0)
            default:
                return meuble.position
        }
    },


}
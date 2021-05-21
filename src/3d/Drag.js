import { getSegment } from './Utils'

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

    // set walls length
    setWallsLength(scene, config) {
        console.log(`setWallsLength`, scene, config)
        Room.xmax = scene ? scene.xmax : config && config.defaultdressing ? config.defaultdressing.xmax : Room.xmax;
        Room.zmax = scene ? scene.zmax : config && config.defaultdressing ? config.defaultdressing.zmax : Room.zmax;
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
            lastMeuble = m;
            lastPos = m.position;
        })
        if (wallLength - (segment ? segment.max : 0) >= meuble.width) {
            Space.onWall[wall].push(new Space((segment ? segment.max : 0), wallLength, lastMeuble, null))
        }
        // console.log(`Spaces.onWall ${wall}`, Space.onWall[wall]);
        if (Space.onWall[wall].length == 0) {
            console.log(`no space on wall ${wall}`)
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
        window.zaa = Room.MeublesOnWall
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

        if (Space.onWall[meuble.wall] && Space.onWall[meuble.wall].length == 0)//TODO
            return meuble.position

        const toRight = Room.toRightDirection(meuble.wall);

        const closestSpace = Space.getClosest(meuble.wall, segment);
        if (closestSpace.include(segment)) {
            if (closestSpace.max - segment.max <= Room.meubleMagnet) {
                return closestSpace.max + (toRight ? -meuble.width : 0)
            } else if (segment.min - closestSpace.min <= Room.meubleMagnet) {
                return closestSpace.min + (!toRight ? meuble.width : 0)
            } else return meuble.position
        } else if (closestSpace.min >= segment.min) {
            return closestSpace.min + (!toRight ? meuble.width : 0)
        } else if (closestSpace.max <= segment.max) {
            return closestSpace.max - (toRight ? meuble.width : 0)
        } else {
            console.log("wtf", closestSpace, segment)
            return meuble.position
        }
    },


}
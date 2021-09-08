import { Walls, Corners, Sides } from "./Constants";
import { Space } from "./Space";
import { Errors } from '../api/Errors'
import { getSegment, segmentIntersect, getSize, Measures } from './Utils'
import Meuble from './meubles/Meuble';
import { Vector3 } from "three";

export default {
    name: "untitled",
    xmax: 2000,
    ymax: 2380,
    zmax: 2000,
    right: {},
    front: {},
    left: {},
    back: {},
    axis: "x",
    MeublesOnWall: [],
    MeublesOnCorners: [],
    meubleMagnet: 50,// magnetisme du meuble (mm)

    setup(dressing) {
        this.name = dressing && dressing.name ? dressing.name : this.name
        this.xmax = dressing && dressing.xmax ? parseInt(dressing.xmax) : this.xmax
        this.zmax = dressing && dressing.zmax ? parseInt(dressing.zmax) : this.zmax
    },

    getRoofPosition(h) {
        if (!h) h = Math.max(this.xmax, this.zmax) + 4000
        return new Vector3(this.xmax / 2, h, this.zmax / 2)
    },

    /*
    given raycaster wall & point on wall, get closest corner from that point
    */
    getClosestCorner(wall, point) {
        switch (wall.name) {
            case "wall-front":
                return point.z > this.zmax / 2 ? Corners.LF : Corners.FR
            case "wall-right":
                return point.x > this.xmax / 2 ? Corners.RB : Corners.FR
            case "wall-back":
                return point.z > this.zmax / 2 ? Corners.BL : Corners.RB
            case "wall-left":
                return point.x > this.xmax / 2 ? Corners.BL : Corners.LF
        }
    },

    /*
     for click to add new meuble
     */
    getSpaceOnWall(meuble, meublesOnScene) {

        this.setupWallConstraints(meuble.getWidth())

        // this.Nowtime = Date.now();
        this.axis = this.getAxisForWall(meuble.wall);
        this.populateMeublesOnWalls(meublesOnScene)
        // this.populateSpacesOnWalls(meuble)
        const hasSpace = this.getSpacesOnWall(meuble.wall, meuble, meuble.skuInfo)
        if (!hasSpace) return false
        return this.collisionSolver(meuble)
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
        return (wall === Walls.L || wall === Walls.R) ? this.xmax : this.zmax
    },

    /* right & back walls has right hand direction when looking at */
    toRightDirection(wall) {
        return wall === Walls.R || wall === Walls.B
    },

    setupWallConstraints(mWidth) {
        if (this.right) {
            this.right.min = 0
            this.right.max = this.xmax - mWidth
        }
        if (this.front) {
            this.front.min = mWidth
            this.front.max = this.zmax
        }
        if (this.left) {
            this.left.min = mWidth
            this.left.max = this.xmax
        }
        if (this.back) {
            this.back.min = 0
            this.back.max = this.zmax - mWidth
        }
    },

    /* populate Space.onWall list of spaces for meuble on all walls */
    populateSpacesOnWalls(meuble, skuInfo) {
        // Object.keys(this).forEach(w => {// right,back,left if exists
        [Walls.R, Walls.B, Walls.L, Walls.F].forEach(w => {// right,back,left if exists
            this.getSpacesOnWall(w, meuble, skuInfo)
        });

        //log
        // window.mow = this.MeublesOnWall
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

    /* get spaces on a wall for meuble. skuInfo param added in case meuble=null */
    getSpacesOnWall(wall, meuble, skuInfo) {
        let lastMeuble = null;
        let lastPos = 0, segment;
        const axis = this.getAxisForWall(wall)
        let wallLength = (wall === Walls.L || wall === Walls.R) ? this.xmax : this.zmax


        // meuble on side wall forbid dragging to corner :
        // console.warn("Wall", wall)
        let ax, inter, seg, meubleDepthSegment
        if (this.getSideWalls(wall) && this.getSideWalls(wall).length == 2) {

            const leftWall = this.getSideWalls(wall)[0]
            // console.log(leftWall)
            if (wall === Walls.R || wall === Walls.F) {// close to origin
                meubleDepthSegment = { min: 0, max: skuInfo.p }
            }
            else {
                meubleDepthSegment = { min: this.getWallLength(leftWall) - skuInfo.p, max: this.getWallLength(leftWall) }
            }
            ax = this.getAxisForWall(leftWall)
            this.MeublesOnWall[leftWall].filter(m => m !== meuble).forEach(m => {
                seg = getSegment(m.object, ax)
                // console.log("+++", m.props.sku, meubleDepthSegment, seg)
                inter = segmentIntersect(meubleDepthSegment, seg)
                // console.log(inter)
                if (inter) {
                    lastPos = Math.max(lastPos, lastPos + m.skuInfo.p)
                }
            })

            const rightWall = this.getSideWalls(wall)[1]
            // console.log(rightWall)
            if (wall === Walls.R || wall === Walls.F) {// close to origin
                meubleDepthSegment = { min: 0, max: skuInfo.p }
            }
            else {
                meubleDepthSegment = { min: this.getWallLength(rightWall) - skuInfo.p, max: this.getWallLength(rightWall) }
            }
            ax = this.getAxisForWall(rightWall)
            this.MeublesOnWall[rightWall].filter(m => m !== meuble).forEach(m => {
                seg = getSegment(m.object, ax)
                // console.log("---", m.props.sku, meubleDepthSegment, seg)
                inter = segmentIntersect(meubleDepthSegment, seg)
                // console.log(inter)
                if (inter) {
                    wallLength = Math.min(wallLength, wallLength - m.skuInfo.p)
                }
            })
        }
        // console.warn(lastPos, wallLength)

        // ------------------

        const mWidth = meuble ? getSize(meuble.object, "x") : skuInfo.l

        // looks for spaces
        Space.onWall[wall] = []
        this.MeublesOnWall[wall].filter(m => m !== meuble).forEach(m => {
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
        // Object.keys(this).forEach(w => {// right,back,left
        [Walls.R, Walls.B, Walls.L, Walls.F].forEach(w => {// right,back,left if exists
            this.MeublesOnWall[w] = this.getMeublesOnWall(meublesOnScene, w, this.getAxisForWall(w))
            // console.log(this.MeublesOnWall[w])
        });
    },

    /* get all other meubles on a wall and its corners */
    getMeublesOnWall(meublesOnScene, wall, axis) {
        return meublesOnScene
            .filter(m => m.wall.includes(wall))// test ok for corners & walls
            .sort((m1, m2) => m1.object.position[axis] - m2.object.position[axis])
    },

    /* populate MeublesOnCorners list for all corners */
    populateMeublesOnCorners(meublesOnScene, butMeuble) {
        this.MeublesOnCorners = []
        meublesOnScene
            .filter(m => m !== butMeuble && !m.isOnAWall())
            .forEach(m => this.MeublesOnCorners[m.wall] = m);
    },

    isCornerFreeForMeuble(corner, skuInfo) {
        //  if (!Object.values(Corners).includes(corner) return false
        if (this.MeublesOnCorners[corner]) return Errors.CORNER_FULL

        // calculation of width when in corners + angab :
        const mWidth = Math.round((skuInfo.l + (2 * Measures.thick)) * Math.cos(Math.PI / 4) + skuInfo.p)

        let segment;
        const walls = corner.split("-")

        const toRight0 = this.toRightDirection(walls[0]);
        if (toRight0) {
            segment = { min: this.getWallLength(walls[0]) - mWidth, max: this.getWallLength(walls[0]) }
        }
        else {
            segment = { min: 0, max: mWidth }
        }
        const space0 = Space.onWall[walls[0]].find(s => s.include(segment))
        if (!space0) return Errors.NO_PLACE_IN_CORNER

        const toRight1 = this.toRightDirection(walls[1]);
        if (toRight1) {
            segment = { min: 0, max: mWidth }
        }
        else {
            segment = { min: this.getWallLength(walls[1]) - mWidth, max: this.getWallLength(walls[1]) }
        }
        const space1 = Space.onWall[walls[1]].find(s => s.include(segment))
        if (!space1) return Errors.NO_PLACE_IN_CORNER

        return true
    },

    /* given Space.onWall[meuble.wall], detect closestSpace for meuble */
    collisionSolver(meuble) {
        const axis = this.axis
        const segment = getSegment(meuble.object, axis)
        let mWidth
        if (meuble.skuInfo.type == "P40RL057") {
            mWidth = meuble.skuInfo.l + 2 * Measures.thick
        }
        else {
            mWidth = getSize(meuble.object, axis)
        }

        if (Space.onWall[meuble.wall] && Space.onWall[meuble.wall].length == 0) {
            console.warn(`no space on wall ${meuble.wall}`)
            return meuble.position//TODO
        }

        const toRight = this.toRightDirection(meuble.wall);
        const closestSpace = Space.getClosest(meuble.wall, segment);

        let stickTo = null, fusion = false, insideDrag = 0;
        Meuble.detach(meuble)
        if (closestSpace.include(segment)) {
            if (closestSpace.max - segment.max <= this.meubleMagnet) {// stick to right, still in space
                stickTo = Sides.R
            } else if (segment.min - closestSpace.min <= this.meubleMagnet) {// stick to left, still in space
                stickTo = Sides.L
            } else {
            }
        } else if (closestSpace.max <= segment.max) {// stick to right, inside drag
            stickTo = Sides.R
            insideDrag = segment.max - closestSpace.max
        } else if (closestSpace.min >= segment.min) {// stick to left, inside drag
            insideDrag = closestSpace.min - segment.min
            stickTo = Sides.L
        } else {
            console.error("collisionSolver fails", closestSpace, segment)
        }

        let prev = closestSpace.prev
        let next = closestSpace.next
        if (stickTo && !toRight) {
            stickTo = stickTo == Sides.L ? Sides.R : Sides.L
            prev = closestSpace.next
            next = closestSpace.prev
        }

        // if (insideDrag) console.warn(`stickTo ${stickTo}`, closestSpace.prev ? closestSpace.prev.skuInfo.PR : "", meuble.skuInfo.PL)
        // insideDrag
        if (meuble.insideDrag) {
            meuble.insideDrag(insideDrag, stickTo, stickTo == Sides.L ? prev : next)
        }

        switch (stickTo) {
            case Sides.L:
                fusion = prev
                    && !prev.skuInfo.hasSides
                    && !meuble.skuInfo.hasSides
                    && prev.skuInfo.PR == meuble.skuInfo.PL
                if (fusion) {
                    Meuble.attach(prev, meuble)
                }
                if (prev && meuble.skuInfo.type === "FIL") {
                    meuble.setDepth(prev.skuInfo.PR)
                }
                if (prev && prev.skuInfo.type === "ANG90") {// ANG90 corner fileur pushing
                    prev.setDepth(Sides.R, meuble.skuInfo.PL)
                }
                return toRight ? closestSpace.min + (fusion ? -Measures.thick : 0) :
                    closestSpace.max + (fusion ? Measures.thick : 0)
            case Sides.R:
                fusion = next
                    && !next.skuInfo.hasSides
                    && !meuble.skuInfo.hasSides
                    && next.skuInfo.PL == meuble.skuInfo.PR
                if (fusion) {
                    Meuble.attach(meuble, next)
                }
                if (next && meuble.skuInfo.type === "FIL") {
                    meuble.setDepth(next.skuInfo.PL)
                }
                if (next && next.skuInfo.type === "ANG90") {// ANG90 corner fileur pushing
                    next.setDepth(Sides.L, meuble.skuInfo.PR)
                }
                // console.log(mWidth)
                return toRight ? closestSpace.max - mWidth + (fusion ? Measures.thick : 0) :
                    closestSpace.min + mWidth + (fusion ? -Measures.thick : 0)
            default:
                return meuble.position
        }
    },


}
import {
    select,
    drag
}
    from '../api/actions'
import store from '../api/store';
import * as THREE from "three";
import MainScene from './MainScene';
import Meuble from './Meuble'

import { DragControls } from 'three/examples/jsm/controls/DragControls.js';

class Space {
    static onWall = []// right,back,left
    constructor (min, max, prev, next) {
        this.min = min;
        this.max = max;
        this.prev = prev;// Draggable
        this.next = next;// Draggable
    }
    include(segment) {
        return segment.max <= this.max && segment.min >= this.min
    }
    static getClosest(wall, segment) {
        if (!Space.onWall[wall]) return null;
        if (Space.onWall[wall] && Space.onWall[wall].length == 0) return null;
        Space.onWall[wall].sort((s1, s2) =>
            Math.min(segment.max - s2.min, s2.max - segment.min) - Math.min(segment.max - s1.min, s1.max - segment.min))
        return Space.onWall[wall][0]
    }
}

export default class Draggable extends Meuble {

    static switchWallThreshold = 250// mm de drag après un angle pour changer de mur
    static meubleMagnet = 100// magnetisme du meuble (mm)
    static selectClickBeforeDragDelay = 180// delay (ms) before meuble drag start

    static WallConfig = {}// from config.json or app current settings
    static MeublesOnWall = []// meubles wall arrays sorted 
    static Dragged// current target dragged
    static axis;// axis for current wall whare Draggable is dragged
    static Nowtime;// timer for selection click

    get position() {
        return this.object.position[Draggable.getAxisForWall(this.wall)];
    }
    /*     set position(p) {
            switch (this.wall) {
                case "right":
                    this.object.position[Draggable.axis]=
                    break;
                case "left":
                    this.object.position[Draggable.axis]=
                    break;
                case "back":
                    this.object.position[Draggable.axis]=
                    break;
            }
        }   */
    constructor (props, object) {
        super(props, object)

        const dragControls = new DragControls([object], MainScene.camera, MainScene.renderer.domElement);
        dragControls.transformGroup = true;
        if (!object.angle) {
            dragControls.addEventListener('drag', this.dragging.bind(this))
            dragControls.addEventListener('dragstart', this.dragStart.bind(this))
            dragControls.addEventListener('dragend', this.dragEnd.bind(this))
            // dragControls.addEventListener('hoveron', hoveron)
            // dragControls.addEventListener('hoveroff', hoveroff)
        }
        else {
            dragControls.addEventListener('drag', this.dragging.bind(this))
            dragControls.addEventListener('dragstart', this.dragStart.bind(this))
            dragControls.addEventListener('dragend', this.dragEnd.bind(this))
            // dragControls.addEventListener('drag', dragAngle)
            // dragControls.addEventListener('dragstart', dragAngleStart)
            // dragControls.addEventListener('dragend', dragAngleEnd)
        }
        this.dragControls = dragControls;
    }
    dragStart(event) {
        if (Draggable.Dragged) {
            event.target.enabled = false;// deactivation of other Draggable
            return
        }
        Draggable.Dragged = this;

        MainScene.orbitControls.enabled = false;// deactivation of orbit controls while dragging

        Draggable.WallConfig = store.getState().config.walls;
        Draggable.setupWallConstraints(this)
        Draggable.Nowtime = Date.now();
        Draggable.axis = Draggable.getAxisForWall(this.wall);
        Draggable.populateMeublesOnWalls()
        Draggable.populateSpacesOnWalls(this)

        store.dispatch(drag(this))
        store.dispatch(select(this))// selection
    }
    static getAxisForWall(wall) {
        switch (wall) {
            case "right":
            case "left":
                return "x";
            case "back":
                return "z";
        }
    }
    /* right wall has right hand direction, not others */
    static toRightDirection(wall) {
        return wall === "right"
    }
    static setupWallConstraints(meuble) {
        Draggable.WallConfig["right"].min = 0
        Draggable.WallConfig["right"].max = Draggable.WallConfig.right.width - meuble.width
        Draggable.WallConfig["back"].min = meuble.width
        Draggable.WallConfig["back"].max = Draggable.WallConfig.back.width
        Draggable.WallConfig["left"].min = meuble.width
        Draggable.WallConfig["left"].max = Draggable.WallConfig.left.width
    }

    /* populate Space.onWall list of spaces for meuble on all walls */
    static populateSpacesOnWalls(meuble) {
        Object.keys(Draggable.WallConfig).forEach(w => {// right,back,left
            Draggable.getSpacesOnWall(w, Draggable.getAxisForWall(w), meuble)
        });
    }
    /* get spaces on a wall for meuble */
    static getSpacesOnWall(wall, axis, meuble) {
        let lastMeuble = null;
        let lastPos = 0, segment;
        Space.onWall[wall] = []
        Draggable.MeublesOnWall[wall].filter(m => m !== meuble).forEach(m => {
            segment = getSegment(m.object, axis)
            if (segment.min - lastPos >= meuble.width) {
                Space.onWall[wall].push(new Space(lastPos, segment.min, lastMeuble, m))
            }
            lastMeuble = m;
            lastPos = m.position;
        })
        if (Draggable.WallConfig[wall].width - (segment ? segment.max : 0) >= meuble.width) {
            Space.onWall[wall].push(new Space((segment ? segment.max : 0), Draggable.WallConfig[wall].width, lastMeuble, null))
        }
        // console.log(`Spaces.onWall ${wall}`, Space.onWall[wall]);
        if (Space.onWall[wall].length == 0) {
            console.log(`no space on wall ${wall}`)
        }
    }
    /* populate MeublesOnWall list for all walls */
    static populateMeublesOnWalls() {
        Object.keys(Draggable.WallConfig).forEach(w => {// right,back,left
            Draggable.MeublesOnWall[w] = Draggable.getMeublesOnWall(w, Draggable.getAxisForWall(w))
        });
        window.zaa = Draggable.MeublesOnWall
    }
    /* get all other meubles on a wall */
    static getMeublesOnWall(wall, axis) {
        return store.getState().meublesOnScene
            .filter(m => m.wall === wall)
            .sort((m1, m2) => m1.object.position[axis] - m2.object.position[axis])
    }
    /* given Space.onWall[meuble.wall], detect closestSpace for meuble */
    static collisionSolver(meuble) {
        const axis = Draggable.axis
        const segment = getSegment(meuble.object, axis)

        if (Space.onWall[meuble.wall] && Space.onWall[meuble.wall].length == 0)//TODO
            return meuble.position

        const toRight = Draggable.toRightDirection(meuble.wall);

        const closestSpace = Space.getClosest(meuble.wall, segment);
        if (closestSpace.include(segment)) {
            if (closestSpace.max - segment.max <= Draggable.meubleMagnet) {
                return closestSpace.max + (toRight ? -meuble.width : 0)
            } else if (segment.min - closestSpace.min <= Draggable.meubleMagnet) {
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
    }

    dragging(event) {
        // drag start delay to let selection click
        if (Draggable.Dragged === this && Date.now() - Draggable.Nowtime < Draggable.selectClickBeforeDragDelay) {
            return
        }
        let wallWidth = Draggable.WallConfig[this.wall].width;
        let axis;
        Draggable.axis = Draggable.getAxisForWall(this.wall);
        switch (this.wall) {
            case "right":
                axis = "x";
                event.object.position.y = 0;
                event.object.position.z = 0;
                if (event.object.position.x < - Draggable.switchWallThreshold//corner turn
                    && Space.onWall["back"].length > 0) {
                    this.wall = "back"
                    this.object.rotateY(Math.PI / 2);
                    return;
                }
                break;
            case "back":
                axis = "z";
                event.object.position.y = 0;
                event.object.position.x = 0;
                if (event.object.position.z < - Draggable.switchWallThreshold //corner turn
                    && Space.onWall["right"].length > 0) {
                    this.wall = "right"
                    this.object.rotateY(-Math.PI / 2);
                    // this.object.position.x = 0;
                    return;
                }
                if (event.object.position.z > Draggable.switchWallThreshold + wallWidth
                    && Space.onWall["left"].length > 0) {
                    this.wall = "left"
                    this.object.rotateY(Math.PI / 2);
                    return;
                }
                break;
            case "left":
                axis = "x";
                event.object.position.y = 0;
                event.object.position.z = Draggable.WallConfig.back.width;
                if (event.object.position.x < - Draggable.switchWallThreshold//corner turn
                    && Space.onWall["back"].length > 0) {
                    this.wall = "back"
                    this.object.rotateY(-Math.PI / 2);
                    return;
                }
                break;
            default:
        }

        event.object.position[axis] = 10 * (Math.round(event.object.position[axis] / 10))//grid magnet 1cm
        event.object.position[axis] =
            Math.max(Draggable.WallConfig[this.wall].min, Math.min(Draggable.WallConfig[this.wall].max, event.object.position[axis]))
        event.object.position[axis] = Draggable.collisionSolver(this);

        // console.log("drag", Draggable.WallConfig[this.wall])
        // console.log("drag", event, event.object.position.x)
        MainScene.render();
    }

    dragEnd(event) {
        MainScene.orbitControls.enabled = true;
        // event.object.material.emissive.set(0x000000);
        if (Draggable.Dragged === this && Date.now() - Draggable.Nowtime < Draggable.selectClickBeforeDragDelay) {
            store.dispatch(select(this))
        }
        store.dispatch(drag(null))
        Draggable.Dragged = null

        store.getState().meublesOnScene.forEach(m => m.dragControls.enabled = true)// reactivation of others
    }
}
/*
angle
*/
/* dragAngle(event) {
}
dragAngleStart(event) {
}
dragAngleEnd(event) {
} */

const getSegment = (object, axis) => {
    const box = new THREE.Box3().setFromObject(object);
    // const box = new THREE.Box3().setFromObject(object);
    // const v = new THREE.Vector3();
    // box.getSize(v)
    // console.log(box.min, box.max, box.getSize());
    return { min: Math.round(box.min[axis]), max: Math.round(box.max[axis]) };
}

const getHeight = (object) => {
    var box = new THREE.Box3().setFromObject(object);
    const v = new THREE.Vector3();
    box.getSize(v)
    return Math.ceil(v.y);
}
const getDepth = (object) => {
    var box = new THREE.Box3().setFromObject(object);
    const v = new THREE.Vector3();
    box.getSize(v)
    return Math.ceil(v.z);
}



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
        this.prev = prev;// Accessoire
        this.next = next;// Accessoire
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

export default class Accessoire {

    static switchWallThreshold = 250// mm de drag après un angle pour changer de mur
    static meubleMagnet = 100// magnetisme du meuble (mm)
    static selectClickBeforeDragDelay = 250// delay (ms) before meuble drag start

    static Dragged// current target dragged
    static axis;// axis for current wall whare Accessoire is dragged
    static Nowtime;// timer for selection click

    /* get position() {
        return this.object.position[Accessoire.getAxisForWall(this.wall)];
    } */
    /*     set position(p) {
            switch (this.wall) {
                case "right":
                    this.object.position[Accessoire.axis]=
                    break;
                case "left":
                    this.object.position[Accessoire.axis]=
                    break;
                case "back":
                    this.object.position[Accessoire.axis]=
                    break;
            }
        }   */
    constructor (props, object) {
        // super(props, object)

        this.props = props;// wp backoffice props
        this.object = object;// threejs group mesh

        const dragControls = new DragControls([object], MainScene.camera, MainScene.renderer.domElement);
        dragControls.transformGroup = true;
        dragControls.addEventListener('drag', this.dragging.bind(this))
        dragControls.addEventListener('dragstart', this.dragStart.bind(this))
        dragControls.addEventListener('dragend', this.dragEnd.bind(this))
        this.dragControls = dragControls;
    }

    dragStart(event) {
        if (Accessoire.Dragged) {
            event.target.enabled = false;// deactivation of other Accessoire
            return
        }
        Accessoire.Dragged = this;

        MainScene.orbitControls.enabled = false;// deactivation of orbit controls while dragging

        // Accessoire.setWallConfig();
        // Accessoire.setupWallConstraints(this)
        Accessoire.Nowtime = Date.now();
        Accessoire.axis = Accessoire.getAxisForWall(this.wall);

        store.dispatch(drag(this))
        // store.dispatch(select(this))// selection
    }
    dragging(event) {
        // drag start delay to let selection click
        if (Accessoire.Dragged === this && Date.now() - Accessoire.Nowtime < Accessoire.selectClickBeforeDragDelay) {
            return
        }
        let wallLength = Accessoire.WallConfig[this.wall].length;
        let axis;
        Accessoire.axis = Accessoire.getAxisForWall(this.wall);
        switch (this.wall) {
            case "right":
                axis = "x";
                event.object.position.y = 0;
                event.object.position.z = 0;
                if (Accessoire.WallConfig.back
                    && event.object.position.x < - Accessoire.switchWallThreshold//corner turn
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
                if (Accessoire.WallConfig.right
                    && event.object.position.z < - Accessoire.switchWallThreshold //corner turn
                    && Space.onWall["right"].length > 0) {
                    this.wall = "right"
                    this.object.rotateY(-Math.PI / 2);
                    // this.object.position.x = 0;
                    return;
                }
                if (Accessoire.WallConfig.left
                    && event.object.position.z > Accessoire.switchWallThreshold + wallLength
                    && Space.onWall["left"].length > 0) {
                    this.wall = "left"
                    this.object.rotateY(Math.PI / 2);
                    return;
                }
                break;
            case "left":
                axis = "x";
                event.object.position.y = 0;
                event.object.position.z = Accessoire.WallConfig.back.length;
                if (Accessoire.WallConfig.back
                    && event.object.position.x < - Accessoire.switchWallThreshold//corner turn
                    && Space.onWall["back"].length > 0) {
                    this.wall = "back"
                    this.object.rotateY(-Math.PI / 2);
                    return;
                }
                break;
            default:
        }

        event.object.position[axis] = 10 * (Math.round(event.object.position[axis] / 10))//grid magnet 1cm
        // event.object.position[axis] =
        // Math.max(Accessoire.WallConfig[this.wall].min, Math.min(Accessoire.WallConfig[this.wall].max, event.object.position[axis]))
        // event.object.position[axis] = Accessoire.collisionSolver(this);

        // console.log("drag", Accessoire.WallConfig[this.wall])
        // console.log("drag", event, event.object.position.x)
        MainScene.render();
    }

    dragEnd(event) {
        MainScene.orbitControls.enabled = true;
        if (Accessoire.Dragged === this && Date.now() - Accessoire.Nowtime < Accessoire.selectClickBeforeDragDelay) {
            store.dispatch(select(this))
        }
        store.dispatch(drag(null))
        Accessoire.Dragged = null

        store.getState().meublesOnScene.forEach(m => m.dragControls.enabled = true)// reactivation of others
    }
}
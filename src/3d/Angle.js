import {
    select,
    drag,
    Tools
}
    from '../api/actions'
import store from '../api/store';

import MainScene from './MainScene';
import Draggable from './Draggable'

import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { create as createCross } from './helpers/Cross';
import { Space, Room } from './Drag';

export default class Angle extends Draggable {
    constructor(props, object, state) {
        super(props, object, state)

    }

    dragStart(event) {
        console.log(" angle dragStart", this)
        if (Angle.Dragged) {//|| tool != Tools.ARROW
            event.target.enabled = false;// deactivation of other Angle
            return
        }
        Angle.Dragged = this;

        MainScene.orbitControls.enabled = false;// deactivation of orbit controls while dragging

        Room.setWallsLength(MainScene.currentDressing, MainScene.config)
        Room.setupWallConstraints(this)

        // Angle.Nowtime = Date.now();
        Room.axis = Room.getAxisForWall(this.wall);
        Room.populateMeublesOnWalls(MainScene.meubles)
        Room.populateSpacesOnWalls(this)

        store.dispatch(drag(this))
        // store.dispatch(select(this))// selection

        if (Angle.Cross && !Angle.Cross.parent) MainScene.scene.add(Angle.Cross)
    }
    getWallChange(x, z, wall, thresh) {
        switch (wall) {
            case "front":
                if (z < - thresh && Space.onWall["right"].length > 0) {
                    return "right"
                }
                if (z > thresh + Room.zmax && Space.onWall["left"].length > 0) {
                    return "left"
                }
                break;
            case "back":
                if (z < - thresh && Space.onWall["right"].length > 0) {
                    return "right"
                }
                if (z > thresh + Room.zmax && Space.onWall["left"].length > 0) {
                    return "left"
                }
                break;
            case "right":
                if (x < - thresh && Space.onWall["front"].length > 0) {
                    return "front"
                }
                if (x > thresh + Room.xmax && Space.onWall["back"].length > 0) {
                    return "back"
                }
                break;
            case "left":
                if (x < - thresh && Space.onWall["front"].length > 0) {
                    return "front"
                }
                if (x > thresh + Room.xmax && Space.onWall["back"].length > 0) {
                    return "back"
                }
                break;
            default:
        }
        return null
    }
    dragging(event) {
        // drag start delay to let selection click
        /*         if (Angle.Dragged === this && Date.now() - Angle.Nowtime < Angle.selectClickBeforeDragDelay) {
                    return
                } */
        // const wallLength = Room[this.wall].length;
        const wallLength =
            (this.wall === "left" || this.wall === "right") ? Room.xmax : Room.zmax
        // console.log(this.wall);
        // console.log(event.object.position.x, event.object.position.z)
        Angle.Cross.position.x = event.object.position.x
        Angle.Cross.position.z = event.object.position.z
        const thresh = Angle.switchWallThreshold
        // let axis;
        Room.axis = Room.getAxisForWall(this.wall);

        //looking for change of destination
        const newWall =
            this.getWallChange(event.object.position.x, event.object.position.z, this.wall, thresh)
        if (newWall) {
            console.warn(`change wall from ${this.wall} to ${newWall}`)// Date.getTime() and forbid flicker change wall !??
            this.wall = newWall
        }
        event.object.position.y = 0;

        switch (this.wall) {
            case "right":
                event.object.position.z = 0;
                event.object.rotation.y = 0;

                event.object.position.x = 0;

                break;
            case "left":
                event.object.position.z = Room.zmax;
                event.object.rotation.y = Math.PI;

                event.object.position.x = Room.xmax;

                break;
            case "front":
                event.object.position.x = 0;
                event.object.rotation.y = Math.PI / 2;

                event.object.position.z = Room.zmax;

                break;
            case "back":
                event.object.position.x = Room.xmax;
                event.object.rotation.y = -Math.PI / 2;

                event.object.position.z = 0;

                break;
            default:
                console.error("no wall for Angle")
        }
        /*         Room.axis = Room.getAxisForWall(this.wall);
                const axis = Room.axis
                event.object.position[axis] = 10 * (Math.round(event.object.position[axis] / 10))//grid magnet 1cm
                event.object.position[axis] =
                    Math.max(Room[this.wall].min, Math.min(Room[this.wall].max, event.object.position[axis]))
                event.object.position[axis] = Room.collisionSolver(this); */

        // console.log("drag", Room[this.wall])
        // console.log("drag", event, event.object.position.x)
        MainScene.render();
    }

    dragEnd(event) {
        console.log("angle dragEnd", this)
        MainScene.orbitControls.enabled = true;
        /*         if (Angle.Dragged === this && Date.now() - Angle.Nowtime < Angle.selectClickBeforeDragDelay) {
                    select(this)
                } */
        store.dispatch(drag(null))
        Angle.Dragged = null
        if (Angle.Cross && Angle.Cross.parent) MainScene.scene.remove(Angle.Cross)

        MainScene.meubles.forEach(m => m.dragControls.enabled = true)// reactivation of others
    }
}

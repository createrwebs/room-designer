import {
    select,
    drag,
    Tools
}
    from '../api/actions'
import store from '../api/store';

import MainScene from './MainScene';
import Meuble from './Meuble'

import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { create as createCross } from './helpers/Cross';
import { Space, Room } from './Drag';

export default class Draggable extends Meuble {

    static switchWallThreshold = 250// mm de drag après un angle pour changer de mur
    static meubleMagnet = 100// magnetisme du meuble (mm)
    // static selectClickBeforeDragDelay = 250// delay (ms) before meuble drag start

    // from scene walls config or app current settings
    static WallConfig = Room;

    static MeublesOnWall = []// meubles wall arrays sorted 
    static Dragged// current target dragged
    static axis;// axis for current wall whare Draggable is dragged
    // static Nowtime;// timer for selection click

    static Cross = createCross(50)
    get position() {
        return this.object.position[Room.getAxisForWall(this.wall)];
    }

    constructor (props, object) {
        super(props, object)

        const dragControls = new DragControls([object], MainScene.camera, MainScene.renderer.domElement);
        dragControls.transformGroup = true;
        dragControls.addEventListener('drag', this.dragging.bind(this))
        dragControls.addEventListener('dragstart', this.dragStart.bind(this))
        dragControls.addEventListener('dragend', this.dragEnd.bind(this))
        // dragControls.addEventListener('hoveron', this.dragEnd.bind(this))
        // dragControls.addEventListener('hoveroff', this.dragEnd.bind(this))
        this.dragControls = dragControls;

        const tool = store.getState().tool;
        if (tool === Tools.HAMMER || tool === Tools.TRASH) {
            MainScene.interactionManager.add(this.object)
            this.dragControls.deactivate()
        } else if (tool === Tools.ARROW) {
            MainScene.interactionManager.remove(this.object)
            this.dragControls.activate()
        }
    }

    destroy() {
        this.dragControls.dispose()
    }
    dragStart(event) {
        console.log("dragStart", this)
        if (Draggable.Dragged) {//|| store.getState().tool != Tools.ARROW
            event.target.enabled = false;// deactivation of other Draggable
            return
        }
        Draggable.Dragged = this;

        MainScene.orbitControls.enabled = false;// deactivation of orbit controls while dragging

        Room.setWallsLength(store.getState().currentScene, store.getState().config)
        Room.setupWallConstraints(this)

        // Draggable.Nowtime = Date.now();
        Room.axis = Room.getAxisForWall(this.wall);
        Room.populateMeublesOnWalls(MainScene.meubles)
        Room.populateSpacesOnWalls(this)

        store.dispatch(drag(this))
        // store.dispatch(select(this))// selection

        if (Draggable.Cross && !Draggable.Cross.parent) MainScene.scene.add(Draggable.Cross)
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
        /*         if (Draggable.Dragged === this && Date.now() - Draggable.Nowtime < Draggable.selectClickBeforeDragDelay) {
                    return
                } */
        // const wallLength = Room[this.wall].length;
        const wallLength =
            (this.wall === "left" || this.wall === "right") ? Room.xmax : Room.zmax
        // console.log(this.wall);
        // console.log(event.object.position.x, event.object.position.z)
        Draggable.Cross.position.x = event.object.position.x
        Draggable.Cross.position.z = event.object.position.z
        const thresh = Draggable.switchWallThreshold
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
                break;
            case "left":
                event.object.position.z = Room.zmax;
                event.object.rotation.y = Math.PI;
                break;
            case "front":
                event.object.position.x = 0;
                event.object.rotation.y = Math.PI / 2;
                break;
            case "back":
                event.object.position.x = Room.xmax;
                event.object.rotation.y = -Math.PI / 2;
                break;
            default:
                console.error("no wall for draggable")
        }
        Room.axis = Room.getAxisForWall(this.wall);
        const axis = Room.axis
        event.object.position[axis] = 10 * (Math.round(event.object.position[axis] / 10))//grid magnet 1cm
        event.object.position[axis] =
            Math.max(Room[this.wall].min, Math.min(Room[this.wall].max, event.object.position[axis]))
        event.object.position[axis] = Room.collisionSolver(this);

        // console.log("drag", Room[this.wall])
        // console.log("drag", event, event.object.position.x)
        MainScene.render();
    }

    dragEnd(event) {
        console.log("dragEnd", this)
        MainScene.orbitControls.enabled = true;
        /*         if (Draggable.Dragged === this && Date.now() - Draggable.Nowtime < Draggable.selectClickBeforeDragDelay) {
                    select(this)
                } */
        store.dispatch(drag(null))
        Draggable.Dragged = null
        if (Draggable.Cross && Draggable.Cross.parent) MainScene.scene.remove(Draggable.Cross)

        MainScene.meubles.forEach(m => m.dragControls.enabled = true)// reactivation of others
    }
}

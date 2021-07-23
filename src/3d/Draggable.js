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
import { Measures } from './Utils'

export default class Draggable extends Meuble {

    static switchWallThreshold = 250// mm de drag après un angle pour changer de mur
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

    constructor(props, object, state, skuInfo) {
        super(props, object, state, skuInfo)

        const dragControls = new DragControls([object], MainScene.camera, MainScene.renderer.domElement);
        dragControls.transformGroup = true;
        dragControls.addEventListener('drag', this.dragging.bind(this))
        dragControls.addEventListener('dragstart', this.dragStart.bind(this))
        dragControls.addEventListener('dragend', this.dragEnd.bind(this))
        // dragControls.addEventListener('hoveron', this.dragEnd.bind(this))
        // dragControls.addEventListener('hoveroff', this.dragEnd.bind(this))
        this.dragControls = dragControls;

        /*

        new meuble :

        - set texture
        - enable tool

        */

        const tool = MainScene.tool;
        if (tool === Tools.HAMMER || tool === Tools.TRASH) {
            MainScene.interactionManager.add(this.object)
            this.dragControls.deactivate()
        } else if (tool === Tools.ARROW) {
            MainScene.interactionManager.remove(this.object)
            this.dragControls.activate()
        }
    }
    insideDrag(inside, stickTo, target) {
        // console.log("insideDrag", inside, stickTo, this.width)
        switch (this.skuInfo.type) {
            case "P40RL057":// TODO 1/4 turn range chaussure
                switch (stickTo) {
                    case "right":
                        if (target && target.skuInfo.PL != 62) return;
                        this.object.children.forEach(child => {
                            child.position.set(!inside ? 0 : 579, 0, 0)
                            child.rotation.set(0, !inside ? 0 : -Math.PI / 2, 0)
                        })
                        this.panneaux["right"].object.position.x = 579
                        this.panneaux["right"].object.position.y = 0;
                        this.panneaux["right"].object.position.z = 579
                        this.panneaux["left"].object.position.x = 579
                        this.panneaux["left"].object.position.y = 0
                        this.panneaux["left"].object.position.z = 0
                        break;
                    case "left":// 1/4 turn to right
                        if (target && target.skuInfo.PR != 62) return;
                        this.object.children.forEach(child => {
                            child.position.set(0, 0, !inside ? 0 : 579)
                            child.rotation.set(0, !inside ? 0 : Math.PI / 2, 0)
                        })
                        this.panneaux["right"].object.position.x = 0;
                        this.panneaux["right"].object.position.y = 0;
                        this.panneaux["right"].object.position.z = Measures.thick;
                        this.panneaux["left"].object.position.x = 0
                        this.panneaux["left"].object.position.y = 0
                        this.panneaux["left"].object.position.z = 579 + Measures.thick;
                        break;
                    default:
                        this.object.children.forEach(child => {
                            child.rotation.set(0, 0, 0)
                            child.position.set(Measures.thick, 0, 0)
                        })
                        this.panneaux["right"].object.position.x = this.skuInfo.L * 10
                        this.panneaux["right"].object.position.y = 0;
                        this.panneaux["right"].object.position.z = 0
                        this.panneaux["left"].object.position.x = 0
                        this.panneaux["left"].object.position.y = 0
                        this.panneaux["left"].object.position.z = 0;
                }
                break;
            default:
        }
    }
    destroy() {
        this.dragControls.dispose()
    }
    dragStart(event) {
        // console.log("dragStart", this, event)
        if (Draggable.Dragged) {//|| tool != Tools.ARROW
            event.target.enabled = false;// deactivation of other Draggable
            return
        }
        Draggable.Dragged = this;

        if (event.altKey) {
            console.debug("alt+click has just happened!");
            return;
        }

        MainScene.orbitControls.enabled = false;// deactivation of orbit controls while dragging

        Room.setWallsLength(MainScene.currentDressing, MainScene.config)
        Room.setupWallConstraints(this)

        // Draggable.Nowtime = Date.now();
        Room.axis = Room.getAxisForWall(this.wall);
        Room.populateMeublesOnWalls(MainScene.meubles)
        Room.populateSpacesOnWalls(this)

        this.width = this.getWidth()

        // action to reducer for display info :
        store.dispatch(drag(this))

        if (Draggable.Cross && !Draggable.Cross.parent) MainScene.scene.add(Draggable.Cross)
    }
    dragging(event) {
        // drag start delay to let selection click
        /*         if (Draggable.Dragged === this && Date.now() - Draggable.Nowtime < Draggable.selectClickBeforeDragDelay) {
                    return
                } */

        const wallLength = (this.wall === "left" || this.wall === "right") ? Room.xmax : Room.zmax
        Draggable.Cross.position.x = event.object.position.x
        Draggable.Cross.position.z = event.object.position.z
        const thresh = Draggable.switchWallThreshold
        Room.axis = Room.getAxisForWall(this.wall);

        //looking for change of destination
        const newWall = this.getWallChange(event.object.position.x, event.object.position.z, this.wall, thresh)
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
        event.object.position[axis] = Math.max(Room[this.wall].min, Math.min(Room[this.wall].max, event.object.position[axis]))
        event.object.position[axis] = Room.collisionSolver(this);

        MainScene.render();
    }

    dragEnd(event) {
        // console.log("dragEnd", this)
        MainScene.orbitControls.enabled = true;
        /*         if (Draggable.Dragged === this && Date.now() - Draggable.Nowtime < Draggable.selectClickBeforeDragDelay) {
                    select(this)
                } */
        store.dispatch(drag(null))
        Draggable.Dragged = null
        if (Draggable.Cross && Draggable.Cross.parent) MainScene.scene.remove(Draggable.Cross)

        MainScene.meubles.forEach(m => m.dragControls.enabled = true)// reactivation of others
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
}

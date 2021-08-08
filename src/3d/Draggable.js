import {
    select,
    drag,
    sceneChange,
    Tools
}
    from '../api/actions'
import store from '../api/store';

import MainScene from './MainScene';
import Meuble from './Meuble'

import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { create as createCross } from './helpers/Cross';
import { Space, Room, getWallChange, Walls, Corners } from './Drag';
import { Measures } from './Utils'

export default class Draggable extends Meuble {

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

    constructor (props, object, state, skuInfo) {
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
            case "P40RL057____":// TODO 1/4 turn range chaussure
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
                        if (this.panneaux) {
                            if (this.panneaux["right"] && this.panneaux["right"].object) {
                                this.panneaux["right"].object.position.x = this.skuInfo.L * 10
                                this.panneaux["right"].object.position.y = 0;
                                this.panneaux["right"].object.position.z = 0
                            }
                            if (this.panneaux["left"] && this.panneaux["left"].object) {
                                this.panneaux["left"].object.position.x = 0
                                this.panneaux["left"].object.position.y = 0
                                this.panneaux["left"].object.position.z = 0;
                            }
                        }
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

        if (!Object.values(Walls).includes(this.wall)) {// meuble in corner
        }
        // Room.axis = Room.getAxisForWall(this.wall);
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
        Room.axis = Room.getAxisForWall(this.wall);

        event.object.position.y = 0;

        //looking for change of destination
        const newWall = getWallChange(this.wall, event.object.position)

        if (this.wall != newWall) {
            console.warn(`Moving from ${this.wall} to ${newWall}`)

            // TODO is meuble ok to 1/4 turn in corner ?? => if not : newWall=this.wall !

            if (this.isOnAWall() && Object.values(Corners).includes(newWall)) {// from wall to corner
                this.addAngAB()
            }
            else if (!this.isOnAWall() && Object.values(Walls).includes(newWall)) {// from corner to wall
                this.removeAngAB()
            }
        }

        this.wall = newWall
        const widthInCorner = (this.skuInfo.L * 10 + (2 * Measures.thick)) * Math.cos(Math.PI / 4);

        // TODO corner occupied ?

        switch (this.wall) {
            case Walls.R:
                event.object.position.z = 0;
                event.object.rotation.y = 0;
                break;
            case Walls.L:
                event.object.position.z = Room.zmax;
                event.object.rotation.y = Math.PI;
                break;
            case Walls.F:
                event.object.position.x = 0;
                event.object.rotation.y = Math.PI / 2;
                break;
            case Walls.B:
                event.object.position.x = Room.xmax;
                event.object.rotation.y = -Math.PI / 2;
                break;
            case Corners.FR:
                event.object.position.x = 0;
                event.object.position.z = widthInCorner;
                event.object.rotation.y = Math.PI / 4;
                break;
            case Corners.RB:
                event.object.position.x = Room.xmax - widthInCorner;
                event.object.position.z = 0;
                event.object.rotation.y = -Math.PI / 4;
                break;
            case Corners.BL:
                event.object.position.x = Room.xmax
                event.object.position.z = Room.zmax - widthInCorner
                event.object.rotation.y = 5 * Math.PI / 4;
                break;
            case Corners.LF:
                event.object.position.x = widthInCorner;
                event.object.position.z = Room.zmax
                event.object.rotation.y = 3 * Math.PI / 4;
                break;
            default:
                console.error("no wall for draggable")
        }

        if (Object.values(Walls).includes(this.wall)) {// on a wall
            Room.axis = Room.getAxisForWall(this.wall);
            const axis = Room.axis
            event.object.position[axis] = 10 * (Math.round(event.object.position[axis] / 10))//grid magnet 1cm
            event.object.position[axis] = Math.max(Room[this.wall].min, Math.min(Room[this.wall].max, event.object.position[axis]))

            // console.log(">>>", axis, event.object.position)// object disappear because position NaN !
            event.object.position[axis] = Room.collisionSolver(this);
        }
        else if (Object.values(Corners).includes(this.wall)) {// on a corner

        }
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

        sceneChange()

        MainScene.meubles.forEach(m => {
            if (m.dragControls) m.dragControls.enabled = true
        })// reactivation of others
    }



}

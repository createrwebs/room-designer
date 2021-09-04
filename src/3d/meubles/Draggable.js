import {
    select,
    drag,
    sceneChange,
    Tools
}
    from '../../api/actions'
import store from '../../api/store';

import MainScene from '../MainScene';
import Meuble from './Meuble'

import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { create as createCross } from '../helpers/Cross';
import { draw, draw as drawSegments } from '../helpers/Segments';
import { Space, getWallChange } from '../Drag';
import { Walls, Corners, Sides } from '../Constants';
import Room from '../Room';

import { Measures } from '../Utils'

export default class Draggable extends Meuble {

    static Dragged// current target dragged
    static Segments// drag helper
    static Cross = createCross(50)// drag helper

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

        const tool = MainScene.tool;
        if (tool === Tools.HAMMER || tool === Tools.TRASH) {
            MainScene.interactionManager.add(this.object)
            this.dragControls.deactivate()
        } else if (tool === Tools.ARROW) {
            MainScene.interactionManager.remove(this.object)
            this.dragControls.activate()
        }
    }

    /* remove */

    remove() {
        super.remove()
        this.dragControls.dispose()
    }

    /* events */

    dragStart(event) {
        // console.log("dragStart", this, event)
        if (Draggable.Dragged) {//|| tool != Tools.ARROW
            event.target.enabled = false;// deactivation of other Draggable
            return
        }
        Draggable.Dragged = this;
        MainScene.orbitControls.enabled = false;// deactivation of orbit controls while dragging

        /* if (event.altKey) {
            console.debug("alt+click has just happened!");
            return;
        } */

        Room.setupWallConstraints(this.getWidth())

        if (!Object.values(Walls).includes(this.wall)) {// meuble in corner
        }
        Room.axis = Room.getAxisForWall(this.wall);
        Room.populateMeublesOnWalls(MainScene.meubles)
        Room.populateSpacesOnWalls(this, this.skuInfo)
        Room.populateMeublesOnCorners(MainScene.meubles, this)

        this.width = this.getWidth()

        // action to reducer for display info :
        store.dispatch(drag(this))

        Draggable.Segments = drawSegments()
        if (Draggable.Segments && !Draggable.Segments.parent) MainScene.scene.add(Draggable.Segments)
        if (Draggable.Cross && !Draggable.Cross.parent) MainScene.scene.add(Draggable.Cross)
    }
    dragging(event) {

        // cross dragging helper
        Draggable.Cross.position.x = event.object.position.x
        Draggable.Cross.position.z = event.object.position.z

        Room.axis = Room.getAxisForWall(this.wall);// no axis for corners !

        event.object.position.y = 0;// meuble stick to floor

        //looking for change of destination
        const newPlace = getWallChange(this.wall, event.object.position)

        if (this.wall != newPlace) {
            console.warn(`Moving from ${this.wall} to ${newPlace}`)

            if (this.isOnAWall()
                && this.skuInfo.angABSku
                && Object.values(Corners).includes(newPlace)
                && Room.isCornerFreeForMeuble(newPlace, this.skuInfo)
            ) {// from wall to corner
                this.addAngAB()
                this.wall = newPlace
            }
            else if (!this.isOnAWall() && Object.values(Walls).includes(newPlace)) {// from corner to wall
                this.removeAngAB()
                this.wall = newPlace
            }
            else if (Object.values(Walls).includes(newPlace)) {// from wall to wall
                this.removeAngAB()
                this.wall = newPlace
            }
        }

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
            case Corners.RB:
            case Corners.BL:
            case Corners.LF:
                this.sendToCorner(this.wall)
                break;
            default:
                console.error("no wall for Draggable")
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
        store.dispatch(drag(null))
        Draggable.Dragged = null
        if (Draggable.Cross && Draggable.Cross.parent) MainScene.scene.remove(Draggable.Cross)
        if (Draggable.Segments && Draggable.Segments.parent) MainScene.scene.remove(Draggable.Segments)
        MainScene.render()

        sceneChange()

        MainScene.meubles.forEach(m => {// reactivation of others
            if (m.dragControls) m.dragControls.enabled = true
        })
    }
}

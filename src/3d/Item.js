import {
    select,
    drag
}
    from '../api/actions'
import store from '../api/store';
import { LineBasicMaterial, Vector3, LineSegments, BufferGeometry } from "three";
import MainScene from './MainScene';
import Fbx from './Fbx'
import {
    load as loadMaterial,
    apply as applyMaterial,
    getMaterialById,
} from './Material'
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { parseSKU } from './Utils'

class Space {
    static onWall = []// right,back,left
    constructor(min, max, prev, next) {
        this.min = min;
        this.max = max;
        this.prev = prev;
        this.next = next;
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

export default class Item extends Fbx {

    static switchWallThreshold = 250// mm de drag après un angle pour changer de mur
    static selectClickBeforeDragDelay = 250// delay (ms) before meuble drag start

    static Dragged// current target dragged
    static axis;// axis for current wall where Item is dragged
    static Nowtime;// timer for selection click

    /* get position() {
        return this.object.position[Item.getAxisForWall(this.wall)];
    } */
    /*     set position(p) {
            switch (this.wall) {
                case "right":
                    this.object.position[Item.axis]=
                    break;
                case "left":
                    this.object.position[Item.axis]=
                    break;
                case "back":
                    this.object.position[Item.axis]=
                    break;
            }
        }   */
    constructor(props, object, state, parent) {
        super(props, object)

        this.parent = parent;// parent meuble
        this.place = "left"
        this.skuInfo = parseSKU(this.props.sku)
        // console.log('sku info', this.skuInfo)

        const trous = this.parent.props.plandepercage
        if (!trous || (trous && trous[this.place] && trous[this.place].length === 0)) {
            console.warn(`Accessoire ${this.props.sku} says : No plandepercage for Meuble ${this.parent.props.sku}`)
        }
        else {
            const dragControls = new DragControls([object], MainScene.camera, MainScene.renderer.domElement);
            dragControls.transformGroup = true;
            dragControls.addEventListener('drag', this.dragging.bind(this))
            dragControls.addEventListener('dragstart', this.dragStart.bind(this))
            dragControls.addEventListener('dragend', this.dragEnd.bind(this))
            this.dragControls = dragControls;
        }

        /* textures */

        if (MainScene.materialId) {
            const material = getMaterialById(MainScene.materialId)
            if (material) {
                loadMaterial(material.textures).then(m => {
                    console.log(`material loaded`, m)
                    applyMaterial(m, this)
                    MainScene.render()
                })
            }
        }
    }

    dragStart(event) {
        if (Item.Dragged) {
            event.target.enabled = false;// deactivation of other Item
            return
        }
        Item.Dragged = this;

        MainScene.orbitControls.enabled = false;// deactivation of orbit controls while dragging

        // Item.setWallConfig();
        // Item.setupWallConstraints(this)
        Item.Nowtime = Date.now();

        // store.dispatch(drag(this))
        // store.dispatch(select(this))// selection
    }
    // get closest value from x in array
    getClosest(x, array) {
        return array.reduce(function (prev, curr) {
            return (Math.abs(curr - x) < Math.abs(prev - x) ? curr : prev);
        });
    }
    dragging(event) {
        // drag start delay to let selection click
        if (Item.Dragged === this && Date.now() - Item.Nowtime < Item.selectClickBeforeDragDelay) {
            return
        }

        event.object.position.x = 0;
        event.object.position.z = 0;

        const position = event.object.position.y
        // const places = this.parent.props.plandepercage[this.place];
        const places = this.parent.places[this.place];
        let closest = this.getClosest(position, places)

        // from & to ne remplacent pas l'emcombrement !!

        if (this.props.from && this.props.to)
            closest = Math.min(this.props.to, Math.max(closest, this.props.from))
        event.object.position.y = closest

        console.log(event.object.position.y)
        MainScene.render();

    }

    dragEnd(event) {
        MainScene.orbitControls.enabled = true;
        if (Item.Dragged === this && Date.now() - Item.Nowtime < Item.selectClickBeforeDragDelay) {
            select(this)
        }
        store.dispatch(drag(null))
        Item.Dragged = null

        // MainScene.meubles.forEach(m => m.dragControls.enabled = true)// reactivation of others
    }

    getJSON() {
        return {
            sku: this.props.sku,
            position: {
                place: this.place,
                x: this.object.position.y
            },
        }
    }
}
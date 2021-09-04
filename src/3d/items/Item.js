import {
    drag,
    Tools
}
    from '../../api/actions'
import store from '../../api/store';
import MainScene from '../MainScene';
import Fbx from '../Fbx'
import {
    load as loadMaterial,
    apply as applyMaterial,
    getMaterialById,
    getId as getMaterialId,
} from '../Material'
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { Measures, getSize } from '../Utils'
import { getClosestInArray } from '../Drag'
import { Slots } from '../Constants'
import ItemDragging from './ItemDragging';
import { Box3, Vector3 } from "three";

export default class Item extends Fbx {

    static Dragged// current target dragged
    static axis;// axis for current wall where Item is dragged

    constructor (props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo)

        this.parent = parent;// parent meuble
        this.place = (state && state.position && state.position.place) ? state.position.place : Slots.L
        this.positionY = (state && state.position && state.position.x) ? state.position.x : null

        const trous = this.parent.places
        if (!trous) {//|| (trous && trous[this.place] && trous[this.place].length === 0)) {
            console.warn(`Accessoire ${this.props.sku} says : No percage for parent Meuble ${this.parent.props.sku}`)
        }

        this.dragControls = undefined
        if (skuInfo.draggable) {

            // ItemDragging.add(object)

            /*             const dragControls = new DragControls([object], MainScene.camera, MainScene.renderer.domElement);
                        dragControls.transformGroup = true;
                        dragControls.addEventListener('drag', this.dragging.bind(this))
                        dragControls.addEventListener('dragstart', this.dragStart.bind(this))
                        dragControls.addEventListener('dragend', this.dragEnd.bind(this))
                        this.dragControls = dragControls; */
        }

        this.width = getSize(this.object, "x")
        this.height = getSize(this.object, "y")
        this.depth = getSize(this.object, "z")
        // console.log(`Item ${this.skuInfo.type} ${this.props.sku}`, this.width, this.height, this.depth, state, this.parent, this)

        this.setTexture()
    }
    setTexture() {
        const material = getMaterialById(getMaterialId())
        if (material) {
            loadMaterial(material.textures).then(m => {
                // console.log(`material loaded`, m, this)
                applyMaterial(m, this)
                MainScene.render()
            })
        }
    }
    remove() {
        // if (this.dragControls) this.dragControls.dispose()
        ItemDragging.remove(this.object)
        MainScene.interactionManager.remove(this.object)

        // what about places ?
        if (this.parent.places) {
            let places = this.parent.places[this.place]
            if (this.skuInfo.occupyPlace && this.positionY && places.includes(this.positionY)) {
                places.push(this.positionY)
            }
        }
    }

    /* position */

    checkCollision() {
        this.box = new Box3().setFromObject(this.object);
        var collide = this.parent.items.filter(i => i != this)
            .filter(i => i.skuInfo.type != "ANGAB")
            .find(i => {
                console.log(i)
                if (!i.box) i.box = new Box3().setFromObject(i.object);
                return this.box.intersectsBox(new Box3().setFromObject(i.object))
            })

        if (collide) {
            // console.log("collide", collide)
            // this.object.position.y = this.positionY = this.lastY
            this.setPositionX(this.lastPosition.x)
            this.setPositionY(this.lastPosition.y)
            this.setPositionZ(this.lastPosition.z)
        }
    }
    setPosition(x, y, z) {
        this.lastPosition = new Vector3().copy(this.object.position)
        this.setPositionX(x)
        this.setPositionY(y)
        this.setPositionZ(z)
        // console.log(x, y, z)

        this.checkCollision()
        this.box = new Box3().setFromObject(this.object);
    }
    setPositionX(x) {

        // TODO 
        // when slot changes, filter positions Y like in setPositionY(y)
        // x => y !


        const slots = this.parent.skuInfo.slots && this.parent.skuInfo.slots.length > 1 ? this.parent.skuInfo.slots.length : 1

        // set x from this.place info
        if (!x) {
            x = this.place == Slots.R ? this.parent.skuInfo.slots[2]
                : this.place == Slots.C ? this.parent.skuInfo.slots[1]
                    : 0
        }
        if (slots > 1) {
            if (slots > 2 && x >= this.parent.skuInfo.slots[2]) {
                this.object.position.x = this.parent.skuInfo.slots[2]
                this.place = Slots.R
            } else if (x >= this.parent.skuInfo.slots[1]) {
                this.object.position.x = this.parent.skuInfo.slots[1]
                this.place = Slots.C
            } else {
                this.object.position.x = 0
                this.place = Slots.L
            }
            this.object.position.x += Measures.thick;
        } else {
            this.object.position.x = Measures.thick;
        }
    }
    setPositionY(y) {

        // dragging Item | from saved dressing | by user click

        let places = this.parent.places[this.place]
        // console.log("setPositionY", this.positionY, y, places, this.place)
        if (places.length == 0) {
            console.warn(`no slot available for ${this.props.sku}`)
            // this.parent.removeItem(this)
            this.object.position.y = this.positionY - Measures.thick / 2
            return
        }
        if (this.positionY && !places.includes(this.positionY)) {
            places.push(this.positionY)
        }
        const position = y ? y : 0
        const closest = getClosestInArray(position, places)
        if (y) {
            if (closest != this.positionY) {
                if (this.positionY && !places.includes(this.positionY)) {
                    places.push(this.positionY)
                }
                this.positionY = closest
            }
        }
        else {// new Item by user click
            this.positionY = closest
        }
        if (this.skuInfo.occupyPlace) {
            places = places.filter(function (item) {
                return item !== closest
            })
        }
        else {

        }
        this.object.position.y = this.positionY - Measures.thick / 2
        this.parent.places[this.place] = places
        // console.log("---setPositionY", this.parent.places[this.place])
    }
    setPositionZ(z) {
        if (this.skuInfo.frontAlign && !this.parent.skuInfo.isCoulissante) {
            this.object.position.z = this.parent.depth - this.depth - 11//recul des etageres
        }
        else {
            this.object.position.z = this.parent.skuInfo.zback;
        }
    }

    /* events */

    click(interactiveEvent) {// deactivated => remove by dragging out
        // console.warn(`click Item ${this.props.sku}`, interactiveEvent)
        if (interactiveEvent) {
            // console.warn(`click equality`, interactiveEvent.target == this.object)
            interactiveEvent.stopPropagation()
        }
    }
    dragStart(event) {
        console.warn(`dragStart Item ${this.info()}`, event, this, Item.Dragged)
        if (Item.Dragged && Item.Dragged != this) {
            event.target.deactivate()// deactivation of other Draggable
            return
        }
        Item.Dragged = this;
        store.dispatch(drag(this))
        MainScene.orbitControls.enabled = false;// deactivation of orbit controls while dragging
    }
    dragging(event) {
        console.warn(`dragging Item ${this.info()}`, event, this == Item.Dragged)
        if (!Item.Dragged || Item.Dragged != this) {
            event.target.deactivate()
            return
        }
        // console.warn(`dragging Item ${this.info()}`, event)
        // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        // mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;        
        this.setPosition(event.object.position.x, event.object.position.y, event.object.position.z)
        MainScene.render();
    }
    dragEnd(event) {
        console.warn(`dragEnd Item ${this.info()}`, event, this, Item.Dragged)
        if (!Item.Dragged || Item.Dragged != this) {
            return
        }
        Item.Dragged = null
        store.dispatch(drag(null))
        this.parent.enableItemsDragging(true)// reactivation of drag controls of all
        MainScene.orbitControls.enabled = true;
    }

    /* info */

    getJSON() {
        return {
            sku: this.props.sku,
            laqueOnMeshes: this.getLaqueOnMeshesJson(),
            position: {
                place: this.place,
                x: Math.round(this.positionY ? this.positionY : this.object.position.y)
            },
        }
    }
}
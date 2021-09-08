import MainScene from '../MainScene';
import Fbx from '../Fbx'
import {
    load as loadMaterial,
    apply as applyMaterial,
    getMaterialById,
    getId as getMaterialId,
} from '../Material'
import { Measures, getSize } from '../Utils'
import { getClosestInArray } from '../Drag'
import { Slots } from '../Constants'
import ItemDragging from './ItemDragging';
import { Box3, Vector3 } from "three";
import { KinoEvent, goingToKino } from '../../api/Bridge'
import { Errors } from '../../api/Errors'

export default class Item extends Fbx {

    constructor (props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo)
        this.parent = parent;
        this.slot = (state && state.position && state.position.slot) ? state.position.slot : Slots.L
        // this.positionX = (state && state.position && state.position.x) ? state.position.x : null
        // this.positionY = (state && state.position && state.position.y) ? state.position.y : null

        this.width = getSize(this.object, "x")
        this.height = getSize(this.object, "y")
        this.depth = getSize(this.object, "z")
        // console.log(`Item ${this.skuInfo.type} ${this.props.sku}`, state)

        this.loadAndApplyMaterial()
    }
    loadAndApplyMaterial() {
        const material = getMaterialById(getMaterialId())
        if (material) {
            loadMaterial(material.textures).then(m => {
                // console.log(`material loaded`, m, this)
                applyMaterial(m, this)
                this.setLaques(this.state)
                MainScene.render()
            })
        }
    }
    remove() {
        ItemDragging.remove(this.object)
        MainScene.interactionManager.remove(this.object)

        // add new available hole in places list
        if (this.parent.places) {
            let places = this.parent.places[this.slot]
            if (this.skuInfo.useHole && this.positionY
                && this.parent.skuInfo.trous.includes(this.positionY)
                && !places.includes(this.positionY)) {
                places.push(this.positionY)
            }
        }
    }

    /* positioning */

    getBox() {
        return new Box3().setFromObject(this.object)
    }
    startDrag() {
    }
    checkCollision(box) {
        return this.parent.items.filter(i => i != this)
            .filter(i => i.skuInfo.type != "ANGAB")
            .find(i => {
                // console.log(i)
                // if (!i.box) i.box = new Box3().setFromObject(i.object);
                // console.log(this.box, i.box, this.box.intersectsBox(i.box))
                return box.intersectsBox(new Box3().setFromObject(i.object))
            })
    }
    returnToLastPosition(box, collide) {
        const intersectionBox = box.intersect(new Box3().setFromObject(collide.object))
        // console.log("collide", collide, intersectionBox, intersectionBox.max.y - intersectionBox.min.y)

        // 2mm inside wood
        if (intersectionBox.max.y - intersectionBox.min.y > 2) {
            this.setPositionX(this.lastPosition.x)
            this.setPositionY(this.lastPosition.y)
            this.setPositionZ(this.lastPosition.z)
        }
    }
    drag(x, y, z) {

        this.lastPosition = new Vector3().copy(this.object.position)
        if (this.skuInfo.draggableX)
            this.setPositionX(x)
        if (this.skuInfo.draggableY)
            this.setPositionY(y)
        // this.setPositionZ(z)

        const collide = this.checkCollision(new Box3().setFromObject(this.object))
        if (collide) {
            this.returnToLastPosition(new Box3().setFromObject(this.object), collide)
        }
        this.box = new Box3().setFromObject(this.object);
    }
    setPosition(x, y, z) {
        this.setPositionX(x)
        this.setPositionY(y)
        this.setPositionZ(z)
    }
    setPositionX(x) {

        // TODO 
        // when slot changes, filter positions Y like in setPositionY(y)
        // x => y !


        const slots = this.parent.skuInfo.slots && this.parent.skuInfo.slots.length > 1 ? this.parent.skuInfo.slots.length : 1

        // set x from this.slot info
        if (!x) {
            x = this.slot == Slots.R ? this.parent.skuInfo.slots[2]
                : this.slot == Slots.C ? this.parent.skuInfo.slots[1]
                    : 0
        }
        if (slots > 1) {
            if (slots > 2 && x >= this.parent.skuInfo.slots[2]) {
                this.object.position.x = this.parent.skuInfo.slots[2]
                this.slot = Slots.R
            } else if (x >= this.parent.skuInfo.slots[1]) {
                this.object.position.x = this.parent.skuInfo.slots[1]
                this.slot = Slots.C
            } else {
                this.object.position.x = 0
                this.slot = Slots.L
            }
            this.object.position.x += Measures.thick;
        } else {
            this.object.position.x = Measures.thick;
        }
        this.positionX = this.object.position.x
    }
    /*
        only for new item, using Holes
    */
    findFreePlaceInSlot(slot) {
        return 200
    }
    setPositionY(y) {// dragging Item | from saved dressing | by user click
        this.positionY = this.object.position.y
    }
    setPositionZ(z) {
        if (this.skuInfo.frontAlign && !this.parent.skuInfo.isCoulissante) {
            this.object.position.z = this.parent.depth - this.depth - 11//recul des etageres
        }
        else {
            this.object.position.z = this.parent.skuInfo.zback;
        }
    }

    /* info */

    getJSON() {
        return {
            sku: this.props.sku,
            laqueOnMeshes: this.getLaqueOnMeshesJson(),
            position: {
                slot: this.slot,
                x: Math.round(this.positionX ? this.positionX : this.object.position.x),
                y: Math.round(this.positionY ? this.positionY : this.object.position.y)
            },
        }
    }
}
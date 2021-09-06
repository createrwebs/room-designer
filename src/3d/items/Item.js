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

export default class Item extends Fbx {

    constructor (props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo)
        this.parent = parent;
        this.place = (state && state.position && state.position.place) ? state.position.place : Slots.L
        this.positionY = (state && state.position && state.position.x) ? state.position.x : null

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
        ItemDragging.remove(this.object)
        MainScene.interactionManager.remove(this.object)

        // add new available hole in places list
        if (this.parent.places) {
            let places = this.parent.places[this.place]
            if (this.skuInfo.useHole && this.positionY
                && this.parent.skuInfo.trous.includes(this.positionY)
                && !places.includes(this.positionY)) {
                places.push(this.positionY)
            }
        }
    }

    /* positioning */
    computeAvailableHoles() {
        let places = this.parent.skuInfo.trous
        this.parent.items.filter(i => i.skuInfo.useHole).forEach(i => {
            places = places.filter(p => p !== i.positionY)
        });
        places = places.sort((a, b) => a - b)
        // console.log(">>>>", places)
    }
    startDrag() {
        if (this.skuInfo.useHole) {
            this.computeAvailableHoles()
        }
    }
    checkCollision() {
        // console.log("checkCollision")
        this.box = new Box3().setFromObject(this.object);
        var collide = this.parent.items.filter(i => i != this)
            .filter(i => i.skuInfo.type != "ANGAB")
            .find(i => {
                // console.log(i)
                if (!i.box) i.box = new Box3().setFromObject(i.object);
                // console.log(this.box, i.box, this.box.intersectsBox(i.box))
                return this.box.intersectsBox(new Box3().setFromObject(i.object))
            })

        if (collide) {
            const intersectionBox = this.box.intersect(new Box3().setFromObject(collide.object))
            // console.log("collide", collide, intersectionBox, intersectionBox.max.y - intersectionBox.min.y)

            // 2mm inside wood
            if (intersectionBox.max.y - intersectionBox.min.y > 2) {
                this.setPositionX(this.lastPosition.x)
                this.setPositionY(this.lastPosition.y)
                this.setPositionZ(this.lastPosition.z)
            }
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

        if (this.skuInfo.useHole) {
            let places = this.parent.places[this.place]
            // console.log("/placesY", this.parent.skuInfo.trous)
            // console.log("|placesY", places)

            if (!places) {
                console.warn(`no slot available for ${this.props.sku} in ${this.place} slot of ${this.parent.props.sku}`)
                // this.parent.removeItem(this)
                this.object.position.y = this.positionY - Measures.thick / 2
                return
            }
            if (places.length == 0) {
                console.warn(`no place available for ${this.props.sku} in ${this.place} slot of ${this.parent.props.sku}`)
                // this.parent.removeItem(this)
                this.object.position.y = this.positionY - Measures.thick / 2
                return
            }

            // add new available hole in places list
            if (this.positionY
                && this.parent.skuInfo.trous.includes(this.positionY)
                && !places.includes(this.positionY)) {
                places.push(this.positionY)
            }

            const position = y ? y : 0
            const closest = getClosestInArray(position, places)
            this.positionY = closest

            this.object.position.y = this.positionY - Measures.thick / 2

            // remove new occupied hole in places list
            this.parent.places[this.place] = places.filter(p => p !== this.positionY).sort((a, b) => a - b)

            // console.log("---setPositionY", this.positionY, position, closest)
        }
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
                place: this.place,
                x: Math.round(this.positionY ? this.positionY : this.object.position.y)
            },
        }
    }
}
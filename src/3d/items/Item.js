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
} from '../Material'
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { Measures, getSize } from '../Utils'
import { getClosestInArray, Slots } from '../Drag'

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

        if (skuInfo.draggable) {
            const dragControls = new DragControls([object], MainScene.camera, MainScene.renderer.domElement);
            dragControls.transformGroup = true;
            dragControls.addEventListener('drag', this.dragging.bind(this))
            dragControls.addEventListener('dragstart', this.dragStart.bind(this))
            dragControls.addEventListener('dragend', this.dragEnd.bind(this))
            this.dragControls = dragControls;

            // if (MainScene.tool === Tools.HAMMER) this.dragControls.activate()
            // else this.dragControls.deactivate()
        }

        this.width = getSize(this.object, "x")
        this.height = getSize(this.object, "y")
        this.depth = getSize(this.object, "z")
        // console.log(`Item ${this.skuInfo.type} ${this.props.sku}`, this.width, this.height, this.depth, state, this.parent, this)

        /* textures */

        if (MainScene.materialId) {
            const material = getMaterialById(MainScene.materialId)
            if (material) {
                loadMaterial(material.textures).then(m => {
                    // console.log(`material loaded`, m)
                    applyMaterial(m, this)
                    MainScene.render()
                })
            }
        }
    }

    /* position */

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
        places = places.filter(function (item) {
            return item !== closest
        })
        this.object.position.y = this.positionY - Measures.thick / 2
        this.parent.places[this.place] = places
        // console.log("---setPositionY", this.parent.places[this.place])
    }
    setPositionZ(z) {
        if (this.skuInfo.frontAlign) {
            this.object.position.z = this.parent.depth - this.depth - 11//recul des etageres
        }
        else {
            this.object.position.z = 0;
        }
    }

    /* events */

    click(interactiveEvent) {// deactivated => remove by dragging out
        // console.warn(`click Item ${this.props.sku}`, interactiveEvent)
        interactiveEvent.stopPropagation()
    }
    dragStart(event) {
        // console.warn(`dragStart Item ${this.info()}`, event, this, Item.Dragged)

        if (Item.Dragged && Item.Dragged != this) {
            return event.target.deactivate()// deactivation of drag controls of others
        }
        Item.Dragged = this;
        store.dispatch(drag(this))
        MainScene.orbitControls.enabled = false;// deactivation of orbit controls while dragging
    }
    dragging(event) {
        if (Item.Dragged != this) {
            return
        }
        // console.warn(`dragging Item ${this.info()}`, event)
        // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        // mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;        
        this.setPosition(event.object.position.x, event.object.position.y, event.object.position.z)
        MainScene.render();
    }
    dragEnd(event) {
        Item.Dragged = null
        store.dispatch(drag(null))
        this.parent.enableItemsDragging(true)// reactivation of drag controls of all
        MainScene.orbitControls.enabled = true;
    }

    /* info */

    info() {
        return `${this.object.uuid.substring(0, 8)} | ${this.props.sku}`
    }
    getJSON() {
        return {
            sku: this.props.sku,
            laqueOnMeshes: this.getLaqueOnMeshesJson(),
            position: {
                place: this.place,
                x: this.positionY ? this.positionY : this.object.position.y
            },
        }
    }
}
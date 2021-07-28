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
import { getClosestInArray } from '../Drag'

export default class Item extends Fbx {

    static switchWallThreshold = 250// mm de drag après un angle pour changer de mur
    static selectClickBeforeDragDelay = 250// delay (ms) before meuble drag start

    static Dragged// current target dragged
    static axis;// axis for current wall where Item is dragged
    static Nowtime;// timer for selection click

    constructor(props, object, state, skuInfo, parent) {
        super(props, object, state, skuInfo)

        this.parent = parent;// parent meuble
        this.place = "left"
        this.positionY = null

        const trous = this.parent.places
        if (!trous || (trous && trous[this.place] && trous[this.place].length === 0)) {
            console.warn(`Accessoire ${this.props.sku} says : No percage for Meuble ${this.parent.props.sku}`)
        }
        else {
            const dragControls = new DragControls([object], MainScene.camera, MainScene.renderer.domElement);
            dragControls.transformGroup = true;
            dragControls.addEventListener('drag', this.dragging.bind(this))
            dragControls.addEventListener('dragstart', this.dragStart.bind(this))
            dragControls.addEventListener('dragend', this.dragEnd.bind(this))
            this.dragControls = dragControls;

            if (MainScene.tool === Tools.HAMMER) this.dragControls.activate()
            else this.dragControls.deactivate()
        }

        this.width = getSize(this.object, "x")
        this.height = getSize(this.object, "y")
        this.depth = getSize(this.object, "z")
        console.log(`Item ${this.skuInfo.type} ${this.props.sku}`, this.width, this.height, this.depth, this.parent)

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
        this.object.position.x = x ? x : Measures.thick;// TODO state.position.place
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
    info() {
        return `${this.props.sku}`
    }
    select() {
        console.warn(`select Item ${this.info()}`, this)
    }
    deselect() {
        console.warn(`deselect Item ${this.info()}`, this)
    }

    /*dragging */

    dragStart(event) {
        // console.warn(`dragStart Item ${this.info()}`, Item.Dragged)
        if (Item.Dragged) {
            event.target.enabled = false;// deactivation of other Item
            return
        }
        Item.Dragged = this;
        store.dispatch(drag(this))
        MainScene.orbitControls.enabled = false;// deactivation of orbit controls while dragging
        Item.Nowtime = Date.now();
    }
    dragging(event) {
        // console.warn(`dragging Item ${this.info()}`, Item.Dragged)
        // drag start delay to let selection click
        if (Item.Dragged === this && Date.now() - Item.Nowtime < Item.selectClickBeforeDragDelay) {
            return
        }
        this.setPosition(null, event.object.position.y, null)
        MainScene.render();
    }
    dragEnd(event) {
        MainScene.orbitControls.enabled = true;
        if (Item.Dragged === this && Date.now() - Item.Nowtime < Item.selectClickBeforeDragDelay) {
            // select(this)
        }
        store.dispatch(drag(null))
        Item.Dragged = null
    }

    /*
        info
    */

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
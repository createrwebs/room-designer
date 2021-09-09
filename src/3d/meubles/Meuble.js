import {
    select,
    sceneChange,
}
    from '../../api/actions'
import { KinoEvent, goingToKino } from '../../api/Bridge'
import { Errors } from '../../api/Errors'
import { getProps } from '../../api/Catalogue'

import MainScene from '../MainScene';
import Fbx from '../Fbx'
import { Measures, getSize } from '../Utils'
import { parseSKU, trousTIR } from '../Sku'
import { Walls, Corners, Sides, Slots } from '../Constants';
import Room from '../Room';
import { loadFbx } from '../Loader'
import {
    load as loadMaterial,
    apply as applyMaterial,
    getMaterialById,
    setVisible,
    setTransparent,
    getId as getMaterialId,
} from '../Material'
import { Vector3 } from "three";
import { Space } from "../Space";
import { getSegment, segmentIntersect } from '../Utils'
import { drawInMeuble } from '../helpers/Segments';

// Controls
// import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
// import { Interaction } from 'three.interaction';

import { create as createRuler } from '../helpers/Ruler';
import { localhost } from '../../api/Utils';

import ItemDragging from '../items/ItemDragging';
import Item from '../items/Item'
import Porte from '../items/Porte'
import Etagere from '../items/Etagere'
import Tiroir from '../items/Tiroir'
import Blot from '../items/Blot'
import RangeChaussure from '../items/RangeChaussure'
import Chassis from '../items/Chassis'
import BC from '../items/BC'
import AngAB from '../items/AngAB'
import RangePull from '../items/RangePull'
import SeparateurV from '../items/SeparateurV'
import Penrab from '../items/Penrab'
import ANGETAP from '../items/ANGETAP'
import ANGETAL from '../items/ANGETAL'
import ANGTIR from '../items/ANGTIR'

export default class Meuble extends Fbx {
    constructor (props, object, state, skuInfo) {
        super(props, object, state, skuInfo)
        // console.log('Meuble', props, object, state, skuInfo)

        this.items = []

        // encombrements

        this.hasAngABLeft = false;
        this.hasAngABRight = false;
        this.angABPanes = []


        //or get real-time info parsing items ?
        this.hasLight = false

        if (skuInfo.trous) {
            this.places = {}// clonage des plans de perçage
            this.places.left = skuInfo.trous.slice();
            this.places.center = skuInfo.trous.slice();
            this.places.right = skuInfo.trous.slice();
        }
        this.trousTIR = trousTIR.slice();

        this.wall = state.position.wall;

        /* apply props transforms to all subobjects : no
        choice :
        add Measures.thick to all fbx objects if panneau left !!!
        */

        this.positionAllChildren()

        /* add sub objects */

        if (state && state.items)
            state.items
                .filter(i => i.sku.indexOf("ANGAB") == -1)// angab auto-added later, with panels
                .forEach(i => {
                    this.addItemBySku(i.sku, i)
                })

        /* panneaux */

        if (!this.skuInfo.hasSides) {
            this.panneaux = []
            const pL = getProps(this.getPanneauName(Sides.L))
            const pR = getProps(this.getPanneauName(Sides.R))
            loadFbx(pL.fbx.url, this.panneauLoaded.bind(this, pL, Sides.L))
            loadFbx(pR.fbx.url, this.panneauLoaded.bind(this, pR, Sides.R))
            // loadFbx(pS.fbx.url, this.panneauLoaded.bind(this, pS, "separateur"))
        }

        /* textures */

        this.loadAndApplyMaterial()

        // get dimensions after transforms

        this.width = getSize(this.object, "x")// store width for performance collision
        this.height = getSize(this.object, "y")
        this.depth = getSize(this.object, "z")

        /* ruler (modifies box size) */

        this.setupRuler();

        this.setPosition(state.position);

        // log meuble to console
        console.log(`Meuble ${this.skuInfo.type} ${this.props.ID} ${this.props.sku} of width ${this.width}mm on ${state.position.wall} wall at ${state.position.x}mm`, this.getSlots())

        const front = this.getFrontPosition()
        const roof = Room.getRoofPosition()
        const center = this.getCenterPoint()
        if (!localhost) {
            MainScene.camera.position.set(front.x, front.y, front.z)
            MainScene.orbitControls.target = center
        }
        else {
            MainScene.camera.position.set(roof.x, roof.y, roof.z)
            MainScene.orbitControls.target = new Vector3(roof.x, 0, roof.z)
        }

        MainScene.orbitControls.update();
        // const front = this.getFrontPosition()
        // const center = this.getCenterPoint()
        // cameraTo(front, center, 800)

        MainScene.render();
    }

    /* Measures.thick correction for panneau convenience */

    positionAllChildren() {
        this.object.children.forEach(child => {
            // child.rotation.set(props.rotateX * Math.PI / 180, props.rotateY * Math.PI / 180, props.rotateZ * Math.PI / 180)
            if (!this.skuInfo.hasSides) {
                child.position.set(Measures.thick, 0, 0)
            }
        })
    }

    /* ruler for hammer tool */

    setupRuler() {
        if (this.ruler) this.object.remove(this.ruler);
        const rulerWidth = this.width + (this.skuInfo.hasSides ? 0 : 2 * Measures.thick)
        this.ruler = createRuler(this.props.sku, rulerWidth, this.height)
        this.ruler.position.z = this.depth + 24// avancement ruler
    }

    /* material */

    applyMaterialOnMeuble(mtl) {
        this.removeLaqueOnMeshes()
        applyMaterial(mtl, this)
        this.items.forEach(item => {
            item.removeLaqueOnMeshes()
            // applyMaterial(mtl, item)
        })
        if (this.panneaux && this.panneaux[Sides.R]) applyMaterial(mtl, this.panneaux[Sides.R])
        if (this.panneaux && this.panneaux[Sides.L]) applyMaterial(mtl, this.panneaux[Sides.L])
    }
    loadAndApplyMaterial() {
        const material = getMaterialById(getMaterialId())
        if (material) {
            loadMaterial(material.textures).then(mtl => {
                // console.log(`material loaded`, mtl)
                // applyMaterial(m, this)
                this.applyMaterialOnMeuble(mtl)
                MainScene.render()
            })
        }
    }

    /* click & select */

    enableItemsDragging(enabled) {
        this.items.forEach(i => {
            if (i.skuInfo.draggableX || i.skuInfo.draggableY) {
                if (enabled) {
                    ItemDragging.add(i.object)
                }
                else {
                    ItemDragging.remove(i.object)
                }
            }
        })
    }
    enableClick(enabled) {
        if (enabled) {
            MainScene.interactionManager.add(this.object)
            if (!this.object._listeners || !this.object._listeners.click)//only 1 entry
                this.object.addEventListener('click', this.click.bind(this))
        } else {
            MainScene.interactionManager.remove(this.object)
            this.object.removeEventListener('click', this.click.bind(this))
        }
    }
    click(interactiveEvent) {
        // console.warn(`click Meuble ${this.info()}`)
        if (interactiveEvent) {
            // console.warn(`click equality`, interactiveEvent.target == this.object)
            interactiveEvent.stopPropagation()
        }
        select(this, interactiveEvent)// actions select, NOT this.select() !!

        /*         if (interactiveEvent.target != this.object) {
        
                }
                else {
        
                } */
    }

    showFacades(show) {
        if (!show) {
            setTransparent(this, .25, ["porte", "mirror", "miroir", "poignee", "laquable"])// portes deja presentes
            // setVisible(this, false, ["porte", "mirror", "miroir", "poignee", "laquable"])// portes deja presentes
            this.items.filter(i => i.skuInfo.isPorte || i.skuInfo.isTiroir)
                .forEach(p => {
                    setTransparent(p, .25, ["porte", "miroir", "mirror", "poignee", "laquable"])
                    // setVisible(p, false, ["porte", "mirror", "miroir", "poignee", "laquable"])// portes deja presentes
                });
        }
        else {
            setTransparent(this, 1, ["porte", "mirror", "miroir", "poignee", "laquable"])// portes deja presentes
            // setVisible(this, true, ["porte", "mirror", "miroir", "poignee", "laquable"])// portes deja presentes
            this.items.filter(i => i.skuInfo.isPorte || i.skuInfo.isTiroir)
                .forEach(p => {
                    setTransparent(p, 1, ["porte", "mirror", "miroir", "poignee", "laquable"])
                    // setVisible(p, true, ["porte", "mirror", "miroir", "poignee", "laquable"])// portes deja presentes
                });
        }
    }
    select() {
        if (this.ruler) this.object.add(this.ruler);
        this.showFacades(false)
        this.enableItemsDragging(true) // activate items drag controls
        MainScene.render();
        // console.warn(`select Meuble ${this.info()}`, this)
    }
    deselect() {
        if (this.ruler)
            this.object.remove(this.ruler);
        this.showFacades(true)
        this.enableItemsDragging(false)
        MainScene.render();
        // console.warn(`deselect Meuble ${this.info()}`)// bug
    }
    isOnAWall() {
        return Object.values(Walls).includes(this.wall)
    }

    /* slots */

    getSlots() {
        return [Slots.L, Slots.C, Slots.R].filter((e, n) => this.skuInfo.slots ? n < this.skuInfo.slots.length : n == 0)
    }

    // add new available hole in places list
    addNewHoleInPlace(slot, item) {
        if (this.places) {
            let places = this.places[slot]
            if (places && item.skuInfo.useHole && item.positionY
                && this.skuInfo.trous.includes(item.positionY)
                && !places.includes(item.positionY)) {
                places.push(item.positionY)
            }
        }
    }

    /* items */

    removeItem(item, event) {
        // console.warn(`removeIem ${item.skuInfo}`, event)
        if (event) event.stopPropagation()
        item.remove()
        this.items = this.items.filter(i => item !== i)
        this.object.remove(item.object);
        console.warn(`removeIem ${item.skuInfo}`, item, this)
        MainScene.render()
        sceneChange()
    }

    addItemBySku(sku, state) {
        const props = getProps(sku)
        if (!props) {
            console.warn(`No accessoire found for sku ${sku}`)
            return false
        }
        const skuInfo = parseSKU(sku)
        this.addItem(props, state, skuInfo)
    }
    addItem(props, state, skuInfo) {

        // portes number
        if (skuInfo.isPorte) {
            const portes = this.items.filter(i => i.skuInfo.isPorte)
            if (this.skuInfo.has2Doors && portes.length >= 2) {
                return goingToKino(KinoEvent.SEND_MESSAGE, Errors.TOO_MANY_DOORS, `Trop de portes pour ce meuble`)
            }
            if (!this.skuInfo.has2Doors && portes.length >= 1) {
                return goingToKino(KinoEvent.SEND_MESSAGE, Errors.TOO_MANY_DOORS, `Trop de portes pour ce meuble`)
            }

            const tiroir = this.items.find(i => i.skuInfo.isTiroir)
            if (tiroir && tiroir.skuInfo.type.substr(3, 4) !== skuInfo.type.substr(3, 4)) {// "-","2","4"
                return goingToKino(KinoEvent.SEND_MESSAGE, Errors.BAD_DOOR_FOR_DRAWER, `Porte non compatible avec le tiroir`)
            }
        }

        // drawers number
        if (skuInfo.isTiroir) {
            const slots = this.skuInfo.slots && this.skuInfo.slots.length > 1 ? this.skuInfo.slots.length : 1
            const tiroirs = this.items.filter(i => i.skuInfo.isTiroir)
            if (slots <= tiroirs.length) {
                return goingToKino(KinoEvent.SEND_MESSAGE, Errors.TOO_MANY_DRAWERS, `Trop de tiroirs pour ce meuble`)
            }

            const porte = this.items.find(i => i.skuInfo.isPorte)
            if (porte && porte.skuInfo.type.substr(3, 4) !== skuInfo.type.substr(3, 4)) {
                return goingToKino(KinoEvent.SEND_MESSAGE, Errors.BAD_DRAWER_FOR_DOOR, `Tiroir non compatible avec la porte`)
            }
        }

        // accessoires compatible ? (triangles and panes not in compatibles)
        if (this.props.accessoirescompatibles.indexOf(props.sku) === -1
            && skuInfo.type !== "ANGAB"
            && props.sku !== this.skuInfo.paneSku[Sides.R]// for panes of AngAB
            && props.sku !== this.skuInfo.paneSku[Sides.L]// for panes of AngAB
        ) {
            return goingToKino(KinoEvent.SEND_MESSAGE, Errors.ITEM_NON_COMPATIBLE, `${props.sku} non compatible avec ${this.props.sku} sélectionné`)
        }

        // light already on top
        if (this.hasLight && ["BC77000", "BC78000"].includes(props.sku)) {
            return goingToKino(KinoEvent.SEND_MESSAGE, Errors.TOO_MANY_LIGHTS, `Trop de lampes sur le meuble`)
        }

        goingToKino(KinoEvent.LOADING_MEUBLE, props.sku)
        loadFbx(props.fbx.url, this.itemLoaded.bind(this, props, state, skuInfo))
    }
    itemLoaded(props, state, skuInfo, object) {

        let item;
        if (skuInfo.isEtagere) {
            if (skuInfo.type === "ANGETAP") {
                item = new ANGETAP(props, object, state, skuInfo, this)
            }
            else if (skuInfo.type === "ANGETAL") {
                item = new ANGETAL(props, object, state, skuInfo, this)
            } else item = new Etagere(props, object, state, skuInfo, this)
        }
        else if (skuInfo.isChassis) {
            item = new Chassis(props, object, state, skuInfo, this)
        }
        else if (skuInfo.type.substr(0, 2) === "RP") {
            item = new RangePull(props, object, state, skuInfo, this)
        }
        else if (skuInfo.isPorte) {
            item = new Porte(props, object, state, skuInfo, this)
        }
        else if (skuInfo.isTiroir) {
            item = new Tiroir(props, object, state, skuInfo, this)
        }
        else if (skuInfo.isBlot) {
            item = new Blot(props, object, state, skuInfo, this)
        }
        else if (skuInfo.type === "RGCH") {
            item = new RangeChaussure(props, object, state, skuInfo, this)
        }
        else if (skuInfo.type === "BC" || skuInfo.type === "TABREP") {
            item = new BC(props, object, state, skuInfo, this)
        }
        else if (skuInfo.type === "ANGAB") {
            item = new AngAB(props, object, state, skuInfo, this)
        }
        else if (skuInfo.type === "SEPV") {
            item = new SeparateurV(props, object, state, skuInfo, this)
        }
        else if (skuInfo.type === "PENRAB") {
            item = new Penrab(props, object, state, skuInfo, this)
        }
        else if (skuInfo.type === "ANGTIR") {
            item = new ANGTIR(props, object, state, skuInfo, this)
        }
        else {
            item = new Item(props, object, state, skuInfo, this)
        }

        this.object.add(item.object);
        this.items.push(item)
        if (skuInfo.draggableX || skuInfo.draggableY) ItemDragging.add(item.object)

        const isNewItem = !(state && state.position) && !skuInfo.isModule && skuInfo.type != "ANGAB" && !skuInfo.isPorte
        if (isNewItem) {

            /* this.populateSpacesForItem(item, Slots.L)
            if (this.ruler.getObjectByName("dragItemHelper"))
                this.ruler.remove(this.ruler.getObjectByName("dragItemHelper"))
            this.dragItemHelper = drawInMeuble(this.getUid())
            this.dragItemHelper.name = "dragItemHelper"
            if (this.dragItemHelper) {
                this.ruler.add(this.dragItemHelper);
            } */
            console.log(item.slot)
            let place
            const slot = this.getSlots()
                .filter(slot => item.forceSlot ? slot == item.forceSlot : true)
                .find(slot => {
                    item.slot = slot
                    item.setPositionX() // first, move item to slot
                    place = item.findFreePlaceInSlot(slot)
                    // console.log("Found place in slot:", slot, place)
                    return typeof place !== "string"
                })
            console.log("found slot place", place, slot)
            if (slot && place) {
                state = {
                    position: {
                        // slot: slot
                        y: place
                    }
                }
            }
            else {
                console.log("no place found", slot, place)
                return this.removeItem(item)
            }
        }
        // console.log("------------", item.slot, state, state && state.position ? state.position.y : null)

        item.setPosition(
            state && state.position ? state.position.x : null,
            state && state.position ? state.position.y : null,
            null)

        if (state && state.callback) state.callback(item)// for positionning positionPaneForAngAB

        MainScene.render()
        sceneChange()
    }

    /*
        generate array of Spaces available for item
    */
    populateSpacesForItem(item, slot = Slots.L) {
        const axis = "y"
        let lastItem = null;
        // find boundaries {min,max} for item in meuble :
        const segmentY = item.getSegmentY()
        const limits = { min: Math.max(segmentY.min, this.getBottom()), max: Math.min(segmentY.max, this.getTop()) }
        let lastPos = limits.min
        let segment;
        // console.log(this.getUid())
        Space.onWall[this.getUid()] = []
        let spaces = Space.onWall[this.getUid()] = []
        // console.log(spaces)
        this.items.filter(i => i != item)
            .filter(i => i.slot == slot)
            .filter(i => i.skuInfo.type != "ANGAB")
            .sort((m1, m2) => m1.object.position[axis] - m2.object.position[axis])
            .forEach(i => {
                segment = getSegment(i.object, axis)
                // tentative de limiter le segmentY :
                /*                 if (segment.min > limits.max) {
                                    lastItem = i;
                                    lastPos = segment.max;
                                    return
                                } */
                if (segment.min - lastPos >= item.height) {
                    spaces.push(new Space(lastPos, segment.min, lastItem, i))
                }
                // console.warn(segment, segment.max - segment.min)
                lastItem = i;
                lastPos = segment.max;
            })
        if (limits.max - (segment ? segment.max : 0) >= item.height) {
            spaces.push(new Space((segment ? segment.max : lastPos), limits.max, lastItem, null))
        }
        // console.warn(segmentY, limits, spaces)
        return spaces
    }
    /* angab */

    positionPaneForAngAB(side, item) {
        // console.log("positionPaneForAngAB", item, side)
        const PDX = ((side === Sides.L ? Measures.thick : 0) + this.skuInfo.p) * Math.sin(Math.PI / 4)
        const PDZ = ((side === Sides.L ? 2 * Measures.thick : 0) + this.skuInfo.p) * (1 - Math.cos(Math.PI / 4))
        item.object.position.y = 0
        item.object.position.z = PDZ
        if (side === Sides.L) {
            item.object.rotation.y = Math.PI / 4
            item.object.position.x = -PDX
        }
        if (side === Sides.R) {
            item.object.rotation.y = -Math.PI / 4
            item.object.position.x = this.skuInfo.l + 2 * Measures.thick + PDX
        }
        this.angABPanes[side] = item// for removal
    }
    addAngAB(side) {
        if (this.skuInfo.angABSku) {
            if ((!side || side == Sides.L) && !this.hasAngABLeft) {
                this.addItemBySku(this.skuInfo.angABSku[Sides.L])
                this.addItemBySku(this.getPanneauName(Sides.L), { callback: this.positionPaneForAngAB.bind(this, Sides.L) })
                this.hasAngABLeft = true
            }
            if ((!side || side == Sides.R) && !this.hasAngABRight) {
                this.addItemBySku(this.skuInfo.angABSku[Sides.R])
                this.addItemBySku(this.getPanneauName(Sides.R), { callback: this.positionPaneForAngAB.bind(this, Sides.R) })
                this.hasAngABRight = true
            }
        }
    }
    removeAngAB() {
        if (this.skuInfo.angABSku) {
            this.items.filter(i => Object.values(this.skuInfo.angABSku).includes(i.props.sku)).forEach(i => this.removeItem(i))
            if (this.angABPanes[Sides.L]) this.removeItem(this.angABPanes[Sides.L])
            if (this.angABPanes[Sides.R]) this.removeItem(this.angABPanes[Sides.R])
            this.hasAngABLeft = false
            this.hasAngABRight = false
        }
    }

    /* panneaux */

    getPanneauName(where) {
        switch (where) {
            case Sides.R:
                return `NYH${this.skuInfo.H}P${this.skuInfo.PR}FD`
            case Sides.L:
                return `NYH${this.skuInfo.H}P${this.skuInfo.PL}FG`
            /*             case "separateur":
                            return `NYH${this.skuInfo.H}P${this.skuInfo.P}SE` */ // false
        }
    }
    panneauLoaded(props, where, object) {
        const panneau = new Fbx(props, object)
        this.panneaux[where] = panneau
        switch (where) {
            case Sides.L:
                panneau.object.name = "panneauLeft";
                panneau.object.position.x = 0//- Measures.thick
                panneau.object.position.y = 0
                panneau.object.position.z = 0
                this.object.add(panneau.object);
                if (!this.isOnAWall() && this.skuInfo.angABSku && !this.hasAngABLeft) {// angab to be loaded after panneaux
                    this.addAngAB(Sides.L)
                }
                break;
            case Sides.R:
                panneau.object.name = "panneauRight";
                panneau.object.position.x = this.skuInfo.l + Measures.thick;
                panneau.object.position.y = 0;
                panneau.object.position.z = 0;
                this.object.add(panneau.object);
                if (!this.isOnAWall() && this.skuInfo.angABSku && !this.hasAngABRight) {// angab to be loaded after panneaux
                    this.addAngAB(Sides.R)
                }
                break;
            /*             case "separateur":
                            panneau.object.name = "panneauSeparateur";
                            panneau.object.position.y = 0
                            panneau.object.position.z = 0
                            break; */
        }
        this.loadAndApplyMaterial()//surcharge
        MainScene.render()
        sceneChange()
    }

    getBottom(slot = Slots.L, but) {
        const tiroir = this.items.find(i => i.skuInfo.isTiroir)
        return this.skuInfo.ymin + (tiroir ? tiroir.height : 0)

        /*         const sortedItems = this.items
                    .filter(i => i != but)
                    .filter(i => i.place == slot)
                    .filter(i => i.skuInfo.isTiroir || i.skuInfo.isBlot)
                    .sort((a, b) => b.getBox().max.y - a.getBox().max.y)
        
                console.log(sortedItems)
                return sortedItems && sortedItems.length > 0 ? sortedItems[0].getBox().max.y : this.skuInfo.ymin */
    }
    getTop() {
        return this.skuInfo.ymax ? this.skuInfo.ymax : this.skuInfo.H * 10 - Measures.thick
    }
    getWidth() {
        if (Object.values(Walls).includes(this.wall)) {// on a wall
            return getSize(this.object, Room.getAxisForWall(this.wall))
        }
        else if (Object.values(Corners).includes(this.wall)) {// on a corner
            return (this.skuInfo.l + (2 * Measures.thick)) * Math.cos(Math.PI / 4);
        }
    }

    /*
        only from scene loading !?
    */
    setPosition(position) {
        // console.log("setPosition",position, MainScene);
        switch (position.wall) {
            case Walls.R:
                this.object.rotation.y = 0;// natural wall for fbx
                this.object.position.x = position.x;
                this.object.position.y = 0;
                this.object.position.z = 0;
                break;
            case Walls.F:
                this.object.rotation.y = Math.PI / 2;
                // this.object.rotateY(Math.PI / 2);
                this.object.position.x = 0;
                this.object.position.y = 0;
                this.object.position.z = position.x// + this.width;
                break;
            case Walls.L:
                this.object.rotation.y = -Math.PI;
                // this.object.rotateY(Math.PI);
                this.object.position.x = position.x;
                this.object.position.y = 0;
                this.object.position.z = Room.zmax;
                break;
            case Walls.B:
                this.object.rotation.y = -Math.PI / 2;
                // this.object.rotateY(Math.PI);
                this.object.position.x = Room.xmax;
                this.object.position.y = 0;
                this.object.position.z = position.x;
                break;
            case Corners.FR:
            case Corners.RB:
            case Corners.BL:
            case Corners.LF:
                this.sendToCorner(position.wall)
                break;
        }
    }
    sendToCorner(corner) {
        const L1 = (this.skuInfo.l + (2 * Measures.thick)) * Math.cos(Math.PI / 4)
        const L2 = this.skuInfo.p * (1 - Math.cos(Math.PI / 4))
        switch (corner) {
            case Corners.FR:
                this.object.position.x = L2;
                this.object.position.z = L1 + L2;
                this.object.rotation.y = Math.PI / 4;
                break;
            case Corners.RB:
                this.object.position.x = Room.xmax - L1 - L2;
                this.object.position.z = L2;
                this.object.rotation.y = -Math.PI / 4;
                break;
            case Corners.BL:
                this.object.position.x = Room.xmax - L2
                this.object.position.z = Room.zmax - L1 - L2
                this.object.rotation.y = 5 * Math.PI / 4;
                break;
            case Corners.LF:
                this.object.position.x = L1 + L2;
                this.object.position.z = Room.zmax - L2
                this.object.rotation.y = 3 * Math.PI / 4;
                break;
            default:
        }
    }

    /*
        info
    */

    getJSON() {
        const position = {
            wall: this.wall
        }
        if (!Object.values(Corners).includes(this.wall)) position.x = Math.round(this.position)
        const items = []
        this.items
            .filter(i => this.skuInfo.angABSku == undefined || !Object.values(this.skuInfo.angABSku).includes(i.props.sku))// remove ANGAB triangles
            .filter(i => !Object.values(this.angABPanes).includes(i))// remove ANGAB auto-added panels
            .forEach(i => {
                items.push(i.getJSON())
            })
        const meuble = {
            sku: this.props.sku,
            uid: this.getUid(),
            laqueOnMeshes: this.getLaqueOnMeshesJson(),
            position: position,
            items: items
        }
        return meuble
    }

    /* remove */

    remove() {
        Meuble.detach(this)
        MainScene.interactionManager.remove(this.object)
        this.object.removeEventListener('click', this.click.bind(this))

        this.items.forEach(i => {
            this.removeItem(i)
        })
    }

    /*
        meubles join
    */
    static Joins = []
    static attach(left, right) {
        if (!left || !right) return false
        const s = `${left.getUid()}-${right.getUid()}`
        if (!Meuble.Joins.includes(s)) {
            Meuble.Joins.push(s)
            return true
        }
        return false//already joined
    }
    static detach(meuble) {
        if (!meuble) return null
        Meuble.Joins = [...Meuble.Joins].filter(i => !i.includes(meuble.getUid()))
    }
    static isJoined(meuble) {// returns array [Sides.L,Sides.R] if joined
        return Meuble.Joins.filter(join => join.includes(meuble.getUid()))
            .map(join => join.indexOf(meuble.getUid()) === 0 ? Sides.R : Sides.L)
    }
}
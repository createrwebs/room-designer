import {
    select,
}
    from '../api/actions'

import MainScene from './MainScene';
import Fbx from './Fbx'
import { Measures, getSize } from './Utils'
import { parseSKU, trousTIR } from './Sku'
import { Room, Walls, Corners } from './Drag';
import { loadFbx } from './Loader'
import {
    load as loadMaterial,
    apply as applyMaterial,
    getMaterialById,
    setVisible,
    setTransparent
} from './Material'
import { Vector3 } from "three";

// Controls
// import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
// import { Interaction } from 'three.interaction';

import { create as createRuler } from './helpers/Ruler';
import { localhost } from '../api/Utils';

import Item from './items/Item'
import Porte from './items/Porte'
import Etagere from './items/Etagere'
import Tiroir from './items/Tiroir'
import Blot from './items/Blot'
import RangeChaussure from './items/RangeChaussure'
import Chassis from './items/Chassis'
import BC from './items/BC'
import AngAB from './items/AngAB'

export default class Meuble extends Fbx {
    constructor (props, object, state, skuInfo) {
        console.log('Meuble', props, object, state, skuInfo)
        super(props, object, state, skuInfo)
        this.uid = this.getUid()

        this.items = []

        if (skuInfo.trous) {
            this.places = {}// clonage des plans de perçage
            this.places.left = skuInfo.trous.slice();
            this.places.center = skuInfo.trous.slice();
            this.places.right = skuInfo.trous.slice();
        }
        this.trousTIR = trousTIR.slice();

        this.wall = state.position.wall;

        if (props.subGroups) {
            this.object.subGroups = props.subGroups;
        } else {
            this.object.subGroups = [];
        }

        /* apply props transforms to all subobjects : no
        choice :
        add Measures.thick to all fbx objects if panneau left !!!
        */

        this.positionAllChildren()

        /* add sub objects */

        if (state && state.items)
            state.items.forEach(i => {
                this.addItemBySku(i.sku, i)
            })

        if (localhost && true) {
            setTimeout(this.addItemTest.bind(this), 2000)
        }

        /* panneaux */

        if (!this.skuInfo.hasSides) {
            this.panneaux = []
            const pL = MainScene.catalogue.find(f => f.sku === this.getPanneauName("left"))
            const pR = MainScene.catalogue.find(f => f.sku === this.getPanneauName("right"))
            // const pS = MainScene.catalogue.find(f => f.sku === this.getPanneauName("separateur"))
            loadFbx(pL.fbx.url, this.panneauLoaded.bind(this, pL, "left"))
            loadFbx(pR.fbx.url, this.panneauLoaded.bind(this, pR, "right"))
            // loadFbx(pS.fbx.url, this.panneauLoaded.bind(this, pS, "separateur"))
        }

        /* textures */

        this.loadAndApplyMaterial()

        // get dimensions after transforms

        this.width = getSize(this.object, "x")// store width for performance collision
        this.height = getSize(this.object, "y")
        this.depth = getSize(this.object, "z")

        this.hasAngAB = false;

        /* ruler (modifies box size) */

        this.setupRuler();

        this.setPosition(state.position);

        // log meuble to console
        // console.log(`Meuble ${this.skuInfo.type} ${this.props.ID} ${this.props.sku} of width ${this.width}mm on ${state.position.wall} wall at ${state.position.x}mm`)
        console.log("accessoirescompatibles", this.props.accessoirescompatibles)

        // const front = this.getFrontPosition()
        // MainScene.camera.position.set(front.x, front.y, front.z)
        // MainScene.orbitControls.target = this.getCenterPoint()

        const roof = Room.getRoofPosition()
        MainScene.camera.position.set(roof.x, roof.y, roof.z)
        MainScene.orbitControls.target = new Vector3(roof.x, 0, roof.z)

        MainScene.orbitControls.update();
        // const front = this.getFrontPosition()
        // const center = this.getCenterPoint()
        // cameraTo(front, center, 800)

        MainScene.render();
    }

    /* localhost test */

    addItemTest() {
        switch (this.props.sku) {
            case "NYH219P62L040":
                // scene_bridge("add_meuble_to_scene", "NYETAP62L040")
                // this.addItemBySku("NYETAP62L040")
                // this.addItemBySku("NYETTP62L040")// collision solver bug
                // this.addItemBySku("NYETLP62L040")
                // this.addItemBySku("NYPPD-H219L40")
                this.addItemBySku("NYPVD2H219L40")
                break;
            case "NYH238P62L081":
                // this.addItemBySku("NYETTP62L081")
                // this.addItemBySku("NYETLP62L081")
                // this.addItemBySku("NYETAP62L081")
                break;
            case "NYH238P62L096":
                // this.addItemBySku("NYRP1P62L096")
                // this.addItemBySku("NYETLP62L096")
                // this.addItemBySku("NYETAP62L096")
                // this.addItemBySku("NYH238P62SE")
                // this.addItemBySku("NYH238P62FG")
                // this.addItemBySku("NYH238P62FD")
                break;
            case "NYH219P40L096":
                this.addItemBySku("NYETAP40L096")
                this.addItemBySku("NYH219P40SE")
                this.addItemBySku("NYH219P40FG")
                this.addItemBySku("NYH219P40FD")
                break;
            case "NYC231H238PP":
                this.addItemBySku("NYETTPCOL074")
                this.addItemBySku("NYETAPCOL074")
                break;
            case "NYC155H219PG":
                this.addItemBySku("NYETTPCOL074")
                this.addItemBySku("NYETTPCOL074")
                break;
            default:
        }
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
        const rulerWidth = this.width + (this.skuInfo.hasSides ? 0 : 2 * Measures.thick)
        this.ruler = createRuler(this.props.sku, rulerWidth, this.height)
        this.ruler.position.z = this.depth + 20
    }

    /* material */

    applyMaterialOnMeuble(mtl) {
        applyMaterial(mtl, this)
        this.items.forEach(item => {
            applyMaterial(mtl, item)
        })
        if (this.panneaux && this.panneaux["right"]) applyMaterial(mtl, this.panneaux["right"])
        if (this.panneaux && this.panneaux["left"]) applyMaterial(mtl, this.panneaux["left"])
    }
    loadAndApplyMaterial() {
        if (MainScene.materialId) {
            const material = getMaterialById(MainScene.materialId)
            if (material) {
                loadMaterial(material.textures).then(mtl => {
                    // console.log(`material loaded`, mtl)
                    // applyMaterial(m, this)
                    this.applyMaterialOnMeuble(mtl)
                    MainScene.render()
                })
            }
        }
    }

    /* click & select */

    enableItemsDragging(enabled) {
        // console.log("meuble.enableItemsDragging", enabled)
        this.items.forEach(i => {
            if (i.dragControls) {
                if (enabled) {
                    i.dragControls.activate()
                    if (!i.dragControls.enabled) {
                        console.info("CANNOT ACTIVATE ITEM DRAGGING", i, i.dragControls)// do activate(), not enabled = true
                        // i.dragControls.addEventListener('drag', i.dragging.bind(i))
                        // i.dragControls.addEventListener('dragstart', i.dragStart.bind(i))
                        // i.dragControls.addEventListener('dragend', i.dragEnd.bind(i))
                    }
                }
                else i.dragControls.deactivate()
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
        console.warn(`click Meuble ${this.info()}`, interactiveEvent.target == this.object)
        interactiveEvent.stopPropagation()
        select(this, interactiveEvent)// actions select, NOT this.select() !!

        if (interactiveEvent.target != this.object) {

        }
        else {

        }
    }
    info() {
        return `${this.props.sku} (L ${this.width / 10}cm H ${this.height / 10}cm P ${this.depth / 10}cm)`
    }
    select() {
        if (this.ruler) this.object.add(this.ruler);
        setVisible(this, false, ["porte", "mirror", "poignee"])
        this.items.filter(i => i.skuInfo.isPorte)
            .forEach(p => {
                setVisible(p, false, ["porte", "mirror", "poignee"])
            });
        this.enableItemsDragging(true) // activate items drag controls
        MainScene.render();
        console.warn(`select Meuble ${this.info()}`, this)
    }
    deselect() {
        if (this.ruler)
            this.object.remove(this.ruler);
        setVisible(this, true, ["porte", "mirror", "poignee"])
        this.items.filter(i => i.skuInfo.isPorte)
            .forEach(p => {
                setVisible(p, true, ["porte", "mirror", "poignee"])
            });
        this.enableItemsDragging(false)
        MainScene.render();
        console.warn(`deselect Meuble ${this.info()}`)
    }
    isOnAWall() {
        return Object.values(Walls).includes(this.wall)
    }

    /* items */

    removeItem(item) {// TODO function remove on Item to clean listeners !
        this.items = this.items.filter(i => item !== i)
        this.object.remove(item.object);
        MainScene.render()
    }

    //localhost helper (getState() forbidden to use when updating)
    addItemBySku(sku, state) {
        const props = MainScene.catalogue.find(f => f.sku === sku)
        const skuInfo = parseSKU(sku)
        if (!props) {
            console.warn(`No accessoire found for sku ${sku}`)
            return false
        }
        this.addItem(props, state, skuInfo)
    }
    addItem(props, state, skuInfo) {
        if (this.props.accessoirescompatibles.indexOf(props.sku) === -1
            && skuInfo.type !== "ANGAB"// triangles not in acccompatibles
        ) {
            console.warn(`${props.sku} non compatible avec ${this.props.sku} sélectionné`)
            return false
        }
        if (skuInfo.isTiroir && this.items.find(i => i.skuInfo.isTiroir)) {
            console.warn(`Already tiroir`)
            return false
        }
        loadFbx(props.fbx.url, this.itemLoaded.bind(this, props, state, skuInfo))
    }
    itemLoaded(props, state, skuInfo, object) {

        let item;
        if (skuInfo.isPorte) {
            item = new Porte(props, object, state, skuInfo, this)
        }
        else if (skuInfo.isEtagere) {
            item = new Etagere(props, object, state, skuInfo, this)
        }
        else if (skuInfo.isChassis) {
            item = new Chassis(props, object, state, skuInfo, this)
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
        else if (skuInfo.type === "BC") {
            item = new BC(props, object, state, skuInfo, this)
        }
        else if (skuInfo.type === "ANGAB") {
            item = new AngAB(props, object, state, skuInfo, this)
        }
        else {
            item = new Item(props, object, state, skuInfo, this)
        }

        item.setPosition(null, state && state.position ? state.position.x : null, null)// y=x yes it is
        // console.log(item)

        // TODO
        /*         this.items.filter(i => i !== item).forEach(i => {
                    segment = getSegment(i.object)
                    if (segment.min - lastPos >= meuble.width) {
                        Space.onWall[wall].push(new Space(lastPos, segment.min, lastMeuble, m))
                    }
                    lastMeuble = m;
                    lastPos = m.position;
                }) */

        this.items.push(item)
        this.object.add(item.object);
        MainScene.render()
    }

    /* angab */

    addAngAB() {
        if (this.skuInfo.angABSku && !this.hasAngAB) {
            this.addItemBySku(this.skuInfo.angABSku.left)
            // this.addItemBySku(this.skuInfo.angABSku.right)
            this.hasAngAB = true
        }
    }
    removeAngAB() {
        if (this.skuInfo.angABSku) {
            this.items.filter(i => Object.values(this.skuInfo.angABSku).includes(i.props.sku)).forEach(i => this.removeItem(i))
            this.hasAngAB = false
        }
    }

    /* panneaux */

    getPanneauName(where) {
        switch (where) {
            case "right":
                return `NYH${this.skuInfo.H}P${this.skuInfo.PR}FD`
            case "left":
                return `NYH${this.skuInfo.H}P${this.skuInfo.PL}FG`
            /*             case "separateur":
                            return `NYH${this.skuInfo.H}P${this.skuInfo.P}SE` */ // false
        }
    }
    panneauLoaded(props, where, object) {
        const panneau = new Fbx(props, object)
        this.panneaux[where] = panneau
        switch (where) {
            case "right":
                panneau.object.name = "panneauRight";
                panneau.object.position.x = this.skuInfo.L * 10 + Measures.thick;
                panneau.object.position.y = 0;
                panneau.object.position.z = 0;
                this.object.add(panneau.object);
                break;
            case "left":
                panneau.object.name = "panneauLeft";
                panneau.object.position.x = 0//- Measures.thick
                panneau.object.position.y = 0
                panneau.object.position.z = 0
                this.object.add(panneau.object);
                break;
            /*             case "separateur":
                            panneau.object.name = "panneauSeparateur";
                            panneau.object.position.y = 0
                            panneau.object.position.z = 0
                            break; */
        }
        this.loadAndApplyMaterial()//surcharge
        MainScene.render()
    }

    getWidth() {
        if (Object.values(Walls).includes(this.wall)) {// on a wall
            return getSize(this.object, Room.getAxisForWall(this.wall))
        }
        else if (Object.values(Corners).includes(this.wall)) {// on a corner
            return (this.skuInfo.L * 10 + (2 * Measures.thick)) * Math.cos(Math.PI / 4);
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
                this.object.position.z = position.x + this.width;
                break;
            case Walls.L:
                this.object.rotation.y = -Math.PI;
                // this.object.rotateY(Math.PI);
                this.object.position.x = position.x;
                this.object.position.y = 0;
                this.object.position.z = MainScene.zmax;
                break;
            case Walls.B:
                this.object.rotation.y = -Math.PI / 2;
                // this.object.rotateY(Math.PI);
                this.object.position.x = MainScene.xmax;
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
        const L1 = (this.skuInfo.L * 10 + (2 * Measures.thick)) * Math.cos(Math.PI / 4)
        const L2 = this.skuInfo.P * 10 * (1 - Math.cos(Math.PI / 4))
        switch (corner) {
            case Corners.FR:
                this.object.position.x = L2;
                this.object.position.z = L1 + L2;
                this.object.rotation.y = Math.PI / 4;
                break;
            case Corners.RB:
                this.object.position.x = Room.xmax - L1 + L2;
                this.object.position.z = L2;
                this.object.rotation.y = -Math.PI / 4;
                break;
            case Corners.BL:
                this.object.position.x = Room.xmax - L2
                this.object.position.z = Room.zmax - L1 + L2
                this.object.rotation.y = 5 * Math.PI / 4;
                break;
            case Corners.LF:
                this.object.position.x = L1 + L2;
                this.object.position.z = Room.zmax - L2
                this.object.rotation.y = 3 * Math.PI / 4;
                break;
            default:
        }
        if (!this.isOnAWall()) {// from wall to corner
            this.addAngAB()
        }
    }

    /*
        info
    */

    getUid() {
        return this.object.uuid.substring(0, 8)
    }
    getJSON() {
        const items = []
        this.items.forEach(i => {
            items.push(i.getJSON())
        })
        return {
            sku: this.props.sku,
            laqueOnMeshes: this.getLaqueOnMeshesJson(),
            position: {
                wall: this.wall,
                x: this.position
            },
            items: items
        }
    }

    /*
        meubles join
    */
    static Joins = []
    static attach(left, right) {
        if (!left || !right) return false
        const s = `${left.uid}-${right.uid}`
        if (!Meuble.Joins.includes(s)) {
            Meuble.Joins.push(s)
            return true
        }
        return false//already joined
    }
    static detach(meuble) {
        if (!meuble) return null
        Meuble.Joins = [...Meuble.Joins].filter(i => !i.includes(meuble.uid))
    }
    static isJoined(meuble) {// returns array ["left","right"] if joined
        return Meuble.Joins.filter(join => join.includes(meuble.uid))
            .map(join => join.indexOf(meuble.uid) === 0 ? "right" : "left")
    }
}
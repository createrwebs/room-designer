import {
    select,
}
    from '../api/actions'

import MainScene from './MainScene';
import Fbx from './Fbx'
import { getSize, parseSKU, Measures } from './Utils'
import { Room } from './Drag';
import { loadFbx } from './Loader'
import {
    loadOne as loadOneMaterial,
    load as loadMaterial,
    apply as applyMaterial,
    applyOnMesh,
    getMaterialById,
    getLaqueById
} from './Material'

// Controls
// import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
// import { Interaction } from 'three.interaction';

import { setTransparent } from './Material';
import Item from './Item'
import { create as createRuler } from './helpers/Ruler';
import { localhost } from '../api/Config';

export default class Meuble extends Fbx {
    constructor(props, object, state) {
        // console.log('Meuble', props, object, state)
        super(props, object)
        this.uid = object.uuid.substring(0, 8)

        this.items = []
        // this.laqueOnMeshes = (state && state.laqueOnMeshes) ? state.laqueOnMeshes : []

        // sku props :
        /*         this.ID = props.ID;
                this.accessoirescompatibles = props.accessoirescompatibles;
                this.description = props.description;
                this.plandepercage = props.plandepercage;
                this.sku = props.sku;
        
                this.profondeur = props.profondeur;
                this.largeur = props.largeur;
                this.hauteur = props.hauteur; */

        this.skuInfo = parseSKU(this.props.sku)
        // console.log('sku info', this.skuInfo)

        this.places = {}// clonage des plans de perçage
        if (props.plandepercage.gauche) this.places.left = props.plandepercage.gauche.slice();
        if (props.plandepercage.centre) this.places.center = props.plandepercage.centre.slice();
        if (props.plandepercage.droite) this.places.right = props.plandepercage.droite.slice();

        this.wall = state.position.wall;
        this.angle = props.angle;
        if (props.subGroups) {
            this.object.subGroups = props.subGroups;
        } else {
            this.object.subGroups = [];
        }

        /* apply props transforms to all subobjects
        fbx correction by props at construction => to all children 

        choice :
        add Measures.thick to all fbx objects if panneau left !!!
        */

        this.object.children.forEach(child => {
            child.rotation.set(props.rotateX * Math.PI / 180, props.rotateY * Math.PI / 180, props.rotateZ * Math.PI / 180)
            child.position.set(props.offsetX + Measures.thick, props.offsetY, props.offsetZ)
        })

        /* add sub objects */

        if (state && state.items)
            state.items.forEach(i => {
                this.addItemBySku(i.sku, i)
            })

        if (localhost && true) {
            switch (this.props.sku) {
                case "NYH219P62L040":
                    // scene_bridge("add_meuble_to_scene", "NYETAP62L040")
                    this.addItemBySku("NYETAP62L040")
                    this.addItemBySku("NYETTP62L040")
                    this.addItemBySku("NYETLP62L040")
                    break;
                case "NYH238P62L119":
                    this.addItemBySku("NYRP1P62L119")
                    this.addItemBySku("NYETAP62L119")
                    this.addItemBySku("NYH238P62SE")
                    this.addItemBySku("NYH238P62FG")
                    this.addItemBySku("NYH238P62FD")
                    break;
                case "NYH238P62L096":
                    this.addItemBySku("NYRP1P62L096")
                    this.addItemBySku("NYETLP62L096")
                    this.addItemBySku("NYETAP62L096")
                    this.addItemBySku("NYH238P62SE")
                    this.addItemBySku("NYH238P62FG")
                    this.addItemBySku("NYH238P62FD")
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
                default:
            }
        }

        /* textures */

        this.loadAndApplyMaterial()

        /* laques */

        this.laqueOnMeshes = []
        if (state && state.laqueOnMeshes) {
            state.laqueOnMeshes.forEach(l => {
                if (l.laque) {
                    this.laqueOnMeshes[l.mesh] = l.laque
                    const laq = getLaqueById(l.laque)
                    if (laq) {
                        loadOneMaterial(laq).then(m => {
                            applyOnMesh(m, this.object.getChildByName(l.mesh))
                            MainScene.render()
                        });
                    }
                    else {
                        console.warn(`No laque material found with id ${l.laque}`)
                    }
                } else {
                    console.warn(`No laque material id for ${l.mesh}`)
                }
            })
        }

        /* panneaux */

        this.panneaux = []
        const pL = MainScene.catalogue.find(f => f.sku === `NYH${this.skuInfo.H}P${this.skuInfo.P}FG`)
        const pR = MainScene.catalogue.find(f => f.sku === `NYH${this.skuInfo.H}P${this.skuInfo.P}FD`)
        const pS = MainScene.catalogue.find(f => f.sku === `NYH${this.skuInfo.H}P${this.skuInfo.P}SE`)
        loadFbx(pL.fbx.url, this.panneauLoaded.bind(this, pL, "left"))
        loadFbx(pR.fbx.url, this.panneauLoaded.bind(this, pR, "right"))
        loadFbx(pS.fbx.url, this.panneauLoaded.bind(this, pS, "separateur"))

        /* ruler (modifies box size) */

        this.ruler = createRuler(this.props.sku, this.props.largeur, this.props.hauteur)
        this.ruler.position.z = this.props.profondeur + 20

        // get dimensions after transforms

        this.width = this.getWidth()// store width for performance collision
        // this.height = getSize(this.object, "y")
        // this.depth = getSize(this.object, "z")


        // this.segment = this.getSegment(object)// store width for performance collision
        // this.dragControls = this.
        // this.setPosition(props.position);
        this.setPosition(state.position);

        // log meuble to console
        console.log(`Meuble ${this.skuInfo.type} ${this.props.ID} ${this.props.sku} of width ${this.width}mm on ${state.position.wall} wall at ${state.position.x}mm`)
        // console.log(`Meuble ${this.skuInfo.type} ${this.props.ID}`, props.plandepercage, props.accessoirescompatibles, props, object, state, this);

        const front = this.getFrontPosition()
        const center = this.getCenterPoint()
        MainScene.camera.position.set(front.x, front.y, front.z)
        MainScene.orbitControls.target = this.getCenterPoint()
        MainScene.orbitControls.update();
        // cameraTo(front, center, 800)

        MainScene.render();
    }

    /* material */

    applyMaterialOnMeuble(mtl) {
        applyMaterial(mtl, this)
        this.items.forEach(item => {
            applyMaterial(mtl, item)
        })
        if (this.panneaux["right"]) applyMaterial(mtl, this.panneaux["right"])
        if (this.panneaux["left"]) applyMaterial(mtl, this.panneaux["left"])
    }
    loadAndApplyMaterial() {
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
    clickLaquable(interactiveEvent) {

        // console.log("clickLaquable", interactiveEvent)
        interactiveEvent.stopPropagation()
        applyOnMesh(MainScene.laque, interactiveEvent.target)

        //memorize :
        this.laqueOnMeshes[interactiveEvent.target.name] = MainScene.laqueId
        // console.log("clickLaquable", this.laqueOnMeshes)

        MainScene.render()
    }

    /* cick&select */

    click(interactiveEvent) {
        select(this, interactiveEvent)
    }
    info() {
        return `${this.props.sku} (L ${this.props.largeur / 10}cm H ${this.props.hauteur / 10}cm P ${this.props.profondeur / 10}cm) ${this.width}`
    }
    select() {
        this.object.add(this.ruler);
        setTransparent(this, .5, ["porte"])
        MainScene.render();
    }
    deselect() {
        this.object.remove(this.ruler);
        setTransparent(this, 1, ["porte"])
        MainScene.render();
        console.warn(`deselect Meuble ${this.info()}`)
    }

    /* items */

    //localhost helper (getState() forbidden to use when updating)
    addItemBySku(sku, state) {
        const props = MainScene.catalogue.find(f => f.sku === sku)
        if (!props) {
            console.warn(`No accessoire found for sku ${sku}`)
        }
        else {
            this.addItem(props, state)
        }
    }
    addItem(props, state) {
        if (this.props.accessoirescompatibles.indexOf(props.sku) === -1) {
            console.warn(`${props.sku} non compatible avec ${this.props.sku} sélectionné`)
            return false
        }
        loadFbx(props.fbx.url, this.itemLoaded.bind(this, props, state))
    }
    itemLoaded(props, state, object) {
        const item = new Item(props, object, state, this)
        // console.log(item)

        // TODO
        // this.items
        // props.from 640
        // props.to 2000
        // const places = this.props.plandepercage['gauche'];
        // [64, 128, 192, 256, 320, 384, 448, 512, 576, 640, 704, 768, 832, 896, 960, 1024, 1088, 1152, 1216, 1280]

        /*         this.items.filter(i => i !== item).forEach(i => {
                    segment = getSegment(i.object)
                    if (segment.min - lastPos >= meuble.width) {
                        Space.onWall[wall].push(new Space(lastPos, segment.min, lastMeuble, m))
                    }
                    lastMeuble = m;
                    lastPos = m.position;
                }) */
        // this.places

        if (state) {// Item from saved dressing
            /* "position": {
                "place": "gauche",
                "x": "1303"
            } */
            item.object.position.x = 0;//state.position.place
            item.object.position.y = state.position.x
            item.object.position.z = 0;
        }
        else {// new Item by user click
            item.object.position.x = 0;
            // item.object.position.y = state.selection.props.plandepercage['gauche'][0];
            item.object.position.y = item.props.from
            item.object.position.z = 0;
        }
        this.items.push(item)
        this.object.add(item.object);
        MainScene.render()
    }

    /* panneaux */

    panneauLoaded(props, where, object) {
        const panneau = new Fbx(props, object)
        this.panneaux[where] = panneau
        switch (where) {
            case "right":
                panneau.object.position.x = this.skuInfo.L * 10 + Measures.thick;
                panneau.object.rotation.y = 0;
                panneau.object.position.z = 0;
                this.object.add(panneau.object);
                break;
            case "left":
                panneau.object.position.x = 0//- Measures.thick
                panneau.object.position.y = 0
                panneau.object.position.z = 0
                this.object.add(panneau.object);
                break;
            case "separateur":
                panneau.object.position.y = 0
                panneau.object.position.z = 0
                break;
        }
        MainScene.render()
    }

    getWidth() {
        return getSize(this.object, Room.getAxisForWall(this.wall))
    }

    setPosition(position) {
        const wallConfig = MainScene.config;
        switch (position.wall) {
            case "right":
                this.object.rotation.y = 0;// natural wall for fbx
                this.object.position.x = position.x;
                this.object.position.y = 0;
                this.object.position.z = 0;
                break;
            case "front":
                this.object.rotation.y = Math.PI / 2;
                // this.object.rotateY(Math.PI / 2);
                this.object.position.x = 0;
                this.object.position.y = 0;
                this.object.position.z = position.x + this.width;
                break;
            case "left":
                this.object.rotation.y = -Math.PI;
                // this.object.rotateY(Math.PI);
                this.object.position.x = position.x;
                this.object.position.y = 0;
                this.object.position.z = wallConfig.zmax;
                break;
            case "back":
                this.object.rotation.y = -Math.PI / 2;
                // this.object.rotateY(Math.PI);
                this.object.position.x = wallConfig.xmax;
                this.object.position.y = 0;
                this.object.position.z = position.x;
                break;
            case "right-back":
                this.object.position.x = 0;
                this.object.position.y = 0;
                this.object.position.z = 0;
                break;
            case "left-back":
                // this.object.rotateY(Math.PI / 2);
                this.object.position.x = 0;
                this.object.position.y = 0;
                this.object.position.z = wallConfig.zmax;
                break;
            default:
        }
    }
    getJSON() {
        const laqueOnMeshes = []

        console.log(this.laqueOnMeshes)
        Object.entries(this.laqueOnMeshes).forEach(
            ([mesh, laque]) => {
                console.log(mesh, laque)
                laqueOnMeshes.push({
                    mesh: mesh,
                    laque: laque
                })
            }
        )

        const items = []
        this.items.forEach(i => {
            items.push(i.getJSON())
        })
        return {
            sku: this.props.sku,
            laqueOnMeshes: laqueOnMeshes,
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
}
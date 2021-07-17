import {
    select,
    drag,
    Tools
}
    from '../api/actions'
import store from '../api/store';
import MainScene from './MainScene';
import Fbx from './Fbx'
import { getSize, parseSKU } from './Utils'
import { loadFbx } from './Loader'
import { applyOnMesh } from './Material'
import {
    Vector3, Mesh, BoxBufferGeometry
} from "three";
import { loadOne as loadOneMaterial, load as loadMaterial, apply as applyMaterial, getMaterialById, getLaqueById } from './Material'

// Controls
// import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
// import { Interaction } from 'three.interaction';

// miroir
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

import { setTransparent } from './Material';
import Item from './Item'
import { create as createRuler } from './helpers/Ruler';
import { localhost } from '../api/Config';

export default class Meuble extends Fbx {
    constructor (props, object, state) {
        console.log('Meuble', props, object, state)
        super(props, object)

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

        console.log('parseSKU', parseSKU(this.props.sku))


        this.ruler = createRuler(this.props.sku, this.props.largeur, this.props.hauteur)
        this.ruler.position.z = this.props.profondeur + 20

        this.places = {}// clonage des plans de perçage
        if (props.plandepercage.gauche) this.places.left = props.plandepercage.gauche.slice();
        if (props.plandepercage.centre) this.places.center = props.plandepercage.centre.slice();
        if (props.plandepercage.droite) this.places.right = props.plandepercage.droite.slice();

        this.wall = props.position.wall;
        this.angle = props.angle;
        if (props.subGroups) {
            this.object.subGroups = props.subGroups;
        } else {
            this.object.subGroups = [];
        }

        /* apply props transforms to all subobjects
        fbx correction by props at construction => to all children */

        this.object.children.forEach(child => {
            child.rotation.set(props.rotateX * Math.PI / 180, props.rotateY * Math.PI / 180, props.rotateZ * Math.PI / 180)
            child.position.set(props.offsetX, props.offsetY, props.offsetZ)
        })

        // get dimensions after transforms

        this.width = getSize(this.object, "x")// store width for performance collision
        this.height = getSize(this.object, "y")
        this.depth = getSize(this.object, "z")

        // this.segment = this.getSegment(object)// store width for performance collision
        // this.dragControls = this.
        this.setPosition(props.position);

        // log meuble to console

        console.log(`Meuble ${this.props.ID} ${this.props.sku} of width ${this.width}mm on ${props.position.wall} wall at ${props.position.x}mm`, props.plandepercage, props.accessoirescompatibles, props, object, state, this);

        /* panneaux lateraux */

        var e = 25;

        /* add dynamic panneaux lateraux */

        const geometry = new BoxBufferGeometry(e, this.height, this.depth);

        //geometry.computeBoundingSphere();
        // BufferGeometry error => je pense que tu ne peux faire le translate que quand il a été ajouté dans la scene
        //geometry.translate(e / 2, this.height / 2, this.depth / 2);
        //geometry.attributes.position = new BufferAttribute( newPos, 2 );
        //geometry.position.set( e / 2, this.height / 2, this.depth / 2 );

        this.panneauLeft = new Mesh(geometry)//, material_bords);
        this.panneauLeft.position.set(e / 2, this.height / 2, this.depth / 2);
        this.panneauLeft.name = "panneau_gauche";
        // this.panneauLeft.material = material_bords;
        if (this.panneauLeft.material) this.panneauLeft.material.needsUpdate = true;
        //this.panneauLeft.material.map.anisotropy = 16;
        this.panneauLeft.castShadow = true;
        this.panneauLeft.receiveShadow = true;

        this.panneauRight = new Mesh(geometry)//, material_bords);
        this.panneauRight.position.set(this.width - e / 2, this.height / 2, this.depth / 2);
        this.panneauRight.name = "panneau_droit";
        // this.panneauRight.material = material_bords;
        if (this.panneauRight.material) this.panneauRight.material.needsUpdate = true;
        //this.panneauRight.material.map.anisotropy = 16;
        this.panneauRight.castShadow = true;
        this.panneauRight.receiveShadow = true;

        this.object.add(this.panneauLeft);
        this.object.add(this.panneauRight);


        /* add sub objects */

        if (state && state.items)
            state.items.forEach(i => {
                this.addItemBySku(i.sku, i)
            })

        if (localhost && false) {
            switch (this.props.sku) {
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


        MainScene.render();
    }
    clickLaquable(interactiveEvent) {

        console.log("clickLaquable", interactiveEvent)
        interactiveEvent.stopPropagation()
        applyOnMesh(MainScene.laque, interactiveEvent.target)

        //memorize :
        this.laqueOnMeshes[interactiveEvent.target.name] = MainScene.laqueId
        console.log("clickLaquable", this.laqueOnMeshes)

        MainScene.render()
    }
    click(interactiveEvent) {
        select(this, interactiveEvent)
    }
    info() {
        return `${this.props.sku} (L ${this.props.largeur / 10}cm H ${this.props.hauteur / 10}cm P ${this.props.profondeur / 10}cm)`
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
        const props = store.getState().catalogue.find(f => f.sku === sku)
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
        console.log(item)

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
}
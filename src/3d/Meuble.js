import {
    select,
    drag,
    Tools
}
    from '../api/actions'
import store from '../api/store';
import MainScene from './MainScene';
import Fbx from './Fbx'
import { getWidth } from './Utils'
import { loadFbx } from './Loader'

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
    constructor (props, object) {
        // console.log('Meuble', props, object)
        super(props, object)
        this.items = []// accessoires

        // sku props :
        /*         this.ID = props.ID;
                this.accessoirescompatibles = props.accessoirescompatibles;
                this.description = props.description;
                this.plandepercage = props.plandepercage;
                this.sku = props.sku;
        
                this.profondeur = props.profondeur;
                this.largeur = props.largeur;
                this.hauteur = props.hauteur; */

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

        this.width = getWidth(this.object, "x")// store width for performance collision
        // this.segment = this.getSegment(object)// store width for performance collision
        // this.dragControls = this.
        this.setPosition(props.position);
        console.log(`Meuble ${this.props.ID} of width ${this.width}mm on ${props.position.wall} wall at ${props.position.x}mm`, props.plandepercage, props.accessoirescompatibles, props, object, this);


        this.object.addEventListener('click', this.click.bind(this))

        /* textures */

        /*         if (props.textures) loadTextures(object, props.textures).then(response => {
                    console.log(`textures loaded`, response)
        
                }) */

        /* panneaux lateraux */

        if (this.dim != {} && false) {

            var e = 25;

            /* add dynamic panneaux lateraux 

            const geometry = new THREE.BoxBufferGeometry(e, this.dim.H, this.dim.P);

            //geometry.computeBoundingSphere();
            // THREE.BufferGeometry error => je pense que tu ne peux faire le translate que quand il a été ajouté dans la scene
            //geometry.translate(e / 2, this.dim.H / 2, this.dim.P / 2);
            //geometry.attributes.position = new BufferAttribute( newPos, 2 );
            //geometry.position.set( e / 2, this.dim.H / 2, this.dim.P / 2 );

            this.panneauLeft = new THREE.Mesh(geometry, material_bords);
            this.panneauLeft.position.set(e / 2, this.dim.H / 2, this.dim.P / 2);
            this.panneauLeft.name = "bord_gauche_fab";
            this.panneauLeft.material = material_bords;
            if (this.panneauLeft.material) this.panneauLeft.material.needsUpdate = true;
            //this.panneauLeft.material.map.anisotropy = 16;
            this.panneauLeft.castShadow = true;
            this.panneauLeft.receiveShadow = true;

            this.panneauRight = new THREE.Mesh(geometry, material_bords);
            this.panneauRight.position.set(this.width - e / 2, this.dim.H / 2, this.dim.P / 2);
            this.panneauRight.name = "bord_droit_fab";
            this.panneauRight.material = material_bords;
            if (this.panneauRight.material) this.panneauRight.material.needsUpdate = true;
            //this.panneauRight.material.map.anisotropy = 16;
            this.panneauRight.castShadow = true;
            this.panneauRight.receiveShadow = true;

            this.object.add(this.panneauLeft);
            this.object.add(this.panneauRight);
            */
        }

        if (localhost) {
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
        MainScene.render();
    }
    click() {
        select(this)
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

    //localhost helper (getState() forbidden to use when updating)
    addItemBySku(sku) {
        const props = store.getState().catalogue.find(f => f.sku === sku)
        if (!props) {
            console.warn(`No accessoire found for sku ${sku}`)
        }
        else {
            this.addItem(props)
        }
    }
    addItem(props) {
        if (this.props.accessoirescompatibles.indexOf(props.sku) === -1) {
            console.warn(`${props.sku} non compatible avec ${this.props.sku} sélectionné`)
            return false
        }
        loadFbx(props.fbx.url, this.itemLoaded.bind(this, props))
    }
    itemLoaded(props, object) {
        const item = new Item(props, object, this)
        console.log(item)

        // TODO
        // this.items
        // props.from 640
        // props.to 2000
        // const places = this.props.plandepercage['gauche'];
        // [64, 128, 192, 256, 320, 384, 448, 512, 576, 640, 704, 768, 832, 896, 960, 1024, 1088, 1152, 1216, 1280]
        this.items.forEach(i => {

            // console.log("ssss ", i.object.position.y, this.places.left)
        })
        /*         this.items.filter(i => i !== item).forEach(i => {
                    segment = getSegment(i.object)
                    if (segment.min - lastPos >= meuble.width) {
                        Space.onWall[wall].push(new Space(lastPos, segment.min, lastMeuble, m))
                    }
                    lastMeuble = m;
                    lastPos = m.position;
                }) */
        // this.places

        item.object.position.x = 0;
        // item.object.position.y = state.selection.props.plandepercage['gauche'][0];
        item.object.position.y = item.props.from
        item.object.position.z = 0;


        this.items.push(item)
        this.object.add(item.object);
        MainScene.render()
    }


    setPosition(position) {
        const wallConfig = store.getState().config;
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
}
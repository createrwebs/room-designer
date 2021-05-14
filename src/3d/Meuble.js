import {
    select,
    drag
}
    from '../api/actions'
import store from '../api/store';
import * as THREE from "three";
import MainScene from './MainScene';
import Fbx from './Fbx'

// Controls
// import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
// import { Interaction } from 'three.interaction';
// import { TextureLoader } from 'src/loaders/TextureLoader.js';

// miroir
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

import { loadTextures, setTransparent } from './Texture';
import Item from './Item'
import { create as createRuler } from './Ruler';
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

        this.width = this.getWidth()// store width for performance collision
        // this.segment = this.getSegment(object)// store width for performance collision
        // this.dragControls = this.
        this.setPosition(props.position);
        console.log(`Meuble ${this.props.ID} of width ${this.width}mm on ${props.position.wall} wall at ${props.position.x}mm`, props.plandepercage, props.accessoirescompatibles, props, object, this);

        /* textures */

        if (props.textures) loadTextures(object, props.textures).then(response => {
            console.log(`textures loaded`, response)

        })

        /* panneaux lateraux */

        if (this.dim != {} && false) {

            var e = 25;
            //texture.repeat.set(1, 1);

            if (object.textures && object.textures.length > 1) {

                var text = object.textures[1].metas.texture.clone();
                text.needsUpdate = true;
                text.wrapS = text.wrapT = THREE.RepeatWrapping; //ClampToEdgeWrapping
                text.repeat.set(.5, 1);
                text.offset.set(0.5, 1);

                var material_bords_args = {
                    //color:0x0DC400,
                    emissive: 0x0D0D0D,
                    roughness: 0.45,
                    map: text,
                    bumpMap: text,
                    bumpScale: 1,
                    fog: false
                };
                var material_bords = new THREE.MeshStandardMaterial(material_bords_args);
                //material_bords.map.repeat.set(1, 1);
                material_bords.needsUpdate = true;
            }

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

    select() {
        this.object.add(this.ruler);
        setTransparent(this, .5, ["porte"])
        MainScene.render();
    }
    deselect() {
        this.object.remove(this.ruler);
        setTransparent(this, 1, ["porte"])
        MainScene.render();
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
        // MainScene.loader.load(`${props.fbx.url}`, this.itemLoaded.bind(this, props))
        MainScene.loadFbx(props.fbx.url, this.itemLoaded.bind(this, props))

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

            console.log("ssss ", i.object.position.y, this.places.left)
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

    /* real bounding box width, or props.largeur ? */
    getWidth() {
        var box = new THREE.Box3().setFromObject(this.object);
        return Math.round(box.max.x - box.min.x);
    }
    setPosition(position) {
        const wallConfig = store.getState().config.walls;
        switch (position.wall) {
            case "right":
                this.object.position.x = position.x;
                this.object.position.y = 0;
                this.object.position.z = 0;
                break;
            case "back":
                this.object.rotateY(Math.PI / 2);
                this.object.position.x = 0;
                this.object.position.y = 0;
                this.object.position.z = position.x + this.width;
                break;
            case "left":
                this.object.rotateY(Math.PI);
                this.object.position.x = position.x;
                this.object.position.y = 0;
                this.object.position.z = wallConfig.back;
                break;
            case "right-back":
                this.object.position.x = 0;
                this.object.position.y = 0;
                this.object.position.z = 0;
                break;
            case "left-back":
                this.object.rotateY(Math.PI / 2);
                this.object.position.x = 0;
                this.object.position.y = 0;
                this.object.position.z = wallConfig.back;
                break;
            default:
        }
    }
}
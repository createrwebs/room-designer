import {
    select,
    drag
}
    from '../api/actions'
import store from '../api/store';
import * as THREE from "three";
import MainScene from './MainScene';

// Controls
// import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
// import { Interaction } from 'three.interaction';
// import { TextureLoader } from 'src/loaders/TextureLoader.js';

// miroir
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

import { loadTextures } from './Texture';

export default class Meuble {
    constructor (props, object) {
        // console.log('Meuble', props, object)
        this.object = object;// threejs group mesh

        // sku props :
        /*         this.ID = props.ID;
                this.accessoirescompatibles = props.accessoirescompatibles;
                this.description = props.description;
                this.plandepercage = props.plandepercage;
                this.sku = props.sku;
        
                this.profondeur = props.profondeur;
                this.largeur = props.largeur;
                this.hauteur = props.hauteur; */

        this.props = props;

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

        // this.createGroups();

        MainScene.render();
    }

    select() {

        const material = new THREE.MeshPhongMaterial({
            color: 0x0000FF,    // red (can also use a CSS color string here)
            flatShading: true,
        });

        this.object.material = material
        this.object.material.emissive.set(0x000000);
    }

    /* si l'objet contient des sous groupes, les créer et cacher les meshes d'origine  */
    createGroups() {
        var obj = this.object;
        var scene = this.scene;

        if (this.object.subGroups.length) {

            this.object.traverse(function (child) {

                if (child.parent.type === "Scene") {
                    return false;
                } else {
                    for (let i = 0; i < obj.subGroups.length; i++) {
                        if (child.name === obj.subGroups[i].parent) {

                            for (let j = 0; j < obj.subGroups[i].childs.length; j++) {

                                const group = new THREE.Group();
                                group.name = obj.subGroups[i].name;
                                group.animable = obj.subGroups[i].animable;
                                group.groupProps = obj.subGroups[i];

                                var target = obj.getObjectByName(obj.subGroups[i].childs[j]);
                                var parent = child.clone();
                                var subChild = target.clone();

                                group.add(parent);
                                group.add(subChild);

                                obj.add(group);

                                /*                                 child.visible = false;
                                                                obj.getObjectByName(obj.subGroups[i].childs[j]).visible = false; */

                                obj.updateMatrix();

                                console.log(group);
                            }
                        }

                    }

                }

            });

        }
    }
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
    getFrontPosition() {
        const d = 3000// distance de recul pour observer le meuble selectionné
        const center = this.getCenterPoint()
        switch (this.wall) {
            case "right":
                return center.add(new THREE.Vector3(0, 0, d))
                break;
            case "back":
                return center.add(new THREE.Vector3(d, 0, 0))
                break;
            case "left":
                return center.add(new THREE.Vector3(0, 0, -d))
                break;
            case "right-back":
                return center.add(new THREE.Vector3(d, 0, d))
                break;
            case "left-back":
                return center.add(new THREE.Vector3(d, 0, -d))
                break;
            default:
        }
    }
    getCenterPoint() {
        var box = new THREE.Box3().setFromObject(this.object);
        var middle = new THREE.Vector3();
        middle.x = (box.max.x + box.min.x) / 2;
        middle.y = (box.max.y + box.min.y) / 2;
        middle.z = (box.max.z + box.min.z) / 2;
        // mesh.localToWorld(middle);
        return middle;
    }
}
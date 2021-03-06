import {
    select,
    drag
}
    from '../api/actions'
import store from '../api/store';
import * as THREE from "three";
import ThreeScene from './ThreeScene';
import { NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

// Controls
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
// import { Interaction } from 'three.interaction';
// import { TextureLoader } from 'src/loaders/TextureLoader.js';

// miroir
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

export default class Meuble {
    static dragged = null;
    constructor (props, object) {
        // console.log('Meuble', props, object)
        this.object = object;// threejs group mesh
        this.file = props.file;
        this.name = props.name;
        this.wall = props.position.wall;
        this.angle = props.angle;
        if (props.subGroups) {
            this.object.subGroups = props.subGroups;
        } else {
            this.object.subGroups = [];
        }

        this.wallConfig = store.getState().config.walls;
        this.width = this.getWidth()// store width for performance collision
        // this.segment = this.getSegment(object)// store width for performance collision
        this.dragControls = this.setDraggable();
        this.setPosition(props.position);
        console.log("Loaded module ", this.name, this.width);

        // charger l'objet 'obj' demandé
        if (props.texture) {

            //const textureLoader = new THREE.TextureLoader();
            //textureLoader.load("textures/" + props.texture, this.textureLoaded.bind(this));

        }

        const file = this.file.split('_');
        const type = file.shift();
        let dim = {}
        if (type === "MOD") {
            file.forEach(function (item, index, array) {
                dim[item.charAt(0)] = parseInt(item.substring(1)) * 10;
            })
        }
        this.dim = dim;
        //console.log(this.dim)


        if (props.textures) {



            const textureLoader = new THREE.TextureLoader();

            var texturePromises = [], path = 'textures/';

            for (var key in props.textures) {
                texturePromises.push(new Promise((resolve, reject) => {
                    var metas = props.textures[key];
                    var name = key;
                    var url = path + metas.url;
                    var angle_fil = metas.angle_fil;
                    var label = metas.label;

                    textureLoader.load(url, texture => {
                        texture.name = label;
                        metas.angle_fil = angle_fil;
                        metas.texture = texture;

                        if (metas.texture instanceof THREE.Texture) resolve({ name: name, metas });
                    },
                        xhr => {
                            console.log(url + ' ' + (xhr.loaded / xhr.total * 100) + '% loaded');
                        },
                        xhr => {
                            reject(new Error(xhr + 'An error occurred loading while loading: ' + metas.url));
                        }
                    );

                }));
            }

            Promise.all(texturePromises).then(loadedTextures => {

                // on a chargé et créé les textures, on les colle comme propriété dans le groupe pour pouvoir les retrouver facilement plus tard.
                object.textures = loadedTextures;
                this.texturesLoaded(loadedTextures);

            });

        }





        /* 			
            object.cursor = 'pointer';
            object.on('click', function (ev) {
                console.log('object....click....', ev)
            });
            object.on('touchstart', function (ev) { });
            object.on('touchcancel', function (ev) { });
            object.on('touchmove', function (ev) { });
            object.on('touchend', function (ev) { });
            object.on('mousedown', function (ev) { });
            object.on('mouseout', function (ev) { });
            object.on('mouseover', function (ev) { });
            object.on('mousemove', function (ev) { });
            object.on('mouseup', function (ev) { }); */

        /* object.traverse(function (child) {
            // console.log('object.traverse', child)

            if (child.name.search("GLACE") > -1) {
                // console.log('object........', child.name)
                // child.visible = false;
            }

            if (child.name.search("COTE") > -1 && child.name.search("-Dr") > -1) {
                // console.log('object........', child.name)
                // child.visible = false;
            }

            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material = material;

            }
        }); */

    }


    texturesLoaded(textures) {

        var obj = this.object;
        var scene = this.scene;
        const loader = new THREE.TextureLoader();
        // affecter des materiaux sur les diffrents sous objets
        //console.log( obj );
        if (!this) {
            return false;
        }

        this.object.traverse(function (child) {


            if (child.geometry) {
                child.geometry.computeBoundingSphere();
            }

            if (child.name.indexOf("Body") > -1) {

                // les bodies sont les elements en bois mineurs (supports, renforts etc ...)
                var text = obj.textures[1].metas.texture.clone();
                text.needsUpdate = true;
                text.wrapS = text.wrapT = THREE.RepeatWrapping;
                text.repeat.set(0.005, 0.005);

                var material_args = {
                    //color:0xff0000,
                    emissive: 0x0D0D0D,
                    roughness: 0.35,
                    map: text,
                    bumpMap: text,
                    bumpScale: 5,
                    fog: false
                };
                var material = new THREE.MeshStandardMaterial(material_args);
                material.bumpMap.repeat.set(0.005, 0.005);

                child.material = material;

            } else if (child.name.indexOf("porte") > -1) {

                /*
                mettre une texture sur la porte
                */
                var text = obj.textures[3].metas.texture.clone();
                text.needsUpdate = true;
                text.wrapS = text.wrapT = THREE.RepeatWrapping;
                text.repeat.set(0.01, 0.005);
                text.offset.set(0.5, 0.5);

                var material_args = {
                    //color:0x000fff,
                    roughness: 0.45,
                    emissive: 0x0D0D0D,
                    map: text,
                    bumpMap: text,
                    bumpScale: 2,
                    fog: false
                };

                var material = new THREE.MeshStandardMaterial(material_args);
                child.material = material;

                /*
                grouper la porte avec sa poignée et les mettre invisibles
                */
                /*var childStrIndexarr = child.name.split("-");
                var childStrIndex = childStrIndexarr[ childStrIndexarr.length-1 ];

                for(var propName in obj.children) {
                    if(obj.children.hasOwnProperty(propName)) {
                        if( obj.children[propName].name === 'metal-poignee-' + childStrIndex ){
                            const group = new THREE.Group();
                            group.name = 'groupe-coulissante-' + childStrIndex;

                            var porte = child.clone();
                            var poignee = obj.children[propName].clone();

                            group.add( porte );
                            group.add( poignee );

                            obj.add( group );

                            child.visible = false;
                            obj.children[propName].visible = false;

                            obj.updateMatrix();
                            
                        }
                        
                    }
                    
                }*/




            } else if (child.name.indexOf("panneau") > -1) {

                // panneaux prefabs droite et gauche
                var text = obj.textures[1].metas.texture.clone();
                text.needsUpdate = true;
                text.wrapS = text.wrapT = THREE.RepeatWrapping;
                text.repeat.set(1, 1);
                text.offset.set(0.5, 0.5);

                var material_args = {
                    //color:0x000fff,
                    roughness: 0.45,
                    emissive: 0x0D0D0D,
                    map: text,
                    bumpMap: text,
                    bumpScale: 1,
                    fog: false
                };

                var material = new THREE.MeshStandardMaterial(material_args);
                material.bumpMap.repeat.set(0.01, 0.005);
                child.material = material;

            } else if (child.name.indexOf("top") > -1 || child.name.indexOf("bottom") > -1) {

                // planche de dessus / dessous
                var text = obj.textures[0].metas.texture.clone();
                text.needsUpdate = true;
                text.wrapS = text.wrapT = THREE.RepeatWrapping;
                text.repeat.set(0.015, 0.010);
                text.offset.set(0.5, 0.5);

                var material_args = {
                    //color:0x0000ff,
                    roughness: 0.45,
                    emissive: 0x0D0D0D,
                    map: text,
                    bumpMap: text,
                    bumpScale: 1,
                    fog: false
                };

                var material = new THREE.MeshStandardMaterial(material_args);
                material.bumpMap.repeat.set(0.015, 0.010);
                child.material = material;

            } else if (child.name.indexOf("facade") > -1) {

                // facades fil horizontal (par exemple facade tiroir de la coiffeuse)
                var text = obj.textures[0].metas.texture.clone();
                text.needsUpdate = true;
                text.wrapS = text.wrapT = THREE.RepeatWrapping;
                text.repeat.set(0.015, 0.010);
                text.offset.set(0.5, 0.5);

                var material_args = {
                    //color:0x0000ff,
                    roughness: 0.45,
                    emissive: 0x0D0D0D,
                    map: text,
                    bumpMap: text,
                    bumpScale: 2.5,
                    fog: false
                };

                var material = new THREE.MeshStandardMaterial(material_args);
                material.bumpMap.repeat.set(0.015, 0.010);
                child.material = material;

            } else if (child.name.indexOf("cuir") > -1) {

                // habillage interieur cuir
                var text = obj.textures[2].metas.texture.clone();

                text.needsUpdate = true;
                text.wrapS = text.wrapT = THREE.RepeatWrapping;

                text.repeat.set(0.03, 0.03);
                text.offset.set(0.5, 0.5);

                var material_args = {
                    //color:0xff00ff,
                    roughness: 0.48,
                    emissive: 0x030303,
                    bumpMap: text,  // loader.load('textures/cuir-bump.jpg'),
                    bumpScale: 7.5,
                    map: text,
                    fog: false,

                };
                var material = new THREE.MeshStandardMaterial(material_args);
                material.bumpMap.repeat.set(0.03, 0.03);
                child.material = material;

            } else if (child.name.indexOf("etagere") > -1) {

                // étagères
                var text = obj.textures[2].metas.texture.clone();
                text.needsUpdate = true;
                text.wrapS = text.wrapT = THREE.RepeatWrapping;

                text.repeat.set(0.03, 0.03);
                text.offset.set(0.5, 0.5);

                var material_args = {
                    //color:0xf0ff0f,
                    roughness: 0.35,
                    emissive: 0x0D0D0D,
                    map: text,
                    bumpMap: text,
                    bumpScale: 5,
                    fog: false
                };
                var material = new THREE.MeshStandardMaterial(material_args);
                material.bumpMap.repeat.set(0.03, 0.03);
                child.material = material;

            } else if (child.name.indexOf("metal") > -1 || child.name.indexOf("poignee") > -1) {
                // trucs en métal
                var material_args = {
                    //color: 0xD6E3E2,
                    specular: 0xffffff,
                    emissive: 0x0D0D0D,
                    fog: false
                };
                var material = new THREE.MeshPhongMaterial(material_args);
                child.material = material;

            } else if (child.name.indexOf("miroir") > -1) {

                // poser un vrai miroir devant le modele
                var mirrorBox = new THREE.BoxBufferGeometry(72, 81, 1);
                mirrorBox.computeBoundingSphere();
                mirrorBox.matrixWorldNeedsUpdate = true;

                child.geometry.computeBoundingSphere();
                child.geometry.matrixWorldNeedsUpdate = true;

                //console.log( child.geometry.boundingSphere );

                var mirror = new Reflector(mirrorBox, {
                    color: new THREE.Color(0x7F7F7F),
                    textureWidth: window.innerWidth,
                    textureHeight: window.innerHeight,
                });
                mirror.position.set(40, 136.5, 2.5);
                mirror.matrixWorldNeedsUpdate = true;
                mirror.geometry.computeBoundingSphere();

                child.add(mirror);

            } else if (child.name.indexOf("led") > -1) {

                // lumière de la led
                const rectLight = new THREE.RectAreaLight(0xFFFDEB, 70, 700, 10);
                rectLight.name = "LedLight"
                rectLight.position.set(400, 1780, 415);
                rectLight.rotation.set(-Math.PI / 1.8, 0, 0);
                //obj.add( rectLight ) // <-- il faudrait plutot attacher la lumière au child


                //const rectLightHelper = new THREE.RectAreaLightHelper( rectLight );
                //obj.add( rectLightHelper );

                var material_args = {
                    color: 0xFFF196,
                    emissiveIntensity: 5,
                    emissive: 0x7D7C6F,
                    fog: false
                };
                var material = new THREE.MeshLambertMaterial(material_args);
                child.material = material;

            } else {

            }



            child.castShadow = true;
            child.receiveShadow = true;


        });


        /*
        panneaux lateraux
        */
        if (this.dim != {}) {

            var e = 25;
            //texture.repeat.set(1, 1);

            var text = obj.textures[1].metas.texture.clone();
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


            const geometry = new THREE.BoxBufferGeometry(e, this.dim.H, this.dim.P);

            //geometry.computeBoundingSphere();
            //geometry.translate(e / 2, this.dim.H / 2, this.dim.P / 2);// THREE.BufferGeometry error => je pense que tu ne peux faire le translate que quand il a été ajouté dans la scene
            //geometry.attributes.position = new BufferAttribute( newPos, 2 );
            //geometry.position.set( e / 2, this.dim.H / 2, this.dim.P / 2 );

            this.panneauLeft = new THREE.Mesh(geometry, material_bords);
            this.panneauLeft.position.set(e / 2, this.dim.H / 2, this.dim.P / 2);

            this.panneauRight = new THREE.Mesh(geometry, material_bords);
            this.panneauRight.position.set(this.width - e / 2, this.dim.H / 2, this.dim.P / 2);

            this.panneauLeft.name = "bord_gauche_fab";
            this.panneauRight.name = "bord_droit_fab";

            this.panneauLeft.material = material_bords;
            this.panneauRight.material = material_bords;
            this.panneauLeft.material.needsUpdate = true;
            this.panneauRight.material.needsUpdate = true;

            //this.panneauLeft.material.map.anisotropy = 16;
            this.panneauLeft.castShadow = true;
            this.panneauLeft.receiveShadow = true;
            //this.panneauRight.material.map.anisotropy = 16;
            this.panneauRight.castShadow = true;
            this.panneauRight.receiveShadow = true;

            this.panneauLeft.material.needsUpdate = true;
            this.panneauRight.material.needsUpdate = true;

            //console.log( this.panneauLeft );

            this.object.add(this.panneauLeft);
            this.object.add(this.panneauRight);
        }

        this.createGroups();

        ThreeScene.render();
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

                                child.visible = false;
                                obj.getObjectByName(obj.subGroups[i].childs[j]).visible = false;

                                obj.updateMatrix();

                                console.log(group);
                            }
                        }

                    }

                }

            });

        }
    }

    setPosition(position) {
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
                this.object.position.z = position.x;
                break;
            case "left":
                this.object.rotateY(Math.PI);
                this.object.position.x = position.x;
                this.object.position.y = 0;
                this.object.position.z = this.wallConfig.back.width;
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
                this.object.position.z = this.wallConfig.back.width;
                break;
            default:
        }
    }
    setDraggable() {
        const dragControls = new DragControls([this.object], ThreeScene.camera, ThreeScene.renderer.domElement);
        dragControls.transformGroup = true;
        if (!this.angle) {
            dragControls.addEventListener('drag', this.drag.bind(this))
            dragControls.addEventListener('dragstart', this.dragStart.bind(this))
            dragControls.addEventListener('dragend', this.dragEnd.bind(this))
            // dragControls.addEventListener('hoveron', this.hoveron.bind(this))
            // dragControls.addEventListener('hoveroff', this.hoveroff.bind(this))
        }
        else {
            dragControls.addEventListener('drag', this.drag.bind(this))
            dragControls.addEventListener('dragstart', this.dragStart.bind(this))
            dragControls.addEventListener('dragend', this.dragEnd.bind(this))
            // dragControls.addEventListener('drag', this.dragAngle.bind(this))
            // dragControls.addEventListener('dragstart', this.dragAngleStart.bind(this))
            // dragControls.addEventListener('dragend', this.dragAngleEnd.bind(this))
        }
        return dragControls;
    }


    intersects(o1, o2, axis) {
        var s1 = this.getSegment(o1.object, axis)
        var s2 = this.getSegment(o2.object, axis)
        return s1[1] > s2[0] && s1[0] < s2[1]
    }
    collisionSolver(meublesOnWall, axis) {
        const intersections = meublesOnWall.filter(m => this.intersects(this, m, axis))
        var s1 = this.getSegment(this.object, axis)
        let x = s1[0];
        let intersectElement;
        if (intersections.length > 0) {// traiter les meubles collés !?
            intersectElement = intersections[0];
            var s2 = this.getSegment(intersectElement.object, axis)
            var left = Math.abs(s1[0] - s2[0]) < Math.abs(s1[0] - s2[1])// at left or at right?
            if (!left || s2[0] - this.width < 0) {
                x = s2[1]
            } else {
                x = s2[0] - this.width
            }
        }
        else {
            // console.log("pas de intersect")
        }
        return x;
    }

    drag(event) {
        // console.log("drag", this.wall)
        let wallWidth, axis;

        switch (this.wall) {
            case "right":
                axis = "x";
                wallWidth = this.wallConfig.right.width;
                event.object.position.y = 0;
                event.object.position.z = 0;

                //corner turn
                if (event.object.position.x < -100) {
                    this.wall = "back"
                    this.object.rotateY(Math.PI / 2);
                    return;
                }

                // wall constraint
                event.object.position[axis] = Math.max(0, Math.min(wallWidth - this.width, event.object.position[axis]))

                // elements collision
                event.object.position[axis] = this.collisionSolver(this.meublesNotDragged.filter(m => m.wall === this.wall), axis);

                break;

            case "back":
                axis = "z";
                wallWidth = this.wallConfig.back.width;
                event.object.position.y = 0;
                event.object.position.x = 0;

                //corner turn
                if (event.object.position.z < -100) {
                    this.wall = "right"
                    this.object.rotateY(-Math.PI / 2);
                    this.object.position.x = 0;
                    return;
                }
                if (event.object.position.z > 100 + wallWidth) {
                    this.wall = "left"
                    this.object.rotateY(Math.PI / 2);
                    return;
                }

                // wall constraint
                event.object.position[axis] = Math.max(this.width, Math.min(wallWidth, event.object.position[axis]))


                // this.width corection : segment not ok
                // event.object.position[axis] = this.collisionSolver(this.meublesNotDragged.filter(m => m.wall === this.wall), axis);

                break;

            case "left":
                axis = "x";
                wallWidth = this.wallConfig.left.width;
                //corner turn
                if (event.object.position.x < -60 || event.object.position.z < this.wallConfig.back.width - 100) {
                    this.wall = "back"
                    this.object.rotateY(-Math.PI / 2);
                    this.object.position.x = this.width;
                    return;
                }
                event.object.position.y = 0;
                event.object.position.z = this.wallConfig.back.width;


                // wall constraint
                event.object.position[axis] = Math.max(this.width, Math.min(wallWidth, event.object.position[axis]))
                event.object.position[axis] = this.collisionSolver(this.meublesNotDragged.filter(m => m.wall === this.wall), axis);

                break;
            default:
        }

        //grid magnet 1cm
        event.object.position[axis] = 10 * (Math.round(event.object.position[axis] / 10))

        // console.log("drag", event, event.object.position.x)
        ThreeScene.render();
    }
    dragStart(event) {
        console.log("dragstart", this.wall, event, event.object === this.object)
        if (Meuble.dragged) {
            event.target.enabled = false;// deactivation of others
            return
        }
        Meuble.dragged = this;
        store.dispatch(drag(this))

        this.time = Date.now();
        // selection des meubles concernés par le drag courant :
        const meublesOnScene = store.getState().meublesOnScene
        this.meublesNotDragged = meublesOnScene.filter(m => m.object !== event.object);
        // this.meubleDragged = meublesOnScene.find(m => m.object === event.object);

        ThreeScene.orbitControls.enabled = false;

        // event.object.material.emissive.set(0xaaaaaa);
        // store.dispatch(select(event.object))

    }
    dragEnd(event) {
        console.log("dragend", event, Date.now() - this.time)
        ThreeScene.orbitControls.enabled = true;
        // event.object.material.emissive.set(0x000000);
        if (Meuble.dragged === this && Date.now() - this.time < 220) {
            store.dispatch(select(this))
        }
        store.dispatch(drag(null))
        Meuble.dragged = null
        const meublesOnScene = store.getState().meublesOnScene
        meublesOnScene.forEach(m => m.dragControls.enabled = true)// reactivation of others
    }
    /*
    angle
    */
    dragAngle(event) {
    }
    dragAngleStart(event) {
    }
    dragAngleEnd(event) {
    }


    getSegment(axis) {
        const box = new THREE.Box3().setFromObject(this.object);
        // this.box = new THREE.Box3().setFromObject(object);
        // const v = new THREE.Vector3();
        // box.getSize(v)
        // console.log(box.min, box.max, box.getSize());
        return [Math.round(box.min[axis]), Math.round(box.max[axis])];
    }
    getWidth() {
        var box = new THREE.Box3().setFromObject(this.object);
        return Math.round(box.max.x - box.min.x);
    }
    getHeight(object) {
        var box = new THREE.Box3().setFromObject(object);
        const v = new THREE.Vector3();
        box.getSize(v)
        return Math.ceil(v.y);
    }
    getDepth(object) {
        var box = new THREE.Box3().setFromObject(object);
        const v = new THREE.Vector3();
        box.getSize(v)
        return Math.ceil(v.z);
    }
}
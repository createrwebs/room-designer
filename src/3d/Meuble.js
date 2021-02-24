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

export default class Meuble {
    static dragged = null;
    constructor (props, object) {
        // console.log('Meuble', props, object)
        this.object = object;// threejs group mesh
        this.file = props.file;
        this.name = props.name;
        this.wall = props.position.wall;
        this.angle = props.angle;
        this.wallConfig = store.getState().config.walls;
        this.width = this.getWidth()// store width for performance collision
        // this.segment = this.getSegment(object)// store width for performance collision
        this.dragControls = this.setDraggable();
        this.setPosition(props.position);
        console.log("Meuble", this.name, this.width);

        // charger l'objet 'obj' demandé
        if (props.texture) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load("textures/" + props.texture, this.textureLoaded.bind(this));
			
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

	


    textureLoaded(texture) {
        
		
		texture.repeat.set(0.0075, 0.0075);
		texture.offset.set( 0.5, 0.5 );
		
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        
		texture.matrixAutoUpdate = true;
		texture.updateMatrix ();

        var material_args = {
			//color:0xDBDBDB
			dithering:true
        };
		
        //this.object.castShadow = this.object.receiveShadow = true;
       
        this.object.traverse(function (child) {

            if ( child.name.indexOf("Body") > -1 || child.name.indexOf("bord") > -1 ) {

                material_args.map = texture;
				material_args.color = '#ffffff';
				material_args.emissive = '#000000';
				
                console.log('bois', material_args);
				
            } else {
				if( child.name === 'miroir' ){
                	const textureLoader = new THREE.TextureLoader();
            		var mirror_texture = textureLoader.load("textures/mirror.jpg");
					
					mirror_texture.rotation = -Math.PI/2;
					mirror_texture.repeat.set(0.0125, 0.0125);
					mirror_texture.offset.set( 0.5 , 0.5 );
					mirror_texture.wrapS = mirror_texture.wrapT = THREE.RepeatWrapping;
					
					material_args.map = mirror_texture;
                	material_args.color = '#ffffff';
					
					material_args.emissive = '#15191A';
					//material_args.emissive = '#ADADAD';
					
                	console.log('miroir', material_args);
					
				} else if( child.name.indexOf("poignee") > -1 ) {
					material_args.map = texture;
					material_args.color = '#0000ff';
					material_args.emissive = '#000000';
					
					console.log('poignee', material_args);
				} else {
					material_args.map = texture;
					material_args.color = '#ff0000';
					material_args.emissive = '#000000';
					console.log('autre', material_args);
				}
            }
			
			var material = new THREE.MeshLambertMaterial( material_args );
			
			child.material = material; 
			child.material.needsUpdate = true;
			
			child.castShadow = true; 
			child.receiveShadow = true;
			if(child.material.map) child.material.map.anisotropy = 16; 
			
            child.castShadow = true;
            child.receiveShadow = true;
            
			//child.material.map = texture
			
        });
		
        //console.log(geometry.attributes.uv)
		//material.needsUpdate = true;
		//texture.needsUpdate = true;
		
        ThreeScene.render()
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
            dragControls.addEventListener('drag', this.dragAngle.bind(this))
            dragControls.addEventListener('dragstart', this.dragAngleStart.bind(this))
            dragControls.addEventListener('dragend', this.dragAngleEnd.bind(this))
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
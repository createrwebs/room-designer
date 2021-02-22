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

export default class Meuble {
    static dragged = null;
    constructor (props, object) {
        console.log('Meuble', props, object)
        this.object = object;// threejs group mesh
        this.file = props.file;
        this.name = props.name;

        if (props.rotateX == "-90")
            object.rotateX(-Math.PI / 2);
        if (props.startX)
            object.position.x = props.startX;

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

        object.traverse(function (child) {
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
            }
        });

        // console.log("width", Math.ceil(box.getSize().x));
        this.wall = "right"
        this.width = this.getWidth()// store width for performance collision
        this.segment = this.getSegment(object)// store width for performance collision
        this.dragControls = this.setDraggable();
    }

    setDraggable() {
        const dragControls = new DragControls([this.object], ThreeScene.camera, ThreeScene.renderer.domElement);
        dragControls.transformGroup = true;
        dragControls.addEventListener('drag', this.drag.bind(this))
        dragControls.addEventListener('dragstart', this.startdrag.bind(this))
        dragControls.addEventListener('dragend', this.enddrag.bind(this))
        // dragControls.addEventListener('hoveron', this.hoveron.bind(this))
        // dragControls.addEventListener('hoveroff', this.hoveroff.bind(this))
        return dragControls;
    }

    intersects(o1, o2) {
        var s1 = this.getSegment(o1.object)
        var s2 = this.getSegment(o2.object)
        return s1[1] > s2[0] && s1[0] < s2[1]
    }
    intersectsRight(o1, o2) {
        var s1 = this.getSegment(o1.object)
        var s2 = this.getSegment(o2.object)
        return s1[0] < s2[1]
    }
    intersectsLeft(o1, o2) {
        var s1 = this.getSegment(o1.object)
        var s2 = this.getSegment(o2.object)
        return s1[1] > s2[0]
    }
    drag(event) {
        event.object.position.y = 0;
        event.object.position.z = 0;

        if (event.object.position.x < 0) {
            this.wall = "back"
            drag();
        }

        // wall constraint
        const wallConfig = store.getState().config.walls;
        const wallWidth = wallConfig.right.width;
        event.object.position.x = Math.max(0, Math.min(wallWidth - this.width, event.object.position.x))

        // elements collision
        const intersectElement = this.meublesNotDragged.find(m => this.intersects(this, m))
        if (intersectElement) {
            var s1 = this.getSegment(this.object)
            var s2 = this.getSegment(intersectElement.object)
            var left = Math.abs(s1[0] - s2[0]) < Math.abs(s1[0] - s2[1])// at left or at right?
            if (!left || s2[0] - this.width < 0) {
                event.object.position.x = s2[1]
            } else {
                event.object.position.x = s2[0] - this.width
            }
        }
        else {
            console.log("pas de intersect")
        }

        //grid magnet
        // event.object.position.x = 100 * (Math.round(event.object.position.x / 100))

        // console.log("drag", event, event.object.position.x)
        ThreeScene.render();
    }
    startdrag(event) {
        console.log("dragstart", event, event.object === this.object)
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
    enddrag(event) {
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

    getSegment(object) {
        var box = new THREE.Box3().setFromObject(object);
        this.box = new THREE.Box3().setFromObject(object);

        const v = new THREE.Vector3();
        box.getSize(v)
        // console.log(box.min, box.max, box.getSize());
        return [box.min.x, box.max.x];
    }
    getWidth() {
        var box = new THREE.Box3().setFromObject(this.object);
        const v = new THREE.Vector3();
        box.getSize(v)
        // console.log(box.min, box.max, box.getSize());
        return Math.ceil(v.x);
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
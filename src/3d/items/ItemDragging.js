import {
    drag,
}
    from '../../api/actions'
import store from '../../api/store';
import MainScene from '../MainScene';
import { DragControls } from './ModifiedDragControls.js';
import Fbx from '../Fbx';
import { Box3 } from "three";

export default {
    current: null,
    dragControls: null,

    add(object) {
        const objects = this.dragControls ? this.dragControls.getObjects() : []
        if (objects.includes(object)) return
        if (this.dragControls) {
            this.dragControls.dispose()
        }
        objects.push(object)
        this.dragControls = this.setup(objects);
        // console.log(` ItemDragging add`, object)
    },
    remove(object) {
        const objects = this.dragControls ? this.dragControls.getObjects() : []
        if (!objects.includes(object)) return
        if (this.dragControls) {
            this.dragControls.dispose()
        }
        this.dragControls = this.setup(objects.filter(o => object !== o));
        // console.log(` ItemDragging remove`, object)
    },
    setup(objects) {
        const dragControls = new DragControls(objects, MainScene.camera, MainScene.renderer.domElement);
        dragControls.addEventListener('drag', this.dragging.bind(this))
        dragControls.addEventListener('dragstart', this.dragStart.bind(this))
        dragControls.addEventListener('dragend', this.dragEnd.bind(this))
        return dragControls;
    },
    dragStart(event) {
        console.log(`dragStart Item`, event)
        this.current = event.item;
        this.current.startDrag()
        store.dispatch(drag(this.current))
        MainScene.orbitControls.enabled = false;// deactivation of orbit controls while dragging
    },
    dragging(event) {
        this.current.drag(event.intersection.x, event.intersection.y, event.intersection.z)
        MainScene.render();
    },
    dragEnd(event) {
        console.log(`dragEnd Item`, event)

        this.current.box = new Box3().setFromObject(this.current.object);// updateBox()


        this.current = null
        store.dispatch(drag(null))
        MainScene.orbitControls.enabled = true;
    }
}
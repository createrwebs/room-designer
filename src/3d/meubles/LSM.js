import {
    sceneChange,
    showhideMetrage as updateMetrage
}
    from '../../api/actions'
import Draggable from './Draggable'
import { Measures } from '../Utils'
import { create as createRuler } from '../helpers/Ruler';
import MainScene from '../MainScene';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { Space } from '../Space';
import { Walls, Corners, Sides } from '../Constants';
import Room from '../Room';

export default class LSM extends Draggable {// Largeur Sur Mesure
    constructor (props, object, state, skuInfo) {
        super(props, object, state, skuInfo)
        this.maxWidth = 800
        this.LSMwidth = (state && state.width) ? state.width : 400
        this.childrenToScale = object.children.filter(c => c.name.includes("-mtl-hori")
            || c.name == "fond-mtl-cuir"
            || c.name == "back-mtl-cuir")
        this.setWidth(this.LSMwidth)
        this.setupRuler()
    }
    setupRuler() {
        if (this.ruler) this.object.remove(this.ruler);
        const mWidth = (this.LSMwidth ? this.LSMwidth : 400) + 2 * Measures.thick
        this.ruler = createRuler(this.props.sku, mWidth, this.height)
        this.ruler.position.z = this.depth + 24// avancement ruler
    }
    panneauLoaded(props, where, object) {
        super.panneauLoaded(props, where, object)
        if (where == Sides.R) {
            const panneauRight = this.panneaux[where]
            const dragControls = new DragControls([panneauRight.object], MainScene.camera, MainScene.renderer.domElement);
            dragControls.transformGroup = true;
            dragControls.addEventListener('drag', this.draggingLSM.bind(this))
            dragControls.addEventListener('dragstart', this.dragLSMStart.bind(this))
            dragControls.addEventListener('dragend', this.dragLSMEnd.bind(this))
            // this.dragLSMControls = dragControls;

            if (this.LSMwidth) {
                this.setWidth(this.LSMwidth)
                this.setupRuler()
            }
        }
    }
    dragLSMStart(event) {
        /*         if (Draggable.Dragged) {//|| tool != Tools.ARROW
                    event.target.enabled = false;// deactivation of other Draggable
                    return
                }*/
        Draggable.Dragged = this;
        MainScene.orbitControls.enabled = false;// deactivation of orbit controls while dragging
        this.dragControls.deactivate()

        const axis = Room.getAxisForWall(this.wall);
        // Room.setupWallConstraints(this.getWidth())
        // Room.populateMeublesOnWalls(MainScene.meubles)
        // Room.populateSpacesOnWalls(this, this.skuInfo)
        // Room.populateMeublesOnCorners(MainScene.meubles, this)        

        this.meublesOnThisWall = Room.getMeublesOnWall(MainScene.meubles, this.wall, Room.getAxisForWall(this.wall))
            .filter(m => m != this)
            .filter(m => m.object.position[axis] > this.object.position[axis])
        this.maxWidth = (this.meublesOnThisWall && this.meublesOnThisWall[0] ?
            this.meublesOnThisWall[0].object.position[axis]
            : Room.getWallLength(this.wall))
            - this.object.position[axis] - 2 * Measures.thick
    }

    draggingLSM(event) {
        const roundX = Math.round(event.object.position.x)
        event.object.position.x = Math.min(800, Math.max(300, roundX)) + Measures.thick
        event.object.position.y = 0
        event.object.position.z = 0
        this.setWidth(event.object.position.x - Measures.thick)
        updateMetrage()
        MainScene.render();
    }

    dragLSMEnd(event) {
        MainScene.orbitControls.enabled = true;
        updateMetrage()
        sceneChange()
        MainScene.render()
        this.dragControls.activate()
        this.setupRuler()

        Draggable.Dragged = null
        MainScene.meubles.forEach(m => {// reactivation of others
            if (m.dragControls) m.dragControls.enabled = true
        })
    }
    setWidth(w) {
        // console.log("LSM setWidth", w)
        const max = Math.min(800, this.maxWidth)
        w = Math.min(max, Math.max(300, w))
        this.LSMwidth = w
        const initWidth = 400
        const scale = w * 10 / initWidth
        if (this.childrenToScale)
            this.childrenToScale.forEach(s => s.scale.x = scale)
        if (this.panneaux[Sides.R] && this.panneaux[Sides.R].object)
            this.panneaux[Sides.R].object.position.x = w + Measures.thick
        this.setWidthItems()
    }
    setWidthItems(w) {
        const initWidth = 400
        const scale = this.LSMwidth * 10 / initWidth
        if (this.items)
            this.items.filter(i => i.skuInfo.isLSM)
                .forEach(i => i.object.children.filter(c => c.name.includes("-mtl-cuir"))
                    .forEach(c => c.scale.x = scale)
                )
    }
    itemLoaded(props, state, skuInfo, object) {
        super.itemLoaded(props, state, skuInfo, object)
        this.setWidthItems()
    }

    getJSON() {
        let meuble = super.getJSON()
        meuble.width = this.LSMwidth
        return meuble
    }
}
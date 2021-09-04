import { Vector3, Box3 } from "three";
import { localhost } from '../api/Utils';

import MainScene from './MainScene';
import {
    loadOne as loadOneMaterial,
    applyOnMesh,
    getLaqueById
} from './Material'
import { Walls, Corners } from "./Constants";
import {
    sceneChange,
}
    from '../api/actions'

export default class Fbx {
    static list = []
    constructor (props, object, state, skuInfo) {
        // console.log('Fbx', props, object, state)
        this.props = props;// wp backoffice props
        this.object = object;// threejs group mesh
        this.state = state// position & dressing stuff
        this.skuInfo = skuInfo// sku parsing info

        Fbx.list.push(this)

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
    }
    static getByUuid(uuid) {
        // console.warn(`No laque material id for `, Fbx.list, uuid)
        return Fbx.list.find(f => f.object.uuid === uuid)
    }
    getUid() {
        return this.object ? this.object.uuid.substring(0, 8) : "no-uuid"// identifies uniquely
    }
    info() {
        return `${this.getUid()} | ${this.props.sku}`
    }
    sizeInfo() {
        return `${this.info()} (L ${this.width / 10}cm H ${this.height / 10}cm P ${this.depth / 10}cm)`
    }

    getFrontPosition() {
        const d = localhost ? 3000 : 3000// distance de recul pour observer le meuble selectionné
        const center = this.getCenterPoint()
        switch (this.wall) {
            case Walls.F:
                return center.add(new Vector3(d, 0, 0))
            case Walls.R:
                return center.add(new Vector3(0, 0, d))
            case Walls.B:
                return center.add(new Vector3(-d, 0, 0))
            case Walls.L:
                return center.add(new Vector3(0, 0, -d))

            case Corners.FR:
                return center.add(new Vector3(d, 0, d))
            case Corners.RB:
                return center.add(new Vector3(-d, 0, d))
            case Corners.BL:
                return center.add(new Vector3(-d, 0, -d))
            case Corners.LF:
                return center.add(new Vector3(d, 0, -d))

            default:
        }
    }
    getCenterPoint() {
        var box = new Box3().setFromObject(this.object);
        var middle = new Vector3();
        middle.x = (box.max.x + box.min.x) / 2;
        middle.y = (box.max.y + box.min.y) / 2;
        middle.z = (box.max.z + box.min.z) / 2;
        // mesh.localToWorld(middle);
        return middle;
    }

    /* laquables */

    clickLaquable(interactiveEvent) {

        // console.log("clickLaquable", interactiveEvent)
        interactiveEvent.stopPropagation()
        applyOnMesh(MainScene.laque, interactiveEvent.target)

        //memorize :
        this.laqueOnMeshes[interactiveEvent.target.name] = MainScene.laqueId
        // console.log("clickLaquable", this, this.laqueOnMeshes)

        MainScene.render()
        sceneChange()
    }
    removeLaqueOnMeshes() {
        this.laqueOnMeshes = []
    }
    getLaqueOnMeshesJson() {
        const laqueOnMeshes = []
        Object.entries(this.laqueOnMeshes).forEach(
            ([mesh, laque]) => {
                // console.log(mesh, laque)
                laqueOnMeshes.push({
                    mesh: mesh,
                    laque: laque
                })
            }
        )
        return laqueOnMeshes
    }

    // laques on meshes information lost
    getFirstLaqueId() {
        let laqueId
        Object.entries(this.laqueOnMeshes).forEach(
            ([mesh, laque]) => {
                laqueId = laque
            }
        )
        return laqueId
    }
}

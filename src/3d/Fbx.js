import { Vector3, Box3 } from "three";

export default class Fbx {
    constructor(props, object, skuInfo) {
        // console.log('Fbx', props, object)
        this.props = props;// wp backoffice props
        this.object = object;// threejs group mesh
        this.skuInfo = skuInfo
    }
    getFrontPosition() {
        const d = 3000// distance de recul pour observer le meuble selectionné
        const center = this.getCenterPoint()
        switch (this.wall) {
            case "front":
                return center.add(new Vector3(d, 0, 0))
            case "right":
                return center.add(new Vector3(0, 0, d))
            case "back":
                return center.add(new Vector3(d, 0, 0))
            case "left":
                return center.add(new Vector3(0, 0, -d))

            case "front-right":
                return center.add(new Vector3(d, 0, d))
            case "right-back":
                return center.add(new Vector3(-d, 0, d))
            case "back-left":
                return center.add(new Vector3(-d, 0, -d))
            case "left-front":
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
}
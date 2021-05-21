import { Vector3, Box3 } from "three";

export default class Fbx {
    constructor(props, object) {
        // console.log('Fbx', props, object)
        this.props = props;// wp backoffice props
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
    }
    getFrontPosition() {
        const d = 3000// distance de recul pour observer le meuble selectionné
        const center = this.getCenterPoint()
        switch (this.wall) {
            case "right":
                return center.add(new Vector3(0, 0, d))
                break;
            case "back":
                return center.add(new Vector3(d, 0, 0))
                break;
            case "left":
                return center.add(new Vector3(0, 0, -d))
                break;
            case "right-back":
                return center.add(new Vector3(d, 0, d))
                break;
            case "left-back":
                return center.add(new Vector3(d, 0, -d))
                break;
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
import {
    Font,
    LineBasicMaterial,
    Vector3,
    BufferGeometry,
    LineSegments,
    TextGeometry,
    Mesh,
    Group
} from "three";
import helvetiker_regular from 'three/examples/fonts/helvetiker_regular.typeface.json'
const font = new Font(helvetiker_regular);

const division1 = 100
const division2 = 20
const division1Width = 20
const division2Width = 10
const textParam = {
    font: font,
    size: 20,
    height: 2,
    curveSegments: 12,
    bevelEnabled: false,
    bevelThickness: 10,
    bevelSize: 8,
    bevelOffset: 0,
    bevelSegments: 5
};
const material = new LineBasicMaterial({ color: 0x223344, linewidth: 3, opacity: 1 });

export const create = (sku, largeur, hauteur) => {

    const pointsV = [];
    let k = 0;
    while (k <= hauteur) {
        pointsV.push(new Vector3(0, k, 0));
        pointsV.push(new Vector3(division1Width, k, 0));
        k += division1;
    }
    k = 0
    while (k <= hauteur) {
        pointsV.push(new Vector3(0, k, 0));
        pointsV.push(new Vector3(division2Width, k, 0));
        k += division2;
    }
    const geometry = new BufferGeometry().setFromPoints(pointsV);
    const rulerV = new LineSegments(geometry, material);
    k = 0
    while (k <= hauteur) {
        const label = new TextGeometry((k / 10).toString(), textParam);
        const textMesh = new Mesh(label, material);
        textMesh.position.x = division1Width + 6//mm
        textMesh.position.y = k - textParam.size / 2
        rulerV.add(textMesh);
        k += division1;
    }

    const pointsH = [];
    k = 0
    while (k <= largeur) {
        pointsH.push(new Vector3(k, 0, 0));
        pointsH.push(new Vector3(k, division1Width, 0));
        k += division1;
    }
    k = 0
    while (k <= largeur) {
        pointsH.push(new Vector3(k, 0, 0));
        pointsH.push(new Vector3(k, division2Width, 0));
        k += division2;
    }
    const rulerH = new LineSegments(new BufferGeometry().setFromPoints(pointsH), material);
    k = 0
    while (k <= largeur) {
        const label = new TextGeometry((k / 10).toString(), textParam);
        const textMesh = new Mesh(label, material);
        textMesh.position.x = k + textParam.size / 2
        textMesh.position.y = division1Width + 6
        textMesh.rotateZ(Math.PI / 2)
        rulerH.add(textMesh);
        k += division1;
    }

    const skuMesh = new Mesh(new TextGeometry(sku, textParam), material);

    skuMesh.position.y = hauteur + 80
    rulerV.position.x = largeur
    rulerH.position.y = hauteur

    const ruler = new Group();
    ruler.name = "ruler"
    ruler.add(rulerV);
    ruler.add(rulerH);
    ruler.add(skuMesh);
    return ruler;
}

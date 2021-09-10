import {
    Font,
    LineBasicMaterial,
    Box3,
    Vector3,
    BufferGeometry,
    LineSegments,
    TextGeometry,
    Mesh,
    Group,
    Texture,
    SpriteMaterial,
    Sprite,
    SpriteAlignment
} from "three";
import { Walls } from '../Constants';
import { Space } from '../Space';
import Room from '../Room';
import helvetiker_regular from 'three/examples/fonts/helvetiker_regular.typeface.json'
import MainScene from "../MainScene";
const font = new Font(helvetiker_regular);

const division1 = 100
const division2 = 20
const division1Width = 20
const division2Width = 10
export const textParam = {
    font: font,
    size: 70,
    height: 2,
    curveSegments: 12,
    bevelEnabled: false,
    bevelThickness: 10,
    bevelSize: 8,
    bevelOffset: 0,
    bevelSegments: 5
};
const textParamTitle = {
    font: font,
    size: 40,
    height: 2,
};
export const material = new LineBasicMaterial({ color: 0x223344, linewidth: 3, opacity: 1 });
export const lineHeightInRoom = 2600

export const draw = () => {
    const metrage = new Group();
    metrage.name = "metrage"
    /* 
        const material = new LineBasicMaterial({ color: 0x000000, linewidth: 3, opacity: 1 });
        const points = []
        const walls = [Walls.R, Walls.B, Walls.L, Walls.F]
        walls.forEach(w => {
            const axis = Room.getAxisForWall(w)
            const meubles = Room.getMeublesOnWall(MainScene.meubles, w, axis)
            drawWall(points, metrage, meubles, w, axis)
        });
        const geometry = new BufferGeometry().setFromPoints(points)
        geometry.name = "metrage-geometry"
    
        metrage.add(new LineSegments(geometry, material)) */

    MainScene.meubles.forEach(m => metrage.add(m.getMetrage()))

    return metrage

}

const drawWall = (points, metrage, meubles, wall, axis) => {

    // console.log(meubles, axis)

    meubles.forEach(m => {

        var box = new Box3().setFromObject(m.object);

        if (axis === "x") {// for meubles in room
            points.push(new Vector3(box.min.x, lineHeightInRoom, wall === Walls.R ? 0 : Room.zmax));
            points.push(new Vector3(box.max.x, lineHeightInRoom, wall === Walls.R ? 0 : Room.zmax));

            const label = new TextGeometry(Math.round((box.max.x - box.min.x) / 10).toString() + " cm", textParam);
            const textMesh = new Mesh(label, material);

            console.log(textMesh, new Box3().setFromObject(textMesh))

            textMesh.position.x = (box.max.x + box.min.x) / 2 - textParam.size / 2
            textMesh.position.y = lineHeightInRoom + 30
            textMesh.position.z = wall === Walls.R ? -30 : Room.zmax + 30
            if (wall === Walls.R) {
                textMesh.rotateX(-Math.PI / 2)
            }
            else {
                textMesh.rotateY(Math.PI)
                textMesh.rotateX(-Math.PI / 2)
            }
            metrage.add(textMesh);

        }
        else if (axis === "z") {// for meubles in room
            points.push(new Vector3(wall === Walls.F ? 0 : Room.xmax, lineHeightInRoom, box.min.z));
            points.push(new Vector3(wall === Walls.F ? 0 : Room.xmax, lineHeightInRoom, box.max.z));

            const labelZ = new TextGeometry(Math.round((box.max.z - box.min.z) / 10).toString() + "cm", textParam);
            const textMeshZ = new Mesh(labelZ, material);
            textMeshZ.position.x = wall === Walls.F ? -30 : Room.xmax + 30
            textMeshZ.position.y = lineHeightInRoom + 30
            textMeshZ.position.z = (box.max.z + box.min.z) / 2 - textParam.size / 2
            if (wall === Walls.F) {
                textMeshZ.rotateZ(Math.PI / 2)
                textMeshZ.rotateY(Math.PI / 2)
            }
            else {
                textMeshZ.rotateZ(Math.PI / 2)
                textMeshZ.rotateY(-Math.PI / 2)
                textMeshZ.rotateX(Math.PI)
            }
            metrage.add(textMeshZ);
        }
    })
}



export const makeTextSprite = (message, parameters) => {
    if (parameters === undefined) parameters = {};

    var fontface = parameters.hasOwnProperty("fontface") ?
        parameters["fontface"] : "Arial";

    var fontsize = parameters.hasOwnProperty("fontsize") ?
        parameters["fontsize"] : 18;

    var borderThickness = parameters.hasOwnProperty("borderThickness") ?
        parameters["borderThickness"] : 4;

    var borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : { r: 0, g: 0, b: 0, a: 1.0 };

    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : { r: 255, g: 255, b: 255, a: 0 };

    // var spriteAlignment = SpriteAlignment.topLeft;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "Bold " + "256" + "px " + "Arial";

    // get size data (height depends only on font size)
    var metrics = context.measureText(message);
    var textWidth = metrics.width;

    // background color
    context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
        + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
        + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    roundRect(context, borderThickness / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.

    // text color
    context.fillStyle = "rgba(0, 0, 0, 1.0)";

    context.fillText(message, borderThickness, fontsize + borderThickness);

    // canvas contents will be used for a texture
    var texture = new Texture(canvas)
    texture.needsUpdate = true;

    var spriteMaterial = new SpriteMaterial(
        { map: texture, useScreenCoordinates: false })//, alignment: spriteAlignment });
    var sprite = new Sprite(spriteMaterial);
    sprite.scale.set(200, 100, 100);
    return sprite;
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}
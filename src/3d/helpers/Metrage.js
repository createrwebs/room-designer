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
import MainScene from "../MainScene";
import TextSprite from './TextSprite'
import Meuble from '../meubles/Meuble';
import { getSegment, segmentIntersect, getSize, Measures } from '../Utils'
import { Sides } from "../Constants";

const material1 = new LineBasicMaterial({ color: 0x000000, linewidth: 1, opacity: 1 });
const material2 = new LineBasicMaterial({ color: 0xBBBBBB, linewidth: 1, opacity: 1 });
const lineHeightInRoom = 2600
const minimalSpace = 99
const distance = 120//distance Text From Line

/*
new THREE.TextSprite({
    alignment: 'center',
    backgroundColor: 'rgba(0,0,0,0)',
    color: '#fff',
    fontFamily: 'sans-serif',
    fontSize: 1,
    fontStyle: 'normal',
    fontVariant: 'normal',
    fontWeight: 'normal',
    lineGap: 0.25,
    padding: 0.5,
    strokeColor: '#fff',
    strokeWidth: 0,
    text: '',
}, material)
*/
const makeTextSprite = (t) => {
    return new TextSprite({
        alignment: 'center',
        color: '#000000',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 80,
        fontStyle: 'bold',
        text: t,
    });
}

export const updateMetrage = () => {

    draw()
}

export const draw = () => {
    const metrage = new Group();
    metrage.name = "metrage"
    const walls = [Walls.R, Walls.B, Walls.L, Walls.F]
    walls.forEach(w => {
        const axis = Room.getAxisForWall(w)
        const meubles = Room.getMeublesOnWall(MainScene.meubles, w, axis)
        drawWall([], metrage, meubles, w, axis)
    });
    return metrage

}
const drawWall = (points, metrage, meubles, wall, axis) => {
    // console.log("drawWall", meubles, wall, axis)

    /*     Meuble.Joins.forEach(join => {
            const leftMeubleUid = join.substr(0, join.indexOf('-'));
            const leftMeuble = MainScene.meubles.find(m => m.getUid() === leftMeubleUid)
            const rightMeubleUid = join.substr(join.indexOf('-') + 1);
            const rightMeuble = MainScene.meubles.find(m => m.getUid() === rightMeubleUid)
                   
            //TODO how get groups of joined meubles ?
    
        }) 
        */
    let cotation, position, width
    meubles.forEach(meuble => {
        const box = new Box3().setFromObject(meuble.object)
        const joins = Meuble.isJoined(meuble)

        if (axis === "x") {
            position = box.min.x
            width = Math.round(box.max.x - box.min.x)
        }
        else if (axis === "z") {
            position = box.min.z
            width = Math.round(box.max.z - box.min.z)
        }
        if (joins && joins.includes(Sides.R)) {
            if (!Room.toRightDirection(wall)) {
                position += Measures.thick
            }
            width -= Measures.thick
        }
        // console.log(meuble, joins, position, width, wall, axis)
        cotation = drawOneCotation(position, width, wall, axis, material1)
        metrage.add(cotation)
    })

    // space between meubles
    if (meubles.length == 0) return
    let lastMeuble = null;
    let lastPos = 0, segment, spaces = [];
    let wallLength = (wall === Walls.L || wall === Walls.R) ? Room.xmax : Room.zmax
    meubles.forEach(m => {
        segment = getSegment(m.object, axis)
        spaces.push(new Space(lastPos, segment.min, lastMeuble, m))
        lastMeuble = m;
        lastPos = segment.max;//m.position;
    })
    spaces.push(new Space((segment ? segment.max : lastPos), wallLength, lastMeuble, null))
    spaces.forEach(space => {
        // console.log(wall, space)
        // if (space.prev && space.next) {
        width = Math.round(space.max - space.min)
        if (width > minimalSpace)
            cotation = drawOneCotation(space.min, width, wall, axis, material2)
        // console.log(meuble, joins, position, width, wall, axis)
        metrage.add(cotation)
        // }

    })

}
const drawOneCotation = (position, width, wall, axis, material = material2) => {
    // console.log("drawOneCotation", position,width, axis)

    const metrage = new Group();
    metrage.name = "metrage"
    let points = [], geometry, label
    const abscis = axis === "x" ? (wall === Walls.R ? 0 : Room.zmax) : wall === Walls.F ? 0 : Room.xmax
    const textMesh = makeTextSprite(Math.round(width).toString() + "mm");//round? ceil? floor?

    if (axis === "x") {
        points.push(new Vector3(position, lineHeightInRoom, abscis));
        points.push(new Vector3(position + width, lineHeightInRoom, abscis));
        geometry = new BufferGeometry().setFromPoints(points)
        geometry.name = "metrage-geometry"
        metrage.add(new LineSegments(geometry, material))

        points = []
        points.push(new Vector3(position, lineHeightInRoom, abscis));
        points.push(new Vector3(position, Room.ymax, abscis));
        geometry = new BufferGeometry().setFromPoints(points)
        metrage.add(new LineSegments(geometry, material2))

        points = []
        points.push(new Vector3(position + width, lineHeightInRoom, abscis));
        points.push(new Vector3(position + width, Room.ymax, abscis));
        geometry = new BufferGeometry().setFromPoints(points)
        metrage.add(new LineSegments(geometry, material2))

        textMesh.position.x = position + width / 2
        textMesh.position.y = lineHeightInRoom + 80
        textMesh.position.z = wall === Walls.R ? -distance : Room.zmax + distance
        if (wall === Walls.R) {
            textMesh.rotateX(-Math.PI / 2)
        }
        else {
            textMesh.rotateY(Math.PI)
            textMesh.rotateX(-Math.PI / 2)
        }
    }
    else if (axis === "z") {
        points.push(new Vector3(abscis, lineHeightInRoom, position));
        points.push(new Vector3(abscis, lineHeightInRoom, position + width));
        geometry = new BufferGeometry().setFromPoints(points)
        geometry.name = "metrage-geometry"
        metrage.add(new LineSegments(geometry, material))

        points = []
        points.push(new Vector3(abscis, lineHeightInRoom, position));
        points.push(new Vector3(abscis, Room.ymax, position));
        geometry = new BufferGeometry().setFromPoints(points)
        metrage.add(new LineSegments(geometry, material2))

        points = []
        points.push(new Vector3(abscis, lineHeightInRoom, position + width));
        points.push(new Vector3(abscis, Room.ymax, position + width));
        geometry = new BufferGeometry().setFromPoints(points)
        metrage.add(new LineSegments(geometry, material2))

        textMesh.position.x = wall === Walls.F ? -distance : Room.xmax + distance
        textMesh.position.y = lineHeightInRoom + 80
        textMesh.position.z = position + width / 2
        if (wall === Walls.R) {
            textMesh.rotateX(-Math.PI / 2)
        }
        else {
            textMesh.rotateY(Math.PI)
            textMesh.rotateX(-Math.PI / 2)
        }
    }
    metrage.add(textMesh);

    return metrage
}


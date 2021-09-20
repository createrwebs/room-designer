import {
    LineBasicMaterial,
    Box3,
    Vector3,
    BufferGeometry,
    LineSegments,
    Group,
} from "three";
import { Walls, Corners, Sides } from '../Constants';
import { Space } from '../Space';
import Room from '../Room';
import MainScene from "../MainScene";
import TextSprite from './TextSprite'
import Meuble from '../meubles/Meuble';
import { getSegment, Measures } from '../Utils'

const materialBold = new LineBasicMaterial({ color: 0x000000, linewidth: 1, opacity: 1 });
const materialLight = new LineBasicMaterial({ color: 0xBBBBBB, linewidth: 1, opacity: 1 });
const lineHeight1 = 2600
const lineHeight2 = lineHeight1 + 400
const minSpaceWidth = 99
const distance = 120//distance Text From Line

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
let jointMetrages = []
export const draw = () => {
    const metrage = new Group();
    metrage.name = "metrage"
    const walls = [Walls.R, Walls.B, Walls.L, Walls.F]
    jointMetrages = []

    // meubles & spaces cotations
    walls.forEach(w => {
        const axis = Room.getAxisForWall(w)
        const meubles = Room.getMeublesOnWall(MainScene.meubles, w, axis)
        drawWall([], metrage, meubles, w, axis)
    });

    // grouping joint meubles cotations
    let last, group
    walls.forEach(w => {
        const axis = Room.getAxisForWall(w)
        last = null
        group = null
        jointMetrages.filter(m => m.wall === w)
            .sort((a, b) => a.p - b.p).forEach(m => {
                if (last) {
                    if (last.p + last.w == m.p) {
                        if (group) {
                            group.w = (m.p + m.w) - group.p
                        }
                        else {
                            group = {
                                wall: m.wall,
                                p: last.p,
                                w: (m.p + m.w) - last.p
                            }
                        }

                    }
                    else {
                        if (group) {
                            metrage.add(drawOneCotation(group.p, group.w, w, axis, lineHeight2))
                        }
                        group = null
                    }
                }
                last = m
            })
        if (group) {
            metrage.add(drawOneCotation(group.p, group.w, w, axis, lineHeight2))
            group = null
        }
    });
    return metrage
}
const drawWall = (points, metrage, meubles, wall, axis) => {
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
        if (joins && joins.includes(Sides.R)) {// only left meuble reduces
            const jointUid = Meuble.Joins.find(join => join.substr(0, join.indexOf('-')) === meuble.getUid())
            const jointMeuble = MainScene.meubles.find(m => m.getUid() === jointUid.substr(jointUid.indexOf('-') + 1))
            if (jointMeuble
                && (jointMeuble.wall === wall || Object.values(Corners).includes(jointMeuble.wall))) {// angle meuble case
                if (!Room.toRightDirection(wall)) {
                    position += Measures.thick
                }
                width -= Measures.thick
            }
        }
        cotation = drawOneCotation(Math.round(position), width, wall, axis, lineHeight1, materialBold)
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
        width = Math.round(space.max - space.min)
        if (width > minSpaceWidth) {
            cotation = drawOneCotation(space.min, width, wall, axis, lineHeight1, materialLight)
            metrage.add(cotation)
        }
    })

}
const drawOneCotation = (position, width, wall, axis, height, material = materialLight) => {
    // console.log("drawOneCotation", position,width, axis)
    if (material != materialLight && height == lineHeight1)// real meuble
        jointMetrages.push({ wall: wall, p: position, w: width })
    const metrage = new Group();
    metrage.name = "metrage"
    let points = [], geometry, label
    const abscis = axis === "x" ? (wall === Walls.R ? 0 : Room.zmax) : wall === Walls.F ? 0 : Room.xmax
    const textMesh = makeTextSprite(Math.round(width).toString());//round? ceil? floor? + "mm"

    if (axis === "x") {
        points.push(new Vector3(position, height, abscis));
        points.push(new Vector3(position + width, height, abscis));
        geometry = new BufferGeometry().setFromPoints(points)
        geometry.name = "metrage-geometry"
        metrage.add(new LineSegments(geometry, material))

        points = []
        points.push(new Vector3(position, height, abscis));
        points.push(new Vector3(position, Room.ymax, abscis));
        geometry = new BufferGeometry().setFromPoints(points)
        metrage.add(new LineSegments(geometry, materialLight))

        points = []
        points.push(new Vector3(position + width, height, abscis));
        points.push(new Vector3(position + width, Room.ymax, abscis));
        geometry = new BufferGeometry().setFromPoints(points)
        metrage.add(new LineSegments(geometry, materialLight))

        textMesh.position.x = position + width / 2
        textMesh.position.y = height + 80
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
        points.push(new Vector3(abscis, height, position));
        points.push(new Vector3(abscis, height, position + width));
        geometry = new BufferGeometry().setFromPoints(points)
        geometry.name = "metrage-geometry"
        metrage.add(new LineSegments(geometry, material))

        points = []
        points.push(new Vector3(abscis, height, position));
        points.push(new Vector3(abscis, Room.ymax, position));
        geometry = new BufferGeometry().setFromPoints(points)
        metrage.add(new LineSegments(geometry, materialLight))

        points = []
        points.push(new Vector3(abscis, height, position + width));
        points.push(new Vector3(abscis, Room.ymax, position + width));
        geometry = new BufferGeometry().setFromPoints(points)
        metrage.add(new LineSegments(geometry, materialLight))

        textMesh.position.x = wall === Walls.F ? -distance : Room.xmax + distance
        textMesh.position.y = height + 80
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


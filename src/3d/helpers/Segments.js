import { LineBasicMaterial, Vector3, LineSegments, BufferGeometry } from "three";
import { Walls } from '../Constants';
import { Space } from '../Space';
import Room from '../Room';

const lineHeightInRoom = 2400

export const draw = () => {
    const material = new LineBasicMaterial({ color: 0x44EE33, linewidth: 3, opacity: 1 });
    const points = []
    const walls = [Walls.R, Walls.B, Walls.L, Walls.F]
    walls.forEach(w => drawOne(points, w, Room.getAxisForWall(w)));
    const geometry = new BufferGeometry().setFromPoints(points)
    geometry.name = "segments-geometry"
    return new LineSegments(geometry, material);
}
export const drawInMeuble = (meubleUid) => {
    const material = new LineBasicMaterial({ color: 0x22EE01, linewidth: 3, opacity: 1 });
    const points = []
    Space.onWall[meubleUid].forEach(s => drawOne(points, meubleUid, "y"))
    const geometry = new BufferGeometry().setFromPoints(points)
    geometry.name = "segments-geometry"
    return new LineSegments(geometry, material);
}
const drawOne = (points, w, axis,) => {
    Space.onWall[w].forEach(s => {
        if (axis === "x") {// for meubles in room
            points.push(new Vector3(s.min, lineHeightInRoom, w === Walls.R ? 0 : Room.zmax));
            points.push(new Vector3(s.max, lineHeightInRoom, w === Walls.R ? 0 : Room.zmax));
        }
        else if (axis === "z") {// for meubles in room
            points.push(new Vector3(w === Walls.F ? 0 : Room.xmax, lineHeightInRoom, s.min));
            points.push(new Vector3(w === Walls.F ? 0 : Room.xmax, lineHeightInRoom, s.max));
        }
        else if (axis === "y") {// for items in meuble
            points.push(new Vector3(0, s.min, 0));
            points.push(new Vector3(0, s.max, 0));
        }
    })
}
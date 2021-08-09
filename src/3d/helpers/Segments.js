import { LineBasicMaterial, Vector3, LineSegments, BufferGeometry } from "three";
import { Space, Room, Walls, Corners } from '../Drag';

export const draw = () => {
    const material = new LineBasicMaterial({ color: 0x44EE33, linewidth: 3, opacity: 1 });
    const points = []
    let axis
    [Walls.R, Walls.B, Walls.L, Walls.F].forEach(w => {
        axis = Room.getAxisForWall(w)
        Space.onWall[w].forEach(s => {
            if (axis === "x") {
                points.push(new Vector3(s.min, 2400, w === Walls.R ? 0 : Room.zmax));
                points.push(new Vector3(s.max, 2400, w === Walls.R ? 0 : Room.zmax));
            }
            else {
                points.push(new Vector3(w === Walls.F ? 0 : Room.xmax, 2400, s.min));
                points.push(new Vector3(w === Walls.F ? 0 : Room.xmax, 2400, s.max));
            }
        })
    });
    return new LineSegments(new BufferGeometry().setFromPoints(points), material);
}
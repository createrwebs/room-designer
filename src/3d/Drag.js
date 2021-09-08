import Room from './Room';
import { Space } from './Space';
import { Walls, Corners } from "./Constants";

const insideRoomThreshold = 620// mm de drag contre le mur pour changer
const enterWallThreshold = 300// mm de drag dans un mur pour changer

/* dragging help routines & objects */

// get closest value from x in array
export const getClosestInArray = (x, array) => {
    return array.reduce(function (prev, curr) {
        return (Math.abs(curr - x) < Math.abs(prev - x) ? curr : prev);
    });
}

/*
    dragging routine : position regions on floor (x,z) determine meuble locations
    from walls and corners to walls and corners
    @param {string}  wall         wall or corner from the room
    @param {Vector3} position    mouse position (x,y,z)
*/
export const getWallChange = (wall, position) => {

    const x = position.x
    const z = position.z
    const t1 = insideRoomThreshold
    const t2 = enterWallThreshold

    switch (wall) {
        case Walls.F:
            if (z < -t2 && x < -t2) {
                return Corners.FR
            }
            if (z > t2 + Room.zmax && x < -t2) {
                return Corners.LF
            }
            if (z < t1 && x > t1 && Space.onWall[Walls.R].length > 0) {
                return Walls.R
            }
            if (z > Room.zmax - t1 && x > t1 && Space.onWall[Walls.L].length > 0) {
                return Walls.L
            }
            break;
        case Walls.B:
            if (z < -t2 && x > t2 + Room.xmax) {
                return Corners.RB
            }
            if (z > t2 + Room.zmax && x > t2 + Room.xmax) {
                return Corners.BL
            }
            if (z < t1 && x < Room.xmax - t1 && Space.onWall[Walls.R].length > 0) {
                return Walls.R
            }
            if (z > Room.zmax - t1 && x < Room.xmax - t1 && Space.onWall[Walls.L].length > 0) {
                return Walls.L
            }
            break;
        case Walls.R:
            if (z < -t2 && x < -t2) {
                return Corners.FR
            }
            if (z < -t2 && x > t2 + Room.xmax) {
                return Corners.RB
            }
            if (x < t1 && z > t1 && Space.onWall[Walls.F].length > 0) {
                return Walls.F
            }
            if (x > Room.xmax - t1 && z > t1 && Space.onWall[Walls.B].length > 0) {
                return Walls.B
            }
            break;
        case Walls.L:
            if (z > t2 + Room.zmax && x < -t2) {
                return Corners.LF
            }
            if (z > t2 + Room.zmax && x > t2 + Room.xmax) {
                return Corners.BL
            }
            if (x < t1 && z < Room.zmax - t1 && Space.onWall[Walls.F].length > 0) {
                return Walls.F
            }
            if (x > Room.xmax - t1 && z < Room.zmax - t1 && Space.onWall[Walls.B].length > 0) {
                return Walls.B
            }
            break;
        case Corners.FR:
            if (x < t1 && z > t1 && Space.onWall[Walls.F].length > 0) {
                return Walls.F
            }
            if (z < t1 && x > t1 && Space.onWall[Walls.R].length > 0) {
                return Walls.R
            }
            break;
        case Corners.RB:
            if (z < t1 && x < Room.xmax - t1 && Space.onWall[Walls.R].length > 0) {
                return Walls.R
            }
            if (x > Room.xmax - t1 && z > t1 && Space.onWall[Walls.B].length > 0) {
                return Walls.B
            }
            break;
        case Corners.BL:
            if (x > Room.xmax - t1 && z < Room.zmax - t1 && Space.onWall[Walls.B].length > 0) {
                return Walls.B
            }
            if (z > Room.zmax - t1 && x < Room.xmax - t1 && Space.onWall[Walls.L].length > 0) {
                return Walls.L
            }
            break;
        case Corners.LF:
            if (z > Room.zmax - t1 && x > t1 && Space.onWall[Walls.L].length > 0) {
                return Walls.L
            }
            if (x < t1 && z < Room.zmax - t1 && Space.onWall[Walls.F].length > 0) {
                return Walls.F
            }
            break;
        default:
    }
    return wall
}
/*
    a one-dim segment with a minimum and a maximum
*/
export class Space {
    static onWall = []// right,back,left,front | meuble uid
    static getClosest(wall, segment) {
        const space = Space.onWall[wall]
        if (!space) return null;
        if (space && space.length == 0) return null;
        space.sort((s1, s2) =>
            Math.min(segment.max - s2.min, s2.max - segment.min) - Math.min(segment.max - s1.min, s1.max - segment.min))
        return space[0]
    }
    constructor (min, max, prev, next) {
        this.min = min;
        this.max = max;
        this.prev = prev;// Draggable object (Meuble...) located at the minimum of the segment
        this.next = next;// Draggable object (Meuble...) located at the maximum of the segment
    }
    include(segment) {
        return segment.max <= this.max && segment.min >= this.min
    }
}
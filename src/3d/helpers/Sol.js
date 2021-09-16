import {
    LineBasicMaterial,
    Vector3,
    BufferGeometry,
    LineSegments,
    Group
} from "three";

const divisionWidth = 1000// <100 lag
const material = new LineBasicMaterial({ color: 0xBBBBBB, linewidth: 3, opacity: 1 });

export const create = (largeur, longueur) => {
    const points = [];
    let k = 0;
    while (k <= largeur) {
        points.push(new Vector3(k, 0, 0));
        points.push(new Vector3(k, 0, longueur));
        k += divisionWidth;
    }
    k = 0
    while (k <= longueur) {
        points.push(new Vector3(0, 0, k));
        points.push(new Vector3(largeur, 0, k));
        k += divisionWidth;
    }
    const geometry = new BufferGeometry().setFromPoints(points);
    const grid = new LineSegments(geometry, material);
    grid.name = "solgrid"
    // grid.position.x = largeur

    const sol = new Group();
    sol.name = "ruler"
    sol.add(grid);
    return sol;
}
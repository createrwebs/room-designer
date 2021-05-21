import * as THREE from "three";//TODO restrict to use

const divisionWidth = 1000// <100 lag
const material = new THREE.LineBasicMaterial({ color: 0xBBBBBB, linewidth: 3, opacity: 1 });

export const create = (largeur, longueur) => {
    console.log("createsolgrid", largeur, longueur);
    const points = [];
    let k = 0;
    while (k <= largeur) {
        points.push(new THREE.Vector3(k, 0, 0));
        points.push(new THREE.Vector3(k, 0, longueur));
        k += divisionWidth;
    }
    k = 0
    while (k <= longueur) {
        points.push(new THREE.Vector3(0, 0, k));
        points.push(new THREE.Vector3(largeur, 0, k));
        k += divisionWidth;
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const grid = new THREE.LineSegments(geometry, material);
    grid.name = "solgrid"
    // grid.position.x = largeur

    const sol = new THREE.Group();
    sol.name = "ruler"
    sol.add(grid);
    return sol;
}
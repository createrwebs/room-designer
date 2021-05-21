import * as THREE from "three";//TODO restrict to use

export const create = (size) => {
    const material = new THREE.LineBasicMaterial({ color: 0xAAAAAA, linewidth: 3, opacity: 1 });
    const points = []
    points.push(new THREE.Vector3(-size, 0, 0));
    points.push(new THREE.Vector3(size, 0, 0));
    points.push(new THREE.Vector3(0, 0, -size));
    points.push(new THREE.Vector3(0, 0, size));
    return new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points), material);
}
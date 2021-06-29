import { LineBasicMaterial, Vector3, LineSegments, BufferGeometry } from "three";

export const create = (size) => {
    const material = new LineBasicMaterial({ color: 0xAAAAAA, linewidth: 3, opacity: 1 });
    const points = []
    points.push(new Vector3(-size, 0, 0));
    points.push(new Vector3(size, 0, 0));
    points.push(new Vector3(0, 0, -size));
    points.push(new Vector3(0, 0, size));
    return new LineSegments(new BufferGeometry().setFromPoints(points), material);
}
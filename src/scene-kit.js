import * as THREE from 'three';

const materials = new Map();
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const sphereGeometries = new Map();
export function mat(color, opts = {}) {
  const key = `${color}:${JSON.stringify(opts)}`;
  if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0.02, ...opts }));
  return materials.get(key);
}
export function block(parent, x, z, w, h, d, color, baseY = 0) {
  const mesh = new THREE.Mesh(boxGeometry, color?.isMaterial ? color : mat(color));
  mesh.position.set(x, baseY + h / 2, z); mesh.scale.set(w, h, d);
  mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
export function cylinder(parent, x, z, rTop, rBottom, height, color, baseY = 0, sides = 12) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, height, sides), color?.isMaterial ? color : mat(color));
  mesh.position.set(x, baseY + height / 2, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
export function sphere(parent, x, y, z, rx, ry, rz, color, detail = 1) {
  if (!sphereGeometries.has(detail)) sphereGeometries.set(detail, new THREE.IcosahedronGeometry(1, detail));
  const mesh = new THREE.Mesh(sphereGeometries.get(detail), color?.isMaterial ? color : mat(color));
  mesh.position.set(x, y, z); mesh.scale.set(rx, ry, rz); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
export function area(parent, points, color, topY = 0, depth = 0) {
  const shape = new THREE.Shape(points.map(([x, z]) => new THREE.Vector2(x, -z)));
  const geo = depth > 0 ? new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, steps: 1 }) : new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, color?.isMaterial ? color : mat(color, { side: THREE.DoubleSide }));
  mesh.position.y = topY - depth; mesh.receiveShadow = true; mesh.castShadow = depth > 0; parent.add(mesh); return mesh;
}
export function ribbon(parent, points, width, color, y = 0.1, segments = 128) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, y, z)), false, 'centripetal');
  const positions = [], indices = [], uvs = [];
  for (let i = 0; i <= segments; i++) {
    const p = curve.getPoint(i / segments), t = curve.getTangent(i / segments);
    const nx = -t.z * width / 2, nz = t.x * width / 2;
    positions.push(p.x + nx, p.y, p.z + nz, p.x - nx, p.y, p.z - nz); uvs.push(0, i / segments, 1, i / segments);
    if (i < segments) { const a = i * 2; indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geo.setIndex(indices); geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, color?.isMaterial ? color : mat(color, { side: THREE.DoubleSide })); mesh.receiveShadow = true; parent.add(mesh); return { mesh, curve };
}
export function tree(parent, x, z, scale = 1, baseY = 0) {
  const group = new THREE.Group(); parent.add(group);
  cylinder(group, x, z, 0.17 * scale, 0.25 * scale, 1.3 * scale, 0x8a7960, baseY, 5);
  sphere(group, x, baseY + 2.4 * scale, z, 1.1 * scale, 1.65 * scale, 1.1 * scale, 0x77966a, 1);
  return group;
}
export function line(parent, points, color = 0xffffff, opacity = 1) {
  const geo = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p)));
  const object = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity })); parent.add(object); return object;
}
export function roof(parent, x, z, w, h, d, color, baseY = 0) {
  const a = [-w / 2, 0, -d / 2], b = [w / 2, 0, -d / 2], c = [w / 2, 0, d / 2], e = [-w / 2, 0, d / 2];
  const l = [-w * .26, h, 0], r = [w * .26, h, 0];
  const vertices = [...a, ...l, ...b, ...b, ...l, ...r, ...b, ...r, ...c, ...c, ...r, ...l, ...c, ...l, ...e, ...e, ...l, ...a, ...a, ...b, ...e, ...b, ...c, ...e];
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, color?.isMaterial ? color : mat(color, { side: THREE.DoubleSide })); mesh.position.set(x, baseY, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
export function rng(seed = 1) {
  return function () { let t = seed += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

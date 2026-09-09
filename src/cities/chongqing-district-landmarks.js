import * as THREE from 'three';
import { block, cylinder, sphere, roof, tree, area, ribbon, mat, rng } from '../scene-kit.js';

// Original, deliberately compressed dioramas. Local ground is y=0. Geographic
// positioning and the shared static-mesh merge belong to chongqing.js.
const C = {
  stone: 0xddd6bf, pale: 0xf4e5ca, cream: 0xe5cba4, white: 0xf6eee0,
  brick: 0xa96650, red: 0xb24d3b, dark: 0x435654, tile: 0x4d7775,
  wood: 0x77553b, glass: 0x6fa2aa, lawn: 0x8fac75, grass: 0x769969,
  green: 0x4b775c, water: 0x76b3b3, gold: 0xd5ad64, road: 0x898d84,
};
const glass = mat(C.glass, { roughness: 0.3, metalness: 0.18 });
const water = mat(C.water, { roughness: 0.26, metalness: 0.16 });
const glow = mat(0xffdb9b, { emissive: 0xffb758, emissiveIntensity: 0.02, roughness: 0.5 });
const screen = mat(0x6aaeb4, { emissive: 0x72c3e2, emissiveIntensity: 0.035, roughness: 0.4 });
glow.userData.nightGlow = true;
screen.userData.nightGlow = true;

function platform(g, w = 32, d = 28, color = C.stone, y = 0, h = 0.24) {
  return block(g, 0, 0, w, h, d, color, y);
}
function bars(g, x, z, w, h, depth, floors, y = 0, color = glow) {
  for (let j = 0; j < floors; j++) {
    block(g, x, z + depth / 2 + 0.04, w * 0.78, 0.32, 0.065, color, y + 1.2 + j * (h - 1.4) / Math.max(1, floors));
  }
}
function facade(g, x, z, w, h, d, color, y = 0, floors = 3) {
  block(g, x, z, w, h, d, color, y);
  block(g, x, z, w + 0.35, 0.23, d + 0.35, C.pale, y + h);
  bars(g, x, z, w, h, d, floors, y);
}
function stairs(g, x, z, w, rise = 1.5, run = 4, count = 6, y = 0) {
  for (let i = 0; i < count; i++) {
    block(g, x, z - run * i / count, w, rise * (i + 1) / count, run / count + 0.04, C.stone, y);
  }
}
function traditional(g, x, z, w = 5, d = 4, h = 3.7, y = 0, tile = C.dark, wall = C.cream) {
  block(g, x, z, w, h, d, wall, y);
  roof(g, x, z, w + 1.0, 1.45, d + 1, tile, y + h);
  block(g, x, z, w * 0.55, 0.18, 0.24, tile, y + h + 1.44);
  block(g, x, z + d / 2 + 0.07, w * 0.82, 0.25, 0.15, C.wood, y + h * 0.54);
  block(g, x, z + d / 2 + 0.08, 0.7, 1.65, 0.13, C.wood, y);
  for (const dx of [-w * 0.31, w * 0.31]) block(g, x + dx, z + d / 2 + 0.09, 0.65, 0.75, 0.12, glow, y + h * 0.42);
}
function pavilion(g, x, z, r = 2.7, y = 0, color = C.tile) {
  cylinder(g, x, z, r, r + 0.3, 0.4, C.stone, y, 8);
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + i * Math.PI / 2;
    cylinder(g, x + Math.cos(a) * r * 0.7, z + Math.sin(a) * r * 0.7, 0.13, 0.16, 2.7, C.red, y + 0.4, 6);
  }
  cylinder(g, x, z, r * 0.19, r * 1.21, 1.45, color, y + 3.1, 8);
  cylinder(g, x, z, 0, 0.25, 0.7, C.gold, y + 4.55, 8);
}
function gate(g, x, z, w = 7, y = 0) {
  for (const dx of [-w / 2, w / 2]) {
    block(g, x + dx, z, 0.95, 0.55, 1.35, C.stone, y);
    block(g, x + dx, z, 0.65, 4.8, 0.75, C.red, y + 0.5);
  }
  block(g, x, z, w + 1, 1.2, 0.7, C.cream, y + 3.4);
  block(g, x, z + 0.4, w * 0.39, 0.64, 0.1, C.tile, y + 3.67);
  roof(g, x, z, w + 2.4, 1.6, 2.6, C.tile, y + 4.6);
}
function planting(g, points, scale = 1, y = 0) {
  for (const [x, z] of points) tree(g, x, z, scale, y);
}
function circle(g, x, z, r, color, y = 0.28, h = 0.08) {
  return cylinder(g, x, z, r, r, h, color, y, 24);
}
function beam(g, a, b, radius = 0.15, color = C.dark) {
  const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b);
  const direction = to.clone().sub(from);
  const mesh = cylinder(g, 0, 0, radius, radius, direction.length(), color, 0, 6);
  mesh.position.copy(from.add(to).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return mesh;
}

function auditorium(g) {
  platform(g, 33, 29);
  block(g, 0, -3.5, 25.5, 0.55, 16, C.white, 0.24);
  stairs(g, 0, 7.3, 12, 0.8, 3, 4, 0.24);
  cylinder(g, 0, -3, 6.15, 6.5, 5.4, C.red, 0.8, 32);
  for (let i = 0; i < 16; i++) {
    const a = i * Math.PI / 8;
    cylinder(g, Math.sin(a) * 6.3, -3 + Math.cos(a) * 6.3, 0.17, 0.22, 4.1, C.red, 0.9, 6);
  }
  for (const [r, y, h] of [[7.25, 5.4, 2.45], [5.5, 8, 2.1], [3.7, 10.2, 2.5]]) {
    cylinder(g, 0, -3, r, r, 0.24, C.gold, y, 40);
    cylinder(g, 0, -3, r * 0.43, r, h, C.tile, y + 0.24, 40);
  }
  cylinder(g, 0, -3, 0.16, 1.0, 1.0, C.tile, 12.8, 24);
  sphere(g, 0, 14.05, -3, 0.31, 0.48, 0.31, C.gold);
  for (const x of [-11.3, 11.3]) {
    traditional(g, x, -3.5, 5, 10, 3.6, 0.8, C.tile, C.pale);
    block(g, x, 2, 4.3, 0.3, 1, C.white, 3.45);
  }
  circle(g, 0, 10.3, 2.1, water);
  for (const x of [-12.5, 12.5]) for (const z of [8, 12]) circle(g, x, z, 1.8, C.lawn);
  planting(g, [[-13, 8], [13, 8], [-13, 12], [13, 12]], 0.72, 0.4);
}

function guanyinqiao(g) {
  platform(g, 34, 30);
  facade(g, -9, -6, 10, 10.3, 10, C.cream, 0.24, 4);
  facade(g, 7.2, -6.5, 10.8, 15, 10, glass, 0.24, 5);
  block(g, -7.8, -0.85, 11, 6.5, 0.45, C.dark, 3.6);
  block(g, -7.8, -0.55, 10.4, 5.9, 0.15, screen, 3.9);
  // Abstract graphic on the plaza's giant screen: original geometric artwork.
  for (const [x, y, w, h, color] of [[-10, 5.2, 1.1, 3.7, C.gold], [-7.7, 5.2, 1.1, 2.5, C.white], [-5.4, 5.2, 1.1, 4.3, C.red]]) {
    block(g, x, -0.44, w, h, 0.1, color, y);
  }
  block(g, 7.2, -6.5, 9.5, 0.25, 8.7, C.pale, 15.6);
  for (const x of [3.2, 7.2, 11.2]) block(g, x, -1.37, 0.24, 14.3, 0.14, C.white, 0.8);
  circle(g, 0.5, 8.4, 5.7, C.pale);
  circle(g, 0.5, 8.4, 4.65, C.road, 0.39);
  circle(g, 0.5, 8.4, 3.45, water, 0.5);
  // Red ribbon sculpture evokes the plaza's public-art character.
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.8, 1, 8.4), new THREE.Vector3(0.8, 4.4, 8.4), new THREE.Vector3(2.0, 5.1, 8.4), new THREE.Vector3(2.2, 2.2, 8.4)]);
  const sculpture = new THREE.Mesh(new THREE.TubeGeometry(curve, 18, 0.38, 6, false), mat(C.red));
  sculpture.castShadow = true; g.add(sculpture);
  planting(g, [[-13, 7], [-13, 12], [13, 7], [13, 12]], 0.9, 0.3);
  for (const x of [-8, 8]) block(g, x, 12.5, 3, 0.55, 0.65, C.wood, 0.3);
}

function danzishi(g) {
  platform(g, 33, 30);
  for (let row = 0; row < 3; row++) {
    const z = 9 - row * 8.5, level = 0.25 + row * 2.2;
    block(g, 0, z - 1.3, 30 - row * 2, 0.6 + row * 2.2, 8.5, C.cream, 0.2);
    for (const x of [-9.5, 9.5]) traditional(g, x, z - 1.5, 6.3, 5.2, 4, level + 0.6, C.dark);
    stairs(g, 0, z + 3, 4.8, 2.2, 7.1, 7, level);
  }
  gate(g, 0, -10.5, 5.9, 5.1);
  block(g, -14.5, 0.5, 0.6, 4.8, 1, C.wood, 0.35);
  block(g, 14.5, 0.5, 0.6, 4.8, 1, C.wood, 0.35);
  planting(g, [[-13.9, 12.2], [13.9, 12.2]], 0.8, 0.5);
}

function ciqikou(g) {
  platform(g, 34, 30, C.cream);
  for (let row = 0; row < 3; row++) {
    const z = 6.5 - row * 8.2, y = 0.24 + row * 1.1;
    block(g, 0, z, 32 - row, 0.3 + row * 1.1, 8, C.stone, 0);
    for (const side of [-1, 1]) {
      const x = side * (8.7 + (row % 2) * 1.1);
      traditional(g, x, z - 0.6, 6.7, 5.3, 3.7 + row * 0.25, y, C.dark, row % 2 ? C.pale : C.cream);
      if (row < 2) {
        block(g, x, z + 2.7, 6.2, 0.24, 1.3, C.red, y + 2.6);
        sphere(g, x + side * 2.4, y + 2.1, z + 3.1, 0.32, 0.45, 0.32, C.red);
      }
    }
    stairs(g, 0, z + 3.2, 4.3, 1.1, 4.4, 5, y);
  }
  gate(g, 0, 11, 7, 0.3);
  planting(g, [[-14, 11], [14, 11]], 0.65, 0.25);
}

function cqu(g) {
  platform(g, 34, 31);
  block(g, 0, 7.2, 25, 0.15, 12.5, C.lawn, 0.24);
  block(g, 0, 7.5, 3.2, 0.12, 12, C.pale, 0.4);
  // The old science faculty's bilateral, shan-shaped massing.
  for (const [x, z, w, d] of [[0, -7, 24, 5.8], [-9, -3.4, 6, 9.5], [9, -3.4, 6, 9.5], [0, -3.3, 5, 9]]) {
    traditional(g, x, z, w, d, 6.2, 0.28, C.dark, C.brick);
  }
  block(g, 0, 1.5, 4.6, 0.4, 3.2, C.stone, 0.28);
  for (const x of [-1.5, 1.5]) block(g, x, 1.2, 0.38, 4.3, 0.4, C.pale, 0.68);
  roof(g, 0, 1.2, 5.4, 1.1, 3.2, C.dark, 5.0);
  for (const x of [-13.8, -7, 7, 13.8]) block(g, x, 13, 0.6, x === -7 || x === 7 ? 3.5 : 2.6, 0.8, C.cream, 0.3);
  for (const x of [-10.4, 10.4]) block(g, x, 13, 6.2, 0.3, 0.55, C.cream, 2.4);
  planting(g, [[-12, 6], [12, 6], [-12, 11], [12, 11]], 0.87, 0.3);
}

function huangjueping(g) {
  platform(g, 33, 30);
  block(g, 0, 1.5, 31, 0.08, 5.2, C.road, 0.3);
  const palette = [0xd38579, 0x88b1a5, 0xdfb74e, 0x7791b7, 0xb6a0bf];
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 6.05, z = -5.6, h = 7.2 + (i % 3) * 1.7;
    facade(g, x, z, 5.6, h, 6.2, palette[i], 0.3, 2);
    for (let j = 0; j < 3; j++) {
      const patch = block(g, x + (j - 1) * 1.45, -2.37, 1.35, 2.1 + (j % 2), 0.08, palette[(i + j + 2) % 5], 2.3 + (j % 2) * 3);
      patch.rotation.z = (j - 1) * 0.25;
    }
    const disk = circle(g, x - 1.2, 0, 0.73, palette[(i + 3) % 5], 0, 0.12);
    disk.rotation.x = Math.PI / 2; disk.position.set(x - 1.2, h - 0.9, -2.23);
  }
  // An oversized easel and a hollow frame make the art street legible overhead.
  for (const x of [-3.8, 3.8]) beam(g, [x, 0.5, 11], [x * 0.72, 6.8, 8.5], 0.2, C.wood);
  block(g, 0, 8.9, 8.1, 0.5, 0.4, C.gold, 2.2);
  block(g, 0, 8.9, 8.1, 0.5, 0.4, C.gold, 6.5);
  for (const x of [-3.8, 3.8]) block(g, x, 8.9, 0.5, 4.8, 0.4, C.gold, 2.2);
  planting(g, [[-13, 9.5], [13, 9.5]], 0.95, 0.3);
  for (let i = 0; i < 5; i++) block(g, -12.2 + i * 1.3, 5.1, 0.9, 0.07, 1.8, palette[i], 0.4);
}

function panda(g, x, z, s = 1, y = 0) {
  const p = new THREE.Group(); g.add(p); p.position.set(x, y, z); p.scale.setScalar(s);
  sphere(p, 0, 1.45, 0, 1.05, 1.2, 0.88, C.white);
  sphere(p, 0, 2.8, 0.3, 1, 0.87, 0.8, C.white);
  for (const side of [-1, 1]) {
    sphere(p, side * 0.75, 3.38, 0.3, 0.34, 0.35, 0.32, C.dark);
    sphere(p, side * 0.4, 2.94, 1.0, 0.26, 0.34, 0.1, C.dark);
    sphere(p, side * 0.92, 1.65, 0.1, 0.38, 0.7, 0.38, C.dark);
    sphere(p, side * 0.61, 0.63, 0.54, 0.52, 0.4, 0.65, C.dark);
  }
  sphere(p, 0, 2.65, 1.12, 0.2, 0.14, 0.13, C.dark);
}

function zoo(g) {
  platform(g, 40, 32, C.grass);
  ribbon(g, [[-17, 8], [-8, 10], [3, 9], [15, 5]], 2.6, C.pale, 0.35, 20);
  circle(g, -7, -2, 7.2, C.stone, 0.25, 0.27);
  circle(g, -7, -2, 6.6, C.lawn, 0.5, 0.1);
  circle(g, 8, -3, 7.1, C.stone, 0.25, 0.27);
  circle(g, 8, -3, 6.5, C.lawn, 0.5, 0.1);
  panda(g, -7, -2, 1.35, 0.6); panda(g, 8, -2.3, 1.0, 0.6);
  for (const [x, z] of [[-10, -6], [-3, -6], [5, -6], [12, -7]]) {
    cylinder(g, x, z, 0.14, 0.18, 4, C.green, 0.6, 6);
    sphere(g, x, 4.1, z, 0.72, 1.1, 0.72, C.green);
  }
  for (const x of [-6, 6]) block(g, x, 12.2, 1.8, 4.2, 2, C.cream, 0.3);
  block(g, 0, 12.2, 15, 1.0, 1.5, C.tile, 4.4);
  roof(g, 0, 12.2, 16.4, 1.3, 3.2, C.tile, 5.4);
  planting(g, [[-17, -10], [17, -10], [-17, 0], [17, 0], [-15, 13], [15, 13]], 1.15, 0.3);
  beam(g, [-11, 1.4, 0], [-3.2, 1.4, -1], 0.22, C.wood);
  beam(g, [4, 1.4, 1], [11.5, 1.4, 0], 0.22, C.wood);
}

function industrialMuseum(g) {
  platform(g, 35, 31, C.stone);
  block(g, -5, -5, 19, 5, 12, C.brick, 0.3);
  for (let i = 0; i < 4; i++) roof(g, -12.1 + i * 4.7, -5, 5, 1.7, 12.7, C.dark, 5.3);
  for (let i = 0; i < 6; i++) block(g, -12.3 + i * 3.0, 1.07, 1.65, 2.1, 0.13, glass, 1.8);
  cylinder(g, 10.2, -6.5, 1.6, 2.5, 8.5, C.brick, 0.3, 12);
  cylinder(g, 10.2, -6.5, 1.0, 1.6, 5.2, C.dark, 8.8, 12);
  cylinder(g, 10.2, -6.5, 1.1, 1.1, 0.4, C.gold, 13.7, 12);
  for (const x of [6.9, 13.5]) for (const z of [-10, -3]) block(g, x, z, 0.28, 11.5, 0.28, C.dark, 0.3);
  for (const y of [4.3, 8.1, 11.6]) {
    block(g, 10.2, -6.5, 7.2, 0.23, 7.5, C.dark, y);
    beam(g, [6.9, y - 3.7, -2.8], [13.5, y, -2.8], 0.12, C.gold);
  }
  cylinder(g, -13.3, -10.2, 0.6, 0.85, 13.2, C.brick, 0.3, 10);
  cylinder(g, -13.3, -10.2, 0.72, 0.72, 0.45, C.cream, 12.5, 10);
  for (const z of [7.3, 10.5]) block(g, -2, z, 26, 0.14, 0.18, C.dark, 0.4);
  for (let i = 0; i < 11; i++) block(g, -14 + i * 2.4, 8.9, 0.5, 0.12, 4, C.wood, 0.3);
  const roll = cylinder(g, -4, 8.9, 1.65, 1.65, 4.6, C.dark, 0, 16);
  roll.rotation.z = Math.PI / 2; roll.position.y = 2.0;
  block(g, -4, 8.9, 6.9, 0.65, 3.6, C.brick, 0.5);
  for (const x of [-6, -2]) sphere(g, x, 0.95, 10.7, 0.58, 0.58, 0.3, C.dark);
  planting(g, [[14, 10], [-15, 13]], 0.7, 0.3);
}

function yidu(g) {
  platform(g, 34, 30, C.stone);
  block(g, 0, 11.5, 32.6, 0.1, 5.2, water, 0.26);
  for (let row = 0; row < 2; row++) {
    const y = 0.4 + row * 2.2, z = 4 - row * 11;
    block(g, 0, z, 31 - row * 2, y, 10, C.cream, 0);
    for (const x of [-9.4, 9.4]) traditional(g, x, z - 1.3, 6.7, 5.5, 4, y, C.dark);
    stairs(g, 0, z + 3.8, 5.6, 2.2, 6, 6, y);
  }
  // Open river-facing stage; a compressed generic cultural vignette, not a
  // claim that a particular reconstructed shop or stage sits at this position.
  block(g, 0, -8, 8.8, 0.7, 5.4, C.stone, 2.6);
  for (const x of [-3.5, 3.5]) cylinder(g, x, -5.8, 0.22, 0.28, 4, C.red, 3.3, 8);
  block(g, 0, -10, 8, 4, 0.5, C.red, 3.3);
  roof(g, 0, -8, 10.2, 2.0, 6.8, C.tile, 7.3);
  block(g, 0, 11.6, 3.8, 0.3, 4.7, C.wood, 0.4);
  for (const x of [-1.4, 1.4]) cylinder(g, x, 13.2, 0.16, 0.2, 1.2, C.wood, 0.2, 6);
  planting(g, [[-14, 6], [14, 6]], 0.77, 0.5);
}

function jinyun(g) {
  const mountain = (x, z, rx, ry, rz, color, y) => sphere(g, x, y, z, rx, ry, rz, color, 1);
  // Overlapping low-poly shoulders retain a layered mountain silhouette.
  mountain(-4, -2, 18, 7, 15, 0x79936d, 7);
  mountain(-8, -5, 12, 9.5, 12, 0x638363, 9.5);
  mountain(7, -3, 11, 8, 11, 0x6e8b65, 8);
  mountain(-9, -6, 6.5, 8, 6.8, 0x637565, 11.2);
  mountain(4, -6, 6, 10, 6.5, 0x71866b, 10.7);
  block(g, 5.3, 6.3, 10.4, 0.7, 6.5, C.stone, 7.2);
  traditional(g, 5.3, 6.3, 8.1, 4.5, 3.1, 7.9, C.tile, C.pale);
  block(g, -8, -6, 3.4, 0.3, 3.4, C.stone, 19.2);
  pavilion(g, -8, -6, 1.75, 19.5);
  const rand = rng(430106);
  for (let i = 0; i < 14; i++) {
    const a = i * Math.PI * 2 / 14, r = 13 + rand() * 3;
    tree(g, Math.cos(a) * r - 2, Math.sin(a) * r - 1, 0.7 + rand() * 0.3, 2.8 + rand() * 3.5);
  }
  for (let i = 0; i < 8; i++) block(g, -0.3 + i * 0.67, 13 - i * 0.9, 1.8, 0.25, 1.1, C.stone, 2.6 + i * 0.66);
}

function swu(g) {
  platform(g, 34, 31);
  block(g, 0, 4, 27, 0.13, 17, C.lawn, 0.25);
  block(g, 0, 3, 3.8, 0.08, 19, C.pale, 0.4);
  facade(g, 0, -8.5, 25, 7.8, 7.2, C.cream, 0.28, 3);
  block(g, 0, -4.7, 7.3, 8.8, 1.3, C.pale, 0.28);
  for (const x of [-2.5, 0, 2.5]) block(g, x, -3.99, 0.75, 5.5, 0.12, glass, 2.5);
  roof(g, 0, -8.3, 27, 1.65, 8.4, C.dark, 8.2);
  // Simplified monumental paired entrance; exact inscriptions are left to UI.
  for (const side of [-1, 1]) {
    block(g, side * 5.4, 11, 1.55, 5.6, 1.6, C.pale, 0.3);
    block(g, side * 9.3, 11, 6.2, 3.2, 1.2, C.cream, 0.3);
    block(g, side * 8.4, 11, 8.5, 0.5, 1.6, C.pale, 3.6);
    block(g, side * 5.4, 11, 2.05, 0.35, 2.1, C.cream, 5.9);
    block(g, side * 9.5, 11.7, 3.9, 0.3, 0.08, C.tile, 2.1);
  }
  planting(g, [[-11, 0], [11, 0], [-11, 5], [11, 5], [-5, 3], [5, 3]], 0.82, 0.4);
}

function centralPark(g) {
  platform(g, 34, 32, C.grass);
  block(g, 0, 1, 19, 0.1, 22, C.lawn, 0.28);
  block(g, 0, 1, 2.4, 0.08, 25, C.pale, 0.4);
  block(g, 0, -10.5, 19, 0.1, 7.1, C.pale, 0.4);
  circle(g, 0, -10.5, 2.8, water, 0.55);
  circle(g, 0, -10.5, 0.7, C.stone, 0.68, 0.3);
  cylinder(g, 0, -10.5, 0.08, 0.18, 2.2, screen, 0.95, 6);
  for (const x of [-11.8, 11.8]) for (let i = 0; i < 6; i++) tree(g, x, -12.5 + i * 4.8, 0.75, 0.3);
  for (const x of [-7.2, 7.2]) for (const z of [-4, 4, 10]) block(g, x, z, 4.4, 0.1, 3.6, 0x9ab784, 0.4);
  ribbon(g, [[-16, 7], [-13.8, 3], [-15.1, -3], [-14.3, -9]], 1.15, water, 0.35, 18);
  for (const x of [-3, 3]) block(g, x, 12.4, 2.5, 0.45, 0.7, C.wood, 0.4);
}

function airplane(g, x, z, heading = 0, scale = 1) {
  const p = new THREE.Group(); p.position.set(x, 0.8, z); p.rotation.y = heading; p.scale.setScalar(scale); g.add(p);
  sphere(p, 0, 0.4, 0, 0.56, 0.52, 4.8, C.white, 1);
  const wing = area(p, [[-0.4, -0.9], [-5, 1.8], [-4.8, 2.4], [0, 0.8], [4.8, 2.4], [5, 1.8], [0.4, -0.9]], C.white, 0.7, 0.16);
  wing.castShadow = true;
  area(p, [[-0.2, 3], [-2.3, 4.1], [-2.2, 4.6], [0, 3.8], [2.2, 4.6], [2.3, 4.1], [0.2, 3]], C.white, 0.8, 0.14);
  const tail = block(p, 0, 3.8, 0.16, 1.6, 1.8, C.tile, 0.7); tail.rotation.x = 0.18;
  sphere(p, 0, 0.55, -3.4, 0.46, 0.35, 0.85, glass);
  for (const dx of [-2, 2]) sphere(p, dx, 0.22, 0.7, 0.35, 0.35, 0.85, C.tile);
}

function airport(g) {
  platform(g, 73, 42, 0xbac2b1);
  block(g, 0, 14, 69, 0.08, 5.5, C.road, 0.28);
  block(g, 0, 8.8, 66, 0.06, 1.8, C.stone, 0.29);
  for (let i = 0; i < 15; i++) block(g, -31.5 + i * 4.5, 14, 2.6, 0.06, 0.24, C.white, 0.39);
  for (const x of [-31, 31]) for (const z of [12.3, 13.4, 14.5, 15.6]) block(g, x, z, 3.3, 0.06, 0.36, C.white, 0.39);
  block(g, -2, -7.3, 53, 0.1, 19.2, C.stone, 0.27);
  const terminal = new THREE.Group(); terminal.position.set(-4, 0.38, -8); g.add(terminal);
  sphere(terminal, 0, 3.2, 0, 10, 2.8, 4.8, C.white, 2);
  block(terminal, 0, 0, 17, 3.4, 6.8, glass, 0);
  // Four swept piers evoke the airport's phoenix-wings plan without asserting
  // a terminal-by-terminal site plan or current airline operations.
  for (const side of [-1, 1]) for (const fore of [-1, 1]) {
    const wing = new THREE.Group(); wing.rotation.y = side * fore * 0.26; wing.position.set(side * 11.2, 0, fore * 2.1); terminal.add(wing);
    block(wing, 0, 0, 15, 2.5, 3.2, glass, 0.4);
    block(wing, 0, 0, 16.5, 0.4, 4.0, C.white, 2.9);
    for (const x of [-4.8, 0, 4.8]) block(wing, x, fore * 2.6, 1.1, 1.1, 2.5, C.pale, 1.1);
  }
  cylinder(g, 27, -8, 0.7, 1.1, 8.2, C.pale, 0.3, 10);
  cylinder(g, 27, -8, 2.0, 1.4, 1.8, glass, 8.5, 10);
  cylinder(g, 27, -8, 2.15, 2.15, 0.25, C.white, 10.3, 10);
  beam(g, [27, 10.6, -8], [27, 12.2, -8], 0.08, C.dark);
  airplane(g, -5, 14, Math.PI / 2, 0.82);
  airplane(g, 17, 3, Math.PI, 0.69);
}

function longzhouwan(g) {
  platform(g, 34, 31);
  for (const [x, z, w, h, d] of [[-10, -7, 6.3, 12.8, 7], [-2.6, -8, 5.6, 17.2, 7], [5.2, -6.8, 6, 14.5, 7], [12, -6, 4.5, 10.1, 6]]) {
    facade(g, x, z, w, h, d, glass, 0.3, 4);
    block(g, x, z + d / 2 + 0.12, 0.26, h - 0.4, 0.15, C.pale, 0.6);
  }
  block(g, 0, 2.2, 30, 1.25, 4.8, C.cream, 0.3);
  block(g, 0, 2.2, 29.5, 0.12, 4.2, C.lawn, 1.55);
  block(g, 0, 11.6, 33, 0.08, 5.2, water, 0.3);
  ribbon(g, [[-16, 7], [-7, 8.2], [3, 7.7], [16, 6.7]], 2.1, C.pale, 0.46, 20);
  for (const x of [-13, -6.5, 6.5, 13]) tree(g, x, 5.5, 0.78, 0.4);
  circle(g, 0, 8.2, 3.9, C.pale, 0.38);
  circle(g, 0, 8.2, 2.35, C.gold, 0.5);
  for (const x of [-2.3, 2.3]) beam(g, [x, 0.65, 10.8], [x, 0.65, 14.4], 0.15, C.wood);
  for (let i = 0; i < 7; i++) block(g, 0, 11 + i * 0.48, 5.1, 0.14, 0.3, C.wood, 0.52);
}

function nanwenquan(g) {
  platform(g, 34, 31, C.grass);
  ribbon(g, [[-15, -10], [-11, -1], [-5, 5], [5, 8], [15, 6]], 3.2, water, 0.28, 24);
  for (const [x, z, r] of [[-4, -4, 4.2], [4.7, -4, 3.8], [3.7, 3.2, 2.6]]) {
    circle(g, x, z, r + 0.6, C.stone, 0.27, 0.4);
    circle(g, x, z, r, water, 0.71, 0.06);
    for (let i = 0; i < 3; i++) {
      const a = i * 2.3, steam = mat(0xe9f4e4, { transparent: true, opacity: 0.12, depthWrite: false });
      sphere(g, x + Math.cos(a) * 1.25, 1.45 + i * 0.72, z + Math.sin(a) * 1.0, 1.15, 0.58, 0.8, steam);
    }
  }
  pavilion(g, 10.7, -9, 3, 0.3);
  traditional(g, -5.7, -11.3, 8, 4.7, 3.6, 0.3, C.tile, C.pale);
  block(g, -7.6, 3.4, 5.2, 0.3, 2, C.pale, 0.8);
  for (const z of [2.4, 4.4]) beam(g, [-10.2, 1.7, z], [-5, 1.7, z], 0.11, C.wood);
  planting(g, [[-14, -13], [-14, 9], [-6, 12], [1, 13], [10, 11], [14, 1]], 1.15, 0.3);
}

const BUILDERS = {
  auditorium, guanyinqiao, danzishi, ciqikou, cqu, huangjueping, zoo,
  'industrial-museum': industrialMuseum, yidu, jinyun, swu,
  'central-park': centralPark, airport, longzhouwan, nanwenquan,
};

export function buildDistrictLandmark(parent, type, { x = 0, z = 0, baseY = 0, scale = 1 } = {}) {
  const builder = BUILDERS[type];
  if (!builder) throw new RangeError(`Unknown Chongqing district landmark: ${type}`);
  if (![x, z, baseY, scale].every(Number.isFinite) || scale <= 0) throw new RangeError('Landmark coordinates must be finite and scale positive');
  const group = new THREE.Group();
  group.name = `chongqing-${type}`;
  group.userData.landmarkId = type;
  group.userData.parameters = { x, z, baseY, scale };
  builder(group);
  group.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(group);
  const height = box.max.y * scale;
  const radius = Math.hypot(Math.max(Math.abs(box.min.x), Math.abs(box.max.x)), Math.max(Math.abs(box.min.z), Math.abs(box.max.z))) * scale;
  group.userData.localBounds = { min: box.min.toArray(), max: box.max.toArray() };
  group.position.set(x, baseY, z);
  group.scale.setScalar(scale);
  parent.add(group);
  return { group, height, radius };
}

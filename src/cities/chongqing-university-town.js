import * as THREE from 'three';
import { block, cylinder, sphere, tree, area, ribbon, roof, mat } from '../scene-kit.js';

// Original compressed campus dioramas; geographic placement lives in chongqing.js.
// All geometry is above the local y=0 plane. No downloaded textures or artwork.
const C = {
  stone: 0xddd6bf, pale: 0xf4e5ca, white: 0xf6eee0, cream: 0xe5cba4,
  brick: 0xad614b, red: 0xb34f43, dark: 0x435654, wood: 0x77553b,
  glass: 0x6fa2aa, lawn: 0x8fac75, green: 0x4b775c, water: 0x76b3b3,
  gold: 0xd5ad64, road: 0x898d84, teal: 0x4c9493,
};
const glass = mat(C.glass, { roughness: 0.3, metalness: 0.18 });
const water = mat(C.water, { roughness: 0.26, metalness: 0.16 });
const glow = mat(0xffdb9b, { emissive: 0xffb758, emissiveIntensity: 0.025, roughness: 0.5 });
const coolGlow = mat(0x94c4c5, { emissive: 0x65b3bb, emissiveIntensity: 0.025, roughness: 0.5 });
glow.userData.nightGlow = true;
coolGlow.userData.nightGlow = true;
const artColors = [0xb54b46, 0xe4ac48, 0x71a5a0, 0x586f9f, 0xc98e78, 0xe5d6b0];

function platform(g, w, d, color = C.stone) { block(g, 0, 0, w, 0.24, d, color); }
function circle(g, x, z, r, color, y = 0.26, h = 0.08) {
  return cylinder(g, x, z, r, r, h, color, y, 28);
}
function beam(g, from, to, r = 0.1, color = C.dark) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const delta = b.clone().sub(a);
  const mesh = cylinder(g, 0, 0, r, r, delta.length(), color, 0, 6);
  mesh.position.copy(a.add(b).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
  return mesh;
}
function ring(g, x, z, rx, rz, width, color, y = 0.3) {
  const shape = new THREE.Shape();
  shape.absellipse(x, -z, rx, rz, 0, Math.PI * 2, false, 0);
  const hole = new THREE.Path();
  hole.absellipse(x, -z, rx - width, rz - width, 0, Math.PI * 2, true, 0);
  shape.holes.push(hole);
  const geo = new THREE.ShapeGeometry(shape, 36); geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, mat(color, { side: THREE.DoubleSide }));
  mesh.position.y = y; mesh.receiveShadow = true; g.add(mesh);
  return mesh;
}
function lamp(g, x, z, h = 3.8) {
  cylinder(g, x, z, 0.09, 0.14, h, C.dark, 0.26, 6);
  block(g, x, z, 0.62, 0.2, 0.62, C.dark, h + 0.26);
  block(g, x, z, 0.42, 0.38, 0.42, glow, h - 0.12);
}
function bench(g, x, z, width = 2.5) {
  for (const dx of [-width * 0.33, width * 0.33]) block(g, x + dx, z, 0.19, 0.5, 0.58, C.dark, 0.25);
  block(g, x, z, width, 0.18, 0.7, C.wood, 0.75);
  block(g, x, z - 0.3, width, 0.45, 0.15, C.wood, 0.91);
}
function windows(g, x, z, w, h, d, floors = 3, baseY = 0.28) {
  for (let floor = 0; floor < floors; floor++) {
    block(g, x, z + d / 2 + 0.035, w - 0.8, 0.62, 0.075, glass, baseY + 1 + floor * (h - 1.2) / floors);
    block(g, x, z - d / 2 - 0.035, w - 0.8, 0.62, 0.075, glass, baseY + 1 + floor * (h - 1.2) / floors);
  }
}
function bicycle(g, x, z, color = C.teal) {
  for (const dx of [-0.53, 0.53]) {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.07, 5, 12), mat(C.dark));
    wheel.position.set(x + dx, 0.64, z); g.add(wheel);
  }
  const p = [[x - 0.53, 0.64, z], [x - 0.1, 1.15, z], [x + 0.12, 0.64, z], [x - 0.53, 0.64, z]];
  for (let i = 1; i < p.length; i++) beam(g, p[i - 1], p[i], 0.055, color);
  beam(g, p[1], [x + 0.42, 1.14, z], 0.055, color);
  beam(g, [x + 0.42, 1.14, z], [x + 0.53, 0.64, z], 0.055, color);
  block(g, x - 0.1, z, 0.3, 0.08, 0.2, C.dark, 1.16);
  beam(g, [x + 0.42, 1.14, z], [x + 0.38, 1.35, z], 0.05, C.dark);
}

function universityTown(g) {
  platform(g, 26, 24);
  block(g, 0, 8.6, 25.5, 0.07, 4.8, C.road, 0.26);
  for (let i = 0; i < 6; i++) block(g, -9.5 + i * 3.7, 8.7, 1.8, 0.035, 0.13, C.pale, 0.35);
  circle(g, -1, -1, 7.1, C.pale);
  ring(g, -1, -1, 5.5, 5.5, 0.22, C.gold, 0.37);
  circle(g, -1, -1, 2.15, C.lawn, 0.36, 0.14);
  // An original open-book monument makes this a district overview meeting point.
  const pages = [[[-2.5, -2.5], [-1, -1.9], [-1, 0.4], [-2.5, -0.2]], [[-1, -1.9], [0.5, -2.5], [0.5, -0.2], [-1, 0.4]]];
  for (const points of pages) area(g, points, C.white, 1.0, 0.36);
  for (const dx of [-1, 1]) {
    const page = block(g, -1 + dx * 0.73, -1, 1.6, 2.7, 0.27, C.pale, 1.05);
    page.rotation.z = -dx * 0.2;
  }
  // Compact transit pavilion: visible stair treads, glass canopy and stop totem.
  for (let i = 0; i < 7; i++) block(g, 7.6, -7.4 + i * 0.52, 3.9, 0.25 + i * 0.17, 0.55, C.dark, 0.28);
  for (const x of [5.4, 9.8]) for (const z of [-8.2, -3.5]) cylinder(g, x, z, 0.1, 0.13, 3.9, C.dark, 0.28, 6);
  const canopy = block(g, 7.6, -5.8, 5, 0.18, 6.2, glass, 4.25); canopy.rotation.x = -0.12;
  block(g, 7.6, -2.68, 4.6, 0.42, 0.2, coolGlow, 3.7);
  for (const x of [5.1, 10.1]) beam(g, [x, 1, -8.4], [x, 2.0, -3.6], 0.09, C.dark);
  block(g, -8.5, -6.5, 1, 6.9, 0.85, C.dark, 0.28);
  block(g, -8.5, -5.99, 2.8, 1.8, 0.18, coolGlow, 5.25);
  block(g, -8.5, -5.88, 1.9, 0.23, 0.12, C.white, 6.3);
  block(g, -8.5, -5.88, 1.25, 0.19, 0.12, C.white, 5.85);
  // Bus shelter and a bus waiting beside the plaza, no claimed service number.
  for (const x of [-9.5, -3.5]) cylinder(g, x, 5.1, 0.08, 0.11, 2.75, C.dark, 0.28, 6);
  block(g, -6.5, 5.1, 7, 0.2, 2.4, C.white, 3.0);
  bench(g, -6.5, 4.8, 4.5);
  block(g, -3, 8.6, 6.6, 1.5, 2.25, C.teal, 0.69);
  block(g, -3, 8.6, 6.2, 0.85, 2.17, glass, 1.5);
  block(g, -3, 8.6, 6.3, 0.16, 2.3, C.white, 2.35);
  for (const x of [-5.1, -0.9]) for (const z of [7.45, 9.75]) sphere(g, x, 0.79, z, 0.47, 0.47, 0.16, C.dark);
  for (let i = 0; i < 4; i++) bicycle(g, 6.9, 1 + i * 0.78, i % 2 ? C.gold : C.teal);
  for (const [x, z] of [[-11,-1],[-11,3],[11,1],[11,4],[-3,-9],[1,-9]]) tree(g, x, z, 0.8, 0.28);
  bench(g, -5, -4); lamp(g, 3.4, 4.6); lamp(g, -4, -7.2);
}

function cquHuxi(g) {
  platform(g, 42, 36, C.lawn);
  block(g, 0, 1.4, 39.8, 0.1, 3.5, C.pale, 0.25);
  block(g, -0.4, 8.9, 3.1, 0.09, 13.3, C.pale, 0.26);
  // The official library's L shape and red exterior distinguish it from old CQU.
  for (const [x,z,w,h,d] of [[-6,-9.7,24,9.6,6.6],[-14,-4.1,8,9.6,8.7]]) {
    block(g,x,z,w,h,d,C.brick,0.3); windows(g,x,z,w,h,d,4,0.3);
    block(g,x,z,w+0.5,0.25,d+0.5,C.white,9.9);
    block(g,x,z,w-0.9,0.17,d-0.9,C.dark,10.18);
  }
  block(g,-5.6,-6.24,14.6,4.4,0.19,glass,1.1);
  for (let i=0;i<7;i++) block(g,-11.7+i*2.04,-6.08,0.19,7.2,0.18,C.pale,1.5);
  block(g,-5.8,-4.7,11.7,0.3,3.1,C.pale,5.9);
  for (const x of [-10.7,-1]) cylinder(g,x,-3.55,0.16,0.2,5.5,C.white,0.3,6);
  for (let i=0;i<4;i++) block(g,-5.8,-2.7+i*0.4,9,0.18+(3-i)*0.16,0.45,C.stone,0.27);
  // Cloud Lake is intentionally a small shaped basin, not a surveyed shoreline.
  const lake = [[0.7,-3.5],[3.3,-6.4],[7.3,-5.3],[11,-2.8],[13.1,0.8],[9.5,3.7],[4.5,3.2],[1.3,0.2]];
  area(g,lake,C.stone,0.42,0.1);
  area(g,lake.map(([x,z])=>[6.5+(x-6.5)*0.86,-1+(z+1)*0.83]),water,0.45);
  ribbon(g,[[0.2,-0.4],[4,4.6],[10.2,4.8],[15.1,1.6]],1.1,C.pale,0.46,24);
  // Detached teaching wing, courtyards and colonnade.
  for (const z of [-12.3,-7.3]) {
    block(g,13.6,z,9.4,5.7,3.9,C.white,0.3); windows(g,13.6,z,9.4,5.7,3.9,2,0.3);
    block(g,13.6,z,9.8,0.22,4.3,C.cream,6.0);
  }
  block(g,13.6,-9.8,2.4,0.22,2,glass,4.8);
  // Oval track with lane markings and a visibly playable green pitch.
  const trackX=10.5,trackZ=11.5;
  ring(g,trackX,trackZ,8.4,4.65,1.55,C.red,0.34);
  for (const w of [0.5,1]) ring(g,trackX,trackZ,8.4-w,4.65-w,0.045,C.pale,0.37);
  block(g,trackX,trackZ,11.3,0.025,5.4,C.green,0.35);
  for(const z of [trackZ-2.45,trackZ+2.45]) block(g,trackX,z,10.1,0.025,0.045,C.white,0.39);
  for(const x of [trackX-5.05,trackX,trackX+5.05]) block(g,x,trackZ,0.045,0.025,4.9,C.white,0.39);
  ring(g,trackX,trackZ,0.9,0.9,0.05,C.white,0.4);
  for(const x of [trackX-5.15,trackX+5.15]) {
    for(const z of [trackZ-1.05,trackZ+1.05]) beam(g,[x,0.42,z],[x,1.5,z],0.07,C.white);
    beam(g,[x,1.5,trackZ-1.05],[x,1.5,trackZ+1.05],0.07,C.white);
  }
  for(const x of [-17,-10,-4]) for(const z of [5.4,12.8]) tree(g,x,z,0.9,0.28);
  for(const z of [-12,-5,3,13]) tree(g,-19.5,z,0.85,0.28);
  bench(g,-10,9.5); lamp(g,-2.5,6); lamp(g,17.7,4.7);
  for (let i=0;i<3;i++) bicycle(g,-5.8,5.7+i*0.85);
}

function mosaicWall(g,x,z,w,h,seed=0) {
  // Every patch is an original geometric composition, not a copy of the mural.
  const cols=Math.round(w/1.7), rows=Math.round(h/1.7);
  for(let row=0;row<rows;row++) for(let col=0;col<cols;col++) {
    const px=x-w/2+col*w/cols, y=0.45+row*h/rows;
    const a=[px,y,z], b=[px+w/cols,y,z], c=[px+w/cols,y+h/rows,z], d=[px,y+h/rows,z];
    const triangles=(row+col)%2?[[a,b,d],[b,c,d]]:[[a,b,c],[a,c,d]];
    for(let side=0;side<2;side++) {
      const geo=new THREE.BufferGeometry();
      geo.setAttribute('position',new THREE.Float32BufferAttribute(triangles[side].flat(),3));geo.computeVertexNormals();
      const mesh=new THREE.Mesh(geo,mat(artColors[(row*3+col*2+side+seed)%artColors.length],{side:THREE.DoubleSide}));
      mesh.castShadow=true;g.add(mesh);
    }
  }
}

function scfaiHuxi(g) {
  platform(g,42,36,C.lawn);
  block(g,0,2,36,0.1,26,C.pale,0.26);
  // Museum: offset granary-like sloping roofs around an open courtyard.
  const wings=[[-11,-7,10,7.8,12],[0,-11,11,7.1,6],[11,-7.5,10,9.2,13],[9,3,7,5.8,5]];
  wings.forEach(([x,z,w,h,d],i)=>{
    block(g,x,z,w,h,d,C.cream,0.3);
    roof(g,x,z,w+0.3,1.8,d+0.3,artColors[(i+2)%artColors.length],h+0.3);
    mosaicWall(g,x,z+d/2+0.04,w,h-0.1,i);
    // Tall narrow windows remain readable through the color planes.
    for(const dx of [-w*0.31,w*0.3]) block(g,x+dx,z+d/2+0.11,0.38,h*0.51,0.1,glass,1.7);
  });
  // Colonnade, interior garden and low terraces give the museum depth.
  for(const x of [-5.2,0,5.2]) cylinder(g,x,-6.8,0.17,0.2,3.1,C.dark,0.3,6);
  block(g,0,-6.8,12,0.2,1.75,C.white,3.4);
  block(g,-0.5,-1.4,8.8,0.12,7,C.lawn,0.39);
  ring(g,-0.6,-0.8,2.25,2.25,0.3,C.stone,0.54);
  for(let i=0;i<3;i++) block(g,-9.5,3.5+i*1.4,10.5-i,0.25,1.5,C.stone,0.29+(2-i)*0.25);
  // An open, twisting ribbon sculpture on the lawn; no referenced artwork.
  circle(g,2.7,9.9,3.2,C.stone,0.34,0.23);
  const curve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.6,0.8,10.3),new THREE.Vector3(1.5,3.1,10.9),
    new THREE.Vector3(4.8,5.9,10.2),new THREE.Vector3(5,7.3,8.4),
    new THREE.Vector3(2.5,5.7,8.2),new THREE.Vector3(1.7,2.8,9.6),
  ]);
  const sculpture=new THREE.Mesh(new THREE.TubeGeometry(curve,30,0.43,8,false),mat(C.red));
  sculpture.castShadow=true;g.add(sculpture);
  // Studio sheds and a small open-air geometric display.
  for(const x of [-15,-9]) { block(g,x,11.6,4.8,3.1,5.7,C.brick,0.3);roof(g,x,11.6,5.3,1.4,6.1,C.dark,3.4); }
  for(const [x,z,c] of [[11,9,C.gold],[15,11,C.teal]]) {
    block(g,x,z,2.4,0.35,2.4,C.white,0.3);
    const art=new THREE.Mesh(new THREE.OctahedronGeometry(1.25),mat(c));art.position.set(x,2.2,z);art.rotation.z=0.27;art.castShadow=true;g.add(art);
  }
  for(const [x,z] of [[-19,-11],[-19,-3],[-19,7],[19,-11],[19,-2],[19,7],[12,15.5],[-1,15.5]]) tree(g,x,z,0.8,0.3);
  bench(g,-3,5.4);lamp(g,-16.3,4);lamp(g,16.3,4);
}

function shop(g,x,z,w,h,color,side,index) {
  block(g,x,z,w,h,6.5,color,0.3);
  block(g,x,z,w+0.2,0.23,6.8,C.white,h+0.3);
  const front=z-side*3.3;
  block(g,x,front,w-0.8,2.25,0.11,glass,0.7);
  for(const dx of [-w*0.31,w*0.31]) block(g,x+dx,front-side*0.08,0.17,2.55,0.14,C.pale,0.3);
  block(g,x,front-side*0.17,w-0.6,0.47,0.18,index%2?coolGlow:glow,3.15);
  for(const dx of [-w*0.3,0,w*0.3]) block(g,x+dx,front,0.85,1.13,0.11,glass,4.28);
  const awning=block(g,x,front-side*0.78,w-0.3,0.14,1.65,index%2?C.teal:C.red,2.94);
  awning.rotation.x=side*0.16;
  if(index%2===0) {
    block(g,x,z,w-1.1,0.18,4.8,C.lawn,h+0.57);
    for(const dx of [-w*0.34,w*0.34]) block(g,x+dx,z,0.11,1.1,4.9,C.wood,h+0.75);
    for(let j=0;j<4;j++) block(g,x,z-2+j*1.33,w-0.8,0.11,0.12,C.wood,h+1.85);
  }
}
function xijie(g) {
  platform(g,44,30);
  block(g,0,0,43,0.08,9.4,C.pale,0.26);
  for(let i=0;i<9;i++) block(g,-19+i*4.7,0,0.55,0.035,7.9,C.cream,0.36);
  // Paired low storefronts frame a continuous, open pedestrian street.
  for(const side of [-1,1]) for(let i=0;i<5;i++) {
    shop(g,-17+i*8.5,side*9.8,7.9,5.5+(i%3)*0.9,[C.cream,C.brick,C.white][(i+(side+1)/2)%3],side,i);
  }
  circle(g,0,0,3.5,C.stone,0.37,0.06);
  ring(g,0,0,2.4,2.4,0.16,C.gold,0.46);
  // Public art and cafe tables stay to the street edges, preserving the walkway.
  for(const [x,z] of [[-13,-3.9],[-5,3.9],[8,-3.9],[16,3.9]]) {
    cylinder(g,x,z,0.08,0.13,1.2,C.dark,0.35,6);
    circle(g,x,z,0.9,C.wood,1.5,0.12);
    for(const dx of [-1.35,1.35]) { block(g,x+dx,z,0.58,0.58,0.58,C.cream,0.3);block(g,x+dx,z-0.22,0.58,0.58,0.13,C.wood,0.88); }
    cylinder(g,x,z,0.045,0.045,2.7,C.wood,0.36,6);
    cylinder(g,x,z,0.05,1.45,0.7,C.pale,3.0,8);
  }
  for(const x of [-19.5,19.5]) for(const z of [-3,3]) tree(g,x,z,0.85,0.3);
  // Two festoon spans form a warm night destination without point-light cost.
  for(const x of [-9,9]) {
    for(const z of [-5.1,5.1]) cylinder(g,x,z,0.09,0.14,5.3,C.dark,0.3,6);
    const pts=Array.from({length:9},(_,i)=>new THREE.Vector3(x,5.55-0.9*Math.sin(i*Math.PI/8),-5.1+i*1.275));
    for(let i=1;i<pts.length;i++) beam(g,pts[i-1].toArray(),pts[i].toArray(),0.035,C.dark);
    for(let i=1;i<8;i++) sphere(g,x,pts[i].y-0.12,pts[i].z,0.13,0.18,0.13,glow);
  }
  for(const x of [-16,0,16]) { lamp(g,x,-5.15,3.7);lamp(g,x,5.15,3.7); }
  for(const x of [-3.8,3.8]) block(g,x,0,0.2,1.8,0.2,C.dark,0.35);
  for(const x of [-3.8,3.8]) sphere(g,x,2.35,0,0.7,0.5,0.42,C.gold);
}

const BUILDERS = { 'university-town': universityTown, 'cqu-huxi': cquHuxi, 'scfai-huxi': scfaiHuxi, xijie };

export function buildUniversityTownLandmark(parent, type, { x = 0, z = 0, baseY = 0, scale = 1 } = {}) {
  const builder = BUILDERS[type];
  if (!builder) throw new RangeError(`Unknown Chongqing university-town landmark: ${type}`);
  if (![x,z,baseY,scale].every(Number.isFinite) || scale <= 0) throw new RangeError('Landmark coordinates must be finite and scale positive');
  const group = new THREE.Group();
  group.name = `chongqing-${type}`;
  group.userData.landmarkId = type;
  group.userData.parameters = { x,z,baseY,scale };
  builder(group);
  group.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(group);
  const height = box.max.y * scale;
  const radius = Math.hypot(Math.max(Math.abs(box.min.x),Math.abs(box.max.x)),Math.max(Math.abs(box.min.z),Math.abs(box.max.z))) * scale;
  group.userData.localBounds = { min: box.min.toArray(), max: box.max.toArray() };
  group.position.set(x,baseY,z);
  group.scale.setScalar(scale);
  parent.add(group);
  return { group,height,radius };
}

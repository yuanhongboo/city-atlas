import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { block, cylinder, sphere, area, ribbon, line, roof, rng, mat } from '../scene-kit.js';
import { southStreetLandmarks, southStreetRoads, southStreetClearing, inSouthStreetClearing, buildSouthStreets } from './chengdu-south-streets.js';

// 成都城市印象沙盘。x 向东，z 向南；外围距离压缩，不使用测绘比例。
const C = { earth: '#d9d1b8', ground: '#e9e4d3', road: '#c1bdac', edge: '#f5efdc', water: '#399f9a', bank: '#a8c8a6', lawn: '#afc8a0', leaf: '#668f6e', teal: '#355e60', glass: '#44696c', roof: '#59625c', red: '#a4563e', wall: '#f0e6ce', gold: '#c7a367' };
const CITY_BOUNDS = {minX:-105,maxX:105,minZ:-105,maxZ:275};
const TIANFU_SOUTH_SHIFT = 70;
const lakePoints = [[18,166],[25,157],[38,153],[52,155],[68,153],[80,161],[87,175],[81,187],[68,195],[48,198],[30,192],[18,182],[18,166]];
const riverPoints = [[-103,15],[-80,12],[-56,17],[-27,23],[0,22],[25,18],[46,25],[56,43],[77,60],[104,64]];
const northRiverPoints = [[3,-101.5],[16,-81],[41,-67],[64,-45],[72,-19],[66,5],[46,25]];
const WANGJIANG = {x:83,z:84,scale:.78};
// These clearings reserve actual land for the authored riverside models.
const riverfrontClearings = [[74,29,17,13],[43,51,13,12],[63,50,16,15],[83,84,15,13]];
const inRiverfrontClearing = (x,z) => riverfrontClearings.some(([cx,cz,rx,rz])=>Math.abs(x-cx)<rx&&Math.abs(z-cz)<rz);
const markerData = [
  { id:'tianfu', name:'天府广场', subtitle:'城市中轴 · 蓉城之心', description:'从广场、四川科技馆到人民南路，读懂成都平缓舒展的城市中轴。双旋水景与太阳神鸟意象在沙盘中作艺术化概括。', position:[-8,2,-14], camera:[25,42,26], target:[-8,2,-14], zone:'old', category:'城市地标' },
  { id:'kuanzhai', name:'宽窄巷子', subtitle:'青砖灰瓦 · 三条老巷', description:'宽巷子、窄巷子与井巷子平行展开。微缩院落保留灰瓦、门楼、茶桌与树影，邀请你把视线放慢。', position:[-54,3,-32], camera:[-25,35,1], target:[-54,2,-32], zone:'old', category:'历史街区' },
  { id:'taikooli', name:'太古里与 IFS', subtitle:'古寺街巷 · 爬墙熊猫', description:'大慈寺旁的低层街区，与 IFS 的深青玻璃塔楼相望。南侧爬墙熊猫是这一组建筑最醒目的城市记忆。', position:[39,13,-16], camera:[67,39,20], target:[39,7,-16], zone:'old', category:'城市地标' },
  { id:'anshun', name:'安顺廊桥', subtitle:'两水交汇 · 锦江夜色', description:'安顺廊桥位于府河与南河交汇附近，红柱、青瓦与水中倒影相伴。这里把明清式廊桥和夜游小船共同缩进锦江。', position:[47,9,25], camera:[78,30,51], target:[47,3,25], zone:'old', category:'水岸地标', related:['lankwaifong','jiuyanqiao'] },
  { id:'lankwaifong', name:'兰桂坊', subtitle:'锦江露台 · 街巷灯火', description:'成都兰桂坊临锦江展开，以低层餐饮娱乐街区、开放广场与跨街雨棚相连。微缩模型用三层立面、露台桌椅、暖色窗格和原创发光店招，表现沿江夜生活；具体店面与建筑数量经过艺术化压缩。', position:[74,9,29], camera:[107,31,58], target:[73,3,30], zone:'old', category:'水岸夜游', related:['anshun','jiuyanqiao'] },
  { id:'jiuyanqiao', name:'九眼桥', subtitle:'开敞桥面 · 沿江夜游', description:'沿锦江从安顺廊桥继续向下游，就是九眼桥一带。本节点以开敞道路桥、滨江步道和酒吧街表现现今桥梁与夜游片区；带楼阁的安顺廊桥、望江路附近异地重建的仿古九眼桥是另外两座桥。桥梁跨度、桥墩数量和街区距离按沙盘尺度概括。', position:[63,7,50], camera:[92,30,84], target:[63,2,50], zone:'old', category:'水岸夜游', related:['lankwaifong','anshun'] },
  { id:'wangjiang', name:'望江楼', subtitle:'临江古阁 · 竹影千重', description:'锦江岸边的崇丽阁，以层叠飞檐和四方、八角的楼层变化形成轮廓。周围竹林是望江楼公园的重要气质。', position:[83,16,84], camera:[113,35,117], target:[83,7,84], zone:'old', category:'园林古建' },
  { id:'wuhou', name:'武侯祠与锦里', subtitle:'红墙古柏 · 三国余韵', description:'武侯祠的多进院落与东侧锦里毗邻。沙盘用朱红墙、灰绿屋顶和热闹灯笼街，表现祠庙与市井共处的成都。', position:[-43,6,39], camera:[-12,33,74], target:[-43,2,39], zone:'old', category:'历史街区' },
  { id:'global', name:'环球中心', subtitle:'高新南城 · 波浪屋顶', description:'位于天府大道西侧的宽阔综合体，以起伏屋面、玻璃幕墙和南侧水景展开。沿大道北望金融城双子塔，向南依次展开天府一街至五街，再继续进入天府新区。建筑体量与间距经过压缩。', position:[-42,14,111], camera:[-5,42,149], target:[-42,5,111], zone:'south', category:'现代建筑' },
  { id:'panda', name:'熊猫基地', subtitle:'竹林小岛 · 黑白精灵', description:'成都大熊猫繁育研究基地位于城市东北方向。本沙盘把外围距离压缩，以竹林、栖架和熊猫表现其生态与科普主题。', position:[66,5,-76], camera:[97,33,-43], target:[66,2,-76], zone:'old', category:'公园生态' },
  { id:'wenshu', name:'文殊院', subtitle:'清幽禅院 · 黄墙灰瓦', description:'老城北部的文殊院，以中轴多进殿堂、黄墙灰瓦、两侧钟鼓楼和连廊围合成院。沙盘提炼清代寺院的院落秩序，庭院树影与香炉保留安静的尺度。', position:[10,11,-69], camera:[39,34,-37], target:[10,2,-69], zone:'old', category:'寺院古建' },
  { id:'renmin', name:'人民公园', subtitle:'鹤鸣茶社 · 盖碗茶与竹椅', description:'天府广场西侧的人民公园，把鹤鸣茶社、茶桌竹椅、湖岸与保路纪念碑收在一片树荫中。可绕到茶社前看盖碗茶和撑开的遮阳伞，体会成都日常生活的慢节奏。', position:[-53,8,-2], camera:[-25,29,26], target:[-53,2,-2], zone:'old', category:'公园生活' },
  { id:'twin-towers', name:'金融城双子塔', subtitle:'交子公园 · 双塔夜色', description:'金融城双子塔又称天府双塔，位于天府大道北段。两座玻璃塔楼以冰花纹外网、收分冠顶和成片灯光立面形成天际线，下方连接交子公园的开阔绿地。', position:[30,47,82], camera:[102,76,144], target:[30,20,82], zone:'south', category:'现代建筑' },
  { id:'expo', name:'天府新区 · 西博城', subtitle:'南向延伸 · 连续展馆屋面', description:'沿天府大道向南，天府新区的西博城以连续展馆屋面和开阔草地展开。周边总部办公组团与会展空间相伴，继续向南可到科学城兴隆湖。', position:[36,11,135+TIANFU_SOUTH_SHIFT], camera:[84,40,169+TIANFU_SOUTH_SHIFT], target:[36,3,135+TIANFU_SOUTH_SHIFT], zone:'tianfu', category:'新区会展' },
  { id:'xinglong', name:'兴隆湖', subtitle:'科学城 · 环湖绿道与湖畔书店', description:'兴隆湖位于天府新区科学城、天府大道东侧。开阔湖面串起环湖绿道、湿地岸线、湖畔书店与科研办公组团；湖岸形状和建筑位置按观赏需求压缩，不用于测绘导航。', position:[48,3,176+TIANFU_SOUTH_SHIFT], camera:[101,48,226+TIANFU_SOUTH_SHIFT], target:[48,1,176+TIANFU_SOUTH_SHIFT], zone:'tianfu', category:'湖泊生态' },
  ...southStreetLandmarks
];

function glowing(color = '#eee3bd', emission = '#ffd088') {
  const m = new THREE.MeshStandardMaterial({color, emissive:emission, emissiveIntensity:0.06, roughness:0.7});
  m.userData.nightGlow = true;
  return m;
}
function addMesh(parent, geo, material, x=0,y=0,z=0) {
  const mesh = new THREE.Mesh(geo, material); mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
function roundedBase(parent) {
  const s = new THREE.Shape(), h=(CITY_BOUNDS.maxX-CITY_BOUNDS.minX)/2-.5, n=(CITY_BOUNDS.maxZ-CITY_BOUNDS.minZ)/2-.5, r=8;
  const centerZ=(CITY_BOUNDS.minZ+CITY_BOUNDS.maxZ)/2;
  s.moveTo(-h+r,-n); s.lineTo(h-r,-n); s.quadraticCurveTo(h,-n,h,-n+r); s.lineTo(h,n-r); s.quadraticCurveTo(h,n,h-r,n); s.lineTo(-h+r,n); s.quadraticCurveTo(-h,n,-h,n-r); s.lineTo(-h,-n+r); s.quadraticCurveTo(-h,-n,-h+r,-n);
  const geo=new THREE.ExtrudeGeometry(s,{depth:4.6,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:0.5,bevelThickness:0.2,curveSegments:12}); geo.rotateX(-Math.PI/2);
  const base=addMesh(parent,geo,[mat(C.ground),mat(C.earth)],0,-4.6,centerZ); base.receiveShadow=true;
  block(parent,0,centerZ,204,0.16,CITY_BOUNDS.maxZ-CITY_BOUNDS.minZ-6,C.ground,-0.03);
}
function panel(parent,x,z,w,d,color,y=0.14) { return block(parent,x,z,w,0.11,d,color,y); }
function distSeg(x,z,a,b) { const dx=b[0]-a[0], dz=b[1]-a[1]; const q=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz))); return Math.hypot(x-a[0]-q*dx,z-a[1]-q*dz); }
function nearRiver(x,z,r=8) { return [riverPoints,northRiverPoints].some(ps=>ps.slice(1).some((p,i)=>distSeg(x,z,ps[i],p)<r)); }
function batch(parent,geo,material,items,shadow=true) {
  if(!items.length)return null; const mesh=new THREE.InstancedMesh(geo,material,items.length); const o=new THREE.Object3D();
  items.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.rotation.set(p[6]||0,p[7]||0,p[8]||0);o.scale.set(p[3],p[4],p[5]);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);});
  mesh.castShadow=shadow;mesh.receiveShadow=true;mesh.instanceMatrix.needsUpdate=true;parent.add(mesh);return mesh;
}
function countBuilding(parent) { parent.userData.buildingCount=(parent.userData.buildingCount||0)+1; }
function building(parent,...args) { countBuilding(parent); return block(parent,...args); }
function traditional(parent,x,z,w=7,d=5,h=3,wall=C.wall,tile=C.roof) {
  countBuilding(parent);
  block(parent,x,z,w+0.7,0.35,d+0.7,'#d3c8b0',0.15);
  block(parent,x,z,w,h,d,wall,0.5); roof(parent,x,z,w+1.35,1.7,d+1.2,tile,h+0.48);
  for(let xx=x-w/2+0.65;xx<x+w/2;xx+=1.5){block(parent,xx,z+d/2+0.05,0.14,h,0.16,'#79513b',0.5);block(parent,xx+0.5,z+d/2+0.12,0.72,h*0.53,0.07,'#564f40',1.05);}
  return h+2.2;
}
function panda(parent,x,y,z,s=1,climbing=false) {
  const p=new THREE.Group();p.position.set(x,y,z);p.scale.setScalar(s);parent.add(p);
  sphere(p,0,1.4,0,1.1,1.4,0.95,'#f3f0e1',2);
  sphere(p,0,2.85,0.12,1.0,0.89,0.86,'#fbf8ed',2);
  sphere(p,-0.72,3.51,0.07,0.34,0.36,0.28,'#283835',2);sphere(p,0.72,3.51,0.07,0.34,0.36,0.28,'#283835',2);
  for(const side of [-1,1]){
    const eye=sphere(p,side*0.38,2.91,0.86,0.27,0.34,0.095,'#243333',2); eye.rotation.z=side*0.22;
    sphere(p,side*0.35,2.97,0.955,0.063,0.081,0.035,'#faf8e9',1);
    sphere(p,side*0.92,climbing?2.15:1.5,climbing?-0.1:0.09,0.42,0.87,0.44,'#2c3834',2);
    sphere(p,side*0.61,0.3,0.18,0.45,0.59,0.58,'#2c3834',2);
  }
  sphere(p,0,2.66,0.98,0.25,0.16,0.13,'#273330',2);
  return p;
}
function lamp(parent,x,z,lights,h=3) {
  block(parent,x,z,0.12,h,0.12,'#60695c',0.2); const lamp=addMesh(parent,new THREE.BoxGeometry(0.43,0.5,0.43),lights,x,h+0.2,z);return lamp;
}


// Merge static architectural fragments only. Shared kit geometry is never disposed:
// the other city and existing InstancedMeshes may still be using it.
function batchStaticArchitecture(group) {
  group.updateMatrixWorld(true);
  const localFromWorld=new THREE.Matrix4().copy(group.matrixWorld).invert();
  const buckets=new Map(),lineBuckets=new Map();
  group.traverse(object=>{
    for(let p=object;p&&p!==group;p=p.parent)if(p.userData.cityMotion)return;
    if(object.isInstancedMesh)return;
    if(object.isMesh&&!Array.isArray(object.material)){
      const key=`${object.material.uuid}:${object.castShadow}:${object.receiveShadow}`;
      if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(object);
    }else if(object.isLine&&!object.isLineSegments&&!Array.isArray(object.material)){
      const m=object.material,key=`${m.color.getHexString()}:${m.opacity}:${m.transparent}:${m.depthTest}`;
      if(!lineBuckets.has(key))lineBuckets.set(key,[]);lineBuckets.get(key).push(object);
    }
  });
  for(const objects of buckets.values()){
    if(objects.length<2)continue;
    const copies=objects.map(o=>{
      const geometry=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
      for(const name of Object.keys(geometry.attributes))if(name!=='position'&&name!=='normal')geometry.deleteAttribute(name);
      if(!geometry.attributes.normal)geometry.computeVertexNormals();
      geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(localFromWorld,o.matrixWorld));
      return geometry;
    });
    const merged=mergeGeometries(copies,false);copies.forEach(g=>g.dispose());
    if(!merged)continue;
    const mesh=new THREE.Mesh(merged,objects[0].material);
    mesh.castShadow=objects[0].castShadow;mesh.receiveShadow=objects[0].receiveShadow;
    mesh.userData.staticBatch=true;mesh.userData.sourceMeshes=objects.length;
    group.add(mesh);objects.forEach(o=>o.removeFromParent());
  }
  for(const objects of lineBuckets.values()){
    if(objects.length<2)continue;
    const positions=[],v=new THREE.Vector3();
    for(const o of objects){
      const p=o.geometry.attributes.position,transform=new THREE.Matrix4().multiplyMatrices(localFromWorld,o.matrixWorld);
      // Each old polyline is expanded into independent segments, avoiding cross-line seams.
      for(let i=1;i<p.count;i++)for(const j of [i-1,i]){v.fromBufferAttribute(p,j).applyMatrix4(transform);positions.push(v.x,v.y,v.z);}
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    const lines=new THREE.LineSegments(geometry,objects[0].material);lines.userData.staticBatch=true;
    group.add(lines);objects.forEach(o=>o.removeFromParent());
  }
}

export function createChengdu() {
  const group=new THREE.Group();group.name='成都 · 锦城慢游';const random=rng(20260909), night=glowing(), lanternMat=glowing('#d68255','#ff9c4a');
  const treeTrunks=[],treeLeaves=[[],[],[]],bambooStems=[],bambooLeaves=[],windows=[],people=[],roadMarks=[];
  const bodyGeo=new THREE.BoxGeometry(1,1,1), roundGeo=new THREE.IcosahedronGeometry(1,1);
  let treeCount=0,buildingCount=0;
  const grow=(x,z,s=1,base=0.16,authored=false)=>{if(!authored&&(inRiverfrontClearing(x,z)||inSouthStreetClearing(x,z)))return;if(x<CITY_BOUNDS.minX+2.5||x>CITY_BOUNDS.maxX-2.5||z<CITY_BOUNDS.minZ+2.5||z>CITY_BOUNDS.maxZ-2.5)return;treeCount++;treeTrunks.push([x,base+s*0.9,z,s*0.17,s*1.8,s*0.17]);treeLeaves[Math.floor(random()*3)].push([x,base+s*2.3,z,s*1.03,s*1.4,s*1.02]);};
  const bamboo=(x,z,s=1)=>{ for(let i=0;i<4;i++){const bx=x+(random()-.5)*s,bz=z+(random()-.5)*s,h=(2.7+random()*1.7)*s;bambooStems.push([bx,h/2+0.2,bz,0.065*s,h,0.065*s]);bambooLeaves.push([bx,h*0.8,bz,0.65*s,0.9*s,0.55*s]);} };
  const person=(x,z)=>{people.push([x,0.62,z,0.22,0.8,0.22]);};
  roundedBase(group);

  // Riverbank ribbons give the water a continuous carved, landscaped boundary.
  for(const points of [riverPoints,northRiverPoints]){
    ribbon(group,points,12.2,C.bank,0.14,200);ribbon(group,points,9.7,'#eee4ca',0.19,200);ribbon(group,points,7.6,C.water,0.22,200);
  }
  const flow=ribbon(group,riverPoints,0.10,'#71bfad',0.25,200).curve;
  const northernFlow=ribbon(group,northRiverPoints,0.075,'#8dc7b4',0.25,160).curve;
  const waterHighlights=[];
  for(let i=0;i<45;i++){const t=(i+.4)/46,p=flow.getPoint(t);waterHighlights.push([p.x+(random()-.5)*4.5,.265,p.z,1.4+random()*1.8,0.012,.06]);}
  batch(group,bodyGeo,mat('#8acbbb'),waterHighlights,false);
  for(const cv of [flow,northernFlow])for(let i=0;i<94;i++){const t=(i+.5)/94,p=cv.getPoint(t),d=cv.getTangent(t);for(const side of [-1,1])if(random()>.12)grow(p.x-d.z*side*7,p.z+d.x*side*7,.75+random()*.25);}

  // Legible street network: central axis, east-west avenues and a soft ring.
  const roadPaths=[ [[-8,-105],[-8,-36]], [[-8,2],[-8,273]], [[-103,-4],[-78,-4]], [[-29,-4],[-24,-4]], [[8,-4],[105,-4]], [[-103,-46],[23,-46]], [[-103,66],[60,66]], [[-80,-100],[-80,102]], [[-30,-99],[-30,-91]], [[-30,-49],[-30,84]], [[-30,205],[-30,273]], [[21,-98],[21,-91]], [[21,-49],[21,59]], [[-103,91],[-72,91]], [[-103,204],[-8,204]], [[-103,225],[-8,225]], [[-80,106],[-80,273]], [[-52,129],[-52,196]], [[95,106],[95,213]], [[95,264],[95,273]], [[-8,114],[99,114]], [[-103,272],[99,272]], [[86,-100],[86,14]], [[86,47],[86,65]], [[86,99],[86,101]], [[-103,-63],[-43,-63]], [[-102,91],[-21,91]], [[-103,42],[-70,42]], [[-62,-100],[-62,-53]], [[-100,-90],[31,-90]], [[-26,-35],[8,-35],[8,1],[-26,1],[-26,-35]], ...southStreetRoads ];
  roadPaths.forEach(points=>{ribbon(group,points,5.0,C.edge,0.29,80);ribbon(group,points,3.65,C.road,0.31,80);});
  const ring=[[-93,-73],[-37,-94],[33,-94],[94,-61],[95,29],[67,72],[61,91],[-16,98],[-91,72],[-98,0],[-93,-73]];
  ribbon(group,ring,4.8,C.edge,.28,200);ribbon(group,ring,3.45,C.road,.30,200);
  for(let z=-99;z<=269;z+=4)if(z<-37||z>3){roadMarks.push([-8,.334,z,.12,.01,1.7]);if(!nearRiver(-12,z,8))grow(-12,z,.78);if(!nearRiver(-4,z,8)&&!(z>-90&&z<-49))grow(-4,z,.78);}
  for(let x=-100;x<=100;x+=4){if(x<-26||x>8)roadMarks.push([x,.334,-4,1.7,.01,.12]);}
  batch(group,bodyGeo,mat('#ebe6d4'),roadMarks,false);

  // Instanced neighbourhoods form a dense, warm miniature city around landmark clearings.
  const exclusions=[[-8,-16,23,25],[-54,-32,24,16],[39,-16,29,20],[47,25,17,16],...riverfrontClearings,[-43,40,26,20],[-42,113,32,20],[66,-76,24,22],[10,-70,17,19],[-53,-2,26,17],[31,85,30,24],[36,135+TIANFU_SOUTH_SHIFT,41,17],[49,177+TIANFU_SOUTH_SHIFT,48,28],[-47,163+TIANFU_SOUTH_SHIFT,29,26],southStreetClearing];
  const bodyItems=[[],[],[],[]],rooftops=[];
  for(let gx=-96;gx<=98;gx+=7.6)for(let gz=-96;gz<=268;gz+=7.6){
    const x=gx+(random()-.5)*1.3,z=gz+(random()-.5)*1.3;
    if(exclusions.some(([cx,cz,rx,rz])=>Math.abs(x-cx)<rx&&Math.abs(z-cz)<rz)||nearRiver(x,z,11))continue;
    if(roadPaths.some(ps=>ps.slice(1).some((p,i)=>distSeg(x,z,ps[i],p)<5))||ring.slice(1).some((p,i)=>distSeg(x,z,ring[i],p)<4.6))continue;
    if(random()<(z>100?.3:.13)){panel(group,x,z,5.5,5.6,C.lawn);for(let i=0;i<3;i++)grow(x+(random()-.5)*4,z+(random()-.5)*4,.7+random()*.25);continue;}
    const w=3.5+random()*2.8,d=3.6+random()*2.6,h=2.6+random()*(z>100?12.5:8.1),idx=Math.floor(random()*4);
    bodyItems[idx].push([x,h/2+.26,z,w,h,d]);buildingCount++;
    rooftops.push([x,h+.36,z,w+.14,.22,d+.14]);if(h>5)rooftops.push([x+.3,h+.72,z-.2,w*.38,.56,d*.42]);
    for(let y=1.35;y<h-.25;y+=1.45)for(let xx=x-w/2+.7;xx<x+w/2-.2;xx+=1.25){windows.push([xx,y,z+d/2+.018,.54,.58,.032]);windows.push([xx,y,z-d/2-.018,.54,.58,.032]);}
    for(let y=1.35;y<h-.25;y+=1.45)for(let zz=z-d/2+.7;zz<z+d/2-.2;zz+=1.3){windows.push([x+w/2+.018,y,zz,.032,.58,.54]);windows.push([x-w/2-.018,y,zz,.032,.58,.54]);}
    if(random()<.6)grow(x+w/2+.8,z-d/2-.5,.55+random()*.25);
  }
  ['#e4dcc7','#f2ead6','#d4d6c7','#ccd2c5'].forEach((c,i)=>batch(group,bodyGeo,mat(c),bodyItems[i]));
  batch(group,bodyGeo,mat('#bfc4b4'),rooftops);batch(group,bodyGeo,night,windows,false);

  // 天府广场: stone square, paired spiral pools, central emblem, northern museum facade.
  const tf=new THREE.Group();tf.name='天府广场';tf.userData.landmarkId='tianfu';group.add(tf);
  panel(tf,-8,-15,29,29,'#ddd5ba',.37);panel(tf,-8,-15,26.7,26.7,'#f3e7c9',.49);
  for(let x=-19;x<=3;x+=2.2)block(tf,x,-15,.04,.015,26,'#d6ccb0',.61);
  for(let z=-27;z<=-3;z+=2.2)block(tf,-8,z,26,.015,.04,'#d6ccb0',.62);
  for(const side of [-1,1]){
    const points=[];for(let i=0;i<100;i++){const a=i/99*Math.PI*2.15,r=5.2-i/99*3.6;points.push([-8+side*5+Math.cos(a)*r,-14+Math.sin(a)*r]);}
    ribbon(tf,points,1.15,'#67b4ac',.68,100);
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;grow(-8+side*11,-25+i*3,.65);}
    cylinder(tf,-8+side*6,-13,.35,.6,4.7,C.gold,.7,12);sphere(tf,-8+side*6,5.5,-13,.7,.42,.7,C.gold,2);
  }
  cylinder(tf,-8,-15,2.05,2.05,.09,'#ceb26d',.65,36);
  for(let j=0;j<4;j++){const a=j*Math.PI/2;const ps=[];for(let i=0;i<22;i++){const q=i/21*Math.PI*.8,rr=.4+i/21*1.4;ps.push([-8+Math.cos(a+q)*rr,.79,-15+Math.sin(a+q)*rr]);}line(tf,ps,'#f7edc9',1);}
  building(tf,-8,-31,24,5.4,4.3,'#ded3b7',.3);block(tf,-8,-31,10,7.3,4.8,'#ecdfbe',.3);roof(tf,-8,-31,11.4,1.2,5.8,'#94917b',7.6);
  for(let x=-18;x<=2;x+=1.8)block(tf,x,-28.72,.52,3.5,.5,'#f6edd7',.8);
  block(tf,-8,-24.8,1.7,2.15,1.7,'#e7dcc2',.55);sphere(tf,-8,3.5,-24.8,.37,.43,.36,'#f5efd9',1);block(tf,-8,-24.8,.52,1.1,.45,'#f5efd9',2.9);
  // 成都博物馆: faceted bronze volume on the west edge of the plaza.
  building(tf,-28,-16,7.8,8.6,17,'#b49662',.3);roof(tf,-28,-16,7.9,1.6,17.1,'#ba9d69',8.9);
  for(let z=-23;z<-8;z+=1.35)block(tf,-23.99,z,.06,7.4,.12,'#ddc58f',.8);
  for(let i=0;i<36;i++)person(-20+random()*24,-27+random()*25);

  // 宽窄巷子: three lanes, courtyard blocks, tiled ridges and tea courtyards.
  const kz=new THREE.Group();kz.name='宽窄巷子';kz.userData.landmarkId='kuanzhai';group.add(kz);
  panel(kz,-54,-32,40,26,'#c5bda4',.36);
  for(let lane=0;lane<3;lane++){
    const z=-42+lane*9;panel(kz,-54,z,38,2,'#e9debf',.5);
    for(let j=0;j<5;j++){const x=-69+j*7.5;traditional(kz,x,z-3.4,6.3,4,2.7,'#d6cbb2','#687066'); if(lane<2)traditional(kz,x,z+3.2,6.3,3.5,2.3,'#e1d3b6','#646b63');}
    for(let j=0;j<10;j++){const x=-72+j*4;person(x,z);if(j%3===0){grow(x,z+.1,.8);cylinder(kz,x+1.1,z,.6,.6,.12,'#aa8c5d',.9,12);for(const dx of [-.8,.8])cylinder(kz,x+1.1+dx,z,.22,.22,.65,'#9e7d4d',.27,8);}}
  }
  for(const x of [-73,-35]){block(kz,x,-33,.75,4.5,1.2,'#777665',.3);roof(kz,x,-33,3,1.1,2.8,'#58635a',4.8);}

  // 太古里 and IFS: glass towers, a climbing panda and low courtyard retail.
  const tk=new THREE.Group();tk.name='太古里与 IFS';tk.userData.landmarkId='taikooli';group.add(tk);
  panel(tk,40,-16,46,31,'#ddd5bf',.35);
  building(tk,27,-15,17.5,6.4,19,'#dcd9c6',.48);block(tk,27,-15,17.8,.42,19.3,'#b3b5a0',6.85);
  for(const [x,z,w,d,h] of [[24,-21,6.7,7.7,20.4],[32,-22,6.3,6.6,18.6],[23,-11,5.5,5.6,16]]){
    building(tk,x,z,w,h,d,C.glass,6.9);block(tk,x,z,w+.22,.4,d+.22,'#708781',h+6.9);
    for(let y=8;y<h+6.4;y+=1.05){block(tk,x,z+d/2+.02,w,.11,.035,'#b3c2ae',y);block(tk,x+w/2+.02,z,.035,.11,d,'#9bafa4',y);}
    for(let xx=x-w/2+.55;xx<x+w/2;xx+=1.15)block(tk,xx,z+d/2+.035,.095,h-.4,.04,'#afc0b0',7);
  }
  panda(tk,28,3.2,-4.8,1.55,true);
  panel(tk,27,-14.5,16.6,17.7,'#98b897',7.31);for(let i=0;i<6;i++)grow(20+i*2.5,-18,.48,7.35);
  // Retail alley blocks preserve open pedestrian seams around Daci Temple.
  for(let row=0;row<3;row++)for(let col=0;col<3;col++){
    const x=42+col*7.6,z=-25+row*9.2;if(row===0&&col===1)continue;
    traditional(tk,x,z,6.2,6.2,3.2,'#e8ddc8','#4d6158');
    block(tk,x,z+3.18,4.9,1.9,.07,'#758575',.8);
  }
  traditional(tk,50,-27,9,6.5,4.5,'#a15d3d','#77735b');roof(tk,50,-27,7.5,1.3,5.3,'#72705a',6.55);
  for(let i=0;i<26;i++)person(37+random()*24,-30+random()*28);
  for(const [x,z] of [[39,-30],[46,-20],[60,-10],[41,-2],[57,-30]])grow(x,z,.8);

  // 安顺廊桥: a true open arcade, red columns, stone deck and repeated roof bays.
  const bridge=new THREE.Group();bridge.position.set(47,1.6,25);bridge.rotation.y=.78;bridge.name='安顺廊桥';bridge.userData.landmarkId='anshun';group.add(bridge);
  block(bridge,0,0,21.6,.65,5.3,'#dac9a8',1.0);
  for(const z of [-2.35,2.35]){
    block(bridge,0,z,21.6,.42,.25,'#d9c39c',2.2);
    for(let x=-10;x<=10;x+=2.5){block(bridge,x,z,.3,3.6,.3,'#97492f',1.6);block(bridge,x,z,.22,.9,.22,'#d6c39d',1.6);}
  }
  for(const x of [-7,0,7]){roof(bridge,x,0,8.8,1.7,6.7,'#53665b',4.7);block(bridge,x,0,8,.3,5.7,'#c3aa74',4.5);}
  roof(bridge,0,0,7,1.25,5.7,'#53665b',6.1);
  for(const x of [-6.6,6.6]){block(bridge,x,0,1.1,3.0,4.5,'#b8bba7',-1.78);}
  for(const x of [-11,11]){block(bridge,x,0,2.2,.35,5.5,'#e0d3b6',.6);block(bridge,x*1.07,0,1.5,.25,5.5,'#e0d3b6',.36);}
  for(let x=-8.5;x<=9;x+=3.5)for(const z of [-1.9,1.9]){addMesh(bridge,new THREE.SphereGeometry(.31,8,6),lanternMat,x,4.1,z);}
  // Six descending landings make the raised deck accessible from the riverbanks.
  for(const side of [-1,1])for(let i=0;i<6;i++)block(bridge,side*(12.6+i*.95),0,1.02,.28,5.5,'#e0d3b6',.42-i*.36);
  panel(group,39,37,10,7,'#deceb2',.4);for(let i=0;i<8;i++)person(35+random()*8,34+random()*5);

  // 兰桂坊: three-storey riverfront blocks, two small squares and a light canopy.
  const lkf=new THREE.Group();lkf.name='兰桂坊';lkf.userData.landmarkId='lankwaifong';group.add(lkf);
  const neonRose=glowing('#bd7e83','#ff719c'),neonMint=glowing('#7eafa5','#65d9bf');
  const lkfWindow=glowing('#bfa37b','#ffc276');
  area(lkf,[[59,19],[88,19],[90,33],[85,40],[73,39],[60,36],[57,29]],'#d6c5a6',.47,.19);
  ribbon(lkf,[[59,21],[59,29],[63,35],[72,38],[84,38]],1.35,'#e9ddbf',.69,90);
  // Pedestrian seams remain open between both rows of retail fronts.
  panel(lkf,74,28,30,2.8,'#ecddbd',.67);panel(lkf,69,29,2.8,17,'#ecddbd',.69);
  const cafeTable=(parent,x,z,umbrella=false)=>{
    cylinder(parent,x,z,.57,.57,.12,'#9b754d',1.08,10);cylinder(parent,x,z,.07,.1,.47,'#736b54',.61,6);
    for(const dx of [-.91,.91]){block(parent,x+dx,z,.47,.11,.58,'#b39a68',.83);block(parent,x+dx*1.18,z,.09,.59,.58,'#b39a68',.85);for(const dz of [-.21,.21])block(parent,x+dx,z+dz,.09,.47,.09,'#847153',.37);}
    cylinder(parent,x+.18,z,.07,.06,.16,'#ebdec0',1.2,8);
    if(umbrella){cylinder(parent,x,z,.04,.055,2.2,'#8f7553',.62,6);cylinder(parent,x,z,.05,1.35,.43,'#dfcfaa',2.79,10);}
  };
  const shop=(parent,x,z,w,d,h,color,glow,face=1)=>{
    countBuilding(parent);block(parent,x,z,w,h,d,color,.59);block(parent,x,z,w+.25,.2,d+.23,'#ddd0ae',h+.59);
    // Ground-floor doors, pilasters and upper storey cornices make low blocks readable.
    for(const side of [-1,1]){
      const front=z+side*(d/2+.025);
      for(let j=-1;j<=1;j++){
        const xx=x+j*w*.27;block(parent,xx,front,w*.19,1.47,.045,'#50736b',.82);
        for(const y of [3.0,4.66])if(y+1.04<h+.59){block(parent,xx,front,w*.17,1.03,.046,lkfWindow,y);block(parent,xx,front,w*.205,.09,.13,'#e2ceb0',y-.12);}
      }
      for(const xx of [x-w/2+.14,x+w/2-.14])block(parent,xx,front,.2,h,.13,'#dac5a1',.59);
      for(const y of [2.64,4.29])if(y<h+.5)block(parent,x,front,w+.13,.15,.16,'#d8c5a3',y);
    }
    const fz=z+face*(d/2+.85),awning=block(parent,x,fz,w*.85,.13,1.7,'#788c79',2.65);awning.rotation.x=face*.12;
    for(let j=0;j<5;j++)block(parent,x-w*.34+j*w*.17,fz,.16,.145,1.64,'#ded2ae',2.67);
    block(parent,x,z+face*(d/2+.10),w*.59,.58,.12,'#526a63',2.09);
    // Abstract music-note signs are original storefront graphics, not merchant logos.
    block(parent,x-.17,z+face*(d/2+.185),.085,.35,.05,glow,2.20);
    block(parent,x+.17,z+face*(d/2+.185),.085,.43,.05,glow,2.20);
    block(parent,x,z+face*(d/2+.185),.43,.07,.05,glow,2.54);
    for(const dx of [-.20,.14])sphere(parent,x+dx,2.23,z+face*(d/2+.20),.12,.075,.045,glow,1);
    if(h>5.6)roof(parent,x,z,w+.38,.81,d+.33,'#6a6b58',h+.79);
  };
  for(const [x,z,w,d,h,color,face] of [[63.5,23,6.3,5,5.9,'#b49b72',1],[73,22.9,6.4,5.2,6.15,'#bfac84',1],[82.5,23,7.2,5,5.75,'#a48565',1],[63.8,32,5.4,4.9,5.65,'#b9a47d',-1],[74,33,6.1,4.7,5.9,'#ad916d',-1],[84,32,6.3,4.8,5.55,'#c1ae89',-1]])shop(lkf,x,z,w,d,h,color,x<76?neonRose:neonMint,face);
  // Open square tables and a translucent ETFE-inspired canopy sit between buildings.
  for(const [x,z] of [[69.1,22],[69.1,25],[79,28],[87.5,29.5],[60,28.7],[81.5,37.3]])cafeTable(lkf,x,z,x===81.5||x===69.1);
  const canopyMat=mat('#c4d1b5',{transparent:true,opacity:.35,roughness:.4,side:THREE.DoubleSide,depthWrite:false});
  const canopy=new THREE.BufferGeometry(),cp=[],ci=[];
  for(let i=0;i<=12;i++)for(const z of [26.35,29.65]){const u=i/12;cp.push(70+u*16,5.8+Math.sin(u*Math.PI)*.9,z);}
  for(let i=0;i<12;i++){const a=i*2;ci.push(a,a+2,a+1,a+1,a+2,a+3);}
  canopy.setAttribute('position',new THREE.Float32BufferAttribute(cp,3));canopy.setIndex(ci);canopy.computeVertexNormals();addMesh(lkf,canopy,canopyMat);
  for(const x of [70,78,86]){for(const z of [26.3,29.7])block(lkf,x,z,.08,5.35,.08,'#87977e',.65);block(lkf,x,28,.09,.1,3.7,'#c5ccb1',5.97+Math.sin((x-70)/16*Math.PI)*.9);}
  for(let i=0;i<12;i++){const x=60+i*2.3,z=37.1+Math.sin(i/11*Math.PI)*1.5;block(lkf,x,z,.13,1.0,.13,'#b3a481',.67);if(i<11)block(lkf,x+1.12,z+.12,2.25,.12,.11,'#d6c39d',1.59);}
  for(const [x,z] of [[60,20],[89,23],[88,36],[58,33]]){grow(x,z,.6,.55,true);lamp(lkf,x+.9,z,lkfWindow,2.9);}
  for(let i=0;i<15;i++)person(69.0+random()*16,27.1+random()*1.4);

  // 九眼桥: the present bridge/riverwalk district, with a genuinely open deck.
  const jy=new THREE.Group();jy.name='九眼桥';jy.userData.landmarkId='jiuyanqiao';group.add(jy);
  const bridgePoint=flow.getPoint(.82),bridgeTangent=flow.getTangent(.82);
  const roadBridge=new THREE.Group();roadBridge.position.set(bridgePoint.x,0,bridgePoint.z);roadBridge.rotation.y=Math.atan2(bridgeTangent.x,bridgeTangent.z);jy.add(roadBridge);
  block(roadBridge,0,0,20,.58,5.8,'#c9c6af',2.8);block(roadBridge,0,0,20,.045,3.6,'#8f9890',3.39);
  for(const side of [-1,1]){
    block(roadBridge,0,side*2.32,20,.15,1.07,'#e2d8ba',3.38);
    for(const y of [3.91,4.37])block(roadBridge,0,side*2.81,20,.10,.11,'#c1c7b0',y);
    block(roadBridge,0,side*2.86,20,.075,.045,neonMint,3.68);
    for(let x=-9.5;x<=10;x+=1.3)block(roadBridge,x,side*2.8,.10,.93,.10,'#a7b1a0',3.47);
  }
  for(const x of [-5.25,5.25]){block(roadBridge,x,0,.85,2.96,4.6,'#b5b9a8',-.13);block(roadBridge,x,0,1.4,.3,5.1,'#c4c4ae',2.51);}
  for(let x=-8.5;x<=9;x+=2.6)block(roadBridge,x,0,1.3,.035,.10,'#e9dfbd',3.45);
  // Sloped approaches meet the banks; the deck underside clears every existing boat.
  for(const side of [-1,1]){
    const ps=[10*side,3.41,-2.9,16*side,.44,-2.9,16*side,.44,2.9,10*side,3.41,2.9];
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));geo.setIndex(side>0?[0,2,1,0,3,2]:[0,1,2,0,2,3]);geo.computeVertexNormals();addMesh(roadBridge,geo,mat('#aeb6a4',{side:THREE.DoubleSide}));
    block(roadBridge,side*10,0,.5,3.0,5.4,'#b5b9a8',.3);
    for(const z of [-2.83,2.83]){line(roadBridge,[[side*10,4.3,z],[side*16,1.33,z]],'#c5c9b0');for(let i=0;i<4;i++)block(roadBridge,side*(11+i*1.5),z,.1,.87,.1,'#bdc3ae',2.93-i*.743);}
  }
  // Separate western riverwalk and a small music street give this stop its own shore.
  area(jy,[[32,43],[45,42],[49,46],[53,55],[50,60],[33,60]],'#cebba0',.42,.17);
  const westWalk=[];for(let i=0;i<=24;i++){const u=.735+i/24*.145,p=flow.getPoint(u),d=flow.getTangent(u);westWalk.push([p.x-d.z*6.2,p.z+d.x*6.2]);}
  ribbon(jy,westWalk,1.45,'#e8d9bb',.66,90);
  for(const [x,z,h,col] of [[35,46,3.55,'#a98a65'],[42,46,3.1,'#b39b74'],[36,55,3.3,'#ad9677'],[44,55,3.7,'#9e8165']])shop(jy,x,z,5.1,4.1,h,col,x<40?neonRose:neonMint,z<50?1:-1);
  for(const [x,z] of [[33,51],[38,51],[43,51],[49,55]])cafeTable(jy,x,z,false);
  for(const [x,z] of [[46,41],[50,48],[55,55],[60,59]]){lamp(jy,x,z,lkfWindow,2.6);grow(x-1.4,z,.55,.5,true);}
  for(let i=0;i<12;i++)person(33+random()*13,50+random()*2);

  // 望江楼: lower square tiers and upper octagonal tiers, encircled by bamboo.
  const wj=new THREE.Group();wj.name='望江楼';wj.userData.landmarkId='wangjiang';wj.position.set(WANGJIANG.x-69*WANGJIANG.scale,0,WANGJIANG.z-48*WANGJIANG.scale);wj.scale.set(WANGJIANG.scale,1,WANGJIANG.scale);group.add(wj);
  area(wj,[[55,32],[80,32],[87,48],[84,59],[59,59],[54,49]],'#a5bf94',.3,.18);
  panel(wj,69,48,13,13,'#d6c7a5',.55);
  countBuilding(wj);
  for(let level=0;level<4;level++){
    const y=.95+level*3.15,w=level<2?7.2-level*.5:5.8-(level-2)*.8;
    if(level<2){block(wj,69,48,w,2.35,w,'#af6c43',y);roof(wj,69,48,w+2.7,1.15,w+2.7,'#587061',y+2.3);}
    else {cylinder(wj,69,48,w/2,w/2,2.35,'#b47b4d',y,8);cylinder(wj,69,48,.4,w*.77,1.55,'#536e60',y+2.25,8);}
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2,x=69+Math.cos(a)*w*.44,z=48+Math.sin(a)*w*.44;block(wj,x,z,.18,2.5,.18,'#793d2c',y);}
    if(level<2)for(const dz of [-w/2-.1,w/2+.1])block(wj,69,48+dz,w+.6,.27,.23,'#e0b875',y+.62);
  }
  cylinder(wj,69,48,0.02,.3,1.5,'#c7aa62',14.05,8);sphere(wj,69,15.58,48,.18,.24,.18,'#d9bd77',1);
  traditional(wj,79,39,7,4.5,3,'#c0a279','#627261');
  for(let i=0;i<64;i++){const x=55+random()*29,z=33+random()*25;if(Math.hypot(x-69,z-48)>9)bamboo(WANGJIANG.x+(x-69)*WANGJIANG.scale,WANGJIANG.z+(z-48)*WANGJIANG.scale,(.85+random()*.35)*WANGJIANG.scale);}
  ribbon(wj,[[57,54],[60,46],[63,39],[79,39]],1.2,'#e3d5b7',.6,60);

  // 武侯祠 and 锦里: red-wall courtyards, ancient cypresses, an eastern lantern lane.
  const wh=new THREE.Group();wh.name='武侯祠与锦里';wh.userData.landmarkId='wuhou';group.add(wh);
  panel(wh,-45,40,39,30,'#9eb18a',.35);panel(wh,-48,40,22,26,'#cebf9c',.49);
  for(const x of [-59,-37])block(wh,x,40,.65,2.5,27,'#a4523a',.5);
  for(const z of [27,53])block(wh,-48,z,22,2.5,.6,'#a4523a',.5);
  for(const z of [29,38,47]){traditional(wh,-48,z,15,5.5,3.2,'#9e5536','#596b5c');for(const x of [-55,-41])grow(x,z+4,.9);}
  traditional(wh,-48,54,7.7,3.6,2.8,'#a35134','#687460');
  for(const x of [-62,-34])for(let z=27;z<=53;z+=4)grow(x,z,1.08);
  const alley=[[-31,25],[-29,33],[-31,40],[-28,49],[-30,55]];ribbon(wh,alley,2.4,'#dbc6a4',.6,70);
  for(let i=0;i<6;i++)for(const s of [-1,1]){
    const x=-30+s*4.1,z=28+i*4.7;traditional(wh,x,z,5.8,3.8,2.4,'#b77853','#615f50');
    addMesh(wh,new THREE.SphereGeometry(.35,8,6),lanternMat,x-s*3.1,2.9,z+.8);
  }
  for(let i=0;i<20;i++)person(-32+random()*4,27+random()*27);

  // 环球中心: a broad blue glass body and an explicitly modeled undulating roof shell.
  const gc=new THREE.Group();gc.name='环球中心';gc.userData.landmarkId='global';gc.position.set(-46,0,32);group.add(gc);
  panel(gc,4,79,52,25,'#d0c8ad',.35);building(gc,4,79,47,8.6,19,C.glass,.65);
  const roofPositions=[],roofIndices=[],segments=52,depthSeg=12;
  for(let i=0;i<=segments;i++)for(let j=0;j<=depthSeg;j++){
    const u=i/segments,v=j/depthSeg,x=4+(u-.5)*49,z=79+(v-.5)*21;
    const y=9.25+Math.sin(u*Math.PI)*2.1+Math.cos(u*Math.PI*4)*.82+Math.sin(v*Math.PI)*1.0;
    roofPositions.push(x,y,z);
  }
  for(let i=0;i<segments;i++)for(let j=0;j<depthSeg;j++){const a=i*(depthSeg+1)+j,b=a+depthSeg+1;roofIndices.push(a,b,a+1,b,b+1,a+1);}
  const waveGeo=new THREE.BufferGeometry();waveGeo.setAttribute('position',new THREE.Float32BufferAttribute(roofPositions,3));waveGeo.setIndex(roofIndices);waveGeo.computeVertexNormals();
  addMesh(gc,waveGeo,new THREE.MeshStandardMaterial({color:'#7b9c99',roughness:.48,metalness:.2,side:THREE.DoubleSide}));
  for(let i=0;i<=26;i++){const u=i/26,ps=[];for(let j=0;j<=12;j++){const v=j/12;ps.push([4+(u-.5)*49,9.33+Math.sin(u*Math.PI)*2.1+Math.cos(u*Math.PI*4)*.82+Math.sin(v*Math.PI),79+(v-.5)*21]);}line(gc,ps,'#e0dfc5',1);}
  for(let x=-18;x<28;x+=1.55){block(gc,x,88.6,.14,8.5,.1,'#bdc7b8',.7);block(gc,x,69.4,.14,8.5,.1,'#bdc7b8',.7);}
  for(let y=2;y<9;y+=1.5)for(const z of [69.35,88.65])block(gc,4,z,47,.13,.07,'#aabeb2',y);
  for(const x of [-17,25])block(gc,x,79,1,9.5,20.5,'#e0d9bd',.6);
  panel(gc,4,94,35,5,'#65b2ad',.55);for(let i=0;i<8;i++)grow(-65+i*6.5,126,.7);

  // 熊猫基地: a landscaped habitat, pond, climbing frames and three sculpted pandas.
  const pb=new THREE.Group();pb.name='熊猫基地';pb.userData.landmarkId='panda';group.add(pb);
  area(pb,[[43,-94],[69,-98],[87,-89],[91,-67],[78,-56],[54,-57],[41,-71]],'#9dbb8c',.4,.3);
  area(pb,[[70,-90],[81,-88],[84,-83],[80,-79],[73,-81],[69,-85]],'#6fa99c',.78,.04);
  ribbon(pb,[[47,-87],[55,-90],[65,-86],[64,-77],[79,-73],[82,-63],[67,-63],[56,-72],[47,-71],[47,-87]],1.7,'#e0d1aa',.82,150);
  traditional(pb,51,-83,10,6,3.1,'#d1bd8f','#6d7c60');traditional(pb,78,-61,11,5.2,2.7,'#d2bd8e','#6d7c60');
  for(const [x,z] of [[62,-76],[76,-72]]){
    for(const dx of [-2,2])for(const dz of [-1.5,1.5])block(pb,x+dx,z+dz,.3,3.2,.3,'#8f7451',.7);
    block(pb,x,z,5.4,.35,3.8,'#9e855a',3.7);block(pb,x,z,5,.3,.32,'#90754e',1.9);
  }
  panda(pb,60,.83,-69,1.05);panda(pb,73,4.1,-72,.77);const resting=panda(pb,63,4.1,-76,.73);resting.rotation.z=-.25;
  for(let i=0;i<85;i++){const x=44+random()*43,z=-94+random()*35;if(Math.hypot(x-65,z+76)>12&&Math.hypot(x-77,z+85)>7)bamboo(x,z,.9+random()*.45);}
  for(let i=0;i<30;i++){const a=i/30*Math.PI*2;grow(65+Math.cos(a)*24,-77+Math.sin(a)*20,.82+random()*.2);}
  for(let i=0;i<13;i++)person(48+random()*4,-87+random()*15);


  // 文殊院: a south-facing sequence of courts, layered eaves and paired bell towers.
  const ws=new THREE.Group();ws.name='文殊院';ws.userData.landmarkId='wenshu';ws.position.x=35;group.add(ws);
  panel(ws,-25,-70,29.5,36,'#b6bb95',.34);panel(ws,-25,-70,25.4,33,'#d3c5a4',.48);
  for(const x of [-39,-11]){block(ws,x,-70,.6,2.4,35,'#caa764',.49);roof(ws,x,-70,1.2,.6,35.5,'#555d53',2.9);}
  for(const z of [-87,-52.5]){block(ws,-25,z,28,2.4,.62,'#caa764',.49);roof(ws,-25,z,29,.68,1.6,'#555d53',2.9);}
  const templeHall=(x,z,w,d,h,double=false)=>{
    traditional(ws,x,z,w,d,h,'#d0ad70','#515c52');
    block(ws,x,z,w*.61,.16,.28,'#b4a47e',h+2.11);
    for(const side of [-1,1]){
      // Raised corner ridges are independent polylines rather than a flat pitched box.
      for(const dz of [-1,1])line(ws,[[x+side*w*.22,h+2.11,z],[x+side*w*.38,h+1.0,z+dz*d*.34],[x+side*(w/2+.64),h+.74,z+dz*(d/2+.6)],[x+side*(w/2+.94),h+1.11,z+dz*(d/2+.88)]],'#a5a17b');
      for(let j=0;j<5;j++){const xx=x-w/2+.7+j*(w-1.4)/4;block(ws,xx,z+side*(d/2+.09),.19,h,.19,'#804e32',.6);}
    }
    if(double){block(ws,x,z,w*.72,1.3,d*.68,'#9e7646',h+1.45);roof(ws,x,z,w*.9,1.5,d*.91,'#4c594f',h+2.75);block(ws,x,z,w*.47,.13,.24,'#b7a878',h+4.22);}
  };
  for(const [z,w,d,h,double] of [[-55,15,4.1,3.2,false],[-62,16.2,4.1,3.5,false],[-70.1,17.8,5.1,4.15,true],[-78,16.2,4.5,3.7,false],[-84,18.2,4.8,4.4,true]])templeHall(-25,z,w,d,h,double);
  for(const x of [-36.7,-13.3])for(const z of [-61,-69.5,-78]){
    building(ws,x,z,2.8,2.7,7.9,'#bea36f',.55);roof(ws,x,z,4.1,1.05,8.5,'#576052',3.25);
    for(let dz=-3;dz<=3;dz+=1.5)block(ws,x+(x<-25?1.49:-1.49),z+dz,.16,2.75,.16,'#805533',.55);
  }
  for(const x of [-35.5,-14.5]){
    building(ws,x,-55.9,3.1,2.8,3.1,'#b78f55',.6);roof(ws,x,-55.9,4.6,.9,4.6,'#515e53',3.35);block(ws,x,-55.9,2.35,1.6,2.35,'#a17a49',4.14);roof(ws,x,-55.9,3.6,1.0,3.6,'#515e53',5.74);
    cylinder(ws,x,-55.9,.45,.68,1,'#ad9060',4.25,12);
  }
  cylinder(ws,-25,-66,.52,.68,.9,'#8d8e69',.62,12);roof(ws,-25,-66,1.7,.72,1.5,'#737e5c',1.75);
  for(const x of [-31.1,-18.9])for(const z of [-58.5,-66.1,-74.6]){panel(ws,x,z,2.9,2.6,'#9eae83',.57);grow(x+35,z,.7,.61);}
  block(ws,-25,-49.7,14,2.6,.53,'#d2ad68',.48);roof(ws,-25,-49.7,14.8,.52,1.4,'#596352',3.08);
  for(let i=0;i<16;i++)person(3+random()*14,-51.6+random()*1.2);

  // 人民公园: an irregular lake, tea-house court, bamboo chairs and a stone obelisk.
  const rp=new THREE.Group();rp.name='人民公园';rp.userData.landmarkId='renmin';group.add(rp);
  area(rp,[[-76,-15],[-42,-17],[-32,-9],[-33,7],[-43,11],[-64,11],[-77,5]],'#9eb589',.38,.2);
  const parkLake=[[-68,-1],[-63,-4],[-55,-3],[-50,1],[-48,5],[-53,8],[-64,8],[-70,4],[-68,-1]];
  area(rp,parkLake,'#6caaa0',.6,.04);ribbon(rp,parkLake,1.05,'#e3d3b3',.65,90);
  ribbon(rp,[[-72,-12],[-62,-13],[-45,-12],[-37,-6],[-38,5],[-44,8]],1.3,'#e3d3b3',.63,100);
  traditional(rp,-51,-10,17,5.3,3.2,'#bd9968','#586552');roof(rp,-51,-10,14,1.1,4.4,'#586552',4.6);
  panel(rp,-48,-4,16,6.6,'#dbceae',.6);
  // Open veranda and lanterns face the tea court.
  for(let x=-58;x<=-43;x+=2.5){block(rp,x,-6.8,.19,3,.19,'#98623e',.65);addMesh(rp,new THREE.SphereGeometry(.2,8,6),lanternMat,x,3.0,-6.6);}
  const umbrellaColors=['#ded2ad','#c3ad78','#8eab88'];
  for(let row=0;row<2;row++)for(let col=0;col<4;col++){
    const x=-56.8+col*4.2,z=-4.5+row*3.3;
    cylinder(rp,x,z,.85,.85,.16,'#94734c',1.13,12);cylinder(rp,x,z,.09,.11,.64,'#826847',.49,8);
    for(const dx of [-1.25,1.25]){
      block(rp,x+dx,z,.77,.15,.86,'#b39158',.84);block(rp,x+dx*1.22,z,.11,.81,.86,'#b39158',.85);
      for(const dz of [-.31,.31])block(rp,x+dx,z+dz,.13,.68,.13,'#997b4b',.2);
    }
    for(const dx of [-.34,.34]){cylinder(rp,x+dx,z,.11,.08,.18,'#f2e6cc',1.29,10);cylinder(rp,x+dx,z,.13,.13,.045,'#eee1c2',1.47,10);}
    if((row+col)%2===0){cylinder(rp,x,z,.045,.07,2.75,'#8e7652',.55,6);cylinder(rp,x,z,.05,1.83,.69,umbrellaColors[col%3],3.13,10);cylinder(rp,x,z,.06,.07,.22,'#917657',3.8,6);}
  }
  // 保路纪念碑: square stepped base and a tapering masonry shaft.
  for(let i=0;i<3;i++)block(rp,-69,-10,5.2-i*.7,.39,5.2-i*.7,'#b9b49b',.55+i*.39);
  cylinder(rp,-69,-10,.65,1.08,5.3,'#c9c3a9',1.72,4).rotation.y=Math.PI/4;
  cylinder(rp,-69,-10,.08,.92,1.3,'#bbb99f',7.02,4).rotation.y=Math.PI/4;
  block(rp,-69,-8.94,.28,3.65,.035,'#878773',2.4);
  for(const [x,z] of [[-75,-11],[-75,-6],[-74,1],[-73,6],[-65,-14],[-39,-12],[-36,-5],[-36,3],[-42,8],[-45,10],[-64,10]])grow(x,z,.83,.53);
  block(rp,-62,5,6,.28,1.05,'#bea87f',.92);for(const z of [4.45,5.55])block(rp,-62,z,6,.23,.1,'#e1d4b2',1.57);
  for(let i=0;i<12;i++)person(-57+random()*15,-5.5+random()*6.5);

  // 金融城: two independently sculpted tapered towers with diamond outer screens.
  const ft=new THREE.Group();ft.name='金融城双子塔';ft.userData.landmarkId='twin-towers';group.add(ft);
  panel(ft,31,85,52,42,'#b5c7a1',.34);panel(ft,30,79,36,25,'#d7d4bd',.48);
  const towerGlass=mat('#346a76',{roughness:.32,metalness:.35});
  const ledBlue=glowing('#83b8b8','#55d7df'),ledAmber=glowing('#cfcaaa','#ffbd79');
  const bluePixels=[],amberPixels=[];
  function tower(x,z,h){
    countBuilding(ft);
    const w=9.2,d=10.4,c=.17,ring=[[-.5+c,-.5],[.5-c,-.5],[.5,-.5+c],[.5,.5-c],[.5-c,.5],[-.5+c,.5],[-.5,.5-c],[-.5,-.5+c]];
    const levels=[[0,1],[h*.84,1],[h*.94,.91],[h,.69]],ps=[],idx=[];
    for(const [y,scale] of levels)for(const [rx,rz] of ring)ps.push(x+rx*w*scale,.9+y,z+rz*d*scale);
    for(let l=0;l<3;l++)for(let i=0;i<8;i++){const a=l*8+i,b=l*8+(i+1)%8;idx.push(a,b,a+8,b,b+8,a+8);}
    for(let i=1;i<7;i++)idx.push(24,24+i,25+i);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));geo.setIndex(idx);geo.computeVertexNormals();addMesh(ft,geo,towerGlass);
    block(ft,x,z,w+2.3,1.0,d+2.3,'#cbd0bb',.4);
    // Chamfered metal corners remain legible from every orbit angle.
    for(const [rx,rz] of ring)line(ft,[[x+rx*w,.9,z+rz*d],[x+rx*w,h*.84+.9,z+rz*d],[x+rx*w*.91,h*.94+.9,z+rz*d*.91],[x+rx*w*.69,h+.9,z+rz*d*.69]],'#adc1b6');
    for(let y=2.1;y<h*.84;y+=1.23){
      for(const side of [-1,1]){block(ft,x,z+side*(d/2+.025),w*.66,.075,.055,'#8eaeb0',y);block(ft,x+side*(w/2+.025),z,.055,.075,d*.66,'#8eaeb0',y);}
      for(let i=0;i<6;i++)for(const side of [-1,1]){
        const px=x-2.55+i*1.02,py=y+.37,target=((Math.floor(y/1.23)+i)%5===0)?amberPixels:bluePixels;
        target.push([px,py,z+side*(d/2+.063),.59,.55,.055]);
      }
    }
    // Ice-flower diagonals form a paired diamond lattice over the glazed faces.
    for(const side of [-1,1])for(let y=3;y<h*.82-5.5;y+=6.2)for(let col=-1;col<=1;col++){
      const xx=x+col*2.45,zz=z+side*(d/2+.12),diamond=[[xx,y,zz],[xx+1.8,y+3.1,zz],[xx,y+6.2,zz],[xx-1.8,y+3.1,zz],[xx,y,zz]];line(ft,diamond,'#d0d3bc',.82);
    }
    // Open crown fins emphasize the matching silhouette without a fictitious skybridge.
    for(let i=0;i<7;i++){const xx=x-2.7+i*.9;block(ft,xx,z,0.10,2.45,6.9,'#b7c9be',h+.9);}
    block(ft,x,z,w*.7,.22,d*.72,'#d3d7c5',h+3.28);
  }
  tower(19.7,80.5,40.8);tower(40.3,80.5,40.8);batch(ft,bodyGeo,ledBlue,bluePixels,false);batch(ft,bodyGeo,ledAmber,amberPixels,false);
  // Jiaozi Park carries the towers into a civic landscape.
  ribbon(ft,[[8,94],[17,91],[30,98],[46,93],[54,99]],1.7,'#e9dec1',.56,100);
  area(ft,[[21,96],[28,93],[37,94],[43,99],[35,104],[27,103]],'#69aba2',.58,.03);
  panel(ft,30,111,49,4,'#d8cfb5',.45);
  for(const x of [7,12,48,55])for(const z of [71,88,101,107])grow(x,z,.93,.52);
  for(let i=0;i<13;i++)person(8+random()*45,93+random()*13);
  for(const [x,z] of [[8,69],[30,69],[52,69],[8,105],[52,105]])lamp(ft,x,z,ledAmber,3.3);

  // 新区几何以本地坐标整体南移，实例化树木和行人同步换算为世界坐标。
  const growNewTown=(x,z,...args)=>grow(x,z+TIANFU_SOUTH_SHIFT,...args);
  const personNewTown=(x,z)=>person(x,z+TIANFU_SOUTH_SHIFT);
  // 天府新区: a horizontal exhibition complex, open lawns and a connected avenue.
  const ex=new THREE.Group();ex.name='天府新区 · 西博城';ex.userData.landmarkId='expo';ex.position.z=TIANFU_SOUTH_SHIFT;group.add(ex);
  panel(ex,36,135,75,29,'#c9d0b6',.35);panel(ex,36,135,68,25,'#dcd5c0',.48);
  building(ex,36,135,64,3.35,3.4,'#507f84',.64);block(ex,36,135,67,.48,4.1,'#e4e2cb',4);
  for(let col=0;col<5;col++)for(const row of [-1,1]){
    const x=7.5+col*14.2,z=135+row*7.4,w=13.2,d=10.5;
    building(ex,x,z,w,4.65,d,'#759596',.65);
    const rp=[],ri=[],count=16;
    for(let a=0;a<=count;a++)for(let b=0;b<=2;b++){
      const u=a/count,v=b/2;rp.push(x+(u-.5)*(w+1.6),5.1+Math.sin(u*Math.PI)*2.05+v*.35,z+(v-.5)*(d+1.05));
    }
    for(let a=0;a<count;a++)for(let b=0;b<2;b++){const n=a*3+b;ri.push(n,n+3,n+1,n+3,n+4,n+1);}
    const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(rp,3));rg.setIndex(ri);rg.computeVertexNormals();addMesh(ex,rg,mat('#d6dccd',{side:THREE.DoubleSide,roughness:.55,metalness:.14}));
    for(let a=0;a<=8;a++){const u=a/8;line(ex,[[x+(u-.5)*(w+1.6),5.16+Math.sin(u*Math.PI)*2.05,z-d/2-.525],[x+(u-.5)*(w+1.6),5.51+Math.sin(u*Math.PI)*2.05,z+d/2+.525]],'#859f9c');}
    for(let xx=x-w/2+.7;xx<x+w/2;xx+=1.4){block(ex,xx,z+row*(d/2+.06),.12,4.2,.1,'#d0d6c7',.7);block(ex,xx+.45,z+row*(d/2+.08),.45,2.2,.055,night,1.2);}
    block(ex,x,z+row*(d/2+1),4.9,.3,1.5,'#e9dfc2',.51);
  }
  // Long approach and exhibition plazas reinforce the campus scale.
  for(let x=4;x<71;x+=4){block(ex,x,119.8,1.7,.08,1.2,'#f1e4c3',.53);growNewTown(x,121.3,.65,.16,true);}
  for(const x of [4,18,32,46,60,72]){lamp(ex,x,151.7,night,3);growNewTown(x,153.6,.68);}
  for(let i=0;i<32;i++)personNewTown(2+random()*69,118.4+random()*2);
  // Headquarter offices west of the avenue accompany the public lawns.
  panel(ex,-45,159,42,39,'#afc39c',.3);
  for(const [x,z,h] of [[-63,148,9],[-48,147,12],[-64,165,11],[-45,173,8]]){
    building(ex,x,z,8.6,h,9.3,'#6b9290',.44);block(ex,x,z,9.1,.35,9.8,'#d7dbca',h+.44);
    for(let y=1.8;y<h;y+=1.6)block(ex,x,z+4.72,8.4,.12,.06,'#c9d3bb',y);
    for(const dx of [-5.5,5.5])growNewTown(x+dx,z+5.7,.85);
  }
  ribbon(ex,[[-69,178],[-56,181],[-34,173],[-22,156],[-15,138]],1.55,'#ded5b8',.54,100);
  for(let i=0;i<12;i++)growNewTown(-24,139+i*4,.86);

  // 兴隆湖: an expansive basin east of Tianfu Avenue, ring path and wetland edges.
  const xl=new THREE.Group();xl.name='兴隆湖';xl.userData.landmarkId='xinglong';xl.position.z=TIANFU_SOUTH_SHIFT;group.add(xl);
  const lakeOuter=lakePoints.map(([x,z])=>[49+(x-49)*1.12,176+(z-176)*1.11]);
  area(xl,lakeOuter,'#96b890',.42,.18);area(xl,lakePoints,'#4caaa4',.5,.06);
  ribbon(xl,lakePoints,1.2,'#c7d2ab',.57,180);
  const promenade=lakePoints.map(([x,z])=>[49+(x-49)*1.067,176+(z-176)*1.065]);
  ribbon(xl,promenade,1.0,'#e5d8b9',.66,180);
  const lakeHighlight=[];
  for(let i=0;i<46;i++){const x=28+random()*46,z=164+random()*24;lakeHighlight.push([x,.582,z,1.7+random()*3.8,.013,.055]);}
  batch(xl,bodyGeo,mat('#92cdb7'),lakeHighlight,false);
  area(xl,[[74,154],[82,158],[88,169],[82,168],[78,163],[72,161]],'#a2bc85',.63,.06);
  for(let i=0;i<36;i++){const x=77+random()*7,z=159+random()*7;block(xl,x,z,.04,.55+random()*.62,.045,'#9d9d65',.65);}
  ribbon(xl,[[69,153],[80,154],[87,162],[89,172]],.9,'#bda777',.85,70);
  for(let i=0;i<46;i++){
    const a=i/46*Math.PI*2,x=49+Math.cos(a)*40,z=176+Math.sin(a)*26;
    if(z<200&&z>155&&!(x<33&&z>174&&z<190))growNewTown(x,z,.8+random()*.2,.54);
  }
  // A curving book-page roof and clear glazing make the lakeside bookshop distinct.
  const bx=23,bz=181;
  panel(xl,bx,bz,14.8,8.5,'#c8b690',.71);building(xl,bx,bz,12.4,3.1,6.4,'#487b78',.85);
  const bookPos=[],bookIdx=[];
  for(let u=0;u<=24;u++)for(let v=0;v<=4;v++){
    const a=u/24,b=v/4;bookPos.push(bx+(a-.5)*15.8,3.1+Math.pow(a-.32,2)*8+Math.sin(b*Math.PI)*.8,bz+(b-.5)*8.2);
  }
  for(let u=0;u<24;u++)for(let v=0;v<4;v++){const k=u*5+v;bookIdx.push(k,k+5,k+1,k+5,k+6,k+1);}
  const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(bookPos,3));bg.setIndex(bookIdx);bg.computeVertexNormals();addMesh(xl,bg,mat('#dbcba8',{side:THREE.DoubleSide,roughness:.73}));
  for(let x=bx-5.8;x<bx+6.1;x+=1.2){block(xl,x,bz+3.25,.12,2.85,.1,'#cfccb3',.85);block(xl,x+.45,bz+3.22,.55,1.8,.06,night,1.1);}
  block(xl,32.2,183,5.7,.24,2.5,'#baa77f',.76);block(xl,34.8,184.5,.16,1.2,5.5,'#d1c4a3',.98);
  for(let i=0;i<9;i++){const x=16.5+i*1.5;block(xl,x,185.7,.16,1.1,.16,'#c0ad82',.92);}
  for(let i=0;i<12;i++)personNewTown(16+random()*12,185.4+random()*1.5);
  // Scientific institutions are a campus backdrop, separated from the lake itself.
  for(const [x,z,w,d,h] of [[3,164,8,12,11],[-1,183,6,11,8],[93,183,8,10,12],[91,157,10,7,9]]){
    building(xl,x,z,w,h,d,'#7e9c97',.44);block(xl,x,z,w+.5,.4,d+.5,'#d7dbc9',h+.44);
    for(let y=1.8;y<h;y+=1.5)for(const side of [-1,1])block(xl,x,z+side*(d/2+.04),w-.5,.18,.06,'#c6d3c0',y);
    for(const dx of [-w/2-.9,w/2+.9])growNewTown(x+dx,z,.85);
  }
  for(const [x,z] of [[12,164],[12,191],[38,202],[66,200],[89,175]])lamp(xl,x,z,night,2.5);

  buildSouthStreets(group,{grow,person,night,building});

  // Tiny urban details and warm lanterns live in dedicated instanced batches.
  for(let i=0;i<14;i++){const x=-97+i*7.1;if(!nearRiver(x,-8,8))grow(x,-8,.68);}
  for(const [x,z] of [[-23,-28],[7,-28],[-23,-2],[7,-2],[36,-31],[59,-2],[34,33],[55,19],[-31,54],[-72,-42],[-33,-23],[-16,95],[29,93]])lamp(group,x,z,night,2.8);
  batch(group,bodyGeo,mat('#7c7559'),treeTrunks);
  ['#638b65','#739772','#85a37b'].forEach((c,i)=>batch(group,roundGeo,mat(c),treeLeaves[i]));
  batch(group,bodyGeo,mat('#779664'),bambooStems);batch(group,roundGeo,mat('#678a58'),bambooLeaves);
  batch(group,new THREE.CylinderGeometry(.5,.6,1,6),mat('#b67754'),people);
  const heads=people.map(p=>[p[0],1.19,p[2],.16,.17,.16]);batch(group,new THREE.IcosahedronGeometry(1,0),mat('#e6c59b'),heads);

  // Slow river cruises and sparse road traffic keep the model quietly alive.
  const boats=[];
  for(let i=0;i<3;i++){
    const g=new THREE.Group();g.userData.cityMotion=true;group.add(g);
    sphere(g,0,.38,0,.87,.32,2.4,'#b86c45',1);block(g,0,0,1.35,.25,3.6,'#e5cda0',.51);block(g,0,.0,.95,.7,1.9,'#ad643d',.75);roof(g,0,0,1.55,.6,2.7,'#6f7154',1.43);
    const wake=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.8,.3,-2.2),new THREE.Vector3(-1.4,.3,-4),new THREE.Vector3(-2,.3,-6)]),new THREE.LineBasicMaterial({color:'#b5d8bf',transparent:true,opacity:.52}));g.add(wake);boats.push({g,phase:i/3+.06,speed:.009+i*.001});
  }
  const cars=[];
  for(let i=0;i<9;i++){
    const g=new THREE.Group();g.userData.cityMotion=true;group.add(g);const col=['#c07553','#eee6ce','#779790','#c8ac74'][i%4];block(g,0,0,.78,.47,1.55,col,.43);block(g,0,-.05,.67,.37,.85,'#91aba3',.83);cars.push({g,phase:i/9,speed:.014+i*.0005,lane:i%2?-.85:.85});
  }
  let authoredBuildings=0;group.traverse(o=>{authoredBuildings+=o.userData.buildingCount||0;});
  batchStaticArchitecture(group);
  // Inert interaction metadata is shared with the UI. These are art-directed viewpoints.
  group.traverse(o=>{if(o.isMesh){o.receiveShadow=true;if(o.material&&Array.isArray(o.material))o.material.forEach(m=>{if(m.emissive&&m.userData?.nightGlow)m.emissiveIntensity=.06;});}});
  return {group,landmarks:markerData,overview:{position:[220,265,357],target:[0,0,85]},bounds:{...CITY_BOUNDS},regions:[{id:'old',name:'老城街巷',description:'古寺、茶馆与锦江水岸',position:[122,120,110],target:[0,0,-22]},{id:'south',name:'高新南城',description:'金融城、环球中心与天府一街至五街',position:[140,172,246],target:[-10,2,137]},{id:'tianfu',name:'天府新区',description:'西博城、科学城与兴隆湖',position:[121,100,245+TIANFU_SOUTH_SHIFT],target:[20,0,157+TIANFU_SOUTH_SHIFT]}],minimap:{paths:[{points:riverPoints,width:4.3,color:'#72b3ad'},{points:northRiverPoints,width:3.3,color:'#72b3ad'},{points:[[-8,CITY_BOUNDS.minZ],[-8,CITY_BOUNDS.maxZ]],width:1.6,color:'#dfc799'},{points:lakePoints.map(([x,z])=>[x,z+TIANFU_SOUTH_SHIFT]),width:1.4,color:'#72b3ad',closed:true},...southStreetRoads.map(points=>({points,width:1.3,color:'#bba985'}))]},stats:{landmarks:markerData.length,buildings:buildingCount+authoredBuildings,trees:treeCount,bamboo:bambooStems.length,boats:boats.length,city:'成都'},update(t){
    boats.forEach(({g,phase,speed})=>{const u=(phase+t*speed)%1,p=flow.getPoint(u),d=flow.getTangent(u);g.position.set(p.x,.15,p.z);g.rotation.y=Math.atan2(d.x,d.z);});
    cars.forEach(({g,phase,speed,lane})=>{const u=(phase+t*speed)%1,z=lane>0?CITY_BOUNDS.minZ+4+u*(CITY_BOUNDS.maxZ-CITY_BOUNDS.minZ-8):CITY_BOUNDS.maxZ-4-u*(CITY_BOUNDS.maxZ-CITY_BOUNDS.minZ-8);g.position.set(-8+lane,0,z);g.visible=z<-37||z>5;g.rotation.y=lane>0?0:Math.PI;});
  }};
}

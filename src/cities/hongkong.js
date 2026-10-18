import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { block, cylinder, sphere, area, ribbon, line, roof, rng, mat } from '../scene-kit.js';

// 香港城市印象：北为 -z，东为 +x。西部岛屿显著压缩，非测绘或导航地图。
const BOUNDS = { minX: -240, maxX: 230, minZ: -160, maxZ: 170 };
const C = { sea:'#58a9a2', shallows:'#80b9aa', earth:'#d3c7aa', land:'#e9e3cd', road:'#bcb6a2', walk:'#f5e7c9', glass:'#527d7d', silver:'#a9bcb5', white:'#eee9d9', forest:'#70946d', gold:'#c8a05b', red:'#ad6049', roof:'#53695b' };
const KOWLOON = [[-100,-155],[219,-155],[219,-97],[199,-53],[163,-26],[112,-15],[88,-10],[64,-16],[45,-17],[27,-24],[11,-20],[-8,-24],[-21,-35],[-52,-30],[-65,-45],[-89,-55],[-98,-94]];
const ISLAND = [[-95,60],[-74,45],[-53,42],[-30,44],[-9,46],[20,43],[44,33],[72,37],[88,52],[126,48],[159,58],[194,88],[210,126],[185,158],[-56,158],[-94,125],[-115,87]];
const LANTAU = [[-229,55],[-221,10],[-199,-5],[-174,5],[-145,28],[-117,59],[-127,93],[-163,134],[-199,144],[-229,109]];
const AIRPORT = [[-232,-86],[-167,-96],[-143,-65],[-158,-26],[-232,-20]];
const TSINGYI = [[-119,-126],[-99,-120],[-90,-97],[-98,-75],[-118,-79],[-129,-98]];
const MAWAN = [[-185,-119],[-173,-123],[-163,-115],[-164,-102],[-180,-100],[-190,-108]];
const coastNorth=[[-89,-55],[-65,-45],[-52,-30],[-21,-35],[-8,-24],[11,-20],[27,-24],[45,-17],[64,-16],[88,-10],[112,-15],[163,-26],[199,-53]];
const coastSouth=[[-95,60],[-74,45],[-53,42],[-30,44],[-9,46],[20,43],[44,33],[72,37],[88,52],[126,48],[159,58],[194,88]];
const markers = [
  {id:'ifc',name:'国际金融中心',subtitle:'中环海岸 · 银色冠顶',description:'国际金融中心二期位于中环海滨，与西九龙的环球贸易广场隔港相望。沙盘以银灰色收分塔身、密集竖向窗带和冠顶提炼轮廓，楼高与海港距离为观赏而压缩。',position:[-20,85,58],target:[-20,46.6,58],camera:[106.2,155.4,211.7],zone:'island',category:'摩天天际线',related:['bank-of-china','star-ferry','icc']},
  {id:'bank-of-china',name:'中银大厦',subtitle:'三角钢骨 · 中环山脚',description:'中银大厦位于中环花园道，由贝聿铭设计。四组逐级升高的体块、三角形外框和双天线形成鲜明轮廓；这里保留这些识别特征，近景可看到交叉结构。',position:[24,78,73],target:[24,46.4,73],camera:[138.6,146.4,200.6],zone:'island',category:'现代建筑',related:['ifc','victoria-peak']},
  {id:'victoria-peak',name:'太平山顶',subtitle:'层叠山林 · 凌霄阁与缆车',description:'太平山顶位于港岛西部山地，是眺望维多利亚港的经典地点。山顶的凌霄阁以弧形托举的观景台表现，红色登山缆车沿坡道往返；山势、线路和周边道路均为微缩示意。',position:[-19,49,124],target:[-18,35,117],camera:[-105,96,194],zone:'island',category:'山海景观',related:['midlevels','bank-of-china']},
  {id:'hkcec',name:'香港会展中心',subtitle:'湾仔海旁 · 海鸥展翼',description:'香港会议展览中心在湾仔海旁伸向维多利亚港。白色曲面屋盖以展翼的海鸟意象展开，弧形玻璃立面和临海平台共同构成港岛岸线；屋面细部按沙盘尺度概括。',position:[81,20,48],target:[80,8,48],camera:[126,62,-9],zone:'island',category:'海滨建筑',related:['ifc','avenue-stars']},
  {id:'midlevels',name:'半山扶梯街区',subtitle:'中环上坡 · 连廊与窄街',description:'中环至半山自动扶梯系统串起坡道与街巷。微缩街区用有顶扶梯、梯级、色彩克制的唐楼和小型店铺表现沿坡生活；它与登上太平山的山顶缆车是不同的交通系统。',position:[-65,24,83],target:[-65,9,83],camera:[-113,57,127],zone:'island',category:'街区生活',related:['victoria-peak','ifc']},
  {id:'star-ferry',name:'天星码头 · 渡轮',subtitle:'尖沙咀岸 · 绿白小轮',description:'天星小轮连接九龙与香港岛。这个站点位于尖沙咀侧，沿海滨可步行到钟楼与星光大道；沙盘中的绿白渡轮在两岸码头间往返，航迹与班次为动画示意。',position:[1,8,-14],target:[0,3,-7],camera:[-39,38,35],zone:'harbour',category:'港口交通',related:['clock-tower','avenue-stars','ifc']},
  {id:'clock-tower',name:'尖沙咀钟楼',subtitle:'红砖花岗岩 · 铁路记忆',description:'尖沙咀钟楼是原九广铁路总站留下的建筑，位于天星码头附近。砖红色塔身、浅色石饰、钟面和圆顶在海滨广场上竖立；旁边的文化中心屋面也作了轮廓化表现。',position:[26,27,-29],target:[26,10,-28],camera:[67,46,14],zone:'harbour',category:'历史建筑',related:['star-ferry','avenue-stars']},
  {id:'avenue-stars',name:'星光大道',subtitle:'九龙海滨 · 电影与海风',description:'星光大道沿尖沙咀海滨展开，以电影文化、手印和海港景观为主题。沙盘以沿岸步道、栏杆、树荫和原创电影主题雕塑表达，不复刻具体明星雕像或作品。',position:[70,7,-20],target:[70,2,-19],camera:[105,36,23],zone:'harbour',category:'水岸漫步',related:['clock-tower','hkcec','star-ferry']},
  {id:'west-kowloon',name:'西九文化区 · M+',subtitle:'海滨草地 · 倒 T 字博物馆',description:'M+位于西九文化区，横向平台与纵向楼体组合为倒 T 字形。临港绿地、海滨步道和建筑的竖向立面在这里形成开阔的文化岸线，夜间幕墙呈现原创抽象灯光。',position:[-61,25,-43],target:[-61,9,-43],camera:[-104,56,14],zone:'harbour',category:'文化艺术',related:['icc','star-ferry']},
  {id:'icc',name:'环球贸易广场',subtitle:'西九龙 · 方形高塔',description:'环球贸易广场位于九龙站上方，是西九龙显著的高层地标。方正塔身、竖向浅色筋线与微收分塔冠在沙盘中构成香港最高的一根天际线，与对岸的国际金融中心呼应。',position:[-62,94,-78],target:[-62,51,-78],camera:[68.5,161.2,54],zone:'harbour',category:'摩天天际线',related:['west-kowloon','ifc']},
  {id:'wong-tai-sin',name:'黄大仙祠',subtitle:'朱柱金瓦 · 九龙香火',description:'黄大仙祠位于九龙黄大仙，以红色柱廊、金色屋顶与多重院落构成传统建筑群。这里表现山门、主殿、院庭与香炉，殿宇数量和尺度均作艺术化概括。',position:[81,15,-117],target:[81,4,-117],camera:[122,49,-72],zone:'kowloon',category:'庙宇古建',related:['chi-lin','mongkok']},
  {id:'mongkok',name:'旺角街区',subtitle:'密集街巷 · 街市与灯牌',description:'旺角的街市与密集街区是九龙日常生活的一部分。不同高度的唐楼、街边摊位、悬挑原创招牌和穿行巴士，构成有生活气息的小街；这里不对应某一家具体商户。',position:[8,23,-84],target:[8,8,-84],camera:[54,53,-37],zone:'kowloon',category:'街区生活',related:['wong-tai-sin','star-ferry']},
  {id:'chi-lin',name:'志莲净苑 · 南莲园池',subtitle:'唐式木构 · 金阁莲池',description:'钻石山的志莲净苑与南莲园池相邻，木构殿堂、莲池和园林呈现安静的唐式建筑意境。微缩模型用深色屋顶、规整院落、金阁和朱桥组合，和西侧黄大仙祠的金瓦红柱形成不同气质。',position:[145,15,-108],target:[145,4,-108],camera:[189,48,-61],zone:'kowloon',category:'园林古建',related:['wong-tai-sin']},
  {id:'tian-tan-buddha',name:'天坛大佛 · 宝莲禅寺',subtitle:'大屿山昂坪 · 莲台与山林',description:'天坛大佛与宝莲禅寺位于大屿山昂坪。青铜色坐佛、莲花台座、上山阶梯与寺院围合在山林之中；西部岛屿与主城之间的距离在本沙盘大幅压缩。',position:[-181,49,82],target:[-181,30,81],camera:[-123,79,143],zone:'islands',category:'山林古迹',related:['hk-airport','tsing-ma']},
  {id:'hk-airport',name:'香港国际机场',subtitle:'赤鱲角 · 航站与海上跑道',description:'香港国际机场位于大屿山北侧的赤鱲角。这里用海上平台、平行跑道、轻盈航站屋顶与停机坪飞机概括机场意象，跑道长度、间距和航站布局不用于真实飞行或导航。',position:[-199,13,-55],target:[-198,3,-55],camera:[-143,65,8],zone:'islands',category:'交通门户',related:['tsing-ma','tian-tan-buddha']},
  {id:'tsing-ma',name:'青马大桥',subtitle:'青衣至马湾 · 悬索跨海',description:'青马大桥连接青衣与马湾，是青屿干线的一部分。双塔、下垂主缆与垂直吊索跨过海面，和西侧机场、南侧大屿山共同构成西部岛岸意象；各岛距离与桥梁跨度经过压缩。',position:[-144,30,-110],target:[-144,11,-110],camera:[-105,61,-63],zone:'islands',category:'跨海桥梁',related:['hk-airport','tian-tan-buddha']}
];

const cube=new THREE.BoxGeometry(1,1,1), ball=new THREE.IcosahedronGeometry(1,1);
function glow(color='#e7d3a1',emissive='#ffd08a') {const m=mat(color,{emissive,emissiveIntensity:.06,roughness:.65});m.userData.nightGlow=true;return m;}
function batch(parent,geometry,material,items) {
  if(!items.length)return;
  const mesh=new THREE.InstancedMesh(geometry,material,items.length),o=new THREE.Object3D();
  items.forEach(([x,y,z,sx,sy,sz,ry=0,rx=0],i)=>{o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.set(rx,ry,0);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);});
  mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function beam(g,a,b,width,color) {const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),mesh=new THREE.Mesh(cube,color?.isMaterial?color:mat(color));mesh.position.copy(p).add(q).multiplyScalar(.5);mesh.scale.set(width,p.distanceTo(q),width);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),q.sub(p).normalize());mesh.castShadow=true;g.add(mesh);return mesh;}
function windows(g,w,h,d,night,base=.7,step=2.4) {
  const tiles=[];for(let y=base+1.2;y<base+h-.5;y+=step)for(let x=-w/2+.7;x<w/2-.4;x+=1.6){tiles.push([x,y,d/2+.04,.7,.55,.06]);tiles.push([x,y,-d/2-.04,.7,.55,.06]);}
  for(let y=base+1.2;y<base+h-.5;y+=step)for(let z=-d/2+.7;z<d/2-.4;z+=1.6){tiles.push([w/2+.04,y,z,.06,.55,.7]);tiles.push([-w/2-.04,y,z,.06,.55,.7]);}
  batch(g,cube,night,tiles);
}
function polygonTower(g,points,height,color,base=.7) {const s=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));const geo=new THREE.ExtrudeGeometry(s,{depth:height,bevelEnabled:false});geo.rotateX(-Math.PI/2);const mesh=new THREE.Mesh(geo,mat(color));mesh.position.y=base;mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);return mesh;}
function shell(g,w,d,y,height,color) {
  const p=[],idx=[];for(let i=0;i<=24;i++)for(let j=0;j<=12;j++){const u=i/24*2-1,v=j/12*2-1;p.push(u*w/2,y+height*(.24+.62*u*u)+Math.cos(v*Math.PI/2)*height*.25,v*d/2*(1-.22*Math.abs(u)));}
  for(let i=0;i<24;i++)for(let j=0;j<12;j++){const k=i*13+j;idx.push(k,k+13,k+1,k+13,k+14,k+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,mat(color,{side:THREE.DoubleSide}));mesh.castShadow=true;g.add(mesh);return mesh;
}
function terrain(g,x,z,rx,rz,h,color) {
  // A closed mound with a broad base, no sphere poking through the tabletop.
  const p=[x,h+.72,z],indices=[],segments=18,rings=4;
  for(let r=1;r<=rings;r++)for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2,rr=r/rings;p.push(x+Math.cos(a)*rx*rr,.72+h*Math.pow(1-rr,1.15),z+Math.sin(a)*rz*rr);}
  for(let i=0;i<segments;i++)indices.push(0,1+i,1+(i+1)%segments);
  for(let r=0;r<rings-1;r++)for(let i=0;i<segments;i++){const a=1+r*segments+i,b=1+r*segments+(i+1)%segments,c=a+segments,d=b+segments;indices.push(a,c,b,b,c,d);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(indices);geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat(color,{side:THREE.DoubleSide}));m.castShadow=true;m.receiveShadow=true;g.add(m);
}
function inside(x,z,poly) {let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
function temple(g,x,z,w,d,tile,wall=C.red,base=.8) {block(g,x,z,w+1.4,.5,d+1.4,C.white,base);block(g,x,z,w,4,d,wall,base+.5);roof(g,x,z,w+3,2.1,d+2.5,tile,base+4.4);roof(g,x,z,w+1.6,1.6,d+1.3,tile,base+6.1);for(const dx of [-w/2+.7,w/2-.7])block(g,x+dx,z+d/2+.4,.4,4.5,.4,C.red,base+.5);}
function ferry(parent,night) {const g=new THREE.Group();g.userData.cityMotion=true;g.name='天星小轮';parent.add(g);sphere(g,0,.9,0,2.2,.8,5.4,'#326b5b',2);block(g,0,0,4.1,.35,9,C.white,1.1);block(g,0,0,3.6,1.45,7.8,C.white,1.45);block(g,0,0,3.75,.25,8.1,'#376f5d',2.9);block(g,0,-.6,2.9,.9,4.5,C.white,3.15);block(g,0,-.6,3.2,.22,5,'#376f5d',4.05);block(g,0,.4,.5,1.1,.65,'#555f51',4.1);const win=[];for(let z=-3;z<=3;z+=1.05)for(const s of [-1,1])win.push([s*1.82,2.15,z,.05,.65,.7]);batch(g,cube,night,win);for(const s of [-1,1])line(g,[[s*2,.14,4],[s*3,.14,8],[s*4.2,.14,12]],'#b8e0c5',.6);return g;}

function mergeStatic(group) {
  group.updateMatrixWorld(true);const buckets=new Map();
  group.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||Array.isArray(o.material))return;let id='',moving=false;for(let p=o;p&&p!==group;p=p.parent){if(p.userData.cityMotion)moving=true;if(p.userData.landmarkId)id=p.userData.landmarkId;}if(moving)return;const key=`${id}:${o.material.uuid}:${o.castShadow}:${o.receiveShadow}`;if(!buckets.has(key))buckets.set(key,{id,items:[]});buckets.get(key).items.push(o);});
  for(const {id,items}of buckets.values()){
    if(items.length<4)continue;const copies=items.map(o=>{const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();for(const key of Object.keys(geo.attributes))if(!['position','normal'].includes(key))geo.deleteAttribute(key);if(!geo.attributes.normal)geo.computeVertexNormals();geo.applyMatrix4(o.matrixWorld);return geo;});
    const merged=mergeGeometries(copies,false);copies.forEach(g=>g.dispose());if(!merged)continue;const mesh=new THREE.Mesh(merged,items[0].material);mesh.castShadow=items[0].castShadow;mesh.receiveShadow=items[0].receiveShadow;mesh.userData.staticBatch=true;if(id)mesh.userData.landmarkId=id;group.add(mesh);items.forEach(o=>o.removeFromParent());
  }
}

export function createHongkong() {
  const group=new THREE.Group();group.name='香港 · 山海之间';
  const random=rng(20261018),night=glow(),mint=glow('#92c4b2','#a0eedb'),rose=glow('#c77860','#f1a67c');
  const treeTrunks=[],treeLeaves=[],cityBlocks=[[],[],[]],cityWindows=[],roadMarks=[],persons=[];
  let trees=0,buildings=0;
  const grow=(x,z,s=1,y=.72)=>{trees++;treeTrunks.push([x,y+s,z,.2*s,2*s,.2*s]);treeLeaves.push([x,y+2.7*s,z,1.25*s,1.7*s,1.2*s]);};
  const people=(x,z,y=.82)=>{persons.push([x,y+.55,z,.28,1.1,.28]);};
  const landmark=(id,x,z)=>{const g=new THREE.Group();g.name=markers.find(m=>m.id===id).name;g.userData.landmarkId=id;g.position.set(x,0,z);group.add(g);return g;};
  block(group,-5,5,470,4.4,330,C.earth,-4.8);
  block(group,-5,5,469.8,.45,329.8,C.sea,-.4);
  for(const poly of [KOWLOON,ISLAND,LANTAU,AIRPORT,TSINGYI,MAWAN]){area(group,poly,C.land,.72,.68);line(group,[...poly,poly[0]].map(([x,z])=>[x,.77,z]),'#d8d9b9');}
  // Visible tidelines sit outside distinct land masses, leaving an open harbour.
  ribbon(group,coastNorth,2.2,C.shallows,.08,144);ribbon(group,coastSouth,2.5,C.shallows,.08,144);
  for(let i=0;i<105;i++){const x=-230+random()*450,z=-147+random()*300;if([KOWLOON,ISLAND,LANTAU,AIRPORT,TSINGYI,MAWAN].some(p=>inside(x,z,p)))continue;roadMarks.push([x,.11,z,2+random()*5,.025,.15]);}
  batch(group,cube,mat('#83c2b3'),roadMarks);
  const northRoads=[[[4,-150],[4,-120],[2,-85],[4,-53],[3,-33]],[[44,-149],[44,-122],[43,-92],[41,-51],[41,-28]],[[-84,-92],[-49,-99],[0,-105],[43,-110],[87,-99],[155,-85],[196,-78]],[[-77,-59],[-40,-61],[5,-58],[46,-55],[96,-48],[165,-46]]];
  const islandRoad=[[-91,67],[-65,62],[-27,71],[16,83],[57,70],[101,69],[148,79],[183,102]];
  for(const p of northRoads)ribbon(group,p,4.3,C.road,.82,80);
  ribbon(group,islandRoad,5,C.road,.82,128);
  ribbon(group,coastNorth,2.8,C.walk,.83,150);ribbon(group,coastSouth,2.1,C.walk,.83,150);
  // Reserve landmark footprints before placing the characteristic dense backdrop.
  const reservations=[[-20,58,19,18],[24,73,18,16],[-65,83,26,24],[81,48,30,20],[-19,124,45,27],[1,-14,18,20],[26,-29,13,15],[70,-20,25,11],[-61,-43,31,18],[-62,-78,17,20],[81,-117,23,19],[8,-84,29,25],[145,-108,30,26]];
  const reserved=(x,z)=>reservations.some(([a,b,w,d])=>Math.abs(x-a)<w&&Math.abs(z-b)<d);
  for(let x=-88;x<199;x+=13)for(let z=-143;z<-30;z+=14){if(!inside(x,z,KOWLOON)||reserved(x,z)||Math.abs(x-4)<6||Math.abs(x-43)<6||Math.abs(z+57)<6||Math.abs(z+105)<6)continue;const w=6+random()*3,d=6+random()*3,h=9+random()*22,col=Math.floor(random()*3);cityBlocks[col].push([x,.72+h/2,z,w,h,d]);buildings++;for(let yy=2;yy<h;yy+=3.3)for(const sx of [-1,1])cityWindows.push([x+sx*w/2,yy+.72,z,.06,.65,d*.65]);if(random()>.35)grow(x+5,z+5,.65);}
  for(let x=-88;x<170;x+=16){const z=81+Math.sin(x*.02)*14;if(reserved(x,z))continue;const h=16+random()*27;cityBlocks[2].push([x,.72+h/2,z,8,h,9]);buildings++;for(let y=3;y<h;y+=3)cityWindows.push([x,y+.72,z-4.55,5,.5,.08]);}
  // Hong Kong Island rises behind the harbour, with the Peak separate from Central.
  terrain(group,-20,125,65,33,32,'#7c9a70');terrain(group,57,129,64,28,27,'#87a273');terrain(group,132,129,60,27,25,'#8da47b');
  terrain(group,-187,88,39,43,25,'#83a076');terrain(group,-146,64,25,35,20,'#91a97e');
  for(let i=0;i<130;i++){const x=-94+random()*277,z=108+random()*45;if(inside(x,z,ISLAND)&&Math.hypot((x+19)/40,(z-124)/20)>1)grow(x,z,.7+random()*.6,.76+Math.max(...[[-20,125,65,33,32],[57,129,64,28,27],[132,129,60,27,25]].map(([cx,cz,rx,rz,h])=>h*Math.pow(Math.max(0,1-Math.hypot((x-cx)/rx,(z-cz)/rz)),1.15))));}
  for(let i=0;i<60;i++){const x=-220+random()*84,z=20+random()*111;if(inside(x,z,LANTAU)&&Math.hypot(x+181,z-82)>25)grow(x,z,.85+random()*.45,.76+Math.max(...[[-187,88,39,43,25],[-146,64,25,35,20]].map(([cx,cz,rx,rz,h])=>h*Math.pow(Math.max(0,1-Math.hypot((x-cx)/rx,(z-cz)/rz)),1.15))));}

  // IFC: stacked octagonal setbacks, pale mullions, and a notched crown.
  const ifc=landmark('ifc',-20,58);block(ifc,0,0,29,3,20,C.silver,.75);block(ifc,0,0,15,4,14,C.glass,3.75);
  for(const [base,h,r]of [[7.75,45,7.3],[52.75,14,6.8],[66.75,9,6.2],[75.75,5,5.5]]){cylinder(ifc,0,0,r*.94,r,h,C.silver,base,8);cylinder(ifc,0,0,r*.935,r*.985,h-.7,C.glass,base+.3,8);}
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2,rr=6.75;beam(ifc,[Math.cos(a)*rr,8,Math.sin(a)*rr],[Math.cos(a)*rr*.84,77,Math.sin(a)*rr*.84],.28,C.silver);}
  for(const x of [-4,-1.4,1.4,4])block(ifc,x,0,.55,5.5,.7,C.silver,79);windows(ifc,10.8,67,10.8,night,8,2.6);buildings+=3;

  // Bank of China: four triangular shafts and the recognisable diagonal frame.
  const boc=landmark('bank-of-china',24,73);block(boc,0,0,23,3,19,C.white,.75);
  const quadrants=[{p:[[-7,-7],[0,0],[-7,7]],h:42},{p:[[-7,7],[0,0],[7,7]],h:54},{p:[[7,7],[0,0],[7,-7]],h:65},{p:[[7,-7],[0,0],[-7,-7]],h:70}];
  quadrants.forEach(({p,h},i)=>polygonTower(boc,p,h,i%2?'#779b99':'#587f83',3.75));
  for(const x of [-7,7])for(const z of [-7,7])beam(boc,[x,4,z],[x,53+(z<0?19:0),z],.48,C.white);
  for(const s of [-1,1])for(let y=4;y<58;y+=18){beam(boc,[-7,y,s*7],[7,y+18,s*7],.4,C.white);beam(boc,[7,y,s*7],[-7,y+18,s*7],.4,C.white);beam(boc,[s*7,y,-7],[s*7,y+18,7],.4,C.white);}
  for(const x of [-3,3])cylinder(boc,x,-3,.16,.22,12,C.white,72,6);buildings++;

  const peak=landmark('victoria-peak',-19,124);cylinder(peak,0,0,13,16,2,C.walk,31,24);block(peak,0,0,8,6,9,C.glass,33);shell(peak,27,15,38,7,C.white);block(peak,0,0,23,.5,12,'#5d817c',44);for(const x of [-10,10])block(peak,x,0,.25,1.2,11,C.white,44.5);line(peak,[[-11,45,-5],[11,45,-5],[11,45,5],[-11,45,5],[-11,45,-5]],C.white);buildings++;
  const cablePath=new THREE.LineCurve3(new THREE.Vector3(21,2,91),new THREE.Vector3(-13,33,118));
  for(const side of [-.75,.75])line(group,[[21+side,1.1,91],[-13+side,33,118]],'#74786a');
  const tram=new THREE.Group();tram.name='山顶缆车';tram.userData.cityMotion=true;group.add(tram);block(tram,0,0,2.7,2.3,6.6,'#bb6550',.4);block(tram,0,0,2.8,.3,6.8,C.white,2.7);const tw=[];for(let z=-2.3;z<2.9;z+=1.15)for(const s of [-1,1])tw.push([s*1.37,1.9,z,.06,.9,.8]);batch(tram,cube,night,tw);

  const cec=landmark('hkcec',81,48);area(cec,[[-26,14],[-25,-5],[-17,-14],[7,-16],[23,-8],[27,12]],C.white,1.1,.5);block(cec,0,0,39,9,19,C.glass,1.15);shell(cec,52,31,9,11,C.white);for(const x of [-17,-9,0,9,17])beam(cec,[x,1.2,-9],[x,13,-10],.35,'#d8d9ca');for(const z of [-5,2,8])block(cec,0,z,38,.22,.15,'#c6d9cc',4+z*.05);buildings++;

  const mid=landmark('midlevels',-65,83);for(let i=0;i<6;i++){const z=-14+i*5,y=1+i*1.7;block(mid,0,z,5,y,5.3,C.walk,.75);for(const side of [-1,1]){const h=9+(i%3)*3;block(mid,side*9,z,6,h,4.4,['#c8b89b','#b47d64','#95a399'][i%3],y+.7);block(mid,side*9,z,6.4,.3,4.8,C.white,y+h+.7);buildings++;for(let yy=3;yy<h;yy+=3)block(mid,side*9,z-2.23,4,.7,.08,night,y+yy);}}
  beam(mid,[0,2,-15],[0,13,16],3.0,'#728d86');beam(mid,[-1.8,3,-15],[-1.8,14,16],.15,C.white);beam(mid,[1.8,3,-15],[1.8,14,16],.15,C.white);beam(mid,[0,5.2,-15],[0,16.2,16],4.1,C.white);for(let i=0;i<9;i++){const z=-14+i*3.5,y=2+i*1.23;block(mid,0,z,2.6,.16,.6,'#b4b8aa',y);block(mid,-1.8,z,.12,3.3,.12,'#94a498',y);}

  const sf=landmark('star-ferry',1,-14);block(sf,0,0,11,1,19,'#c3bea9',.18);block(sf,0,-1,8,3,11,C.white,1.18);roof(sf,0,-1,10,1.5,14,'#5b8b71',4.1);for(const x of [-3.7,3.7])for(let z=-5;z<=4;z+=3)block(sf,x,z,.25,3,.25,'#426b5b',1.2);block(sf,0,-7.5,6,.7,1.8,'#4e7b64',2.3);buildings++;
  const centralPier=new THREE.Group();centralPier.position.set(-18,0,38);group.add(centralPier);block(centralPier,0,0,9,1,14,'#c3bea9',.18);block(centralPier,0,1,7,3,9,C.white,1.18);roof(centralPier,0,1,9,1.6,11,'#5b8b71',4.1);buildings++;
  const clk=landmark('clock-tower',26,-29);block(clk,0,0,16,.35,14,C.walk,.8);block(clk,0,0,5.2,19,5.2,C.red,1.15);for(const y of [1.2,8,16.5,20.2])block(clk,0,0,5.7,.5,5.7,C.white,y);block(clk,0,0,4.8,3,4.8,C.white,20.7);cylinder(clk,0,0,2.3,2.7,2.6,'#738679',23.7,12);sphere(clk,0,26.5,0,.6,.7,.6,C.gold);for(const side of [-1,1]){const face=new THREE.Mesh(new THREE.CircleGeometry(1.2,24),mat('#f4e9cd'));face.position.set(0,19,side*2.66);face.rotation.y=side<0?Math.PI:0;clk.add(face);line(clk,[[0,19,side*2.69],[0,19.8,side*2.69]],'#4f655d');line(clk,[[0,19,side*2.7],[.6,18.7,side*2.7]],'#4f655d');}buildings++;
  // Cultural Centre outline forms a low backdrop, without competing with the clock.
  shell(clk,24,12,4,5,'#d6b89d').position.set(17,0,-7);block(clk,17,-7,20,4,10,C.white,.8);buildings++;

  const ave=landmark('avenue-stars',70,-20);block(ave,0,0,39,.4,8,C.walk,.75);beam(ave,[-19,2,4],[19,2,4],.14,'#798c7a');for(let x=-18;x<=18;x+=4)block(ave,x,4,.15,1.2,.15,'#798c7a',.9);for(const x of [-14,-5,10,17]){block(ave,x,-1,3,.4,1,C.earth,1);grow(70+x,-23,.8);}
  cylinder(ave,0,0,2.2,2.6,.6,'#a89373',1,10);sphere(ave,0,5.2,0,1.5,1.5,.45,C.gold,1);cylinder(ave,0,0,.5,.8,2.3,C.gold,1.6,8);beam(ave,[-2,5,0],[2,5,0],.4,C.gold);for(let i=0;i<18;i++)people(51+random()*37,-21+random()*3);buildings++;

  const wk=landmark('west-kowloon',-61,-43);block(wk,0,0,48,.4,27,'#a5bc8e',.75);block(wk,0,0,37,5.5,20,'#768e7c',1.1);block(wk,0,-2,36,17,5.8,'#577871',6.6);block(wk,0,0,37,.25,20,'#92ad8b',6.6);const mfac=[];for(let x=-17;x<=17;x+=1.1){mfac.push([x,15,1.0,.24,14,.06]);}batch(wk,cube,mint,mfac);for(const x of [-18,-10,10,18])grow(-61+x,-32,.8);buildings++;
  const icc=landmark('icc',-62,-78);block(icc,0,0,27,3,21,C.silver,.75);block(icc,0,0,14,78,13.5,C.glass,3.75);block(icc,0,0,13,7,12.5,C.silver,81.75);block(icc,0,0,11.8,3,11.4,'#9db6ad',88.75);for(const x of [-6.7,-4.4,-2.2,0,2.2,4.4,6.7])for(const z of [-6.8,6.8])block(icc,x,z,.23,78,.25,C.silver,3.8);for(const x of [-7,7])for(const z of [-4,-1.3,1.3,4])block(icc,x,z,.25,78,.24,C.silver,3.8);windows(icc,14,78,13.5,night,3.75,2.6);buildings++;

  const wong=landmark('wong-tai-sin',81,-117);block(wong,0,0,40,.5,31,C.walk,.75);temple(wong,0,-7,20,10,C.gold);temple(wong,-14,4,7,15,C.gold);temple(wong,14,4,7,15,C.gold);temple(wong,0,12,13,4,C.gold);cylinder(wong,0,2,2.2,1.9,2.4,'#867557',1.3,12);for(const x of [-9,9]){block(wong,x,12,.65,5,.65,C.red,1.3);sphere(wong,x,5,13,.75,1,.7,rose);}for(let i=0;i<15;i++)people(73+random()*16,-116+random()*8);buildings+=4;

  const mk=landmark('mongkok',8,-84);block(mk,0,0,47,.3,38,'#c5bca8',.75);block(mk,0,0,4,.1,38,'#8e9689',1.05);for(let i=0;i<5;i++)for(const side of [-1,1]){const x=side*(8+(i%2)*1.5),z=-14+i*7,h=11+(i%3)*5;block(mk,x,z,8,h,6,['#d3bea2','#c3937b','#a3b1a0'][i%3],1.1);block(mk,x,z,8.4,.4,6.4,C.white,h+1.1);for(let y=3;y<h;y+=3){block(mk,x,z+3.04,6,.8,.08,night,y+1.1);block(mk,x-side*4.05,z,.08,.8,4,night,y+1.1);}block(mk,x-side*4.5,z+1.5,1.1,4.5,.5,i%2?rose:mint,5);block(mk,x-side*4.8,z,1.8,.3,4.8,i%2?'#b86149':'#5f8c75',2.8);buildings++;}for(let i=0;i<8;i++){const z=-15+i*4;block(mk,-17,z,3,1.6,2.5,C.earth,1.1);roof(mk,-17,z,3.6,.8,3,i%2?'#9cba8e':'#b96f52',2.7);}for(let i=0;i<32;i++)people(6+(random()-.5)*5,-101+random()*34,1.2);

  const chi=landmark('chi-lin',145,-108);block(chi,0,0,52,.4,39,'#a5ba91',.75);block(chi,-5,-5,35,.25,24,C.walk,1.15);temple(chi,-6,-12,25,9,C.roof,C.white,1.4);temple(chi,-20,-2,5,15,C.roof,C.white,1.4);temple(chi,9,-2,5,15,C.roof,C.white,1.4);for(const x of [-12,-2])block(chi,x,0,7,.12,6,'#70aaa0',1.5);area(chi,[[9,6],[22,3],[25,12],[17,17],[7,14]],'#5f9f91',1.25);cylinder(chi,17,10,3.1,3.8,.7,C.walk,1.3,8);cylinder(chi,17,10,2.1,2.1,3.5,C.gold,2,8);roof(chi,17,10,7,2.3,7,C.gold,5.5);beam(chi,[4,2,10],[14,2,10],1.2,C.red);for(const x of [-22,23])grow(145+x,-96,.9);buildings+=4;

  const bud=landmark('tian-tan-buddha',-181,82);cylinder(bud,0,0,11,13,4,'#b0a88a',24,24);cylinder(bud,0,0,7.5,9,2.5,C.gold,28,20);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const p=sphere(bud,Math.cos(a)*7.4,31,Math.sin(a)*7.4,1.8,1.2,1.1,'#9a8858',1);p.rotation.y=-a;}
  const bronze='#817655';sphere(bud,0,36.5,0,5,6,3.2,bronze,2);sphere(bud,0,44,0,2.9,3.2,2.6,bronze,2);sphere(bud,0,46.8,0,2,1.3,1.9,'#69745a',2);sphere(bud,-4,32.8,-.7,4.1,2.1,2.8,bronze,2);sphere(bud,4,32.8,-.7,4.1,2.1,2.8,bronze,2);beam(bud,[-4,38,-.8],[-6,40,-2.6],2.1,bronze);sphere(bud,-6,41.7,-2.6,1,2,.7,bronze,2);beam(bud,[4,38,-.8],[3,34,-3],2,bronze);sphere(bud,2,34,-3.1,2,.8,1,bronze,2);for(const x of [-3,3])sphere(bud,x,43.7,-.1,.55,1.55,.6,bronze,1);
  for(let i=0;i<12;i++)block(bud,0,-13-i*1.7,5.3,.45,1.9,C.walk,23-i*1.6);temple(bud,18,-24,17,9,C.gold,C.white,1.1);temple(bud,18,-35,12,6,C.roof,C.white,1.1);buildings+=3;

  const airport=landmark('hk-airport',-199,-55);for(const z of [-21,21]){block(airport,0,z,60,.16,4.2,'#8a958e',.82);const marks=[];for(let x=-27;x<30;x+=5)marks.push([x,1.01,z,2.4,.03,.18]);batch(airport,cube,mat(C.white),marks);}block(airport,5,0,20,3.5,13,'#86a79c',.9);shell(airport,23,17,4,2.4,C.white);for(const x of [-13,0,13]){block(airport,x,4,2.4,1.4,13,C.white,1.2);for(const s of [-1,1])block(airport,x+s*3,7,5,1,1.5,C.white,1.2);}cylinder(airport,-24,1,1.4,1.9,8,C.silver,.9,8);cylinder(airport,-24,1,3,2,2,C.glass,8.9,8);buildings+=2;
  const plane=(x,z,a)=>{const p=new THREE.Group();p.position.set(x,1.3,z);p.rotation.y=a;airport.add(p);sphere(p,0,1,0,.65,.65,5.1,C.white,2);area(p,[[-6,1],[0,-1.5],[6,1],[6,2],[0,1],[-6,2]],C.white,1.1,.13);area(p,[[-2.8,4],[0,2.9],[2.8,4],[2.8,4.7],[0,4],[-2.8,4.7]],C.white,1.3,.12);block(p,0,3.9,.22,1.6,1.5,'#5a8b76',1.3);};plane(-12,13,0);plane(1,13,0);plane(14,-12,Math.PI);

  const bridge=landmark('tsing-ma',-144,-110);block(bridge,0,0,68,1.4,6.7,'#9aa49b',9);for(const x of [-19,19]){for(const z of [-4.2,4.2])block(bridge,x,z,2.2,27,2.3,C.silver,.15);block(bridge,x,0,2.4,1.8,10.5,C.silver,23);block(bridge,x,0,2.4,1.8,10.5,C.silver,13);}for(const z of [-4,4]){const points=[];for(let i=0;i<=48;i++){const x=-34+i*68/48,y=Math.abs(x)<=19?14+11*(x/19)**2:25-(Math.abs(x)-19)*.9;points.push([x,y,z]);if(i%2===0)beam(bridge,[x,10.4,z],[x,y,z],.12,C.white);}line(bridge,points,C.white);line(bridge,[[-34,11,z],[34,11,z]],C.white);}const bm=[];for(let x=-32;x<33;x+=4)bm.push([x,10.44,0,1.6,.03,.16]);batch(bridge,cube,mat(C.white),bm);buildings++;
  ribbon(group,[[-196,-23],[-171,-12],[-149,14],[-136,44]],2.6,C.road,.82,64);

  // Native greenery, window tiles and background blocks share instanced batches.
  ['#c5bba5','#b7b49e','#8fa59a'].forEach((color,i)=>batch(group,cube,mat(color),cityBlocks[i]));
  batch(group,cube,night,cityWindows);batch(group,cube,mat('#837d60'),treeTrunks);batch(group,ball,mat(C.forest),treeLeaves);batch(group,new THREE.CylinderGeometry(.22,.28,1,6),mat('#b88765'),persons);
  const ferries=[ferry(group,night),ferry(group,night),ferry(group,night)];
  const ferryRoutes=[new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,-2),new THREE.Vector3(-2,0,13),new THREE.Vector3(-13,0,27),new THREE.Vector3(-18,0,32)]),new THREE.CatmullRomCurve3([new THREE.Vector3(8,0,-3),new THREE.Vector3(29,0,9),new THREE.Vector3(52,0,21),new THREE.Vector3(71,0,28)])];
  const streetcar=new THREE.Group();streetcar.userData.cityMotion=true;streetcar.name='港岛双层电车';group.add(streetcar);block(streetcar,0,0,2.2,3.8,5.4,'#789f89',1);block(streetcar,0,0,2.4,.25,5.7,C.white,4.8);block(streetcar,0,0,2.27,.65,4.7,night,3.7);block(streetcar,0,0,2.27,.65,4.7,night,1.8);beam(streetcar,[0,5,0],[0,6,-1.3],.1,'#5a6658');
  const trafficPath=new THREE.CatmullRomCurve3(islandRoad.map(([x,z])=>new THREE.Vector3(x,0,z)));
  mergeStatic(group);
  const regions=[
    {id:'island',name:'港岛山海',description:'中环高楼、湾仔海旁与太平山顶',position:[157,160,230],target:[13,14,88],labelPosition:[13,9,155]},
    {id:'harbour',name:'九龙海滨',description:'天星小轮、尖沙咀与西九文化区',position:[92,145,124],target:[-13,14,-43],labelPosition:[-28,5,-22]},
    {id:'kowloon',name:'九龙街巷',description:'旺角市集、黄大仙与唐式园林',position:[188,129,27],target:[73,6,-111],labelPosition:[110,5,-150]},
    {id:'islands',name:'离岛青马',description:'昂坪大佛、赤鱲角机场与跨海大桥',position:[-74,163,174],target:[-180,7,4],labelPosition:[-223,5,14]}
  ];
  const city={group,landmarks:markers,regions,scopeNote:'港岛、九龙与西部岛屿保留大体方位，距离、海岸与楼高为观赏而压缩；四个分区是浏览片区，不代表行政边界。',overview:{position:[323,345,398],target:[-10,8,4]},bounds:{...BOUNDS},minimap:{paths:[...[KOWLOON,ISLAND,LANTAU,AIRPORT,TSINGYI,MAWAN].map(points=>({points,closed:true,color:'#ccd4b3'})),{points:coastNorth,width:2,color:'#f3dfb2'},{points:coastSouth,width:2,color:'#f3dfb2'},{points:[[-178,-110],[-110,-110]],width:2,color:'#91a294'},...northRoads.map(points=>({points,width:1.3,color:'#b4b4a0'}))]},stats:{city:'香港',landmarks:markers.length,buildings,trees,boats:ferries.length},update(t){
    ferries.forEach((g,i)=>{const v=(t*.017+i*.32)%2,back=v>1,u=back?2-v:v,path=ferryRoutes[i%2],p=path.getPoint(u),d=path.getTangent(u);g.position.copy(p);g.rotation.y=Math.atan2(d.x,d.z)+(back?Math.PI:0);});
    const v=(t*.025)%2,u=v>1?2-v:v;tram.position.copy(cablePath.getPoint(u));tram.rotation.y=Math.atan2(-34,27);tram.rotation.x=-.53;
    const cu=(t*.022+.37)%1,p=trafficPath.getPoint(cu),d=trafficPath.getTangent(cu);streetcar.position.copy(p);streetcar.rotation.y=Math.atan2(d.x,d.z);
  }};
  city.update(0);return city;
}

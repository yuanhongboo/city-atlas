import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { block, cylinder, sphere, area, ribbon, roof, rng, mat } from '../scene-kit.js';

// 城市印象模型：北在 -z，东在 +x。东部距离与海岸形状经压缩，非导航地图。
const BOUNDS = { minX: -230, maxX: 230, minZ: -140, maxZ: 150 };
const C = { ground:'#e8e3cf', earth:'#d2cbb3', stone:'#f4ecd9', water:'#4daca7', deep:'#399995', road:'#bebdad', curb:'#f2edda', grass:'#aac69a', leaf:'#6d9775', glass:'#588180', dark:'#416967', red:'#ba7352', gold:'#d8b66c', roof:'#7c8371' };
const LAND = [[-230,-140],[230,-140],[230,91],[225,124],[215,143],[203,144],[192,123],[182,93],[160,75],[133,67],[98,64],[58,62],[24,71],[-17,78],[-52,96],[-87,121],[-121,117],[-148,94],[-167,64],[-177,47],[-195,40],[-211,17],[-203,-10],[-212,-33],[-230,-48]];
const COAST = LAND.slice(2);
const ROADS = [
  [[-206,-12],[-164,-12],[-122,-13],[-72,-11],[-30,-9],[8,-8],[39,-7],[67,2],[80,13],[126,22],[144,31]],
  [[-183,-105],[-183,-79]], [[-164,-101],[-164,24]], [[-151,42],[-133,43],[-105,45],[-79,47],[-46,49],[0,47],[43,42],[76,37],[129,39]],
  [[-142,-115],[-142,-64]], [[-107,-104],[-107,-57]], [[-50,-118],[-50,35]], [[-38,-116],[-38,34]],
  [[18,-116],[18,32]], [[61,-91],[61,-42]], [[64,8],[64,29]], [[84,-85],[84,-48]], [[116,-85],[116,-37]],
  [[-199,-113],[-159,-111],[-119,-103],[-73,-98],[-48,-90]],
  [[-197,-84],[-165,-76],[-133,-72],[-91,-70],[-45,-66]],
  [[19,-65],[50,-66],[84,-67],[116,-64],[139,-58],[153,-29],[158,10],[163,37],[173,49]],
  [[143,-57],[168,-77],[180,-101],[207,-113]],
  [[188,50],[197,66],[206,83]], [[205,87],[199,91]],
  [[-193,-36],[-171,-40]], [[-166,4],[-158,8],[-151,19]],
];
const SPECS = [
  {id:'pingan', name:'平安金融中心', shortName:'平安金融中心', x:-12,z:18,h:58,zone:'futian',category:'城市天际线',subtitle:'福田云端 · 银色尖塔',description:'福田中心区的平安金融中心，以收分塔身、竖向骨架与尖削冠顶形成深圳天际线。模型概括可辨识的体量，不复刻实际楼层与幕墙数量。',r:17},
  {id:'civic-center', name:'市民中心',x:-12,z:-42,h:13,zone:'futian',category:'公共建筑',subtitle:'大鹏展翼 · 城市中轴',description:'市民中心北靠莲花山、南向福田中心商务区。宽阔的展翼屋顶和红、黄色体块，连接城市广场与文化空间。',r:27},
  {id:'lianhuashan',name:'莲花山',x:-12,z:-98,h:20,zone:'futian',category:'城市公园',subtitle:'山顶广场 · 中轴远眺',description:'莲花山公园位于深圳中心区北端。沙盘保留绿色山丘、登山步道、山顶广场与雕塑轮廓，可沿中轴南望市民中心和平安金融中心。',r:23},
  {id:'huaqiangbei',name:'华强北',x:45,z:-29,h:23,zone:'futian',category:'都市街巷',subtitle:'电子街区 · 密集橱窗',description:'福田华强北的步行街与电子商圈，是深圳创新和市井生活的鲜明场景。模型以沿街商场、竖向玻璃塔楼、货运小车和连续橱窗概括街区。',r:21},
  {id:'diwang',name:'地王大厦',x:107,z:1,h:41,zone:'luohu',category:'城市天际线',subtitle:'绿色双尖 · 罗湖记忆',description:'地王大厦即信兴广场，位于罗湖。模型保留绿色塔身、顶部双尖与低层裙房，和附近京基100组成深圳不同年代的城市天际线。',r:13},
  {id:'kk100',name:'京基100',x:83,z:-28,h:49,zone:'luohu',category:'城市天际线',subtitle:'弧形冠顶 · 蔡屋围',description:'京基100位于罗湖蔡屋围、深南东路一带。沙盘以修长玻璃体、弧形收束的冠顶及商业裙房，表现这座现代服务业总部园区的轮廓。',r:14},
  {id:'dongmen',name:'东门老街',x:136,z:-7,h:9,zone:'luohu',category:'历史街巷',subtitle:'骑楼门廊 · 老城人流',description:'东门老街位于罗湖老城。微缩步行街保留街坊、骑楼、檐口与连续店铺，具体门店和建筑数量按城市印象组织。',r:20},
  {id:'talent-park',name:'人才公园',x:-119,z:76,h:7,zone:'nanshan',category:'滨水公园',subtitle:'后海曲岸 · 湖畔绿地',description:'人才公园位于南山区后海，以内湖、草坪和人才主题景观连接都市与深圳湾。模型用曲岸内湖、步桥与草坡表现公园，并保留北侧春笋的相对方位。',r:24},
  {id:'spring-bamboo',name:'春笋 · 中国华润大厦',shortName:'春笋',x:-116,z:23,h:43,zone:'nanshan',category:'城市天际线',subtitle:'后海尖锥 · 交织骨架',description:'中国华润大厦因春笋般的轮廓而得名“春笋”，位于南山后海。模型保留圆形塔身、逐渐收尖的冠顶和交织立面骨架，南望人才公园。',r:16},
  {id:'shenzhen-university',name:'深圳大学 · 粤海校区',shortName:'深圳大学',x:-139,z:-39,h:12,zone:'nanshan',category:'城市校园',subtitle:'荔园树影 · 粤海校园',description:'深圳大学粤海校区位于南山区南海大道。这里以校门、教学楼、图书馆意象、运动场与荔园树影表现校园，院楼位置经过压缩，不作为校园路线图。',r:25},
  {id:'window-world',name:'世界之窗',x:-78,z:-39,h:23,zone:'nanshan',category:'主题公园',subtitle:'微缩世界 · 地标花园',description:'世界之窗位于南山区华侨城、深南大道。沙盘用埃菲尔铁塔意象、金字塔和柱廊概括其微缩世界景观，公园内部布局为艺术化组织。',r:24},
  {id:'happy-harbour',name:'欢乐港湾',x:-190,z:-60,h:32,zone:'west-bay',category:'滨海生活',subtitle:'湾区之光 · 转动的摩天轮',description:'欢乐港湾连接宝安中心区与前海湾滨海步道。“湾区之光”摩天轮沿海岸转动，周围是草坪、商业街区和滨海公共空间。',r:23},
  {id:'qianhai',name:'前海石',x:-184,z:18,h:6,zone:'west-bay',category:'滨海公园',subtitle:'前海湾畔 · 城市起点',description:'前海石公园与欢乐港湾以环湾慢行道相连。模型将前海石、临海草坪、广场和远处办公组团缩在同一片岸线上，不表示前海合作区的行政或管理边界。',r:18},
  {id:'dameisha',name:'大梅沙',x:170,z:82,h:8,zone:'east-coast',category:'山海风景',subtitle:'盐田海湾 · 沙滩与山林',description:'大梅沙海滨公园位于盐田区梅沙街道。浅沙滩、海滨栈道、遮阳伞与北侧山林共同呈现东部海湾；城区到海湾的距离已明显压缩。',r:20},
  {id:'dapeng',name:'大鹏所城',x:208,z:108,h:11,zone:'east-coast',category:'历史古城',subtitle:'城门石墙 · 岭南院落',description:'大鹏所城位于大鹏新区大鹏街道鹏城社区。模型保留城门、城墙、巷道和院落的基本关系，以小尺度石城表现深圳东部的海防历史。',r:17},
  {id:'universiade',name:'大运中心',x:134,z:-102,h:17,zone:'east-coast',category:'体育建筑',subtitle:'龙岗内陆 · 晶体场馆',description:'深圳大运中心位于龙岗，处在深圳东北部内陆。模型用晶体外壳的体育场、体育馆、游泳馆与足球场表现建筑群；与盐田、大鹏同属东部浏览路线，不意味着同一行政区或海岸位置。',r:29},
];
const REGIONS = [
  {id:'futian',name:'福田中轴',description:'莲花山、市民中心、平安金融中心与华强北，串起城市中轴和电子街区。',position:[106,145,126],target:[2,7,-35],labelPosition:[-18,67,-56]},
  {id:'luohu',name:'罗湖街巷',description:'从京基100、地王大厦走向东门老街，看新旧天际线与街巷生活。',position:[205,112,101],target:[110,10,-12],labelPosition:[108,60,-18]},
  {id:'nanshan',name:'南山后海',description:'粤海校园、世界之窗与春笋，向南连接人才公园和深圳湾。',position:[-9,157,155],target:[-111,8,15],labelPosition:[-118,58,7]},
  {id:'west-bay',name:'宝安前海',description:'以欢乐港湾、前海石与滨海步道组成西湾浏览路线，非行政边界。',position:[-74,128,105],target:[-185,4,-24],labelPosition:[-190,43,-11]},
  {id:'east-coast',name:'东部山海',description:'从东北内陆的大运中心，经过盐田大梅沙，到大鹏所城。远距离以山林过渡压缩。',position:[324,226,226],target:[174,7,9],labelPosition:[182,51,-17]},
];
function mesh(parent,geo,material,x=0,y=0,z=0) {const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function glowing(color='#c6d6c2',emissive='#ffd39b') {const m=mat(color,{emissive,emissiveIntensity:.07,roughness:.65});m.userData.nightGlow=true;return m;}
function inside(x,z,poly) {let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++)if((poly[i][1]>z)!==(poly[j][1]>z)&&x<(poly[j][0]-poly[i][0])*(z-poly[i][1])/(poly[j][1]-poly[i][1])+poly[i][0])c=!c;return c;}
function distSegment(x,z,a,b) {const dx=b[0]-a[0],dz=b[1]-a[1],d=dx*dx+dz*dz;const t=d?THREE.MathUtils.clamp(((x-a[0])*dx+(z-a[1])*dz)/d,0,1):0;return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);}
function nearRoad(x,z,d=5) {return ROADS.some(ps=>ps.slice(1).some((p,i)=>distSegment(x,z,ps[i],p)<d));}
function batch(parent,geo,material,items) {if(!items.length)return;const m=new THREE.InstancedMesh(geo,material,items.length),o=new THREE.Object3D();items.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.scale.set(p[3],p[4],p[5]);o.rotation.set(0,p[6]||0,0);o.updateMatrix();m.setMatrixAt(i,o.matrix);});m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function beam(parent,a,b,r,color) {const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av),m=mesh(parent,new THREE.CylinderGeometry(r,r,v.length(),6),color?.isMaterial?color:mat(color));m.position.copy(av).add(bv).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;}
function disk(parent,x,z,rx,rz,color,y=.26) {const g=new THREE.CircleGeometry(1,40);g.rotateX(-Math.PI/2);const m=mesh(parent,g,mat(color,{side:THREE.DoubleSide}),x,y,z);m.scale.set(rx,1,rz);return m;}
function mound(parent,x,z,rx,h,rz,color=C.grass) {const geo=new THREE.SphereGeometry(1,24,10,0,Math.PI*2,0,Math.PI/2);const m=mesh(parent,geo,mat(color),x,.2,z);m.scale.set(rx,h,rz);return m;}
function lawn(parent,w,d) {block(parent,0,0,w,.16,d,C.grass,.2);}
function facade(parent,x,z,w,d,h,lights) {for(let y=1.8;y<h-.6;y+=2)for(const s of [-1,1]){block(parent,x,z+s*(d/2+.035),w*.88,.13,.045,lights,y);block(parent,x+s*(w/2+.035),z,.045,.13,d*.88,lights,y);}}
function localTree(parent,x,z,s=1,y=.22) {cylinder(parent,x,z,.1*s,.18*s,1.6*s,'#8c8168',y,5);sphere(parent,x,y+2.4*s,z,1.05*s,1.45*s,1.05*s,C.leaf);}
function smallHouse(parent,x,z,w,d,h=3.2) {block(parent,x,z,w,h,d,C.stone,.3);roof(parent,x,z,w+.8,1.5,d+.75,C.roof,h+.3);for(let xx=x-w/2+1;xx<x+w/2;xx+=1.7)block(parent,xx,z+d/2+.04,.7,1,.06,C.dark,1.1);}
function towerTaper(parent,rt,rb,h,color,y=0,sides=4) {const m=cylinder(parent,0,0,rt,rb,h,color,y,sides);m.rotation.y=sides===4?Math.PI/4:0;return m;}
function buildLandmark(parent,s,lights,updates) {
  const g=new THREE.Group();g.name=s.name;g.position.set(s.x,.2,s.z);g.userData.landmarkId=s.id;parent.add(g);
  const pale=mat(C.stone),glass=mat(C.glass,{metalness:.22,roughness:.48});
  if(s.id==='pingan') {
    block(g,0,0,22,2,18,C.stone);towerTaper(g,5.3,7.6,43,glass,2,8);towerTaper(g,.65,5.3,11,pale,45,8);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;beam(g,[Math.cos(a)*7.3,2,Math.sin(a)*7.3],[Math.cos(a)*5.1,45,Math.sin(a)*5.1],.19,C.stone);beam(g,[Math.cos(a)*5.1,45,Math.sin(a)*5.1],[Math.cos(a)*.6,56,Math.sin(a)*.6],.15,C.stone);}
    for(let y=5;y<45;y+=2.1){const r=7.6-(y-2)/43*2.3;const ring=mesh(g,new THREE.TorusGeometry(r,.07,3,8),lights,0,y,0);ring.rotation.x=Math.PI/2;}
    block(g,0,10,23,.2,2,C.gold,.12);
  } else if(s.id==='civic-center') {
    block(g,0,6,53,.3,30,C.stone,.03);block(g,-17,0,15,7,13,C.gold,.3);block(g,17,0,15,7,13,C.red,.3);block(g,0,-1,17,5.2,11,C.glass,.3);
    const vertices=[],indices=[];const n=32;for(let i=0;i<=n;i++){const x=-29+i*58/n,y=8.2+3.5*Math.pow(Math.abs(x)/29,1.8);vertices.push(x,y,-8,x,y,8);if(i<n){const q=i*2;indices.push(q,q+2,q+1,q+1,q+2,q+3);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();mesh(g,geo,mat(C.stone,{side:THREE.DoubleSide}));
    for(let x=-25;x<=25;x+=5)block(g,x,6,.4,7,.4,C.stone,.3);block(g,0,19,18,.25,7,C.water,.35);block(g,0,26,3,.2,5,C.gold,.3);
  } else if(s.id==='lianhuashan') {
    mound(g,0,0,22,13,18);mound(g,-12,3,11,8,12,C.leaf);mound(g,12,-5,12,9,13,'#91b181');
    for(let i=0;i<15;i++){const a=-2.7+i*.24,r=18-i*.75;block(g,Math.cos(a)*r,Math.sin(a)*r,2,.3,2.8,C.stone,1+i*.68);}
    block(g,0,0,10,.5,8,C.stone,13.1);block(g,0,0,2.5,1.6,2,C.gold,13.6);block(g,0,0,.95,2.3,.7,'#5a6655',15.2);sphere(g,0,18.1,0,.48,.56,.46,'#5a6655');beam(g,[0,16.7,0],[1.2,17.6,0],.17,'#5a6655');
    for(let i=0;i<17;i++){const a=i*2.4,r=10+i%4*2;localTree(g,Math.cos(a)*r,Math.sin(a)*r,.8,Math.max(1,10-r*.38));}
  } else if(s.id==='huaqiangbei') {
    block(g,0,0,37,.2,37,C.stone,.1);block(g,0,0,5,.12,37,'#d9c69e',.35);
    for(const side of [-1,1])for(let i=0;i<4;i++){const z=-13+i*8,x=side*11,h=5+i%2*3;block(g,x,z,11,h,6.4,i%2?C.ground:C.stone,.3);facade(g,x,z,11,6.4,h,lights);block(g,side*5.4,z,.15,1.4,5,C.red,1.1);}
    block(g,11,-13,7,22,6.5,C.glass,.3);facade(g,11,-13,7,6.5,22,lights);block(g,11,-13,7.8,.6,7.3,C.gold,22.3);
    for(let z=-14;z<=14;z+=7){localTree(g,-2.8,z,.6);block(g,2.5,z,.8,.4,1.5,C.gold,.4);}
  } else if(s.id==='diwang') {
    block(g,0,0,21,2,18,C.stone,.2);block(g,0,0,10,31,9,'#6e9b91',2.2);facade(g,0,0,10,9,33,lights);block(g,0,0,7,3,7,C.glass,33.2);
    for(const x of [-3.5,3.5]){cylinder(g,x,0,1.4,1.4,4,C.stone,35,8);cylinder(g,x,0,0,.4,4.8,C.dark,39,6);}
    for(const x of [-5.3,5.3])block(g,x,0,.3,31,9.2,C.stone,2.2);
  } else if(s.id==='kk100') {
    block(g,0,0,23,2.5,19,C.stone,.2);block(g,0,0,9.5,37,7.5,glass,2.7);facade(g,0,0,9.5,7.5,39,lights);
    for(let i=0;i<9;i++){const w=9.5*(1-i/10),h=1.1;block(g,(9.5-w)/2,0,w,h,7.5*(1-i/12),glass,39.7+i*h);}
    for(const x of [-4.9,4.9])block(g,x,0,.25,37,7.8,C.stone,2.7);beam(g,[-4.9,39.7,0],[4.2,49.2,0],.2,C.stone);
  } else if(s.id==='dongmen') {
    block(g,0,0,37,.2,32,C.stone,.2);block(g,0,0,4,.1,32,C.gold,.42);block(g,0,1,37,.1,3,C.gold,.43);
    for(const side of [-1,1])for(let j=0;j<3;j++){const x=side*11,z=-10+j*10;smallHouse(g,x,z,12,7,4+j%2);for(let a=-1;a<=1;a++){block(g,x+a*3.5,z+4,.24,3.5,.24,C.stone,.3);block(g,x+a*3.5,z+3.6,2,1.8,.08,lights,1.2);}block(g,x,z+4,13,.35,1,C.red,3.8);}
    for(const x of [-3,3])block(g,x,13,.65,5,.7,C.red,.3);roof(g,0,13,9,1.8,3.5,C.roof,5.3);block(g,0,13,5,1.5,.7,C.gold,4.1);
  } else if(s.id==='talent-park') {
    lawn(g,43,36);const lake=[[-17,-10],[-6,-14],[7,-11],[17,-4],[18,5],[8,11],[-1,8],[-12,13],[-18,3],[-17,-10]];area(g,lake,C.water,.41);ribbon(g,lake,1.2,C.stone,.44,100);
    ribbon(g,[[-17,5],[-10,1],[-2,1],[7,3],[16,4]],1.3,C.stone,.8,60);for(let i=-12;i<=12;i+=4)block(g,i,1,.3,.8,.3,C.stone,.3);
    for(let i=0;i<16;i++){const a=i*Math.PI/8;localTree(g,Math.cos(a)*21,Math.sin(a)*16,.8);}
    block(g,-14,-13,6,2.5,4,C.stone,.3);roof(g,-14,-13,7,1.5,5,C.roof,2.8);disk(g,13,-12,4,3,C.gold,.45);
    for(let x=8;x<=16;x+=2)block(g,x,-12,.3,2,.3,C.stone,.5);
  } else if(s.id==='spring-bamboo') {
    block(g,0,0,24,1.6,20,C.stone,.2);const pts=[[7.2,0],[7.7,7],[7.1,18],[5.8,28],[3.6,36],[.35,42]].map(([r,y])=>new THREE.Vector2(r,y));mesh(g,new THREE.LatheGeometry(pts,40),glass,0,1.8,0);
    for(let i=0;i<24;i++){const a=i*Math.PI/12;for(const direction of [-1,1])for(let j=0;j<5;j++){const p=pts[j],q=pts[j+1],a1=a+direction*j*.1,a2=a+direction*(j+1)*.1;beam(g,[Math.cos(a1)*p.x,p.y+1.8,Math.sin(a1)*p.x],[Math.cos(a2)*q.x,q.y+1.8,Math.sin(a2)*q.x],.09,C.stone);}}
    for(let i=1;i<5;i++){const p=pts[i],ring=mesh(g,new THREE.TorusGeometry(p.x,.07,3,40),lights,0,p.y+1.8,0);ring.rotation.x=Math.PI/2;}
  } else if(s.id==='shenzhen-university') {
    lawn(g,44,39);block(g,0,0,3,.1,39,C.stone,.38);block(g,0,-2,44,.1,2,C.stone,.39);
    for(const x of [-13,13])for(const z of [-11,7]){block(g,x,z,12,5,8,C.stone,.3);facade(g,x,z,12,8,5,lights);block(g,x,z,12.6,.4,8.6,C.roof,5.3);}
    cylinder(g,0,-10,6,6,6,C.stone,.3,12);cylinder(g,0,-10,6.7,6.7,.5,C.gold,6.3,12);cylinder(g,0,-10,3,3,2,C.glass,6.8,12);
    block(g,10,17,18,.1,8,'#a67756',.4);block(g,10,17,14,.12,5,'#6f9974',.52);block(g,-7,19,1,4,1,C.stone,.3);block(g,-17,19,1,4,1,C.stone,.3);block(g,-12,19,12,.7,1.5,C.gold,4.3);
    for(let i=0;i<15;i++)localTree(g,-20+i%5*9,-18+Math.floor(i/5)*16,.7);
  } else if(s.id==='window-world') {
    lawn(g,43,35);disk(g,0,-1,11,10,C.stone,.4);
    for(const x of [-5,5])for(const z of [-4,4]){beam(g,[x,0,z],[x*.35,12,z*.35],.35,C.dark);beam(g,[x*.35,12,z*.35],[0,23,0],.23,C.dark);}
    block(g,0,0,7,.7,6,C.dark,8);block(g,0,0,4,.5,3,C.dark,14.2);for(let y=2;y<15;y+=3)for(const z of [-1,1]){const w=5*(1-y/24);beam(g,[-w,y,z*w*.8],[w*.7,y+3,z*w*.56],.1,C.gold);beam(g,[w,y,z*w*.8],[-w*.7,y+3,z*w*.56],.1,C.gold);}
    const pyramid=mesh(g,new THREE.ConeGeometry(6,7,4),mat(C.gold),-13,3.9,9);pyramid.rotation.y=Math.PI/4;
    block(g,13,8,10,.6,8,C.stone,.3);for(let x=9;x<=17;x+=2)for(const z of [5,11])cylinder(g,x,z,.4,.4,4,C.stone,.9,8);roof(g,13,8,11,2,9,C.stone,4.9);
    for(let i=0;i<12;i++)localTree(g,-20+i%4*13,-15+Math.floor(i/4)*14,.7);
  } else if(s.id==='happy-harbour') {
    lawn(g,41,39);block(g,0,1,25,.5,13,C.stone,.35);
    for(const z of [-3,3]){beam(g,[-10,0,z],[0,18,z],.65,C.stone);beam(g,[10,0,z],[0,18,z],.65,C.stone);}
    const wheel=new THREE.Group();wheel.position.set(0,18,0);wheel.userData.cityMotion=true;g.add(wheel);
    for(const z of [-.7,.7])mesh(wheel,new THREE.TorusGeometry(14,.45,8,80),pale,0,0,z);
    const cabins=[];for(let i=0;i<16;i++){const a=i*Math.PI/8;beam(wheel,[0,0,0],[Math.cos(a)*14,Math.sin(a)*14,0],.09,C.stone);const pod=new THREE.Group();pod.position.set(Math.cos(a)*14,Math.sin(a)*14,0);wheel.add(pod);sphere(pod,0,-.8,0,1.2,.85,1.05,C.glass);block(pod,0,0,1.8,.22,1.7,lights,-.5);cabins.push(pod);}
    updates.push(t=>{wheel.rotation.z=-t*.055;cabins.forEach(p=>p.rotation.z=t*.055);});
    for(const x of [-14,14])for(const z of [-13,12]){block(g,x,z,10,3.5,7,C.stone,.3);block(g,x,z,10.7,.4,7.7,C.gold,3.8);facade(g,x,z,10,7,3.5,lights);}
  } else if(s.id==='qianhai') {
    lawn(g,31,29);disk(g,0,0,9,7,C.stone,.4);sphere(g,0,2.7,0,5,2.7,2.3,'#baad90',1);block(g,0,2.18,4,.9,.06,C.red,2.2);ribbon(g,[[-14,-10],[-5,-8],[5,-8],[14,-2]],1.6,C.stone,.45,40);
    for(let i=0;i<12;i++){const a=i*Math.PI/6;localTree(g,Math.cos(a)*14,Math.sin(a)*12,.75);}
    block(g,11,-7,5,2,4,C.stone,.3);roof(g,11,-7,6,1.3,5,C.roof,2.3);
  } else if(s.id==='dameisha') {
    const sand=[[-19,-14],[-10,-11],[0,-3],[10,6],[15,15],[15,22],[10,13],[0,4],[-10,-4],[-19,-7]];area(g,sand,'#e8d3a6',.46);ribbon(g,[[-19,-14],[-10,-11],[0,-3],[10,6],[15,15]],1.4,C.stone,.51,80);
    for(let i=0;i<8;i++){const x=-16+i*4,z=x*.8+.8;cylinder(g,x,z,.12,.12,2.4,C.stone,.5,6);cylinder(g,x,z,0,1.5,.7,i%2?C.gold:C.red,2.9,8);block(g,x+1,z+.8,.8,.2,1.8,C.stone,.55);}
    for(let x=-17;x<=14;x+=6)localTree(g,x,x*.8-8,.95);
    for(const x of [-3,3]){beam(g,[x,-.1,-5],[x,6,-5],.25,C.stone);beam(g,[x,5,-5],[x+(x<0?-3:3),7,-5],.2,C.stone);}block(g,0,-5,9,.3,1.4,C.stone,6);
  } else if(s.id==='dapeng') {
    block(g,0,0,29,.3,28,'#d7d0b8',.2);for(const x of [-14,14])block(g,x,0,1.7,3.5,28,'#a6a48d',.5);block(g,0,-13,29,3.5,1.7,'#a6a48d',.5);for(const x of [-8,8])block(g,x,13,12,3.5,1.7,'#a6a48d',.5);
    for(let x=-13;x<=13;x+=2.3)for(const z of [-13,13])if(z<0||Math.abs(x)>3)block(g,x,z,1.15,.8,1.8,'#a6a48d',4);
    for(const x of [-4.7,4.7])block(g,x,13,3,5.5,4,'#a6a48d',.5);block(g,0,13,12,1.5,4,'#a6a48d',5.8);block(g,0,13,9,2.7,4,C.stone,7.3);roof(g,0,13,12,1.6,7,C.roof,10);
    for(const x of [-7,7])for(const z of [-7,3])smallHouse(g,x,z,9,6,2.8);block(g,0,0,2.4,.12,22,C.stone,.6);localTree(g,0,-7,.8);
  } else if(s.id==='universiade') {
    lawn(g,53,43);const stadium=new THREE.Group();stadium.position.set(-7,0,2);g.add(stadium);
    // Open elliptical roof ring keeps the football pitch visible from every overview.
    const n=24,positions=[],indices=[];for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,peak=i%2?9:12;positions.push(Math.cos(a)*19,3,Math.sin(a)*14,Math.cos(a)*17,peak,Math.sin(a)*12,Math.cos(a)*11,6.2,Math.sin(a)*7);if(i<n){const q=i*3;indices.push(q,q+3,q+1,q+1,q+3,q+4,q+1,q+4,q+2,q+2,q+4,q+5);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();mesh(stadium,geo,mat('#b9d0be',{side:THREE.DoubleSide,metalness:.12,roughness:.6}));
    for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2;beam(stadium,[Math.cos(a)*19,3,Math.sin(a)*14],[Math.cos(a)*17,i%2?9:12,Math.sin(a)*12],.14,C.stone);beam(stadium,[Math.cos(a)*17,i%2?9:12,Math.sin(a)*12],[Math.cos(b)*11,6.2,Math.sin(b)*7],.12,C.stone);}
    block(stadium,0,0,21,.2,12,'#729e73',.3);for(const x of [-10,10])block(stadium,x,0,.12,.03,11,C.stone,.53);for(const z of [-5.5,5.5])block(stadium,0,z,20,.03,.1,C.stone,.53);block(stadium,0,0,.12,.03,11,C.stone,.54);const centre=mesh(stadium,new THREE.TorusGeometry(2,.06,3,24),pale,0,.57,0);centre.rotation.x=Math.PI/2;
    for(const [x,z,r,h] of [[18,-10,8,9],[20,12,6,6]]){const dome=sphere(g,x,h*.35,z,r,h*.75,r*.8,'#c8d6c6',0);dome.rotation.y=.2;block(g,x,z,r*1.55,.4,r*1.3,C.stone,.3);}
  }
  return g;
}
function mergeStatic(group) {
  group.updateMatrixWorld(true);const buckets=new Map();group.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||Array.isArray(o.material))return;let id;for(let p=o;p;p=p.parent){if(p.userData.cityMotion)return;if(p.userData.landmarkId)id=p.userData.landmarkId;}if(id)o.userData.landmarkId=id;const key=`${o.material.uuid}:${id||'environment'}`;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o);});
  for(const list of buckets.values()){if(list.length<2)continue;const copies=list.map(o=>{const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();for(const k of Object.keys(geo.attributes))if(k!=='position'&&k!=='normal')geo.deleteAttribute(k);if(!geo.attributes.normal)geo.computeVertexNormals();geo.applyMatrix4(o.matrixWorld);return geo;});const merged=mergeGeometries(copies,false);copies.forEach(g=>g.dispose());if(!merged)continue;const m=mesh(group,merged,list[0].material);m.userData.staticBatch=true;m.userData.sourceMeshes=list.length;if(list[0].userData.landmarkId)m.userData.landmarkId=list[0].userData.landmarkId;list.forEach(o=>o.removeFromParent());}
}
export function createShenzhen() {
  const group=new THREE.Group();group.name='深圳 · 山海新城';const random=rng(2026101801),lights=glowing(),updates=[];
  block(group,0,5,460,4.6,290,C.earth,-4.8);block(group,0,5,460,.2,290,C.water,-.2);area(group,LAND,C.ground,.2,.4);
  ribbon(group,COAST.map(([x,z])=>[THREE.MathUtils.clamp(x,-229,229),THREE.MathUtils.clamp(z,-139,149)]),1.5,C.stone,.25,200);
  for(const path of ROADS){ribbon(group,path,4.5,C.curb,.23,70);ribbon(group,path,3.1,C.road,.25,70);}
  // Broad hill belt separates the east-coast excursion from the central street grid.
  const hills=[[80,-112,26,15,19],[187,-37,26,22,28],[207,-61,20,29,27],[177,2,14,13,19],[205,30,17,18,19],[216,59,11,19,19]];
  for(const [x,z,rx,h,rz] of hills)mound(group,x,z,rx,h,rz);
  const trunks=[],canopies=[[],[],[]],bodies=[[],[],[],[]],windows=[],roofs=[],people=[],stripe=[];let buildings=0,trees=0;
  const grow=(x,z,s=.8,y=.24)=>{if(x<-226||x>226||z<-136||z>146)return;trees++;trunks.push([x,y+s*.8,z,s*.15,s*1.6,s*.15]);canopies[Math.floor(random()*3)].push([x,y+s*2.1,z,s,s*1.4,s]);};
  const reserved=(x,z,margin=0)=>SPECS.some(s=>Math.abs(x-s.x)<s.r+margin&&Math.abs(z-s.z)<s.r+margin);
  for(let x=-215;x<=152;x+=8)for(let z=-126;z<=65;z+=8){const px=x+(random()-.5)*1.1,pz=z+(random()-.5)*1.1;if(![[-4,-4],[4,-4],[-4,4],[4,4]].every(([dx,dz])=>inside(px+dx,pz+dz,LAND))||reserved(px,pz,4)||nearRoad(px,pz,6)||hills.some(([hx,hz,rx,h,rz])=>Math.hypot((px-hx)/(rx+3),(pz-hz)/(rz+3))<1))continue;if(random()<.27){grow(px,pz,.7+random()*.5);continue;}
    const h=3.6+random()*10,w=4+random()*1.7,d=4+random()*1.7;const idx=Math.floor(random()*4);bodies[idx].push([px,h/2+.2,pz,w,h,d]);roofs.push([px,h+.35,pz,w+.2,.3,d+.2]);buildings++;for(let y=1.8;y<h-.3;y+=2)for(const sign of [-1,1])windows.push([px,y,pz+sign*(d/2+.04),w*.77,.21,.06]);if(random()>.3)grow(px+3.1,pz+2.5,.65);}
  for(const path of ROADS){const curve=new THREE.CatmullRomCurve3(path.map(([x,z])=>new THREE.Vector3(x,.29,z)));const count=Math.floor(curve.getLength()/5);for(let i=0;i<count;i++){const p=curve.getPointAt(i/count),t=curve.getTangentAt(i/count);stripe.push([p.x,p.y,p.z,.1,.02,1.8,Math.atan2(t.x,t.z)]);for(const sign of [-1,1]){const x=p.x+t.z*sign*3.3,z=p.z-t.x*sign*3.3;if(inside(x,z,LAND)&&!reserved(x,z,1)&&random()>.3)grow(x,z,.65);}}}
  for(let i=0;i<210;i++){const x=155+random()*69,z=-130+random()*220;if(inside(x,z,LAND)&&!reserved(x,z,3)&&!nearRoad(x,z,5)&&!hills.some(([hx,hz,rx,h,rz])=>Math.hypot((x-hx)/(rx+2),(z-hz)/(rz+2))<1))grow(x,z,.6+random()*.9);}
  for(const s of SPECS)for(let i=0;i<11;i++){const a=random()*Math.PI*2,r=s.r*.95;const x=s.x+Math.cos(a)*r,z=s.z+Math.sin(a)*r;if(inside(x,z,LAND))people.push([x,.82,z,.23,1.1,.23]);}
  const box=new THREE.BoxGeometry(1,1,1),ico=new THREE.IcosahedronGeometry(1,1);['#e1dcc7','#f0e8d4','#d2d6c5','#c8cfc1'].forEach((color,i)=>batch(group,box,mat(color),bodies[i]));batch(group,box,mat(C.stone),roofs);batch(group,box,lights,windows);batch(group,box,mat('#eee8d6'),stripe);batch(group,box,mat('#8c8168'),trunks);['#658e6d','#779e78','#8aac83'].forEach((color,i)=>batch(group,ico,mat(color),canopies[i]));batch(group,box,mat(C.red),people);
  SPECS.forEach(s=>buildLandmark(group,s,lights,updates));
  const roadCurves=[ROADS[0],ROADS[2],ROADS[13]].map(ps=>new THREE.CatmullRomCurve3(ps.map(([x,z])=>new THREE.Vector3(x,.33,z))));
  const cars=[];for(let i=0;i<13;i++){const g=new THREE.Group();g.userData.cityMotion=true;group.add(g);block(g,0,0,.95,.5,1.8,i%3===0?C.red:C.stone,.15);block(g,0,-.1,.8,.45,1.05,C.glass,.65);block(g,0,.93,.65,.12,.05,lights,.4);cars.push(g);}
  const boatRoutes=[new THREE.CatmullRomCurve3([new THREE.Vector3(-223,.16,30),new THREE.Vector3(-215,.16,67),new THREE.Vector3(-189,.16,112)]),new THREE.CatmullRomCurve3([new THREE.Vector3(-70,.16,135),new THREE.Vector3(-27,.16,117),new THREE.Vector3(16,.16,100)]),new THREE.CatmullRomCurve3([new THREE.Vector3(163,.16,113),new THREE.Vector3(174,.16,125),new THREE.Vector3(189,.16,143)])];
  const ships=[];for(let i=0;i<3;i++){const g=new THREE.Group();g.userData.cityMotion=true;group.add(g);const hull=cylinder(g,0,0,2,2,.7,C.stone,.05,5);hull.scale.set(.8,1,2);block(g,0,0,2.5,1,4,C.stone,.75);block(g,0,-.2,2.2,.7,2.9,C.glass,1.75);block(g,0,-.2,2.6,.18,3.1,C.red,2.45);ships.push(g);}
  mergeStatic(group);
  const tallTowerIds=new Set(['pingan','diwang','kk100','spring-bamboo']);
  const landmarks=SPECS.map(s=>{
    const target=new THREE.Vector3(s.x,s.h*.36,s.z),camera=new THREE.Vector3(s.x+Math.max(40,s.h*1.07,s.r*1.8),s.h*.68+Math.max(28,s.r*1.2),s.z+Math.max(44,s.h*1.18,s.r*1.9));
    if(tallTowerIds.has(s.id)){
      // Frame the complete authored tower, leaving room for the header and phone controls.
      const towerBounds=new THREE.Box3();group.traverse(o=>{if(o.isMesh&&o.userData.landmarkId===s.id)towerBounds.union(new THREE.Box3().setFromObject(o));});
      const offset=camera.clone().sub(target).multiplyScalar(1.45);target.y=(towerBounds.min.y+towerBounds.max.y)/2;camera.copy(target).add(offset);
    }
    return {id:s.id,name:s.name,shortName:s.shortName,subtitle:s.subtitle,description:s.description,category:s.category,zone:s.zone,position:[s.x,s.h+3,s.z],camera:camera.toArray(),target:target.toArray(),related:SPECS.filter(o=>o.zone===s.zone&&o.id!==s.id).slice(0,3).map(o=>o.id)};
  });
  function update(t){updates.forEach(fn=>fn(t));cars.forEach((g,i)=>{const c=roadCurves[i%roadCurves.length],u=(t*(.008+i*.0003)+i*.081)%1,p=c.getPointAt(u),d=c.getTangentAt(u);g.position.copy(p);g.rotation.y=Math.atan2(d.x,d.z);});ships.forEach((g,i)=>{const c=boatRoutes[i],u=(t*(.018+i*.003)+i*.27)%1,p=c.getPointAt(u),d=c.getTangentAt(u);g.position.copy(p);g.rotation.y=Math.atan2(d.x,d.z);});}
  update(0);
  return {group,landmarks,regions:REGIONS,bounds:{...BOUNDS},overview:{position:[330,377,414],target:[0,4,0]},scopeNote:'以福田、罗湖、南山、宝安前海和东部山海组织浏览路线；并非完整行政区划。海岸、山势和东部距离经过艺术化压缩，不用于测绘导航。',minimap:{paths:[{points:[[-230,-140],[230,-140],[230,150],[-230,150]],closed:true,color:C.water},{points:LAND,closed:true,color:C.ground},...ROADS.map(points=>({points,color:'#c7c3ad',width:2.2}))]},stats:{landmarks:landmarks.length,buildings:buildings+58,trees,windowPanels:windows.length,cars:cars.length,boats:ships.length,ferrisWheels:1},update};
}

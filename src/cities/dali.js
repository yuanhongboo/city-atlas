import * as THREE from 'three';
import { block, cylinder, sphere, area, ribbon, roof, tree, line } from '../scene-kit.js';
import { createDestination, hill, beam, glow } from '../destination-kit.js';
import { H, house, courtyard, pagoda, boat, mountain } from '../heritage-kit.js';

export const metadata={title:'大理',seal:'理',verse:'一边是苍山，一边是洱海',coordinates:'25.70° N · 100.16° E',terrain:'苍山 · 洱海 · 白族村落',intro:'沿洱海慢慢走，看三塔、白墙和远山。',description:'苍山立在西边，湖水铺向东边；古城、喜洲、双廊和湖岸村庄沿水相接。',category:'苍洱山水'};
export const landmarkIds=['dali-old-town','three-pagodas','cangshan','erhai','longkan','xizhou','shuanglang','little-putuo','chongsheng','zhoucheng','wenbi','erhai-greenway'];
const lake=[[-9,-169],[49,-175],[91,-148],[111,-99],[121,-38],[114,30],[100,95],[66,151],[28,165],[-3,142],[-21,79],[-23,15],[-20,-57]];
const westernShore=[[-17,-151],[-28,-93],[-32,-36],[-30,24],[-22,79],[-7,133]];
const regions=[
  {id:'old-city',name:'苍山古城',description:'苍山、古城与崇圣寺三塔',position:[56,195,235],target:[-100,17,55],labelPosition:[-138,8,127]},
  {id:'west-shore',name:'海西田园',description:'喜洲、周城、龙龛与生态廊道',position:[104,185,148],target:[-41,5,-44],labelPosition:[-30,7,-122]},
  {id:'east-shore',name:'海东水岸',description:'双廊、小普陀、文笔与洱海',position:[265,192,196],target:[104,3,-22],labelPosition:[149,5,104]}
];

export function createDali(){
  const d=createDestination({name:'大理',bounds:{minX:-190,maxX:180,minZ:-190,maxZ:185},seed:260102,groundColor:'#c8d2af',baseColor:'#b9b39a',regions,overview:{position:[345,340,388],target:[-3,10,-2]},scopeNote:'三个片区用于浏览，保留苍山在西、洱海在东及环湖村镇的大体方位。湖形、山高和沿岸距离经过压缩，不作行政边界或导航依据。',minimap:{paths:[{points:lake,closed:true,color:'#7db8b2'},{points:westernShore,width:2,color:'#eee0b7'}]}});
  const {group,landmark,random}=d;area(group,lake,'#7db8b2',.12);ribbon(group,westernShore,3.7,'#e6d7b5',.22,120);
  for(const [x,z,h]of[[-151,-150,45],[-153,-94,57],[-151,-30,48],[-153,24,56],[-151,128,43]])mountain(group,x,z,31,37,h,{color:'#8b9f8c',snow:z<-90});
  for(let i=0;i<70;i++){const x=-113+random()*73,z=-172+random()*330;if(Math.hypot(x+74,z-75)<30||Math.hypot(x+85,z-12)<38||Math.hypot(x+60,z+77)<27||Math.hypot(x+75,z+136)<24)continue;tree(group,x,z,.7+random()*.6);}
  for(let i=0;i<16;i++)block(group,-97+(i%3)*22,-163+Math.floor(i/3)*25,18,.12,17,['#b6c58d','#d7cf94','#a7bf92'][i%3],.12);
  const add=(id,name,subtitle,description,category,zone,x,z,build,extra={})=>landmark({id,name,subtitle,description,category,zone,x,z,...extra},build);
  add('dali-old-town','大理古城','白墙灰瓦 · 城门与五华楼','大理古城位于苍山与洱海之间。城门、横纵街巷、白族院落和五华楼形成古城意象，城墙与街道为微缩重组。','古城街巷','old-city',-75,84,g=>{
    block(g,0,0,57,.25,54,'#d8ceb3');for(const x of [-27,27])block(g,x,0,1.3,4,54,'#b3aa91');for(const z of [-26,26])block(g,0,z,54,4,1.3,'#b3aa91');
    for(const x of [-17,17])for(const z of [-14,3,17])house(g,x,z,10,10,4.2,{bai:true});
    for(const x of [-7,7])block(g,x,26,8,6,5,'#b0aa94');beam(g,[-11,6,26],[11,6,26],1,H.stone);house(g,0,26,23,7,4,{y:6,wall:'#b8aa8e'});
    block(g,0,-10,10,7,9,H.white);roof(g,0,-10,15,3,14,H.roof,7);block(g,0,-10,8,4,7,H.wood,10);roof(g,0,-10,12,2.8,11,H.roof,14);
  });
  add('three-pagodas','崇圣寺三塔','一大两小 · 苍洱之间','三塔位于大理古城西北，背靠苍山、面向洱海。中间方形密檐塔与两侧较低的八角塔，在沙盘中保留高低与形制的差异。','历史古塔','old-city',-76,17,g=>{
    block(g,0,0,36,.3,29,'#dbd1b5');pagoda(g,0,-5,41,16,{radius:3.8,sides:4,roof:'#c4bea1'});for(const x of [-12,12])pagoda(g,x,8,25,10,{radius:2.9,sides:8,roof:'#c4bea1'});
    for(const x of [-17,17])tree(g,x,-13,1.2);
  });
  add('cangshan','苍山','西岸山屏 · 林线与索道','苍山位于洱海西侧。沙盘以连续山屏、林线和一段观景索道表现垂直景观，山峰高度与线路经过艺术化压缩。','山岳景观','old-city',-153,71,g=>{
    mountain(g,0,0,29,37,76,{color:'#93a59a',snow:true});mountain(g,0,-29,27,27,52,{color:'#809780'});mountain(g,4,28,26,27,45,{color:'#8da385'});block(g,17,3,10,3,8,H.white,28);roof(g,17,3,13,2,11,H.roof,31);
  },{camera:[14,145,224],target:[-147,35,72]});
  const cable=new THREE.Group();group.add(cable);block(cable,0,0,3,2.8,3,'#bd8f5c');block(cable,0,0,3.1,.9,3.1,glow('#a1bab0','#e4dba4'),1.6);beam(cable,[0,2.8,0],[0,4.6,0],.14,H.wood);
  const ca=new THREE.Vector3(-112,5,121),cb=new THREE.Vector3(-137,32,74);line(group,[ca.clone().add(new THREE.Vector3(0,4.6,0)).toArray(),cb.clone().add(new THREE.Vector3(0,4.6,0)).toArray()],'#879482');d.addMotion(cable,t=>cable.position.lerpVectors(ca,cb,(1+Math.sin(t*.09))/2));
  add('erhai','洱海','长湖微澜 · 苍山倒影','洱海是大理山水格局的核心。长条湖面在沙盘中保持开阔，两艘小船缓缓穿过水面；航线仅为风景动画。','高原湖泊','east-shore',49,28,g=>{
    for(let i=0;i<9;i++)ribbon(g,[[-18+i*4,-12+i*4],[-12+i*4,-11+i*4],[-7+i*4,-12+i*4]],.23,'#b3d5c5',.05,12);
    const buoy=cylinder(g,0,0,.4,.65,1.4,'#d5ba80',.1,8);sphere(g,0,1.9,0,.5,.5,.5,'#e5d8ae');
  },{camera:[165,105,175],target:[40,1,20],labelY:6});
  add('longkan','龙龛古渡','临湖石岸 · 水杉与小舟','龙龛位于大理古城东侧的洱海西岸。渡口、临湖水杉与长椅构成开阔的滨水空间，亲水平台与岸线作概括展示。','湖滨村落','west-shore',-13,103,g=>{
    area(g,[[-16,-18],[8,-15],[15,6],[6,18],[-16,14]],'#d8d2b7',.18);block(g,10,2,15,.6,4,'#c8bda1',.2);
    for(const [x,z]of[[-12,-12],[-9,0],[-11,12]]){cylinder(g,x,z,.24,.5,7,'#8b7d61',0,6);sphere(g,x,9,z,2.2,4.4,2.2,'#b9ac78');}for(const z of [-8,8])block(g,1,z,5,.5,1.2,H.wood,1);
  });
  add('xizhou','喜洲古镇','白族院落 · 稻田边的街角','喜洲位于洱海西岸北部，白族民居以照壁、院落和精细屋饰为特色。这里用完整庭院、弧形街角与田畴表现古镇风貌。','白族古镇','west-shore',-65,-76,g=>{
    courtyard(g,-4,0,31,29,{bai:true,wall:H.white,roof:'#697568'});block(g,6,2,.6,5,11,H.white);block(g,6,2,.8,.35,12,H.roof,5);for(let i=0;i<3;i++)sphere(g,6.35,3,-1+i*3,.06,.6,.8,'#8d9b8e');
    const corner=cylinder(g,22,8,6,6,7,'#cfb39a',0,16);block(g,22,8,12,.4,12,H.roof,7);for(const z of [-17,20])block(g,22,z,18,.1,12,'#d5c88a');
  });
  add('shuanglang','双廊','东北湖岸 · 村镇与小岛','双廊位于洱海东北岸。临水白墙、伸入湖面的岛屿和小码头构成层次丰富的岸线，湖湾与建筑是概括性的村镇意象。','湖滨古镇','east-shore',111,-139,g=>{
    area(g,[[-16,-8],[9,-20],[26,-14],[27,13],[9,22],[-7,17]],'#d5d0b1',.2);for(const [x,z]of[[2,-9],[16,-8],[7,7],[21,9]])house(g,x,z,9,8,4.3,{bai:true});
    cylinder(g,-16,7,6,7,1.1,'#bec7a3',0,16);pagoda(g,-16,7,10,3,{radius:2.5,roof:'#aa9569'});block(g,-6,5,15,.6,2.6,H.wood,.6);
  });
  add('little-putuo','小普陀','袖珍湖岛 · 一阁临水','小普陀位于洱海东岸挖色附近。小岛、石基与双层阁楼以紧凑尺度呈现，保留水包围建筑的轮廓。','湖中岛阁','east-shore',108,-31,g=>{
    cylinder(g,0,0,6.5,8,2.4,'#b5b9a5',0,12);house(g,0,0,7,7,4,{y:2.4,wall:'#d2bf96',roof:'#8d8964'});house(g,0,0,5.4,5.4,3,{y:8.2,wall:'#bda579',roof:'#8d8964'});tree(g,5,-3,.9,2);
  });
  add('chongsheng','崇圣寺','山前院落 · 向东展开','崇圣寺位于三塔后方的苍山脚下。沙盘把寺院独立成一个可近看的院落，层层殿宇沿山坡展开，展示与三塔的相邻关系。','寺院建筑','old-city',-117,-1,g=>{
    for(let i=0;i<3;i++){block(g,0,-13+i*13,27,2+i*.2,11,'#c4bba2',1.4-i*.5);house(g,0,-13+i*13,22-i*2,9,5.2,{y:3.4-i*.5,wall:'#c9b18b',roof:'#b09e63'});}for(const x of [-18,18])house(g,x,0,5,34,3.4,{wall:'#d7c9aa',roof:'#9f8e5f'});
  });
  add('zhoucheng','周城 · 扎染','白墙晒院 · 靛蓝布帘','周城位于喜洲镇，是白族扎染文化的重要村落。院落中悬挂的靛蓝布帘与晾晒架表现传统工艺，布面纹样为原创简化图案。','村落工艺','west-shore',-69,-139,g=>{
    courtyard(g,0,0,33,26,{bai:true,wall:H.white});for(const z of [-2,5]){for(const x of [-11,11])block(g,x,z,.25,7,.25,H.wood);beam(g,[-12,7,z],[12,7,z],.25,H.wood);for(let i=0;i<4;i++){block(g,-8+i*5,z,3.2,4.5,.08,'#526e84',2.4);for(let j=0;j<3;j++)sphere(g,-8+i*5,3+j*1.2,z+.06,.55,.28,.02,'#c7d5cc');}}
  });
  add('wenbi','文笔村','海东山坡 · 白屋临海','文笔村位于海东镇北部，面向洱海和苍山。沿坡白色民居、台阶与临湖道路在沙盘中层层上升，保留山海之间的村落关系。','湖滨村落','east-shore',139,67,g=>{
    hill(g,8,0,25,29,15,'#a6b58b');for(let i=0;i<4;i++){const x=-11+i*8;house(g,x,-9+(i%2)*18,8,8,4,{y:1+i*2.4,bai:true,wall:H.white});}for(let i=0;i<12;i++)block(g,-10+i*2,4,2.4,.6,3,'#d3c9ad',i*.75);ribbon(g,[[-21,-24],[-21,0],[-18,25]],3.5,'#dfd3b3',.18,36);
  });
  add('erhai-greenway','洱海生态廊道','缓行步道 · 湿地留白','洱海生态廊道沿湖岸展开，以湿地修复与慢行空间连接村落。浅湾、芦苇和弯曲步道在模型里留出水与绿地的空间。','滨水慢行','west-shore',-23,27,g=>{
    area(g,[[-10,-24],[5,-22],[12,0],[8,24],[-9,25]],'#b1c69c',.12);ribbon(g,[[0,-25],[-4,-10],[2,10],[0,25]],2.5,'#e9dab8',.28,55);for(let i=0;i<12;i++){const z=-21+i*4,x=7+Math.sin(i)*2;for(let j=0;j<3;j++)beam(g,[x+j*.4,0,z],[x+j*.4+.3,2+j*.4,z],.09,'#a69f6f');}for(const z of [-14,15]){block(g,-7,z,4,.5,1,H.wood,1);tree(g,-9,z,1);}
  });
  const boats=[boat(group,'#9b8059',1.25),boat(group,'#8d8d65',1.1)];boats.forEach((b,i)=>d.addMotion(b,t=>{const a=t*.025+i*2.2;b.position.set(40+Math.cos(a)*32,.3,-18+Math.sin(a)*80);b.rotation.y=Math.atan2(-32*Math.sin(a),80*Math.cos(a));}));
  return d.finish({city:'大理',landmarks:landmarkIds.length,buildings:48,trees:74,boats:2});
}

import * as THREE from 'three';
import { block, cylinder, sphere, area, ribbon, roof, mat, line } from '../scene-kit.js';
import { createDestination, hill, beam, instances, glow } from '../destination-kit.js';

export const metadata = {
  title:'安徽黄山', seal:'徽', verse:'奇松探云海，白墙映青山。', coordinates:'30.13° N · 118.16° E',
  terrain:'花岗岩峰林 · 徽州村落', intro:'从迎客松的枝影走进西海，再到徽州水畔。',
  description:'黄山奇峰与徽州村落的微缩山水长卷。山岳、古村和屯溪的距离经过压缩，十一处地标各有独立造型。', category:'山岳与古村',
};
const C={ground:'#c6d0b5',rock:'#aaa995',rockLight:'#d2c9b5',leaf:'#536f53',pine:'#3e6954',wall:'#eee9dc',roof:'#616e69',water:'#6da6a1',path:'#d9c9a8',red:'#ab6d52'};
const B={minX:-210,maxX:210,minZ:-160,maxZ:160};
const specs=[
  {id:'yingkesong',name:'迎客松',x:12,z:35,zone:'mountain-gates',category:'奇松',subtitle:'玉屏峰前 · 枝展迎宾',description:'迎客松位于黄山玉屏景区。斜伸的主枝从花岗岩侧探出，与背后的峰壁共同形成黄山的经典轮廓。'},
  {id:'tiandu',name:'天都峰',x:73,z:47,zone:'mountain-gates',category:'险峰',subtitle:'石阶盘旋 · 云间峰脊',description:'天都峰是黄山主峰之一，登山古道沿陡峭峰壁上行。模型突出孤峰、石阶和窄脊；不表示游道当前开放状态。'},
  {id:'lianhua',name:'莲花峰',x:-45,z:14,zone:'mountain-gates',category:'主峰',subtitle:'群瓣成峰 · 莲花石骨',description:'莲花峰以主峰与周围簇拥的小峰构成莲花般的山体。山石体量为艺术化概括，轮休与实时游览信息以景区公告为准。'},
  {id:'yungu',name:'云谷索道',x:138,z:5,zone:'mountain-gates',category:'索道山门',subtitle:'林谷出发 · 吊厢上山',description:'云谷索道连接云谷一带与后山高处。这里用山门、林谷站房和沿坡运行的吊厢，表现由山下进入峰林的过程。'},
  {id:'guangmingding',name:'光明顶',x:5,z:-50,zone:'north-sea',category:'高山观景',subtitle:'平阔峰顶 · 天际远眺',description:'光明顶与莲花峰、天都峰共同构成黄山主峰。相对平阔的顶面和气象观测建筑，是这处山顶可识别的景观。'},
  {id:'feilaishi',name:'飞来石',x:-58,z:-60,zone:'north-sea',category:'奇石',subtitle:'巨石独立 · 临空而立',description:'飞来石以直立巨石与狭窄接触的岩台形成强烈轮廓。模型保留独石的倾斜形态和周围峰林，不按真实尺度复刻。'},
  {id:'xihai',name:'西海大峡谷',x:-132,z:-67,zone:'north-sea',category:'峡谷峰林',subtitle:'层峰深谷 · 栈道与缆车',description:'西海大峡谷位于黄山西部，以深壑、石柱和沿崖游道著称。微缩峡谷呈现两侧石壁、谷底通道及观光缆车意象。'},
  {id:'shixin',name:'始信峰',x:95,z:-83,zone:'north-sea',category:'松石景观',subtitle:'北海松风 · 峰间相望',description:'始信峰是黄山后山松石景观的代表地点之一。紧凑峰丛、临崖古松与连接观景台的步道，在沙盘中形成一处北海小景。'},
  {id:'hongcun',name:'宏村',x:-132,z:78,zone:'huizhou',category:'徽州古村',subtitle:'月沼映屋 · 南湖画桥',description:'宏村位于黄山市黟县，徽派民居围绕水系展开。模型把月沼、南湖和画桥压缩为一组水边白墙黛瓦，古村并不位于黄山登山游线上。'},
  {id:'xidi',name:'西递',x:-139,z:133,zone:'huizhou',category:'徽州古村',subtitle:'牌坊立巷 · 马头墙',description:'西递位于黟县。村口牌坊、层叠马头墙与沿溪街巷组成徽州聚落印象；与宏村、黄山之间的路程经过明显压缩。'},
  {id:'tunxi',name:'屯溪老街',x:113,z:116,zone:'huizhou',category:'历史街巷',subtitle:'新安江畔 · 徽商街市',description:'屯溪老街位于黄山市中心城区，临近新安江、横江、率水交汇处。这里以狭长商铺街和滨水石桥概括徽商街市风貌。'},
];
export const landmarkIds=specs.map(s=>s.id);
const regions=[
 {id:'mountain-gates',name:'山门奇峰',description:'迎客松、天都峰与莲花峰展开玉屏松石景观，向东衔接云谷山门。',position:[185,160,188],target:[45,18,24],labelPosition:[40,75,35]},
 {id:'north-sea',name:'北海西海',description:'从光明顶与飞来石，走进西海峡谷，再望始信峰的松影。',position:[152,210,120],target:[-25,23,-68],labelPosition:[-40,92,-74]},
 {id:'huizhou',name:'徽州村落',description:'黟县的宏村、西递与屯溪老街构成山下浏览篇章，三地间距已压缩。',position:[145,210,270],target:[-15,3,112],labelPosition:[-25,34,115]},
];
function pine(g,x,y,z,s=1,lean=1){
 beam(g,[x,y,z],[x+lean*s,y+6*s,z],.3*s,'#73664f');
 for(let i=0;i<3;i++){const bx=x+lean*s+(i-1)*3*s,by=y+(4.2+i*.9)*s;beam(g,[x+lean*s*.7,y+4.5*s,z],[bx,by,z+(i%2?1:-1)*s],.13*s,'#73664f');sphere(g,bx,by+.6*s,z+(i%2?1:-1)*s,3*s,.8*s,2*s,C.pine,1);}
}
function spire(g,x,z,r,h,shade=C.rock,y=0){
 const geo=new THREE.CylinderGeometry(r*.28,r,h,7,3);const pos=geo.getAttribute('position');
 for(let i=0;i<pos.count;i++){const py=pos.getY(i),px=pos.getX(i),pz=pos.getZ(i);pos.setX(i,px+Math.sin(py*.31+x)*r*.12);pos.setZ(i,pz+Math.cos(py*.21+z)*r*.1);}geo.computeVertexNormals();
 const m=new THREE.Mesh(geo,mat(shade));m.position.set(x,y+h/2,z);m.castShadow=m.receiveShadow=true;g.add(m);
}
function house(g,x,z,w=7,d=7,h=4){block(g,x,z,w,h,d,C.wall);roof(g,x,z,w+.8,2,d+.8,C.roof,h);for(const side of [-1,1]){block(g,x+side*w/2,z,.45,h+1,d,C.wall);block(g,x+side*w/2,z,.5,1,d*.5,C.wall,h+1);}block(g,x,z+d/2+.04,1.4,2,.1,'#57665d',.1);}
function pavilion(g,x,z,y=0){block(g,x,z,7,.4,7,C.path,y);for(const a of [-2.6,2.6])for(const b of [-2.6,2.6])cylinder(g,x+a,z+b,.14,.19,4,C.red,y+.4,6);roof(g,x,z,8,2.5,8,C.roof,y+4.4);}
function build(g,s,light){
 if(s.id==='yingkesong'){spire(g,0,0,15,24);spire(g,-12,-4,11,32,C.rockLight);pine(g,4,23,4,1.7,2.2);block(g,6,10,18,.5,6,C.path,18);for(let x=-2;x<=14;x+=4)beam(g,[x,18.5,13],[x,21,13],.13,C.roof);beam(g,[-2,21,13],[14,21,13],.13,C.roof);}
 else if(s.id==='tiandu'){spire(g,0,0,16,57);spire(g,-12,-4,10,36,C.rockLight);for(let i=0;i<22;i++){const a=-2.4+i*.17,r=14-i*.35;block(g,Math.cos(a)*r,Math.sin(a)*r,2.7,.6,2.8,C.path,5+i*2.2);}pine(g,-10,28,-5,.8);}
 else if(s.id==='lianhua'){spire(g,0,0,14,52,C.rockLight);for(let i=0;i<5;i++){const a=i*Math.PI*.4;spire(g,Math.cos(a)*14,Math.sin(a)*11,8,28+(i%3)*6);}pavilion(g,0,0,52);pine(g,9,26,12,.8);}
 else if(s.id==='yungu'){hill(g,0,-10,23,19,11,C.leaf,0);block(g,0,6,25,4,11,C.wall);roof(g,0,6,28,3,14,C.roof,4);block(g,0,11.6,19,2,.2,light,1);for(const x of [-8,8])beam(g,[x,0,-4],[x,13,-4],.6,C.roof);beam(g,[-8,13,-4],[8,13,-4],.5,C.roof);ribbon(g,[[-24,20],[0,19],[23,16]],3,C.path,.2,20);}
 else if(s.id==='guangmingding'){hill(g,0,0,23,20,34,C.rock,0);block(g,0,0,22,1,15,C.path,33);block(g,2,-2,8,5,7,C.wall,34);sphere(g,2,42,-2,4.4,4.4,4.4,C.wall,2);cylinder(g,-5,4,.12,.12,7,C.roof,34,6);block(g,-5,4,3,.2,.6,C.roof,40);pavilion(g,9,7,34);}
 else if(s.id==='feilaishi'){spire(g,0,0,15,30);const rock=sphere(g,0,37,0,5.7,9,4.2,C.rockLight,0);rock.rotation.z=.15;pine(g,-9,23,3,1);block(g,8,9,10,.5,5,C.path,23);}
 else if(s.id==='xihai'){for(const side of [-1,1])for(let i=0;i<4;i++){const x=side*(13+i%2*5),z=-22+i*14;spire(g,x,z,8+i%2*3,24+i%3*9,i%2?C.rock:C.rockLight);}ribbon(g,[[-1,-27],[4,-15],[-2,0],[3,16],[0,28]],2.5,C.path,.2,48);for(let i=0;i<16;i++)block(g,-10,-20+i*3,2,.4,3.4,C.path,10+i*.7);for(let i=0;i<4;i++)pine(g,18,12+i*3,-19+i*14,.7);}
 else if(s.id==='shixin'){for(let i=0;i<3;i++)spire(g,-13+i*13,i%2*6,8,24+i*9);beam(g,[-10,27,3],[13,33,8],1,C.path);pine(g,-13,25,0,1.1,-.5);pine(g,13,42,0,1.2,1.8);}
 else if(s.id==='hongcun'){area(g,[[-25,-19],[22,-19],[26,15],[0,22],[-26,15]],'#b5c4a0',.1);area(g,[[-25,8],[-8,5],[8,7],[26,10],[25,20],[-24,20]],C.water,.3);for(const x of [-15,-5,5,15])for(const z of [-14,-4])house(g,x,z,8,8,4+(x===5?1:0));sphere(g,0,.4,2,8,.1,5,C.water,2);block(g,0,15,2,.4,15,C.path,.5);pavilion(g,0,15,.8);}
 else if(s.id==='xidi'){for(const x of [-17,-7,6,17])for(const z of [-9,4])house(g,x,z,8,8,4+(x>0?1:0));for(const x of [-9,0,9])cylinder(g,x,15,.5,.65,10,C.rockLight,0,6);for(let y=6;y<=10;y+=4){block(g,0,15,22,1.3,2,C.rockLight,y);roof(g,0,15,24,1.8,4,C.roof,y+1.3);}ribbon(g,[[-24,18],[-10,21],[4,22],[25,19]],2,C.water,.2,32);}
 else if(s.id==='tunxi'){ribbon(g,[[-32,16],[-11,16],[10,21],[32,18]],10,C.water,.15,40);block(g,0,0,62,.2,4,C.path,.2);for(let i=0;i<7;i++)for(const side of [-1,1]){house(g,-26+i*8.6,side*7,7.3,8,4+i%2);block(g,-26+i*8.6,side*2.9,3.7,1.2,.15,light,1.8);}for(let i=0;i<7;i++)block(g,22,10+i*2.4,4,.4,2.4,C.path,1+Math.sin(i/6*Math.PI)*2);}
}
export function createHuangshan(){
 const world=createDestination({name:'安徽黄山',bounds:B,seed:3027,groundColor:C.ground,baseColor:'#b4b9a5',regions,overview:{position:[270,225,290],target:[0,15,0]},scopeNote:'这是黄山风景区与徽州聚落的艺术化浏览地图，峰形、方位和跨区县距离均有概括；不表示实时开放状态或登山导航。',minimap:{paths:[{points:[[-183,106],[-70,94],[0,115],[80,134],[180,132]],color:C.water,width:6},{points:[[-160,-80],[-65,-110],[0,-52],[92,-106],[145,10]],color:C.rock,width:4}]}});
 const {group,random}=world;const light=glow('#e9c997','#ffd19b');
 for(let i=0;i<20;i++){const x=-185+random()*370,z=-135+random()*115;if(specs.some(s=>Math.hypot(s.x-x,s.z-z)<36))continue;hill(group,x,z,13+random()*9,10+random()*9,10+random()*15,C.leaf,.05);}
 const trunks=[],crowns=[];for(let i=0;i<210;i++){const x=-192+random()*384,z=-143+random()*285;if(specs.some(s=>Math.hypot(s.x-x,s.z-z)<32))continue;const h=3+random()*4;trunks.push([x,h/2,z,.4,h,.4]);crowns.push([x,h+1,z,2.2,3,2.2]);}instances(group,new THREE.BoxGeometry(1,1,1),mat('#756b55'),trunks);instances(group,new THREE.ConeGeometry(1,1,6),mat(C.leaf),crowns);
 for(const s of specs)world.landmark(s,g=>build(g,s,light));
 const routes=[[[138,12,1],[96,42,-72]], [[-133,8,-43],[-98,34,-75]]];
 routes.forEach(([a,b],i)=>{line(group,[a,b],'#6c6c5d');const car=new THREE.Group();block(car,0,0,3.3,2.7,3,light);roof(car,0,0,3.8,.6,3.4,C.red,2.7);beam(car,[0,3,0],[0,5.5,0],.12,C.roof);group.add(car);world.addMotion(car,t=>{const u=(Math.sin(t*.12+i*Math.PI)+1)/2;car.position.set(THREE.MathUtils.lerp(a[0],b[0],u),THREE.MathUtils.lerp(a[1],b[1],u)-5.5,THREE.MathUtils.lerp(a[2],b[2],u));});});
 return world.finish({cableCars:2});
}

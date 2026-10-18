import * as THREE from 'three';
import { block, cylinder, sphere, area, ribbon, roof, mat } from '../scene-kit.js';
import { createDestination, hill, beam, instances, glow } from '../destination-kit.js';

export const metadata={title:'贵州习水',seal:'习',verse:'赤水绕土城，林深见丹霞。',coordinates:'28.33° N · 106.20° E',terrain:'赤水河谷 · 丹霞森林',intro:'循土城石阶到赤水河，再走进北部林海。',description:'聚焦贵州习水县的土城古镇、红色纪念地、习酒文化城、中国丹霞谷和飞鸽林海。各片区距离经过压缩。',category:'河谷与森林'};
const B={minX:-210,maxX:210,minZ:-155,maxZ:155};
const C={ground:'#b9c5a4',green:'#799870',leaf:'#4c785c',water:'#689f94',rock:'#ac775a',wall:'#dfd3b9',roof:'#5c6860',wood:'#866648',sand:'#c7b28b',red:'#a85642'};
const RIVER=[[-181,-143],[-182,-108],[-175,-61],[-175,-12],[-185,38],[-177,80],[-153,113],[-132,143]];
const specs=[
 {id:'tucheng',name:'土城古镇',x:-111,z:10,zone:'tucheng-history',category:'历史古镇',subtitle:'赤水河畔 · 石阶商埠',description:'土城古镇位于贵州习水县，依赤水河而建。沿坡铺开的青石街巷、商铺与木楼，呈现古镇的盐运商埠记忆。'},
 {id:'sidu-memorial',name:'四渡赤水纪念馆',x:-133,z:-45,zone:'tucheng-history',category:'纪念场馆',subtitle:'土城馆群 · 长征记忆',description:'四渡赤水纪念馆主馆位于习水县土城古镇。模型以青瓦檐口、主入口和前庭空间概括场馆，历史叙事以纪念馆展陈为准。'},
 {id:'qinggangpo',name:'青杠坡战斗遗址',x:-66,z:-84,zone:'tucheng-history',category:'纪念景观',subtitle:'山间纪念碑 · 台阶与林木',description:'青杠坡战斗遗址位于习水县土城一带，是四渡赤水相关的重要纪念地点。山坡、阶梯与纪念碑形成庄重的纪念景观。'},
 {id:'songjiao',name:'宋窖博物馆',x:-99,z:64,zone:'tucheng-history',category:'酒文化博物馆',subtitle:'土城旧窖 · 商埠酿造',description:'宋窖博物馆位于土城，与四渡赤水纪念馆相邻。模型用传统院落、酒坛和窖池意象呈现地方酿造文化；在沙盘中为便于浏览拉开间距。'},
 {id:'tucheng-ferry',name:'土城渡口',x:-174,z:72,zone:'chishui-river',category:'历史渡口',subtitle:'石阶下江 · 赤水河岸',description:'土城渡口是红军四渡赤水战役旧址的组成部分，位于习水县土城镇。此处保留河岸阶梯、渡口纪念碑与木船意象，不表示现行渡运线路。'},
 {id:'xijiu',name:'习酒文化城',x:-105,z:126,zone:'chishui-river',category:'工业文化',subtitle:'习酒镇 · 河谷航船',description:'习酒文化城位于习水县习酒镇，是企业文化博展空间。宽阔的船形建筑轮廓、层叠平台与赤水河谷共同构成这里的景观；它不在仁怀茅台镇。'},
 {id:'danxia-valley',name:'中国丹霞谷',x:36,z:-19,zone:'northern-forest',category:'丹霞峡谷',subtitle:'三岔河镇 · 赤壁绿林',description:'中国丹霞谷位于贵州习水县三岔河镇。红色岩壁、沟谷水流与常绿森林构成景观，它与赤水市的赤水丹霞大瀑布、佛光岩是不同地点。'},
 {id:'feige',name:'飞鸽景区',x:138,z:-89,zone:'northern-forest',category:'森林景观',subtitle:'大坡林海 · 水上公路',description:'飞鸽景区位于习水县北部的大坡一带。高直杉林、水上公路和观景平台体现山地森林风貌；沙盘将北部林区与西南河谷的距离明显压缩。'},
];
export const landmarkIds=specs.map(s=>s.id);
const regions=[
 {id:'tucheng-history',name:'土城记忆',description:'古镇商埠、纪念馆、青杠坡与宋窖，组成土城文化浏览路线。',target:[-105,7,-12],position:[31,150,138],labelPosition:[-108,53,-8]},
 {id:'chishui-river',name:'赤水河谷',description:'从土城渡口到习酒镇，以压缩河谷串联历史渡口和酿造文化。',target:[-141,4,103],position:[8,142,244],labelPosition:[-151,42,104]},
 {id:'northern-forest',name:'丹霞林海',description:'三岔河的中国丹霞谷与北部飞鸽林海，呈现习水的森林和峡谷。',target:[87,9,-54],position:[239,174,105],labelPosition:[90,64,-53]},
];
function house(g,x,z,w=7,d=8,h=4,y=0){block(g,x,z,w,h,d,C.wall,y);roof(g,x,z,w+1,1.9,d+1,C.roof,y+h);block(g,x,z+d/2+.03,1.2,2,.1,C.wood,y+.2);}
function cedar(g,x,z,h=10,y=0){cylinder(g,x,z,.18,.32,h*.6,C.wood,y,6);cylinder(g,x,z,0,h*.2,h*.76,C.leaf,y+h*.3,7);}
function cliff(g,x,z,w,h,d,y=0){const rock=block(g,x,z,w,h,d,C.rock,y);rock.rotation.z=(x>0?-.04:.04);for(let k=0;k<3;k++){block(g,x,z+d/2+.03,w+.2,.35,.08,'#bc9270',y+h*(k+1)/4);}sphere(g,x,y+h,z,w*.54,2.2,d*.56,C.leaf,1);}
function build(g,s,light){
 if(s.id==='tucheng'){for(let j=0;j<3;j++){const y=j*1.6,z=-13+j*12;block(g,0,z,43,1.6,11,C.sand,y);for(const x of[-16,-6,6,16])house(g,x,z,8,8,4+j%2,y+1.6);}for(let i=0;i<12;i++)block(g,0,-23+i*4,3.3,.5,4,C.sand,.5+Math.max(0,i-3)*.4);for(const x of[-19,19])for(const z of[-12,0,12])sphere(g,x,5.5,z,.55,.7,.55,C.red,1);}
 else if(s.id==='sidu-memorial'){block(g,0,0,35,.3,28,C.sand);block(g,0,-5,27,7.5,13,C.wall,.3);roof(g,0,-5,30,3,16,C.roof,7.8);for(const x of[-11,11]){block(g,x,5,7,5,15,C.wall,.3);roof(g,x,5,9,2.2,17,C.roof,5.3);}block(g,0,1.7,11,4,.2,C.wood,.3);block(g,0,2.1,11,1.5,.3,C.red,5.2);for(const x of[-9,-3,3,9])block(g,x,-11.7,2,2.5,.1,light,2);for(let i=0;i<4;i++)block(g,0,13+i*1.3,12,1.2-i*.25,1.4,C.wall);}
 else if(s.id==='qinggangpo'){hill(g,0,-3,27,26,16,C.green,0);for(let i=0;i<20;i++)block(g,0,24-i*1.4,9,(i+1)*.7,1.5,C.wall);block(g,0,-6,15,1.5,13,C.wall,14);block(g,0,-6,4,22,4,C.wall,15.5);block(g,0,-3.95,1.5,9,.1,C.red,23);for(const side of[-1,1])for(let j=0;j<4;j++)cedar(g,side*(13+j%2*4),-18+j*11,7,Math.max(0,8-j*1.3));}
 else if(s.id==='songjiao'){block(g,0,0,32,.4,25,C.sand);house(g,0,-7,28,10,5,.4);for(const x of[-12,12])house(g,x,4,5,18,4,.4);for(const x of[-6,0,6]){cylinder(g,x,7,1.2,1.6,3.1,C.rock,.4,12);cylinder(g,x,7,1.3,1.3,.25,C.wood,3.5,12);}for(const x of[-5,5]){block(g,x,-1,7,.3,5,C.wood,.45);block(g,x,-1,5,.15,3,'#6e5e4c',.76);}block(g,0,-1,2,.1,18,C.sand,.5);}
 else if(s.id==='tucheng-ferry'){for(let i=0;i<8;i++)block(g,5+i*1.8,0,2,1+i*.35,21-i*1.2,C.sand);block(g,16,-9,5,1,5,C.wall,2.8);block(g,16,-9,1.8,9,1.5,C.rock,3.8);block(g,-5,4,11,.55,3,C.wood,.55);for(const x of[-9,-1])for(const z of[3,5])block(g,x,z,.4,1.3,.4,C.wood,.1);}
 else if(s.id==='xijiu'){area(g,[[-30,-10],[23,-10],[32,3],[23,13],[-23,13],[-30,3]],C.wall,.8, .6);for(let i=0;i<4;i++){const w=54-i*7,d=19-i*3;block(g,-i*1.5,0,w,2.3,d,i%2?C.wall:'#c2b89c',.8+i*2.3);block(g,-i*1.5,d/2+.04,w-4,.8,.1,light,1.8+i*2.3);}roof(g,-6,0,32,1.8,12,C.roof,10);for(let i=0;i<5;i++){cylinder(g,-23+i*10,-16,1.3,1.5,2.4,C.rock,0,12);}beam(g,[-28,2,13],[23,2,13],.35,C.wood);}
 else if(s.id==='danxia-valley'){for(const side of[-1,1])for(let i=0;i<3;i++)cliff(g,side*(14+i%2*3),-22+i*20,13,22+i%2*11,15);ribbon(g,[[0,-35],[-4,-18],[3,0],[-3,19],[1,36]],5,C.water,.3,50);ribbon(g,[[-5,-31],[-8,-14],[-5,1],[-9,18],[-5,32]],1.6,C.sand,1.4,40);for(let z=-27;z<=29;z+=8)beam(g,[-9,1.3,z],[-9,3.4,z],.12,C.wood);beam(g,[-12,4,12],[12,4,12],1.8,C.wood);for(const x of[-28,28])for(const z of[-21,0,21])cedar(g,x,z,9);}
 else if(s.id==='feige'){hill(g,-13,-9,27,21,8,C.green,0);hill(g,20,-13,18,23,11,C.green,0);area(g,[[-26,4],[-15,-3],[4,0],[23,-2],[30,9],[17,20],[-11,21],[-28,13]],C.water,.35);ribbon(g,[[-29,13],[-12,10],[2,11],[16,7],[30,9]],3,C.sand,.75,40);for(let i=0;i<16;i++){const x=-27+(i%8)*7.8,z=i<8?-24:-11;cedar(g,x,z,11+(i%3)*3,2);}block(g,20,18,11,.5,8,C.wood,1.5);for(const x of[15,25])for(const z of[15,21])block(g,x,z,.3,2,.3,C.wood,1.5);beam(g,[15,3.5,21],[25,3.5,21],.2,C.wood);}
}
export function createXishui(){
 const world=createDestination({name:'贵州习水',bounds:B,seed:2852,groundColor:C.ground,baseColor:'#a8b196',regions,overview:{position:[285,258,294],target:[0,8,0]},scopeNote:'仅选贵州省遵义市习水县的地标。土城、习酒镇、三岔河与飞鸽林区距离经过压缩；不包含赤水市大瀑布、佛光岩或仁怀茅台镇，不用于导航。',minimap:{paths:[{points:RIVER,color:C.water,width:19},{points:[[-130,120],[-100,35],[-65,-37],[42,-21],[136,-89]],color:C.sand,width:4},{points:[[12,-45],[25,-9],[34,27]],color:C.water,width:4}]}});
 const {group,random}=world,light=glow('#e2bd83','#ffd093');const river=ribbon(group,RIVER,19,C.water,.12,100).curve;
 const roadPoints=[[-81,128],[-60,84],[-34,43],[15,37],[85,24],[139,-33],[174,-64]];const road=ribbon(group,roadPoints,4,C.sand,.21,90).curve;
 for(let i=0;i<23;i++){const x=-51+random()*230,z=-115+random()*230;if(specs.some(s=>Math.hypot(s.x-x,s.z-z)<43))continue;hill(group,x,z,15+random()*15,16+random()*12,9+random()*16,C.green,.1);}
 const trunks=[],crowns=[];for(let i=0;i<430;i++){const x=-198+random()*394,z=-140+random()*280;if(specs.some(s=>Math.hypot(s.x-x,s.z-z)<39)||x<-165||roadPoints.some(([rx,rz])=>Math.hypot(x-rx,z-rz)<12))continue;const h=4+random()*6;trunks.push([x,h*.35,z,.3,h*.7,.3]);crowns.push([x,h*.8,z,h*.2,h,h*.2]);}instances(group,new THREE.BoxGeometry(1,1,1),mat(C.wood),trunks);instances(group,new THREE.ConeGeometry(1,1,7),mat(C.leaf),crowns);
 specs.forEach(s=>world.landmark(s,g=>build(g,s,light)));
 const boat=new THREE.Group();sphere(boat,0,.3,0,1.8,.6,4.3,C.wood,1);block(boat,0,0,2.7,1.6,3.8,C.wall,.5);roof(boat,0,0,3.4,.8,4.6,C.roof,2.1);block(boat,0,2,1.6,.6,.1,light,1.1);group.add(boat);world.addMotion(boat,t=>{const u=(t*.011+.3)%1;boat.position.copy(river.getPoint(u));const v=river.getTangent(u);boat.rotation.y=Math.atan2(v.x,v.z);});
 const car=new THREE.Group();block(car,0,0,2.4,1.4,5,C.red,.1);block(car,0,0,2.1,.8,2.8,light,1.5);group.add(car);world.addMotion(car,t=>{const u=(t*.014+.16)%1;car.position.copy(road.getPoint(u));const v=road.getTangent(u);car.rotation.y=Math.atan2(v.x,v.z);});
 return world.finish({boats:1,cars:1});
}

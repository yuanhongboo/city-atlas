import * as THREE from 'three';
import {block,cylinder,sphere,area,ribbon,line,roof,mat} from '../scene-kit.js';
import {createDestination,hill,beam,instances,glow} from '../destination-kit.js';

export const metadata={title:'温州',seal:'瓯',verse:'一江入海，群峰回望千年商港。',coordinates:'28.00° N · 120.70° E',terrain:'瓯江 · 古港 · 雁山楠水',intro:'把江、山、海放在同一页',description:'从江心双塔和朔门古港出发，向北走进雁荡与楠溪，向东看洞头，向西南看百丈漈。',category:'山江海'};
export const landmarkIds=['jiangxin','shuomen','wuma','nantang','oujiang-bridge','yandang','dalongqiu','nanxi','lishui-street','shiweiyan','dongtou','baizhangji'];
const C={sea:'#75a8ad',river:'#74acaa',land:'#e0e1c8',stone:'#ada88f',sand:'#e6d6ae',roof:'#65736a',green:'#829c71',white:'#f1e9d7',road:'#b8bba4'};
const B={minX:-220,maxX:220,minZ:-150,maxZ:150};
const LAND=[[-219,-149],[219,-149],[219,-86],[179,-54],[166,-17],[146,10],[143,50],[126,78],[138,111],[113,149],[-219,149]];
const RIVER=[[-215,-3],[-160,-9],[-100,-5],[-53,2],[12,-3],[73,-7],[127,-2],[174,-17],[212,-33]];
const NANXI=[[-83,-141],[-92,-112],[-66,-89],[-76,-60],[-56,-35],[-53,2]];
const regions=[{id:'city',name:'瓯江古城',description:'江心双塔、朔门古港与市井街巷',position:[130,151,199],target:[-16,4,40],labelPosition:[-49,3,51]}, {id:'mountains',name:'北部山水',description:'雁荡山与楠溪江的山峰、瀑布和古村',position:[180,190,77],target:[-12,10,-101],labelPosition:[-10,3,-143]}, {id:'outer',name:'山海远行',description:'东侧洞头、西南百丈漈，空间显著压缩',position:[303,300,348],target:[0,8,61],labelPosition:[148,3,132]}];
const defs=[
['jiangxin','江心屿 · 双塔','瓯江孤屿 · 古航标','江心屿位于温州城区北侧瓯江中，双塔是古代航标。这里以东西双塔、寺院与狭长绿岛表现江中地标，两塔造型分别处理。','江中园林','city',-76,-1],
['shuomen','朔门古港遗址','古港码头 · 江岸考古','朔门古港遗址位于瓯江南岸的朔门历史街区，与江心屿隔江相望。模型用码头遗迹、船体轮廓与轻型保护棚表达考古现场，并非现状施工复原。','港口遗址','city',-67,27],
['wuma','五马街','街巷生活 · 五马意象','五马街位于温州老城。石铺步行街、沿街骑楼式店面和原创五马剪影雕塑表达城市日常，建筑和商铺不对应具体经营者。','城市街巷','city',-34,61],
['nantang','南塘风貌街','廊桥灯影 · 沿水长街','南塘街沿塘河展开，水岸步道与传统风貌建筑构成景观。这里以灰瓦白墙、石桥与临水廊柱表现南塘的生活气息。','水岸街区','city',20,105],
['oujiang-bridge','瓯江北口大桥','三塔悬索 · 江口通道','瓯江北口大桥跨越瓯江北口，连接乐清一侧与灵昆岛。三座主塔与双层桥面形成清晰轮廓，江口支汊、桥长与周边岛屿都作了压缩。','跨江桥梁','city',129,-4],
['yandang','雁荡山 · 灵峰','峰壁相依 · 岩间小寺','雁荡山位于温州北部乐清。模型以灵峰一带的陡峭山壁、分开的岩峰和山间小寺提炼山岳景观，峰形为艺术概括。','山岳景观','mountains',110,-106],
['dalongqiu','大龙湫','高壁飞瀑 · 雁荡山水','大龙湫是雁荡山的代表景观。模型用一道高岩壁与细长瀑流落入深潭，近景可以看到溪水向山口流出，落差按沙盘尺度压缩。','山间瀑布','mountains',61,-106],
['nanxi','楠溪江 · 狮子岩','清流竹筏 · 江中双岩','楠溪江位于永嘉，狮子岩景观在楠溪江中游。模型用宽浅河道、江中双岩、竹筏与沿岸林地表现山水关系，河道曲线不是导航数据。','河谷山水','mountains',-67,-79],
['lishui-street','丽水古街','岩头古村 · 临水长廊','丽水古街位于永嘉岩头镇，长廊临水而建。灰瓦木柱、连续廊檐和村口石桥构成这个独立古村节点，与温州老城的南塘街分别呈现。','古村街巷','mountains',-137,-108],
['shiweiyan','石桅岩','独峰如桅 · 峡谷清溪','石桅岩位于楠溪江流域，因峰形似船桅得名。这里以独立高耸岩柱、环绕溪谷与临崖小径表现地形，岩体高度与谷宽经过压缩。','峡谷奇峰','mountains',-10,-114],
['dongtou','洞头 · 望海楼','瓯江口外 · 百岛海风','洞头在瓯江口外东南方向。望海楼、近海岛礁与渔港房屋组成海岛节点，沙盘只选取群岛意象，不逐一呈现实际岛屿。','海岛景观','outer',186,105],
['baizhangji','百丈漈','文成山中 · 三级飞瀑','百丈漈位于文成，瀑布沿高山深壑分级跌落。三段不同高差的水帘、岩壁和水潭形成山水剖面，文成与城区的距离被显著压缩。','山间瀑布','outer',-174,105]
];
function hall(g,x,z,w,d,y=0){block(g,x,z,w,3.8,d,C.white,y);roof(g,x,z,w+2,2,d+2,C.roof,y+3.8);for(const xx of [x-w*.36,x+w*.36])block(g,xx,z+d*.51,.35,3.8,.35,'#8d7358',y);}
function pagoda(g,x,z,levels,color,base=0){for(let i=0;i<levels;i++){const r=3.8-i*.32;cylinder(g,x,z,r*.77,r*.8,2.9,color,base+i*3.5,8);cylinder(g,x,z,r*.7,r+1,.7,C.roof,base+2.9+i*3.5,8);}cylinder(g,x,z,0,.6,2,C.roof,base+levels*3.5,8);}
function waterFall(g,x,z,height,width,base=0){block(g,x,z,width,height,.25,'#b9e1d0',base);for(let i=0;i<5;i++)block(g,x-width*.4+i*width*.2,z+.16,.15,height,.05,'#e5f2dc',base);sphere(g,x,base+.2,z+1,width*.9,.35,2.6,'#b6dacf');}
export function createWenzhou(){
 const d=createDestination({name:'温州',bounds:B,seed:281207,groundColor:C.sea,baseColor:'#c3bca3',regions,overview:{position:[318,317,377],target:[0,4,1]},scopeNote:'瓯江横贯城区、雁荡和楠溪在北、洞头在东南、百丈漈在西南；山海距离和地形比例显著压缩，浏览片区不是行政区。',minimap:{background:C.sea,paths:[{points:LAND,closed:true,color:'#d2d8b6'},{points:RIVER,width:9,color:'#6caaa9'},{points:NANXI,width:4,color:'#6caaa9'},{points:[[130,-38],[129,30]],width:1.6,color:'#f0dfb6'}]}});
 const g=d.group,night=glow('#e9d49a','#ffce7f');area(g,LAND,C.land,.22,.2);ribbon(g,RIVER,23,C.river,.3,160);ribbon(g,NANXI,10,C.river,.31,110);
 const roads=[[[-204,31],[-130,28],[-70,40],[-10,29],[80,28],[124,40]],[[-116,140],[-79,85],[-33,45],[15,19]],[[7,21],[45,62],[67,130]]];roads.forEach(p=>ribbon(g,p,3.8,C.road,.31,80));
 const foliage=[],trunks=[],blocks=[];for(let i=0;i<175;i++){const x=-207+d.random()*342,z=-135+d.random()*269;if(Math.abs(z)<20||defs.some(a=>Math.hypot((x-a[6])/1.1,z-a[7])<26)||NANXI.some(([a,b])=>Math.hypot(a-x,b-z)<14))continue;const s=.7+d.random()*.7;trunks.push([x,1.3,z,.3,2.2,.3]);foliage.push([x,3.1,z,1.6*s,2*s,1.6*s]);}
 for(let i=0;i<62;i++){const x=-125+d.random()*238,z=30+d.random()*105;if(defs.some(a=>Math.hypot(x-a[6],z-a[7])<28))continue;const h=6+d.random()*16;blocks.push([x,.25+h/2,z,5+d.random()*3,h,5+d.random()*3]);}instances(g,new THREE.BoxGeometry(1,1,1),mat('#b7bcac'),blocks);instances(g,new THREE.BoxGeometry(1,1,1),mat('#8e876c'),trunks);instances(g,new THREE.IcosahedronGeometry(1,1),mat(C.green),foliage);
 const draw={
 'jiangxin'(p){area(p,[[-33,-5],[-24,-10],[8,-8],[31,-3],[25,5],[-12,8],[-30,5]],'#a3b786',.45,.2);pagoda(p,-23,0,5,'#bda980',.5);pagoda(p,21,0,4,'#c9b792',.5);sphere(p,21,15.3,0,2.4,2.2,2.2,C.green);hall(p,0,1,17,7,.5);for(const x of [-12,12])sphere(p,x,3.4,-3,2.3,3,2,C.green);},
 'shuomen'(p){block(p,0,0,37,.5,20,'#c5b89b',0);for(let i=0;i<5;i++){block(p,-15+i*7,-4,4.4,.6,11,'#a1977b',.5);for(let j=0;j<4;j++)block(p,-16+i*7,j*2-7,2,.5,1.6,'#b5a889',1.1);}for(const x of [-19,19])for(const z of [-9,9])block(p,x,z,.4,8,.4,'#79918a',.3);roof(p,0,0,41,2.4,23,'#bfcabd',8.3);const hull=sphere(p,1,1.4,6,11,.8,2.5,'#8c7658');block(p,0,11,35,.4,2,C.sand,.2);},
 'wuma'(p){block(p,0,0,10,.25,40,C.sand,.1);for(let i=0;i<5;i++)for(const s of [-1,1]){const x=s*10,z=-16+i*8,h=7+i%2*3;block(p,x,z,8,h,7,['#d8ccb1','#cbb796','#b7b6a5'][i%3],.35);block(p,x,z,8.5,.3,7.5,C.white,h+.35);for(let y=2;y<h;y+=3)block(p,x-s*4.03,z,.08,.8,4.5,night,y);block(p,x-s*3,z,.45,3,.45,C.white,.4);}for(let i=0;i<5;i++){const x=-3+i*1.6,z=5-i*.7;sphere(p,x,2,z,1,.65,.45,'#957c57');beam(p,[x+.6,2.2,z],[x+.9,3.1,z],.45,'#957c57');for(const dx of [-.6,.6])beam(p,[x+dx,1.9,z],[x+dx,.65,z],.2,'#957c57');}},
 'nantang'(p){ribbon(p,[[-28,0],[-9,-4],[11,1],[28,-2]],8,C.river,.28,60);for(let i=0;i<6;i++){const x=-24+i*9;hall(p,x,-10,8,6,.4);block(p,x,-6,8,.2,3,C.sand,.5);for(const xx of [x-3,x+3])block(p,xx,-5,.25,3,.25,'#8e7559',.7);sphere(p,x,2.9,-4,.55,.7,.55,night);}for(const z of [-2,0,2])block(p,4,z,4,.4,3,C.stone,1.8-Math.abs(z)*.22);beam(p,[2,2.8,-5],[2,2.8,5],.16,C.stone);beam(p,[6,2.8,-5],[6,2.8,5],.16,C.stone);},
 'oujiang-bridge'(p){for(const y of [7,10])block(p,0,0,6,1,69,'#aab3aa',y);for(const z of [-27,0,27]){for(const x of [-4.3,4.3])block(p,x,z,2,29,2.4,C.white,.1);block(p,0,z,11,2,2.5,C.white,24);}for(const x of [-4.3,4.3]){const pts=[];for(let z=-34;z<=34;z+=1){const dist=Math.min(Math.abs(z+27),Math.abs(z),Math.abs(z-27));const y=27-12*Math.sin(Math.min(dist,13.5)/13.5*Math.PI/2);pts.push([x,y,z]);if(z%3===0)beam(p,[x,11,z],[x,y,z],.11,C.white);}line(p,pts,C.white);}},
 'yandang'(p){for(const [x,z,rx,h]of [[-13,-1,8,36],[2,0,9,44],[16,-5,7,29]]){const m=cylinder(p,x,z,rx*.45,rx,h,'#a49e84',.1,5);m.rotation.y=x*.05;sphere(p,x,h*.91,z,rx*.7,3,rx*.75,'#859575');}hall(p,1,12,9,5,.4);ribbon(p,[[-22,20],[-8,15],[5,12],[23,7]],2,C.sand,.5,40);},
 'dalongqiu'(p){block(p,0,-3,24,38,8,'#a3a087',0);for(const x of [-13,13])hill(p,x,-3,8,11,30,'#879976',0);waterFall(p,0,1.2,35,2.2,1);cylinder(p,0,7,8,8,.2,C.river,.2,32);ribbon(p,[[0,8],[7,16],[12,23]],3,C.river,.43,35);sphere(p,0,38,-3,12,3,5,'#83966c');},
 'nanxi'(p){area(p,[[-23,-19],[20,-17],[24,18],[-20,21]],'#adc393',.05,.05);ribbon(p,[[0,-22],[8,-9],[-1,5],[5,23]],13,C.river,.15,60);sphere(p,-3,5,0,5,5,3.5,'#9b9e85');sphere(p,6,3,6,2.8,3,2.7,'#8e927b');for(const x of [-18,18])for(const z of [-13,0,13])sphere(p,x,3,z,2.1,2.8,2.2,C.green);},
 'lishui-street'(p){ribbon(p,[[-28,8],[-10,4],[10,6],[28,10]],6,C.river,.1,70);for(let i=0;i<7;i++){const x=-24+i*8,z=-3+Math.cos(i)*1.5;hall(p,x,z,7.5,7,.3);block(p,x,z+5.2,7.5,.25,3,C.sand,.5);for(const xx of [x-3,x+3])block(p,xx,z+6,.24,3,.24,'#80694e',.6);roof(p,x,z+4.7,8,1.2,4,C.roof,3.7);sphere(p,x,3.2,z+6.2,.48,.6,.48,night);}beam(p,[-25,.6,6],[-25,1.8,14],2.5,C.stone);},
 'shiweiyan'(p){cylinder(p,0,0,3,10,46,'#a79d80',.2,5);cylinder(p,1,-1,1,4,8,'#a79d80',46.2,5);hill(p,-14,-10,10,13,17,'#879973',0);hill(p,15,-4,10,15,21,'#7e946c',0);ribbon(p,[[-22,16],[-4,12],[17,19],[24,9]],5,C.river,.2,50);beam(p,[-17,3,7],[-6,4,8],1.1,C.sand);},
 'dongtou'(p){area(p,[[-25,-12],[-14,-24],[7,-22],[25,-5],[24,15],[9,23],[-16,18]],C.land,.4,.3);hill(p,0,-2,15,16,17,'#92a477',.4);for(let i=0;i<3;i++){block(p,0,-2,12-i*2,3.6,10-i*1.2,C.white,17+i*4);roof(p,0,-2,15-i*2,2.2,12-i*1.2,C.roof,20.3+i*4);}for(let i=0;i<4;i++){const x=-16+i*8;hall(p,x,15,6,5,.5);}sphere(p,-24,1,26,2.4,1.5,3,C.stone);sphere(p,22,1,-25,3,2,2.5,C.stone);},
 'baizhangji'(p){for(const [z,h,w]of [[-10,42,24],[2,25,27],[14,11,30]]){block(p,0,z,w,h,10,'#a1a088',0);sphere(p,0,h,z,w*.5,2,5,'#849a73');}waterFall(p,0,-4.8,16,3.3,26);waterFall(p,3,7.2,13,5.2,12);waterFall(p,-1,19.2,10,7,1);cylinder(p,-1,23,10,10,.25,C.river,.2,32);for(const x of [-18,18])hill(p,x,1,8,27,32,'#8b9f78',0);}
 };
 defs.forEach(([id,name,subtitle,description,category,zone,x,z])=>d.landmark({id,name,subtitle,description,category,zone,x,z,baseY:.3},draw[id]));
 const ferry=new THREE.Group();g.add(ferry);sphere(ferry,0,.6,0,2.6,.7,5,C.white);block(ferry,0,0,3.8,1.8,5,'#668f8c',1);block(ferry,0,0,4.2,.2,5.5,C.white,2.8);const route=new THREE.CatmullRomCurve3(RIVER.map(([x,z])=>new THREE.Vector3(x,.4,z+7)));d.addMotion(ferry,t=>{const u=.05+.9*((t*.018+.12)%1);ferry.position.copy(route.getPoint(u));const v=route.getTangent(u);ferry.rotation.y=Math.atan2(v.x,v.z);});
 const raft=new THREE.Group();g.add(raft);for(let x=-1.5;x<=1.5;x+=.6){const b=cylinder(raft,x,0,.28,.28,5,'#afaa6d',0,6);b.rotation.x=Math.PI/2;b.position.y=.35;}cylinder(raft,0,0,.24,.3,1.5,'#a76e52',.5,6);sphere(raft,0,2.25,0,.35,.35,.35,'#d5b787');const rp=new THREE.CatmullRomCurve3(NANXI.slice(0,4).map(([x,z])=>new THREE.Vector3(x,.45,z)));d.addMotion(raft,t=>{const u=(t*.015+.35)%1;raft.position.copy(rp.getPoint(u));const v=rp.getTangent(u);raft.rotation.y=Math.atan2(v.x,v.z);});
 return d.finish({city:'温州',landmarks:12,buildings:blocks.length+43,trees:foliage.length,boats:2});
}

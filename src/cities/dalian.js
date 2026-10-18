import * as THREE from 'three';
import {block,cylinder,sphere,area,ribbon,line,roof,mat} from '../scene-kit.js';
import {createDestination,hill,beam,instances,glow} from '../destination-kit.js';

export const metadata={title:'大连',seal:'连',verse:'海风穿过广场，半岛伸向蔚蓝。',coordinates:'38.92° N · 121.61° E',terrain:'半岛 · 海湾 · 广场',intro:'沿着海岸，慢慢认识一座城',description:'星海湾的跨海大桥、圆形广场的老建筑、旅顺与金石滩的两翼山海，在一张微缩半岛上相遇。',category:'滨海半岛'};
export const landmarkIds=['xinghai-square','xinghai-bridge','zhongshan-square','donggang','bangchuidao','tiger-beach','fisherman-wharf','lianhuashan','lushun-station','baiyushan','jinshitan','heishijiao'];
const C={sea:'#609da9',land:'#e1dfca',stone:'#b9ae97',sand:'#eddbb4',roof:'#8b6250',green:'#7f9871',white:'#f1e9d7',blue:'#678e9c',road:'#b3b5a5'};
const B={minX:-220,maxX:220,minZ:-150,maxZ:150};
const LAND=[[-219,-149],[219,-149],[219,-95],[177,-71],[145,-24],[131,35],[119,58],[88,74],[57,50],[32,36],[-5,44],[-50,64],[-90,61],[-124,43],[-155,70],[-190,55],[-219,20]];
const COAST=LAND.slice(2).concat([LAND[0]]);
const regions=[{id:'core',name:'城市广场',description:'星海、中山广场与东港城市岸线',position:[165,150,158],target:[10,5,-24],labelPosition:[20,3,-72]}, {id:'coast',name:'南岸海湾',description:'跨海大桥、滨海山丘与渔港',position:[166,155,248],target:[17,7,62],labelPosition:[41,3,110]}, {id:'peninsula',name:'两翼山海',description:'西侧旅顺与东北金石滩，距离经过显著压缩',position:[277,295,345],target:[0,5,-35],labelPosition:[-176,4,-65]}];
const defs=[
['xinghai-square','星海广场','椭圆铺地 · 面向星海湾','星海广场位于星海湾岸边。模型用层层椭圆铺地、草坪和面向大海的展开书页意象表现开阔空间，广场尺度作了压缩。','城市广场','core',-65,30],
['xinghai-bridge','星海湾大桥','双塔悬索 · 海上弧线','星海湾大桥位于星海广场南侧海面，桥梁主线大体与岸线平行。这里保留双塔、悬索、双层桥面和弯曲引桥，跨度与岸距为沙盘压缩。','跨海桥梁','coast',-62,103],
['zhongshan-square','中山广场','放射街道 · 环形建筑','中山广场周围分布多座近代建筑。环形草坪、放射状街道、柱廊与穹顶概括广场的城市空间，不逐栋复刻建筑细节。','历史街区','core',20,-43],
['donggang','东港 · 国际会议中心','银色流线 · 海港平台','大连东港是城市东部的重要海滨公共空间。模型以国际会议中心的流线轮廓、临海平台与帆船码头构成港口印象。','现代海滨','core',111,-46],
['bangchuidao','棒棰岛','海中小岛 · 湾岸绿意','棒棰岛在大连东部海岸，近岸小岛与沙滩构成独特的海湾景观。岛体以圆润岩石和矮林概括，近岸距离被压缩。','山海景观','coast',165,28],
['tiger-beach','老虎滩','虎石广场 · 海洋馆','老虎滩位于大连南部海岸。沙盘用原创虎形岩石、海洋馆曲面屋顶和港湾步道提炼景区意象，并不对应实际馆舍内部。','海滨公园','coast',58,42],
['fisherman-wharf','老虎滩渔人码头','彩色坡屋顶 · 渔船入港','渔人码头位于老虎滩渔港。彩色临港房屋、钟塔、小渔船与折线防波堤组成海港街区，岸线和街巷经过概括。','渔港街区','coast',113,76],
['lianhuashan','莲花山观景台','山巅圆亭 · 远眺海湾','莲花山观景台位于城市南部山地，可眺望星海湾。层叠山丘、盘山步道和圆形观景亭表现登高望海的关系，山高不按真实比例。','山顶眺望','coast',-5,8],
['lushun-station','旅顺火车站旧址','绿顶木构 · 铁路记忆','旅顺火车站旧址位于旅顺口，白玉山脚下、旅顺港北侧。绿色尖顶、黄色墙身与站台表现历史车站，轨道仅作铁路记忆示意。','历史建筑','peninsula',-175,25],
['baiyushan','旅顺白玉山','港口之上 · 山塔轮廓','白玉山位于旅顺口，山顶可俯瞰港湾。沙盘以山体、盘山路与塔体轮廓表达地形关系；西侧旅顺与主城区的距离被显著压缩。','山地历史','peninsula',-179,-24],
['jinshitan','金石滩','海蚀石岸 · 北部海湾','金石滩位于大连东北方向，海岸有丰富的地质遗迹。模型以暖色岩层、海蚀拱门与金色沙滩表现滨海地貌，不模拟具体岩层年代。','海岸地质','peninsula',172,-114],
['heishijiao','黑石礁','深色礁岸 · 自然博物馆','黑石礁位于星海湾西侧海岸。低矮深色礁石、沿海步道与博物馆建筑意象组成一段安静的西岸，礁石露出状态为艺术设定。','滨海礁石','coast',-124,52]
];
function facade(g,w,h,d,night){for(let y=2;y<h;y+=2.5)for(let x=-w/2+1;x<w/2;x+=2)block(g,x,d/2+.03,.8,.9,.08,night,y);}
function pavilion(g,x,z,y,r=4){cylinder(g,x,z,r+1,r+1,.5,C.white,y,12);for(let i=0;i<8;i++){const a=i*Math.PI/4;cylinder(g,x+Math.cos(a)*r,z+Math.sin(a)*r,.22,.25,4,C.white,y+.5,6);}cylinder(g,x,z,0,r+1.6,3,'#6d8a79',y+4.5,12);}
export function createDalian(){
 const d=createDestination({name:'大连',bounds:B,seed:381216,groundColor:C.sea,baseColor:'#c0b7a1',regions,overview:{position:[315,315,370],target:[0,4,0]},scopeNote:'保留旅顺在西、金石滩在东北与南部海湾的大体关系，海岸、距离与建筑比例经过艺术压缩；浏览片区不代表行政区。',minimap:{background:C.sea,paths:[{points:LAND,closed:true,color:'#d5d8ba'},{points:[[-143,50],[-133,103],[9,103],[31,38]],width:2.3,color:'#f4dfb2'}]}});
 const g=d.group,night=glow('#e8cf91','#ffce7f');area(g,LAND,C.land,.22,.2);line(g,COAST.map(([x,z])=>[x,.25,z]),'#a2c4b9');
 const road=[[-198,-3],[-149,-16],[-105,-29],[-60,-35],[-15,-51],[20,-43],[71,-63],[132,-69],[173,-84]];ribbon(g,road,5,C.road,.29,120);ribbon(g,[[-144,41],[-99,20],[-61,2],[-5,-19],[57,2],[100,35],[129,33]],3.8,C.road,.3,100);
 const foliage=[],trunks=[],buildings=[];for(let i=0;i<180;i++){const x=-204+d.random()*402,z=-133+d.random()*160;if(defs.some(a=>Math.hypot((x-a[6])/1.2,z-a[7])<24))continue;const s=.6+d.random();trunks.push([x,1.3,z,.35,2.2,.35]);foliage.push([x,3.3,z,1.7*s,2.2*s,1.7*s]);}
 for(let i=0;i<75;i++){const x=-140+d.random()*270,z=-125+d.random()*100;if(defs.some(a=>Math.hypot(x-a[6],z-a[7])<28)||Math.abs(z+45)<7)continue;const h=5+d.random()*15;buildings.push([x,.25+h/2,z,5+d.random()*4,h,5+d.random()*4]);}
 instances(g,new THREE.BoxGeometry(1,1,1),mat('#b5beb1'),buildings);instances(g,new THREE.BoxGeometry(1,1,1),mat('#8b8568'),trunks);instances(g,new THREE.IcosahedronGeometry(1,1),mat(C.green),foliage);
 const draw={
 'xinghai-square'(p){const disc=cylinder(p,0,0,21,21,.35,C.sand,0,64);disc.scale.z=.66;const grass=cylinder(p,0,0,15,15,.14,'#9eaf7d',.36,48);grass.scale.z=.65;for(let a=0;a<Math.PI*2;a+=Math.PI/8)beam(p,[0,.55,0],[Math.sin(a)*20,.55,Math.cos(a)*13],.3,C.white);cylinder(p,0,0,4,4,.12,C.blue,.52,32);for(const s of [-1,1]){const book=block(p,s*6,15,12,.6,11,C.white,1.3);book.rotation.z=s*.24;}for(const x of [-21,21])for(let z=-12;z<14;z+=5)sphere(p,x,2.3,z,1.5,2,1.5,C.green);},
 'xinghai-bridge'(p){for(const y of [6,9])block(p,0,0,146,1.1,6.3,'#a3afb0',y);for(const x of [-39,39]){for(const z of [-4,4])block(p,x,z,2.2,29,2.6,C.white,.1);block(p,x,0,2.4,2,11,C.white,24);block(p,x,0,2.4,1.5,11,C.white,14);}for(const z of [-4,4]){const pts=[];for(let x=-73;x<=73;x+=2){const y=Math.abs(x)<=39?13+14*(x/39)**2:27-(Math.abs(x)-39)*.5;pts.push([x,y,z]);if(x%6===-1||x%6===1)beam(p,[x,10.2,z],[x,y,z],.13,C.white);}line(p,pts,C.white);line(p,[[-73,10.4,z],[73,10.4,z]],'#f4dfb2');}ribbon(g,[[-205,42],[-170,61],[-135,103]],6.3,'#a3afb0',9.2,36);ribbon(g,[[11,103],[21,73],[32,38]],6.3,'#a3afb0',9.2,36);},
 'zhongshan-square'(p){cylinder(p,0,0,19,19,.25,C.road,0,48);cylinder(p,0,0,12,12,.18,'#95ad7e',.26,40);for(let i=0;i<6;i++){const a=i*Math.PI/3,q=new THREE.Group();q.position.set(Math.sin(a)*23,0,Math.cos(a)*23);q.rotation.y=a;p.add(q);block(q,0,0,14,7,7,['#c6ad89','#d1c8ae','#b59c86'][i%3],.25);roof(q,0,0,15,2.2,8,'#7b897d',7.25);for(const x of [-5,-2,2,5])cylinder(q,x,4,.35,.4,5,C.white,.3,8);facade(q,13,7,7,night);if(i%2===0){cylinder(q,0,0,3.2,3.2,3,C.white,9.4,12);sphere(q,0,13,0,3.3,2,3.3,'#668a7e');}beam(p,[Math.sin(a)*14,.55,Math.cos(a)*14],[Math.sin(a)*33,.55,Math.cos(a)*33],2.5,C.road);}},
 'donggang'(p){block(p,0,0,41,.5,29,C.white,0);for(let i=0;i<7;i++){const x=-18+i*6,h=9+8*Math.sin(i/6*Math.PI);sphere(p,x,h*.38,0,7,h*.65,12,'#a1b7b4',2);block(p,x,6,4.8,h*.65,1.2,night,.3);}block(p,0,16,49,.4,4,C.sand,.1);for(let i=0;i<9;i++)cylinder(p,-16+i*4,15,.2,.3,2.1,night,.55,6);},
 'bangchuidao'(p){area(p,[[-18,-9],[-9,-16],[4,-14],[12,-5],[14,9],[5,14],[-11,12]],C.sand,.1,.1);hill(p,0,0,11,7,12,'#78946b',.2);sphere(p,0,4,0,7,4,4,C.green);for(let i=0;i<6;i++)sphere(p,-6+i*2.2,2.2,6,1.4,2.2,1.3,'#92a17a');},
 'tiger-beach'(p){block(p,0,0,33,.4,25,C.sand,0);const body=sphere(p,-6,5,2,7,2.5,2.5,'#b4a17b');sphere(p,-12,7,2,2.7,2.9,2.6,'#b4a17b');for(const x of [-10,-3])for(const z of [.3,3.8])block(p,x,z,1.2,4,1.3,'#b4a17b',.4);for(const z of [.8,3.2])sphere(p,-13,9.2,z,.9,1,.8,'#b4a17b');beam(p,[0,5,2],[4,7,2],.7,'#b4a17b');block(p,8,-6,15,6,12,C.blue,.4);sphere(p,8,6.5,-6,10,3,8,C.white);block(p,8,1,13,2,.1,night,2.5);},
 'fisherman-wharf'(p){area(p,[[-24,-19],[25,-19],[25,10],[17,17],[-23,15]],C.land,.3,.25);for(let i=0;i<5;i++){const x=-18+i*9,h=6+i%3*2;block(p,x,-6,7,h,8,['#d1aa7b','#b4785e','#c8c3a5'][i%3],.3);roof(p,x,-6,8,3,9,'#7a6659',h+.3);for(const z of [-1.9])block(p,x,z,4,1,.1,night,3);}block(p,-15,6,4,15,4,'#a99070',.4);roof(p,-15,6,5,3,5,'#5d7e76',15.4);for(const x of [-10,0,10,20])block(p,x,17,1,.8,13,C.stone,.2);block(p,3,23,38,.8,1.4,C.stone,.1);},
 'lianhuashan'(p){hill(p,0,0,24,21,30,'#879d70',0);pavilion(p,0,0,30,4.2);const path=[];for(let i=0;i<=30;i++){const t=i/30,a=t*Math.PI*3,r=20*(1-t)+3;path.push([Math.cos(a)*r,1+t*29,Math.sin(a)*r]);}line(p,path,C.sand);},
 'lushun-station'(p){block(p,0,0,31,5.5,10,'#d4ba77',.3);roof(p,0,0,33,4,12,'#5d8976',5.8);block(p,2,-1,8,5,8,'#d4ba77',5.5);roof(p,2,-1,10,4,10,'#5d8976',10.5);cylinder(p,2,-1,0,2.4,5,'#5d8976',14.5,8);facade(p,29,5.5,10,night);for(const z of [10,13]){line(p,[[-27,.5,z],[27,.5,z]],'#78887c');for(let x=-26;x<28;x+=3)block(p,x,z,1.2,.1,4,'#8e846a',.35);}},
 'baiyushan'(p){hill(p,0,0,23,21,27,'#83966c',0);cylinder(p,0,0,5,6,2,C.white,27,12);cylinder(p,0,0,2.2,4.5,15,C.white,29,12);cylinder(p,0,0,2.8,2.8,2,'#d6d3bd',44,12);cylinder(p,0,0,0,2.7,4,C.white,46,12);for(let i=0;i<13;i++)block(p,0,10+i,3,.2,1.5,C.sand,23-i*1.5);},
 'jinshitan'(p){area(p,[[-28,-16],[24,-18],[26,16],[4,20],[-25,12]],C.sand,.3,.2);for(let i=0;i<7;i++){const x=-22+i*7,z=-5+Math.sin(i)*8,h=7+i%3*4;block(p,x,z,5,h,6,['#b9a079','#ceba92','#a7997d'][i%3],.3);sphere(p,x,h+1,z,3.5,2.6,3.8,'#c9b083');}block(p,3,9,3,9,5,'#b9a079',.3);block(p,16,9,3,9,5,'#b9a079',.3);beam(p,[3,9,9],[16,9,9],3.5,'#b9a079');},
 'heishijiao'(p){for(let i=0;i<9;i++)sphere(p,-16+i*4,1+i%3*.4,6+Math.sin(i)*4,3.5,1.8,2.8,'#626c62');block(p,-1,-6,24,7,10,'#c2ba9e',.1);block(p,-1,-6,7,3,11,C.white,7.1);sphere(p,-1,11,-6,4,2.5,4,'#809a87');for(const x of [-10,-6,4,8])block(p,x,-.9,.55,6,.4,C.white,.6);facade(p,21,7,10,night);}
 };
 defs.forEach(([id,name,subtitle,description,category,zone,x,z])=>d.landmark({id,name,subtitle,description,category,zone,x,z,baseY:.25},draw[id]));
 const tram=new THREE.Group();g.add(tram);block(tram,0,0,2.9,2.5,7,'#467d6e',.7);block(tram,0,0,3,.3,7.3,C.white,3.2);for(const z of [-2,0,2])for(const x of [-1.47,1.47])block(tram,x,z,.08,1,1.3,night,1.6);const route=new THREE.CatmullRomCurve3(road.map(([x,z])=>new THREE.Vector3(x,.1,z)));d.addMotion(tram,t=>{const u=(t*.019+.17)%1;tram.position.copy(route.getPoint(u));const a=route.getTangent(u);tram.rotation.y=Math.atan2(a.x,a.z);});
 const boat=new THREE.Group();g.add(boat);sphere(boat,0,.5,0,2.3,.7,5,C.white);block(boat,0,0,3,1.8,4,'#6b8e8f',.8);block(boat,0,0,3.4,.25,4.5,C.white,2.6);d.addMotion(boat,t=>{boat.position.set(105+28*Math.sin(t*.035),.1,113+12*Math.cos(t*.035));boat.rotation.y=Math.atan2(28*Math.cos(t*.035),-12*Math.sin(t*.035));});
 return d.finish({city:'大连',landmarks:12,buildings:buildings.length+37,trees:foliage.length,boats:1});
}

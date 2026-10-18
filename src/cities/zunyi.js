import * as THREE from 'three';
import { block, cylinder, sphere, area, ribbon, roof, mat } from '../scene-kit.js';
import { createDestination, hill, beam, instances, glow } from '../destination-kit.js';

export const metadata={title:'遵义',seal:'遵',verse:'湘江穿红城，苍山入远关。',coordinates:'27.70° N · 106.93° E',terrain:'黔北丘陵 · 湘江河谷',intro:'会址与老街相邻，向山间继续漫游。',description:'以遵义老城为中心，串联凤凰山、新蒲湿地、娄山关、海龙屯和播州村寨。山水与街巷经过艺术化压缩。',category:'红城与黔北山水'};
const B={minX:-205,maxX:205,minZ:-160,maxZ:160};
const C={ground:'#d6d3b8',green:'#87a07a',darkgreen:'#587754',river:'#639b98',wall:'#e7ddc7',roof:'#586965',wood:'#846b52',red:'#ae6049',path:'#c5b293',rock:'#9c9c88'};
const RIVER=[[-30,-150],[-20,-110],[5,-63],[13,-10],[48,36],[38,88],[70,150]];
const specs=[
 {id:'meeting-site',name:'遵义会议会址',x:-35,z:4,zone:'old-town',category:'历史建筑',subtitle:'红色记忆 · 两层青瓦楼',description:'遵义会议会址位于遵义老城。模型保留两层砖木结构建筑、连续回廊、青瓦屋面与院落，表现历史建筑的可识别外形。'},
 {id:'hongjun-street',name:'红军街',x:-86,z:26,zone:'old-town',category:'城市街巷',subtitle:'会址旁街市 · 红城烟火',description:'红军街与遵义会议会址相邻，属于遵义·1935街区的组成部分。小尺度商铺、街口牌楼与灯笼构成这段步行街景。'},
 {id:'laosha-lane',name:'捞沙巷',x:-16,z:68,zone:'old-town',category:'美食街巷',subtitle:'窄巷店铺 · 黔北滋味',description:'捞沙巷是遵义老城的传统美食街巷。模型用狭窄巷道、沿街棚檐、低矮商铺和夜间灯光表现街市气氛，具体店铺不作一一对应。'},
 {id:'phoenix-hill',name:'凤凰山',x:36,z:-56,zone:'urban-green',category:'城市山林',subtitle:'城中青山 · 林间步道',description:'凤凰山是遵义城区重要的山林景观。青绿山体、盘山步道与山顶亭阁意象，表现城市环抱山林的关系。'},
 {id:'red-army-hill',name:'红军山',x:34,z:4,zone:'urban-green',category:'纪念景观',subtitle:'山麓陵园 · 碑与阶梯',description:'遵义红军烈士陵园位于城区湘江河畔、凤凰山南麓的小龙山。模型以登山阶梯、纪念碑和碑基圆环概括纪念景观。'},
 {id:'xinpu-wetland',name:'新蒲湿地公园',x:141,z:9,zone:'urban-green',category:'湿地公园',subtitle:'东部新城 · 曲水绿洲',description:'新蒲湿地公园位于遵义东部的新蒲片区。水面、植被岛和曲折栈道，表现新城与湿地共同形成的开放空间。'},
 {id:'loushanguan',name:'娄山关',x:21,z:-127,zone:'northern-passes',category:'山关遗址',subtitle:'苍山如海 · 关口石刻',description:'娄山关位于遵义北部山地，是重要的长征历史地点。模型以两侧山岭、狭窄关道与诗词碑意象表现雄关，不复刻战斗场景。'},
 {id:'hailongtun',name:'海龙屯',x:-128,z:-92,zone:'northern-passes',category:'土司遗址',subtitle:'山城关隘 · 石墙遗迹',description:'海龙屯位于遵义汇川的山地，保存土司城址遗迹。高台、石砌关门和起伏城墙表现其依山筑城的特征，遗址布局经过概括。'},
 {id:'wujiang-village',name:'乌江寨',x:117,z:110,zone:'southern-villages',category:'黔北村寨',subtitle:'播州山水 · 临河吊脚楼',description:'乌江寨位于遵义播州区尚嵇镇。临水木楼、石桥和山间水面构成度假村寨意象；此处与遵义城区的真实距离已压缩。'},
 {id:'gouba',name:'苟坝会议会址',x:-137,z:110,zone:'southern-villages',category:'历史村落',subtitle:'播州乡间 · 院落与田垄',description:'苟坝会议会址位于播州区枫香镇苟坝村。这里用青瓦农家院落、乡间小路和田垄构成历史村落景观，与东侧乌江寨分处不同乡镇。'},
];
export const landmarkIds=specs.map(s=>s.id);
const regions=[
 {id:'old-town',name:'老城街巷',description:'会址、红军街与捞沙巷，连起老城的历史与烟火。',target:[-47,4,30],position:[58,115,167],labelPosition:[-55,42,30]},
 {id:'urban-green',name:'山城绿意',description:'凤凰山、红军山与东部新蒲湿地，是山林和城市水岸的三个片段。',target:[79,10,-10],position:[220,160,150],labelPosition:[93,62,-13]},
 {id:'northern-passes',name:'北部山关',description:'海龙屯的石城与娄山关的峰岭，构成北部山地浏览路线。',target:[-54,15,-112],position:[110,175,32],labelPosition:[-60,71,-110]},
 {id:'southern-villages',name:'播州村寨',description:'西侧苟坝与东侧乌江寨分属不同乡镇，以压缩距离串起乡间景观。',target:[-7,5,111],position:[145,190,275],labelPosition:[-3,41,113]},
];
function house(g,x,z,w,d,h=4,color=C.wall){block(g,x,z,w,h,d,color);roof(g,x,z,w+1,2,d+1,C.roof,h);block(g,x,z+d/2+.03,1.5,2.4,.1,C.wood,.2);}
function trees(g,positions,s=1){for(const [x,z,y=0]of positions){cylinder(g,x,z,.17*s,.23*s,2*s,C.wood,y,5);sphere(g,x,y+3.5*s,z,1.8*s,2*s,1.8*s,C.darkgreen,1);}}
function stairs(g,x,z,width,count,rise=.5,run=1.3){for(let i=0;i<count;i++)block(g,x,z-i*run,width,rise*(i+1),run,C.wall);}
function arch(g,x,z,w=11,h=7,y=0){block(g,x-w/2,z,2,h,4,C.rock,y);block(g,x+w/2,z,2,h,4,C.rock,y);block(g,x,z,w+2,2.2,4,C.rock,y+h-2.2);}
function build(g,s,light){
 if(s.id==='meeting-site'){block(g,0,0,30,.4,25,C.path);block(g,0,-3,24,8,12,'#ccbfaa',.4);roof(g,0,-3,26,3,14,C.roof,8.4);block(g,0,4,25,.4,3,C.wood,4.4);for(let x=-11;x<=11;x+=3.6){block(g,x,5,.28,8,.28,C.wall,.4);for(let y=1;y<=5;y+=4)block(g,x,3.1,1.3,2,.15,light,y);}for(const side of [-1,1])house(g,side*12,9,5,13,3);block(g,0,14,8,1.5,.4,C.red,3.8);}
 else if(s.id==='hongjun-street'){block(g,0,0,38,.2,34,C.path);for(const side of [-1,1])for(let i=0;i<3;i++){house(g,side*12,-10+i*10,12,8,5+i%2);block(g,side*5.8,-10+i*10,.2,1.5,4.8,light,2.3);}for(const x of [-5,5])block(g,x,16,.6,7,.6,C.red);roof(g,0,16,15,2.5,5,C.roof,7);for(let z=-13;z<=14;z+=6)for(const x of [-4,4])sphere(g,x,5,z,.65,.8,.65,C.red,1);}
 else if(s.id==='laosha-lane'){block(g,0,0,36,.15,29,C.path);for(const side of[-1,1])for(let i=0;i<4;i++){const z=-11+i*7.4;house(g,side*10,z,13,6,3.8);block(g,side*3.3,z,3,.3,5,C.red,2.7);block(g,side*4.5,z,1.2,1.3,3,C.wood,.2);block(g,side*3,z,.18,.8,3.8,light,1.7);}for(const x of[-2,2])for(const z of[-8,6]){cylinder(g,x,z,.7,.7,.9,C.wall,0,10);}}
 else if(s.id==='phoenix-hill'){hill(g,0,0,27,25,29,C.green,0);hill(g,-17,-5,15,19,17,C.darkgreen,0);for(let i=0;i<22;i++){const a=-3+i*.24,r=24-i*.9;block(g,Math.cos(a)*r,Math.sin(a)*r,2.5,.35,2.5,C.path,1+i*1.15);}for(const x of[-3,3])for(const z of[-3,3])cylinder(g,x,z,.23,.3,5,C.wood,28,6);roof(g,0,0,11,3,10,C.roof,33);trees(g,[[12,4,12],[-10,6,13],[6,-13,12],[-20,4,6]]);}
 else if(s.id==='red-army-hill'){hill(g,0,-7,23,25,13,C.green,0);stairs(g,0,20,10,21,.55,1.3);cylinder(g,0,-10,11,11,1.2,C.wall,12,32);cylinder(g,0,-10,4,4,1.6,C.path,13.2,12);block(g,0,-10,3.5,20,3.5,C.wall,14.8);const ring=new THREE.Mesh(new THREE.TorusGeometry(7.2,.75,8,36),mat(C.wall));ring.rotation.x=Math.PI/2;ring.position.set(0,18,-10);g.add(ring);sphere(g,0,35,-10,1.5,1.5,.5,C.red,0);trees(g,[[-16,4,3],[16,4,3],[-13,-13,6],[13,-13,6]]);}
 else if(s.id==='xinpu-wetland'){area(g,[[-30,-23],[29,-22],[35,8],[17,24],[-20,25],[-33,5]],C.green,.1);area(g,[[-25,-16],[0,-17],[25,-10],[23,10],[5,19],[-22,10]],C.river,.3);area(g,[[-9,-9],[7,-10],[12,1],[1,9],[-10,4]],'#a8b687',.4);ribbon(g,[[-30,10],[-15,3],[0,2],[17,9],[28,3]],2,C.wood,.9,45);for(let x=-24;x<=24;x+=8)block(g,x,3,.3,.7,.3,C.wood,.2);trees(g,[[-26,-19],[25,-17],[28,16],[-23,19],[0,-5]]);roof(g,-23,14,8,2.5,7,C.roof,4);for(const x of[-26,-20])block(g,x,14,.3,4,.3,C.wood);}
 else if(s.id==='loushanguan'){hill(g,-17,0,22,29,36,C.darkgreen,0);hill(g,17,-5,20,28,43,C.green,0);ribbon(g,[[0,26],[-3,12],[1,0],[-3,-13],[2,-28]],5,C.path,.3,40);const b=block(g,-3,-4,13,11,1.8,'#d7cbb8',2);b.rotation.y=.18;block(g,-3,-2.9,9,6,.1,C.red,5);for(let i=0;i<11;i++)block(g,12,19-i*2.1,2,.5,2.3,C.path,3+i*1.1);trees(g,[[-21,10,11],[22,7,11],[-26,-5,9],[24,-13,13]]);}
 else if(s.id==='hailongtun'){hill(g,0,0,35,29,28,C.darkgreen,0);block(g,0,0,32,1,23,C.rock,24);for(const z of[-12,12]){block(g,0,z,34,4,2,C.rock,25);for(let x=-16;x<=16;x+=4)block(g,x,z,2,1.4,2,C.rock,29);}for(const x of[-17,17])block(g,x,0,2,4,26,C.rock,25);arch(g,0,12,9,8,25);stairs(g,0,31,6,16,1.6,1.2);for(const x of[-8,8])block(g,x,-3,8,.8,9,C.path,25);}
 else if(s.id==='wujiang-village'){hill(g,-16,-7,27,28,14,C.darkgreen,0);hill(g,22,-12,20,23,18,C.green,0);ribbon(g,[[-31,19],[-17,9],[0,8],[17,17],[33,12]],10,C.river,.4,55);for(let i=0;i<6;i++){const x=-25+i*10,z=-4+(i%2)*4,y=5+i%3;for(const dx of[-3,3])for(const dz of[-3,3])block(g,x+dx,z+dz,.4,y,.4,C.wood);block(g,x,z,8,5,8,C.wood,y);roof(g,x,z,9,2,9,C.roof,y+5);block(g,x,z+4.1,6,.8,.12,light,y+2);}for(let i=0;i<9;i++)block(g,5,1+i*2.2,3,.4,2.3,C.path,1+Math.sin(i/8*Math.PI)*2);}
 else if(s.id==='gouba'){block(g,0,0,29,.3,26,C.path);house(g,0,-8,27,11,4.2);for(const x of[-11,11])house(g,x,5,6,17,4.2);block(g,0,12,9,1.3,.4,C.red,3.4);for(let i=0;i<6;i++){block(g,-22+i*8,22,6,.3,11,i%2?'#b9bc7b':'#9da96e',.1);}ribbon(g,[[-31,11],[-18,16],[0,16],[17,11],[29,9]],2,C.path,.5,35);trees(g,[[-22,-9],[22,-9],[-23,4],[24,4]]);}
}
export function createZunyi(){
 const world=createDestination({name:'遵义',bounds:B,seed:1935,groundColor:C.ground,baseColor:'#c2bda4',regions,overview:{position:[274,255,306],target:[0,8,0]},scopeNote:'以遵义老城及周边山关、播州村寨组成浏览片区，并非行政边界；远郊距离、山势与水系均作艺术化压缩，不用于导航。',minimap:{paths:[{points:RIVER,color:C.river,width:13},{points:[[-145,-95],[-40,-45],[-35,30],[-135,110]],color:C.path,width:4},{points:[[20,-125],[35,-50],[143,10],[118,110]],color:C.path,width:4}]}});
 const {group,random}=world,light=glow('#e4bf87','#ffc47d');ribbon(group,RIVER,13,C.river,.1,100);
 for(const z of[-85,46,105]){block(group,z===105?43:10,z,28,.7,6,C.path,.8);for(const x of[-1,9,19])block(group,x,z,1,1.1,1,C.rock,.1);}
 const routes=[[[-181,44],[-115,49],[-80,60],[-65,80],[-120,111]],[[72,-130],[83,-75],[100,-29],[118,-19],[168,-22]]];routes.forEach(p=>ribbon(group,p,4.5,C.path,.2,50));
 for(let i=0;i<14;i++){const x=-185+random()*370,z=-141+random()*282;if(specs.some(s=>Math.hypot(s.x-x,s.z-z)<41)||Math.abs(x-30)<30)continue;hill(group,x,z,16+random()*10,15+random()*9,8+random()*13,C.green,.1);}
 const blocks=[],leaves=[],trunks=[];for(let i=0;i<210;i++){const x=-186+random()*372,z=-141+random()*282;if(specs.some(s=>Math.hypot(s.x-x,s.z-z)<37)||Math.abs(x-(20+z*.2))<19)continue;if(i%3===0){const h=4+random()*9;blocks.push([x,h/2,z,5,h,7]);}else{trunks.push([x,1.3,z,.35,2.6,.35]);leaves.push([x,3.7,z,1.9,2.3,1.9]);}}instances(group,new THREE.BoxGeometry(1,1,1),mat(C.wall),blocks);instances(group,new THREE.BoxGeometry(1,1,1),mat(C.wood),trunks);instances(group,new THREE.IcosahedronGeometry(1,1),mat(C.darkgreen),leaves);
 specs.forEach(s=>world.landmark(s,g=>build(g,s,light)));
 routes.forEach((p,i)=>{const curve=new THREE.CatmullRomCurve3(p.map(([x,z])=>new THREE.Vector3(x,.42,z)));const car=new THREE.Group();block(car,0,0,2.6,1.2,5,i?C.red:'#d7bc75');block(car,0,0,2.2,.8,2.5,light,1.2);group.add(car);world.addMotion(car,t=>{const u=(t*(i?.018:.014)+i*.35)%1;car.position.copy(curve.getPoint(u));const v=curve.getTangent(u);car.rotation.y=Math.atan2(v.x,v.z);});});
 return world.finish({cars:2});
}

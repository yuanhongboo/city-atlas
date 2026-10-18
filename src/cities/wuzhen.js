import * as THREE from 'three';
import { block, cylinder, sphere, area, ribbon, roof, tree, mat } from '../scene-kit.js';
import { createDestination, beam, glow } from '../destination-kit.js';
import { H, house, courtyard, pagoda, archBridge, boat } from '../heritage-kit.js';

export const metadata={title:'乌镇',seal:'乌',verse:'一条河，把屋檐和日子串起来',coordinates:'30.75° N · 120.49° E',terrain:'江南水乡 · 桥梁 · 艺术',intro:'从东栅水阁，摇一叶舟到西栅。',description:'粉墙黛瓦沿河展开，石桥连接两岸；白莲塔、染坊、书院与现代剧院在水边相遇。',category:'江南水乡'};
export const landmarkIds=['dongzha','xizha','water-pavilions','bailian-tower','zhaoming-academy','muxin-museum','indigo-workshop','wuzhen-theatre'];
const westRiver=[[-170,-4],[-131,9],[-91,14],[-58,10],[-16,25],[22,45]];
const eastRiver=[[54,-99],[73,-60],[87,-20],[103,26],[115,58],[122,104]];
const regions=[
  {id:'east-water',name:'东栅人家',description:'沿河街巷与临水水阁',position:[220,155,190],target:[107,5,9],labelPosition:[146,5,44]},
  {id:'west-water',name:'西栅桥影',description:'桥里桥、白莲塔与昭明书院',position:[58,175,178],target:[-91,8,-3],labelPosition:[-114,8,52]},
  {id:'arts',name:'水岸艺文',description:'染坊、木心美术馆与乌镇大剧院',position:[170,151,228],target:[16,6,41],labelPosition:[8,8,110]}
];

export function createWuzhen(){
  const d=createDestination({name:'乌镇',bounds:{minX:-180,maxX:180,minZ:-125,maxZ:140},seed:260103,groundColor:'#d6d7ba',baseColor:'#bbb49d',regions,overview:{position:[323,295,352],target:[0,7,7]},scopeNote:'三个片区用于浏览。东栅在东、西栅在西，河道、景点间距与屋院比例均作艺术化压缩；水阁是沿河建筑类型，沙盘不对应单栋文物测绘。',minimap:{paths:[{points:westRiver,width:5,color:'#84b2a5'},{points:eastRiver,width:5,color:'#84b2a5'},{points:[[-154,-75],[-115,-55],[-67,-62],[-14,-52],[22,-20],[22,45]],width:2,color:'#84b2a5'}]}});
  const {group,landmark,random}=d;
  ribbon(group,westRiver,14,'#84b2a5',.12,110);ribbon(group,eastRiver,15,'#84b2a5',.12,110);
  ribbon(group,[[-154,-75],[-115,-55],[-67,-62],[-14,-52],[22,-20],[22,45]],7,'#8db9aa',.13,95);
  ribbon(group,[[18,44],[41,55],[73,54],[114,58]],11,'#8db9aa',.13,90);
  // Repeated low rooflines leave generous water gaps around the eight destinations.
  for(let i=0;i<11;i++){const x=-158+i*15,z=-88+(i%3)*8;house(group,x,z,10,9,3.5+(i%2),{wall:i%3?'#e4ddc7':'#cbc7ae'});}
  for(let i=0;i<7;i++)house(group,145,-76+i*17,10,11,3.4+(i%3)*.5,{wall:'#e9e1c9'});
  for(let i=0;i<34;i++){const x=-165+random()*310,z=117+random()*13;tree(group,x,z,.8+random()*.7);}
  const add=(id,name,subtitle,description,category,zone,x,z,build,extra={})=>landmark({id,name,subtitle,description,category,zone,x,z,...extra},build);
  add('dongzha','东栅','枕河街巷 · 古戏台','东栅保留了沿河生活与传统街巷的气息。小型戏台、商铺、河埠与石桥围绕河道展开，建筑细节按微缩尺度概括。','水乡街巷','east-water',108,45,g=>{
    for(const s of [-1,1])for(let i=0;i<3;i++)house(g,s*15,-17+i*17,11,12,4.2,{wall:'#e9dfc5'});
    archBridge(g,0,-3,21,3.5);block(g,-16,24,15,.8,9,'#bfb29a');for(const x of [-22,-10])for(const z of [21,27])block(g,x,z,.4,5,.4,H.wood,.8);roof(g,-16,24,17,3,12,H.roof,5.8);block(g,-16,29,13,4,.4,H.wood,1);
  });
  add('xizha','西栅 · 桥里桥','桥影相望 · 曲水两岸','西栅的水系与桥梁相互交织。沙盘用两座相近且方向不同的拱桥表现桥里桥的空间意象，周围是连续的粉墙黛瓦。','水乡桥梁','west-water',-70,12,g=>{
    archBridge(g,-10,0,22,4,Math.PI/2);archBridge(g,12,5,19,3.4,.2);
    for(const [x,z] of [[-25,-19],[-25,19],[12,-20],[27,20]])house(g,x,z,12,11,4.3,{wall:'#e7dfc6'});
    for(const x of [-20,20])block(g,x,-10,3,.3,6,'#c9c0a6');
  });
  add('water-pavilions','东栅水阁','木柱入水 · 屋檐临河','水阁是乌镇沿河建筑的代表性形态。挑出岸边的木楼由细柱支承，木窗和低屋檐贴近水面，体现枕河而居的空间。','传统民居','east-water',88,-24,g=>{
    for(const side of [-1,1])for(let i=0;i<3;i++){const x=side*12,z=-14+i*14;for(const dx of [-4,4])for(const dz of [-5,5])block(g,x+dx,z+dz,.35,2.2,.35,H.wood);house(g,x,z,11,12,4.6,{y:2.2,wall:'#c5b28f'});block(g,x-side*5.6,z,.15,1.2,10,H.wood,2.7);for(let j=0;j<4;j++)block(g,x-side*5.6,z-4+j*2.7,.15,2,.15,H.wood,2.2);}
    archBridge(g,0,24,22,3.4);
  });
  add('bailian-tower','白莲塔','西栅塔影 · 层檐临河','白莲塔位于西栅。高挑的塔身、逐层外挑的屋檐和临水平台在低矮民居之间形成竖向地标。','古塔意象','west-water',-143,-9,g=>{
    block(g,0,0,25,.6,23,'#d3c7aa');pagoda(g,0,0,39,7,{radius:5.6,wall:'#c5ab7d',roof:'#716f59'});for(const x of [-13,13])tree(g,x,-10,1.4);block(g,0,17,25,.5,6,'#c3b89a');
  });
  add('zhaoming-academy','昭明书院','牌坊入院 · 书香与古木','昭明书院位于西栅。入口牌坊、内向院落和庭院树木在这里组合成安静的读书空间，院内布局为艺术化概括。','书院建筑','west-water',-58,-40,g=>{
    courtyard(g,0,0,38,28,{wall:'#e0d6ba',roof:'#646c5d'});for(const x of [-8,8])block(g,x,16,.8,8,.8,'#b6b5a1');block(g,0,16,22,1.2,1,'#c6bea4',6.7);roof(g,0,16,23,1.2,3.8,H.roof,8);block(g,0,16,8,2,.4,'#b0a284',7);tree(g,-6,0,1.7);
  });
  add('muxin-museum','木心美术馆','几何长盒 · 水上留白','木心美术馆位于西栅入口一带。几何体块、浅色墙面与水面倒影构成现代而安静的文化空间；作品和室内布展不在沙盘中复刻。','现代文化','arts',8,64,g=>{
    area(g,[[-30,-15],[27,-17],[29,17],[-26,20]],'#8fb4a7',.14);for(let i=0;i<4;i++){const z=-10+i*7;block(g,-5+i*2,z,44-i*3,5+(i%2)*2,5,'#c3bba3',1);block(g,-5+i*2,z+2.55,40-i*3,.5,.1,glow('#9aa798','#d2d8af'),3);}
    block(g,-15,-22,24,.5,9,'#d7ceb3');beam(g,[-14,.8,-22],[-14,1,-13],2.3,'#b2aa94');
  });
  add('indigo-workshop','草木本色染坊','靛蓝布帘 · 晾晒高架','草木本色染坊位于西栅。高架上垂落的靛蓝布匹、晒场和染缸呈现染织工艺，布面图形为原创抽象纹样。','手工艺','arts',-4,-29,g=>{
    block(g,0,0,36,.2,28,'#d2c3a1');house(g,0,-15,34,8,4.5,{wall:'#d0c3a4'});
    for(const z of [-5,5]){for(const x of [-14,14])block(g,x,z,.3,11,.3,H.wood);beam(g,[-15,11,z],[15,11,z],.3,H.wood);for(let i=0;i<5;i++){const cloth=new THREE.Group();cloth.position.set(-12+i*6,10.7,z);g.add(cloth);block(cloth,0,0,3.8,8,.09,'#526e86',-8);for(let k=0;k<5;k++)sphere(cloth,0,-1.5-k*1.35,.08,.7,.5,.035,'#d5e1d7');if(i===2&&z===5)d.addMotion(cloth,t=>{cloth.rotation.x=Math.sin(t*.8)*.07;});}}
    for(const x of [-12,-6,0,6,12])cylinder(g,x,14,1.6,1.5,2,'#788e86',0,12);
  });
  add('wuzhen-theatre','乌镇大剧院','双生椭圆 · 水岸剧场','乌镇大剧院位于西栅景区入口附近。两个相连的椭圆体量与木色外壳形成独特轮廓，沙盘以密集竖向肋线表达轻盈质感。','戏剧建筑','arts',53,89,g=>{
    block(g,0,0,59,.4,40,'#d5ccb2');
    for(const [x,z,rx,rz,h]of[[-13,0,17,12,13],[15,2,17,14,16]]){sphere(g,x,h*.58,z,rx,h*.62,rz,'#b3a17d',2);for(let i=0;i<30;i++){const a=i*Math.PI*2/30,xx=x+Math.cos(a)*rx*.95,zz=z+Math.sin(a)*rz*.95;beam(g,[xx,2,zz],[x+(xx-x)*.64,h+2,z+(zz-z)*.64],.42,'#d2bd91');}block(g,x,z+rz,17,3,.2,glow('#829c91','#e1d8a8'),1);}
    block(g,0,17,38,.4,7,'#c0b498');
  });
  const boat1=boat(group,'#8c795b'),boat2=boat(group,'#9d8864');
  const path1=new THREE.CatmullRomCurve3(westRiver.slice(1).map(([x,z])=>new THREE.Vector3(x,.3,z))),path2=new THREE.CatmullRomCurve3(eastRiver.slice(1,-1).map(([x,z])=>new THREE.Vector3(x,.3,z)));
  [boat1,boat2].forEach((b,i)=>{const path=i?path2:path1;d.addMotion(b,t=>{const v=(t*.025+i*.5)%2,u=v>1?2-v:v;b.position.copy(path.getPoint(u));const tangent=path.getTangent(u);b.rotation.y=Math.atan2(tangent.x,tangent.z)+(v>1?Math.PI:0);});});
  // Continuous low eaves follow the banks while landmark courtyards remain open.
  group.updateMatrixWorld(true);
  const occupied=group.children.filter(o=>o.userData.landmarkId).map(o=>new THREE.Box3().setFromObject(o).expandByScalar(1.1));
  for(let i=0;i<11;i++){const x=-158+i*15,z=-88+(i%3)*8;occupied.push(new THREE.Box3(new THREE.Vector3(x-6,0,z-5.5),new THREE.Vector3(x+6,8,z+5.5)));}
  for(let i=0;i<7;i++)occupied.push(new THREE.Box3(new THREE.Vector3(139,0,-82+i*17),new THREE.Vector3(151,8,-70+i*17)));
  const channels=[{points:westRiver,width:14},{points:eastRiver,width:15},{points:[[-154,-75],[-115,-55],[-67,-62],[-14,-52],[22,-20],[22,45]],width:7},{points:[[18,44],[41,55],[73,54],[114,58]],width:11}].map(channel=>({...channel,curve:new THREE.CatmullRomCurve3(channel.points.map(([x,z])=>new THREE.Vector3(x,0,z)))}));
  const waterSamples=channels.flatMap(channel=>channel.curve.getPoints(150).map(point=>({point,radius:channel.width/2})));
  let backgroundHomes=0,backgroundTrees=0;
  for(const channel of channels){
    const samples=Math.floor(channel.curve.getLength()/10.7);
    for(const side of [-1,1]){
      const bank=[];
      for(let i=0;i<=60;i++){const p=channel.curve.getPoint(i/60),t=channel.curve.getTangent(i/60),offset=channel.width/2+1.5;bank.push([p.x-t.z*side*offset,p.z+t.x*side*offset]);}
      ribbon(group,bank,1.7,'#c9c0a4',.17,80);
      for(let i=1;i<samples;i++){
        const u=i/samples,p=channel.curve.getPoint(u),t=channel.curve.getTangent(u),offset=channel.width/2+7.2,x=p.x-t.z*side*offset,z=p.z+t.x*side*offset;
        if(backgroundHomes>=68||x<-170||x>170||z<-113||z>108)continue;
        if(occupied.some(b=>x>b.min.x-6.2&&x<b.max.x+6.2&&z>b.min.z-6.2&&z<b.max.z+6.2)||waterSamples.some(({point,radius})=>Math.hypot(point.x-x,point.z-z)<radius+5))continue;
        const home=new THREE.Group();home.position.set(x,0,z);home.rotation.y=Math.atan2(t.x,t.z)+Math.PI/2+(side>0?Math.PI:0);group.add(home);
        house(home,0,0,8.2,6.8,3.4+random()*1.3,{wall:backgroundHomes%3?'#e4ddc7':'#cbc7ae',roof:'#667369'});
        for(const dx of [-3.4,3.4])block(home,dx,4,.18,2.5,.18,H.wood);block(home,0,4,8,.2,1.2,H.wood,2.5);
        occupied.push(new THREE.Box3(new THREE.Vector3(x-5.7,0,z-5.7),new THREE.Vector3(x+5.7,8,z+5.7)));backgroundHomes++;
      }
    }
  }
  for(const channel of channels)for(let i=2;i<24;i+=2){const u=i/24,p=channel.curve.getPoint(u),t=channel.curve.getTangent(u),side=i%4?1:-1,offset=channel.width/2+3.4,x=p.x-t.z*side*offset,z=p.z+t.x*side*offset;
    if(x<-170||x>170||z<-113||z>108||occupied.some(b=>x>b.min.x-1&&x<b.max.x+1&&z>b.min.z-1&&z<b.max.z+1)||waterSamples.some(({point,radius})=>Math.hypot(point.x-x,point.z-z)<radius+.7))continue;
    tree(group,x,z,.65+random()*.25);backgroundTrees++;
  }
  return d.finish({city:'乌镇',landmarks:landmarkIds.length,buildings:47+backgroundHomes,trees:37+backgroundTrees,boats:2});
}

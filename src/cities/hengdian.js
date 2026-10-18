import * as THREE from 'three';
import { block, cylinder, sphere, area, ribbon, roof, tree, line } from '../scene-kit.js';
import { createDestination, hill, beam, glow } from '../destination-kit.js';
import { H, house, courtyard, pagoda, archBridge, boat, mountain } from '../heritage-kit.js';

export const metadata={title:'横店',seal:'影',verse:'走过一道门，换一个时代',coordinates:'29.15° N · 120.32° E',terrain:'影视景区 · 宫苑 · 山林',intro:'从秦汉宫阙走到江南市井，再转进近代街景。',description:'这里呈现横店影视景区的仿建建筑与园区意象，宫殿、街市、游乐水景和山林共同构成一座微缩片场。',category:'影视小镇'};
export const landmarkIds=['qin-palace','ming-qing-palace','qingming-scroll','guangzhou-hongkong','dream-valley','new-yuanming','pingyan','dazhi-temple'];
const avenue=[[-95,-145],[-64,-80],[-20,-25],[0,25],[22,85],[40,156]];
const regions=[
  {id:'palace-scenes',name:'宫阙片场',description:'秦王宫与明清宫苑的不同宫殿语汇',position:[177,240,214],target:[-36,8,-7],labelPosition:[-73,7,-119]},
  {id:'river-scenes',name:'水岸与街市',description:'宋代市井、近代街景与梦幻谷',position:[212,226,244],target:[26,6,30],labelPosition:[103,8,137]},
  {id:'hills-gardens',name:'园林山寺',description:'圆明新园、屏岩洞府与大智禅寺',position:[220,260,275],target:[15,9,13],labelPosition:[149,8,-116]}
];

export function createHengdian(){
  const d=createDestination({name:'横店',bounds:{minX:-185,maxX:190,minZ:-165,maxZ:180},seed:260104,groundColor:'#ced2b3',baseColor:'#bcb49c',regions,overview:{position:[345,320,378],target:[0,10,5]},scopeNote:'展示横店镇的影视景区与园林山寺。秦王宫、明清宫苑、清明上河图、广州街香港街及圆明新园是影视或旅游仿建景区意象；浏览片区按主题组织，园区方位与距离经过压缩，不是原址古建或导航地图。',minimap:{paths:[{points:avenue,width:2,color:'#d8c6a4'},{points:[[-2,48],[13,52],[28,67],[51,75]],width:4,color:'#87b8aa'},{points:[[-169,122],[-153,104],[-129,109],[-119,132],[-151,146]],closed:true,color:'#87b8aa'}]}});
  const {group,landmark,random}=d;ribbon(group,avenue,5,'#d4c7a9',.15,120);
  for(const [x,z,rx,rz,h]of[[-132,-125,38,27,17],[145,-90,36,52,27],[159,-6,27,29,18],[-154,8,26,46,14]])hill(group,x,z,rx,rz,h,'#9eaf89');
  for(let i=0;i<90;i++){const x=-173+random()*348,z=-152+random()*318;if((x<0&&z>20)||(x>0&&z>35)||(z<-40&&x<40)||(x>45&&z<-55))continue;tree(group,x,z,.7+random()*.9);}
  const add=(id,name,subtitle,description,category,zone,x,z,build,extra={})=>landmark({id,name,subtitle,description,category,zone,x,z,...extra},build);
  add('qin-palace','秦王宫','黑石高台 · 影视宫阙','秦王宫是横店为影视拍摄营造的宫殿景区，以秦代宫廷意象展开。巨大台阶、厚重城阙和深色主殿体现庄严尺度，模型不代表真实秦代遗址。','影视仿建','palace-scenes',-62,75,g=>{
    block(g,0,0,69,.4,65,'#b6b39d');for(let i=0;i<7;i++)block(g,0,-8,45-i*3,1.4,36-i*1.8,'#879087',i*1.4);
    block(g,0,-12,29,10,19,'#8a8d7b',9.8);roof(g,0,-12,37,6.5,25,'#53675c',19.8);roof(g,0,-12,32,3.5,21,'#53675c',24);
    for(let i=0;i<15;i++)block(g,0,13-i*1.7,14,.7,2,'#a4a590',i*.62);
    for(const x of [-29,29]){block(g,x,18,9,15,10,'#8f9583');roof(g,x,18,12,3.5,13,'#52675c',15);block(g,x,-12,3,7,38,'#8f9583');}
    for(const x of [-9,-3,3,9])block(g,x,-1,.6,10,.6,'#b3b49a',10);
  });
  add('ming-qing-palace','明清宫苑','红墙金顶 · 影视中轴','明清宫苑以故宫等宫廷建筑为营造参考，是横店影视拍摄园区。红墙、金色屋顶、开阔院落和中轴台阶与秦王宫的深色石阙形成鲜明区别。','影视仿建','palace-scenes',-4,-94,g=>{
    block(g,0,0,80,.4,70,'#d7c6aa');for(const x of [-38,38])block(g,x,0,2,5.5,68,H.red);for(const z of [-33,33])block(g,0,z,77,5.5,2,H.red);
    for(const z of [-20,2,25]){const w=z===-20?37:27;block(g,0,z,w+5,2,15,H.stone);house(g,0,z,w,11,z===-20?7:5.5,{y:2,wall:H.red,roof:'#c8a65d'});for(const x of [-w*.35,w*.35])block(g,x,z+5.6,.5,5,.5,'#d3b477',2);}
    for(const x of [-29,29])for(const z of [-18,6])house(g,x,z,10,17,4,{wall:H.red,roof:'#c8a65d'});
    ribbon(g,[[-33,18],[-10,15],[8,18],[34,17]],2.7,'#88b6a3',.6,50);archBridge(g,0,17,10,3,Math.PI/2,'#dbd5bb');
  });
  add('qingming-scroll','清明上河图','汴河虹桥 · 宋风市井','清明上河图园区以同名画作和宋代市井意象为蓝本，按影视拍摄需要营造。虹桥、沿河商铺和城门在沙盘中组合成一段繁忙水街。','影视仿建','river-scenes',26,63,g=>{
    ribbon(g,[[-29,-15],[-13,-9],[0,0],[23,13],[29,16]],8,'#86b5a6',.15,60);archBridge(g,0,0,24,5,Math.PI/2,'#bca57f');
    for(const [x,z]of[[-19,10],[-4,17],[16,-12],[28,-3],[-26,-23]])house(g,x,z,11,9,5,{wall:'#d8c29d',roof:'#8a8161'});
    block(g,-25,20,7,6,6,'#b9b29a');roof(g,-25,20,12,3,11,H.roof,6);house(g,15,-23,23,10,7,{wall:'#c5ae82',roof:'#8f7954'});roof(g,15,-23,21,2,9,'#8f7954',10);
    const b=boat(g,'#8e7655',.85);d.addMotion(b,t=>{const u=(Math.sin(t*.13)+1)/2;b.position.set(-19+u*39,.3,-12+u*24);b.rotation.y=1.02;});
  });
  add('guangzhou-hongkong','广州街 · 香港街','近代街景 · 片场海港','广州街香港街是横店的近代影视街景园区。连续骑楼、钟楼、仓库与码头表达不同时期的城市意象，模型指向横店片场而非真实广州或香港街区。','影视街景','river-scenes',-101,-62,g=>{
    block(g,0,0,55,.3,49,'#c7baa0');block(g,0,0,6,.1,45,'#a7a997',.35);
    for(let i=0;i<4;i++)for(const side of [-1,1]){const x=side*15,z=-16+i*11,h=8+(i%3)*2;block(g,x,z,17,h,9,['#d5c29b','#bc9f82','#d5cfb3'][i%3]);for(const dx of [-6,-2,2,6])block(g,x+dx,z+4.6,1.3,2,.1,glow('#8fa699','#e4cc93'),h-3);for(const dx of [-6,0,6])block(g,x+dx,z+4.8,.35,3,.35,H.white);block(g,x,z+4.8,17,.4,1,H.white,3.2);block(g,x,z,17.6,.5,9.6,H.white,h);}
    block(g,0,-24,6,22,6,'#b7a486');for(const y of [3,15,20])block(g,0,-24,7,.5,7,H.white,y);cylinder(g,0,-24,0,4.3,5,'#6e7c6c',22,4);sphere(g,0,18,-20.9,1.5,1.5,.08,'#ece2bd');
  });
  add('dream-valley','梦幻谷','游乐夜色 · 山水舞台','梦幻谷是横店的主题游乐园区。彩色旋转设施、水池和山水演艺舞台在沙盘中形成热闹的夜景；设施形态和灯光为主题概括，不对应实际演出安排。','主题游乐','river-scenes',103,119,g=>{
    area(g,[[-29,-16],[9,-23],[29,-2],[24,22],[-18,27]],'#91bfb2',.12);mountain(g,9,-15,22,15,23,{color:'#a18e73'});cylinder(g,9,-15,7,7,1,'#b9a17a',19,16);cylinder(g,9,-15,4,4,.4,glow('#bd8c5f','#f1b763'),20.2,16);
    cylinder(g,-12,4,12,12,.5,'#d6bd8f',.2,24);const ride=new THREE.Group();ride.position.set(-12,.8,4);g.add(ride);cylinder(ride,0,0,.8,1.1,11,H.gold,0,10);cylinder(ride,0,0,0,11,4,'#b58b69',10,16);for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.cos(a)*8,z=Math.sin(a)*8;beam(ride,[0,10,0],[x,10,z],.3,H.gold);beam(ride,[x,10,z],[x,4,z],.12,H.white);block(ride,x,z,2,1,1.5,['#c3846e','#8fae9b','#b6ad76'][i%3],3.2);}d.addMotion(ride,t=>{ride.rotation.y=t*.22;});
    for(let i=0;i<7;i++){const a=i*Math.PI/6;const x=Math.cos(a)*22,z=11+Math.sin(a)*12;cylinder(g,x,z,.16,.25,5,H.wood);sphere(g,x,5,z,.65,.8,.65,glow('#c79766','#f3c876'));}
  });
  add('new-yuanming','圆明新园','园林仿建 · 水岸与柱廊','横店圆明新园是以圆明园为主题的园林仿建景区。这里组合湖岸中式亭阁与西式石柱景观，展示跨风格园林意象，不把仿建景区当作北京原址。','园林仿建','hills-gardens',-140,132,g=>{
    area(g,[[-34,-11],[-20,-27],[9,-25],[26,-10],[20,13],[-3,23],[-28,17]],'#87b5a5',.12);
    block(g,-8,-18,36,.4,9,'#d2c6aa');for(let i=0;i<7;i++){const x=-23+i*5;cylinder(g,x,-18,.5,.65,9,H.white,.4,12);block(g,x,-18,1.7,.5,1.7,H.white,9.4);}block(g,-8,-18,36,1,2.5,H.white,9.9);block(g,-8,-18,11,2,2,H.white,10.9);
    cylinder(g,12,9,7,8,1,H.stone,.2,12);pagoda(g,12,9,11,2,{y:1.2,radius:4,wall:'#c4aa77',roof:'#8a7954'});archBridge(g,-3,11,17,3);tree(g,-27,15,1.5);
  });
  add('pingyan','屏岩洞府','山崖栈道 · 索道凌空','屏岩洞府位于横店镇北部。竖向岩壁、沿崖小殿、栈道和索道构成山林景区意象，线路、高差与建筑数量为缩景表达。','山林景区','hills-gardens',93,-104,g=>{
    for(const [x,z,h]of[[-19,0,43],[2,-7,56],[20,5,41]]){mountain(g,x,z,18,23,h,{color:'#a9aa8e'});block(g,x,z,12,h*.65,11,'#a6a78b');}
    for(let i=0;i<3;i++){const x=-17+i*15,y=17+i*5;block(g,x,17,15,.6,3,H.wood,y);house(g,x,12,9,6,3.5,{y:y+.5,wall:'#d0bf96',roof:'#7e805f'});}beam(g,[-29,18,18],[30,32,18],.4,'#cabd9e');
  },{camera:[199,137,35],target:[95,22,-100]});
  const cable=new THREE.Group();group.add(cable);block(cable,0,0,3.3,3,3.3,'#b7835f');block(cable,0,0,3.4,1.1,3.4,glow('#a4b7a1','#e0d39c'),1.6);beam(cable,[0,3,0],[0,5,0],.15,H.wood);
  const ca=new THREE.Vector3(50,3,-49),cb=new THREE.Vector3(86,27,-85);line(group,[ca.clone().add(new THREE.Vector3(0,5,0)).toArray(),cb.clone().add(new THREE.Vector3(0,5,0)).toArray()],'#89917c');d.addMotion(cable,t=>cable.position.lerpVectors(ca,cb,(1+Math.sin(t*.08))/2));
  add('dazhi-temple','大智禅寺','林间院落 · 梵钟与重檐','大智禅寺位于横店镇南部。山林中的寺院、重檐殿堂与小钟亭构成静谧一隅，与周边影视街景形成不同节奏。','寺院建筑','hills-gardens',148,39,g=>{
    courtyard(g,0,0,43,35,{wall:'#d7bc8b',roof:'#a49463',height:7});roof(g,0,-12,32,3,12,'#a49463',10);house(g,22,10,8,8,4,{wall:'#c7ac7e',roof:'#a49463'});cylinder(g,22,10,1.2,1.7,2,'#988864',2.3,12);for(const x of [-22,22])tree(g,x,-17,1.6);
  });
  return d.finish({city:'横店',landmarks:landmarkIds.length,buildings:49,trees:93,boats:1});
}

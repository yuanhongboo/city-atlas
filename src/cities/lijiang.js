import * as THREE from 'three';
import { block, cylinder, sphere, area, ribbon, roof, tree, line } from '../scene-kit.js';
import { createDestination, hill, beam, glow } from '../destination-kit.js';
import { H, house, courtyard, pagoda, archBridge, mountain, wheel } from '../heritage-kit.js';

export const metadata={title:'丽江',seal:'丽',verse:'雪山在远处，流水过人家',coordinates:'26.87° N · 100.23° E',terrain:'雪山 · 古城 · 纳西村落',intro:'从大研的水巷，走到玉龙雪山脚下。',description:'大研古城与北侧村落沿坝子铺开，白雪、蓝湖、灰瓦与转动的大水车各有自己的轮廓。',category:'雪山古城'};
export const landmarkIds=['dayan','waterwheels','sifang-street','mufu','black-dragon-pool','shuhe','baisha','yulong','blue-moon-valley','yuhu','shizi-hill','wenhai'];
const river=[[90,14],[79,39],[65,68],[65,95],[82,122],[87,165]];
const regions=[
  {id:'old-town',name:'大研水巷',description:'水车、四方街、木府与黑龙潭',position:[198,195,290],target:[43,4,100],labelPosition:[112,7,152]},
  {id:'northern-villages',name:'雪山村落',description:'束河、白沙、玉湖与文海',position:[65,188,136],target:[-52,7,-5],labelPosition:[-133,7,35]},
  {id:'snow-mountain',name:'玉龙蓝月',description:'雪峰、索道与蓝月谷层湖',position:[157,205,53],target:[6,24,-103],labelPosition:[107,6,-130]}
];

export function createLijiang(){
  const d=createDestination({name:'丽江',bounds:{minX:-180,maxX:180,minZ:-170,maxZ:170},seed:260101,groundColor:'#c7cfb0',baseColor:'#b5ad92',regions,overview:{position:[319,318,365],target:[0,16,0]},scopeNote:'三个片区用于漫游。保留雪山在北、大研在南的大体方位；古城巷道、村落间距与山体高度经过压缩，不作导航或文物测绘。',minimap:{paths:[{points:river,width:3,color:H.water},{points:[[-112,-88],[-119,-72],[-99,-65],[-86,-78],[-112,-88]],closed:true,color:H.water},{points:[[65,-130],[90,-105],[92,-76],[72,-58]],width:7,color:'#85c7c4'}]}});
  const {group,landmark,random}=d;
  for(const [x,z,rx,rz,h] of [[-135,-130,40,35,18],[-95,-128,43,38,27],[120,-145,40,25,21],[-137,100,39,50,14]])hill(group,x,z,rx,rz,h,'#98ad8b');
  ribbon(group,river,5.5,H.water,.12,110);
  ribbon(group,[[-115,48],[-65,32],[-15,-5],[20,-55],[43,-89]],3.3,'#d9d0b3',.16,90);
  for(let i=0;i<100;i++){const x=-158+random()*310,z=-155+random()*303;if((x>-50&&z>65)||(x>50&&z<50)||(x<5&&z<-50))continue;tree(group,x,z,.65+random()*.7);}
  const add=(id,name,subtitle,description,category,zone,x,z,build,extra={})=>landmark({id,name,subtitle,description,category,zone,x,z,...extra},build);
  add('dayan','大研古城','灰瓦庭院 · 依水成巷','大研是丽江古城的重要组成部分。沙盘用错落的纳西民居、石巷和穿街水渠表现古城生活，屋院组合是意象化概括。','古城街巷','old-town',118,115,g=>{
    block(g,0,0,51,.25,47,'#c5bca1');
    for(let ix=0;ix<3;ix++)for(let iz=0;iz<3;iz++)if(!(ix===1&&iz===1))house(g,-17+ix*17,-15+iz*15,11,10,4+(ix+iz)%2,{wall:['#d9c6a9','#e4d6bc','#c9b89a'][(ix+iz)%3]});
    block(g,0,0,6,.08,44,'#e5ddc7',.3);for(let i=0;i<5;i++)sphere(g,-3,2,-16+i*8,.65,.8,.65,glow('#c78863','#f0bc76'));
  });
  add('waterwheels','古城大水车','双轮缓转 · 玉河入口','古城入口的大水车与玉河水系相伴。两个木轮缓慢旋转，轴架与水槽保持可辨认的结构，水流和转速为动画示意。','水利意象','old-town',65,68,g=>{
    block(g,0,0,32,.25,20,'#d6ceb3');ribbon(g,[[-14,3],[0,3],[14,3]],4,H.water,.35,30);
    for(const x of [-8,7]){for(const z of [-1,6])beam(g,[x-2,0,z],[x,9,z],.55,H.wood);beam(g,[x,9,-1],[x,9,6],.5,H.wood);}
    const w1=wheel(g,-8,7,2,6),w2=wheel(g,7,8,2,7);d.addMotion(w1,t=>{w1.rotation.z=-t*.13;});d.addMotion(w2,t=>{w2.rotation.z=-t*.11;});
  });
  add('sifang-street','四方街','古城心口 · 石铺广场','四方街位于大研古城核心。四周低矮商铺围合出广场，以铺地、街口与小型集市呈现古城的公共空间。','街巷广场','old-town',29,110,g=>{
    block(g,0,0,36,.22,30,'#d7c6a9');for(const x of [-14,14])for(const z of [-10,0,10])house(g,x,z,7,8,4);
    for(const z of [-12,12])house(g,0,z,14,6,4);for(let i=0;i<12;i++)block(g,-9+(i%4)*6,-5+Math.floor(i/4)*5,2,.03,2,'#b9b59d',.24);
    for(const x of [-8,8]){block(g,x,0,3,1.2,2,'#94795b',.3);roof(g,x,0,4,1.2,3,'#a86b56',3);}
  });
  add('mufu','木府','中轴院落 · 朱柱灰瓦','木府位于大研古城内。沿轴线层层展开的院落、殿阁和石台阶在沙盘中保留秩序感，建筑数量与比例经过概括。','历史建筑','old-town',24,151,g=>{
    courtyard(g,0,0,37,25,{wall:'#c8b092',roof:'#627164',height:8});for(let i=0;i<5;i++)block(g,0,4+i*1.7,8,.35,2,H.stone,1.4-i*.2);
    for(const x of [-8,-4,4,8])block(g,x,-5,.45,6,.45,H.red,1);roof(g,0,-8,26,4,12,H.roof,9);
  });
  add('black-dragon-pool','黑龙潭','潭水映雪 · 石桥与楼阁','黑龙潭位于大研古城北侧，也是丽江古城遗产构成的一部分。这里以清潭、拱桥和临水楼阁表现园林与雪山相望的景观。','园林水景','old-town',91,15,g=>{
    area(g,[[-28,-16],[-9,-23],[19,-17],[28,0],[19,20],[-12,23],[-29,10]],'#7caf9e',.1);archBridge(g,0,1,35,3.6,Math.PI/2,'#d6d0b5');
    house(g,17,-13,11,10,4,{roof:'#74755a'});roof(g,17,-13,13,2,12,'#797458',6);for(const x of [-23,24])tree(g,x,9,1.5);
  });
  add('shuhe','束河古镇','茶马旧道 · 青龙桥','束河位于大研以北、玉龙雪山南麓。青龙桥与沿水民居构成古镇意象，茶马古道的日常生活被浓缩为一段安静水巷。','古镇村落','northern-villages',-111,49,g=>{
    ribbon(g,[[-25,-10],[0,0],[25,12]],6,H.water,.18,45);archBridge(g,0,0,15,4,Math.PI/2);
    for(const x of [-16,16])for(const z of [-17,14])house(g,x,z,11,9,4.5,{wall:'#d0bc9c'});
    block(g,-23,0,6,.25,14,'#d6cfb5');
  });
  add('baisha','白沙古镇','壁画院落 · 雪山脚下','白沙民居建筑群位于大研古城以北，是丽江古城遗产的重要部分。灰墙院落、深色屋顶和壁画展示墙表现古镇文化，画面为原创抽象纹样。','古镇村落','northern-villages',-21,-5,g=>{
    courtyard(g,0,0,34,28,{wall:'#c7bda6',roof:'#6b7566'});block(g,0,-6,19,5,.6,'#c1a482',.4);
    for(let i=0;i<5;i++){sphere(g,-7+i*3.5,3,-5.5,.8,1.2,.06,['#9e6e52','#748a73','#aa955b'][i%3]);}tree(g,22,0,1.7);
  });
  add('yulong','玉龙雪山','群峰连缀 · 白雪与索道','玉龙雪山位于丽江北侧。多个有棱线的雪峰沿山脊展开，索道穿越林线；峰高、坡度与索道线路为微缩展示而压缩。','雪山景观','snow-mountain',-12,-119,g=>{
    for(const [x,z,rx,rz,h] of [[-44,8,27,23,52],[-19,-2,30,30,73],[6,-10,32,29,91],[33,5,25,25,62]])mountain(g,x,z,rx,rz,h,{snow:true,color:'#96a4a0'});
    for(let i=0;i<4;i++)mountain(g,-38+i*24,27,15,13,22,{color:'#7e9780'});
  },{camera:[158,158,25],target:[-10,35,-118],labelY:96});
  const cable=new THREE.Group();group.add(cable);block(cable,0,0,3,3.4,3.2,'#bd775b',0);block(cable,0,0,3.1,1.2,3.3,glow('#a5c6be','#e4e5bf'),1.7);beam(cable,[0,3.4,0],[0,5,0],.15,H.wood);
  const cableA=new THREE.Vector3(33,5,-65),cableB=new THREE.Vector3(-5,55,-115);line(group,[cableA.clone().add(new THREE.Vector3(0,5,0)).toArray(),cableB.clone().add(new THREE.Vector3(0,5,0)).toArray()],'#7e8b79');d.addMotion(cable,t=>{const u=(Math.sin(t*.1)+1)/2;cable.position.lerpVectors(cableA,cableB,u);});
  add('blue-moon-valley','蓝月谷','白水流阶 · 蓝色层湖','蓝月谷在玉龙雪山脚下，由白水河形成层次丰富的水面。沙盘用四段蓝色湖水与浅色跌水表现山谷，湖形与水位作艺术化处理。','山谷湖泊','snow-mountain',95,-91,g=>{
    for(let i=0;i<4;i++){const z=-28+i*18,y=3.3-i*.8;area(g,[[-14,z-7],[10,z-9],[18,z],[7,z+9],[-16,z+6]],['#69b5b2','#77c3c0','#89ceca','#6caeaa'][i],y,.5);block(g,1,z+8,23,.25,1.3,'#e6e4cf',y+.08);for(const x of [-23,24])tree(g,x,z,.9);}
    for(let i=0;i<3;i++)block(g,0,-13+i*18,20,.8,1.5,'#d6e6dc',1.7-i*.45);
  });
  add('yuhu','玉湖村','石屋成聚 · 雪山南麓','玉湖村位于白沙镇、玉龙雪山南麓。沙盘保留石头屋墙、起伏路径与山脚聚落的质感，村落尺度作了浓缩。','传统村落','northern-villages',25,-48,g=>{
    for(const [x,z] of [[-15,-8],[0,-15],[15,-5],[-9,9],[11,12]])house(g,x,z,9,8,4.5,{wall:'#aaa991',roof:'#6b786c'});
    ribbon(g,[[-23,12],[-3,3],[19,-13]],3,'#d9cfb6',.17,40);sphere(g,-1,1.1,7,2.7,1.1,2.2,'#a6ac99');
  });
  add('shizi-hill','狮子山 · 万古楼','古城西望 · 层檐木楼','狮子山在大研古城西侧。树木覆盖的小山托起万古楼的重檐轮廓，登楼俯看古城的空间关系被保留在沙盘中。','山城楼阁','old-town',-25,94,g=>{
    hill(g,0,0,21,21,15,'#8ba278');pagoda(g,0,0,25,5,{y:15,radius:6,wall:'#a98861',roof:'#646b58'});for(let i=0;i<10;i++){const a=i*Math.PI/5;tree(g,Math.cos(a)*16,Math.sin(a)*16,.9,2);}
  });
  add('wenhai','文海','高山草甸 · 湖畔村落','文海是丽江雪山地区的高山湖泊与村落景观。开阔草甸围绕湖水展开，这里保留安静疏朗的尺度，村落和山间距离经过压缩。','高山湖泊','northern-villages',-113,-75,g=>{
    area(g,[[-29,-12],[-13,-23],[15,-16],[25,2],[12,19],[-17,18],[-28,5]],'#9bbb9c',.12);area(g,[[-19,-7],[-8,-15],[13,-10],[17,3],[7,12],[-14,10]],'#7faaa3',.18);
    for(const x of [-19,-5,10])house(g,x,24,7,6,3,{wall:'#cbbd9e'});for(let i=0;i<8;i++)sphere(g,-24+i*6,.55,-23,1,.45,.6,'#e9e2c9');
  });
  // Populate only the southern old-town basin; northern villages stay separate.
  group.updateMatrixWorld(true);
  const occupied=group.children.filter(o=>o.userData.landmarkId).map(o=>new THREE.Box3().setFromObject(o).expandByScalar(1.3));
  const waterCurve=new THREE.CatmullRomCurve3(river.map(([x,z])=>new THREE.Vector3(x,0,z))),waterSamples=waterCurve.getPoints(160);
  const lanes=[[[0,85],[59,85]],[[72,85],[153,85]],[[50,145],[78,145]],[[94,145],[169,145]],[[54,83],[54,166]],[[153,57],[153,165]],[[-2,122],[-2,164]]];
  const laneSamples=lanes.flatMap(points=>new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z))).getPoints(70));
  lanes.forEach(points=>ribbon(group,points,3.2,'#d7cbb0',.16,45));
  let backgroundHomes=0,backgroundTrees=0;
  for(let z=58;z<=162;z+=13)for(let x=-40;x<=170;x+=13){
    const px=x+(random()-.5)*1.5,pz=z+(random()-.5)*1.3,w=7+random()*2,depth=7+random()*1.2;
    if(occupied.some(b=>px>b.min.x-w/2-1&&px<b.max.x+w/2+1&&pz>b.min.z-depth/2-1&&pz<b.max.z+depth/2+1))continue;
    if(waterSamples.some(p=>Math.hypot(p.x-px,p.z-pz)<9)||laneSamples.some(p=>Math.hypot(p.x-px,p.z-pz)<7))continue;
    if(backgroundHomes>=64)continue;
    house(group,px,pz,w,depth,3.2+random()*1.4,{wall:['#d9c6a9','#e4d6bc','#c9b89a'][backgroundHomes%3],roof:'#69776a'});
    occupied.push(new THREE.Box3(new THREE.Vector3(px-w/2-.8,0,pz-depth/2-.8),new THREE.Vector3(px+w/2+.8,8,pz+depth/2+.8)));backgroundHomes++;
  }
  for(let i=15;i<waterSamples.length-6;i+=8){
    const p=waterSamples[i],t=waterCurve.getTangent(i/160),side=i%16?1:-1,x=p.x-t.z*side*6,z=p.z+t.x*side*6;
    if(z<52||occupied.some(b=>x>b.min.x-1&&x<b.max.x+1&&z>b.min.z-1&&z<b.max.z+1)||laneSamples.some(q=>Math.hypot(q.x-x,q.z-z)<2.4))continue;
    tree(group,x,z,.65+random()*.25);backgroundTrees++;
  }
  return d.finish({city:'丽江',landmarks:landmarkIds.length,buildings:51+backgroundHomes,trees:100+backgroundTrees,boats:0});
}

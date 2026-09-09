import * as THREE from 'three';
import { area, block, cylinder, mat, ribbon, rng, tree } from '../scene-kit.js';

// 城市记忆沙盘：东为 +x，南为 +z；保留相对方位，压缩区际距离。
export const CHONGQING_BOUNDS = { minX:-375, maxX:224, minZ:-242, maxZ:240 };
export const DISTRICT_LANDMARKS = [
  {id:'auditorium',zone:'yuzhong',name:'人民大礼堂',subtitle:'圆顶飞檐 · 人民广场',description:'重庆市人民大礼堂位于渝中区人民路一带。大圆顶、层叠檐口与前方开敞广场，是这座中式礼堂鲜明的建筑记忆；沙盘保留主体与两侧翼楼。',x:-72,z:13,baseY:10,category:'文化建筑'},
  {id:'guanyinqiao',zone:'jiangbei',name:'观音桥',subtitle:'步行商圈 · 都市夜色',description:'观音桥是传统江北片区的重要商圈。环形步行广场、商业立面与错落塔楼组成热闹的城市客厅；模型用原创抽象屏幕表现夜间灯光。',x:-25,z:-117,baseY:4,category:'城市商圈'},
  {id:'danzishi',zone:'nanan',name:'弹子石老街',subtitle:'上坡下坎 · 两江对岸',description:'弹子石老街位于南岸，隔江可望朝天门与江北嘴。老街沿坡地层层展开，石阶、院落和临江平台，把开埠记忆与当代街区连在一起。',x:124,z:27,baseY:5,category:'巴渝街巷'},
  {id:'ciqikou',zone:'shapingba',name:'磁器口',subtitle:'古镇石阶 · 嘉陵江岸',description:'磁器口位于沙坪坝的嘉陵江西岸。层叠的坡地院落、青瓦街巷与临江码头，在模型中组成一段向江面下降的古镇。',x:-165,z:-84,baseY:8,category:'古镇街巷'},
  {id:'cqu',zone:'shapingba',name:'重庆大学老校区',subtitle:'沙坪坝老校区 · 学府绿荫',description:'重庆大学的沙坪坝老校区承载山城学府记忆，与中梁山西侧的虎溪校园分开呈现。模型以校门、对称教学楼、开敞草坪与树阵概括老校区空间，建筑体量与道路经过艺术化简化。',x:-162,z:-28,baseY:8,category:'大学校园',related:['cqu-huxi','ciqikou']},
  {id:'university-town',zone:'shapingba',cluster:'university-town',name:'大学城',subtitle:'中梁山西侧 · 校园与街区',description:'中梁山西侧的大学城，林荫道路连接校园、艺术空间与学生街区。这里可一站浏览重大虎溪、川美虎溪和熙街。',x:-274,z:-44,baseY:8,category:'大学城片区',camera:[-180,161,63],target:[-302,8,-74],related:['cqu-huxi','scfai-huxi','xijie']},
  {id:'cqu-huxi',zone:'shapingba',cluster:'university-town',name:'重庆大学虎溪校园',shortName:'重大虎溪',subtitle:'红色图书馆 · 云湖绿荫',description:'红色的 L 形图书馆临云湖展开，教学楼、运动场与绿地组成重大虎溪校园。它位于大学城南路，现属重庆大学科学城校区。',x:-330,z:-35,baseY:8,category:'大学校园',related:['university-town','cqu','scfai-huxi']},
  {id:'scfai-huxi',zone:'shapingba',cluster:'university-town',name:'川美虎溪 · 罗中立美术馆',shortName:'川美虎溪',subtitle:'庭院与梯田 · 彩色美术馆',description:'川美虎溪校园以院落、坡地与艺术空间见长。这里用原创彩色拼片，表现罗中立美术馆鲜明的外墙印象。',x:-330,z:-108,baseY:8,category:'艺术校园',related:['university-town','xijie','huangjueping']},
  {id:'xijie',zone:'shapingba',cluster:'university-town',name:'熙街',subtitle:'大学城步行街 · 校园烟火',description:'熙街连接大学城的校园生活与夜间商业。沿着低层店面慢慢走，广场、咖啡外摆和串灯构成一段学生熟悉的街景。',x:-274,z:-108,baseY:8,category:'生活街区',related:['university-town','scfai-huxi','cqu-huxi']},
  {id:'huangjueping',zone:'jiulongpo',name:'黄桷坪涂鸦街',subtitle:'老街墙面 · 艺术生活',description:'九龙坡黄桷坪一带聚集老街、艺术空间与四川美术学院老校区的记忆。模型用原创彩色几何墙面、街角雕塑和沿街楼房表现涂鸦街，不复刻具体作品。',x:-151,z:108,baseY:8,category:'艺术街区'},
  {id:'zoo',zone:'jiulongpo',name:'重庆动物园',subtitle:'杨家坪绿地 · 熊猫日常',description:'重庆动物园位于九龙坡杨家坪。树荫、园路、动物活动场与熊猫栖架组成一块开放绿地，模型以熊猫主题表现市民熟悉的游园记忆。',x:-181,z:74,baseY:8,category:'公园生态'},
  {id:'industrial-museum',zone:'dadukou',name:'重庆工业博物馆',subtitle:'重钢记忆 · 钢铁构架',description:'重庆工业博物馆位于大渡口，在原重钢厂区留下的工业遗存中展现制造业历史。模型以红砖厂房、钢架、管道与烟囱概括工业景观。',x:-178,z:153,baseY:8,category:'工业文化'},
  {id:'yidu',zone:'dadukou',name:'义渡古镇',subtitle:'渡口旧事 · 临江街巷',description:'大渡口的义渡古镇以渡口文化为线索，毗邻长江。青瓦院落、牌坊、台阶与滨江平台在沙盘里形成一组向水岸展开的街区。',x:-130,z:165,baseY:8,category:'滨江古镇'},
  {id:'jinyun',zone:'beibei',name:'缙云山',subtitle:'山岭林海 · 北碚远眺',description:'缙云山位于北碚一带，是重庆西北方向的山林记忆。层叠山脊、登山小径与山顶亭阁概括其轮廓；相对主城的距离在沙盘中大幅压缩。',x:-202,z:-199,baseY:10,category:'山林风景'},
  {id:'swu',zone:'beibei',name:'西南大学',subtitle:'北碚校园 · 林荫书声',description:'西南大学位于北碚。模型用校门、校园主楼、开阔草坪与林荫路表现其校园空间，并与西侧缙云山共同组成北碚的山林学府记忆。',x:-160,z:-162,baseY:10,category:'大学校园'},
  {id:'central-park',zone:'yubei',name:'中央公园',subtitle:'城市草坪 · 湖岸步道',description:'重庆中央公园位于传统渝北片区。大面积开敞草坪、林带、水景与环形园路构成这片城市公园；周围楼群与江北机场在沙盘中压缩了间距。',x:50,z:-173,baseY:4,category:'城市公园'},
  {id:'airport',zone:'yubei',name:'江北国际机场',subtitle:'航站翼廊 · 山城门户',description:'重庆江北国际机场位于传统渝北片区。模型用航站楼翼廊、机坪、客机和跑道表达航空门户，机场布局和尺度采用示意概括。',x:147,z:-185,baseY:4,category:'交通门户'},
  {id:'longzhouwan',zone:'banan',name:'龙洲湾滨江',subtitle:'长江东岸 · 巴南新城',description:'龙洲湾滨江位于巴南，沿长江展开步道、绿地与城市楼群。模型把临江观景平台、绿带和高层组团放在南向延伸的江岸上。',x:-39,z:176,baseY:5,category:'滨江新城'},
  {id:'nanwenquan',zone:'banan',name:'南温泉',subtitle:'花溪河畔 · 山林温泉',description:'南温泉位于巴南花溪河畔，以山林与温泉休闲著称。模型以坡地林木、院落、汤池与小溪表现环境，温泉设施采用艺术化概括。',x:39,z:204,baseY:5,category:'山林温泉'}
];

export const CHONGQING_REGIONS = [
  {id:'yuzhong',name:'渝中',description:'两江围成的老城半岛：朝天门、洪崖洞、解放碑、人民大礼堂与穿楼列车。',position:[137,139,-143],target:[-8,8,-10],labelPosition:[-24,52,13]},
  {id:'jiangbei',name:'江北',description:'从观音桥的步行商圈，到江北嘴的大剧院；传统江北片区的两种都市表情。',position:[107,119,-188],target:[10,5,-104],labelPosition:[-3,34,-100]},
  {id:'nanan',name:'南岸',description:'在弹子石老街走石阶，再登南山一棵树，隔江望向渝中半岛。',position:[215,118,144],target:[91,9,54],labelPosition:[134,42,75]},
  {id:'shapingba',name:'沙坪坝',description:'从嘉陵江畔的磁器口、重庆大学老校区，越过中梁山，走进大学城的重大虎溪、川美虎溪与熙街。',position:[-79,216,115],target:[-256,8,-72],labelPosition:[-248,46,-159],featuredPlaces:['university-town']},
  {id:'jiulongpo',name:'九龙坡',description:'黄桷坪的街头艺术与杨家坪的动物园，共同组成老城西南的生活记忆。',position:[-35,118,162],target:[-157,8,76],labelPosition:[-165,36,116]},
  {id:'dadukou',name:'大渡口',description:'从重钢厂区留下的工业博物馆，走到义渡古镇与长江水岸。',position:[-49,105,232],target:[-158,8,156],labelPosition:[-173,40,197]},
  {id:'beibei',name:'北碚',description:'西北山林里的缙云山与西南大学；把区际距离压缩后，放在同一座山城沙盘。',position:[-62,129,-79],target:[-177,11,-184],labelPosition:[-197,53,-228]},
  {id:'yubei',name:'渝北',description:'传统渝北片区的中央公园与江北国际机场，连接城市绿地和航空门户。',position:[218,161,-59],target:[98,4,-178],labelPosition:[99,38,-217]},
  {id:'banan',name:'巴南',description:'沿长江向南，在龙洲湾滨江看新城，再转入南温泉的山林水院。',position:[124,134,299],target:[0,7,190],labelPosition:[8,40,234]}
];

const westCap=[[-242,-236],[-145,-236],[-141,-190],[-125,-148],[-132,-95],[-123,-61],[-107,-28],[-110,17],[-132,64],[-134,94],[-120,135],[-111,149],[-109,178],[-111,231],[-242,231]];
// 西部槽谷是独立可承托校园的台地；中梁山位于大学城与老校区之间。
const universityCap=[[-370,-150],[-259,-150],[-242,-135],[-241,3],[-276,17],[-367,12]];
const beibeiCap=[[-238,-234],[-148,-234],[-142,-192],[-130,-158],[-142,-137],[-232,-146]];
const riverPaths=[
  {points:[[-126,-242],[-118,-191],[-101,-132],[-113,-92],[-105,-49],[-65,-47],[-5,-50],[50,-45],[82,-35]],width:24,color:'#79aaa3'},
  {points:[[-88,240],[-88,202],[-89,169],[-100,130],[-112,90],[-102,47],[-60,52],[-10,52],[37,34],[73,1],[103,-31],[153,-59],[224,-90]],width:30,color:'#a5b9a2'}
];
const roadRoutes=[
  [[-302,-141],[-302,-108],[-302,-72],[-302,-35],[-302,5]],
  [[-359,-71],[-330,-71],[-302,-71],[-270,-71],[-243,-71],[-213,-71],[-194,-73],[-175,-77]],
  [[-358,-140],[-331,-140],[-302,-140],[-274,-140],[-250,-135],[-247,-105],[-247,-76],[-247,-44],[-252,-14],[-277,3],[-302,5],[-330,4],[-358,-5]],
  [[-212,-197],[-170,-175],[-169,-143],[-172,-112],[-175,-77],[-179,-30],[-173,19],[-186,69],[-178,116],[-173,158],[-153,199]],
  [[-152,-27],[-126,-17],[-108,-8],[-97,-12]],
  [[-136,106],[-142,126],[-151,138],[-145,167]],
  [[-181,70],[-163,55],[-140,60],[-118,76]],
  [[-86,-216],[-58,-181],[-35,-147],[-23,-119],[-15,-95],[-20,-79]],
  [[-56,-170],[-11,-169],[29,-171],[75,-174],[104,-182],[137,-174],[178,-167]],
  [[14,-140],[43,-117],[71,-91],[95,-87]],
  [[-59,226],[-54,201],[-47,174],[-30,142],[-20,112],[-14,81]],
  [[-47,174],[-11,179],[16,193],[40,198],[75,190],[113,170],[139,135],[144,91],[139,43],[119,20],[101,10]],
  [[88,15],[124,20],[156,-1],[182,-21],[214,-41]]
];

function inside(x,z,points) {let result=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [xi,zi]=points[i],[xj,zj]=points[j];if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi))result=!result;}return result;}
function segmentDistance(x,z,a,b) {const dx=b[0]-a[0],dz=b[1]-a[1],u=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-u*dx,z-a[1]-u*dz);}
function glow(parent,x,z,w,h,d,color,y) {const material=mat(color,{emissive:color,emissiveIntensity:.1,roughness:.55});material.userData.nightGlow=true;const object=block(parent,x,z,w,h,d,material,y);object.userData.nightGlow=true;return object;}

export function createDistrictLayout({peninsula,northland,southland}) {
  // 四周只有同一块连续底座。两江把其上台地自然分开，不代表行政边界。
  const west=[[CHONGQING_BOUNDS.minX,-242],[-139,-242],[-131,-190],[-117,-135],[-127,-93],[-120,-66],[-114,-40],...peninsula,[-124,65],[-127,92],[-113,132],[-104,175],[-103,208],[-102,240],[CHONGQING_BOUNDS.minX,240]];
  const north=[[-113,-242],[224,-242],[224,-105],[188,-91],[148,-71],[115,-59],[102,-58],...northland.slice(3),[-100,-88],[-88,-135],[-106,-192]];
  const south=[...southland.slice(0,9),[130,-25],[171,-44],[224,-75],[224,240],[-73,240],[-73,207],[-73,176],[-86,131],[-96,94],[-92,72]];
  const ground=(x,z)=>inside(x,z,beibeiCap)?10:inside(x,z,universityCap)||inside(x,z,westCap)?8:inside(x,z,west)?4:inside(x,z,north)?4:inside(x,z,south)?5:0;
  const nearRoad=(x,z,radius=4)=>roadRoutes.some(points=>points.slice(1).some((p,i)=>segmentDistance(x,z,points[i],p)<radius));
  const nearLandmark=(x,z,radius=24)=>DISTRICT_LANDMARKS.some(p=>p.cluster==='university-town'?Math.abs(x-p.x)<25&&Math.abs(z-p.z)<22:Math.hypot((x-p.x)*(p.id==='airport'?.65:1),z-p.z)<radius);

  function build(parent) {
    const {minX,maxX,minZ,maxZ}=CHONGQING_BOUNDS,cx=(minX+maxX)/2,cz=(minZ+maxZ)/2,width=maxX-minX,depth=maxZ-minZ;
    block(parent,cx,cz,width,2.5,depth,'#b7ac8b',-4.8);block(parent,cx,cz,width-3,2,depth-3,'#d3c6a6',-2.3);
    area(parent,[[minX,minZ],[maxX,minZ],[maxX,maxZ],[minX,maxZ]],'#a5b9a2',.55,.7);
    // 嘉陵江保持偏碧、长江保持偏黄绿。新的上游与既有核心河道相接。
    area(parent,[[-139,-242],[-131,-190],[-117,-135],[-127,-93],[-120,-66],[-114,-40],[-102,-35],...peninsula.slice(1,9),[80,-28],[102,-29],[102,-58],...northland.slice(3),[-100,-88],[-88,-135],[-106,-192],[-113,-242]],'#79aaa3',.57,0);
    area(parent,west,'#e5dfc9',4,5);area(parent,north,'#dce0c7',4,5);area(parent,south,'#d3d7bd',5,6);
    area(parent,westCap,'#cad0b3',8,4);area(parent,universityCap,'#cbd8b7',8,4);area(parent,beibeiCap,'#bdc9a8',10,2);
    // 远处山脉只提示山城地形与压缩后的距离，不画伪造的分区界线。
    const hills=[[-220,-112,22,27,9],[-219,-23,21,32,13],[-220,43,21,26,10],[-219,102,23,28,12],[-214,180,26,30,9],[-348,-199,18,28,9],[-349,65,19,28,8],[-332,166,31,38,12],[-46,-224,35,13,10],[5,-222,29,14,7],[189,143,21,38,13],[178,204,24,23,10],[105,206,21,21,8]];
    for(const [x,z,rx,rz,h] of hills)for(let level=0;level<4;level++){const points=[];for(let n=0;n<18;n++){const a=n/18*Math.PI*2,s=1-level*.19,wobble=1+Math.sin(n*1.73)*.08;points.push([x+Math.cos(a)*rx*s*wobble,z+Math.sin(a)*rz*s*wobble]);}area(parent,points,level%2?'#8fa47d':'#99ac87',ground(x,z)+(level+1)*h/4,h/4+.2);}
    for(const points of roadRoutes)terrainRoad(parent,points,2.8,ground);
    // 共享绿地与林荫大道连接四个真实街区；道路为沙盘示意，不标运营线路。
    let trees=0;
    area(parent,[[-368,-133],[-358,-133],[-358,-13],[-366,-13]],'#a4bb8e',8.04,.12);
    ribbon(parent,[[-363,-131],[-363,-91],[-363,-50],[-362,-16]],1.25,'#e8dfc2',8.2,60);
    for(let z=-132;z<=-18;z+=10){tree(parent,-366,z,.85,8.18);trees++;}
    for(let z=-135;z<=0;z+=10)if(Math.abs(z+71)>7)for(const x of [-305.6,-298.4]){tree(parent,x,z,.64,8);trees++;}
    for(let x=-354;x<=-247;x+=10)if(Math.abs(x+302)>7)for(const z of [-75.1,-66.9]){tree(parent,x,z,.6,8);trees++;}
    // 两座普通连接桥提示江北、西部城区和南向滨江之间的交通联系。
    ordinaryBridge(parent,[-144,-122],[-62,-122],14,ground);
    ordinaryBridge(parent,[-136,130],[-58,130],14,ground);
    const promenade=[[-77,229],[-77,208],[-77,183],[-84,156],[-94,126],[-103,99]];
    ribbon(parent,promenade,1.35,'#e9e0c5',5.15,90);
    for(const points of [[[-193,-113],[-174,-111],[-146,-104]],[[104,-211],[157,-213],[194,-206]],[[105,53],[146,61],[168,88]]])terrainRoad(parent,points,1.8,ground);
    const random=rng(981746),buildings=[],panels=[],colors=['#d7d5be','#c4ccb7','#e6dfc9','#b8c4b5','#bbc4b8'];
    // 每处地标周围都有独立街区；疏密留白由河谷、道路和山岭决定。
    for(let x=minX+18;x<maxX-14;x+=11.5)for(let z=minZ+20;z<maxZ-13;z+=12.1){
      const px=x+(random()-.5)*3.8,pz=z+(random()-.5)*3.8,base=ground(px,pz);
      if(Math.abs(px)<107&&Math.abs(pz)<105)continue;
      if(!base||nearLandmark(px,pz,24)||nearRoad(px,pz,5)||random()<(px<-243?.72:.46))continue;
      if(px<-357&&pz>-140&&pz<-8)continue;
      if(hills.some(([hx,hz,rx,rz])=>Math.hypot((px-hx)/rx,(pz-hz)/rz)<1.15))continue;
      if(![[-4,-4],[4,-4],[-4,4],[4,4]].every(([dx,dz])=>ground(px+dx,pz+dz)===base))continue;
      const w=4.8+random()*2.6,d=4.6+random()*2.7,h=4.4+random()*10.5;
      buildings.push({x:px,z:pz,base,w,d,h,color:colors[Math.floor(random()*colors.length)]});
      for(let y=base+1.1;y<base+h-.5;y+=2)for(const side of [-1,1])panels.push({x:px,y,z:pz+side*(d/2+.03),w:w*.73,h:.25,d:.05});
    }
    const dummy=new THREE.Object3D(),tint=new THREE.Color();
    const bodies=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat('#d9d9c4'),buildings.length);
    buildings.forEach((p,i)=>{dummy.position.set(p.x,p.base+p.h/2,p.z);dummy.scale.set(p.w,p.h,p.d);dummy.updateMatrix();bodies.setMatrixAt(i,dummy.matrix);bodies.setColorAt(i,tint.set(p.color));});bodies.castShadow=true;bodies.receiveShadow=true;parent.add(bodies);
    const panelMaterial=mat('#b2c7b5',{emissive:'#ffda91',emissiveIntensity:.1});panelMaterial.userData.nightGlow=true;
    const windows=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),panelMaterial,panels.length);windows.userData.nightGlow=true;
    panels.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.w,p.h,p.d);dummy.updateMatrix();windows.setMatrixAt(i,dummy.matrix);});parent.add(windows);
    for(let i=0;i<1130;i++){const x=minX+10+random()*(width-22),z=minZ+10+random()*(depth-22),base=ground(x,z);if(!base||(Math.abs(x)<106&&Math.abs(z)<105)||nearLandmark(x,z,24)||nearRoad(x,z,3.1))continue;if(buildings.some(p=>Math.abs(p.x-x)<p.w/2+1.4&&Math.abs(p.z-z)<p.d/2+1.4))continue;if(hills.some(([hx,hz,rx,rz])=>Math.hypot((x-hx)/rx,(z-hz)/rz)<1.03))continue;tree(parent,x,z,.8+random()*.8,base);trees++;}
    return {buildings:buildings.length,windowPanels:panels.length,trees};
  }
  return {ground,build,paths:[...riverPaths,...roadRoutes.map(points=>({points,width:2.1,color:'#b5b49c'})),{points:[[-144,-122],[-62,-122]],width:2.5,color:'#c49470'},{points:[[-136,130],[-58,130]],width:2.5,color:'#c49470'}]};
}

function terrainRoad(parent,points,width,ground) {
  const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z))),vertices=[],indices=[];
  for(let i=0;i<=110;i++){const p=curve.getPoint(i/110),t=curve.getTangent(i/110),nx=-t.z*width/2,nz=t.x*width/2,y=ground(p.x,p.z)+.12;vertices.push(p.x+nx,y,p.z+nz,p.x-nx,y,p.z-nz);if(i<110){const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,mat('#c3bdab',{side:THREE.DoubleSide}));mesh.receiveShadow=true;parent.add(mesh);
}
function ordinaryBridge(parent,a,b,deckY,ground) {
  const span=Math.hypot(b[0]-a[0],b[1]-a[1]),g=new THREE.Group();g.position.set((a[0]+b[0])/2,deckY,(a[1]+b[1])/2);g.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]);parent.add(g);
  block(g,0,0,4.8,.9,span,'#ad9274',-.9);for(const side of [-1,1]){block(g,side*2.25,0,.15,.65,span,'#e4d9b8',.08);glow(g,side*2.25,0,.06,.06,span,'#ffd998',.66);}
  for(const u of [.19,.38,.62,.81]){const x=a[0]+(b[0]-a[0])*u,z=a[1]+(b[1]-a[1])*u,base=ground(x,z);cylinder(parent,x,z,.72,1.02,deckY-base-.85,'#c4b99b',base,8);}
  // 缓坡接入两端台地，桥面不悬空终止于街区。
  const vx=(b[0]-a[0])/span,vz=(b[1]-a[1])/span;
  for(const [p,sign] of [[a,-1],[b,1]]){const outer=[p[0]+vx*sign*18,p[1]+vz*sign*18],y=ground(...outer)+.18,v=[p[0]-vz*2.4,deckY,p[1]+vx*2.4,p[0]+vz*2.4,deckY,p[1]-vx*2.4,outer[0]-vz*2.4,y,outer[1]+vx*2.4,outer[0]+vz*2.4,y,outer[1]-vx*2.4];const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex([0,2,1,1,2,3]);geo.computeVertexNormals();parent.add(new THREE.Mesh(geo,mat('#c3bdab',{side:THREE.DoubleSide})));}
}

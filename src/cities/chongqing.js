import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { block, cylinder, sphere, area, ribbon, tree, line, roof, rng, mat } from '../scene-kit.js';
import { CHONGQING_BOUNDS, CHONGQING_REGIONS, DISTRICT_LANDMARKS, createDistrictLayout } from './chongqing-district-layout.js';
import { buildDistrictLandmark } from './chongqing-district-landmarks.js';
import { buildUniversityTownLandmark } from './chongqing-university-town.js';

// A deliberately compressed architectural model. x=east, z=south; not a routing map.
const C = { stone:'#e5dfc9', road:'#c3bbab', soil:'#b5ab91', cliff:'#aaa184', green:'#6f9368', glass:'#466e72', glassLight:'#93b8b0', water:'#79aaa3', yangtze:'#a5b9a2', red:'#b84732', copper:'#a26648', glow:'#ffd799' };
const peninsula = [[-102,-35],[-76,-34],[-50,-29],[-24,-30],[0,-33],[25,-35],[48,-32],[67,-25],[74,-20],[60,-6],[45,10],[20,28],[-10,38],[-35,43],[-70,37],[-102,22]];
const northland = [[-102,-102],[102,-102],[102,-58],[82,-55],[61,-56],[43,-61],[18,-66],[-5,-67],[-35,-62],[-65,-58],[-102,-60]];
const southland = [[-102,58],[-70,67],[-35,71],[0,65],[25,56],[50,40],[70,20],[88,0],[102,-7],[102,102],[-102,102]];
const highland = [[-99,-26],[-75,-23],[-51,-19],[-30,-20],[-16,-14],[-9,2],[-23,23],[-45,30],[-77,23],[-99,9]];
const midland = [[-102,-29],[-76,-27],[-49,-22],[-23,-23],[4,-25],[21,-26],[34,-19],[32,-2],[13,18],[-13,30],[-38,36],[-74,30],[-102,15]];
const districtLayout=createDistrictLayout({peninsula,northland,southland});
function inside(x,z,points) { let yes=false; for(let i=0,j=points.length-1;i<points.length;j=i++) { const [xi,zi]=points[i], [xj,zj]=points[j]; if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi)) yes=!yes; } return yes; }
function ground(x,z) { return inside(x,z,highland)?10:inside(x,z,midland)?7:inside(x,z,peninsula)?4:inside(x,z,northland)?4:inside(x,z,southland)?5:districtLayout.ground(x,z); }
function beam(parent,a,b,width,color,depth=width) { const v1=new THREE.Vector3(...a),v2=new THREE.Vector3(...b); const m=new THREE.Mesh(new THREE.BoxGeometry(width,v1.distanceTo(v2),depth),mat(color)); m.position.copy(v1).add(v2).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v2.sub(v1).normalize()); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m; }
function glow(parent,x,y,z,w,h,d,color=C.glow) { const m=block(parent,x,z,w,h,d,color,y-h/2); m.material=mat(color,{emissive:color,emissiveIntensity:.1,roughness:.55}); m.material.userData.nightGlow=true; m.userData.nightGlow=true; return m; }
function terrace(parent,poly,height,color) { area(parent,poly,color,height,height+1); }
function curvedFacade(parent,x,z,w,h,d,base=4) {
  const g=new THREE.Group(); g.position.set(x,base,z); parent.add(g);
  const s=new THREE.Shape(); s.moveTo(-w/2,0); s.lineTo(w/2,0); s.lineTo(w/2,h*.8); s.quadraticCurveTo(w/2,h*.95,w*.07,h+1.2); s.lineTo(-w*.32,h+.6); s.quadraticCurveTo(-w/2,h*.85,-w/2,0);
  const body=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSegments:1,bevelSize:.13,bevelThickness:.13,curveSegments:5}),mat(C.glass,{roughness:.34,metalness:.28})); body.position.z=-d/2; body.castShadow=true; g.add(body);
  for(let y=1.1;y<h;y+=1.35) { const taper=y>h*.83?1-(y/h-.83)*1.2:1; for(const zz of [-d/2-.05,d/2+.05]) glow(g,0,y,zz,w*taper,.10,.07,'#b4c8b9'); }
  for(const xx of [-w*.37,0,w*.35]) for(const zz of [-d/2-.10,d/2+.1]) beam(g,[xx,0,zz],[xx,h*.91,zz],.075,'#dedcca');
  for(let y=2;y<h*.9;y+=2.7) for(const side of [-1,1]) glow(g,side*(w/2+.04),y,0,.05,.2,d*.79,'#b7cebf');
  return g;
}
function buildRaffles(parent) {
  const g=new THREE.Group(); parent.add(g);
  area(g,[[36,-24],[52,-30],[65,-24],[71,-19],[58,-4],[36,5],[30,-3]],'#c7c5ad',4.2,1.7);
  for(let j=0;j<4;j++) block(g,43+j*7,-13,6.8,2.6,14,'#e2decb',4.2);
  // Four principal supporting towers, two northern taller towers, two southern towers.
  for(const x of [38,46,54,62]) curvedFacade(g,x,-13,4.9,28,5.5,6.8);
  curvedFacade(g,48,-24,4.6,39,5.1,4.4); curvedFacade(g,59,-22,4.6,39,5.1,4.4);
  curvedFacade(g,38,-1,4.7,28,5,5.8); curvedFacade(g,48,-3,4.7,28,5,5.8);
  const crystal=new THREE.Mesh(new THREE.CylinderGeometry(2.05,2.05,34,16,1),mat('#a8c5b8',{metalness:.18,roughness:.23})); crystal.rotation.z=Math.PI/2; crystal.position.set(50,36.2,-13); crystal.scale.z=1.4; crystal.castShadow=true; g.add(crystal);
  for(let x=33;x<=67;x+=1.45) { const ring=new THREE.Mesh(new THREE.TorusGeometry(2.09,.075,5,18),mat('#ece7d4')); ring.rotation.y=Math.PI/2; ring.scale.x=1.4; ring.position.set(x,36.2,-13); g.add(ring); }
  for(const z of [-15.86,-10.14]) glow(g,50,36,z,34,.14,.12,'#ffdca6');
  beam(g,[48,36.2,-23],[48,36.2,-13],.8,'#e6dfc7',1); beam(g,[59,36.2,-21],[59,36.2,-13],.8,'#e6dfc7',1);
  for(let x=36;x<67;x+=3.3) tree(g,x,-6.1,.55,7);
  // Chaotianmen's stepped promontory descends to the confluence.
  for(let i=0;i<6;i++) area(g,[[64+i*.75,-22+i*.25],[72+i*.2,-20],[65+i*.5,-12-i*.6]],'#e5dfc7',3.8-i*.45,.48);
  for(let j=0;j<4;j++) glow(g,69+j*.6,1.7+j*.45,-18-j*.3,3.3,.11,.13);
}
function buildHongya(parent) {
  const g=new THREE.Group(); g.position.set(7,0,-31); parent.add(g);
  // Four clusters of wooden stilt houses descend the river cliff.
  for(let cluster=0;cluster<5;cluster++) {
    const x=(cluster-2)*5.6,levels=cluster===2?5:cluster%2===0?4:3;
    for(let floor=0;floor<levels;floor++) {
      const y=2.1+floor*2.65,depth=4.3+(levels-floor)*.45,z=-floor*.25;
      block(g,x,z,5.1,2.15,depth,cluster%2?'#b8784c':'#ae683f',y);
      for(const xx of [-2.08,-.69,.69,2.08]) for(const zz of [-depth/2-.07,depth/2+.07]) beam(g,[x+xx,y,zz+z],[x+xx,y+2.15,zz+z],.15,'#684739');
      block(g,x,z-depth/2-.25,5.5,.21,.66,'#825542',y+.15);
      for(let xx=-2;xx<=2;xx+=.67) glow(g,x+xx,y+1.25,z-depth/2-.12,.42,.91,.07,'#ffcb6f');
      roof(g,x,z,5.9,.92,depth+1.15,'#785546',y+2.06);
      for(const side of [-1,1]) glow(g,x+side*2.75,y+2.22,z-depth/2-.3,.18,.31,.18,'#ffa43d');
    }
    for(const xx of [-1.9,1.9]) beam(g,[x+xx,.7,-2.35],[x+xx,3,-2.35],.26,'#79553f');
  }
  block(g,0,-4.5,31,.35,2.3,'#d9c59e',1.2);
  for(let x=-15;x<=15;x+=1.5) beam(g,[x,1.55,-5.4],[x,2.3,-5.4],.1,'#886c4c');
  beam(g,[-15,2.28,-5.4],[15,2.28,-5.4],.12,'#a9885f');
  for(let s=0;s<10;s++) block(g,-16,s*.63-3,2,.35,1.1,'#c6b699',1.5+s*.55);
}
function buildBridge(parent) {
  const a=new THREE.Vector3(22,11,-25),b=new THREE.Vector3(32,11,-72),dir=b.clone().sub(a).normalize();
  const deck = new THREE.Group(); deck.position.copy(a).lerp(b,.5); deck.rotation.y=Math.atan2(b.x-a.x,b.z-a.z); parent.add(deck); block(deck,0,0,4.6,.8,a.distanceTo(b),C.red,-.4);
  const side=new THREE.Vector3(-dir.z,0,dir.x);
  for(const s of [-1,1]) { const off=side.clone().multiplyScalar(s*2.1); beam(parent,a.clone().add(off).add(new THREE.Vector3(0,.56,0)).toArray(),b.clone().add(off).add(new THREE.Vector3(0,.56,0)).toArray(),.16,'#d9bb94'); }
  for(const u of [.28,.72]) {
    const p=a.clone().lerp(b,u),top=p.clone().add(new THREE.Vector3(0,22,0));
    for(const s of [-1,1]) { const foot=p.clone().add(side.clone().multiplyScalar(s*2.7)); foot.y=.6; const shoulder=top.clone().add(side.clone().multiplyScalar(s*.45)); beam(parent,foot.toArray(),shoulder.toArray(),1.15,C.red); }
    beam(parent,p.clone().add(new THREE.Vector3(0,16,0)).addScaledVector(side,-1.3).toArray(),p.clone().add(new THREE.Vector3(0,16,0)).addScaledVector(side,1.3).toArray(),.65,C.red);
    for(let n=-5;n<=5;n++) if(n) { const endpoint=a.clone().lerp(b,Math.max(.025,Math.min(.975,u+n*.055))); endpoint.y=11.8; for(const s of [-1,1]) line(parent,[top.clone().addScaledVector(side,s*.45).toArray(),endpoint.clone().addScaledVector(side,s*1.7).toArray()],'#e6a984',.92); }
    glow(parent,p.x,31.8,p.z,1.1,.45,1.1,'#ffb26f');
  }
  for(let u=.07;u<1;u+=.1) { const p=a.clone().lerp(b,u).addScaledVector(side,2.1); glow(parent,p.x,12,p.z,.16,.3,.16,'#ffcf99'); }
  return {a,b};
}
function buildJiefangbei(parent) {
  const x=-1,z=5,y=7;
  cylinder(parent,x,z,7.5,7.5,.17,'#eae3cd',y,48); cylinder(parent,x,z,3.4,3.9,.65,'#bfb699',y+.15,12);
  cylinder(parent,x,z,1.72,2.05,8.8,'#f0e6c9',y+.8,8); cylinder(parent,x,z,2.03,1.74,1,'#d7cba7',y+9.3,8); cylinder(parent,x,z,1.25,1.7,2.2,'#eee0b6',y+10.2,8); cylinder(parent,x,z,.1,1.2,1.7,'#b39a64',y+12.4,8);
  for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5]) {
    const face=new THREE.Group(); face.position.set(x,18.0,z); face.rotation.y=angle; parent.add(face);
    const disk=new THREE.Mesh(new THREE.CircleGeometry(.65,24),mat('#f8eed3')); disk.position.z=1.78; face.add(disk);
    line(face,[[0,0,1.80],[0,.42,1.80]],'#655943'); line(face,[[0,0,1.81],[.35,-.12,1.81]],'#655943');
  }
  for(let i=0;i<8;i++) { const t=i*Math.PI/4; tree(parent,x+Math.cos(t)*9,z+Math.sin(t)*9,.67,y); }
}
function prism(parent,points,height,color,x,z,y) {
  const sh=new THREE.Shape(); points.forEach(([a,b],i)=>i?sh.lineTo(a,b):sh.moveTo(a,b)); sh.closePath();
  const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:height,bevelEnabled:false}),mat(color,{roughness:.35,metalness:.12})); mesh.rotation.x=-Math.PI/2; mesh.position.set(x,y,z); mesh.castShadow=true; parent.add(mesh); return mesh;
}
function buildTheatre(parent) {
  area(parent,[[30,-91],[57,-93],[66,-81],[63,-65],[38,-68],[28,-76]],'#e2e0c8',4.25,.4);
  const volumes=[{x:43,z:-77,w:15,h:10,d:14,col:'#86b9a1'},{x:53,z:-82,w:12,h:15,d:17,col:'#9bc6af'},{x:36,z:-81,w:9,h:8,d:13,col:'#aac7ad'}];
  for(const v of volumes) {
    const sh=new THREE.Shape(); sh.moveTo(-v.w/2,0); sh.lineTo(v.w/2,0); sh.lineTo(v.w/2-.8,v.h*.62); sh.lineTo(v.w*.12,v.h); sh.lineTo(-v.w/2,v.h*.8); sh.closePath();
    const m=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:v.d,bevelEnabled:false}),mat(v.col,{roughness:.38,metalness:.16})); m.position.set(v.x,4.6,v.z-v.d/2); m.castShadow=true; parent.add(m);
    for(let xx=-v.w/2+1;xx<v.w/2;xx+=1) { const h=v.h*(.72+.18*Math.sin((xx/v.w+.5)*Math.PI)); for(const zz of [-1,1]) beam(parent,[v.x+xx,4.8,v.z+zz*(v.d/2+.04)],[v.x+xx,4.7+h,v.z+zz*(v.d/2+.04)],.06,'#d5e5c9'); }
    for(let y=6;y<4.6+v.h*.68;y+=1.5) for(const zz of [-1,1]) glow(parent,v.x,y,v.z+zz*(v.d/2+.08),v.w-.2,.07,.05,'#d2e8bc');
  }
  for(let i=0;i<5;i++) block(parent,44,-65+i*.55,22-i*.7,.2,1.1,'#c5c2a8',4.1-i*.3);
}
function buildLiziba(parent) {
  const x=-78,z=-20;
  block(parent,x,z,16,1.1,7.5,'#dacfb3',10);
  for(const xx of [-6.6,-2.2,2.2,6.6]) for(const zz of [-2.9,2.9]) block(parent,x+xx,z+zz,.9,5.5,.9,'#ccbea0',10);
  block(parent,x,z,16,12,7.5,'#dcd8bb',16.7); block(parent,x,z,16.9,.7,8,'#b8b39a',28.7);
  for(let y=18;y<28;y+=1.6) for(const zz of [-3.79,3.79]) for(let xx=-6.8;xx<7;xx+=2) { glow(parent,x+xx,y,z+zz,1.25,.73,.07,'#769992'); block(parent,x+xx,z+zz,1.6,.09,.5,'#f4e9cc',y-.55); }
  for(let i=0;i<4;i++) block(parent,x-5+i*3.5,z,2.4,.8,2.3,'#afb3a4',29.4);
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-104,13.1,-27),new THREE.Vector3(-91,13.6,-23),new THREE.Vector3(-78,13.9,-20),new THREE.Vector3(-63,14.3,-17),new THREE.Vector3(-48,16.7,-10),new THREE.Vector3(-35,17,0)]);
  const track=new THREE.Mesh(new THREE.TubeGeometry(curve,100,.51,6,false),mat('#bcc9bc')); track.castShadow=true; parent.add(track);
  for(let u=0;u<=1;u+=.125) { const p=curve.getPointAt(u); if(p.x>-87&&p.x<-69) continue; const base=ground(p.x,p.z); cylinder(parent,p.x,p.z,.48,.7,p.y-base-.5,'#c1bfa9',base,6); }
  const cars=[];
  for(let i=0;i<5;i++) { const g=new THREE.Group(); g.userData.cityMotion=true; block(g,0,0,1.8,1.8,3.6,'#e9eee0',.45); block(g,0,0,1.83,.4,3.62,'#409c82',.78); block(g,0,0,1.7,.28,3.2,'#cccfc1',2.2); for(const side of [-1,1]) for(const zz of [-1.1,0,1.1]) glow(g,side*.914,1.73,zz,.04,.53,.72,'#395e65'); for(const xx of [-.5,.5]) glow(g,xx,1.22,1.82,.22,.2,.05,'#ffe9b0'); parent.add(g); cars.push(g); }
  return t=>{ const lead=(t*.033)%1; cars.forEach((g,i)=>{const u=(lead-i*.036+1)%1,p=curve.getPointAt(u),v=curve.getTangentAt(u); g.position.copy(p); g.rotation.y=Math.atan2(v.x,v.z); }); };
}
function buildCableway(parent) {
  const a=new THREE.Vector3(28,24,18), b=new THREE.Vector3(50,27,51);
  for(const p of [a,b]) { const base=ground(p.x,p.z); block(parent,p.x,p.z,6.5,3.5,5.5,'#e0d7ba',base); for(const dx of [-2.5,2.5]) beam(parent,[p.x+dx,base,p.z],[p.x+dx,p.y,p.z],.75,'#c9c0a2'); beam(parent,[p.x-3,p.y,p.z],[p.x+3,p.y,p.z],.55,C.red); roof(parent,p.x,p.z,7,1.1,6,'#78574b',base+3.5); }
  const point=(u,offset=0)=>{const p=a.clone().lerp(b,u); p.y-=Math.sin(u*Math.PI)*3.6; p.x+=offset; return p;};
  for(const offset of [-.9,.9]) { const ps=[]; for(let i=0;i<=48;i++) ps.push(point(i/48,offset).toArray()); line(parent,ps,'#7e8478',1); }
  const gondolas=[];
  for(let i=0;i<2;i++) { const g=new THREE.Group(); g.userData.cityMotion=true; beam(g,[0,0,0],[0,-2.0,0],.16,'#8e8b76'); block(g,0,0,2.4,2.1,3.4,i?'#477d78':'#bf5340',-4.1); block(g,0,0,2.55,.25,3.6,'#ede6cf',-2.18); for(const side of [-1,1]) for(let z=-1.1;z<=1.1;z+=1.1) glow(g,side*1.21,-2.9,z,.035,.95,.8,'#d7e6cc'); glow(g,0,-2.9,1.71,1.75,.95,.04,'#c1d7c6'); parent.add(g); gondolas.push(g); }
  return t=>{ const u=.5-.46*Math.cos(t*.2); gondolas[0].position.copy(point(u,-.9)); gondolas[1].position.copy(point(1-u,.9)); const yaw=Math.atan2(b.x-a.x,b.z-a.z); gondolas.forEach(g=>g.rotation.y=yaw); };
}
function buildNanshan(parent) {
  const center=[69,79];
  for(let level=0;level<7;level++) {
    const points=[]; for(let i=0;i<26;i++) {const a=i/26*Math.PI*2,r=27-level*3.1+Math.sin(i*2.31)*1.7; points.push([center[0]+Math.cos(a)*r,center[1]+Math.sin(a)*r*.68]); }
    terrace(parent,points,6+level*2.3,level%2?'#8fa580':'#91a881');
  }
  cylinder(parent,69,79,6.2,7.2,.8,'#e3d8bb',22,40); cylinder(parent,69,79,3.8,4,3.2,'#c9c1a4',22.8,20); cylinder(parent,69,79,5,4.2,.7,'#e5dcc5',26,40);
  for(let i=0;i<16;i++) { const a=i/16*Math.PI*2; beam(parent,[69+Math.cos(a)*4.75,26.5,79+Math.sin(a)*4.75],[69+Math.cos(a)*4.75,27.5,79+Math.sin(a)*4.75],.12,'#f0e7ce'); }
  tree(parent,71,78,1.7,26.7);
  const trail=[]; for(let i=0;i<42;i++) { const a=i*.26,r=23-i*.38; trail.push([69+Math.cos(a)*r,7+i*.39,79+Math.sin(a)*r*.67]); } line(parent,trail,'#d8cfb2',.8);
  const rand=rng(331); for(let i=0;i<66;i++) { const a=rand()*Math.PI*2,r=10+rand()*15; const x=69+Math.cos(a)*r,z=79+Math.sin(a)*r*.65; tree(parent,x,z,.65+rand()*.65,6+(27-r)/3.1*2.3); }
}
function buildDistricts(parent) {
  const random=rng(230720); const reserved=[[-72,13,20,19],[-78,-20,19,14],[50,-14,25,23],[7,-27,23,13],[-1,5,13,14],[28,18,8,8],[45,-78,23,18],[50,51,10,10],[69,79,31,25],[-21,-2,5,5],[-29,7,5,5],[-9,-10,5,5],[17,-8,5,5],[-47,18,5,5],[-17,21,5,5]];
  const positions=[],windows=[]; const colors=['#ddd8c5','#d2cfbb','#f0e8d3','#bfc6b6','#bac5b7'];
  const excluded=(x,z)=>reserved.some(([cx,cz,rx,rz])=>Math.abs(cx-x)<rx&&Math.abs(cz-z)<rz);
  for(let x=-94;x<=94;x+=8.4) for(let z=-94;z<=94;z+=8.6) {
    const px=x+(random()-.5)*2.4,pz=z+(random()-.5)*2.4;
    if(excluded(px,pz)||(!inside(px,pz,peninsula)&&!inside(px,pz,northland)&&!inside(px,pz,southland))) continue;
    const safe=[[-2.8,-2.8],[2.8,-2.8],[-2.8,2.8],[2.8,2.8]].every(([dx,dz])=>ground(px+dx,pz+dz)===ground(px,pz)); if(!safe||random()<.24) continue;
    if(Math.abs(px-25)<6 && pz<-22&&pz>-78) continue;
    if(px>36&&pz>59) continue;
    if(Math.abs(pz-(px*.38+1))<2 && px<35 && px>-66) continue;
    const base=ground(px,pz),w=3.6+random()*2.1,d=3.5+random()*2.1; let h=3.8+random()*10;
    if(pz<-69&&px>-8) h*=1.7; if(px>-14&&px<20&&pz>-17&&pz<22) h*=1.5;
    positions.push({x:px,z:pz,w,d,h,base,color:colors[Math.floor(random()*colors.length)]});
    for(let y=base+1.2;y<base+h-.8;y+=1.75) for(const side of [-1,1]) for(let xx=-w/2+.6;xx<w/2-.25;xx+=1.15) if(random()<.75) windows.push({x:px+xx,y,z:pz+side*(d/2+.035),w:.5,h:.65,d:.055});
  }
  const dummy=new THREE.Object3D(), body=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat('#ddd8c5'),positions.length),tint=new THREE.Color();
  positions.forEach((p,i)=>{dummy.position.set(p.x,p.base+p.h/2,p.z); dummy.scale.set(p.w,p.h,p.d); dummy.updateMatrix(); body.setMatrixAt(i,dummy.matrix); body.setColorAt(i,tint.set(p.color));}); body.castShadow=true; body.receiveShadow=true; parent.add(body);
  const wm=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat('#b4c9ba',{emissive:'#edcc83',emissiveIntensity:.1}),windows.length); wm.material.userData.nightGlow=true; wm.userData.nightGlow=true;
  windows.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.w,p.h,p.d);dummy.updateMatrix();wm.setMatrixAt(i,dummy.matrix);}); parent.add(wm);
  for(let i=0;i<130;i++) {const x=-98+random()*192,z=-97+random()*192;if(excluded(x,z)||ground(x,z)===0)continue;if(x>36&&z>60)continue; const clear=positions.every(p=>Math.abs(p.x-x)>p.w/2+1.5||Math.abs(p.z-z)>p.d/2+1.5);if(clear)tree(parent,x,z,.65+random()*.48,ground(x,z));}
  // Distinct ridge-top skyline behind the old town.
  for(const [x,z,h] of [[-21,-2,26],[-29,7,29],[-9,-10,24],[17,-8,28],[-47,18,22],[-17,21,23]]) { const base=ground(x,z); block(parent,x,z,5.1,h,5.6,C.glass,base); block(parent,x,z,3.8,1.6,4.2,'#a6b7a6',base+h); for(let y=base+1.4;y<base+h;y+=1.5)for(const zz of [-2.84,2.84])glow(parent,x,y,z+zz,4.9,.09,.05,'#c3d1bb'); }
  return {buildings:positions.length+6,windowPanels:windows.length};
}
function hillRoad(parent,points,width) {
  const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z))),ps=[],indices=[];
  for(let i=0;i<=150;i++) {const p=curve.getPoint(i/150),t=curve.getTangent(i/150),nx=-t.z*width/2,nz=t.x*width/2;const y=ground(p.x,p.z)+.07;ps.push(p.x+nx,y,p.z+nz,p.x-nx,y,p.z-nz);if(i<150){const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));geo.setIndex(indices);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,mat(C.road,{side:THREE.DoubleSide}));mesh.receiveShadow=true;parent.add(mesh);
}
function makeBoat(parent,color,scale=1) { const g=new THREE.Group();g.userData.cityMotion=true;g.scale.setScalar(scale); const shape=new THREE.Shape();shape.moveTo(-1.65,-3.9);shape.lineTo(1.65,-3.9);shape.lineTo(1.85,2.2);shape.quadraticCurveTo(1.4,4.4,0,5);shape.quadraticCurveTo(-1.4,4.4,-1.85,2.2);shape.closePath();const hull=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.75,bevelEnabled:true,bevelSize:.15,bevelThickness:.12,bevelSegments:1}),mat(color));hull.rotation.x=-Math.PI/2;hull.position.y=.7;g.add(hull);block(g,0,0,2.5,.8,5.8,'#f1e9d1',1.35);block(g,0,-.2,2.2,.8,3.9,'#ece6ce',2.15);for(const side of [-1,1])for(let z=-2;z<2.5;z+=.75)glow(g,side*1.27,1.84,z,.04,.4,.44,'#709994');block(g,0,-.4,2.55,.14,4.3,'#bf7651',2.98);parent.add(g);return g; }
function batchArchitecture(group) {
  group.updateMatrixWorld(true);
  const buckets=new Map();
  group.traverse(object=>{
    if(!object.isMesh||object.isInstancedMesh||Array.isArray(object.material))return;
    for(let p=object;p;p=p.parent)if(p.userData.cityMotion)return;
    let landmarkId=object.userData.landmarkId;
    for(let p=object.parent;p&&!landmarkId;p=p.parent)landmarkId=p.userData.landmarkId;
    if(landmarkId)object.userData.landmarkId=landmarkId;
    const key=`${object.material.uuid}:${object.userData.nightGlow?'glow':'solid'}:${landmarkId||'city'}`;
    if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(object);
  });
  for(const list of buckets.values()) {
    if(list.length<2)continue;
    const geometries=list.map(object=>{
      const g=object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone();
      for(const attr of Object.keys(g.attributes))if(attr!=='position'&&attr!=='normal')g.deleteAttribute(attr);
      if(!g.attributes.normal)g.computeVertexNormals();g.applyMatrix4(object.matrixWorld);return g;
    });
    const geometry=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());if(!geometry)continue;
    const mesh=new THREE.Mesh(geometry,list[0].material);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.nightGlow=Boolean(list[0].userData.nightGlow);if(list[0].userData.landmarkId)mesh.userData.landmarkId=list[0].userData.landmarkId;group.add(mesh);for(const object of list)object.removeFromParent();
  }
}
export function createChongqing() {
  const group=new THREE.Group();group.name='重庆 · 主城九区';
  const expandedStats=districtLayout.build(group);
  terrace(group,midland,7,'#d2ccb1');terrace(group,highland,10,'#c7c1a5');
  // 大礼堂基座与半岛台地相接，避开李子坝列车弯轨。
  area(group,[[-94,-5],[-54,-5],[-51,7],[-53,30],[-69,33],[-91,31],[-95,17]],'#c7c1a5',10,6);
  // Promenades trace existing land edges without bridging either river.
  const northBank=peninsula.slice(0,9);ribbon(group,northBank,1.3,'#eee6ce',4.05,100);
  ribbon(group,peninsula.slice(8),1.25,'#eee6ce',4.05,100);
  hillRoad(group,[[-97,-12],[-70,-7],[-45,0],[-26,8],[-8,9],[13,0],[30,-6],[42,-9]],2.0);
  hillRoad(group,[[-96,14],[-73,20],[-48,24],[-21,20],[-5,10]],1.5);
  ribbon(group,[[-94,-83],[-57,-80],[-20,-79],[8,-84],[26,-91],[74,-89],[95,-87]],2.6,C.road,4.04,90);
  ribbon(group,[[-96,72],[-57,81],[-14,81],[20,73],[36,65],[62,40],[88,15]],2.2,C.road,5.04,100);
  buildRaffles(group);buildHongya(group);buildBridge(group);buildJiefangbei(group);buildTheatre(group);const animateTrain=buildLiziba(group),animateCable=buildCableway(group);buildNanshan(group);const stats=buildDistricts(group);
  // Small traditional terraces on the southern riverbank, facing Yuzhong.
  for(let i=0;i<11;i++) {const x=-5+i*4.5,z=65-i*.48;if(x>35)continue;block(group,x,z,3.9,3,4.2,i%2?'#c49466':'#b17f56',5);roof(group,x,z,4.7,1.05,5,'#76604b',8);for(let j=-1;j<=1;j++)glow(group,x+j,6.8,z-2.14,.48,.8,.05,'#ffd18c');}
  // Shoreline light strings make the confluence legible in the night view.
  for(const points of [northBank,peninsula.slice(8)]) {const c=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,4.5,z)));for(let i=0;i<80;i++){const p=c.getPointAt(i/79);glow(group,p.x,p.y,p.z,.18,.19,.18,'#ffcf8d');}}
  const ships=[makeBoat(group,'#f0e7cd',.85),makeBoat(group,'#b9704b',.7),makeBoat(group,'#e9ddbe',1.05)];
  const routes=[new THREE.CatmullRomCurve3([new THREE.Vector3(-101,.58,-47),new THREE.Vector3(-47,.58,-47),new THREE.Vector3(7,.58,-50),new THREE.Vector3(56,.58,-44),new THREE.Vector3(100,.58,-31)]),new THREE.CatmullRomCurve3([new THREE.Vector3(-96,.6,45),new THREE.Vector3(-37,.6,56),new THREE.Vector3(14,.6,45),new THREE.Vector3(60,.6,18),new THREE.Vector3(97,.6,-18)])];
  const landmarks=[
    {id:'raffles',name:'朝天门 · 来福士',subtitle:'两江交汇，八塔扬帆',description:'朝天门位于渝中半岛东端，嘉陵江在此汇入长江。模型保留来福士八座塔楼与横向水晶连廊的标志性轮廓，广场向江岸逐级下降。',position:[52,47,-16],camera:[112,91,-97],target:[50,18,-16],category:'城市地标'},
    {id:'hongyadong',name:'洪崖洞',subtitle:'江岸上的层叠吊脚楼',description:'洪崖洞面向嘉陵江，与江北嘴隔江相望。木构楼群沿山崖叠起，灯火、飞檐与临江步道共同构成山城最熟悉的立面。',position:[6,20,-34],camera:[28,37,-86],target:[7,9,-31],category:'巴渝街巷'},
    {id:'qiansimen',name:'千厮门大桥',subtitle:'红色斜拉桥，跨越嘉陵江',description:'千厮门大桥连接渝中半岛与江北，桥边可同时看到洪崖洞和重庆大剧院。模型将桥身、双塔与斜拉索突出为两江之间的红色线条。',position:[28,36,-50],camera:[96,73,-97],target:[26,14,-46],category:'跨江交通'},
    {id:'jiefangbei',name:'解放碑',subtitle:'高楼之间的城市坐标',description:'解放碑是渝中商业中心的城市地标。模型保留纪念碑、钟面与开敞的步行广场，周围的玻璃塔楼强调老地标与新天际线的尺度关系。',position:[-1,23,5],camera:[37,57,57],target:[-1,12,5],category:'城市地标'},
    {id:'grand-theatre',name:'重庆大剧院',subtitle:'江北嘴的翡翠玻璃体',description:'重庆大剧院位于江北嘴，隔嘉陵江面对渝中。模型用高低错落的绿色棱面与通透幕墙概括剧院轮廓，保留其与洪崖洞、千厮门大桥的相互位置。',position:[48,24,-80],camera:[98,57,-120],target:[46,9,-80],category:'文化建筑'},
    {id:'liziba',name:'李子坝',subtitle:'列车穿楼，轨道沿山',description:'李子坝站以单轨列车穿越住宅楼而闻名，车站位于楼内第六至第七层。场景中的列车在架空轨道上行驶，并从建筑中间预留的通廊穿过。',position:[-78,33,-20],camera:[-112,47,-80],target:[-78,17,-20],category:'立体交通'},
    {id:'cableway',name:'长江索道',subtitle:'在两岸之间缓缓穿行',description:'长江索道连接渝中与南岸，是观察江面与山城立体轮廓的独特视角。两辆吊厢在带有自然垂度的缆绳上往返，跨过半岛南侧的长江。',position:[40,28,35],camera:[98,59,86],target:[39,15,35],category:'立体交通'},
    {id:'nanshan',name:'南山一棵树',subtitle:'从山顶回望两江',description:'南山一棵树观景台位于南岸，可回望渝中半岛与两江。为容纳在同一座微缩模型中，此处压缩了距离；山林、台阶与观景平台表达南岸的地势。',position:[69,32,79],camera:[126,81,141],target:[69,18,77],category:'山城风景'}
  ];
  const originalZones={raffles:'yuzhong',hongyadong:'yuzhong',qiansimen:'yuzhong',jiefangbei:'yuzhong','grand-theatre':'jiangbei',liziba:'yuzhong',cableway:'yuzhong',nanshan:'nanan'};
  for(const landmark of landmarks)landmark.zone=originalZones[landmark.id];
  for(const point of DISTRICT_LANDMARKS){
    const buildLandmark=point.cluster==='university-town'?buildUniversityTownLandmark:buildDistrictLandmark;
    const model=buildLandmark(group,point.id,{x:point.x,z:point.z,baseY:point.baseY,scale:1});
    model.group.userData.landmarkId=point.id;
    const focusHeight=point.baseY+Math.min(12,model.height*.43),distance=Math.max(43,model.radius*1.7);
    landmarks.push({id:point.id,name:point.name,shortName:point.shortName,subtitle:point.subtitle,description:point.description,zone:point.zone,cluster:point.cluster,category:point.category,
      position:[point.x,point.baseY+model.height+3,point.z],camera:point.camera??[point.x+distance,focusHeight+distance*.9,point.z+distance],target:point.target??[point.x,focusHeight,point.z],
      related:point.related??DISTRICT_LANDMARKS.filter(p=>p.zone===point.zone&&p.id!==point.id).slice(0,2).map(p=>p.id)});
  }
  batchArchitecture(group);
  group.traverse(o=>{if(o.isMesh)o.receiveShadow=true;});
  return {group,landmarks,regions:CHONGQING_REGIONS,minimap:{paths:districtLayout.paths},scopeNote:'采用传统主城九区作城市记忆分区；大学城纳入沙坪坝记忆分组，现行管理归属另计。地形与区际距离经过压缩，名称不表示现行行政区划。',overview:{position:[355,387,-397],target:[-75.5,7,-1]},bounds:{...CHONGQING_BOUNDS},stats:{buildings:stats.buildings+expandedStats.buildings,windowPanels:stats.windowPanels+expandedStats.windowPanels,trees:expandedStats.trees,landmarks:landmarks.length,trainCars:5,cableCars:2,boats:3},update(t,dt){animateTrain(t);animateCable(t);ships.forEach((g,i)=>{const c=routes[i%2],u=(t*(.012+i*.002)+i*.29)%1,p=c.getPointAt(u),v=c.getTangentAt(u);g.position.copy(p);g.rotation.y=Math.atan2(v.x,v.z)+Math.PI;});}};
}

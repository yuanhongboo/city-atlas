import * as THREE from 'three';
import { block, cylinder, sphere, roof, mat } from './scene-kit.js';
import { beam, glow } from './destination-kit.js';

export const H = {wall:'#e7ddc5',white:'#f1ebda',roof:'#63736b',red:'#a76350',wood:'#877253',stone:'#b8b6a2',water:'#80b7ad',gold:'#c7ab70'};
export function house(g,x,z,w=8,d=7,h=4,opts={}) {
  const y=opts.y||0,color=opts.wall||H.wall,r=opts.roof||H.roof;
  block(g,x,z,w,h,d,color,y);roof(g,x,z,w+1.4,h*.45,d+1.4,r,y+h);
  for(const sx of [-.28,.28])block(g,x+sx*w,z+d/2+.05,w*.18,h*.22,.08,glow('#bda37b','#efc786'),y+h*.52);
  block(g,x,z+d/2+.08,w*.17,h*.65,.1,H.wood,y);
  if(opts.bai){for(const s of [-1,1]){block(g,x+s*w/2,z,.4,h+1.2,d+.5,H.white,y);block(g,x+s*w/2,z,.7,.3,d+.9,H.roof,y+h+1);}}
}
export function courtyard(g,x,z,w=23,d=22,opts={}) {
  block(g,x,z,w,.35,d,opts.paving||'#d6cdb5',0);
  house(g,x,z-d*.32,w*.75,d*.22,opts.height||5,opts);
  house(g,x-w*.38,z,w*.2,d*.7,3.5,opts);house(g,x+w*.38,z,w*.2,d*.7,3.5,opts);
  house(g,x,z+d*.4,w*.45,d*.16,3.2,opts);
}
export function pagoda(g,x,z,h=30,levels=7,opts={}) {
  const radius=opts.radius||5,color=opts.wall||H.wall,y=opts.y||0,sides=opts.sides||8;
  cylinder(g,x,z,radius*1.35,radius*1.5,1.1,H.stone,y,sides);
  for(let i=0;i<levels;i++){const r=radius*(1-i/(levels+2)*.65),base=y+1.1+i*h/levels;cylinder(g,x,z,r*.85,r,h/levels*.8,color,base,sides);cylinder(g,x,z,r*.25,r*1.35,h/levels*.25,opts.roof||H.roof,base+h/levels*.78,sides);}
  cylinder(g,x,z,0,.35,3.5,H.gold,y+h+1.1,8);
}
export function archBridge(g,x,z,length=20,width=4,orientation=0,color=H.stone) {
  const b=new THREE.Group();b.position.set(x,0,z);b.rotation.y=orientation;g.add(b);
  const n=14,points=[[],[]];
  for(let i=0;i<n;i++){const u=(i+.5)/n,xx=(u-.5)*length,yy=1+Math.sin(u*Math.PI)*3.1;block(b,xx,0,length/n+.05,.65,width,color,yy);for(const side of [-1,1]){block(b,xx,side*width/2,.25,1,.25,color,yy+.5);points[side===-1?0:1].push([xx,yy+1.5,side*width/2]);}}
  points.forEach(p=>{for(let i=1;i<p.length;i++)beam(b,p[i-1],p[i],.22,color);});
  for(const s of [-1,1])block(b,s*length*.44,0,length*.1,2,width,color,0);return b;
}
export function boat(parent,color='#8d795a',s=1) {
  const g=new THREE.Group();parent.add(g);g.scale.setScalar(s);
  sphere(g,0,.55,0,1.25,.6,3.6,color,1);block(g,0,0,2.1,.15,5.2,'#dbc79d',.9);
  for(const x of [-.9,.9])for(const z of [-1.1,1.1])block(g,x,z,.12,1.4,.12,H.wood,1);
  roof(g,0,0,2.5,.65,3.2,H.roof,2.4);return g;
}
export function mountain(g,x,z,rx,rz,h,{snow=false,color='#95a28b',y=0}={}) {
  const geo=new THREE.ConeGeometry(1,1,7,1),mesh=new THREE.Mesh(geo,mat(color));
  mesh.position.set(x,y+h/2,z);mesh.scale.set(rx,h,rz);mesh.rotation.y=.18;mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);
  if(snow){const peak=new THREE.Mesh(geo,mat('#f2eee1'));peak.position.set(x,y+h*.82,z);peak.scale.set(rx*.37,h*.37,rz*.37);peak.rotation.y=.18;peak.castShadow=true;g.add(peak);}return mesh;
}
export function wheel(parent,x,y,z,r=5) {
  const w=new THREE.Group();w.position.set(x,y,z);parent.add(w);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.42,6,32),mat(H.wood));w.add(ring);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;beam(w,[0,0,0],[Math.cos(a)*r,Math.sin(a)*r,0],.32,H.wood);const p=block(w,Math.cos(a)*r,0,.9,.35,1.8,'#ab8a60',Math.sin(a)*r-.18);p.rotation.z=a;}
  return w;
}

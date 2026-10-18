import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { block, mat, rng } from './scene-kit.js';

export function glow(color='#e6ce9a', emissive='#ffd295') {
  const material=mat(color,{emissive,emissiveIntensity:.06,roughness:.65});
  material.userData.nightGlow=true;
  return material;
}

export function beam(parent,a,b,width,color) {
  const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),direction=to.clone().sub(from);
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,direction.length(),width),color?.isMaterial?color:mat(color));
  mesh.position.copy(from).add(to).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());
  mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}

export function instances(parent,geometry,material,items) {
  if(!items.length)return null;
  const mesh=new THREE.InstancedMesh(geometry,material,items.length),transform=new THREE.Object3D();
  items.forEach(([x,y,z,sx,sy,sz,ry=0],index)=>{
    transform.position.set(x,y,z);transform.scale.set(sx,sy,sz);transform.rotation.set(0,ry,0);
    transform.updateMatrix();mesh.setMatrixAt(index,transform.matrix);
  });
  mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}

export function hill(parent,x,z,rx,rz,height,color,baseY=.2) {
  const segments=24,rings=5,positions=[x,baseY+height,z],indices=[];
  for(let ring=1;ring<=rings;ring++)for(let i=0;i<segments;i++){
    const angle=i/segments*Math.PI*2,r=ring/rings;
    positions.push(x+Math.cos(angle)*rx*r,baseY+height*Math.pow(1-r,1.25),z+Math.sin(angle)*rz*r);
  }
  for(let i=0;i<segments;i++)indices.push(0,1+(i+1)%segments,1+i);
  for(let ring=0;ring<rings-1;ring++)for(let i=0;i<segments;i++){
    const a=1+ring*segments+i,b=1+ring*segments+(i+1)%segments,c=a+segments,d=b+segments;
    indices.push(a,b,c,b,d,c);
  }
  const bottom=positions.length/3;positions.push(x,baseY,z);
  // Keep underside normals separate from the visible outer slope.
  for(let i=0;i<segments;i++){const angle=i/segments*Math.PI*2;positions.push(x+Math.cos(angle)*rx,baseY,z+Math.sin(angle)*rz);}
  for(let i=0;i<segments;i++)indices.push(bottom,bottom+1+i,bottom+1+(i+1)%segments);
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const mesh=new THREE.Mesh(geometry,mat(color,{side:THREE.DoubleSide}));mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}

function mergeStatic(group) {
  group.updateMatrixWorld(true);const buckets=new Map();
  group.traverse(object=>{
    if(!object.isMesh||object.isInstancedMesh||Array.isArray(object.material))return;
    let id='';
    for(let ancestor=object;ancestor;ancestor=ancestor.parent){
      if(ancestor.userData.cityMotion)return;
      if(ancestor.userData.landmarkId)id=ancestor.userData.landmarkId;
    }
    const key=[id,object.material.uuid,object.castShadow,object.receiveShadow].join(':');
    if(!buckets.has(key))buckets.set(key,{id,objects:[]});
    buckets.get(key).objects.push(object);
  });
  for(const {id,objects} of buckets.values()){
    if(objects.length<3)continue;
    const copies=objects.map(object=>{
      const geometry=object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone();
      for(const key of Object.keys(geometry.attributes))if(!['position','normal'].includes(key))geometry.deleteAttribute(key);
      if(!geometry.attributes.normal)geometry.computeVertexNormals();
      geometry.applyMatrix4(object.matrixWorld);return geometry;
    });
    const geometry=mergeGeometries(copies,false);copies.forEach(copy=>copy.dispose());
    if(!geometry)continue;
    const mesh=new THREE.Mesh(geometry,objects[0].material);mesh.castShadow=objects[0].castShadow;mesh.receiveShadow=objects[0].receiveShadow;
    mesh.userData.staticBatch=true;if(id)mesh.userData.landmarkId=id;
    group.add(mesh);objects.forEach(object=>object.removeFromParent());
  }
}

export function createDestination(options) {
  const {name,bounds,seed=1,groundColor='#e5dfc9',baseColor='#cec5ac'}=options;
  const group=new THREE.Group();group.name=name;
  const random=rng(seed),landmarks=[],motions=[];
  const width=bounds.maxX-bounds.minX,depth=bounds.maxZ-bounds.minZ;
  const centreX=(bounds.minX+bounds.maxX)/2,centreZ=(bounds.minZ+bounds.maxZ)/2;
  block(group,centreX,centreZ,width,4.4,depth,baseColor,-4.8);
  block(group,centreX,centreZ,width,.4,depth,groundColor,-.4);

  function landmark(spec,build) {
    const local=new THREE.Group();local.name=spec.name;local.userData.landmarkId=spec.id;
    local.position.set(spec.x,spec.baseY??.2,spec.z);group.add(local);build(local);
    group.updateMatrixWorld(true);
    const box=new THREE.Box3().setFromObject(local),size=box.getSize(new THREE.Vector3()),centre=box.getCenter(new THREE.Vector3());
    if(box.isEmpty())throw new Error(`${name} ${spec.id} 没有地标实体`);
    const target=spec.target||[centre.x,centre.y+size.y*.06,centre.z];
    const direction=new THREE.Vector3(1,.95,1.25).normalize();
    const camera=spec.camera||direction.multiplyScalar(Math.max(85,size.length()*2.5)).add(new THREE.Vector3(...target)).toArray();
    landmarks.push({id:spec.id,name:spec.name,shortName:spec.shortName,subtitle:spec.subtitle,description:spec.description,category:spec.category,zone:spec.zone,related:spec.related,position:[spec.x,spec.labelY??box.max.y+3,spec.z],target,camera});
    return local;
  }
  function addMotion(object,update) {
    object.userData.cityMotion=true;motions.push(update);update(0,0);return object;
  }
  function update(time,delta=0){motions.forEach(motion=>motion(time,delta));}
  function finish(stats={}) {
    update(0,0);
    const regions=options.regions.map(region=>{
      const places=landmarks.filter(place=>place.zone===region.id);
      const target=region.target||[places.reduce((sum,p)=>sum+p.target[0],0)/places.length,8,places.reduce((sum,p)=>sum+p.target[2],0)/places.length];
      return {...region,target,position:region.position||[target[0]+150,170,target[2]+175],labelPosition:region.labelPosition||[target[0],55,target[2]]};
    });
    for(const place of landmarks)place.related??=landmarks.filter(other=>other.zone===place.zone&&other.id!==place.id).slice(0,3).map(other=>other.id);
    mergeStatic(group);
    return {group,landmarks,regions,bounds:{...bounds},overview:options.overview||{position:[centreX+width*.72,Math.max(width,depth)*.85,centreZ+depth*1.1],target:[centreX,8,centreZ]},scopeNote:options.scopeNote,minimap:options.minimap,stats:{...stats,landmarks:landmarks.length},update};
  }
  return {group,random,landmark,addMotion,finish};
}

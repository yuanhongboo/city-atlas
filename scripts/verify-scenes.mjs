import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createHash } from 'node:crypto';
import { cities, cityIds, loadCity } from '../src/city-catalog.js';
import { createChengdu } from '../src/cities/chengdu.js';
import { createChongqing } from '../src/cities/chongqing.js';
import { createShenzhen } from '../src/cities/shenzhen.js';
import { createHongkong } from '../src/cities/hongkong.js';

const times = [0, 0.016, 1, 10, 60, 600, 3600];
const vector = new THREE.Vector3();
const requiredLandmarks = {
  成都: ['tianfu', 'kuanzhai', 'taikooli', 'anshun', 'wangjiang', 'wuhou', 'global', 'panda', 'wenshu', 'renmin', 'twin-towers', 'expo', 'xinglong', 'lankwaifong', 'jiuyanqiao', 'tianfu-1st', 'tianfu-2nd', 'tianfu-3rd', 'tianfu-4th', 'tianfu-5th'],
  重庆: ['raffles', 'hongyadong', 'qiansimen', 'jiefangbei', 'grand-theatre', 'liziba', 'cableway', 'nanshan', 'auditorium', 'guanyinqiao', 'danzishi', 'ciqikou', 'cqu', 'huangjueping', 'zoo', 'industrial-museum', 'yidu', 'jinyun', 'swu', 'central-park', 'airport', 'longzhouwan', 'nanwenquan', 'university-town', 'cqu-huxi', 'scfai-huxi', 'xijie'],
  深圳: ['pingan', 'civic-center', 'lianhuashan', 'huaqiangbei', 'diwang', 'kk100', 'dongmen', 'talent-park', 'spring-bamboo', 'shenzhen-university', 'window-world', 'happy-harbour', 'qianhai', 'dameisha', 'dapeng', 'universiade'],
  香港: ['ifc', 'bank-of-china', 'victoria-peak', 'hkcec', 'midlevels', 'star-ferry', 'clock-tower', 'avenue-stars', 'west-kowloon', 'icc', 'wong-tai-sin', 'mongkok', 'chi-lin', 'tian-tan-buddha', 'hk-airport', 'tsing-ma']
};
const chongqingRegions = ['yuzhong', 'jiangbei', 'nanan', 'shapingba', 'jiulongpo', 'dadukou', 'beibei', 'yubei', 'banan'];
const requiredRegions = {
  成都: ['old', 'south', 'tianfu'],
  重庆: chongqingRegions,
  深圳: ['futian', 'luohu', 'nanshan', 'west-bay', 'east-coast'],
  香港: ['island', 'harbour', 'kowloon', 'islands']
};
const geometryLandmarks = {
  // Existing Chengdu batches and Chongqing's first eight landmarks predate
  // landmark geometry metadata. Preserve their checks without claiming coverage.
  重庆: requiredLandmarks.重庆.slice(8),
  深圳: requiredLandmarks.深圳,
  香港: requiredLandmarks.香港
};
const additions = {
  dalian: {name:'大连',ids:['xinghai-square','xinghai-bridge','zhongshan-square','donggang','bangchuidao','tiger-beach','fisherman-wharf','lianhuashan','lushun-station','baiyushan','jinshitan','heishijiao'],regions:['core','coast','peninsula']},
  lijiang: {name:'丽江',ids:['dayan','waterwheels','sifang-street','mufu','black-dragon-pool','shuhe','baisha','yulong','blue-moon-valley','yuhu','shizi-hill','wenhai'],regions:['old-town','northern-villages','snow-mountain']},
  okinawa: {name:'冲绳',ids:['shuri','kokusai','naminoue','american-village','manzamo','churaumi','kouri','nakijin','sefa-utaki','gyokusendo','senaga','zampa'],regions:['naha','central','north']},
  wenzhou: {name:'温州',ids:['jiangxin','shuomen','wuma','nantang','oujiang-bridge','yandang','dalongqiu','nanxi','lishui-street','shiweiyan','dongtou','baizhangji'],regions:['city','mountains','outer']},
  huangshan: {name:'黄山',ids:['yingkesong','tiandu','lianhua','yungu','guangmingding','feilaishi','xihai','shixin','hongcun','xidi','tunxi'],regions:['mountain-gates','north-sea','huizhou']},
  hengdian: {name:'横店',ids:['qin-palace','ming-qing-palace','qingming-scroll','guangzhou-hongkong','dream-valley','new-yuanming','pingyan','dazhi-temple'],regions:['palace-scenes','river-scenes','hills-gardens']},
  wuzhen: {name:'乌镇',ids:['dongzha','xizha','water-pavilions','bailian-tower','zhaoming-academy','muxin-museum','indigo-workshop','wuzhen-theatre'],regions:['east-water','west-water','arts']},
  dali: {name:'大理',ids:['dali-old-town','three-pagodas','cangshan','erhai','longkan','xizhou','shuanglang','little-putuo','chongsheng','zhoucheng','wenbi','erhai-greenway'],regions:['old-city','west-shore','east-shore']},
  zunyi: {name:'遵义',ids:['meeting-site','hongjun-street','laosha-lane','phoenix-hill','red-army-hill','xinpu-wetland','loushanguan','hailongtun','wujiang-village','gouba'],regions:['old-town','urban-green','northern-passes','southern-villages']},
  xishui: {name:'习水',ids:['tucheng','sidu-memorial','qinggangpo','songjiao','tucheng-ferry','xijiu','danxia-valley','feige'],regions:['tucheng-history','chishui-river','northern-forest']}
};
const addedNames=new Set(Object.values(additions).map(entry=>entry.name));
for(const entry of Object.values(additions)){
  requiredLandmarks[entry.name]=entry.ids;requiredRegions[entry.name]=entry.regions;geometryLandmarks[entry.name]=entry.ids;
}

function geometryDigest(create){
  const city=create();city.update(0,0);city.group.updateMatrixWorld(true);
  const hash=createHash('sha256');
  city.group.traverse(object=>{
    hash.update(JSON.stringify(object.matrixWorld.elements));
    const geometry=object.geometry;
    if(geometry)for(const attribute of Object.values(geometry.attributes)){
      const array=attribute.array||attribute.data.array;
      hash.update(Buffer.from(array.buffer,array.byteOffset,array.byteLength));
    }
    if(object.instanceMatrix){const array=object.instanceMatrix.array;hash.update(Buffer.from(array.buffer,array.byteOffset,array.byteLength));}
  });
  return hash.digest('hex');
}

const round = n => Math.round(n * 1000) / 1000;

function describeBox(box) {
  return { min: box.min.toArray().map(round), max: box.max.toArray().map(round) };
}

function finite(values, label) {
  assert(values && typeof values.length === 'number', `${label} 缺少数值数组`);
  for (let i = 0; i < values.length; i++) {
    assert(Number.isFinite(values[i]), `${label}[${i}] 不是有限数值`);
  }
}

function viewpoint(values, label) {
  assert.equal(values?.length, 3, `${label} 必须有三个坐标`);
  finite(values, label);
}

function inspectBounds(city, name) {
  for (const key of ['minX', 'maxX', 'minZ', 'maxZ']) {
    assert(Number.isFinite(city.bounds?.[key]), `${name} bounds.${key} 无效`);
  }
  assert(city.bounds.minX < city.bounds.maxX, `${name} x 边界顺序无效`);
  assert(city.bounds.minZ < city.bounds.maxZ, `${name} z 边界顺序无效`);
}

function insideBounds(values, bounds, label, marginRatio = .02) {
  for (const [axis, index] of [['X', 0], ['Z', 2]]) {
    const min = bounds[`min${axis}`], max = bounds[`max${axis}`];
    const margin = (max - min) * marginRatio;
    assert(values[index] >= min - margin && values[index] <= max + margin,
      `${label}.${axis.toLowerCase()}=${values[index]} 超出场景边界附近 [${min}, ${max}]`);
  }
}

function inspectView(camera, target, label) {
  viewpoint(camera, `${label}.camera`);
  viewpoint(target, `${label}.target`);
  assert(new THREE.Vector3(...camera).distanceTo(new THREE.Vector3(...target)) > 1,
    `${label} 相机与观察目标过近，无法形成有效视角`);
  assert(camera[1] > 0, `${label} 相机必须高于地面`);
}

function inspectScene(city, name, time) {
  const geometries = new Set();
  const materials = new Set();
  let meshes = 0;
  let instances = 0;
  let vertices = 0;
  city.group.updateMatrixWorld(true);
  city.group.traverse(object => {
    const label = `${name} t=${time} ${object.name || object.type}#${object.id}`;
    finite(object.matrix.elements, `${label} 局部矩阵`);
    finite(object.matrixWorld.elements, `${label} 世界矩阵`);
    for (const material of [].concat(object.material || [])) {
      if (material.userData.nightGlow || object.userData.nightGlow) assert(material.emissive?.isColor, `${label} 夜景材质缺少 emissive`);
      if (materials.has(material)) continue;
      materials.add(material);
      for (const property of ['color', 'emissive']) {
        if (material[property]) finite(material[property].toArray(), `${label} 材质 ${property}`);
      }
      for (const [property, value] of Object.entries(material)) {
        if (typeof value === 'number') finite([value], `${label} 材质 ${property}`);
      }
    }
    if (object.isMesh) meshes++;
    if (object.isInstancedMesh) {
      assert(object.count > 0, `${label} 实例数量无效`);
      assert(object.instanceMatrix.count >= object.count, `${label} 实例矩阵数量不足`);
      finite(object.instanceMatrix.array, `${label} 实例矩阵`);
      if (object.instanceColor) finite(object.instanceColor.array, `${label} 实例颜色`);
      instances += object.count;
    }
    const geometry = object.geometry;
    if (!geometry || geometries.has(geometry)) return;
    geometries.add(geometry);
    assert(geometry.attributes.position?.count > 0, `${label} 缺少顶点`);
    vertices += geometry.attributes.position.count;
    for (const [key, attribute] of Object.entries(geometry.attributes)) {
      finite(attribute.array || attribute.data?.array, `${label} 几何 ${key}`);
    }
    if (geometry.index) finite(geometry.index.array, `${label} 几何索引`);
    for (const [key, attributes] of Object.entries(geometry.morphAttributes)) {
      attributes.forEach((attribute, i) => finite(attribute.array || attribute.data?.array, `${label} 形变 ${key}[${i}]`));
    }
  });
  return { meshes, instances, geometries: geometries.size, materials: materials.size, vertices };
}

function inspectLandmarkGeometry(city, name) {
  // Inspect rendered geometry, including meshes tagged after material batching.
  // A surviving empty Group or metadata alone is not a representative model.
  const boxes = new Map((geometryLandmarks[name] || []).map(id => [id, new THREE.Box3()]));
  city.group.traverse(object => {
    if (!object.isMesh || !object.geometry?.attributes.position?.count) return;
    for (let ancestor = object; ancestor; ancestor = ancestor.parent) {
      const box = boxes.get(ancestor.userData.landmarkId);
      if (!box) continue;
      box.union(new THREE.Box3().setFromObject(object));
      break;
    }
  });
  const districtsWithGeometry = new Set();
  const geometryEvidence = {};
  for (const [id, box] of boxes) {
    assert(!box.isEmpty(), `${name} ${id} 缺少关联到 landmarkId 的真实 Mesh 几何`);
    finite([...box.min.toArray(), ...box.max.toArray()], `${name} ${id} 几何边界`);
    const size = box.getSize(new THREE.Vector3());
    assert(size.x > 1 && size.z > 1 && size.y > .25, `${name} ${id} 几何尺寸不足以构成独立模型`);
    const landmark = city.landmarks.find(place => place.id === id);
    districtsWithGeometry.add(landmark.zone);
    geometryEvidence[id] = describeBox(box);
  }
  if (boxes.size) for (const id of requiredRegions[name]) assert(districtsWithGeometry.has(id), `${name} ${id} 缺少可追踪的代表模型几何`);
  return geometryEvidence;
}

function inspectBase(city, name) {
  // Inspect actual bottom vertices, so a shared material batch cannot confuse
  // the plinth dimensions with buildings or trees above the plinth.
  const box = new THREE.Box3();
  city.group.traverse(object => {
    if (!object.isMesh || object.isInstancedMesh) return;
    const attribute = object.geometry?.attributes.position;
    if (!attribute) return;
    for (let i = 0; i < attribute.count; i++) {
      vector.fromBufferAttribute(attribute, i).applyMatrix4(object.matrixWorld);
      if (vector.y < -4) box.expandByPoint(vector);
    }
  });
  assert(!box.isEmpty(), `${name} 缺少底座底部`);
  for (const axis of ['x', 'z']) {
    const suffix = axis.toUpperCase();
    const min = city.bounds[`min${suffix}`], max = city.bounds[`max${suffix}`];
    const tolerance = (max - min) * 0.01;
    assert(Math.abs(box.min[axis] - min) < tolerance, `${name} 底座 ${axis} 最小边与 bounds 不符：${box.min[axis]}，预期 ${min}`);
    assert(Math.abs(box.max[axis] - max) < tolerance, `${name} 底座 ${axis} 最大边与 bounds 不符：${box.max[axis]}，预期 ${max}`);
  }
  assert(Math.abs(box.min.y + 4.8) < 0.3, `${name} 底座高度超出预期：${box.min.y}`);
  return describeBox(box);
}

function verify(name, create) {
  const city = create();
  assert(city.group?.isGroup, `${name} 必须返回 THREE.Group`);
  assert.equal(typeof city.update, 'function', `${name} 必须支持 update`);
  assert(Array.isArray(city.landmarks), `${name} 必须返回地标数组`);
  assert.equal(city.stats?.landmarks, city.landmarks.length, `${name} stats.landmarks 与实际地标数量不符`);
  for (const [key, value] of Object.entries(city.stats)) {
    if (typeof value !== 'number') continue;
    assert(Number.isFinite(value) && value >= 0, `${name} stats.${key} 必须是非负有限数值`);
  }
  inspectBounds(city, name);
  const regionIds = new Set();
  assert(Array.isArray(city.regions) && city.regions.length > 0, `${name} 缺少片区定义`);
  for (const region of city.regions) {
    assert(typeof region.id === 'string' && region.id.length > 0, `${name} 片区缺少 id`);
    assert(!regionIds.has(region.id), `${name} 片区 id 重复：${region.id}`);
    regionIds.add(region.id);
    assert(typeof region.name === 'string' && region.name.length > 0, `${name} ${region.id} 片区缺少名称`);
    inspectView(region.position, region.target, `${name} ${region.id} 片区`);
    insideBounds(region.target, city.bounds, `${name} ${region.id} 片区.target`);
    if (name !== '成都' || region.labelPosition !== undefined) {
      viewpoint(region.labelPosition, `${name} ${region.id} 片区.labelPosition`);
      insideBounds(region.labelPosition, city.bounds, `${name} ${region.id} 片区.labelPosition`, 0);
    }
  }
  assert.deepEqual([...regionIds].sort(), [...requiredRegions[name]].sort(), `${name} 片区必须与约定集合一致`);
  if (name === '重庆') {
    assert.deepEqual([...regionIds].sort(), [...chongqingRegions].sort(), '重庆必须提供传统主城九区且无重复或额外分区');
    assert(typeof city.scopeNote === 'string' && /传统/.test(city.scopeNote) && /现行/.test(city.scopeNote), '重庆 scopeNote 必须区分传统城市分区与现行行政区划');
  }
  const ids = new Set();
  city.landmarks.forEach((landmark, i) => {
    assert(typeof landmark.id === 'string' && landmark.id.length > 0, `${name} 地标 ${i} 缺少 id`);
    assert(!ids.has(landmark.id), `${name} 地标 id 重复：${landmark.id}`);
    ids.add(landmark.id);
    assert(typeof landmark.name === 'string' && landmark.name.length > 0, `${name} 地标 ${i} 缺少名称`);
    const label = `${name} ${landmark.id}`;
    viewpoint(landmark.position, `${label}.position`);
    inspectView(landmark.camera, landmark.target, label);
    insideBounds(landmark.position, city.bounds, `${label}.position`);
    insideBounds(landmark.target, city.bounds, `${label}.target`);
    assert(regionIds.has(landmark.zone), `${label} 的 zone 未引用有效的 city.regions.id`);
  });
  requiredLandmarks[name].forEach(id => assert(ids.has(id), `${name} 缺少必须保留或新增的地标：${id}`));
  for(const landmark of city.landmarks){
    const related=landmark.related||[];
    assert(new Set(related).size===related.length, `${name} ${landmark.id} 附近地标重复`);
    for(const id of related) assert(ids.has(id)&&id!==landmark.id, `${name} ${landmark.id} 附近地标引用无效：${id}`);
  }
  assert.equal(ids.size, requiredLandmarks[name].length, `${name} 本次地标数量与约定集合不符`);
  for(const region of city.regions)for(const id of region.featuredPlaces||[]){
    const destination=city.landmarks.find(p=>p.id===id);
    assert(destination&&destination.zone===region.id,`${region.id} 的片区直达入口无效：${id}`);
  }
  if(name==='重庆'){
    const campusIds=['university-town','cqu-huxi','scfai-huxi','xijie'];
    const oldCampus=city.landmarks.find(p=>p.id==='cqu');
    for(const id of campusIds){const place=city.landmarks.find(p=>p.id===id);assert.equal(place.zone,'shapingba',`${id} 应归入沙坪坝记忆分区`);assert.equal(place.cluster,'university-town',`${id} 大学城关联缺失`);assert(place.position[0]<oldCampus.position[0],`${id} 应位于重庆大学老校区西侧`);}
    const newCampus=city.landmarks.find(p=>p.id==='cqu-huxi');
    assert.notEqual(oldCampus.name,newCampus.name,'重庆大学老校区与虎溪校园需要各自名称');
    assert(new THREE.Vector3(...oldCampus.position).distanceTo(new THREE.Vector3(...newCampus.position))>20,'新老校区不应复用同一位置');
    assert(city.regions.find(r=>r.id==='shapingba').featuredPlaces?.includes('university-town'),'沙坪坝需要大学城直达入口');
  }
  const regionCounts = Object.fromEntries([...regionIds].map(id => [id, city.landmarks.filter(place => place.zone === id).length]));
  if (name === '重庆') for (const [id, count] of Object.entries(regionCounts)) assert(count >= 2, `重庆 ${id} 至少需要两处地标，实际 ${count}`);
  if(name==='成都'){
    let previousStreetZ=-Infinity;
    for(const id of ['tianfu-1st','tianfu-2nd','tianfu-3rd','tianfu-4th','tianfu-5th']){
      const street=city.landmarks.find(place=>place.id===id),path=street.roadPath;
      assert(Array.isArray(path)&&path.length>=2,`${id} 缺少可验证的道路路径`);
      path.forEach((point,index)=>{assert.equal(point.length,2,`${id} 道路点维度错误`);finite(point,`${id} 道路点${index}`);insideBounds([point[0],0,point[1]],city.bounds,`${id} 道路点${index}`);});
      const xs=path.map(p=>p[0]),zs=path.map(p=>p[1]),middleZ=zs.reduce((sum,z)=>sum+z,0)/zs.length;
      assert(Math.max(...xs)-Math.min(...xs)>Math.max(...zs)-Math.min(...zs),`${id} 应主要沿东西方向展开`);
      assert(middleZ>previousStreetZ,`${id} 应在上一条街南侧`);previousStreetZ=middleZ;
      assert.equal(street.zone,'south',`${id} 应在高新南城片区`);
      let streetGroup;
      city.group.traverse(object=>{if(object.userData.landmarkId===id)streetGroup=object;});
      assert(streetGroup?.userData.buildingFootprints?.length>0,`${id} 缺少沿街建筑范围数据`);
      for(const footprint of streetGroup.userData.buildingFootprints){
        finite(footprint,`${id} 沿街建筑范围`);
        const [x,z,width,depth]=footprint;
        assert(width>0&&depth>0,`${id} 沿街建筑尺寸无效`);
        for(const other of city.landmarks.filter(p=>p.roadPath)){
          const otherZ=other.roadPath[0][1];
          assert(Math.abs(z-otherZ)>depth/2+2.1,`${id} 建筑压到 ${other.id} 车行道`);
        }
      }
    }
  }
  inspectView(city.overview?.position, city.overview?.target, `${name} overview`);
  insideBounds(city.overview.target, city.bounds, `${name} overview.target`);

  const animated = [];
  city.group.traverse(object => {
    if (!object.userData.cityMotion) return;
    let renderedMeshes = 0;
    object.traverse(child => {
      if (child.isMesh && child.geometry?.attributes.position?.count) renderedMeshes++;
    });
    assert(renderedMeshes > 0, `${name} ${object.name || object.id} 动态对象缺少真实 Mesh`);
    animated.push(object);
  });
  assert(animated.length > 0, `${name} 缺少标记的动态对象`);
  if (name === '成都') assert.equal(animated.length, 12, '成都应保留既有 12 个动态对象');
  if (name === '重庆') assert(animated.length >= 10, '重庆应保留既有 10 个动态对象');
  const initial = new Map();
  const initialPositions = new Map();
  const transformed = new Set();
  const moved = new Set();
  let stats;
  let base;
  let sceneBounds;
  let landmarkGeometry;
  let previous = 0;
  for (const time of times) {
    assert.doesNotThrow(() => city.update(time, time - previous), `${name} update(${time}) 抛错`);
    stats = inspectScene(city, name, time);
    if (time === 0) {
      base = inspectBase(city, name);
      // Material batching merges independent buildings. Overall geometry bounds and
      // camera validity are machine-checkable; landmark recognition needs visual QA.
      const sceneBox = new THREE.Box3().setFromObject(city.group);
      assert(!sceneBox.isEmpty(), `${name} 缺少可视几何`);
      finite([...sceneBox.min.toArray(), ...sceneBox.max.toArray()], `${name} 完整几何边界`);
      sceneBounds = describeBox(sceneBox);
      if(addedNames.has(name)){
        for(const [axis,suffix] of [['x','X'],['z','Z']]){
          assert(sceneBox.min[axis]>=city.bounds[`min${suffix}`]-.75&&sceneBox.max[axis]<=city.bounds[`max${suffix}`]+.75,`${name} 真实场景几何越出底座 ${axis} 边界`);
        }
        assert(sceneBox.min.y>=-5.1,`${name} 山体或建筑穿出底座`);
        let hasGlow=false;city.group.traverse(object=>{for(const material of [].concat(object.material||[]))if(material.userData.nightGlow)hasGlow=true;});
        assert(hasGlow,`${name} 缺少夜景发光材质`);
        assert(animated.length>=2,`${name} 应有至少两处真实动态`);
        assert(stats.meshes<450,`${name} Mesh 数量过高，需合并或实例化`);
      }
      landmarkGeometry = inspectLandmarkGeometry(city, name);
      animated.forEach(object => {
        initial.set(object.uuid, object.matrixWorld.clone());
        initialPositions.set(object.uuid, object.getWorldPosition(new THREE.Vector3()));
      });
    } else {
      animated.forEach(object => {
        // Rotating a wheel around its fixed centre changes its rendered transform
        // without changing its position. Compare all matrix elements for motion.
        const before = initial.get(object.uuid).elements;
        if (object.matrixWorld.elements.some((value, index) => Math.abs(value - before[index]) > 1e-8)) transformed.add(object.uuid);
        if (object.getWorldPosition(vector).distanceToSquared(initialPositions.get(object.uuid)) > 1e-10) moved.add(object.uuid);
      });
    }
    previous = time;
  }
  assert.equal(transformed.size, animated.length, `${name} 仍有标记为动态的对象在所有采样时刻均未发生变换`);
  // Chengdu boats/cars and Chongqing trains/cable cars/boats must still travel.
  if (name === '成都' || name === '重庆') assert.equal(moved.size, animated.length, `${name} 既有交通动态对象在所有采样时刻均未发生位移`);
  return {
    city: name, landmarks: ids.size, landmarkIds: [...ids], regions: regionCounts,
    bounds: city.bounds, declaredStats: city.stats, ...stats,
    animatedObjects: animated.length, transformedObjects: transformed.size,
    movingObjects: moved.size, fixedCentreAnimatedObjects: transformed.size - moved.size,
    samples: times.length, sampleTimes: times, base, sceneBounds,
    landmarkGeometry,
    landmarkGeometryCheck: `${Object.keys(landmarkGeometry).length} 处地标的关联 Mesh 几何已验证；逐地标视觉辨识仍需浏览器验收`
  };
}

try {
  assert.equal(cityIds.length,14,'目的地入口应包含原四城与新增十地');
  const scenes = [['成都', createChengdu], ['重庆', createChongqing], ['深圳', createShenzhen], ['香港', createHongkong]].map(([name, create]) => verify(name, create));
  for(const [id,entry] of Object.entries(additions)){
    assert(Object.hasOwn(cities,id),`${id} 未注册目的地入口`);
    const module=await cities[id].load(),create=await loadCity(id);
    assert.deepEqual([...module.landmarkIds].sort(),[...entry.ids].sort(),`${id} 导出地标名单不一致`);
    for(const field of ['title','seal','verse','coordinates','terrain','intro','description','category'])assert(typeof module.metadata[field]==='string'&&module.metadata[field].length>0,`${id} 缺少 ${field} 展示文案`);
    const result=verify(entry.name,create);
    const first=geometryDigest(create),second=geometryDigest(create);
    assert.equal(first,second,`${id} 相同种子的几何与初始动画不确定`);
    scenes.push({...result,id,deterministicGeometry:first});
  }
  console.log(JSON.stringify({ ok: true, scenes }));
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: error.message }));
  process.exitCode = 1;
}

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createChengdu } from './cities/chengdu.js';
import { createChongqing } from './cities/chongqing.js';
import { createShenzhen } from './cities/shenzhen.js';
import { createHongkong } from './cities/hongkong.js';
import './style.css';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const cities = {
  chengdu: { create: createChengdu, title:'成都', seal:'蓉', serial:'01', verse:'从少城茶香，到兴隆湖畔。', coordinates:'30.67° N · 104.07° E', terrain:'老城 · 南城 · 天府新区', intro:'沿着中轴，一路向南', description:'从文殊院、人民公园，到金融城双子塔，再沿天府大道走到兴隆湖。选择一个片区，继续这座城的记忆。', category:'此刻，俯瞰蓉城' },
  chongqing: { create: createChongqing, title:'重庆', seal:'渝', serial:'02', verse:'九区各有景，一城皆山水。', coordinates:'29.56° N · 106.57° E', terrain:'传统主城九区', intro:'九区风景，慢慢逛', description:'从两江交汇到缙云山，从磁器口到南温泉。点一个区，看看这座城不同的日常。', category:'此刻，俯瞰九区', scopeLabel:'传统分区 · 口径说明 ↗', scopeSource:{url:'https://wap.cq.gov.cn/zwgk/zfxxgkml/szfwj/qtgw/202511/t20251107_15148513.html',label:'查看重庆市政府行政区划调整公告 ↗'} },
  shenzhen: { create: createShenzhen, title:'深圳', seal:'深', serial:'03', verse:'从城市天际线，走向山海。', coordinates:'22.54° N · 114.06° E', terrain:'湾畔 · 街巷 · 山海', intro:'沿着海岸，遇见深圳', description:'从平安金融中心、市民中心，到后海人才公园与前海，再向东走到大梅沙和大鹏。选一片熟悉的地方，慢慢逛。', category:'此刻，俯瞰鹏城' },
  hongkong: { create: createHongkong, title:'香港', seal:'港', serial:'04', verse:'渡轮穿过海港，灯火爬上山。', coordinates:'22.30° N · 114.17° E', terrain:'港岛 · 九龙 · 离岛', intro:'隔着维港，看见香港', description:'从中环的摩天楼，到尖沙咀钟楼与西九海滨；从旺角街巷，到大屿山的天坛大佛。跟着渡轮，在山与海之间停留。', category:'此刻，俯瞰香江' }
};
const cityIds=Object.keys(cities);
const themes = {
  day: { bg:'#eaece3', ground:'#e3e5db', sun:'#fff2d7', hemi:'#eff9ef', hemiGround:'#b9bba1', sunIntensity:2.8, hemiIntensity:1.35, exposure:1.0, glow:.045, sunPosition:[-100,170,100] },
  sunset: { bg:'#e9d5c0', ground:'#d4bd9f', sun:'#ffb477', hemi:'#e7d5cb', hemiGround:'#a79076', sunIntensity:3.65, hemiIntensity:1.55, exposure:1.05, glow:.5, sunPosition:[-155,70,95] },
  night: { bg:'#152c37', ground:'#162e38', sun:'#95b6ee', hemi:'#658ba9', hemiGround:'#172f48', sunIntensity:.55, hemiIntensity:.6, exposure:1.05, glow:2.2, sunPosition:[-80,140,-95] }
};
let renderer, scene, camera, controls, sunlight, hemisphere, ground;
let cityId, city, selectedId=null, labels=[], tween=null, tour=false, tourElapsed=0, tourIndex=-1;
let labelVisibility=true, autoOrbit=false, currentTheme='day', themeTween=null, toastTimeout;
let elapsed=0, lastTime=performance.now(), latestFrame=0;
let activeRegion='all';
let tourRoute=[];
const cache = new Map(), glowMaterials = new Set();
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const TOUR_DURATION=10;
const projected=new THREE.Vector3(), cameraDirection=new THREE.Vector3();

function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('#toast').classList.remove('show'),3000);}
function overview(){
  const small=window.innerWidth<=900;
  const v=new THREE.Vector3(...city.overview.position), target=new THREE.Vector3(...city.overview.target);
  const scale=small? Math.max(1.65,1.5/camera.aspect) : (window.innerWidth<1200?1.5:1.38);
  v.sub(target).multiplyScalar(scale).add(target);
  return {position:v.toArray(),target:target.toArray()};
}
function flyTo(position,target,duration=1700){
  const p=new THREE.Vector3(...position), t=new THREE.Vector3(...target);
  tween={start:performance.now(),duration:reducedMotion?0:duration,from:camera.position.clone(),to:p,fromTarget:controls.target.clone(),toTarget:t};
}
function stopTour(){tour=false;tourElapsed=0;$('#tour-button').setAttribute('aria-pressed','false');$('#tour-text').textContent='带我逛逛';$('#tour-note').textContent='沿着城市的记忆，慢慢走一圈';$('#tour-progress').style.transform='scaleX(0)';}
function setOrbit(value){autoOrbit=value;controls.autoRotate=value;$('#orbit-button').setAttribute('aria-pressed',String(value));}
function showOverview(animate=true){
  renderNearby();
  activeRegion='all';syncRegionButtons();filterPlaces();
  stopTour();selectedId=null;setOrbit(false);const view=overview();
  document.body.classList.toggle('district-overview',usesRegionOverview());
  if(animate)flyTo(view.position,view.target);else{camera.position.fromArray(view.position);controls.target.fromArray(view.target);controls.update();tween=null;}
  const data=cities[cityId];$('#place-category').textContent=data.category;$('#place-number').textContent=`${data.serial} / ${String(cityIds.length).padStart(2,'0')}`;$('#place-title').textContent=data.intro;$('#place-description').textContent=data.description;$('#place-hint').innerHTML='<i></i>自由探索中';$('#mini-view').textContent='全景';updateSelection();
}
function selectPlace(id,fromTour=false){
  const index=city.landmarks.findIndex(l=>l.id===id);if(index<0)return;
  if(!fromTour)stopTour();setOrbit(false);selectedId=id;const l=city.landmarks[index];
  document.body.classList.remove('district-overview');
  if(activeRegion!=='all'&&l.zone!==activeRegion){activeRegion=l.zone||'all';syncRegionButtons();filterPlaces();}
  const t=new THREE.Vector3(...(l.target||l.position));const p=new THREE.Vector3(...l.camera);
  // Close views retain a little breathing room around tall buildings and on phones.
  p.sub(t).multiplyScalar(window.innerWidth<=900?Math.max(1.35,1.13/camera.aspect):1.06).add(t);
  flyTo(p.toArray(),t.toArray());
  $('#place-category').textContent=l.category;$('#place-number').textContent=`${String(index+1).padStart(2,'0')} / ${String(city.landmarks.length).padStart(2,'0')}`;
  renderPlaceTitle(l.name);$('#place-description').textContent=l.description;$('#place-hint').innerHTML=`<i></i>${fromTour?'正在漫游':'停留在这里'}`;$('#mini-view').textContent=l.name;updateSelection();
  renderNearby(l);
  const row=$$('#landmark-list [data-place]').find(el=>el.dataset.place===id);row?.scrollIntoView({block:'nearest',behavior:reducedMotion?'instant':'smooth'});
}
function renderPlaceTitle(name){
  const title=$('#place-title');title.replaceChildren();
  if(!name.includes(' · ')){title.textContent=name;return;}
  name.split(' · ').forEach((part,index)=>{if(index)title.append(document.createTextNode(' · '));const span=document.createElement('span');span.className='title-part';span.textContent=part;title.append(span);});
}
function renderNearby(landmark,captionText='附近逛逛'){
  const container=$('#nearby-places');container.replaceChildren();
  const neighbours=(landmark?.related||[]).map(id=>city.landmarks.find(place=>place.id===id)).filter(Boolean);
  container.hidden=neighbours.length===0;$('#place-card').classList.toggle('has-nearby',neighbours.length>0);
  if(!neighbours.length)return;
  const caption=document.createElement('span');caption.textContent=captionText;container.append(caption);
  neighbours.forEach(place=>{const button=document.createElement('button');button.textContent=(place.shortName||place.name)+' ↗';button.title=place.name;button.addEventListener('click',()=>selectPlace(place.id));container.append(button);});
}
function regionDefinitions(){return city?.regions||[];}
function usesRegionOverview(){const regions=regionDefinitions();return regions.length>3&&regions.every(region=>region.labelPosition);}
function syncRegionButtons(){$$('#region-list button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.region===activeRegion)));$('#region-select').value=activeRegion;}
function updateScrollHint(){
  const list=$('#landmark-list'),edge=list.getBoundingClientRect().bottom;
  const remaining=$$('#landmark-list .landmark-item').filter(el=>el.style.display!=='none'&&el.getBoundingClientRect().bottom>edge+3).length;
  $('#all-places-button').textContent=remaining?`下方还有 ${remaining} 处 · 查看全部 ↗`:`查看全部 ${city.landmarks.length} 处地标 ↗`;
}
function filterPlaces(){
  if(!city)return;const q=$('#search').value.trim().toLowerCase();let count=0;
  $$('#landmark-list .landmark-item').forEach(button=>{
    const match=(q||activeRegion==='all'||button.dataset.zone===activeRegion)&&button.textContent.toLowerCase().includes(q);
    button.style.display=match?'':'none';if(match)count++;
  });
  $('#no-results').hidden=count>0;requestAnimationFrame(updateScrollHint);
}
function selectRegion(id,animate=true){
  if(id==='all'){showOverview(animate);return;}
  const region=regionDefinitions().find(r=>r.id===id);if(!region)return;
  document.body.classList.remove('district-overview');
  renderNearby();
  stopTour();setOrbit(false);activeRegion=id;selectedId=null;$('#search').value='';syncRegionButtons();filterPlaces();updateSelection();
  const target=new THREE.Vector3(...region.target),position=new THREE.Vector3(...(region.position||region.camera));
  position.sub(target).multiplyScalar(innerWidth<=900?Math.max(1.25,1.12/camera.aspect):1.16).add(target);
  if(animate)flyTo(position.toArray(),target.toArray());else{camera.position.copy(position);controls.target.copy(target);controls.update();tween=null;}
  const points=city.landmarks.filter(l=>l.zone===id);$('#place-category').textContent=`${cities[cityId].title} · 分区漫游`;$('#place-number').textContent=`${points.length} 处地标`;
  $('#place-title').textContent=region.name;$('#place-description').textContent=region.description||points.map(l=>l.name).join(' · ');$('#place-hint').innerHTML='<i></i>正在看这一片';$('#mini-view').textContent=region.name;
  if(region.featuredPlaces?.length)renderNearby({related:region.featuredPlaces},'片区直达');
}
function renderCatalog(filter='all'){
  const allRegions=regionDefinitions().length?regionDefinitions():[{id:'all',name:'全城地标'}];
  const regions=allRegions.filter(r=>filter==='all'||r.id===filter);
  $('#catalog-title').textContent=`${cities[cityId].title} · ${city.landmarks.length} 处地标`;
  $('#catalog-note').textContent='点一个名字，飞到对应建筑或街区。每一处都可以单独游览。';
  $('#catalog-sections').replaceChildren();
  $('#catalog-sections').classList.toggle('many-regions',regions.length>4);
  $('#catalog-filter-wrap').hidden=allRegions.length<4;
  $('#catalog-filter').replaceChildren(new Option('全部片区','all'));
  allRegions.forEach(r=>{if(r.id!=='all')$('#catalog-filter').add(new Option(r.name,r.id));});
  $('#catalog-filter').value=filter;
  regions.forEach(region=>{
    const section=document.createElement('section'),heading=document.createElement('h3');heading.textContent=region.name;section.append(heading);
    city.landmarks.forEach((landmark,index)=>{
      if(region.id!=='all'&&landmark.zone!==region.id)return;
      const button=document.createElement('button');button.className='catalog-place';button.dataset.place=landmark.id;
      const number=document.createElement('span');number.className='catalog-number';number.textContent=String(index+1).padStart(2,'0');
      const text=document.createElement('span');text.textContent=landmark.name;const sub=document.createElement('small');sub.textContent=landmark.subtitle;text.append(sub);
      button.append(number,text);button.addEventListener('click',()=>{$('#places-dialog').close();selectPlace(landmark.id);});section.append(button);
    });$('#catalog-sections').append(section);
  });
}
function updateSelection(){
  $('#place-select').value=selectedId||'';
  $$('[data-place]').forEach(el=>el.setAttribute('aria-current',String(el.dataset.place===selectedId)));
  $$('#minimap circle[data-id]').forEach(el=>{const active=el.dataset.id===selectedId;el.setAttribute('r',active?'4.4':'2.6');el.setAttribute('fill',active?'#ba7550':'#5a826b');});
}
function renderList(){
  $('#landmark-list').replaceChildren();$('#labels').replaceChildren();labels=[];
  $('#region-list').replaceChildren();activeRegion='all';
  const regionOptions=regionDefinitions().length?[{id:'all',name:'全城'},...regionDefinitions()]:[];
  const manyRegions=regionDefinitions().length>3;
  $('#region-list').hidden=regionOptions.length===0||manyRegions;
  $('#region-select-wrap').hidden=!manyRegions;$('#region-select').replaceChildren();
  regionOptions.forEach(region=>{
    const count=region.id==='all'?city.landmarks.length:city.landmarks.filter(l=>l.zone===region.id).length;
    $('#region-select').add(new Option(`${region.name} · ${count}处`,region.id));
    if(!manyRegions){const button=document.createElement('button');button.dataset.region=region.id;button.textContent=region.name;button.setAttribute('aria-pressed',String(region.id==='all'));button.addEventListener('click',()=>selectRegion(region.id));$('#region-list').append(button);}
  });
  const leaders=document.createElementNS('http://www.w3.org/2000/svg','svg');leaders.classList.add('district-leaders');leaders.setAttribute('aria-hidden','true');$('#labels').append(leaders);
  if(manyRegions)regionDefinitions().forEach(region=>{
    if(!region.labelPosition)return;
    const label=document.createElement('button');label.className='map-label district-label';label.dataset.region=region.id;label.textContent=region.name;label.setAttribute('aria-label',`探索${region.name}`);label.addEventListener('click',()=>selectRegion(region.id));$('#labels').append(label);
    const leader=document.createElementNS('http://www.w3.org/2000/svg','line');leaders.append(leader);
    labels.push({element:label,leader,position:new THREE.Vector3(...region.labelPosition),id:region.id,zone:region.id,kind:'region'});
  });
  $('#place-select').replaceChildren(new Option('选择一个地标',''));
  city.landmarks.forEach((l,i)=>{
    $('#place-select').add(new Option(l.name,l.id));
    const button=document.createElement('button');button.className='landmark-item';button.dataset.place=l.id;button.dataset.zone=l.zone||'all';button.setAttribute('aria-current','false');
    const number=document.createElement('span');number.className='landmark-index';number.textContent=String(i+1).padStart(2,'0');
    const name=document.createElement('span');name.className='landmark-name';name.textContent=l.name;
    const subtitle=document.createElement('small');subtitle.textContent=l.subtitle;name.append(subtitle);
    const arrow=document.createElement('span');arrow.className='item-arrow';arrow.textContent='↗';button.append(number,name,arrow);button.addEventListener('click',()=>selectPlace(l.id));$('#landmark-list').append(button);
    const label=document.createElement('button');label.className='map-label';label.dataset.place=l.id;label.textContent=l.name;label.setAttribute('aria-label',`前往${l.name}`);label.setAttribute('aria-current','false');label.addEventListener('click',()=>selectPlace(l.id));$('#labels').append(label);
    labels.push({element:label,position:new THREE.Vector3(...l.position).add(new THREE.Vector3(0,2,0)),id:l.id,zone:l.zone||'all'});
  });
  $('#search').value='';$('#no-results').hidden=true;$('#landmark-count').textContent=`全部 ${city.landmarks.length} 处 ↗`;
  $('#scope-note').hidden=!city.scopeNote;$('#about-scope').hidden=!city.scopeNote;$('#scope-detail').textContent=city.scopeNote||'';
  $('#scope-note').textContent=city.scopeNote?(cities[cityId].scopeLabel||'沙盘布局说明 ↗'):'';
  const source=cities[cityId].scopeSource;$('#scope-source').hidden=!source;
  if(source){$('#scope-source').href=source.url;$('#scope-source').textContent=source.label;}else{$('#scope-source').removeAttribute('href');$('#scope-source').textContent='';}
  renderMinimap();renderCatalog();requestAnimationFrame(updateScrollHint);
}
function renderMinimap(){
  const svg=$('#minimap');svg.replaceChildren();const ns='http://www.w3.org/2000/svg';
  function element(tag,attributes){const el=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attributes))el.setAttribute(k,v);svg.append(el);return el;}
  const {minX,maxX,minZ,maxZ}=city.bounds;
  const project=([x,z])=>[12+(x-minX)/(maxX-minX)*176,12+(z-minZ)/(maxZ-minZ)*112];
  if(city.minimap?.paths){
    element('path',{d:'M11 12H189V124H11Z',fill:'#d7dfca',stroke:'none'});
    city.minimap.paths.forEach(path=>{const points=path.points.map(p=>project(p).join(',')).join(' ');element(path.closed?'polygon':'polyline',{points,fill:path.closed?path.color:'none',stroke:path.closed?'none':path.color,'stroke-width':path.closed?0:Math.max(.7,(path.width||2)*112/(maxZ-minZ))});});
  }else if(cityId==='chengdu'){
    element('path',{d:'M11 12H189V124H11Z',fill:'#d7dfca',stroke:'none'});
    element('path',{d:'M15 76C42 72 65 87 102 82S135 63 145 88 165 104 188 108M105 12Q123 31 148 35T150 78',stroke:'#89b4a6','stroke-width':5,fill:'none'});
    element('path',{d:'M94 13V125M16 57H189M20 30H170M25 108H170',stroke:'#eff0df','stroke-width':2,fill:'none'});
  }else{
    element('path',{d:'M8 8H192V128H8Z',fill:'#d1dbc5',stroke:'none'});
    element('path',{d:'M8 33C50 22 63 32 88 44S115 46 139 42L191 16M8 104Q65 127 112 77T139 42',stroke:'#88b0a6','stroke-width':13,fill:'none'});
    element('path',{d:'M125 58 135 31M105 83l31 13',stroke:'#b28367','stroke-width':2});
  }
  city.landmarks.forEach(l=>{const x=12+(l.position[0]-minX)/(maxX-minX)*176;const z=12+(l.position[2]-minZ)/(maxZ-minZ)*112;const dot=element('circle',{cx:x,cy:z,r:2.6,fill:'#5a826b',stroke:'#f1f0de','data-id':l.id});dot.addEventListener('click',()=>selectPlace(l.id));});
  element('text',{x:181,y:14}).textContent='北';
}
function setTheme(name,immediate=false){
  if(!themes[name])return;currentTheme=name;document.body.classList.toggle('night',name==='night');
  scene.environmentIntensity=name==='night'?.07:.23;
  $$('[data-light]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.light===name)));
  const colors={bg:scene.background.clone(),ground:ground.material.color.clone(),sun:sunlight.color.clone(),hemi:hemisphere.color.clone(),hemiGround:hemisphere.groundColor.clone()};
  themeTween={start:performance.now(),duration:immediate?0:1100,from:{...colors,sunIntensity:sunlight.intensity,hemiIntensity:hemisphere.intensity,exposure:renderer.toneMappingExposure,glow:[...glowMaterials][0]?.emissiveIntensity??0,sunPosition:sunlight.position.clone()},to:themes[name]};
  try{localStorage.setItem('city-atlas-light',name);}catch{}
}
function updateTheme(now){
  if(!themeTween)return;const {start,duration,from,to}=themeTween;const u=duration?Math.min(1,(now-start)/duration):1;const e=u*u*(3-2*u);
  scene.background.copy(from.bg).lerp(new THREE.Color(to.bg),e);scene.fog.color.copy(scene.background);
  ground.material.color.copy(from.ground).lerp(new THREE.Color(to.ground),e);sunlight.color.copy(from.sun).lerp(new THREE.Color(to.sun),e);hemisphere.color.copy(from.hemi).lerp(new THREE.Color(to.hemi),e);hemisphere.groundColor.copy(from.hemiGround).lerp(new THREE.Color(to.hemiGround),e);
  sunlight.intensity=THREE.MathUtils.lerp(from.sunIntensity,to.sunIntensity,e);hemisphere.intensity=THREE.MathUtils.lerp(from.hemiIntensity,to.hemiIntensity,e);renderer.toneMappingExposure=THREE.MathUtils.lerp(from.exposure,to.exposure,e);sunlight.position.copy(from.sunPosition).lerp(new THREE.Vector3(...to.sunPosition).add(sunlight.target.position),e);
  glowMaterials.forEach(m=>m.emissiveIntensity=THREE.MathUtils.lerp(from.glow,to.glow,e));
  if(u===1)themeTween=null;
}
function switchCity(id,push=true){
  if(!cities[id]||id===cityId)return;stopTour();if(city)scene.remove(city.group);
  cityId=id;if(!cache.has(id))cache.set(id,cities[id].create());city=cache.get(id);scene.add(city.group);
  const b=city.bounds,span=Math.hypot(b.maxX-b.minX,b.maxZ-b.minZ),shadowExtent=span*.6;
  sunlight.target.position.set((b.minX+b.maxX)/2,0,(b.minZ+b.maxZ)/2);sunlight.target.updateMatrixWorld();
  Object.assign(sunlight.shadow.camera,{left:-shadowExtent,right:shadowExtent,top:shadowExtent,bottom:-shadowExtent});sunlight.shadow.camera.updateProjectionMatrix();
  controls.maxDistance=Math.max(1250,span*4.5);
  glowMaterials.clear();city.group.traverse(o=>{if(o.material)for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(m.userData?.nightGlow)glowMaterials.add(m);});
  const data=cities[id];$('#city-title').replaceChildren(document.createTextNode(data.title));const seal=document.createElement('span');seal.textContent=data.seal;$('#city-title').append(seal);
  $('#city-serial').textContent=`城市手记 / ${data.serial}`;$('#city-verse').textContent=data.verse;$('#city-coordinates').textContent=data.coordinates;$('#city-terrain').textContent=data.terrain;
  $$('[data-city]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.city===id)));
  $('#city-select').value=id;
  document.title=`${data.title} · 城间漫游`;document.documentElement.dataset.city=id;renderList();showOverview(false);setTheme(currentTheme,true);
  if(push){const url=new URL(location.href);url.searchParams.set('city',id);url.searchParams.delete('place');url.searchParams.delete('region');history.pushState({city:id},'',url);}
  $('#scene').setAttribute('aria-label',`${data.title}交互式三维城市沙盘，${city.landmarks.length}个可探索地标`);
}
function toggleTour(){
  if(tour){stopTour();return;}const focus=city.landmarks.find(l=>l.id===selectedId);tourRoute=city.landmarks.filter(l=>focus?.cluster?l.cluster===focus.cluster:activeRegion==='all'||l.zone===activeRegion).map(l=>l.id);if(!tourRoute.length)return;
  setOrbit(false);tour=true;tourElapsed=0;tourIndex=Math.max(0,tourRoute.indexOf(selectedId));
  $('#tour-button').setAttribute('aria-pressed','true');$('#tour-text').textContent='暂停漫游';$('#tour-note').textContent=`本次漫游 ${tourRoute.length} 处 · 拖动即可暂停`;selectPlace(tourRoute[tourIndex],true);
}
function resize(){
  const w=innerWidth,h=innerHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();
  // Reserve some visual space for the sidebar while keeping the model's horizon centered.
  if(w>900)camera.setViewOffset(w,h,-Math.min(70,w*.042),25,w,h);else camera.setViewOffset(w,h,0,10,w,h);
  if(city&&!selectedId){if(activeRegion==='all')showOverview(false);else selectRegion(activeRegion,false);}requestAnimationFrame(()=>city&&updateScrollHint());
}
function updateLabels(){
  camera.getWorldDirection(cameraDirection);const occupied=[];const w=innerWidth,h=innerHeight;
  const districtOverview=usesRegionOverview()&&activeRegion==='all'&&!selectedId;
  document.body.classList.toggle('district-overview',districtOverview);
  const obstacles=districtOverview?$$('.topbar,.explorer,.light-switch,.right-controls,.place-card,.mini-map,.bottom-bar,.region-select-wrap').map(el=>el.getBoundingClientRect()).filter(r=>r.width&&r.height):[];
  const intersects=(a,b,pad=5)=>a.x<b.x+b.width+pad&&a.x+a.w>b.x-pad&&a.y<b.y+b.height+pad&&a.y+a.h>b.y-pad;
  const ordered=[...labels].sort((a,b)=>(b.id===selectedId)-(a.id===selectedId));
  ordered.forEach(l=>{
    projected.copy(l.position).project(camera);let x=(projected.x*.5+.5)*w, y=(-projected.y*.5+.5)*h;
    const width=l.element.offsetWidth||95,height=l.element.offsetHeight||28;
    let visible=projected.z>-1&&projected.z<1&&x>width/2+7&&x<w-width/2-8&&y>(w<=900?(regionDefinitions().length?265:205):93)&&y<h-(w<=900?215:94);
    if(l.kind==='region'?!districtOverview:districtOverview)visible=false;
    if(activeRegion!=='all'&&l.zone!==activeRegion)visible=false;
    let rect={x:x-width/2,y:y-height-16,w:width,h:height+12};
    if(l.kind==='region'&&districtOverview){
      visible=projected.z>-1&&projected.z<1;
      const candidates=[];
      for(let ring=0;ring<5;ring++)for(const [dx,dy] of [[0,-1],[-1,0],[1,0],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]]){
        const r={x:rect.x+dx*ring*width*.9,y:rect.y+dy*ring*height*1.25,w:width,h:height+5};
        candidates.push({...r,distance:Math.hypot(dx*ring*width*.9,dy*ring*height*1.25)});
      }
      const found=candidates.sort((a,b)=>a.distance-b.distance).find(r=>r.x>8&&r.x+r.w<w-8&&r.y>8&&r.y+r.h<h-8&&!obstacles.some(o=>intersects(r,o))&&!occupied.some(o=>intersects(r,{x:o.x,y:o.y,width:o.w,height:o.h})));
      if(found)rect=found;else visible=false;
    }else{
      if(w>900&&rect.x<310&&rect.y>105)visible=false;
      if(w>900&&rect.x+width>w-306&&rect.y>h-525&&rect.y<h-90)visible=false;
      if(l.id!==selectedId&&occupied.some(r=>Math.abs((r.x+r.w/2)-x)<(r.w+width)/2+5&&Math.abs((r.y+r.h/2)-(rect.y+rect.h/2))<(r.h+rect.h)/2+4))visible=false;
    }
    if(l.leader){l.leader.style.opacity=visible?'0.7':'0';for(const [key,value]of Object.entries({x1:x,y1:y,x2:rect.x+width/2,y2:rect.y+height}))l.leader.setAttribute(key,String(value));}
    l.element.style.opacity=visible?'1':'0';l.element.style.pointerEvents=visible&&labelVisibility?'auto':'none';l.element.setAttribute('aria-hidden',String(!visible||!labelVisibility));l.element.tabIndex=visible&&labelVisibility?0:-1;
    l.element.style.transform=`translate(${Math.round(rect.x)}px,${Math.round(rect.y)}px)`;if(visible)occupied.push(rect);
  });
  $('#compass-needle').style.transform=`rotate(${controls.getAzimuthalAngle()*180/Math.PI}deg)`;
}
async function photo(){
  try{
    renderer.render(scene,camera);const source=renderer.domElement;const output=document.createElement('canvas');output.width=source.width;output.height=source.height;const ctx=output.getContext('2d');ctx.drawImage(source,0,0);
    const s=output.width/1500;ctx.fillStyle=currentTheme==='night'?'#e6ebdc':'#2c5145';ctx.font=`${32*s}px "Songti SC",serif`;ctx.fillText(`城间漫游 · ${cities[cityId].title}`,45*s,65*s);ctx.font=`${13*s}px sans-serif`;ctx.fillText('一座城，一段停留。',47*s,94*s);
    const blob=await new Promise(resolve=>output.toBlob(resolve,'image/png'));if(!blob)throw new Error('照片生成失败');const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`城间漫游-${cities[cityId].title}-${{day:'白昼',sunset:'日落',night:'夜景'}[currentTheme]}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('照片已保存，留住这一刻的城市。');
  }catch(error){console.error(error);toast('照片暂时没有保存成功，请再试一次。');}
}
function bindEvents(){
  $$('[data-city]').forEach(b=>b.addEventListener('click',()=>switchCity(b.dataset.city)));
  $('#city-select').replaceChildren(...cityIds.map(id=>new Option(`${cities[id].serial} ${cities[id].title}`,id)));
  $('#city-select').addEventListener('change',e=>switchCity(e.target.value));
  $$('[data-light]').forEach(b=>b.addEventListener('click',()=>setTheme(b.dataset.light)));
  $('#reset-button').addEventListener('click',()=>showOverview());$('#tour-button').addEventListener('click',toggleTour);
  $('#place-select').addEventListener('change',e=>e.target.value?selectPlace(e.target.value):showOverview());
  $('#next-place').addEventListener('click',()=>{const i=city.landmarks.findIndex(l=>l.id===selectedId);selectPlace(city.landmarks[(i+1)%city.landmarks.length].id);});
  $('#labels-button').addEventListener('click',()=>{labelVisibility=!labelVisibility;document.body.classList.toggle('labels-hidden',!labelVisibility);$('#labels-button').setAttribute('aria-pressed',String(labelVisibility));});
  $('#orbit-button').addEventListener('click',()=>{stopTour();setOrbit(!autoOrbit);});
  $('#zoom-in').addEventListener('click',()=>zoom(.76));$('#zoom-out').addEventListener('click',()=>zoom(1.3));
  $('#north-button').addEventListener('click',()=>{stopTour();setOrbit(false);const d=camera.position.distanceTo(controls.target);const p=controls.target.clone().add(new THREE.Vector3(0,d*.75,d*.78));flyTo(p.toArray(),controls.target.toArray());});
  $('#photo-button').addEventListener('click',photo);$('#about-button').addEventListener('click',()=>$('#about-dialog').showModal());$('#close-about').addEventListener('click',()=>$('#about-dialog').close());
  $('#scope-note').addEventListener('click',()=>$('#about-dialog').showModal());
  $('#region-select').addEventListener('change',e=>selectRegion(e.target.value));
  $('#catalog-filter').addEventListener('change',e=>renderCatalog(e.target.value));
  for(const id of ['landmark-count','all-places-button'])$(`#${id}`).addEventListener('click',()=>$('#places-dialog').showModal());
  $('#close-places').addEventListener('click',()=>$('#places-dialog').close());
  $('#landmark-list').addEventListener('scroll',updateScrollHint,{passive:true});
  $('#about-dialog').addEventListener('click',e=>{if(e.target===$('#about-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  $('#search').addEventListener('input',()=>{activeRegion='all';syncRegionButtons();filterPlaces();});
  controls.addEventListener('start',()=>{tween=null;stopTour();setOrbit(false);});
  addEventListener('resize',resize);addEventListener('popstate',()=>switchCity(new URLSearchParams(location.search).get('city')||'chengdu',false));
  addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select')||document.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey)return;if(e.code==='Space'){e.preventDefault();toggleTour();}if(e.key==='Escape')showOverview();const nextCity=cityIds[Number(e.key)-1];if(nextCity)switchCity(nextCity);});
  document.addEventListener('visibilitychange',()=>{lastTime=performance.now();});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();toast('图形显示暂时中断，正在恢复。');});renderer.domElement.addEventListener('webglcontextrestored',()=>{toast('城市画面已恢复。');});
}
function zoom(factor){stopTour();setOrbit(false);const offset=camera.position.clone().sub(controls.target);const d=THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance);offset.setLength(d);flyTo(controls.target.clone().add(offset).toArray(),controls.target.toArray(),450);}
function frame(now){
  requestAnimationFrame(frame);if(document.hidden)return;
  const dt=THREE.MathUtils.clamp((now-lastTime)/1000,0,.06);lastTime=now;elapsed+=dt;
  if(tween){const t=tween.duration?Math.min(1,(now-tween.start)/tween.duration):1;const e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;camera.position.lerpVectors(tween.from,tween.to,e);controls.target.lerpVectors(tween.fromTarget,tween.toTarget,e);if(t===1)tween=null;}
  if(tour){tourElapsed+=dt;$('#tour-progress').style.transform=`scaleX(${Math.min(tourElapsed/TOUR_DURATION,1)})`;if(tourElapsed>=TOUR_DURATION){tourElapsed=0;tourIndex=(tourIndex+1)%tourRoute.length;selectPlace(tourRoute[tourIndex],true);}}
  city?.update?.(elapsed,dt);updateTheme(now);controls.update(dt);
  const b=city.bounds,marginX=(b.maxX-b.minX)*.17,marginZ=(b.maxZ-b.minZ)*.17;
  controls.target.x=THREE.MathUtils.clamp(controls.target.x,b.minX-marginX,b.maxX+marginX);controls.target.z=THREE.MathUtils.clamp(controls.target.z,b.minZ-marginZ,b.maxZ+marginZ);controls.target.y=THREE.MathUtils.clamp(controls.target.y,0,70);
  scene.fog.near=Math.max(650,camera.position.distanceTo(controls.target)+320);scene.fog.far=scene.fog.near+1100;
  renderer.render(scene,camera);if(now-latestFrame>50){updateLabels();latestFrame=now;}
}
async function start(){
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<=900?1.65:1.8));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=themes.day.exposure;renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-label','拖动旋转，滚轮缩放城市');$('#scene').append(renderer.domElement);
  scene=new THREE.Scene();scene.background=new THREE.Color(themes.day.bg);scene.fog=new THREE.Fog(themes.day.bg,650,1400);
  camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.5,5000);
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.075;controls.maxPolarAngle=Math.PI*.465;controls.minPolarAngle=.1;controls.minDistance=18;controls.maxDistance=1250;controls.autoRotateSpeed=.5;controls.screenSpacePanning=false;controls.panSpeed=.7;controls.rotateSpeed=.6;
  hemisphere=new THREE.HemisphereLight(themes.day.hemi,themes.day.hemiGround,themes.day.hemiIntensity);scene.add(hemisphere);
  sunlight=new THREE.DirectionalLight(themes.day.sun,themes.day.sunIntensity);sunlight.position.set(...themes.day.sunPosition);sunlight.castShadow=true;sunlight.shadow.mapSize.set(2048,2048);Object.assign(sunlight.shadow.camera,{left:-170,right:170,top:170,bottom:-170,near:1,far:950});sunlight.shadow.bias=-.00025;sunlight.shadow.normalBias=.14;sunlight.shadow.radius=3;scene.add(sunlight,sunlight.target);
  const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();const environment=pmrem.fromScene(room,.035);scene.environment=environment.texture;scene.environmentIntensity=.23;room.dispose();pmrem.dispose();
  ground=new THREE.Mesh(new THREE.PlaneGeometry(5000,5000),new THREE.MeshStandardMaterial({color:themes.day.ground,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-5.3;ground.receiveShadow=true;scene.add(ground);
  bindEvents();resize();const params=new URLSearchParams(location.search);let savedTheme;try{savedTheme=localStorage.getItem('city-atlas-light');}catch{}currentTheme=params.get('light')||(themes[savedTheme]?savedTheme:'day');if(!themes[currentTheme])currentTheme='day';
  switchCity(cities[params.get('city')]?params.get('city'):'chengdu',false);resize();updateTheme(performance.now());renderer.render(scene,camera);updateLabels();
  $('#loading').classList.add('done');document.documentElement.dataset.ready='true';lastTime=performance.now();requestAnimationFrame(frame);
  if(params.get('place'))selectPlace(params.get('place'));else if(params.get('region'))selectRegion(params.get('region'));
}
start().catch(error=>{console.error(error);$('#loading h2').textContent='城市暂时没能展开';$('#loading-text').textContent='请刷新重试，并确认浏览器已开启硬件加速。';$('.loading-track').style.display='none';});

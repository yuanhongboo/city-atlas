import * as THREE from 'three';
import { block, cylinder, ribbon } from '../scene-kit.js';

// 这五条东西向街道按从北到南的次序表达；沙盘间距与路段长度经过压缩。
const STREET_NAMES = ['天府一街', '天府二街', '天府三街', '天府四街', '天府五街'];
const STREET_THEMES = [
  ['环球中心南侧 · 高新街道起点', '从环球中心南侧进入高新区的东西向街道网，向西连接办公街区与树荫步道。模型用公交站、沿街店面和午休小广场表现街道日常。'],
  ['通勤街巷 · 街角咖啡', '树阵、公交候车亭和街角座椅连接办公楼与公共空间。这里用开放的底层店面与楼间绿地，概括高新区工作和生活相接的街景。'],
  ['软件园片区 · 办公与生活', '天府一街到五街一带与天府软件园所在的高新南区相连。玻璃办公楼、步行连廊和小型公共广场，表现园区与城市街道之间的开放联系。'],
  ['街区绿地 · 下班后散步', '连续街道之间留出树荫、口袋绿地与休憩廊架。模型把办公楼尺度放低，让路口、行人和下班后的散步空间都能被看见。'],
  ['软件园南缘 · 高新生活', '软件园官方介绍将天府五街列为核心区的南侧边界。街道、园区入口、公共座椅与草坪相连，再沿天府大道继续向南进入天府新区。']
];
export const southStreetLandmarks = STREET_NAMES.map((name, i) => {
  const z = 134 + i * 13;
  return {
    id: `tianfu-${['1st', '2nd', '3rd', '4th', '5th'][i]}`,
    name,
    subtitle: STREET_THEMES[i][0],
    description: `${STREET_THEMES[i][1]}各街路段长度、楼宇、园区与广场是城市印象概括，不对应具体公司地址，也不用于导航。`,
    position: [-43 + (i % 2) * 9, 6, z],
    camera: [51, 135, z + 83],
    target: [-20, 1, z],
    zone: 'south',
    category: '高新街道',
    roadPath: [[-98, z], [-52, z], [-8, z], [66, z]],
    related: [i > 0 ? `tianfu-${['1st', '2nd', '3rd', '4th'][i - 1]}` : null, i < 4 ? `tianfu-${['2nd', '3rd', '4th', '5th'][i]}` : null].filter(Boolean)
  };
});

export const southStreetRoads = southStreetLandmarks.map(s => s.roadPath);
export const southStreetClearing = [-16, 164.5, 87, 36];
export function inSouthStreetClearing(x, z) {
  const [cx, cz, rx, rz] = southStreetClearing;
  return Math.abs(x - cx) < rx && Math.abs(z - cz) < rz;
}

// 底层道路与普通街区统一避让这些街道。树、人仍接入主场景的实例化批次。
export function buildSouthStreets(parent, { grow, person, night, building }) {
  const crossroads = [-80, -52, -8];
  const buildingSlots = [-92, -66, -38, -22, 13, 37, 58];
  const plazaSlots = [2, 1, 5, 2, 1];
  const facades = ['#688d8a', '#c5d0c2', '#628b90', '#b4c1b1', '#819b92'];
  const highlights = ['#c59b67', '#bb946d', '#749da0', '#96aa7c', '#a09f73'];
  const putTree = (x, z, s = .68) => grow(x, z, s, .38, true);
  const bench = (g, x, z) => {
    block(g, x, z, 1.65, .13, .48, '#b69a6c', .76);
    block(g, x, z + .26, 1.65, .49, .1, '#b69a6c', .83);
    for (const dx of [-.56, .56]) block(g, x + dx, z, .13, .38, .39, '#738071', .38);
  };
  const shelter = (g, x, z) => {
    for (const dx of [-1.4, 1.4]) block(g, x + dx, z, .12, 2.15, .12, '#688078', .4);
    block(g, x, z, 3.55, .16, 1.9, '#d8d4ba', 2.55);
    block(g, x, z + .65, 2.95, 1.55, .08, '#92b1a5', .75);
    bench(g, x, z + .2);
    block(g, x + 2.15, z, .1, 2.5, .1, '#738071', .38);
    block(g, x + 2.15, z, .55, .8, .14, night, 2.1);
  };
  southStreetLandmarks.forEach((landmark, i) => {
    const z = landmark.roadPath[0][1];
    const g = new THREE.Group(); g.name = landmark.name; g.userData.landmarkId = landmark.id;
    g.userData.streetRoadPath = landmark.roadPath.map(p => [...p]);
    g.userData.buildingFootprints = []; g.userData.crosswalks = crossroads.map(x => [x, z]);
    parent.add(g);
    // 连续侧向人行道、双向车行道与细窄自行车带，交叉口保持开敞。
    ribbon(g, landmark.roadPath, 8.1, '#ded5bc', .35, 100);
    ribbon(g, landmark.roadPath, 4.2, '#a9afa1', .38, 100);
    for (const side of [-1, 1]) {
      ribbon(g, landmark.roadPath.map(([x, zz]) => [x, zz + side * 2.65]), .52, '#a6b699', .40, 100);
    }
    // 南北接续口覆回车道，避免人行道横截大道。
    for (const x of crossroads) block(g, x, z, 3.65, .025, 8.2, '#a9afa1', .407);
    for (let x = -96; x < 65; x += 3.9) {
      if (crossroads.some(cx => Math.abs(x - cx) < 4.8)) continue;
      block(g, x, z, 1.65, .017, .095, '#f3e8ca', .431);
    }
    for (const x of crossroads) {
      for (const side of [-1, 1]) {
        // 斑马线跨越东西车道；另一组跨越南北车道。
        for (let d = -1.6; d <= 1.6; d += .65) {
          block(g, x + side * 3.45, z + d, 1.5, .018, .31, '#f3ecd7', .434);
          block(g, x + d, z + side * 3.05, .31, .018, 1.25, '#f3ecd7', .434);
        }
        block(g, x + side * 2.7, z + 4, .1, 2.75, .1, '#63776b', .4);
        block(g, x + side * 2.7, z + 4, .36, .64, .26, '#496258', 2.7);
        cylinder(g, x + side * 2.7, z + 4.16, .1, .1, .1, night, 2.95, 6).rotation.x = Math.PI / 2;
      }
    }
    // 两边树阵只在路口净空之外种植，街道由树影与人尺度细节串联。
    for (let x = -95; x < 65; x += 6.5) {
      if (crossroads.some(cx => Math.abs(x - cx) < 6)) continue;
      for (const side of [-1, 1]) {
        block(g, x, z + side * 3.45, .9, .09, .85, '#bcc59e', .41);
        putTree(x, z + side * 3.45, .59 + ((i + Math.round(x)) % 3 + 3) % 3 * .045);
      }
    }
    // 每条街南侧一排较浅办公楼，楼间留出街角广场和步行出入口。
    buildingSlots.forEach((x, col) => {
      // 压缩后的西博城前场位于五街东端以南，保持这段前场开敞。
      if (i === 4 && col >= 4) return;
      const cz = z + 6.65;
      if (col === plazaSlots[i]) {
        block(g, x, cz, 13.5, .14, 5.7, i === 3 ? '#aec397' : '#d5ceb1', .37);
        for (const dx of [-4.8, 4.8]) { putTree(x + dx, cz + .2, .85); bench(g, x + dx * .6, cz + .9); }
        if (i === 2) {
          cylinder(g, x, cz, 1.45, 1.6, .25, '#acb99e', .51, 24);
          cylinder(g, x, cz, .45, .75, 2.7, '#b7bda2', .76, 6);
          block(g, x, cz, .14, 3.1, 3.1, highlights[i], 1.15).rotation.z = .45;
        } else if (i === 3) {
          for (const dx of [-2.2, 2.2]) for (const dz of [-1.2, 1.2]) block(g, x + dx, cz + dz, .14, 2.35, .14, '#8a8d65', .53);
          for (let dx = -2.6; dx <= 2.6; dx += .65) block(g, x + dx, cz, .2, .13, 3.2, '#b8b790', 2.9);
        } else {
          for (const dx of [-1.7, 1.7]) {
            cylinder(g, x + dx, cz, .62, .62, .12, '#bba071', 1.03, 10);
            cylinder(g, x + dx, cz, .055, .07, .6, '#817b5d', .43, 6);
            for (const dz of [-.85, .85]) block(g, x + dx, cz + dz, .47, .53, .47, '#bca879', .42);
          }
        }
        for (let p = 0; p < 4; p++) person(x - 3 + p * 1.9, cz - 1.8);
        return;
      }
      const w = col === 4 ? 13 : col % 2 ? 11 : 8.4;
      const d = 5.7, h = 5.4 + ((i * 3 + col * 2) % 6) * 1.7;
      g.userData.buildingFootprints.push([x, cz, w, d]);
      building(g, x, cz, w, 2.5, d, '#d4d4be', .47);
      building(g, x + (col % 2 ? .6 : -.45), cz + .1, w - 1.2, h - 2.4, d - .4, facades[i], 2.97);
      block(g, x, cz + .1, w - .75, .28, d, '#dfe0ca', h + .55);
      block(g, x + 1, cz + .3, w * .35, .6, d * .5, '#bcc3ad', h + .83);
      for (let xx = x - w / 2 + .8; xx < x + w / 2 - .3; xx += 1.3) {
        block(g, xx, cz - d / 2 - .035, .82, 1.5, .045, night, .9);
      }
      block(g, x, cz - d / 2 - .24, w - .6, .14, .9, highlights[i], 2.65);
      for (let y = 3.5; y < h; y += 1.6) {
        block(g, x, cz - d / 2 + .15, w - 1.4, .13, .055, '#c5d4c6', y);
        block(g, x, cz + d / 2 - .07, w - 1.4, .13, .055, '#c5d4c6', y);
      }
      if (col % 2 === 0) {
        // 顶层露台和遮阳格栅形成园区楼宇之间的差别。
        for (let xx = x - w / 2 + 1; xx < x + w / 2 - .5; xx += 1.5) block(g, xx, cz - d / 2 + .2, .095, h - 3.2, .08, '#b4c8bd', 3.15);
      }
      person(x - w / 2 - .7, z + 4.65);
    });
    shelter(g, i % 2 ? -61 : -30, z - 3.35);
    for (const x of [-88, -43, 22, 60]) {
      block(g, x, z - 3.5, .12, 2.85, .12, '#718472', .4);
      block(g, x + .25, z - 3.5, .75, .17, .42, night, 3.25);
    }
    // 非品牌化街道号柱，一至五个浅色刻度与 UI 独立标签对应。
    block(g, -16, z - 3.75, .62, 2.65, .5, highlights[i], .4);
    for (let tick = 0; tick <= i; tick++) block(g, -16, z - 4.01, .35, .14, .03, '#eee4c9', 1 + tick * .34);
  });
}

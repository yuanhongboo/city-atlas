export const cities = {
  chengdu: { factory:'createChengdu', load:()=>import('./cities/chengdu.js'), region:'西南山水', tagline:'街巷茶香 · 天府南城', title:'成都', seal:'蓉', serial:'01', verse:'从少城茶香，到兴隆湖畔。', coordinates:'30.67° N · 104.07° E', terrain:'老城 · 南城 · 天府新区', intro:'沿着中轴，一路向南', description:'从文殊院、人民公园，到金融城双子塔，再沿天府大道走到兴隆湖。选择一个片区，继续这座城的记忆。', category:'此刻，俯瞰蓉城' },
  chongqing: { factory:'createChongqing', load:()=>import('./cities/chongqing.js'), region:'西南山水', tagline:'两江九区 · 山城台阶', title:'重庆', seal:'渝', serial:'02', verse:'九区各有景，一城皆山水。', coordinates:'29.56° N · 106.57° E', terrain:'传统主城九区', intro:'九区风景，慢慢逛', description:'从两江交汇到缙云山，从磁器口到南温泉。点一个区，看看这座城不同的日常。', category:'此刻，俯瞰九区', scopeLabel:'传统分区 · 口径说明 ↗', scopeSource:{url:'https://wap.cq.gov.cn/zwgk/zfxxgkml/szfwj/qtgw/202511/t20251107_15148513.html',label:'查看重庆市政府行政区划调整公告 ↗'} },
  shenzhen: { factory:'createShenzhen', load:()=>import('./cities/shenzhen.js'), region:'海滨岛屿', tagline:'湾畔天际线 · 东部山海', title:'深圳', seal:'深', serial:'03', verse:'从城市天际线，走向山海。', coordinates:'22.54° N · 114.06° E', terrain:'湾畔 · 街巷 · 山海', intro:'沿着海岸，遇见深圳', description:'从平安金融中心、市民中心，到后海人才公园与前海，再向东走到大梅沙和大鹏。选一片熟悉的地方，慢慢逛。', category:'此刻，俯瞰鹏城' },
  hongkong: { factory:'createHongkong', load:()=>import('./cities/hongkong.js'), region:'海滨岛屿', tagline:'维港渡轮 · 港岛九龙', title:'香港', seal:'港', serial:'04', verse:'渡轮穿过海港，灯火爬上山。', coordinates:'22.30° N · 114.17° E', terrain:'港岛 · 九龙 · 离岛', intro:'隔着维港，看见香港', description:'从中环的摩天楼，到尖沙咀钟楼与西九海滨；从旺角街巷，到大屿山的天坛大佛。跟着渡轮，在山与海之间停留。', category:'此刻，俯瞰香江' },
  dalian: {title:'大连',seal:'连',serial:'05',region:'海滨岛屿',tagline:'海湾广场 · 山海半岛',factory:'createDalian',load:()=>import('./cities/dalian.js')},
  lijiang: {title:'丽江',seal:'丽',serial:'06',region:'西南山水',tagline:'古城水巷 · 玉龙雪山',factory:'createLijiang',load:()=>import('./cities/lijiang.js')},
  okinawa: {title:'冲绳',seal:'沖',serial:'07',region:'海滨岛屿',tagline:'日本冲绳 · 琉球岛岸',factory:'createOkinawa',load:()=>import('./cities/okinawa.js')},
  wenzhou: {title:'温州',seal:'瓯',serial:'08',region:'江南徽州',tagline:'瓯江古城 · 雁荡山水',factory:'createWenzhou',load:()=>import('./cities/wenzhou.js')},
  huangshan: {title:'安徽黄山',seal:'岳',serial:'09',region:'江南徽州',tagline:'奇峰松云 · 徽州村落',factory:'createHuangshan',load:()=>import('./cities/huangshan.js')},
  hengdian: {title:'横店',seal:'影',serial:'10',region:'江南徽州',tagline:'影视宫苑 · 江南街景',factory:'createHengdian',load:()=>import('./cities/hengdian.js')},
  wuzhen: {title:'乌镇',seal:'乌',serial:'11',region:'江南徽州',tagline:'枕水人家 · 东西两栅',factory:'createWuzhen',load:()=>import('./cities/wuzhen.js')},
  dali: {title:'大理',seal:'理',serial:'12',region:'西南山水',tagline:'苍山洱海 · 白族村落',factory:'createDali',load:()=>import('./cities/dali.js')},
  zunyi: {title:'遵义',seal:'遵',serial:'13',region:'西南山水',tagline:'湘江老城 · 关隘村寨',factory:'createZunyi',load:()=>import('./cities/zunyi.js')},
  xishui: {title:'贵州习水',seal:'习',serial:'14',region:'西南山水',tagline:'土城渡口 · 丹霞山林',factory:'createXishui',load:()=>import('./cities/xishui.js')},
};
export const cityIds=Object.keys(cities);

export async function loadCity(id){
  const entry=cities[id];
  const module=await entry.load();
  if(module.metadata)Object.assign(entry,module.metadata);
  return module[entry.factory];
}

# 城间漫游：街巷与山海

14 个可交互的 Three.js 微缩目的地，从城市街巷走向古镇、海岛与山地。每个目的地保留自己的水系、地形和建筑意象，支持分区浏览、地标近景和昼夜漫游。

## 在线浏览

- [成都地图](https://yuanhongboo.github.io/city-atlas/?city=chengdu&light=day)
- [重庆地图](https://yuanhongboo.github.io/city-atlas/?city=chongqing&light=day)
- [深圳地图](https://yuanhongboo.github.io/city-atlas/?city=shenzhen&light=day)
- [香港地图](https://yuanhongboo.github.io/city-atlas/?city=hongkong&light=day)
- [重庆大学城](https://yuanhongboo.github.io/city-atlas/?city=chongqing&light=day&place=university-town)

## 新增十地

| 目的地 | 地标数 | 沙盘主题 |
| --- | ---: | --- |
| [大连](https://yuanhongboo.github.io/city-atlas/?city=dalian) | 12 | 星海广场、海湾大桥、旅顺与金石滩 |
| [丽江](https://yuanhongboo.github.io/city-atlas/?city=lijiang) | 12 | 大研古城、木府、玉龙雪山与蓝月谷 |
| [日本冲绳](https://yuanhongboo.github.io/city-atlas/?city=okinawa) | 12 | 琉球城址、那霸街区与北部岛岸 |
| [温州](https://yuanhongboo.github.io/city-atlas/?city=wenzhou) | 12 | 瓯江、雁荡山、楠溪江与洞头 |
| [安徽黄山](https://yuanhongboo.github.io/city-atlas/?city=huangshan) | 11 | 迎客松、奇峰云谷与徽州聚落 |
| [横店](https://yuanhongboo.github.io/city-atlas/?city=hengdian) | 8 | 影视宫苑、江南街景与山寺 |
| [乌镇](https://yuanhongboo.github.io/city-atlas/?city=wuzhen) | 8 | 东西两栅、水阁桥梁与文化场馆 |
| [大理](https://yuanhongboo.github.io/city-atlas/?city=dali) | 12 | 苍山洱海、三塔与环湖村落 |
| [遵义](https://yuanhongboo.github.io/city-atlas/?city=zunyi) | 10 | 湘江老城、会址、关隘与村寨 |
| [贵州习水](https://yuanhongboo.github.io/city-atlas/?city=xishui) | 8 | 土城、四渡赤水纪念地与丹霞山林 |

新增 105 处地标，连同原四城共 184 处。目的地目录按名称或主题搜索；手机顶部仍提供直接选择。外围景点与城区的距离经过压缩，浏览片区不代表行政区划。尤其黄山同时呈现山岳景区与徽州聚落，冲绳压缩本岛南北距离，习水采用本县地标并单独保留遵义入口。

资料与造型依据见 [大连温州冲绳来源](docs/大连温州冲绳来源.md)、[丽江大理乌镇横店来源](docs/丽江大理乌镇横店来源.md)、[黄山遵义习水来源](docs/黄山遵义习水来源.md)。

## 启动

需要 Node.js 22.12 或更新版本。首次运行先安装依赖：

```sh
npm install
npm run dev
```

打开终端显示的本地地址。城市入口为 `?city=chengdu`、`?city=chongqing`、`?city=shenzhen` 和 `?city=hongkong`。加入 `&light=day`、`&light=sunset`、`&light=night` 可指定光线；加入 `&place=hongyadong` 等地标 ID 可直接飞到该处。

```sh
npm run verify
npm run build
npm run preview
```

`dist/` 是构建后的静态网站，可由任意静态 HTTP 服务托管。构建产物包含全部运行依赖，不依赖外部模型、图片、字体、地图瓦片或 API 密钥。请通过 HTTP 打开，浏览器的 `file://` 限制不适合运行此模块应用。

## 城市与目的地

| 成都 | 重庆 |
| --- | --- |
| 天府广场 | 朝天门与来福士 |
| 宽窄巷子 | 洪崖洞 |
| 太古里与 IFS 爬墙熊猫 | 千厮门大桥 |
| 安顺廊桥 | 解放碑 |
| 望江楼 | 重庆大剧院 |
| 武侯祠与锦里 | 李子坝穿楼列车 |
| 环球中心 | 长江索道 |
| 熊猫基地 | 南山一棵树 |

成都另外包含 **文殊院、人民公园、金融城双子塔、天府新区·西博城、兴隆湖、兰桂坊、九眼桥，以及天府一街至五街**，共 20 个地标。五条街按北到南顺序分别建模、标注与定位。沙盘从老城向南延伸，按“老城街巷 / 高新南城 / 天府新区”分区浏览。环球中心保留独立模型与入口。安顺廊桥、兰桂坊、九眼桥可通过详情卡中的“附近逛逛”互相跳转。

重庆按传统“主城九区”组织，共 27 个地标：

| 城市记忆分区 | 代表地标 |
| --- | --- |
| 渝中区 | 来福士、洪崖洞、千厮门大桥、解放碑、李子坝、长江索道、人民大礼堂 |
| 江北区 | 重庆大剧院、观音桥 |
| 南岸区 | 南山一棵树、弹子石老街 |
| 沙坪坝区 | 磁器口、重庆大学老校区、大学城总览、重庆大学虎溪校园、川美虎溪·罗中立美术馆、熙街 |
| 九龙坡区 | 黄桷坪涂鸦街、重庆动物园 |
| 大渡口区 | 重庆工业博物馆、义渡古镇 |
| 北碚区 | 缙云山、西南大学 |
| 渝北区 | 中央公园、江北机场 |
| 巴南区 | 龙洲湾滨江、南温泉 |

全景先显示九个分区入口，下拉框可直接选区；完整目录也支持按区筛选。选区后启动漫游，会沿该区地标游览。可使用 `?city=chongqing&region=beibei` 等地址直接进入片区。

大学城保留独立街区与总览入口，位于重庆大学老校区西侧。点击 `?city=chongqing&place=university-town` 可进入总览，也可从沙坪坝详情卡直达。选中大学城或其校园、熙街后启动漫游，会游览该组四处地标。

校园与街区的机构资料和造型范围见 [重庆大学城来源](docs/重庆大学城来源.md)。

九区名称采用 2025 年调整前的传统口径，作为城市记忆与浏览分区；模型没有行政边界层。[2025 年重庆市政府公告](https://wap.cq.gov.cn/zwgk/zfxxgkml/szfwj/qtgw/202511/t20251107_15148513.html)说明江北、渝北、北碚的行政区划调整，网页“分区口径说明”中也记录了这一边界。

九区地标的机构资料与造型范围见 [重庆九区地标来源](docs/重庆九区地标来源.md)。

深圳共 **16 处地标**，按五个浏览片区组织：

| 浏览片区 | 地标 |
| --- | --- |
| 福田中轴 | 平安金融中心、市民中心、莲花山、华强北 |
| 罗湖街巷 | 地王大厦、京基 100、东门老街 |
| 南山后海 | 人才公园、春笋、深圳大学、世界之窗 |
| 宝安前海 | 欢乐港湾、前海 |
| 东部山海 | 大梅沙、大鹏所城、大运中心 |

香港共 **16 处地标**，按四个浏览片区组织：

| 浏览片区 | 地标 |
| --- | --- |
| 港岛山海 | 国际金融中心、中银大厦、太平山顶、会展中心、中环至半山自动扶梯 |
| 九龙海滨 | 天星码头、尖沙咀钟楼、星光大道、西九文化区、环球贸易广场 |
| 九龙街巷 | 黄大仙祠、旺角、志莲净苑 |
| 离岛青马 | 天坛大佛、香港国际机场、青马大桥 |

深圳以深圳湾海岸、福田中轴和东部山海构成沙盘；香港以维多利亚港分隔港岛与九龙，西侧另布置大屿山和机场。片区仅用于组织浏览，不代表行政边界；外围地点的距离经过压缩。官方来源和造型取舍见 [深圳地标来源](docs/深圳地标来源.md) 与 [香港地标来源](docs/香港地标来源.md)。

深圳与香港均支持片区直达，例如 `?city=shenzhen&region=nanshan`、`?city=hongkong&region=harbour`，以及地标直达 `?city=shenzhen&place=pingan`、`?city=hongkong&place=star-ferry`。

支持旋转、缩放、平移、地标飞行、三种光线、逐站导览、自动环绕、隐藏标签和下载城市照片。点击“全部地标”可打开按片区排列的完整目录；列表下方会提示尚未显示的地点数量。手机提供 14 地城市选择、片区按钮或下拉框、完整目录和地标下拉菜单。双指用于缩放与平移。

空格控制导览，Esc 回全景，数字 1–9 切换目录中的前九个目的地；顶部目的地目录可搜索和选择全部 14 地。导览中操作地图会暂停导览。

## 结构

- `src/main.js`：场景、灯光、相机、目的地目录与交互。
- `src/city-catalog.js`：14 地轻量目录与动态模块入口。
- `src/destination-kit.js`：新增场景的底座、独立地标、相机取景、实例化与静态合并。
- `src/heritage-kit.js`：古镇、园寺、石桥等可组合几何。
- `src/scene-kit.js`：建筑与地形几何工具。
- `src/cities/chengdu.js`、`chongqing.js`、`shenzhen.js`、`hongkong.js`：独立城市模块和地标配置。
- `src/cities/chengdu-south-streets.js`：天府一街至五街的道路、街区和地标数据。
- `src/cities/chongqing-district-layout.js`：重庆九区地形、河道、区属与相机。
- `src/cities/chongqing-district-landmarks.js`：九区新增地标的独立建筑模型。
- `src/cities/chongqing-university-town.js`：大学城交通广场、重大虎溪、川美虎溪和熙街模型。
- `src/style.css`：桌面与手机布局。
- `docs/`：资料依据、艺术化边界和验收记录。
- `scripts/verify-scenes.mjs`：场景与动画数值检查。

一般建筑、树木和窗格使用实例化，静态细节按材质合并。模型采用固定随机种子，动画按经过时间更新，切换目的地按需加载模块，并复用最近三个模型；超过缓存容量的几何和材质在不被其他缓存场景引用时释放。

## 来源与范围

灵感来自 [SuSu 的杭州 Three.js 演示](https://x.com/NFT_Chen/status/2096143589151756638)，全部目的地的代码、建筑和交互独立制作。地标布局与建筑特征的来源记录在 [成都资料](docs/chengdu-sources.md) 和 [重庆资料](docs/chongqing-sources.md)。

高新五街的机构依据另见 [天府街道来源](docs/天府街道来源.md)。这是城市印象沙盘：道路、距离、地形及建筑尺度经艺术化压缩，普通楼宇并不对应真实门牌。适合浏览、欣赏和继续扩展，不能用于实际导航。源码包含 GitHub Pages 发布工作流，也支持本地运行。


本轮场景、浏览器和异步导航验证见 [十地扩展验证记录](docs/十地扩展验证记录.md)。

## GitHub Pages 自动发布

推送到仓库默认分支会运行 `.github/workflows/pages.yml`：安装锁定依赖、验证场景、构建并发布 `dist/`。也可从 GitHub Actions 手动运行。

工作流从 GitHub Pages 读取实际网站路径，再传给 Vite；本地默认使用相对资源路径，因此同一份源码可用于本机和项目子路径。发布权限只授予部署作业，动作版本固定到已核对的提交。

如果复用到其他仓库，先在仓库的 Settings → Pages 将来源设为 GitHub Actions，并更新本页的在线链接。场景源码无需更改账号或仓库路径。

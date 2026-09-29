(function () {
  'use strict';

  const data = {
    meta: {
      version: 'V2.0',
      site: '蒙阴·玉皇山良种繁育基地',
      dataDate: '2026-09-29',
      notice: '固定模拟样例，不代表实际存栏、收入、设备效果或审批结论',
    },
    nav: {
      dashboard: '综合大屏',
      production: '生产工作台',
      health: '健康防疫',
      breeding: '良种繁育',
      environment: '环境设备',
      trace: '采茸追溯',
      quality: '质量库存',
      assets: '资产经营',
      farmers: '农户服务',
      analytics: '管理分析',
      foundation: '技术底座',
    },
    scenarios: {
      800: { herd: 786, female: 468, male: 182, young: 136, farmers: 10, capacity: 800 },
      1600: { herd: 1542, female: 924, male: 352, young: 266, farmers: 18, capacity: 1600 },
    },
    deer: [
      { id: 'MY-D-0028', name: '玉华028', sex: '母', age: '4岁2月', pen: '繁育舍 A2', purpose: '核心种用', status: '重点观察', source: '合法引种批次 IN-2024-03', father: 'MY-M-0012', mother: 'MY-F-0104', parentStatus: '已确认', score: 91.6, weight: 128.4, events: ['2026-09-29 活动趋势下降，规则触发待核实', '2026-09-03 妊检记录：待复查', '2026-05-16 性能测定完成'] },
      { id: 'MY-M-0117', name: '沂蒙117', sex: '公', age: '5岁8月', pen: '产茸舍 B1', purpose: '种用/产茸', status: '正常', source: '基地出生', father: 'MY-M-0031', mother: 'MY-F-0022', parentStatus: '已确认', score: 94.2, weight: 176.8, events: ['2026-08-18 采茸事件关联批次 RB-260818-01', '2026-06-08 性能测定完成'] },
      { id: 'MY-F-0091', name: '云岫091', sex: '母', age: '3岁7月', pen: '繁育舍 A3', purpose: '后备种用', status: '待观察', source: '合作户交付', father: '候选 2 头', mother: 'MY-F-0040', parentStatus: '父本候选', score: 86.8, weight: 116.2, events: ['2026-09-28 行为趋势进入观察窗口', '2026-07-02 亲本样本复核中'] },
      { id: 'MY-M-0148', name: '岱青148', sex: '公', age: '2岁6月', pen: '普通舍 B3', purpose: '后备产茸', status: '正常', source: '基地出生', father: 'MY-M-0012', mother: 'MY-F-0068', parentStatus: '已确认', score: 88.4, weight: 149.7, events: ['2026-09-15 转群至普通舍 B3', '2026-08-30 称重完成'] },
      { id: 'MY-F-0156', name: '松露156', sex: '母', age: '1岁9月', pen: '后备舍 C1', purpose: '后备种用', status: '正常', source: '基地出生', father: '未知', mother: 'MY-F-0109', parentStatus: '父本未知', score: 82.1, weight: 97.5, events: ['2026-09-22 性能测定完成', '2026-04-11 断奶事件确认'] },
    ],
    pens: [
      { id: 'A1', name: '繁育舍 A1', type: '核心繁育', count: 68, capacity: 80, temp: 21.8, humidity: 66, state: '正常', water: '已巡检', disinfect: '已完成', owner: '王秀兰' },
      { id: 'A2', name: '繁育舍 A2', type: '核心繁育', count: 72, capacity: 80, temp: 23.6, humidity: 79, state: '关注', water: '已巡检', disinfect: '待完成', owner: '李金海' },
      { id: 'A3', name: '繁育舍 A3', type: '核心繁育', count: 64, capacity: 80, temp: 22.9, humidity: 82, state: '告警', water: '待巡检', disinfect: '已完成', owner: '周晓梅' },
      { id: 'B1', name: '产茸舍 B1', type: '产茸公鹿', count: 96, capacity: 110, temp: 22.2, humidity: 68, state: '正常', water: '已巡检', disinfect: '已完成', owner: '张永刚' },
      { id: 'B3', name: '普通舍 B3', type: '普通饲养', count: 104, capacity: 120, temp: 23.1, humidity: 70, state: '正常', water: '已巡检', disinfect: '已完成', owner: '赵晓' },
      { id: 'Q1', name: '隔离舍 Q1', type: '隔离观察', count: 7, capacity: 16, temp: 22.0, humidity: 65, state: '受控', water: '已巡检', disinfect: '已完成', owner: '陈牧' },
    ],
    tasks: [
      { id: 'TK-0929-01', title: 'A3 饮水巡检', module: '生产', owner: '周晓梅', due: '10:00', status: '待执行', priority: '高' },
      { id: 'TK-0929-02', title: 'A2 消毒任务', module: '生产', owner: '李金海', due: '11:30', status: '待执行', priority: '中' },
      { id: 'TK-0929-03', title: 'Q1 隔离观察复核', module: '健康', owner: '陈牧', due: '09:50', status: '执行中', priority: '高' },
      { id: 'TK-0929-04', title: 'B1 采茸工位校验', module: '追溯', owner: '孙质量', due: '14:00', status: '待执行', priority: '中' },
      { id: 'TK-0929-05', title: '晚班交接确认', module: '生产', owner: '值班组', due: '18:00', status: '待执行', priority: '低' },
    ],
    alerts: [
      { id: 'AL-260929-001', level: '告警', type: '健康风险', subject: 'MY-D-0028', location: '繁育舍 A2', time: '09:42', source: '规则基线 R-H-017', model: '健康辅助 / 影子运行', quality: 'B｜活动数据完整，人工观察待补', evidence: ['近 6 小时活动量较个体基线下降 31%', 'A2 湿度连续 40 分钟高于建议区间', '历史妊检记录提示需复查'], suggestion: '建议饲养员现场核实，必要时由兽医评估。不得据此自动诊断或用药。', status: '待受理' },
      { id: 'AL-260929-002', level: '关注', type: '环境风险', subject: 'A3', location: '繁育舍 A3', time: '09:36', source: '本地阈值 R-E-004', model: '规则引擎', quality: 'A｜探头在校准有效期内', evidence: ['相对湿度 82%', '本地控制器已按批准规则启动通风'], suggestion: '复核通风反馈点并观察 20 分钟恢复趋势。', status: '处理中' },
      { id: 'AL-260929-003', level: '设备', type: '数据异常', subject: 'GW-BLE-03', location: '普通舍 B3', time: '09:28', source: '设备完整性规则', model: '非 AI', quality: 'C｜上行间歇缺失', evidence: ['近 15 分钟丢失 4 个上报窗口', '边缘缓存工作正常'], suggestion: '检查供电与网络，不得将设备离线解释为动物异常。', status: '待受理' },
    ],
    workOrders: [
      { id: 'WO-260929-006', alertId: 'AL-260929-002', title: 'A3 湿度超限核实', owner: '工程值班', status: '处置中', created: '09:37', result: '已确认风机反馈，等待恢复趋势' },
      { id: 'WO-260929-004', alertId: '', title: 'Q1 隔离观察复核', owner: '陈牧', status: '待复核', created: '08:40', result: '现场观察记录已提交' },
    ],
    devices: [
      { id: 'ENV-A2-01', name: '温湿度探头', zone: 'A2', protocol: 'RS485/Modbus', status: '在线', valid: '99.8%', calibrated: '2026-08-16', due: '2027-02-16' },
      { id: 'ENV-A3-01', name: '温湿度探头', zone: 'A3', protocol: 'RS485/Modbus', status: '在线', valid: '99.6%', calibrated: '2026-08-16', due: '2027-02-16' },
      { id: 'GW-BLE-03', name: 'BLE 汇聚网关', zone: 'B3', protocol: 'BLE/Ethernet', status: '波动', valid: '94.1%', calibrated: '不适用', due: '检查中' },
      { id: 'SCALE-B1-02', name: '采茸电子秤', zone: 'B1', protocol: 'USB', status: '在线', valid: '100%', calibrated: '2026-09-05', due: '2026-12-05' },
      { id: 'EDGE-01', name: '边缘节点', zone: '中心机房', protocol: 'MQTT over TLS', status: '在线', valid: '99.9%', calibrated: '不适用', due: '正常' },
      { id: 'CTRL-A-01', name: '本地安全控制器', zone: 'A 区', protocol: '隔离控制网', status: '本地自治', valid: '100%', calibrated: '联锁验收待签', due: '禁止远程直控' },
    ],
    batches: [
      { id: 'RB-260818-01', name: '鲜茸原料批次 260818-01', stage: '原料', origin: ['MY-M-0117', 'MY-M-0148'], weight: '18.6 kg', quality: '已放行', stock: '在库 12.4 kg', owner: '基地', report: 'LAB-260823-16', label: '已激活 24 件', token: '8e3c...7a11', chain: ['采收事件 2 条', '原料称重 2 条', '检测报告 1 份', '分装销售单元 24 件'] },
      { id: 'RB-260925-03', name: '鲜茸原料批次 260925-03', stage: '原料', origin: ['MY-M-0148'], weight: '7.8 kg', quality: '待检', stock: '冷库 Q-02', owner: '合作户交接待确认', report: '待收样', label: '未发行', token: '', chain: ['采收事件 1 条', '原料称重 1 条', '加工交接待确认'] },
      { id: 'PB-260820-02', name: '干茸成品批次 260820-02', stage: '成品', origin: ['RB-260818-01'], weight: '5.2 kg', quality: '限制', stock: '在库 3.1 kg / 在途 1.1 kg / 已交付 1.0 kg', owner: '基地', report: 'LAB-260826-07', label: '已激活 18 件', token: '41bb...d902', chain: ['原料来源 1 批', '委托加工交接 2 次', '检测报告 1 份', '销售单元 18 件'] },
    ],
    inventory: [
      { id: 'PB-260820-02', product: '干茸切片 A 级', location: '冷库 C-01', qty: '3.1 kg', quality: '限制', ownership: '基地', reserved: '1.2 kg', shipment: '阻断' },
      { id: 'RB-260925-03', product: '鲜茸原料', location: '冷库 Q-02', qty: '7.8 kg', quality: '待检', ownership: '交接待确认', reserved: '0 kg', shipment: '阻断' },
      { id: 'PB-260901-01', product: '干茸整枝一级', location: '冷库 C-03', qty: '8.6 kg', quality: '已放行', ownership: '基地', reserved: '2.0 kg', shipment: '可出库' },
      { id: 'PB-260906-04', product: '干茸切片二级', location: '冷库 C-02', qty: '12.3 kg', quality: '已放行', ownership: '基地', reserved: '4.5 kg', shipment: '可出库' },
    ],
    recalls: [],
    farmers: [
      { id: 'FR-010', name: '李庄合作养殖户', contact: '联系人已脱敏', status: '试点在用', deer: 42, contract: 'CT-2026-010 / V2', visits: 4, openTasks: 1, delivery: 'DL-260928-01', settlement: '待双方确认', amount: 28640, evidence: '重量、等级、交接影像齐全' },
      { id: 'FR-006', name: '崮前家庭农场', contact: '联系人已脱敏', status: '试点在用', deer: 36, contract: 'CT-2026-006 / V1', visits: 3, openTasks: 0, delivery: 'DL-260921-03', settlement: '已确认', amount: 24120, evidence: '已完成回执' },
      { id: 'FR-003', name: '云岭养殖合作社', contact: '联系人已脱敏', status: '资料复核', deer: 28, contract: 'CT-2026-003 / 草稿', visits: 2, openTasks: 2, delivery: '暂无', settlement: '不适用', amount: 0, evidence: '准入资料待补 2 项' },
    ],
    orders: [
      { id: 'SO-2609-018', customer: '临沂某药材企业', product: '干茸整枝一级', amount: 86500, paid: 52000, status: '部分回款', quality: '已放行', due: '2026-10-15' },
      { id: 'SO-2609-021', customer: '山东某原料企业', product: '干茸切片 A 级', amount: 48600, paid: 0, status: '质量阻断', quality: '限制', due: '待质量处理' },
      { id: 'SO-2609-023', customer: '演示客户 B', product: '种鹿交付包', amount: 72000, paid: 72000, status: '已回款', quality: '资料齐全', due: '已完成' },
    ],
    calendar: [
      { day: '09/29', title: 'A3 饮水巡检与环境复核', type: '今日', owner: '生产/工程' },
      { day: '10/02', title: '核心母鹿妊检窗口', type: '繁育', owner: '兽医/育种' },
      { day: '10/08', title: '秋季免疫批次执行', type: '防疫', owner: '兽医' },
      { day: '10/16', title: '合作户技术巡访', type: '农户', owner: '运营/技术员' },
      { day: '10/22', title: '产品交付与回款复核', type: '经营', owner: '质量/财务' },
    ],
    events: [
      { time: '09:42:16', type: '规则建议', text: 'MY-D-0028 触发健康待核实建议', source: '规则 R-H-017', tone: 'danger' },
      { time: '09:41:08', type: '边缘同步', text: 'A 区 126 条观测完成幂等补传', source: 'EDGE-01', tone: 'ok' },
      { time: '09:38:42', type: '本地控制', text: 'A3 通风规则执行并收到反馈', source: 'CTRL-A-01', tone: 'warn' },
      { time: '09:31:20', type: '质量限制', text: 'PB-260820-02 保持出库阻断', source: '质量负责人', tone: 'danger' },
      { time: '09:22:05', type: '业务确认', text: 'DL-260928-01 完成交接证据复核', source: '农户运营', tone: 'ok' },
    ],
    dashboardSeries: {
      health: [8, 12, 9, 14, 10, 7, 11, 6, 8, 5, 7, 4],
      environment: [21.2, 21.4, 21.8, 22.1, 22.6, 23.2, 23.6, 23.4, 22.9, 22.4, 22.1, 21.9],
      cash: [12, 18, 26, 31, 43, 48, 61, 66, 78, 86, 94, 112],
      production: [58, 64, 69, 72, 76, 81, 79, 84, 88, 91, 89, 93],
    },
  };

  window.DEER_DATA = Object.freeze(data);
})();

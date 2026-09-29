(function () {
  'use strict';

  const D = window.DEER_DATA;
  const esc = (value) => String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const tone = (value) => {
    if (/告警|紧急|限制|阻断|不合格|异常/.test(value)) return 'danger';
    if (/关注|待|波动|处理中|部分/.test(value)) return 'warning';
    if (/正常|完成|放行|在线|确认|可出库|自治/.test(value)) return 'success';
    return 'neutral';
  };
  const badge = (value) => `<span class="badge ${tone(String(value))}">${esc(value)}</span>`;
  const spark = (values, color = '#68d391') => {
    const width = 240, height = 64;
    const max = Math.max(...values), min = Math.min(...values);
    const pts = values.map((v, i) => {
      const x = i * width / (values.length - 1);
      const y = height - ((v - min) / Math.max(1, max - min)) * 50 - 7;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return `<svg class="spark" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="fill-${color.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".35"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
      <polygon points="0,64 ${pts} 240,64" fill="url(#fill-${color.slice(1)})"/>
      <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.5" vector-effect="non-scaling-stroke"/>
    </svg>`;
  };
  const pageHead = (eyebrow, title, description, actions = '') => `
    <header class="page-head reveal">
      <div><span class="eyebrow">${esc(eyebrow)}</span><h1>${esc(title)}</h1><p>${esc(description)}</p></div>
      <div class="page-actions">${actions}</div>
    </header>`;
  const metric = (label, value, unit, note, cls = '') => `
    <article class="metric ${cls} reveal">
      <span>${esc(label)}</span><div><b data-animate-number="${String(value).replace(/,/g, '')}">${esc(value)}</b><em>${esc(unit || '')}</em></div>
      <small>${esc(note)}</small>
    </article>`;
  const panel = (title, body, options = {}) => `
    <section class="panel ${options.className || ''} reveal">
      <header class="panel-head"><div><span>${esc(options.kicker || 'LIVE FACT VIEW')}</span><h2>${esc(title)}</h2></div>${options.action || ''}</header>
      <div class="panel-body">${body}</div>
    </section>`;
  const table = (columns, rows, rowAction) => `
    <div class="table-wrap"><table><thead><tr>${columns.map((c) => `<th>${esc(c.label)}</th>`).join('')}<th></th></tr></thead>
    <tbody>${rows.map((row) => `<tr>${columns.map((c) => `<td>${c.render ? c.render(row[c.key], row) : esc(row[c.key])}</td>`).join('')}
    <td class="row-action">${rowAction ? `<button class="text-button" data-action="${rowAction}" data-id="${esc(row.id)}">查看 →</button>` : ''}</td></tr>`).join('')}</tbody></table></div>`;
  const progress = (value, label) => `<div class="progress"><i style="width:${Math.max(0, Math.min(100, value))}%"></i></div>${label ? `<small>${esc(label)}</small>` : ''}`;

  function siteMap() {
    const pens = D.pens;
    const coords = [[80, 70], [230, 80], [380, 70], [130, 220], [310, 230], [520, 175]];
    return `<div class="site-map">
      <svg viewBox="0 0 720 360" role="img" aria-label="模拟场区态势">
        <defs>
          <linearGradient id="land" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#132b22"/><stop offset="1" stop-color="#081713"/></linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <path d="M10 278C96 218 150 306 238 254s140-20 205-70 126-56 267-10v176H10Z" fill="url(#land)" stroke="#345244"/>
        <path class="contour" d="M20 270c90-50 145 30 225-24s136-12 204-68 155-43 245-11M24 302c92-45 154 18 235-28s135-15 203-67 156-38 232-16"/>
        <path class="data-route" d="M105 95 C220 32 395 54 548 183 S622 286 677 276"/>
        ${pens.map((p, i) => {
          const [x, y] = coords[i];
          const c = tone(p.state) === 'danger' ? '#f87171' : tone(p.state) === 'warning' ? '#f6c768' : '#68d391';
          return `<g class="map-node" data-action="pen-detail" data-id="${p.id}" tabindex="0">
            <circle cx="${x + 45}" cy="${y + 30}" r="36" fill="${c}" opacity=".08"/>
            <rect x="${x}" y="${y}" width="90" height="60" rx="8" fill="#0c1b17" stroke="${c}" stroke-width="1.4"/>
            <circle cx="${x + 76}" cy="${y + 13}" r="4" fill="${c}" filter="url(#glow)" class="${p.state === '告警' ? 'pulse-ring' : ''}"/>
            <text x="${x + 12}" y="${y + 22}" fill="#e9f3ed" font-size="11" font-weight="700">${p.id}</text>
            <text x="${x + 12}" y="${y + 40}" fill="#8da89b" font-size="8">${p.count} 头 · ${p.state}</text>
            <text x="${x + 12}" y="${y + 53}" fill="${c}" font-size="8">${p.temp}℃ / ${p.humidity}%RH</text>
          </g>`;
        }).join('')}
        <g transform="translate(575 55)"><rect width="112" height="72" rx="10" fill="#0c1b17" stroke="#b98b52"/><text x="14" y="24" fill="#e9f3ed" font-size="11" font-weight="700">采茸工位</text><text x="14" y="43" fill="#a68b6a" font-size="8">秤 / 扫码 / 打印</text><text x="14" y="58" fill="#68d391" font-size="8">设备准备完成</text></g>
      </svg>
      <div class="map-legend"><span><i class="dot ok"></i>正常</span><span><i class="dot warn"></i>关注</span><span><i class="dot bad"></i>告警/受控</span><em>点击区域进入事实明细</em></div>
    </div>`;
  }

  function riskRadar() {
    const axes = [
      ['健康', 66, 130, 32], ['环境', 188, 112, 22], ['质量', 203, 225, 39],
      ['资金', 76, 250, 28], ['数据', 28, 137, 18],
    ];
    return `<div class="radar-wrap"><svg viewBox="0 0 240 280" aria-label="风险雷达">
      <g class="radar-grid" transform="translate(120 145)" fill="none" stroke="#29463a">
        <polygon points="0,-95 90,-29 56,77 -56,77 -90,-29"/><polygon points="0,-67 63,-20 39,54 -39,54 -63,-20"/><polygon points="0,-38 36,-12 23,31 -23,31 -36,-12"/>
        <path d="M0-95V0M90-29L0 0M56 77L0 0M-56 77L0 0M-90-29L0 0"/>
        <polygon class="radar-shape" points="0,-62 56,-18 31,43 -28,38 -48,-16" fill="rgba(246,199,104,.18)" stroke="#f6c768" stroke-width="2"/>
        <circle class="radar-vertex" cx="0" cy="-62" r="3"/><circle class="radar-vertex" cx="56" cy="-18" r="3"/><circle class="radar-vertex" cx="31" cy="43" r="3"/><circle class="radar-vertex" cx="-28" cy="38" r="3"/><circle class="radar-vertex" cx="-48" cy="-16" r="3"/>
      </g>
      ${axes.map(([label, x, y]) => `<text x="${x}" y="${y}" text-anchor="middle" fill="#b7c8be" font-size="10">${label}</text>`).join('')}
    </svg><div class="risk-summary"><b>2</b><span>需管理层关注</span><small>质量限制 · 设备波动</small></div></div>`;
  }

  function dashboard(state) {
    const s = D.scenarios[state.scenario];
    const openTasks = D.tasks.filter((x) => x.status !== '已完成').length;
    const restricted = D.inventory.filter((x) => x.quality !== '已放行').length;
    const paid = D.orders.reduce((sum, x) => sum + x.paid, 0);
    return `${pageHead('YUHuang Mountain / Operation Center', '良种繁育基地 · 综合态势', '以统一事实源汇总生产、健康、质量、经营与联农状态；所有数字均为演示样例。',
      '<button class="secondary-button" data-action="tour">开始演示导览</button><button class="primary-button" data-view-jump="foundation">查看技术底座</button>')}
      <div class="notice-banner reveal"><span>演示数据</span><p>当前展示 ${state.scenario} 头容量测算情景，不代表已批准引种规模或真实运营结果。</p><button data-action="scenario">切换情景</button></div>
      <div class="metric-grid">
        ${metric('模拟在栏', s.herd, '头', `容量情景 ${s.capacity} 头`, 'accent')}
        ${metric('今日待办', openTasks, '项', '高优先级 2 项')}
        ${metric('待复核告警', D.alerts.filter((x) => x.status !== '已关闭').length, '条', 'AI/规则仅生成待核建议', 'warning')}
        ${metric('受限对象', restricted, '批', '未放行或存在活动限制', 'danger')}
        ${metric('模拟已回款', (paid / 10000).toFixed(1), '万元', '经营预测与实际分栏')}
        ${metric('合作户试点', s.farmers, '户', '实际开户须经准入批准')}
      </div>
      <div class="dashboard-grid">
        ${panel('场区态势', siteMap(), { className: 'span-8 map-panel', kicker: 'SITE OPERATIONS', action: '<button class="text-button" data-view-jump="environment">环境设备 →</button>' })}
        ${panel('风险雷达', riskRadar(), { className: 'span-4', kicker: 'RISK SIGNALS', action: '<button class="text-button" data-view-jump="analytics">风险明细 →</button>' })}
        ${panel('生产节奏', `<div class="calendar-list">${D.calendar.map((x, i) => `<button data-view-jump="${i < 3 ? ['production', 'breeding', 'health'][i] : i === 3 ? 'farmers' : 'assets'}"><time>${x.day}</time><div><b>${x.title}</b><span>${x.owner}</span></div>${badge(x.type)}</button>`).join('')}</div>`, { className: 'span-4', kicker: 'PRODUCTION RHYTHM' })}
        ${panel('实时业务流', `<div class="event-stream">${D.events.map((x) => `<button data-action="event-detail" data-id="${x.time}"><time>${x.time}</time><i class="${x.tone}"></i><div><b>${x.type}</b><span>${x.text}</span><small>${x.source}</small></div></button>`).join('')}</div>`, { className: 'span-4', kicker: 'FACT STREAM' })}
        ${panel('双线经营视图', `<div class="dual-track">
          <button data-view-jump="production"><span>养殖执行线</span><b>93%</b>${spark(D.dashboardSeries.production, '#68d391')}<small>任务按期完成率 · 模拟</small></button>
          <button data-view-jump="assets"><span>经营管理线</span><b>11.2</b>${spark(D.dashboardSeries.cash, '#f6c768')}<small>累计回款情景 / 万元</small></button>
        </div>`, { className: 'span-4', kicker: 'TWO OPERATING LINES' })}
      </div>`;
  }

  function production() {
    const columns = [
      { key: 'name', label: '生产单元' }, { key: 'type', label: '用途' },
      { key: 'count', label: '在栏/容量', render: (_, r) => `<b>${r.count}</b> / ${r.capacity}${progress(r.count / r.capacity * 100)}` },
      { key: 'water', label: '饮水巡检', render: (v) => badge(v) }, { key: 'disinfect', label: '消毒', render: (v) => badge(v) },
      { key: 'owner', label: '责任人' }, { key: 'state', label: '状态', render: (v) => badge(v) },
    ];
    return `${pageHead('PRODUCTION DESK', '生产工作台', '围绕鹿群、圈舍、饲喂、饮水、消毒、粪污、任务和交接班形成每日闭环。',
      '<button class="secondary-button" data-action="handover">发起交接班</button><button class="primary-button" data-action="new-inspection">登记巡检</button>')}
      <div class="metric-grid compact">${metric('今日任务', D.tasks.length, '项', '按生产日历生成')}${metric('完成率', 74, '%', '截至模拟时间 09:42')}${metric('待交接', 3, '项', '晚班前需确认', 'warning')}${metric('在栏变更', 2, '条', '出生 +1 / 调入 +1')}</div>
      <div class="content-grid">
        ${panel('今日任务队列', `<div class="task-list">${D.tasks.map((t) => `<div class="task-row"><i class="${tone(t.priority)}"></i><div><b>${t.title}</b><span>${t.module} · ${t.owner} · ${t.due}</span></div>${badge(t.status)}<button class="text-button" data-action="complete-task" data-id="${t.id}">${t.status === '待执行' ? '完成' : '查看'}</button></div>`).join('')}</div>`, { className: 'span-4', kicker: 'SHIFT TASKS' })}
        ${panel('生产单元', table(columns, D.pens, 'pen-detail'), { className: 'span-8', kicker: 'PENS & CAPACITY', action: '<button class="filter-button active">全部圈舍</button>' })}
        ${panel('投入品与饲喂', `<div class="split-summary"><div><span>今日饲料领用</span><b>1,420 kg</b><small>批次 FEED-260928-A</small></div><div><span>饮水异常</span><b>0</b><small>人工巡检仍保留</small></div><div><span>库存预警</span><b>2 项</b><small>矿物质与消毒剂</small></div></div>`, { className: 'span-12', kicker: 'INPUTS & FEEDING' })}
      </div>`;
  }

  function health(state) {
    const orders = [...D.workOrders, ...(state.workOrders || [])];
    return `${pageHead('HEALTH & BIOSECURITY', '健康防疫', '机器观测、AI/规则建议与兽医确认相互分离；异常必须进入有人受理的工单闭环。',
      '<button class="secondary-button" data-action="health-guide">处置规则</button><button class="primary-button" data-action="new-health-record">新建健康记录</button>')}
      <div class="metric-grid compact">${metric('待受理', D.alerts.filter((x) => x.status === '待受理').length, '条', '含设备异常')}${metric('处置中', orders.filter((x) => /受理|处置/.test(x.status)).length, '单', '跨班次自动交接')}${metric('隔离观察', 7, '头', '隔离舍 Q1')}${metric('免疫计划', 1, '批', '10月8日执行')}</div>
      <div class="workbench-grid">
        ${panel('告警与待核建议', `<div class="alert-list">${D.alerts.map((a) => `<button class="alert-card ${tone(a.level)} ${state.selectedAlert === a.id ? 'selected' : ''}" data-action="alert-detail" data-id="${a.id}"><div><span>${a.time}</span>${badge(a.level)}</div><b>${a.type} · ${a.subject}</b><p>${a.evidence[0]}</p><small>${a.source} · ${a.status}</small></button>`).join('')}</div>`, { className: 'span-5', kicker: 'ALERT INBOX' })}
        ${panel('工单处置', `<div class="workflow-board">${['待受理', '已受理', '处置中', '待复核'].map((status) => `<div class="workflow-column"><h3>${status}<em>${orders.filter((o) => o.status === status).length}</em></h3>${orders.filter((o) => o.status === status).map((o) => `<button class="workflow-ticket" data-action="workorder-detail" data-id="${o.id}"><b>${o.id}</b><span>${o.title}</span><small>${o.owner} · ${o.created}</small></button>`).join('') || '<p class="empty-mini">暂无工单</p>'}</div>`).join('')}</div>`, { className: 'span-7', kicker: 'HUMAN-IN-THE-LOOP' })}
      </div>`;
  }

  function breeding() {
    const columns = [
      { key: 'id', label: '永久鹿 ID', render: (v, r) => `<div class="identity"><i>${r.name.slice(-3)}</i><div><b>${esc(v)}</b><span>${esc(r.name)}</span></div></div>` },
      { key: 'sex', label: '性别/年龄', render: (_, r) => `${r.sex} · ${r.age}` }, { key: 'purpose', label: '用途' },
      { key: 'pen', label: '当前圈舍' }, { key: 'parentStatus', label: '亲本证据', render: (v) => badge(v) },
      { key: 'score', label: '性能指数', render: (v) => `<b class="mono">${v}</b>` }, { key: 'status', label: '状态', render: (v) => badge(v) },
    ];
    return `${pageHead('BREEDING PROGRAM', '良种繁育', '以永久身份、亲本证据、性能测定和繁育事件支持可复核的选留与种鹿交付。',
      '<button class="secondary-button" data-action="pedigree-rule">选配规则</button><button class="primary-button" data-action="create-match">生成待审核选配建议</button>')}
      <div class="metric-grid compact">${metric('核心种用', 214, '头', '模拟分群口径')}${metric('亲本已确认', 81, '%', '未知与候选单独保留')}${metric('妊检窗口', 36, '头', '10月2日开始')}${metric('待测定', 18, '头', '按年龄阶段排程')}</div>
      ${panel('个体档案与系谱', table(columns, D.deer, 'deer-detail'), { kicker: 'ANIMAL MASTER DATA', action: '<label class="inline-search"><input data-filter-table placeholder="筛选鹿号或名称"></label>' })}
      <div class="content-grid lower">
        ${panel('繁育日历', `<div class="timeline">${D.calendar.slice(1, 4).map((x) => `<div><time>${x.day}</time><i></i><p><b>${x.title}</b><span>${x.owner}</span></p></div>`).join('')}</div>`, { className: 'span-5', kicker: 'BREEDING CALENDAR' })}
        ${panel('性能分布', `<div class="bar-chart">${[68, 86, 91, 74, 55, 32].map((v, i) => `<div><i style="height:${v}%"></i><span>${['<75', '75-80', '80-85', '85-90', '90-95', '>95'][i]}</span></div>`).join('')}</div><p class="chart-note">指数仅用于演示，不等同于正式育种值。</p>`, { className: 'span-7', kicker: 'PERFORMANCE DISTRIBUTION' })}
      </div>`;
  }

  function environment() {
    const columns = [
      { key: 'id', label: '设备 ID' }, { key: 'name', label: '设备' }, { key: 'zone', label: '区域' },
      { key: 'protocol', label: '协议' }, { key: 'valid', label: '有效数据率' },
      { key: 'due', label: '维护/校准' }, { key: 'status', label: '状态', render: (v) => badge(v) },
    ];
    return `${pageHead('EDGE & CONTROL', '环境设备', '监测数据有效性、校准、边缘积压和控制审计；云端不绕过本地控制器直接操作执行器。',
      '<button class="secondary-button" data-action="control-audit">控制审计</button><button class="primary-button" data-action="propose-config">提交批准配置</button>')}
      <div class="metric-grid compact">${metric('关键点位', 24, '个', '示范场测算情景')}${metric('有效数据率', 99.2, '%', '最差点位单列')}${metric('边缘积压', 126, '条', '正在幂等补传', 'warning')}${metric('校准到期', 2, '台', '30 天内', 'warning')}</div>
      <div class="content-grid">
        ${panel('圈舍环境趋势', `<div class="trend-panel"><div class="trend-value"><span>A3 相对湿度</span><b>82<em>%RH</em></b>${badge('关注')}</div>${spark([66, 68, 69, 71, 72, 74, 76, 82, 80, 77, 73, 71], '#f6c768')}<div class="axis-labels"><span>08:40</span><span>09:10</span><span>09:42</span></div></div>`, { className: 'span-4', kicker: 'ENVIRONMENT TREND' })}
        ${panel('安全控制优先级', `<div class="control-stack"><div class="critical">硬件保护 / 急停 / 安全联锁</div><div>授权现场人工接管</div><div>批准的本地自动规则</div><div class="muted">受控远程配置（非直接云控）</div></div><p class="boundary-note">AI 建议只生成工单，不进入执行器控制链。</p>`, { className: 'span-4', kicker: 'CONTROL BOUNDARY' })}
        ${panel('边缘运行', `<div class="edge-health"><div><span>持久化队列</span><b>126 / 72h 容量</b>${progress(18)}</div><div><span>视频本地存储</span><b>4.2 TB 可用</b>${progress(58)}</div><div><span>中心连接</span><b>已恢复</b>${progress(96)}</div></div>`, { className: 'span-4', kicker: 'EDGE AUTONOMY' })}
      </div>
      ${panel('设备与校准台账', table(columns, D.devices, 'device-detail'), { kicker: 'DEVICE REGISTER' })}`;
  }

  function trace() {
    const columns = [
      { key: 'id', label: '批次 ID' }, { key: 'name', label: '批次名称' }, { key: 'stage', label: '层级' },
      { key: 'weight', label: '数量' }, { key: 'quality', label: '质量状态', render: (v) => badge(v) },
      { key: 'stock', label: '库存/位置' }, { key: 'label', label: '标签状态', render: (v) => badge(v) },
    ];
    return `${pageHead('ANTLER TRACEABILITY', '采茸追溯', '以个体、批次和销售单元分层管理，贯通采收、加工交接、检测、标签和公开查询。',
      '<button class="secondary-button" data-action="trace-code-guide">编码策略</button><button class="primary-button" data-action="new-harvest">登记采茸事件</button>')}
      <div class="metric-grid compact">${metric('原料批次', 12, '批', '本季模拟')}${metric('销售单元', 86, '件', '标签实例独立')}${metric('报告齐备', 92, '%', '缺失自动限制')}${metric('公众查询', 318, '次', '仅最小公开集')}</div>
      ${panel('批次与销售单元', table(columns, D.batches, 'batch-detail'), { kicker: 'BATCH LINEAGE' })}
      <div class="content-grid lower">
        ${panel('编码分层', `<div class="identity-stack"><div><b>内部永久 ID</b><span>UUIDv4 · 事实对象主键</span></div><div><b>销售单元 ID</b><span>每个最小销售单元独立</span></div><div><b>公开标签 Token</b><span>HTTPS 随机令牌 · 非认证凭据</span></div><div class="optional"><b>外部 20 位码</b><span>按需兼容，不作为一期主键</span></div></div>`, { className: 'span-5', kicker: 'IDENTITY LAYERS' })}
        ${panel('证据完整度', `<div class="evidence-grid"><div><b>100%</b><span>身份与采收</span></div><div><b>92%</b><span>检测报告</span></div><div><b>88%</b><span>加工交接</span></div><div><b>100%</b><span>更正与审计</span></div></div><p class="chart-note">可验证备份与原件保存必建；第三方存证为可选适配。</p>`, { className: 'span-7', kicker: 'EVIDENCE COVERAGE' })}
      </div>`;
  }

  function quality(state) {
    const inventory = D.inventory.map((x) => state.restrictions && state.restrictions[x.id] ? { ...x, quality: '限制', shipment: '阻断' } : x);
    const columns = [
      { key: 'id', label: '批次' }, { key: 'product', label: '产品' }, { key: 'location', label: '物理位置' },
      { key: 'qty', label: '实物数量' }, { key: 'quality', label: '质量状态', render: (v) => badge(v) },
      { key: 'ownership', label: '所有权' }, { key: 'reserved', label: '已预留' }, { key: 'shipment', label: '出库', render: (v) => badge(v) },
    ];
    return `${pageHead('QUALITY & INVENTORY', '质量库存', '质量状态、物理库存和所有权分别管理；活动限制优先阻断销售与出库。',
      '<button class="secondary-button" data-action="quality-rules">放行规则</button><button class="primary-button" data-action="start-recall" data-id="PB-260820-02">启动召回演示</button>')}
      <div class="metric-grid compact">${metric('待检', inventory.filter((x) => x.quality === '待检').length, '批', '报告与样本须匹配')}${metric('活动限制', inventory.filter((x) => x.quality === '限制').length, '批', '多项限制分别解除', 'danger')}${metric('可用库存', 20.9, 'kg', '不含受限和预留')}${metric('召回案件', (state.recalls || []).length, '件', '数量逐项核销')}</div>
      ${panel('库存与质量状态', table(columns, inventory, 'inventory-detail'), { kicker: 'AUTHORITATIVE STOCK', action: '<button class="filter-button active">全部</button><button class="filter-button">受限</button>' })}
      <div class="content-grid lower">
        ${panel('出库门禁', `<div class="gate-list"><div><i class="ok">✓</i><span>在线读取权威库存</span></div><div><i class="ok">✓</i><span>来源链和数量校验</span></div><div><i class="bad">×</i><span>PB-260820-02 存在活动限制</span></div><div><i class="bad">×</i><span>质量负责人尚未解除</span></div></div><button class="blocked-button" data-action="blocked-shipment">模拟出库（当前阻断）</button>`, { className: 'span-5', kicker: 'SHIPMENT GATE' })}
        ${panel('召回影响', state.recalls && state.recalls.length ? `<div class="recall-summary"><b>${state.recalls[0].id}</b>${badge('进行中')}<p>在库 3.1 kg · 在途 1.1 kg · 已交付 1.0 kg</p><div class="recall-track"><i></i><i></i><i></i></div><small>首版影响清单已生成，待逐项联络与核销。</small></div>` : '<div class="empty-state"><span>◎</span><b>暂无演示召回案件</b><p>可从页面右上角启动 PB-260820-02 的受控召回演示。</p></div>', { className: 'span-7', kicker: 'RECALL IMPACT' })}
      </div>`;
  }

  function assets() {
    const columns = [
      { key: 'id', label: '订单' }, { key: 'customer', label: '客户' }, { key: 'product', label: '交付对象' },
      { key: 'amount', label: '订单金额', render: (v) => `¥ ${Number(v).toLocaleString('zh-CN')}` },
      { key: 'paid', label: '已回款', render: (v) => `¥ ${Number(v).toLocaleString('zh-CN')}` },
      { key: 'quality', label: '交付条件', render: (v) => badge(v) }, { key: 'status', label: '状态', render: (v) => badge(v) },
    ];
    return `${pageHead('ASSET & OPERATIONS', '资产经营', '生物资产、设备资产、订单、回款、成本和预算偏差统一分析，但不替代法定会计系统。',
      '<button class="secondary-button" data-action="reconcile">发起对账</button><button class="primary-button" data-action="export-summary">导出演示摘要</button>')}
      <div class="metric-grid compact">${metric('生物资产账面', 642.8, '万元', '模拟估值，不是审计结果')}${metric('订单金额', 20.7, '万元', '本期样例')}${metric('已回款', 12.4, '万元', '预测与实际分栏')}${metric('预算偏差', 6.8, '%', '设备维护高于情景', 'warning')}</div>
      <div class="content-grid">
        ${panel('现金与订单', `<div class="big-chart">${spark(D.dashboardSeries.cash, '#f6c768')}<div class="chart-marks"><span>模拟累计回款（万元）</span><b>11.2</b></div></div>`, { className: 'span-5', kicker: 'CASH COLLECTION' })}
        ${panel('成本结构', `<div class="donut-wrap"><div class="donut" style="--a:28;--b:46;--c:64;--d:82"><span><b>100%</b><small>情景成本</small></span></div><div class="legend-list"><span><i style="background:#68d391"></i>直接投入 28%</span><span><i style="background:#4ba187"></i>人员 18%</span><span><i style="background:#f6c768"></i>设备运维 18%</span><span><i style="background:#b98b52"></i>检测物流 18%</span><span><i style="background:#536b60"></i>其他 18%</span></div></div>`, { className: 'span-7', kicker: 'COST STRUCTURE' })}
      </div>
      ${panel('订单与回款', table(columns, D.orders, 'order-detail'), { kicker: 'ORDERS & RECEIVABLES' })}`;
  }

  function farmers(state) {
    const farmers = D.farmers.map((f) => state.settlements && state.settlements[f.delivery] ? { ...f, settlement: '已确认' } : f);
    const columns = [
      { key: 'name', label: '合作主体' }, { key: 'status', label: '准入状态', render: (v) => badge(v) },
      { key: 'deer', label: '托管鹿只' }, { key: 'contract', label: '合同版本' }, { key: 'visits', label: '技术巡访' },
      { key: 'delivery', label: '最近交付' }, { key: 'settlement', label: '结算', render: (v) => badge(v) },
    ];
    return `${pageHead('FARMER NETWORK', '农户服务', '以低负担记录、技术员复核和合同证据支持合作户准入、托管、交付、结算与争议。',
      '<button class="secondary-button" data-action="farmer-rules">准入规则</button><button class="primary-button" data-action="new-visit">新建技术巡访</button>')}
      <div class="metric-grid compact">${metric('试点合作户', farmers.filter((x) => x.status === '试点在用').length, '户', '首期目标 10 户')}${metric('托管鹿只', farmers.reduce((a, x) => a + x.deer, 0), '头', '所有权与托管分离')}${metric('本月巡访', farmers.reduce((a, x) => a + x.visits, 0), '次', '技术员留痕')}${metric('待确认结算', farmers.filter((x) => x.settlement === '待双方确认').length, '单', '不能自动付款', 'warning')}</div>
      ${panel('合作户台账', table(columns, farmers, 'farmer-detail'), { kicker: 'FARMER REGISTER' })}
      <div class="content-grid lower">
        ${panel('轻量化采集', `<div class="minimum-data"><div><i>1</i><span>身份、托管、调入调出、出生死亡</span></div><div><i>2</i><span>投入品、异常、用药与防疫</span></div><div><i>3</i><span>繁育、采茸、重量与交接</span></div><div><i>4</i><span>合同、结算确认与争议</span></div></div>`, { className: 'span-5', kicker: 'MINIMUM DATASET' })}
        ${panel('结算原则', `<div class="formula">确认重量 × 合同等级单价<br><span>± 已约定服务 / 调整项</span></div><div class="rule-callout">AI 评分、数据稀疏或传感器离线只触发复核，不能直接扣价。</div>`, { className: 'span-7', kicker: 'SETTLEMENT POLICY' })}
      </div>`;
  }

  function analytics() {
    return `${pageHead('MANAGEMENT ANALYTICS', '管理分析', '每个指标保存分母、期间、版本与事实来源；点击指标可追溯到业务明细。',
      '<button class="secondary-button" data-action="reporting-status">报送状态</button><button class="primary-button" data-action="export-ledger">导出监管台账</button>')}
      <div class="analysis-grid">
        ${panel('存栏滚动', `<div class="equation"><span>期初 780</span><b>+</b><span>出生 5</span><b>+</b><span>调入 2</span><b>−</b><span>调出 1</span><b>=</b><strong>期末 786</strong></div><p class="chart-note">内部跨圈转移不改变全场存栏。</p>`, { className: 'span-6', kicker: 'HERD RECONCILIATION' })}
        ${panel('生产完成率', `<div class="big-chart">${spark(D.dashboardSeries.production, '#68d391')}<div class="chart-marks"><span>按期完成率</span><b>93%</b></div></div>`, { className: 'span-6', kicker: 'PRODUCTION' })}
        ${panel('健康事件', `<div class="big-chart">${spark(D.dashboardSeries.health, '#f87171')}<div class="chart-marks"><span>每 100 鹿日待核事件</span><b>0.7</b></div></div>`, { className: 'span-4', kicker: 'HEALTH' })}
        ${panel('环境趋势', `<div class="big-chart">${spark(D.dashboardSeries.environment, '#60a5fa')}<div class="chart-marks"><span>A 区温度均值</span><b>22.4℃</b></div></div>`, { className: 'span-4', kicker: 'ENVIRONMENT' })}
        ${panel('订单回款', `<div class="big-chart">${spark(D.dashboardSeries.cash, '#f6c768')}<div class="chart-marks"><span>回款率</span><b>59.9%</b></div></div>`, { className: 'span-4', kicker: 'CASH' })}
        ${panel('指标定义与事实来源', `<div class="definition-list"><button data-action="metric-detail" data-id="herd"><b>期末存栏</b><span>已确认出生/调入/调出/死亡事件</span><em>事务事实</em></button><button data-action="metric-detail" data-id="response"><b>工单响应</b><span>首次受理时间 − 告警生成时间</span><em>事件日志</em></button><button data-action="metric-detail" data-id="collection"><b>回款率</b><span>实际回执金额 / 到期应收金额</span><em>经营事实</em></button></div>`, { className: 'span-12', kicker: 'TRACEABLE METRICS' })}
      </div>`;
  }

  function foundation() {
    return `${pageHead('TECHNOLOGY FOUNDATION', '技术底座', '展示一期设计能力与安全边界，不表示相关系统、模型或外部接口已经建成。',
      '<button class="secondary-button" data-action="architecture-full">查看完整架构图</button><button class="primary-button" data-action="acceptance-gates">验收门禁</button>')}
      <div class="architecture-stack reveal">
        <div class="arch-side"><span>业务与专业约束</span><small>合法来源 · SOP · 质量规则 · 合同 · 授权</small></div>
        <div class="arch-layer app"><b>应用层</b><span>九大业务模块</span><span>公众查询</span><span>B 端交付</span><span>监管导出</span></div>
        <div class="arch-arrow">↓</div>
        <div class="arch-layer service"><b>模块化单体</b><span>身份</span><span>生产繁育</span><span>诊疗防疫</span><span>质量库存</span><span>经营结算</span><span>权限审计</span></div>
        <div class="arch-arrow">↓</div>
        <div class="arch-layer data"><b>统一事实底座</b><span>关系库</span><span>事件/更正日志</span><span>对象存储</span><span>时序分区</span><span>Outbox</span></div>
        <div class="arch-split"><div><b>可重建投影</b><small>看板 · 图查询 · 公众只读</small></div><div><b>规则与 AI</b><small>读事实，写建议，可停用</small></div><div><b>异步适配</b><small>报送 · 通知 · 可选存证</small></div></div>
        <div class="arch-arrow">↑ 出站加密 / 幂等补传</div>
        <div class="arch-layer edge"><b>现场接入与边缘</b><span>设备适配</span><span>身份解析</span><span>持久化缓冲</span><span>必要录像</span></div>
        <div class="control-rail"><b>独立安全控制通道</b><span>硬件联锁 / 急停</span><i>→</i><span>本地控制器</span><i>→</i><span>执行器与反馈</span><small>AI 不直接进入执行器</small></div>
      </div>
      <div class="content-grid lower">
        ${panel('AI 发布路径', `<div class="release-path">${['离线验证', '影子运行', '少量人工辅助', '评估扩大', '持续监控'].map((x, i) => `<div class="${i < 2 ? 'active' : ''}"><i>${i + 1}</i><span>${x}</span></div>`).join('')}</div><p class="boundary-note">模型证据不足时允许不验收效果；停用模型不影响基础台账与现场安全。</p>`, { className: 'span-6', kicker: 'MODEL GOVERNANCE' })}
        ${panel('可恢复与可接管', `<div class="resilience-grid"><div><b>≥72h</b><span>边缘缓存建议验证</span></div><div><b>≤1h</b><span>中心 RPO 建议值</span></div><div><b>≤4h</b><span>中心 RTO 建议值</span></div><div><b>全量</b><span>数据与附件导出</span></div></div>`, { className: 'span-6', kicker: 'RESILIENCE' })}
      </div>`;
  }

  const renderers = { dashboard, production, health, breeding, environment, trace, quality, assets, farmers, analytics, foundation };
  window.DEER_VIEWS = {
    render(view, state) {
      const renderer = renderers[view] || dashboard;
      return renderer(state || {});
    },
    helpers: { esc, badge, tone },
  };
})();

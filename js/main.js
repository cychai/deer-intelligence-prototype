(function () {
  'use strict';

  const D = window.DEER_DATA;
  const V = window.DEER_VIEWS;
  const STORAGE_KEY = 'deer-demo-state-v2';
  const defaultState = {
    view: 'dashboard',
    scenario: 800,
    sidebarCollapsed: false,
    selectedAlert: null,
    workOrders: [],
    restrictions: {},
    recalls: [],
    settlements: {},
    completedTasks: {},
  };

  let state = loadState();
  const appShell = document.querySelector('.app-shell');
  const main = document.getElementById('app-main');
  const title = document.getElementById('current-title');
  const nav = document.getElementById('nav-list');
  const drawer = document.getElementById('drawer');
  const drawerTitle = document.getElementById('drawer-title');
  const drawerKicker = document.getElementById('drawer-kicker');
  const drawerBody = document.getElementById('drawer-body');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalKicker = document.getElementById('modal-kicker');
  const modalBody = document.getElementById('modal-body');
  const modalActions = document.getElementById('modal-actions');
  const scrim = document.getElementById('scrim');
  const sidebar = document.getElementById('sidebar');
  const menuButton = document.getElementById('menu-button');
  const search = document.getElementById('global-search');
  const searchResults = document.getElementById('search-results');
  const scenarioLabel = document.getElementById('scenario-label');
  const toastRegion = document.getElementById('toast-region');
  const sidebarCollapseButton = document.querySelector('[data-action="toggle-sidebar"]');

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved && typeof saved === 'object' ? { ...defaultState, ...saved } : { ...defaultState };
    } catch (error) {
      return { ...defaultState };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      toast('无法保存演示状态', '浏览器本地存储不可用，本次操作只在当前页面有效。', 'warning');
    }
  }

  function render() {
    applySidebarState();
    main.innerHTML = V.render(state.view, state);
    title.textContent = D.nav[state.view] || D.nav.dashboard;
    scenarioLabel.textContent = `${state.scenario} 头`;
    document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.view === state.view));
    wireTableFilter();
    animateNumbers();
    main.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function navigate(view) {
    if (!D.nav[view]) return;
    state.view = view;
    saveState();
    closeDrawer();
    closeSidebar();
    render();
  }

  function toast(heading, message, type = 'success') {
    const node = document.createElement('div');
    node.className = `toast ${type}`;
    node.innerHTML = `<b>${V.helpers.esc(heading)}</b><span>${V.helpers.esc(message)}</span>`;
    toastRegion.appendChild(node);
    setTimeout(() => node.remove(), 3600);
  }

  function showDrawer(kicker, heading, html) {
    drawerKicker.textContent = kicker;
    drawerTitle.textContent = heading;
    drawerBody.innerHTML = html;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    scrim.hidden = false;
    setTimeout(() => drawer.querySelector('button, [tabindex]')?.focus(), 50);
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    if (modal.hidden) scrim.hidden = true;
  }

  function showModal(kicker, heading, body, actions) {
    modalKicker.textContent = kicker;
    modalTitle.textContent = heading;
    modalBody.innerHTML = body;
    modalActions.innerHTML = actions || '<button class="secondary-button" data-action="close-modal">关闭</button>';
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    scrim.hidden = false;
    setTimeout(() => modal.querySelector('button, input, select, textarea')?.focus(), 50);
  }

  function closeModal() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    if (!drawer.classList.contains('open')) scrim.hidden = true;
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }

  function applySidebarState() {
    const collapsed = Boolean(state.sidebarCollapsed);
    appShell.classList.toggle('sidebar-collapsed', collapsed);
    sidebarCollapseButton.setAttribute('aria-pressed', String(collapsed));
    sidebarCollapseButton.setAttribute('aria-label', collapsed ? '展开导航栏' : '收起导航栏');
    sidebarCollapseButton.title = collapsed ? '展开导航栏' : '收起导航栏';
  }

  function toggleSidebar() {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    applySidebarState();
    saveState();
  }

  function detailGrid(items) {
    return `<div class="detail-grid">${items.map(([label, value]) => `<div><span>${V.helpers.esc(label)}</span><b>${value}</b></div>`).join('')}</div>`;
  }

  function alertDetail(id) {
    const a = D.alerts.find((item) => item.id === id);
    if (!a) return toast('未找到告警', '该模拟对象可能已经被重置。', 'danger');
    state.selectedAlert = id;
    saveState();
    showDrawer('ALERT EVIDENCE', `${a.type} · ${a.subject}`, `
      <div class="detail-hero"><h3>${V.helpers.esc(a.id)}</h3><p>${V.helpers.esc(a.suggestion)}</p></div>
      ${detailGrid([['风险等级', V.helpers.badge(a.level)], ['当前状态', V.helpers.badge(a.status)], ['发生位置', V.helpers.esc(a.location)], ['发生时间', V.helpers.esc(a.time)], ['来源', V.helpers.esc(a.source)], ['数据质量', V.helpers.esc(a.quality)]])}
      <section class="detail-section"><h3>证据窗口</h3><div class="evidence-list">${a.evidence.map((x) => `<div>${V.helpers.esc(x)}</div>`).join('')}</div></section>
      <section class="detail-section"><h3>模型与边界</h3><div class="evidence-list"><div>${V.helpers.esc(a.model)}</div><div>该输出是待人工核实建议，不是病种诊断或处方依据。</div></div></section>
      <div class="drawer-actions"><button class="secondary-button" data-action="close-drawer">返回</button><button class="primary-button" data-action="create-workorder" data-id="${a.id}">创建兽医工单</button></div>
    `);
  }

  function createWorkOrder(alertId) {
    const alert = D.alerts.find((item) => item.id === alertId);
    if (!alert) return;
    const exists = state.workOrders.find((x) => x.alertId === alertId);
    if (exists) {
      closeDrawer();
      navigate('health');
      return toast('工单已存在', `${exists.id} 当前状态：${exists.status}`, 'warning');
    }
    showModal('HUMAN CONFIRMATION', '创建兽医核实工单', `
      <div class="form-grid">
        <label>来源告警<input value="${alert.id}" disabled></label>
        <label>核实对象<input value="${alert.subject}" disabled></label>
        <label>责任角色<select id="wo-owner"><option>值班兽医</option><option>场长</option><option>饲养员</option></select></label>
        <label>要求完成时间<input value="今日 11:00"></label>
        <label class="full">处置要求<textarea id="wo-note" rows="3">现场核实个体状态并补充人工观察；必要时由兽医决定后续检测或处置。</textarea></label>
      </div>
    `, `<button class="secondary-button" data-action="close-modal">取消</button><button class="primary-button" data-action="confirm-workorder" data-id="${alert.id}">确认创建</button>`);
  }

  function confirmWorkOrder(alertId) {
    const alert = D.alerts.find((item) => item.id === alertId);
    if (!alert) return;
    const id = `WO-260929-${String(7 + state.workOrders.length).padStart(3, '0')}`;
    state.workOrders.push({
      id,
      alertId,
      title: `${alert.subject} 现场健康核实`,
      owner: document.getElementById('wo-owner')?.value || '值班兽医',
      status: '待受理',
      created: '09:45',
      result: '',
    });
    saveState();
    closeModal();
    closeDrawer();
    navigate('health');
    toast('兽医工单已创建', `${id} 已进入待受理队列，AI 建议未直接改变业务事实。`);
  }

  function workOrderDetail(id) {
    const order = [...D.workOrders, ...state.workOrders].find((x) => x.id === id);
    if (!order) return;
    const next = { '待受理': '已受理', '已受理': '处置中', '处置中': '待复核', '待复核': '已关闭' }[order.status];
    showDrawer('WORK ORDER', order.id, `
      <div class="detail-hero"><h3>${V.helpers.esc(order.title)}</h3><p>告警必须由具备职责的人员受理、处置和复核，不能以消息已发送视为完成。</p></div>
      ${detailGrid([['当前状态', V.helpers.badge(order.status)], ['责任人', V.helpers.esc(order.owner)], ['创建时间', V.helpers.esc(order.created)], ['来源告警', V.helpers.esc(order.alertId || '人工创建')]])}
      <section class="detail-section"><h3>处置记录</h3><div class="evidence-list"><div>${V.helpers.esc(order.result || '尚未提交处置结果。')}</div></div></section>
      <div class="drawer-actions"><button class="secondary-button" data-action="close-drawer">返回</button>${next ? `<button class="primary-button" data-action="advance-workorder" data-id="${order.id}">推进到“${next}”</button>` : ''}</div>
    `);
  }

  function advanceWorkOrder(id) {
    let order = state.workOrders.find((x) => x.id === id);
    if (!order) {
      const seed = D.workOrders.find((x) => x.id === id);
      if (!seed) return;
      order = { ...seed };
      state.workOrders.push(order);
    }
    const next = { '待受理': '已受理', '已受理': '处置中', '处置中': '待复核', '待复核': '已关闭' }[order.status];
    if (!next) return;
    order.status = next;
    if (next === '待复核') order.result = '现场观察已记录，未发现需紧急处置的证据，提交兽医复核。';
    saveState();
    closeDrawer();
    render();
    toast('工单状态已更新', `${id} → ${next}`);
  }

  function deerDetail(id) {
    const deer = D.deer.find((item) => item.id === id);
    if (!deer) return;
    showDrawer('ANIMAL PROFILE', `${deer.name} · ${deer.id}`, `
      <div class="detail-hero"><h3>${deer.name}</h3><p>永久 ID 不随换标、转场、售出或死亡而回收。</p></div>
      ${detailGrid([['性别/年龄', `${deer.sex} · ${deer.age}`], ['用途', deer.purpose], ['当前圈舍', deer.pen], ['业务状态', V.helpers.badge(deer.status)], ['来源', deer.source], ['性能指数', `<span class="mono">${deer.score}</span>`], ['体重', `${deer.weight} kg`], ['亲本证据', V.helpers.badge(deer.parentStatus)]])}
      <section class="detail-section"><h3>系谱关系</h3><div class="evidence-list"><div>父本：${V.helpers.esc(deer.father)}</div><div>母本：${V.helpers.esc(deer.mother)}</div><div>关系状态：${V.helpers.esc(deer.parentStatus)}；未知或候选不会自动补齐。</div></div></section>
      <section class="detail-section"><h3>最近事件</h3><div class="evidence-list">${deer.events.map((x) => `<div>${V.helpers.esc(x)}</div>`).join('')}</div></section>
      <div class="drawer-actions"><button class="secondary-button" data-action="close-drawer">返回</button><button class="primary-button" data-action="match-suggestion" data-id="${deer.id}">生成待审核选配建议</button></div>
    `);
  }

  function matchSuggestion(id) {
    const deer = D.deer.find((x) => x.id === id);
    if (!deer) return;
    showModal('AI / RULE ASSISTANCE', '生成待审核选配建议', `
      <p>系统将基于已确认系谱、性能测定和批准规则生成候选组合。结果不会自动形成实际配种安排。</p>
      ${detailGrid([['对象', deer.id], ['亲本证据', V.helpers.badge(deer.parentStatus)], ['性能指数', deer.score], ['建议状态', V.helpers.badge('待专业审核')]])}
      <div class="rule-callout">若亲本未知或证据不足，系统只提示风险，不推断确定亲本。</div>
    `, '<button class="secondary-button" data-action="close-modal">取消</button><button class="primary-button" data-action="confirm-match" data-id="' + deer.id + '">生成建议</button>');
  }

  function batchDetail(id) {
    const batch = D.batches.find((x) => x.id === id);
    if (!batch) return;
    showDrawer('BATCH LINEAGE', batch.id, `
      <div class="detail-hero"><h3>${V.helpers.esc(batch.name)}</h3><p>个体、批次和销售单元分别管理；公开码只映射标签实例。</p></div>
      ${detailGrid([['批次层级', batch.stage], ['来源对象', batch.origin.map(V.helpers.esc).join('、')], ['数量', batch.weight], ['质量状态', V.helpers.badge(batch.quality)], ['库存', batch.stock], ['检测报告', batch.report], ['标签', V.helpers.badge(batch.label)], ['公开 Token', batch.token || '未发行']])}
      <section class="detail-section"><h3>批次血缘与证据</h3><div class="evidence-list">${batch.chain.map((x) => `<div>${V.helpers.esc(x)}</div>`).join('')}</div></section>
      <div class="drawer-actions"><button class="secondary-button" data-action="close-drawer">返回</button><button class="primary-button" data-action="public-preview" data-id="${batch.id}">预览公众查询</button></div>
    `);
  }

  function publicPreview(id) {
    const batch = D.batches.find((x) => x.id === id);
    if (!batch) return;
    showModal('PUBLIC TRACE PREVIEW', '公众脱敏查询预览', `
      <div class="detail-hero"><h3>${V.helpers.esc(batch.name)}</h3><p>仅展示责任主体概要、标签状态、检测摘要与风险提示。</p></div>
      ${detailGrid([['产品状态', batch.quality === '已放行' ? V.helpers.badge('可确认') : V.helpers.badge('存在限制/待确认')], ['标签状态', V.helpers.badge(batch.label)], ['来源概要', `来源记录 ${batch.origin.length} 项`], ['检测摘要', batch.report === '待收样' ? '暂无法确认' : '报告已关联']])}
      <div class="rule-callout">不公开农户财务、详细诊疗、个人联系方式或内部永久 ID。</div>
    `);
  }

  function inventoryDetail(id) {
    const item = D.inventory.find((x) => x.id === id);
    if (!item) return;
    const restricted = (state.restrictions && state.restrictions[id]) || item.quality === '限制';
    showDrawer('QUALITY OBJECT', item.id, `
      <div class="detail-hero"><h3>${V.helpers.esc(item.product)}</h3><p>实物在库、质量放行和所有权是三个独立维度。</p></div>
      ${detailGrid([['物理位置', item.location], ['实物数量', item.qty], ['质量状态', V.helpers.badge(restricted ? '限制' : item.quality)], ['所有权', item.ownership], ['已预留', item.reserved], ['出库状态', V.helpers.badge(restricted ? '阻断' : item.shipment)]])}
      <section class="detail-section"><h3>活动限制</h3><div class="evidence-list">${restricted ? '<div>QL-260929-01：质量证据复核中；仅质量负责人可按证据解除。</div>' : '<div>当前无活动限制。</div>'}</div></section>
      <div class="drawer-actions"><button class="secondary-button" data-action="close-drawer">返回</button>${restricted ? `<button class="primary-button" data-action="start-recall" data-id="${item.id}">启动召回</button>` : `<button class="primary-button" data-action="add-restriction" data-id="${item.id}">增加质量限制</button>`}</div>
    `);
  }

  function addRestriction(id) {
    showModal('QUALITY AUTHORIZATION', '增加质量限制', `
      <div class="form-grid"><label>对象<input value="${id}" disabled></label><label>限制类型<select id="restriction-type"><option>检测证据待核</option><option>冷链异常待核</option><option>来源关系争议</option></select></label><label class="full">限制原因<textarea rows="3">演示：关键证据需要质量负责人复核，限制期间禁止销售出库。</textarea></label></div>
    `, `<button class="secondary-button" data-action="close-modal">取消</button><button class="primary-button" data-action="confirm-restriction" data-id="${id}">确认限制</button>`);
  }

  function confirmRestriction(id) {
    state.restrictions[id] = { type: document.getElementById('restriction-type')?.value || '证据待核', at: '09:48' };
    saveState();
    closeModal();
    closeDrawer();
    navigate('quality');
    toast('质量限制已生效', `${id} 的销售与出库已被权威状态阻断。`, 'warning');
  }

  function startRecall(id) {
    const exists = state.recalls.find((x) => x.batchId === id);
    if (exists) return toast('召回已启动', `${exists.id} 正在进行中。`, 'warning');
    showModal('RECALL CONTROL', '启动受控召回', `
      <p>系统将先冻结相关对象，再展开批次后代和流向，生成在库、在途与已交付影响清单。</p>
      ${detailGrid([['根批次', id], ['在库', '3.1 kg'], ['在途', '1.1 kg'], ['已交付', '1.0 kg'], ['预计销售单元', '18 件'], ['责任角色', '质量负责人']])}
      <div class="rule-callout">此操作仅修改浏览器中的模拟状态，不会发送真实通知或监管报送。</div>
    `, `<button class="secondary-button" data-action="close-modal">取消</button><button class="primary-button" data-action="confirm-recall" data-id="${id}">冻结并生成清单</button>`);
  }

  function confirmRecall(id) {
    state.restrictions[id] = state.restrictions[id] || { type: '召回冻结', at: '09:50' };
    state.recalls.push({ id: `RC-260929-${String(state.recalls.length + 1).padStart(2, '0')}`, batchId: id, status: '进行中' });
    saveState();
    closeModal();
    closeDrawer();
    navigate('quality');
    toast('召回清单已生成', '影响对象已按在库、在途和已交付分类，等待逐项核销。', 'warning');
  }

  function farmerDetail(id) {
    const farmer = D.farmers.find((x) => x.id === id);
    if (!farmer) return;
    const confirmed = state.settlements[farmer.delivery] || farmer.settlement === '已确认';
    showDrawer('FARMER DELIVERY', farmer.name, `
      <div class="detail-hero"><h3>${V.helpers.esc(farmer.id)}</h3><p>合作户采用统一身份、关键事件、交付和结算语义，但不要求配置与示范场相同的感知设备。</p></div>
      ${detailGrid([['准入状态', V.helpers.badge(farmer.status)], ['托管鹿只', `${farmer.deer} 头`], ['合同版本', farmer.contract], ['技术巡访', `${farmer.visits} 次`], ['交付单', farmer.delivery], ['证据', farmer.evidence], ['结算金额', `¥ ${farmer.amount.toLocaleString('zh-CN')}`], ['结算状态', V.helpers.badge(confirmed ? '已确认' : farmer.settlement)]])}
      <section class="detail-section"><h3>结算依据</h3><div class="evidence-list"><div>确认重量 × 适用等级单价 ± 合同约定调整项</div><div>AI 评分、数据稀疏或设备离线未作为直接扣价依据。</div><div>付款仍需财务授权并通过既有银行流程。</div></div></section>
      <div class="drawer-actions"><button class="secondary-button" data-action="close-drawer">返回</button>${!confirmed && farmer.delivery !== '暂无' ? `<button class="primary-button" data-action="settlement-draft" data-id="${farmer.id}">核对结算草稿</button>` : ''}</div>
    `);
  }

  function settlementDraft(id) {
    const farmer = D.farmers.find((x) => x.id === id);
    if (!farmer) return;
    showModal('SETTLEMENT DRAFT', `${farmer.delivery} · 结算核对`, `
      ${detailGrid([['合作主体', farmer.name], ['合同版本', farmer.contract], ['确认重量', '8.2 kg'], ['适用等级', '演示 A 级'], ['基础金额', `¥ ${farmer.amount.toLocaleString('zh-CN')}`], ['调整项', '¥ 0']])}
      <div class="form-grid" style="margin-top:12px"><label class="full">双方确认说明<textarea rows="3">已核对交付重量、等级证据与合同版本；确认动作不等同于自动付款。</textarea></label></div>
    `, `<button class="secondary-button" data-action="close-modal">返回修改</button><button class="primary-button" data-action="confirm-settlement" data-id="${farmer.delivery}">模拟双方确认</button>`);
  }

  function simpleDetail(titleText, bodyText, extra = '') {
    showDrawer('BUSINESS DETAIL', titleText, `<div class="detail-hero"><h3>${V.helpers.esc(titleText)}</h3><p>${V.helpers.esc(bodyText)}</p></div>${extra}<div class="drawer-actions"><button class="secondary-button" data-action="close-drawer">关闭</button></div>`);
  }

  function runAction(action, id, target) {
    const simpleActions = {
      'sync-detail': ['同步与弱网状态', '边缘记录区分“本机已保存、中心已接收、业务已确认”。当前模拟状态无未同步关键业务事件。'],
      'profile': ['当前演示角色', '管理视图仅用于功能演示。生产、兽医、质量、经营和系统管理权限在真实系统中必须分离。'],
      'health-guide': ['健康告警处置规则', '设备异常不直接解释为动物疾病；AI 建议必须经人工核实，兽医负责专业确认和处置。'],
      'pedigree-rule': ['选配规则边界', '近交风险、亲本证据和性能测定共同参与建议；父本未知时不得自动补齐。'],
      'control-audit': ['控制审计', '记录命令申请、授权、发送、接收、执行和效果验证；投递成功不等于执行成功。'],
      'trace-code-guide': ['追溯编码策略', 'V2 默认使用内部永久 ID、销售单元 ID 与随机公开 Token；20 位参考编码仅按需兼容。'],
      'quality-rules': ['质量放行规则', '待检、不合格、用途不符或存在活动限制的对象均不得销售出库。'],
      'farmer-rules': ['合作户准入规则', '主体、生产单元、合同、权属、服务边界和退出责任须在投鹿前确认。'],
      'reporting-status': ['监管报送状态', '演示支持待提交、已发送、已接收、被退回和已纠正状态；HTTP 成功不等于业务接受。'],
      'acceptance-gates': ['上线与扩展门禁', 'G4 验证身份、质量、库存、追溯、权限和恢复；L2 控制与 AI 辅助分别独立验收。'],
      'architecture-full': ['系统架构图', '完整架构图已生成在项目根目录：梅花鹿智慧养殖系统架构图_v2.html。'],
      'propose-config': ['提交批准配置', '演示只生成受控配置草稿。现场控制器仍需校验模式、互锁、数据新鲜度和时效。'],
      'new-harvest': ['登记采茸事件', '演示入口已预留：实际业务需同时核对鹿只身份、操作人员、SOP、称重、用药与异常记录。'],
      'new-health-record': ['新建健康记录', '演示入口已预留：记录症状、观察、复核者和证据，不通过前端自动生成诊断或处方。'],
      'new-inspection': ['登记生产巡检', '模拟巡检表包含饮水、围栏、卫生、异常和责任人，保存后仍需业务确认。'],
      'handover': ['交接班', '模拟待交接事项 3 项：A3 环境复核、Q1 隔离观察、B3 网关波动。'],
      'new-visit': ['新建技术巡访', '模拟巡访包含现场观察、投入品、鹿只变更、待办和农户确认。'],
      'reconcile': ['经营对账', '订单、回款、交付和会计映射需要逐项核对；经营台账不替代法定会计系统。'],
      'export-summary': ['经营摘要导出', '已生成模拟导出任务。正式版本将包含字段版本、来源和生成责任。'],
      'export-ledger': ['监管台账导出', '模拟任务已进入“待提交”；未配置真实接收方和接口，不会对外发送。'],
      'blocked-shipment': ['出库已阻断', 'PB-260820-02 存在活动质量限制，前端不能绕过权威状态。'],
    };

    if (simpleActions[action]) {
      const [heading, body] = simpleActions[action];
      return action === 'blocked-shipment' ? toast(heading, body, 'danger') : simpleDetail(heading, body);
    }
    if (action === 'close-drawer') return closeDrawer();
    if (action === 'close-modal') return closeModal();
    if (action === 'toggle-sidebar') return toggleSidebar();
    if (action === 'scenario') {
      state.scenario = state.scenario === 800 ? 1600 : 800;
      saveState();
      render();
      return toast('容量情景已切换', `当前为 ${state.scenario} 头测算情景，不代表批准规模。`);
    }
    if (action === 'alert-detail') return alertDetail(id);
    if (action === 'create-workorder') return createWorkOrder(id);
    if (action === 'confirm-workorder') return confirmWorkOrder(id);
    if (action === 'workorder-detail') return workOrderDetail(id);
    if (action === 'advance-workorder') return advanceWorkOrder(id);
    if (action === 'deer-detail') return deerDetail(id);
    if (action === 'match-suggestion') return matchSuggestion(id);
    if (action === 'confirm-match') { closeModal(); closeDrawer(); return toast('建议已生成', `${id} 的候选组合状态为“待育种负责人审核”。`); }
    if (action === 'batch-detail') return batchDetail(id);
    if (action === 'public-preview') return publicPreview(id);
    if (action === 'inventory-detail') return inventoryDetail(id);
    if (action === 'add-restriction') return addRestriction(id);
    if (action === 'confirm-restriction') return confirmRestriction(id);
    if (action === 'start-recall') return startRecall(id);
    if (action === 'confirm-recall') return confirmRecall(id);
    if (action === 'farmer-detail') return farmerDetail(id);
    if (action === 'settlement-draft') return settlementDraft(id);
    if (action === 'confirm-settlement') {
      state.settlements[id] = true;
      saveState();
      closeModal(); closeDrawer(); navigate('farmers');
      return toast('结算草稿已确认', `${id} 已模拟双方确认；尚未触发真实付款。`);
    }
    if (action === 'pen-detail') {
      const p = D.pens.find((x) => x.id === id);
      if (p) simpleDetail(p.name, `${p.type}，模拟在栏 ${p.count}/${p.capacity} 头。`, detailGrid([['温度', `${p.temp}℃`], ['湿度', `${p.humidity}%RH`], ['饮水', V.helpers.badge(p.water)], ['消毒', V.helpers.badge(p.disinfect)], ['负责人', p.owner], ['状态', V.helpers.badge(p.state)]]));
      return;
    }
    if (action === 'device-detail') {
      const d = D.devices.find((x) => x.id === id);
      if (d) simpleDetail(d.name, '设备在线不等于数据有效，需结合校准、身份、新鲜度和完整性判断。', detailGrid([['设备 ID', d.id], ['区域', d.zone], ['协议', d.protocol], ['有效数据率', d.valid], ['校准日期', d.calibrated], ['状态', V.helpers.badge(d.status)]]));
      return;
    }
    if (action === 'order-detail') {
      const o = D.orders.find((x) => x.id === id);
      if (o) simpleDetail(o.id, `${o.customer} · ${o.product}`, detailGrid([['订单金额', `¥ ${o.amount.toLocaleString('zh-CN')}`], ['已回款', `¥ ${o.paid.toLocaleString('zh-CN')}`], ['质量条件', V.helpers.badge(o.quality)], ['状态', V.helpers.badge(o.status)]]));
      return;
    }
    if (action === 'complete-task') {
      state.completedTasks[id] = true;
      saveState();
      return toast('任务记录已更新', `${id} 已在本地演示状态中标记完成。`);
    }
    if (action === 'event-detail') {
      const event = D.events.find((x) => x.time === id);
      if (event) simpleDetail(event.type, event.text, detailGrid([['发生时间', event.time], ['来源', event.source], ['数据性质', '模拟事件']]));
      return;
    }
    if (action === 'metric-detail') return simpleDetail('指标定义', '该指标可追溯到已确认事实明细，保存分母、期间和版本，不由大屏另行计算。');
    if (action === 'tour') return startTour();
    if (action === 'reset') return confirmReset();
  }

  function startTour() {
    showModal('GUIDED DEMO', '演示导览', `
      <div class="evidence-list">
        <div>01 综合大屏：业务价值、场区态势和风险控制</div>
        <div>02 健康防疫：告警 → 兽医工单 → 人工闭环</div>
        <div>03 良种繁育：永久身份 → 系谱证据 → 选配建议</div>
        <div>04 采茸追溯：个体 → 批次 → 质量证据 → 标签</div>
        <div>05 质量库存：限制 → 出库阻断 → 召回清单</div>
        <div>06 农户服务：交付证据 → 结算草稿 → 双方确认</div>
        <div>07 技术底座：统一事实源、边缘自治和安全控制</div>
      </div>
    `, '<button class="secondary-button" data-action="close-modal">稍后</button><button class="primary-button" data-action="tour-start">从综合大屏开始</button>');
  }

  function confirmReset() {
    showModal('RESET LOCAL DEMO', '重置演示数据', '<p>将清除本浏览器中的工单流转、质量限制、召回和结算确认记录，恢复固定种子状态。</p>', '<button class="secondary-button" data-action="close-modal">取消</button><button class="primary-button" data-action="reset-confirm">确认重置</button>');
  }

  function wireTableFilter() {
    const input = main.querySelector('[data-filter-table]');
    if (!input) return;
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      main.querySelectorAll('tbody tr').forEach((row) => { row.hidden = q && !row.textContent.toLowerCase().includes(q); });
    });
  }

  function animateNumbers() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    main.querySelectorAll('[data-animate-number]').forEach((el) => {
      const target = Number(el.dataset.animateNumber);
      if (!Number.isFinite(target)) return;
      const decimals = String(el.dataset.animateNumber).includes('.') ? 1 : 0;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / 720);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  function searchAll(query) {
    const q = query.trim().toLowerCase();
    if (!q) { searchResults.hidden = true; return; }
    const entries = [
      ...D.deer.map((x) => ({ type: '鹿只', label: `${x.id} ${x.name}`, view: 'breeding', action: 'deer-detail', id: x.id })),
      ...D.batches.map((x) => ({ type: '批次', label: `${x.id} ${x.name}`, view: 'trace', action: 'batch-detail', id: x.id })),
      ...D.farmers.map((x) => ({ type: '农户', label: `${x.id} ${x.name}`, view: 'farmers', action: 'farmer-detail', id: x.id })),
      ...D.orders.map((x) => ({ type: '订单', label: `${x.id} ${x.customer}`, view: 'assets', action: 'order-detail', id: x.id })),
    ].filter((x) => x.label.toLowerCase().includes(q)).slice(0, 7);
    searchResults.innerHTML = entries.length ? entries.map((x) => `<button data-search-view="${x.view}" data-search-action="${x.action}" data-id="${x.id}"><span>${V.helpers.esc(x.label)}</span><small>${x.type}</small></button>`).join('') : '<button disabled><span>未找到匹配的模拟对象</span></button>';
    searchResults.hidden = false;
  }

  nav.addEventListener('click', (event) => {
    const item = event.target.closest('[data-view]');
    if (item) navigate(item.dataset.view);
  });
  document.addEventListener('click', (event) => {
    const jump = event.target.closest('[data-view-jump]');
    if (jump) return navigate(jump.dataset.viewJump);
    const actionEl = event.target.closest('[data-action]');
    if (actionEl) {
      const action = actionEl.dataset.action;
      if (action === 'tour-start') { closeModal(); return navigate('dashboard'); }
      if (action === 'reset-confirm') {
        localStorage.removeItem(STORAGE_KEY);
        state = { ...defaultState };
        closeModal(); closeDrawer(); render();
        return toast('演示数据已重置', '已恢复固定模拟种子状态。');
      }
      return runAction(action, actionEl.dataset.id, actionEl);
    }
    if (!event.target.closest('.topbar-center')) searchResults.hidden = true;
  });
  search.addEventListener('input', () => searchAll(search.value));
  search.addEventListener('keydown', (event) => { if (event.key === 'Escape') searchResults.hidden = true; });
  searchResults.addEventListener('click', (event) => {
    const item = event.target.closest('[data-search-view]');
    if (!item) return;
    search.value = '';
    searchResults.hidden = true;
    navigate(item.dataset.searchView);
    setTimeout(() => runAction(item.dataset.searchAction, item.dataset.id, item), 60);
  });
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); search.focus(); }
    if (event.key === 'Escape') { closeModal(); closeDrawer(); closeSidebar(); }
  });
  menuButton.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    scrim.hidden = !open;
  });
  scrim.addEventListener('click', () => { closeModal(); closeDrawer(); closeSidebar(); scrim.hidden = true; });

  function updateClock() {
    const el = document.getElementById('clock');
    if (!el) return;
    const now = new Date();
    el.textContent = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
  }
  setInterval(updateClock, 1000);
  updateClock();
  render();
})();

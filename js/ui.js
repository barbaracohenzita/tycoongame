// ============================================
// EMPIRE WARS — UI Rendering (v2 Deep)
// ============================================

const UI = {
  currentBusinessId: null,

  // ============ FORMATTERS ============
  fmtCash(n) {
    if (n === undefined || n === null || isNaN(n)) return '$0';
    const neg = n < 0; n = Math.abs(n);
    let out;
    if (n >= 1000000000) out = '$' + (n/1000000000).toFixed(2) + 'B';
    else if (n >= 1000000) out = '$' + (n/1000000).toFixed(2) + 'M';
    else if (n >= 1000) out = '$' + (n/1000).toFixed(1) + 'K';
    else out = '$' + Math.round(n).toLocaleString();
    return (neg ? '-' : '') + out;
  },
  fmtShort(n) {
    if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n/1000).toFixed(0) + 'K';
    return Math.round(n).toString();
  },
  fmtNum(n) {
    if (n >= 1000000) return (n/1000000).toFixed(2) + 'M';
    if (n >= 1000) return (n/1000).toFixed(1) + 'K';
    return Math.round(n).toLocaleString();
  },

  // ============ SCREEN NAV ============
  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + id).classList.add('active');
  },
  showOverlay(id) { document.getElementById('overlay-' + id).classList.add('active'); },
  hideOverlay(id) { document.getElementById('overlay-' + id).classList.remove('active'); },
  switchTab(name) {
    document.querySelectorAll('#screen-game .tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('#screen-game .tab-pane').forEach(p => p.classList.toggle('active', p.dataset.pane === name));
  },

  // ============ TOAST ============
  toast(msg, variant = '') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast show ' + variant;
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => el.classList.remove('show'), 2200);
  },

  // ============ HUD ============
  renderHUD() {
    const s = Game.state;
    const me = Game.me();
    document.getElementById('hud-cash').textContent = this.fmtCash(me.cash);
    document.getElementById('hud-networth').textContent = this.fmtCash(Game.netWorth(me));
    document.getElementById('hud-turn').textContent = s.turn + '/' + CONFIG.maxTurns;
    const phaseEl = document.getElementById('hud-phase');
    phaseEl.textContent = PHASES[s.phase].label;
    phaseEl.className = 'stat-value phase-' + s.phase;
    const brandEl = document.getElementById('hud-brand');
    if (brandEl) brandEl.textContent = Math.round(me.brand);
  },

  // ============ FACTIONS ============
  renderFactions() {
    const el = document.getElementById('faction-grid');
    el.innerHTML = FACTIONS.map(f => `
      <div class="faction-card" data-faction="${f.id}">
        <div class="faction-emoji">${f.emoji}</div>
        <div class="faction-name">${f.name}</div>
        <div class="faction-bonus">${f.bonus}</div>
      </div>
    `).join('');
  },

  // ============ EMPIRE TAB ============
  renderEmpire() {
    const me = Game.me();
    const listEl = document.getElementById('empire-list');
    const emptyEl = document.getElementById('empire-empty');
    const incomeEl = document.getElementById('empire-income');

    const sim = Game.simulatePlayer(me);
    incomeEl.textContent = (sim.netIncome >= 0 ? '+' : '') + this.fmtCash(sim.netIncome) + '/turn';

    if (me.businesses.length === 0) {
      listEl.innerHTML = ''; emptyEl.style.display = 'block'; return;
    }
    emptyEl.style.display = 'none';

    listEl.innerHTML = me.businesses.map(biz => {
      const ind = Game.getIndustry(biz.industryId);
      const bizRes = Game.simulateBusiness(biz, me);
      const staffCount = biz.employees.reduce((s, e) => s + e.count, 0);
      const totalMkt = Game._marketingTotal(biz);
      return `
        <div class="card biz-card" data-biz-id="${biz.id}">
          <span class="sector-tag sector-${ind.sector}"></span>
          <div class="card-row">
            <div style="flex:1;min-width:0;">
              <div class="card-title">${ind.emoji} ${ind.name}</div>
              <div class="card-subtitle">L${biz.level} · ${ind.sector.toUpperCase()} · Brand ${Math.round(biz.brand)}</div>
              <div class="card-meta">
                <span class="chip ${bizRes.netIncome >= 0 ? 'green' : 'red'}">${bizRes.netIncome >= 0 ? '+' : ''}${this.fmtCash(bizRes.netIncome)}/t</span>
                <span class="chip">💵 Rev ${this.fmtCash(bizRes.totalRevenue)}</span>
                <span class="chip">👥 ${staffCount} staff</span>
                ${totalMkt > 0 ? `<span class="chip">📢 ${this.fmtCash(totalMkt)}</span>` : ''}
              </div>
            </div>
            <div class="chevron">›</div>
          </div>
        </div>
      `;
    }).join('');
  },

  // ============ MARKET TAB ============
  renderMarket() {
    const me = Game.me();
    const listEl = document.getElementById('market-list');
    listEl.innerHTML = INDUSTRIES.map(ind => {
      const canAfford = me.cash >= ind.cost;
      const productPreview = ind.products.map(p => p.name).join(' · ');
      return `
        <div class="card ${!canAfford ? 'disabled' : ''}">
          <span class="sector-tag sector-${ind.sector}"></span>
          <div class="card-row">
            <div style="flex:1;min-width:0;">
              <div class="card-title">${ind.emoji} ${ind.name}</div>
              <div class="card-subtitle">${ind.sector.toUpperCase()} · ${ind.products.length} products</div>
              <div class="card-meta">
                <span class="chip gold">${this.fmtCash(ind.cost)}</span>
              </div>
              <div class="card-subtitle" style="margin-top:6px;">${productPreview}</div>
            </div>
            <button class="card-action" data-act="buy" data-id="${ind.id}" ${!canAfford ? 'disabled' : ''}>BUY</button>
          </div>
        </div>
      `;
    }).join('');
  },

  // ============ RESEARCH TAB ============
  renderResearch() {
    const me = Game.me();
    const listEl = document.getElementById('research-list');
    listEl.innerHTML = TECHS.map(t => {
      const completed = me.activeTechs.includes(t.id);
      const inProgress = me.techs.find(tr => tr.id === t.id);
      const canStart = !completed && !inProgress && me.cash >= t.cost;
      let statusChip = '', btn = '';
      if (completed) { statusChip = '<span class="chip green">✓ Researched</span>'; btn = '<button class="card-action" disabled>DONE</button>'; }
      else if (inProgress) { statusChip = `<span class="chip">${inProgress.turnsLeft} turns left</span>`; btn = `<button class="card-action secondary" disabled>RESEARCHING</button>`; }
      else { statusChip = `<span class="chip gold">${this.fmtCash(t.cost)} · ${t.turns} turns</span>`; btn = `<button class="card-action" data-act="research" data-id="${t.id}" ${!canStart ? 'disabled' : ''}>START</button>`; }
      const sectorChip = t.sector === 'all' ? '<span class="chip">ALL</span>' : `<span class="chip">${t.sector.toUpperCase()}</span>`;
      return `
        <div class="card">
          <div class="card-row">
            <div style="flex:1;min-width:0;">
              <div class="card-title">T${t.tier} · ${t.name}</div>
              <div class="card-subtitle">${t.desc}</div>
              <div class="card-meta">${sectorChip}${statusChip}</div>
              ${inProgress ? `<div class="progress-bar"><div class="progress-fill" style="width:${((t.turns - inProgress.turnsLeft)/t.turns)*100}%"></div></div>` : ''}
            </div>
            ${btn}
          </div>
        </div>
      `;
    }).join('');
  },

  // ============ RIVALS / LEADERBOARD ============
  renderRivals() {
    const listEl = document.getElementById('rivals-list');
    const ranked = Game.getRankings();
    listEl.innerHTML = ranked.map((p, i) => {
      const faction = FACTIONS.find(f => f.id === p.faction);
      const displayName = p.isHuman ? 'You' : p.name;
      return `
        <div class="player-row ${p.isHuman ? 'you' : ''}">
          <div class="rank-badge rank-${i+1}">${i+1}</div>
          <div class="player-info">
            <div class="player-name">${faction.emoji} ${displayName}</div>
            <div class="player-faction">${faction.name} · ${p.businesses.length} biz · Brand ${Math.round(p.brand)}</div>
          </div>
          <div class="player-worth">
            <div class="value">${this.fmtCash(p.netWorth)}</div>
            <div class="detail">${p.lastIncome >= 0 ? '+' : ''}${this.fmtCash(p.lastIncome)}/t</div>
          </div>
        </div>
      `;
    }).join('');
  },

  // ============ FINANCIALS TAB ============
  renderFinancials() {
    const me = Game.me();
    const f = me.financials;
    const sim = Game.simulatePlayer(me);

    // P&L table
    let pnl = `
      <div class="pnl-row header"><span>P&L This Turn</span><span></span></div>
      <div class="pnl-row"><span>Revenue</span><span class="pos">${this.fmtCash(sim.totalRevenue)}</span></div>
      <div class="pnl-row"><span>Total Costs</span><span class="neg">-${this.fmtCash(sim.totalCosts)}</span></div>
      <div class="pnl-row total"><span>Net Profit</span><span class="${sim.netIncome >= 0 ? 'pos' : 'neg'}">${sim.netIncome >= 0 ? '+' : '-'}${this.fmtCash(Math.abs(sim.netIncome))}</span></div>
    `;

    // Cost breakdown
    let prod = 0, sal = 0, mkt = 0;
    sim.businessResults.forEach(br => { prod += br.totalProductionCost; sal += br.salaries; mkt += br.marketing; });
    pnl += `
      <div class="pnl-row header"><span>Cost Breakdown</span><span></span></div>
      <div class="pnl-row"><span>Production</span><span class="neg">-${this.fmtCash(prod)}</span></div>
      <div class="pnl-row"><span>Salaries</span><span class="neg">-${this.fmtCash(sal)}</span></div>
      <div class="pnl-row"><span>Marketing</span><span class="neg">-${this.fmtCash(mkt)}</span></div>
    `;

    document.getElementById('pnl-box').innerHTML = pnl;

    // Chart
    const chartEl = document.getElementById('chart-box');
    if (f.netWorth.length >= 2) {
      chartEl.innerHTML = this.renderSparkline(f.netWorth, f.turns, 'Net Worth');
    } else {
      chartEl.innerHTML = '<div class="empty-state" style="margin:0;">Play a turn to see trend chart.</div>';
    }
  },

  // SVG sparkline generator
  renderSparkline(values, labels, title) {
    const w = 300, h = 120, pad = 16;
    const min = Math.min(...values), max = Math.max(...values);
    const range = max - min || 1;
    const points = values.map((v, i) => {
      const x = pad + (i / (values.length - 1 || 1)) * (w - 2 * pad);
      const y = h - pad - ((v - min) / range) * (h - 2 * pad);
      return `${x},${y}`;
    }).join(' ');
    const lastX = pad + (w - 2 * pad);
    const lastY = h - pad - ((values[values.length-1] - min) / range) * (h - 2 * pad);
    return `
      <div class="chart-title">${title} · last ${values.length} turns</div>
      <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffd700" stop-opacity="0.4"/>
            <stop offset="1" stop-color="#ffd700" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <polyline fill="url(#grad)" stroke="none" points="${pad},${h-pad} ${points} ${w-pad},${h-pad}"/>
        <polyline fill="none" stroke="#ffd700" stroke-width="2" points="${points}"/>
        <circle cx="${lastX}" cy="${lastY}" r="4" fill="#ffd700"/>
        <text x="${w-pad}" y="14" text-anchor="end" fill="#8a95a8" font-size="10">${this.fmtCash(max)}</text>
        <text x="${w-pad}" y="${h-2}" text-anchor="end" fill="#8a95a8" font-size="10">${this.fmtCash(min)}</text>
      </svg>
    `;
  },

  // ============ BUSINESS DETAIL SCREEN ============
  openBusinessDetail(bizId) {
    this.currentBusinessId = bizId;
    this.showScreen('biz-detail');
    this.renderBusinessDetail();
  },

  renderBusinessDetail() {
    const me = Game.me();
    const biz = Game.getBusiness(me, this.currentBusinessId);
    if (!biz) return;
    const ind = Game.getIndustry(biz.industryId);
    const sim = Game.simulateBusiness(biz, me);
    const qualBoost = Game._qualityBoost(biz);

    document.getElementById('bd-title').textContent = `${ind.emoji} ${ind.name}`;
    document.getElementById('bd-subtitle').textContent = `L${biz.level} · ${ind.sector.toUpperCase()} · Brand ${Math.round(biz.brand)}`;

    // Stats row
    document.getElementById('bd-stats').innerHTML = `
      <div class="mini-stat"><div class="mini-label">REVENUE</div><div class="mini-value pos">${this.fmtCash(sim.totalRevenue)}</div></div>
      <div class="mini-stat"><div class="mini-label">COSTS</div><div class="mini-value neg">${this.fmtCash(sim.totalCosts)}</div></div>
      <div class="mini-stat"><div class="mini-label">NET</div><div class="mini-value ${sim.netIncome >= 0 ? 'pos' : 'neg'}">${sim.netIncome >= 0 ? '+' : ''}${this.fmtCash(sim.netIncome)}</div></div>
    `;

    // Products
    const prodHtml = sim.productResults.map(pr => {
      const p = pr.product;
      const priceRatio = (p.price / p.basePrice * 100).toFixed(0);
      return `
        <div class="prod-card">
          <div class="prod-header">
            <div>
              <div class="prod-name">${p.name}</div>
              <div class="prod-sub">Quality ${pr.effectiveQuality} · Vol ${this.fmtNum(pr.volume)}</div>
            </div>
            <div class="prod-stats">
              <div class="prod-rev">${this.fmtCash(pr.revenue)}</div>
              <div class="prod-gross">gross ${this.fmtCash(pr.grossProfit)}</div>
            </div>
          </div>
          <div class="price-row">
            <span class="price-label">Price: <b>$${p.price}</b> <span class="price-base">(base $${p.basePrice}, ${priceRatio}%)</span></span>
          </div>
          <div class="price-controls">
            <button class="price-btn" data-act="price" data-prod="${p.name}" data-delta="-0.2">−20%</button>
            <button class="price-btn" data-act="price" data-prod="${p.name}" data-delta="-0.05">−5%</button>
            <input class="price-input" data-act="price-input" data-prod="${p.name}" type="number" value="${p.price}" min="1">
            <button class="price-btn" data-act="price" data-prod="${p.name}" data-delta="0.05">+5%</button>
            <button class="price-btn" data-act="price" data-prod="${p.name}" data-delta="0.2">+20%</button>
          </div>
        </div>
      `;
    }).join('');
    document.getElementById('bd-products').innerHTML = prodHtml;

    // Staff
    const staffHtml = EMPLOYEE_ROLES.map(role => {
      const existing = biz.employees.find(e => e.role === role.id);
      const count = existing ? existing.count : 0;
      return `
        <div class="staff-row">
          <div class="staff-info">
            <div class="staff-name">${role.emoji} ${role.name}</div>
            <div class="staff-sub">${this.fmtCash(role.salary)}/mo · +${(role.qualityBoost*100).toFixed(0)}% Q · +${(role.volumeBoost*100).toFixed(0)}% V</div>
          </div>
          <div class="staff-controls">
            <button class="mini-btn" data-act="fire" data-role="${role.id}" ${count === 0 ? 'disabled' : ''}>−</button>
            <span class="staff-count">${count}</span>
            <button class="mini-btn primary" data-act="hire" data-role="${role.id}">+</button>
          </div>
        </div>
      `;
    }).join('');
    document.getElementById('bd-staff').innerHTML = staffHtml;

    // Marketing
    const mktHtml = MARKETING_CHANNELS.map(c => {
      const spend = biz.marketingBudget[c.id] || 0;
      const pct = (spend / c.cap) * 100;
      return `
        <div class="mkt-row">
          <div class="mkt-header">
            <span class="mkt-name">${c.emoji} ${c.name}</span>
            <span class="mkt-amount">${this.fmtCash(spend)} / ${this.fmtCash(c.cap)}</span>
          </div>
          <input type="range" class="mkt-slider" data-channel="${c.id}" min="0" max="${c.cap}" step="1000" value="${spend}">
        </div>
      `;
    }).join('');
    document.getElementById('bd-marketing').innerHTML = mktHtml;

    // Upgrade button
    const upCost = Game.upgradeCost(biz);
    const canUp = me.cash >= upCost && biz.level < 10;
    document.getElementById('bd-upgrade').innerHTML = `
      <button class="btn btn-primary btn-full" data-act="upgrade" ${!canUp ? 'disabled' : ''}>
        ${biz.level >= 10 ? 'MAX LEVEL' : `UPGRADE TO L${biz.level + 1} · ${this.fmtCash(upCost)}`}
      </button>
      <button class="btn btn-ghost btn-full" data-act="sell" style="color:var(--danger);">SELL FOR ${this.fmtCash(Math.round(Game.getIndustry(biz.industryId).cost * biz.level * 0.7))}</button>
    `;
  },

  // ============ DECISION POPUP ============
  renderDecision() {
    const d = Game.state.decision;
    if (!d) return;
    document.getElementById('dec-title').textContent = d.title;
    document.getElementById('dec-body').textContent = d.body;
    const optHtml = d.options.map((o, i) => `
      <button class="btn btn-secondary btn-full dec-option" data-idx="${i}">
        ${o.label}
      </button>
    `).join('');
    document.getElementById('dec-options').innerHTML = optHtml;
  },

  // ============ TURN RESOLUTION ============
  renderResolution() {
    const r = Game.state.resolution;
    document.getElementById('res-turn-num').textContent = Game.state.turn;
    const body = document.getElementById('res-body');
    const pr = r.playerResult;

    let html = '';
    html += '<div class="res-section-title">Month P&L</div>';
    html += `<div class="res-line income"><span>Revenue</span><span class="res-amount pos">+${this.fmtCash(pr.totalRevenue)}</span></div>`;
    html += `<div class="res-line expense"><span>Costs</span><span class="res-amount neg">-${this.fmtCash(pr.totalCosts)}</span></div>`;
    html += `<div class="res-line"><span><b>Net Profit</b></span><span class="res-amount ${pr.netIncome >= 0 ? 'pos' : 'neg'}"><b>${pr.netIncome >= 0 ? '+' : '-'}${this.fmtCash(Math.abs(pr.netIncome))}</b></span></div>`;

    html += '<div class="res-section-title">Market</div>';
    html += `<div class="res-line"><span>Phase: <b>${PHASES[r.phase].label}</b></span><span>${r.phaseShifted ? 'Shifted!' : 'Stable'}</span></div>`;

    if (r.event) {
      html += '<div class="res-section-title">Event</div>';
      html += `<div class="res-line event"><span><b>⚡ ${r.event.name}</b><br><small>${r.event.desc}</small></span></div>`;
    }

    if (r.techCompletions.length > 0) {
      html += '<div class="res-section-title">Research Completed</div>';
      r.techCompletions.forEach(tc => {
        html += `<div class="res-line"><span>${tc.isHuman ? 'You' : tc.player}</span><span>🔬 ${tc.tech}</span></div>`;
      });
    }

    html += '<div class="res-section-title">Standings</div>';
    const ranked = Game.getRankings();
    ranked.forEach((p, i) => {
      const displayName = p.isHuman ? 'You' : p.name;
      html += `<div class="res-line"><span>${i+1}. ${displayName}</span><span><b>${this.fmtCash(p.netWorth)}</b></span></div>`;
    });

    body.innerHTML = html;
  },

  // ============ GAME OVER ============
  renderGameOver() {
    const s = Game.state;
    const winner = s.winner;
    const me = Game.me();
    const iWon = winner && winner.isHuman;
    document.getElementById('go-icon').textContent = iWon ? '🏆' : '💀';
    document.getElementById('go-title').textContent = iWon ? 'VICTORY' : 'DEFEAT';
    let subtitle;
    if (iWon && Game.netWorth(me) >= CONFIG.victoryNetWorth) subtitle = `You built a ${this.fmtCash(Game.netWorth(me))} empire!`;
    else if (s.turn > CONFIG.maxTurns) subtitle = iWon ? `Highest net worth after ${CONFIG.maxTurns} turns` : `${winner.name} outlasted you after ${CONFIG.maxTurns} turns`;
    else subtitle = `${winner.name} reached ${this.fmtCash(CONFIG.victoryNetWorth)} first`;
    document.getElementById('go-subtitle').textContent = subtitle;
    const ranked = Game.getRankings();
    let stats = '';
    ranked.forEach((p, i) => {
      const displayName = p.isHuman ? 'You' : p.name;
      stats += `<div class="res-line"><span>${i+1}. ${displayName}</span><span><b>${this.fmtCash(p.netWorth)}</b></span></div>`;
    });
    document.getElementById('go-stats').innerHTML = stats;
  },

  // ============ FULL REFRESH ============
  refresh() {
    this.renderHUD();
    this.renderEmpire();
    this.renderMarket();
    this.renderResearch();
    this.renderRivals();
    this.renderFinancials();
  },
};

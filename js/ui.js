// ============================================
// EMPIRE WARS — UI Rendering
// ============================================

const UI = {
  // ============ FORMATTERS ============
  fmtCash(n) {
    if (n >= 1000000000) return '$' + (n/1000000000).toFixed(2) + 'B';
    if (n >= 1000000)    return '$' + (n/1000000).toFixed(2) + 'M';
    if (n >= 1000)       return '$' + (n/1000).toFixed(1) + 'K';
    if (n < 0)           return '-$' + Math.abs(n).toLocaleString();
    return '$' + n.toLocaleString();
  },
  fmtShort(n) {
    if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n/1000).toFixed(0) + 'K';
    return n.toString();
  },

  // ============ SCREEN NAV ============
  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + id).classList.add('active');
  },

  showOverlay(id) { document.getElementById('overlay-' + id).classList.add('active'); },
  hideOverlay(id) { document.getElementById('overlay-' + id).classList.remove('active'); },

  switchTab(name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.dataset.pane === name));
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

    const totalIncome = Game.totalIncome(me);
    incomeEl.textContent = '+' + this.fmtCash(totalIncome) + '/turn';

    if (me.businesses.length === 0) {
      listEl.innerHTML = '';
      emptyEl.style.display = 'block';
      return;
    }
    emptyEl.style.display = 'none';

    listEl.innerHTML = me.businesses.map(biz => {
      const ind = Game.getIndustry(biz.industryId);
      const rev = Game.businessRevenue(biz, me);
      const upgradeCost = Game.upgradeCost(biz);
      const canUpgrade = me.cash >= upgradeCost && biz.level < 10;
      const sellPrice = Math.round(biz.purchasePrice * biz.level * 0.7);
      return `
        <div class="card">
          <span class="sector-tag sector-${ind.sector}"></span>
          <div class="card-row">
            <div style="flex:1;min-width:0;">
              <div class="card-title">${ind.emoji} ${ind.name}</div>
              <div class="card-subtitle">L${biz.level} · ${ind.sector.toUpperCase()}</div>
              <div class="card-meta">
                <span class="chip green">+${this.fmtCash(rev)}/turn</span>
                <span class="chip">L${biz.level}/10</span>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <button class="card-action" data-act="upgrade" data-id="${biz.id}" ${!canUpgrade ? 'disabled' : ''}>
                ⬆ ${this.fmtShort(upgradeCost)}
              </button>
              <button class="card-action secondary" data-act="sell" data-id="${biz.id}">
                Sell ${this.fmtShort(sellPrice)}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // ============ MARKET TAB ============
  renderMarket() {
    const me = Game.me();
    const listEl = document.getElementById('market-list');
    const ownedInstances = me.businesses.length;
    listEl.innerHTML = INDUSTRIES.map(ind => {
      const canAfford = me.cash >= ind.cost;
      const projRev = Math.round(ind.income * (me.faction === ind.sector ? 1.1 : 1.0));
      return `
        <div class="card ${!canAfford ? 'disabled' : ''}">
          <span class="sector-tag sector-${ind.sector}"></span>
          <div class="card-row">
            <div style="flex:1;min-width:0;">
              <div class="card-title">${ind.emoji} ${ind.name}</div>
              <div class="card-subtitle">${ind.sector.toUpperCase()} · ${ind.volatility} volatility</div>
              <div class="card-meta">
                <span class="chip gold">${this.fmtCash(ind.cost)}</span>
                <span class="chip green">~+${this.fmtCash(projRev)}/turn</span>
              </div>
            </div>
            <button class="card-action" data-act="buy" data-id="${ind.id}" ${!canAfford ? 'disabled' : ''}>
              BUY
            </button>
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
      let statusChip = '';
      let btn = '';
      if (completed) {
        statusChip = '<span class="chip green">✓ Researched</span>';
        btn = '<button class="card-action" disabled>DONE</button>';
      } else if (inProgress) {
        const progress = ((t.turns - inProgress.turnsLeft) / t.turns) * 100;
        statusChip = `<span class="chip">${inProgress.turnsLeft} turns left</span>`;
        btn = `<button class="card-action secondary" disabled>RESEARCHING</button>`;
      } else {
        statusChip = `<span class="chip gold">${this.fmtCash(t.cost)} · ${t.turns} turns</span>`;
        btn = `<button class="card-action" data-act="research" data-id="${t.id}" ${!canStart ? 'disabled' : ''}>START</button>`;
      }
      const sectorChip = t.sector === 'all'
        ? '<span class="chip">ALL SECTORS</span>'
        : `<span class="chip">${t.sector.toUpperCase()}</span>`;
      return `
        <div class="card">
          <div class="card-row">
            <div style="flex:1;min-width:0;">
              <div class="card-title">T${t.tier} · ${t.name}</div>
              <div class="card-subtitle">${t.desc}</div>
              <div class="card-meta">
                ${sectorChip}
                ${statusChip}
              </div>
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
            <div class="player-faction">${faction.name} · ${p.businesses.length} businesses</div>
          </div>
          <div class="player-worth">
            <div class="value">${this.fmtCash(p.netWorth)}</div>
            <div class="detail">+${this.fmtCash(p.income)}/turn</div>
          </div>
        </div>
      `;
    }).join('');
  },

  // ============ TURN RESOLUTION ============
  renderResolution() {
    const r = Game.state.resolution;
    document.getElementById('res-turn-num').textContent = Game.state.turn;
    const body = document.getElementById('res-body');

    const phaseLabel = PHASES[r.phase].label;
    const meIncome = r.payouts.find(p => p.isHuman).income;

    let html = '';

    // Income section
    html += '<div class="res-section-title">Your Income</div>';
    html += `<div class="res-line income"><span>Business revenue</span><span class="res-amount">+${this.fmtCash(meIncome)}</span></div>`;

    // Market
    html += '<div class="res-section-title">Market</div>';
    html += `<div class="res-line"><span>Phase: <b>${phaseLabel}</b></span><span>${r.phaseShifted ? 'Shifted!' : 'Stable'}</span></div>`;

    // Event
    if (r.event) {
      html += '<div class="res-section-title">Event</div>';
      html += `<div class="res-line event"><span><b>⚡ ${r.event.name}</b><br><small>${r.event.desc}</small></span></div>`;
    }

    // Research completions
    if (r.techCompletions.length > 0) {
      html += '<div class="res-section-title">Research Completed</div>';
      r.techCompletions.forEach(tc => {
        html += `<div class="res-line"><span>${tc.isHuman ? 'You' : tc.player}</span><span>🔬 ${tc.tech}</span></div>`;
      });
    }

    // Rival snapshot
    html += '<div class="res-section-title">Standings</div>';
    const ranked = Game.getRankings();
    ranked.forEach((p, i) => {
      const nwStr = this.fmtCash(p.netWorth);
      html += `<div class="res-line"><span>${i+1}. ${p.name}</span><span><b>${nwStr}</b></span></div>`;
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
    if (iWon && Game.netWorth(me) >= CONFIG.victoryNetWorth) {
      subtitle = `You built a ${this.fmtCash(Game.netWorth(me))} empire!`;
    } else if (s.turn > CONFIG.maxTurns) {
      subtitle = iWon ? `Highest net worth after ${CONFIG.maxTurns} turns` : `${winner.name} outlasted you after ${CONFIG.maxTurns} turns`;
    } else {
      subtitle = `${winner.name} reached ${this.fmtCash(CONFIG.victoryNetWorth)} first`;
    }
    document.getElementById('go-subtitle').textContent = subtitle;

    const ranked = Game.getRankings();
    let stats = '';
    ranked.forEach((p, i) => {
      stats += `<div class="res-line"><span>${i+1}. ${p.name}</span><span><b>${this.fmtCash(p.netWorth)}</b></span></div>`;
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
  },
};

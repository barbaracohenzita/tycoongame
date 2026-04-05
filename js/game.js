// ============================================
// EMPIRE WARS — Game Engine (v2 Deep)
// ============================================

const Game = {
  state: null,

  // ============ INIT ============
  newGame(playerFaction) {
    const player = this._newPlayer(0, 'You', playerFaction, true);
    const availableAI = AI_NAMES.filter(a => a.faction !== playerFaction);
    const shuffled = [...availableAI].sort(() => Math.random() - 0.5).slice(0, 3);
    const ais = shuffled.map((a, i) => {
      const p = this._newPlayer(i + 1, a.name, a.faction, false);
      p.personality = a.personality;
      return p;
    });
    this.state = {
      turn: 1,
      phase: 'normal',
      multipliers: this._baseMultipliers(),
      players: [player, ...ais],
      event: null,
      decision: null,
      history: [],
      resolution: null,
      gameOver: false,
      winner: null,
    };
    this.save();
    return this.state;
  },

  _newPlayer(id, name, faction, isHuman) {
    return {
      id, name, faction, isHuman,
      cash: CONFIG.startCash, rep: CONFIG.startRep, brand: CONFIG.startBrand,
      businesses: [], techs: [], activeTechs: [],
      financials: { turns: [], revenue: [], costs: [], profit: [], cash: [], netWorth: [] },
    };
  },

  _baseMultipliers() {
    return SECTORS.reduce((m, s) => ({ ...m, [s]: 1.0 }), {});
  },

  // ============ PERSIST ============
  save() { try { localStorage.setItem('empireWarsSave', JSON.stringify(this.state)); } catch (e) {} },
  load() {
    try { const raw = localStorage.getItem('empireWarsSave'); if (!raw) return null; this.state = JSON.parse(raw); return this.state; } catch (e) { return null; }
  },
  hasSave() { return !!localStorage.getItem('empireWarsSave'); },
  clearSave() { localStorage.removeItem('empireWarsSave'); },

  // ============ HELPERS ============
  me() { return this.state.players[0]; },
  getIndustry(id) { return INDUSTRIES.find(i => i.id === id); },
  getTech(id) { return TECHS.find(t => t.id === id); },
  getRole(id) { return EMPLOYEE_ROLES.find(r => r.id === id); },
  getChannel(id) { return MARKETING_CHANNELS.find(c => c.id === id); },
  getBusiness(player, bizId) { return player.businesses.find(b => b.id === bizId); },

  // Sum of employee quality boost for a business
  _qualityBoost(biz) {
    return biz.employees.reduce((sum, e) => sum + (this.getRole(e.role).qualityBoost * e.count), 0);
  },
  _volumeBoost(biz) {
    return 1 + biz.employees.reduce((sum, e) => sum + (this.getRole(e.role).volumeBoost * e.count), 0);
  },
  _marketingTotal(biz) {
    return MARKETING_CHANNELS.reduce((sum, c) => sum + (biz.marketingBudget[c.id] || 0), 0);
  },
  _salaryTotal(biz) {
    return biz.employees.reduce((sum, e) => sum + (this.getRole(e.role).salary * e.count), 0);
  },

  // ============ DEMAND SIMULATION ============
  simulateProduct(biz, prod, player) {
    const ind = this.getIndustry(biz.industryId);

    // Quality: base + level scale + employee boost + tech quality boost
    const qualityBoostFromTech = player.activeTechs.some(t => t === 't_ai') ? 0.20 : 0;
    const effectiveQuality = prod.baseQuality + (biz.level - 1) * 0.3 + this._qualityBoost(biz) * 5 + qualityBoostFromTech * 5;

    // Price effect (exponential decay above base, gains below base)
    const priceRatio = prod.price / prod.basePrice;
    const elasticity = CONFIG.priceElasticityBase * 1.2;
    const priceEffect = Math.exp(-(priceRatio - 1) * elasticity);

    // Quality effect (vs baseline of 3)
    const qualityEffect = 1 + (effectiveQuality - 3) * CONFIG.qualityDemandMultiplier;

    // Marketing effect: per-channel efficacy
    let marketingEffect = 1;
    let brandFromTech = player.activeTechs.some(t => t === 't_brand') ? 1.15 : 1.0;
    MARKETING_CHANNELS.forEach(c => {
      const spend = biz.marketingBudget[c.id] || 0;
      if (spend > 0) {
        const normalized = Math.min(spend, c.cap) / c.cap;
        marketingEffect += normalized * c.baseEfficacy * 0.15 * brandFromTech;
      }
    });

    // Brand effect
    const combinedBrand = (player.brand + biz.brand) / 2;
    const brandEffect = 1 + (combinedBrand - 50) / 200;

    // Sector & phase
    const sectorMult = this.state.multipliers[ind.sector] || 1;

    // Home sector bonus
    const homeBonus = player.faction === ind.sector ? 1 + CONFIG.homeSectorBonus : 1;

    // Tech sector volume bonus
    let techVolBonus = 1;
    player.activeTechs.forEach(tid => {
      const t = this.getTech(tid);
      if (!t) return;
      if (t.sector === 'all' || t.sector === ind.sector) {
        if (t.id !== 't_ai' && t.id !== 't_brand') techVolBonus += t.bonus;
      }
    });

    // Competitor pressure: compare own price to others in same sector
    let competitorPressure = 1;
    this.state.players.forEach(other => {
      if (other.id === player.id) return;
      other.businesses.forEach(otherBiz => {
        const otherInd = this.getIndustry(otherBiz.industryId);
        if (otherInd.sector === ind.sector) {
          otherBiz.products.forEach(otherProd => {
            if (otherProd.name === prod.name || otherInd.id === ind.id) {
              if (otherProd.price < prod.price) competitorPressure -= 0.02;
              else if (otherProd.price > prod.price * 1.1) competitorPressure += 0.02;
            }
          });
        }
      });
    });
    competitorPressure = Math.max(0.6, Math.min(1.3, competitorPressure));

    // Employee volume boost
    const volBoost = this._volumeBoost(biz);

    // Final volume
    const volumeBase = prod.unitDemand * biz.level;
    const volume = Math.max(0, Math.round(
      volumeBase * priceEffect * qualityEffect * marketingEffect * brandEffect *
      sectorMult * homeBonus * techVolBonus * competitorPressure * volBoost
    ));

    const revenue = Math.round(volume * prod.price);
    const productionCost = Math.round(volume * prod.baseCost);
    const grossProfit = revenue - productionCost;

    return { volume, revenue, productionCost, grossProfit, effectiveQuality: +effectiveQuality.toFixed(1) };
  },

  simulateBusiness(biz, player) {
    const productResults = biz.products.map(p => ({
      product: p,
      ...this.simulateProduct(biz, p, player),
    }));
    const totalRevenue = productResults.reduce((s, r) => s + r.revenue, 0);
    const totalProductionCost = productResults.reduce((s, r) => s + r.productionCost, 0);
    const salaries = this._salaryTotal(biz);
    const marketing = this._marketingTotal(biz);
    const totalCosts = totalProductionCost + salaries + marketing;
    const netIncome = totalRevenue - totalCosts;
    return { productResults, totalRevenue, totalProductionCost, salaries, marketing, totalCosts, netIncome };
  },

  simulatePlayer(player) {
    const businessResults = player.businesses.map(b => ({ biz: b, ...this.simulateBusiness(b, player) }));
    const totalRevenue = businessResults.reduce((s, r) => s + r.totalRevenue, 0);
    const totalCosts = businessResults.reduce((s, r) => s + r.totalCosts, 0);
    const netIncome = totalRevenue - totalCosts;
    return { businessResults, totalRevenue, totalCosts, netIncome };
  },

  // ============ VALUATION ============
  netWorth(player) {
    const bizValue = player.businesses.reduce((sum, b) => sum + (this.getIndustry(b.industryId).cost * b.level), 0);
    return player.cash + bizValue;
  },
  upgradeCost(biz) {
    const ind = this.getIndustry(biz.industryId);
    return Math.round(ind.cost * biz.level * CONFIG.upgradeCostMultiplier);
  },

  // ============ ACTIONS ============
  buyBusiness(playerId, industryId) {
    const player = this.state.players[playerId];
    const ind = this.getIndustry(industryId);
    if (!player || !ind) return { ok: false, reason: 'Invalid' };
    if (player.cash < ind.cost) return { ok: false, reason: 'Not enough cash' };
    player.cash -= ind.cost;
    const products = ind.products.map(p => ({
      name: p.name,
      basePrice: p.basePrice,
      price: p.basePrice,  // player can adjust
      baseCost: p.baseCost,
      baseQuality: p.baseQuality,
      unitDemand: p.unitDemand,
    }));
    const biz = {
      id: `b${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      industryId, level: 1, emoji: ind.emoji,
      products,
      employees: [{ role: 'worker', count: 1 }],
      marketingBudget: { social: 0, search: 0, tv: 0, pr: 0 },
      brand: 40,
    };
    player.businesses.push(biz);
    this.save();
    return { ok: true };
  },

  upgradeBusiness(playerId, bizId) {
    const player = this.state.players[playerId];
    const biz = this.getBusiness(player, bizId);
    if (!biz) return { ok: false };
    if (biz.level >= 10) return { ok: false, reason: 'Max level' };
    const cost = this.upgradeCost(biz);
    if (player.cash < cost) return { ok: false, reason: 'Not enough cash' };
    player.cash -= cost;
    biz.level += 1;
    biz.brand = Math.min(100, biz.brand + 3);
    this.save();
    return { ok: true };
  },

  sellBusiness(playerId, bizId) {
    const player = this.state.players[playerId];
    const biz = this.getBusiness(player, bizId);
    if (!biz) return { ok: false };
    const ind = this.getIndustry(biz.industryId);
    const payout = Math.round(ind.cost * biz.level * 0.7);
    player.cash += payout;
    player.businesses = player.businesses.filter(b => b.id !== bizId);
    this.save();
    return { ok: true, payout };
  },

  setProductPrice(playerId, bizId, productName, price) {
    const player = this.state.players[playerId];
    const biz = this.getBusiness(player, bizId);
    if (!biz) return { ok: false };
    const prod = biz.products.find(p => p.name === productName);
    if (!prod) return { ok: false };
    prod.price = Math.max(1, Math.round(price));
    this.save();
    return { ok: true };
  },

  hireEmployee(playerId, bizId, role) {
    const player = this.state.players[playerId];
    const biz = this.getBusiness(player, bizId);
    if (!biz) return { ok: false };
    const r = this.getRole(role);
    if (!r) return { ok: false };
    const existing = biz.employees.find(e => e.role === role);
    if (existing) existing.count += 1;
    else biz.employees.push({ role, count: 1 });
    this.save();
    return { ok: true };
  },

  fireEmployee(playerId, bizId, role) {
    const player = this.state.players[playerId];
    const biz = this.getBusiness(player, bizId);
    if (!biz) return { ok: false };
    const existing = biz.employees.find(e => e.role === role);
    if (!existing || existing.count <= 0) return { ok: false };
    existing.count -= 1;
    if (existing.count <= 0) biz.employees = biz.employees.filter(e => e.role !== role);
    this.save();
    return { ok: true };
  },

  setMarketingBudget(playerId, bizId, channel, amount) {
    const player = this.state.players[playerId];
    const biz = this.getBusiness(player, bizId);
    if (!biz) return { ok: false };
    biz.marketingBudget[channel] = Math.max(0, Math.round(amount));
    this.save();
    return { ok: true };
  },

  startResearch(playerId, techId) {
    const player = this.state.players[playerId];
    const tech = this.getTech(techId);
    if (!tech) return { ok: false };
    if (player.techs.some(t => t.id === techId)) return { ok: false, reason: 'Already in progress' };
    if (player.activeTechs.includes(techId)) return { ok: false, reason: 'Already completed' };
    if (player.cash < tech.cost) return { ok: false, reason: 'Not enough cash' };
    player.cash -= tech.cost;
    player.techs.push({ id: techId, turnsLeft: tech.turns });
    this.save();
    return { ok: true };
  },

  resolveDecision(choiceIdx) {
    const dec = this.state.decision;
    if (!dec) return;
    const option = dec.options[choiceIdx];
    const me = this.me();
    me.cash += option.cashDelta || 0;
    me.rep = Math.max(0, Math.min(100, me.rep + (option.repDelta || 0)));
    me.brand = Math.max(0, Math.min(100, me.brand + (option.brandDelta || 0)));
    if (option.risk && Math.random() < option.risk.chance) {
      me.cash += option.risk.cashDelta || 0;
      me.brand = Math.max(0, Math.min(100, me.brand + (option.risk.brandDelta || 0)));
      me.rep = Math.max(0, Math.min(100, me.rep + (option.risk.repDelta || 0)));
      this.state.lastRiskHit = true;
    } else {
      this.state.lastRiskHit = false;
    }
    this.state.decision = null;
    this.save();
  },

  // ============ TURN RESOLUTION ============
  endTurn() {
    // 1. Resolve business P&L for all players
    const allResults = this.state.players.map(p => {
      const res = this.simulatePlayer(p);
      p.cash += res.netIncome;
      // Track financials for charts
      p.financials.turns.push(this.state.turn);
      p.financials.revenue.push(res.totalRevenue);
      p.financials.costs.push(res.totalCosts);
      p.financials.profit.push(res.netIncome);
      p.financials.cash.push(p.cash);
      p.financials.netWorth.push(this.netWorth(p));
      // Trim history
      if (p.financials.turns.length > 30) {
        Object.keys(p.financials).forEach(k => p.financials[k].shift());
      }
      return { player: p, ...res };
    });

    // 2. AI turn decisions (buy/upgrade/adjust)
    this.state.players.forEach(p => { if (!p.isHuman) this._aiTurn(p); });

    // 3. Advance research
    const techCompletions = [];
    this.state.players.forEach(p => {
      p.techs = p.techs.filter(tr => {
        tr.turnsLeft -= 1;
        if (tr.turnsLeft <= 0) {
          p.activeTechs.push(tr.id);
          const t = this.getTech(tr.id);
          techCompletions.push({ player: p.name, tech: t.name, isHuman: p.isHuman });
          return false;
        }
        return true;
      });
    });

    // 4. Brand decay/growth
    this.state.players.forEach(p => {
      // Brand grows slightly from marketing, decays from no marketing
      const totalMarketing = p.businesses.reduce((s, b) => s + this._marketingTotal(b), 0);
      if (totalMarketing > 10000) p.brand = Math.min(100, p.brand + 0.5);
      else p.brand = Math.max(10, p.brand - 0.3);
    });

    // 5. Market shift (every N turns)
    let phaseShifted = false;
    if (this.state.turn % CONFIG.phaseShiftEveryTurns === 0) {
      this._shiftPhase();
      phaseShifted = true;
    }

    // 6. Random event
    let firedEvent = null;
    this.state.event = null;
    if (Math.random() < CONFIG.eventProbability) {
      firedEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      this.state.event = firedEvent;
      this._applyEventToMultipliers(firedEvent);
    }

    // 7. Random decision (human only, 3+ turns in)
    let firedDecision = null;
    if (this.state.turn > 2 && Math.random() < CONFIG.decisionProbability) {
      firedDecision = DECISIONS[Math.floor(Math.random() * DECISIONS.length)];
      this.state.decision = firedDecision;
    }

    // 8. Advance turn
    this.state.turn += 1;

    // 9. Victory check
    const winner = this._checkVictory();
    if (winner) { this.state.gameOver = true; this.state.winner = winner; }

    // 10. Reset sector multipliers (re-apply phase)
    this.state.multipliers = this._baseMultipliers();
    this._applyPhaseToMultipliers();

    this.state.resolution = {
      playerResult: allResults[0],
      phase: this.state.phase,
      phaseShifted,
      event: firedEvent,
      decision: firedDecision,
      techCompletions,
    };
    this.save();
    return this.state.resolution;
  },

  _aiTurn(ai) {
    const actionsLeft = (ai.personality === 'aggressive' ? 3 : ai.personality === 'growth' ? 2 : 2);
    for (let i = 0; i < actionsLeft; i++) {
      let didAction = false;

      // Adjust prices slightly (simulates competitive pricing)
      ai.businesses.forEach(biz => {
        biz.products.forEach(prod => {
          const drift = (Math.random() - 0.45) * 0.06;
          prod.price = Math.max(1, Math.round(prod.price * (1 + drift)));
        });
      });

      // Buy a business if can afford & < 4 owned
      if (ai.businesses.length < 4 && ai.cash > 150000) {
        const affordable = INDUSTRIES.filter(ind => ind.cost <= ai.cash * 0.65);
        const home = affordable.filter(ind => ind.sector === ai.faction);
        const pick = (home.length > 0 ? home : affordable).sort((a, b) => a.cost - b.cost).pop();
        if (pick) { this.buyBusiness(ai.id, pick.id); didAction = true; continue; }
      }

      // Upgrade top business
      if (ai.businesses.length > 0 && ai.cash > 80000) {
        const target = ai.businesses
          .filter(b => b.level < 7)
          .map(b => ({ b, cost: this.upgradeCost(b) }))
          .filter(x => ai.cash >= x.cost)
          .sort((a, b) => a.cost - b.cost)[0];
        if (target) { this.upgradeBusiness(ai.id, target.b.id); didAction = true; continue; }
      }

      // Invest in marketing on top business
      if (ai.businesses.length > 0 && ai.cash > 40000) {
        const topBiz = ai.businesses.sort((a, b) => b.level - a.level)[0];
        const channel = MARKETING_CHANNELS[Math.floor(Math.random() * MARKETING_CHANNELS.length)];
        topBiz.marketingBudget[channel.id] = Math.min(channel.cap, (topBiz.marketingBudget[channel.id] || 0) + 8000);
        didAction = true; continue;
      }

      // Hire employee
      if (ai.businesses.length > 0 && ai.cash > 20000) {
        const biz = ai.businesses[Math.floor(Math.random() * ai.businesses.length)];
        const role = EMPLOYEE_ROLES[Math.floor(Math.random() * 3)]; // cheap roles
        this.hireEmployee(ai.id, biz.id, role.id);
        didAction = true; continue;
      }

      // Research
      if (ai.cash > 100000 && ai.techs.length === 0) {
        const availableTech = TECHS
          .filter(t => !ai.activeTechs.includes(t.id))
          .filter(t => ai.cash >= t.cost)
          .sort((a, b) => a.cost - b.cost)[0];
        if (availableTech) { this.startResearch(ai.id, availableTech.id); didAction = true; continue; }
      }

      if (!didAction) break;
    }
  },

  _shiftPhase() {
    const transitions = {
      boom:      [['normal', 0.5], ['boom', 0.3], ['recession', 0.15], ['crash', 0.05]],
      normal:    [['normal', 0.4], ['boom', 0.3], ['recession', 0.25], ['crash', 0.05]],
      recession: [['normal', 0.4], ['recession', 0.3], ['crash', 0.15], ['boom', 0.15]],
      crash:     [['recession', 0.5], ['normal', 0.3], ['crash', 0.15], ['boom', 0.05]],
    };
    const options = transitions[this.state.phase];
    const r = Math.random();
    let cum = 0;
    for (const [p, prob] of options) { cum += prob; if (r < cum) { this.state.phase = p; break; } }
  },

  _applyPhaseToMultipliers() {
    const phaseMult = PHASES[this.state.phase].mult;
    SECTORS.forEach(s => {
      const variance = (Math.random() - 0.5) * 0.18;
      this.state.multipliers[s] = Math.max(0.35, +(phaseMult + variance).toFixed(2));
    });
  },

  _applyEventToMultipliers(event) {
    if (event.sector === 'all') SECTORS.forEach(s => { this.state.multipliers[s] *= event.mult; });
    else this.state.multipliers[event.sector] *= event.mult;
    SECTORS.forEach(s => { this.state.multipliers[s] = +this.state.multipliers[s].toFixed(2); });
  },

  _checkVictory() {
    if (this.state.turn > CONFIG.maxTurns) {
      const ranked = [...this.state.players].sort((a, b) => this.netWorth(b) - this.netWorth(a));
      return ranked[0];
    }
    const winner = this.state.players.find(p => this.netWorth(p) >= CONFIG.victoryNetWorth);
    return winner || null;
  },

  getRankings() {
    return [...this.state.players]
      .map(p => ({ ...p, netWorth: this.netWorth(p), lastIncome: p.financials.profit.at(-1) || 0 }))
      .sort((a, b) => b.netWorth - a.netWorth);
  },
};

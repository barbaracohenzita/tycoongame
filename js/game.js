// ============================================
// EMPIRE WARS — Game Engine
// ============================================

const Game = {
  state: null,

  // ============ INIT ============
  newGame(playerFaction) {
    const player = {
      id: 0, name: 'You', faction: playerFaction, isHuman: true,
      cash: CONFIG.startCash, rep: CONFIG.startRep,
      businesses: [], techs: [], activeTechs: [],
    };
    // Pick 3 AI rivals (avoid same faction)
    const availableAI = AI_NAMES.filter(a => a.faction !== playerFaction);
    const shuffled = [...availableAI].sort(() => Math.random() - 0.5).slice(0, 3);
    const ais = shuffled.map((a, i) => ({
      id: i + 1, name: a.name, faction: a.faction, isHuman: false, personality: a.personality,
      cash: CONFIG.startCash, rep: CONFIG.startRep,
      businesses: [], techs: [], activeTechs: [],
    }));
    this.state = {
      turn: 1,
      phase: 'normal',
      multipliers: this._baseMultipliers(),
      players: [player, ...ais],
      event: null,
      history: [],
      resolution: null,
      gameOver: false,
      winner: null,
    };
    this.save();
    return this.state;
  },

  _baseMultipliers() {
    return SECTORS.reduce((m, s) => ({ ...m, [s]: 1.0 }), {});
  },

  // ============ PERSIST ============
  save() {
    try { localStorage.setItem('empireWarsSave', JSON.stringify(this.state)); } catch (e) {}
  },
  load() {
    try {
      const raw = localStorage.getItem('empireWarsSave');
      if (!raw) return null;
      this.state = JSON.parse(raw);
      return this.state;
    } catch (e) { return null; }
  },
  hasSave() { return !!localStorage.getItem('empireWarsSave'); },
  clearSave() { localStorage.removeItem('empireWarsSave'); },

  // ============ HELPERS ============
  me() { return this.state.players[0]; },
  getIndustry(id) { return INDUSTRIES.find(i => i.id === id); },
  getTech(id) { return TECHS.find(t => t.id === id); },

  businessRevenue(biz, player) {
    const ind = this.getIndustry(biz.industryId);
    const sectorMult = this.state.multipliers[ind.sector] || 1;
    const homeBonus = player.faction === ind.sector ? CONFIG.homeSectorBonus : 0;
    // Sum active tech bonuses that apply to this business
    const techBonus = player.activeTechs.reduce((sum, tId) => {
      const t = this.getTech(tId);
      if (!t) return sum;
      if (t.sector === 'all' || t.sector === ind.sector) return sum + t.bonus;
      return sum;
    }, 0);
    const modifier = 1 + homeBonus + techBonus;
    const morale = CONFIG.morale / 100;
    return Math.round(biz.baseIncome * biz.level * modifier * morale * sectorMult);
  },

  totalIncome(player) {
    return player.businesses.reduce((sum, b) => sum + this.businessRevenue(b, player), 0);
  },

  netWorth(player) {
    const bizValue = player.businesses.reduce((sum, b) => sum + (b.purchasePrice * b.level), 0);
    return player.cash + bizValue;
  },

  upgradeCost(biz) {
    return Math.round(biz.purchasePrice * biz.level * CONFIG.upgradeCostMultiplier);
  },

  // ============ PLAYER ACTIONS ============
  buyBusiness(playerId, industryId) {
    const player = this.state.players[playerId];
    const ind = this.getIndustry(industryId);
    if (!player || !ind) return { ok: false, reason: 'Invalid' };
    if (player.cash < ind.cost) return { ok: false, reason: 'Not enough cash' };
    player.cash -= ind.cost;
    player.businesses.push({
      id: `b${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      industryId, level: 1, baseIncome: ind.income, purchasePrice: ind.cost,
    });
    this._log(`${player.name} bought ${ind.name}`);
    this.save();
    return { ok: true };
  },

  upgradeBusiness(playerId, bizId) {
    const player = this.state.players[playerId];
    const biz = player.businesses.find(b => b.id === bizId);
    if (!biz) return { ok: false, reason: 'Not found' };
    if (biz.level >= 10) return { ok: false, reason: 'Max level' };
    const cost = this.upgradeCost(biz);
    if (player.cash < cost) return { ok: false, reason: 'Not enough cash' };
    player.cash -= cost;
    biz.level += 1;
    const ind = this.getIndustry(biz.industryId);
    this._log(`${player.name} upgraded ${ind.name} to L${biz.level}`);
    this.save();
    return { ok: true };
  },

  sellBusiness(playerId, bizId) {
    const player = this.state.players[playerId];
    const biz = player.businesses.find(b => b.id === bizId);
    if (!biz) return { ok: false };
    const payout = Math.round(biz.purchasePrice * biz.level * 0.7);
    player.cash += payout;
    player.businesses = player.businesses.filter(b => b.id !== bizId);
    const ind = this.getIndustry(biz.industryId);
    this._log(`${player.name} sold ${ind.name} for $${(payout/1000).toFixed(0)}K`);
    this.save();
    return { ok: true, payout };
  },

  startResearch(playerId, techId) {
    const player = this.state.players[playerId];
    const tech = this.getTech(techId);
    if (!tech) return { ok: false };
    if (player.techs.some(t => t.id === techId)) return { ok: false, reason: 'Already researching/completed' };
    if (player.activeTechs.includes(techId)) return { ok: false, reason: 'Already completed' };
    if (player.cash < tech.cost) return { ok: false, reason: 'Not enough cash' };
    player.cash -= tech.cost;
    player.techs.push({ id: techId, turnsLeft: tech.turns });
    this._log(`${player.name} started researching ${tech.name}`);
    this.save();
    return { ok: true };
  },

  // ============ TURN RESOLUTION ============
  endTurn() {
    const log = [];

    // 1. AI turns
    this.state.players.forEach(p => {
      if (!p.isHuman) this._aiTurn(p, log);
    });

    // 2. Income payout for all players
    const payouts = [];
    this.state.players.forEach(p => {
      const income = this.totalIncome(p);
      p.cash += income;
      payouts.push({ name: p.name, income, isHuman: p.isHuman });
    });

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

    // 4. Market shift (every N turns)
    let phaseShifted = false;
    if (this.state.turn % CONFIG.phaseShiftEveryTurns === 0) {
      this._shiftPhase();
      phaseShifted = true;
    }

    // 5. Random event
    let firedEvent = null;
    this.state.event = null;
    if (Math.random() < CONFIG.eventProbability) {
      firedEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      this.state.event = firedEvent;
      this._applyEventToMultipliers(firedEvent);
    }

    // 6. Advance turn
    this.state.turn += 1;

    // 7. Victory check
    const winner = this._checkVictory();
    if (winner) {
      this.state.gameOver = true;
      this.state.winner = winner;
    }

    // 8. Reset multipliers (events are single-turn)
    if (firedEvent && !phaseShifted) {
      // keep base multipliers stable, event was single-turn
      this.state.multipliers = this._baseMultipliers();
      this._applyPhaseToMultipliers();
    } else if (firedEvent && phaseShifted) {
      // both fired — phase applied first, event adjusted on top. Next turn will re-apply base phase.
      this.state.multipliers = this._baseMultipliers();
      this._applyPhaseToMultipliers();
    }

    this.state.resolution = { payouts, techCompletions, phaseShifted, event: firedEvent, phase: this.state.phase };
    this.save();
    return this.state.resolution;
  },

  _aiTurn(ai, log) {
    // Simple AI: try to buy cheapest affordable, then upgrade best-ROI business, then research
    const personality = ai.personality || 'steady';
    let actionsLeft = personality === 'aggressive' ? 3 : 2;

    while (actionsLeft > 0) {
      let didAction = false;

      // Priority 1: Buy a business if cash allows and < 4 businesses owned (diversification)
      if (ai.businesses.length < 4 && ai.cash > 120000) {
        // Prefer home sector first, then affordable cheap options
        const affordable = INDUSTRIES.filter(i => i.cost <= ai.cash * 0.7);
        const home = affordable.filter(i => i.sector === ai.faction);
        const pick = (home.length > 0 ? home : affordable).sort((a, b) => (a.income / a.cost) - (b.income / b.cost)).pop();
        if (pick) {
          this.buyBusiness(ai.id, pick.id);
          didAction = true;
        }
      }

      // Priority 2: Upgrade highest-income business
      if (!didAction && ai.businesses.length > 0 && ai.cash > 50000) {
        const best = [...ai.businesses]
          .filter(b => b.level < 6)
          .map(b => ({ b, cost: this.upgradeCost(b), inc: this.businessRevenue(b, ai) }))
          .filter(x => ai.cash >= x.cost)
          .sort((a, b) => b.inc - a.inc)[0];
        if (best) {
          this.upgradeBusiness(ai.id, best.b.id);
          didAction = true;
        }
      }

      // Priority 3: Research tech
      if (!didAction && ai.cash > 100000 && ai.techs.length === 0) {
        const availableTech = TECHS
          .filter(t => !ai.activeTechs.includes(t.id))
          .filter(t => ai.cash >= t.cost)
          .filter(t => t.sector === 'all' || t.sector === ai.faction || ai.businesses.some(b => this.getIndustry(b.industryId).sector === t.sector))
          .sort((a, b) => a.cost - b.cost)[0];
        if (availableTech) {
          this.startResearch(ai.id, availableTech.id);
          didAction = true;
        }
      }

      if (!didAction) break;
      actionsLeft -= 1;
    }
  },

  _shiftPhase() {
    // Markov-ish phase transitions
    const transitions = {
      boom:      [['normal', 0.5], ['boom', 0.3], ['recession', 0.15], ['crash', 0.05]],
      normal:    [['normal', 0.4], ['boom', 0.3], ['recession', 0.25], ['crash', 0.05]],
      recession: [['normal', 0.4], ['recession', 0.3], ['crash', 0.15], ['boom', 0.15]],
      crash:     [['recession', 0.5], ['normal', 0.3], ['crash', 0.15], ['boom', 0.05]],
    };
    const options = transitions[this.state.phase];
    const r = Math.random();
    let cum = 0;
    for (const [p, prob] of options) {
      cum += prob;
      if (r < cum) { this.state.phase = p; break; }
    }
    this._applyPhaseToMultipliers();
  },

  _applyPhaseToMultipliers() {
    const phaseMult = PHASES[this.state.phase].mult;
    // Apply phase to all sectors but with some variance per sector
    SECTORS.forEach(s => {
      const variance = (Math.random() - 0.5) * 0.2; // ±10%
      this.state.multipliers[s] = Math.max(0.4, +(phaseMult + variance).toFixed(2));
    });
  },

  _applyEventToMultipliers(event) {
    if (event.sector === 'all') {
      SECTORS.forEach(s => { this.state.multipliers[s] *= event.mult; });
    } else {
      this.state.multipliers[event.sector] *= event.mult;
    }
    // Round
    SECTORS.forEach(s => { this.state.multipliers[s] = +this.state.multipliers[s].toFixed(2); });
  },

  _checkVictory() {
    if (this.state.turn > CONFIG.maxTurns) {
      // Highest net worth wins
      const ranked = [...this.state.players].sort((a, b) => this.netWorth(b) - this.netWorth(a));
      return ranked[0];
    }
    // Check net worth victory
    const winner = this.state.players.find(p => this.netWorth(p) >= CONFIG.victoryNetWorth);
    return winner || null;
  },

  _log(text) {
    this.state.history.push({ turn: this.state.turn, text });
    if (this.state.history.length > 50) this.state.history.shift();
  },

  // ============ LEADERBOARD ============
  getRankings() {
    return [...this.state.players]
      .map(p => ({
        ...p,
        netWorth: this.netWorth(p),
        income: this.totalIncome(p),
      }))
      .sort((a, b) => b.netWorth - a.netWorth);
  },
};

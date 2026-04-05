// ============================================
// EMPIRE WARS — App Wiring (v2 Deep)
// ============================================

const App = {
  selectedFaction: null,

  init() {
    this.bindHome();
    this.bindFaction();
    this.bindGame();
    this.bindBusinessDetail();
    this.bindOverlays();
    if (Game.hasSave()) document.getElementById('btn-continue').disabled = false;
    UI.renderFactions();
  },

  bindHome() {
    document.getElementById('btn-new-game').addEventListener('click', () => UI.showScreen('faction'));
    document.getElementById('btn-continue').addEventListener('click', () => {
      if (Game.load()) {
        UI.showScreen('game');
        UI.switchTab('empire');
        UI.refresh();
      }
    });
    document.getElementById('btn-how-to-play').addEventListener('click', () => UI.showOverlay('howto'));
    document.getElementById('btn-close-howto').addEventListener('click', () => UI.hideOverlay('howto'));
  },

  bindFaction() {
    document.querySelectorAll('[data-back="home"]').forEach(b => b.addEventListener('click', () => UI.showScreen('home')));
    document.getElementById('faction-grid').addEventListener('click', (e) => {
      const card = e.target.closest('.faction-card');
      if (!card) return;
      const faction = card.dataset.faction;
      document.querySelectorAll('.faction-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      setTimeout(() => this.startNewGame(faction), 250);
    });
  },

  startNewGame(faction) {
    Game.newGame(faction);
    UI.showScreen('game');
    UI.switchTab('empire');
    UI.refresh();
    const f = FACTIONS.find(x => x.id === faction);
    UI.toast(`You are the ${f.name}. Buy your first business!`, 'success');
  },

  bindGame() {
    // Main tabs
    document.querySelectorAll('#screen-game .tab').forEach(t => {
      t.addEventListener('click', () => {
        UI.switchTab(t.dataset.tab);
        UI.refresh();
      });
    });

    // Card actions in tabs (delegated)
    document.querySelector('#screen-game .tab-content').addEventListener('click', (e) => {
      // Open business detail (tap anywhere on business card)
      const bizCard = e.target.closest('.biz-card');
      if (bizCard && !e.target.closest('[data-act]')) {
        UI.openBusinessDetail(bizCard.dataset.bizId);
        return;
      }

      const btn = e.target.closest('[data-act]');
      if (!btn || btn.disabled) return;
      const act = btn.dataset.act;
      const id = btn.dataset.id;

      if (act === 'buy') {
        const r = Game.buyBusiness(0, id);
        if (r.ok) { const ind = Game.getIndustry(id); UI.toast(`Acquired ${ind.name}`, 'success'); UI.refresh(); }
        else UI.toast(r.reason || 'Failed', 'error');
      } else if (act === 'research') {
        const r = Game.startResearch(0, id);
        if (r.ok) { UI.toast('Research started', 'success'); UI.refresh(); }
        else UI.toast(r.reason || 'Failed', 'error');
      }
    });

    // End turn
    document.getElementById('btn-end-turn').addEventListener('click', () => {
      const me = Game.me();
      if (me.businesses.length === 0) {
        UI.toast('Buy at least one business first', 'warn');
        return;
      }
      Game.endTurn();
      UI.renderResolution();
      UI.showOverlay('resolution');
    });
  },

  bindBusinessDetail() {
    document.querySelector('[data-back="game"]').addEventListener('click', () => {
      UI.showScreen('game');
      UI.refresh();
    });

    // BD tabs
    document.querySelectorAll('#screen-biz-detail [data-bd-tab]').forEach(t => {
      t.addEventListener('click', () => {
        document.querySelectorAll('#screen-biz-detail [data-bd-tab]').forEach(x => x.classList.toggle('active', x.dataset.bdTab === t.dataset.bdTab));
        document.querySelectorAll('#screen-biz-detail [data-bd-pane]').forEach(x => x.classList.toggle('active', x.dataset.bdPane === t.dataset.bdTab));
      });
    });

    // Delegated actions in BD
    document.querySelector('#screen-biz-detail .tab-content').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-act]');
      if (!btn || btn.disabled) return;
      const act = btn.dataset.act;
      const bizId = UI.currentBusinessId;

      if (act === 'price') {
        const prodName = btn.dataset.prod;
        const delta = parseFloat(btn.dataset.delta);
        const me = Game.me();
        const biz = Game.getBusiness(me, bizId);
        const prod = biz.products.find(p => p.name === prodName);
        const newPrice = prod.price * (1 + delta);
        Game.setProductPrice(0, bizId, prodName, newPrice);
        UI.renderBusinessDetail();
      } else if (act === 'hire') {
        const role = btn.dataset.role;
        Game.hireEmployee(0, bizId, role);
        UI.toast('Hired', 'success');
        UI.renderBusinessDetail();
      } else if (act === 'fire') {
        const role = btn.dataset.role;
        Game.fireEmployee(0, bizId, role);
        UI.toast('Fired', 'warn');
        UI.renderBusinessDetail();
      } else if (act === 'upgrade') {
        const r = Game.upgradeBusiness(0, bizId);
        if (r.ok) { UI.toast('Upgraded!', 'success'); UI.renderBusinessDetail(); }
        else UI.toast(r.reason || 'Failed', 'error');
      } else if (act === 'sell') {
        const r = Game.sellBusiness(0, bizId);
        if (r.ok) {
          UI.toast(`Sold for ${UI.fmtCash(r.payout)}`, 'warn');
          UI.showScreen('game');
          UI.refresh();
        }
      }
    });

    // Price input change
    document.querySelector('#screen-biz-detail .tab-content').addEventListener('change', (e) => {
      if (e.target.matches('[data-act="price-input"]')) {
        const prodName = e.target.dataset.prod;
        const newPrice = parseFloat(e.target.value) || 1;
        Game.setProductPrice(0, UI.currentBusinessId, prodName, newPrice);
        UI.renderBusinessDetail();
      }
    });

    // Marketing slider
    document.querySelector('#screen-biz-detail .tab-content').addEventListener('input', (e) => {
      if (e.target.matches('.mkt-slider')) {
        const channel = e.target.dataset.channel;
        const amount = parseInt(e.target.value, 10) || 0;
        Game.setMarketingBudget(0, UI.currentBusinessId, channel, amount);
        // Update label only (avoid full re-render on every pixel of drag)
        const row = e.target.closest('.mkt-row');
        const c = Game.getChannel(channel);
        row.querySelector('.mkt-amount').textContent = `${UI.fmtCash(amount)} / ${UI.fmtCash(c.cap)}`;
      }
    });
    // On release, full re-render
    document.querySelector('#screen-biz-detail .tab-content').addEventListener('change', (e) => {
      if (e.target.matches('.mkt-slider')) UI.renderBusinessDetail();
    });
  },

  bindOverlays() {
    document.getElementById('btn-res-continue').addEventListener('click', () => {
      UI.hideOverlay('resolution');
      UI.refresh();
      if (Game.state.decision) {
        UI.renderDecision();
        UI.showOverlay('decision');
      } else if (Game.state.gameOver) {
        UI.renderGameOver();
        UI.showOverlay('gameover');
      }
    });

    document.getElementById('dec-options').addEventListener('click', (e) => {
      const btn = e.target.closest('.dec-option');
      if (!btn) return;
      const idx = parseInt(btn.dataset.idx, 10);
      Game.resolveDecision(idx);
      UI.hideOverlay('decision');
      UI.refresh();
      const hit = Game.state.lastRiskHit;
      if (hit) UI.toast('The risk hit you.', 'error');
      else UI.toast('Decision resolved.', 'success');
      if (Game.state.gameOver) {
        UI.renderGameOver();
        UI.showOverlay('gameover');
      }
    });

    document.getElementById('btn-new-game-2').addEventListener('click', () => {
      UI.hideOverlay('gameover');
      Game.clearSave();
      UI.showScreen('faction');
    });
    document.getElementById('btn-back-home').addEventListener('click', () => {
      UI.hideOverlay('gameover');
      Game.clearSave();
      document.getElementById('btn-continue').disabled = true;
      UI.showScreen('home');
    });
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());

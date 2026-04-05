// ============================================
// EMPIRE WARS — App Wiring
// ============================================

const App = {
  selectedFaction: null,

  init() {
    this.bindHome();
    this.bindFaction();
    this.bindGame();
    this.bindOverlays();

    // Enable Continue button if save exists
    if (Game.hasSave()) {
      document.getElementById('btn-continue').disabled = false;
    }

    // Render faction cards once
    UI.renderFactions();
  },

  // ============ HOME ============
  bindHome() {
    document.getElementById('btn-new-game').addEventListener('click', () => {
      UI.showScreen('faction');
    });
    document.getElementById('btn-continue').addEventListener('click', () => {
      if (Game.load()) {
        UI.showScreen('game');
        UI.refresh();
      }
    });
    document.getElementById('btn-how-to-play').addEventListener('click', () => {
      UI.showOverlay('howto');
    });
    document.getElementById('btn-close-howto').addEventListener('click', () => {
      UI.hideOverlay('howto');
    });
  },

  // ============ FACTION ============
  bindFaction() {
    document.querySelector('[data-back="home"]').addEventListener('click', () => UI.showScreen('home'));

    document.getElementById('faction-grid').addEventListener('click', (e) => {
      const card = e.target.closest('.faction-card');
      if (!card) return;
      const faction = card.dataset.faction;
      this.selectedFaction = faction;
      document.querySelectorAll('.faction-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      // Start immediately on tap (small friction delay to show selection)
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

  // ============ GAME SCREEN ============
  bindGame() {
    // Tabs
    document.querySelectorAll('.tab').forEach(t => {
      t.addEventListener('click', () => {
        UI.switchTab(t.dataset.tab);
        UI.refresh();
      });
    });

    // Card actions (delegated)
    document.querySelector('.tab-content').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-act]');
      if (!btn || btn.disabled) return;
      const act = btn.dataset.act;
      const id = btn.dataset.id;

      if (act === 'buy') {
        const r = Game.buyBusiness(0, id);
        if (r.ok) {
          const ind = Game.getIndustry(id);
          UI.toast(`Acquired ${ind.name}`, 'success');
          UI.refresh();
        } else UI.toast(r.reason || 'Failed', 'error');
      } else if (act === 'upgrade') {
        const r = Game.upgradeBusiness(0, id);
        if (r.ok) {
          UI.toast('Upgraded!', 'success');
          UI.refresh();
        } else UI.toast(r.reason || 'Failed', 'error');
      } else if (act === 'sell') {
        const r = Game.sellBusiness(0, id);
        if (r.ok) {
          UI.toast(`Sold for ${UI.fmtCash(r.payout)}`, 'warn');
          UI.refresh();
        }
      } else if (act === 'research') {
        const r = Game.startResearch(0, id);
        if (r.ok) {
          UI.toast('Research started', 'success');
          UI.refresh();
        } else UI.toast(r.reason || 'Failed', 'error');
      }
    });

    // End turn
    document.getElementById('btn-end-turn').addEventListener('click', () => {
      const resolution = Game.endTurn();
      UI.renderResolution();
      UI.showOverlay('resolution');
    });
  },

  // ============ OVERLAYS ============
  bindOverlays() {
    document.getElementById('btn-res-continue').addEventListener('click', () => {
      UI.hideOverlay('resolution');
      UI.refresh();
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

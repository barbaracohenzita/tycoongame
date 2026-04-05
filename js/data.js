// ============================================
// EMPIRE WARS — Static Game Data
// ============================================

const FACTIONS = [
  { id: 'tech',       name: 'Tech Baron',     emoji: '💻', bonus: '+10% Tech revenue',         color: '#3b82f6' },
  { id: 'finance',    name: 'Wall St. Shark', emoji: '📊', bonus: '+10% Finance revenue',      color: '#22c55e' },
  { id: 'industrial', name: 'Steel Magnate',  emoji: '🏗️', bonus: '+10% Industrial revenue',   color: '#f97316' },
  { id: 'media',      name: 'Media Mogul',    emoji: '🎬', bonus: '+10% Media revenue',        color: '#ec4899' },
  { id: 'energy',     name: 'Oil Titan',      emoji: '⛽', bonus: '+10% Energy revenue',       color: '#eab308' },
  { id: 'retail',     name: 'Retail King',    emoji: '🛒', bonus: '+10% Retail revenue',       color: '#a855f7' },
];

const INDUSTRIES = [
  { id: 'saas',       name: 'SaaS Startup',       sector: 'tech',       cost: 80000,  income: 15000, volatility: 'high',   emoji: '💻' },
  { id: 'ai_lab',     name: 'AI Lab',             sector: 'tech',       cost: 250000, income: 45000, volatility: 'high',   emoji: '🧠' },
  { id: 'bank',       name: 'Investment Bank',    sector: 'finance',    cost: 200000, income: 30000, volatility: 'medium', emoji: '🏦' },
  { id: 'hedge',      name: 'Hedge Fund',         sector: 'finance',    cost: 400000, income: 70000, volatility: 'high',   emoji: '💰' },
  { id: 'steel',      name: 'Steel Mill',         sector: 'industrial', cost: 120000, income: 20000, volatility: 'low',    emoji: '🏭' },
  { id: 'auto',       name: 'Auto Factory',       sector: 'industrial', cost: 300000, income: 50000, volatility: 'medium', emoji: '🚗' },
  { id: 'stream',     name: 'Streaming Network',  sector: 'media',      cost: 150000, income: 25000, volatility: 'high',   emoji: '📺' },
  { id: 'news',       name: 'News Empire',        sector: 'media',      cost: 220000, income: 35000, volatility: 'medium', emoji: '📰' },
  { id: 'oil',        name: 'Oil Refinery',       sector: 'energy',     cost: 350000, income: 55000, volatility: 'high',   emoji: '🛢️' },
  { id: 'solar',      name: 'Solar Farm',         sector: 'energy',     cost: 180000, income: 28000, volatility: 'low',    emoji: '☀️' },
  { id: 'retail',     name: 'Retail Chain',       sector: 'retail',     cost: 100000, income: 18000, volatility: 'medium', emoji: '🏪' },
  { id: 'luxury',     name: 'Luxury Brand',       sector: 'retail',     cost: 280000, income: 42000, volatility: 'medium', emoji: '💎' },
];

const TECHS = [
  { id: 't_auto',    tier: 1, name: 'Process Automation',  cost: 50000,  turns: 2, sector: 'all',        bonus: 0.10, desc: '+10% revenue, all businesses' },
  { id: 't_cloud',   tier: 2, name: 'Cloud Infrastructure',cost: 120000, turns: 3, sector: 'tech',       bonus: 0.25, desc: '+25% Tech revenue' },
  { id: 't_algo',    tier: 3, name: 'Algorithmic Trading', cost: 200000, turns: 4, sector: 'finance',    bonus: 0.30, desc: '+30% Finance revenue' },
  { id: 't_lean',    tier: 2, name: 'Lean Manufacturing',  cost: 100000, turns: 3, sector: 'industrial', bonus: 0.25, desc: '+25% Industrial revenue' },
  { id: 't_viral',   tier: 2, name: 'Viral Content Engine',cost: 90000,  turns: 2, sector: 'media',      bonus: 0.30, desc: '+30% Media revenue' },
  { id: 't_grid',    tier: 3, name: 'Green Energy Grid',   cost: 180000, turns: 4, sector: 'energy',     bonus: 0.25, desc: '+25% Energy revenue' },
  { id: 't_supply',  tier: 2, name: 'Supply Chain AI',     cost: 110000, turns: 3, sector: 'retail',     bonus: 0.25, desc: '+25% Retail revenue' },
  { id: 't_ai',      tier: 4, name: 'AI Forecasting',      cost: 350000, turns: 5, sector: 'all',        bonus: 0.20, desc: '+20% revenue, all businesses' },
  { id: 't_global',  tier: 4, name: 'Global Expansion',    cost: 400000, turns: 5, sector: 'all',        bonus: 0.25, desc: '+25% revenue, all businesses' },
];

const SECTORS = ['tech', 'finance', 'industrial', 'media', 'energy', 'retail'];

const PHASES = {
  boom:      { label: 'Boom',      mult: 1.3, color: 'var(--success)' },
  normal:    { label: 'Normal',    mult: 1.0, color: 'var(--text)' },
  recession: { label: 'Recession', mult: 0.9, color: 'var(--warn)' },
  crash:     { label: 'Crash',     mult: 0.7, color: 'var(--danger)' },
};

const EVENTS = [
  { id: 'e1',  name: 'AI Capex Boom',        sector: 'tech',       mult: 1.5, desc: 'Tech +50% this turn' },
  { id: 'e2',  name: 'Bank Stress Test',     sector: 'finance',    mult: 0.7, desc: 'Finance −30% this turn' },
  { id: 'e3',  name: 'Supply Chain Crisis',  sector: 'industrial', mult: 0.6, desc: 'Industrial −40% this turn' },
  { id: 'e4',  name: 'Viral Moment',         sector: 'media',      mult: 1.6, desc: 'Media +60% this turn' },
  { id: 'e5',  name: 'Oil Shock',            sector: 'energy',     mult: 1.4, desc: 'Energy +40% this turn' },
  { id: 'e6',  name: 'Retail Collapse',      sector: 'retail',     mult: 0.65,desc: 'Retail −35% this turn' },
  { id: 'e7',  name: 'Tech Crash',           sector: 'tech',       mult: 0.5, desc: 'Tech −50% this turn' },
  { id: 'e8',  name: 'Luxury Surge',         sector: 'retail',     mult: 1.5, desc: 'Retail +50% this turn' },
  { id: 'e9',  name: 'Renewable Mandate',    sector: 'energy',     mult: 1.3, desc: 'Energy +30% this turn' },
  { id: 'e10', name: 'Cultural Renaissance', sector: 'media',      mult: 1.3, desc: 'Media +30% this turn' },
  { id: 'e11', name: 'Global Windfall',      sector: 'all',        mult: 1.15,desc: 'All sectors +15% this turn' },
  { id: 'e12', name: 'Recession Deepens',    sector: 'all',        mult: 0.85,desc: 'All sectors −15% this turn' },
];

const AI_NAMES = [
  { name: 'Vex Corp.',       faction: 'finance',    personality: 'aggressive' },
  { name: 'Titan Holdings',  faction: 'industrial', personality: 'steady' },
  { name: 'Luna Media Co.',  faction: 'media',      personality: 'growth' },
  { name: 'Nexus Syndicate', faction: 'tech',       personality: 'aggressive' },
  { name: 'Apex Capital',    faction: 'finance',    personality: 'steady' },
  { name: 'Solaris Energy',  faction: 'energy',     personality: 'growth' },
];

const CONFIG = {
  startCash: 500000,
  startRep: 50,
  maxTurns: 60,
  victoryNetWorth: 1000000,
  phaseShiftEveryTurns: 3,
  eventProbability: 0.4,
  upgradeCostMultiplier: 0.5, // cost to upgrade = purchase × level × 0.5
  homeSectorBonus: 0.10,
  morale: 100,
};

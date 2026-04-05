// ============================================
// EMPIRE WARS — Static Game Data (v2 Deep)
// ============================================

const FACTIONS = [
  { id: 'tech',       name: 'Tech Baron',     emoji: '💻', bonus: '+10% Tech revenue',         color: '#3b82f6' },
  { id: 'finance',    name: 'Wall St. Shark', emoji: '📊', bonus: '+10% Finance revenue',      color: '#22c55e' },
  { id: 'industrial', name: 'Steel Magnate',  emoji: '🏗️', bonus: '+10% Industrial revenue',   color: '#f97316' },
  { id: 'media',      name: 'Media Mogul',    emoji: '🎬', bonus: '+10% Media revenue',        color: '#ec4899' },
  { id: 'energy',     name: 'Oil Titan',      emoji: '⛽', bonus: '+10% Energy revenue',       color: '#eab308' },
  { id: 'retail',     name: 'Retail King',    emoji: '🛒', bonus: '+10% Retail revenue',       color: '#a855f7' },
];

const SECTORS = ['tech', 'finance', 'industrial', 'media', 'energy', 'retail'];

// Industries = business types that can be acquired. Each comes with a default product lineup.
const INDUSTRIES = [
  // Balanced economy: L1 net profit ~$15-80K/month depending on entry cost.
  { id: 'saas',    name: 'SaaS Startup',      sector: 'tech',       cost: 80000,  emoji: '💻',
    products: [
      { name: 'Starter Plan',     basePrice: 29,  baseCost: 11,  baseQuality: 3, unitDemand: 360 },
      { name: 'Pro Plan',         basePrice: 99,  baseCost: 42,  baseQuality: 4, unitDemand: 120 },
      { name: 'Enterprise',       basePrice: 499, baseCost: 230, baseQuality: 5, unitDemand: 9 },
    ]},
  { id: 'ai_lab',  name: 'AI Lab',            sector: 'tech',       cost: 250000, emoji: '🧠',
    products: [
      { name: 'API Credits',      basePrice: 200, baseCost: 105, baseQuality: 4, unitDemand: 57 },
      { name: 'Custom Model',     basePrice: 5000,baseCost: 2700,baseQuality: 5, unitDemand: 3 },
    ]},
  { id: 'bank',    name: 'Investment Bank',   sector: 'finance',    cost: 200000, emoji: '🏦',
    products: [
      { name: 'Advisory Fees',    basePrice: 5000,baseCost: 2600,baseQuality: 4, unitDemand: 4 },
      { name: 'Trading Spreads',  basePrice: 50,  baseCost: 24,  baseQuality: 3, unitDemand: 630 },
    ]},
  { id: 'hedge',   name: 'Hedge Fund',        sector: 'finance',    cost: 400000, emoji: '💰',
    products: [
      { name: 'Management Fee',   basePrice: 20000,baseCost: 9500,baseQuality: 5, unitDemand: 2 },
      { name: 'Performance Fee',  basePrice: 8000,baseCost: 3800,baseQuality: 5, unitDemand: 3 },
    ]},
  { id: 'steel',   name: 'Steel Mill',        sector: 'industrial', cost: 120000, emoji: '🏭',
    products: [
      { name: 'Rebar (ton)',      basePrice: 800, baseCost: 560, baseQuality: 3, unitDemand: 75 },
      { name: 'Sheet Metal (ton)',basePrice: 1100,baseCost: 760, baseQuality: 4, unitDemand: 38 },
    ]},
  { id: 'auto',    name: 'Auto Factory',      sector: 'industrial', cost: 300000, emoji: '🚗',
    products: [
      { name: 'Compact Sedan',    basePrice: 22000,baseCost: 17500,baseQuality: 3, unitDemand: 5 },
      { name: 'Luxury Sedan',     basePrice: 55000,baseCost: 42000,baseQuality: 4, unitDemand: 2 },
      { name: 'EV Crossover',     basePrice: 48000,baseCost: 34000,baseQuality: 5, unitDemand: 2 },
    ]},
  { id: 'stream',  name: 'Streaming Network', sector: 'media',      cost: 150000, emoji: '📺',
    products: [
      { name: 'Basic Tier',       basePrice: 9,   baseCost: 4,   baseQuality: 3, unitDemand: 3200 },
      { name: 'Premium Tier',     basePrice: 18,  baseCost: 7,   baseQuality: 4, unitDemand: 750 },
    ]},
  { id: 'news',    name: 'News Empire',       sector: 'media',      cost: 220000, emoji: '📰',
    products: [
      { name: 'Digital Sub',      basePrice: 15,  baseCost: 6,   baseQuality: 3, unitDemand: 1800 },
      { name: 'Print Ads',        basePrice: 3000,baseCost: 1200,baseQuality: 4, unitDemand: 6 },
      { name: 'Premium Reporting',basePrice: 40,  baseCost: 15,  baseQuality: 5, unitDemand: 420 },
    ]},
  { id: 'oil',     name: 'Oil Refinery',      sector: 'energy',     cost: 350000, emoji: '🛢️',
    products: [
      { name: 'Gasoline (bbl)',   basePrice: 90,  baseCost: 65,  baseQuality: 3, unitDemand: 420 },
      { name: 'Diesel (bbl)',     basePrice: 95,  baseCost: 68,  baseQuality: 3, unitDemand: 270 },
    ]},
  { id: 'solar',   name: 'Solar Farm',        sector: 'energy',     cost: 180000, emoji: '☀️',
    products: [
      { name: 'Grid Power (MWh)', basePrice: 55,  baseCost: 33,  baseQuality: 4, unitDemand: 330 },
      { name: 'Carbon Credits',   basePrice: 45,  baseCost: 22,  baseQuality: 5, unitDemand: 135 },
    ]},
  { id: 'retail',  name: 'Retail Chain',      sector: 'retail',     cost: 100000, emoji: '🏪',
    products: [
      { name: 'Groceries',        basePrice: 45,  baseCost: 35,  baseQuality: 3, unitDemand: 720 },
      { name: 'Apparel',          basePrice: 60,  baseCost: 36,  baseQuality: 3, unitDemand: 300 },
    ]},
  { id: 'luxury',  name: 'Luxury Brand',      sector: 'retail',     cost: 280000, emoji: '💎',
    products: [
      { name: 'Handbags',         basePrice: 2200,baseCost: 900, baseQuality: 5, unitDemand: 15 },
      { name: 'Watches',          basePrice: 8500,baseCost: 4200,baseQuality: 5, unitDemand: 4 },
      { name: 'Accessories',      basePrice: 450, baseCost: 200, baseQuality: 4, unitDemand: 95 },
    ]},
];

// Customer segments with demand behavior
const SEGMENTS = [
  { id: 'budget',   name: 'Budget Seekers', share: 0.40, priceSensitivity: 1.6, qualityPreference: 0.4, emoji: '💸' },
  { id: 'mass',     name: 'Mass Market',    share: 0.35, priceSensitivity: 1.0, qualityPreference: 0.8, emoji: '👥' },
  { id: 'premium',  name: 'Premium Buyers', share: 0.15, priceSensitivity: 0.6, qualityPreference: 1.4, emoji: '💎' },
  { id: 'luxury',   name: 'Luxury Elite',   share: 0.10, priceSensitivity: 0.3, qualityPreference: 1.8, emoji: '👑' },
];

// Employee roles hireable at each business
const EMPLOYEE_ROLES = [
  { id: 'worker',   name: 'Worker',    salary: 1500,  qualityBoost: 0.02, volumeBoost: 0.05, emoji: '👷' },
  { id: 'manager',  name: 'Manager',   salary: 5000,  qualityBoost: 0.06, volumeBoost: 0.07, emoji: '💼' },
  { id: 'engineer', name: 'Engineer',  salary: 8000,  qualityBoost: 0.12, volumeBoost: 0.03, emoji: '🔧' },
  { id: 'designer', name: 'Designer',  salary: 7000,  qualityBoost: 0.15, volumeBoost: 0.02, emoji: '🎨' },
  { id: 'sales',    name: 'Sales Rep', salary: 4500,  qualityBoost: 0.01, volumeBoost: 0.12, emoji: '🤝' },
];

// Marketing channels
const MARKETING_CHANNELS = [
  { id: 'social',  name: 'Social Media',   emoji: '📱', baseEfficacy: 1.0, cap: 50000,  segments: ['mass','budget'] },
  { id: 'search',  name: 'Search Ads',     emoji: '🔍', baseEfficacy: 1.2, cap: 40000,  segments: ['mass','premium'] },
  { id: 'tv',      name: 'TV / Streaming', emoji: '📺', baseEfficacy: 0.9, cap: 100000, segments: ['mass','premium','luxury'] },
  { id: 'pr',      name: 'PR & Events',    emoji: '🎤', baseEfficacy: 1.4, cap: 25000,  segments: ['premium','luxury'] },
];

const TECHS = [
  { id: 't_auto',    tier: 1, name: 'Process Automation',   cost: 50000,  turns: 2, sector: 'all',        bonus: 0.10, desc: '+10% volume, all businesses' },
  { id: 't_cloud',   tier: 2, name: 'Cloud Infrastructure', cost: 120000, turns: 3, sector: 'tech',       bonus: 0.25, desc: '+25% Tech volume' },
  { id: 't_algo',    tier: 3, name: 'Algorithmic Trading',  cost: 200000, turns: 4, sector: 'finance',    bonus: 0.30, desc: '+30% Finance volume' },
  { id: 't_lean',    tier: 2, name: 'Lean Manufacturing',   cost: 100000, turns: 3, sector: 'industrial', bonus: 0.25, desc: '+25% Industrial volume' },
  { id: 't_viral',   tier: 2, name: 'Viral Content Engine', cost: 90000,  turns: 2, sector: 'media',      bonus: 0.30, desc: '+30% Media volume' },
  { id: 't_grid',    tier: 3, name: 'Green Energy Grid',    cost: 180000, turns: 4, sector: 'energy',     bonus: 0.25, desc: '+25% Energy volume' },
  { id: 't_supply',  tier: 2, name: 'Supply Chain AI',      cost: 110000, turns: 3, sector: 'retail',     bonus: 0.25, desc: '+25% Retail volume' },
  { id: 't_ai',      tier: 4, name: 'AI Forecasting',       cost: 350000, turns: 5, sector: 'all',        bonus: 0.20, desc: '+20% quality, all businesses' },
  { id: 't_brand',   tier: 3, name: 'Brand Studio',         cost: 150000, turns: 3, sector: 'all',        bonus: 0.15, desc: '+15% marketing efficacy' },
  { id: 't_global',  tier: 4, name: 'Global Expansion',     cost: 400000, turns: 5, sector: 'all',        bonus: 0.25, desc: '+25% demand pool' },
];

// Market phases affect competitor aggressiveness + base demand
const PHASES = {
  boom:      { label: 'Boom',      mult: 1.3, color: 'var(--success)' },
  normal:    { label: 'Normal',    mult: 1.0, color: 'var(--text)' },
  recession: { label: 'Recession', mult: 0.85, color: 'var(--warn)' },
  crash:     { label: 'Crash',     mult: 0.65, color: 'var(--danger)' },
};

const EVENTS = [
  { id: 'e1',  name: 'AI Capex Boom',        sector: 'tech',       mult: 1.5, desc: 'Tech demand +50% this month' },
  { id: 'e2',  name: 'Bank Stress Test',     sector: 'finance',    mult: 0.7, desc: 'Finance demand −30%' },
  { id: 'e3',  name: 'Supply Chain Crisis',  sector: 'industrial', mult: 0.6, desc: 'Industrial demand −40%' },
  { id: 'e4',  name: 'Viral Moment',         sector: 'media',      mult: 1.6, desc: 'Media demand +60%' },
  { id: 'e5',  name: 'Oil Shock',            sector: 'energy',     mult: 1.4, desc: 'Energy demand +40%' },
  { id: 'e6',  name: 'Retail Collapse',      sector: 'retail',     mult: 0.65,desc: 'Retail demand −35%' },
  { id: 'e7',  name: 'Tech Crash',           sector: 'tech',       mult: 0.5, desc: 'Tech demand −50%' },
  { id: 'e8',  name: 'Luxury Surge',         sector: 'retail',     mult: 1.5, desc: 'Retail demand +50%' },
  { id: 'e9',  name: 'Green Mandate',        sector: 'energy',     mult: 1.3, desc: 'Energy demand +30%' },
  { id: 'e10', name: 'Cultural Boom',        sector: 'media',      mult: 1.3, desc: 'Media demand +30%' },
  { id: 'e11', name: 'Global Windfall',      sector: 'all',        mult: 1.15,desc: 'All sectors +15%' },
  { id: 'e12', name: 'Recession Deepens',    sector: 'all',        mult: 0.85,desc: 'All sectors −15%' },
];

// Random decisions (pop-up choices)
const DECISIONS = [
  { id: 'd1', title: 'Class Action Lawsuit',
    body: 'A customer group is suing your flagship business for false advertising.',
    options: [
      { label: 'Settle quietly ($40K)',         cashDelta: -40000, repDelta: -2, brandDelta: 0 },
      { label: 'Fight in court (risk $120K)',   cashDelta: -30000, repDelta: 2, brandDelta: 5, risk: { chance: 0.4, cashDelta: -90000, brandDelta: -10 } },
      { label: 'Ignore (brand damage)',         cashDelta: 0, repDelta: -5, brandDelta: -15 },
    ]},
  { id: 'd2', title: 'Celebrity Endorsement Offer',
    body: 'A trending celebrity will promote your brand for $80K.',
    options: [
      { label: 'Sign them ($80K)',              cashDelta: -80000, brandDelta: 18, repDelta: 1 },
      { label: 'Counter-offer ($40K)',          cashDelta: -40000, brandDelta: 8, repDelta: 0, risk: { chance: 0.5, cashDelta: 0, brandDelta: 0 } },
      { label: 'Decline',                       cashDelta: 0, brandDelta: 0, repDelta: 0 },
    ]},
  { id: 'd3', title: 'Regulatory Inspection',
    body: 'Government inspectors arrived at your facilities.',
    options: [
      { label: 'Full compliance ($25K)',        cashDelta: -25000, repDelta: 3, brandDelta: 2 },
      { label: 'Grease palms ($15K)',           cashDelta: -15000, repDelta: -4, brandDelta: -3, risk: { chance: 0.3, cashDelta: -80000, repDelta: -15 } },
      { label: 'Stonewall',                     cashDelta: -45000, repDelta: -2, brandDelta: 0 },
    ]},
  { id: 'd4', title: 'Top Talent Offer',
    body: 'A star executive wants to join — for a premium.',
    options: [
      { label: 'Hire ($15K/mo salary)',         cashDelta: -15000, brandDelta: 5, repDelta: 1, hireExec: true },
      { label: 'Negotiate down',                cashDelta: -8000, brandDelta: 3, repDelta: 0, hireExec: true },
      { label: 'Pass',                          cashDelta: 0, brandDelta: 0, repDelta: 0 },
    ]},
  { id: 'd5', title: 'Market Expansion Opportunity',
    body: 'New region is opening up. Early entry = market advantage.',
    options: [
      { label: 'Enter aggressively ($60K)',     cashDelta: -60000, brandDelta: 10, repDelta: 0, demandBoost: 0.15 },
      { label: 'Slow test ($20K)',              cashDelta: -20000, brandDelta: 3, repDelta: 0, demandBoost: 0.05 },
      { label: 'Skip',                          cashDelta: 0, brandDelta: -2, repDelta: 0 },
    ]},
  { id: 'd6', title: 'PR Crisis',
    body: 'A social media storm is brewing over your product quality.',
    options: [
      { label: 'Public apology + refunds ($50K)',cashDelta: -50000, brandDelta: 3, repDelta: 2 },
      { label: 'PR counter-campaign ($35K)',    cashDelta: -35000, brandDelta: -2, repDelta: -1, risk: { chance: 0.5, brandDelta: -10 } },
      { label: 'Ride it out',                   cashDelta: 0, brandDelta: -12, repDelta: -3 },
    ]},
  { id: 'd7', title: 'Activist Investor',
    body: 'An activist is pressuring for share buybacks.',
    options: [
      { label: 'Buyback ($100K)',               cashDelta: -100000, brandDelta: 5, repDelta: 2 },
      { label: 'Partial buyback ($40K)',        cashDelta: -40000, brandDelta: 2, repDelta: 1 },
      { label: 'Refuse',                        cashDelta: 0, brandDelta: -4, repDelta: -2 },
    ]},
  { id: 'd8', title: 'Cyberattack',
    body: 'Hackers are threatening to leak customer data.',
    options: [
      { label: 'Pay ransom ($75K)',             cashDelta: -75000, brandDelta: -5, repDelta: -3 },
      { label: 'Hire security ($35K)',          cashDelta: -35000, brandDelta: 1, repDelta: 0, risk: { chance: 0.2, brandDelta: -15, repDelta: -5 } },
      { label: 'Go public first',               cashDelta: -10000, brandDelta: 5, repDelta: 3 },
    ]},
];

const AI_NAMES = [
  { name: 'Vex Corp.',       faction: 'finance',    personality: 'aggressive' },
  { name: 'Titan Holdings',  faction: 'industrial', personality: 'steady' },
  { name: 'Luna Media Co.',  faction: 'media',      personality: 'growth' },
  { name: 'Nexus Syndicate', faction: 'tech',       personality: 'aggressive' },
  { name: 'Apex Capital',    faction: 'finance',    personality: 'steady' },
  { name: 'Solaris Energy',  faction: 'energy',     personality: 'growth' },
  { name: 'Monarch Retail',  faction: 'retail',     personality: 'aggressive' },
  { name: 'Helios Labs',     faction: 'tech',       personality: 'growth' },
];

const CONFIG = {
  startCash: 500000,
  startRep: 50,
  startBrand: 40,
  maxTurns: 60,
  victoryNetWorth: 5000000,     // $5M for deeper game
  phaseShiftEveryTurns: 4,
  eventProbability: 0.35,
  decisionProbability: 0.45,
  upgradeCostMultiplier: 0.5,
  homeSectorBonus: 0.10,
  priceElasticityBase: 1.0,     // demand multiplier per 1% price vs base
  qualityDemandMultiplier: 0.25,// each quality point = +25% appeal
};

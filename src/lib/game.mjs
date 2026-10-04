export const STARTING_CASH = 1_000_000;
export const TARGET = 1_200_000;
export const LAST_DAY = 30;
export const FEE = 100;
export const SAVE_KEY = 'nexus-paper-exchange-v1';
export const COMPANIES = [
  { symbol: 'VIBE', name: 'Vibe Dynamics', sector: 'Artificial confidence', price: 8420, volatility: 0.075, color: '#aa96ff', description: 'Enterprise software that promises to understand the assignment. Nobody has checked.' },
  { symbol: 'TOST', name: 'Toast Industries', sector: 'Breakfast infrastructure', price: 3260, volatility: 0.028, color: '#e9b779', description: 'An old-fashioned company that turns bread into slightly different bread. Surprisingly resilient.' },
  { symbol: 'CLIP', name: 'Clip Capital', sector: 'Creator economy', price: 5675, volatility: 0.06, color: '#80c3ef', description: 'Monetizing attention spans shorter than this description. Growth depends on the algorithm.' },
  { symbol: 'VOID', name: 'Void Logistics', sector: 'Space delivery', price: 12840, volatility: 0.055, color: '#c795d4', description: 'Same-day delivery to places nobody lives. Their addressable market is technically infinite.' },
  { symbol: 'MEME', name: 'Meme Holdings', sector: 'Speculative nonsense', price: 1840, volatility: 0.13, color: '#f0a18b', description: 'No product. No plan. An extremely active group chat. The most volatile stock on the board.' },
  { symbol: 'LEAF', name: 'Leaf Energy', sector: 'Renewable optimism', price: 7130, volatility: 0.04, color: '#8bceb0', description: 'Clean energy with an unnecessarily nice brand identity. A steadier choice in a loud market.' },
];
const EVENTS = [
  { headline: 'Markets discover a new feeling: cautious optimism.', detail: 'A broad confidence bump lifts the whole exchange.', target: 'ALL', impact: 0.025 },
  { headline: 'Interest rates rise. Everyone pretends they expected it.', detail: 'A broad selloff weighs on every company.', target: 'ALL', impact: -0.03 },
  { headline: 'Vibe Dynamics demos a button that actually works.', detail: 'A rare product breakthrough boosts VIBE sentiment.', target: 'VIBE', impact: 0.12 },
  { headline: 'Vibe Dynamics replaces its roadmap with a mood board.', detail: 'Customers ask for refunds. VIBE takes a hit.', target: 'VIBE', impact: -0.11 },
  { headline: 'Toast wins a nationwide breakfast contract.', detail: 'Reliable carbohydrates are back in fashion.', target: 'TOST', impact: 0.065 },
  { headline: 'A bread shortage puts breakfast on hold.', detail: 'Supply costs squeeze Toast Industries.', target: 'TOST', impact: -0.06 },
  { headline: 'Clip Capital goes viral for being extremely normal.', detail: 'Unexpected attention lifts creator-economy shares.', target: 'CLIP', impact: 0.10 },
  { headline: 'The algorithm changes. Again. Nobody is okay.', detail: 'Clip Capital loses reach overnight.', target: 'CLIP', impact: -0.10 },
  { headline: 'Void Logistics successfully delivers one package.', detail: 'Its first confirmed delivery sends VOID higher.', target: 'VOID', impact: 0.11 },
  { headline: 'Void Logistics misplaces an entire moon.', detail: 'The insurance paperwork is extraordinary.', target: 'VOID', impact: -0.12 },
  { headline: 'A celebrity posts a frog. Meme Holdings surges.', detail: 'Nobody can explain the connection. MEME gets a boost.', target: 'MEME', impact: 0.18 },
  { headline: 'The group chat goes quiet. Meme investors panic.', detail: 'Speculative enthusiasm evaporates.', target: 'MEME', impact: -0.18 },
  { headline: 'Leaf Energy secures a clean-energy grant.', detail: 'Fresh funding brightens the renewable outlook.', target: 'LEAF', impact: 0.09 },
  { headline: 'Cloudy week delays Leaf Energy output.', detail: 'A production setback dims LEAF sentiment.', target: 'LEAF', impact: -0.07 },
  { headline: 'A quiet day. Suspicious, but we will take it.', detail: 'No big headlines. Normal market noise continues.', target: 'ALL', impact: 0 },
];
export function createGame(seed = 2026) {
  return {
    version: 1, rng: seed >>> 0, day: 0, cash: STARTING_CASH, realized: 0, tradeCount: 0,
    stocks: COMPANIES.map(c => ({ symbol: c.symbol, price: c.price, previous: c.price, history: [c.price] })),
    holdings: COMPANIES.map(c => ({ symbol: c.symbol, shares: 0, basis: 0 })),
    equityHistory: [STARTING_CASH], trades: [],
    news: [{ day: 0, headline: 'The exchange is open. Your career is entirely hypothetical.', detail: 'Start with $10,000. Finish 30 days with $12,000 or more to win.', target: 'ALL', impact: 0 }],
    message: 'Welcome to the paper exchange. Pick a stock and make your first move.',
  };
}
export function equity(game) {
  return game.cash + game.holdings.reduce((total, holding, i) => total + holding.shares * game.stocks[i].price, 0);
}
export function maxBuy(game, index) { return Math.max(0, Math.floor((game.cash - FEE) / game.stocks[index].price)); }
export function changePercent(stock) { return (stock.price - stock.previous) / stock.previous * 100; }
function random(rng) {
  const next = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
  return [next, next / 4294967296];
}
export function advanceDay(game) {
  if (game.day >= LAST_DAY) return game;
  let rng = game.rng;
  const roll = () => { let value; [rng, value] = random(rng); return value; };
  const event = EVENTS[Math.floor(roll() * EVENTS.length)];
  const market = (roll() - 0.5) * 0.025;
  const stocks = game.stocks.map((stock, i) => {
    const news = event.target === 'ALL' || event.target === stock.symbol ? event.impact : 0;
    const change = Math.max(-0.28, Math.min(0.28, (roll() * 2 - 1) * COMPANIES[i].volatility + market + news));
    const price = Math.max(100, Math.round(stock.price * (1 + change)));
    return { ...stock, previous: stock.price, price, history: [...stock.history, price] };
  });
  const next = { ...game, rng, day: game.day + 1, stocks, news: [{ day: game.day + 1, ...event }, ...game.news].slice(0, 8) };
  next.equityHistory = [...game.equityHistory, equity(next)];
  next.message = next.day === LAST_DAY
    ? equity(next) >= TARGET ? 'Season complete. You beat the $12,000 target. Hypothetical legend.' : 'Season complete. The final bell has rung. Try a new season to beat $12,000.'
    : `Day ${next.day}: ${event.headline}`;
  return next;
}
export function trade(game, symbol, side, quantity) {
  const fail = message => ({ ...game, message });
  if (game.day >= LAST_DAY) return fail('This season is complete. Start a new season to trade again.');
  const index = COMPANIES.findIndex(c => c.symbol === symbol);
  if (index < 0 || !['buy', 'sell'].includes(side)) return fail('Choose a valid stock and order type.');
  if (!Number.isSafeInteger(quantity) || quantity < 1) return fail('Enter a whole number of shares, at least 1.');
  const stock = game.stocks[index]; const holding = game.holdings[index];
  const gross = stock.price * quantity;
  if (!Number.isSafeInteger(gross)) return fail('That order is too large.');
  if (side === 'buy' && gross + FEE > game.cash) return fail('Not enough cash for those shares and the $1 trading fee.');
  if (side === 'sell' && quantity > holding.shares) return fail('You cannot sell more shares than you own.');
  const basisSold = side === 'sell' ? quantity === holding.shares ? holding.basis : Math.round(holding.basis * quantity / holding.shares) : 0;
  const nextHolding = side === 'buy'
    ? { ...holding, shares: holding.shares + quantity, basis: holding.basis + gross + FEE }
    : { ...holding, shares: holding.shares - quantity, basis: holding.basis - basisSold };
  const next = {
    ...game, cash: game.cash + (side === 'buy' ? -gross - FEE : gross - FEE),
    realized: game.realized + (side === 'sell' ? gross - FEE - basisSold : 0), tradeCount: game.tradeCount + 1,
    holdings: game.holdings.map((item, i) => i === index ? nextHolding : item),
    trades: [{ id: game.tradeCount + 1, day: game.day, symbol, side, quantity, price: stock.price, fee: FEE }, ...game.trades].slice(0, 30),
    message: `${side === 'buy' ? 'Bought' : 'Sold'} ${quantity} ${symbol} share${quantity === 1 ? '' : 's'}. $1 fee included.`,
  };
  next.equityHistory = game.equityHistory.map((value, i) => i === game.day ? equity(next) : value);
  return next;
}
const integer = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;
export function restoreGame(raw) {
  try {
    if (typeof raw !== 'string' || raw.length > 100_000) return null;
    const game = JSON.parse(raw);
    if (!game || game.version !== 1 || !integer(game.day, 0, LAST_DAY) || !integer(game.rng, 0, 0xffffffff)
      || !integer(game.cash, 0, 1_000_000_000_000) || !integer(game.realized, -1_000_000_000_000, 1_000_000_000_000)
      || !integer(game.tradeCount, 0, 1_000_000) || typeof game.message !== 'string' || game.message.length > 500) return null;
    if (!Array.isArray(game.stocks) || game.stocks.length !== COMPANIES.length || !Array.isArray(game.holdings) || game.holdings.length !== COMPANIES.length) return null;
    for (let i = 0; i < COMPANIES.length; i++) {
      const stock = game.stocks[i]; const holding = game.holdings[i];
      if (!stock || !holding || stock.symbol !== COMPANIES[i].symbol || holding.symbol !== stock.symbol
        || !integer(stock.price, 100, 1_000_000_000) || !integer(stock.previous, 100, 1_000_000_000)
        || !Array.isArray(stock.history) || stock.history.length !== game.day + 1 || !stock.history.every(value => integer(value, 100, 1_000_000_000))
        || stock.history.at(-1) !== stock.price || (game.day > 0 && stock.history.at(-2) !== stock.previous)
        || !integer(holding.shares, 0, 1_000_000_000) || !integer(holding.basis, 0, 1_000_000_000_000)
        || (holding.shares === 0 && holding.basis !== 0)) return null;
    }
    if (!Array.isArray(game.equityHistory) || game.equityHistory.length !== game.day + 1
      || !game.equityHistory.every(value => integer(value, 0, Number.MAX_SAFE_INTEGER)) || game.equityHistory.at(-1) !== equity(game)) return null;
    if (!Array.isArray(game.news) || game.news.length < 1 || game.news.length > 8 || !game.news.every(item => item
      && integer(item.day, 0, game.day) && typeof item.headline === 'string' && item.headline.length <= 300
      && typeof item.detail === 'string' && item.detail.length <= 300 && ['ALL', ...COMPANIES.map(c => c.symbol)].includes(item.target)
      && Number.isFinite(item.impact) && Math.abs(item.impact) <= 0.3)) return null;
    if (!Array.isArray(game.trades) || game.trades.length > 30 || !game.trades.every(item => item
      && integer(item.id, 1, game.tradeCount) && integer(item.day, 0, game.day) && COMPANIES.some(c => c.symbol === item.symbol)
      && ['buy', 'sell'].includes(item.side) && integer(item.quantity, 1, 1_000_000_000) && integer(item.price, 100, 1_000_000_000) && item.fee === FEE)) return null;
    return game;
  } catch { return null; }
}
export function gameReducer(game, action) {
  if (action.type === 'advance') return advanceDay(game);
  if (action.type === 'trade') return trade(game, action.symbol, action.side, action.quantity);
  if (action.type === 'reset') return createGame(action.seed);
  if (action.type === 'restore') return restoreGame(action.raw) || game;
  return game;
}

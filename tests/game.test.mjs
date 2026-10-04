import test from 'node:test';
import assert from 'node:assert/strict';
import { COMPANIES, FEE, LAST_DAY, STARTING_CASH, TARGET, advanceDay, createGame, equity, gameReducer, maxBuy, restoreGame, trade } from '../src/lib/game.mjs';

test('starts with $10,000, no positions, and valid history', () => {
  const game = createGame();
  assert.equal(game.cash, STARTING_CASH); assert.equal(equity(game), STARTING_CASH);
  assert.equal(game.holdings.some(item => item.shares !== 0), false);
  assert.deepEqual(restoreGame(JSON.stringify(game)), game);
});
test('buy includes fee and keeps cash, basis, and equity exact', () => {
  const game = createGame(); const next = trade(game, 'VIBE', 'buy', 10);
  assert.equal(next.cash, STARTING_CASH - game.stocks[0].price * 10 - FEE);
  assert.equal(next.holdings[0].basis, game.stocks[0].price * 10 + FEE);
  assert.equal(equity(next), STARTING_CASH - FEE);
  assert.equal(next.equityHistory.at(-1), equity(next));
  assert.equal(game.holdings[0].shares, 0, 'Input state unchanged');
});
test('rejects fractional, negative, unsafe, unaffordable and oversold orders', () => {
  const game = createGame();
  for (const quantity of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER, '1']) {
    const next = trade(game, 'VIBE', 'buy', quantity);
    assert.equal(next.cash, game.cash); assert.equal(next.tradeCount, 0);
  }
  for (const [symbol, side, quantity] of [['VIBE', 'buy', 999999], ['VIBE', 'sell', 1], ['BAD', 'buy', 1], ['VIBE', 'borrow', 1]]) {
    assert.equal(trade(game, symbol, side, quantity).tradeCount, 0);
  }
});
test('max buy includes the fee and never creates negative cash', () => {
  const game = createGame();
  COMPANIES.forEach((company, index) => {
    const max = maxBuy(game, index); const next = trade(game, company.symbol, 'buy', max);
    assert.ok(next.cash >= 0 && next.cash < game.stocks[index].price);
    assert.equal(trade(game, company.symbol, 'buy', max + 1).tradeCount, 0);
  });
});
test('partial and complete sales allocate cost basis and both fees', () => {
  let game = trade(createGame(), 'VIBE', 'buy', 3);
  const basis = game.holdings[0].basis;
  game = trade(game, 'VIBE', 'sell', 1);
  assert.equal(game.holdings[0].basis, basis - Math.round(basis / 3));
  game = trade(game, 'VIBE', 'sell', 2);
  assert.deepEqual(game.holdings[0], { symbol: 'VIBE', shares: 0, basis: 0 });
  assert.equal(game.realized, -FEE * 3); assert.equal(game.cash, STARTING_CASH - FEE * 3);
});
test('market repeats for the same seed and diverges for different seeds', () => {
  let a = createGame(100); let b = createGame(100); let c = createGame(200);
  for (let i = 0; i < LAST_DAY; i++) { a = advanceDay(a); b = advanceDay(b); c = advanceDay(c); }
  assert.deepEqual(a, b); assert.notDeepEqual(a.stocks, c.stocks);
});
test('each day records prices, mark-to-market equity, and an event', () => {
  const before = trade(createGame(), 'LEAF', 'buy', 30); const after = advanceDay(before);
  assert.equal(after.day, 1); assert.equal(after.news[0].day, 1);
  assert.equal(after.equityHistory.length, 2); assert.equal(after.equityHistory.at(-1), equity(after));
  after.stocks.forEach((stock, index) => {
    assert.equal(stock.previous, before.stocks[index].price);
    assert.equal(stock.history.length, 2); assert.equal(stock.history.at(-1), stock.price);
    assert.ok(stock.price >= 100 && Number.isInteger(stock.price));
  });
});
test('day 30 freezes market and trading', () => {
  let game = createGame();
  for (let i = 0; i < 100; i++) game = advanceDay(game);
  assert.equal(game.day, LAST_DAY); assert.equal(game.equityHistory.length, LAST_DAY + 1);
  assert.equal(advanceDay(game), game); assert.equal(trade(game, 'MEME', 'buy', 1).tradeCount, 0);
  assert.ok(game.message.includes('Season complete')); assert.ok(TARGET > STARTING_CASH);
});
test('saved seasons round trip and broken saves are rejected', () => {
  let game = trade(createGame(555), 'TOST', 'buy', 7);
  for (let i = 0; i < 10; i++) game = advanceDay(game);
  assert.deepEqual(restoreGame(JSON.stringify(game)), game);
  for (const raw of ['nope', 'null', '{}', JSON.stringify({ ...game, cash: -1 }), JSON.stringify({ ...game, day: 31 }), JSON.stringify({ ...game, stocks: [] }), JSON.stringify({ ...game, equityHistory: [Infinity] }), JSON.stringify({ ...game, news: [{ headline: 'broken' }] })]) assert.equal(restoreGame(raw), null);
  const broken = structuredClone(game); broken.holdings[0].shares = -1;
  assert.equal(restoreGame(JSON.stringify(broken)), null);
});
test('50 complete trading seasons preserve accounting and save invariants', () => {
  for (let seed = 0; seed < 50; seed++) {
    let game = createGame(seed);
    for (let day = 0; day < LAST_DAY; day++) {
      const index = (seed + day) % COMPANIES.length; const symbol = COMPANIES[index].symbol;
      game = trade(game, symbol, 'buy', Math.min(5, maxBuy(game, index)));
      if (day % 3 === 0 && game.holdings[index].shares) game = trade(game, symbol, 'sell', Math.max(1, Math.floor(game.holdings[index].shares / 2)));
      game = advanceDay(game);
      assert.ok(game.cash >= 0 && Number.isSafeInteger(game.cash));
      assert.equal(game.equityHistory.at(-1), equity(game));
      assert.deepEqual(restoreGame(JSON.stringify(game)), game);
    }
  }
});
test('reset starts a clean season without mutating prior state', () => {
  const game = trade(createGame(), 'CLIP', 'buy', 5);
  const fresh = gameReducer(game, { type: 'reset', seed: 88 });
  assert.equal(fresh.rng, 88); assert.equal(fresh.day, 0); assert.equal(fresh.cash, STARTING_CASH);
  assert.equal(game.holdings[2].shares, 5);
  assert.equal(gameReducer(game, { type: 'restore', raw: 'broken' }), game);
});

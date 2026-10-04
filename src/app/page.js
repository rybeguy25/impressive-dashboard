'use client';

import { useEffect, useId, useReducer, useState } from 'react';
import { COMPANIES, FEE, LAST_DAY, SAVE_KEY, STARTING_CASH, TARGET, changePercent, createGame, equity, gameReducer, maxBuy, restoreGame } from '../lib/game.mjs';

const money = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
const signed = value => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
const sections = [{ id: 'market', icon: '◈', name: 'Market floor' }, { id: 'portfolio', icon: '▥', name: 'Your portfolio' }, { id: 'guide', icon: '⌁', name: 'How to play' }];

function Chart({ values, positive = true, small = false, label }) {
  const id = useId().replaceAll(':', '');
  const width = 600; const height = small ? 80 : 220;
  const low = Math.min(...values); const high = Math.max(...values);
  const padding = Math.max((high - low) * 0.15, high * 0.005, 1);
  const y = value => 12 + (high + padding - value) / (high - low + padding * 2) * (height - 24);
  const points = values.length === 1 ? `0,${y(values[0])} ${width},${y(values[0])}` : values.map((value, i) => `${i / (values.length - 1) * width},${y(value)}`).join(' ');
  const color = positive ? '#99dcb5' : '#f09d9d';
  return <svg className={small ? 'sparkline' : 'price-chart'} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={label}>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".2" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
    {!small && [0.2, 0.5, 0.8].map(line => <line key={line} x1="0" x2={width} y1={height * line} y2={height * line} stroke="#ffffff0a" />)}
    <polygon points={`0,${height} ${points} ${width},${height}`} fill={`url(#${id})`} />
    <polyline points={points} fill="none" stroke={color} strokeWidth={small ? 2 : 2.5} vectorEffect="non-scaling-stroke" />
  </svg>;
}
function Stat({ label, value, detail, tone }) {
  return <article className="stat"><p>{label}</p><strong className={tone || ''}>{value}</strong><small>{detail}</small></article>;
}

export default function Exchange() {
  const [game, dispatch] = useReducer(gameReducer, undefined, () => createGame());
  const [section, setSection] = useState('market');
  const [selected, setSelected] = useState('VIBE');
  const [side, setSide] = useState('buy');
  const [quantity, setQuantity] = useState('1');
  const [auto, setAuto] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Loading local save…');
  const [confirmReset, setConfirmReset] = useState(false);
  const complete = game.day >= LAST_DAY;
  const index = COMPANIES.findIndex(company => company.symbol === selected);
  const company = COMPANIES[index]; const stock = game.stocks[index]; const holding = game.holdings[index];
  const total = equity(game); const gain = total - STARTING_CASH;
  const invested = total - game.cash;
  const marketChange = game.stocks.reduce((sum, item) => sum + changePercent(item), 0) / game.stocks.length;
  const shares = Number(quantity);
  const validQuantity = quantity.trim() !== '' && Number.isSafeInteger(shares) && shares > 0;
  const gross = validQuantity ? shares * stock.price : 0;
  const allowed = loaded && !complete && validQuantity && Number.isSafeInteger(gross)
    && (side === 'buy' ? gross + FEE <= game.cash : shares <= holding.shares);
  const orderReason = !loaded ? 'Loading your game…' : complete ? 'Season complete. Start a new season.' : !validQuantity ? 'Enter a positive whole number of shares.' : side === 'buy' && gross + FEE > game.cash ? 'Not enough cash, including the $1 fee.' : side === 'sell' && shares > holding.shares ? 'You do not own that many shares.' : 'Orders fill immediately at the displayed price.';
  const activeHoldings = game.holdings.map((item, i) => ({ ...item, company: COMPANIES[i], price: game.stocks[i].price })).filter(item => item.shares > 0);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw && restoreGame(raw)) { dispatch({ type: 'restore', raw }); setSaveStatus('Local game restored'); }
        else setSaveStatus(raw ? 'Invalid save ignored · fresh game' : 'Saved on this device');
      } catch { setSaveStatus('Storage unavailable · session only'); }
      setLoaded(true);
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(game)); }
    catch { queueMicrotask(() => setSaveStatus('Storage unavailable · session only')); }
  }, [game, loaded]);
  useEffect(() => {
    if (!auto || complete || !loaded) return;
    const timer = setInterval(() => { if (!document.hidden) dispatch({ type: 'advance' }); }, 3000);
    return () => clearInterval(timer);
  }, [auto, complete, loaded]);
  function choose(symbol) { setSelected(symbol); setQuantity('1'); setConfirmReset(false); }
  function reset() {
    dispatch({ type: 'reset', seed: crypto.getRandomValues(new Uint32Array(1))[0] });
    setAuto(false); setConfirmReset(false); setQuantity('1');
  }

  return <div className="exchange-shell">
    <aside className="sidebar">
      <a className="brand" href="#main"><span className="brand-icon">N</span><div>NEXUS<small>PAPER EXCHANGE</small></div></a>
      <p className="nav-label">THE TERMINAL</p>
      <nav aria-label="Game views">{sections.map(item => <button key={item.id} className={`nav-item ${section === item.id ? 'active' : ''}`} aria-current={section === item.id ? 'page' : undefined} onClick={() => { setSection(item.id); setConfirmReset(false); }}><span>{item.icon}</span>{item.name}</button>)}</nav>
      <div className="sidebar-challenge"><span className="eyebrow">THE 30-DAY CHALLENGE</span><h3>Turn pretend money<br />into a real ego.</h3><p>Start at $10,000.<br />Finish at $12,000.<br />Try not to blame the market.</p><div className="season-track"><div style={{ width: `${game.day / LAST_DAY * 100}%` }} /></div><small>{game.day} / {LAST_DAY} DAYS COMPLETE</small></div>
      <div className="sidebar-bottom"><i /> FICTIONAL MARKET<br /><span>No real money. No live prices.</span></div>
    </aside>
    <main id="main">
      <header className="topbar"><div className="breadcrumb">TERMINAL <span>/</span> {sections.find(item => item.id === section).name.toUpperCase()}</div><div className="top-meta"><span className="simulation-badge">SIMULATION GAME</span><span className="save-status">{saveStatus}</span></div></header>
      <section className="intro"><div><p className="eyebrow">{complete ? 'THE CLOSING BELL' : `SEASON 01 / DAY ${String(game.day).padStart(2, '0')}`}</p><h1>{section === 'portfolio' ? 'Your money. Your moves.' : section === 'guide' ? 'A little risk. Zero stakes.' : 'Welcome to the paper floor.'}</h1><p className="subtitle">{section === 'guide' ? 'Everything you need to become a hypothetical market legend.' : 'The companies are fictional. The consequences are also fictional.'}</p></div><div className="day-controls"><button className="subtle-button" onClick={() => setAuto(value => !value)} disabled={complete || !loaded} aria-pressed={auto && !complete}>{auto && !complete ? 'Ⅱ Pause days' : '▷ Auto · 3s/day'}</button><button className="primary-button" onClick={() => dispatch({ type: 'advance' })} disabled={complete || !loaded}>Next day <span>↗</span></button></div></section>
      <section className="stats" aria-label="Account overview"><Stat label="PORTFOLIO VALUE" value={money(total)} detail={`${signed(gain / STARTING_CASH * 100)} all-time return`} tone={gain < 0 ? 'negative' : ''} /><Stat label="AVAILABLE CASH" value={money(game.cash)} detail="Ready for your next questionable idea" /><Stat label="INVESTED IN STOCKS" value={money(invested)} detail={`${activeHoldings.length} of 6 companies held`} /><Stat label="REALIZED P&L" value={money(game.realized)} detail={`${game.tradeCount} orders · $1 fee per order`} tone={game.realized < 0 ? 'negative' : 'positive'} /></section>
      {complete && <section className={`season-result ${total >= TARGET ? 'won' : ''}`} aria-label="Season result"><div><p className="eyebrow">{total >= TARGET ? 'TARGET BEATEN / HYPOTHETICAL LEGEND' : 'SEASON COMPLETE / THE MARKET WON THIS ROUND'}</p><h2>Final score: {money(total)}</h2><p>{total >= TARGET ? 'You beat the target. The imaginary shareholders salute you.' : `You finished ${money(TARGET - total)} short of the target. A new season means a new market.`} Holdings are valued at closing prices.</p></div><button className="primary-button" onClick={reset}>Play another season ↗</button></section>}

      {section === 'market' && <>
        <section className="market-layout">
          <article className="panel stock-detail"><div className="panel-heading"><div className="company-heading"><span className="company-logo" style={{ '--company-color': company.color }}>{selected[0]}</span><div><h2>{company.name}</h2><p>{selected} <span>/</span> {company.sector}</p></div></div><span className="chip">{game.day === 0 ? 'OPENING PRICE' : 'SIMULATED CLOSE'}</span></div><div className="stock-price"><strong>{money(stock.price)}</strong><span className={changePercent(stock) >= 0 ? 'positive' : 'negative'}>{signed(changePercent(stock))}<small> today</small></span></div><Chart values={stock.history} positive={stock.price >= stock.history[0]} label={`${selected} price history, starting at ${money(stock.history[0])} and currently ${money(stock.price)}`} /><div className="chart-axis"><span>DAY 0 · {money(stock.history[0])}</span><span>{game.day === 0 ? 'Advance a day to build history' : `DAY ${game.day} · ${money(stock.price)}`}</span></div><p className="company-description">{company.description}</p><div className="stock-footer"><span>VOLATILITY <b>{company.volatility >= 0.1 ? 'VERY HIGH' : company.volatility >= 0.055 ? 'HIGH' : 'MODERATE'}</b></span><span>YOU OWN <b>{holding.shares} SHARES</b></span></div></article>
          <article className="panel order-ticket"><div className="panel-heading"><div><p className="eyebrow">MAKE YOUR MOVE</p><h2>Trade {selected}</h2></div><span className="tiny-index">PAPER ORDER</span></div><div className="order-tabs" aria-label="Order direction"><button onClick={() => setSide('buy')} aria-pressed={side === 'buy'} className={side === 'buy' ? 'active' : ''}>Buy</button><button onClick={() => setSide('sell')} aria-pressed={side === 'sell'} className={side === 'sell' ? 'active sell' : ''}>Sell</button></div><form onSubmit={event => { event.preventDefault(); if (allowed) dispatch({ type: 'trade', symbol: selected, side, quantity: shares }); }}><label htmlFor="quantity">WHOLE SHARES <span>{side === 'buy' ? `Max ${maxBuy(game, index)}` : `${holding.shares} available`}</span></label><div className="quantity-field"><input id="quantity" type="number" min="1" step="1" value={quantity} onChange={event => setQuantity(event.target.value)} disabled={complete || !loaded} /><button type="button" onClick={() => setQuantity(String(side === 'buy' ? maxBuy(game, index) : holding.shares))} disabled={complete || !loaded}>MAX</button></div><div className="quick-amounts">{[1, 5, 10, 25].map(amount => <button type="button" key={amount} onClick={() => setQuantity(String(amount))} disabled={complete || !loaded}>{amount}</button>)}</div><dl className="order-summary"><div><dt>Price per share</dt><dd>{money(stock.price)}</dd></div><div><dt>Shares {side === 'buy' ? 'cost' : 'value'}</dt><dd>{money(gross)}</dd></div><div><dt>Trading fee</dt><dd>{money(FEE)}</dd></div><div className="order-total"><dt>{side === 'buy' ? 'Total cost' : 'You receive'}</dt><dd>{money(validQuantity ? side === 'buy' ? gross + FEE : gross - FEE : 0)}</dd></div></dl><button type="submit" className={`trade-button ${side === 'sell' ? 'sell' : ''}`} disabled={!allowed}>{side === 'buy' ? 'Buy' : 'Sell'} {validQuantity ? shares : '—'} {selected} {shares === 1 ? 'share' : 'shares'} <span>↗</span></button><p className="order-hint">{orderReason}</p></form></article>
        </section>
        <section className="panel watchlist"><div className="panel-heading"><div><p className="eyebrow">SIX COMPANIES. MANY POSSIBILITIES.</p><h2>The watchlist</h2></div><span className={marketChange >= 0 ? 'positive market-average' : 'negative market-average'}>AVG {signed(marketChange)}</span></div><div className="table-scroll"><table><thead><tr><th>COMPANY</th><th>PRICE</th><th>DAY CHANGE</th><th>PRICE HISTORY</th><th>HELD</th><th><span className="sr-only">Select stock</span></th></tr></thead><tbody>{game.stocks.map((item, i) => <tr key={item.symbol} className={selected === item.symbol ? 'selected-row' : ''}><td><button className="company-select" onClick={() => choose(item.symbol)}><span className="company-logo small" style={{ '--company-color': COMPANIES[i].color }}>{item.symbol[0]}</span><span><b>{item.symbol}</b><small>{COMPANIES[i].name}</small></span></button></td><td>{money(item.price)}</td><td className={changePercent(item) >= 0 ? 'positive' : 'negative'}>{signed(changePercent(item))}</td><td><Chart values={item.history} small positive={item.price >= item.history[0]} label={`${item.symbol} price trend`} /></td><td>{game.holdings[i].shares}</td><td><button className="row-trade" onClick={() => choose(item.symbol)} aria-label={`Select ${item.symbol} for trading`}>{selected === item.symbol ? 'Selected' : 'Trade ↗'}</button></td></tr>)}</tbody></table></div></section>
      </>}

      {section === 'portfolio' && <section className="portfolio-layout"><article className="panel equity-panel"><div className="panel-heading"><div><p className="eyebrow">THE BIG PICTURE</p><h2>Your equity curve</h2></div><span className="chip">CASH + STOCK VALUE</span></div><div className="stock-price"><strong>{money(total)}</strong><span className={gain >= 0 ? 'positive' : 'negative'}>{signed(gain / STARTING_CASH * 100)}</span></div><Chart values={game.equityHistory} positive={gain >= 0} label={`Portfolio equity from ${money(game.equityHistory[0])} to ${money(total)}`} /><div className="chart-axis"><span>DAY 0</span><span>DAY {game.day}</span></div><div className="goal-progress"><div><span>THE $12,000 TARGET</span><b>{Math.min(100, Math.round(total / TARGET * 100))}%</b></div><div className="season-track"><div style={{ width: `${Math.min(100, total / TARGET * 100)}%` }} /></div><p>{total >= TARGET ? 'Above target. Keep it there until the closing bell.' : `${money(TARGET - total)} to go. You have ${LAST_DAY - game.day} days left.`}</p></div></article><article className="panel positions"><div className="panel-heading"><div><p className="eyebrow">WHAT YOU ACTUALLY OWN</p><h2>Open positions</h2></div><span className="tiny-index">{activeHoldings.length} HOLDINGS</span></div>{activeHoldings.length ? activeHoldings.map(item => <div className="position" key={item.symbol}><div><button onClick={() => { choose(item.symbol); setSection('market'); }}>{item.symbol} ↗</button><small>{item.shares} shares · avg cost {money(Math.round(item.basis / item.shares))}</small></div><div><b>{money(item.price * item.shares)}</b><small className={item.price * item.shares - item.basis >= 0 ? 'positive' : 'negative'}>{money(item.price * item.shares - item.basis)} unrealized</small></div></div>) : <div className="empty-state"><span>◈</span><h3>No positions. Pure potential.</h3><p>Your cash is waiting on the market floor.</p><button className="subtle-button" onClick={() => setSection('market')}>Find your first stock ↗</button></div>}<div className="allocation"><span>CASH ALLOCATION</span><b>{total ? (game.cash / total * 100).toFixed(1) : '0.0'}%</b></div></article></section>}

      {section === 'guide' && <section className="guide-grid">{[
        ['The mission', 'Begin with $10,000 in fictional cash. Trade for 30 market days and finish with at least $12,000 in total equity to win. Equity is cash plus the current value of your stocks.'],
        ['The controls', 'Select a company, choose Buy or Sell, enter a whole number of shares, and place an order. Orders fill at the displayed price with a flat $1 fee. MAX includes that fee.'],
        ['The market', 'Next day moves stocks and delivers a fictional headline. Auto advances every 3 seconds while this tab is visible. Headlines explain the move that just happened; they do not predict the next day.'],
        ['The rules', 'No borrowing, short selling, or fractional shares. Buying fees enter cost basis. Selling fees reduce realized profit. On day 30, trading stops and holdings are scored at closing prices.'],
        ['Your game stays here', 'Progress saves in this browser’s local storage. Refresh to resume; auto mode starts paused. If storage is unavailable, you can still play this session. A new season replaces your current game.'],
        ['A game, entirely', 'Every company, price, headline, and outcome is simulated. This random market does not model real investing. No account, brokerage, live data feed, or network connection is used by the game engine.'],
      ].map(([title, text], i) => <article className="panel guide-card" key={title}><span className="guide-number">0{i + 1}</span><h2>{title}</h2><p>{text}</p></article>)}</section>}

      <section className="bottom-grid"><article className="panel news-panel"><div className="panel-heading"><div><p className="eyebrow">THE FICTIONAL FINANCIAL PRESS</p><h2>Market wire</h2></div><span className="chip">DAY {game.day}</span></div>{game.news.slice(0, 4).map(item => <div className="news-item" key={item.day}><span className={`news-icon ${item.impact < 0 ? 'down' : ''}`}>{item.impact < 0 ? '↘' : item.impact > 0 ? '↗' : '⌁'}</span><div><small>DAY {String(item.day).padStart(2, '0')} / {item.target}</small><h3>{item.headline}</h3><p>{item.detail}</p></div></div>)}</article><article className="panel trade-history"><div className="panel-heading"><div><p className="eyebrow">THE RECEIPTS</p><h2>Recent orders</h2></div><span className="tiny-index">{game.tradeCount} TOTAL</span></div>{game.trades.length ? game.trades.slice(0, 5).map(item => <div className="history-item" key={item.id}><span className={item.side === 'buy' ? 'buy-label' : 'sell-label'}>{item.side.toUpperCase()}</span><div><b>{item.quantity} {item.symbol}</b><small>Day {item.day} · {money(item.price)} / share</small></div><strong>{money(item.quantity * item.price)}</strong></div>) : <div className="empty-state compact"><span>↗</span><h3>Your story starts with an order.</h3><p>All the receipts. None of the real money.</p></div>}</article></section>
      <div className="game-message" role="status" aria-live="polite"><span>›</span>{game.message}</div>
      <footer><span>NEXUS / FICTIONAL STOCKS. ACTUAL BUTTONS.</span><div>{confirmReset ? <><span>Replace this season?</span><button onClick={reset}>Yes, new season</button><button onClick={() => setConfirmReset(false)}>Cancel</button></> : <button onClick={() => { setAuto(false); setConfirmReset(true); }} disabled={!loaded}>New season ↻</button>}</div></footer>
    </main>
  </div>;
}

# Nexus Paper Exchange

The impressive dashboard now has actual buttons behind the impressive facade: a playable **30-day stock simulation game**.

Start with **$10,000** in fictional cash. Trade six fictional companies and finish day 30 with at least **$12,000** in cash plus stock value to win. No real money, market feeds, brokerage connections, or financial advice.

## Play

- Select VIBE, TOST, CLIP, VOID, MEME, or LEAF from the watchlist.
- Buy or sell whole shares at the displayed price. Every order has a flat **$1 fee**. MAX accounts for the fee.
- Advance a day to move prices and generate a fictional market headline. Auto advances every three seconds while the tab is visible.
- Check your holdings, average cost, unrealized profit, realized profit, and equity curve in **Your portfolio**.
- On day 30, trading stops and your final equity is scored at closing prices. Start a new season for a new seeded market.

Cash and accounting use integer cents. Buying fees enter cost basis; selling fees reduce realized profit. Partial sells allocate average cost proportionally, rounded to the nearest cent. No fractional shares, debt, or short selling.

## Run

Use Node.js 20.9 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:3000.

```sh
npm test
npm run lint
npm run build
npm start
```

## Saving

Progress autosaves to browser local storage. Reload to resume; auto mode starts paused. Invalid saves are ignored. If storage is blocked, the game still works for the current session. New season replaces the saved game after confirmation. No data leaves the browser through the game engine.

## Under the facade

Next.js App Router + React. A pure, seeded game engine lives in `src/lib/game.mjs`, independent of the UI. Price changes combine company volatility, shared market noise, and randomly selected news effects. News describes the move that just happened, not a prediction of the next day. Returns are not guaranteed; this is a game, not a model of real markets.

The initial season has a fixed seed for consistent server rendering. New seasons use browser-generated seeds. Price and equity SVG charts represent actual game history, including trading fees. Navigation, order controls, day controls, watchlist, news, and reset are functional. Responsive layouts and reduced-motion support are included. Google Fonts are optional; fallback fonts work without them.

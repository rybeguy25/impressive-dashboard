import "./globals.css";

export const metadata = {
  title: "Nexus Paper Exchange — Stock Simulation Game",
  description: "A 30-day stock trading game with fictional companies, simulated market events, and a $10,000 starting portfolio. No real money or live prices.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

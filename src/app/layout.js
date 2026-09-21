import "./globals.css";

export const metadata = {
  title: "Nexus Analytics Dashboard",
  description: "A premium Next.js dashboard featuring complex UI, glassmorphism, and data visualizations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

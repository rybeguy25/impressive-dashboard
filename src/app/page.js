"use client";

import { useEffect, useState } from "react";

// Placeholder icons using simple SVG paths
const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const ChartIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const SettingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar animate-fade-in delay-1">
        <div className="logo">
          <div className="logo-icon"></div>
          <span className="text-gradient">Nexus</span>
        </div>
        
        <nav className="nav-menu">
          <div className="nav-item active"><HomeIcon /> Overview</div>
          <div className="nav-item"><ChartIcon /> Analytics</div>
          <div className="nav-item"><UsersIcon /> Audience</div>
          <div className="nav-item"><SettingsIcon /> Settings</div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        
        <header className="animate-fade-in delay-1">
          <h1>Dashboard Overview</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>Welcome back! Here is what is happening with your projects today.</p>
        </header>

        {/* Stats Grid */}
        <section className="stats-grid">
          <div className="glass-panel animate-fade-in delay-1">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">$124,563</div>
            <div className="stat-trend trend-up">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              +12.5% from last month
            </div>
          </div>
          
          <div className="glass-panel animate-fade-in delay-2">
            <div className="stat-label">Active Users</div>
            <div className="stat-value">14,290</div>
            <div className="stat-trend trend-up">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              +5.2% from last week
            </div>
          </div>

          <div className="glass-panel animate-fade-in delay-3">
            <div className="stat-label">Bounce Rate</div>
            <div className="stat-value">23.4%</div>
            <div className="stat-trend trend-down">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
              -1.1% from yesterday
            </div>
          </div>
        </section>

        {/* Complex Layout Grid */}
        <section className="charts-grid animate-fade-in delay-3">
          {/* Main Chart Area */}
          <div className="glass-panel">
            <h3 style={{ marginBottom: "20px" }}>Revenue Overview</h3>
            <div className="chart-placeholder">
              <div className="chart-bar" style={{ height: "30%" }}></div>
              <div className="chart-bar" style={{ height: "50%" }}></div>
              <div className="chart-bar" style={{ height: "40%" }}></div>
              <div className="chart-bar" style={{ height: "70%" }}></div>
              <div className="chart-bar" style={{ height: "60%" }}></div>
              <div className="chart-bar" style={{ height: "90%" }}></div>
              <div className="chart-bar" style={{ height: "85%" }}></div>
              <div className="chart-bar" style={{ height: "100%" }}></div>
              <div className="chart-bar" style={{ height: "75%" }}></div>
              <div className="chart-bar" style={{ height: "65%" }}></div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3>Recent Activity</h3>
            
            {[
              { id: 1, action: "New subscription", user: "Alice M.", time: "2 min ago", icon: "💎" },
              { id: 2, action: "Server upgrade", user: "System", time: "1 hour ago", icon: "🚀" },
              { id: 3, action: "Payment failed", user: "Bob C.", time: "3 hours ago", icon: "⚠️" },
              { id: 4, action: "New support ticket", user: "Dave L.", time: "5 hours ago", icon: "🎫" },
            ].map(item => (
              <div key={item.id} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                <div style={{ fontSize: "20px", background: "rgba(255,255,255,0.05)", padding: "8px", borderRadius: "8px" }}>{item.icon}</div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{item.action}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span>{item.user}</span>
                    <span style={{ marginLeft: "12px" }}>{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

"use client";
import React, { useState } from "react";

const rewards = [
  { name: "Donut", points: 500, img: "🍩" },
  { name: "Iced Tea", points: 500, img: "🧋" },
  { name: "Salad", points: 700, img: "🥗" },
  { name: "T-Shirt", points: 1000, img: "👕" },
];

const routes = [
  { name: "Donall Dash", color: "#5B8DEF" },
  { name: "I-health mozie", color: "#4BCB8B" },
  { name: "Plata Povorwalk", color: "#FF6B6B" },
];

export default function HomePage() {
  const [step, setStep] = useState(0);

  return (
    <div style={styles.container}>
      {step === 0 && (
        <section style={styles.screenOrange}>
          <h1 style={styles.title}>SNACKNAV</h1>
          <p style={styles.subtitle}>Walk more.<br />Eat better.<br />Get rewarded.</p>
          <button style={styles.button} onClick={() => setStep(1)}>Get Started</button>
        </section>
      )}

      {step === 1 && (
        <section style={styles.screenWhite}>
          <div style={styles.map}>
            {routes.map((route, idx) => (
              <div key={route.name} style={{ ...styles.route, background: route.color, left: 40 + idx * 80 }}>
                {route.name}
              </div>
            ))}
            <div style={styles.pin}>🥨</div>
          </div>
          <div style={styles.stats}>
            <div><strong>235</strong><br />CALORIES</div>
            <div><strong>2,850</strong><br />STEPS</div>
            <div><strong>1200</strong><br />Km</div>
          </div>
          <button style={styles.button} onClick={() => setStep(2)}>Start Challenge</button>
        </section>
      )}

      {step === 2 && (
        <section style={styles.screenOrange}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🍕</div>
          <h2 style={styles.title}>Pizza Powerwalk</h2>
          <p style={styles.subtitle}>+220 CALORIES<br />1 Free Pizza Slice</p>
          <div style={styles.mapSmall}>
            <div style={{ ...styles.route, background: "#FF6B6B", left: 60 }}>Pizza Route</div>
            <div style={styles.pinSmall}>🍕</div>
          </div>
          <button style={styles.button} onClick={() => setStep(3)}>Start Walk</button>
        </section>
      )}

      {step === 3 && (
        <section style={styles.screenPurple}>
          <h2 style={styles.title}>Rewards</h2>
          <div style={styles.tabs}>
            <button style={styles.tabActive}>All</button>
            <button style={styles.tab}>Nearby</button>
            <button style={styles.tab}>Healthy</button>
          </div>
          <div style={styles.rewardsGrid}>
            {rewards.map((reward) => (
              <div key={reward.name} style={styles.rewardCard}>
                <div style={styles.rewardImg}>{reward.img}</div>
                <div style={styles.rewardName}>{reward.name}</div>
                <div style={styles.rewardPoints}>{reward.points}</div>
                <button style={styles.claimButton}>Claim</button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "'Nunito', 'Arial Rounded MT Bold', Arial, sans-serif",
    minHeight: "100vh",
    background: "#FFF7F0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  screenOrange: {
    background: "linear-gradient(135deg, #FFA726 60%, #FFCC80 100%)",
    borderRadius: 32,
    boxShadow: "0 8px 32px rgba(255, 167, 38, 0.15)",
    padding: 32,
    width: 340,
    minHeight: 600,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
  },
  screenWhite: {
    background: "#fff",
    borderRadius: 32,
    boxShadow: "0 8px 32px rgba(90, 90, 90, 0.08)",
    padding: 32,
    width: 340,
    minHeight: 600,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
  },
  screenPurple: {
    background: "linear-gradient(135deg, #6C63FF 60%, #B39DDB 100%)",
    borderRadius: 32,
    boxShadow: "0 8px 32px rgba(108, 99, 255, 0.15)",
    padding: 32,
    width: 340,
    minHeight: 600,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    color: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: 900,
    letterSpacing: 2,
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 500,
    marginBottom: 32,
    textAlign: "center",
    color: "#fff",
  },
  button: {
    background: "linear-gradient(90deg, #FF7043 60%, #FFA726 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 24,
    padding: "16px 40px",
    fontSize: 20,
    fontWeight: 700,
    boxShadow: "0 4px 16px rgba(255, 112, 67, 0.15)",
    cursor: "pointer",
    marginTop: 32,
    transition: "transform 0.1s",
  },
  map: {
    width: 260,
    height: 180,
    background: "#FFF7F0",
    borderRadius: 24,
    position: "relative",
    marginBottom: 24,
    boxShadow: "0 2px 8px rgba(255, 167, 38, 0.08)",
  },
  route: {
    position: "absolute",
    top: 40,
    width: 60,
    height: 12,
    borderRadius: 8,
    color: "#fff",
    fontWeight: 700,
    fontSize: 12,
    textAlign: "center",
    lineHeight: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    padding: "0 4px",
  },
  pin: {
    position: "absolute",
    left: 120,
    top: 120,
    fontSize: 32,
  },
  stats: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
    fontSize: 16,
    color: "#FF7043",
    fontWeight: 700,
  },
  mapSmall: {
    width: 180,
    height: 80,
    background: "#FFF7F0",
    borderRadius: 16,
    position: "relative",
    marginBottom: 24,
    boxShadow: "0 2px 8px rgba(255, 167, 38, 0.08)",
  },
  pinSmall: {
    position: "absolute",
    left: 80,
    top: 40,
    fontSize: 24,
  },
  tabs: {
    display: "flex",
    gap: 8,
    marginBottom: 24,
  },
  tab: {
    background: "#B39DDB",
    color: "#fff",
    border: "none",
    borderRadius: 16,
    padding: "8px 20px",
    fontWeight: 700,
    fontSize: 16,
    cursor: "pointer",
    opacity: 0.7,
  },
  tabActive: {
    background: "#fff",
    color: "#6C63FF",
    border: "none",
    borderRadius: 16,
    padding: "8px 20px",
    fontWeight: 700,
    fontSize: 16,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(255,255,255,0.15)",
  },
  rewardsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    width: "100%",
    marginTop: 8,
  },
  rewardCard: {
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 2px 8px rgba(90,90,90,0.08)",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "#6C63FF",
    fontWeight: 700,
  },
  rewardImg: {
    fontSize: 40,
    marginBottom: 8,
  },
  rewardName: {
    fontSize: 18,
    marginBottom: 4,
  },
  rewardPoints: {
    fontSize: 16,
    marginBottom: 8,
    color: "#FFA726",
  },
  claimButton: {
    background: "linear-gradient(90deg, #FF7043 60%, #FFA726 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 16,
    padding: "8px 24px",
    fontWeight: 700,
    fontSize: 16,
    cursor: "pointer",
    marginTop: 8,
  },
};

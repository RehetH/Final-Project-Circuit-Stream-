"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

const rewards = [
  { name: "Donut", points: 500, img: "🍩", type: "nearby" },
  { name: "Iced Tea", points: 500, img: "🧋", type: "nearby" },
  { name: "Salad", points: 700, img: "🥗", type: "healthy" },
  { name: "T-Shirt", points: 1000, img: "👕", type: "other" },
];

const rewardTabs = [
  { label: "All", value: "all" },
  { label: "Nearby", value: "nearby" },
  { label: "Healthy", value: "healthy" },
];

const locations = [
  { name: "Pizza Place", coords: [51.505, -0.09] },
  { name: "Donut Shop", coords: [51.51, -0.1] },
  { name: "Salad Bar", coords: [51.507, -0.08] },
  { name: "Cafe", coords: [51.503, -0.095] },
];

export default function HomePage() {
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState(locations);
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [rewardTab, setRewardTab] = useState("all");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Autofill search handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setSuggestions(
      locations
        .filter(loc => loc.name.toLowerCase().includes(value.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    setShowSuggestions(true);
  };

  // Select location from autofill
  const handleSuggestionClick = (loc: typeof locations[0]) => {
    setSelectedLocation(loc);
    setSearch(loc.name);
    setSuggestions([loc]);
    setShowSuggestions(false);
  };

  // Back button helper
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 0));

  // Filter rewards by tab
  const filteredRewards = rewardTab === "all"
    ? rewards
    : rewards.filter(r => r.type === rewardTab);

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
          <div style={styles.headerRow}>
            <button style={styles.backButton} onClick={handleBack}>← Back</button>
          </div>
          <div style={styles.mapContainer}>
            <div style={styles.searchBox}>
              <input
                type="text"
                placeholder="Search for a location..."
                value={search}
                onChange={handleSearchChange}
                style={styles.searchInput}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              />
              {showSuggestions && search && (
                <div style={styles.suggestions}>
                  {suggestions.length === 0 ? (
                    <div style={styles.suggestionItem}>No results found</div>
                  ) : (
                    suggestions.map((loc) => (
                      <div
                        key={loc.name}
                        style={styles.suggestionItem}
                        onMouseDown={() => handleSuggestionClick(loc)}
                      >
                        {loc.name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <MapContainer
              center={selectedLocation.coords}
              zoom={15}
              style={{ height: "180px", width: "100%", borderRadius: "24px" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={selectedLocation.coords}>
                <Popup>
                  {selectedLocation.name}
                </Popup>
              </Marker>
            </MapContainer>
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
          <div style={styles.headerRow}>
            <button style={styles.backButton} onClick={handleBack}>← Back</button>
          </div>
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
          <div style={styles.headerRow}>
            <button style={styles.backButton} onClick={handleBack}>← Back</button>
          </div>
          <h2 style={styles.title}>Rewards</h2>
          <div style={styles.tabsRow}>
            {rewardTabs.map(tab => (
              <button
                key={tab.value}
                style={rewardTab === tab.value ? styles.tabActive : styles.tab}
                onClick={() => setRewardTab(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div style={styles.rewardsGrid}>
            {filteredRewards.length === 0 ? (
              <div style={{ color: "#fff", textAlign: "center", gridColumn: "1/3", fontSize: 18, marginTop: 32 }}>
                No rewards found.
              </div>
            ) : (
              filteredRewards.map((reward) => (
                <div key={reward.name} style={styles.rewardCard}>
                  <div style={styles.rewardImg}>{reward.img}</div>
                  <div style={styles.rewardName}>{reward.name}</div>
                  <div style={styles.rewardPoints}>{reward.points}</div>
                  <button style={styles.claimButton}>Claim</button>
                </div>
              ))
            )}
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
  headerRow: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 8,
    position: "relative",
    minHeight: 48,
  },
  tabsRow: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
    marginTop: 8,
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
  backButton: {
    background: "#fff",
    color: "#FF7043",
    border: "none",
    borderRadius: 16,
    padding: "8px 20px",
    fontWeight: 700,
    fontSize: 16,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(255,112,67,0.15)",
    zIndex: 1,
    position: "static",
    marginLeft: 0,
    marginTop: 0,
  },
  mapContainer: {
    width: "100%",
    marginBottom: 24,
    borderRadius: 24,
    background: "#FFF7F0",
    boxShadow: "0 2px 8px rgba(255, 167, 38, 0.08)",
    position: "relative",
    overflow: "hidden",
  },
  searchBox: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    zIndex: 2,
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 2px 8px rgba(255,167,38,0.10)",
    padding: "8px 12px",
  },
  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    fontSize: 16,
    borderRadius: 12,
    padding: "8px",
    fontFamily: "'Nunito', 'Arial Rounded MT Bold', Arial, sans-serif",
  },
  suggestions: {
    marginTop: 8,
    background: "#FFF7F0",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(255,167,38,0.10)",
    maxHeight: 120,
    overflowY: "auto",
    position: "absolute",
    left: 0,
    right: 0,
    top: "100%",
  },
  suggestionItem: {
    padding: "8px 12px",
    cursor: "pointer",
    borderRadius: 8,
    fontSize: 16,
    color: "#FF7043",
    fontWeight: 700,
    transition: "background 0.2s",
    background: "#FFF7F0",
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
};
"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// --- Types ---
interface Location {
  id: string;
  name: string;
  coords: [number, number];
  category: string;
  icon?: string;
}

interface Reward {
  id: string;
  name: string;
  points: number;
  img: string;
  brand: string;
}

interface Task {
  id: string;
  name: string;
  description: string;
  calories: number;
  steps: number;
  locationId: string;
  icon: string;
}

const LOCATIONS: Location[] = [
  { id: "1", name: "Starbucks", coords: [51.505, -0.09], category: "cafe", icon: "☕" },
  { id: "2", name: "Target", coords: [51.51, -0.1], category: "shop", icon: "🎯" },
  { id: "3", name: "Domino's Pizza", coords: [51.507, -0.08], category: "restaurant", icon: "🍕" },
  { id: "4", name: "Chipotle", coords: [51.503, -0.095], category: "restaurant", icon: "🌯" },
  { id: "5", name: "Local Park", coords: [51.506, -0.085], category: "park", icon: "🌳" },
];

const REWARDS: Reward[] = [
  { id: "1", name: "Starbucks Gift Card", points: 500, img: "☕", brand: "Starbucks" },
  { id: "2", name: "Target Gift Card", points: 700, img: "🎯", brand: "Target" },
  { id: "3", name: "Domino's Pizza Slice", points: 400, img: "🍕", brand: "Domino's" },
  { id: "4", name: "Chipotle Burrito", points: 600, img: "🌯", brand: "Chipotle" },
  { id: "5", name: "Park Picnic Kit", points: 300, img: "🌳", brand: "Local" },
];

const NAV_LINKS = [
  { label: "Home", step: 0, icon: "🏠" },
  { label: "Map", step: 1, icon: "🗺️" },
  { label: "Challenge", step: 2, icon: "🎯" },
  { label: "Rewards", step: 3, icon: "🎁" },
  { label: "Profile", step: 4, icon: "👤" },
];

const REWARD_TABS = ["All", "Starbucks", "Target", "Domino's", "Chipotle"];

const TASKS: Task[] = [
  {
    id: "t1",
    name: "Coffee Walk",
    description: "Walk to Starbucks for a coffee break.",
    calories: 120,
    steps: 1500,
    locationId: "1",
    icon: "☕",
  },
  {
    id: "t2",
    name: "Target Run",
    description: "Walk to Target and grab essentials.",
    calories: 180,
    steps: 2000,
    locationId: "2",
    icon: "🎯",
  },
  {
    id: "t3",
    name: "Pizza Powerwalk",
    description: "Walk to Domino's for a pizza slice.",
    calories: 220,
    steps: 2500,
    locationId: "3",
    icon: "🍕",
  },
  {
    id: "t4",
    name: "Burrito Dash",
    description: "Walk to Chipotle for a burrito.",
    calories: 200,
    steps: 1800,
    locationId: "4",
    icon: "🌯",
  },
  {
    id: "t5",
    name: "Park Stroll",
    description: "Enjoy a stroll in the local park.",
    calories: 90,
    steps: 1200,
    locationId: "5",
    icon: "🌳",
  },
  {
    id: "t6",
    name: "Morning Coffee",
    description: "Start your day with a walk to Starbucks.",
    calories: 110,
    steps: 1400,
    locationId: "1",
    icon: "☕",
  },
  {
    id: "t7",
    name: "Grocery Sprint",
    description: "Quick walk to Target for groceries.",
    calories: 160,
    steps: 1700,
    locationId: "2",
    icon: "🎯",
  },
  {
    id: "t8",
    name: "Pizza Night",
    description: "Evening walk to Domino's for dinner.",
    calories: 210,
    steps: 2300,
    locationId: "3",
    icon: "🍕",
  },
  {
    id: "t9",
    name: "Chipotle Lunch",
    description: "Walk to Chipotle for a healthy lunch.",
    calories: 190,
    steps: 1600,
    locationId: "4",
    icon: "🌯",
  },
  {
    id: "t10",
    name: "Park Picnic",
    description: "Walk to the park for a picnic.",
    calories: 100,
    steps: 1300,
    locationId: "5",
    icon: "🌳",
  },
];

// Helper for autofill (mocked for demo)
const CITY_SUGGESTIONS = [
  "London, England, UK",
  "New York, NY, USA",
  "San Francisco, CA, USA",
  "Toronto, ON, Canada",
  "Sydney, NSW, Australia",
];

function UserLocationMarker({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [position, map]);
  if (!position) return null;
  return (
    <Marker position={position}>
      <Popup>
        <span className="font-bold text-[#5C53FF]">You are here</span>
      </Popup>
    </Marker>
  );
}

// Helper function to calculate distance between two lat/lng points (in km)
function getDistanceKm(a: [number, number], b: [number, number]) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const aVal =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c;
}

// Utility: Clamp distance to a reasonable max (e.g., 10km)
function clampDistance(distance: number, max: number = 10) {
  return Math.min(distance, max);
}

export default function HomePage() {
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [filteredLocations, setFilteredLocations] = useState<Location[]>(LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<Location>(LOCATIONS[0]);
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeRewardTab, setActiveRewardTab] = useState<string>("All");
  const [points, setPoints] = useState(0);

  // Location sharing
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const [cityInput, setCityInput] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<string[]>(CITY_SUGGESTIONS);

  // Task slider
  const [activeTaskIdx, setActiveTaskIdx] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Search handler with suggestions
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setShowSuggestions(true);
    setFilteredLocations(
      LOCATIONS.filter(loc =>
        loc.name.toLowerCase().includes(value.toLowerCase()) ||
        loc.category.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  // Select location from suggestions
  const handleLocationSelect = (loc: Location) => {
    setSelectedLocation(loc);
    setSearch(loc.name);
    setShowSuggestions(false);
  };

  // Hide suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filter rewards by tab
  const displayedRewards = activeRewardTab === "All"
    ? REWARDS
    : REWARDS.filter(r => r.brand === activeRewardTab);

  // Location autofill suggestions
  const handleCityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCityInput(value);
    setCitySuggestions(
      CITY_SUGGESTIONS.filter(s =>
        s.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  // Handle autofill selection
  const handleCitySelect = (city: string) => {
    setCityInput(city);
    setShowLocationPrompt(false);
    // For demo, set a location based on city
    if (city === "London, England, UK") setUserLocation([51.505, -0.09]);
    else if (city === "New York, NY, USA") setUserLocation([40.7128, -74.006]);
    else if (city === "San Francisco, CA, USA") setUserLocation([37.7749, -122.4194]);
    else if (city === "Toronto, ON, Canada") setUserLocation([43.6532, -79.3832]);
    else if (city === "Sydney, NSW, Australia") setUserLocation([-33.8688, 151.2093]);
    else setUserLocation(null);
  };

  // Geolocation API
  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setShowLocationPrompt(false);
        },
        () => setShowLocationPrompt(false)
      );
    } else {
      setShowLocationPrompt(false);
    }
  };

  // --- Layout ---
  const locationIsSet = !!userLocation || !!cityInput;

  // Calculate distance for each location from user (all under 10km)
  const locationDistances: { [id: string]: number } = {};
  if (userLocation) {
    LOCATIONS.forEach(loc => {
      let dist = getDistanceKm(userLocation, loc.coords);
      dist = clampDistance(dist, 10); // Ensure all distances are <= 10km
      locationDistances[loc.id] = dist;
    });
  }

  // Calculate points for each location (100 base + 25 per km, max 10km)
  const locationPoints: { [id: string]: number } = {};
  Object.entries(locationDistances).forEach(([id, dist]) => {
    locationPoints[id] = Math.round(100 + dist * 25);
  });

  // Calculate distance and points for selected location
  let distanceKm = 0;
  let pointsForThisTask = 100;
  if (userLocation && selectedLocation) {
    distanceKm = locationDistances[selectedLocation.id] ?? 0;
    pointsForThisTask = locationPoints[selectedLocation.id] ?? 100;
  }

  return (
    <div className="min-h-screen bg-[#1a140f] flex flex-col font-sans relative overflow-hidden">
      {/* Animated Elden Ring-style background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0" style={{ position: "absolute", width: "100vw", height: "100vh" }}>
          {/* Animated stars */}
          {[...Array(80)].map((_, i) => (
            <circle
              key={i}
              cx={Math.random() * 1920}
              cy={Math.random() * 1080}
              r={Math.random() * 1.8 + 0.7}
              fill="#FFD700"
              opacity={Math.random() * 0.7 + 0.3}
            >
              <animate
                attributeName="cx"
                values={`${Math.random() * 1920};${Math.random() * 1920}`}
                dur={`${Math.random() * 10 + 8}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values={`${Math.random() * 1080};${Math.random() * 1080}`}
                dur={`${Math.random() * 10 + 8}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
          {/* Elden Ring style golden arc */}
          <ellipse
            cx="50%"
            cy="60%"
            rx="40vw"
            ry="18vw"
            fill="none"
            stroke="#FFD700"
            strokeWidth="6"
            opacity="0.25"
          >
            <animate
              attributeName="opacity"
              values="0.15;0.35;0.15"
              dur="8s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse
            cx="50%"
            cy="60%"
            rx="30vw"
            ry="12vw"
            fill="none"
            stroke="#FFB300"
            strokeWidth="3"
            opacity="0.18"
          >
            <animate
              attributeName="opacity"
              values="0.10;0.25;0.10"
              dur="10s"
              repeatCount="indefinite"
            />
          </ellipse>
        </svg>
        {/* Review animation (floating text) */}
        <div className="absolute left-1/2 top-16 transform -translate-x-1/2 z-10 pointer-events-none">
          <div className="text-[#FFD700] text-2xl font-bold animate-fadein">
            ⭐ Elden Ring meets SnackNav. Gorgeous UI, fun rewards, and a reason to walk! 
          </div>
        </div>
      </div>

      {/* Sticky Nav */}
      <header
        className={`fixed top-0 left-0 w-full z-40 bg-[#1a140f] transition-shadow duration-300 ${scrolled ? "shadow-lg" : ""}`}
        role="navigation"
        aria-label="Main Navigation"
        style={{ borderBottom: "2px solid #FFD700" }}
      >
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-8 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[#FF7043] font-extrabold text-2xl tracking-tight">SNACKNAV</span>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map(link => (
              <button
                key={link.label}
                className={`flex items-center gap-1 px-3 py-2 rounded-full font-bold text-base transition
                  ${step === link.step
                    ? "bg-[#FF7043] text-white shadow"
                    : "text-[#FF7043] hover:bg-[#FFF3E0] hover:text-[#FF7043] focus:bg-[#FFE0B2]"}
                `}
                onClick={() => setStep(link.step)}
                aria-current={step === link.step ? "page" : undefined}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </button>
            ))}
          </nav>
          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 bg-[#FFF3E0] rounded-full border border-[#FF7043] shadow transition"
            aria-label="Open navigation"
            onClick={() => setNavOpen(!navOpen)}
          >
            <span className="w-6 h-1 bg-[#FF7043] rounded my-0.5"></span>
            <span className="w-6 h-1 bg-[#FF7043] rounded my-0.5"></span>
            <span className="w-6 h-1 bg-[#FF7043] rounded my-0.5"></span>
          </button>
        </div>
        {/* Mobile nav */}
        {navOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-50 flex items-start justify-end"
            onClick={() => setNavOpen(false)}
          >
            <nav
              className="mt-4 mr-4 bg-white rounded-2xl shadow-lg p-6 min-w-[180px] flex flex-col gap-2"
              onClick={e => e.stopPropagation()}
              aria-label="Mobile Navigation"
            >
              {NAV_LINKS.map(link => (
                <button
                  key={link.label}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full font-bold text-base transition
                    ${step === link.step
                      ? "bg-[#FF7043] text-white shadow"
                      : "text-[#FF7043] hover:bg-[#FFF3E0] hover:text-[#FF7043] focus:bg-[#FFE0B2]"}
                  `}
                  onClick={() => { setStep(link.step); setNavOpen(false); }}
                  aria-current={step === link.step ? "page" : undefined}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
        <div className="sticky top-[64px] z-30 bg-[#1a140f] border-b border-[#FFE0B2]">
          <div className="overflow-x-auto flex gap-2 px-8 py-2 scrollbar-hide">
            {TASKS.map((task, idx) => (
              <button
                key={task.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-base transition whitespace-nowrap
                  ${activeTaskIdx === idx
                    ? "bg-[#FF7043] text-white shadow"
                    : "bg-[#FFF3E0] text-[#FF7043] hover:bg-[#FFE0B2]"}
                `}
                onClick={() => {
                  setActiveTaskIdx(idx);
                  const loc = LOCATIONS.find(l => l.id === task.locationId);
                  if (loc) setSelectedLocation(loc);
                  if (locationIsSet) setStep(2);
                }}
                aria-current={activeTaskIdx === idx ? "true" : undefined}
                disabled={!locationIsSet}
                style={!locationIsSet ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              >
                <span>{task.icon}</span>
                <span>{task.name}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-2 pt-32 pb-8 relative z-10">
        <div
          className="shadow-2xl flex flex-col items-center justify-center"
          style={{
            width: "clamp(480px, 70vw, 1200px)",
            minHeight: "clamp(600px, 80vh, 900px)",
            borderRadius: "48px",
            margin: "0 auto",
            padding: "0",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(135deg, #FFA726 85%, #FFD700 100%)",
            boxShadow: "0 0 80px 0 #FFD70055",
            border: "2px solid #FFD700",
            overflow: "hidden",
          }}
        >
          {/* Points Bar */}
          <div className="flex justify-end items-center mb-2 w-full px-8 pt-8">
            <div className="bg-[#FFF3E0] rounded-full px-4 py-2 shadow font-bold text-[#FF7043] flex items-center gap-2">
              <span>⭐</span>
              <span>{points} pts</span>
            </div>
          </div>
          {/* Main UI Content */}
          <div className="w-full h-full flex flex-col items-center justify-center px-0 pb-0">
            {/* Location Prompt */}
            {showLocationPrompt && (
              <section className="bg-white/80 rounded-[32px] shadow-xl flex flex-col items-center text-center mb-4 w-full h-full justify-center">
                <h2 className="text-[#FF7043] font-extrabold text-2xl mb-2">Share your location</h2>
                <p className="text-[#FF7043] mb-4">To get started, share your location or enter your city/state/country.</p>
                <button
                  className="bg-[#FFA726] text-white font-bold px-6 py-2 rounded-full shadow mb-4"
                  onClick={handleShareLocation}
                >
                  Share My Location
                </button>
                <div className="w-full max-w-xs mb-2">
                  <input
                    type="text"
                    value={cityInput}
                    onChange={handleCityInput}
                    placeholder="Enter city, state, country"
                    className="w-full px-4 py-2 rounded-full bg-[#FFF3E0] text-[#FF7043] font-bold shadow focus:outline-none focus:ring-2 focus:ring-[#FF7043] transition"
                    autoComplete="off"
                  />
                  {cityInput.length > 0 && (
                    <ul className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg z-10 border border-[#FFE0B2]">
                      {citySuggestions.length === 0 ? (
                        <li className="px-4 py-2 text-[#FF7043] font-semibold">No results</li>
                      ) : (
                        citySuggestions.map(s => (
                          <li
                            key={s}
                            className="px-4 py-2 cursor-pointer hover:bg-[#FFF3E0] text-[#FF7043] font-semibold"
                            onClick={() => handleCitySelect(s)}
                          >
                            {s}
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              </section>
            )}

            {step === 0 && !showLocationPrompt && (
              <section
                className="bg-[#FFA726] rounded-[32px] shadow-xl flex flex-col items-center text-center w-full h-full justify-center"
              >
                <h1 className="text-white font-extrabold text-4xl mb-4 tracking-tight">SNACKNAV</h1>
                <p className="text-white text-lg font-semibold mb-8 leading-relaxed">
                  Walk more.<br />Eat better.<br />Get rewarded.
                </p>
                <button
                  className="bg-[#FF7043] text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg transition hover:bg-[#F4511E] active:bg-[#FF7043]"
                  onClick={() => locationIsSet && setStep(1)}
                  aria-label="Get Started"
                  disabled={!locationIsSet}
                  style={!locationIsSet ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                >
                  Get Started
                </button>
                {!locationIsSet && (
                  <div className="mt-2 text-white text-sm font-semibold">
                    Please share your location or enter your city to continue.
                  </div>
                )}
              </section>
            )}

            {step === 1 && !showLocationPrompt && (
              <section
                className="bg-white rounded-[32px] shadow-xl flex flex-col items-center w-full h-full justify-center"
              >
                <div className="w-full flex justify-between items-center mb-4 relative">
                  <button
                    className="bg-[#FFF3E0] text-[#FF7043] font-bold px-4 py-2 rounded-full shadow hover:bg-[#FFE0B2] transition"
                    onClick={() => setStep(0)}
                  >
                    ←
                  </button>
                  <div className="w-2/3 relative">
                    <input
                      ref={searchRef}
                      type="text"
                      placeholder="Search for a location..."
                      value={search}
                      onChange={handleSearchChange}
                      className="w-full px-4 py-2 rounded-full bg-[#FFF3E0] text-[#FF7043] font-bold shadow focus:outline-none focus:ring-2 focus:ring-[#FF7043] transition"
                      autoComplete="off"
                      onFocus={() => setShowSuggestions(true)}
                    />
                    {showSuggestions && search.length > 0 && (
                      <ul className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-lg z-10 border border-[#FFE0B2]">
                        {filteredLocations.length === 0 ? (
                          <li className="px-4 py-2 text-[#FF7043] font-semibold">No results</li>
                        ) : (
                          filteredLocations.map(loc => (
                            <li
                              key={loc.id}
                              className="px-4 py-2 cursor-pointer hover:bg-[#FFF3E0] text-[#FF7043] font-semibold flex items-center gap-2"
                              onClick={() => handleLocationSelect(loc)}
                            >
                              <span>{loc.icon}</span>
                              <span>{loc.name}</span>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="w-full mb-4" style={{ position: "relative" }}>
                  <MapContainer
                    center={selectedLocation.coords as [number, number]}
                    zoom={15}
                    style={{ height: "200px", width: "100%", borderRadius: "24px" }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {/* Show ping for target location */}
                    <Marker position={selectedLocation.coords as [number, number]}>
                      <Popup>
                        <span className="font-bold text-[#FF7043]">{selectedLocation.icon} {selectedLocation.name}</span>
                      </Popup>
                    </Marker>
                    {/* Show user location if available */}
                    <UserLocationMarker position={userLocation} />
                  </MapContainer>
                </div>
                <div className="flex justify-between w-full mb-4 text-[#FF7043] font-bold text-base">
                  <div><strong>235</strong><br />CALORIES</div>
                  <div><strong>2,850</strong><br />STEPS</div>
                  <div><strong>1.2</strong><br />Km</div>
                </div>
                <button
                  className="bg-[#FF7043] text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg transition hover:bg-[#F4511E] active:bg-[#FF7043]"
                  onClick={() => setStep(2)}
                  aria-label="Start Challenge"
                >
                  Start Challenge
                </button>
              </section>
            )}

            {step === 2 && !showLocationPrompt && (
              <section
                className="bg-[#FFA726] rounded-[32px] shadow-xl flex flex-col items-center text-center w-full h-full justify-center"
              >
                {/* Task Details from slider */}
                <div className="w-full flex justify-between items-center mb-4">
                  <button
                    className="bg-[#FFF3E0] text-[#FF7043] font-bold px-4 py-2 rounded-full shadow hover:bg-[#FFE0B2] transition"
                    onClick={() => setStep(1)}
                  >
                    ←
                  </button>
                  <span className="text-4xl">{TASKS[activeTaskIdx].icon}</span>
                </div>
                <h2 className="text-white font-extrabold text-2xl mb-2">{TASKS[activeTaskIdx].name}</h2>
                <p className="text-white text-lg font-semibold mb-4">
                  {TASKS[activeTaskIdx].description}<br />
                  <span className="text-[#FFF3E0] font-bold">
                    +{TASKS[activeTaskIdx].calories} CALORIES · {TASKS[activeTaskIdx].steps} STEPS
                  </span>
                  <br />
                  <span className="text-[#FF7043] font-bold">
                    Distance: {distanceKm.toFixed(2)} km
                  </span>
                  <br />
                  <span className="text-[#FF7043] font-bold">
                    Points for completion: {pointsForThisTask}
                  </span>
                  {distanceKm >= 10 && (
                    <div className="text-[#FF7043] text-sm mt-2">
                      Max points for distance capped at 10km.
                    </div>
                  )}
                </p>
                <div className="w-full flex justify-center mb-6">
                  <div className="w-44 h-20 bg-[#FFF3E0] rounded-xl flex items-center justify-center shadow text-2xl">
                    <span className="mr-2">{selectedLocation.icon}</span>
                    <span className="font-extrabold text-[#FF7043]">{selectedLocation.name}</span>
                  </div>
                </div>
                <button
                  className="bg-[#FF7043] text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg transition hover:bg-[#F4511E] active:bg-[#FF7043]"
                  onClick={() => setShowUpload(true)}
                  aria-label="Start Walk"
                >
                  Start Walk
                </button>
                {/* Upload Modal */}
                {showUpload && (
                  <div
                    className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
                  >
                    <div
                      className="bg-white rounded-2xl p-8 shadow-xl flex flex-col items-center"
                    >
                      <h3 className="text-[#FF7043] font-bold text-xl mb-4">Upload a photo at {selectedLocation.name}</h3>
                      {!uploaded ? (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            className="mb-4"
                            onChange={() => setUploaded(true)}
                          />
                          <button
                            className="bg-[#FF7043] text-white font-bold px-6 py-2 rounded-full shadow transition hover:bg-[#F4511E]"
                            onClick={() => setUploaded(true)}
                          >
                            Submit
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-green-600 font-bold mb-2">Photo uploaded! 🎉</span>
                          <button
                            className="bg-[#FF7043] text-white font-bold px-6 py-2 rounded-full shadow transition hover:bg-[#F4511E]"
                            onClick={() => {
                              setShowUpload(false);
                              setStep(3);
                              setUploaded(false);
                              setPoints(points + pointsForThisTask); // Award scaled points for upload
                            }}
                          >
                            Continue
                          </button>
                        </>
                      )}
                      <button
                        className="mt-4 text-[#FF7043] underline"
                        onClick={() => { setShowUpload(false); setUploaded(false); }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {step === 3 && !showLocationPrompt && (
              <section
                className="bg-[#5C53FF] rounded-[32px] shadow-xl flex flex-col items-center text-center w-full h-full justify-center"
              >
                <div className="w-full flex justify-between items-center mb-4">
                  <button
                    className="bg-[#FFF3E0] text-[#5C53FF] font-bold px-4 py-2 rounded-full shadow hover:bg-[#E3E0FF] transition"
                    onClick={() => setStep(2)}
                  >
                    ←
                  </button>
                  <span className="text-3xl">🎁</span>
                </div>
                <h2 className="text-white font-extrabold text-2xl mb-4">Rewards</h2>
                <div className="flex gap-2 mb-6 w-full justify-center">
                  {REWARD_TABS.map(tab => (
                    <button
                      key={tab}
                      className={`px-4 py-2 rounded-full font-bold text-base transition
                        ${tab === activeRewardTab
                          ? "bg-white text-[#5C53FF] shadow"
                          : "bg-[#5C53FF] text-white border border-white"}
                    `}
                      onClick={() => setActiveRewardTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  {displayedRewards.map(reward => (
                    <div key={reward.id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-[#5C53FF] font-bold">
                      <div className="text-4xl mb-2">{reward.img}</div>
                      <div className="text-lg mb-1">{reward.name}</div>
                      <div className="text-base mb-2 text-[#FFA726]">{reward.points} pts</div>
                      <button
                        className={`bg-[#FFA726] text-white font-bold px-4 py-2 rounded-full shadow transition hover:bg-[#FF7043] active:bg-[#FFA726] ${points < reward.points ? "opacity-50 cursor-not-allowed" : ""}`}
                        aria-label={`Claim ${reward.name}`}
                        disabled={points < reward.points}
                        onClick={() => {
                          if (points >= reward.points) setPoints(points - reward.points);
                        }}
                      >
                        Claim
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {step === 4 && !showLocationPrompt && (
              <section
                className="bg-white rounded-[32px] shadow-xl flex flex-col items-center text-center w-full h-full justify-center"
              >
                <h2 className="text-[#FF7043] font-extrabold text-2xl mb-4">Profile</h2>
                <p className="text-lg text-[#FF7043]">Profile details coming soon!</p>
                <div className="mt-4 bg-[#FFF3E0] rounded-xl px-4 py-2 text-[#FF7043] font-bold shadow">
                  Points: {points}
                </div>
                {userLocation && (
                  <div className="mt-2 text-[#FF7043] text-sm">
                    Your location: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                  </div>
                )}
                {cityInput && (
                  <div className="mt-2 text-[#FF7043] text-sm">
                    City: {cityInput}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </main>
      {/* Custom font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;900&display=swap"
        rel="stylesheet"
      />
      <style>{`
        body, .font-sans {
          font-family: 'Nunito', Arial, sans-serif;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadein {
          0% { opacity: 0; transform: translateY(-20px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .animate-fadein {
          animation: fadein 2s ease-in;
        }
        @media (max-width: 900px) {
          main > div {
            width: 98vw !important;
            min-height: 90vh !important;
            border-radius: 1.5rem !important;
            padding: 0 !important;
          }
          section {
            border-radius: 1.5rem !important;
            padding: 0.5rem !important;
          }
        }
        section {
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          border-radius: 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
"use client";

import React, { useState, Suspense, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import "leaflet/dist/leaflet.css";

// Types for better type safety
interface Location {
  id: string;
  name: string;
  coords: [number, number];
  category: 'restaurant' | 'cafe' | 'shop';
}

interface Reward {
  id: string;
  name: string;
  points: number;
  img: string;
  type: 'nearby' | 'healthy' | 'premium';
  description: string;
}

interface UserStats {
  calories: number;
  steps: number;
  distance: string;
}

// Constants
const SCREEN_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const BUTTON_VARIANTS = {
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 }
};

// Dynamically import react-leaflet components with enhanced loading states
const MapContainer = dynamic(
  () => import("react-leaflet").then(mod => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="map-loading-container">
        <div className="map-loading-spinner" />
        <span>Loading interactive map...</span>
      </div>
    )
  }
);

const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

// Sample data with enhanced structure
const LOCATIONS: Location[] = [
  { id: "1", name: "Artisan Pizza Co.", coords: [51.505, -0.09], category: "restaurant" },
  { id: "2", name: "Golden Donut House", coords: [51.51, -0.1], category: "cafe" },
  { id: "3", name: "Fresh Garden Salads", coords: [51.507, -0.08], category: "restaurant" },
  { id: "4", name: "Brew & Bean Cafe", coords: [51.503, -0.095], category: "cafe" },
  { id: "5", name: "Healthy Bites", coords: [51.506, -0.085], category: "restaurant" },
];

const REWARDS: Reward[] = [
  {
    id: "1",
    name: "Artisan Donut",
    points: 500,
    img: "🍩",
    type: "nearby",
    description: "Fresh glazed from Golden Donut House"
  },
  {
    id: "2",
    name: "Premium Iced Tea",
    points: 500,
    img: "🧋",
    type: "nearby",
    description: "Refreshing bubble tea with toppings"
  },
  {
    id: "3",
    name: "Power Salad Bowl",
    points: 700,
    img: "🥗",
    type: "healthy",
    description: "Nutrient-packed superfood salad"
  },
  {
    id: "4",
    name: "Limited Edition Tee",
    points: 1000,
    img: "👕",
    type: "premium",
    description: "Exclusive SnackNav merchandise"
  },
  {
    id: "5",
    name: "Protein Smoothie",
    points: 600,
    img: "🥤",
    type: "healthy",
    description: "Post-workout recovery blend"
  },
  {
    id: "6",
    name: "Gourmet Coffee",
    points: 400,
    img: "☕",
    type: "nearby",
    description: "Single-origin specialty brew"
  },
];

const REWARD_TABS = [
  { label: "All Rewards", value: "all" as const },
  { label: "Nearby", value: "nearby" as const },
  { label: "Healthy", value: "healthy" as const },
  { label: "Premium", value: "premium" as const },
] as const;

// Navigation links
const NAV_LINKS = [
  { label: "Home", step: 0 },
  { label: "Map", step: 1 },
  { label: "Challenge", step: 2 },
  { label: "Rewards", step: 3 },
];

// Breadcrumbs for each step
const BREADCRUMBS: { [key: number]: string[] } = {
  0: ["Home"],
  1: ["Home", "Map"],
  2: ["Home", "Challenge"],
  3: ["Home", "Rewards"],
};

export default function HomePage() {
  // State management with better organization
  const [currentStep, setCurrentStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLocations, setFilteredLocations] = useState<Location[]>(LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<Location>(LOCATIONS[0]);
  const [activeRewardTab, setActiveRewardTab] = useState<typeof REWARD_TABS[number]['value']>("all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userStats] = useState<UserStats>({ calories: 235, steps: 2850, distance: "1.2" });
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Memoized filtered rewards for performance
  const displayedRewards = useMemo(() => {
    return activeRewardTab === "all"
      ? REWARDS
      : REWARDS.filter(reward => reward.type === activeRewardTab);
  }, [activeRewardTab]);

  // Enhanced search handler with debouncing effect
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filtered = LOCATIONS.filter(location =>
      location.name.toLowerCase().includes(query.toLowerCase()) ||
      location.category.toLowerCase().includes(query.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));

    setFilteredLocations(filtered);
    setShowSuggestions(true);
  }, []);

  // Location selection handler
  const handleLocationSelect = useCallback((location: Location) => {
    setSelectedLocation(location);
    setSearchQuery(location.name);
    setShowSuggestions(false);
    searchInputRef.current?.blur();
  }, []);

  // Navigation handlers
  const navigateToStep = useCallback((step: number) => {
    setCurrentStep(step);
    setNavOpen(false);
  }, []);

  const goBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  // Auto-hide suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sticky nav shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Breadcrumbs
  const breadcrumbs = BREADCRUMBS[currentStep] || ["Home"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-yellow-200 flex flex-col font-nunito">
      {/* Sticky Navigation Bar */}
      <header
        className={`fixed top-0 left-0 w-full z-40 transition-shadow duration-300 bg-white/90 backdrop-blur
          ${scrolled ? "shadow-lg" : "shadow-none"}`}
        role="navigation"
        aria-label="Main Navigation"
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-2">
          {/* Logo */}
          <span className="font-extrabold text-orange-500 text-xl md:text-2xl tracking-wide">SnackNav</span>
          {/* Hamburger for mobile */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 bg-white rounded-lg border border-orange-100 shadow hover:shadow-md transition-all"
            aria-label="Open navigation"
            onClick={() => setNavOpen(!navOpen)}
          >
            <span className="w-6 h-1 bg-orange-400 rounded my-0.5 transition-all"></span>
            <span className="w-6 h-1 bg-orange-400 rounded my-0.5 transition-all"></span>
            <span className="w-6 h-1 bg-orange-400 rounded my-0.5 transition-all"></span>
          </button>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4">
            {NAV_LINKS.map(link => (
              <button
                key={link.label}
                className={`px-3 py-2 rounded-lg font-semibold transition-all duration-150
                  ${currentStep === link.step
                    ? "bg-orange-100 text-orange-600 underline underline-offset-4"
                    : "text-orange-700 hover:bg-orange-50 hover:text-orange-500 focus:bg-orange-200 focus:text-orange-700"}
                `}
                onClick={() => navigateToStep(link.step)}
                aria-current={currentStep === link.step ? "page" : undefined}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
        {/* Mobile nav overlay */}
        {navOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-50 flex items-start justify-end"
            onClick={() => setNavOpen(false)}
          >
            <nav
              className="mt-4 mr-4 bg-white rounded-xl shadow-lg p-6 min-w-[180px] flex flex-col gap-2"
              onClick={e => e.stopPropagation()}
              aria-label="Mobile Navigation"
            >
              {NAV_LINKS.map(link => (
                <button
                  key={link.label}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all duration-150 text-left
                    ${currentStep === link.step
                      ? "bg-orange-100 text-orange-600 underline underline-offset-4"
                      : "text-orange-700 hover:bg-orange-50 hover:text-orange-500 focus:bg-orange-200 focus:text-orange-700"}
                  `}
                  onClick={() => navigateToStep(link.step)}
                  aria-current={currentStep === link.step ? "page" : undefined}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Breadcrumbs */}
      <nav
        className="sticky top-14 z-30 w-full bg-transparent px-4 py-2 max-w-2xl mx-auto"
        aria-label="Breadcrumb"
      >
        <ol className="flex flex-wrap items-center gap-2 text-sm md:text-base font-semibold text-orange-600">
          {breadcrumbs.map((crumb, idx) => (
            <li key={crumb} className="flex items-center">
              <span
                className={`transition-all duration-150
                  ${idx === breadcrumbs.length - 1
                    ? "font-bold underline underline-offset-4 text-orange-700"
                    : "hover:text-orange-500 focus:text-orange-500"}
                `}
                aria-current={idx === breadcrumbs.length - 1 ? "page" : undefined}
                tabIndex={0}
              >
                {crumb}
              </span>
              {idx < breadcrumbs.length - 1 && (
                <span className="mx-2 text-orange-300">/</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-2 pt-24 pb-8">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <WelcomeScreen key="welcome" onStart={() => navigateToStep(1)} />
            )}

            {currentStep === 1 && (
              <MapScreen
                key="map"
                searchQuery={searchQuery}
                filteredLocations={filteredLocations}
                selectedLocation={selectedLocation}
                showSuggestions={showSuggestions}
                userStats={userStats}
                searchInputRef={searchInputRef}
                onSearchChange={handleSearchChange}
                onLocationSelect={handleLocationSelect}
                onBack={goBack}
                onNext={() => navigateToStep(2)}
                setShowSuggestions={setShowSuggestions}
              />
            )}

            {currentStep === 2 && (
              <ChallengeScreen
                key="challenge"
                selectedLocation={selectedLocation}
                onBack={goBack}
                onNext={() => navigateToStep(3)}
              />
            )}

            {currentStep === 3 && (
              <RewardsScreen
                key="rewards"
                activeTab={activeRewardTab}
                rewards={displayedRewards}
                onTabChange={setActiveRewardTab}
                onBack={goBack}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
      {/* Nunito font import */}
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;900&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .font-nunito {
          font-family: 'Nunito', Arial, sans-serif;
        }
      `}</style>
    </div>
  );
}

// Welcome Screen Component
function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.section 
      className="screen-base screen-welcome"
      variants={SCREEN_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.h1 
        className="primary-title"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: "backOut" }}
      >
        SNACKNAV
      </motion.h1>
      
      <motion.p 
        className="subtitle"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        Walk more.<br />
        Eat better.<br />
        Get rewarded.
      </motion.p>
      
      <motion.button
        className="primary-button"
        onClick={onStart}
        variants={BUTTON_VARIANTS}
        whileHover="hover"
        whileTap="tap"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        Get Started
      </motion.button>
    </motion.section>
  );
}

// Map Screen Component
function MapScreen({ 
  searchQuery, 
  filteredLocations, 
  selectedLocation, 
  showSuggestions, 
  userStats,
  searchInputRef,
  onSearchChange, 
  onLocationSelect, 
  onBack, 
  onNext,
  setShowSuggestions
}: {
  searchQuery: string;
  filteredLocations: Location[];
  selectedLocation: Location;
  showSuggestions: boolean;
  userStats: UserStats;
  searchInputRef: React.RefObject<HTMLInputElement>;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationSelect: (location: Location) => void;
  onBack: () => void;
  onNext: () => void;
  setShowSuggestions: (show: boolean) => void;
}) {
  return (
    <motion.section 
      className="screen-base screen-map"
      variants={SCREEN_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <div className="header-row">
        <motion.button 
          className="back-button" 
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back
        </motion.button>
      </div>

      <div className="map-container">
        <div className="search-wrapper">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={onSearchChange}
            className="search-input"
            onFocus={() => setShowSuggestions(true)}
            autoComplete="off"
          />
          
          <AnimatePresence>
            {showSuggestions && (
              <motion.div 
                className="suggestions-dropdown"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {filteredLocations.length === 0 ? (
                  <div className="suggestion-item">No locations found</div>
                ) : (
                  filteredLocations.map((location) => (
                    <motion.div
                      key={location.id}
                      className="suggestion-item"
                      onClick={() => onLocationSelect(location)}
                      whileHover={{ backgroundColor: "rgba(255, 167, 38, 0.1)" }}
                    >
                      {location.name}
                    </motion.div>
                  ))
                }
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Suspense fallback={<div className="map-loading-container"><div className="map-loading-spinner" /><span>Loading interactive map...</span></div>}>
          <MapContainer
            center={selectedLocation.coords}
            zoom={15}
            style={{ height: "200px", width: "100%", borderRadius: "16px" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={selectedLocation.coords}>
              <Popup>{selectedLocation.name}</Popup>
            </Marker>
          </MapContainer>
        </Suspense>
      </div>

      <motion.div 
        className="stats-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="stat-item">
          <span className="stat-value">{userStats.calories}</span>
          <span className="stat-label">Calories</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{userStats.steps.toLocaleString()}</span>
          <span className="stat-label">Steps</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{userStats.distance}</span>
          <span className="stat-label">Km</span>
        </div>
      </motion.div>

      <motion.button
        className="primary-button"
        onClick={onNext}
        variants={BUTTON_VARIANTS}
        whileHover="hover"
        whileTap="tap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Start Challenge
      </motion.button>
    </motion.section>
  );
}

// Challenge Screen Component
function ChallengeScreen({ 
  selectedLocation, 
  onBack, 
  onNext 
}: {
  selectedLocation: Location;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <motion.section 
      className="screen-base screen-challenge"
      variants={SCREEN_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <div className="header-row">
        <motion.button 
          className="back-button" 
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back
        </motion.button>
      </div>

      <motion.div 
        className="challenge-icon"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "backOut" }}
      >
        🍕
      </motion.div>

      <motion.h2 
        className="primary-title" 
        style={{ fontSize: "2.5rem", marginBottom: "16px" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        Pizza Powerwalk
      </motion.h2>

      <motion.p 
        className="subtitle"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        +220 CALORIES<br />
        1 Free Pizza Slice
      </motion.p>

      <motion.div 
        style={{
          width: "200px",
          height: "100px",
          background: "rgba(255, 255, 255, 0.2)",
          borderRadius: "20px",
          position: "relative",
          marginBottom: "40px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          fontWeight: "600"
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <motion.div
          style={{
            position: "absolute",
            left: "20px",
            top: "20px",
            width: "60px",
            height: "8px",
            background: "#FF6B6B",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            color: "white",
            fontWeight: "700"
          }}
          initial={{ width: 0 }}
          animate={{ width: "60px" }}
          transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
        >
          Route
        </motion.div>
        <motion.div
          style={{
            position: "absolute",
            right: "30px",
            bottom: "20px",
            fontSize: "24px"
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, duration: 0.5, ease: "backOut" }}
        >
          📍
        </motion.div>
        Route to {selectedLocation.name}
      </motion.div>

      <motion.button
        className="primary-button"
        onClick={onNext}
        variants={BUTTON_VARIANTS}
        whileHover="hover"
        whileTap="tap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        Start Walk
      </motion.button>
    </motion.section>
  );
}

// Rewards Screen Component
function RewardsScreen({ 
  activeTab, 
  rewards, 
  onTabChange, 
  onBack 
}: {
  activeTab: string;
  rewards: Reward[];
  onTabChange: (tab: any) => void;
  onBack: () => void;
}) {
  return (
    <motion.section 
      className="screen-base screen-rewards"
      variants={SCREEN_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <div className="header-row">
        <motion.button 
          className="back-button" 
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back
        </motion.button>
      </div>

      <motion.h2 
        className="primary-title"
        style={{ fontSize: "2.5rem", marginBottom: "24px" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Rewards
      </motion.h2>

      <motion.div 
        className="tabs-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {REWARD_TABS.map((tab, index) => (
          <motion.button
            key={tab.value}
            className={`tab-button ${activeTab === tab.value ? 'active' : ''}`}
            onClick={() => onTabChange(tab.value)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.label}
          </motion.button>
        ))}
      </motion.div>

      <motion.div 
        className="rewards-grid"
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <AnimatePresence mode="popLayout">
          {rewards.length === 0 ? (
            <motion.div 
              className="empty-state"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              No rewards found in this category.
            </motion.div>
          ) : (
            rewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                className="reward-card"
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.5,
                  layout: { duration: 0.3 }
                }}
                whileHover={{ y: -5 }}
              >
                <span className="reward-emoji">{reward.img}</span>
                <div className="reward-name">{reward.name}</div>
                <div className="reward-description">{reward.description}</div>
                <div className="reward-points">{reward.points} pts</div>
                <motion.button 
                  className="claim-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Add haptic feedback simulation
                    if (navigator.vibrate) {
                      navigator.vibrate(50);
                    }
                  }}
                >
                  Claim Reward
                </motion.button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
}
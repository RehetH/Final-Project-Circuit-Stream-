"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

export default function HomePage() {
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [filteredLocations, setFilteredLocations] = useState<Location[]>(LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<Location>(LOCATIONS[0]);
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Search handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setFilteredLocations(
      LOCATIONS.filter(loc =>
        loc.name.toLowerCase().includes(value.toLowerCase()) ||
        loc.category.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  // --- Layout ---
  return (
    <div className="min-h-screen bg-[#FFA726] flex flex-col font-sans">
      {/* Sticky Nav */}
      <header
        className={`fixed top-0 left-0 w-full z-40 bg-white transition-shadow duration-300 ${scrolled ? "shadow-lg" : ""}`}
        role="navigation"
        aria-label="Main Navigation"
      >
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
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
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-2 pt-24 pb-8">
        <div className="w-full max-w-lg">
          {/* Remove AnimatePresence/motion if framer-motion is not installed */}
          {step === 0 && (
            <section
              className="bg-[#FFA726] rounded-[32px] shadow-xl p-8 flex flex-col items-center text-center"
            >
              <h1 className="text-white font-extrabold text-4xl mb-4 tracking-tight">SNACKNAV</h1>
              <p className="text-white text-lg font-semibold mb-8 leading-relaxed">
                Walk more.<br />Eat better.<br />Get rewarded.
              </p>
              <button
                className="bg-[#FF7043] text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg transition hover:bg-[#F4511E] active:bg-[#FF7043]"
                onClick={() => setStep(1)}
                aria-label="Get Started"
              >
                Get Started
              </button>
            </section>
          )}

          {step === 1 && (
            <section
              className="bg-white rounded-[32px] shadow-xl p-8 flex flex-col items-center"
            >
              <div className="w-full flex justify-between items-center mb-4">
                <button
                  className="bg-[#FFF3E0] text-[#FF7043] font-bold px-4 py-2 rounded-full shadow hover:bg-[#FFE0B2] transition"
                  onClick={() => setStep(0)}
                >
                  ←
                </button>
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search for a location..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-2/3 px-4 py-2 rounded-full bg-[#FFF3E0] text-[#FF7043] font-bold shadow focus:outline-none focus:ring-2 focus:ring-[#FF7043] transition"
                  autoComplete="off"
                />
              </div>
              <div className="w-full mb-4">
                <MapContainer
                  center={selectedLocation.coords as [number, number]}
                  zoom={15}
                  style={{ height: "200px", width: "100%", borderRadius: "24px" }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {filteredLocations.map(loc => (
                    <Marker key={loc.id} position={loc.coords as [number, number]}>
                      <Popup>
                        <span className="font-bold">{loc.icon} {loc.name}</span>
                      </Popup>
                    </Marker>
                  ))}
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

          {step === 2 && (
            <section
              className="bg-[#FFA726] rounded-[32px] shadow-xl p-8 flex flex-col items-center text-center"
            >
              <div className="w-full flex justify-between items-center mb-4">
                <button
                  className="bg-[#FFF3E0] text-[#FF7043] font-bold px-4 py-2 rounded-full shadow hover:bg-[#FFE0B2] transition"
                  onClick={() => setStep(1)}
                >
                  ←
                </button>
                <span className="text-4xl">{selectedLocation.icon}</span>
              </div>
              <h2 className="text-white font-extrabold text-2xl mb-2">Pizza Powerwalk</h2>
              <p className="text-white text-lg font-semibold mb-4">
                +220 CALORIES<br />1 Free Pizza Slice
              </p>
              <div className="w-full flex justify-center mb-6">
                <div className="w-44 h-20 bg-[#FFF3E0] rounded-xl flex items-center justify-center shadow text-2xl">
                  <span className="mr-2">{selectedLocation.icon}</span>
                  <span>{selectedLocation.name}</span>
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
                          onClick={() => { setShowUpload(false); setStep(3); setUploaded(false); }}
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

          {step === 3 && (
            <section
              className="bg-[#5C53FF] rounded-[32px] shadow-xl p-8 flex flex-col items-center text-center"
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
                {["All", "Starbucks", "Target", "Domino's", "Chipotle"].map(tab => (
                  <button
                    key={tab}
                    className={`px-4 py-2 rounded-full font-bold text-base transition
                      ${tab === "All"
                        ? "bg-white text-[#5C53FF] shadow"
                        : "bg-[#5C53FF] text-white border border-white"}
                    `}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                {REWARDS.map(reward => (
                  <div key={reward.id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-[#5C53FF] font-bold">
                    <div className="text-4xl mb-2">{reward.img}</div>
                    <div className="text-lg mb-1">{reward.name}</div>
                    <div className="text-base mb-2 text-[#FFA726]">{reward.points} pts</div>
                    <button
                      className="bg-[#FFA726] text-white font-bold px-4 py-2 rounded-full shadow transition hover:bg-[#FF7043] active:bg-[#FFA726]"
                      aria-label={`Claim ${reward.name}`}
                    >
                      Claim
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {step === 4 && (
            <section
              className="bg-white rounded-[32px] shadow-xl p-8 flex flex-col items-center text-center"
            >
              <h2 className="text-[#FF7043] font-extrabold text-2xl mb-4">Profile</h2>
              <p className="text-lg text-[#FF7043]">Profile details coming soon!</p>
            </section>
          )}
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
        @media (max-width: 600px) {
          .max-w-lg { max-width: 100vw !important; }
          .rounded-[32px] { border-radius: 0.75rem !important; }
          .p-8 { padding: 1.25rem !important; }
        }
      `}</style>
    </div>
  );
}
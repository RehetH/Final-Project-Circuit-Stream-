"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
() => import("react-leaflet").then((mod) => mod.MapContainer),
{ ssr: false }
);
const TileLayer = dynamic(
() => import("react-leaflet").then((mod) => mod.TileLayer),
{ ssr: false }
);
const Marker = dynamic(
() => import("react-leaflet").then((mod) => mod.Marker),
{ ssr: false }
);
const Popup = dynamic(
() => import("react-leaflet").then((mod) => mod.Popup),
{ ssr: false }
);

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

interface GlobalLocation {
display_name: string;
lat: string;
lon: string;
type: string;
importance: number;
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

// Global location search suggestions (expanded list)
const GLOBAL_LOCATIONS = [
"Paris, France",
"Tokyo, Japan",
"Berlin, Germany",
"Barcelona, Spain",
"Amsterdam, Netherlands",
"Rome, Italy",
"Prague, Czech Republic",
"Vienna, Austria",
"Copenhagen, Denmark",
"Stockholm, Sweden",
"Oslo, Norway",
"Helsinki, Finland",
"Budapest, Hungary",
"Warsaw, Poland",
"Lisbon, Portugal",
"Madrid, Spain",
"Brussels, Belgium",
"Dublin, Ireland",
"Edinburgh, Scotland",
"Manchester, England",
"Birmingham, England",
"Liverpool, England",
"Glasgow, Scotland",
"Cardiff, Wales",
"Los Angeles, CA, USA",
"Chicago, IL, USA",
"Miami, FL, USA",
"Seattle, WA, USA",
"Denver, CO, USA",
"Austin, TX, USA",
"Portland, OR, USA",
"Boston, MA, USA",
"Washington, DC, USA",
"Vancouver, BC, Canada",
"Montreal, QC, Canada",
"Calgary, AB, Canada",
"Ottawa, ON, Canada",
"Melbourne, VIC, Australia",
"Brisbane, QLD, Australia",
"Perth, WA, Australia",
"Adelaide, SA, Australia",
"Auckland, New Zealand",
"Wellington, New Zealand",
"Singapore",
"Hong Kong",
"Seoul, South Korea",
"Bangkok, Thailand",
"Manila, Philippines",
"Jakarta, Indonesia",
"Kuala Lumpur, Malaysia",
"Mumbai, India",
"Delhi, India",
"Bangalore, India",
"Chennai, India",
"Kolkata, India",
"Dubai, UAE",
"Abu Dhabi, UAE",
"Doha, Qatar",
"Kuwait City, Kuwait",
"Riyadh, Saudi Arabia",
"Tel Aviv, Israel",
"Istanbul, Turkey",
"Athens, Greece",
"Cairo, Egypt",
"Cape Town, South Africa",
"Johannesburg, South Africa",
"Nairobi, Kenya",
"Lagos, Nigeria",
"Casablanca, Morocco",
"São Paulo, Brazil",
"Rio de Janeiro, Brazil",
"Buenos Aires, Argentina",
"Santiago, Chile",
"Lima, Peru",
"Bogotá, Colombia",
"Mexico City, Mexico",
"Guadalajara, Mexico",
"Monterrey, Mexico",
];

// Create a separate component for the map marker
function UserLocationMarker({ position }: { position: [number, number] | null }) {
useEffect(() => {
// No-op: placeholder for client-only logic if needed in the future
}, []);

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

// Search locations using Nominatim API
async function searchGlobalLocations(query: string): Promise<GlobalLocation[]> {
if (query.length < 3) return [];

try {
const response = await fetch(
`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
);
const data = await response.json();
return data.map((item: any) => ({
display_name: item.display_name,
lat: item.lat,
lon: item.lon,
type: item.type,
importance: item.importance || 0,
}));
} catch (error) {
console.error('Search error:', error);
// Fallback to local suggestions
return GLOBAL_LOCATIONS
.filter(loc => loc.toLowerCase().includes(query.toLowerCase()))
.slice(0, 5)
.map(loc => ({
display_name: loc,
lat: "0",
lon: "0",
type: "city",
importance: 0.5,
}));
}
}

export default function HomePage() {
const [step, setStep] = useState(0);
const [search, setSearch] = useState("");
const [filteredLocations, setFilteredLocations] = useState<Location[]>(LOCATIONS);
const [selectedLocation, setSelectedLocation] = useState<Location>(LOCATIONS[0]);
const [navOpen, setNavOpen] = useState(false);
const [scrolled] = useState(false);
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
const [isClient, setIsClient] = useState(false);

// Global search functionality
const [globalSearchResults, setGlobalSearchResults] = useState<GlobalLocation[]>([]);
const [isSearching, setIsSearching] = useState(false);

// Task slider
const [activeTaskIdx, setActiveTaskIdx] = useState(0);

// Animation states
const [buttonAnimations, setButtonAnimations] = useState<{[key: string]: boolean}>({});

const searchRef = useRef<HTMLInputElement>(null);

// Ensure we're on the client side
useEffect(() => {
setIsClient(true);
}, []);

// Trigger button animation
const triggerAnimation = (buttonId: string) => {
setButtonAnimations(prev => ({ ...prev, [buttonId]: true }));
setTimeout(() => {
setButtonAnimations(prev => ({ ...prev, [buttonId]: false }));
}, 600);
};

// Enhanced search handler with global search
const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
const value = e.target.value;
setSearch(value);
setShowSuggestions(true);

// First filter local locations
const localFiltered = LOCATIONS.filter(loc =>
loc.name.toLowerCase().includes(value.toLowerCase()) ||
loc.category.toLowerCase().includes(value.toLowerCase())
);
setFilteredLocations(localFiltered);

// If query is long enough, search globally
if (value.length >= 3) {
setIsSearching(true);
try {
const globalResults = await searchGlobalLocations(value);
setGlobalSearchResults(globalResults);
} catch (error) {
console.error('Search failed:', error);
} finally {
setIsSearching(false);
}
} else {
setGlobalSearchResults([]);
}
};

// Select location from suggestions
const handleLocationSelect = (loc: Location) => {
triggerAnimation('location-select');
setSelectedLocation(loc);
setSearch(loc.name);
setShowSuggestions(false);
};

// Handle global location selection
const handleGlobalLocationSelect = async (globalLoc: GlobalLocation) => {
triggerAnimation('global-select');
const lat = parseFloat(globalLoc.lat);
const lon = parseFloat(globalLoc.lon);

// Update user location to the selected global location
setUserLocation([lat, lon]);
setSearch(globalLoc.display_name);
setShowSuggestions(false);
setShowLocationPrompt(false);

// Generate new random locations around this global location
const newLocations = generateRandomLocations([lat, lon]);
setFilteredLocations(newLocations);
if (newLocations.length > 0) {
setSelectedLocation(newLocations[0]);
}
};

// Generate random locations around user's position
const generateRandomLocations = (userPos: [number, number]): Location[] => {
const baseLocations = [
{ name: "Starbucks", category: "cafe", icon: "☕" },
{ name: "Target", category: "shop", icon: "🎯" },
{ name: "Domino's Pizza", category: "restaurant", icon: "🍕" },
{ name: "Chipotle", category: "restaurant", icon: "🌯" },
{ name: "Local Park", category: "park", icon: "🌳" },
{ name: "McDonald's", category: "restaurant", icon: "🍟" },
{ name: "Subway", category: "restaurant", icon: "🥪" },
{ name: "CVS Pharmacy", category: "pharmacy", icon: "💊" },
{ name: "Best Buy", category: "electronics", icon: "📱" },
{ name: "Whole Foods", category: "grocery", icon: "🥬" },
];

return baseLocations.map((loc, idx) => {
// Generate random angle and distance (max 10km)
const angle = Math.random() * 2 * Math.PI;
const distance = Math.random() * 10; // 0-10 km
const kmToDegree = 1 / 111; // Rough conversion
const deltaLat = (distance * Math.cos(angle)) * kmToDegree;
const deltaLon = (distance * Math.sin(angle)) * kmToDegree / Math.cos(userPos[0] * Math.PI / 180);

return {
id: (idx + 1).toString(),
name: loc.name,
coords: [userPos[0] + deltaLat, userPos[1] + deltaLon] as [number, number],
category: loc.category,
icon: loc.icon,
};
});
};

// Hide suggestions on outside click - only on client side
useEffect(() => {
if (!isClient) return;

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
}, [isClient]);

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
triggerAnimation('city-select');
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

// Geolocation API - only on client side
const handleShareLocation = () => {
if (!isClient) return;
triggerAnimation('share-location');

if (navigator && navigator.geolocation) {
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
filteredLocations.forEach(loc => {
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

// Don't render map until client side
const renderMap = () => {
if (!isClient) {
return (
<div
className="bg-gray-200 rounded-xl flex items-center justify-center text-gray-500"
style={{ height: "200px", width: "100%" }}
>
Loading map...
</div>
);
}

return (
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
);
};

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
className={`flex items-center gap-1 px-3 py-2 rounded-full font-bold text-base transition-all duration-300 transform hover:scale-105 active:scale-95
${step === link.step
? "bg-[#FF7043] text-white shadow-lg animate-pulse"
: "text-[#FF7043] hover:bg-[#FFF3E0] hover:text-[#FF7043] focus:bg-[#FFE0B2]"}
${buttonAnimations[`nav-${link.step}`] ? 'animate-bounce scale-110' : ''}
`}
onClick={() => {
triggerAnimation(`nav-${link.step}`);
setStep(link.step);
}}
aria-current={step === link.step ? "page" : undefined}
>
<span className="animate-pulse">{link.icon}</span>
<span>{link.label}</span>
</button>
))}
</nav>
{/* Hamburger */}
<button
className={`md:hidden flex flex-col justify-center items-center w-10 h-10 bg-[#FFF3E0] rounded-full border border-[#FF7043] shadow transition-all duration-300 hover:scale-110 active:scale-90 ${buttonAnimations['hamburger'] ? 'animate-spin' : ''}`}
aria-label="Open navigation"
onClick={() => {
triggerAnimation('hamburger');
setNavOpen(!navOpen);
}}
>
<span className="w-6 h-1 bg-[#FF7043] rounded my-0.5 transition-transform duration-300"></span>
<span className="w-6 h-1 bg-[#FF7043] rounded my-0.5 transition-transform duration-300"></span>
<span className="w-6 h-1 bg-[#FF7043] rounded my-0.5 transition-transform duration-300"></span>
</button>
</div>
{/* Mobile nav */}
{navOpen && (
<div
className="fixed inset-0 bg-black/30 z-50 flex items-start justify-end animate-fadeIn"
onClick={() => setNavOpen(false)}
>
<nav
className="mt-4 mr-4 bg-white rounded-2xl shadow-lg p-6 min-w-[180px] flex flex-col gap-2 animate-slideInRight"
onClick={e => e.stopPropagation()}
aria-label="Mobile Navigation"
>
{NAV_LINKS.map(link => (
<button
key={link.label}
className={`flex items-center gap-2 px-3 py-2 rounded-full font-bold text-base transition-all duration-300 transform hover:scale-105 active:scale-95
${step === link.step
? "bg-[#FF7043] text-white shadow animate-pulse"
: "text-[#FF7043] hover:bg-[#FFF3E0] hover:text-[#FF7043] focus:bg-[#FFE0B2]"}
`}
onClick={() => { 
triggerAnimation(`mobile-nav-${link.step}`);
setStep(link.step); 
setNavOpen(false); 
}}
aria-current={step === link.step ? "page" : undefined}
>
<span>{link.icon}</span>
<span>{link.label}</span>
</button>
))}
</nav>
</div>
)}
{/* Task slider - only show when location is set */}
{locationIsSet && (
<div className="sticky top-[64px] z-30 bg-[#1a140f] border-b border-[#FFE0B2]">
<div className="overflow-x-auto flex gap-2 px-8 py-2 scrollbar-hide">
{TASKS.map((task, idx) => (
<button
key={task.id}
className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-base transition-all duration-300 whitespace-nowrap transform hover:scale-105 active:scale-95
${activeTaskIdx === idx
? "bg-[#FF7043] text-white shadow-lg animate-pulse"
: "bg-[#FFF3E0] text-[#FF7043] hover:bg-[#FFE0B2]"}
${buttonAnimations[`task-${idx}`] ? 'animate-bounce scale-110' : ''}
`}
onClick={() => {
triggerAnimation(`task-${idx}`);
setActiveTaskIdx(idx);
const loc = filteredLocations.find(l => l.id === task.locationId) || filteredLocations[0];
if (loc) setSelectedLocation(loc);
if (locationIsSet) setStep(2);
}}
aria-current={activeTaskIdx === idx ? "true" : undefined}
>
<span className="animate-pulse">{task.icon}</span>
<span>{task.name}</span>
</button>
))}
</div>
</div>
)}
</header>

{/* Enhanced Map Search Bar - Sticky positioned separately for Map step */}
{step === 1 && !showLocationPrompt && (
<div className="fixed top-[124px] left-0 w-full z-35 bg-[#2D2D2D] border-b border-[#FFE0B2] py-4">
<div className="max-w-screen-2xl mx-auto px-8">
<div className="flex justify-between items-center">
<button
className={`bg-[#FF7043] text-white font-bold px-4 py-2 rounded-full shadow hover:bg-[#F4511E] transition-all duration-300 transform hover:scale-105 active:scale-95 ${buttonAnimations['back-map'] ? 'animate-bounce' : ''}`}
onClick={() => {
triggerAnimation('back-map');
setStep(0);
}}
>
← Back
</button>
<div className="flex-1 max-w-md mx-4 relative">
<input
ref={searchRef}
type="text"
placeholder="Search locations globally..."
value={search}
onChange={handleSearchChange}
className="w-full px-4 py-3 rounded-full bg-white text-[#1a140f] font-bold shadow-lg focus:outline-none focus:ring-2 focus:ring-[#FF7043] transition-all duration-300 border-2 border-[#FFE0B2] focus:scale-105"
autoComplete="off"
onFocus={() => setShowSuggestions(true)}
/>
{isSearching && (
<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FF7043]"></div>
</div>
)}
{showSuggestions && (search.length > 0 || globalSearchResults.length > 0) && (
<ul className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl z-50 border-2 border-[#FFE0B2] max-h-48 overflow-y-auto">
{/* Local locations first */}
{filteredLocations.length > 0 && (
<>
<li className="px-4 py-2 bg-[#FFF3E0] text-[#FF7043] font-bold text-sm uppercase tracking-wide">
Local Places
</li>
{filteredLocations.map(loc => (
<li
key={loc.id}
className={`px-4 py-3 cursor-pointer hover:bg-[#FFF3E0] text-[#1a140f] font-semibold flex items-center gap-2 border-b border-[#FFE0B2] transition-all duration-200 hover:scale-[1.02] ${buttonAnimations['location-select'] ? 'bg-[#FFE0B2] animate-pulse' : ''}`}
onClick={() => handleLocationSelect(loc)}
>
<span className="animate-bounce">{loc.icon}</span>
<span>{loc.name}</span>
</li>
))}
</>
)}
{/* Global search results */}
{globalSearchResults.length > 0 && (
<>
<li className="px-4 py-2 bg-[#E3F2FD] text-[#1976D2] font-bold text-sm uppercase tracking-wide">
Global Locations
</li>
{globalSearchResults.map((loc, idx) => (
<li
key={idx}
className={`px-4 py-3 cursor-pointer hover:bg-[#E3F2FD] text-[#1a140f] font-semibold flex items-center gap-2 border-b border-[#FFE0B2] last:border-b-0 transition-all duration-200 hover:scale-[1.02] ${buttonAnimations['global-select'] ? 'bg-[#E3F2FD] animate-pulse' : ''}`}
onClick={() => handleGlobalLocationSelect(loc)}
>
<span className="animate-pulse">🌍</span>
<div className="flex flex-col">
<span className="text-sm">{loc.display_name}</span>
<span className="text-xs text-gray-500">{loc.type}</span>
</div>
</li>
))}
</>
)}
{filteredLocations.length === 0 && globalSearchResults.length === 0 && search.length > 0 && !isSearching && (
<li className="px-4 py-3 text-[#666] font-semibold">No results found</li>
)}
</ul>
)}
</div>
<div className="w-16"></div> {/* Spacer for symmetry */}
</div>
</div>
</div>
)}

{/* Main Content */}
<main className={`flex-1 flex items-center justify-center px-2 ${step === 1 && !showLocationPrompt ? 'pt-44' : 'pt-32'} pb-8 relative z-10`}>
<div
className="shadow-2xl flex flex-col items-center justify-center animate-fadeIn"
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
<div className={`bg-[#1a140f] rounded-full px-4 py-2 shadow-lg font-bold text-[#FFD700] flex items-center gap-2 border-2 border-[#FFD700] transition-all duration-300 ${buttonAnimations['points'] ? 'animate-bounce scale-110' : ''}`}>
<span className="animate-pulse">⭐</span>
<span>{points} pts</span>
</div>
</div>
{/* Main UI Content */}
<div className="w-full h-full flex flex-col items-center justify-center px-0 pb-0">
{/* Location Prompt */}
{showLocationPrompt && (
<section className="bg-white/95 rounded-[32px] shadow-xl flex flex-col items-center text-center mb-4 w-full h-full justify-center border-2 border-[#FFE0B2] animate-slideInUp">
<h2 className="text-[#1a140f] font-extrabold text-2xl mb-2 animate-fadeIn">Share your location</h2>
<p className="text-[#666] mb-4 animate-fadeIn">To get started, share your location or enter your city/state/country.</p>
<button
className={`bg-[#FF7043] text-white font-bold px-6 py-3 rounded-full shadow-lg mb-4 hover:bg-[#F4511E] transition-all duration-300 transform hover:scale-105 active:scale-95 ${buttonAnimations['share-location'] ? 'animate-bounce scale-110' : ''}`}
onClick={handleShareLocation}
>
<span className="animate-pulse mr-2">📍</span>
Share My Location
</button>
<div className="w-full max-w-xs mb-2 relative">
<input
type="text"
value={cityInput}
onChange={handleCityInput}
placeholder="Enter city, state, country"
className="w-full px-4 py-3 rounded-full bg-[#F5F5F5] text-[#1a140f] font-bold shadow focus:outline-none focus:ring-2 focus:ring-[#FF7043] transition-all duration-300 border-2 border-[#FFE0B2] focus:scale-105"
autoComplete="off"
/>
{cityInput.length > 0 && (
<ul className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg z-10 border-2 border-[#FFE0B2] animate-slideInUp">
{citySuggestions.length === 0 ? (
<li className="px-4 py-2 text-[#666] font-semibold">No results</li>
) : (
citySuggestions.map(s => (
<li
key={s}
className={`px-4 py-2 cursor-pointer hover:bg-[#FFF3E0] text-[#1a140f] font-semibold transition-all duration-200 hover:scale-[1.02] ${buttonAnimations['city-select'] ? 'bg-[#FFF3E0] animate-pulse' : ''}`}
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
className="bg-[#FF7043] rounded-[32px] shadow-xl flex flex-col items-center text-center w-full h-full justify-center border-2 border-[#FFD700] animate-slideInUp"
>
<h1 className="text-white font-extrabold text-4xl mb-4 tracking-tight animate-pulse">SNACKNAV</h1>
<p className="text-white text-lg font-semibold mb-8 leading-relaxed animate-fadeIn">
Walk more.<br />Eat better.<br />Get rewarded.
</p>
<button
className={`bg-[#1a140f] text-[#FFD700] font-bold text-lg px-8 py-4 rounded-full shadow-lg transition-all duration-300 hover:bg-[#2D2D2D] active:bg-[#1a140f] border-2 border-[#FFD700] transform hover:scale-105 active:scale-95 ${buttonAnimations['get-started'] ? 'animate-bounce scale-110' : ''}`}
onClick={() => {
if (locationIsSet) {
triggerAnimation('get-started');
setStep(1);
}
}}
aria-label="Get Started"
disabled={!locationIsSet}
style={!locationIsSet ? { opacity: 0.5, cursor: "not-allowed" } : {}}
>
<span className="animate-pulse mr-2">🚀</span>
Get Started
</button>
{!locationIsSet && (
<div className="mt-2 text-white text-sm font-semibold animate-pulse">
Please share your location or enter your city to continue.
</div>
)}
</section>
)}

{step === 1 && !showLocationPrompt && (
<section
className="bg-white rounded-[32px] shadow-xl flex flex-col items-center w-full h-full justify-center border-2 border-[#FFE0B2] animate-slideInUp"
>
<div className="w-full mb-6" style={{ position: "relative" }}>
{renderMap()}
</div>
<div className="flex justify-between w-full mb-4 text-[#1a140f] font-bold text-base px-8">
<div className="text-center bg-[#FFF3E0] px-4 py-2 rounded-xl border-2 border-[#FFE0B2] transition-all duration-300 hover:scale-105 animate-fadeIn">
<strong className="animate-pulse">235</strong><br />
<span className="text-sm">CALORIES</span>
</div>
<div className="text-center bg-[#FFF3E0] px-4 py-2 rounded-xl border-2 border-[#FFE0B2] transition-all duration-300 hover:scale-105 animate-fadeIn">
<strong className="animate-pulse">2,850</strong><br />
<span className="text-sm">STEPS</span>
</div>
<div className="text-center bg-[#FFF3E0] px-4 py-2 rounded-xl border-2 border-[#FFE0B2] transition-all duration-300 hover:scale-105 animate-fadeIn">
<strong className="animate-pulse">1.2</strong><br />
<span className="text-sm">Km</span>
</div>
</div>
<button
className={`bg-[#FF7043] text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg transition-all duration-300 hover:bg-[#F4511E] active:bg-[#FF7043] transform hover:scale-105 active:scale-95 ${buttonAnimations['start-challenge'] ? 'animate-bounce scale-110' : ''}`}
onClick={() => {
triggerAnimation('start-challenge');
setStep(2);
}}
aria-label="Start Challenge"
>
<span className="animate-pulse mr-2">🎯</span>
Start Challenge
</button>
</section>
)}

{step === 2 && !showLocationPrompt && (
<section
className="bg-[#FF7043] rounded-[32px] shadow-xl flex flex-col items-center text-center w-full h-full justify-center border-2 border-[#FFD700] animate-slideInUp"
>
{/* Task Details from slider */}
<div className="w-full flex justify-between items-center mb-4 px-8">
<button
className={`bg-[#1a140f] text-[#FFD700] font-bold px-4 py-2 rounded-full shadow hover:bg-[#2D2D2D] transition-all duration-300 border-2 border-[#FFD700] transform hover:scale-105 active:scale-95 ${buttonAnimations['back-challenge'] ? 'animate-bounce' : ''}`}
onClick={() => {
triggerAnimation('back-challenge');
setStep(1);
}}
>
← Back
</button>
<span className="text-4xl animate-bounce">{TASKS[activeTaskIdx].icon}</span>
<div className="w-16"></div> {/* Spacer for symmetry */}
</div>
<h2 className="text-white font-extrabold text-2xl mb-2 animate-pulse">{TASKS[activeTaskIdx].name}</h2>
<p className="text-white text-lg font-semibold mb-4 px-4 animate-fadeIn">
{TASKS[activeTaskIdx].description}<br />
<span className="text-[#FFF3E0] font-bold animate-pulse">
+{TASKS[activeTaskIdx].calories} CALORIES · {TASKS[activeTaskIdx].steps} STEPS
</span>
<br />
<span className="text-[#1a140f] font-bold bg-[#FFD700] px-2 py-1 rounded-full text-sm animate-bounce">
Distance: {distanceKm.toFixed(2)} km
</span>
<br />
<span className="text-[#1a140f] font-bold bg-[#FFD700] px-2 py-1 rounded-full text-sm mt-1 inline-block animate-pulse">
Points for completion: {pointsForThisTask}
</span>
{distanceKm >= 10 && (
<div className="text-[#FFF3E0] text-sm mt-2 animate-pulse">
Max points for distance capped at 10km.
</div>
)}
</p>
<div className="w-full flex justify-center mb-6">
<div className="w-44 h-20 bg-white rounded-xl flex items-center justify-center shadow text-2xl border-2 border-[#FFE0B2] transition-all duration-300 hover:scale-105 animate-fadeIn">
<span className="mr-2 animate-bounce">{selectedLocation.icon}</span>
<span className="font-extrabold text-[#1a140f]">{selectedLocation.name}</span>
</div>
</div>
<button
className={`bg-[#1a140f] text-[#FFD700] font-bold text-lg px-8 py-4 rounded-full shadow-lg transition-all duration-300 hover:bg-[#2D2D2D] active:bg-[#1a140f] border-2 border-[#FFD700] transform hover:scale-105 active:scale-95 ${buttonAnimations['start-walk'] ? 'animate-bounce scale-110' : ''}`}
onClick={() => {
triggerAnimation('start-walk');
setShowUpload(true);
}}
aria-label="Start Walk"
>
<span className="animate-pulse mr-2">🚶‍♂️</span>
Start Walk
</button>
{/* Upload Modal */}
{showUpload && (
<div
className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-fadeIn"
>
<div
className="bg-white rounded-2xl p-8 shadow-xl flex flex-col items-center border-2 border-[#FFE0B2] animate-slideInUp transform"
>
<h3 className="text-[#1a140f] font-bold text-xl mb-4 animate-fadeIn">Upload a photo at {selectedLocation.name}</h3>
{!uploaded ? (
<>
<input
type="file"
accept="image/*"
className="mb-4 text-[#1a140f] transition-all duration-300 hover:scale-105"
onChange={() => {
triggerAnimation('upload-photo');
setUploaded(true);
}}
/>
<button
className={`bg-[#FF7043] text-white font-bold px-6 py-2 rounded-full shadow transition-all duration-300 hover:bg-[#F4511E] transform hover:scale-105 active:scale-95 ${buttonAnimations['upload-photo'] ? 'animate-bounce' : ''}`}
onClick={() => {
triggerAnimation('upload-photo');
setUploaded(true);
}}
>
<span className="animate-pulse mr-2">📸</span>
Submit
</button>
</>
) : (
<>
<span className="text-green-600 font-bold mb-2 animate-bounce text-2xl">Photo uploaded! 🎉</span>
<button
className={`bg-[#FF7043] text-white font-bold px-6 py-2 rounded-full shadow transition-all duration-300 hover:bg-[#F4511E] transform hover:scale-105 active:scale-95 ${buttonAnimations['continue-upload'] ? 'animate-bounce' : ''}`}
onClick={() => {
triggerAnimation('continue-upload');
triggerAnimation('points');
setShowUpload(false);
setStep(3);
setUploaded(false);
setPoints(points + pointsForThisTask); // Award scaled points for upload
}}
>
<span className="animate-pulse mr-2">✨</span>
Continue
</button>
</>
)}
<button
className="mt-4 text-[#FF7043] underline hover:text-[#F4511E] transition-all duration-300 hover:scale-105"
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
className="bg-[#5C53FF] rounded-[32px] shadow-xl flex flex-col items-center text-center w-full h-full justify-center border-2 border-[#FFD700] animate-slideInUp"
>
<div className="w-full flex justify-between items-center mb-4 px-8">
<button
className={`bg-[#FFD700] text-[#1a140f] font-bold px-4 py-2 rounded-full shadow hover:bg-[#FFB300] transition-all duration-300 transform hover:scale-105 active:scale-95 ${buttonAnimations['back-rewards'] ? 'animate-bounce' : ''}`}
onClick={() => {
triggerAnimation('back-rewards');
setStep(2);
}}
>
← Back
</button>
<span className="text-3xl animate-bounce">🎁</span>
<div className="w-16"></div> {/* Spacer for symmetry */}
</div>
<h2 className="text-white font-extrabold text-2xl mb-4 animate-pulse">Rewards</h2>
<div className="flex gap-2 mb-6 w-full justify-center flex-wrap px-4">
{REWARD_TABS.map(tab => (
<button
key={tab}
className={`px-4 py-2 rounded-full font-bold text-base transition-all duration-300 transform hover:scale-105 active:scale-95
${tab === activeRewardTab
? "bg-[#FFD700] text-[#1a140f] shadow animate-pulse"
: "bg-[#1a140f] text-[#FFD700] border-2 border-[#FFD700]"}
${buttonAnimations[`reward-tab-${tab}`] ? 'animate-bounce scale-110' : ''}
`}
onClick={() => {
triggerAnimation(`reward-tab-${tab}`);
setActiveRewardTab(tab);
}}
>
{tab}
</button>
))}
</div>
<div className="grid grid-cols-2 gap-4 w-full px-8">
{displayedRewards.map(reward => (
<div key={reward.id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-[#1a140f] font-bold border-2 border-[#FFE0B2] transition-all duration-300 hover:scale-105 animate-fadeIn">
<div className="text-4xl mb-2 animate-bounce">{reward.img}</div>
<div className="text-lg mb-1">{reward.name}</div>
<div className="text-base mb-2 text-[#FF7043] font-extrabold animate-pulse">{reward.points} pts</div>
<button
className={`bg-[#FF7043] text-white font-bold px-4 py-2 rounded-full shadow transition-all duration-300 hover:bg-[#F4511E] active:bg-[#FF7043] transform hover:scale-105 active:scale-95 ${points < reward.points ? "opacity-50 cursor-not-allowed" : ""} ${buttonAnimations[`claim-${reward.id}`] ? 'animate-bounce scale-110' : ''}`}
aria-label={`Claim ${reward.name}`}
disabled={points < reward.points}
onClick={() => {
if (points >= reward.points) {
triggerAnimation(`claim-${reward.id}`);
triggerAnimation('points');
setPoints(points - reward.points);
}
}}
>
<span className="animate-pulse mr-1">🎉</span>
Claim
</button>
</div>
))}
</div>
</section>
)}

{step === 4 && !showLocationPrompt && (
<section
className="bg-white rounded-[32px] shadow-xl flex flex-col items-center text-center w-full h-full justify-center border-2 border-[#FFE0B2] animate-slideInUp"
>
<h2 className="text-[#1a140f] font-extrabold text-2xl mb-4 animate-pulse">Profile</h2>
<p className="text-lg text-[#666] mb-4 animate-fadeIn">Profile details coming soon!</p>
<div className="mt-4 bg-[#FF7043] rounded-xl px-4 py-2 text-white font-bold shadow border-2 border-[#FFD700] animate-bounce">
<span className="animate-pulse mr-2">⭐</span>
Points: {points}
</div>
{userLocation && (
<div className="mt-2 text-[#666] text-sm bg-[#F5F5F5] px-3 py-2 rounded-full animate-fadeIn">
Your location: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
</div>
)}
{cityInput && (
<div className="mt-2 text-[#666] text-sm bg-[#F5F5F5] px-3 py-2 rounded-full animate-fadeIn">
City: {cityInput}
</div>
)}
</section>
)}
</div>
</div>
</main>

<style>{`
body, .font-sans {
font-family: 'Nunito', Arial, sans-serif;
}
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

/* Enhanced Animations */
@keyframes fadeIn {
0% { opacity: 0; transform: translateY(-20px); }
100% { opacity: 1; transform: translateY(0); }
}

@keyframes slideInUp {
0% { opacity: 0; transform: translateY(50px); }
100% { opacity: 1; transform: translateY(0); }
}

@keyframes slideInRight {
0% { opacity: 0; transform: translateX(50px); }
100% { opacity: 1; transform: translateX(0); }
}

@keyframes slideInLeft {
0% { opacity: 0; transform: translateX(-50px); }
100% { opacity: 1; transform: translateX(0); }
}

@keyframes bounceIn {
0% { opacity: 0; transform: scale(0.3); }
50% { opacity: 1; transform: scale(1.1); }
100% { opacity: 1; transform: scale(1); }
}

@keyframes pulseGlow {
0% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
}

@keyframes wiggle {
0%, 7% { transform: rotateZ(0); }
15% { transform: rotateZ(-15deg); }
20% { transform: rotateZ(10deg); }
25% { transform: rotateZ(-10deg); }
30% { transform: rotateZ(6deg); }
35% { transform: rotateZ(-4deg); }
40%, 100% { transform: rotateZ(0); }
}

.animate-fadein {
animation: fadeIn 2s ease-in;
}

.animate-fadeIn {
animation: fadeIn 0.6s ease-out;
}

.animate-slideInUp {
animation: slideInUp 0.6s ease-out;
}

.animate-slideInRight {
animation: slideInRight 0.4s ease-out;
}

.animate-slideInLeft {
animation: slideInLeft 0.4s ease-out;
}

.animate-bounceIn {
animation: bounceIn 0.6s ease-out;
}

.animate-pulseGlow {
animation: pulseGlow 2s ease-in-out infinite;
}

.animate-wiggle {
animation: wiggle 0.6s ease-in-out;
}

/* Hover effects */
.hover-lift {
transition: all 0.3s ease;
}

.hover-lift:hover {
transform: translateY(-2px);
box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Button press effect */
.btn-press:active {
transform: scale(0.95);
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
export type PresenceRegion = "India" | "Middle East" | "Asia Pacific" | "Europe" | "Africa" | "Americas";

export interface PresenceCity {
  name: string;
  country: string;
  region: PresenceRegion;
  latitude: number;
  longitude: number;
}

/** Order in which regions are listed on the home page. */
export const PRESENCE_REGIONS: PresenceRegion[] = ["India", "Middle East", "Asia Pacific", "Europe", "Africa", "Americas"];

// Sample cities where learners join from (online classes). Edit this list to match
// real registrations: each city appears on the world map and in the city listing.
export const PRESENCE_CITIES: PresenceCity[] = [
  // India
  { name: "New Delhi", country: "India", region: "India", latitude: 28.6139, longitude: 77.209 },
  { name: "Mumbai", country: "India", region: "India", latitude: 19.076, longitude: 72.8777 },
  { name: "Bengaluru", country: "India", region: "India", latitude: 12.9716, longitude: 77.5946 },
  { name: "Hyderabad", country: "India", region: "India", latitude: 17.385, longitude: 78.4867 },
  { name: "Kolkata", country: "India", region: "India", latitude: 22.5726, longitude: 88.3639 },
  { name: "Guwahati", country: "India", region: "India", latitude: 26.1445, longitude: 91.7362 },

  // Middle East
  { name: "Dubai", country: "UAE", region: "Middle East", latitude: 25.2048, longitude: 55.2708 },
  { name: "Abu Dhabi", country: "UAE", region: "Middle East", latitude: 24.4539, longitude: 54.3773 },
  { name: "Doha", country: "Qatar", region: "Middle East", latitude: 25.2854, longitude: 51.531 },
  { name: "Riyadh", country: "Saudi Arabia", region: "Middle East", latitude: 24.7136, longitude: 46.6753 },
  { name: "Muscat", country: "Oman", region: "Middle East", latitude: 23.588, longitude: 58.3829 },
  { name: "Kuwait City", country: "Kuwait", region: "Middle East", latitude: 29.3759, longitude: 47.9774 },

  // Asia Pacific
  { name: "Singapore", country: "Singapore", region: "Asia Pacific", latitude: 1.3521, longitude: 103.8198 },
  { name: "Kuala Lumpur", country: "Malaysia", region: "Asia Pacific", latitude: 3.139, longitude: 101.6869 },
  { name: "Hong Kong", country: "Hong Kong", region: "Asia Pacific", latitude: 22.3193, longitude: 114.1694 },
  { name: "Tokyo", country: "Japan", region: "Asia Pacific", latitude: 35.6762, longitude: 139.6503 },
  { name: "Sydney", country: "Australia", region: "Asia Pacific", latitude: -33.8688, longitude: 151.2093 },
  { name: "Auckland", country: "New Zealand", region: "Asia Pacific", latitude: -36.8485, longitude: 174.7633 },

  // Europe
  { name: "London", country: "United Kingdom", region: "Europe", latitude: 51.5072, longitude: -0.1276 },
  { name: "Paris", country: "France", region: "Europe", latitude: 48.8566, longitude: 2.3522 },
  { name: "Berlin", country: "Germany", region: "Europe", latitude: 52.52, longitude: 13.405 },
  { name: "Amsterdam", country: "Netherlands", region: "Europe", latitude: 52.3676, longitude: 4.9041 },

  // Africa
  { name: "Nairobi", country: "Kenya", region: "Africa", latitude: -1.2921, longitude: 36.8219 },
  { name: "Lagos", country: "Nigeria", region: "Africa", latitude: 6.5244, longitude: 3.3792 },
  { name: "Johannesburg", country: "South Africa", region: "Africa", latitude: -26.2041, longitude: 28.0473 },

  // Americas
  { name: "New York", country: "USA", region: "Americas", latitude: 40.7128, longitude: -74.006 },
  { name: "San Francisco", country: "USA", region: "Americas", latitude: 37.7749, longitude: -122.4194 },
  { name: "Toronto", country: "Canada", region: "Americas", latitude: 43.6532, longitude: -79.3832 },
  { name: "São Paulo", country: "Brazil", region: "Americas", latitude: -23.5505, longitude: -46.6333 },
];

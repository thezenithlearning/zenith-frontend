export interface PresenceCity {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  mode: "Online learning" | "Learning centre";
}

// Sample cities requested for the homepage design; these are not physical centres.
// Replace with confirmed coverage before treating this list as a location directory.
export const INDIA_PRESENCE_CITIES: PresenceCity[] = [
  { name: "New Delhi", state: "Delhi", latitude: 28.6139, longitude: 77.209, mode: "Online learning" },
  { name: "Mumbai", state: "Maharashtra", latitude: 19.076, longitude: 72.8777, mode: "Online learning" },
  { name: "Bengaluru", state: "Karnataka", latitude: 12.9716, longitude: 77.5946, mode: "Online learning" },
  { name: "Chennai", state: "Tamil Nadu", latitude: 13.0827, longitude: 80.2707, mode: "Online learning" },
  { name: "Hyderabad", state: "Telangana", latitude: 17.385, longitude: 78.4867, mode: "Online learning" },
  { name: "Kolkata", state: "West Bengal", latitude: 22.5726, longitude: 88.3639, mode: "Online learning" },
  { name: "Pune", state: "Maharashtra", latitude: 18.5204, longitude: 73.8567, mode: "Online learning" },
  { name: "Ahmedabad", state: "Gujarat", latitude: 23.0225, longitude: 72.5714, mode: "Online learning" },
  { name: "Jaipur", state: "Rajasthan", latitude: 26.9124, longitude: 75.7873, mode: "Online learning" },
  { name: "Lucknow", state: "Uttar Pradesh", latitude: 26.8467, longitude: 80.9462, mode: "Online learning" },
  { name: "Chandigarh", state: "Chandigarh", latitude: 30.7333, longitude: 76.7794, mode: "Online learning" },
  { name: "Indore", state: "Madhya Pradesh", latitude: 22.7196, longitude: 75.8577, mode: "Online learning" },
  { name: "Kochi", state: "Kerala", latitude: 9.9312, longitude: 76.2673, mode: "Online learning" },
  { name: "Bhubaneswar", state: "Odisha", latitude: 20.2961, longitude: 85.8245, mode: "Online learning" },
  { name: "Guwahati", state: "Assam", latitude: 26.1445, longitude: 91.7362, mode: "Online learning" },
  { name: "Patna", state: "Bihar", latitude: 25.5941, longitude: 85.1376, mode: "Online learning" },
  { name: "Dehradun", state: "Uttarakhand", latitude: 30.3165, longitude: 78.0322, mode: "Online learning" },
  { name: "Ranchi", state: "Jharkhand", latitude: 23.3441, longitude: 85.3096, mode: "Online learning" },
  { name: "Visakhapatnam", state: "Andhra Pradesh", latitude: 17.6868, longitude: 83.2185, mode: "Online learning" },
  { name: "Coimbatore", state: "Tamil Nadu", latitude: 11.0168, longitude: 76.9558, mode: "Online learning" },
];

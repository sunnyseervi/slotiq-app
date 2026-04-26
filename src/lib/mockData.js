// src/lib/mockData.js
// Production Seed Data — SlotIQ

export const MOCK_USER = {
  id: 'u-sunil-001',
  name: 'Sunil Seervi',
  phone: '+91 92575 90511',
  email: 'sunil@slotiq.in',
  avatar_initial: 'S',
  avatar_color: '#F5620F',
  mode: 'customer',
  role: 'admin', // Set as Admin for first-time use
  host_id: 'HOST001',
  member_tier: 'member',
  wallet_balance: 0,
  language: 'EN',
  dark_mode: false,
  location_city: 'Bengaluru',
  location_area: 'Koramangala',
};

export const MOCK_VEHICLES = [];

export const MOCK_LISTINGS = [];

export const MOCK_PARKING_PRICING = [];

export const MOCK_SPORTS_PRICING = [];

export const MOCK_BOOKINGS = [];

export const MOCK_REVIEWS = [];

export const MOCK_DISCOVER = [];

export const MOCK_NOTIFICATIONS = [];

export const MOCK_HOST_SCHEDULE = [];

export const LOCATIONS = {
  cities: ['Bengaluru','Mumbai','Delhi','Hyderabad','Pune'],
  areas: {
    Bengaluru:  [
      'Koramangala','Indiranagar','Whitefield','HSR Layout','MG Road',
      'Marathahalli','Electronic City','Jayanagar','JP Nagar','BTM Layout',
      'Bellandur','Malleshwaram','Rajajinagar','Banashankari','Hebbal',
      'Yelahanka','Kengeri','KR Puram','Banaswadi','Yeshwanthpur',
      'Basavanagudi','Frazer Town','RT Nagar','Vidyaranyapura','Sanjaynagar',
      'Kammanahalli','Mahadevapura','Domlur','CV Raman Nagar','Sahakarnagar',
      'Sarjapur Road','Outer Ring Road','Kalyan Nagar','Malleswaram','Basaveshwaranagar',
      'Jalahalli','Peenya','Dasarahalli','Nagarbhavi','Vijayanagar'
    ],
    Mumbai:     ['Andheri','Bandra','Powai','Juhu','Dadar','Worli','Kurla','Thane'],
    Delhi:      ['Connaught Place','Lajpat Nagar','Karol Bagh','Dwarka','Rohini','Saket','Vasant Kunj','Nehru Place'],
    Hyderabad:  ['Banjara Hills','Jubilee Hills','Hitech City','Gachibowli','Kondapur','Madhapur','Secunderabad','Begumpet'],
    Pune:       ['Shivajinagar','Koregaon Park','Viman Nagar','Baner','Hinjewadi','Kalyani Nagar','Wakad','Aundh'],
  },
};

export const AMENITY_ICONS = {
  'CCTV 24/7':'📷','EV Charging':'⚡','Wheelchair Access':'♿','Security Guard':'👮',
  'Covered Parking':'🏗️','Valet Available':'🤵','Floodlights':'💡','Changing Rooms':'🚿',
  'Parking':'🅿️','Drinking Water':'💧','Multiple Courts':'🏟️','Café':'☕',
  'Showers':'🚿','AC Courts':'❄️','Equipment Rental':'🏸','Box Cricket':'🏏',
  'Nets':'🥅','Vending Machine':'🤖','Full Court':'🏀','Clay Court':'🎾',
  'Pro Shop':'🛍️','Coaching Available':'👨‍🏫','Washrooms':'🚻','WiFi':'📶',
};

export const VEHICLE_TYPES = [
  { value:'bike',  label:'Bike',  icon:'two_wheeler',     emoji:'🛵', color: 'from-blue-500 to-indigo-500' },
  { value:'car',   label:'Car',   icon:'directions_car',  emoji:'🚗', color: 'from-orange-500 to-red-500' },
  { value:'auto',  label:'Auto',  icon:'electric_rickshaw', emoji:'🛺', color: 'from-green-500 to-teal-500' },
  { value:'truck', label:'Truck', icon:'local_shipping',  emoji:'🚛', color: 'from-rose-500 to-pink-500' },
  { value:'bus',   label:'Bus',   icon:'directions_bus',  emoji:'🚌', color: 'from-amber-500 to-yellow-500' },
];

export const FIXED_PRICING = {
  bike:  { hourly: 10,  daily: 70,   weekly: 350,  monthly: 1000 },
  car:   { hourly: 30,  daily: 200,  weekly: 1000, monthly: 3500 },
  auto:  { hourly: 40,  daily: 250,  weekly: 1300, monthly: 4500 },
  truck: { hourly: 120, daily: 800,  weekly: 4000, monthly: 13000 },
  bus:   { hourly: 150, daily: 1000, weekly: 5000, monthly: 16000 },
};

// Utility
export function formatInr(amount) {
  if (amount === null || amount === undefined) return '₹0';
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour   = h % 12 || 12;
  return `${hour}:${String(m).padStart(2,'0')} ${period}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const today = new Date().toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
}

export function randomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function calcBookingCost({ listing, pricing, passType, hours, vehicleType }) {
  if (listing.type === 'sports') {
    const sp = pricing;
    if (!sp) return { base: 0, platform: 10, gst: 0, total: 10 };
    const base = (sp.base_price_per_hour || 0) * (hours || 1);
    const platform = 10;
    const gst = Math.round((base + platform) * 0.18);
    return { base, platform, gst, total: base + platform + gst };
  }

  // Parking Pricing Engine
  const vType = vehicleType || 'car';
  const rates = FIXED_PRICING[vType] || FIXED_PRICING.car;
  
  let base = 0;
  let appliedCap = null;

  if (passType === 'hourly') {
    // Smart Pricing Logic: MIN(hourly, daily, weekly, monthly)
    const h = hours || 1;
    const days = Math.ceil(h / 24) || 1;
    const weeks = Math.ceil(days / 7) || 1;
    const months = Math.ceil(days / 30) || 1;

    const costH = h * rates.hourly;
    const costD = days * rates.daily;
    const costW = weeks * rates.weekly;
    const costM = months * rates.monthly;

    base = costH;
    
    if (costD <= base) { base = costD; appliedCap = 'daily'; }
    if (costW <= base) { base = costW; appliedCap = 'weekly'; }
    if (costM <= base) { base = costM; appliedCap = 'monthly'; }
    
  } else if (passType === 'daily') {
    base = rates.daily;
  } else if (passType === 'weekly') {
    base = rates.weekly;
  } else if (passType === 'monthly') {
    base = rates.monthly;
  }

  const platform = 10;
  const gst = Math.round((base + platform) * 0.18);
  return { 
    base, 
    platform, 
    gst, 
    total: base + platform + gst,
    appliedCap // undefined if no cap applied, or 'daily'/'weekly'/'monthly'
  };
}

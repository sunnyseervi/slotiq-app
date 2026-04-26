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
    Bengaluru:  ['Koramangala','Indiranagar','Whitefield','HSR Layout','MG Road','Marathahalli','Electronic City','Jayanagar'],
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
  { value:'bike',  label:'Bike / Scooter', emoji:'🛵' },
  { value:'car',   label:'Car (Sedan)',     emoji:'🚗' },
  { value:'suv',   label:'SUV / Large Car', emoji:'🚙' },
  { value:'truck', label:'Truck',           emoji:'🚛' },
  { value:'bus',   label:'Bus',             emoji:'🚌' },
];

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
  const pp = pricing;
  if (!pp) return { base: 0, platform: 10, gst: 0, total: 10 };
  let base = 0;
  if (passType === 'hourly') base = (pp.hourly_min || 0) * (hours || 1);
  else if (passType === 'daily') base = (pp.daily_min || 0);
  else if (passType === 'weekly') base = (pp.weekly_min || 0);
  else if (passType === 'monthly') base = (pp.monthly_min || 0);
  const platform = 10;
  const gst = Math.round((base + platform) * 0.18);
  return { base, platform, gst, total: base + platform + gst };
}

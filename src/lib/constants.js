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

export const AMENITY_ICONS = {
  'CCTV 24/7':'📷','EV Charging':'⚡','Wheelchair Access':'♿','Security Guard':'👮',
  'Covered Parking':'🏗️','Valet Available':'🤵','Floodlights':'💡','Changing Rooms':'🚿',
  'Parking':'🅿️','Drinking Water':'💧','Multiple Courts':'🏟️','Café':'☕',
  'Showers':'🚿','AC Courts':'❄️','Equipment Rental':'🏸','Box Cricket':'🏏',
  'Nets':'🥅','Vending Machine':'🤖','Full Court':'🏀','Clay Court':'🎾',
  'Pro Shop':'🛍️','Coaching Available':'👨‍🏫','Washrooms':'🚻','WiFi':'📶',
};

export const LOCATIONS = {
  'Bengaluru': [
    'Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'MG Road',
    'Marathahalli', 'Electronic City', 'Jayanagar', 'JP Nagar', 'BTM Layout',
    'Bellandur', 'Malleshwaram', 'Rajajinagar', 'Banashankari', 'Hebbal'
  ],
  'Mumbai': ['Andheri', 'Bandra', 'Colaba', 'Juhu', 'Worli'],
  'Delhi': ['Connaught Place', 'Hauz Khas', 'Saket', 'Karol Bagh', 'Dwarka'],
  'Hyderabad': ['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Hitech City'],
  'Pune': ['Koregaon Park', 'Kothrud', 'Viman Nagar', 'Baner', 'Hinjewadi']
};

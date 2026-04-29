export function formatInr(amount) {
  if (amount === null || amount === undefined) return '₹0';
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatTime(timeString) {
  if (!timeString) return 'N/A';
  return new Date(timeString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function randomCode(length = 6) {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

export function calcBookingCost(baseRate, durationHours) {
  return baseRate * durationHours;
}

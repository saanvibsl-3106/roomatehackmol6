const locationCoords: Record<string, { lat: number; lng: number }> = {
  Andheri: { lat: 19.119, lng: 72.846 },
  Bandra: { lat: 19.060, lng: 72.836 },
  Powai: { lat: 19.117, lng: 72.905 },
  Malad: { lat: 19.186, lng: 72.848 },
};

export function calculateDistance(loc1: string, loc2: string) {
  const coord1 = locationCoords[loc1];
  const coord2 = locationCoords[loc2];
  if (!coord1 || !coord2) return Infinity;

  const R = 6371; // Earth radius in km
  const dLat = deg2rad(coord2.lat - coord1.lat);
  const dLng = deg2rad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coord1.lat)) * Math.cos(deg2rad(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

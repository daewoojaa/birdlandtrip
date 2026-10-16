import { MAP_PROJ } from "./provinces";

export type LatLng = [number, number];

// lat/lng -> พิกัดใน viewBox ของแผนที่จำลอง
export function project([lat, lng]: LatLng): [number, number] {
  const { lon0, lat0, cosLat, k } = MAP_PROJ;
  return [(lng - lon0) * cosLat * k, (lat0 - lat) * k];
}

export function inMap([x, y]: [number, number]): boolean {
  return x >= 0 && y >= 0 && x <= MAP_PROJ.w && y <= MAP_PROJ.h;
}

export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

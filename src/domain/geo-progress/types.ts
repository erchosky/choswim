export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface SymbolicMilestone {
  name: string;
  distanceMeters: number;
  emotionalMessage: string;
}

export interface SymbolicRoute {
  id: string;
  name: string;
  description: string;
  startCoords?: GeoPoint;
  endCoords?: GeoPoint;
  totalDistanceMeters: number;
  milestones: SymbolicMilestone[];
}

export interface VirtualProgressOutput {
  start: GeoPoint;
  distanceMeters: number;
  virtualPoint: GeoPoint;
  message: string;
  milestone: {
    name: string;
    distanceToNext: number;
    progressPercent: number;
    emotionalMessage?: string;
  };
}

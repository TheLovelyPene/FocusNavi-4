export interface NavigationStep {
  instruction: string;
  street: string;
  distance: string;
  arrow: string;
  pathDescription: string;
  laneGuidance: string;
  intersectionType: string;
}

export interface AudioSettings {
  volume: number;
  voiceType: string;
  speechRate: number;
  language: string;
}

export interface RoutePreferences {
  avoidTolls: boolean;
  avoidHighways: boolean;
  preferAccessiblePaths: boolean;
}

export interface RouteRequest {
  origin: string;
  destination: string;
  preferences: RoutePreferences;
}

export interface RouteResponse {
  steps: NavigationStep[];
  estimatedTime: number;
  totalDistance: string;
  routeType: string;
}

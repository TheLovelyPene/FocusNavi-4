import { api } from "encore.dev/api";
import type { RouteRequest, RouteResponse, NavigationStep } from "./types";

// Demo route data for accessible navigation
const demoRoute: NavigationStep[] = [
  {
    instruction: "Head north on Main Street",
    street: "Main Street",
    distance: "0.3 miles",
    arrow: "straight",
    pathDescription: "Wide sidewalk with tactile paving, well-lit area",
    laneGuidance: "Stay in the right lane",
    intersectionType: "signalized"
  },
  {
    instruction: "Turn right onto Oak Avenue",
    street: "Oak Avenue", 
    distance: "0.5 miles",
    arrow: "right",
    pathDescription: "Smooth pavement, accessible curb cuts available",
    laneGuidance: "Use the right turn lane",
    intersectionType: "stop_sign"
  },
  {
    instruction: "Continue straight for 2 blocks",
    street: "Oak Avenue",
    distance: "0.2 miles", 
    arrow: "straight",
    pathDescription: "Tree-lined street with consistent lighting",
    laneGuidance: "Stay in current lane",
    intersectionType: "none"
  },
  {
    instruction: "Turn left onto Community Drive",
    street: "Community Drive",
    distance: "0.1 miles",
    arrow: "left",
    pathDescription: "Wide entrance with accessible parking nearby",
    laneGuidance: "Use the left turn lane",
    intersectionType: "signalized"
  },
  {
    instruction: "Arrive at Community Center",
    street: "Community Drive",
    distance: "0.0 miles",
    arrow: "destination",
    pathDescription: "Main entrance has automatic doors and ramp access",
    laneGuidance: "Pull into accessible parking area",
    intersectionType: "destination"
  }
];

// Gets navigation route with accessibility considerations
export const getRoute = api<RouteRequest, RouteResponse>(
  { expose: true, method: "POST", path: "/navigation/route" },
  async (req) => {
    // In a real app, this would call a mapping service API
    // For now, return demo data with accessibility features
    
    const routeType = req.preferences.preferAccessiblePaths 
      ? "Accessible Route" 
      : "Standard Route";
    
    return {
      steps: demoRoute,
      estimatedTime: 12, // minutes
      totalDistance: "1.1 miles",
      routeType
    };
  }
);

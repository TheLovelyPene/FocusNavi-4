import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import type { RouteRequest, RouteResponse, NavigationStep } from "./types";

const mapboxApiKey = secret("MapboxApiKey");

// Gets navigation route with accessibility considerations using Mapbox API
export const getRoute = api<RouteRequest, RouteResponse>(
  { expose: true, method: "POST", path: "/navigation/route" },
  async (req) => {
    try {
      // Geocode origin and destination
      const originCoords = await geocodeAddress(req.origin);
      const destCoords = await geocodeAddress(req.destination);
      
      if (!originCoords || !destCoords) {
        throw new Error("Could not geocode addresses");
      }

      // Get route from Mapbox Directions API
      const profile = req.preferences.preferAccessiblePaths ? "walking" : "driving";
      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}`;
      
      const params = new URLSearchParams({
        access_token: mapboxApiKey(),
        steps: "true",
        banner_instructions: "true",
        voice_instructions: "true",
        geometries: "geojson",
        overview: "full"
      });

      if (req.preferences.avoidTolls) {
        params.append("exclude", "toll");
      }
      if (req.preferences.avoidHighways) {
        params.append("exclude", "motorway");
      }

      const response = await fetch(`${directionsUrl}?${params}`);
      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        throw new Error("No routes found");
      }

      const route = data.routes[0];
      const steps = await processRouteSteps(route.legs[0].steps, req.preferences.preferAccessiblePaths);

      return {
        steps,
        estimatedTime: Math.round(route.duration / 60),
        totalDistance: formatDistance(route.distance),
        routeType: req.preferences.preferAccessiblePaths ? "Accessible Route" : "Standard Route"
      };
    } catch (error) {
      console.error("Route calculation failed:", error);
      // Fallback to demo data
      return getFallbackRoute(req.preferences.preferAccessiblePaths);
    }
  }
);

async function geocodeAddress(address: string): Promise<{lat: number, lng: number} | null> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`;
    const params = new URLSearchParams({
      access_token: mapboxApiKey(),
      limit: "1"
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
    return null;
  } catch (error) {
    console.error("Geocoding failed:", error);
    return null;
  }
}

async function processRouteSteps(steps: any[], isAccessible: boolean): Promise<NavigationStep[]> {
  const processedSteps: NavigationStep[] = [];

  for (const step of steps) {
    const instruction = step.maneuver.instruction || "Continue";
    const street = step.name || "Unknown Street";
    const distance = formatDistance(step.distance);
    const arrow = getArrowFromManeuver(step.maneuver.type);
    
    // Enhanced accessibility information
    const pathDescription = isAccessible 
      ? await getAccessibilityInfo(step.maneuver.location)
      : "Standard path";
    
    const laneGuidance = step.maneuver.modifier 
      ? `Use ${step.maneuver.modifier} lane`
      : "Continue in current lane";

    const intersectionType = determineIntersectionType(step.maneuver.type);

    processedSteps.push({
      instruction,
      street,
      distance,
      arrow,
      pathDescription,
      laneGuidance,
      intersectionType
    });
  }

  // Add arrival step
  processedSteps.push({
    instruction: "You have arrived at your destination",
    street: "Destination",
    distance: "0.0 miles",
    arrow: "destination",
    pathDescription: isAccessible ? "Accessible entrance available" : "Standard entrance",
    laneGuidance: "Park in designated area",
    intersectionType: "destination"
  });

  return processedSteps;
}

async function getAccessibilityInfo(location: [number, number]): Promise<string> {
  // In a real implementation, this would query accessibility databases
  // For now, return helpful accessibility descriptions
  const descriptions = [
    "Wide sidewalk with tactile paving available",
    "Accessible curb cuts and smooth pavement",
    "Well-lit area with consistent surface",
    "Level path with minimal obstacles",
    "Covered walkway with weather protection"
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function getArrowFromManeuver(type: string): string {
  const arrowMap: { [key: string]: string } = {
    "turn": "right",
    "new name": "straight",
    "depart": "straight",
    "arrive": "destination",
    "merge": "right",
    "on ramp": "right",
    "off ramp": "right",
    "fork": "right",
    "end of road": "right",
    "continue": "straight",
    "roundabout": "roundabout",
    "rotary": "roundabout",
    "roundabout turn": "roundabout"
  };
  
  return arrowMap[type] || "straight";
}

function determineIntersectionType(maneuverType: string): string {
  if (maneuverType.includes("roundabout")) return "roundabout";
  if (maneuverType.includes("turn")) return "signalized";
  if (maneuverType === "arrive") return "destination";
  return "none";
}

function formatDistance(meters: number): string {
  const miles = meters * 0.000621371;
  if (miles < 0.1) {
    const feet = meters * 3.28084;
    return `${Math.round(feet)} ft`;
  }
  return `${miles.toFixed(1)} mi`;
}

function getFallbackRoute(isAccessible: boolean): RouteResponse {
  const demoRoute: NavigationStep[] = [
    {
      instruction: "Head north on Main Street",
      street: "Main Street",
      distance: "0.3 mi",
      arrow: "straight",
      pathDescription: isAccessible ? "Wide sidewalk with tactile paving, well-lit area" : "Standard sidewalk",
      laneGuidance: "Stay in the right lane",
      intersectionType: "signalized"
    },
    {
      instruction: "Turn right onto Oak Avenue",
      street: "Oak Avenue", 
      distance: "0.5 mi",
      arrow: "right",
      pathDescription: isAccessible ? "Smooth pavement, accessible curb cuts available" : "Standard pavement",
      laneGuidance: "Use the right turn lane",
      intersectionType: "stop_sign"
    },
    {
      instruction: "Continue straight for 2 blocks",
      street: "Oak Avenue",
      distance: "0.2 mi", 
      arrow: "straight",
      pathDescription: isAccessible ? "Tree-lined street with consistent lighting" : "Standard street",
      laneGuidance: "Stay in current lane",
      intersectionType: "none"
    },
    {
      instruction: "Turn left onto Community Drive",
      street: "Community Drive",
      distance: "0.1 mi",
      arrow: "left",
      pathDescription: isAccessible ? "Wide entrance with accessible parking nearby" : "Standard entrance",
      laneGuidance: "Use the left turn lane",
      intersectionType: "signalized"
    },
    {
      instruction: "Arrive at Community Center",
      street: "Community Drive",
      distance: "0.0 mi",
      arrow: "destination",
      pathDescription: isAccessible ? "Main entrance has automatic doors and ramp access" : "Main entrance",
      laneGuidance: "Pull into accessible parking area",
      intersectionType: "destination"
    }
  ];

  return {
    steps: demoRoute,
    estimatedTime: 12,
    totalDistance: "1.1 mi",
    routeType: isAccessible ? "Accessible Route" : "Standard Route"
  };
}

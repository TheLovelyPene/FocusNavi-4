import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";

const mapboxApiKey = secret("MapboxApiKey");

export interface SatelliteImageRequest {
  latitude: number;
  longitude: number;
  zoom: number;
  width: number;
  height: number;
}

export interface SatelliteImageResponse {
  imageUrl: string;
  attribution: string;
}

// Gets satellite imagery for navigation context
export const getSatelliteImage = api<SatelliteImageRequest, SatelliteImageResponse>(
  { expose: true, method: "POST", path: "/navigation/satellite" },
  async (req) => {
    try {
      // Mapbox Static Images API for satellite imagery
      const imageUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${req.longitude},${req.latitude},${req.zoom}/${req.width}x${req.height}@2x?access_token=${mapboxApiKey()}`;
      
      return {
        imageUrl,
        attribution: "© Mapbox © OpenStreetMap"
      };
    } catch (error) {
      console.error("Satellite image request failed:", error);
      throw new Error("Failed to retrieve satellite imagery");
    }
  }
);

export interface TrafficDataRequest {
  latitude: number;
  longitude: number;
  radius: number; // in meters
}

export interface TrafficDataResponse {
  congestionLevel: "low" | "moderate" | "heavy" | "severe";
  incidents: TrafficIncident[];
  alternativeRoutes: number;
}

export interface TrafficIncident {
  type: "accident" | "construction" | "closure" | "weather";
  description: string;
  severity: "minor" | "moderate" | "major";
  location: {
    latitude: number;
    longitude: number;
  };
}

// Gets real-time traffic data for route optimization
export const getTrafficData = api<TrafficDataRequest, TrafficDataResponse>(
  { expose: true, method: "POST", path: "/navigation/traffic" },
  async (req) => {
    try {
      // In a real implementation, this would integrate with traffic APIs
      // For now, return simulated traffic data
      const congestionLevels: Array<"low" | "moderate" | "heavy" | "severe"> = ["low", "moderate", "heavy", "severe"];
      const incidentTypes: Array<"accident" | "construction" | "closure" | "weather"> = ["accident", "construction", "closure", "weather"];
      const severityLevels: Array<"minor" | "moderate" | "major"> = ["minor", "moderate", "major"];
      
      const incidents: TrafficIncident[] = [];
      const numIncidents = Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numIncidents; i++) {
        incidents.push({
          type: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
          description: `Traffic incident ${i + 1} in the area`,
          severity: severityLevels[Math.floor(Math.random() * severityLevels.length)],
          location: {
            latitude: req.latitude + (Math.random() - 0.5) * 0.01,
            longitude: req.longitude + (Math.random() - 0.5) * 0.01
          }
        });
      }
      
      return {
        congestionLevel: congestionLevels[Math.floor(Math.random() * congestionLevels.length)],
        incidents,
        alternativeRoutes: Math.floor(Math.random() * 3) + 1
      };
    } catch (error) {
      console.error("Traffic data request failed:", error);
      throw new Error("Failed to retrieve traffic data");
    }
  }
);

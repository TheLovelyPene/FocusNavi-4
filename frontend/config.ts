// Configuration for the Accessible Navigation App

// Mapbox configuration
// TODO: Set this to your Mapbox access token from https://account.mapbox.com/access-tokens/
export const mapboxPublicToken = "";

// API endpoints
export const apiBaseUrl = "/api";

// Default settings
export const defaultAudioSettings = {
  volume: 80,
  voiceType: 'standard',
  speechRate: 1.0,
  language: 'English'
};

export const defaultRoutePreferences = {
  avoidTolls: false,
  avoidHighways: false,
  preferAccessiblePaths: true
};

// Voice recognition settings
export const voiceRecognitionConfig = {
  language: 'en-US',
  continuous: true,
  interimResults: false,
  maxAlternatives: 1
};

// Accessibility features
export const accessibilityFeatures = {
  highContrast: true,
  largeText: true,
  voiceCommands: true,
  tactileDescriptions: true
};

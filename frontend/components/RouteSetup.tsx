import React, { useState } from 'react';
import { MapPin, Settings, Navigation } from 'lucide-react';
import type { RoutePreferences } from '../types';

interface RouteSetupProps {
  onStartNavigation: (origin: string, destination: string, preferences: RoutePreferences) => void;
  initialPreferences: RoutePreferences;
}

const RouteSetup: React.FC<RouteSetupProps> = ({ onStartNavigation, initialPreferences }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [preferences, setPreferences] = useState<RoutePreferences>(initialPreferences);
  const [showPreferences, setShowPreferences] = useState(false);

  const handleStartNavigation = () => {
    if (origin.trim() && destination.trim()) {
      onStartNavigation(origin.trim(), destination.trim(), preferences);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setOrigin(`${position.coords.latitude}, ${position.coords.longitude}`);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Could not get your current location. Please enter your starting address manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">Accessible Navigation</h1>
          <p className="text-xl text-gray-600 text-center mb-8">Plan your accessible route with real-time satellite data</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xl font-semibold text-gray-700 mb-3">
                <MapPin className="inline mr-2" size={24} />
                Starting Location
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Enter starting address or use current location"
                  className="flex-1 p-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleUseCurrentLocation}
                  className="px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors duration-200"
                >
                  Use Current
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xl font-semibold text-gray-700 mb-3">
                <Navigation className="inline mr-2" size={24} />
                Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination address"
                className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="flex items-center text-xl font-semibold text-gray-700 mb-3 hover:text-blue-600 transition-colors"
              >
                <Settings className="mr-2" size={24} />
                Route Preferences
                <span className="ml-2">{showPreferences ? '▼' : '▶'}</span>
              </button>
              
              {showPreferences && (
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={preferences.preferAccessiblePaths}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        preferAccessiblePaths: e.target.checked
                      })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-lg text-gray-700">Prefer accessible paths (sidewalks, ramps, tactile paving)</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={preferences.avoidTolls}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        avoidTolls: e.target.checked
                      })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-lg text-gray-700">Avoid toll roads</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={preferences.avoidHighways}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        avoidHighways: e.target.checked
                      })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-lg text-gray-700">Avoid highways</span>
                  </label>
                </div>
              )}
            </div>

            <button
              onClick={handleStartNavigation}
              disabled={!origin.trim() || !destination.trim()}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-xl transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Start Navigation
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Accessibility Features</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• Real-time satellite imagery for visual context</li>
            <li>• Detailed path descriptions for mobility assistance</li>
            <li>• Voice commands and audio feedback</li>
            <li>• Accessible route optimization</li>
            <li>• Large text and high contrast interface</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RouteSetup;

import React, { useState, useEffect } from 'react';
import { Settings, X, RotateCcw, MessageCircle, Satellite } from 'lucide-react';
import { NavigationStep } from '../types';
import backend from '~backend/client';

interface NavigationInterfaceProps {
  navigationStep: NavigationStep;
  upcomingSteps: NavigationStep[];
  estimatedTime: number;
  totalDistance: string;
  destination: string;
  routeType: string;
  spokenLanguage: string;
  aiResponse: string;
  onSettingsClick: () => void;
  onCancelClick: () => void;
  onRerouteClick: () => void;
  onAskAI: (question: string) => void;
  onNextStep: () => void;
  currentStep: number;
  totalSteps: number;
}

const NavigationInterface: React.FC<NavigationInterfaceProps> = ({
  navigationStep,
  upcomingSteps,
  estimatedTime,
  totalDistance,
  destination,
  routeType,
  spokenLanguage,
  aiResponse,
  onSettingsClick,
  onCancelClick,
  onRerouteClick,
  onAskAI,
  onNextStep,
  currentStep,
  totalSteps
}) => {
  const [aiQuestion, setAiQuestion] = useState('');
  const [satelliteImage, setSatelliteImage] = useState<string>('');
  const [showSatellite, setShowSatellite] = useState(false);

  const handleAskAI = () => {
    if (aiQuestion.trim()) {
      onAskAI(aiQuestion);
      setAiQuestion('');
    }
  };

  const loadSatelliteImage = async () => {
    try {
      // Use demo coordinates for satellite image
      const response = await backend.navigation.getSatelliteImage({
        latitude: 40.7128,
        longitude: -74.0060,
        zoom: 16,
        width: 400,
        height: 300
      });
      setSatelliteImage(response.imageUrl);
      setShowSatellite(true);
    } catch (error) {
      console.error('Failed to load satellite image:', error);
    }
  };

  const renderArrow = (arrowType: string) => {
    const arrowMap: { [key: string]: string } = {
      'right': '→',
      'left': '←',
      'straight': '↑',
      'roundabout': '⟲',
      'destination': '🏁',
      'default': '•'
    };
    return arrowMap[arrowType] || arrowMap['default'];
  };

  if (!navigationStep) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-800 mb-4">No Navigation Data</div>
          <div className="text-xl text-gray-600">Please start a new route</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Progress Indicator */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold text-gray-700">Step {currentStep + 1} of {totalSteps}</span>
            <div className="flex gap-2">
              <button
                onClick={loadSatelliteImage}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center"
              >
                <Satellite className="mr-2" size={16} />
                Satellite
              </button>
              <button
                onClick={onNextStep}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors duration-200"
                disabled={currentStep >= totalSteps - 1}
              >
                Next Step
              </button>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Satellite Image Modal */}
        {showSatellite && satelliteImage && (
          <div className="bg-white rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <Satellite className="mr-2" size={24} />
                Satellite View
              </h3>
              <button
                onClick={() => setShowSatellite(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="text-center">
              <img 
                src={satelliteImage} 
                alt="Satellite view of current area"
                className="mx-auto rounded-lg shadow-lg max-w-full h-auto"
              />
              <p className="text-sm text-gray-500 mt-2">© Mapbox © OpenStreetMap</p>
            </div>
          </div>
        )}

        {/* Current Instruction - Main Focus */}
        <div className="bg-white rounded-xl shadow-xl p-8 border-l-8 border-blue-600">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-5xl font-bold text-gray-800 mb-2">
                {navigationStep.instruction}
              </h1>
              <h2 className="text-3xl text-gray-700 mb-2">
                {navigationStep.street}
              </h2>
              <p className="text-2xl text-gray-600 font-semibold">
                {navigationStep.distance}
              </p>
            </div>
            <div className="text-8xl ml-8 text-blue-600">
              {renderArrow(navigationStep.arrow)}
            </div>
          </div>

          {navigationStep.laneGuidance && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-4">
              <p className="text-blue-800 text-lg">
                <strong>Lane Guidance:</strong> {navigationStep.laneGuidance}
              </p>
            </div>
          )}

          {navigationStep.pathDescription && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
              <p className="text-green-800 text-lg">
                <strong>Path Description:</strong> {navigationStep.pathDescription}
              </p>
            </div>
          )}
        </div>

        {/* Upcoming Steps */}
        {upcomingSteps.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📍</span>
              Coming Up
            </h3>
            <div className="space-y-4">
              {upcomingSteps.map((step, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-3xl mr-4 text-gray-600">
                    {renderArrow(step.arrow)}
                  </span>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-gray-800">{step.instruction}</p>
                    <p className="text-gray-600">{step.street} • {step.distance}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trip Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-gray-500 text-sm uppercase tracking-wide">ETA</p>
              <p className="text-2xl font-bold text-gray-800">
                {new Date(Date.now() + estimatedTime * 60000).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm uppercase tracking-wide">Time Left</p>
              <p className="text-2xl font-bold text-gray-800">{estimatedTime} min</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm uppercase tracking-wide">Distance</p>
              <p className="text-lg font-semibold text-gray-800">{totalDistance}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm uppercase tracking-wide">Route</p>
              <p className="text-lg font-semibold text-gray-800">{routeType}</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm uppercase tracking-wide">Destination</p>
            <p className="text-xl font-semibold text-gray-800">{destination}</p>
          </div>
        </div>

        {/* AI Response */}
        {aiResponse && (
          <div className="bg-purple-50 border-l-4 border-purple-400 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-purple-800 mb-2 flex items-center">
              <MessageCircle className="mr-2" size={24} />
              AI Assistant
            </h3>
            <p className="text-lg text-purple-900">{aiResponse}</p>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <button
              onClick={onSettingsClick}
              className="flex items-center justify-center py-4 px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold text-lg transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-gray-400"
            >
              <Settings className="mr-2" size={20} />
              Settings
            </button>
            <button
              onClick={onCancelClick}
              className="flex items-center justify-center py-4 px-6 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-lg transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-red-300"
            >
              <X className="mr-2" size={20} />
              Cancel
            </button>
            <button
              onClick={onRerouteClick}
              className="flex items-center justify-center py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-lg transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              <RotateCcw className="mr-2" size={20} />
              Reroute
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="Ask AI for help..."
              className="flex-1 p-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-500 focus:border-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
            />
            <button
              onClick={handleAskAI}
              className="px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-purple-300"
            >
              <MessageCircle size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationInterface;

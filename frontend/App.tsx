import { useState, useEffect } from 'react';
import NavigationInterface from './components/NavigationInterface';
import AudioSettings from './components/AudioSettings';
import AskAI from './components/AskAI';
import RouteSetup from './components/RouteSetup';
import backend from '~backend/client';
import type { AudioSettings as AudioSettingsType, NavigationStep, RoutePreferences } from './types';

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showRouteSetup, setShowRouteSetup] = useState(true);
  const [routePreferences, setRoutePreferences] = useState<RoutePreferences>({
    avoidTolls: false,
    avoidHighways: false,
    preferAccessiblePaths: true
  });
  const [audioSettings, setAudioSettings] = useState<AudioSettingsType>({
    volume: 80,
    voiceType: 'standard',
    speechRate: 1.0,
    language: 'English'
  });
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([]);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [totalDistance, setTotalDistance] = useState('');
  const [routeType, setRouteType] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const loadRoute = async (originAddr: string, destAddr: string, preferences: RoutePreferences) => {
    setIsLoading(true);
    try {
      const response = await backend.navigation.getRoute({
        origin: originAddr,
        destination: destAddr,
        preferences
      });
      
      setNavigationSteps(response.steps);
      setEstimatedTime(response.estimatedTime);
      setTotalDistance(response.totalDistance);
      setRouteType(response.routeType);
      setCurrentStep(0);
      setShowRouteSetup(false);
      setAiResponse(`Route calculated! ${response.steps.length} steps to your destination.`);
    } catch (error) {
      console.error('Failed to load route:', error);
      setAiResponse('Sorry, I could not calculate your route. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = (settings: AudioSettingsType) => {
    setAudioSettings(settings);
    setShowSettings(false);
  };

  const handleNextStep = () => {
    if (currentStep < navigationSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setAiResponse(`Moving to step ${currentStep + 2}. ${navigationSteps[currentStep + 1]?.instruction}`);
    } else {
      setAiResponse('You have reached your destination! Navigation complete.');
    }
  };

  const handleCancel = () => {
    setCurrentStep(0);
    setNavigationSteps([]);
    setShowRouteSetup(true);
    setAiResponse('Navigation cancelled. You can start a new route anytime.');
  };

  const handleReroute = () => {
    if (origin && destination) {
      loadRoute(origin, destination, routePreferences);
      setAiResponse('Recalculating route with current preferences...');
    }
  };

  const handleAskAI = async (question: string) => {
    try {
      const response = await backend.ai.processCommand({ command: question });
      setAiResponse(response.response);
    } catch (error) {
      console.error('AI request failed:', error);
      setAiResponse('Sorry, I could not process your request right now.');
    }
  };

  const handleStartNavigation = (originAddr: string, destAddr: string, preferences: RoutePreferences) => {
    setOrigin(originAddr);
    setDestination(destAddr);
    setRoutePreferences(preferences);
    loadRoute(originAddr, destAddr, preferences);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-4xl font-bold text-gray-800 mb-4">Calculating Route...</div>
          <div className="text-xl text-gray-600">Finding the best accessible path for you</div>
        </div>
      </div>
    );
  }

  const currentNavigationStep = navigationSteps[currentStep];
  const upcomingSteps = navigationSteps.slice(currentStep + 1, currentStep + 3);

  return (
    <div className="app-container bg-gray-100 min-h-screen">
      <AskAI onAICommand={handleAskAI} />
      
      {showRouteSetup ? (
        <RouteSetup
          onStartNavigation={handleStartNavigation}
          initialPreferences={routePreferences}
        />
      ) : showSettings ? (
        <AudioSettings
          onSave={handleSaveSettings}
          initialSettings={audioSettings}
        />
      ) : (
        <NavigationInterface
          navigationStep={currentNavigationStep}
          upcomingSteps={upcomingSteps}
          estimatedTime={estimatedTime}
          totalDistance={totalDistance}
          destination={destination}
          routeType={routeType}
          spokenLanguage={audioSettings.language}
          aiResponse={aiResponse}
          onSettingsClick={() => setShowSettings(true)}
          onCancelClick={handleCancel}
          onRerouteClick={handleReroute}
          onAskAI={handleAskAI}
          onNextStep={handleNextStep}
          currentStep={currentStep}
          totalSteps={navigationSteps.length}
        />
      )}
    </div>
  );
}

export default App;

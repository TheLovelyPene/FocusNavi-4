import { useState } from 'react';
import NavigationInterface from './components/NavigationInterface';
import AudioSettings from './components/AudioSettings';
import AskAI from './components/AskAI';
import type { AudioSettings as AudioSettingsType, NavigationStep } from './types';

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [routePreferences] = useState({
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
  const [estimatedTime, setEstimatedTime] = useState(12);
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load initial route
  useState(() => {
    loadRoute();
  });

  const loadRoute = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/navigation/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: 'Current Location',
          destination: 'Community Center',
          preferences: routePreferences
        })
      });
      const data = await response.json();
      setNavigationSteps(data.steps);
      setEstimatedTime(data.estimatedTime);
    } catch (error) {
      console.error('Failed to load route:', error);
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
    }
  };

  const handleCancel = () => {
    setCurrentStep(0);
    setAiResponse('Navigation cancelled. You can start a new route anytime.');
  };

  const handleReroute = () => {
    setCurrentStep(0);
    loadRoute();
    setAiResponse('Finding new accessible route...');
  };

  const handleAskAI = async (question: string) => {
    try {
      const response = await fetch('/api/ai/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: question })
      });
      const data = await response.json();
      setAiResponse(data.response);
    } catch (error) {
      console.error('AI request failed:', error);
      setAiResponse('Sorry, I could not process your request right now.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-800 mb-4">Loading Route...</div>
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
      {showSettings ? (
        <AudioSettings
          onSave={handleSaveSettings}
          initialSettings={audioSettings}
        />
      ) : (
        <NavigationInterface
          navigationStep={currentNavigationStep}
          upcomingSteps={upcomingSteps}
          estimatedTime={estimatedTime}
          destination="Community Center"
          routeType={routePreferences.preferAccessiblePaths ? 'Accessible Route' : 'Standard Route'}
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

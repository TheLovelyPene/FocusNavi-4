import React, { useState } from 'react';
import { AudioSettings as AudioSettingsType } from '../types';

interface AudioSettingsProps {
  onSave: (settings: AudioSettingsType) => void;
  initialSettings: AudioSettingsType;
}

const AudioSettings: React.FC<AudioSettingsProps> = ({ onSave, initialSettings }) => {
  const [volume, setVolume] = useState(initialSettings.volume);
  const [voiceType, setVoiceType] = useState(initialSettings.voiceType);
  const [speechRate, setSpeechRate] = useState(initialSettings.speechRate);
  const [language, setLanguage] = useState(initialSettings.language);

  const handleSave = () => {
    onSave({
      volume,
      voiceType,
      speechRate,
      language
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Audio Settings</h1>
        
        <div className="space-y-8">
          <div className="setting-group">
            <label className="block text-xl font-semibold text-gray-700 mb-3">
              Volume: {volume}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="setting-group">
            <label className="block text-xl font-semibold text-gray-700 mb-3">
              Voice Type
            </label>
            <select
              value={voiceType}
              onChange={(e) => setVoiceType(e.target.value)}
              className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="standard">Standard</option>
              <option value="calm">Calm</option>
              <option value="energetic">Energetic</option>
            </select>
          </div>

          <div className="setting-group">
            <label className="block text-xl font-semibold text-gray-700 mb-3">
              Speech Rate: {speechRate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="setting-group">
            <label className="block text-xl font-semibold text-gray-700 mb-3">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-10 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold text-xl transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};

export default AudioSettings;

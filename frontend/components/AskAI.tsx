import { useState, useEffect } from 'react';

interface AskAIProps {
  onAICommand: (command: string) => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const AskAI: React.FC<AskAIProps> = ({ onAICommand }) => {
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    
    // Create speech recognition instance
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);
      // Restart recognition to keep listening
      if (isSupported) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (error) {
            console.log('Speech recognition restart failed:', error);
          }
        }, 1000);
      }
    };
    
    recognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
      
      if (command.includes('hey assistant') || command.includes('hey ai') || command.includes('navigation help')) {
        onAICommand(command);
      }
    };

    recognition.onerror = (event: any) => {
      console.log('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setIsSupported(false);
      }
    };

    setRecognition(recognition);
    
    // Start recognition
    try {
      recognition.start();
    } catch (error) {
      console.log('Failed to start speech recognition:', error);
      setIsSupported(false);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [onAICommand, isSupported]);

  if (!isSupported) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg">
        <p className="text-sm">Voice commands not available in this browser</p>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-xs">
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${listening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
        <p className="text-sm text-gray-700">
          {listening ? 'Listening for "Hey Assistant"...' : 'Voice recognition starting...'}
        </p>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Say "Hey Assistant" followed by your question
      </p>
    </div>
  );
};

export default AskAI;

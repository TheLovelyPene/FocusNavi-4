import { api } from "encore.dev/api";

export interface AICommandRequest {
  command: string;
}

export interface AICommandResponse {
  response: string;
}

// Processes AI voice commands for navigation assistance
export const processCommand = api<AICommandRequest, AICommandResponse>(
  { expose: true, method: "POST", path: "/ai/command" },
  async (req) => {
    const command = req.command.toLowerCase();
    
    if (command.includes('where am i')) {
      return { response: 'You are currently following your navigation route. Check the main instruction for your current step.' };
    }
    
    if (command.includes('next step')) {
      return { response: 'Moving to the next navigation step. Listen for the updated instruction.' };
    }
    
    if (command.includes('repeat') || command.includes('say again')) {
      return { response: 'I will repeat the current navigation instruction for you.' };
    }
    
    if (command.includes('help')) {
      return { response: 'I can help you with navigation. Try saying "where am I", "next step", or "repeat instruction".' };
    }
    
    if (command.includes('settings')) {
      return { response: 'You can adjust audio settings including volume, speech rate, and voice type in the settings menu.' };
    }
    
    return { response: `I heard: "${req.command}". Try asking about your location, next step, or say "help" for more options.` };
  }
);

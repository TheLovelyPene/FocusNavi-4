import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

// Native module interfaces
interface AndroidAccessibilityModule {
  startAccessibilityService(): Promise<boolean>;
  stopAccessibilityService(): Promise<boolean>;
  isAccessibilityServiceEnabled(): Promise<boolean>;
  requestOverlayPermission(): Promise<boolean>;
  hasOverlayPermission(): Promise<boolean>;
  speakText(text: string, options?: SpeechOptions): Promise<void>;
  startVoiceRecognition(): Promise<void>;
  stopVoiceRecognition(): Promise<void>;
  isVoiceRecognitionAvailable(): Promise<boolean>;
  updateOverlayVisibility(visible: boolean): Promise<void>;
  getCurrentGoogleMapsContent(): Promise<GoogleMapsContent>;
}

interface IOSAccessibilityModule {
  requestSiriPermission(): Promise<boolean>;
  hasSiriPermission(): Promise<boolean>;
  requestVoiceOverPermission(): Promise<boolean>;
  hasVoiceOverPermission(): Promise<boolean>;
  speakText(text: string, options?: SpeechOptions): Promise<void>;
  addCustomVoiceOverAction(label: string, action: string): Promise<void>;
  removeCustomVoiceOverAction(label: string): Promise<void>;
  openShortcutsApp(): Promise<void>;
  installAccessibilityShortcuts(): Promise<boolean>;
}

// Type definitions
interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
}

interface GoogleMapsContent {
  currentDirection?: string;
  currentLocation?: string;
  estimatedTime?: string;
  distance?: string;
  isNavigating: boolean;
}

interface AccessibilitySettings {
  voiceCommandsEnabled: boolean;
  autoAnnounceDirections: boolean;
  speechRate: number;
  speechPitch: number;
  speechVolume: number;
  highContrastMode: boolean;
  largeTextMode: boolean;
  language: string;
}

// Native modules
const { AndroidAccessibility, IOSAccessibility } = NativeModules;

// Event emitter for listening to accessibility events
const accessibilityEventEmitter = new NativeEventEmitter(
  Platform.OS === 'android' ? AndroidAccessibility : IOSAccessibility
);

class AccessibilityBridge {
  private settings: AccessibilitySettings;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.settings = {
      voiceCommandsEnabled: true,
      autoAnnounceDirections: true,
      speechRate: 0.5,
      speechPitch: 1.0,
      speechVolume: 0.8,
      highContrastMode: false,
      largeTextMode: false,
      language: 'en-US'
    };

    this.setupEventListeners();
  }

  // Platform-specific initialization
  async initialize(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        return await this.initializeAndroid();
      } else if (Platform.OS === 'ios') {
        return await this.initializeIOS();
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize accessibility bridge:', error);
      return false;
    }
  }

  private async initializeAndroid(): Promise<boolean> {
    const androidModule = AndroidAccessibility as AndroidAccessibilityModule;
    
    // Check if accessibility service is enabled
    const isServiceEnabled = await androidModule.isAccessibilityServiceEnabled();
    if (!isServiceEnabled) {
      // Guide user to enable accessibility service
      this.emit('permissionRequired', {
        type: 'accessibility',
        message: 'Please enable Accessible Maps in Accessibility Settings'
      });
      return false;
    }

    // Check overlay permission
    const hasOverlayPermission = await androidModule.hasOverlayPermission();
    if (!hasOverlayPermission) {
      await androidModule.requestOverlayPermission();
    }

    // Start the accessibility service
    return await androidModule.startAccessibilityService();
  }

  private async initializeIOS(): Promise<boolean> {
    const iosModule = IOSAccessibility as IOSAccessibilityModule;
    
    // Check Siri permission
    const hasSiriPermission = await iosModule.hasSiriPermission();
    if (!hasSiriPermission) {
      const granted = await iosModule.requestSiriPermission();
      if (!granted) {
        this.emit('permissionRequired', {
          type: 'siri',
          message: 'Please enable Siri access for voice commands'
        });
        return false;
      }
    }

    // Install accessibility shortcuts
    const shortcutsInstalled = await iosModule.installAccessibilityShortcuts();
    if (!shortcutsInstalled) {
      this.emit('permissionRequired', {
        type: 'shortcuts',
        message: 'Please install accessibility shortcuts from the Shortcuts app'
      });
    }

    return true;
  }

  // Voice commands
  async startVoiceRecognition(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        const androidModule = AndroidAccessibility as AndroidAccessibilityModule;
        const isAvailable = await androidModule.isVoiceRecognitionAvailable();
        if (isAvailable) {
          await androidModule.startVoiceRecognition();
        } else {
          throw new Error('Voice recognition not available');
        }
      } else {
        // iOS uses Siri shortcuts, so this is handled differently
        this.emit('voiceCommandInfo', {
          message: 'Use "Hey Siri" followed by your command'
        });
      }
    } catch (error) {
      this.emit('error', { message: 'Failed to start voice recognition', error });
    }
  }

  async stopVoiceRecognition(): Promise<void> {
    if (Platform.OS === 'android') {
      const androidModule = AndroidAccessibility as AndroidAccessibilityModule;
      await androidModule.stopVoiceRecognition();
    }
  }

  // Text-to-speech
  async speak(text: string, options?: Partial<SpeechOptions>): Promise<void> {
    const speechOptions: SpeechOptions = {
      rate: options?.rate ?? this.settings.speechRate,
      pitch: options?.pitch ?? this.settings.speechPitch,
      volume: options?.volume ?? this.settings.speechVolume,
      language: options?.language ?? this.settings.language
    };

    try {
      if (Platform.OS === 'android') {
        const androidModule = AndroidAccessibility as AndroidAccessibilityModule;
        await androidModule.speakText(text, speechOptions);
      } else {
        const iosModule = IOSAccessibility as IOSAccessibilityModule;
        await iosModule.speakText(text, speechOptions);
      }
    } catch (error) {
      console.error('Failed to speak text:', error);
    }
  }

  // Google Maps integration
  async readCurrentDirections(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        const androidModule = AndroidAccessibility as AndroidAccessibilityModule;
        const content = await androidModule.getCurrentGoogleMapsContent();
        
        if (content.currentDirection) {
          await this.speak(`Current direction: ${content.currentDirection}`);
        } else if (content.isNavigating) {
          await this.speak('Navigation is active but no current direction found');
        } else {
          await this.speak('No navigation directions found. Please start navigation in Google Maps.');
        }
      } else {
        // iOS uses shortcuts for this functionality
        await this.speak('Use "Hey Siri, read directions" for current navigation instructions');
      }
    } catch (error) {
      await this.speak('Unable to read directions. Please ensure Google Maps is open and navigation is active.');
    }
  }

  async describeCurrentLocation(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        const androidModule = AndroidAccessibility as AndroidAccessibilityModule;
        const content = await androidModule.getCurrentGoogleMapsContent();
        
        if (content.currentLocation) {
          await this.speak(`Current location: ${content.currentLocation}`);
        } else {
          await this.speak('Current location information not available');
        }
      } else {
        // iOS uses shortcuts for this functionality
        await this.speak('Use "Hey Siri, where am I" for current location information');
      }
    } catch (error) {
      await this.speak('Unable to determine current location');
    }
  }

  // Settings management
  updateSettings(newSettings: Partial<AccessibilitySettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.emit('settingsChanged', this.settings);
  }

  getSettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  // Overlay management (Android only)
  async showOverlay(): Promise<void> {
    if (Platform.OS === 'android') {
      const androidModule = AndroidAccessibility as AndroidAccessibilityModule;
      await androidModule.updateOverlayVisibility(true);
    }
  }

  async hideOverlay(): Promise<void> {
    if (Platform.OS === 'android') {
      const androidModule = AndroidAccessibility as AndroidAccessibilityModule;
      await androidModule.updateOverlayVisibility(false);
    }
  }

  // Event handling
  private setupEventListeners(): void {
    // Voice command events
    accessibilityEventEmitter.addListener('voiceCommandReceived', (command: string) => {
      this.handleVoiceCommand(command);
    });

    // Google Maps events
    accessibilityEventEmitter.addListener('googleMapsDirectionChanged', (direction: string) => {
      if (this.settings.autoAnnounceDirections) {
        this.speak(direction);
      }
      this.emit('directionChanged', direction);
    });

    // Error events
    accessibilityEventEmitter.addListener('accessibilityError', (error: any) => {
      this.emit('error', error);
    });
  }

  private async handleVoiceCommand(command: string): Promise<void> {
    const lowerCommand = command.toLowerCase().trim();

    if (lowerCommand.includes('directions') || lowerCommand.includes('navigate')) {
      await this.readCurrentDirections();
    } else if (lowerCommand.includes('where am i') || lowerCommand.includes('location')) {
      await this.describeCurrentLocation();
    } else if (lowerCommand.includes('repeat')) {
      await this.readCurrentDirections();
    } else if (lowerCommand.includes('help')) {
      await this.speak('Available commands: read directions, where am I, repeat, help');
    } else {
      await this.speak('Command not recognized. Say help for available commands.');
    }

    this.emit('voiceCommandProcessed', { command, recognized: true });
  }

  // Event emitter methods
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  // Cleanup
  destroy(): void {
    accessibilityEventEmitter.removeAllListeners('voiceCommandReceived');
    accessibilityEventEmitter.removeAllListeners('googleMapsDirectionChanged');
    accessibilityEventEmitter.removeAllListeners('accessibilityError');
    this.eventListeners.clear();
  }
}

// Export singleton instance
export const accessibilityBridge = new AccessibilityBridge();
export default accessibilityBridge;

// Export types for use in other components
export type {
  AccessibilitySettings,
  GoogleMapsContent,
  SpeechOptions
};

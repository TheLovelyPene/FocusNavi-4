import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Platform,
  Linking,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import accessibilityBridge, { AccessibilitySettings } from './AccessibilityBridge';

const AccessibilityApp: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(accessibilityBridge.getSettings());
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    initializeApp();
    setupEventListeners();

    return () => {
      accessibilityBridge.destroy();
    };
  }, []);

  const initializeApp = async () => {
    try {
      const initialized = await accessibilityBridge.initialize();
      setIsInitialized(initialized);
      setStatus(initialized ? 'Ready' : 'Setup Required');
    } catch (error) {
      setStatus('Initialization Failed');
      console.error('App initialization failed:', error);
    }
  };

  const setupEventListeners = () => {
    accessibilityBridge.on('permissionRequired', (data: any) => {
      Alert.alert(
        'Permission Required',
        data.message,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openAccessibilitySettings }
        ]
      );
    });

    accessibilityBridge.on('error', (error: any) => {
      Alert.alert('Error', error.message);
    });

    accessibilityBridge.on('settingsChanged', (newSettings: AccessibilitySettings) => {
      setSettings(newSettings);
    });

    accessibilityBridge.on('voiceCommandProcessed', (data: any) => {
      setStatus(`Command: ${data.command}`);
      setTimeout(() => setStatus('Ready'), 3000);
    });
  };

  const openAccessibilitySettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    } else {
      Linking.openURL('App-Prefs:ACCESSIBILITY');
    }
  };

  const openGoogleMaps = () => {
    const url = Platform.OS === 'android' 
      ? 'com.google.android.apps.maps://' 
      : 'comgooglemaps://';
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback to app store
        const storeUrl = Platform.OS === 'android'
          ? 'market://details?id=com.google.android.apps.maps'
          : 'https://apps.apple.com/app/google-maps/id585027354';
        Linking.openURL(storeUrl);
      }
    });
  };

  const toggleVoiceRecognition = async () => {
    try {
      if (isListening) {
        await accessibilityBridge.stopVoiceRecognition();
        setIsListening(false);
        setStatus('Voice recognition stopped');
      } else {
        await accessibilityBridge.startVoiceRecognition();
        setIsListening(true);
        setStatus('Listening for commands...');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle voice recognition');
    }
  };

  const readDirections = async () => {
    setStatus('Reading directions...');
    await accessibilityBridge.readCurrentDirections();
  };

  const describeLocation = async () => {
    setStatus('Describing location...');
    await accessibilityBridge.describeCurrentLocation();
  };

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    const newSettings = { [key]: value };
    accessibilityBridge.updateSettings(newSettings);
  };

  const testSpeech = async () => {
    await accessibilityBridge.speak('Accessible Maps is working correctly');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Accessible Maps</Text>
        <Text style={styles.subtitle}>Google Maps Accessibility Extension</Text>
        <View style={[styles.statusBadge, isInitialized ? styles.statusReady : styles.statusError]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={openGoogleMaps}
          >
            <Text style={styles.primaryButtonText}>Open Google Maps</Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton, { flex: 1, marginRight: 8 }]} 
              onPress={readDirections}
              disabled={!isInitialized}
            >
              <Text style={styles.secondaryButtonText}>Read Directions</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton, { flex: 1, marginLeft: 8 }]} 
              onPress={describeLocation}
              disabled={!isInitialized}
            >
              <Text style={styles.secondaryButtonText}>Where Am I</Text>
            </TouchableOpacity>
          </View>

          {Platform.OS === 'android' && (
            <TouchableOpacity 
              style={[styles.actionButton, isListening ? styles.listeningButton : styles.voiceButton]} 
              onPress={toggleVoiceRecognition}
              disabled={!isInitialized}
            >
              <Text style={styles.voiceButtonText}>
                {isListening ? 'Stop Listening' : 'Start Voice Commands'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Voice Commands</Text>
            <Switch
              value={settings.voiceCommandsEnabled}
              onValueChange={(value) => updateSetting('voiceCommandsEnabled', value)}
              trackColor={{ false: '#767577', true: '#4285f4' }}
              thumbColor={settings.voiceCommandsEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Auto-Announce Directions</Text>
            <Switch
              value={settings.autoAnnounceDirections}
              onValueChange={(value) => updateSetting('autoAnnounceDirections', value)}
              trackColor={{ false: '#767577', true: '#4285f4' }}
              thumbColor={settings.autoAnnounceDirections ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>High Contrast Mode</Text>
            <Switch
              value={settings.highContrastMode}
              onValueChange={(value) => updateSetting('highContrastMode', value)}
              trackColor={{ false: '#767577', true: '#4285f4' }}
              thumbColor={settings.highContrastMode ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Large Text Mode</Text>
            <Switch
              value={settings.largeTextMode}
              onValueChange={(value) => updateSetting('largeTextMode', value)}
              trackColor={{ false: '#767577', true: '#4285f4' }}
              thumbColor={settings.largeTextMode ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity style={styles.testButton} onPress={testSpeech}>
            <Text style={styles.testButtonText}>Test Speech</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Use</Text>
          
          {Platform.OS === 'android' ? (
            <View style={styles.instructionsList}>
              <Text style={styles.instruction}>1. Enable Accessibility Service in Settings</Text>
              <Text style={styles.instruction}>2. Grant overlay permission for floating controls</Text>
              <Text style={styles.instruction}>3. Open Google Maps and start navigation</Text>
              <Text style={styles.instruction}>4. Use voice commands or floating panel buttons</Text>
              <Text style={styles.instruction}>5. Say "directions", "where am I", or "help"</Text>
            </View>
          ) : (
            <View style={styles.instructionsList}>
              <Text style={styles.instruction}>1. Install accessibility shortcuts from Shortcuts app</Text>
              <Text style={styles.instruction}>2. Enable Siri access for voice commands</Text>
              <Text style={styles.instruction}>3. Open Google Maps and start navigation</Text>
              <Text style={styles.instruction}>4. Use "Hey Siri" + command or widget buttons</Text>
              <Text style={styles.instruction}>5. Available commands: "read directions", "where am I"</Text>
            </View>
          )}
        </View>

        {/* Voice Commands */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Commands</Text>
          <View style={styles.commandsList}>
            <Text style={styles.command}>"Read directions" - Speaks current navigation step</Text>
            <Text style={styles.command}>"Where am I" - Describes current location</Text>
            <Text style={styles.command}>"Repeat" - Repeats last instruction</Text>
            <Text style={styles.command}>"Help" - Lists available commands</Text>
            {Platform.OS === 'ios' && (
              <>
                <Text style={styles.command}>"Start accessible navigation" - Begins navigation</Text>
                <Text style={styles.command}>"Find accessible route" - Shows route options</Text>
              </>
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaed',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#202124',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#5f6368',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusReady: {
    backgroundColor: '#e8f5e8',
  },
  statusError: {
    backgroundColor: '#fce8e6',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#202124',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4285f4',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dadce0',
  },
  secondaryButtonText: {
    color: '#202124',
    fontSize: 14,
    fontWeight: '500',
  },
  voiceButton: {
    backgroundColor: '#34a853',
  },
  listeningButton: {
    backgroundColor: '#ea4335',
  },
  voiceButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  settingLabel: {
    fontSize: 16,
    color: '#202124',
    flex: 1,
  },
  testButton: {
    backgroundColor: '#ff9800',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  instructionsList: {
    marginTop: 8,
  },
  instruction: {
    fontSize: 14,
    color: '#5f6368',
    marginBottom: 8,
    lineHeight: 20,
  },
  commandsList: {
    marginTop: 8,
  },
  command: {
    fontSize: 14,
    color: '#5f6368',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
  },
});

export default AccessibilityApp;

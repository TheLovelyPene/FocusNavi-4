// Content script for Google Maps accessibility enhancement

class AccessibilityEnhancer {
  constructor() {
    this.isEnabled = false;
    this.voiceCommands = null;
    this.audioFeedback = null;
    this.accessibilityPanel = null;
    this.settings = {
      voiceEnabled: true,
      audioDescriptions: true,
      highContrast: false,
      largeText: false,
      autoAnnounce: true
    };
    
    this.init();
  }

  async init() {
    // Load user settings
    await this.loadSettings();
    
    // Create accessibility panel
    this.createAccessibilityPanel();
    
    // Initialize voice commands
    this.initVoiceCommands();
    
    // Initialize audio feedback
    this.initAudioFeedback();
    
    // Monitor Google Maps changes
    this.observeMapChanges();
    
    // Add keyboard shortcuts
    this.addKeyboardShortcuts();
    
    console.log('Accessible Navigation Assistant loaded');
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get('accessibilitySettings');
      if (result.accessibilitySettings) {
        this.settings = { ...this.settings, ...result.accessibilitySettings };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set({ accessibilitySettings: this.settings });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  createAccessibilityPanel() {
    // Create floating accessibility panel
    const panel = document.createElement('div');
    panel.id = 'accessibility-panel';
    panel.className = 'accessibility-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <h3>Accessibility Assistant</h3>
        <button id="toggle-panel" class="toggle-btn">−</button>
      </div>
      <div class="panel-content">
        <div class="feature-group">
          <label>
            <input type="checkbox" id="voice-commands" ${this.settings.voiceEnabled ? 'checked' : ''}>
            Voice Commands
          </label>
          <label>
            <input type="checkbox" id="audio-descriptions" ${this.settings.audioDescriptions ? 'checked' : ''}>
            Audio Descriptions
          </label>
          <label>
            <input type="checkbox" id="high-contrast" ${this.settings.highContrast ? 'checked' : ''}>
            High Contrast
          </label>
          <label>
            <input type="checkbox" id="large-text" ${this.settings.largeText ? 'checked' : ''}>
            Large Text
          </label>
          <label>
            <input type="checkbox" id="auto-announce" ${this.settings.autoAnnounce ? 'checked' : ''}>
            Auto Announce Directions
          </label>
        </div>
        <div class="controls">
          <button id="speak-directions" class="control-btn">Speak Current Directions</button>
          <button id="describe-location" class="control-btn">Describe Current Location</button>
          <button id="find-accessible-route" class="control-btn">Find Accessible Route</button>
        </div>
        <div class="voice-status">
          <span id="voice-status">Voice: Ready</span>
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    this.accessibilityPanel = panel;

    // Add event listeners
    this.addPanelEventListeners();
    
    // Apply initial settings
    this.applySettings();
  }

  addPanelEventListeners() {
    const panel = this.accessibilityPanel;
    
    // Toggle panel
    panel.querySelector('#toggle-panel').addEventListener('click', () => {
      const content = panel.querySelector('.panel-content');
      const isVisible = content.style.display !== 'none';
      content.style.display = isVisible ? 'none' : 'block';
      panel.querySelector('#toggle-panel').textContent = isVisible ? '+' : '−';
    });

    // Settings checkboxes
    panel.querySelector('#voice-commands').addEventListener('change', (e) => {
      this.settings.voiceEnabled = e.target.checked;
      this.saveSettings();
      if (e.target.checked) {
        this.initVoiceCommands();
      } else {
        this.stopVoiceCommands();
      }
    });

    panel.querySelector('#audio-descriptions').addEventListener('change', (e) => {
      this.settings.audioDescriptions = e.target.checked;
      this.saveSettings();
    });

    panel.querySelector('#high-contrast').addEventListener('change', (e) => {
      this.settings.highContrast = e.target.checked;
      this.saveSettings();
      this.applySettings();
    });

    panel.querySelector('#large-text').addEventListener('change', (e) => {
      this.settings.largeText = e.target.checked;
      this.saveSettings();
      this.applySettings();
    });

    panel.querySelector('#auto-announce').addEventListener('change', (e) => {
      this.settings.autoAnnounce = e.target.checked;
      this.saveSettings();
    });

    // Control buttons
    panel.querySelector('#speak-directions').addEventListener('click', () => {
      this.speakCurrentDirections();
    });

    panel.querySelector('#describe-location').addEventListener('click', () => {
      this.describeCurrentLocation();
    });

    panel.querySelector('#find-accessible-route').addEventListener('click', () => {
      this.findAccessibleRoute();
    });
  }

  applySettings() {
    const body = document.body;
    
    // High contrast
    if (this.settings.highContrast) {
      body.classList.add('accessibility-high-contrast');
    } else {
      body.classList.remove('accessibility-high-contrast');
    }
    
    // Large text
    if (this.settings.largeText) {
      body.classList.add('accessibility-large-text');
    } else {
      body.classList.remove('accessibility-large-text');
    }
  }

  initVoiceCommands() {
    if (!this.settings.voiceEnabled) return;
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.voiceCommands = new SpeechRecognition();
      
      this.voiceCommands.continuous = true;
      this.voiceCommands.interimResults = false;
      this.voiceCommands.lang = 'en-US';
      
      this.voiceCommands.onstart = () => {
        this.updateVoiceStatus('Listening...');
      };
      
      this.voiceCommands.onend = () => {
        this.updateVoiceStatus('Voice: Ready');
        // Restart recognition
        if (this.settings.voiceEnabled) {
          setTimeout(() => {
            try {
              this.voiceCommands.start();
            } catch (error) {
              console.log('Voice recognition restart failed:', error);
            }
          }, 1000);
        }
      };
      
      this.voiceCommands.onresult = (event) => {
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
        this.processVoiceCommand(command);
      };
      
      this.voiceCommands.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.updateVoiceStatus('Voice: Error');
      };
      
      try {
        this.voiceCommands.start();
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
      }
    }
  }

  stopVoiceCommands() {
    if (this.voiceCommands) {
      this.voiceCommands.stop();
      this.voiceCommands = null;
      this.updateVoiceStatus('Voice: Disabled');
    }
  }

  updateVoiceStatus(status) {
    const statusElement = document.querySelector('#voice-status');
    if (statusElement) {
      statusElement.textContent = status;
    }
  }

  processVoiceCommand(command) {
    console.log('Voice command:', command);
    
    if (command.includes('directions') || command.includes('navigate')) {
      this.speakCurrentDirections();
    } else if (command.includes('where am i') || command.includes('location')) {
      this.describeCurrentLocation();
    } else if (command.includes('accessible route') || command.includes('accessibility')) {
      this.findAccessibleRoute();
    } else if (command.includes('zoom in')) {
      this.simulateMapAction('zoom-in');
    } else if (command.includes('zoom out')) {
      this.simulateMapAction('zoom-out');
    } else if (command.includes('search for')) {
      const searchTerm = command.replace('search for', '').trim();
      this.performSearch(searchTerm);
    }
  }

  initAudioFeedback() {
    this.audioFeedback = {
      speak: (text, options = {}) => {
        if (!this.settings.audioDescriptions) return;
        
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = options.rate || 1;
          utterance.pitch = options.pitch || 1;
          utterance.volume = options.volume || 0.8;
          speechSynthesis.speak(utterance);
        }
      }
    };
  }

  speakCurrentDirections() {
    // Try to find current directions on the page
    const directionsSelectors = [
      '[data-value="Directions"]',
      '.directions-travel-mode-icon',
      '.section-directions-trip',
      '.directions-mode-group-container'
    ];
    
    let directionsText = 'No directions found. Please start navigation first.';
    
    // Look for directions panel
    const directionsPanel = document.querySelector('[data-value="Directions"]');
    if (directionsPanel) {
      const steps = directionsPanel.querySelectorAll('.section-directions-step');
      if (steps.length > 0) {
        const currentStep = steps[0];
        const instruction = currentStep.querySelector('.section-directions-step-content');
        if (instruction) {
          directionsText = instruction.textContent.trim();
        }
      }
    }
    
    // Fallback: look for any visible direction text
    if (directionsText === 'No directions found. Please start navigation first.') {
      const directionElements = document.querySelectorAll('[class*="direction"], [class*="instruction"]');
      for (const element of directionElements) {
        if (element.offsetParent !== null && element.textContent.trim()) {
          directionsText = element.textContent.trim();
          break;
        }
      }
    }
    
    this.audioFeedback.speak(directionsText);
  }

  describeCurrentLocation() {
    // Try to get current location from the page
    let locationText = 'Current location information not available.';
    
    // Look for search box or current location
    const searchBox = document.querySelector('#searchboxinput');
    if (searchBox && searchBox.value) {
      locationText = `Current search: ${searchBox.value}`;
    }
    
    // Look for place information
    const placeInfo = document.querySelector('[data-value="Place info"]');
    if (placeInfo) {
      const placeName = placeInfo.querySelector('h1');
      if (placeName) {
        locationText = `Current place: ${placeName.textContent}`;
      }
    }
    
    this.audioFeedback.speak(locationText);
  }

  findAccessibleRoute() {
    // Simulate clicking on accessibility options or route alternatives
    this.audioFeedback.speak('Looking for accessible route options. Please check route alternatives in the directions panel.');
    
    // Try to find and click route options
    const routeOptions = document.querySelector('[data-value="Route options"]');
    if (routeOptions) {
      routeOptions.click();
    }
  }

  simulateMapAction(action) {
    const map = document.querySelector('#map');
    if (!map) return;
    
    switch (action) {
      case 'zoom-in':
        const zoomInBtn = document.querySelector('[data-value="Zoom in"]');
        if (zoomInBtn) zoomInBtn.click();
        this.audioFeedback.speak('Zooming in');
        break;
      case 'zoom-out':
        const zoomOutBtn = document.querySelector('[data-value="Zoom out"]');
        if (zoomOutBtn) zoomOutBtn.click();
        this.audioFeedback.speak('Zooming out');
        break;
    }
  }

  performSearch(searchTerm) {
    const searchBox = document.querySelector('#searchboxinput');
    if (searchBox) {
      searchBox.value = searchTerm;
      searchBox.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Try to submit the search
      const searchButton = document.querySelector('#searchbox-searchbutton');
      if (searchButton) {
        searchButton.click();
      }
      
      this.audioFeedback.speak(`Searching for ${searchTerm}`);
    }
  }

  observeMapChanges() {
    // Monitor for changes in the map interface
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Check for new directions
          if (this.settings.autoAnnounce) {
            this.checkForNewDirections();
          }
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  checkForNewDirections() {
    // This would check for new direction announcements
    // Implementation would depend on Google Maps' current structure
  }

  addKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Alt + A: Toggle accessibility panel
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        const panel = this.accessibilityPanel;
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      }
      
      // Alt + D: Speak directions
      if (event.altKey && event.key === 'd') {
        event.preventDefault();
        this.speakCurrentDirections();
      }
      
      // Alt + L: Describe location
      if (event.altKey && event.key === 'l') {
        event.preventDefault();
        this.describeCurrentLocation();
      }
    });
  }
}

// Initialize when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AccessibilityEnhancer();
  });
} else {
  new AccessibilityEnhancer();
}

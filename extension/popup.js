// Popup script for the accessibility extension

document.addEventListener('DOMContentLoaded', async () => {
  // Check if we're on Google Maps
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isGoogleMaps = tab.url.includes('maps.google.com') || tab.url.includes('google.com/maps');
  
  const statusElement = document.getElementById('status');
  const actionButtons = document.querySelectorAll('.action-btn');
  
  if (!isGoogleMaps) {
    statusElement.textContent = 'Please navigate to Google Maps to use this extension';
    statusElement.className = 'status inactive';
    actionButtons.forEach(btn => btn.disabled = true);
    return;
  }
  
  // Load current settings
  const settings = await chrome.storage.sync.get('accessibilitySettings');
  const currentSettings = settings.accessibilitySettings || {};
  
  // Update high contrast button text
  const contrastBtn = document.getElementById('toggle-high-contrast');
  contrastBtn.textContent = currentSettings.highContrast ? 'Disable High Contrast' : 'Enable High Contrast';
  
  // Add event listeners for quick actions
  document.getElementById('speak-directions').addEventListener('click', () => {
    executeContentScript('speakCurrentDirections');
  });
  
  document.getElementById('describe-location').addEventListener('click', () => {
    executeContentScript('describeCurrentLocation');
  });
  
  document.getElementById('toggle-high-contrast').addEventListener('click', async () => {
    const newSettings = {
      ...currentSettings,
      highContrast: !currentSettings.highContrast
    };
    
    await chrome.storage.sync.set({ accessibilitySettings: newSettings });
    executeContentScript('applySettings');
    
    contrastBtn.textContent = newSettings.highContrast ? 'Disable High Contrast' : 'Enable High Contrast';
  });
  
  document.getElementById('open-settings').addEventListener('click', () => {
    executeContentScript('showAccessibilityPanel');
  });
});

async function executeContentScript(action) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (actionName) => {
        // Find the accessibility enhancer instance
        if (window.accessibilityEnhancer) {
          switch (actionName) {
            case 'speakCurrentDirections':
              window.accessibilityEnhancer.speakCurrentDirections();
              break;
            case 'describeCurrentLocation':
              window.accessibilityEnhancer.describeCurrentLocation();
              break;
            case 'applySettings':
              window.accessibilityEnhancer.loadSettings().then(() => {
                window.accessibilityEnhancer.applySettings();
              });
              break;
            case 'showAccessibilityPanel':
              const panel = document.getElementById('accessibility-panel');
              if (panel) {
                panel.style.display = 'block';
                const content = panel.querySelector('.panel-content');
                if (content) content.style.display = 'block';
              }
              break;
          }
        }
      },
      args: [action]
    });
  } catch (error) {
    console.error('Failed to execute content script:', error);
  }
}

// Background script for the accessibility extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('Accessible Navigation Assistant installed');
  
  // Set default settings
  chrome.storage.sync.set({
    accessibilitySettings: {
      voiceEnabled: true,
      audioDescriptions: true,
      highContrast: false,
      largeText: false,
      autoAnnounce: true
    }
  });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get('accessibilitySettings', (result) => {
      sendResponse(result.accessibilitySettings || {});
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.sync.set({ accessibilitySettings: request.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Context menu for quick access
chrome.contextMenus.create({
  id: 'accessibility-menu',
  title: 'Accessibility Features',
  contexts: ['page'],
  documentUrlPatterns: ['*://maps.google.com/*', '*://www.google.com/maps/*']
});

chrome.contextMenus.create({
  id: 'speak-directions',
  parentId: 'accessibility-menu',
  title: 'Speak Current Directions',
  contexts: ['page']
});

chrome.contextMenus.create({
  id: 'describe-location',
  parentId: 'accessibility-menu',
  title: 'Describe Current Location',
  contexts: ['page']
});

chrome.contextMenus.create({
  id: 'find-accessible-route',
  parentId: 'accessibility-menu',
  title: 'Find Accessible Route',
  contexts: ['page']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const actions = {
    'speak-directions': 'speakCurrentDirections',
    'describe-location': 'describeCurrentLocation',
    'find-accessible-route': 'findAccessibleRoute'
  };
  
  const action = actions[info.menuItemId];
  if (action) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (actionName) => {
        if (window.accessibilityEnhancer) {
          window.accessibilityEnhancer[actionName]();
        }
      },
      args: [action]
    });
  }
});

// Badge to show extension status
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('maps.google.com') || tab.url.includes('google.com/maps')) {
      chrome.action.setBadgeText({ text: 'ON', tabId: tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#4285f4', tabId: tabId });
    } else {
      chrome.action.setBadgeText({ text: '', tabId: tabId });
    }
  }
});

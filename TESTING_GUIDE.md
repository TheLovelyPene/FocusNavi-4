# Testing Guide: Accessible Navigation Projects

## 🚀 Quick Start Testing

### Prerequisites
- Chrome browser installed
- Internet connection
- Microphone access (for voice features)

## 📱 Testing the Standalone Navigation App

### Step 1: Set Up Mapbox (Required)
1. **Create Mapbox Account**:
   - Go to [mapbox.com](https://www.mapbox.com/)
   - Sign up for a free account (includes 50,000 free requests/month)
   - Verify your email

2. **Get API Key**:
   - Go to [Account > Access Tokens](https://account.mapbox.com/access-tokens/)
   - Click "Create a token"
   - Name: `Accessible Navigation App`
   - Scopes: Check `styles:read`, `fonts:read`, `datasets:read`, `vision:read`
   - Click "Create token"
   - **Copy the token** (starts with `pk.`)

3. **Configure in Leap**:
   - In your Leap project, go to **Infrastructure** tab
   - Click "Add Secret"
   - Secret Name: `MapboxApiKey`
   - Secret Value: [Paste your Mapbox token]
   - Click "Save"

### Step 2: Test the App
1. **Start the App**:
   - The app should automatically restart after adding the secret
   - Navigate to your app URL (provided by Leap)

2. **Test Basic Navigation**:
   ```
   Origin: 1600 Amphitheatre Parkway, Mountain View, CA
   Destination: 1 Hacker Way, Menlo Park, CA
   ```
   - Enable "Prefer accessible paths"
   - Click "Start Navigation"
   - Verify route calculation works

3. **Test Voice Commands**:
   - Allow microphone access when prompted
   - Say "Hey Assistant, where am I?"
   - Say "Hey Assistant, next step"
   - Check that AI responds appropriately

4. **Test Satellite Imagery**:
   - Click the "Satellite" button during navigation
   - Verify satellite image loads
   - Check attribution shows "© Mapbox © OpenStreetMap"

5. **Test Accessibility Features**:
   - Try different route preferences
   - Test audio settings (volume, speech rate)
   - Verify large text and high contrast work

## 🌐 Testing the Chrome Extension

### Step 1: Install Extension for Development
1. **Load Extension**:
   - Open Chrome
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `extension/` folder from your project
   - Extension should appear in your extensions list

2. **Verify Installation**:
   - Look for the extension icon in Chrome toolbar
   - Icon should show "Accessible Navigation Assistant"

### Step 2: Test on Google Maps
1. **Navigate to Google Maps**:
   - Go to [maps.google.com](https://maps.google.com)
   - Extension badge should show "ON"
   - Look for accessibility panel in top-right corner

2. **Test Basic Features**:
   - Click extension icon to open popup
   - Verify status shows "Extension Active on Google Maps"
   - Try quick action buttons in popup

3. **Test Voice Commands**:
   - Allow microphone access when prompted
   - Say "directions" (should speak current directions)
   - Say "where am I" (should describe location)
   - Say "zoom in" (should zoom the map)

4. **Test Keyboard Shortcuts**:
   - Press `Alt + A` (should toggle accessibility panel)
   - Press `Alt + D` (should speak directions)
   - Press `Alt + L` (should describe location)

5. **Test Accessibility Features**:
   - Enable "High Contrast" in panel
   - Enable "Large Text" mode
   - Verify visual changes apply to Google Maps

### Step 3: Test with Real Navigation
1. **Start Navigation on Google Maps**:
   - Search for a destination
   - Click "Directions"
   - Start navigation
   - Extension should detect and announce directions

2. **Test Auto-Announce**:
   - Enable "Auto Announce Directions" in panel
   - Follow navigation steps
   - Verify automatic announcements work

## 🔧 Troubleshooting Common Issues

### Standalone App Issues

#### "Unauthorized" Error
```
Problem: Mapbox API returns 401 Unauthorized
Solution: 
1. Check API key is correct in Infrastructure tab
2. Verify token has required scopes
3. Ensure token is active (not expired)
```

#### Route Calculation Fails
```
Problem: "Could not geocode addresses"
Solution:
1. Try simpler addresses (e.g., "San Francisco, CA")
2. Check internet connection
3. Verify Mapbox quota not exceeded
4. App will fallback to demo route if API fails
```

#### Voice Commands Not Working
```
Problem: "Hey Assistant" not responding
Solution:
1. Allow microphone permissions
2. Speak clearly and wait for response
3. Check browser console for errors
4. Try refreshing the page
```

#### Satellite Images Not Loading
```
Problem: Satellite button shows error
Solution:
1. Check Mapbox API key has styles:read scope
2. Verify internet connection
3. Check browser console for CORS errors
```

### Chrome Extension Issues

#### Extension Not Loading
```
Problem: Extension doesn't appear or work
Solution:
1. Ensure Developer mode is enabled
2. Check for errors in chrome://extensions/
3. Reload extension after code changes
4. Check console for JavaScript errors
```

#### Voice Recognition Not Working
```
Problem: "Voice not working" in popup
Solution:
1. Allow microphone permissions for Google Maps
2. Use HTTPS (required for speech recognition)
3. Try different browser (Chrome works best)
4. Check if speech recognition is supported
```

#### Settings Not Saving
```
Problem: Preferences reset after reload
Solution:
1. Check Chrome storage permissions
2. Verify extension has storage permission
3. Check browser console for storage errors
4. Try clearing extension data and reloading
```

#### High Contrast Not Applying
```
Problem: Visual changes don't appear
Solution:
1. Reload Google Maps page
2. Check if other extensions conflict
3. Verify CSS is loading properly
4. Try disabling/re-enabling the feature
```

## 📊 Testing Checklist

### Standalone App Testing
- [ ] Mapbox API key configured correctly
- [ ] Route calculation works with real addresses
- [ ] Satellite imagery loads and displays
- [ ] Voice commands respond ("Hey Assistant...")
- [ ] AI provides helpful responses
- [ ] Audio settings affect speech output
- [ ] Accessibility preferences work
- [ ] Navigation steps advance properly
- [ ] Mobile responsive design works
- [ ] Error handling works (try invalid addresses)

### Chrome Extension Testing
- [ ] Extension loads on Google Maps
- [ ] Accessibility panel appears and functions
- [ ] Voice commands work ("directions", "where am I")
- [ ] Keyboard shortcuts respond (Alt+A, Alt+D, Alt+L)
- [ ] Settings persist between sessions
- [ ] High contrast mode applies correctly
- [ ] Large text mode works
- [ ] Audio feedback plays
- [ ] Context menu items work
- [ ] Extension popup functions correctly

## 🎯 Advanced Testing Scenarios

### Real-World Usage Testing
1. **Daily Commute Simulation**:
   - Use your actual home and work addresses
   - Test during different times of day
   - Verify accessibility route preferences

2. **Accessibility User Testing**:
   - Test with screen reader software
   - Navigate using only keyboard
   - Test with high contrast displays
   - Verify voice commands work in noisy environments

3. **Mobile Testing**:
   - Test standalone app on mobile browsers
   - Verify touch interactions work
   - Check responsive design on different screen sizes

4. **Performance Testing**:
   - Test with slow internet connections
   - Monitor API usage and quotas
   - Check memory usage during long navigation sessions

### Edge Case Testing
1. **Network Issues**:
   - Test with intermittent internet
   - Verify fallback to demo data works
   - Check error messages are helpful

2. **Invalid Inputs**:
   - Try nonsense addresses
   - Test empty form submissions
   - Verify error handling is graceful

3. **Browser Compatibility**:
   - Test in different Chrome versions
   - Check with various browser settings
   - Verify with different languages/locales

## 📈 Success Metrics

### Functional Testing
- ✅ All features work as expected
- ✅ No JavaScript errors in console
- ✅ API calls succeed consistently
- ✅ Voice recognition accuracy > 80%
- ✅ Navigation steps are clear and helpful

### Accessibility Testing
- ✅ Screen reader compatible
- ✅ Keyboard navigation works
- ✅ High contrast mode improves visibility
- ✅ Large text mode is readable
- ✅ Voice commands reduce manual interaction

### Performance Testing
- ✅ App loads in < 3 seconds
- ✅ Route calculation in < 5 seconds
- ✅ Satellite images load in < 2 seconds
- ✅ Voice response time < 1 second
- ✅ Memory usage stays reasonable

## 🚀 Next Steps After Testing

### If Everything Works
1. **Standalone App**: Ready for production use
2. **Chrome Extension**: Ready for Chrome Web Store submission
3. **Start gathering user feedback**
4. **Plan premium features**

### If Issues Found
1. **Check this troubleshooting guide**
2. **Review browser console errors**
3. **Test with different browsers/devices**
4. **Contact support if needed**

## 📞 Getting Help

### Resources
- **Mapbox Docs**: [docs.mapbox.com](https://docs.mapbox.com/)
- **Chrome Extension Docs**: [developer.chrome.com/docs/extensions/](https://developer.chrome.com/docs/extensions/)
- **Web Speech API**: [developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

### Support
- **GitHub Issues**: For bugs and feature requests
- **Email**: support@accessiblenavigation.com
- **Community**: Accessibility developer forums

---

**🎉 Happy Testing! You're building something that will make navigation accessible for everyone.**

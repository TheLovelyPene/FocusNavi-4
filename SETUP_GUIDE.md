# Setup Guide: Accessible Navigation Projects

## 🎯 Overview

This guide will help you set up both the standalone navigation app and the Chrome extension for development and production use.

## 📋 Prerequisites

- Node.js 18 or higher
- Chrome browser (for extension development)
- Mapbox account (free tier available)
- Basic knowledge of TypeScript/React

## 🗺️ Mapbox Setup (Required for Standalone App)

### Step 1: Create Mapbox Account
1. Go to [mapbox.com](https://www.mapbox.com/)
2. Click "Sign up" and create a free account
3. Verify your email address

### Step 2: Generate Access Token
1. Go to [Account > Access Tokens](https://account.mapbox.com/access-tokens/)
2. Click "Create a token"
3. Configure token settings:
   - **Token name**: `Accessible Navigation App`
   - **Scopes** (check these boxes):
     - ✅ `styles:read` - For satellite imagery
     - ✅ `fonts:read` - For map text rendering
     - ✅ `datasets:read` - For route data
     - ✅ `vision:read` - For traffic data
   - **URL restrictions**: Leave empty for development
4. Click "Create token"
5. **Copy the token** - you'll need it in the next step

### Step 3: Configure in Leap
1. Open your Leap project
2. Go to the **Infrastructure** tab
3. Click "Add Secret"
4. Enter:
   - **Secret Name**: `MapboxApiKey`
   - **Secret Value**: [Paste your Mapbox token here]
5. Click "Save"

### Step 4: Test the Integration
1. Start your app (it should restart automatically)
2. Try creating a route with real addresses
3. Check the satellite imagery feature
4. Verify route calculation works

## 🔧 Standalone App Development

### Local Development
```bash
# The app runs automatically with Encore.ts
# No additional setup needed once Mapbox is configured
```

### Environment Configuration
The app will automatically use:
- **Development**: Mapbox sandbox environment
- **Production**: Full Mapbox API access

### Testing Real Routes
Try these test addresses to verify everything works:
- **Origin**: `1600 Amphitheatre Parkway, Mountain View, CA`
- **Destination**: `1 Hacker Way, Menlo Park, CA`

## 🌐 Chrome Extension Setup

### Development Installation
1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Toggle "Developer mode" ON (top right)
4. Click "Load unpacked"
5. Select the `extension/` folder from this project
6. The extension should now appear in your extensions list

### Testing the Extension
1. Navigate to [Google Maps](https://maps.google.com)
2. Look for the accessibility panel in the top-right corner
3. Try the voice commands:
   - Say "directions" to hear current directions
   - Say "where am I" to hear location info
   - Use keyboard shortcuts: Alt+A, Alt+D, Alt+L

### Extension Development
```bash
# Make changes to extension files
# Reload the extension in chrome://extensions/
# Test on Google Maps
```

## 🚀 Production Deployment

### Standalone App
- Automatically deployed with Encore.ts
- Update Mapbox token URL restrictions for production domain
- Monitor usage in Mapbox dashboard

### Chrome Extension Store Submission

#### 1. Prepare Assets
The extension includes all required files:
- ✅ `manifest.json` (Manifest V3 compliant)
- ✅ Icons (16px, 48px, 128px) - **Need to be created**
- ✅ Screenshots for store listing
- ✅ Privacy policy and description

#### 2. Create Store Listing
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Pay $5 one-time developer fee
3. Click "Add new item"
4. Upload the extension ZIP file
5. Fill out store listing:
   - **Title**: "Accessible Navigation Assistant"
   - **Description**: Use the description from README.md
   - **Category**: "Accessibility"
   - **Screenshots**: Include before/after Google Maps images

#### 3. Required Store Assets
Create these files in `extension/icons/`:
- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels  
- `icon128.png` - 128x128 pixels

## 🎨 Creating Extension Icons

### Icon Requirements
- **Style**: Clean, accessible design
- **Colors**: Blue (#4285f4) and white
- **Symbol**: Navigation/accessibility themed
- **Format**: PNG with transparency

### Suggested Design
- Base: Blue circle background
- Icon: White accessibility symbol + navigation arrow
- Text: None (icons should be symbolic only)

### Tools for Icon Creation
- **Free**: GIMP, Canva, Figma
- **Paid**: Adobe Illustrator, Sketch
- **AI**: Midjourney, DALL-E for initial concepts

## 🔍 Testing Checklist

### Standalone App
- [ ] Route calculation works with real addresses
- [ ] Satellite imagery loads correctly
- [ ] Voice commands respond properly
- [ ] Accessibility features function (high contrast, large text)
- [ ] Mobile responsive design works

### Chrome Extension
- [ ] Loads on Google Maps without errors
- [ ] Voice recognition activates
- [ ] Audio feedback plays
- [ ] Settings persist between sessions
- [ ] Keyboard shortcuts work
- [ ] High contrast mode applies correctly

## 🐛 Troubleshooting

### Common Issues

#### Mapbox API Errors
- **Error**: "Unauthorized" → Check API key is correct
- **Error**: "Rate limit exceeded" → Upgrade Mapbox plan or reduce requests
- **Error**: "Invalid coordinates" → Verify address geocoding

#### Extension Issues
- **Not loading**: Check Developer mode is enabled
- **Voice not working**: Ensure microphone permissions granted
- **Settings not saving**: Check Chrome storage permissions

#### General Issues
- **Slow performance**: Check network connection and API quotas
- **UI not responsive**: Clear browser cache and reload

## 📞 Getting Help

### Resources
- **Mapbox Documentation**: [docs.mapbox.com](https://docs.mapbox.com/)
- **Chrome Extension Docs**: [developer.chrome.com/docs/extensions/](https://developer.chrome.com/docs/extensions/)
- **Encore.ts Docs**: [encore.dev/docs](https://encore.dev/docs)

### Support Channels
- **GitHub Issues**: For bugs and feature requests
- **Email**: support@accessiblenavigation.com
- **Community**: Join our accessibility developer community

---

**🎉 You're all set! Start building accessible navigation experiences.**

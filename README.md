# Accessible Navigation Projects

This repository contains two complementary accessibility navigation solutions:

1. **Standalone Accessible Navigation App** - A complete navigation application with real-time satellite data
2. **Google Maps Accessibility Extension** - A Chrome extension that enhances Google Maps with accessibility features

## 🚀 Quick Start

### Standalone Navigation App

#### Prerequisites
- Node.js 18+ installed
- Mapbox account and API key

#### Setup Instructions

1. **Get a Mapbox API Key**
   - Go to [Mapbox Account](https://account.mapbox.com/access-tokens/)
   - Create a new access token with these scopes:
     - `styles:read`
     - `fonts:read` 
     - `datasets:read`
     - `vision:read`
   - Copy your access token

2. **Configure the Backend**
   - In the Leap UI, go to the **Infrastructure** tab
   - Add a new secret called `MapboxApiKey`
   - Paste your Mapbox access token as the value

3. **Run the Application**
   ```bash
   # The app will automatically start with Encore.ts
   # Navigate to your app URL to begin using it
   ```

#### Features
- ✅ Real-time route calculation using Mapbox
- ✅ Satellite imagery integration  
- ✅ Accessibility-focused path descriptions
- ✅ Voice commands and AI assistance
- ✅ Traffic data and route alternatives
- ✅ Large text and high contrast interface

### Chrome Extension

#### Installation for Development
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `extension/` folder
4. Navigate to Google Maps to start using the extension

#### Features
- ✅ Voice commands for hands-free navigation
- ✅ Audio descriptions of directions
- ✅ High contrast and large text modes
- ✅ Keyboard shortcuts for quick access
- ✅ Automatic direction announcements
- ✅ Accessible route finding

## 💰 Monetization Strategy

### Extension Monetization
- **Freemium Model**: Basic features free, premium features $2.99/month
- **Enterprise Licensing**: Custom solutions for organizations
- **Partnership Revenue**: Integration with accessibility organizations
- **Data Insights**: Anonymous usage analytics (privacy-compliant)

### Revenue Projections
- **Year 1**: $50K-100K (1,000 premium users)
- **Year 2**: $200K-500K (5,000 premium users + enterprise deals)
- **Year 3**: $500K-1M+ (scale + partnerships)

## 🛠 Development

### Backend (Encore.ts)
- **Navigation Service**: Route calculation and satellite imagery
- **AI Service**: Voice command processing
- **Real-time APIs**: Traffic data and route optimization

### Frontend (React + TypeScript)
- **Accessible UI**: Large text, high contrast, keyboard navigation
- **Voice Integration**: Speech recognition and text-to-speech
- **Responsive Design**: Works on all screen sizes

### Extension (Chrome Extension Manifest V3)
- **Content Scripts**: Enhance Google Maps interface
- **Background Service**: Handle voice commands and settings
- **Popup Interface**: Quick access to features

## 📱 Browser Support

### Standalone App
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Chrome Extension
- ✅ Chrome 88+ (Manifest V3 required)
- 🔄 Firefox version coming soon

## 🔒 Privacy & Security

### Data Protection
- ✅ No personal data collection
- ✅ Local storage only
- ✅ GDPR compliant
- ✅ Accessibility-first design

### Permissions
- **Extension**: Only Google Maps pages, local storage, voice recognition
- **App**: Geolocation (optional), voice recognition (optional)

## 🚀 Deployment

### Standalone App
- Automatically deployed with Encore.ts
- Scales automatically based on usage
- Built-in monitoring and logging

### Chrome Extension
- Ready for Chrome Web Store submission
- Includes all required assets and documentation
- Manifest V3 compliant

## 📞 Support

- **Documentation**: [Full Documentation]
- **Issues**: GitHub Issues
- **Email**: support@accessiblenavigation.com

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Made with ❤️ for accessibility and inclusion**

# Chrome Extension Testing Instructions

## 🎯 Quick Test Setup (5 minutes)

### Step 1: Install Extension
1. Download/clone this project
2. Open Chrome → `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" → Select `extension/` folder
5. Extension should appear with placeholder icon

### Step 2: Test on Google Maps
1. Go to [maps.google.com](https://maps.google.com)
2. Look for accessibility panel (top-right corner)
3. Click extension icon in toolbar for popup

## 🧪 Feature Testing

### Voice Commands Test
```
1. Allow microphone access when prompted
2. Say clearly: "directions"
   → Should speak current directions or "No directions found"
3. Say: "where am I"
   → Should describe current location or search
4. Say: "zoom in"
   → Should zoom the map
5. Say: "search for coffee"
   → Should search for coffee shops
```

### Keyboard Shortcuts Test
```
1. Press Alt + A
   → Should toggle accessibility panel
2. Press Alt + D  
   → Should speak current directions
3. Press Alt + L
   → Should describe current location
```

### Visual Accessibility Test
```
1. Check "High Contrast" in panel
   → Page should become higher contrast
2. Check "Large Text"
   → Text should become larger
3. Uncheck both
   → Should return to normal
```

### Settings Persistence Test
```
1. Enable some features in panel
2. Refresh Google Maps page
3. Check panel again
   → Settings should be remembered
```

## 🔍 Expected Behaviors

### ✅ What Should Work
- Extension loads without errors
- Accessibility panel appears on Google Maps
- Voice recognition starts (with permission)
- Keyboard shortcuts respond
- Settings save between sessions
- Audio feedback plays
- Visual modes apply correctly

### ⚠️ Known Limitations
- Voice commands work best in quiet environments
- Some Google Maps elements may not be accessible
- Speech recognition requires HTTPS
- Works only on Google Maps pages

## 🐛 Common Issues & Solutions

### Extension Not Loading
```
Problem: Extension doesn't appear
Solution: 
1. Check Developer mode is ON
2. Look for errors in chrome://extensions/
3. Reload extension
4. Check file permissions
```

### Voice Not Working
```
Problem: "Voice: Error" or no response
Solution:
1. Allow microphone permissions
2. Refresh page and try again
3. Check if using HTTPS
4. Try different browser
```

### Panel Not Appearing
```
Problem: No accessibility panel on Google Maps
Solution:
1. Refresh Google Maps page
2. Check extension is enabled
3. Look in different corners of page
4. Check browser console for errors
```

### Settings Not Saving
```
Problem: Preferences reset after refresh
Solution:
1. Check storage permissions
2. Clear extension data and reload
3. Check for browser storage issues
```

## 📱 Testing Different Scenarios

### Test with Navigation Active
1. Start navigation on Google Maps
2. Enable "Auto Announce Directions"
3. Follow route and listen for announcements

### Test Popup Functionality
1. Click extension icon
2. Try all quick action buttons
3. Verify status shows correctly

### Test Context Menu
1. Right-click on Google Maps
2. Look for "Accessibility Features" menu
3. Try submenu options

## 🎯 Success Criteria

### Basic Functionality ✅
- [ ] Extension loads without errors
- [ ] Panel appears on Google Maps
- [ ] Voice recognition activates
- [ ] Keyboard shortcuts work
- [ ] Settings persist

### Accessibility Features ✅
- [ ] High contrast mode works
- [ ] Large text mode works
- [ ] Audio feedback plays
- [ ] Voice commands respond
- [ ] Keyboard navigation works

### User Experience ✅
- [ ] Interface is intuitive
- [ ] Features are discoverable
- [ ] Error messages are helpful
- [ ] Performance is smooth

## 🚀 Ready for Chrome Web Store?

If all tests pass, the extension is ready for:
1. **Icon creation** (16px, 48px, 128px)
2. **Screenshots** for store listing
3. **Chrome Web Store submission**
4. **User feedback collection**

## 📞 Need Help?

### Quick Fixes
- **Reload extension** in chrome://extensions/
- **Refresh Google Maps** page
- **Check browser console** for errors
- **Try incognito mode** to test clean state

### Still Having Issues?
- Check the main TESTING_GUIDE.md for detailed troubleshooting
- Review browser console errors
- Test in different Chrome versions
- Contact support if problems persist

---

**🎉 The extension is designed to work out-of-the-box. Most issues are permission-related and easily fixed!**

# Extension Icons

This folder should contain the required Chrome extension icons:

## Required Files
- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon48.png` - 48x48 pixels (extension management page)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Design Guidelines

### Style Requirements
- **Format**: PNG with transparency
- **Background**: Blue (#4285f4) circle
- **Foreground**: White accessibility/navigation symbol
- **Style**: Clean, modern, recognizable at small sizes

### Suggested Design Elements
- Accessibility symbol (♿) combined with navigation arrow
- Or: Person with navigation assistance
- Or: Map pin with accessibility indicator

### Design Tools
- **Free**: Canva, GIMP, Figma (free tier)
- **Online**: Favicon.io, IconGenerator
- **AI**: Use prompts like "accessibility navigation icon, blue and white, clean design"

### Quick Creation Steps
1. Create 128x128 canvas with transparent background
2. Add blue circle (#4285f4) filling most of the canvas
3. Add white accessibility/navigation symbol in center
4. Export as PNG
5. Resize to create 48x48 and 16x16 versions

## Temporary Solution
Until custom icons are created, you can use placeholder icons:
- Download free accessibility icons from [Heroicons](https://heroicons.com/) or [Feather Icons](https://feathericons.com/)
- Use online tools like [Favicon Generator](https://favicon.io/) to create multiple sizes

## Chrome Web Store Requirements
- Icons must be exactly the specified dimensions
- PNG format with transparency support
- Clear and recognizable at 16px size
- Consistent design across all sizes
- No copyrighted material

## Testing Icons
1. Replace placeholder icons with your designs
2. Reload extension in `chrome://extensions/`
3. Check icon appears correctly in:
   - Browser toolbar
   - Extension popup
   - Extension management page
   - Chrome Web Store listing (when submitted)

# Asset Creation Guide for TradeTimer Mobile App

Complete guide for creating all visual assets required for App Store and Google Play Store submission.

## Table of Contents

1. [Required Assets Overview](#required-assets-overview)
2. [App Icon Creation](#app-icon-creation)
3. [Screenshot Creation](#screenshot-creation)
4. [Feature Graphic (Android)](#feature-graphic-android)
5. [Promotional Assets](#promotional-assets)
6. [Asset Generation Scripts](#asset-generation-scripts)
7. [Quality Checklist](#quality-checklist)

---

## Required Assets Overview

### Must-Have Assets

| Asset | Platform | Size | Format | Priority |
|-------|----------|------|--------|----------|
| App Icon | Both | 1024x1024 | PNG | Critical |
| Screenshots (5-10) | Both | Various | PNG/JPG | Critical |
| Feature Graphic | Android | 1024x500 | PNG/JPG | Critical |
| Promotional Text | Both | Text | - | High |

### Optional Assets

| Asset | Platform | Purpose | Priority |
|-------|----------|---------|----------|
| Promo Video | Both | Marketing | Medium |
| Tablet Screenshots | Both | iPad/Tablet users | Low |
| Apple Watch Assets | iOS | Watch app | Low |

---

## App Icon Creation

### Design Guidelines

The TradeTimer app icon should:

1. **Be simple and recognizable** at all sizes (16x16 to 1024x1024)
2. **Use the brand color** #0369a1 (professional blue)
3. **Avoid text** - use a symbol or monogram only
4. **Work on any background** - test on light and dark
5. **Be professional** - this is a business tool

### Design Concepts

**Option 1: Minimalist Clock**
```
┌─────────┐
│    ⏱    │  Simple clock icon
│  Trade  │  with "T" marker
│  Timer  │
└─────────┘
```

**Option 2: TT Monogram**
```
┌─────────┐
│   ╔╦╗   │  Bold "TT" letters
│   ║ ║   │  in modern sans-serif
│   ╩ ╩   │
└─────────┘
```

**Option 3: Abstract Timer**
```
┌─────────┐
│   ◐     │  Circular progress
│   ●     │  indicator with dot
│         │
└─────────┘
```

### Design Specifications

**Source File Requirements:**
- Dimensions: 1024x1024 pixels
- Format: PNG with transparency
- Color space: sRGB
- Resolution: 72 DPI minimum
- No alpha/transparency in background for iOS

**Color Palette:**
- Primary: #0369a1 (TradeTimer blue)
- Secondary: #0c4a6e (darker blue)
- Accent: #f8fafc (light gray/white)
- Background: #ffffff or gradient

### Design Tools

**Free Tools:**
- **Figma** (Web-based, free tier): https://figma.com
- **Canva** (Templates available): https://canva.com
- **Photopea** (Free Photoshop alternative): https://photopea.com

**Paid Tools:**
- **Adobe Illustrator** (Vector, best quality)
- **Sketch** (Mac only)
- **Affinity Designer** (One-time purchase)

### Using the Icon Generator

Once you have your 1024x1024 source icon:

```bash
# 1. Install dependencies
cd mobile
npm install --save-dev sharp

# 2. Place your source icon
# Save as: mobile/assets/icon-source.png

# 3. Generate all sizes
node scripts/generate-icons.js

# 4. Verify output
# Check: mobile/assets/icons/ios/
#        mobile/assets/icons/android/
#        mobile/assets/icons/android-adaptive/
```

The script automatically generates:
- **10 iOS sizes** (20pt to 1024x1024)
- **6 Android sizes** (mdpi to xxxhdpi + Play Store)
- **5 Android adaptive sizes** (108dp to 432dp)

### Icon Testing

Test your icon on various backgrounds:

```bash
# Test icon visibility
# 1. View on white background (#ffffff)
# 2. View on black background (#000000)
# 3. View on colored backgrounds (blue, red, green)
# 4. View at 16x16 (smallest iOS size)
# 5. View at 1024x1024 (App Store display)
```

**Common Icon Mistakes:**
- ❌ Too much detail (illegible at small sizes)
- ❌ Using text (doesn't scale well)
- ❌ Low contrast (hard to see)
- ❌ Copying competitor designs
- ❌ Using photos/realistic images

**Icon Best Practices:**
- ✅ Simple, bold shapes
- ✅ High contrast
- ✅ Unique and memorable
- ✅ Works in monochrome
- ✅ Represents the app's purpose

---

## Screenshot Creation

### Screenshot Requirements

**iOS (App Store Connect):**
- **Required:** 6.7" iPhone (1290x2796) - 3-10 screenshots
- **Optional:** 5.5" iPhone (1242x2208)
- **Optional:** 12.9" iPad Pro (2048x2732)
- **Format:** PNG or JPEG
- **Max file size:** 500 MB per screenshot

**Android (Google Play Console):**
- **Required:** Phone (1080x1920 minimum) - 2-8 screenshots
- **Optional:** 7" Tablet (1024x600)
- **Optional:** 10" Tablet (1280x800)
- **Format:** PNG or JPEG (24-bit)
- **Max file size:** 8 MB per screenshot

### Screenshot Strategy

**5 Core Screenshots (in order):**

1. **Timer Screen** - "Simple Time Tracking"
   - Show the main timer interface
   - Display a running timer with client selected
   - Highlight: Real-time earnings, one-tap start

2. **Clients List** - "Manage Your Clients"
   - Show 3-4 clients with different rates
   - Display contact info and hourly rates
   - Highlight: Easy organization, custom rates

3. **Time Entries** - "Complete History"
   - Show recent time entries list
   - Display earnings and durations
   - Highlight: Edit, export, detailed logs

4. **Reports** - "Insightful Analytics"
   - Show weekly/monthly breakdown
   - Display charts and client totals
   - Highlight: PDF export, earnings trends

5. **Invoices** - "Professional Billing"
   - Show invoice list or sample invoice
   - Display payment status
   - Highlight: Auto-generation, payment tracking

### Screenshot Creation Methods

#### Method 1: Real App Screenshots (Recommended)

**Best for:** Authenticity and accuracy

```bash
# iOS Device
1. Run app on physical device or simulator
2. Navigate to each key screen
3. Take screenshot: Home + Power (or Volume Up + Power)
4. Transfer to Mac via AirDrop or Finder
5. Use Preview or Photoshop to add text/annotations

# Android Device
1. Run app on physical device or emulator
2. Navigate to each key screen
3. Take screenshot: Power + Volume Down
4. Transfer via USB or Google Photos
5. Use Android Studio or image editor for annotations
```

**Screenshot Enhancement Tips:**
- Add title text at top (e.g., "Simple Time Tracking")
- Add subtitle/tagline (e.g., "Track time in seconds")
- Add device frame (optional - makes it look more app-like)
- Use consistent branding colors
- Keep text readable (24pt+ font size)

#### Method 2: Template Screenshots

**Best for:** Quick mockups before app is ready

```bash
# Generate HTML templates
cd mobile
npm install
node scripts/generate-screenshots.js

# Open templates
# 1. Navigate to: mobile/store-assets/screenshot-templates/
# 2. Open index.html in browser
# 3. Click each template
# 4. Hide instructions
# 5. Take browser screenshot (full page)
# 6. Save with suggested filename
```

Templates include:
- All 5 core screens
- iOS sizes (6.7", 6.5", 5.5", 12.9" iPad)
- Android size (1080x1920)
- Professional design with TradeTimer branding

### Screenshot Text Guidelines

**Title (Large):**
- Font: SF Pro Display (iOS) or Roboto (Android)
- Size: 48-72pt
- Weight: Bold/Heavy
- Color: White or #1e293b
- Keep it short: 2-5 words

**Subtitle (Medium):**
- Font: Same as title
- Size: 24-36pt
- Weight: Semibold
- Color: #64748b or white
- Descriptive: 3-7 words

**Body Text (Small):**
- Font: Same family
- Size: 14-20pt
- Weight: Regular/Medium
- Color: #64748b
- Brief description: 1-2 sentences

### Screenshot Composition

**Layout Best Practices:**
1. **Device in center** - App screenshot centered
2. **Text at top or bottom** - Don't overlap important UI
3. **Use negative space** - Don't crowd the image
4. **Consistent style** - All screenshots match
5. **Highlight key features** - Use arrows/circles sparingly

**Background Options:**
- Solid color (white, #f8fafc, gradient)
- Gradient (brand colors: #0369a1 to #0c4a6e)
- Blurred app interface
- Professional pattern

### Tools for Screenshot Enhancement

**Free Tools:**
- **Figma** - Professional mockup tool
- **Canva** - Template-based design
- **Previewed.app** - Device mockup generator
- **Shotsnapp** - Quick device frames

**Paid Tools:**
- **Adobe Photoshop** - Professional editing
- **Sketch** - Mac design tool
- **Rotato** - 3D device mockups
- **App Screenshot Maker** - Specialized tool

### Screenshot Optimization

Before uploading:

```bash
# Optimize file size (ImageOptim for Mac, TinyPNG for web)
# Target: Under 500KB per screenshot (iOS), 1-2MB (Android)

# Check dimensions
# iOS: Exactly 1290x2796 (6.7") or required size
# Android: At least 1080x1920

# Verify text readability
# Zoom out to 25% - can you still read the title?
# Test on mobile screen - is text too small?
```

---

## Feature Graphic (Android)

### Requirements

**Google Play Feature Graphic:**
- **Size:** 1024x500 pixels (exact)
- **Format:** PNG or JPEG (24-bit)
- **Max file size:** 1 MB
- **Purpose:** Displayed at top of Play Store listing

### Design Guidelines

**Content:**
1. **App name** - "TradeTimer" prominently displayed
2. **Tagline** - "Professional Time Tracking"
3. **Key visual** - App icon or illustration
4. **Clean design** - Not too busy

**Layout:**
```
┌───────────────────────────────────────────┐
│  [Icon]  TradeTimer                       │
│          Professional Time Tracking       │
│          for Freelancers                  │
└───────────────────────────────────────────┘
```

**Color Scheme:**
- Background: Gradient (#0369a1 to #0c4a6e)
- Text: White (#ffffff)
- Accent: Light blue (#38bdf8)

### Figma Template

**Create in Figma:**
1. New file, Frame: 1024x500
2. Add gradient background
3. Place app icon (192x192) on left
4. Add "TradeTimer" text (72pt, bold)
5. Add tagline (32pt, regular)
6. Export as PNG (2x for quality)

### Design Variations

**Variation 1: Icon + Text**
- Large app icon on left (30% of width)
- App name and tagline on right
- Solid or gradient background

**Variation 2: Screenshot Preview**
- Blurred app screenshot as background
- Text overlay with dark overlay
- Highlights key feature

**Variation 3: Minimalist**
- Centered app name
- Small icon above
- Clean white or gradient background

### Testing

Before uploading:
- [ ] Exactly 1024x500 pixels
- [ ] Under 1 MB file size
- [ ] Readable text at thumbnail size
- [ ] No pixelation or artifacts
- [ ] Matches brand style
- [ ] No prohibited content (pricing, etc.)

---

## Promotional Assets

### App Store Promotional Text (Optional)

**170 characters max** - Displayed above main description

Example:
```
Track billable hours effortlessly. Real-time earnings, professional invoices,
and insightful reports for freelancers and contractors.
```

### Google Play Promo Video (Optional)

**Requirements:**
- YouTube video URL
- 30 seconds to 2 minutes
- Showcases key features
- Professional quality

**Script Outline:**
1. Problem (0-5s): "Losing track of billable hours?"
2. Solution (5-15s): "TradeTimer makes time tracking simple"
3. Features (15-50s): Quick demo of timer, clients, reports
4. CTA (50-60s): "Download TradeTimer today"

### Short Description (Google Play)

**80 characters max**

Example:
```
Simple time tracking with automatic earnings calculation for freelancers.
```

---

## Asset Generation Scripts

### Quick Start

```bash
cd mobile

# Install dependencies
npm install --save-dev sharp

# Create your source icon (1024x1024)
# Save to: mobile/assets/icon-source.png

# Generate all app icon sizes
node scripts/generate-icons.js

# Generate screenshot templates
node scripts/generate-screenshots.js

# View templates
open store-assets/screenshot-templates/index.html
```

### Script Details

**generate-icons.js**
- Generates iOS app icons (10 sizes)
- Generates Android app icons (6 sizes)
- Generates Android adaptive icons (5 sizes)
- Optimizes for quality and file size
- Creates organized folder structure

**generate-screenshots.js**
- Creates HTML templates for all platforms
- Includes all 5 core screenshot designs
- Generates iOS sizes (6.7", 6.5", 5.5", iPad)
- Generates Android size (1080x1920)
- Professional branded templates

### Manual Asset Organization

```
mobile/
├── assets/
│   ├── icon-source.png              (Your 1024x1024 source)
│   └── icons/
│       ├── ios/                     (Generated iOS icons)
│       ├── android/                 (Generated Android icons)
│       └── android-adaptive/        (Generated adaptive icons)
│
└── store-assets/
    ├── screenshots/
    │   ├── ios/
    │   │   ├── 6.7-inch/           (1290x2796)
    │   │   ├── 6.5-inch/           (1242x2688)
    │   │   └── ipad-pro/           (2048x2732)
    │   └── android/
    │       └── phone/              (1080x1920)
    │
    ├── feature-graphic.png          (1024x500 for Android)
    ├── promo-video.mp4              (Optional)
    └── screenshot-templates/        (Generated templates)
```

---

## Quality Checklist

### Before Submission

**App Icon:**
- [ ] Source icon is 1024x1024 PNG
- [ ] Icon is recognizable at 16x16
- [ ] Icon works on light and dark backgrounds
- [ ] No text in icon
- [ ] High contrast and simple design
- [ ] All sizes generated successfully
- [ ] No transparency issues on iOS
- [ ] Adaptive icon looks good on Android

**Screenshots:**
- [ ] 3-10 screenshots for iOS (6.7")
- [ ] 2-8 screenshots for Android
- [ ] All required dimensions exact
- [ ] File sizes under limits (500MB iOS, 8MB Android)
- [ ] Text is readable at thumbnail size
- [ ] Consistent branding across all screenshots
- [ ] No personal/sensitive information visible
- [ ] Screenshots represent current app version
- [ ] No misleading content

**Feature Graphic (Android):**
- [ ] Exactly 1024x500 pixels
- [ ] Under 1 MB file size
- [ ] Includes app name clearly
- [ ] Professional appearance
- [ ] Matches brand colors
- [ ] No pricing or download language
- [ ] High quality, no pixelation

**Promotional Text:**
- [ ] iOS promotional text under 170 characters
- [ ] Android short description under 80 characters
- [ ] No spelling/grammar errors
- [ ] Clearly communicates value
- [ ] No prohibited claims (e.g., "#1 app")

### Asset Quality Standards

**Resolution:**
- All assets at exact required dimensions
- No upscaling from smaller images
- Export at 2x or higher for quality
- Use PNG for transparency, JPEG for photos

**File Optimization:**
- Compress without visible quality loss
- Use tools like TinyPNG, ImageOptim
- Stay well under file size limits
- Test loading speed

**Visual Consistency:**
- All assets use same color palette
- Typography consistent across materials
- Icon matches screenshots matches feature graphic
- Professional, cohesive brand identity

---

## Additional Resources

### Design Inspiration

**Icon Design:**
- [Dribbble - App Icons](https://dribbble.com/tags/app_icon)
- [Behance - Icon Design](https://behance.net/search/projects?search=app%20icon)

**Screenshot Design:**
- [App Store Screenshot Examples](https://www.appstorescreenshots.com)
- [Previewed.app Gallery](https://previewed.app/gallery)

### Official Guidelines

**Apple:**
- [App Store Product Page](https://developer.apple.com/app-store/product-page/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [App Icon Design](https://developer.apple.com/design/human-interface-guidelines/app-icons)

**Google:**
- [Google Play Asset Guidelines](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Material Design](https://material.io/design)
- [Product Icon Design](https://material.io/design/iconography/product-icons.html)

### Tools & Services

**Asset Creation:**
- [Figma](https://figma.com) - Free design tool
- [Canva](https://canva.com) - Template-based design
- [App Icon Generator](https://appicon.co) - Quick icon resizing

**Screenshot Tools:**
- [Previewed.app](https://previewed.app) - Device mockups
- [Shotsnapp](https://shotsnapp.com) - Screenshot beautifier
- [MockUPhone](https://mockuphone.com) - Free device frames

**Optimization:**
- [TinyPNG](https://tinypng.com) - Image compression
- [ImageOptim](https://imageoptim.com) - Mac image optimizer
- [Squoosh](https://squoosh.app) - Google image optimizer

---

## Troubleshooting

### Common Issues

**"App icon has transparency" (iOS rejection):**
- Solution: Fill background with solid color in source icon
- Use Photoshop: Layer > Flatten Image
- Or: Add white background layer

**"Screenshot dimensions incorrect":**
- Solution: Use exact dimensions, don't resize
- iOS: 1290x2796 (6.7") or 1242x2688 (6.5")
- Android: Minimum 1080x1920, maintain 16:9 ratio

**"Feature graphic file too large":**
- Solution: Compress with TinyPNG
- Or: Export as JPEG at 85% quality
- Or: Reduce any complex gradients/effects

**"Text not readable in screenshots":**
- Solution: Increase font size (48pt+ for titles)
- Use high contrast colors (white on dark, dark on light)
- Add background overlay/blur if needed

**"Icon looks bad at small sizes":**
- Solution: Simplify design, remove fine details
- Test at 16x16 before finalizing
- Use bold, simple shapes only

### Getting Help

**Design Feedback:**
- [r/AppIcons](https://reddit.com/r/AppIcons) - Icon feedback
- [r/design_critiques](https://reddit.com/r/design_critiques) - General design
- [Designer News](https://designernews.co) - Professional community

**Asset Questions:**
- Check official guidelines (Apple/Google links above)
- Search in developer forums
- Contact App Store Connect or Play Console support

---

## Next Steps

Once all assets are created and verified:

1. **Update app configuration:**
   ```bash
   # Update app.json with icon paths
   # Update eas.json with asset paths
   ```

2. **Run prebuild:**
   ```bash
   npx expo prebuild --clean
   ```

3. **Test locally:**
   ```bash
   # iOS: Check Assets.xcassets/AppIcon.appiconset
   # Android: Check android/app/src/main/res/mipmap-*/
   ```

4. **Build for stores:**
   ```bash
   eas build --platform all --profile production
   ```

5. **Upload to stores:**
   - Follow App Store Connect upload process
   - Follow Google Play Console upload process
   - See: APP_STORE_DEPLOYMENT.md for details

---

## Summary

### Required Assets Checklist

**Critical (Must Have):**
- [ ] App Icon source (1024x1024 PNG)
- [ ] iOS screenshots (3-10 images, 1290x2796)
- [ ] Android screenshots (2-8 images, 1080x1920+)
- [ ] Feature graphic (Android, 1024x500)

**Important (Highly Recommended):**
- [ ] App Store promotional text (170 chars)
- [ ] Google Play short description (80 chars)
- [ ] iPad screenshots (optional but helpful)

**Optional (Nice to Have):**
- [ ] Promo video (YouTube link)
- [ ] Tablet screenshots
- [ ] Multiple language assets

### Estimated Time

- **Icon Design:** 2-4 hours
- **Screenshot Creation:** 3-6 hours
- **Feature Graphic:** 1-2 hours
- **Asset Optimization:** 1 hour
- **Total:** 7-13 hours

### Asset Quality Goals

- Professional appearance matching TradeTimer brand
- Clear communication of app value and features
- Optimized for fast loading and approval
- Compliant with all platform requirements

---

**Document Version:** 1.0
**Last Updated:** 2025-11-03
**Maintained By:** TradeTimer Development Team

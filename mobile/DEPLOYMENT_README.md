# TradeTimer Mobile - App Store Deployment Documentation

This directory contains comprehensive deployment documentation for submitting TradeTimer to both Apple App Store and Google Play Store.

## Documentation Overview

### Core Deployment Guides

1. **[docs/APP_STORE_DEPLOYMENT.md](./docs/APP_STORE_DEPLOYMENT.md)** (42KB, 20+ pages)
   - Complete end-to-end deployment guide
   - Prerequisites and account setup
   - Step-by-step Apple App Store submission
   - Step-by-step Google Play Store submission
   - EAS build configuration
   - Store assets requirements (screenshots, icons, etc.)
   - Testing procedures
   - Post-submission monitoring
   - Common issues and solutions
   - **START HERE** for first-time deployment

2. **[SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md)** (16KB)
   - Interactive checklist format
   - Pre-submission preparation
   - Account setup verification
   - App configuration checklist
   - Store assets checklist
   - iOS App Store submission steps
   - Android Play Store submission steps
   - Test account setup
   - Final pre-launch checklist
   - Troubleshooting guide

3. **[BUILD_COMMANDS.md](./BUILD_COMMANDS.md)** (15KB)
   - Complete EAS CLI command reference
   - Build profiles explained (development, preview, production)
   - iOS build commands
   - Android build commands
   - Build monitoring and troubleshooting
   - Credentials management
   - Environment variables configuration
   - OTA updates guide
   - Submission commands
   - Quick reference section

### Store Listing Assets

Located in `store-assets/` directory:

4. **[store-assets/app-store-listing.md](./store-assets/app-store-listing.md)** (6.7KB)
   - App Store listing copy (ready to use)
   - App name, subtitle, description
   - Keywords optimized for ASO
   - Screenshot ideas and captions
   - Release notes template
   - App Store optimization tips
   - Localization recommendations

5. **[store-assets/play-store-listing.md](./store-assets/play-store-listing.md)** (11KB)
   - Google Play listing copy (ready to use)
   - Title, short description, full description
   - Graphic assets checklist
   - Content rating guidance
   - Data safety form answers
   - Screenshot ideas
   - Feature graphic design suggestions
   - Release notes template

6. **[store-assets/PRIVACY_POLICY.md](./store-assets/PRIVACY_POLICY.md)** (13.5KB)
   - Complete privacy policy template
   - GDPR compliant
   - CCPA compliant
   - COPPA compliant
   - Required for both app stores
   - Must be published at: https://tradetimer.com/privacy

### Configuration Files

7. **[eas.json](./eas.json)** (923 bytes)
   - EAS Build configuration
   - Build profiles (development, preview, production)
   - iOS build settings
   - Android build settings (AAB for production)
   - Submit configuration placeholders
   - **IMPORTANT:** Update placeholders with your actual credentials

8. **[app.json](./app.json)** (Updated)
   - Enhanced with store-ready configuration
   - App name: "TradeTimer - Time Tracking"
   - Bundle identifier: com.tradetimer.app
   - iOS build number and version code added
   - Enhanced privacy descriptions
   - Export compliance configured
   - Ready for store submission

## Quick Start Guide

### 1. Prerequisites Setup (1-2 hours)

**Required Accounts:**
- [ ] Apple Developer Account ($99/year) - https://developer.apple.com/programs/
- [ ] Google Play Console Account ($25 one-time) - https://play.google.com/console/signup
- [ ] Expo Account (free) - https://expo.dev/signup

**Required Tools:**
```bash
npm install -g eas-cli
npm install -g expo-cli
```

**Required Environment:**
- macOS computer (for iOS builds)
- Xcode 15.0+ installed
- Node.js 18+ installed

### 2. Prepare Store Assets (2-4 hours)

**Create Required Assets:**
- [ ] App icon (1024x1024 PNG)
- [ ] iOS screenshots (multiple device sizes)
- [ ] Android screenshots (phone, tablets)
- [ ] Android feature graphic (1024x500)
- [ ] Privacy policy published online

**Use Templates:**
- Copy text from `store-assets/app-store-listing.md`
- Copy text from `store-assets/play-store-listing.md`
- Publish `store-assets/PRIVACY_POLICY.md` to your website

### 3. Configure Project (30 minutes)

**Update app.json:**
- Change `owner` field to your Expo username
- Update `projectId` after running `eas init`

**Update eas.json:**
- Replace placeholder Apple ID
- Add service account key path for Android
- Configure environment variables

**Create Test Account:**
```
Email: review@tradetimer.com
Password: [secure password]
```
- Add sample clients
- Add sample time entries
- Ensure all features work

### 4. Build Apps (1-2 hours)

**Initialize EAS:**
```bash
cd mobile
eas login
eas init
```

**Build iOS:**
```bash
eas build --platform ios --profile production
```
Wait 15-20 minutes for build to complete.

**Build Android:**
```bash
eas build --platform android --profile production
```
Wait 15-20 minutes for build to complete.

**Test Builds:**
- Download and install on physical devices
- Test all features thoroughly
- Verify no crashes or bugs

### 5. Submit to Stores (2-4 hours)

**Apple App Store:**
1. Create app in App Store Connect
2. Complete all app information (use templates)
3. Upload screenshots (all required sizes)
4. Add test account credentials
5. Submit build for review
6. Wait 24-48 hours for review

**Google Play Store:**
1. Create app in Play Console
2. Complete store listing (use templates)
3. Upload graphic assets
4. Complete content rating
5. Fill data safety form
6. Upload AAB file
7. Submit for review
8. Wait 2-7 days for review

**Follow Checklists:**
- Use `SUBMISSION_CHECKLIST.md` for step-by-step guidance
- Check off items as you complete them
- Refer to `docs/APP_STORE_DEPLOYMENT.md` for detailed instructions

### 6. Post-Submission (Ongoing)

**Monitor Reviews:**
- Check status daily in both consoles
- Respond to reviewer questions within 24 hours
- Be prepared for potential rejections

**After Approval:**
- Monitor user reviews
- Respond to feedback
- Track analytics and crashes
- Plan updates based on feedback

## Total Time Estimate

- **First-time setup:** 8-12 hours
- **Asset creation:** 4-6 hours
- **Submission process:** 4-6 hours
- **Review wait time:** 2-7 days
- **Total:** 2-3 weeks from start to live

## Cost Breakdown

- **Apple Developer Account:** $99/year
- **Google Play Developer Account:** $25 one-time
- **EAS Build (Expo):** Free tier available (30 builds/month)
- **Graphics/Design:** DIY or $50-500 if hiring designer
- **Total Initial Cost:** $124-$624

## Document Usage Guide

### For First-Time Submission:
1. Read `docs/APP_STORE_DEPLOYMENT.md` (complete guide)
2. Use `SUBMISSION_CHECKLIST.md` (interactive checklist)
3. Reference `BUILD_COMMANDS.md` (command reference)
4. Copy from `store-assets/` (listing copy)

### For Subsequent Updates:
1. Update version numbers in `app.json`
2. Use `BUILD_COMMANDS.md` (build and submit)
3. Update release notes in store consoles

### For Troubleshooting:
1. Check `BUILD_COMMANDS.md` troubleshooting section
2. Check `docs/APP_STORE_DEPLOYMENT.md` common issues section
3. Check `SUBMISSION_CHECKLIST.md` for missed steps

## Key Reminders

### Before You Start:
- Test app thoroughly on physical devices
- Prepare all assets (icons, screenshots)
- Publish privacy policy online
- Create and test demo account
- Budget 2-3 weeks for full process

### Common Pitfalls to Avoid:
- Missing privacy policy URL
- Incomplete test account
- Wrong screenshot sizes
- Placeholder content in app
- Debug code in production
- Missing permission descriptions
- Incorrect version numbers

### Success Factors:
- Follow checklists completely
- Test on multiple devices
- Respond quickly to reviewers
- High-quality screenshots
- Clear app description
- Professional presentation

## Support and Resources

### Official Documentation:
- **Apple:** https://developer.apple.com/app-store/review/guidelines/
- **Google:** https://play.google.com/about/developer-content-policy/
- **Expo:** https://docs.expo.dev/distribution/app-stores/

### TradeTimer Support:
- **Email:** support@tradetimer.com
- **Documentation:** See files in this directory

### Community Resources:
- **Expo Forums:** https://forums.expo.dev/
- **Stack Overflow:** Tag: expo, eas-build
- **Reddit:** r/reactnative, r/expo

## File Structure

```
mobile/
├── docs/
│   └── APP_STORE_DEPLOYMENT.md     # Main deployment guide (20+ pages)
├── store-assets/
│   ├── app-store-listing.md        # iOS store copy
│   ├── play-store-listing.md       # Android store copy
│   └── PRIVACY_POLICY.md           # Privacy policy template
├── BUILD_COMMANDS.md               # EAS CLI reference
├── SUBMISSION_CHECKLIST.md         # Interactive checklist
├── eas.json                        # Build configuration
├── app.json                        # App configuration (updated)
├── README.md                       # Updated with deployment section
└── DEPLOYMENT_README.md            # This file
```

## Next Steps

1. **Review Prerequisites:** Ensure you have all required accounts and tools
2. **Read Main Guide:** Start with `docs/APP_STORE_DEPLOYMENT.md`
3. **Prepare Assets:** Create icons, screenshots, and listing copy
4. **Configure Project:** Update `app.json` and `eas.json`
5. **Build Apps:** Use commands from `BUILD_COMMANDS.md`
6. **Follow Checklist:** Use `SUBMISSION_CHECKLIST.md` during submission
7. **Submit and Monitor:** Submit to stores and monitor review status

## Questions or Issues?

If you encounter issues during deployment:
1. Check the troubleshooting sections in the guides
2. Search Expo forums for similar issues
3. Contact support@tradetimer.com
4. Review Apple/Google documentation

---

**Good luck with your app store deployment!**

Your TradeTimer mobile app is production-ready and these guides will help you successfully launch on both platforms.

---

**Last Updated:** November 3, 2025
**Documentation Version:** 1.0.0

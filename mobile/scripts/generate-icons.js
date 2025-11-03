#!/usr/bin/env node

/**
 * Icon Generator Script for TradeTimer Mobile App
 *
 * This script helps generate all required icon sizes from a source 1024x1024 icon.
 *
 * Prerequisites:
 * - Install sharp: npm install --save-dev sharp
 * - Place your source icon at: mobile/assets/icon-source.png (1024x1024)
 *
 * Usage:
 * node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// iOS icon sizes (all required for App Store)
const iosSizes = [
  { size: 1024, name: 'AppIcon-1024.png', desc: 'App Store' },
  { size: 180, name: 'AppIcon-60@3x.png', desc: 'iPhone 60pt@3x' },
  { size: 120, name: 'AppIcon-60@2x.png', desc: 'iPhone 60pt@2x' },
  { size: 167, name: 'AppIcon-83.5@2x.png', desc: 'iPad Pro 83.5pt@2x' },
  { size: 152, name: 'AppIcon-76@2x.png', desc: 'iPad 76pt@2x' },
  { size: 76, name: 'AppIcon-76.png', desc: 'iPad 76pt' },
  { size: 40, name: 'AppIcon-20@2x.png', desc: 'Spotlight 20pt@2x' },
  { size: 60, name: 'AppIcon-20@3x.png', desc: 'Spotlight 20pt@3x' },
  { size: 58, name: 'AppIcon-29@2x.png', desc: 'Settings 29pt@2x' },
  { size: 87, name: 'AppIcon-29@3x.png', desc: 'Settings 29pt@3x' },
];

// Android icon sizes
const androidSizes = [
  { size: 1024, name: 'playstore-icon.png', desc: 'Play Store' },
  { size: 192, name: 'icon-xxxhdpi.png', desc: 'xxxhdpi' },
  { size: 144, name: 'icon-xxhdpi.png', desc: 'xxhdpi' },
  { size: 96, name: 'icon-xhdpi.png', desc: 'xhdpi' },
  { size: 72, name: 'icon-hdpi.png', desc: 'hdpi' },
  { size: 48, name: 'icon-mdpi.png', desc: 'mdpi' },
];

// Adaptive icon sizes (Android)
const androidAdaptiveSizes = [
  { size: 432, name: 'adaptive-xxxhdpi.png', desc: 'Adaptive xxxhdpi (432x432)' },
  { size: 324, name: 'adaptive-xxhdpi.png', desc: 'Adaptive xxhdpi (324x324)' },
  { size: 216, name: 'adaptive-xhdpi.png', desc: 'Adaptive xhdpi (216x216)' },
  { size: 162, name: 'adaptive-hdpi.png', desc: 'Adaptive hdpi (162x162)' },
  { size: 108, name: 'adaptive-mdpi.png', desc: 'Adaptive mdpi (108x108)' },
];

async function generateIcons() {
  const sourceIconPath = path.join(__dirname, '..', 'assets', 'icon-source.png');
  const iosOutputDir = path.join(__dirname, '..', 'assets', 'icons', 'ios');
  const androidOutputDir = path.join(__dirname, '..', 'assets', 'icons', 'android');
  const adaptiveOutputDir = path.join(__dirname, '..', 'assets', 'icons', 'android-adaptive');

  // Check if source icon exists
  try {
    await fs.access(sourceIconPath);
  } catch (error) {
    console.error('❌ Source icon not found at:', sourceIconPath);
    console.log('\n📋 Please create a 1024x1024 PNG icon and place it at:');
    console.log('   mobile/assets/icon-source.png');
    console.log('\n💡 Icon Design Guidelines:');
    console.log('   • Use the TradeTimer brand color (#0369a1)');
    console.log('   • Simple, recognizable symbol (clock, timer, or "TT" monogram)');
    console.log('   • Works well at small sizes (16x16)');
    console.log('   • No text (just symbol/logo)');
    console.log('   • High contrast');
    console.log('   • Professional appearance');
    process.exit(1);
  }

  // Create output directories
  await fs.mkdir(iosOutputDir, { recursive: true });
  await fs.mkdir(androidOutputDir, { recursive: true });
  await fs.mkdir(adaptiveOutputDir, { recursive: true });

  console.log('🎨 Generating iOS icons...\n');

  // Generate iOS icons
  for (const { size, name, desc } of iosSizes) {
    const outputPath = path.join(iosOutputDir, name);
    await sharp(sourceIconPath)
      .resize(size, size, {
        kernel: sharp.kernel.lanczos3,
        fit: 'cover',
      })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outputPath);
    console.log(`✅ Generated ${name} (${size}x${size}) - ${desc}`);
  }

  console.log('\n🤖 Generating Android icons...\n');

  // Generate Android icons
  for (const { size, name, desc } of androidSizes) {
    const outputPath = path.join(androidOutputDir, name);
    await sharp(sourceIconPath)
      .resize(size, size, {
        kernel: sharp.kernel.lanczos3,
        fit: 'cover',
      })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outputPath);
    console.log(`✅ Generated ${name} (${size}x${size}) - ${desc}`);
  }

  console.log('\n🔄 Generating Android adaptive icons...\n');

  // Generate Android adaptive icons
  for (const { size, name, desc } of androidAdaptiveSizes) {
    const outputPath = path.join(adaptiveOutputDir, name);
    await sharp(sourceIconPath)
      .resize(size, size, {
        kernel: sharp.kernel.lanczos3,
        fit: 'cover',
      })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outputPath);
    console.log(`✅ Generated ${name} (${size}x${size}) - ${desc}`);
  }

  console.log('\n✨ All icons generated successfully!');
  console.log('\n📦 Next steps:');
  console.log('   1. Review generated icons in mobile/assets/icons/');
  console.log('   2. Update app.json with icon paths');
  console.log('   3. Run: npx expo prebuild --clean');
  console.log('   4. Test on both iOS and Android devices');
}

// Run the generator
generateIcons().catch((error) => {
  console.error('❌ Error generating icons:', error);
  process.exit(1);
});

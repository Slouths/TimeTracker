#!/usr/bin/env node

/**
 * Screenshot Template Generator for TradeTimer Mobile App
 *
 * This script creates HTML templates for generating professional App Store
 * and Play Store screenshots with consistent branding.
 *
 * Usage:
 * node scripts/generate-screenshots.js
 *
 * Output:
 * Creates HTML files in mobile/store-assets/screenshot-templates/
 * Open each HTML file in a browser and take screenshots at the required dimensions
 */

const fs = require('fs').promises;
const path = require('path');

// iOS screenshot sizes (required for App Store Connect)
const iosScreenshotSizes = {
  'iPhone 6.7"': { width: 1290, height: 2796, desc: 'iPhone 15 Pro Max, 14 Pro Max' },
  'iPhone 6.5"': { width: 1242, height: 2688, desc: 'iPhone 11 Pro Max, XS Max' },
  'iPhone 5.5"': { width: 1242, height: 2208, desc: 'iPhone 8 Plus' },
  'iPad Pro 12.9"': { width: 2048, height: 2732, desc: 'iPad Pro 12.9" (2nd/3rd gen)' },
};

// Android screenshot size (recommended)
const androidScreenshotSize = { width: 1080, height: 1920, desc: 'Android phones' };

// Screenshot content definitions
const screenshots = [
  {
    id: 'timer',
    title: 'Simple Time Tracking',
    subtitle: 'Start tracking in seconds',
    description: 'One tap to start. Real-time earnings display. Professional time tracking for freelancers.',
    screen: 'Timer',
    highlights: ['Start/Stop in 1 tap', 'Real-time earnings', 'Client selection'],
  },
  {
    id: 'clients',
    title: 'Manage Your Clients',
    subtitle: 'Track rates and contacts',
    description: 'Store client details and hourly rates. Quick access to contacts and billing information.',
    screen: 'Clients',
    highlights: ['Custom hourly rates', 'Contact information', 'Easy organization'],
  },
  {
    id: 'entries',
    title: 'Detailed Time Entries',
    subtitle: 'Complete tracking history',
    description: 'View all your tracked sessions. Edit, delete, or export your time data.',
    screen: 'Time Entries',
    highlights: ['Full history', 'Easy editing', 'Export to CSV'],
  },
  {
    id: 'reports',
    title: 'Insightful Reports',
    subtitle: 'Understand your earnings',
    description: 'Weekly and monthly breakdowns. Client-specific analytics. Export for invoicing.',
    screen: 'Reports',
    highlights: ['Weekly summaries', 'Client breakdowns', 'PDF exports'],
  },
  {
    id: 'invoices',
    title: 'Professional Invoices',
    subtitle: 'Get paid faster',
    description: 'Generate professional invoices. Track payment status. Send directly to clients.',
    screen: 'Invoices',
    highlights: ['Auto-generation', 'Payment tracking', 'Email delivery'],
  },
];

function generateScreenshotHTML(screenshot, size, platform) {
  const { width, height } = size;
  const { title, subtitle, description, highlights } = screenshot;

  // TradeTimer brand color
  const accentColor = '#0369a1';
  const bgColor = '#f8fafc';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${platform} Screenshot</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
      background: ${bgColor};
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }

    .screenshot-container {
      width: ${width}px;
      height: ${height}px;
      background: linear-gradient(135deg, #0369a1 0%, #0c4a6e 100%);
      position: relative;
      overflow: hidden;
      box-shadow: 0 50px 100px rgba(0, 0, 0, 0.3);
    }

    .content {
      position: relative;
      z-index: 10;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 80px;
      text-align: center;
      color: white;
    }

    .title {
      font-size: ${width > 1200 ? '72px' : '56px'};
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 24px;
      line-height: 1.1;
    }

    .subtitle {
      font-size: ${width > 1200 ? '40px' : '32px'};
      font-weight: 600;
      opacity: 0.95;
      margin-bottom: 32px;
    }

    .description {
      font-size: ${width > 1200 ? '28px' : '24px'};
      line-height: 1.6;
      opacity: 0.9;
      max-width: 80%;
      margin-bottom: 48px;
    }

    .highlights {
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: center;
    }

    .highlight-item {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      padding: 16px 32px;
      border-radius: 12px;
      font-size: ${width > 1200 ? '24px' : '20px'};
      font-weight: 600;
      border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .screen-label {
      position: absolute;
      top: 40px;
      right: 40px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      padding: 12px 24px;
      border-radius: 8px;
      font-size: ${width > 1200 ? '20px' : '16px'};
      font-weight: 600;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .decoration-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
    }

    .circle-1 {
      width: 400px;
      height: 400px;
      top: -200px;
      left: -200px;
    }

    .circle-2 {
      width: 600px;
      height: 600px;
      bottom: -300px;
      right: -300px;
    }

    .app-name {
      position: absolute;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      font-size: ${width > 1200 ? '32px' : '24px'};
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    /* Instructions overlay (remove before taking screenshot) */
    .instructions {
      position: fixed;
      top: 20px;
      left: 20px;
      background: white;
      color: #1e293b;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      max-width: 400px;
      z-index: 100;
      font-size: 14px;
      line-height: 1.6;
    }

    .instructions h3 {
      margin-bottom: 12px;
      color: ${accentColor};
    }

    .instructions button {
      margin-top: 16px;
      padding: 8px 16px;
      background: ${accentColor};
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="instructions" id="instructions">
    <h3>📸 Screenshot Instructions</h3>
    <p><strong>Size:</strong> ${width}x${height}px</p>
    <p><strong>Platform:</strong> ${platform}</p>
    <ol style="margin: 12px 0; padding-left: 20px;">
      <li>Click "Hide Instructions" below</li>
      <li>Take a screenshot of the canvas</li>
      <li>Crop to exact dimensions if needed</li>
      <li>Save as: ${screenshot.id}_${platform.toLowerCase().replace(' ', '_')}.png</li>
    </ol>
    <button onclick="document.getElementById('instructions').style.display='none'">
      Hide Instructions
    </button>
  </div>

  <div class="screenshot-container">
    <div class="decoration-circle circle-1"></div>
    <div class="decoration-circle circle-2"></div>

    <div class="screen-label">${screenshot.screen} Screen</div>

    <div class="content">
      <div class="title">${title}</div>
      <div class="subtitle">${subtitle}</div>
      <div class="description">${description}</div>
      <div class="highlights">
        ${highlights.map(h => `<div class="highlight-item">✓ ${h}</div>`).join('')}
      </div>
    </div>

    <div class="app-name">TRADETIMER</div>
  </div>

  <script>
    // Auto-size window to screenshot dimensions (works in some browsers)
    window.resizeTo(${width + 40}, ${height + 40});
  </script>
</body>
</html>`;
}

async function generateScreenshotTemplates() {
  const outputDir = path.join(__dirname, '..', 'store-assets', 'screenshot-templates');

  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });

  console.log('📸 Generating screenshot templates...\n');

  let fileCount = 0;

  // Generate iOS templates
  for (const [deviceName, size] of Object.entries(iosScreenshotSizes)) {
    const deviceDir = path.join(outputDir, 'ios', deviceName.replace(/[^a-z0-9]/gi, '_'));
    await fs.mkdir(deviceDir, { recursive: true });

    for (const screenshot of screenshots) {
      const html = generateScreenshotHTML(screenshot, size, `iOS ${deviceName}`);
      const filename = `${screenshot.id}.html`;
      const filepath = path.join(deviceDir, filename);

      await fs.writeFile(filepath, html);
      fileCount++;
    }

    console.log(`✅ Generated ${screenshots.length} templates for iOS ${deviceName} (${size.width}x${size.height})`);
  }

  // Generate Android template
  const androidDir = path.join(outputDir, 'android');
  await fs.mkdir(androidDir, { recursive: true });

  for (const screenshot of screenshots) {
    const html = generateScreenshotHTML(screenshot, androidScreenshotSize, 'Android');
    const filename = `${screenshot.id}.html`;
    const filepath = path.join(androidDir, filename);

    await fs.writeFile(filepath, html);
    fileCount++;
  }

  console.log(`✅ Generated ${screenshots.length} templates for Android (${androidScreenshotSize.width}x${androidScreenshotSize.height})`);

  // Generate index file
  const indexHTML = generateIndexHTML();
  await fs.writeFile(path.join(outputDir, 'index.html'), indexHTML);

  console.log(`\n✨ Generated ${fileCount} screenshot templates!`);
  console.log(`\n📂 Templates location: ${outputDir}`);
  console.log('\n📋 Next steps:');
  console.log('   1. Open index.html in your browser');
  console.log('   2. Navigate to each screenshot template');
  console.log('   3. Hide the instructions and take a screenshot');
  console.log('   4. Save with the suggested filename');
  console.log('   5. Alternatively: Replace these with actual app screenshots');
  console.log('\n💡 Pro tip: Real app screenshots usually perform better than templates!');
  console.log('   Consider using actual device screenshots from running app.');
}

function generateIndexHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TradeTimer Screenshot Templates</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f8fafc;
    }
    h1 { color: #0369a1; margin-bottom: 32px; }
    h2 { color: #1e293b; margin-top: 40px; margin-bottom: 16px; }
    .section { background: white; padding: 24px; border-radius: 8px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .templates { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .template-link {
      display: block;
      padding: 16px;
      background: #f1f5f9;
      border-radius: 6px;
      text-decoration: none;
      color: #0369a1;
      font-weight: 600;
      transition: all 0.2s;
    }
    .template-link:hover { background: #e2e8f0; transform: translateY(-2px); }
    .instructions { background: #fef3c7; padding: 16px; border-radius: 6px; margin-bottom: 24px; border-left: 4px solid #f59e0b; }
  </style>
</head>
<body>
  <h1>📸 TradeTimer Screenshot Templates</h1>

  <div class="instructions">
    <strong>⚠️ Important:</strong> These are template designs for creating marketing screenshots.
    For best results, use actual screenshots from the running app on real devices!
  </div>

  <div class="section">
    <h2>🍎 iOS Templates</h2>
    ${Object.entries(iosScreenshotSizes).map(([device, size]) => `
      <h3>${device} (${size.width}x${size.height})</h3>
      <div class="templates">
        ${screenshots.map(s => `
          <a href="ios/${device.replace(/[^a-z0-9]/gi, '_')}/${s.id}.html" class="template-link" target="_blank">
            ${s.title}
          </a>
        `).join('')}
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>🤖 Android Templates</h2>
    <h3>Android Phones (${androidScreenshotSize.width}x${androidScreenshotSize.height})</h3>
    <div class="templates">
      ${screenshots.map(s => `
        <a href="android/${s.id}.html" class="template-link" target="_blank">
          ${s.title}
        </a>
      `).join('')}
    </div>
  </div>

  <div class="section">
    <h2>📋 How to Use</h2>
    <ol>
      <li>Click on any template link above</li>
      <li>Follow the on-screen instructions to capture the screenshot</li>
      <li>Save with the recommended filename</li>
      <li>Upload to App Store Connect / Google Play Console</li>
    </ol>
  </div>
</body>
</html>`;
}

// Run the generator
generateScreenshotTemplates().catch((error) => {
  console.error('❌ Error generating screenshot templates:', error);
  process.exit(1);
});

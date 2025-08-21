// plugins/with-privacy-manifest.js
// Expo config plugin to generate and include Apple's Privacy Manifest (PrivacyInfo.xcprivacy)
// Usage: add to app.json -> { "expo": { "plugins": ["./plugins/with-privacy-manifest.js"] } }
const { withDangerousMod, withXcodeProject } = require('@expo/config-plugins');
const withGoogleMobileAds = require('react-native-google-mobile-ads/plugin');
const fs = require('fs');
const path = require('path');

const PRIVACY_MANIFEST = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>NSPrivacyTracking</key><false/>
  <key>NSPrivacyCollectedDataTypes</key><array/>
  <key>NSPrivacyTrackingDomains</key><array/>
  <key>NSPrivacyAccessedAPITypes</key><array/>
</dict></plist>
`;

function writePrivacyManifest(config) {
  return withDangerousMod(config, ['ios', async (cfg) => {
    const iosRoot = cfg.modRequest.platformProjectRoot;
    const filePath = path.join(iosRoot, 'PrivacyInfo.xcprivacy');

    // Ensure idempotency: write (or overwrite) the manifest
    fs.writeFileSync(filePath, PRIVACY_MANIFEST);
    console.log('[with-privacy-manifest] wrote', filePath);
    return cfg;
  }]);
}

function addToXcodeProject(config) {
  return withXcodeProject(config, (cfg) => {
    const project = cfg.modResults;
    try {
      // This adds the file to the Xcode project and the app target's Resources phase
      project.addResourceFile('PrivacyInfo.xcprivacy', { lastKnownFileType: 'text.plist.xml' });
      console.log('[with-privacy-manifest] added PrivacyInfo.xcprivacy to Resources');
    } catch (e) {
      console.warn('[with-privacy-manifest] could not add file to Xcode project:', e?.message || e);
    }
    return cfg;
  });
}

module.exports = function withPrivacyManifest(config) {
  // Write PrivacyInfo.xcprivacy
  config = writePrivacyManifest(config);
  config = addToXcodeProject(config);

  // Integrera react-native-google-mobile-ads plugin
  config = withGoogleMobileAds(config, {
    iosAppId: 'ca-app-pub-7349255218807012~2233111125',
    delayAppMeasurementInit: true,
  });

  return config;
};

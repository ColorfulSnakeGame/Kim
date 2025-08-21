// plugins/with-privacy-manifest.js
// Minimal plugin som injicerar ios/PrivacyInfo.xcprivacy under EAS prebuild.
// Denna plugin ska INTE kräva eller wrappa andra plugins.

const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// OBS: Justera kategorier vid behov. Denna deklarerar INGEN tracking.
const PRIVACY_MANIFEST_JSON = JSON.stringify({
  NSPrivacyTracking: false,
  NSPrivacyTrackingDomains: [],
  NSPrivacyCollectedDataTypes: [
    {
      NSPrivacyCollectedDataType: "Product Interaction",
      NSPrivacyCollectedDataTypeLinked: false,
      NSPrivacyCollectedDataTypeTracking: false,
      NSPrivacyCollectedDataTypePurposes: ["App Functionality", "Analytics"]
    }
    // Lägg till fler poster här om din egen app samlar mer data.
  ]
}, null, 2);

module.exports = function withPrivacyManifest(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const iosRoot = cfg.modRequest.platformProjectRoot; // .../ios
      const outPath = path.join(iosRoot, 'PrivacyInfo.xcprivacy');

      // Skriv/uppdatera filen varje build (idempotent)
      try {
        fs.writeFileSync(outPath, PRIVACY_MANIFEST_JSON, 'utf8');
        console.log('[with-privacy-manifest] Wrote', outPath);
      } catch (e) {
        console.warn('[with-privacy-manifest] Failed to write PrivacyInfo.xcprivacy:', e);
      }
      return cfg;
    }
  ]);
};

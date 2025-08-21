// utils/consent.js
// Minimal UMP consent helper for AdMob.
// Docs: https://docs.page/invertase/react-native-google-mobile-ads/european-user-consent

import mobileAds, { AdsConsent, AdsConsentDebugGeography } from 'react-native-google-mobile-ads';

/**
 * Run once at app start (before requesting ads).
 * - Updates consent info
 * - Shows UMP form if required
 * - Initializes Mobile Ads SDK when allowed
 *
 * @param {{ debugEEA?: boolean, testDeviceIds?: string[] }} options
 * @returns {Promise<boolean>} true if ads can be requested now
 */
export async function initAdsWithConsent(options = {}) {
  const { debugEEA = false, testDeviceIds = [] } = options;

  // 1) Refresh consent info (optionally force EEA + test device IDs)
  try {
    if (debugEEA) {
      await AdsConsent.requestInfoUpdate({
        debugGeography: AdsConsentDebugGeography.EEA,
        testDeviceIdentifiers: testDeviceIds,
      });
    } else {
      await AdsConsent.requestInfoUpdate();
    }
  } catch (e) {
    // Non-fatal
  }

  // 2) Show form if needed
  try {
    await AdsConsent.loadAndShowConsentFormIfRequired();
  } catch (e) {
    // Non-fatal
  }

  // 3) Initialize SDK when allowed (fallback: try anyway, SDK respects last consent)
  try {
    const { canRequestAds } = await AdsConsent.getConsentInfo();
    if (canRequestAds) {
      await mobileAds().initialize();
      return true;
    }
  } catch (e) {}
  try { await mobileAds().initialize(); } catch (e) {}
  return false;
}

/** Can we request ads right now (per UMP)? */
export async function canRequestAds() {
  try {
    const { canRequestAds } = await AdsConsent.getConsentInfo();
    return !!canRequestAds;
  } catch {
    return false;
  }
}

/** Open Privacy Options form so the user can change choices later. */
export function openPrivacyOptions() {
  return AdsConsent.showPrivacyOptionsForm();
}

/**
 * Build requestOptions based on consent:
 *  - If user did NOT allow personalised ads => request NPA
 *  - On error => default to NPA=true (safer)
 */
export async function adRequestOptionsFromConsent() {
  try {
    const { selectPersonalisedAds } = await AdsConsent.getUserChoices();
    return { requestNonPersonalizedAdsOnly: !selectPersonalisedAds };
  } catch {
    return { requestNonPersonalizedAdsOnly: true };
  }
}

/** Testing helper: reset UMP state on device. */
export function resetConsentForTesting() {
  AdsConsent.reset();
}

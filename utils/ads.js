// utils/ads.js
// Hjälpare för Google Mobile Ads (AdMob) — icke-personliga annonser (NPA)

import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

/**
 * false = i dev (__DEV__) används test-ID, i release används live-ID
 * true  = tvinga testannonser överallt (bra för TestFlight/granskning)
 */
export const FORCE_TEST_ADS = false;

/** --- DITT LIVE interstitial-ID (iOS) --- */
const PROD_INTERSTITIAL_IOS = "ca-app-pub-7349255218807012/1770108516";

/** Android lämnar vi tomt tills du lägger till Android-stöd */
const PROD_INTERSTITIAL_ANDROID = null;

/** Välj test- eller live-ID */
const pick = (testId, liveId) =>
  (__DEV__ || FORCE_TEST_ADS || !liveId) ? testId : liveId;

/** Interstitial unit ID (enda formatet vi använder just nu) */
export const INTERSTITIAL_UNIT_ID = Platform.select({
  ios: pick(TestIds.INTERSTITIAL, PROD_INTERSTITIAL_IOS),
  android: pick(TestIds.INTERSTITIAL, PROD_INTERSTITIAL_ANDROID),
  default: TestIds.INTERSTITIAL,
});

/** Icke-personliga annonser (matchar App Privacy) */
export const NPA_REQUEST = { requestNonPersonalizedAdsOnly: true };

// utils/ads.js
// Hjälpare för Google Mobile Ads (AdMob) — icke-personliga annonser (NPA)

import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

/** Kör liveannonser nu (sätt till true om du vill tvinga testannonser) */
export const FORCE_TEST_ADS = false;

/** --- DINA LIVE iOS-enheter --- */
const PROD_BANNER_IOS       = "ca-app-pub-73492552188807012/7344184613";
const PROD_INTERSTITIAL_IOS = "ca-app-pub-73492552188807012/1770108516";

/** Android lämnar vi som test (fyll i senare om/när du kör Android) */
const PROD_BANNER_ANDROID       = null;
const PROD_INTERSTITIAL_ANDROID = null;

/** Välj live-ID om vi inte forcerar test och live-ID finns, annars Googles test-ID */
const pick = (testId, liveId) =>
  (__DEV__ || FORCE_TEST_ADS || !liveId) ? testId : liveId;

/** Banner unit ID */
export const BANNER_UNIT_ID = Platform.select({
  ios: pick(TestIds.BANNER, PROD_BANNER_IOS),
  android: pick(TestIds.BANNER, PROD_BANNER_ANDROID),
  default: TestIds.BANNER,
});

/** Interstitial unit ID */
export const INTERSTITIAL_UNIT_ID = Platform.select({
  ios: pick(TestIds.INTERSTITIAL, PROD_INTERSTITIAL_IOS),
  android: pick(TestIds.INTERSTITIAL, PROD_INTERSTITIAL_ANDROID),
  default: TestIds.INTERSTITIAL,
});

/** Icke-personliga annonser (matchar App Privacy/inga trackers) */
export const NPA_REQUEST = { requestNonPersonalizedAdsOnly: true };

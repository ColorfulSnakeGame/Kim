import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@colorful_snake_highscores_v1";

export async function saveHighscore(score) {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({ score, date: Date.now() });
    arr.sort((a, b) => b.score - a.score);
    const top = arr.slice(0, 10);
    await AsyncStorage.setItem(KEY, JSON.stringify(top));
    return top;
  } catch (e) {
    console.warn("saveHighscore error", e);
    return null;
  }
}

export async function loadHighscores() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("loadHighscores error", e);
    return [];
  }
}

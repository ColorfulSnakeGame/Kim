
// GameCanvas.tsx / GameCanvas.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  PanResponder,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Easing,
  AppState,
  useWindowDimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio"; // ⬅️ NYTT: setAudioModeAsync
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { saveHighscore } from "../utils/storage";

const USE_IMAGE_BG = false;
const GRID = 20; // 20x20 rutor

/** ---------- Hindergeneratorer ---------- */
function genWalls(rows) {
  const a = [];
  for (let r = 0; r < rows; r++) {
    const x = (r * 3 + 5) % GRID;
    for (let y = 2; y < GRID - 2; y += 3) a.push({ x, y });
  }
  return a;
}
function genMaze(seed) {
  const a = [];
  for (let i = 0; i < seed; i++) {
    const x = ((i * 7 + 3) % (GRID - 4)) + 2;
    const y = ((i * 11 + 5) % (GRID - 4)) + 2;
    if (i % 2 === 0) a.push({ x, y }, { x: x + 1, y }, { x: x - 1, y });
    else a.push({ x, y }, { x, y: y + 1 }, { x, y: y - 1 });
  }
  return a;
}
function genBlocks(count) {
  const a = [];
  for (let i = 0; i < count; i++) {
    const x = ((i * 13) % (GRID - 6)) + 3;
    const y = ((i * 17) % (GRID - 6)) + 3;
    a.push({ x, y });
    if (i % 3 === 0) a.push({ x: x + 1, y });
    if (i % 4 === 0) a.push({ x, y: y + 1 });
  }
  return a;
}
function genCross(step = 3) {
  const a = [];
  for (let i = 2; i < GRID - 2; i += step) {
    a.push({ x: i, y: Math.floor(GRID / 2) });
    a.push({ x: Math.floor(GRID / 2), y: i });
  }
  return a;
}
function genPerimeter(gap = 2) {
  const a = [];
  for (let x = 0; x < GRID; x++) {
    if (x % gap !== 0) {
      a.push({ x, y: 1 });
      a.push({ x, y: GRID - 2 });
    }
  }
  for (let y = 0; y < GRID; y++) {
    if (y % gap !== 0) {
      a.push({ x: 1, y });
      a.push({ x: GRID - 2, y });
    }
  }
  return a;
}
function genChecker(d = 3) {
  const a = [];
  for (let y = 2; y < GRID - 2; y++) {
    for (let x = 2; x < GRID - 2; x++) {
      if ((x + y) % d === 0) a.push({ x, y });
    }
  }
  return a;
}
function genTunnels() {
  const a = [];
  const bandY = [5, 6, 13, 14];
  for (let x = 2; x < GRID - 2; x++) {
    bandY.forEach((y) => a.push({ x, y }));
  }
  [4, 10, 15].forEach((x) => {
    for (let i = 0; i < a.length; i++) {
      if (a[i].x === x) {
        a.splice(i, 1);
        i--;
      }
    }
  });
  return a;
}

/** ---------- Teman ---------- */
const THEMES = [
  { name: "Sunny Meadow", gradient: ["#bff7d4", "#dff7ff"] },
  { name: "Candy Forest", gradient: ["#ffe9f2", "#fff0e6"] },
  { name: "Starry Caves", gradient: ["#000428", "#004e92"] },
  { name: "Neon City", gradient: ["#0f0c29", "#302b63", "#24243e"] },
  { name: "Ocean Breeze", gradient: ["#74ebd5", "#ACB6E5"] },
  { name: "Lavender Fields", gradient: ["#c471f5", "#fa71cd"] },
  { name: "Desert Dunes", gradient: ["#fceabb", "#f8b500"] },
  { name: "Frost Peak", gradient: ["#83a4d4", "#b6fbff"] },
  { name: "Jungle Run", gradient: ["#a8e063", "#56ab2f"] },
  { name: "Volcano Path", gradient: ["#f83600", "#f9d423"] },
];

/** ---------- Hinder-mjukning per svårighet ---------- */
function softenObstacles(list, difficulty) {
  if (!list || list.length === 0) return list;
  if (difficulty === "hard") return list;
  const step = difficulty === "easy" ? 2 : 4;
  const filtered = list.filter((_, i) => i % step !== 0);
  if (filtered.length === list.length && list.length > 0) {
    return list.slice(0, list.length - 1);
  }
  return filtered;
}

function makeLevels(difficulty = "medium") {
  const speedMul = difficulty === "easy" ? 0.9 : difficulty === "hard" ? 1.1 : 1.0;
  const levels = [];
  for (let i = 0; i < 20; i++) {
    const theme = THEMES[i % THEMES.length];
    let obstacles = [];
    if (i === 0) obstacles = [];
    else if (i === 1) obstacles = genWalls(3);
    else if (i === 2) obstacles = genMaze(6);
    else if (i === 3) obstacles = genBlocks(10);
    else if (i === 4) obstacles = genPerimeter(3);
    else if (i === 5) obstacles = genCross(4);
    else if (i === 6) obstacles = genWalls(5);
    else if (i === 7) obstacles = genMaze(10);
    else if (i === 8) obstacles = genBlocks(14);
    else if (i === 9) obstacles = genChecker(4);
    else if (i === 10) obstacles = genPerimeter(2);
    else if (i === 11) obstacles = genTunnels();
    else if (i === 12) obstacles = [...genWalls(6), ...genBlocks(8)];
    else if (i === 13) obstacles = [...genMaze(12), ...genChecker(5)];
    else if (i === 14) obstacles = [...genBlocks(16), ...genCross(3)];
    else if (i === 15) obstacles = [...genPerimeter(2), ...genWalls(4)];
    else if (i === 16) obstacles = [...genMaze(14), ...genBlocks(12)];
    else if (i === 17) obstacles = [...genTunnels(), ...genCross(3)];
    else if (i === 18) obstacles = [...genChecker(3), ...genWalls(6)];
    else if (i === 19) obstacles = [...genMaze(16), ...genPerimeter(2), ...genBlocks(18)];
    obstacles = softenObstacles(obstacles, difficulty);
    const baseSpeed = Math.min(6 + i * 0.7, 18);
    const speed = baseSpeed * speedMul;
    levels.push({
      name: `${theme.name} ${Math.floor(i / THEMES.length) + 1}`,
      gradient: theme.gradient,
      obstacles,
      speed,
    });
  }
  return levels;
}

const levelImages = new Array(20).fill(null);

/** ---------- Hjälpare: hinder/lediga rutor/matspawn ---------- */
function isObstacle(levels, levelIndex, pos) {
  const arr = levels[levelIndex].obstacles || [];
  return arr.some((o) => o.x === pos.x && o.y === pos.y);
}
function getFreeCells(levels, levelIndex, snake) {
  const occ = new Set();
  snake.forEach((p) => occ.add(`${p.x},${p.y}`));
  const obs = levels[levelIndex].obstacles || [];
  obs.forEach((o) => occ.add(`${o.x},${o.y}`));
  const free = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const key = `${x},${y}`;
      if (!occ.has(key)) free.push({ x, y });
    }
  }
  return free;
}
function spawnFood(levels, levelIndex, snake) {
  const free = getFreeCells(levels, levelIndex, snake);
  if (free.length === 0) return null; // fullt bräde
  const idx = Math.floor(Math.random() * free.length);
  return free[idx];
}

/** ---------- Bakgrund (panHandlers på brädet) ---------- */
function LevelBackground({ levels, levelIndex, children, boardSize, panHandlers }) {
  const img = levelImages[levelIndex];
  const grad = levels[levelIndex].gradient;
  const style = { width: boardSize, height: boardSize, overflow: "hidden", borderRadius: 12 };
  if (USE_IMAGE_BG && img) {
    return (
      <ImageBackground source={img} resizeMode="cover" style={style} {...panHandlers}>
        {children}
      </ImageBackground>
    );
  }
  return (
    <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={style} {...panHandlers}>
      {children}
    </LinearGradient>
  );
}

/** ---------- HUD helpers ---------- */
const DIFF_COLORS = { easy: "#22c55e", medium: "#f59e0b", hard: "#ef4444" };
function DifficultyBadge({ difficulty, fontsLoaded }) {
  const col = DIFF_COLORS[difficulty] || "#94a3b8";
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
        backgroundColor: "rgba(255,255,255,0.10)",
        marginRight: 10,
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: col,
          marginRight: 6,
        }}
      />
      <Text
        style={{
          color: "#fff",
          letterSpacing: 1,
          fontSize: 12,
          fontWeight: fontsLoaded ? "normal" : "700",
          fontFamily: fontsLoaded ? "Inter_700Bold" : undefined,
        }}
      >
        {String(difficulty).toUpperCase()}
      </Text>
    </View>
  );
}

/** ---------- Huvudkomponent ---------- */
export default function GameCanvas({ startLevel = 0, paused = false, difficulty = "medium" }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [fontsLoaded] = useFonts({ Inter_600SemiBold, Inter_700Bold });

  // Board + cellstorlek
  const boardSize = Math.floor(Math.min(width, height) * 0.9);
  const CELL = useMemo(() => Math.max(10, Math.floor(boardSize / GRID)), [boardSize]);
  const BOARD = useMemo(() => CELL * GRID, [CELL]);

  const LEVELS = useMemo(() => makeLevels(difficulty), [difficulty]);

  const [snake, setSnake] = useState([{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }]);
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [level, setLevel] = useState(Math.min(Math.max(startLevel, 0), LEVELS.length - 1));
  const [food, setFood] = useState(() => spawnFood(LEVELS, Math.min(Math.max(startLevel, 0), LEVELS.length - 1), [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }]) || null);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [hueBase, setHueBase] = useState(0);
  const [countdown, setCountdown] = useState(0);

  /** 🔊 Ljud + toggles */
  const [soundOn, setSoundOn] = useState(true);
  const [hapticsOn, setHapticsOn] = useState(true);

  /** 📴 Respektera iOS Silent Switch (expo-audio) */
  useEffect(() => {
    // iOS: spela INTE ljud i tyst läge (review-vänligt). Android ignorerar denna flagga.
    setAudioModeAsync({ playsInSilentMode: false }).catch(() => {});
  }, []);

  /** 🎵 Ljud (expo-audio) — MP3! */
  const eatPlayer = useAudioPlayer(require("../assets/sounds/eat.mp3"));
  const overPlayer = useAudioPlayer(require("../assets/sounds/gameover.mp3"));
  const upPlayer = useAudioPlayer(require("../assets/sounds/levelup.mp3"));
  const play = (player) => {
    if (!soundOn) return;
    try {
      player.seekTo(0);
      player.play();
    } catch (e) {}
  };

  // Auto-pause
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") setRunning(false);
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (paused) setRunning(false);
  }, [paused]);

  // Head pulse
  const headPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(headPulse, { toValue: 1.1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(headPulse, { toValue: 1.0, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [headPulse]);

  // Glow + food pop
  const glow = useRef(new Animated.Value(0)).current;
  const triggerGlow = () => {
    glow.setValue(1);
    Animated.timing(glow, { toValue: 0, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  };
  const foodSpawn = useRef(new Animated.Value(0)).current;
  const triggerFoodSpawn = () => {
    foodSpawn.setValue(0);
    Animated.sequence([
      Animated.timing(foodSpawn, { toValue: 1.1, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(foodSpawn, { toValue: 1.0, duration: 120, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]).start();
  };
  useEffect(() => {
    if (food) triggerFoodSpawn();
  }, [food?.x, food?.y]);

  // Swipe-kontroller (telefon) — flyttas till brädet via props
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, g) => {
        const { dx, dy } = g;
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 20) setDir((d) => (d.x === -1 ? d : { x: 1, y: 0 }));
          else if (dx < -20) setDir((d) => (d.x === 1 ? d : { x: -1, y: 0 }));
        } else {
          if (dy > 20) setDir((d) => (d.y === -1 ? d : { x: 0, y: 1 }));
          else if (dy < -20) setDir((d) => (d.y === 1 ? d : { x: 0, y: -1 }));
        }
      },
    })
  ).current;

  // Piltangenter + Space (web/desktop)
  useEffect(() => {
    const onKeyDown = (e) => {
      const k = e.key;
      if (k === " " || k === "Spacebar") {
        e.preventDefault?.();
        if (!gameOver && !won) {
          if (running) setRunning(false);
          else if (countdown === 0) resumeWithCountdown();
        }
        return;
      }
      if (k === "ArrowUp") setDir((d) => (d.y === 1 ? d : { x: 0, y: -1 }));
      else if (k === "ArrowDown") setDir((d) => (d.y === -1 ? d : { x: 0, y: 1 }));
      else if (k === "ArrowLeft") setDir((d) => (d.x === 1 ? d : { x: -1, y: 0 }));
      else if (k === "ArrowRight") setDir((d) => (d.x === -1 ? d : { x: 1, y: 0 }));
    };
    if (Platform.OS === "web") {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
    return () => {};
  }, [running, gameOver, won, countdown]);

  // Spelloop
  useEffect(() => {
    if (!running || gameOver || won || countdown > 0) return;
    const speed = LEVELS[level].speed;
    const tickMs = Math.max(45, Math.floor(1000 / speed));
    const id = setInterval(() => {
      setSnake((prev) => {
        const head = { x: (prev[0].x + dir.x + GRID) % GRID, y: (prev[0].y + dir.y + GRID) % GRID };

        // kollision
        if (isObstacle(LEVELS, level, head) || prev.some((p) => p.x === head.x && p.y === head.y)) {
          clearInterval(id);
          setRunning(false);
          setGameOver(true);
          play(overPlayer);
          if (hapticsOn) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          saveHighscore(score);
          return prev;
        }

        // åt mat?
        let grew = false;
        if (food && head.x === food.x && head.y === food.y) {
          grew = true;
          play(eatPlayer);
          triggerGlow();
          if (hapticsOn) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          setHueBase((h) => (h + 37) % 360);
          setScore((s) => {
            const ns = s + 1;
            if (ns % 3 === 0 && level < LEVELS.length - 1) {
              setLevel((lv) => lv + 1);
              play(upPlayer);
              if (hapticsOn) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            }
            return ns;
          });
          const nextFood = spawnFood(LEVELS, level, [head, ...prev]);
          if (nextFood) {
            setFood(nextFood);
          } else {
            // 🎉 BRÄDET FULLT → YOU WIN
            setFood(null);
            setRunning(false);
            setWon(true);
            play(upPlayer);
            if (hapticsOn) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            saveHighscore(score + 1);
          }
        }

        const next = [head, ...prev];
        if (!grew) next.pop();
        return next;
      });
    }, tickMs);
    return () => clearInterval(id);
  }, [dir, running, level, gameOver, won, score, LEVELS, countdown, food, hapticsOn]);

  // Mat efter level-byte / full board => win
  useEffect(() => {
    if (won) return;
    if (food && (isObstacle(LEVELS, level, food) || snake.some((s) => s.x === food.x && s.y === food.y))) {
      const nf = spawnFood(LEVELS, level, snake);
      if (nf) setFood(nf);
      else {
        setFood(null);
        setRunning(false);
        setWon(true);
        play(upPlayer);
        if (hapticsOn) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  // Restart & Next level & Resume
  function restart() {
    const startSnake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
    setSnake(startSnake);
    setDir({ x: 1, y: 0 });
    setScore(0);
    setLevel(startLevel);
    setGameOver(false);
    setWon(false);
    setRunning(true);
    setHueBase(0);
    setCountdown(0);
    const nf = spawnFood(LEVELS, startLevel, startSnake);
    if (nf) setFood(nf);
    else {
      setFood(null);
      setRunning(false);
      setWon(true);
    }
  }
  function nextLevel() {
    const next = Math.min(level + 1, LEVELS.length - 1);
    const startSnake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
    setSnake(startSnake);
    setDir({ x: 1, y: 0 });
    setLevel(next);
    setGameOver(false);
    setWon(false);
    setScore((s) => s);
    setHueBase(0);
    const nf = spawnFood(LEVELS, next, startSnake);
    if (nf) setFood(nf);
    else setFood(null);
    resumeWithCountdown();
  }
  function resumeWithCountdown() {
    setCountdown(3);
    const t1 = setTimeout(() => setCountdown(2), 700);
    const t2 = setTimeout(() => setCountdown(1), 1400);
    const t3 = setTimeout(() => {
      setCountdown(0);
      setRunning(true);
    }, 2100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }

  // Färger/animation states
  const nextHueBase = (hueBase + 37) % 360;
  const foodColor = `hsl(${nextHueBase} 85% 60%)`;
  const headHue = hueBase;
  const headColor = `hsl(${headHue} 90% 60%)`;
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });
  const head = snake[0];

  // Gemensam knappstil
  const btn = {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  };

  // “Toggle”-piller
  const TogglePill = ({ on, label, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
        backgroundColor: on ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.10)",
        marginLeft: 8,
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: on ? "#22c55e" : "#94a3b8",
          marginRight: 6,
        }}
      />
      <Text
        style={{
          color: "#fff",
          fontSize: 12,
          letterSpacing: 0.3,
          fontWeight: fontsLoaded ? "normal" : "600",
          fontFamily: fontsLoaded ? "Inter_600SemiBold" : undefined,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
      <LevelBackground levels={LEVELS} levelIndex={level} boardSize={BOARD} panHandlers={pan.panHandlers}>
        {/* GLÖD bakom huvudet */}
        {head && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: head.x * CELL,
              top: head.y * CELL,
              width: CELL,
              height: CELL,
              borderRadius: CELL / 2,
              backgroundColor: headColor,
              opacity: glow,
              transform: [{ scale: glowScale }],
              shadowColor: headColor,
              shadowOpacity: 0.6,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 0 },
              elevation: 8,
            }}
          />
        )}

        {/* Hinder */}
        {(LEVELS[level].obstacles || []).map((o, i) => (
          <View key={`o${i}`} style={{ position: "absolute", left: o.x * CELL, top: o.y * CELL, width: CELL - 4, height: CELL - 4, backgroundColor: "#64748b", borderRadius: 8, margin: 2 }} />
        ))}

        {/* Orm */}
        {snake.map((s, i) => {
          const hue = (hueBase + i * 28) % 360;
          const isHead = i === 0;
          const color = `hsl(${hue} 80% ${isHead ? "55%" : "50%"})`;
          return isHead ? (
            <Animated.View
              key={`s${i}`}
              style={{
                position: "absolute",
                left: s.x * CELL,
                top: s.y * CELL,
                width: CELL - 2,
                height: CELL - 2,
                backgroundColor: color,
                borderRadius: 6,
                margin: 1,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.6)",
                transform: [{ scale: headPulse }],
              }}
            />
          ) : (
            <View key={`s${i}`} style={{ position: "absolute", left: s.x * CELL, top: s.y * CELL, width: CELL - 2, height: CELL - 2, backgroundColor: color, borderRadius: 6, margin: 1 }} />
          );
        })}

        {/* Mat */}
        {food && (
          <Animated.View
            style={{
              position: "absolute",
              left: food.x * CELL,
              top: food.y * CELL,
              width: CELL,
              height: CELL,
              alignItems: "center",
              justifyContent: "center",
              transform: [{ scale: foodSpawn }],
              opacity: foodSpawn.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.6, 1] }),
            }}
          >
            <View
              style={{
                width: CELL * 0.7,
                height: CELL * 0.7,
                borderRadius: CELL * 0.35,
                backgroundColor: foodColor,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.6)",
              }}
            />
          </Animated.View>
        )}

        {/* PAUSE OVERLAY + COUNTDOWN */}
        {!running && !gameOver && !won && (
          <View
            pointerEvents="box-none"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: BOARD,
              height: BOARD,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(2,6,23,0.35)",
            }}
          >
            {countdown > 0 ? (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 64,
                    fontWeight: fontsLoaded ? "normal" : "900",
                    fontFamily: fontsLoaded ? "Inter_700Bold" : undefined,
                    textShadowColor: "rgba(0,0,0,0.4)",
                    textShadowRadius: 8,
                  }}
                >
                  {countdown}
                </Text>
                <Text style={{ color: "#fff", opacity: 0.8, marginTop: 8 }}>Get ready…</Text>
              </View>
            ) : (
              <Text
                style={{
                  color: "#fff",
                  fontSize: 24,
                  fontWeight: fontsLoaded ? "normal" : "800",
                  fontFamily: fontsLoaded ? "Inter_700Bold" : undefined,
                }}
              >
                Paused
              </Text>
            )}
          </View>
        )}

        {/* 🎉 YOU WIN OVERLAY */}
        {won && (
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: BOARD,
              height: BOARD,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(2,6,23,0.5)",
              padding: 16,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 42,
                marginBottom: 8,
                fontWeight: fontsLoaded ? "normal" : "900",
                fontFamily: fontsLoaded ? "Inter_700Bold" : undefined,
              }}
            >
              YOU WIN!
            </Text>
            <Text style={{ color: "#fff", opacity: 0.9, marginBottom: 16 }}>Board is full — nice job! 🎯</Text>
            {level < LEVELS.length - 1 ? (
              <TouchableOpacity onPress={nextLevel} style={{ backgroundColor: "#22c55e", paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999 }}>
                <Text style={{ color: "white", fontWeight: "800" }}>Next Level</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={restart} style={{ backgroundColor: "#3b82f6", paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999 }}>
                <Text style={{ color: "white", fontWeight: "800" }}>New Game</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ☠️ GAME OVER OVERLAY */}
        {gameOver && (
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: BOARD,
              height: BOARD,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(2,6,23,0.5)",
              padding: 16,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 42,
                marginBottom: 8,
                fontWeight: fontsLoaded ? "normal" : "900",
                fontFamily: fontsLoaded ? "Inter_700Bold" : undefined,
              }}
            >
              GAME OVER
            </Text>
            <TouchableOpacity onPress={restart} style={{ backgroundColor: "#ef4444", paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999 }}>
              <Text style={{ color: "white", fontWeight: "800" }}>Restart</Text>
            </TouchableOpacity>
          </View>
        )}
      </LevelBackground>

      {/* HUD – frostad och stilren */}
      <View style={{ position: "absolute", top: insets.top + 8, alignItems: "center", width: "100%" }}>
        {Platform.OS !== "android" ? (
          <BlurView intensity={30} tint="dark" style={{ borderRadius: 14, overflow: "hidden" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.18)",
              }}
            >
              <DifficultyBadge difficulty={difficulty} fontsLoaded={fontsLoaded} />
              <Text
                style={{
                  color: "#fff",
                  opacity: 0.95,
                  fontSize: 14,
                  letterSpacing: 0.3,
                  fontWeight: fontsLoaded ? "normal" : "600",
                  fontFamily: fontsLoaded ? "Inter_600SemiBold" : undefined,
                }}
              >
                Score {score} · L{level + 1}/20 — {LEVELS[level].name}
              </Text>

              {/* Settings piller: ljud + haptics */}
              <View style={{ flexDirection: "row", marginLeft: 10 }}>
                <TogglePill on={soundOn} label={soundOn ? "Sound On" : "Sound Off"} onPress={() => setSoundOn((v) => !v)} />
                <TogglePill on={hapticsOn} label={hapticsOn ? "Haptics On" : "Haptics Off"} onPress={() => setHapticsOn((v) => !v)} />
              </View>
            </View>
          </BlurView>
        ) : (
          // Android fallback (utan BlurView)
          <View
            style={{
              backgroundColor: "rgba(15,23,42,0.55)",
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.18)",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <DifficultyBadge difficulty={difficulty} fontsLoaded={fontsLoaded} />
            <Text
              style={{
                color: "#fff",
                opacity: 0.95,
                fontSize: 14,
                letterSpacing: 0.3,
                fontWeight: fontsLoaded ? "normal" : "600",
                fontFamily: fontsLoaded ? "Inter_600SemiBold" : undefined,
              }}
            >
              Score {score} · L{level + 1}/20 — {LEVELS[level].name}
            </Text>

            <View style={{ flexDirection: "row", marginLeft: 10 }}>
              <TogglePill on={soundOn} label={soundOn ? "Sound On" : "Sound Off"} onPress={() => setSoundOn((v) => !v)} />
              <TogglePill on={hapticsOn} label={hapticsOn ? "Haptics On" : "Haptics Off"} onPress={() => setHapticsOn((v) => !v)} />
            </View>
          </View>
        )}
      </View>

      {/* ⬇️ Kontroll: bara PAUSE/RESUME centrerad */}
      {!won && !gameOver && (
        <View
          style={{
            position: "absolute",
            bottom: insets.bottom + 18,
            left: 0,
            right: 0,
            alignItems: "center",
          }}
        >
          {running ? (
            <TouchableOpacity onPress={() => setRunning(false)} style={[btn, { backgroundColor: "#3b82f6" }]}>
              <Text
                style={{
                  color: "white",
                  fontWeight: fontsLoaded ? "normal" : "800",
                  fontFamily: fontsLoaded ? "Inter_700Bold" : undefined,
                }}
              >
                Pause
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={resumeWithCountdown} style={[btn, { backgroundColor: "#22c55e" }]}>
              <Text
                style={{
                  color: "white",
                  fontWeight: fontsLoaded ? "normal" : "800",
                  fontFamily: fontsLoaded ? "Inter_700Bold" : undefined,
                }}
              >
                {countdown > 0 ? "Get Ready…" : "Resume"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

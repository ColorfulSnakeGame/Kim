import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Easing, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Skärm-höjd för att beräkna bubblornas färd
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Bubblornas konfiguration
const BUBBLES = [
  { size: 160, left: 20, delay: 0 },
  { size: 110, left: 220, delay: 200 },
  { size: 90, left: 80, delay: 450 },
  { size: 70, left: 150, delay: 700 },
  { size: 130, left: 260, delay: 1000 },
  { size: 60, left: 10, delay: 1200 },
];

export default function Home({ navigation }) {
  const floats = useRef(BUBBLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    floats.forEach((val, i) => {
      const loop = () => {
        val.setValue(0);
        Animated.timing(val, {
          toValue: 1,
          duration: 8000 + i * 1200, // olika hastighet per bubbla
          delay: BUBBLES[i].delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(({ finished }) => finished && loop());
      };
      loop();
    });
  }, [floats]);

  return (
    <LinearGradient
      colors={["#b4f1a9", "#eaffb0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      {/* BUBBLES LAYER */}
      <View style={{ position: "absolute", inset: 0 }}>
        {BUBBLES.map((b, i) => {
          const translateY = floats[i].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -SCREEN_HEIGHT - b.size], // flytta hela vägen upp och lite till
          });
          return (
            <Animated.View
              key={i}
              style={{
                position: "absolute",
                bottom: -b.size, // start under skärmen
                left: b.left,
                width: b.size,
                height: b.size,
                borderRadius: b.size / 2,
                transform: [{ translateY }],
                backgroundColor:
                  i % 2 === 0 ? "rgba(59,130,246,0.14)" : "rgba(16,185,129,0.12)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.28)",
              }}
            />
          );
        })}
      </View>

      {/* CONTENT */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Text
          style={{
            fontSize: 34,
            fontWeight: "900",
            marginBottom: 8,
            color: "#0f172a",
          }}
        >
          Colorful Snake 🐍
        </Text>
        <Text
          style={{
            color: "#1f2937",
            marginBottom: 24,
            textAlign: "center",
            fontWeight: "600",
          }}
        >
          Eat, grow, and survive — 30 colorful levels of snake action!
        </Text>

        {/* Start -> Difficulty */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Difficulty")}
          style={{
            backgroundColor: "#10b981",
            paddingVertical: 14,
            paddingHorizontal: 22,
            borderRadius: 16,
            marginBottom: 12,
            width: 240,
            alignItems: "center",
            shadowColor: "#10b981",
            shadowOpacity: 0.25,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
          }}
        >
          <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>
            Start Game
          </Text>
        </TouchableOpacity>

        {/* Highscores */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Highscores")}
          style={{
            backgroundColor: "#3b82f6",
            paddingVertical: 12,
            paddingHorizontal: 22,
            borderRadius: 14,
            width: 240,
            alignItems: "center",
            shadowColor: "#3b82f6",
            shadowOpacity: 0.22,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
          }}
        >
          <Text style={{ color: "white", fontWeight: "800" }}>Highscores</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

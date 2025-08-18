// screens/Game.js
import React, { useLayoutEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GameCanvas from "../game/GameCanvas";

export default function Game({ navigation, route }) {
  const [paused, setPaused] = useState(false);
  const difficulty = route?.params?.difficulty || "medium";
  const startLevel = Number.isInteger(route?.params?.startLevel) ? route.params.startLevel : 0;

  const goToMenu = () => {
    setPaused(true);
    setTimeout(() => navigation.navigate("Home"), 80);
  };

  // Sätt upp navigationens header (titel + knappar)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: `Colorful Snake — ${difficulty.toUpperCase()} (L${startLevel + 1})`,
      headerBackTitleVisible: false,
      headerLeft: () => (
        <TouchableOpacity onPress={goToMenu} style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
          <Text style={{ fontWeight: "700" }}>Back</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setPaused((p) => !p)}
          style={{ paddingHorizontal: 8, paddingVertical: 6 }}
        >
          <Text style={{ fontWeight: "700" }}>{paused ? "Resume" : "Pause"}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, difficulty, startLevel, paused]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Själva spelet */}
      <View style={{ flex: 1 }}>
        <GameCanvas paused={paused} difficulty={difficulty} startLevel={startLevel} />

        {/* Flytande "Menu" knapp */}
        <View style={{ position: "absolute", left: 16, bottom: 20 }}>
          <TouchableOpacity
            onPress={goToMenu}
            style={{
              backgroundColor: "rgba(15,23,42,0.8)",
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.18)",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>⟵ Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

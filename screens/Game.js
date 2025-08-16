import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import GameCanvas from "../game/GameCanvas";

export default function Game({ navigation, route }) {
  const [paused, setPaused] = useState(false);
  const difficulty = route?.params?.difficulty || "medium";
  const startLevel = Number.isInteger(route?.params?.startLevel) ? route.params.startLevel : 0;

  const goToMenu = () => {
    setPaused(true);
    setTimeout(() => navigation.navigate("Home"), 80);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* Top bar */}
      <View
        style={{
          height: 56,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          backgroundColor: "#fff",
        }}
      >
        <TouchableOpacity onPress={goToMenu}>
          <Text style={{ fontWeight: "700" }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ fontWeight: "800" }}>
          Colorful Snake — {difficulty.toUpperCase()} (L{startLevel + 1})
        </Text>
        <TouchableOpacity onPress={() => setPaused((p) => !p)}>
          <Text style={{ fontWeight: "700" }}>{paused ? "Resume" : "Pause"}</Text>
        </TouchableOpacity>
      </View>

      {/* Spelet */}
      <View style={{ flex: 1 }}>
        <GameCanvas paused={paused} difficulty={difficulty} startLevel={startLevel} />
        {/* Flytande Return to Menu */}
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
    </View>
  );
}

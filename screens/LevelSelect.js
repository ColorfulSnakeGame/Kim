import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Samma namnlogik som i spelet (20 nivåer, 10 teman i loop)
const THEMES = [
  { name:"Sunny Meadow" }, { name:"Candy Forest" }, { name:"Starry Caves" }, { name:"Neon City" },
  { name:"Ocean Breeze" }, { name:"Lavender Fields" }, { name:"Desert Dunes" }, { name:"Frost Peak" },
  { name:"Jungle Run" }, { name:"Volcano Path" },
];
const LEVEL_NAMES = new Array(20).fill(0).map((_,i)=>{
  const theme = THEMES[i % THEMES.length].name;
  const chapter = Math.floor(i / THEMES.length) + 1;
  return `${theme} ${chapter}`;
});

export default function LevelSelect({ navigation, route }) {
  const difficulty = route?.params?.difficulty || "medium";

  const openLevel = (index) => {
    navigation.navigate("Game", { difficulty, startLevel: index });
  };

  return (
    <LinearGradient
      colors={["#b4f1a9", "#eaffb0"]}
      start={{x:0,y:0}}
      end={{x:1,y:1}}
      style={{ flex: 1 }}
    >
      {/* Header */}
      <View style={{ paddingTop: 54, paddingHorizontal: 16, paddingBottom: 12, alignItems: "center" }}>
        <Text style={{ fontSize: 26, fontWeight: "900", color: "#0f172a" }}>Choose Level</Text>
        <Text style={{ marginTop: 6, color: "#1f2937", fontWeight: "700" }}>
          Difficulty: {difficulty.toUpperCase()}
        </Text>
      </View>

      {/* Grid */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          {LEVEL_NAMES.map((label, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => openLevel(i)}
              style={{
                width: "48%",
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: 16,
                paddingVertical: 14,
                paddingHorizontal: 12,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: "rgba(15,23,42,0.12)",
                shadowColor: "#000",
                shadowOpacity: 0.12,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 }
              }}
            >
              <Text style={{ fontWeight: "900", fontSize: 16, color: "#0f172a" }}>
                Level {i + 1}
              </Text>
              <Text style={{ marginTop: 4, color: "#374151", fontWeight: "700" }}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Footer actions */}
      <View style={{ alignItems: "center", paddingBottom: 18 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
          <Text style={{ fontWeight: "800", color: "#111827" }}>⟵ Back</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

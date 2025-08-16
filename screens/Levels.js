import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { LEVELS } from "../game/GameCanvas";

export default function Levels({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 12 }}>
          <Text style={{ fontWeight: "700" }}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: "800" }}>Levels (20)</Text>
      </View>

      <FlatList
        data={LEVELS.map((lvl, i) => ({ ...lvl, index: i }))}
        keyExtractor={(item) => String(item.index)}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ fontWeight: "800" }}>Level {item.index + 1}: {item.name}</Text>
              <Text style={{ color: "#666", fontSize: 12 }}>
                Speed ~ {item.speed} — Obstacles: {item.obstacles.length}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("Game", { levelIndex: item.index })}
              style={{ backgroundColor: "#10b981", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}
            >
              <Text style={{ color: "white", fontWeight: "800" }}>Play</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

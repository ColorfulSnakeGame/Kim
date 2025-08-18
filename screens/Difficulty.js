import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Difficulty({ navigation }) {
  const pick = (level) => navigation.navigate("LevelSelect", { difficulty: level });

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <LinearGradient
        colors={["#c3f0ca", "#f8ffd6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}
      >
        <Text style={{ fontSize: 28, fontWeight: "800", marginBottom: 8 }}>Choose Difficulty</Text>
        <Text style={{ color: "#444", marginBottom: 24, textAlign: "center" }}>
          Pick your challenge and have fun!
        </Text>

        <TouchableOpacity
          onPress={() => pick("easy")}
          style={{
            width: 260, backgroundColor: "#22c55e", paddingVertical: 14, borderRadius: 16,
            marginBottom: 12, alignItems: "center", shadowColor: "#22c55e", shadowOpacity: 0.25, shadowRadius: 10,
            shadowOffset: { width: 0, height: 3 }, elevation: 4,
          }}
        >
          <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>Easy</Text>
          {/* INGEN hastighetsändring längre */}
          <Text style={{ color: "white", opacity: 0.9 }}>Fewer obstacles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => pick("medium")}
          style={{
            width: 260, backgroundColor: "#3b82f6", paddingVertical: 14, borderRadius: 16,
            marginBottom: 12, alignItems: "center", shadowColor: "#3b82f6", shadowOpacity: 0.25, shadowRadius: 10,
            shadowOffset: { width: 0, height: 3 }, elevation: 4,
          }}
        >
          <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>Medium</Text>
          <Text style={{ color: "white", opacity: 0.9 }}>Balanced</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => pick("hard")}
          style={{
            width: 260, backgroundColor: "#ef4444", paddingVertical: 14, borderRadius: 16,
            alignItems: "center", shadowColor: "#ef4444", shadowOpacity: 0.25, shadowRadius: 10,
            shadowOffset: { width: 0, height: 3 }, elevation: 4,
          }}
        >
          <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>Hard</Text>
          <Text style={{ color: "white", opacity: 0.9 }}>More obstacles</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 18, padding: 8 }}>
          <Text style={{ color: "#111827", fontWeight: "700" }}>⟵ Back</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { loadHighscores } from "../utils/storage";

export default function Highscores({ navigation }) {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const s = await loadHighscores();
      setScores(s);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 12 }}>
          <Text style={{ fontWeight: "700" }}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: "800" }}>Highscores</Text>
      </View>

      <FlatList
        data={scores}
        keyExtractor={(_, i) => String(i)}
        ListEmptyComponent={<Text style={{ color: "#666" }}>Inga highscores ännu – spela en runda! 🎮</Text>}
        renderItem={({ item, index }) => (
          <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" }}>
            <Text style={{ fontWeight: "800" }}>
              #{index + 1} — {item.score} poäng
            </Text>
            <Text style={{ color: "#666", fontSize: 12 }}>{new Date(item.date).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

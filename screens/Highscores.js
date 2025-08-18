// screens/Highscores.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Inter_700Bold, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { loadHighscores, clearHighscores } from "../utils/storage";

export default function Highscores({ navigation }) {
  const [scores, setScores] = useState([]);
  const [newHighscore, setNewHighscore] = useState(false);
  const [fontsLoaded] = useFonts({ Inter_700Bold, Inter_600SemiBold });

  // Ladda highscores vid focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const s = await loadHighscores();
      setScores(s);

      if (s.length > 0) {
        const top = s[0]?.score ?? 0;
        const latest = s[s.length - 1]?.score ?? -1;
        setNewHighscore(latest === top && top > 0);
      } else {
        setNewHighscore(false);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const actuallyClear = async () => {
    await clearHighscores();
    const s = await loadHighscores(); // ska bli []
    setScores(s);
    setNewHighscore(false);
  };

  const onClearPress = async () => {
    if (Platform.OS === "web") {
      // Alert.alert fungerar inte på web → använd confirm
      const ok = window.confirm?.("Are you sure you want to clear all highscores?");
      if (ok) {
        try {
          await actuallyClear();
          console.log("Highscores cleared (web).");
        } catch (e) {
          console.warn("Failed to clear highscores on web:", e);
        }
      }
      return;
    }

    // iOS/Android: kör vanliga Alert
    Alert.alert(
      "Rensa highscores",
      "Är du säker på att du vill ta bort alla highscores?",
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Rensa",
          style: "destructive",
          onPress: async () => {
            try {
              await actuallyClear();
              console.log("Highscores cleared (native).");
            } catch (e) {
              console.warn("Kunde inte rensa highscores:", e);
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={["#0f0c29", "#302b63", "#24243e"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, padding: 16 }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 12 }}>
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: fontsLoaded ? "normal" : "800",
              fontFamily: fontsLoaded ? "Inter_700Bold" : undefined,
            }}
          >
            ‹ Back
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            color: "#fff",
            fontSize: 22,
            fontWeight: fontsLoaded ? "normal" : "900",
            fontFamily: fontsLoaded ? "Inter_700Bold" : undefined,
          }}
        >
          Highscores
        </Text>

        <View style={{ width: 48 }} />
      </View>

      {/* Lista */}
      <FlatList
        data={scores}
        keyExtractor={(_, i) => String(i)}
        ListEmptyComponent={
          <Text style={{ color: "#ccc", fontFamily: fontsLoaded ? "Inter_600SemiBold" : undefined }}>
            No highscores yet – Start Gaming! 🎮
          </Text>
        }
        renderItem={({ item, index }) => (
          <View
            style={{
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255,255,255,0.14)",
            }}
          >
            <Text
              style={{
                color: index === 0 ? "#facc15" : "#fff",
                fontWeight: fontsLoaded ? "normal" : "800",
                fontFamily: fontsLoaded ? "Inter_700Bold" : undefined,
                fontSize: 16,
              }}
            >
              #{index + 1} — {item.score} points
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 12,
                marginTop: 4,
                fontFamily: fontsLoaded ? "Inter_600SemiBold" : undefined,
              }}
            >
              {new Date(item.date).toLocaleString()}
            </Text>
          </View>
        )}
      />

      {/* Clear-knapp */}
      <View style={{ marginTop: 16, alignItems: "center" }}>
        <TouchableOpacity
          onPress={onClearPress}
          style={{
            backgroundColor: "#ef4444",
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "700",
              fontFamily: fontsLoaded ? "Inter_700Bold" : undefined,
            }}
          >
            Clear Highscores
          </Text>
        </TouchableOpacity>
      </View>

      {/* Popup för nytt highscore */}
      {newHighscore && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
          pointerEvents="auto"
        >
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.85)",
              padding: 24,
              borderRadius: 16,
              alignItems: "center",
              maxWidth: 320,
              width: "80%",
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "900",
                color: "#fff",
                textAlign: "center",
                marginBottom: 12,
                fontFamily: fontsLoaded ? "Inter_700Bold" : undefined,
              }}
            >
              🎉 New Highscore! 🎉
            </Text>
            <TouchableOpacity
              onPress={() => setNewHighscore(false)}
              style={{
                marginTop: 6,
                paddingVertical: 8,
                paddingHorizontal: 20,
                backgroundColor: "#10b981",
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "700",
                  fontFamily: fontsLoaded ? "Inter_700Bold" : undefined,
                }}
              >
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

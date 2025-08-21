// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './screens/Home';
import Difficulty from './screens/Difficulty';
import LevelSelect from './screens/LevelSelect';
import Game from './screens/Game';
import Highscores from './screens/Highscores';

import { initAdsWithConsent } from './utils/consent';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    // Kör UMP vid appstart innan några annonser laddas.
    // Tips vid test i EU: lägg till { debugEEA: true } temporärt.
    initAdsWithConsent();
    // Exempel för test (ta bort innan produktion):
    // initAdsWithConsent({ debugEEA: true });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Difficulty" component={Difficulty} />
        <Stack.Screen name="LevelSelect" component={LevelSelect} />
        <Stack.Screen name="Game" component={Game} />
        <Stack.Screen name="Highscores" component={Highscores} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

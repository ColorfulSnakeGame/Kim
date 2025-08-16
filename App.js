import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './screens/Home';
import Difficulty from './screens/Difficulty';
import LevelSelect from './screens/LevelSelect';
import Game from './screens/Game';
import Highscores from './screens/Highscores';

const Stack = createNativeStackNavigator();

export default function App() {
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

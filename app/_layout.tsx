import { Stack, useNavigation } from 'expo-router';
import { useFonts } from "expo-font";
import AuthProvider from "../app/AuthContext/AuthContext"
import { useEffect } from 'react';
export default function RootLayout() {
  
  useFonts({
    'outfit': require('./../assets/fonts/Outfit-Regular.ttf'),
    'outfit-medium': require('./../assets/fonts/Outfit-Medium.ttf'),
    'outfit-bold': require('./../assets/fonts/Outfit-Bold.ttf')
  })
  return (
    <AuthProvider>
      <Stack>
        {/* <Stack.Screen name="index" options={{
        headerShown:false,
        }}/> */}
        {/* <Stack.Screen name="Login" options={{
          headerShown: false,
        }} /> */}
        <Stack.Screen name="(tabs)" options={{
        headerShown:false,
        }}/>
      </Stack>
    </AuthProvider>

  );
}

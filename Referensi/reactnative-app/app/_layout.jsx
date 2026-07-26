import { Stack, SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import FlashMessage from 'react-native-flash-message';

import '../global.css';


SplashScreen.preventAutoHideAsync();


const RootLayout = () => {


  const [ fontsLoaded, error ] = useFonts({
    "Lora-Medium": require("../assets/fonts/Lora-Medium.ttf"),
    "Lora-Bold": require("../assets/fonts/Lora-Bold.ttf"),
    "Lora-Regular": require("../assets/fonts/Lora-Regular.ttf"),
  });


  useEffect(() => {

    
    if(error) throw error;

    if(fontsLoaded) SplashScreen.hideAsync();


  }, [fontsLoaded, error]);


  if (!fontsLoaded && !error) {

    return null;
    
  }


  return (
    <>

      <Stack>

        <Stack.Screen name='index' options={{ headerShown: false }} />
            
        <Stack.Screen name='(form)' options={{ headerShown: false }} />

        <Stack.Screen name='(result)' options={{ headerShown: false }} />

        <Stack.Screen name='(sharepdf)' options={{ headerShown: false }} />

      </Stack>

      <StatusBar backgroundColor="#0f0720" style='light' />

      <FlashMessage position='bottom' />

    </>
  )

}


export default RootLayout;
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';


const RootLayout = () => {


  return (
    <>

      <Stack>

        <Stack.Screen name='share-analysis-pdf' options={{ headerShown: false }} />

      </Stack>

      <StatusBar backgroundColor="#0f0720" style='light' />

    </>
  )

}


export default RootLayout;
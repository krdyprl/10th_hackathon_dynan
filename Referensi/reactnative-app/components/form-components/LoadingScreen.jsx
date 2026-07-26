import { View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from "lottie-react-native";


const LoadingScreen = () => {
  

  return (
    <SafeAreaView className="h-full">


      <LinearGradient
        colors={['#0f0720', '#1a103f', '#2c1469']}
        className="h-full w-full"
      >

        <ScrollView contentContainerStyle={{ height: '100%' }}>

          <View className="w-full h-full items-center justify-center px-5">

            <View className="absolute top-20 right-[-100] w-[300px] h-[300px] rounded-full bg-violet-600/20 blur-3xl" />
            <View className="absolute bottom-[-50] left-[-100] w-[250px] h-[250px] rounded-full bg-purple-500/20 blur-3xl" />
            
            <LottieView
              source={require("../../assets/Animation - 1737631319157.json")}
              style={{width: "100%", height: "100%", marginTop: 6}}
              autoPlay
              loop
            />


            <View className="absolute top-40 left-10 w-6 h-6 rounded-full bg-violet-400/60 animate-pulse" />
            <View className="absolute bottom-40 right-12 w-4 h-4 rounded-full bg-purple-400/60 animate-pulse" />
          

          </View>


        </ScrollView>


      </LinearGradient>
      

    </SafeAreaView>
  )
}


export default LoadingScreen;
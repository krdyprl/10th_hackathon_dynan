import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';


const Index = () => {

  return (
    <SafeAreaView className="h-full">


      <LinearGradient
        colors={['#0f0720', '#1a103f', '#2c1469']}
        className="h-full w-full"
      >


        <ScrollView contentContainerStyle={{ height: '100%' }}>


          <View className="w-full h-full items-center justify-center px-8">


            <View className="absolute top-20 right-[-100] w-[300px] h-[300px] rounded-full bg-violet-600/20 blur-3xl" />
            <View className="absolute bottom-[-50] left-[-100] w-[250px] h-[250px] rounded-full bg-purple-500/20 blur-3xl" />


            <Text className="text-6xl font-lorabold text-violet-300 font-semibold tracking-wider mb-6">
              QuillSense
            </Text>


            <Text className="text-3xl font-loramedium text-violet-300 text-center mb-6">
              Find Your Peace
            </Text>


            <Text className="text-2xl italic font-loraregular font-bold text-gray-300 text-center leading-relaxed tracking-wider">
              Handwriting insights for better mental health
            </Text>


            <TouchableOpacity 
              activeOpacity={0.8}
              className="w-full mt-14 rounded-2xl overflow-hidden"
              onPress={() => router.replace('/(form)/input-form')}
            >

              <LinearGradient
                colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-1 rounded-2xl"
              >

                <View className="bg-violet-700/30 rounded-xl border-2 border-violet-300/30">
                  
                  <View className="px-6 py-7 items-center justify-center">

                    <Text className="text-white font-lorabold text-xl capitalize tracking-wider">
                      Analyze your Handwriting
                    </Text>

                  </View>

                </View>

              </LinearGradient>

            </TouchableOpacity>


            <View className="absolute top-40 left-10 w-6 h-6 rounded-full bg-violet-400/60 animate-pulse" />
            <View className="absolute bottom-40 right-12 w-4 h-4 rounded-full bg-purple-400/60 animate-pulse" />
          

          </View>


        </ScrollView>


      </LinearGradient>
      

    </SafeAreaView>
  );
};


export default Index;
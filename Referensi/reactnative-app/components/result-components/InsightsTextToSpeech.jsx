import { View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { markdownToTxt } from 'markdown-to-txt';
import * as Speech from 'expo-speech';
import { Play, Pause, RefreshCw } from 'lucide-react-native';
import LottieView from "lottie-react-native";


const InsightsTextToSpeech = ({ data }) => {


  const [isPlaying, setIsPlaying] = useState(false);

  const markdownToPlainText = markdownToTxt(data);


  const startAudioPlay = () => {

    setIsPlaying(true);

    Speech.speak(markdownToPlainText, {
      rate: 0.8,
      pitch: 1.0,
      onDone: () => setIsPlaying(false),
      onStopped: () => setIsPlaying(false),
    });

  };


  const pauseAudioPlay = () => {

    Speech.stop();

    setIsPlaying(false);

  };


  const restartAudioPlay = () => {

    Speech.stop();

    setIsPlaying(false);

    setTimeout(() => {

      startAudioPlay();

    }, 200);

  };


  return (
    <View className='w-full mt-8 items-center'>


      <Text className='text-violet-300 text-lg font-lorabold mb-4 text-center px-4'>
        Don't want to read? Listen to the insights
      </Text>


      {isPlaying && <View className='w-full h-24 items-center justify-center mb-4'>
          <LottieView
            source={require("../../assets/Animation - 1738003352335.json")}
            style={{ width: 400, height: 100 }} 
            autoPlay
            loop
          />
      </View>}


      <View className='w-full flex-row items-center justify-center gap-6 mb-6'>

        {!isPlaying ? (

          <TouchableOpacity 
            className='w-40 py-4 bg-violet-600/40 border-2 border-violet-500 rounded-2xl items-center justify-center flex-row gap-3 shadow-lg'
            activeOpacity={0.7}
            onPress={startAudioPlay}
          >
            <Play size={24} color="#C4B5FD" />
            <Text className='text-violet-200 font-loramedium text-lg'>Play</Text>
          </TouchableOpacity>

        ) : (
          <>

            <TouchableOpacity 
              className='w-36 py-4 bg-violet-600/40 border-2 border-violet-500 rounded-2xl items-center justify-center flex-row gap-3 shadow-lg'
              activeOpacity={0.7}
              onPress={pauseAudioPlay}
            >
              <Pause size={24} color="#C4B5FD" />
              <Text className='text-violet-200 font-loramedium text-lg'>Pause</Text>
            </TouchableOpacity>

            
            <TouchableOpacity 
              className='w-36 py-4 bg-violet-600/40 border-2 border-violet-500 rounded-2xl items-center justify-center flex-row gap-3 shadow-lg'
              activeOpacity={0.7}
              onPress={restartAudioPlay}
            >
              <RefreshCw size={24} color="#C4B5FD" />
              <Text className='text-violet-200 font-loramedium text-lg'>Reset</Text>
            </TouchableOpacity>

          </>

        )}

      </View>
      
    </View>

  );

};


export default InsightsTextToSpeech;
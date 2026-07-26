import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';

import { modelResponseState } from '../../zustand-store/store';
import HandWritingInsights from '../../components/result-components/HandWritingInsights';
import HandWritingScoresGraph from '../../components/result-components/HandWritingScoresGraph';
import MoodStressCorrelation from '../../components/result-components/MoodStressCorrelation';
import FutureMoodPredictionGraph from '../../components/result-components/FutureMoodPredictionGraph';
import PersonalizedRecommendation from '../../components/result-components/PersonalizedRecommendation';
import Summary from '../../components/result-components/Summary';
import Conclusion from '../../components/result-components/Conclusion';


const ResultAnalysis = () => {
  

  const [ step, setStep ] = useState(1);


  const { responseFromGeminiModel } = modelResponseState((state) => state);


  const parsedData = JSON.parse(responseFromGeminiModel.replace(/```json|```/g, '').trim());


  const handWritingInsights = parsedData?.handwritingInsights;

  const handwritingScores = parsedData?.handwritingScores;

  const moodStressCorrelation = parsedData?.moodStressCorrelation;

  const personalizedRecommendations = parsedData?.personalizedRecommendations;

  const futureMoodPrediction = parsedData?.futureMoodPrediction;

  const summary = parsedData?.summary;

  const conclusion = parsedData?.conclusion;


  return (
    <SafeAreaView className="h-full">


      <LinearGradient
        colors={['#0f0720', '#1a103f', '#2c1469']}
        className="h-full w-full"
      >

        <ScrollView>

          <View className="w-full h-full items-center justify-center px-5">

            <View className="absolute top-20 right-[-100] w-[300px] h-[300px] rounded-full bg-violet-600/20 blur-3xl" />
            <View className="absolute bottom-[-50] left-[-100] w-[250px] h-[250px] rounded-full bg-purple-500/20 blur-3xl" />


            {step === 1 ? (

              <HandWritingInsights data={handWritingInsights} />
            
            ) : step === 2 ? (

              <HandWritingScoresGraph data={handwritingScores} />

            ) :  step === 3 ? (

              <MoodStressCorrelation data={moodStressCorrelation} />

            ) : step === 4 ? (

              <PersonalizedRecommendation data={personalizedRecommendations} />

            ) : step === 5 ? (

              <FutureMoodPredictionGraph data={futureMoodPrediction} />

            ) : step === 6 ? (

              <Summary data={summary} />

            ) : step === 7 ? (

              <Conclusion data={conclusion} />

            ) : null} 


            <View className='w-full items-center justify-between flex-row gap-5 my-8'>

              <TouchableOpacity 
                className='py-5 w-2/5 bg-transparent border-4 border-violet-600 disabled:border-violet-400 disabled:bg-violet-400 items-center justify-center rounded-2xl shadow-xl'
                disabled={step === 1}
                activeOpacity={0.7}
                onPress={() => setStep(step - 1)}
              >

                <Text className='text-white text-lg'>Previous</Text>

              </TouchableOpacity>

              {step === 5 ? <TouchableOpacity 
                className='py-5 w-3/6 bg-transparent border-4 border-violet-600 disabled:border-violet-400 disabled:bg-violet-400 items-center justify-center rounded-2xl shadow-xl'
                activeOpacity={0.7}
                onPress={() => router.replace('/(sharepdf)/share-analysis-pdf')}
              >

                <Text className='text-white text-lg'>Share Analysis</Text>

              </TouchableOpacity> : <TouchableOpacity 
                className='py-5 w-2/5 bg-transparent border-4 border-violet-600 disabled:border-violet-400 disabled:bg-violet-400 items-center justify-center rounded-2xl shadow-xl'
                activeOpacity={0.7}
                disabled={step === 5}
                onPress={() => setStep(step + 1)}
              >

                <Text className='text-white text-lg'>Next</Text>

              </TouchableOpacity>}

            </View>


            <View className="absolute top-40 left-10 w-6 h-6 rounded-full bg-violet-400/60 animate-pulse" />
            <View className="absolute bottom-40 right-12 w-4 h-4 rounded-full bg-purple-400/60 animate-pulse" />
          

          </View>


        </ScrollView>


      </LinearGradient>
      

    </SafeAreaView>
  )
}


export default ResultAnalysis;
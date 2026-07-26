import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { showMessage } from "react-native-flash-message";
import axios from 'axios';
import { router } from 'expo-router';

import { userDetailsState, modelResponseState } from '../../zustand-store/store';
import InputFieldsOne from '../../components/form-components/InputFieldsOne';
import InputFieldsTwo from '../../components/form-components/InputsFieldsTwo';
import InputFieldsThree from '../../components/form-components/InputFieldsThree';
import MoodDropdown from '../../components/form-components/MoodDropdown';
import ExerciseDropdown from '../../components/form-components/ExerciseDropdown';
import HandwritingImageInput from '../../components/form-components/HandwritingImageInput';
import ConfirmInputs from '../../components/form-components/ConfirmInputs';
import LoadingScreen from '../../components/form-components/LoadingScreen';


const InputForm = () => {


  const [ step, setStep ] = useState(1);


  const [ allFormData, setAllFormData ] = useState({
    fullName: '',
    age: 0,
    noOfHoursSleep: 0,
    mood: '',
    exercise: '',
    handwritingImage: ''
  });


  const [ loading, setLoading ] = useState(false);


  const onSubmitForm = async () => {

    try {

      const age = Number(allFormData?.age); 

      const noOfHoursSleep = Number(allFormData?.noOfHoursSleep); 
  
      if (
        allFormData?.fullName.trim() === '' ||
        isNaN(age) ||
        isNaN(noOfHoursSleep) || 
        allFormData?.mood.trim() === '' ||
        allFormData?.exercise.trim() === '' ||
        allFormData?.handwritingImage.trim() === ''
      ) {

        showMessage({
          message: "One or more input fields are empty",
          type: 'danger',
          duration: 8000,
        });

      } else if (age < 3 || age > 100) {

        showMessage({
          message: "Age should be between 3 and 100 years",
          type: 'danger',
          duration: 8000,
        });

      } else if (noOfHoursSleep < 3 || noOfHoursSleep > 15) {

        showMessage({
          message: "Sleep hours should be between 3 and 15 hours",
          type: 'danger',
          duration: 8000,
        });

      } else {

        setLoading(true);

        const fileExtension = allFormData?.handwritingImage?.split('.')?.pop();
  
        let mimeType = '';
  
        if (fileExtension === 'jpg' || fileExtension === 'jpeg') {

          mimeType = 'image/jpeg';

        } else if (fileExtension === 'png') {

          mimeType = 'image/png';

        } else {

          Alert.alert('Unsupported file format!');

          return;

        }


        const formData = new FormData();

        formData.append('fullName', allFormData?.fullName);

        formData.append('age', age);

        formData.append('noOfHoursSleep', noOfHoursSleep);

        formData.append('mood', allFormData?.mood);

        formData.append('exercise', allFormData?.exercise);

        formData.append('imageInputByUser', {
          uri: allFormData?.handwritingImage,
          name: `image.${fileExtension}`,
          type: mimeType,
        });
  

        const { data } = await axios.post(process.env.EXPO_PUBLIC_FASTAPI_ENDPOINT, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
  
        if (data?.success) {

          userDetailsState.setState({
            userDetailsInGlobalState: {
              fullName: allFormData?.fullName,
              age: allFormData?.age,
              noOfHoursSleep: allFormData?.noOfHoursSleep,
              mood: allFormData?.mood,
              exercise: allFormData?.exercise,
              handwritingImage: allFormData?.handwritingImage
            }
          })
          
          modelResponseState.setState({
            responseFromGeminiModel: data?.analysis
          });

          router.replace('/(result)/result-analysis');
          
        }

      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };


  if (loading) {

    return <LoadingScreen />

  }
  
  

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


            {step === 1 ? (

              <InputFieldsOne allFormData={allFormData} setAllFormData={setAllFormData} />
            
            ) : step === 2 ? (

              <InputFieldsTwo allFormData={allFormData} setAllFormData={setAllFormData} /> 

            ) : step === 3 ? (

              <InputFieldsThree allFormData={allFormData} setAllFormData={setAllFormData} />

            ) : step === 4 ? (

              <MoodDropdown allFormData={allFormData} setAllFormData={setAllFormData} />

            ) : step === 5 ? (

              <ExerciseDropdown allFormData={allFormData} setAllFormData={setAllFormData} />

            ) : step === 6 ? (

              <HandwritingImageInput allFormData={allFormData} setAllFormData={setAllFormData} />

            ) : step === 7 ? (

              <ConfirmInputs allFormData={allFormData} />

            ) : null} 


            <View className='w-full items-center justify-between flex-row gap-5 my-8'>

              <TouchableOpacity 
                className='py-5 w-2/5 bg-violet-600 disabled:bg-violet-400 items-center justify-center rounded-2xl shadow-xl'
                disabled={step === 1}
                activeOpacity={0.7}
                onPress={() => setStep(step - 1)}
              >

                <Text className='text-white text-lg'>Previous</Text>

              </TouchableOpacity>

              {step === 7 ? <TouchableOpacity 
                className='py-5 w-2/5 bg-violet-600 disabled:bg-violet-400 items-center justify-center rounded-2xl shadow-xl'
                activeOpacity={0.7}
                onPress={onSubmitForm}
              >

                <Text className='text-white text-lg'>Submit</Text>

              </TouchableOpacity> : <TouchableOpacity 
                className='py-5 w-2/5 bg-violet-600 disabled:bg-violet-400 items-center justify-center rounded-2xl shadow-xl'
                activeOpacity={0.7}
                disabled={step === 7}
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
  );
};


export default InputForm;
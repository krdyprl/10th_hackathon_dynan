import { ScrollView, Text, View, Image } from 'react-native';
import ConfirmComponentView from './ConfirmComponentView';

const ConfirmInputs = ({ allFormData }) => {
  return (
    <ScrollView className="flex-1 w-full mt-12">

      <Text className="text-4xl font-extrabold text-violet-300 tracking-widest text-center mb-8 px-2">
        Confirm Inputs
      </Text>

      <View className="gap-10 px-2">

        <ConfirmComponentView 
          label="Full Name" 
          data={allFormData?.fullName}
        />

        <ConfirmComponentView 
          label="Age" 
          data={allFormData?.age}
        />

        <ConfirmComponentView 
          label="Numbers of Hours Slept Last Night" 
          data={allFormData?.noOfHoursSleep}
          labelSize='text-lg'
        />
        
        <ConfirmComponentView 
          label="Current Mood" 
          data={allFormData?.mood}
        />
        
        <ConfirmComponentView 
          label="Exercise Status" 
          data={allFormData?.exercise}
        />

        <View className="mt-2">
          
          <Text className="text-center text-2xl font-extrabold text-violet-300 tracking-wide mb-4">
            Handwriting Image
          </Text>

          <View className="w-full h-72 rounded-3xl overflow-hidden bg-violet-900/30 shadow-2xl border border-violet-500/20 backdrop-blur-sm">
            
            {allFormData?.handwritingImage ? (
              
              <Image 
                source={{ uri: allFormData?.handwritingImage }} 
                className="w-full h-full"
                resizeMode="cover"
              />

            ) : (
              
              <View className="w-full h-full items-center justify-center">
                
                <Text className="text-center text-lg text-violet-400/80">
                  No image uploaded 
                </Text>
              
              </View>
            )}

          </View>

        </View>

      </View>

    </ScrollView>
  );
};


export default ConfirmInputs;
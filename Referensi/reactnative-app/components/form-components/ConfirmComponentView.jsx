import { View, Text } from 'react-native';

const ConfirmComponentView = ({ label, data, labelSize='text-xl' }) => {
  return (
    <View className="border border-violet-500/20 rounded-3xl p-4 bg-violet-900 shadow-2xl">
      
      <Text className={`text-center ${labelSize} font-bold text-violet-300 tracking-wide mb-3`}>
        {label}
      </Text>

      <View className="bg-violet-950/50 rounded-2xl p-4 border border-violet-600/30">
        
        <Text
          className={`text-center ${
            data 
              ? 'text-lg font-semibold text-violet-200' 
              : 'text-base text-violet-400/70'
          }`}
        >
          {data || 'Not Provided'}

        </Text>

      </View>

    </View>
  );
};


export default ConfirmComponentView;
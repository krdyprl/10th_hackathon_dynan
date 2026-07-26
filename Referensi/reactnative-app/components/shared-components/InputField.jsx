import { View, Text, TextInput } from 'react-native';


const InputField = ({ label, placeholder, keyboardType, textSize='text-2xl', formData, setAllFormData }) => {
  return (
    <View className='w-full gap-6'>

      <Text className={`${textSize} font-lorabold font-bold tracking-wider text-violet-400 text-center`}>{label}</Text>

      <TextInput
        placeholder={placeholder}
        value={formData}
        className="w-full p-4 py-5 border-2 border-gray-300 rounded-xl bg-violet-300 text-black"
        onChangeText={setAllFormData}
        keyboardType={keyboardType}
      />

    </View>
  )
};


export default InputField;
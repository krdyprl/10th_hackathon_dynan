import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';


const Dropdown = ({ label, dropdownArray, textSize='text-2xl', formData, setAllFormData }) => {

  return (
    <View className="w-full gap-6">

      <Text className={`${textSize} font-lorabold font-bold tracking-wider text-violet-400 text-center`}>
        {label}
      </Text>

      <View className="w-full border-2 border-violet-300 rounded-xl bg-violet-300 text-black">

        <Picker
          selectedValue={formData}
          onValueChange={setAllFormData}
        >

          {dropdownArray.map((mood) => (

            <Picker.Item key={mood.id} label={mood.label} value={mood.value} />

          ))}

        </Picker>

      </View>

    </View>
  );
};

export default Dropdown;

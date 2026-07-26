import { View } from 'react-native';
import InputField from '../shared-components/InputField';


const InputFieldsThree = ({ setAllFormData, allFormData }) => {

  return (

    <View className="w-full">

      <InputField
        label="How many hours did you sleep last night ?"
        placeholder="enter the number of hours"
        keyboardType="numeric"
        textSize='text-lg'
        formData={allFormData?.noOfHoursSleep}
        setAllFormData={(text) => setAllFormData({ ...allFormData, noOfHoursSleep: text })}
      />

    </View>

  );

};


export default InputFieldsThree;

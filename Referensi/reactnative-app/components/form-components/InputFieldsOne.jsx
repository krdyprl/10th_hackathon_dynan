import { View } from 'react-native';
import InputField from '../shared-components/InputField';


const InputFieldsOne = ({ setAllFormData, allFormData }) => {
  
  return (

    <View className='w-full'>

      <InputField 
        label="What's your Fullname" 
        placeholder="enter your fullname" 
        keyboardType="default"
        formData={allFormData?.fullName}
        setAllFormData={(text) => setAllFormData({ ...allFormData, fullName: text })}
      />

    </View>

  )

}


export default InputFieldsOne;
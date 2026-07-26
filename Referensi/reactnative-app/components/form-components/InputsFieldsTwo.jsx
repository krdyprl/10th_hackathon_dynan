import { View } from 'react-native';
import InputField from '../shared-components/InputField';


const InputFieldsTwo = ({ setAllFormData, allFormData }) => {

  return (

    <View className='w-full'>

      <InputField 
        label="What's your age ?" 
        placeholder="enter your age" 
        keyboardType="numeric"
        formData={allFormData?.age}
        setAllFormData={(text) => setAllFormData({ ...allFormData, age: text })}
      />

    </View>
    
  )

}


export default InputFieldsTwo;
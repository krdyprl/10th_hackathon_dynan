import { View, Text, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

import UploadIconImg from '../../assets/images/upload-image-pic.png';


const HandwritingImageInput = ({ setAllFormData, allFormData }) => {


  const [ imageInput, setImageInput ] = useState(allFormData?.handwritingImage || null);


  const openImagePicker = async () => {

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    const uriOfTheUploadedImage = result.assets[0].uri;

    if(!result.canceled) {

      setImageInput(uriOfTheUploadedImage);

      setAllFormData({ ...allFormData, handwritingImage: uriOfTheUploadedImage })

    }

  }


  return (
    <View className='w-full gap-6'>

      <Text className={`text-xl font-lorabold font-bold tracking-wider text-violet-400 text-center`}>
        Write something down, take a photo, and start your wellness journey
      </Text>

      {imageInput ? <View className="w-full h-96 rounded-2xl overflow-hidden shadow-2xl">
        
        <Image 
          source={{ uri: imageInput }} 
          className="w-full h-full"
          resizeMode="cover"
        />

      </View> : <TouchableOpacity 
        className='bg-transparent w-full h-96 gap-3 items-center justify-center border-4 border-dotted rounded-2xl border-violet-100'
        activeOpacity={0.7}
        onPress={openImagePicker}
      >

        <Image 
          source={UploadIconImg}
          className="w-[80px] h-[80px]"
          resizeMode="contain"
        />

          <Text className='text-white text-lg text-center'>Only JPG, JPEG and PNG is accepted</Text>

      </TouchableOpacity>}

    </View>
  )
};


export default HandwritingImageInput;
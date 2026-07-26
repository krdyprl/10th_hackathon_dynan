import { View } from 'react-native';
import Markdown from 'react-native-markdown-display';

import InsightsTextToSpeech from './InsightsTextToSpeech';


const HandWritingInsights = ({ data }) => {
  return (
    <>
      <View className="w-full mt-20 px-6 py-8 bg-violet-800/50 rounded-2xl shadow-lg border border-violet-600">
        
        <Markdown
          style={{
            body: {
              color: 'white',
              fontSize: 18,
              lineHeight: 28,
              fontFamily: 'Lora-Medium',
            },
            heading1: {
              color: '#A78BFA',
              fontSize: 25,
              fontFamily: 'Lora-Bold',
              lineHeight: 36,
              marginTop: 10, 
              marginBottom: 10, 
            },
            bullet_list: {
              color: 'white',
              marginLeft: 25,
            },
            bullet: {
              color: '#C4B5FD',
              fontSize: 18,
            },
          }}
        >
        
          {data}

        </Markdown>


      </View>
      
      <InsightsTextToSpeech data={data} />
    
    </>

  );

};


export default HandWritingInsights;

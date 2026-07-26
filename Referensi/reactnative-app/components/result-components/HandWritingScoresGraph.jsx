import { View, Text } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';


const HandWritingScoresGraph = ({ data }) => {


  const parsedData = JSON.parse(data.replace(/```json|```/g, '').trim());

  const screenWidth = Dimensions.get('window').width;


  const chartConfig = {
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    color: (opacity = 1) => `rgba(147, 51, 234, ${opacity})`, // Violet color matching theme
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // White labels
    strokeWidth: 2, 
    barPercentage: 0.7,
    fillShadowGradient: "#9333ea", // Violet gradient
    fillShadowGradientOpacity: 0.5,
    decimalPlaces: 1
  };


  const graphData = {
    labels: parsedData?.labels,
    datasets: parsedData?.datasets
  }
  
  
  return (
    <View className='w-full mt-20 gap-3 items-center'>


      <Text className='text-violet-300 text-2xl font-bold tracking-wider font-lorabold mb-4'>HandWriting Score Analysis</Text>

      <BarChart
        style={{ 
          borderRadius: 16
        }}
        data={graphData}
        width={screenWidth - 20} 
        height={450}
        yAxisLabel="" 
        chartConfig={chartConfig}
        verticalLabelRotation={30}
        fromZero={true}
      />

      <Text className='text-white text-center px-5 mt-4 text-xl font-loramedium'>{parsedData?.description}</Text>

    </View>
  )
}


export default HandWritingScoresGraph;
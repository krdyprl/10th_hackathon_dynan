import { View, Alert, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { marked } from 'marked';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

import ShareIconImg from '../../assets/images/share-pdf-icon.png';
import { modelResponseState, userDetailsState } from '../../zustand-store/store';


const ShareAnalysisPDF = () => {


  const { userDetailsInGlobalState } = userDetailsState((state) => state);
  
  const { responseFromGeminiModel } = modelResponseState((state) => state);
  

  const data = JSON.parse(responseFromGeminiModel.replace(/```json|```/g, '').trim());

  
  const handWritingScoreGraphData = JSON.parse(data?.handwritingScores.replace(/```json|```/g, '').trim());
  
  const handWritingScoreGraphDatalabels = handWritingScoreGraphData?.labels;
  const handWritingScoreGraphActualData = handWritingScoreGraphData?.datasets[0]?.data;
  

  const futureMoodPredicitonGraphData = JSON.parse(data?.futureMoodPrediction.replace(/```json|```/g, '').trim());
  
  const futureMoodPredicitonGraphDataLabels = futureMoodPredicitonGraphData?.labels;
  const futureMoodPredictionGraphActualData = futureMoodPredicitonGraphData?.datasets[0]?.data;


  const shareMarkdownsAsPDF = async () => {

    try {

      let combinedHTMLContent = `
        <html>
          <head>
            <style>
              body {
                font-family: sans-serif;
                line-height: 1.8;
                margin: 24px;
                background-color: #0f0720;
                color: #e9d5ff; 
              }
              hr {
                margin: 24px 0;
                border: 0;
                border-top: 1px solid #6d28d9; 
              }
              .image-container img {
                max-width: 100%;
                height: auto;
                border: 2px solid #8b5cf6; 
                border-radius: 16px;
                padding: 8px;
                background-color: rgba(139, 92, 246, 0.1); 
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                background-color: rgba(139, 92, 246, 0.1); 
                border-radius: 12px;
                overflow: hidden;
              }
              th, td {
                border: 1px solid #6d28d9; 
                padding: 16px;
                text-align: center;
              }
              th {
                background-color: #4c1d95; 
                color: #e9d5ff; 
                font-weight: 600;
              }
              .graph-title {
                font-size: 1.75em;
                margin: 28px 0 16px 0;
                color: #c4b5fd; 
                font-weight: bold;
                letter-spacing: 0.05em;
              }
            </style>
          </head>
        <body>
      `;


      combinedHTMLContent += `
        <h1>User Details</h1>
        <h3>User Fullname: ${userDetailsInGlobalState?.fullName}</h3>
        <h3>${userDetailsInGlobalState?.fullName}'s Age: ${userDetailsInGlobalState?.age}</h3>
        <h3>Number of hours ${userDetailsInGlobalState?.fullName} slept last night: ${userDetailsInGlobalState?.noOfHoursSleep}</h3>
        <h3>${userDetailsInGlobalState?.fullName}'s current Mood: ${userDetailsInGlobalState?.mood}</h3>
        <h3>Did ${userDetailsInGlobalState?.fullName} exercise for last 3 days? : ${userDetailsInGlobalState?.exercise === "I've been exercising continuously for the past 3 days." ? "Yes" : "No"}</h3>
        <h3>${userDetailsInGlobalState?.fullName}'s Handwriting:</h3>
      `;


      if (userDetailsInGlobalState?.handwritingImage) {

        const base64Image = await FileSystem.readAsStringAsync(userDetailsInGlobalState.handwritingImage, {
          
          encoding: FileSystem.EncodingType.Base64,
        
        });


        combinedHTMLContent += `
          <div class="image-container">
            <img src="data:image/jpeg;base64,${base64Image}" alt="Handwriting Image" />
          </div>
        `;


      } else {

        combinedHTMLContent += `<p>No handwriting image provided.</p>`;

      }


      combinedHTMLContent += marked(data?.handwritingInsights || "") + "<hr>";

      combinedHTMLContent += `
        <h2 class="graph-title">Handwriting Score Analysis</h2>
        <table>
          <tr>
            <th>Metrics</th>
            ${handWritingScoreGraphDatalabels?.map(label => `<th>${label}</th>`).join('')}
          </tr>
          <tr>
            <td>Score</td>
            ${handWritingScoreGraphActualData?.map(value => `<td>${value}</td>`).join('')}
          </tr>
        </table>
        <hr>
      `;

      combinedHTMLContent += marked(data?.moodStressCorrelation || "") + "<hr>";

      combinedHTMLContent += marked(data?.personalizedRecommendations || "") + "<hr>";

      combinedHTMLContent += `
        <h2 class="graph-title">Future Mood Prediction Analysis</h2>
        <table>
          <tr>
            <th>Time Period</th>
            ${futureMoodPredicitonGraphDataLabels?.map(label => `<th>${label}</th>`).join('')}
          </tr>
          <tr>
            <td>Predicted Mood Score</td>
            ${futureMoodPredictionGraphActualData?.map(value => `<td>${value}</td>`).join('')}
          </tr>
        </table>
        <hr>
      `;

      combinedHTMLContent += marked(data?.summary || "") + "<hr>";
      combinedHTMLContent += marked(data?.conclusion || "");

      combinedHTMLContent += "</body></html>";


      const { uri } = await Print.printToFileAsync({

        html: combinedHTMLContent,

      });


      if (await Sharing.isAvailableAsync()) {

        await Sharing.shareAsync(uri);

      } else {

        Alert.alert("Sharing not available", "Unable to share the file.");

      }

    } catch (error) {

      Alert.alert("Error", "Failed to generate and share the PDF");

      console.error("Error generating PDF:", error);

    }

  };


  return (
    <SafeAreaView className="h-full">

      <LinearGradient
        colors={['#0f0720', '#1a103f', '#2c1469']}
        className="h-full w-full"
      >

        <ScrollView contentContainerStyle={{ height: '100%' }}>
          
          <View className="w-full h-full items-center justify-center px-8">
            
            <View className="absolute top-20 right-[-100] w-[300px] h-[300px] rounded-full bg-violet-600/20 blur-3xl" />
            <View className="absolute bottom-[-50] left-[-100] w-[250px] h-[250px] rounded-full bg-purple-500/20 blur-3xl" />

            <Text className="font-lorabold font-bold tracking-wider text-violet-300 text-center text-4xl mb-2">
              Share Whole Analysis
            </Text>

            <Text className="font-lorarmedium text-violet-200 text-center text-xl mt-6 mb-8 px-4">
              Spread insights with friends and family. Your personal growth journey matters.
            </Text>

            <TouchableOpacity
              className="mt-3 bg-violet-600 px-16 w-full p-5 rounded-xl flex-row items-center justify-center gap-4 shadow-lg"
              onPress={shareMarkdownsAsPDF}
            >

              <Image
                source={ShareIconImg}
                resizeMode="contain"
                className="w-12 h-12"
              />

              <Text className="font-lorabold text-white text-lg font-bold">
                Share Analysis
              </Text>

            </TouchableOpacity>


            <TouchableOpacity
              className="mt-8 bg-transparent border border-violet-500 px-16 w-full p-5 rounded-xl items-center justify-center"
              onPress={() => router.push('/')}
            >

              <Text className="font-lorabold text-violet-300 text-lg font-bold">
                Return Home
              </Text>

            </TouchableOpacity>


            <View className="absolute top-40 left-10 w-6 h-6 rounded-full bg-violet-400/60 animate-pulse" />
            <View className="absolute bottom-40 right-12 w-4 h-4 rounded-full bg-purple-400/60 animate-pulse" />
          
          </View>

        </ScrollView>

      </LinearGradient>

    </SafeAreaView>
  );
};


export default ShareAnalysisPDF;
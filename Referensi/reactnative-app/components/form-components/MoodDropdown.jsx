import Dropdown from '../shared-components/Dropdown';


const MoodDropdown = ({ setAllFormData, allFormData }) => {


  const moodsArray = [
    {
        id: 1,
        label: 'Select your Mood',
        value: ''
    },
    {
        id: 2,
        label: '😭 Very Stressed',
        value: 'Experiencing intense pressure, heightened anxiety, or emotional distress.'
    },
    {
        id: 3,
        label: '😔 Stressed',
        value: 'Feeling overwhelmed, anxious, or low.'
    },
    {
        id: 4,
        label: '😐 Neutral',
        value: 'Neither stressed nor relaxed, feeling okay.'
    },
    {
        id: 5,
        label: '🙂 Relaxed',
        value: 'Feeling calm, at ease, and positive.'
    },
    {
        id: 6,
        label: '😄 Very Relaxed',
        value: 'Feeling happy, peaceful, and in a great mood.'
    },
  ];


  return (

    <Dropdown 
      label="How's your mood right now ?" 
      dropdownArray={moodsArray} 
      formData={allFormData?.mood}
      setAllFormData={(itemValue) => setAllFormData({...allFormData, mood: itemValue })}
    />

  );

};


export default MoodDropdown;

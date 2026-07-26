import Dropdown from '../shared-components/Dropdown';


const ExerciseDropdown = ({ setAllFormData, allFormData }) => {


  const exerciseArray = [
    {
        id: 1,
        label: 'Select the right option',
        value: ''
    },
    {
        id: 2,
        label: 'Yes',
        value: "I've been exercising continuously for the past 3 days."
    },
    {
        id: 3,
        label: 'No',
        value: "I haven't exercised in the past 3 days."
    },
  ];


  return (

    <Dropdown 
        label="Did you exercise in the past 3 days ?" 
        textSize='text-lg'
        dropdownArray={exerciseArray} 
        formData={allFormData?.exercise}
        setAllFormData={(itemValue) => setAllFormData({...allFormData, exercise: itemValue })}
    />

  );

};


export default ExerciseDropdown;

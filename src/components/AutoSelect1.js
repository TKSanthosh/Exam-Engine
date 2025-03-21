import { useEffect, useState } from "react";
import axios from "axios";
const AutoSelect = ({
  currentQuestion,
  onAutoSelect,
  onLoginSuccess,
  isLogin,
  setUsername,
  setPassword,
  getLoginStatus
}) => {
  const [hasAnswered, setHasAnswered] = useState(false); // Track if the answer has already been selected
  const [count,setCount]=useState(0);
  // Reset `hasAnswered` when the currentQuestion changes
  useEffect(() => {
    setHasAnswered(false);
  }, [currentQuestion]);

  // Handle auto-login functionality if `isLogin` is true
  useEffect(() => {
    if (isLogin) {
      const autoLogin = async () => {
        // const autoUsername = "admin";
        // const autoPassword = "password123";
        console.log("hello");
        const response = await axios.get("http://localhost:5000/getCandidateCredentials")
        if(response.statusText = "ok" && response.data.message == "ok" && count == 0){
          const autoUsername = response.data.membershipNo;
        const autoPassword = response.data.decodedPass;
        console.log("Attempting auto-login...");

        // Simulated filling out username and password
        setUsername(autoUsername);
        setPassword(autoPassword);
        getLoginStatus(true)
        setCount(1);
        }
        else{
          console.log("No candidate present")
          getLoginStatus(false)
        }
        

        // Simulate form submission
        setTimeout(() => {
          // Now trigger the login logic
          console.log("Username and password set, attempting to login...");
          onLoginSuccess(); // Trigger the callback on successful login
        }, 2000); // Delay the "submit" action to mimic a real-world login experience
      };

      autoLogin(); // Trigger auto-login
    }
  }, [isLogin, onLoginSuccess, setUsername, setPassword]);

  // Handle question auto-selection
  useEffect(() => {
    if (currentQuestion && !hasAnswered) {
      let chosenAnswer;
      const filteredOptions = (currentQuestion.options).filter(option => option.text != null && option.text.trim() !== "");
      // console.log(filteredOptions);
      const randomIndex = Math.floor(
        Math.random() * filteredOptions.length
      );
      // console.log("random",randomIndex);
      // const chosenAnswer = currentQuestion.options[randomIndex]; // Randomly select an answer
      chosenAnswer = randomIndex+1
      if(currentQuestion.question_type == "DQ"){
        chosenAnswer = "Hi, Descriptive"
      }
        // const chosenAnswer = currentQuestion.answer;
        // console.log("Selected answer: ", chosenAnswer); // Debugging log

      // Simulate a delay before auto-selecting the answer
      setTimeout(() => {
        onAutoSelect(chosenAnswer,currentQuestion); // Pass the selected answer to the parent
        setHasAnswered(true); // Mark the question as answered
      }, 2000); // Adjust the delay (e.g., 2 seconds here)
    }
  }, [currentQuestion, onAutoSelect]);

  return null; // This component does not render anything visually
};

export default AutoSelect;

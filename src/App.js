import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Form from './components/Form';
import SubjectForm from './components/SubjectForm'; // Your SubjectForm component
import ExamForm from './components/ExamForm'; // Your ExamForm component
import Instruction from './components/Instruction'; // Your Instruction component
import ReportTable from './components/ReportTable'; // Your QpForm component
import Home from './components/Home'; // Your Home component
import ReactComp from './components/React'; // Your SubjectForm component
import Client from './components/Client'; // Your SubjectForm component
import UploadFile from './components/UploadFile'; // Your UploadFile component
import SampleQp from './components/SampleQp'; // Your SampleQp component
import SciCalculatorAndRoughSheet from './components/SciCalculatorAndRoughSheet'; // Your Calculator component
import CalculatorAndRoughSheet from './components/CalculatorAndRoughSheet'; // Your Calculator component
// import WifiSelector from './components/WifiSelector'; // Your WifiSelector component
import InternetSpeedChecker from './components/InternetSpeedChecker'; // Your RoughSheet component

import NotFound from './components/NotFound'; 
import CandidateFeedback from './components/CandidateFeedback'; // Your ExamForm component

function App() {
  return (
    // <Router basename='build'>
    <Router>
      <div>
        <Routes>
          <Route path="/subject" element={<SubjectForm/>} />
          <Route path="/exam" element={<ExamForm/>} />
          <Route path="/sampleqp" element={<SampleQp/>} />
          <Route path="/instruction" element={<Instruction/>} />
          <Route path="/registration" element={<Form/>} />
          <Route path="/sci" element={<SciCalculatorAndRoughSheet/>} />
          <Route path="/calculator" element={<CalculatorAndRoughSheet/>} /> 
          {/* <Route path="/wifi" element={<WifiSelector/>} /> */}
          <Route path="/" element={<Home/>} />
          <Route path="/bat" element={<ReportTable/>} />
          <Route path="/react" element={<ReactComp/>} />
          <Route path="/admin" element={<Client/>} />
          <Route path="/upload" element={<UploadFile/>} />
          <Route path="/activate" element={<InternetSpeedChecker/>} />
          <Route path="*" element={<NotFound />} />  {/* Catch-all route */}
          <Route path="/feedback" element={<CandidateFeedback/>} />
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;

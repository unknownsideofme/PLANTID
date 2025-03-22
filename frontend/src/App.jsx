import { useState } from 'react'
import './App.css'
import Loading from './Loading';

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import AnotherPage from "./anotherPage/src/App";
import AnotherPage1 from "./anotherPage1/src/App";
import AnotherPage2 from "./anotherPage2/src/App";



function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Loading />} />
          <Route path="/EarlyDiseaseDetection" element={<AnotherPage />} />
          <Route path="/AIpoweredPlantDiseaseDetection" element={<AnotherPage1 />} />

          <Route path="/LearnMore" element={<AnotherPage2 />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;


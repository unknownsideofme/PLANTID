import { useState } from 'react'
import './App.css'
import Loading from './loading';

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import AnotherPage from "./anotherPage/src/App";
import AnotherPage1 from "./anotherPage1/src/App";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Loading />} />
          <Route path="/another" element={<AnotherPage />} />
          <Route path="/anotherpage1" element={<AnotherPage1 />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;


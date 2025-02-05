import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import VerifyOTP from './components/VerifyOTP';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
      </Routes>
    </Router>
  );
};

export default App;

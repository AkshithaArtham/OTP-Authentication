import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { name, email, password } = location.state || {};

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verify OTP
      await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });

      // Register user
      await axios.post('http://localhost:5000/api/auth/register', { name, email, password });

      alert('Registration successful!');
      navigate('/');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Verify OTP</h2>
      <form onSubmit={handleVerifyOtp}>
        <div>
          <label>Enter OTP:</label>
          <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
    </div>
  );
};

export default VerifyOTP;

import React, { useState } from 'react';
import '../../style/SignUp.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (event) => {
    event.preventDefault();
    // Handle the signup logic here
    try{
      const response = await axios.post('http://localhost:3001/api/register', { 
        username, 
        email, 
        password 
      });

      if (response.status === 200 || response.status === 201) {
        console.log('Signup successful');
        navigate('/login');
      } else {
        console.error('Signup failed');
        // Handle errors (e.g., display a message to the user)
      }
    }catch(error){
      console.error('There was a problem with the signup request:', error);
      // Handle errors (e.g., display a message to the user)
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSignup}>
        <h2>SIGN UP</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">SIGN UP</button>
        <div className="social-login">
          <span>OR</span>
        </div>
        <div className="login-link">
          Already a user? <a href="/login">LOGIN</a>
        </div>
      </form>
    </div>
  );
}

export default Signup;

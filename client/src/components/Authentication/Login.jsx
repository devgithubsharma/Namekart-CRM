import React, { useState,useContext  } from 'react';
import '../../style/Login.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import { useAuth } from '../ContextApi/AuthContext';
import { GlobalContext } from '../ContextApi/GlobalContext';
import { saveToken } from '../IndexedDB/IdbFunctions';

import { logins } from '../../api';


function Login() {
  const navigate = useNavigate();
  const [login, setLogins] = useState(''); 
  const [password, setPassword] = useState('');
  const { loginAuth } = useContext(GlobalContext);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
        // const response = await axios.post('http://localhost:3001/api/login', { 
        //   login, 
        //   password,
        // });
        const response = await logins(login,password);
        
        if (response.status === 200) {
          console.log('Login successful');
          if (response.data.token) {
            await saveToken(response.data.token);
          }
          
          console.log("Before loginAuth")
          loginAuth(login);
          console.log("After loginAuth")
          navigate('/home/manualCampaigns');

        } else {
          console.error('Login failed');
        
        }
      } catch (error) {
        console.error('There was a problem with the login request:', error);
        
      }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>LOGIN</h2>
        <input
          type="text"
          placeholder="Enter email"
          name='login'
          onChange={(e) => setLogins(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          name='password'
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">LOGIN</button>
        <a href="/forgot-password" className="forgot-password">Forgot Password?</a>
        <div className="separator">OR</div>
        <div className="signup-link">
          Need an account? <button onClick={() => navigate('/')}>SIGN UP</button>
        </div>
      </form>
    </div>
  );
}

export default Login;

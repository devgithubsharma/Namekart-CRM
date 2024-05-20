import React, { useState,useContext  } from 'react';
import '../../style/Login.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import { useAuth } from '../ContextApi/AuthContext';
import { GlobalContext } from '../ContextApi/GlobalContext';
import { saveToken } from '../IndexedDB/IdbFunctions';

function Login() {
  const navigate = useNavigate();
  const [login, setLogin] = useState(''); 
  const [password, setPassword] = useState('');
  const { loginAuth } = useContext(GlobalContext);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
        const response = await axios.post('http://localhost:3001/api/login', { 
          login, 
          password,
        });
        
        if (response.status === 200) {
          console.log('Login successful');
          if (response.data.token) {
            await saveToken(response.data.token);
          }
          // You might want to handle rememberMe functionality here
          loginAuth();
          navigate('/contacts');

        } else {
          console.error('Login failed');
        
        }
      } catch (error) {
        console.error('There was a problem with the login request:', error);
        // Handle errors (e.g., display a message to the user)
      }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>LOGIN</h2>
        <input
          type="text"
          placeholder="email/username"
          name='login'
          onChange={(e) => setLogin(e.target.value)}
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
          Need an account? <a href="/">SIGN UP</a>
        </div>
      </form>
    </div>
  );
}

export default Login;

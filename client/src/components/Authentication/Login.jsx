import React, { useState, useContext } from 'react';
import '../../style/Login.css';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../ContextApi/GlobalContext';
import { saveToken } from '../IndexedDB/IdbFunctions';
import { logins } from '../../api';
import logo from '../../images/namekart.png';

function Login() {
  const navigate = useNavigate();
  const [login, setLogins] = useState('');
  const [password, setPassword] = useState('');
  const { loginAuth } = useContext(GlobalContext);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await logins(login, password);
      if (response.status === 200) {
        console.log('Login successful');
        if (response.data.token) {
          await saveToken(response.data.token);
        }
        loginAuth(login);
        navigate('/home/manualCampaigns');
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('There was a problem with the login request:', error);
    }
  };

  return (
    <div className="container">
      <div className="left-side">
        <div className="header">
          <img src={logo} alt="Namekart CRM Logo" className="logo" />
          <h1>Namekart CRM</h1>
        </div>
        <div className="intro">
          <p>
            Namekart CRM is a comprehensive tool designed for mass email campaigning.
            Our platform helps businesses efficiently manage and execute bulk email campaigns,
            track their effectiveness, and enhance customer engagement through automated mailing processes.
          </p>
          <p>
            With Namekart CRM, you can easily:
          </p>
          <ul>
            <li>Manage multiple sender email accounts</li>
            <li>Create and track various email campaigns</li>
            <li>Automate email sending and follow-ups</li>
            <li>Analyze campaign performance and optimize strategies</li>
          </ul>
          <p>
            For more information, please visit our <a href="/crm/privacyPolicy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
          </p>
        </div>
      </div>

      <div className="right-side">
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
            <a href="#" className="forgot-password">Forgot Password?</a>
            <div className="separator">OR</div>
            <div className="signup-link">
              Need an account? <button onClick={() => navigate('/')}>SIGN UP</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;

import React, { useState } from 'react';
import '../../style/SignUp.css';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../../api';
import logo from '../../images/namekart.png';

function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (event) => {
    event.preventDefault();
    
    try {
      const response = await signUp(username, email, password);
      if (response.status === 200 || response.status === 201) {
        console.log('Signup successful');
        navigate('/login');
      } else {
        console.error('Signup failed');
      }
    } catch (error) {
      console.error('There was a problem with the signup request:', error);
      if (error.response) {
        if (error.response.status === 409 || error.response.data.message === 'User already exists') {
          alert('User already registered. Please login.');
        } else {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log('Error', error.message);
      }
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
            For more information, please visit our <a href="/crm/home/privacyPolicy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
          </p>
        </div>
      </div>

      <div className="right-side">
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
              Already a user? <button onClick={() => navigate('/login')}>LOGIN</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;

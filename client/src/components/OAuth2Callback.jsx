import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OAuth2Callback = () => {
  const navigate = useNavigate();

  const clientId = "779579592103-36umoki6urjdtqhicvho4mh1qrvvmi8t.apps.googleusercontent.com"
  const clientSecret = "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"
  const redirectUri = "http://localhost:3000/oauth2callback" //https://developers.google.com/oauthplayground

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationCode = urlParams.get('code');
    console.log("authorizationCode",authorizationCode)
    if (authorizationCode) {
      const fetchTokens = async () => {
        try {
          const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', null, {
            params: {
              code: authorizationCode,
              client_id: clientId ,
              client_secret: clientSecret, // Replace with your actual client secret
              redirect_uri: redirectUri,
              grant_type: 'authorization_code',
            },
            timeout: 120000,
          });

          const { access_token, refresh_token } = tokenResponse.data;
          console.log('Access Token:', access_token);
          console.log('Refresh Token:', refresh_token);

          // Store tokens securely
          // For demonstration purposes, we'll just log them
          console.log('Access Token:', access_token);
          console.log('Refresh Token:', refresh_token);

          // Redirect to the SendersEmails component or any other component
          navigate('/home/userEmails', { state: { refreshToken: refresh_token,accessToken: access_token } })
        } catch (error) {
          console.error('Error exchanging authorization code for tokens:', error);
        }
      };
      fetchTokens();
    }
  }, []);

  return <div>Processing authentication...</div>;
};

export default OAuth2Callback;
import React, { useEffect, useState,useContext } from 'react';
import { TextField, Button, Table, TableBody, TableContainer, TableCell, TableHead, TableRow, IconButton, Typography, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { GlobalContext } from '../ContextApi/GlobalContext';
import {saveSenderEmails} from '../../api'
import {deleteEmail} from '../../api'
import {fetchSenderEmailsDetails} from '../../api'
import {fetchTag} from '../../api'
import { useLocation } from 'react-router-dom';


function SendersEmails() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('')
  const [emails, setEmails] = useState([]);
  const [accessTokenInput, setAccessTokenInput] = useState('');
  const [refreshTokenInput, setRefreshTokenInput] = useState(''); 
  const [tokens, setTokens] = useState({});
  const location = useLocation();
  

  const [isHovered1, setIsHovered1] = useState(false); 
  const [isHovered2, setIsHovered2] = useState(false); 
  const { userId } = useContext(GlobalContext);


  const clientId = "779579592103-36umoki6urjdtqhicvho4mh1qrvvmi8t.apps.googleusercontent.com"
  const redirectUri = "http://localhost:3000/oauth2callback"
  const scope = 'https://mail.google.com/'

  useEffect(() => {
    if (location.state) {
      if (location.state.accessToken) {
        setAccessTokenInput(location.state.accessToken);
        console.log('Received Access Token:', location.state.accessToken);
      }
      if (location.state.refreshToken) {
        setRefreshTokenInput(location.state.refreshToken);
        console.log('Received Refresh Token:', location.state.refreshToken);
      }
    }
  }, [location.state]);


  const handleGoogleAuth = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline&prompt=consent`;
    window.location.href = authUrl;
  };

  const handleMouseEnter1 = () => {
    setIsHovered1(true);
  };

  const handleMouseLeave1 = () => {
    setIsHovered1(false);
  };

  const handleMouseEnter2 = () => {
    setIsHovered2(true);
  };

  const handleMouseLeave2 = () => {
    setIsHovered2(false);
  };

  

  console.log("userId",userId)
  const handleAddDetails = async () => {
    if (email && name && accessTokenInput && refreshTokenInput && !emails.find(e => e.email === email)) {
      try {
        // const response = await axios.post('https://crmapi.namekart.com/api/addEmails', {
        //   email: email, 
        //   name: name,
        //   accessToken: accessTokenInput, 
        //   refreshToken: refreshTokenInput, 
        //   userId:userId
        // });
        const response = await saveSenderEmails(email,name,accessTokenInput,refreshTokenInput,userId)
        
        const newEmail = {
          id: response.data.sender_id,
          email: email,
          name: name,
          accessToken: accessTokenInput,
          refreshToken: refreshTokenInput, 
          
        };
        
        setEmails([...emails, newEmail]);
        setTokens({
          ...tokens,
          [newEmail.id]: {
            accessToken: accessTokenInput,
            refreshToken: refreshTokenInput
          }
        });
        setEmail(''); 
        setName('');
        setAccessTokenInput(''); 
        setRefreshTokenInput('');

      } catch (error) {
        console.error('Failed to save email and access token:', error);
      }
    } else {
      alert("Duplicate email or empty field!");
    }
  };


  const handleGetTokens = async () => {
    console.log("get tokens")
    const response = await axios.get('http://localhost:3001/auth/google')
    console.log("response",response)
  }
  


  const handleDeleteEmail = (emailToDelete) => {
    deleteEmail(emailToDelete)
    .then(response => {
        const updatedEmails = emails.filter(e => e.id !== emailToDelete);
        setEmails(updatedEmails);

        // Update the tokens state as well
        const updatedTokens = { ...tokens };
        delete updatedTokens[emailToDelete];
        setTokens(updatedTokens);

        console.log('Email deleted successfully:', response.data);
    })
    .catch(error => {
        console.error('Failed to delete email:', error);
    });
  };


  // const handleTokenChange = (emailId, token) => {
  //   setTokens({ ...tokens, [emailId]: token });
  // };


  useEffect(()=>{
    console.log(emails)
  },[emails])

  useEffect(() =>{
    console.log(tokens)
  },[tokens])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const { data } = await axios.get(`https://crmapi.namekart.com/api/getSenderEmailsDetails/${userId}`);
        const response = await fetchSenderEmailsDetails(userId)
        console.log("data",response)
        const validEmails = response.data.result.filter(email => email.sender_email_id && email.sender_id);
        console.log(validEmails)
        setEmails(validEmails.map(response => ({
          id: response.sender_id, 
          email: response.sender_email_id,
          name: response.sender_name || '',
          accessToken: response.accessToken || '' ,
          refreshToken: response.refreshToken || '' 
        })));
  
        // Initialize tokens state
        const initialTokens = validEmails.reduce((acc, email) => {
          acc[email.sender_id] = email.refreshToken || '';
          return acc;
        }, {});
        
        setTokens(initialTokens);
      } catch (error) {
        console.error('Error in fetching sender emails:', error);
      }
    };
    fetchData();
  }, []);
  
// useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const authorizationCode = urlParams.get('code');
//     console.log("authorizationCode",authorizationCode)
//     if (authorizationCode) {
//       const fetchTokens = async () => {
//         console.log("Inside fetchTokens")
//         try {
//           const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', null, {
//             params: {
//               code: authorizationCode,
//               client_id: clientId,
//               client_secret: client_secret, // Replace with your actual client secret
//               redirect_uri: redirectUri,
//               grant_type: 'authorization_code',
//             },
//             timeout: 120000,
//           });

//           const { access_token, refresh_token } = tokenResponse.data;
//           setAccessTokenInput(access_token);
//           setRefreshTokenInput(refresh_token);
//           console.log('Access Token:', access_token);
//           console.log('Refresh Token:', refresh_token);
//         } catch (error) {
//           console.error('Error exchanging authorization code for tokens:', error);
//         }
//       };
//       fetchTokens();
//     }
//   }, []);


  return (
    <div style={{ margin: '20px' }}>
      <Typography variant="h4" component="h1" style={{ marginBottom: '20px' }}>
          Sender Emails Management
      </Typography>

      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
          <TextField
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginRight: '10px', flex: 1 , maxWidth:'250px'}}
          />

          <TextField // Step 2: Add TextField for Name
            label="Name"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginRight: '10px', flex: 1, maxWidth:'250px'}}
          />

          <TextField
          label="Access Token"
          variant="outlined"
          value={accessTokenInput}
          onChange={(e) => setAccessTokenInput(e.target.value)}
          style={{ marginRight: '10px', flex: 1, maxWidth:'250px' }}
        />

        <TextField // New TextField for Refresh Token
          label="Refresh Token"
          variant="outlined"
          value={refreshTokenInput}
          onChange={(e) => setRefreshTokenInput(e.target.value)}
          style={{ marginRight: '10px', flex: 1, maxWidth: '200px' }}
        />

          <Button variant="contained" color="primary" onClick={handleAddDetails} onMouseEnter={handleMouseEnter1}
        onMouseLeave={handleMouseLeave1} style={{ height: '40px' ,maxWidth:'150px',borderRadius:'15px', backgroundColor: isHovered1 ? 'grey' : 'black',color:'white'}}> 
            Add Details
          </Button>
      </div>

      <TableContainer component={Paper}>
        <Table size="small" aria-label="a dense table">
          <TableHead style={{ backgroundColor: '#1976d2' }}>
            <TableRow>
              <TableCell style={{ fontWeight: '600', width: '20%' }}>Email</TableCell>
              <TableCell style={{ fontWeight: '600', width: '20%' }}>Name</TableCell>
              <TableCell style={{ fontWeight: '600', width: '20%' }}>Access Token</TableCell>
              <TableCell style={{ fontWeight: '600', width: '20%' }}>Refresh Token</TableCell>
              <TableCell style={{ fontWeight: '600', width: '20%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {emails.map((item) => (
              item.email && (
                <TableRow key={item.id}>
                  <TableCell style={{ width: '20%' }}>{item.email}</TableCell>
                  <TableCell style={{ width: '20%' }}>{item.name}</TableCell>
                  <TableCell style={{ width: '20%' }}>{item.accessToken}</TableCell>
                  <TableCell style={{ width: '20%' }}>{item.refreshToken}</TableCell>
                  <TableCell style={{ width: '20%' }}>
                    <IconButton onClick={() => handleDeleteEmail(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button variant="contained" color="primary" onClick={handleGoogleAuth} onMouseEnter={handleMouseEnter1}
        onMouseLeave={handleMouseLeave1} style={{ height: '40px' ,maxWidth:'150px',borderRadius:'15px', backgroundColor: isHovered1 ? 'grey' : 'black',color:'white'}}> 
            Get tokens
      </Button>
        
    </div>
    

  );
}

export default SendersEmails;

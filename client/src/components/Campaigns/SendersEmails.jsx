import React, { useEffect, useState } from 'react';
import { TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

function SendersEmails() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('')
  const [emails, setEmails] = useState([]);
  const [accessTokenInput, setAccessTokenInput] = useState('');
  const [tokens, setTokens] = useState({});
  const [isHovered1, setIsHovered1] = useState(false); 
  const [isHovered2, setIsHovered2] = useState(false); 

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


  const handleAddDetails = async () => {
    if (email && name && accessTokenInput && !emails.find(e => e.email === email)) {
      try {
        const response = await axios.post('http://localhost:3001/api/addEmails', {
          email: email, 
          name: name,
          accessToken: accessTokenInput, 
        });
        // Assuming response.data includes the new sender_id
        const newEmail = {
          id: response.data.sender_id,
          email: email,
          name: name,
          accessToken: accessTokenInput,
        };
        
        setEmails([...emails, newEmail]);
        setTokens({ ...tokens, [newEmail.id]: accessTokenInput });
        setEmail(''); // Clear the email input
        setName('');
        setAccessTokenInput(''); // Clear the access token input

      } catch (error) {
        console.error('Failed to save email and access token:', error);
      }
    } else {
      alert("Duplicate email or empty field!");
    }
  };
  

  const handleDeleteEmail = (emailToDelete) => {
    axios.delete(`http://localhost:3001/api/deleteEmail/${emailToDelete}`)
    .then(response => {
        // If the delete operation was successful in the backend, update the UI
        // Filter out the deleted email from the emails state
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


  const handleTokenChange = (emailId, token) => {
    setTokens({ ...tokens, [emailId]: token });
  };


  useEffect(()=>{
    console.log(emails)
  },[emails])

  useEffect(() =>{
    console.log(tokens)
  },[tokens])

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/api/getSenderEmailsDetails');
        // Filter out any entries without an email or ID
        
        const validEmails = data.result.filter(email => email.sender_email_id && email.sender_id);
        console.log(validEmails)
        setEmails(validEmails.map(email => ({
          id: email.sender_id, // Use sender_id as the unique identifier
          email: email.sender_email_id, // Assuming this is the email address
          name: email.sender_name || '',
          accessToken: email.refreshToken || '' // Use refreshToken as the token
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
    fetchEmails();
  }, []);
  


  return (
    <div style={{ margin: '20px' }}>
      <Typography variant="h4" component="h1" style={{ marginBottom: '20px' }}>
          Sender's Emails Management
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

          <Button variant="contained" color="primary" onClick={handleAddDetails} onMouseEnter={handleMouseEnter1}
        onMouseLeave={handleMouseLeave1} style={{ height: '40px' ,maxWidth:'150px',borderRadius:'15px', backgroundColor: isHovered1 ? 'grey' : 'black',color:'white'}}> 
            Add Details
          </Button>
      </div>

        <Table>
          <TableHead style={{ backgroundColor: '#1976d2' }}>
            <TableRow>
              <TableCell style={{ fontWeight:'600', fontStyle:'sans-serif' }}>Email</TableCell>
              <TableCell style={{ fontWeight:'600', fontStyle:'sans-serif' }}>Name</TableCell> 
              <TableCell style={{ fontWeight:'600', fontStyle:'sans-serif' }}>Access Token</TableCell>
              <TableCell style={{ fontWeight:'600', fontStyle:'sans-serif' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {emails.map((item) => (
                item.email && ( 
                <TableRow key={item.id}>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{tokens[item.id] }</TableCell>
                    <TableCell>
                    <IconButton onClick={() => handleDeleteEmail(item.id)}>
                        <DeleteIcon />
                    </IconButton>
                    </TableCell>
                </TableRow>
    )
  ))}
          </TableBody>
        </Table>
    </div>
  );
}

export default SendersEmails;

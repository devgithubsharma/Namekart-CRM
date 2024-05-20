import React, { useState } from 'react'
import { Box, TextField, Chip, Button, Typography  } from '@mui/material';
import axios from 'axios'

function AddEmails() {
    const [emailInput, setEmailInput] = useState('');
    const [emails, setEmails] = useState([]);

    const handleEmailChange = (event) => {
        setEmailInput(event.target.value);
    };

    const handleAddEmail = () => {
        if (emailInput && isValidEmail(emailInput)) { 
        axios.post('http://localhost:3001/api/addEmails', { email: emailInput })
        .then(response => {
            console.log('Email saved:', response.data);

            if(response.data.authUrl){
                console.log(response.data.authUrl)
                const newEmail = { id: response.data.sender_id, email: emailInput };
                setEmails([...emails, newEmail]);
                setEmailInput('');
                window.location.href = response.data.authUrl;
            }
                // const newEmail = { id: response.data.sender_id, email: emailInput };
                // setEmails([...emails, newEmail]);
                // setEmailInput('');
        })
        .catch(error => {
            console.error('Failed to save email:', error);
        });
        }
    };

    const handleDeleteEmail = (emailToDelete) => () => {
        setEmails((emails) => emails.filter((emailObj) => emailObj.id !== emailToDelete));
        axios.delete(`http://localhost:3001/api/deleteEmail/${emailToDelete}`)
        .then(response => {
            console.log('Email deleted:', response.data);
        })                
        .catch(error => {
            console.error('Failed to delete email:', error);
        });
    };

    const isValidEmail = (email) => {
        // Basic email validation (you can enhance this)
        return /\S+@\S+\.\S+/.test(email);
    };

  return (
        <Box sx={{ m: 2 }}>

            <Typography variant="h4" sx={{ mb: 4 }}>
                Add your Emails
            </Typography>

            <TextField
                label="Enter Email"
                value={emailInput}
                onChange={handleEmailChange}
                variant="outlined"
                InputProps={{
                    style: {
                        marginBottom:'14px', width: '1000px',borderRadius:'14px'
                    }
                }}
                
            />
            <Button 
                variant="contained" 
                onClick={handleAddEmail}
                disabled={!isValidEmail(emailInput)}
            >
                Add Email
            </Button>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {emails.map((emailObj) => (
                    <Chip
                        key={emailObj.id}
                        label={emailObj.email}
                        onDelete={handleDeleteEmail(emailObj.id)}
                        color="primary"
                    />
                ))}
            </Box>
        </Box>
  )
}

export default AddEmails

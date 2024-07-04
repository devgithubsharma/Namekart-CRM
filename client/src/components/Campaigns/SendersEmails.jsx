<<<<<<< HEAD
import React, { useEffect, useState, useContext } from "react";
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { GlobalContext } from "../ContextApi/GlobalContext";
import {
  saveSenderEmails,
  deleteEmail,
  fetchSenderEmailsDetails,
  updateSenderEmail,
} from "../../api";
=======
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

>>>>>>> sender-mail-verify

function SendersEmails() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [emails, setEmails] = useState([]);
  const [accessTokenInput, setAccessTokenInput] = useState("");
  const [refreshTokenInput, setRefreshTokenInput] = useState("");
  const [tokens, setTokens] = useState({});
<<<<<<< HEAD
  const [editRowId, setEditRowId] = useState(null);
  const [editedEmail, setEditedEmail] = useState("");
  const [editedName, setEditedName] = useState("");
  const [editedRefreshToken, setEditedRefreshToken] = useState("");

  const [isHovered1, setIsHovered1] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);
  const { userId } = useContext(GlobalContext);
=======
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
>>>>>>> sender-mail-verify

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
    if (
      email &&
      name &&
      refreshTokenInput &&
      !emails.find((e) => e.email === email)
    ) {
      try {
        const response = await saveSenderEmails(
          email,
          name,
          accessTokenInput,
          refreshTokenInput,
          userId
        );

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
            refreshToken: refreshTokenInput,
          },
        });
        setEmail("");
        setName("");
        setAccessTokenInput("");
        setRefreshTokenInput("");
      } catch (error) {
        console.error("Failed to save email and access token:", error);
      }
    } else {
      alert("Duplicate email or empty field!");
    }
  };
<<<<<<< HEAD
=======


  const handleGetTokens = async () => {
    console.log("get tokens")
    const response = await axios.get('http://localhost:3001/auth/google')
    console.log("response",response)
  }
  

>>>>>>> sender-mail-verify

  const handleDeleteEmail = (emailToDelete) => {
    deleteEmail(emailToDelete)
      .then((response) => {
        const updatedEmails = emails.filter((e) => e.id !== emailToDelete);
        setEmails(updatedEmails);

        const updatedTokens = { ...tokens };
        delete updatedTokens[emailToDelete];
        setTokens(updatedTokens);

        console.log("Email deleted successfully:", response.data);
      })
      .catch((error) => {
        console.error("Failed to delete email:", error);
      });
  };

  const handleEditEmail = (emailToEdit) => {
    setEditRowId(emailToEdit.id);
    setEditedEmail(emailToEdit.email);
    setEditedName(emailToEdit.name);
    setEditedRefreshToken(emailToEdit.refreshToken);
  };

  const handleSaveChanges = async () => {
    try {
      await updateSenderEmail(
        editRowId,
        editedEmail,
        editedName,
        editedRefreshToken,
        userId
      );
      const updatedEmails = emails.map((email) =>
        email.id === editRowId
          ? {
              ...email,
              email: editedEmail,
              name: editedName,
              refreshToken: editedRefreshToken,
            }
          : email
      );
      setEmails(updatedEmails);
      setEditRowId(null);
      setEditedEmail("");
      setEditedName("");
      setEditedRefreshToken("");
    } catch (error) {
      console.error("Failed to update email:", error);
    }
  };

  const handleDiscardChanges = () => {
    setEditRowId(null);
    setEditedEmail("");
    setEditedName("");
    setEditedRefreshToken("");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchSenderEmailsDetails(userId);
        const validEmails = response.data.result.filter(
          (email) => email.sender_email_id && email.sender_id
        );
        setEmails(
          validEmails.map((response) => ({
            id: response.sender_id,
            email: response.sender_email_id,
            name: response.sender_name || "",
            isActive: response.isActive || "",
            refreshToken: response.refreshToken || "",
          }))
        );

        const initialTokens = validEmails.reduce((acc, email) => {
          acc[email.sender_id] = email.refreshToken || "";
          return acc;
        }, {});

        setTokens(initialTokens);
      } catch (error) {
        console.error("Error in fetching sender emails:", error);
      }
    };
    fetchData();
  }, []);
<<<<<<< HEAD
=======
  
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

>>>>>>> sender-mail-verify

  return (
    <div style={{ margin: "20px" }}>
      <Typography variant="h4" component="h1" style={{ marginBottom: "20px" }}>
        Sender Emails Management
      </Typography>

      <div
        style={{ marginBottom: "20px", display: "flex", alignItems: "center" }}
      >
        <TextField
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginRight: "10px", flex: 1, maxWidth: "250px" }}
        />

        <TextField
          label="Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: "10px", flex: 1, maxWidth: "250px" }}
        />

        <TextField
          label="Refresh Token"
          variant="outlined"
          value={refreshTokenInput}
          onChange={(e) => setRefreshTokenInput(e.target.value)}
          style={{ marginRight: "10px", flex: 1, maxWidth: "200px" }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleAddDetails}
          onMouseEnter={handleMouseEnter1}
          onMouseLeave={handleMouseLeave1}
          style={{
            height: "40px",
            maxWidth: "150px",
            borderRadius: "15px",
            backgroundColor: isHovered1 ? "grey" : "black",
            color: "white",
          }}
        >
          Add Details
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table size="small" aria-label="a dense table">
          <TableHead style={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              <TableCell style={{ fontWeight: "600", width: "20%" }}>
                Email
              </TableCell>
              <TableCell style={{ fontWeight: "600", width: "20%" }}>
                Name
              </TableCell>
              <TableCell style={{ fontWeight: "600", width: "20%" }}>
                Active
              </TableCell>
              <TableCell style={{ fontWeight: "600", width: "20%" }}>
                Refresh Token
              </TableCell>
              <TableCell style={{ fontWeight: "600", width: "20%" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {emails.map((item) =>
              item.email ? (
                <TableRow key={item.id}>
                  <TableCell style={{ width: "20%" }}>
                    {editRowId === item.id ? (
                      <TextField
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        style={{ width: "100%" }}
                      />
                    ) : (
                      item.email
                    )}
                  </TableCell>
                  <TableCell style={{ width: "20%" }}>
                    {editRowId === item.id ? (
                      <TextField
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        style={{ width: "100%" }}
                      />
                    ) : (
                      item.name
                    )}
                  </TableCell>
                  <TableCell style={{ width: "20%" }}>
                    {item.isActive ? (
                      <CheckIcon style={{ color: "green" }} />
                    ) : (
                      <CloseIcon style={{ color: "red" }} />
                    )}
                  </TableCell>
                  <TableCell style={{ width: "20%" }}>
                    {editRowId === item.id ? (
                      <TextField
                        value={editedRefreshToken}
                        onChange={(e) => setEditedRefreshToken(e.target.value)}
                        style={{ width: "100%" }}
                      />
                    ) : (
                      item.refreshToken
                    )}
                  </TableCell>
                  <TableCell style={{ width: "20%" }}>
                    {editRowId === item.id ? (
                      <>
                        <IconButton onClick={handleSaveChanges}>
                          <SaveIcon />
                        </IconButton>
                        <IconButton onClick={handleDiscardChanges}>
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton onClick={() => handleEditEmail(item)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteEmail(item.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ) : null
            )}
          </TableBody>
        </Table>
      </TableContainer>
<<<<<<< HEAD
=======

      <Button variant="contained" color="primary" onClick={handleGoogleAuth} onMouseEnter={handleMouseEnter1}
        onMouseLeave={handleMouseLeave1} style={{ height: '40px' ,maxWidth:'150px',borderRadius:'15px', backgroundColor: isHovered1 ? 'grey' : 'black',color:'white'}}> 
            Get tokens
      </Button>
        
>>>>>>> sender-mail-verify
    </div>
    

  );
}

export default SendersEmails;

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

function SendersEmails() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [emails, setEmails] = useState([]);
  const [accessTokenInput, setAccessTokenInput] = useState("");
  const [refreshTokenInput, setRefreshTokenInput] = useState("");
  const [tokens, setTokens] = useState({});
  const [editRowId, setEditRowId] = useState(null);
  const [editedEmail, setEditedEmail] = useState("");
  const [editedName, setEditedName] = useState("");
  const [editedRefreshToken, setEditedRefreshToken] = useState("");

  const [isHovered1, setIsHovered1] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);
  const { userId } = useContext(GlobalContext);

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
    </div>
  );
}

export default SendersEmails;

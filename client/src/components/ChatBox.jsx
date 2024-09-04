import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Paper,
  IconButton,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CircularProgress } from "@mui/material";
import { GlobalContext } from "./ContextApi/GlobalContext";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined"; // Import the back arrow icon
import { fetchChats } from "../api";
import { fetchInboxItems } from "../api";
import { sendReply } from "../api";

function ChatBox() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState([]);
  const [inboxItems, setInboxItems] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [avatarColor, setAvatarColor] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const { userId } = useContext(GlobalContext);
  console.log("threadId", threadId);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        // const response = await axios.get(`https://crmapi.namekart.com/api/chatEmailData/${threadId}/${userId}`);
        const response = await fetchChats(threadId, userId);
        const emailData = response.data;
        console.log("emailData", emailData);

        const preparedChatHistory = emailData.map((email) => ({
          sender: email.emailType === "sent" ? "You" : email.sender_email, // Assuming `sender_email` is the correct field
          receiver: email.emailType === "sent" ? "You" : email.receiver_email,
          message: email.emailBody,
          time:
            email.emailType === "sent"
              ? new Date(email.sentTime)
                  .toISOString()
                  .replace("T", " ")
                  .substring(0, 19)
              : new Date(email.receivedTime)
                  .toISOString()
                  .replace("T", " ")
                  .substring(0, 19),
          domainName: email.subject,
        }));
        // setEmail(emailData[0]);

        setSelectedChat(response.data);
        setChatHistory(preparedChatHistory);
      } catch (error) {
        console.error("Error fetching email:", error);
      }
    };

    fetchChat();
  }, [threadId]);

  const handleBackClick = () => {
    navigate("/home/chattingMessages"); // Navigate back to the chatting messages page
  };


  useEffect(() => {
    const fetchInboxsItems = async () => {
      try {
        // const response = await axios.get(`https://crmapi.namekart.com/api/inboxItems/${userId}`);
        const response = await fetchInboxItems(userId);
        console.log(response);
        const data = response.data.map((item) => ({
          domainName: item.subject,
          lead: item.leads,
          recentReply: item.recentReply,
          replyTime: new Date(item.receivedTime),
          threadId: item.threadId,
        }));
        setInboxItems(data);
      } catch (error) {
        console.error("Error fetching inbox items:", error);
      }
    };
    fetchInboxsItems();
  }, []);

  const handleSendReply = async () => {
    if (!selectedChat) {
      console.error("No chat selected");
      return;
    }
    setIsSending(true);
    try {
      const resp = await sendReply(
        selectedChat[0].sender_email,
        selectedChat[0].receiver_email,
        selectedChat[0].subject,
        replyText,
        selectedChat[0].campId,
        selectedChat[0].threadId,
        selectedChat[0].domainName,
        selectedChat[0].leads,
        selectedChat[selectedChat.length - 1].messageId,
        userId
      );
      setReplyText("");
      console.log("resp", resp);

      // const response = await axios.get(`https://crmapi.namekart.com/api/chatEmailData/${selectedChat[0].threadId}/${userId}`);
      const response = await fetchChats(selectedChat[0].threadId, userId);
      const preparedChatHistory = response.data.map((email) => ({
        sender: email.emailType === "sent" ? "You" : email.sender_email, // Assuming `sender_email` is the correct field
        receiver: email.emailType === "sent" ? "You" : email.receiver_email,
        message: email.emailBody,
        time: email.emailType === "sent" ? email.sentTime : email.receivedTime,
        domainName: email.subject,
      }));
      console.log("response in handle send reply", response);
      setChatHistory(preparedChatHistory);
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleInboxClick = async (threadId) => {
    console.log("threadId", threadId);
    const fetchChatData = async () => {
      try {
        // const response = await axios.get(`https://crmapi.namekart.com/api/chatEmailData/${threadId}/${userId}`);
        const response = await fetchChats(selectedChat[0].threadId, userId);
        const emailData = response.data;

        const preparedChatHistory = emailData.map((email) => ({
          sender: email.emailType === "sent" ? "You" : email.sender_email, // Assuming `sender_email` is the correct field
          receiver: email.emailType === "sent" ? "You" : email.receiver_email,
          message: email.emailBody,
          time:
            email.emailType === "sent" ? email.sentTime : email.receivedTime,
          domainName: email.subject,
        }));

        setSelectedChat(response.data);
        setChatHistory(preparedChatHistory);
      } catch (error) {
        console.error("Error fetching chat data:", error);
      }
    };
    fetchChatData();
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <IconButton
        onClick={handleBackClick}
        sx={{
          position: "relative",
          top: 0,
          left: 10,
          zIndex: 1400,
          color: "black",
          size: "2px",
        }}
      >
        <ArrowBackOutlinedIcon />
        <Typography variant="caption" sx={{ fontSize: "1.25rem", top: 2 }}>
          Back
        </Typography>
      </IconButton>

      <Box
        sx={{
          position: "relative",
          display: "flex",
          height: "100vh",
          padding: "16px",
          gap: "16px",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: "350px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              borderBottom: "1px solid #ccc",
              pb: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "750", ml: 1 }}>
              Inbox
            </Typography>
          </Box>

          <List
            sx={{
              overflowY: "auto",
              maxHeight: "calc(100vh - 100px)",
              padding: "16px",
            }}
          >
            {inboxItems.map((item, index) => (
              <Paper
                key={index}
                elevation={3}
                sx={{
                  mb: 2,
                  bgcolor: "#f5f5f5",
                  overflow: "hidden",
                  wordWrap: "break-word",
                  height: "150px",
                }}
                onClick={() => handleInboxClick(item.threadId)}
              >
                <ListItem
                  button
                  onClick={() => navigate(`/home/chats/${item.threadId}`)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: avatarColor }}>
                      {getInitials(item.domainName)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {item.domainName}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="textSecondary">
                          {item.lead}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{
                            overflowY: "auto",
                            maxHeight: "80px",
                            display: "block",
                          }}
                        >
                          {item.recentReply}
                        </Typography>
                      </>
                    }
                    sx={{ overflowY: "auto", maxHeight: "120px" }} // This makes the text within the card scrollable
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        </Paper>

        <Paper
          elevation={6}
          sx={{
            width: "700px",
            flexGrow: 1,
            padding: "16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "700" }}>
            Messages{" "}
            {chatHistory.length > 0 ? chatHistory[0].domainName : "Loading..."}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ flexGrow: 1, overflowY: "auto", mb: 1 }}>
            {chatHistory.map((chat, index) => (
              <React.Fragment key={index}>
                <Paper
                  elevation={3}
                  sx={{
                    mb: 2,
                    p: 2,
                    backgroundColor:
                      chat.receiver === "You" ? "#eeeeee" : "#e1e16a",
                    marginLeft: chat.receiver === "You" ? "0px" : "auto",
                    marginRight: chat.receiver === "You" ? "auto" : "0px",
                    width: "60%",
                    height: "auto",
                    borderRadius: "30px",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: "750" }}>
                    {chat.sender}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ display: "block", marginBottom: "8px" }}
                  >
                    {chat.time}
                  </Typography>
                  <Typography variant="body1">{chat.message}</Typography>
                </Paper>
              </React.Fragment>
            ))}
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Type your message..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            sx={{ mb: 0 }}
          />
          <Typography variant="h7" sx={{ ml: 1, fontWeight: "bold" }}>
            Message sent as email
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendReply}
            sx={{ width: "150px", ml: 67 }}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <CircularProgress size={24} sx={{ color: "white", mr: 1 }} />
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </Button>
        </Paper>
      </Box>
    </>
  );
}

export default ChatBox;

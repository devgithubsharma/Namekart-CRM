import React, { useState, useEffect, useContext, useRef } from 'react';
import { GlobalContext } from '../ContextApi/GlobalContext';
import { Box, Typography, Avatar, TextField, Button, Paper, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import TurnRightIcon from '@mui/icons-material/TurnRight';
import { fetchChats, fetchCampId, sendReply } from '../../api';

const MailChatBox = ({ props }) => {
  const [message, setMessage] = useState('');
  const [domainName, setDomainName] = useState('');
  const [messageData, setMessageData] = useState([]);
  const { userId } = useContext(GlobalContext);
  const chatBoxRef = useRef(null);

  const handleAddText1 = () => {
    setMessage((prev) => `${prev} Send a follow up`);
  };

  const handleAddText2 = () => {
    setMessage((prev) => `${prev} Condition 2`);
  };

  const handleSendMessage = async () => {
    if (!message) {
      alert('Message cannot be empty.');
      return;
    }

    try {
      const response = await sendReply(message, props.email_id, userId);
      getMessageDetail();
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('An error occurred while sending the message.');
    }
  };

  const formatDate = (receivedTime) => {
    const date = new Date(receivedTime);
    const now = new Date();

    const istDate = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

    const formattedDate = istDate.format(date);
    const formattedNow = istDate.format(now);

    const isToday = formattedDate.split(' ')[0] === formattedNow.split(' ')[0];

    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedYesterday = istDate.format(yesterday);
    const isYesterday = formattedYesterday.split(' ')[0] === formattedNow.split(' ')[0];

    const year = date.getFullYear() === now.getFullYear() ? '' : date.getFullYear();

    if (isToday) {
      return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: 'numeric', hour12: true });
    } else if (isYesterday) {
      return 'Yesterday';
    } else {
      return `${date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}${year ? year : ''}`;
    }
  };

  const getMessageDetail = async () => {
    try {
      setMessageData([]);

      const threadId = props?.threadId;
      if (!threadId) {
        console.error('Invalid threadId received');
        return;
      }

      const chatresponse = await fetchChats(threadId, userId);
      if (!chatresponse || !chatresponse.data) {
        console.error('No data received from fetchChats');
        return;
      }

      const emailData = chatresponse.data;
      const messages = emailData.map((email) => ({
        id: email.email_id,
        name: email.emailType === 'sent' ? email.sender_email.split('@')[0] : email.receiver_email.split('@')[0],
        message: email.emailBody,
        time: email.emailType === 'sent' ? formatDate(email.sentTime) : formatDate(email.receivedTime),
        type: email.emailType === 'sent' ? 'sent' : 'received',
      }));

      setDomainName(emailData[0]?.domainName);
      setMessageData(messages);
      scrollToBottom(); // Scroll to the bottom after setting the messages
    } catch (error) {
      console.error('Error fetching message details:', error);
    }
  };

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    getMessageDetail();
  }, []);

  return (
    <Paper elevation={3} sx={{ width: 400, padding: 2, borderRadius: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{domainName}</Typography>
        <Typography variant="body2">Est: $100  GCP: $100</Typography>
      </Box>
      <Divider />
      <Box ref={chatBoxRef} sx={{ height: 300, overflowY: 'auto', mt: 2 }}>
        {messageData.map((msg) => (
          <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.type === 'received' ? 'flex-start' : 'flex-end', mb: 2 }}>
            {msg.type === 'received' && (
              <Avatar sx={{ bgcolor: 'primary.main', m: 0.5, width: 32, height: 32 }}>{msg.name[0]}</Avatar>
            )}
            <Box sx={{ ml: msg.type === 'received' ? 1 : 0, mr: msg.type === 'sent' ? 1 : 0, maxWidth: '70%', alignSelf: 'center' }}>
              <Paper sx={{ p: 1, backgroundColor: msg.type === 'received' ? 'grey.200' : 'primary.light', borderRadius: 2 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{msg.message}</Typography>
              </Paper>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                <Typography variant="caption" sx={{ fontSize: '0.75rem' }} color="textSecondary">{msg.name}</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.6rem' }} color="textSecondary">{msg.time}</Typography>
              </Box>
            </Box>
            {msg.type === 'sent' && (
              <Avatar sx={{ bgcolor: 'grey.500', m: 0.5, width: 32, height: 32 }}>{msg.name[0]}</Avatar>
            )}
          </Box>
        ))}
      </Box>
      <Divider />
      <Box sx={{ mt: 2 }}>
        <TextField
          placeholder="Send a message..."
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{ borderRadius: 2 }}
        />
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<TurnRightIcon />}
            onClick={handleAddText1}
            sx={{ borderRadius: 4, textTransform: 'none', flex: 1, minWidth: 0, whiteSpace: 'nowrap' }}
          >
            Send followUp
          </Button>
          <Button
            variant="outlined"
            startIcon={<TurnRightIcon />}
            onClick={handleAddText2}
            sx={{ borderRadius: 4, textTransform: 'none', flex: 1, minWidth: 0, whiteSpace: 'nowrap' }}
          >
            Condition 2
          </Button>
          <Button
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={handleSendMessage}
            sx={{ borderRadius: 4, textTransform: 'none', flex: 1, minWidth: 0, whiteSpace: 'nowrap' }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default MailChatBox;

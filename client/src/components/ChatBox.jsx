import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText,ListItemAvatar, Avatar, Divider, Paper,IconButton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';


function ChatBox() {
    const { threadId } = useParams();
    const navigate = useNavigate();
    // const [email, setEmail] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [inboxItems, setInboxItems] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [avatarColor, setAvatarColor] = useState('');
    const [threadsId, setThreadsId] = useState(null);
    const [selectedChat, setSelectedChat] = useState(null);

    console.log('threadId',threadId)


    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/chatEmailData/${threadId}`);
                const emailData = response.data;
                console.log("emailData",emailData)
                // Prepare chat history
                const preparedChatHistory = emailData.map((email) => ({
                    
                    receiver: email.emailType === 'sent' ? 'You' : email.receiver_email,
                    message: email.emailBody,
                    time: email.emailType === 'sent' ? email.sentTime : email.receivedTime,
                    domainName:email.subject
                }));
                // setEmail(emailData[0]); 
                setSelectedChat(response.data)
                setChatHistory(preparedChatHistory);
            } catch (error) {
                console.error('Error fetching email:', error);
            }
        }

        fetchChats();
    }, [threadId]);

    useEffect(() => {
        const fetchInboxItems = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/inboxItems');
                console.log(response)
                const data = response.data.map(item => ({
                    domainName: item.subject,
                    lead: item.leads,
                    recentReply: item.recentReply,
                    replyTime: new Date(item.receivedTime),
                    threadId:item.threadId
                }));
                setInboxItems(data);
            } catch (error) {
                console.error('Error fetching inbox items:', error);
            }
        };
 
        fetchInboxItems();
    }, []);


    const handleSendReply = async () => {
        if (!selectedChat) {
            console.error('No chat selected');
            return;
        }

        try {
            await axios.post(`http://localhost:3001/api/sendReply`, {
                sender_email: selectedChat[0].sender_email,
                receiver_email: selectedChat[0].receiver_email,
                subject: selectedChat[0].subject,
                emailBody: replyText,
                campId: selectedChat[0].campId,
                threadId:  selectedChat[0].threadId,
                domainName: selectedChat[0].domainName,
                lead: selectedChat[0].leads
            });
            setReplyText('');
            
            const response = await axios.get(`http://localhost:3001/api/chatEmailData/${selectedChat[0].threadId}`);
            const preparedChatHistory = response.data.map((email) => ({
                    
                receiver: email.emailType === 'sent' ? 'You' : email.receiver_email,
                message: email.emailBody,
                time: email.emailType === 'sent' ? email.sentTime : email.receivedTime,
                domainName:email.subject
            }));
            setChatHistory(preparedChatHistory);

        } catch (error) {
            console.error('Error sending reply:', error);
        }
    };
    
    const handleInboxClick = async (threadId)=>{
        console.log("threadId",threadId)
        const fetchChatData = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/chatEmailData/${threadId}`);
                const emailData = response.data;
                
                const preparedChatHistory = emailData.map(email => ({
                    receiver: email.emailType === 'sent' ? 'You' : email.receiver_email,
                    message: email.emailBody,
                    time: email.emailType === 'sent' ? email.sentTime : email.receivedTime,
                    domainName: email.subject
                }));
                setSelectedChat(response.data)
                setChatHistory(preparedChatHistory);
            } catch (error) {
                console.error('Error fetching chat data:', error);
            }
        };
        fetchChatData();
    }


    const getInitials = (name) => {
        return name.split(' ')
                   .map(word => word[0])
                   .join('')
                   .toUpperCase();
    };


    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh',padding: '16px', gap: '16px' }}>
            <Paper elevation={6} sx={{ width: '350px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',  mb: 2, borderBottom: '1px solid #ccc', pb: 1  }}>
                    <Typography variant="h6" sx={{fontWeight:'750', ml:1}}>Inbox</Typography>
                    {/* <Button variant="outlined" color="primary" size="small">Bulk message</Button> */}
                </Box>
                <List sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 100px)', padding: '16px' }}>
                    {inboxItems.map((item, index) => (
                        <Paper key={index} elevation={3} sx={{ mb: 2, bgcolor: '#f5f5f5',overflow: 'hidden', 
                            wordWrap: 'break-word' }} onClick={() => handleInboxClick(item.threadId)} >
                        <ListItem button onClick={() => navigate(`/chats/${item.threadId}`)}>
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: avatarColor }}>{getInitials(item.domainName)}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={<Typography variant="body1" sx={{ fontWeight: 'bold' }}>{item.domainName}</Typography>}
                                secondary={
                                    <>
                                        <Typography variant="body2" color="textSecondary">{item.lead}</Typography>
                                        <Typography variant="caption" color="textSecondary">{item.recentReply}</Typography>
                                    </>
                                }
                            />
                        </ListItem>
                    </Paper>
                    ))}
                </List>
            </Paper>
 
            <Paper elevation={6} sx={{ width:"700px",flexGrow: 1, padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" sx={{fontWeight:"700"}}>Messages {chatHistory.length > 0 ? chatHistory[0].domainName : "Loading..."}</Typography>
                {/* <Typography variant="subtitle1">{email.sender}</Typography> */}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ flexGrow: 1, overflowY: 'auto',mb: 1 }}>
                    {chatHistory.map((chat, index) => (
                        <React.Fragment key={index}>
                        
                        {/* <Typography variant="h5" sx={{ fontWeight: "700" }}>{chat.domainName}</Typography> */}
                        <Paper
                            elevation={3}
                            sx={{
                                mb: 2,
                                p: 2,
                                backgroundColor: chat.receiver === 'You' ? '#eeeeee' : '#d7f5f5',
                                marginLeft: chat.receiver === 'You' ? 'auto' : '0px',
                                marginRight: chat.receiver === 'You' ? '0px' : 'auto',
                                width: '70%',
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: "750" }}>{chat.sender}</Typography>
                            <Typography variant="caption" sx={{ display: 'block', marginBottom: '8px' }}>{chat.time}</Typography>
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
                <Typography variant="h7" sx={{ml:1, fontWeight:"bold"}}>Message sent as email</Typography>
                <Button variant="contained" color="primary" onClick={handleSendReply} sx={{ width: '150px',ml:67 }}>
                    Send Message
                </Button>
            </Paper>

        </Box>
    );
}

export default ChatBox;
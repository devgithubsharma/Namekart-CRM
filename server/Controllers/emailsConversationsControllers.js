const dbConnection = require('../dbConnection');
var Imap = require('imap');
var MailParser = require("mailparser").MailParser;
const { google } = require('googleapis');
var Promise = require("bluebird");

function getOriginalEmailDetails(connection, messageId) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM emailsdata WHERE messageId = ?";
        connection.query(query, [messageId], (error, results) => {
            if (error) {
                console.error('Error fetching original email details', error);
                reject(error);
            } else if (results.length > 0) {
                resolve(results[0]); // Assuming messageId is unique and only one result should be returned
            } else {
                resolve(null); // No original email found
            }
        });
    });
}

const getTokensForSender = async (senderEmail,connection) => {
    console.log('getTokensForSender');
    try {
        return new Promise((resolve, reject) => { 
            connection.query('SELECT refreshToken FROM sendertable WHERE sender_email_id = ?', [senderEmail], (err, result) => {
                if (err) {
                    console.error('Database error in getTokensForSender:', err);
                    reject(err); 

                } else if (result.length > 0) {
                    const plainObject = JSON.parse(JSON.stringify(result[0]));
                    console.log('Resolve refresh token')
                    resolve({ 
                        refreshToken: plainObject.refreshToken,
                    });

                } else {
                    console.log(`No tokens found for ${senderEmail}`);
                    resolve({  refreshToken: null }); 
                }
            });
        });
    } catch (error) {
      console.error('Database error in getTokensForSender:', error);
      throw error; 
    } 
  };

  async function getGmailToken(refreshToken) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.Client_ID,  // Your Google OAuth 2.0 Client ID
        process.env.Client_secret, // Your Google OAuth 2.0 Client Secret
        process.env.REDIRECT_URI  // Your OAuth 2.0 Redirect URI (not used in this flow but required by OAuth2 client)
    );
    oauth2Client.setCredentials({
      refresh_token: refreshToken 
    });
  
    const {token} = await oauth2Client.getAccessToken(); // Get access token
    console.log("accessToken", token);
    return token; // Return just the token string
  }

  function messageIdExists(connection,messageId){
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM emailsdata WHERE messageId = ?';// Assuming you want to increment the count
        connection.query(query, [messageId],(error, results) => {
            if (error) {
                console.error('Error in query of checking messageId', error);
                reject(error);
            } else {
                console.log('MessageId Exists')
                console.log(results)
                if(results[0]){
                    resolve(true)
                }else
                    resolve(false)
                }               
            })
        })
}

function getSenderEmails(connection){
    return new Promise((resolve, reject) => {
        const query = 'Select sender_email_id from sendertable'; 
        connection.query(query, (error, results) => {
            if (error) {
                console.error('Error in query of fetching sender_email_id', error);
                reject(error);
            } else {
                console.log('Sender Emails fetched successfully');
                resolve(results);
            }
        });
    })
}

function insertReplyAsNewRow(connection, originalEmailDetails, mailMessageId , replyText, tag) {
    console.log('insertReplyAsNewRow')
    return new Promise((resolve, reject) => {
        const { sender_email, receiver_email, subject, pretext, trackingId, trackingStatus, campId, messageId, mailsCount, contactsClicked, contactsUnsubscribed, contactsReplied, mailBounced, firstMailCount, followUpMailCount, mailType, campaignType, threadId } = originalEmailDetails;
        const query = "INSERT INTO emailsdata (sender_email, receiver_email, subject, pretext, emailBody, trackingId, trackingStatus, campId, messageId, mailsCount, contactsClicked, contactsUnsubscribed, contactsReplied, mailBounced, firstMailCount, followUpMailCount, mailType, campaignType, emailType, threadId, tag) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        connection.query(query, [sender_email, receiver_email, subject, pretext, replyText, trackingId, trackingStatus, campId,  mailMessageId, mailsCount, contactsClicked, contactsUnsubscribed, contactsReplied, mailBounced, firstMailCount, followUpMailCount, mailType, campaignType, 'received', threadId, tag], (error, results) => {
            if (error) {
                console.error('Error inserting new reply row', error);
                reject(error);
            } else {
                console.log(`New reply inserted for messageId: ${messageId}`);
                resolve(results);
            }
        });
    });
}


async function getRepliesEmailData(imap, senderEmail, connection) {
    // let lastFetchTime = await getLastFetchTime(connection);
    // lastFetchTime = lastFetchTime.map(data => data.lastFetchTime);
    // console.log('lastFetchTime', lastFetchTime);

    return new Promise((resolve, reject) => {
        imap.search(["ALL", ["ON", 'April 22, 2024'], ["TO", senderEmail]], function(err, results) {
            if (err) {
                reject(err);
                return;
            }

            if (!results || !results.length) {
                console.log(`No unread mails from ${senderEmail}`);
                resolve({ messageId: null, replyText: null });
                return;
            }

            let tag;
            let foundMessageId = null;
            let replyText = null;  // Store the reply text
            const fetchPromises = [];
            let mailMessageId = null;

            var f = imap.fetch(results,{ //you can set amount range like '1:2' or 'results' for all results
                bodies: '',
                struct: true
              })

            f.on("message", function(msg, seqno) {
                const fetchPromise = new Promise((resolveMail, rejectMail) => {
                    var mailparser = new MailParser();
                    mailparser.on("error", error => {
                        console.error('MailParser error:', error);
                        rejectMail(error);
                    });

                    msg.on("body", function(stream, info) {
                        console.log(`Piping data to MailParser for seqno: ${seqno}, info: ${info.which}`);
                        stream.pipe(mailparser);
                    });

                    mailparser.on("headers", async function(headers) {
                        console.log('Mail header', headers);
                        let messageId = headers.get("in-reply-to");
                        mailMessageId = headers.get('message-id')
                        console.log('messageId',messageId)
                        
                        if (messageId) {
                            messageId = messageId.replace(/[<>]/g, '');
                            console.log('messageId', messageId);
                            foundMessageId = messageId; 
                            tag = "chatReply";
                        }else{
                            tag = "separateMail"; 
                        }
                    });

                    mailparser.on("data", (data) => {
                        if (data.type === 'text') {
                            console.log(`Body: ${data.text}`);
                            replyText = data.text; 
                        }
                    });

                    mailparser.on("end", () => {
                        console.log(`Completed parsing for seqno: ${seqno}`);
                        let tag = foundMessageId ? "chatReply" : "separateMail";
                        resolveMail({ messageId: foundMessageId, replyText: replyText, tag: tag, mailMessageId:mailMessageId });
                    });
                });

                fetchPromises.push(fetchPromise);
            });

            f.once("error", function(err) {
                console.log("Fetch error: ", err);
                reject(err);
            });

            f.once("end", function() {
                console.log(`Fetching complete.`);
                Promise.all(fetchPromises).then((results) => {
                    // Assuming all messages have the same messageId and replyText
                    const lastResult = results  // Get the last result which should have complete data
                    console.log(`Done processing all unseen messages from ${senderEmail}.`);
                    resolve(lastResult);
                }).catch(reject);
            });

        });
    });
}

async function processEmailConversations(connection) {
    try{
        let datas = await getSenderEmails(connection);
        datas = datas.map(data => data.sender_email_id);
        console.log('datas',datas)
    
        for (let sender of datas) {
            const tokens = await getTokensForSender(sender,connection);
            let accessToken = await getGmailToken(tokens.refreshToken);
            console.log('accessToken',accessToken)
            let base64Encoded =  Buffer.from([`user=${sender}`, `auth=Bearer ${accessToken}`, '', ''].join('\x01'), 'utf-8').toString('base64');
            console.log('base64Encoded',base64Encoded)

            var imap = new Imap({
                user: sender,
                xoauth2:base64Encoded,
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
                debug: console.log,
                authTimeout: 25000,
                connTimeout: 30000,
                tlsOptions: {
                    rejectUnauthorized: false,
                    servername: 'imap.gmail.com'
                }
            });
    


            console.log('Connection established')
            Promise.promisifyAll(imap);
            imap.once("error", function(err) {
                console.log("Connection error: " + err.stack);
            });
    
            imap.connect();
    
            await new Promise((resolve, reject) => {
                console.log('Open Inbox')
                imap.once("ready", async function() {
                    console.log('Error after imap.once')
                    imap.openBox("INBOX", false, async function(err, mailBox) {
                        if (err) {
                            console.error('Error inside openbox',err);
                            reject(err);
                            return;
                        }

                        try {
                            console.log('Before receivedEmails');
                            const messages = await getRepliesEmailData(imap, sender, connection);
                            console.log('messages',messages)
                           
                            for (const message of messages){
                                const { messageId, replyText, tag, mailMessageId } = message; // Destructure the message object
                                console.log('Processing message:', messageId, replyText, tag, mailMessageId);

                                if (messageId && replyText) {
                                    const originalEmail = await getOriginalEmailDetails(connection, messageId);
                                    if (originalEmail) {
                                        console.log('originalEmail',originalEmail)
                                        console.log('Checking reply text inside originalEmail ',replyText)
                                        await insertReplyAsNewRow(connection, originalEmail,mailMessageId, replyText, tag);
                                        console.log(`Database updated for messageId ${messageId} with new reply email.`);
                                    }
                                }
                            } 

                        } catch (error) {
                            console.error(`Error updating database: ${error}`);
                        }

                        imap.end();
                        resolve();
                    });
                });
            });
        }
    }catch(err){
        console.error('Error during the processEmailConversations:', err);
        throw err; 
    }
}

module.exports = {
    processEmailConversations,
}

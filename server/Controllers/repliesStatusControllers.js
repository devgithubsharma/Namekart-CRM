var Imap = require('imap');
var MailParser = require("mailparser").MailParser;
var Promise = require("bluebird");
// const dbConnection = require('../dbConnection'); 
const {google} = require('googleapis');
const {updateBouncedMails} = require('./updateBouncedMailsControllers')

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

function updateContactsRepliedInDatabase(messageId,connection) {
    console.log(messageId)
    return new Promise((resolve, reject) => {
        const query = 'UPDATE emailsdata SET contactsReplied = ? WHERE messageId = ? '; // Assuming you want to increment the count
        connection.query(query, [1,messageId], (error, results) => {
            if (error) {
                console.error('Error in updating contactsReplied count', error);
                reject(error);
            } else {
                console.log(`contactsReplied count updated for campaign ID: ${messageId}`);
                resolve(results);
            }
        })
    })
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

  function getLastFetchTime(connection) {
    return new Promise((resolve, reject) =>{
        const query = 'SELECT lastFetchTime FROM repliesfetchtime WHERE id = 1';
        connection.query(query,(err,result)=>{
            if(err){
                console.log('Error in getLastFetchTime query',err)
            }else{
                console.log('Result of lastFetchTime ',result)
                resolve(result);
            }
        })
    })
}

function updateLastFetchTime(connection, newFetchTime) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE repliesfetchtime SET lastFetchTime = ? WHERE id = 1';
        connection.query(query, [newFetchTime], (err,result) =>{
            if(err){
                console.log('Error in updateLastFetchTime query',err)
                reject(err);
            }else{
                console.log('Time Updated successfully')
                resolve();
            } 
        });
    })
}

async function processUpdateRepliesStatus(connection) {
    try{
        let datas = await getSenderEmails(connection);
        datas = datas.map(data => data.sender_email_id);
        console.log('datas',datas)
    
        for (let sender of datas) {
            
            const tokens = await getTokensForSender(sender,connection);
            let accessToken = await getGmailToken(tokens.refreshToken);
            let base64Encoded =  Buffer.from([`user=${sender}`, `auth=Bearer ${accessToken}`, '', ''].join('\x01'), 'utf-8').toString('base64');
    
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
    
                        console.log('Before receivedEmails')
                        let messageId = await getReceivedEmails(imap, sender,connection);
                        console.log(messageId)
                       
                        try {
                            if(messageId){
                                await updateContactsRepliedInDatabase(messageId,connection);
                                console.log(`Database updated for messageId ${messageId} received emails.`);
                            }
                            
                        } catch (error) {
                            console.error(`Error updating database: ${error}`);
                            return res.status(500).send("Error updating contacts replied in database.");
                        }
                        imap.end();
                        resolve();
                    });
                });
            });
        }
    }catch(err){
        console.error('Error during the processUpdateRepliesStatus:', err);
        throw err; 
    }
}

async function getReceivedEmails(imap, senderEmail, connection) {
    let lastFetchTime = await getLastFetchTime(connection);
    lastFetchTime = lastFetchTime.map(data => data.lastFetchTime);
    console.log('lastFetchTime', lastFetchTime);

    return new Promise((resolve, reject) => {
        imap.search(["ALL", ["ON", 'April 11, 2024'], ["TO", senderEmail]], function(err, results) {
            if (err) {
                reject(err);
                return;
            }

            if (!results || !results.length) {
                console.log(`No unread mails from ${senderEmail}`);
                resolve(0);
                return;
            }

            let foundMessageId = null;
            const fetchPromises = [];

            var f = imap.fetch(results, {
                request: {
                  headers: true,
                  body: true
                }
              });

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
                        let checkSubject = headers.get("subject");
                        console.log('messageId',messageId)
                        console.log('checkSubject',checkSubject)

                        if (messageId) {
                            messageId = messageId.replace(/[<>]/g, '');
                            console.log('messageId', messageId);
                            const isMessageIdFound = await messageIdExists(connection, messageId);

                            if (isMessageIdFound) {
                                foundMessageId = messageId;
                            }
                            if (checkSubject === 'Delivery Status Notification (Failure)') {
                                await updateBouncedMails(messageId);
                            }
                        }
                    });

                    mailparser.on("data", (data) => {
                        if (data.type === 'text') {
                            console.log(`Body: ${data.text}`); 
                        }
                    });

                    mailparser.on("end", () => {
                        console.log(`Completed parsing for seqno: ${seqno}`);
                        resolveMail();
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
                Promise.all(fetchPromises).then(() => {
                    console.log(`Done processing all unseen messages from ${senderEmail}.`);
                    resolve(foundMessageId);
                }).catch(reject);
            });
        });
    });
}

module.exports = {
    processUpdateRepliesStatus,
}

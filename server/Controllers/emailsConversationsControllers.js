// const dbConnection = require('../dbConnection');
var Imap = require('imap');
var MailParser = require("mailparser").MailParser;
const { google } = require('googleapis');
var Promise = require("bluebird");
const moment = require('moment-timezone');
const dbConnection = require('../dbConnection');
const { format } = require('date-fns');

 
function getOriginalEmailDetails(connection, messageId) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM emailsdata WHERE messageId = ?";
        connection.query(query, [messageId], (error, results) => {
            if (error) {
                console.error('Error fetching original email details', error);
                reject(error);
            } else if (results.length > 0) {
                resolve(results[0]); 
            } else {
                resolve(null); 
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
                    console.log('Resolve refresh token');
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
    try{
        const oauth2Client = new google.auth.OAuth2(
            process.env.Client_ID,  
            process.env.Client_secret, 
            process.env.REDIRECT_URI  
        );
    
        oauth2Client.setCredentials({
          refresh_token: refreshToken 
        });
      
        const {token} = await oauth2Client.getAccessToken(); 
        console.log("accessToken", token);
        return token; 
    }catch(err){
        console.log("Error in getGmailToken",err)
        return null
    }
    
  }

  function messageIdExists(connection,messageId){
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM emailsdata WHERE messageId = ?';
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

function insertReplyAsNewRow(connection, originalEmailDetails, mailMessageId , replyText, tag, formattedDate,inReplyMessageId) {
    console.log('insertReplyAsNewRow')
    return new Promise((resolve, reject) => {

        const { sender_email, receiver_email, subject, campId, messageId, mailsCount, contactsReplied, firstMailCount, followUpMailCount, mailType, threadId, domainName, leads,userId } = originalEmailDetails;
        const query = "INSERT INTO emailsdata (sender_email, receiver_email, subject, emailBody, campId, messageId, mailsCount, contactsReplied, firstMailCount, followUpMailCount, mailSequence, emailType, threadId, tag,domainName,leads,receivedTime, inReplyTo, userId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        connection.query(query, [sender_email, receiver_email, subject, replyText, campId,  mailMessageId, mailsCount, contactsReplied, firstMailCount, followUpMailCount, mailType, 'received', threadId, tag, domainName, leads, formattedDate, inReplyMessageId, userId], (error, results) => {
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


function updateContactsRepliedInDatabase(messageId,connection) {
    console.log(messageId)
    return new Promise((resolve, reject) => {

        const query = `UPDATE emailsdata SET contactsReplied = 1 WHERE messageId=?`;
        connection.query(query, [messageId], (error, results) => {
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



function updateLastFetchTime(connection) {
    return new Promise((resolve, reject) => {
        let now = new Date();

        // const formattedDate = moment.utc(new Date()).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
        now  = format(now, 'yyyy-MM-dd HH:mm:ss');
        const query = 'UPDATE repliesfetchtime SET lastFetchTime = ? WHERE id = 1';
        connection.query(query, [now], (err,result) =>{
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


async function getRepliesEmailData(imap, senderEmail,lastFetchTime) {
    return new Promise((resolve, reject) => {
        imap.search(["ALL", ["SINCE", lastFetchTime], ["TO", senderEmail]], function(err, results) {
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
            let replyText = null;  
            const fetchPromises = [];
            let mailMessageId = null;
            let emailDatas=[];
            let formattedDate;
            // let formattedLastFetchedDate;

            var f = imap.fetch(results,{ 
                bodies: '',
                struct: true
              })

            f.on("message", function(msg, seqno) {
                console.log(123)
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
                        formattedDate = headers.get("date")
                        formattedDate = format(formattedDate, 'yyyy-MM-dd HH:mm:ss');
                        if (formattedDate <= lastFetchTime) {
                            rejectMail('Email date is not newer than last fetch time');
                            return;
                        }
                        console.log("lastFetchTime=>",lastFetchTime);

                        mailMessageId = headers.get('message-id')
                        mailMessageId = mailMessageId.replace(/^<|>$/g, '');
                        console.log("mailMessageId",mailMessageId);
                        console.log('messageId',messageId);
                        
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
                            console.log(`Full Body: ${data.text}`);
                            const lines = data.text.split('\n');
                            const originalMessageIndex = lines.findIndex(line => line.trim().startsWith('On ') && line.includes('wrote:'));
                            if (originalMessageIndex > 0) {
                                replyText = lines.slice(0, originalMessageIndex).join('\n').trim();
                            } else {
                                replyText = data.text.trim();
                            }
                            console.log(`Extracted Reply: ${replyText}`);
                        }
                    });



                    mailparser.on("end", () => {
                        console.log(`Completed parsing for seqno: ${seqno}`);
                        let tag = foundMessageId ? "chatReply" : "separateMail";
                        console.log("formattedDate",formattedDate)
                        console.log("lastFetchTime",lastFetchTime)

                    if(formattedDate>lastFetchTime){
                        console.log("formattedDate>lastFetchTime")
                        emailDatas.push({ messageId: foundMessageId, replyText: replyText, tag: tag, mailMessageId:mailMessageId, formattedDate:formattedDate });
                        console.log("emailDatas",emailDatas)
                        resolveMail({ messageId: foundMessageId, replyText: replyText, tag: tag, mailMessageId:mailMessageId, formattedDate:formattedDate });
                    }else{
                        rejectMail({ messageId: foundMessageId, replyText: replyText, tag: tag, mailMessageId:mailMessageId, formattedDate:formattedDate })
                        }
                    });
                });
                
                console.log("abc134")
                fetchPromises.push(fetchPromise);
                
            });
            
            f.once("error", function(err) {
                console.log("Fetch error------------------: ", err);
                reject(err);
            });


            f.once("end", function() {
                console.log(`Fetching complete.`);
                console.log("fetchPromises",fetchPromises)
                fetchPromises.forEach((p, index) => console.log(`Promise ${index}:`, p));
                    Promise.allSettled(fetchPromises).then((results) => {
                        console.log("results inside allSettled",results)
                        const successfulResults = results.filter(result => result._settledValueField.tag === "chatReply")
                        .map(result => result._settledValueField);
                        console.log(`Successfully processed ${successfulResults.length} out of ${results.length} fetch operations.`);
                        resolve(successfulResults);
                    }).catch(error => {
                        console.error('Error processing fetch promises:', error);
                        reject(error);
                    });
                    // const lastResult = results  
                    // console.log(`Done processing all unseen messages from ${senderEmail}.`);
                    // resolve(lastResult);
                })
            });

        });
}


async function processEmailConversations(connection) {
    try{
        // const connection = await dbConnection.getConnection();
        console.log("Starting of processEmailConversations")
        let datas = await getSenderEmails(connection);
        datas = datas.map(data => data.sender_email_id);
        console.log('datas',datas)
        let lastFetchTime = await getLastFetchTime(connection);
        console.log("lastFetchTime",lastFetchTime)
        lastFetchTime = lastFetchTime.map(data => data.lastFetchTime);
        lastFetchTime = lastFetchTime[0]
        lastFetchTime = format(lastFetchTime, 'yyyy-MM-dd HH:mm:ss');
        console.log('lastFetchTime', lastFetchTime);

        // lastFetchTime = moment.utc(lastFetchTime).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
        // console.log('lastFetchTime (Local)', lastFetchTime);
    
        for (let sender of datas) {
            console.log("sender",sender)
            const tokens = await getTokensForSender(sender,connection);
            let accessToken = await getGmailToken(tokens.refreshToken);
            if(!accessToken){
                continue;
            }
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
            // imap.once("error", function(err) {
            //     console.log("Connection error: " + err.stack);
            // });
    
            // imap.connect();
    
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
                            const messages = await getRepliesEmailData(imap, sender,lastFetchTime);
                            console.log('messages',messages);
                           
                            for (const message of messages){
                                const { messageId, replyText, tag, mailMessageId,formattedDate } = message; 
                                console.log('Processing message:', messageId, replyText, tag, mailMessageId);
                                console.log('Before checking messageId and replyText:', messageId, replyText);
                                await updateContactsRepliedInDatabase(messageId,connection)
                                try {
                                    const originalEmail = await getOriginalEmailDetails(connection, messageId);
                                    if (originalEmail) {
                                        await insertReplyAsNewRow(connection, originalEmail, mailMessageId, replyText, tag, formattedDate, messageId);
                                        console.log(`Database updated for messageId ${messageId} with new reply email.`);
                                    } else {
                                        console.log('No original email details found for:', messageId);
                                    }
                                } catch (error) {
                                    console.error('Error during database operation:', error);
                                }
                                console.log('After inserting new row');

                            } 

                        } catch (error) {
                            console.error(`Error updating database: ${error}`);
                        }

                        imap.end();
                        resolve();
                    });
                });

                imap.once("error", function(err) {
                    console.log("IMAP connection error-------- " + err.stack);
                });

                imap.once('end', function() {
                    console.log('Connection ended----------');
                });

                imap.connect();

            });
            
        }
        console.log("Before updateLastFetchTime")
        await updateLastFetchTime(connection)
        console.log("After updateLastFetchTime")
    }catch(err){
        console.error('Error during the processEmailConversations:', err);
        throw err; 
    }
}

module.exports = {
    processEmailConversations,
}






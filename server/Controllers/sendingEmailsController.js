const nodemailer = require('nodemailer');
const dbConnection = require('../dbConnection'); 
const {google} = require('googleapis');
const cheerio = require('cheerio');
const uuid = require('uuid'); 
const juice = require('juice');
const { parse } = require('node-html-parser');
const {updateBouncedMails} = require('./updateBouncedMailsControllers')
const schedule = require('node-schedule');
const moment = require('moment-timezone');
const { format } = require('date-fns');

function randomNumberGenerator(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  

const getTokensForSender = async (senderEmail,connection) => { 
    console.log('getTokensForSender');
    console.log("senderEmail",senderEmail)
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

  async function hasContactReplied(campId, receiverEmail, connection) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT contactsReplied FROM emailsdata WHERE campId = ? AND receiver_email = ?';
        connection.query(query, [campId, receiverEmail], (error, results) => {
            if (error) {
                console.error('Error checking reply status:', error);
                reject(error);
            } else if (results.length > 0 && results[0].contactsReplied === 1) {
                resolve(true); // Contact has replied
            } else {
                resolve(false); // Contact has not replied
            }
        });
    });
}

  function incrementSentEmailCount(campaignId,connection) {
    console.log('incrementSentEmailCount');
    return new Promise((resolve, reject) => {
        const query = 'UPDATE emailsdata SET mailsCount = ? WHERE campId = ?'; 
        connection.query(query, [1,campaignId], (error, results) => {
            if (error) {
                console.error('Error updating sent email count:', error);
                reject(error);
            } else {
                console.log(`Sent email count updated for campaign ID: ${campaignId}`);
                resolve(results);
            }
        });
    });
}



async function getThreadIdForFollowUp(campId, receiverEmail, connection) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id FROM thread WHERE camp_id = ? AND receiver_email = ? LIMIT 1';
        connection.query(query, [campId, receiverEmail], (err, results) => {
            if (err) {
                console.error('Error fetching threadId for follow-up:', err);
                reject(err);
            } else if (results.length > 0) {
                console.log('ThreadId fetched successfully for follow-up');
                resolve(results[0].threads_id); // Assuming 'id' is the column name for threadId in your thread table
            } else {
                console.log('No threadId found for follow-up, creating a new thread');
                resolve(null); // Resolve with null if no threadId is found, you may need to handle this case
            }
        });
    });
}

function getDetails(campId, receiver, connection) {
    return new Promise((resolve, reject) => {
        const latestEmailQuery = 'SELECT * FROM emailsdata WHERE campId = ? AND receiver_email = ?';
        connection.query(latestEmailQuery, [campId, receiver], (error, results, fields) => {
            if (error) {
                console.error('Database error in getDetails:', error);
                reject(error);
            } else {
                const latestEmail = results.length > 0 ? results[0] : null;
                console.log('Latest email fetched successfully');
                resolve(latestEmail);
            }
        });
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createEmailContent(emailDetails) {
    const { sender, receiver, subject, body , headers} = emailDetails;
    const header = [
        `From: ${sender}`,
        `To: ${receiver}`,
        `Subject: ${subject}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        ...Object.entries(headers).map(([key, value]) => `${key}: ${value}`)
    ];

    const emailBody = [
        header.join('\r\n'),
        '',
        body
    ];

    return emailBody.join('\r\n').trim();
}

async function sendEmail(emailContent,gmail) {
    console.log("Before base64Email")
    const base64Email = Buffer.from(emailContent).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    console.log("After base64Email")
    const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: base64Email
        }
    });
    console.log("After sent mail response")
    return response;
}

const sendEmails = async (req,res) => {
    console.log("DateToSend",new Date())
    
    // const campaign_type = "Manual"
    const sendersEmails = req.body.sendersEmails
    const receiversEmails = req.body.receiversEmails
    const senderNames = req.body.senderNames
    const receiverNames = req.body.receiverName
    const leads = req.body.leads
    let subject = req.body.subject
    const pretext = req.body.pretext
    let emailBody = req.body.emailBody
    const emailDelay = req.body.delay
    const domains = req.body.domains
    const campId = req.body.campId
    const stepSeq = req.body.stepCount
    let domainLinks = req.body.domainLinks
    const userId = req.body.userId
    const campRunningType = req.body.campRunningType
    const sentTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    let connection;

    console.log('stepSeq',stepSeq);
    console.log('receiversEmails',receiversEmails)
    console.log('emailDelay',emailDelay)
    console.log('Domain Links', domainLinks);
    console.log("Sender Names",senderNames)
    console.log("sendersEmails",sendersEmails)

 
    try{
        connection = await dbConnection.getConnection();
        const insertEmailQuery = 'INSERT INTO emailsdata (sender_email, receiver_email, subject, pretext, emailBody, trackingId, campId, messageId,firstMailCount,followUpMailCount,mailSequence,emailType,threadId,domainName,leads,userId,sentTime) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        const insertThreadQuery = 'INSERT INTO threads (campId, receiverEmails) VALUES (?, ?)';
        const emailsPerSender = Math.ceil(receiversEmails.length / sendersEmails.length);
        
        // const dateToSend = new Date();
        // dateToSend.setMinutes(dateToSend.getMinutes() + dateToSend.getTimezoneOffset() + (5 * 60 + 30)); // Adjust for IST (UTC+5:30)
        // dateToSend.setDate(dateToSend.getDate() + emailDelay);
        // const dateToSend = moment().tz("Asia/Kolkata").add(emailDelay, 'minutes').toDate();
        // let dateToSend;
        
        // const ISTOffset = 330; 

       

            // now.setMinutes(now.getMinutes() + 1);
            // dateToSend = now.toISOString().replace('T', ' ').substring(0, 19);
        //     for (let i = 0; i < sendersEmails.length; i++){
        //         let sender;
        //         if(campRunningType === "quickCampaign"){
        //             sender = sendersEmails[i].sender_email_id
        //         }else{
        //             sender = sendersEmails[i];
        //         }
        //         console.log("sender",sender)
        //         const senderName = senderNames[i].sender_name;
        //         console.log("senderName",senderName)
        //         const start = i * emailsPerSender;
        //         const end = (i + 1) === sendersEmails.length ? undefined : (i + 1) * emailsPerSender;
        //         const receiversForSender = receiversEmails.slice(start, end);

        //         const tokens = await getTokensForSender(sender,connection);
        //         console.log('tokens',tokens);
               
        //         const oauth2Client = new google.auth.OAuth2(
        //             process.env.Client_ID, 
        //             process.env.Client_secret, 
        //             process.env.REDIRECT_URI 
        //           );
                
        //           oauth2Client.setCredentials({
        //             refresh_token: tokens.refreshToken
        //         });

        //         const accessToken = oauth2Client.getAccessToken()
        //         console.log('Surpasses accessToken') 
        //         let transporter = nodemailer.createTransport({
        //             service: "gmail", 
        //             auth: { 
        //                 type: "OAuth2", 
        //                 user: sender,
        //                 accessToken: accessToken,
        //                 clientId: process.env.Client_ID,
        //                 clientSecret: process.env.Client_secret, 
        //                 refreshToken: tokens.refreshToken
                       
        //             }, 
        //         })

        //         for (const [index, receiver] of receiversForSender.entries()){
        //             console.log('receiver',receiver)
        //             try{
        //                 let isFirstEmail = (stepSeq === 1);
        //                 if (!isFirstEmail) {
        //                     // Check if the contact has already replied before sending a follow-up
        //                     const replied = await hasContactReplied(campId, receiver, connection);
        //                     if (replied) {
        //                         console.log(`Skipping follow-up for ${receiver} as they have already replied.`);
        //                         continue; 
        //                     }
        //                 }
        //                 let messageId;
        //                 let latestEmail;
        //                 let headers;
        //                 let domainLink;
        //                 const trackingId = uuid.v4();
        //                 let emailBodyWithReplacements = emailBody; 
        //                 let individualSubject = subject;
        //                 const domain = domains[start + index]; 
        //                 const lead = leads[start + index];  
                       
                        
        //                 console.log('isFirstEmail',isFirstEmail) 
        //                 if(isFirstEmail) { 
        //                     messageId = `<${uuid.v4()}@${domain}>`;
        //                     headers = {
        //                         'Message-ID': messageId,
        //                         'X-Custom-ID': messageId
        //                     };
                           
        //                     const receiverName = receiverNames[start + index];
        //                     domainLink = domainLinks[start+index]
        //                     individualSubject = individualSubject.replace("{{DOMAIN}}", domain); 
        //                     emailBodyWithReplacements = emailBodyWithReplacements.replace("{{DOMAIN}}", domain);
        //                     emailBodyWithReplacements = emailBodyWithReplacements.replace("{{SENDER_NAME}}", senderName);
        //                     emailBodyWithReplacements = emailBodyWithReplacements.replace("{{NAME}}", receiverName);
        //                 }else{
        //                     messageId = `<${uuid.v4()}@${domain}>`;
                            
        //                     try {
        //                         latestEmail = await getDetails(campId, receiver, connection);
        //                         individualSubject =  `Re: ${latestEmail.subject}`;
        //                         if (latestEmail && latestEmail.messageId) {
                                    
        //                             headers = {
        //                                 'Message-ID': messageId,
        //                                 'X-Custom-ID': messageId ,
        //                                 'In-Reply-To': latestEmail.messageId,
                                        
        //                             }
        //                         }
        //                     } catch (error) {
        //                         console.error('Error fetching latest email:', error);
        //                     }
        //             }

        //                 emailBodyWithReplacements = `${emailBodyWithReplacements}<img src="https://crmapi.namekart.com/mailTrack?trackingId=${trackingId}&campId=${campId}" width="1" height="1" alt="" >`;
        //                 if(isFirstEmail){
        //                     emailBodyWithReplacements = `${emailBodyWithReplacements}<img src="https://crmapi.namekart.com/mailTrack?trackingId=${trackingId}&campId=${campId}" width="1" height="1" alt="" ><a href="http://localhost:3000/unsubscribe/${campId}/${messageId}">Click here for Unsubscribe</a>`;
        //                     if(domainLink){
        //                         const domainLinkEncoded = encodeURIComponent(domainLink); 
        //                         console.log(domainLinkEncoded)
        //                         emailBodyWithReplacements = `${emailBodyWithReplacements}<img src="https://crmapi.namekart.com/mailTrack?trackingId=${trackingId}&campId=${campId}" width="1" height="1" alt="" ><a href="http://localhost:3000/unsubscribe/${campId}/${messageId}">Click here for Unsubscribe</a><br><a href="http://localhost:3000/domainLink/${campId}/${messageId}/${domainLinkEncoded}">Domain Link</a>`;
        //                     }
                            
        //                 }
        //                 await delay(1000);
        //                 try {
        //                       transporter.sendMail({
        //                         from: sender,
        //                         to: receiver,
        //                         subject: individualSubject,
        //                         text: pretext,
        //                         html: emailBodyWithReplacements,
        //                         headers: headers
        //                     },async (err,result)=>{
        //                         if(err){
        //                             console.log('Error in sending mail',err)
        //                         }else{
        //                             console.log(result)
        //                             if(result.rejected.length!==0){
        //                                 await updateBouncedMails(messageId);
        //                             }
        //                         }
        //                     });
        
        //                 console.log('Email sent ');
        //                 } catch (err) {
        //                     console.log('Error sending email:', err);
        //                     const results = await updateBouncedMails(messageId);
        //                     console.log('Mail bounce status updated successfully.', results);
        //                 }
        
        //                 try {
        //                     if(isFirstEmail){
        //                         const threadResult = await new Promise((resolve, reject) => {
        //                             connection.query(insertThreadQuery, [campId, receiver], (threadErr, threadResults) => {
        //                                 if (threadErr) {
        //                                     console.error('Error in thread table query', threadErr);
        //                                     reject(threadErr);
        //                                 } else {
        //                                     console.log('Thread data saved successfully.');
        //                                     resolve(threadResults);
        //                                 }
        //                             });
        //                         });

        //                         const threadId = threadResult.insertId;
        //                         messageId = messageId.replace(/^<|>$/g, '');
        //                         const $ = cheerio.load(emailBodyWithReplacements);
        //                         const emailText = $('body').text();
        //                         await connection.query(insertEmailQuery, [sender, receiver, individualSubject, pretext, emailText, trackingId, campId, messageId, 1,0,'FirstMail','sent',threadId, domain,lead, userId,sentTime], (err, results) => {
        //                             if (err) {
        //                                 console.error('Error in emailsdata query', err);
        //                                 throw err; 
        //                             } else {
        //                                 console.log('result',results)
        //                                 console.log('Email sent and saved');
        //                             }
        //                         }); 

        //                     }else{
        //                         try {
                                    
        //                             const threadId = await getThreadIdForFollowUp(campId, receiver, connection);
        //                             const $ = cheerio.load(emailBodyWithReplacements);
        //                             const emailText = $('body').text();
        //                             if (threadId) {
                                        
        //                                 await connection.query(insertEmailQuery, [sender, receiver, individualSubject, pretext, emailText, trackingId, campId, messageId, 0, 1, 'FollowUpMail', 'sent', threadId, domain, lead, userId,sentTime], (emailErr, emailResults) => {
        //                                     if (emailErr) {
        //                                         console.error('Error in emailsdata query for follow-up:', emailErr);
        //                                         throw emailErr;
        //                                     } else {
        //                                         console.log('Follow-up email sent and saved with threadId:', threadId);
        //                                     }
        //                                 });
        //                             } else {
        //                                 console.log('No threadId found for follow-up, creating a new thread');
        //                             }
        //                         } catch (err) {
        //                             console.error('Error handling follow-up email:', err);
        //                         }
        //                     }
                            
        //                 } catch (err) {
        //                     console.log('Database operation failed', err);
        //                 }
                        
        //                 try{

        //                     const results = await incrementSentEmailCount(campId,connection);
        //                     console.log(`Sent email count updated successfully for campaign ID: ${campId}`, results);

        //                 } catch (error) {

        //                     console.error('Error updating sent email count:', error);

        //                 }

        //                 console.log('Email sent to ' + receiver + ' from ' + sender);

        //             }catch(err){
        //                 console.error('Error sending email:', err);
        //         }
        //     }
        // }

        //     res.status(200).send('Email has sent')  
        let startTime;
        
        if(emailDelay===0){
            startTime = new Date(Date.now() + 5000);
        }else{
            startTime = new Date(Date.now() + emailDelay * 24 * 60 * 60 * 1000);
        }

        console.log('startTime',startTime)
        schedule.scheduleJob(startTime,async () => {
            for (let i = 0; i < sendersEmails.length; i++){
                let sender;
                if(campRunningType === "quickCampaign"){
                    sender = sendersEmails[i].sender_email_id
                }else{
                    sender = sendersEmails[i];
                }
                console.log("sender",sender)
                const senderName = senderNames[i].sender_name;
                console.log("senderName",senderName)
                const start = i * emailsPerSender;
                const end = (i + 1) === sendersEmails.length ? undefined : (i + 1) * emailsPerSender;
                const receiversForSender = receiversEmails.slice(start, end);

                const tokens = await getTokensForSender(sender,connection);
                console.log('tokens',tokens);
                // let accessToken;
                let gmail;

                try{
                    const oauth2Client = new google.auth.OAuth2(
                        process.env.Client_ID2, 
                        process.env.Client_secret2, 
                        process.env.REDIRECT_URI 
                      );
                    
                      oauth2Client.setCredentials({
                        refresh_token: tokens.refreshToken
                    });
                    gmail = google.gmail({ version: 'v1', auth: oauth2Client });
                    // accessToken = oauth2Client.getAccessToken()
                    console.log("OAuth client and access token setup complete.")

                }catch(err){
                    console.log("Error in generating access token due to expiry of refresh token",err)
                    continue;
                }
               
                 
                console.log('Surpasses accessToken') 
                // let transporter = nodemailer.createTransport({
                //     service: "gmail", 
                //     auth: { 
                //         type: "OAuth2", 
                //         user: sender,
                //         accessToken: accessToken,
                //         clientId: process.env.Client_ID,
                //         clientSecret: process.env.Client_secret, 
                //         refreshToken: tokens.refreshToken
                       
                //     }, 
                // })

                

                for (const [index, receiver] of receiversForSender.entries()){
                    console.log('receiver',receiver)
                    try{
                        let isFirstEmail = (stepSeq === 1);
                        if (!isFirstEmail) {
                            // Check if the contact has already replied before sending a follow-up
                            const replied = await hasContactReplied(campId, receiver, connection);
                            if (replied) {
                                console.log(`Skipping follow-up for ${receiver} as they have already replied.`);
                                continue; 
                            }
                        }
                        let messageId;
                        let latestEmail;
                        let headers;
                        let domainLink;
                        const trackingId = uuid.v4();
                        let emailBodyWithReplacements = emailBody; 
                        let individualSubject = subject;
                        const domain = domains[start + index]; 
                        const lead = leads[start + index];  
                       
                        
                        console.log('isFirstEmail',isFirstEmail) 
                        if(isFirstEmail) { 
                            messageId = `<${uuid.v4()}@${domain}>`;
                            headers = {
                                'Message-ID': messageId,
                                'X-Custom-ID': messageId
                            };
                           
                            const receiverName = receiverNames[start + index];
                            domainLink = domainLinks[start+index]
                            individualSubject = individualSubject.replace(/{{DOMAIN}}/g, domain); 
                            emailBodyWithReplacements = emailBodyWithReplacements.replace(/{{DOMAIN}}/g, domain);
                            emailBodyWithReplacements = emailBodyWithReplacements.replace(/{{SENDER_NAME}}/g, senderName);
                            emailBodyWithReplacements = emailBodyWithReplacements.replace(/{{NAME}}/g, receiverName);
                        }else{
                            messageId = `<${uuid.v4()}@${domain}>`;
                            
                            try {
                                latestEmail = await getDetails(campId, receiver, connection);
                                individualSubject =  `Re: ${latestEmail.subject}`;
                                if (latestEmail && latestEmail.messageId) {
                                    
                                    headers = {
                                        'Message-ID': messageId,
                                        'X-Custom-ID': messageId ,
                                        'In-Reply-To': latestEmail.messageId,
                                        
                                    }
                                }
                            } catch (error) {
                                console.error('Error fetching latest email:', error);
                            }
                    }

                        emailBodyWithReplacements = `${emailBodyWithReplacements}<img src="https://crmapi.namekart.com/mailTrack?trackingId=${trackingId}&campId=${campId}" width="1" height="1" alt="" >`;
                        if(isFirstEmail){
                            emailBodyWithReplacements = `${emailBodyWithReplacements}<img src="https://crmapi.namekart.com/mailTrack?trackingId=${trackingId}&campId=${campId}" width="1" height="1" alt="" ><a href="https://app.namekart.com/crm/unsubscribe/${campId}/${messageId}">Click here for Unsubscribe</a>`;
                            if(domainLink){
                                const domainLinkEncoded = encodeURIComponent(domainLink); 
                                console.log(domainLinkEncoded)
                                emailBodyWithReplacements = `${emailBodyWithReplacements}<img src="https://crmapi.namekart.com/mailTrack?trackingId=${trackingId}&campId=${campId}" width="1" height="1" alt="" ><a href="https://app.namekart.com/crm/unsubscribe/${campId}/${messageId}">Click here for Unsubscribe</a><br><a href="https://app.namekart.com/crm/domainLink/${campId}/${messageId}/${domainLinkEncoded}">Domain Link</a>`;
                            }
                            
                        }
                        const randomNumber = randomNumberGenerator(1, 6);
                        await delay(randomNumber*1000);
                        console.log("randomNumber*1000",randomNumber*1000)

                        try {

                            //   transporter.sendMail({
                            //     from: sender,
                            //     to: receiver,
                            //     subject: individualSubject,
                            //     text: pretext,
                            //     html: emailBodyWithReplacements,
                            //     headers: headers
                            // },async (err,result)=>{
                            //     if(err){
                            //         console.log('Error in sending mail',err)
                            //     }else{
                            //         console.log(result)
                            //         if(result.rejected.length!==0){
                            //             await updateBouncedMails(messageId);
                            //         }
                            //     }
                            // });
                            console.log("Before emails")
                            let email = {
                                sender: sender,
                                receiver: receiver,
                                subject: individualSubject,
                                body: emailBodyWithReplacements,
                                headers: headers
                            }
                            console.log("After emails")
                            const emailContent =  createEmailContent(email)
                            console.log("After email content")
                            const result = await sendEmail(emailContent,gmail);
                            console.log("result",result)
        
                            console.log('Email sent ');

                        } catch (err) {
                            console.log('Error sending email:', err);
                            const results = await updateBouncedMails(messageId);
                            console.log('Mail bounce status updated successfully.', results);
                        }
        
                        try {
                            if(isFirstEmail){
                                const threadResult = await new Promise((resolve, reject) => {
                                    connection.query(insertThreadQuery, [campId, receiver], (threadErr, threadResults) => {
                                        if (threadErr) {
                                            console.error('Error in thread table query', threadErr);
                                            reject(threadErr);
                                        } else {
                                            console.log('Thread data saved successfully.');
                                            resolve(threadResults);
                                        }
                                    });
                                });

                                const threadId = threadResult.insertId;
                                messageId = messageId.replace(/^<|>$/g, '');
                                const $ = cheerio.load(emailBodyWithReplacements);
                                const emailText = $('body').text();
                                await connection.query(insertEmailQuery, [sender, receiver, individualSubject, pretext, emailText, trackingId, campId, messageId, 1,0,'FirstMail','sent',threadId, domain,lead, userId, sentTime], (err, results) => {
                                    if (err) {
                                        console.error('Error in emailsdata query', err);
                                        throw err; 
                                    } else {
                                        console.log('result',results)
                                        console.log('Email sent and saved');
                                    }
                                }); 

                            }else{
                                try {
                                    
                                    const threadId = await getThreadIdForFollowUp(campId, receiver, connection);
                                    const $ = cheerio.load(emailBodyWithReplacements);
                                    const emailText = $('body').text();
                                    if (threadId) {
                                        
                                        await connection.query(insertEmailQuery, [sender, receiver, individualSubject, pretext, emailText, trackingId, campId, messageId, 0, 1, 'FollowUpMail', 'sent', threadId, domain, lead, userId, sentTime], (emailErr, emailResults) => {
                                            if (emailErr) {
                                                console.error('Error in emailsdata query for follow-up:', emailErr);
                                                throw emailErr;
                                            } else {
                                                console.log('Follow-up email sent and saved with threadId:', threadId);
                                            }
                                        });
                                    } else {
                                        console.log('No threadId found for follow-up, creating a new thread');
                                    }
                                } catch (err) {
                                    console.error('Error handling follow-up email:', err);
                                }
                            }
                            
                        } catch (err) {
                            console.log('Database operation failed', err);
                        }
                        
                        try{

                            const results = await incrementSentEmailCount(campId,connection);
                            console.log(`Sent email count updated successfully for campaign ID: ${campId}`, results);

                        } catch (error) {

                            console.error('Error updating sent email count:', error);

                        }

                        console.log('Email sent to ' + receiver + ' from ' + sender);

                    }catch(err){
                        console.error('Error sending email:', err);
                }
            }
        }

            res.status(200).send('Email has sent')  
        })  
      
    }catch(err){

        console.error('Error in email Campaigning:', err);
        res.status(500).send({ error: 'Internal Server Error' });

    }finally{
        if(connection){
            connection.release();
        }
    }
}


module.exports = {
    sendEmails,
}

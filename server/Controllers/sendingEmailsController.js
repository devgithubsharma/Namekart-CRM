const nodemailer = require('nodemailer');
const dbConnection = require('../dbConnection'); 
const {google} = require('googleapis');
const cheerio = require('cheerio');
const uuid = require('uuid'); 
const juice = require('juice');
const { parse } = require('node-html-parser');
const {updateBouncedMails} = require('./updateBouncedMailsControllers')

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


const sendEmails = async (req,res) => {
    
    const campaign_type = "Manual"
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
    let connection;

    console.log('stepSeq',stepSeq);
    console.log('receiversEmails',receiversEmails)
    console.log('emailDelay',emailDelay)
    console.log('Domain Links', domainLinks);

 
    try{
        connection = await dbConnection.getConnection();
        const insertEmailQuery = 'INSERT INTO emailsdata (sender_email, receiver_email, subject, pretext, emailBody, trackingId, campId, messageId,firstMailCount,followUpMailCount,mailType,emailType,threadId,domainName,leads) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        const insertThreadQuery = 'INSERT INTO threads (campId, receiverEmails) VALUES (?, ?)';
        const emailsPerSender = Math.ceil(receiversEmails.length / sendersEmails.length);
        

        setTimeout(async () => {
            for (let i = 0; i < sendersEmails.length; i++){
                const sender = sendersEmails[i].sender_email_id;
                const senderName = senderNames[i].sender_name;
                const start = i * emailsPerSender;
                const end = (i + 1) === sendersEmails.length ? undefined : (i + 1) * emailsPerSender;
                const receiversForSender = receiversEmails.slice(start, end);

                const tokens = await getTokensForSender(sender,connection);
                console.log('tokens',tokens);
               
                const oauth2Client = new google.auth.OAuth2(
                    process.env.Client_ID, 
                    process.env.Client_secret, 
                    process.env.REDIRECT_URI 
                  );
                
                  oauth2Client.setCredentials({
                    refresh_token: tokens.refreshToken
                });

                const accessToken = oauth2Client.getAccessToken()
                console.log('Surpasses accessToken') 
                let transporter = nodemailer.createTransport({
                    service: "gmail", 
                    auth: { 
                        type: "OAuth2", 
                        user: sender,
                        accessToken: accessToken,
                        clientId: process.env.Client_ID,
                        clientSecret: process.env.Client_secret, 
                        refreshToken: tokens.refreshToken
                       
                    }, 
                })


                for (const [index, receiver] of receiversForSender.entries()){
                    console.log('receiver',receiver)
                    try{
                        let isFirstEmail = (stepSeq === 1);
                        if (!isFirstEmail) {
                            // Check if the contact has already replied before sending a follow-up
                            const replied = await hasContactReplied(campId, receiver, connection);
                            if (replied) {
                                console.log(`Skipping follow-up for ${receiver} as they have already replied.`);
                                continue; // Skip sending follow-up for this receiver
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
                            messageId = `${uuid.v4()}`;
                            headers = {
                                'Message-ID': messageId,
                            };
                           
                            const receiverName = receiverNames[start + index];
                            
                            domainLink = domainLinks[start+index]
                            individualSubject = individualSubject.replace("{{DOMAIN}}", domain); 
                            emailBodyWithReplacements = emailBodyWithReplacements.replace("{{DOMAIN}}", domain);
                            emailBodyWithReplacements = emailBodyWithReplacements.replace("{{SENDER_NAME}}", senderName);
                            emailBodyWithReplacements = emailBodyWithReplacements.replace("{{NAME}}", receiverName);
                        }else{
                            messageId = `${uuid.v4()}`;
                            
                            try {
                                latestEmail = await getDetails(campId, receiver, connection);
                                individualSubject =  `Re: ${latestEmail.subject}`;
                                if (latestEmail && latestEmail.messageId) {
                                    
                                    headers = {
                                        'Message-ID': messageId,
                                        'In-Reply-To': latestEmail.messageId,
                                        'References': latestEmail.messageId + " " + messageId, 
                                    }
                                }
                            } catch (error) {
                                
                                console.error('Error fetching latest email:', error);
                            }
                    }

                        let emailBodyWithTrackingPixel = `${emailBodyWithReplacements}<img src=" https://api.auctionhacker.com/mailTrack?trackingId=${trackingId}&campId=${campId}" width="1" height="1" alt="" >`;
                        if(isFirstEmail && domainLink){
                            emailBodyWithTrackingPixel = `${emailBodyWithReplacements}<img src=" https://api.auctionhacker.com/mailTrack?trackingId=${trackingId}&campId=${campId}" width="1" height="1" alt="" ><a href=" http://localhost:3000/unsubscribe/${campId}/${messageId}">Click here for Unsubscribe</a>`;
                            const domainLinkEncoded = encodeURIComponent(domainLink); 
                            console.log(domainLinkEncoded)
                            emailBodyWithTrackingPixel = `${emailBodyWithReplacements}<img src=" https://api.auctionhacker.com/mailTrack?trackingId=${trackingId}&campId=${campId}" width="1" height="1" alt="" ><a href="http://localhost:3000/unsubscribe/${campId}/${messageId}">Click here for Unsubscribe</a><br><a href="http://localhost:3000/domainLink/${campId}/${messageId}/${domainLinkEncoded}">Domain Link</a>`;
                        }
                        
                        try {
                             transporter.sendMail({
                                from: sender,
                                to: receiver,
                                subject: individualSubject,
                                text: pretext,
                                html: emailBodyWithTrackingPixel,
                                headers: headers
                            },async (err,result)=>{
                                if(err){
                                    console.log('Error in sending mail',err)
                                }else{
                                    console.log(result)
                                    if(result.rejected.length!==0){
                                        await updateBouncedMails(messageId);
                                    }
                                }
                            });
        
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

                                await connection.query(insertEmailQuery, [sender, receiver, individualSubject, pretext, emailBodyWithReplacements, trackingId, campId, messageId, 1,0,'FirstMail','SentMail',threadId, domains,lead], (err, results) => {
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
                                    // Fetch the threadId for the follow-up email
                                    const threadId = await getThreadIdForFollowUp(campId, receiver, connection);
                                    if (threadId) {
                                        
                                        await connection.query(insertEmailQuery, [sender, receiver, individualSubject, pretext, emailBodyWithReplacements, trackingId, campId, messageId, 0, 1, 'FollowUpMail', 'SentMail', threadId], (emailErr, emailResults) => {
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
        },emailDelay)
        connection.release();

    }catch(err){

        console.error('Error in email Campaigning:', err);
        connection.release();
        res.status(500).send({ error: 'Internal Server Error' });
    }
}


module.exports = {
    sendEmails,
}

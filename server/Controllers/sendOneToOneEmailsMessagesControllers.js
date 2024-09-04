const dbConnection = require('../dbConnection');
const uuid = require('uuid'); 
const {google} = require('googleapis');
const nodemailer = require('nodemailer');
const { format } = require('date-fns');

let accessTokenCache = {};
let startTime;
let endTime;

function storeToken(senderEmail, token, expiry, refreshToken) {
    return new Promise((resolve, reject) => {
        try {
            accessTokenCache[senderEmail] = {
                token: token,
                expiry: Date.now() + expiry * 1000,
                refreshToken: refreshToken
            };
            console.log(`Token stored for ${senderEmail}:`, accessTokenCache[senderEmail]);
            resolve();
        } catch (error) {
            console.error(`Error storing token for ${senderEmail}:`, error);
            reject(error);
        }
    });
}

function getCachedAccessToken(senderEmail) {
    const tokenInfo = accessTokenCache[senderEmail];
    if (tokenInfo && tokenInfo.expiry > Date.now()) {
        return tokenInfo.token;
    }
    return null; 
}

function getRefreshToken(senderEmail) {
    const tokenInfo = accessTokenCache[senderEmail];
    if (tokenInfo) {
        return tokenInfo.refreshToken;
    }
    return null; // Refresh token not found
}

function saveEmailData(emailData, connection) {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO emailsdata (messageId, sender_email, receiver_email, subject, emailBody, sentTime, campId, threadId, domainName,mailsCount,emailType,leads,userId,isRepliedMail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [emailData.messageId, emailData.sender_email, emailData.receiver_email, emailData.subject, emailData.emailBody, emailData.sentTime, emailData.campId, emailData.threadId, emailData.domainName,1,'sent',emailData.lead,emailData.userId,emailData.isRepliedMail];
        connection.query(sql, values, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

async function getAccessToken(oauth2Client,connection,sender_email) {
    startTime = performance.now();
    const cachedToken = await getCachedAccessToken(sender_email);
    endTime = performance.now();
    console.log(`Execution time for getCachedAccessToken: ${endTime - startTime} milliseconds`);

    startTime = performance.now();
    let refreshToken = await getRefreshToken(sender_email);
    endTime = performance.now();
    console.log(`Execution time for getRefreshToken: ${endTime - startTime} milliseconds`);

    console.log("cachedToken",cachedToken)
    console.log("refreshToken",refreshToken)

    if (cachedToken && refreshToken) {
        return {accessToken:cachedToken, refreshToken:refreshToken};
    } else {
        console.log("coming in else")
        if(refreshToken){
            startTime = performance.now();
            oauth2Client.setCredentials({
                refresh_token: refreshToken
            });

            const { token } = await oauth2Client.getAccessToken();
            storeToken(sender_email, token, 3500,refreshToken).then(()=>{}).catch((err)=>{console.log('Getting error inn store token function',err)})
            endTime = performance.now();
            console.log(`Execution time for if refreshToken: ${endTime - startTime} milliseconds`);
            return {accessToken:token, refreshToken:refreshToken};

        }else{
            startTime = performance.now();
            const tokens = await getTokensForSender(sender_email, connection);
            oauth2Client.setCredentials({
                refresh_token: tokens.refreshToken
            });
            const { token }  = await oauth2Client.getAccessToken();
            storeToken(sender_email, token, 3500,tokens.refreshToken).then(()=>{}).catch((err)=>{console.log('Getting error inn store token function',err)})
            endTime = performance.now();
            console.log(`Execution time for else refreshToken: ${endTime - startTime} milliseconds`);
            return {accessToken:token, refreshToken:tokens.refreshToken};
        }  
    }
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
            })
        })
    } catch (error) {
      console.error('Database error in getTokensForSender:', error);
      throw error; 
    } 
  };


const getMessageDetails = async (email_id) => {
    let connection;
    try {
        connection = await dbConnection.getConnection();
    } catch (error) {
        console.error("Error getting database connection:", error);
        throw error;
    }
    return new Promise((resolve, reject) => {
        const latestEmailQuery = "SELECT * FROM emailsdata WHERE email_id = ?";
        connection.query(latestEmailQuery, [email_id], (error, results) => {
            if (error) {
                console.error("Database error in getDetails:", error);
                reject(error);
            } else {
                const latestEmail = results.length > 0 ? results[0] : null;
                console.log("Latest email fetched successfully");
                resolve(latestEmail);
            }
        });
    });
};


const sendMessage = async (req, res) => {
    // const sender_email = req.body.sender_email
    // const receiver_email = req.body.receiver_email
    // const subject = req.body.subject
    // const emailBody = req.body.emailBody
    // const campId = req.body.campId
    // const threadId = req.body.threadId
    // const domainName = req.body.domainName
    // const lead = req.body.lead
    // const replyMessageId = req.body.messageId;
    // const userId = req.body.userId

    const {message,email_id, userId} = req.body;
    const messageDetails = await getMessageDetails(email_id);

    const sender_email = messageDetails.sender_email
    const receiver_email = messageDetails.receiver_email
    const subject = messageDetails.subject
    const emailBody = message
    const campId = messageDetails.campId
    const threadId = messageDetails.threadId
    const domainName = messageDetails.domainName
    const lead = messageDetails.lead
    const replyMessageId = messageDetails.messageId;

    let messageId = `<${uuid.v4()}@${domainName}>`;
    const sentTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    let connection;

    try {
        startTime = performance.now();
        connection = await dbConnection.getConnection();
        endTime = performance.now();
        console.log(`Execution time for dbConnection: ${endTime - startTime} milliseconds`);

        startTime = performance.now();
        const oauth2Client = new google.auth.OAuth2(
            process.env.Client_ID2,
            process.env.Client_secret2,
            process.env.REDIRECT_URI
        );
        endTime = performance.now();
        console.log(`Execution time for google.auth.OAuth2: ${endTime - startTime} milliseconds`);

        startTime = performance.now();
        const tokens = await getAccessToken(oauth2Client,connection,sender_email)
        endTime = performance.now();
        console.log(`Execution time for getAccessToken: ${endTime - startTime} milliseconds`);

        console.log("tokens",tokens)
        console.log("accessToken",tokens.accessToken)

        startTime = performance.now();
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: sender_email,
                accessToken: tokens.accessToken,
                clientId: process.env.Client_ID,
                clientSecret: process.env.Client_secret,
                refreshToken: tokens.refreshToken
            }
        });
        endTime = performance.now();
        console.log(`Execution time for nodemailer.createTransport: ${endTime - startTime} milliseconds`);

        
        const mailOptions = {
            from: sender_email,
            to: receiver_email,
            subject: subject,
            html: `<p>${emailBody}</p>`, 
            headers: {
                'Message-ID': messageId,
                'In-Reply-To': replyMessageId, 
                'References': replyMessageId 
            }
        };

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                res.status(500).send({ error: 'Failed to send email' });
            } else {
                console.log('Email sent:', info.response);
                messageId = messageId.replace(/^<|>$/g, '');

                startTime = performance.now();
                await saveEmailData({
                    messageId,
                    sender_email,
                    receiver_email,
                    subject,
                    emailBody,
                    sentTime,
                    campId,
                    threadId,
                    domainName,
                    lead,
                    userId,
                    isRepliedMail: true,
                }, connection);
                endTime = performance.now();
                console.log(`Execution time for saveEmailData: ${endTime - startTime} milliseconds`);
                res.status(200).send('Email sent successfully');
            }
        });

    } catch (err) {
        console.error('Error in sending message:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    sendMessage // Export the new function
};
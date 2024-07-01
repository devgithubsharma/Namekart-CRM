const { google } = require('googleapis');
const dbConnection = require('../dbConnection'); 

const CLIENT_ID = '779579592103-k49itcp2h105m057v4o5vfbm7pphb8c5.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
// const REFRESH_TOKEN = 'YOUR_REFRESH_TOKEN';

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



function createEmailContent(email) {
    const { sender, receiver, subject, body } = email;
    const emailLines = [
        `From: ${sender}`,
        `To: ${receiver}`,
        'Content-type: text/html;charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${subject}`,
        '',
        body
    ];
    return emailLines.join('\r\n').trim();
}

async function sendEmail(emailContent,gmail) {
    const base64Email = Buffer.from(emailContent).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: base64Email
        }
    });
    return response;
}

const sendBulkEmails = async (req,res) => {
    const emails = req.body.emails;
    const results = [];
    let connection;
    for (const email of emails) {
        try{
            connection = await dbConnection.getConnection();
            const tokens = await getTokensForSender(email.sender,connection);
            const oauth2Client = new google.auth.OAuth2(
                CLIENT_ID,
                CLIENT_SECRET,
                REDIRECT_URI
            );
            oauth2Client.setCredentials({
                refresh_token: tokens.refreshToken
            });
            const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
            const emailContent = createEmailContent(email);
            const result = await sendEmail(emailContent,gmail);
            console.log("result",result)
            results.push(result);
        }catch(err){
            console.log(err)
        }
        
    }
    res.json(results)
}

module.exports = {
    sendBulkEmails,
}
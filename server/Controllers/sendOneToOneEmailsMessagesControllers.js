const dbConnection = require('../dbConnection');
const uuid = require('uuid'); 


function saveEmailData(emailData, connection) {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO emailsdata (messageId, sender_email, receiver_email, subject, emailBody, sentTime, campId, threadId, domainName,mailsCount,emailType,leads) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [emailData.messageId, emailData.sender_email, emailData.receiver_email, emailData.subject, emailData.emailBody, emailData.sentTime, emailData.campId, emailData.threadId, emailData.domainName,1,'sent',emailData.lead];

        connection.query(sql, values, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

const sendMessage = async (req, res) => {
    const sender_email = req.body.sender_email
    const receiver_email = req.body.receiver_email
    const subject = req.body.subject
    const emailBody = req.body.emailBody
    const campId = req.body.campId
    const threadId = req.body.threadId
    const domainName = req.body.domainName
    const lead = req.body.lead
    const messageId = uuid.v4()
    const sentTime = new Date().toISOString(); // Generate sent time in ISO format

    let connection;

    try {
        connection = await dbConnection.getConnection();
        const tokens = await getTokensForSender(sender_email, connection);

        const oauth2Client = new google.auth.OAuth2(
            process.env.Client_ID,
            process.env.Client_secret,
            process.env.REDIRECT_URI
        );

        oauth2Client.setCredentials({
            refresh_token: tokens.refreshToken
        });

        const accessToken = await oauth2Client.getAccessToken();
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: sender_email,
                accessToken: accessToken,
                clientId: process.env.Client_ID,
                clientSecret: process.env.Client_secret,
                refreshToken: tokens.refreshToken
            }
        });

        const mailOptions = {
            from: sender_email,
            to: receiver_email,
            subject: subject,
            // text: messageBody,
            html: `<p>${emailBody}</p>` // Simple HTML email content
        };

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                res.status(500).send({ error: 'Failed to send email' });
            } else {
                console.log('Email sent:', info.response);
                // Save email data to database
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
                    lead
                }, connection);
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
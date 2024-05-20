const dbConnection = require('../dbConnection'); 

function insertData(connection, senderEmail, receiver_email, textBody, campId, messageId, threadId) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO emailsdata (sender_email, receiver_email, emailBody, campId ,messageId, emailType, threadId) VALUES (?, ?, ?, ?, ?, ?, ?)';
        connection.query(query, [senderEmail, receiver_email, textBody, campId, messageId, 'sent', threadId], (err, results) => {
            console.log('results', results);
            if (err) {
                console.log('Error in insertData', err);
                reject(new Error('Error in insertData: ' + err.message));
            } else if (results.affectedRows > 0) { 
                resolve({
                    response: "Email Data inserted"  
                });
            } else {
                reject(new Error('No rows inserted in insertData'));
            }
        });
    });
}

function getThreadIdByReceiverEmail(connection, receiver_email) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT threadId FROM emailsdata WHERE receiver_email = ?';
        connection.query(query, [receiver_email], (err, results) => {
            if (err) {
                console.error('Error in getThreadIdByReceiverEmail:', err);
                reject(err);
            } else {
                if (results.length > 0) {
                    resolve(results[0].threadId); 
                } else {
                    resolve(null); 
                }
            }
        });
    });
}

function getCampIdByThreadId(connection, threadId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT campId FROM threads WHERE threadId = ?';
        connection.query(query, [threadId], (err, results) => {
            if (err) {
                console.error('Error in getCampIdByThreadId:', err);
                reject(err);
            } else {
                if (results.length > 0) {
                    resolve(results[0].campId); 
                } else {
                    resolve(null); 
                }
            }
        });
    });
}

function getSubjectByCampIdAndReceiverEmail(connection, campId, receiver_email) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT subject FROM emailsdata WHERE campId = ? AND receiver_email = ?';
        connection.query(query, [campId, receiver_email], (err, results) => {
            if (err) {
                console.error('Error in getSubjectByCampIdAndReceiverEmail:', err);
                reject(err);
            } else {
                if (results.length > 0) {
                    resolve(results[0].subject); 
                } else {
                    resolve(null); 
                }
            }
        });
    });
} 

const liveChattingEmails = async (req,res) => {
    console.log('liveChattingEmails')
    let connection;

    try{
        connection = await dbConnection.getConnection();
        const receiver_email = req.params.receiver_email;
        const email_body = req.params.email_body;
        const sender_email = req.params.sender_email;
        const messageId = uuid.v4();
        const threadId = await getThreadIdByReceiverEmail(connection, receiver_email);
        const campId = await getCampIdByThreadId(connection, threadId);
        const subject = await getSubjectByCampIdAndReceiverEmail(connection, campId, receiver_email);

        const textBody = htmlToText(email_body, {
            wordwrap: 130
            });

        const emailData = await insertData(connection, sender_email, receiver_email, subject, email_body, campId, messageId, threadId)
        console.log('emailData',emailData.response)

        const emailToSend = {
            From: sender_email, 
            To: receiver_email,
            Subject: subject,
            HtmlBody: email_body,
            TextBody: textBody,
            ReplyTo: "5946d2eaef15bb6f0bcdf1d36ed54f74@inbound.postmarkapp.com",
            MessageStream: "outbound",
            TrackLinks: "HtmlOnly",
            Headers: [{ Name: "X-Custom-Message-ID", Value: messageId }],
            Metadata: {
                    conversationId: messageId, 
                    threadId: threadId
                }
            }; 

            const response = await axios.post('https://api.postmarkapp.com/email', emailToSend, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Postmark-Server-Token': '4ea16963-e553-4652-957d-80b9f0d90b3e'  
                    }
                });
                  
            await connection.query('UPDATE emailsdata SET postmarkMessageId = ? WHERE receiver_email = ? AND messageId = ?', [response.MessageID, response.To, messageId]);
            
    }catch(err){
        console.error('Error updating email status:', err);

    }finally {
        if (connection) {
            connection.release(); 
        }
    }

}

module.exports = {
    liveChattingEmails
}


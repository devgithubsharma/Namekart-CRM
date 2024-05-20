const dbConnection = require('../dbConnection');

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


function insertReplyAsNewRow(connection, originalEmailDetails, mailMessageId , replyText, postmarkMessageId) {
    console.log('insertReplyAsNewRow')
    return new Promise((resolve, reject) => {
        const { sender_email, receiver_email, subject, campId, messageId, contactsReplied, mailType, threadId } = originalEmailDetails;
        const query = "INSERT INTO emailsdata (sender_email, receiver_email, subject, emailBody, campId, messageId, contactsReplied, mailType, emailType, threadId, postmarkMessageId) VALUES (?,?,?,?,?,?,?,?,?,?)";
        connection.query(query, [sender_email, receiver_email, subject, replyText, campId,  mailMessageId, contactsReplied, mailType, 'received', threadId, postmarkMessageId], (error, results) => {
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

const processedMessageIds = new Set();

const liveDetectRepliesStatus = async (req,res) => {
    console.log('liveDetectRepliesStatus')
    const event = req.body;
    console.log('Received webhook:', event);
    let connection;
    try{
        connection = await dbConnection.getConnection();

        const emailBody = event.HtmlBody; 
        const postmarkMessageId = event.MessageID
        console.log('emailBody',emailBody)
        const messageIdPattern = /Your Message ID: (\S+)/;
        console.log('messageIdPattern',messageIdPattern)
        const match = emailBody.match(messageIdPattern);
        console.log('match',match)

        let messageId;
        if (match) {
            messageId = match[1];
            console.log('Extracted hidden Message ID:', messageId);
        }

        messageId = messageId.replace('</p>', '')

        if (!messageId) {
            console.log('No Message ID found');
            res.status(400).send('No Message ID provided');
            return;
        }

        if (processedMessageIds.has(messageId)) {
            console.log('Message already processed:', messageId);
            res.status(200).send('Message already processed');
            return;
        }
        const replyText = event.StrippedTextReply; 
        console.log('messageId',messageId);

        if(messageId){
            console.log('Message Id ',messageId)
            await updateContactsRepliedInDatabase(messageId,connection);
            console.log('After updateContactsRepliedInDatabase')
            const originalEmailDetails = await getOriginalEmailDetails(connection, messageId);
            if(originalEmailDetails){
                await insertReplyAsNewRow(connection, originalEmailDetails, messageId, replyText, postmarkMessageId);
            }
            processedMessageIds.add(messageId); 
            res.status(200).send('Success');
        }

    }catch(err){
        console.log(err);
        res.status(500).send('Server error occurred');

    }finally {
        if (connection) {
            connection.release(); 
        }
    }
}

module.exports = {
    liveDetectRepliesStatus,
};

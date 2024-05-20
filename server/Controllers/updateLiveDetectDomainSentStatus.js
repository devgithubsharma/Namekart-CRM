const dbConnection = require('../dbConnection');

async function liveDetectSentStatus(event) {
    let connection;
    try {
        connection = await dbConnection.getConnection();
        const messageId = event.Metadata.conversationId;
        const status = event.RecordType;

        // Update the email status in the database
        await connection.query('UPDATE emailsdata SET mailsCount = ? WHERE messageId = ?', [1, messageId]);

        console.log(`Updated status for MessageID ${messageId} to ${status}`);
        // res.status(200).send('Webhook data processed successfully');
    } catch (error) {
        console.error('Error updating email status:', error);
        // Optionally handle the error, e.g., by logging it or sending a notification
    }finally {
        if (connection) {
            connection.release(); 
        }
    }
    

}

module.exports = {
    liveDetectSentStatus
}


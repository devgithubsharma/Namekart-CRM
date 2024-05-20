const dbConnection = require('../dbConnection');

async function liveDetectBounceStatus(event) {
    let connection;
        try {
            connection = await dbConnection.getConnection();
            const messageId = event.Metadata.conversationId;
            const status = event.RecordType;

            await dbConnection.query('UPDATE emailsdata SET mailBounced = ? WHERE messageId = ?', [status, messageId]);

            console.log(`Updated status for MessageID ${messageId} to ${status}`);
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
    liveDetectBounceStatus,
}

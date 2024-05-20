const dbConnection = require('../dbConnection');

async function liveDetectTrackingStatus(event) {
        let connection;
        try {
            connection = await dbConnection.getConnection();
            const messageId = event.Metadata.conversationId;
            const status = event.RecordType;

            // Update the email status in the database
            await connection.query('UPDATE emailsdata SET trackingStatus = ? WHERE messageId = ?', ['open', messageId]);

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
    liveDetectTrackingStatus,
}


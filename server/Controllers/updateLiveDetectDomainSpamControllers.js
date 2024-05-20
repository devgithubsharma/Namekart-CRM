const dbConnection = require('../dbConnection');

async function liveDetectSpam(event){
    console.log('liveDetectLinkClick')
    let connection;
    
    try{
        connection = await dbConnection.getConnection();
        const messageId = event.Metadata.conversationId;
        const status = event.RecordType;

        await connection.query('UPDATE emailsdata SET spam = ? WHERE messageId = ?', ['yes', messageId]);
        console.log(`Updated status for MessageID ${messageId} to ${status}`);

    }catch(err){
        console.error('Error updating email status:', err);
    }finally {
        if (connection) {
            connection.release(); 
        }
    }
}

module.exports = {
    liveDetectSpam,
}


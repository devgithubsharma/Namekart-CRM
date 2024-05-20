const dbConnection = require('../dbConnection');

async function liveDetectSubscriptionChange(event) {
    console.log('liveDetectSubscriptionChange')
    let connection;

    try{
        connection = await dbConnection.getConnection();
        
        const messageId = event.Metadata.conversationId;
        const status = event.RecordType;
        const suppReason = event.SuppressionReason;

        await connection.query('INSERT into suppression (suppressionReason, messageId) VALUES (?, ?)', [suppReason, messageId]);
        console.log(`Inserted status for MessageID ${messageId} to ${status}`)
        // res.send('Inserted status for MessageID ${messageId} to ${status}')

    }catch(err){
        console.error('Error in inserting subscription details:', err);

    }finally {
        if (connection) {
            connection.release(); 
        }
    }
}

module.exports = {
    liveDetectSubscriptionChange,
}

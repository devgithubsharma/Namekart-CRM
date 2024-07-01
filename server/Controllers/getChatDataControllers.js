const dbConnection = require('../dbConnection'); 

const getChatData = async (req,res) =>{
    const userId=  req.params.userId
    const threadId = req.params.threadId;
    let connection;
    try{
        connection = await dbConnection.getConnection();
        const getChatQuery = 'SELECT  email_id, subject, sender_email, receiver_email, emailBody, campId, messageId, sentTime, receivedTime, emailType, threadId, leads FROM emailsdata WHERE userId = ? AND threadId = ? ORDER BY email_id ASC';
        connection.query(getChatQuery, [userId,threadId], (err, results) => {
            if (err) {
                console.error('Error fetching chat data:', err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.status(200).json(results);
            }
        })

    }catch(err){
        console.log("Internal server error",err)
    }finally{
        if (connection) {
            connection.release(); 
        }
    }
      
}
module.exports = {
    getChatData,
};


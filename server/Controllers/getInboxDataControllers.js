const dbConnection = require('../dbConnection');

const getInboxData = async (req,res) =>{
    const userId = req.params.userId
    let connection;

    try{
        connection = await dbConnection.getConnection();
        const query =`SELECT e.threadId, e.campId, e.subject, e.leads, e.emailBody AS recentReply, e.receivedTime
        FROM emailsdata e
        INNER JOIN (
            SELECT campId, threadId, MAX(receivedTime) AS MaxReplyTime
            FROM emailsdata
            WHERE userId = ? AND emailType = 'received'
            GROUP BY threadId
        ) AS max_replies ON e.campId = max_replies.campId AND e.threadId=max_replies.threadId AND e.receivedTime = max_replies.MaxReplyTime
        ORDER BY e.receivedTime DESC`;

        connection.query(query, [userId],(err, results) => {
            if (err) {
                console.error('Error fetching recent replies:', err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                console.log(results)
                res.status(200).json(results);
            }
        });

    }catch(err){
            console.log("Internal server error",err)
            res.status(500).json({ error: 'Internal Server Error' });
    }finally{
        if (connection) {
            connection.release();
        }
    }
}

module.exports = {
    getInboxData,
}
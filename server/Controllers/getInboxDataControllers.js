const dbConnection = require('../dbConnection');

const getInboxData = async (req,res) =>{
    let connection;
    try{
        connection = await dbConnection.getConnection();
        const query =`SELECT e.threadId, e.campId, e.subject, e.leads, e.emailBody AS recentReply, e.receivedTime
        FROM emailsdata e
        INNER JOIN (
            SELECT campId, MAX(receivedTime) AS MaxReplyTime
            FROM emailsdata
            WHERE emailType = 'received'
            GROUP BY campId
        ) AS max_replies ON e.campId = max_replies.campId AND e.receivedTime = max_replies.MaxReplyTime
        ORDER BY e.receivedTime DESC`;

        // const query = `SELECT campId, MAX(receivedTime) AS MaxReplyTime 
        //     FROM emailsdata
        //     WHERE emailType = 'received'
        //     GROUP BY campId`

        connection.query(query, (err, results) => {
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